const User = require("../models/users");
const Project = require("../models/projects");
const Task = require("../models/tasks");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");


/**
 *
 * @param {Express.Request} req the request object contains the id of the user
 * @param {Express.Response} res the response object to send the status of the given code
 * @returns {Promise} return the status of the operation success or if there is an error
 */

const viewProfile = async (req, res,formData={},modalData,message=null,errors=[]) => {
  try {
    const id = req.session.user_id;
    const user = await User.findOne({_id:id});
    const projects = await Project.find({ owner:id, deleted:false});
    let tasks = [];
    let tasksNum = 0;
    let completedTask = 0 ;
    for(let i=0;i<projects.length;i++){
      tasks[i]= await Task.find({ projectId:projects[i]._id,deleted:false});
      tasksNum += tasks[i].length;
      for(let j=0;j<tasks[i].length; j++){
        if(tasks[i][j].completed) completedTask=completedTask+1;}
      }
    const completedTasksPercentage = Math.round((completedTask / tasksNum) * 100);
    const collabTasks = await Task.find({ collaborators: id ,deleted:false});
    res.render("../views/userProfilePage", {title:"Profile",formData,user,projects,tasksNum,tasks,modalData,errors,message,collabTasks,completedTasksPercentage});

  } catch (error) {
    console.log(error.message);
    res.status(500).render("../views/serverError", { error: error.message });
  }
};

/**
 *
 * @param {Express.Request} req req the request object contains the id of the user and the whole body of user data
 * @param {Express.Response} res the response object to send the status of the given code and response the saved data of the new user data
 * @returns {Promise} return the status of the operation success or if there is an error
 */
const saveProfile = async (req, res) => {
  try {
    const id = req.session.user_id;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).render("/auth/login", {
        message: "User not found",
        title: "login",
        errors,
      });
    }
    const emailUser=await User.findOne({email:req.body.email});
    if(emailUser&&emailUser.email!=user.email)
    {
      let message="This email is already exists"
      return viewProfile(req,res,{},{},message)
    }
    if(req.body.password)
    {
      await body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8, max: 24 })
      .withMessage("Password must be between 8 and 24 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
      )
      .withMessage(
        " Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
      )
      .run(req);
      const errors = validationResult(req);
      if(!errors.isEmpty())
      {
        return viewProfile(req,res,{},{},null,errors.array())
      }
      var hashedPassword = await bcrypt.hash(req.body.password, 12);

    }

    const savedUser = await User.findByIdAndUpdate(
      id,
      {
        firstName: req.body.firstName ?? user.firstName,
        lastName: req.body.lastName ?? user.lastName,
        email: req.body.email ?? user.email,
        password:  hashedPassword ?? user.password,

      },
      { new: true }
    ); 
    if (!savedUser) {
      return res.status(500).send("Update failed");
    }
    res.redirect("/profile");
  } catch (error) {
    console.log(error.message);
    res.status(500).render("../views/serverError", { error: error.message });
  }
};

module.exports = {
  viewProfile,
  saveProfile,
};