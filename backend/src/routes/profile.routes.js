const express = require("express");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/auth");
const {
  getMyProfile,
  upsertMyProfile,
  getProfileByUserId,
  searchStudents,
} = require("../controllers/profile.controller");

const router = express.Router();

router.get("/search", requireAuth(), (req, res, next) => searchStudents(req, res).catch(next));
router.get("/me", requireAuth(), (req, res, next) => getMyProfile(req, res).catch(next));

router.put(
  "/me",
  requireAuth(),
  [
    body("department").optional().isString().trim().isLength({ max: 120 }),
    body("year").optional().isString().trim().isLength({ max: 40 }),
    body("bio").optional().isString().trim().isLength({ max: 500 }),
    body("skills").optional().isArray({ max: 40 }),
    body("skills.*").optional().isString().trim().isLength({ max: 60 }),
    body("interests").optional().isArray({ max: 40 }),
    body("interests.*").optional().isString().trim().isLength({ max: 60 }),
    body("achievements").optional().isArray({ max: 40 }),
    body("achievements.*").optional().isString().trim().isLength({ max: 140 }),
    body("certifications").optional().isArray({ max: 40 }),
    body("certifications.*").optional().isString().trim().isLength({ max: 140 }),
    body("contact").optional().isObject(),
    body("contact.phone").optional({ checkFalsy: true }).isString().trim().isLength({ max: 30 }),
    body("contact.linkedin").optional({ checkFalsy: true }).isURL().isLength({ max: 200 }),
    body("contact.x").optional({ checkFalsy: true }).isURL().isLength({ max: 200 }),
    body("avatarUrl").optional().isString().trim().isLength({ max: 500 }),
  ],
  (req, res, next) => upsertMyProfile(req, res).catch(next)
);

router.get("/:userId", requireAuth(), (req, res, next) => getProfileByUserId(req, res).catch(next));

module.exports = router;

