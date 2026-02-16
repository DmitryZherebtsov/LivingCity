const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const organizerController = require("../controllers/organizer.controller");
const controller = require("../controllers/organizerSettings.controller");
const organizationService = require("../services/organization.service");

const { requireAuth } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");
const ROLES = require("../config/roles");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const orgId = req.org?.id;
    if (!orgId) return cb(new Error("Organization not found"));

    const uploadPath = path.join(__dirname, "..", "uploads", "organizations", String(orgId));
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

router.post("/register", organizerController.register);
router.get("/pending", requireAuth, requireRole([ROLES.ADMIN]), organizerController.getPending);
router.patch("/approve/:userId", requireAuth, requireRole([ROLES.ADMIN]), organizerController.approve);
router.patch("/reject/:userId", requireAuth, requireRole([ROLES.ADMIN]), organizerController.reject);


router.get("/organization", requireAuth, controller.getOrganization);
router.patch("/organization", requireAuth, requireRole([ROLES.ORGANIZER]), controller.updateOrganization);


router.post("/logo",
  requireAuth,
  requireRole([ROLES.ORGANIZER]),
  async (req, res, next) => {
    const org = await organizationService.getOrganizationByUserId(req.user.id);
    if (!org) return res.status(404).json({ error: "No org" });
    req.org = org;
    next();
  },
  upload.single("logo"),
  controller.uploadLogo
);

router.delete("/logo", requireAuth, requireRole([ROLES.ORGANIZER]), controller.deleteLogo);

module.exports = router;
