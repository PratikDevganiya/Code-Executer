const mongoose = require("mongoose");

const CollaborationSchema = new mongoose.Schema({
  user1: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  user2: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  project: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const CollaborationModel = mongoose.model("Collaboration", CollaborationSchema);
module.exports = CollaborationModel;
