const express = require("express");
const { body } = require("express-validator");
const { register, login, me } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const ALLOWED_DOMAIN = "unilink.com";

function validateUniLinkEmail(value) {
  const email = String(value || "").toLowerCase().trim();
  if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
    throw new Error(`Use your @${ALLOWED_DOMAIN} email`);
  }
  return true;
}

router.post(
  "/register",
  [
    body("name").isString().trim().isLength({ min: 2, max: 80 }),
    body("email").isEmail().normalizeEmail().custom(validateUniLinkEmail),
    body("password").isString().isLength({ min: 8, max: 72 }),
  ],
  (req, res, next) => register(req, res).catch(next)
);

router.post(
  "/login",
  [body("email").isEmail().normalizeEmail().custom(validateUniLinkEmail), body("password").isString().isLength({ min: 1, max: 72 })],
  (req, res, next) => login(req, res).catch(next)
);

router.get("/me", requireAuth(), (req, res, next) => me(req, res).catch(next));

module.exports = router;

