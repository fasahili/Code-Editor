const Task = require("../models/tasks");
const Project = require("../models/projects");
const { viewProfile } = require("../controllers/userProfileController");

const sessions = require("express-session");
const express = require("express");
const router = express.Router();

const cookieParser = require("cookie-parser");
const sessionCookieLifeTime = 1000 * 60 * 60; // One hour

router.use(express.urlencoded({ extended: false }));
router.use(cookieParser());

var session;

router.use(
  sessions({
    secret: "7Eo9yVFTl3GduuVnNjQuy0U9dLWjlA3x",
    saveUninitialized: true,
    cookie: { maxAge: sessionCookieLifeTime },
    resave: false,
  })
);

/** 
Middleware function that creates a new session for the user, should be called after validating that the specified user has inputted correct credentials for his account on login page
@param {Express.Request} req  The request object containing user input data from login page.
@param  userID  The response object used to send a response back to the client.
*/

const createSession = (req, userID) => {
  session = req.session;
  session.user_id = userID;
};

/** 
Middleware function that checks if the user is logged in, if true then the function passes to the next() function in the routes
@param {Express.Request} req  The request object contains session and session ID.
@param {Express.Response} res  The response object used to send a response back to the client.
*/
const isLoggedIn = (req, res, next) => {
  if (req.session && req.session.user_id)
    if (req.path === "/profile")
      next();
    else
      res.redirect("/profile")
  else
    if (req.path === "/profile")
      res.redirect("/login");
    else
      next();
}
const logOut =(req,res) =>{
  req.session.destroy((err) => {
    if(err){
      console.log(err);
    }
    else {
      res.redirect("/")
    }
  });
}

/** 
Middleware function that checks if the current user is an owner of the project or task he is trying to modify
,if true then the function passes to the next() function in the routes.
The function queries the DB for the target project and compares the userID from session with the target project's ownerID
if projectID isn't avaliable in the body, the function fetches the taskID from the request and queries the task,
then gets the projectID from it, THEN it queries the DB for target project and does the former mentioned comparison
@param {Express.Request} req  The request object contains session and session ID, and the projectID/taskID.
@param {Express.Response} res  The response object used to send a response back to the client.
*/
const isOwner = async (req, res, next) => {
  if (req.session && req.session.user_id) {
    const userID = req.session.user_id;
    let {projectID} = req.body;
    if(!projectID && req.path === "/project")
      projectID = req.query.id;
    if(!projectID){
      let taskID= req.body.taskID ?? req.query.id;
      const task = await Task.findOne({_id:taskID,deleted:false});
      if(!task)
        res.status(400).send("Bad Request");
      projectID=task.projectId;
    }
    const targetProject = await Project.findOne({_id:projectID, deleted:false});
    if (userID === targetProject.owner.toString()) {
      next();
    } else viewProfile(req, res, ["You're not an owner"]);
  } else res.redirect("/login");
};

/** 
Middleware function that checks if the current user is a collaborator of the task he is trying to submit
,if true then the function passes to the next() function in the routes.
The function queries the DB for the target task and checks if the collaborator's array contains the current collaborator
using .include function
@param {Express.Request} req  The request object contains session and session ID, and the projectID/taskID.
@param {Express.Response} res  The response object used to send a response back to the client.
*/
const isCollaborator = async (req, res, next) => {
  if (req.session && req.session.user_id) {
    const userID = req.session.user_id;
    let taskID= req.body.taskID;
    const task = await Task.findOne({_id:taskID,deleted:false});
    if (task.collaborators.includes(userID)) {
      next();
    } else viewProfile(req, res, ["You're not a collaborator"]);
  } else res.redirect("/login");
};

const getLoggedInUserId = (req, res) => {
  return session.user_id;
};
module.exports = {
  getLoggedInUserId,
  router,
  createSession,
  isLoggedIn,
  isOwner,
  isCollaborator,
  logOut
};
