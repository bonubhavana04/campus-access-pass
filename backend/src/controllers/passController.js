import pool from "../config/db.js";
import { idSchema } from "../validators/resourceSchemas.js";
import { verifyPassSchema, revokePassSchema } from "../validators/passSchemas.js";
import { writeAuditLog, createSecurityAlert } from "../services/auditService.js";

export async function listMyPasses(req, res) {
  try {
    const [passes] = await pool.execute(
      `SELECT ap.id, ap.resource_id, r.name AS resource_name,
              ap.valid_from, ap.valid_until, ap.status, ap.created_at
       FROM access_passes ap
       JOIN resources r ON r.id = ap.resource_id
       WHERE ap.user_id = ?
       ORDER BY ap.created_at DESC`,
      [req.user.id]
    );

    return res.json({ passes });
  } catch (error) {
    console.error("List passes failed:", error.message);
    return res.status(500).json({ error: "Unable to list passes" });
  }
}

export async function verifyPass(req, res) {
  const parsed = verifyPassSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid pass verification data",
      details: parsed.error.issues,
    });
  }

  const { passId, resourceId } = parsed.data;
  let result = "DENIED";
  let pass = null;

  try {
    const [rows] = await pool.execute(
      `SELECT ap.id, ap.user_id, ap.resource_id, ap.valid_from,
              ap.valid_until, ap.status, u.name AS student_name,
              r.name AS resource_name, r.status AS resource_status,
              (ap.valid_from <= UTC_TIMESTAMP()) AS started,
              (ap.valid_until > UTC_TIMESTAMP()) AS not_expired
       FROM access_passes ap
       JOIN users u ON u.id = ap.user_id
       JOIN resources r ON r.id = ap.resource_id
       WHERE ap.id = ?
       LIMIT 1`,
      [passId]
    );

    pass = rows[0] ?? null;

    if (pass?.status === "ACTIVE" &&
        pass.resource_id === resourceId &&
        pass.resource_status === "ACTIVE" &&
        Boolean(pass.started) &&
        Boolean(pass.not_expired)) {
      result = "GRANTED";
    }

    if (pass?.status === "ACTIVE" && !Boolean(pass.not_expired)) {
      await pool.execute(
        `UPDATE access_passes
         SET status = 'EXPIRED'
         WHERE id = ? AND status = 'ACTIVE'`,
        [passId]
      );
    }

    await writeAuditLog(null, {
      userId: req.user.id,
      action: "PASS_VALIDATION",
      passId: pass?.id ?? null,
      resourceId,
      result,
    });

    if (result === "DENIED") {
      const [failures] = await pool.execute(
        `SELECT COUNT(*) AS total
         FROM audit_logs
         WHERE user_id = ?
           AND action = 'PASS_VALIDATION'
           AND result = 'DENIED'
           AND timestamp >= UTC_TIMESTAMP() - INTERVAL 15 MINUTE`,
        [req.user.id]
      );

      if (Number(failures[0].total) >= 5) {
        await createSecurityAlert({
          userId: req.user.id,
          type: "REPEATED_PASS_VALIDATION_FAILURES",
          description: "At least five denied pass validations in 15 minutes.",
          severity: "MEDIUM",
        });
      }
    }

    if (result === "GRANTED") {
      return res.json({
        result,
        message: "ACCESS GRANTED",
        pass: {
          id: pass.id,
          studentName: pass.student_name,
          resource: pass.resource_name,
          validFrom: pass.valid_from,
          validUntil: pass.valid_until,
        },
      });
    }

    return res.status(403).json({
      result,
      message: "ACCESS DENIED",
    });
  } catch (error) {
    console.error("Pass verification failed:", error.message);
    return res.status(500).json({ error: "Unable to verify pass" });
  }
}

export async function revokePass(req, res) {
  const parsedId = idSchema.safeParse(req.params.id);
  const parsedBody = revokePassSchema.safeParse(req.body);

  if (!parsedId.success || !parsedBody.success) {
    return res.status(400).json({ error: "Invalid revocation request" });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `SELECT id, resource_id, status
       FROM access_passes
       WHERE id = ?
       FOR UPDATE`,
      [parsedId.data]
    );

    const pass = rows[0];

    if (!pass) {
      await connection.rollback();
      return res.status(404).json({ error: "Pass not found" });
    }

    if (pass.status !== "ACTIVE") {
      await connection.rollback();
      return res.status(409).json({ error: "Pass is not active" });
    }

    await connection.execute(
      `UPDATE access_passes
       SET status = 'REVOKED', revoked_at = UTC_TIMESTAMP()
       WHERE id = ?`,
      [pass.id]
    );

    await writeAuditLog(connection, {
      userId: req.user.id,
      action: "PASS_REVOKED",
      passId: pass.id,
      resourceId: pass.resource_id,
      result: "SUCCESS",
    });

    await connection.commit();

    return res.json({
      message: "Pass revoked",
      passId: pass.id,
      reason: parsedBody.data.reason,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Revoke pass failed:", error.message);
    return res.status(500).json({ error: "Unable to revoke pass" });
  } finally {
    connection.release();
  }
}