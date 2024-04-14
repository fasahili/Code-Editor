const { isOwner } = require("../middleware/authMiddleware");
const Project = require("../models/projects");
const Task = require("../models/tasks");
const {viewProfile  } = require("../controllers/userProfileController");
const mongoose = require("mongoose");

/**
Creates a new project inside the database. 
@param {Express.Request} req The request object containing the projectName and owner and collaborators for the project. 
@param {Express.Response} res The response object used to send a response back to the client.
@returns {Promise} if the project alredey exist the response have a status code and a message failure,
if not the response have a status code and a message success.
*/
const createProject = async (req, res) => {
  const userID = req.session.user_id;
  const { projectName, description } = req.body;
  try {
    const nameOfProject = await Project.findOne({ projectName, deleted: false ,owner:userID});
    const validRegExp = /^[A-Za-z0-9 _-]+$/;

    if (nameOfProject) {
      return viewProfile(req,res,{},null,"The project is already exist");
    }

    if (!validRegExp.test(projectName)) {
      return res.status(400).send({
        message: "Project name must contain only (A-Z , a-z , - , _ , 0-9)",
      });
    }

    await Project.create({
      projectName,
      owner: userID,
      collaborators: [],
      description,
    });
    return res.status(201).redirect("/profile");
  } catch (error) {
    console.log(error.message);
    res.status(500).render("../views/serverError", { error: error.message });
  }
};

/** 
handles the submitted form for editing a project
@param {Express.Request} req request should hold ID for the target project to be edited and the new data.
@param {Express.Response} res respond that contains status code with  error message if any
@returns {Promise}  return the status code 
*/
const editProject = async (req, res) => {
  const { projectName, description, projectID } = req.body;
  const validRegExp = /^[A-Za-z0-9 _-]+$/;

  try {
    if (!mongoose.Types.ObjectId.isValid(projectID)) {
      return res.status(404).render("/", { message: "Invalid project ID.", title: "Profile" });
    }

    const projectWithSameName = await Project.findOne({owner:req.session.user_id,projectName,deleted:false});
    if(projectWithSameName)
      return viewProfile(req,res,{},null,"Project name already exists!");

    if (!validRegExp.test(projectName)) {
      return res.status(400).send({
        message: "Project name must contain only (A-Z , a-z , - , _ , 0-9)",
      });
    }
  
    const project = await Project.findOneAndUpdate(
      { _id: projectID, deleted: false },
      {
        projectName,
        description,
      }
    );
    if (!project) {
      return res
        .status(404)
        .render("/", { message: "No such project.", title: "Profile" });
    }
    res.status(200).redirect("/profile");
  } catch (error) {
    console.log(error.message);
    res.status(500).render("../views/serverError", { error: error.message });
  }
};

/** 
 *Retrieves information about a project with the given ID from the database, including owner and collaborators . 
@param {Express.Request} req The request object contains the project id in the request parameters.
@param {Express.Response} res The response object contains the project information or error message and status code.
@returns {Promise} return The project information or an error message and status code.
*/
const getProject = async (req, res) => {
  const { id } = req.query;
  try {
    const project = await Project.findOne({ _id: id, deleted: false });
    res.status(200).json(project);
  } catch (error) {
    console.log(error.message);
    res.status(500).render("../views/serverError", { error: error.message });
  }
};

/** 
deletes a project with related tasks (cascade) NOT the users

Delete a project by ID
@param {Express.Request} req Get project ID from dataBase 
@param {Express.Response} res projectId - The ID of the project to be deleted
@returns {Promise} A Promise that resolves with a success message or rejects with an error message
*/
const deleteProject = async (req, res) => {
  const { projectID } = req.body;
  if (!mongoose.Types.ObjectId.isValid(projectID))
    return res.status(404).send("The Project ID is not valid.");
  try {
    const projects = await Project.findOne({ _id: projectID, deleted: false });
    if (!projects) {
      return res.status(400).send("The project doesn't exist.");
    }
    const tasks = await Task.findOne({ projectId: projectID, deleted: false });
    if (tasks) {
      return res.status(400).send("Can't delete a project that contains task(s)");
    }
    await Project.findOneAndUpdate({ _id: projectID }, { deleted: true });
    return res.status(200).redirect("/profile");
  }
  catch (error) {
    console.log(error.message)
    res.status(500).render("../views/serverError", { error: error.message });
  }
};

const UpdateProjectName = async (req, res) => {
  if (isOwner(req)) {
    const projectId = req.session.project_id;
    const project = await Project.findOneAndUpdate(
      { owner: projectId, deleted: false },
      {
        projectName: projectName,
      });
      return res.status(201).send({ message: "successfuly" });
  }
    return res.status(404).send({message:"Just Owner can change project name"});
}

module.exports = {
  createProject,
  editProject,
  getProject,
  deleteProject,
  UpdateProjectName,
};
