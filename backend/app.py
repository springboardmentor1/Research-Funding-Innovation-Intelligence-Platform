from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "Research Funding & Innovation Intelligence Backend"

if __name__ == "__main__":
    app.run(debug=True)