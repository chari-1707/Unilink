const { validationResult } = require("express-validator");
const { Post } = require("../models/Post");
const { Notification } = require("../models/Notification");

async function listFeed(req, res) {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .limit(30)
    .populate("userId", "name")
    .populate("comments.userId", "name")
    .lean();
  const enriched = posts.map((p) => ({
    ...p,
    viewerCanManage: req.user.role === "admin" || p.userId?._id?.toString() === req.user._id.toString(),
  }));
  res.json({ posts: enriched });
}

async function createPost(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: "Invalid input", errors: errors.array() });

  const { content, imageUrl } = req.body;
  const post = await Post.create({ userId: req.user._id, content, imageUrl });
  const populated = await Post.findById(post._id).populate("userId", "name").lean();
  res.status(201).json({ post: populated });
}

async function updatePost(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: "Invalid input", errors: errors.array() });

  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ message: "Post not found" });
  const isOwner = post.userId.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) return res.status(403).json({ message: "Forbidden" });

  const { content, imageUrl } = req.body;
  post.content = content;
  if (Object.prototype.hasOwnProperty.call(req.body, "imageUrl")) {
    post.imageUrl = imageUrl || "";
  }
  await post.save();

  const populated = await Post.findById(post._id)
    .populate("userId", "name")
    .populate("comments.userId", "name")
    .lean();
  res.json({ post: populated });
}

async function deletePost(req, res) {
  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ message: "Post not found" });
  const isOwner = post.userId.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) return res.status(403).json({ message: "Forbidden" });
  await post.deleteOne();
  res.json({ ok: true });
}

async function toggleLike(req, res) {
  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const userIdStr = req.user._id.toString();
  const idx = post.likes.findIndex((id) => id.toString() === userIdStr);
  const liked = idx === -1;
  if (liked) post.likes.push(req.user._id);
  else post.likes.splice(idx, 1);

  await post.save();

  if (liked && post.userId.toString() !== userIdStr) {
    await Notification.create({
      userId: post.userId,
      type: "post_liked",
      message: `${req.user.name} liked your post`,
      link: `/posts/${post._id}`,
    });
  }

  res.json({ likes: post.likes.length, liked });
}

async function addComment(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: "Invalid input", errors: errors.array() });

  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ message: "Post not found" });

  post.comments.push({ userId: req.user._id, text: req.body.text });
  await post.save();

  if (post.userId.toString() !== req.user._id.toString()) {
    await Notification.create({
      userId: post.userId,
      type: "post_commented",
      message: `${req.user.name} commented on your post`,
      link: `/posts/${post._id}`,
    });
  }

  const populated = await Post.findById(post._id)
    .populate("userId", "name")
    .populate("comments.userId", "name")
    .lean();
  res.json({ post: populated });
}

module.exports = { listFeed, createPost, updatePost, deletePost, toggleLike, addComment };

