import pool from "../config/db.js";
import {
  resourceSchema,
  resourceUpdateSchema,
  idSchema,
} from "../validators/resourceSchemas.js";

export async function listResources(req, res) {
  try {
    const [resources] = await pool.execute(
      `SELECT id, name, description, location, category, status
       FROM resources
       WHERE status = 'ACTIVE'
       ORDER BY name ASC`
    );

    return res.json({ resources });
  } catch (error) {
    console.error("List resources failed:", error.message);
    return res.status(500).json({ error: "Unable to list resources" });
  }
}

export async function getResource(req, res) {
  const parsedId = idSchema.safeParse(req.params.id);

  if (!parsedId.success) {
    return res.status(400).json({ error: "Invalid resource ID" });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT id, name, description, location, category, status
       FROM resources
       WHERE id = ?
       LIMIT 1`,
      [parsedId.data]
    );

    if (!rows.length || rows[0].status !== "ACTIVE") {
      return res.status(404).json({ error: "Resource not found" });
    }

    return res.json({ resource: rows[0] });
  } catch (error) {
    console.error("Get resource failed:", error.message);
    return res.status(500).json({ error: "Unable to retrieve resource" });
  }
}

export async function createResource(req, res) {
  const parsed = resourceSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid resource data",
      details: parsed.error.issues,
    });
  }

  const data = parsed.data;

  try {
    const [result] = await pool.execute(
      `INSERT INTO resources
        (name, description, location, category, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.name,
        data.description ?? null,
        data.location ?? null,
        data.category ?? null,
        data.status ?? "ACTIVE",
      ]
    );

    return res.status(201).json({
      message: "Resource created",
      resource: { id: result.insertId, ...data, status: data.status ?? "ACTIVE" },
    });
  } catch (error) {
    console.error("Create resource failed:", error.message);
    return res.status(500).json({ error: "Unable to create resource" });
  }
}

export async function updateResource(req, res) {
  const parsedId = idSchema.safeParse(req.params.id);
  const parsedBody = resourceUpdateSchema.safeParse(req.body);

  if (!parsedId.success || !parsedBody.success) {
    return res.status(400).json({ error: "Invalid resource update" });
  }

  const entries = Object.entries(parsedBody.data);

  if (entries.length === 0) {
    return res.status(400).json({ error: "Provide at least one field to update" });
  }

  const allowedColumns = {
    name: "name",
    description: "description",
    location: "location",
    category: "category",
    status: "status",
  };

  const assignments = entries.map(([key]) => `${allowedColumns[key]} = ?`);
  const values = entries.map(([, value]) => value ?? null);

  try {
    const [result] = await pool.execute(
      `UPDATE resources
       SET ${assignments.join(", ")}
       WHERE id = ?`,
      [...values, parsedId.data]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: "Resource not found" });
    }

    return res.json({ message: "Resource updated" });
  } catch (error) {
    console.error("Update resource failed:", error.message);
    return res.status(500).json({ error: "Unable to update resource" });
  }
}