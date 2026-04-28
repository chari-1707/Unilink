const express = require("express");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/auth");
const {
  sendRequest,
  respondToRequest,
  listMyConnections,
  listIncomingRequests,
} = require("../controllers/connection.controller");

const router = express.Router();

router.get("/", requireAuth(), (req, res, next) => listMyConnections(req, res).catch(next));
router.get("/requests/incoming", requireAuth(), (req, res, next) => listIncomingRequests(req, res).catch(next));

router.post("/request/:userId", requireAuth(), (req, res, next) => sendRequest(req, res).catch(next));

router.post(
  "/requests/:requestId/respond",
  requireAuth(),
  [body("action").isString().trim().isIn(["accept", "reject"])],
  (req, res, next) => respondToRequest(req, res).catch(next)
);

module.exports = router;

