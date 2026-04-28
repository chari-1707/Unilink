const express = require("express");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/auth");
const { listGroups, createGroup, joinLeaveGroup } = require("../controllers/group.controller");

const router = express.Router();

router.get("/", requireAuth(), (req, res, next) => listGroups(req, res).catch(next));

router.post(
  "/",
  requireAuth(),
  [body("groupName").isString().trim().isLength({ min: 2, max: 120 }), body("description").optional().isString().trim().isLength({ max: 800 })],
  (req, res, next) => createGroup(req, res).catch(next)
);

router.post("/:groupId/join", requireAuth(), (req, res, next) => joinLeaveGroup(req, res).catch(next));

module.exports = router;

