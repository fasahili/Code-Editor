import sys
from io import StringIO
import matplotlib.pyplot as plt

class Interpreter:
    def __init__(self, filename, user_id, project_id):
        self.filename = filename
        self.user_id = user_id
        self.project_id = project_id
        
    def __run_default_user(self):
        with open(f"pythonFiles/defaultUser/{self.filename}.py") as python_file, open(f"pythonFiles/defaultUser/{self.filename}.txt", 'w+') as output_file:
            old_stdout = sys.stdout
            sys.stdout = StringIO()
            try:
                exec(python_file.read())
                output = str(sys.stdout.getvalue())
                sys.stdout = old_stdout

                if 'matplotlib' in sys.modules and plt.gcf().get_axes():
                    plt.savefig(f"pythonFiles/defaultUser/{self.filename}.png")
                    plt.clf() 

                output_file.write(output)
            except Exception as e:
                output_file.write(str(e))
                
    def __run_logged_user(self):
        with open(f"pythonFiles/{self.user_id}/code/{self.project_id}/{self.filename}/{self.filename}.py") as python_file, open(f"pythonFiles/{self.user_id}/code/{self.project_id}/{self.filename}/{self.filename}.txt", 'w+') as output_file:
            old_stdout = sys.stdout
            sys.stdout = StringIO()
            try:
                exec(python_file.read())
                output = str(sys.stdout.getvalue())
                sys.stdout = old_stdout

                if 'matplotlib' in sys.modules and plt.gcf().get_axes():
                    plt.savefig(f"pythonFiles/{self.user_id}/code/{self.project_id}/{self.filename}/{self.filename}.png")
                    plt.clf() 

                output_file.write(output)
            except Exception as e:
                output_file.write(str(e))
                
    def run(self):
        if self.user_id == 'undefined' or self.project_id == 'undefined':
            self.__run_default_user()
        else:
            self.__run_logged_user()
            
interpreter = Interpreter(sys.argv[1], sys.argv[2], sys.argv[3])
interpreter.run()