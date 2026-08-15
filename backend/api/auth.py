from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token


# =====================================================
# AUTHENTICATION BLUEPRINT
# =====================================================

auth_bp = Blueprint("auth", __name__)


# =====================================================
# DEMO USER
# =====================================================

USER = {
    "email": "admin@archive.com",
    "password": "admin123",
    "name": "Administrator",
    "role": "Administrator"
}


# =====================================================
# LOGIN
# =====================================================

@auth_bp.route("/login", methods=["POST"])
def login():

    try:

        # -------------------------------------------------
        # Get request data
        # -------------------------------------------------

        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "Request body is missing"
            }), 400


        # -------------------------------------------------
        # Get email and password
        # -------------------------------------------------

        email = data.get("email", "").strip().lower()
        password = data.get("password", "").strip()


        # -------------------------------------------------
        # Validate input
        # -------------------------------------------------

        if not email or not password:

            return jsonify({
                "success": False,
                "message": "Email and Password are required"
            }), 400


        # -------------------------------------------------
        # Verify user credentials
        # -------------------------------------------------

        if (
            email == USER["email"]
            and password == USER["password"]
        ):

            # -------------------------------------------------
            # Create JWT access token
            # -------------------------------------------------

            access_token = create_access_token(
                identity=USER["email"]
            )


            # -------------------------------------------------
            # Successful login response
            # -------------------------------------------------

            return jsonify({

                "success": True,

                "message": "Login Successful",

                "access_token": access_token,

                "user": {
                    "name": USER["name"],
                    "email": USER["email"],
                    "role": USER["role"]
                }

            }), 200


        # -------------------------------------------------
        # Invalid credentials
        # -------------------------------------------------

        return jsonify({

            "success": False,

            "message": "Invalid Email or Password"

        }), 401


    # =====================================================
    # ERROR HANDLING
    # =====================================================

    except Exception as error:

        print("Login Error:", error)

        return jsonify({

            "success": False,

            "message": "Internal Server Error"

        }), 500