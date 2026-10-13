import { Router } from "express";
import {
  listResources,
  getResource,
  createResource,
  updateResource,
} from "../controllers/resourceController.js";
import { authenticate, allowRoles } from "../middleware/authenticate.js";

const router = Router();

router.get("/", listResources);
router.get("/:id", getResource);

router.post(
  "/",
  authenticate,
  allowRoles("ADMIN"),
  createResource
);

router.patch(
  "/:id",
  authenticate,
  allowRoles("ADMIN"),
  updateResource
);

export default router;