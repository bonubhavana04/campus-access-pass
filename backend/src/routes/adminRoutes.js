import { Router } from "express";
import {
  listAuditLogs,
  listSecurityAlerts,
  resolveSecurityAlert,
} from "../controllers/adminController.js";
import { authenticate, allowRoles } from "../middleware/authenticate.js";

const router = Router();

router.use(authenticate, allowRoles("ADMIN"));

router.get("/audit-logs", listAuditLogs);
router.get("/security-alerts", listSecurityAlerts);
router.patch("/security-alerts/:id/resolve", resolveSecurityAlert);

export default router;