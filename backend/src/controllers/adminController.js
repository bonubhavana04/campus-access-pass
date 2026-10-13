import pool from "../config/db.js";

export async function listAuditLogs(req, res) {
  const limit = Math.min(
    Math.max(Number.parseInt(req.query.limit, 10) || 50, 1),
    100
  );

  try {
    const [logs] = await pool.execute(
      `SELECT id, user_id, action, pass_id, resource_id, result, timestamp
       FROM audit_logs
       ORDER BY timestamp DESC
       LIMIT ?`,
      [limit]
    );

    return res.json({ logs });
  } catch (error) {
    console.error("List audit logs failed:", error.message);
    return res.status(500).json({ error: "Unable to retrieve audit logs" });
  }
}

export async function listSecurityAlerts(req, res) {
  try {
    const [alerts] = await pool.execute(
      `SELECT id, user_id, type, description, severity, status, created_at
       FROM security_alerts
       ORDER BY created_at DESC
       LIMIT 100`
    );

    return res.json({ alerts });
  } catch (error) {
    console.error("List security alerts failed:", error.message);
    return res.status(500).json({ error: "Unable to retrieve security alerts" });
  }
}

export async function resolveSecurityAlert(req, res) {
  const alertId = Number(req.params.id);

  if (!Number.isInteger(alertId) || alertId <= 0) {
    return res.status(400).json({ error: "Invalid alert ID" });
  }

  try {
    const [result] = await pool.execute(
      `UPDATE security_alerts
       SET status = 'RESOLVED'
       WHERE id = ? AND status = 'OPEN'`,
      [alertId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        error: "Open alert not found",
      });
    }

    return res.json({ message: "Security alert resolved" });
  } catch (error) {
    console.error("Resolve alert failed:", error.message);
    return res.status(500).json({ error: "Unable to resolve alert" });
  }
}