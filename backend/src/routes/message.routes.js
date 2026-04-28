const express = require("express");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/auth");
const { listMessages, sendMessage } = require("../controllers/message.controller");

const router = express.Router();

router.get("/:userId", requireAuth(), (req, res, next) => listMessages(req, res).catch(next));
router.post(
  "/:userId",
  requireAuth(),
  [body("text").isString().trim().isLength({ min: 1, max: 2000 })],
  (req, res, next) => sendMessage(req, res).catch(next)
);

module.exports = router;
