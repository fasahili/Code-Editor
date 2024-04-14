const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");
const { exec } = require("child_process");

class PythonInterpreter {
    constructor() {
        /** @private */
        this.filename = "";
        /** @private */
        this.genericPathHolder = "";
        /** @private */
        this.pythonInputFromEditor = "";
        /** @private */
        this.isLoggedIn = false;
        /** @private */
        this.userId = "";
        /** @private */
        this.projectId = "";
    }

    /**
     * A setter for the filename
     * @param {string} filename 
     */
    setFilename(filename) {
        this.filename = filename;
    }

    /**
     * A setter for the genericPathHolder
     * @param {string} genericPathHolder 
     */
    setGenericPathHolder(genericPathHolder) {
        this.genericPathHolder = genericPathHolder;
    }

    /**
     * A setter for the pythonInputFromEditor
     * @param {string} pythonInputFromEditor 
     */
    setPythonInputFromEditor(pythonInputFromEditor) {
        this.pythonInputFromEditor = pythonInputFromEditor;
    }

    /**
     * A setter for the userId
     * @param {string} userId
     */
    setUserId(userId) {
        this.userId = userId;
    }

    /**
     * A setter for the projectId
     * @param {string} projectId 
     */
    setProjectId(projectId) {
        this.projectId = projectId;
    }

    /**
     * A setter for the isLoggedIn
     * @param {boolean} isLoggedIn
     */
    setIsLoggedIn(isLoggedIn) {
        this.isLoggedIn = isLoggedIn;
    }

    /**
     * A method that checks if the default user folder exists
     * @returns {Promise<string>} Returns the output from the python interpreter
     */
    doesDefaultUserFolderExist() {
        return fs.existsSync(path.join(this.genericPathHolder, "defaultUser"));
    }

    /**
     * A method that checks if a folder with the user id exists
     * @private
     * @returns {boolean} Returns true if the user folder exists, false otherwise
     */
    doesUserFolderExist() {
        return fs.existsSync(path.join(this.genericPathHolder, this.userId));
    }

    /**
     * A method that checks if a folder that is called code exists in the user folder
     * @private
     * @returns {boolean} Returns true if the user folder exists, false otherwise
     */
    doesCodeFolderExist() {
        return fs.existsSync(path.join(this.genericPathHolder, this.userId, "code"));
    }

    /**
     * A method that checks if a folder with the project id exists
     * @private
     * @returns {boolean} Returns true if the project folder exists, false otherwise
     */
    doesProjectFolderExist() {
        return fs.existsSync(path.join(this.genericPathHolder, this.userId, "code", this.projectId));
    }

    doesTaskFolderExist() {
        return fs.existsSync(path.join(this.genericPathHolder, this.userId, "code", this.projectId, this.filename));
    }

    /**
     * A method that will create a folder with the user id if it does not exist
     * @async
     * @private
     * @returns {Promise<void>}
     */
    async createUserFolderIfDoesNotExist() {
        if (!this.doesDefaultUserFolderExist()) {
            await fsp.mkdir(path.join(this.genericPathHolder, "defaultUser"));
        }
        if (!this.doesUserFolderExist()) {
            await fsp.mkdir(path.join(this.genericPathHolder, this.userId));
        }
        if (!this.doesCodeFolderExist()) {
            await fsp.mkdir(path.join(this.genericPathHolder, this.userId, "code"));
        }
        if (!this.doesProjectFolderExist()) {
            await fsp.mkdir(path.join(this.genericPathHolder, this.userId, "code", this.projectId));
        }
        if (!this.doesTaskFolderExist()) {
            await fsp.mkdir(path.join(this.genericPathHolder, this.userId, "code", this.projectId, this.filename));
        }
    }

    /**
     * A method that will create a python file with the user input
     * @async
     * @private
     * @returns {Promise<void>}
     */
    async createPythonFile() {
        if (this.isLoggedIn) {
            await this.createUserFolderIfDoesNotExist();
            await fsp.writeFile(path.join(this.genericPathHolder, this.userId, "code", `${this.projectId}`, `${this.filename}`, `${this.filename}.py`), this.pythonInputFromEditor);
            return;
        }
        await fsp.writeFile(path.join(this.genericPathHolder, "defaultUser", `${this.filename}.py`), this.pythonInputFromEditor);
    }

    /**
     * A method that will write to a python file with the user input
     * @async
     * @private
     * @returns {Promise<void>}
     */
    async writeToFile() {
        try {
            await this.createPythonFile();
        } catch (err) {
            throw new Error(`Error writing to file: ${err}`);
        }
    }

    /**
     * A method that will check if the python file exists in the user folder or not, then will
     * get the output and return it
     * @async
     * @private
     * @returns {Promise<string>} Returns the output from the python file
     */
    async outputReaderAfterChecking() {
        if (this.isLoggedIn) {
            const data = await fsp.readFile(path.join(this.genericPathHolder, this.userId, "code", `${this.projectId}`, `${this.filename}`, `${this.filename}.txt`), "utf8");
            return data;
        }
        const data = await fsp.readFile(path.join(this.genericPathHolder, "defaultUser", `${this.filename}.txt`), "utf8");
        return data;
    }

    /**
     * A method that will read the output from the txt file
     * @async
     * @private
     * @returns {Promise<string>} Returns the output from the python file
     */
    async readOutputFile() {
        try {
            const data = await this.outputReaderAfterChecking();
            return data;
        } catch (err) {
            if (err.code === 'ENOENT') {
                throw new Error(`File ${this.filename}.txt not found`);
            } else {
                throw new Error(`Error reading file: ${err}`);
            }
        }
    }

    /**
     * A method that will execute the python file while also checking if 
     * the user is logged in or not
     * @async
     * @private
     * @returns {Promise<string>} Returns the output from the python file
     */
    async pythonCodeExecuter() {
        return new Promise(async (resolve, reject) => {
            exec(`python3 interpreterHelper/interpreter.py ${this.filename} ${this.userId} ${this.projectId}`, async (error, _stdout, stderr) => {
                if (error) {
                    reject(stderr);
                } else {
                    try {
                        const output = await this.readOutputFile();
                        resolve(output);
                    } catch (err) {
                        reject(err);
                    }
                }
            });
        });
    }

    /**
     * A method that will execute the python file
     * @async
     * @private
     * @returns {Promise<string>} Returns the output from the python file
     */
    async executePythonFile() {
        return new Promise(async (resolve, reject) => {
            try {
                const output = await this.pythonCodeExecuter();
                resolve(output);
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * A method that will remove the txt file after checking if the user is logged in or not
     * @async
     * @private
     */
    async fileRemoverAfterChecking() {
        if (this.isLoggedIn) {
            await fsp.unlink(path.join(this.genericPathHolder, this.userId, "code", `${this.projectId}`, `${this.filename}`, `${this.filename}.txt`));
            return;
        }
        await fsp.unlink(path.join(this.genericPathHolder, "defaultUser", `${this.filename}.txt`));
    }

    /**
     * A method that will remove the txt file
     * @async
     * @private
     * @returns {Promise<void>}
     */
    async removeTxtFile() {
        try {
            await this.fileRemoverAfterChecking();
        } catch (err) {
            if (err.code === 'ENOENT') {
                throw new Error(`File ${this.filename}.txt not found`);
            } else {
                throw new Error(`Error reading file: ${err}`);
            }
        }
    }

    /**
     * A method that will interpret the python file, read the txt file and return the output
     * @returns {Promise<string>} Returns the output from the python file
     */
    async interpret() {
        try {
            await this.writeToFile();
            const output = await this.executePythonFile();
            await this.removeTxtFile();
            return output;
        } catch (err) {
            return err;
        }
    }
}

module.exports = { PythonInterpreter };