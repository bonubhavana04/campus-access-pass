import pool from "../config/db.js";
import { createRequestSchema, decisionSchema } from "../validators/requestSchemas.js";
import { idSchema } from "../validators/resourceSchemas.js";
import { writeAuditLog } from "../services/auditService.js";

function toMysqlUtc(dateString) {
  return new Date(dateString)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
}

export async function createAccessRequest(req, res) {
  const parsed = createRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid access request",
      details: parsed.error.issues,
    });
  }

  const { resourceId, purpose, startTime, endTime } = parsed.data;
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start <= new Date()) {
    return res.status(400).json({ error: "Start time must be in the future" });
  }

  try {
    const [resources] = await pool.execute(
      "SELECT id FROM resources WHERE id = ? AND status = 'ACTIVE' LIMIT 1",
      [resourceId]
    );

    if (!resources.length) {
      return res.status(404).json({ error: "Active resource not found" });
    }

    const [result] = await pool.execute(
      `INSERT INTO access_requests
        (user_id, resource_id, purpose, start_time, end_time)
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.user.id,
        resourceId,
        purpose,
        toMysqlUtc(startTime),
        toMysqlUtc(endTime),
      ]
    );

    await writeAuditLog(null, {
      userId: req.user.id,
      action: "ACCESS_REQUEST_CREATED",
      resourceId,
      result: "SUCCESS",
    });

    return res.status(201).json({
      message: "Access request submitted",
      requestId: result.insertId,
      status: "PENDING",
    });
  } catch (error) {
    console.error("Create access request failed:", error.message);
    return res.status(500).json({ error: "Unable to create access request" });
  }
}

export async function listMyRequests(req, res) {
  try {
    const [requests] = await pool.execute(
      `SELECT ar.id, ar.resource_id, r.name AS resource_name,
              ar.purpose, ar.start_time, ar.end_time,
              ar.status, ar.approved_by, ar.created_at
       FROM access_requests ar
       JOIN resources r ON r.id = ar.resource_id
       WHERE ar.user_id = ?
       ORDER BY ar.created_at DESC`,
      [req.user.id]
    );

    return res.json({ requests });
  } catch (error) {
    console.error("List my requests failed:", error.message);
    return res.status(500).json({ error: "Unable to list requests" });
  }
}

export async function listPendingRequests(req, res) {
  try {
    const [requests] = await pool.execute(
      `SELECT ar.id, ar.user_id, u.name AS student_name,
              ar.resource_id, r.name AS resource_name,
              ar.purpose, ar.start_time, ar.end_time, ar.created_at
       FROM access_requests ar
       JOIN users u ON u.id = ar.user_id
       JOIN resources r ON r.id = ar.resource_id
       WHERE ar.status = 'PENDING'
       ORDER BY ar.created_at ASC`
    );

    return res.json({ requests });
  } catch (error) {
    console.error("List pending requests failed:", error.message);
    return res.status(500).json({ error: "Unable to list pending requests" });
  }
}

export async function decideRequest(req, res) {
  const parsedId = idSchema.safeParse(req.params.id);
  const parsedBody = decisionSchema.safeParse(req.body);

  if (!parsedId.success || !parsedBody.success) {
    return res.status(400).json({
      error: "Invalid request ID or decision",
    });
  }

  const requestId = parsedId.data;
  const { decision } = parsedBody.data;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [requests] = await connection.execute(
      `SELECT id, user_id, resource_id, start_time, end_time, status
       FROM access_requests
       WHERE id = ?
       FOR UPDATE`,
      [requestId]
    );

    const request = requests[0];

    if (!request) {
      await connection.rollback();
      return res.status(404).json({ error: "Access request not found" });
    }

    if (request.status !== "PENDING") {
      await connection.rollback();
      return res.status(409).json({ error: "Request has already been decided" });
    }

    if (decision === "APPROVED") {
      const [resources] = await connection.execute(
        "SELECT status FROM resources WHERE id = ? LIMIT 1",
        [request.resource_id]
      );

      if (!resources.length || resources[0].status !== "ACTIVE") {
        await connection.rollback();
        return res.status(409).json({ error: "Resource is no longer active" });
      }

      const [timeCheck] = await connection.execute(
  `SELECT end_time > UTC_TIMESTAMP() AS window_valid
   FROM access_requests
   WHERE id = ?`,
  [requestId]
);

if (
  !timeCheck.length ||
  Number(timeCheck[0].window_valid) !== 1
) {
  await connection.rollback();
  return res.status(409).json({
    error: "Requested time window has expired",
  });
}

      await connection.execute(
        `UPDATE access_requests
         SET status = 'APPROVED', approved_by = ?
         WHERE id = ?`,
        [req.user.id, requestId]
      );

      await connection.execute(
        `INSERT INTO access_passes
          (request_id, user_id, resource_id, valid_from, valid_until, status)
         VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
        [
          requestId,
          request.user_id,
          request.resource_id,
          request.start_time,
          request.end_time,
        ]
      );
    } else {
      await connection.execute(
        `UPDATE access_requests
         SET status = 'REJECTED', approved_by = ?
         WHERE id = ?`,
        [req.user.id, requestId]
      );
    }

    await writeAuditLog(connection, {
      userId: req.user.id,
      action: `ACCESS_REQUEST_${decision}`,
      resourceId: request.resource_id,
      result: "SUCCESS",
    });

    await connection.commit();

    return res.json({
      message: `Access request ${decision.toLowerCase()}`,
      requestId,
      status: decision,
    });
  } catch (error) {
    await connection.rollback();

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "A pass already exists for this request" });
    }

    console.error("Decide request failed:", error.message);
    return res.status(500).json({ error: "Unable to decide request" });
  } finally {
    connection.release();
  }
}