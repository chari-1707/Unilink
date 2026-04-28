const { validationResult } = require("express-validator");
const { Group } = require("../models/Group");

async function listGroups(_req, res) {
  const groups = await Group.find().sort({ createdAt: -1 }).limit(50).populate("createdBy", "name").lean();
  res.json({ groups });
}

async function createGroup(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: "Invalid input", errors: errors.array() });

  const { groupName, description } = req.body;
  const group = await Group.create({
    groupName,
    description,
    createdBy: req.user._id,
    members: [req.user._id],
  });
  const populated = await Group.findById(group._id).populate("createdBy", "name").lean();
  res.status(201).json({ group: populated });
}

async function joinLeaveGroup(req, res) {
  const group = await Group.findById(req.params.groupId);
  if (!group) return res.status(404).json({ message: "Group not found" });

  const userIdStr = req.user._id.toString();
  const idx = group.members.findIndex((id) => id.toString() === userIdStr);
  const joined = idx === -1;
  if (joined) group.members.push(req.user._id);
  else group.members.splice(idx, 1);

  await group.save();
  res.json({ joined, members: group.members.length });
}

module.exports = { listGroups, createGroup, joinLeaveGroup };

