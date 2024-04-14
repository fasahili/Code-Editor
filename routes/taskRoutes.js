const express = require("express");
const router = express.Router();
const {isOwner,isCollaborator} = require("../middleware/authMiddleware");
const {
  createTask,
  editTask,
  getTask,
  deleteTask,
  submitTask,
  evaluateTask
} = require("../controllers/tasksController");

router.get("/task?:id",isOwner, async (req, res) => {
  return await getTask(req, res);
});

router.post("/addtask", isOwner, (req, res) => {
  createTask(req, res);
});

router.post("/deletetask",isOwner,(req, res) => {
  deleteTask(req, res);
});

router.post("/edittask",isOwner , (req, res) => {
  editTask(req, res);
});

router.post("/submittask",isCollaborator,(req, res) => {
  submitTask(req, res);
});

router.post("/evaluatetask",isOwner,  (req, res) => {
  evaluateTask(req, res);
});




module.exports = router;
