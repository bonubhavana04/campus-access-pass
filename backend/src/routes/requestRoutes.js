import { Router } from "express";
import {
  createAccessRequest,
  listMyRequests,
  listPendingRequests,
  decideRequest,
} from "../controllers/requestController.js";
import { authenticate, allowRoles } from "../middleware/authenticate.js";

const router = Router();

router.use(authenticate);

router.post("/", allowRoles("STUDENT"), createAccessRequest);
router.get("/mine", allowRoles("STUDENT"), listMyRequests);

router.get(
  "/pending",
  allowRoles("APPROVER", "ADMIN"),
  listPendingRequests
);

router.patch(
  "/:id/decision",
  allowRoles("APPROVER", "ADMIN"),
  decideRequest
);

export default router;