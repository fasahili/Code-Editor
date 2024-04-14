const { PythonInterpreter } = require('./PythonInterpreter');

class PythonInterpreterBuilder {
    constructor() {
        /** @private */
        this.interpreter = new PythonInterpreter();
    }

    /**
     * A setter for the filename with the builder pattern
     * @param {string} filename 
     * @returns {PythonInterpreterBuilder} Returns a reference to the builder object
     */
    setFilename(filename) {
        this.interpreter.setFilename(filename);
        return this;
    }

    /**
     * A setter for the genericPathHolder with the builder pattern
     * @param {string} genericPathHolder
     * @returns {PythonInterpreterBuilder} Returns a reference to the builder object
     */
    setGenericPathHolder(genericPathHolder) {
        this.interpreter.setGenericPathHolder(genericPathHolder);
        return this;
    }

    /**
     * A setter for the pythonInputFromEditor with the builder pattern
     * @param {string} pythonInputFromEditor 
     * @returns {PythonInterpreterBuilder} Returns a reference to the builder object
     */
    setPythonInputFromEditor(pythonInputFromEditor) {
        this.interpreter.setPythonInputFromEditor(pythonInputFromEditor);
        return this;
    }

    /**
     * A setter for the isLoggedIn with the builder pattern
     * @param {boolean} isLoggedIn
     * @returns {PythonInterpreterBuilder} Returns a reference to the builder object
     */
    setIsLoggedIn(isLoggedIn) {
        this.interpreter.setIsLoggedIn(isLoggedIn);
        return this;
    }

    /**
     * A setter for the userId with the builder pattern
     * @param {string} userId 
     * @returns {PythonInterpreterBuilder} Returns a reference to the builder object
     */
    setUserId(userId) {
        this.interpreter.setUserId(userId);
        return this;
    }

    /**
     * A setter for the projectId with the builder pattern
     * @param {string} projectId 
     * @returns {PythonInterpreterBuilder} Returns a reference to the builder object
     */
    setProjectId(projectId) {
        this.interpreter.setProjectId(projectId);
        return this;
    }

    /**
     * A builder method that will return the interpreter object that was created
     * @returns {PythonInterpreter} Returns the interpreter object
     */
    build() {
        return this.interpreter;
    }
}

module.exports = { PythonInterpreterBuilder };