const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const invitationsSchema = new Schema(
  {
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sentTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    accepted: {
      type: Boolean,
      default: false,
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
      required: true,
    },
    project:
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        default: [],
      },
    taskId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        default: [],
      },
    ],
    link: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const Invitation = mongoose.model("Invitation", invitationsSchema);

module.exports = Invitation;
