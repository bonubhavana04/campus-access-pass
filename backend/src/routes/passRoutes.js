import { Router } from "express";
import {
  listMyPasses,
  verifyPass,
  revokePass,
} from "../controllers/passController.js";
import { authenticate, allowRoles } from "../middleware/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/mine", allowRoles("STUDENT"), listMyPasses);

router.post(
  "/verify",
  allowRoles("VERIFIER", "ADMIN"),
  verifyPass
);

router.patch(
  "/:id/revoke",
  allowRoles("ADMIN"),
  revokePass
);

export default router;