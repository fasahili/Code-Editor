const express = require("express");
const router = express.Router();
const Session=require("./authMiddleware");
const Task = require("../models/tasks");
const Project = require("../models/projects");
const { viewProfile } = require("../controllers/userProfileController");

router.use(Session.router);

/** 
Middleware function that checks if the user is logged in, if true then the function passes to the next() function in the routes
@param {Express.Request} req  The request object contains session and session ID.
@param {Express.Response} res  The response object used to send a response back to the client.
*/
const IDEMiddleware = async (req, res,next) => {
    let session= req.session;
    if (session && session.user_id){
        const userID = req.session.user_id;
        let taskID, reqParams=(req.params.task);
        if(!reqParams){
            reqParams=(req.url)
            taskID=(reqParams.split("/task="))[1];
        }else{
        taskID=(reqParams.split("="))[1];
        }

        const task = await Task.findOne({_id:taskID , deleted:false});
        const projectID = task.projectId.toString();
        //Task exists.. But we don't know if the user is a collaborator or an owner of this task.
        if(task){
            if(!(req.params.project)){
                console.log(req.params);
                console.log(req.params.project);
                res.redirect(`/code/task=${taskID}&project=${projectID}/`)
            }
            const isUserProjectOwner = await Project.findOne({_id:task.projectId,owner:userID,deleted:false});
            const isUserTaskCollaborator =task.collaborators.includes(userID);
            if(isUserProjectOwner || isUserTaskCollaborator)
                next();
            
        }else 
        res.redirect("/profile");
    } else
    next();
}


module.exports = {
    IDEMiddleware
}  