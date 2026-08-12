from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# In-memory user store
users = []


@app.route("/")
def home():
    return jsonify({
        "message": "Research Funding and Innovation Intelligence Platform Backend Running"
    })


# ---------------- REGISTER ---------------- #

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"message": "All fields are required"}), 400

    for user in users:
        if user["email"] == email:
            return jsonify({"message": "User already exists"}), 409

    users.append({
        "name": name,
        "email": email,
        "password": password
    })

    return jsonify({"message": "Registration successful"}), 201


# ---------------- LOGIN ---------------- #

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    email = data.get("email")
    password = data.get("password")

    for user in users:
        if user["email"] == email and user["password"] == password:
            return jsonify({
                "message": "Login successful",
                "name": user["name"]
            }), 200

    return jsonify({"message": "Invalid email or password"}), 401


# ---------------- PROJECTS ---------------- #

@app.route("/projects", methods=["GET"])
def projects():
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    cordis_path = os.path.join(base_path, "datasets", "cordis_cleaned.xlsx")
    grants_path = os.path.join(base_path, "datasets", "grants_cleaned.xlsx")

    all_projects = []

    if os.path.exists(cordis_path):
        cordis_df = pd.read_excel(cordis_path).fillna("").astype(str)
        all_projects.extend(cordis_df.to_dict(orient="records"))

    if os.path.exists(grants_path):
        grants_df = pd.read_excel(grants_path).fillna("").astype(str)
        all_projects.extend(grants_df.to_dict(orient="records"))

    return jsonify({"projects": all_projects}), 200


# ---------------- SEARCH ---------------- #

@app.route("/search", methods=["GET"])
def search():
    keyword = request.args.get("keyword", "").strip().lower()

    if not keyword:
        return jsonify({"projects": []})

    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cordis_path = os.path.join(base_path, "datasets", "cordis_cleaned.xlsx")

    if not os.path.exists(cordis_path):
        return jsonify({"projects": []})

    df = pd.read_excel(cordis_path).fillna("").astype(str)
    field_column = "Fields of science" if "Fields of science" in df.columns else "Research Field"

    if field_column in df.columns:
        results = df[df[field_column].str.lower().str.contains(keyword, na=False)]
    else:
        results = df[df["Title"].str.lower().str.contains(keyword, na=False)]

    return jsonify({"projects": results.to_dict(orient="records")})


# ---------------- FUNDING OPPORTUNITIES ---------------- #

@app.route("/funding", methods=["GET"])
def get_funding():
    keyword = request.args.get("keyword", "").strip().lower()

    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    grants_path = os.path.join(base_path, "datasets", "grants_cleaned.xlsx")

    if not os.path.exists(grants_path):
        return jsonify({"grants": []})

    df = pd.read_excel(grants_path).fillna("").astype(str)

    if keyword:
        field_col = "Fields of science" if "Fields of science" in df.columns else "Research Field"
        if field_col in df.columns:
            results = df[df[field_col].str.lower().str.contains(keyword, na=False)]
        else:
            results = df[df["Title"].str.lower().str.contains(keyword, na=False)]
    else:
        results = df

    return jsonify({"grants": results.to_dict(orient="records")})


# ---------------- PATENTS & IP ---------------- #

@app.route("/patents", methods=["GET"])
def get_patents():
    keyword = request.args.get("keyword", "").strip().lower()

    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    patents_path = os.path.join(base_path, "datasets", "patents_cleaned.xlsx")

    if not os.path.exists(patents_path):
        return jsonify({"patents": []})

    df = pd.read_excel(patents_path).fillna("").astype(str)

    if keyword:
        field_col = "Fields of science" if "Fields of science" in df.columns else "Research Field"
        if field_col in df.columns:
            results = df[df[field_col].str.lower().str.contains(keyword, na=False)]
        else:
            results = df[df["Title"].str.lower().str.contains(keyword, na=False)]
    else:
        results = df

    return jsonify({"patents": results.to_dict(orient="records")})


# Always keep app.run() at the bottom
if __name__ == "__main__":
    app.run(debug=True)