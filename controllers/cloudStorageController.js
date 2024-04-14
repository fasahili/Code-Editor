const Dropbox = require("dropbox").Dropbox;
const fs = require('fs').promises;
const User = require("../models/users");
const path = require('path');



/**
 * Upload a folder and its contents to Dropbox recursively
 * @param {*} folderPath The local path of the folder to upload
 * @param {*} dropboxFolder The Dropbox folder to upload to (e.g. '/codeEditor')
 * @param {*} cloudStorage The name of the cloud storage account to use (e.g. 'dropbox')
 * 
 * To call this function, require it in your code and pass the local folder path as the first argument, 
 * and optionally the Dropbox folder name and cloud storage account name as the second and third arguments:
 * 
 * const UploadCloudStorage = require('../controllers/cloudStorageController');
 * UploadCloudStorage.UploadDropbox(path.join(__dirname, "..", "pythonFiles"), '/folderNameOneDropbox', 'dropbox');
 */
async function UploadDropbox(folderPath, dropboxFolder = '/folderNameOneDropbox', cloudStorage) {
  const user = await User.findOne({ _id: "user.Id" });//user.id should be changed
  const accessToken = user.cloudAccounts[cloudStorage];
  const dropbox = new Dropbox({ accessToken });
  const options = { recursive: true };
  const localFiles = await fs.readdir(folderPath, options);

  for (const localFile of localFiles) {
    const localPath = path.join(folderPath, localFile);
    const dropboxPath = path.posix.join(dropboxFolder, localFile);

    if ((await fs.stat(localPath)).isDirectory()) {
      await UploadDropbox(localPath, dropboxPath);
    } else {
      try {
        await dropbox.filesUpload({
          path: dropboxPath,
          contents: await fs.readFile(localPath),
          mode: { ".tag": "overwrite" }
        });
        console.log(`Uploaded file ${dropboxPath}`);
      } catch (error) {
        res.status(500).render("../views/serverError", { error: error.message });
      }
    }
  }
}
module.exports = { UploadDropbox };
