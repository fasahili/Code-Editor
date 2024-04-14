const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const tasksSchema = new Schema(
  {
    taskTitle: {
      type: String,
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    collaborators: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    deleted:{
      type:Boolean,
      default:false,
      required:true,
    },
    completed:{
      type:Boolean,
      default:false,
      required:true,
    },
    description:{
      type:String,
      required:true,
    },
    pseudoCode: {
      type: String,
      required: true,
    },
    evaluation:{
      type:Number,
      required:true,
      default:0
    },
    notes:{
      type:String,
      required:false,
      default:""
    }
  },
  { timestamps: true }
);
const Task = mongoose.model("Task", tasksSchema);

module.exports = Task;
