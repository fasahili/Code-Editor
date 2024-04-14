const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const projectsSchema = new Schema(
  {
    projectName: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    collaborators: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    description:{
      type:String,
      required:false,
    },
    deleted:{
      type:Boolean,
      default:false,
      required:true,
    },

  },
  { timestamps: true }
);
const Project = mongoose.model("Project", projectsSchema);

module.exports = Project;
