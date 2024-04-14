const { v4: generateUUIDv4 } = require('uuid');
const path = require('path');
const { PythonInterpreterBuilder: InterpreterBuilder } = require('../helpers/PythonInterpreterBuilder');
const { PNGFile } = require('../helpers/PNGFile');
const Task  = require('../models/tasks');

/** 
 * This function will take the user input from the editor and send it to the python interpreter.
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 * @returns {Promise<any>}
 */
const interpretUserInput = async (req, res) => {
    const { pythonInputFromEditor } = req.body;
    const {taskID}= req.body;
    const filename = taskID ?? generateUUIDv4();
    const genericPathHolder = path.join(__dirname, "..", "pythonFiles");
    let outputMatPlotLibPhoto = "";
    let isLoggedIn = false;
    let folderNameByProjectId = "undefined";
    const userId = req.session.user_id ?? "undefined";

    if (doesTaskIdExist(req)) {
        folderNameByProjectId = await getProjectId(req);
    }

    if (!pythonInputFromEditor) {
        return res.json({ output: 'No input to python' });
    }

    if (doesSessionExist(req.session)) isLoggedIn = true; 

    const interpreter = new InterpreterBuilder()
        .setFilename(filename)
        .setGenericPathHolder(genericPathHolder)
        .setPythonInputFromEditor(pythonInputFromEditor)
        .setIsLoggedIn(isLoggedIn)
        .setUserId(userId)
        .setProjectId(folderNameByProjectId)
        .build();

    const output = await interpreter.interpret();
    if (PNGFile.doesPNGFileExist(filename, userId, folderNameByProjectId)) {
        outputMatPlotLibPhoto = await PNGFile.convertPNGToBase64(filename, userId, folderNameByProjectId);
    }

    return res.json({ output, outputMatPlotLibPhoto });
}

/**
 * A function that checks if the session exists and if the user is logged in.
 * @param {string} session 
 * @returns {boolean}
 */
const doesSessionExist = session => session && session.user_id;

/**
 * A function that checks if the task id exists.
 * @param {string} session 
 * @returns {boolean}
 */
const doesTaskIdExist = req => req.body.taskID;

/**
 * A function that gets the project id from the task id.
 * @param {string} session 
 * @returns {Promise<string>}
 */
const getProjectId = async req => {
    return req.body.projectID;
}

module.exports = { interpretUserInput }
