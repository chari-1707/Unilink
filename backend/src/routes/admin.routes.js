const express = require("express");
const { body } = require("express-validator");
const { requireAuth, requireRole } = require("../middleware/auth");
const { listUsers, listPendingEvents, setEventStatus, deletePostAsAdmin, makeUserAdmin, removeUser } = require("../controllers/admin.controller");

const router = express.Router();

router.use(requireAuth(), requireRole("admin"));

router.get("/users", (req, res, next) => listUsers(req, res).catch(next));
router.get("/events/pending", (req, res, next) => listPendingEvents(req, res).catch(next));
router.post(
  "/events/:eventId/status",
  [body("status").isString().trim().isIn(["approved", "rejected"])],
  (req, res, next) => setEventStatus(req, res).catch(next)
);
router.delete("/posts/:postId", (req, res, next) => deletePostAsAdmin(req, res).catch(next));
router.post("/users/:userId/make-admin", (req, res, next) => makeUserAdmin(req, res).catch(next));
router.delete("/users/:userId", (req, res, next) => removeUser(req, res).catch(next));

module.exports = router;