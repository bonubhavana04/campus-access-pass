
import { Router } from "express";
import pool from "../db.js";

const router = Router();

// Validate date format and ensure the date exists
function isValidDate(date) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsed = new Date(`${date}T00:00:00Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  );
}

// Validate time format: HH:MM or HH:MM:SS
function isValidTime(time) {
  return (
    typeof time === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(time)
  );
}

// Convert time to seconds for comparison
function timeToSeconds(time) {
  const [hours, minutes, seconds = 0] = time.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

// Submit a new access request
router.post("/", async (req, res) => {
  try {
    const { studentId, resourceId, date, startTime, endTime, purpose } =
      req.body;

    if (
      studentId == null ||
      resourceId == null ||
      !String(studentId).trim() ||
      !String(resourceId).trim() ||
      !date ||
      !startTime ||
      !endTime ||
      typeof purpose !== "string" ||
      !purpose.trim()
    ) {
      return res.status(400).json({
        message: "Please provide all required fields.",
      });
    }

    if (String(purpose).trim().length > 500) {
      return res.status(400).json({
        message: "Purpose must not exceed 500 characters.",
      });
    }

    if (!isValidDate(date)) {
      return res.status(400).json({
        message: "Date must be a valid date in YYYY-MM-DD format.",
      });
    }

    if (!isValidTime(startTime) || !isValidTime(endTime)) {
      return res.status(400).json({
        message: "Times must use HH:MM or HH:MM:SS format.",
      });
    }

    if (timeToSeconds(startTime) >= timeToSeconds(endTime)) {
      return res.status(400).json({
        message: "End time must be after start time.",
      });
    }

    const requestedStart = new Date(`${date}T${startTime}`);

    if (
      Number.isNaN(requestedStart.getTime()) ||
      requestedStart <= new Date()
    ) {
      return res.status(400).json({
        message: "The requested date and start time must be in the future.",
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO ACCESS_REQUESTS
       (student_id, resource_id, request_date, start_time, end_time, purpose)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        String(studentId).trim(),
        String(resourceId).trim(),
        date,
        startTime,
        endTime,
        purpose.trim(),
      ]
    );

    return res.status(201).json({
      message: "Access request submitted successfully!",
      requestId: result.insertId,
      status: "PENDING",
    });
  } catch (error) {
    console.error("Submit request error:", error.message);
    return res.status(500).json({
      message: "Unable to submit access request.",
    });
  }
});

// View a student's requests
router.get("/student/:studentId", async (req, res) => {
  try {
    const studentId = req.params.studentId.trim();

    if (!studentId) {
      return res.status(400).json({
        message: "Student ID is required.",
      });
    }

    const [rows] = await pool.execute(
      `SELECT * FROM ACCESS_REQUESTS
       WHERE student_id = ?
       ORDER BY id DESC`,
      [studentId]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Student requests error:", error.message);
    return res.status(500).json({
      message: "Unable to retrieve requests.",
    });
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

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Pending requests error:", error.message);
    return res.status(500).json({
      message: "Unable to retrieve pending requests.",
    });
  }
});

// Approve or reject a pending request
router.patch("/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        message: "Invalid request ID.",
      });
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
        message: "Request not found or is no longer pending.",
      });
    }

    return res.status(200).json({
      message: `Request ${status.toLowerCase()} successfully!`,
      requestId: id,
      status,
    });
  } catch (error) {
    console.error("Update request error:", error.message);
    return res.status(500).json({
      message: "Unable to update request.",
    });
  }
});

// Cancel a pending request
router.patch("/:id/cancel", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        message: "Invalid request ID.",
      });
    }

    const [result] = await pool.execute(
      `UPDATE ACCESS_REQUESTS
       SET status = 'CANCELLED'
       WHERE id = ? AND status = 'PENDING'`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Request not found or is no longer pending.",
      });
    }

    return res.status(200).json({
      message: "Access request cancelled successfully!",
      requestId: id,
      status: "CANCELLED",
    });
  } catch (error) {
    console.error("Cancel request error:", error.message);
    return res.status(500).json({
      message: "Unable to cancel request.",
    });
  }
});

export default router;
