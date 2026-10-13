import pool from "../config/db.js";

export async function writeAuditLog(
  connection,
  {
    userId = null,
    action,
    passId = null,
    resourceId = null,
    result,
  }
) {
  const db = connection || pool;

  await db.execute(
    `INSERT INTO audit_logs
      (user_id, action, pass_id, resource_id, result)
      VALUES (?, ?, ?, ?, ?)`,
    [userId, action, passId, resourceId, result]
  );
}

export async function createSecurityAlert({
  userId = null,
  type,
  description,
  severity = "LOW",
}) {
  await pool.execute(
    `INSERT INTO security_alerts
      (user_id, type, description, severity)
      VALUES (?, ?, ?, ?)`,
    [userId, type, description, severity]
  );
}