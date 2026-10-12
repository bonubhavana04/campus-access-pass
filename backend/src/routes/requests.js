
import { Router } from "express";
import pool from "../db.js";

const router = Router();

// Submit a new access request
router.post("/", async (req, res) => {
  try {
    const { studentId, resourceId, date, startTime, endTime, purpose } = req.body;

    if (
      !studentId ||
      !resourceId ||
      !date ||
      !startTime ||
      !endTime ||
      !purpose
    ) {
      return res.status(400).json({
        message: "Please provide all required fields.",
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({
        message: "End time must be after start time.",
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO ACCESS_REQUESTS
       (student_id, resource_id, request_date, start_time, end_time, purpose)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [studentId, resourceId, date, startTime, endTime, purpose]
    );

    res.status(201).json({
      message: "Access request submitted successfully!",
      requestId: result.insertId,
      status: "PENDING",
    });
  } catch (error) {
    console.error("Submit request error:", error.message);
    res.status(500).json({
      message: "Unable to submit access request.",
    });
  }
});

// View a student's requests
router.get("/student/:studentId", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM ACCESS_REQUESTS
       WHERE student_id = ?
       ORDER BY id DESC`,
      [req.params.studentId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Student requests error:", error.message);
    res.status(500).json({ message: "Unable to retrieve requests." });
  }
});

// View pending requests for approval
router.get("/pending", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM ACCESS_REQUESTS
       WHERE status = 'PENDING'
       ORDER BY id DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error("Pending requests error:", error.message);
    res.status(500).json({ message: "Unable to retrieve pending requests." });
  }
});

// Approve or reject a pending request
router.patch("/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: "Invalid request ID." });
    }

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        message: "Status must be APPROVED or REJECTED.",
      });
    }

    const [result] = await pool.execute(
      `UPDATE ACCESS_REQUESTS
       SET status = ?
       WHERE id = ? AND status = 'PENDING'`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Request not found or no longer pending.",
      });
    }

    res.json({ message: `Request ${status.toLowerCase()} successfully!` });
  } catch (error) {
    console.error("Update request error:", error.message);
    res.status(500).json({ message: "Unable to update request." });
  }
});

// Cancel a pending request
router.patch("/:id/cancel", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: "Invalid request ID." });
    }

    const [result] = await pool.execute(
      `UPDATE ACCESS_REQUESTS
       SET status = 'CANCELLED'
       WHERE id = ? AND status = 'PENDING'`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        message: "Request not found or is no longer pending.",
      });
    }

    res.json({ message: "Access request cancelled successfully!" });
  } catch (error) {
    console.error("Cancel request error:", error.message);
    res.status(500).json({ message: "Unable to cancel request." });
  }
});

export default router;
