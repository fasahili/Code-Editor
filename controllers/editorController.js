const archiver = require("archiver");
const fsp = require("fs").promises;
const fs = require("fs");
const path = require("path");

const Task = require("../models/tasks");
const Project = require("../models/projects");
const { error } = require("console");

const data = [
  {
    name: "Folder 1",
    type: "folder",
    children: [
      {
        name: "File 1",
        type: "file",
      },
      {
        name: "File 2",
        type: "file",
      },
    ],
  },
  {
    name: "Folder 3",
    type: "folder",
    children: [
      {
        name: "File 5",
        type: "file",
      },
    ],
  },
];

function downloadZipFile() {
  const folderPath = path.join(__dirname, "renad");
  const outputFilePath = path.join(__dirname, "renad.zip");
  const output = fs.createWriteStream(outputFilePath);
  const archive = archiver("zip", { zlib: { level: 9 } });
  output.on("close", function () {
    console.log(archive.pointer() + " total bytes");
    console.log("Zip file has been created successfully.");
    res.download(outputFilePath, function (err) {
      // res for what ?
      if (err) {
        console.error(err);
      } else {
        console.log("Zip file has been downloaded successfully.");
        fs.unlink(outputFilePath, function (err) {
          if (err) {
            console.error(err);
          } else {
            console.log("Zip file has been deleted successfully.");
          }
        });
      }
    });
  });
  archive.on("error", function (err) {
    console.error(err);
  });
  archive.pipe(output);
  archive.directory(folderPath, false);
  archive.finalize();
}
const newFolderName = async (req, res, folderNameInput) => {
  fs.mkdir(
    `pythonFiles/${req.session.user_id}/code/${req.body.projectID}/${req.body.taskID}/${folderNameInput}`,

    (err) => {
      if (err) {
        res.status(500).send("Error creating folder");
        return;
      }

      // Save the folder name to a JSON file

      return viewEditor(req, res);
    }
  );
};

const createNewFile = async (req, res) => {
  const { newFileName, folderNameInput } = req.body;
  const newFilePath = path.join(__dirname, "..", "pythonFiles", newFileName);
  //const newFilePath = path.join(__dirname, "..","pythonFiles" ,req.session.user_id, "code" ,req.session.projectID,req.session.taskID, folderNameInput, newFileName);
  try {
    if (fs.existsSync(newFilePath)) {
      const message = { message: "File already exists" };
      return res.json(message);
    }
    // Create the new file
    await fsp.writeFile(newFilePath, "");
    return newFilePath;
  } catch (err) {
    res.status(500).render("../views/serverError", { error: error.message });
  }
};

/**
 *
 * @param {Express.Request} req the request object contains the id of the user
 * @param {Express.Response} res the response object to send the status of the given code
 * @returns {Promise} return the status of the operation success or if there is an error
 */

const viewEditor = async (req, res) => {
  try {
    let taskID, task, project,folders;
    taskID = task = project = folders = null;
    if (req.session && req.session.user_id) {
      const reqParams = req.params.task;
      if (reqParams) 
        taskID = reqParams.split("=")[1];
      if(taskID){
        task = await Task.findOne({ _id: taskID, deleted: false });
        project = await Project.findOne({ _id: task.projectId, deleted: false });
        const projectId = task.projectId.toString();
        const fullPath = path.join(
          __dirname,
          "..",
          "pythonFiles",
          req.session.user_id,
          "code",
          projectId,
          taskID
        );
        folders = fs.readdirSync(fullPath);
      }
      else 
      res.redirect("/profile");
    }
    else
    task = 0;



    return res.render("../views/code-editor/codeEditor", {
      title: "code",
      data,
      project,
      task,
      folders,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).render("../views/serverError", { error: error.message });
  }
};
/**
 * A function to get the answer of the given task that was submitted in the create task form
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const getAnswer = async (req, res) => {
  const userId = req.session.user_id;
  const { projectId, taskId } = req.body;
  const pathOfSolution = path.join(
    __dirname,
    "..",
    "pythonFiles",
    userId,
    "code",
    projectId,
    taskId,
    "solutions",
    `${taskId}.solution.txt`
  );
  try {
    const answer = await fsp.readFile(pathOfSolution, "utf-8");
    res.json({ answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const autoSaveFile = async (req, res) => {
  const code = req.body.code;
  fs.writeFile("autosaved-code.txt", code, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: error.message });
    }
  });
};

module.exports = {
  createNewFile,
  downloadZipFile,
  data,
  viewEditor,
  getAnswer,
  newFolderName,
  autoSaveFile,
};
