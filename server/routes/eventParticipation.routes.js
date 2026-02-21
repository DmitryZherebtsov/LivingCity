const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth.middleware");

const { joinEvent, leaveEvent, getMyEvents, checkParticipation } = require("../controllers/eventParticipation.controller");

router.post("/:eventId", requireAuth, joinEvent);
router.delete("/:eventId", requireAuth, leaveEvent);
router.get("/me", requireAuth, getMyEvents);
router.get("/:eventId/check", requireAuth, checkParticipation);

module.exports = router;
