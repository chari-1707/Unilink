const express = require("express");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/auth");
const {
  listFeed,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
} = require("../controllers/post.controller");

const router = express.Router();

router.get("/", requireAuth(), (req, res, next) => listFeed(req, res).catch(next));

router.post(
  "/",
  requireAuth(),
  [body("content").isString().trim().isLength({ min: 1, max: 1500 }), body("imageUrl").optional().isString().trim()],
  (req, res, next) => createPost(req, res).catch(next)
);

router.delete("/:postId", requireAuth(), (req, res, next) => deletePost(req, res).catch(next));

router.put(
  "/:postId",
  requireAuth(),
  [body("content").isString().trim().isLength({ min: 1, max: 1500 }), body("imageUrl").optional().isString().trim()],
  (req, res, next) => updatePost(req, res).catch(next)
);

router.post("/:postId/like", requireAuth(), (req, res, next) => toggleLike(req, res).catch(next));

router.post(
  "/:postId/comments",
  requireAuth(),
  [body("text").isString().trim().isLength({ min: 1, max: 600 })],
  (req, res, next) => addComment(req, res).catch(next)
);

module.exports = router;

