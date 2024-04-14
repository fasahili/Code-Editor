const express = require("express");
const router = express.Router();
const {isOwner} = require("../middleware/authMiddleware");
const {
  createProject,
  editProject,
  getProject,
  deleteProject,
  UpdateProjectName,
} = require("../controllers/projectsController");

router.get("/updateProjectName", (req, res) => {
  UpdateProjectName(req, res);
});

router.post("/addproject", (req, res) => {
  createProject(req, res);
});

router.post("/deleteproject",isOwner, (req, res) => {
  deleteProject(req, res);
});

router.post("/editproject",isOwner, (req, res) => {
  editProject(req, res);
});

router.get("/project?:id",isOwner, async (req, res) => await getProject(req, res));





module.exports = router;
