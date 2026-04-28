const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { listMyNotifications, markRead, markAllRead } = require("../controllers/notification.controller");

const router = express.Router();

router.get("/", requireAuth(), (req, res, next) => listMyNotifications(req, res).catch(next));
router.post("/read-all", requireAuth(), (req, res, next) => markAllRead(req, res).catch(next));
router.post("/:notificationId/read", requireAuth(), (req, res, next) => markRead(req, res).catch(next));

module.exports = router;

