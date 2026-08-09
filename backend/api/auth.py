from flask import Blueprint, request, jsonify

auth_bp = Blueprint("auth", __name__)

# Demo User
USER = {
    "email": "admin@archive.com",
    "password": "admin123",
    "name": "Administrator"
}


@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if email == USER["email"] and password == USER["password"]:
        return jsonify({
            "success": True,
            "message": "Login Successful",
            "user": {
                "name": USER["name"],
                "email": USER["email"]
            }
        })

    return jsonify({
        "success": False,
        "message": "Invalid Email or Password"
    }), 401