const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

class PNGFile {
    /** @private */
    static pngPathHolder = path.join(__dirname, "..", "pythonFiles");

    /** @private */
    constructor() { }

    /**
     * A method that will check if the png file exists
     * @param {string} filename The name of the png file
     * @returns {boolean}
     */
    static doesPNGFileExist(filename, userId, projectId) {
        if (fs.existsSync(path.join(PNGFile.pngPathHolder, "defaultUser", `${filename}.png`))) {
            return true;
        }
        if (fs.existsSync(path.join(PNGFile.pngPathHolder, userId, "code", projectId, filename, `${filename}.png`))) {
            return true;
        }
        return false;
    }

    /**
     * A method that takes the png file and converts it to base64, then deleted the picture
     * @param {string} filename The name of the png file
     * @param {string} userId The id of the user that is linked to their folder
     * @returns {boolean}
     */
    static async convertPNGToBase64(filename, userId, projectId) {
        const base64PNG = await PNGFile.pngConvertorAfterCheckingIfUserFolderExists(filename, userId, projectId);
        return base64PNG;
    }

    static async pngConvertorAfterCheckingIfUserFolderExists(filename, userId, projectId) {
        if ((typeof userId === 'undefined' || userId === null || userId === "") && (typeof projectId === 'undefined' || projectId === null || projectId === "")) {
            const base64PNG =
                await fsp.readFile(
                    path.join(PNGFile.pngPathHolder,
                        "defaultUser",
                        `${filename}.png`),
                    { encoding: 'base64' });
            fs.unlinkSync(path.join(PNGFile.pngPathHolder, "defaultUser", `${filename}.png`));
            return base64PNG;
        } else {
            const base64PNG =
                await fsp.readFile(path.join(PNGFile.pngPathHolder,
                    userId,
                    "code",
                    projectId,
                    filename,
                    `${filename}.png`
                ),
                    { encoding: 'base64' });
            fs.unlinkSync(path.join(PNGFile.pngPathHolder, userId, "code", projectId, filename, `${filename}.png`));
            return base64PNG;
        }
    }
}

module.exports = { PNGFile }