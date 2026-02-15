const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth.middleware");
const requireAdmin = require("../middleware/requireAdmin");

const {
  getPendingOrganizations,
  updateOrganizationStatus,
} = require("../controllers/adminOrganization.controller");

router.get(
  "/organizations/pending",
  requireAuth,
  requireAdmin,
  getPendingOrganizations
);

router.patch(
  "/organizations/:id/status",
  requireAuth,
  requireAdmin,
  updateOrganizationStatus
);

module.exports = router;
