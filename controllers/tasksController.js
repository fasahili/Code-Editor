const mongoose = require("mongoose");
const Task = require("../models/tasks");
const User = require("../models/users");
const { viewProfile } = require("./userProfileController");
const path = require("path");
const fsp = require("fs").promises;
const fs = require("fs");

/**
Creates a new task with the given task title, project ID, and collaborators.
@param {Express.Request} req The request object containing the taskTitle, projectID, and collaborators.
@param {Express.Response} res The response object to send back a status code and message.
@returns {Promise}  Message indicating success or an error message if one occurs.
*/
const createTask = async (req, res) => {
  const { taskTitle , projectID , collaborators ,description,pseudoCode,answer} = req.body;
  const collaboratorsEmails=collaborators.split(",");
  let tempUser,collaboratorsIDs=[];
  try {
    for(let i=0;i<collaboratorsEmails.length;i++){
      tempUser=await User.findOne({email:collaboratorsEmails[i]});
      if(tempUser)
        collaboratorsIDs[i]=tempUser;
      // if(!collaboratorsIDs[i])
      // return viewProfile()
    }
    const getTask = await Task.findOne({ taskTitle, projectId:projectID , deleted:false });
    if (getTask) {
      const data = `{"collaborators":"${collaborators}", "description":"${description}", "pseudoCode":"${pseudoCode}", "answer":"${answer}", "projectID":"${projectID}"}`;
      const formData=JSON.parse(data)
      return viewProfile(req,res,formData,null,"Task already exists")
    }
    await Task.create({
      taskTitle,
      projectId: projectID,
      collaborators: collaboratorsIDs,
      description,
      pseudoCode,
    });
    const task = await Task.findOne({ taskTitle, projectId: projectID, deleted: false });
    const taskId = task._id.toString();
    const userId = req.session.user_id;
    const projectId = task.projectId.toString();
    const pathOfSolution = path.join(
      __dirname,
      "..",
      "pythonFiles",
    );
    await saveTaskAnswer(pathOfSolution, projectId, userId, taskId, answer);
    return res.status(200).redirect("/profile");
  } catch (error) {
    console.log(error.message);
    res.status(500).render("../views/serverError", { error: error.message });
  }
};



/**
 * This function will take the solution of the task that was submitted in `createTask` and save it in the file system.
 * @param {string} pathOfSolution
 * @param {string} userId
 * @param {string} taskId
 * @param {string} solution
 */
const saveTaskAnswer = async (pathOfSolution, projectId, userId, taskId, solution) => {
  await createFileIfDoesNotExist(path.join(pathOfSolution, userId));
  await createFileIfDoesNotExist(path.join(pathOfSolution, userId, "code"));
  await createFileIfDoesNotExist(path.join(pathOfSolution, userId, "code", projectId));
  await createFileIfDoesNotExist(path.join(pathOfSolution, userId, "code", projectId, taskId));
  await createFileIfDoesNotExist(path.join(pathOfSolution, userId, "code", projectId, taskId, "solutions"));

  await fsp.writeFile(
    path.join(pathOfSolution, userId, "code", projectId, taskId, "solutions", `${taskId}.solution.txt`),
    solution
  );
}

/**
 * A method that checks if a file exists in a given path, if not, it creates it.
 * @param {string} pathHolder 
 */
const createFileIfDoesNotExist = async pathHolder => {
  if (!fs.existsSync(pathHolder)) {
    await fsp.mkdir(pathHolder);
  }
}

/** 
handle submitted form for editing a task
@param {Express.Request} req request object include the ID of the task to be updated.
@param {Express.Response} res response with status code or error message.
@returns {Promise} return the HTTP response data.
*/
const editTask = async (req, res) => {
  const {taskID} = req.body
  const userID = req.session.user_id;
  if (!mongoose.Types.ObjectId.isValid(taskID)) {
    return res.status(404).render("/", { message: "Invalid task ID.", title: "Profile" });
  }
  try {
    const { taskTitle,collaborators,description,pseudoCode,answer } = req.body;
    const currentTask = await Task.findOne({_id:taskID,deleted:false});
    const taskWithSameName = await Task.findOne({taskTitle,projectId:currentTask.projectId,deleted:false});
    if(!taskWithSameName || taskWithSameName._id.toString()===taskID){
      let tempUser,collaboratorsObjects=[] ,collaboratorsEmails=collaborators.split(",");
      for(let i=0;i<collaboratorsEmails.length;i++){
        tempUser=await User.findOne({email:collaboratorsEmails[i]});
        if(tempUser)
          collaboratorsObjects[i]= tempUser;
        // if(!collaboratorsIDs[i])
        // return viewProfile()
      }
      const editedTask = await Task.findOneAndUpdate({ _id: taskID, deleted: false },
        {taskTitle,collaborators:collaboratorsObjects,pseudoCode,description});
      if (!editedTask) 
        return res.status(404).render("/", { message: "Task not found.", title: "Profile" });
      const pathOfSolution = path.join(__dirname,"..","pythonFiles");
      const answerPath = path.join(pathOfSolution,userID,"code",currentTask.projectId.toString(),taskID,"solutions",taskID+".solution.txt");
      await fsp.writeFile(answerPath,answer);
      return res.status(200).redirect("/profile");
    }
    return viewProfile(req,res,{},{}, "Task title already exists in the same project.",)
  } catch (error) {
    console.log(error.message);
    res.status(500).render("../views/serverError", { error: error.message });
  }
};

/** 
return task information with tasks and collaborators (users)
@param {Express.Request} req The request object containing taskId 
@param {Express.Response} res The response object will send a status code and message
@returns {Promise} return schema
*/
const getTask = async (req, res) => {
  const {id} = req.query;
  const userID = req.session.user_id;
  let sentTask={};
  try {
    const task = await Task.findOne({ _id: id, deleted: false });
    if(task){
      const pathOfSolution = path.join(__dirname,"..","pythonFiles");
      const answerPath = path.join(pathOfSolution,userID,"code",task.projectId.toString(),id,"solutions",id+".solution.txt");
      const answer = await fsp.readFile(answerPath);
      sentTask ={
        taskTitle:task.taskTitle,
        description:task.description,
        collaborators:[],
        answer:answer.toString(),
        pseudoCode:task.pseudoCode,
        evaluation:task.evaluation,
        notes:task.notes
      };
      let tempUser;
      for(let i=0;i<task.collaborators.length;i++){
        tempUser= await User.findOne({_id:task.collaborators[i]});
        if(tempUser)
          sentTask.collaborators[i] = tempUser.email;
      }
    }
    res.status(200).json(sentTask);
  } catch (error) {
    console.log(error.massage);
    res.status(500).render("../views/serverError", { error: error.message });
  }
};

/** 
Function that deletes a task  from the DB
@param {Express.Request} req  request object, should hold taskID
@param {Express.Response} res response object (returns status code)
@returns {Promise<boolean>} A promise that resolves boolean if the deletion was successful
*/
const deleteTask = async (req, res) => {
  const { taskID } = req.body;
  if (!mongoose.Types.ObjectId.isValid(taskID)) {
    return res.status(404).render("/", { message: "Task ID is not valid!" });
  }
  try {
    const task = await Task.findOne({ _id: taskID, deleted: false });
    if (!task) {
      return res.status(404).render("/", { message: "Task not found!" });
    }
    if (task.completed) {
      return res.status(400).render("/", { message: "Can't delete a completed task.!" });
    }
    await Task.findOneAndUpdate({ _id: taskID }, { deleted: true });
    res.status(200).redirect("/profile");
  } catch (error) {
    console.log(error.message);
    res.status(500).render("/../views/serverError", { error: error.message });
  }
};

/** 
Function that sets the completed value to true in the target task
@param {Express.Request} req request object includes the taskID in the session property.
@param {Express.Response} res response with status code or error message.
@returns {Promise} return the HTTP response data.
*/
const submitTask = async (req, res) => {
  const id  = req.body.taskID;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).render("/", { message: "Invalid task ID.", title: "Profile" });
  }
  try {
    const editedTask = await Task.findOneAndUpdate(
      { _id: id, deleted: false },
      {
        completed:true
      }
    );
    if (!editedTask) {
      return res.status(404).render("/", { message: "Task not found.", title: "Profile" });
    }
    return res.status(200).redirect("/profile");

  } catch (error) {
    console.log(error.message)
    return res.status(500).render("/", { message: "Server-side error!" });
  }
};

/** 
Function that updates the evaluation property for the specified task

Now to add the points for the collaborators, we need to get the delta of the points of the task we want to evaluate
e.g , We evaluate a task for the first time and set it as 4/5 , we add 4 (4-0) points to the user(collaborator) points property
When we decide that we want to re-evaluate the mark, and lets say we will put it a 5/5 mark, we add 1 (5-4) points to the user,
, because he has already recieved 4 points earlier.
and if we change it again to 0, the user should lose 5 points (0-5 = -5)
Math checks out?
@param {Express.Request} req request object should hold the taskID and evaluation mark in the body property.
@param {Express.Response} res response with status code or error message.
@returns {Promise} return the response data.
*/
const evaluateTask = async (req, res) => {
  const id  = req.body.taskID;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).render("/", { message: "Invalid task ID.", title: "Profile" });
  }
  try {
    const {evaluation,notes} = req.body;
    if(evaluation<0 || evaluation >5)
      return res.status(400).render("/",{ message:"Task can only have evaluation should be not lesser than 0 and not greater than 5"});
    const currentTask = await Task.findOne({_id:id,deleted:false});
    let deltaPoints = evaluation-currentTask.evaluation;
    const evaluatedTask = await Task.findOneAndUpdate({ _id: id, deleted: false },{notes,evaluation});
    var rewardedUser;
    if (!evaluatedTask) {
      return res.status(404).render("/", { message: "Task not found.", title: "Profile" });
    }
    for(let i=0;i<evaluatedTask.collaborators.length;i++)
     rewardedUser=await User.findOneAndUpdate({_id:evaluatedTask.collaborators[i]},{$inc : {points:deltaPoints}});
    return res.status(200).redirect("/profile");

  } catch (error) {
    console.log(error.message)
    return res.status(500).render("/", { message: "Server-side error!" });
  }
};

module.exports = {
  createTask,
  editTask,
  getTask,
  deleteTask,
  submitTask,
  evaluateTask
};
