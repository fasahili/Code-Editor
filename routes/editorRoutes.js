const express = require("express");
const router = express.Router();
const { UploadDropbox } = require('../controllers/cloudStorageController');
const {data,downloadZipFile,createNewFile,viewEditor,newFolderName,getAnswer,autoSaveFile} = require("../controllers/editorController");
const { interpretUserInput } = require("../controllers/outputController");
const { IDEMiddleware } = require("../middleware/editorMiddleware");
const path = require("path");

router.get("/code/:task&:project|/code|/code/:task" ,  IDEMiddleware, (req, res) => {
  viewEditor (req,res) ;
})

router.post("/code", IDEMiddleware , (req, res) => {
  viewEditor (req,res) ;
})


router.post("/run_python", async (req, res) => {
  await interpretUserInput(req, res);
});

router.post("/code/newFile", async (req, res) => {
  const message= await createNewFile(req,res);
  
   return message ;
});


router.post("/code/newZipFile", async (req, res) => {
  const { newFileZipName } = req.body;
  await downloadZipFile(newFileZipName);
});

router.post('/upload-dropbox', async (req, res) => {
  const reqParams=[(req.params.task),(req.params.project)];
  const taskID=(reqParams[0].split("="))[1];
  const projectID=(reqParams[1].split("="))[1];
  await UploadDropbox(path.join(__dirname, "..", "pythonFiles",req.session.user_id,"code",projectID,taskID),"/code-editor", "dropbox");
});

router.post("/get_answer", async (req, res) => {
  await getAnswer(req, res);
});
router.post("/code/add-folder", async (req, res) => {
  const { folderNameInput } = req.body;
  console.log("he " + folderNameInput);
  await newFolderName(req, res, folderNameInput);
});

router.post("/autosave", autoSaveFile);

module.exports = router; 

