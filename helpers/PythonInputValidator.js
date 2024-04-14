/**
 * A class that will validate the user input, it will check if the user is trying to import a module that is not allowed
 * or if the user is trying to use `exec` which is not allowed.
 * @deprecated
 */
class PythonInputValidator {
    /** @private */
    static importModules =
    Object.freeze(["import os", "import sys", "import subprocess"])
    /** @private */
    static fromModules =
        Object.freeze(["from os import", "from sys import", "from subprocess import"])

    /**
     * A private constructor to prevent the class from being instantiated
     * @private
     */
    constructor() {}

    /**
     * A method that will check if the user is trying to use `exec`
     * @param {string} pythonInputFromEditor
     * @private
     * @returns {boolean} Returns true if the user is trying to use `exec`
     * 
     * For example:
     * ```python
     * exec("print('hello world')")
     * ```
     * This example is totally fine and does not pose a security risk, but if the user
     * were to do something like this:
     * ```python
     * exec("os.system('rm -rf /')") # This will delete everything on the computer
     * ```
     * This is a security risk and should not be allowed, thus; `exec` is not allowed. 
     */
    static containsExec(pythonInputFromEditor) {
        return pythonInputFromEditor.includes("exec");
    }


    /**
     * A method that will check if the user is trying to import a module
     * @param {string} pythonInputFromEditor
     * @private
     * @returns {boolean} Returns true if the user is trying to import a module, false otherwise
     * 
     * For example:
     * ```python
     * import os
     * import sys
     * import subprocess
     * 
     * os.system("ls") # This code will do the command `ls` in the terminal which will list all the files in the current directory
     * sys.exit()
     * subprocess.run(["ls", "-l"]) # This code will do the command `ls -l` in the terminal which will list all the files in the current directory
     * ```
     * 
     * This example is kinda okay as it does not really pose a security risk, but if the user were to do something like this:
     * ```python
     * import os
     * import sys
     * import subprocess
     * 
     * os.system("rm -rf /") # This will delete everything on the computer
     * sys.exit()
     * subprocess.run(["rm", "-rf", "/"]) # This will delete everything on the computer
     * ```
     * 
     * This is a security risk and should not be allowed, thus; importing modules is not allowed.
     */
    static isTryingToImportModule(pythonInputFromEditor) {
        if (PythonInputValidator.importModules.some(module => pythonInputFromEditor.includes(module))) {
            return true;
        }
        if (PythonInputValidator.fromModules.some(module => pythonInputFromEditor.includes(module))) {
            return true;
        }
        return false;
    }


    /**
     * This method will validate the user input, it will check if the user is trying to import a module
     * such as `sys`, `os`, `subprocess`, or if the user is trying to use `exec`
     * @param {string} pythonInputFromEditor 
     * @returns {[boolean | string]} Returns an array with the first element being a boolean that will be true if the user input is valid, false otherwise.
     * 
     * For example:
     * ```python
     * import os
     * import sys
     * import subprocess
     * 
     * os.system("ls") # This code will do the command `ls` in the terminal which will list all the files in the current directory
     * sys.exit()
     * subprocess.call("ls") 
     *  
     * os.system("rm -rf /") # This will delete everything on the computer
     * sys.exit()
     * subprocess.call("rm -rf /") # This will delete everything on the computer
     * ```
     * 
     * Now this is one example of a kinda okay way to import those module, and a terrible way to import those modules.
     * 
     * Now let's look at the `exec` function:
     * ```python
     * exec("print('hello world')")
     * exec("os.system('rm -rf /')") # This will delete everything on the computer
     * ```
     * The first code is an okay code that doesn't risk anything, but the second code is horrible, it will delete everything on the computer (the root directory).
     */
    static isInputValid(pythonInputFromEditor) {
        if (PythonInputValidator.containsExec(pythonInputFromEditor)) {
            return [false, "You are not allowed to use the `exec` function"]
        }
        if (PythonInputValidator.isTryingToImportModule(pythonInputFromEditor)) {
            return [false, "You are not allowed to import malicious modules"]
        }
        return [true, ""];
    }
}

module.exports = { PythonInputValidator }