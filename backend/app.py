from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

users = []


@app.route("/")
def home():
    return jsonify({
        "message": "Research Funding and Innovation Intelligence Platform Backend Running"
    })


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

    return jsonify({
        "message": "Registration successful"
    }), 201


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

    return jsonify({
        "message": "Invalid email or password"
    }), 401


@app.route("/projects", methods=["GET"])
def projects():
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    cordis_path = os.path.join(
        base_path,
        "datasets",
        "cordis_cleaned.xlsx"
    )

    grants_path = os.path.join(
        base_path,
        "datasets",
        "grants_cleaned.xlsx"
    )

    all_projects = []

    for file_path in [cordis_path, grants_path]:

        if os.path.exists(file_path):

            df = pd.read_excel(file_path)

            df = df.fillna("").astype(str)

            all_projects.extend(
                df.to_dict(orient="records")
            )

    return jsonify({
        "projects": all_projects
    }), 200


@app.route("/search", methods=["GET"])
def search():

    keyword = request.args.get(
        "keyword",
        ""
    ).strip().lower()

    if not keyword:
        return jsonify({
            "projects": []
        }), 200

    base_path = os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )

    cordis_path = os.path.join(
        base_path,
        "datasets",
        "cordis_cleaned.xlsx"
    )

    grants_path = os.path.join(
        base_path,
        "datasets",
        "grants_cleaned.xlsx"
    )

    domain_mapping = {

        "healthcare": [
            "healthcare",
            "health",
            "medical",
            "medicine",
            "clinical",
            "biomedical",
            "hospital",
            "public health",
            "health technology"
        ],

        "cyber security": [
            "cyber security",
            "cybersecurity",
            "information security",
            "network security",
            "computer security",
            "data security",
            "digital security",
            "privacy",
            "data protection",
            "encryption",
            "cryptography",
            "secure communication",
            "software security",
            "internet security"
        ],

        "artificial intelligence": [
            "artificial intelligence",
            "artificial-intelligence",
            "ai",
            "machine intelligence"
        ],

        "machine learning": [
            "machine learning",
            "deep learning",
            "neural network",
            "neural networks"
        ],

        "robotics": [
            "robotics",
            "robot",
            "robots",
            "autonomous systems"
        ]
    }

    search_terms = domain_mapping.get(
        keyword,
        [keyword]
    )

    all_results = []

    for file_path in [
        cordis_path,
        grants_path
    ]:

        if not os.path.exists(file_path):
            continue

        df = pd.read_excel(file_path)

        df = df.fillna("").astype(str)

        searchable_columns = []

        for column in [
            "Title",
            "Fields of science",
            "Research Field",
            "Programme",
            "Programmes",
            "Teaser",
            "Description",
            "Project acronym"
        ]:

            if column in df.columns:
                searchable_columns.append(column)

        if not searchable_columns:
            continue

        mask = pd.Series(
            False,
            index=df.index
        )

        for column in searchable_columns:

            column_data = df[column].str.lower()

            for term in search_terms:

                mask = mask | column_data.str.contains(
                    term,
                    na=False,
                    regex=False
                )

        results = df[mask]

        all_results.extend(
            results.to_dict(
                orient="records"
            )
        )

    return jsonify({
        "projects": all_results
    }), 200


@app.route("/funding", methods=["GET"])
def get_funding():

    keyword = request.args.get(
        "keyword",
        ""
    ).strip().lower()

    base_path = os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )

    grants_path = os.path.join(
        base_path,
        "datasets",
        "grants_cleaned.xlsx"
    )

    if not os.path.exists(grants_path):

        return jsonify({
            "grants": []
        }), 200

    df = pd.read_excel(grants_path)

    df = df.fillna("").astype(str)

    if not keyword:

        return jsonify({
            "grants": df.to_dict(
                orient="records"
            )
        }), 200

    domain_mapping = {

        "healthcare": [
            "healthcare",
            "health",
            "medical",
            "medicine",
            "clinical",
            "biomedical"
        ],

        "cyber security": [
            "cyber security",
            "cybersecurity",
            "information security",
            "network security",
            "computer security",
            "data security",
            "digital security",
            "privacy",
            "data protection",
            "encryption",
            "cryptography",
            "secure communication",
            "software security",
            "internet security"
        ],

        "artificial intelligence": [
            "artificial intelligence",
            "artificial-intelligence",
            "ai",
            "machine intelligence"
        ],

        "machine learning": [
            "machine learning",
            "deep learning",
            "neural network"
        ],

        "robotics": [
            "robotics",
            "robot",
            "robots",
            "autonomous systems"
        ]
    }

    search_terms = domain_mapping.get(
        keyword,
        [keyword]
    )

    searchable_columns = []

    for column in [
        "Title",
        "Fields of science",
        "Research Field",
        "Programme",
        "Programmes",
        "Description",
        "Teaser"
    ]:

        if column in df.columns:
            searchable_columns.append(column)

    mask = pd.Series(
        False,
        index=df.index
    )

    for column in searchable_columns:

        column_data = df[column].str.lower()

        for term in search_terms:

            mask = mask | column_data.str.contains(
                term,
                na=False,
                regex=False
            )

    results = df[mask]

    return jsonify({
        "grants": results.to_dict(
            orient="records"
        )
    }), 200


@app.route("/patents", methods=["GET"])
def get_patents():

    keyword = request.args.get(
        "keyword",
        ""
    ).strip().lower()

    base_path = os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )

    patents_path = os.path.join(
        base_path,
        "datasets",
        "patents_cleaned.xlsx"
    )

    if not os.path.exists(patents_path):

        return jsonify({
            "patents": []
        }), 200

    df = pd.read_excel(patents_path)

    df = df.fillna("").astype(str)

    if not keyword:

        return jsonify({
            "patents": df.to_dict(
                orient="records"
            )
        }), 200

    searchable_columns = []

    for column in [
        "Title",
        "Fields of science",
        "Research Field",
        "Description",
        "Teaser"
    ]:

        if column in df.columns:
            searchable_columns.append(column)

    mask = pd.Series(
        False,
        index=df.index
    )

    for column in searchable_columns:

        mask = mask | df[column].str.lower().str.contains(
            keyword,
            na=False,
            regex=False
        )

    results = df[mask]

    return jsonify({
        "patents": results.to_dict(
            orient="records"
        )
    }), 200


if __name__ == "__main__":
    app.run(debug=True)