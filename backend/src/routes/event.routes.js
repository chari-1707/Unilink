const express = require("express");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/auth");
const { listEvents, createEvent, registerForEvent } = require("../controllers/event.controller");

const router = express.Router();

router.get("/", requireAuth(), (req, res, next) => listEvents(req, res).catch(next));

router.post(
  "/",
  requireAuth(),
  [
    body("eventName").isString().trim().isLength({ min: 2, max: 140 }),
    body("date").isISO8601(),
    body("location").optional().isString().trim().isLength({ max: 200 }),
    body("description").optional().isString().trim().isLength({ max: 2000 }),
  ],
  (req, res, next) => createEvent(req, res).catch(next)
);

router.post("/:eventId/register", requireAuth(), (req, res, next) => registerForEvent(req, res).catch(next));

module.exports = router;

