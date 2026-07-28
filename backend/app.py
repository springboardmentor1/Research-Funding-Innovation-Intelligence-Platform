from flask import Flask
from flask_cors import CORS

from api.reports import reports_bp
from api.search import search_bp
from api.dashboard import dashboard_bp
from api.dashboard_insights import dashboard_insights_bp
from api.publications import publications_bp
from api.funding import funding_bp
from api.patents import patents_bp
from api.organizations import organizations_bp
from api.researchers import researchers_bp
from api.notifications import notifications_bp

app = Flask(__name__)
CORS(app)

# Register Blueprints
app.register_blueprint(reports_bp)
app.register_blueprint(search_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(dashboard_insights_bp)
app.register_blueprint(publications_bp)
app.register_blueprint(funding_bp)
app.register_blueprint(patents_bp)
app.register_blueprint(organizations_bp)
app.register_blueprint(researchers_bp)
app.register_blueprint(notifications_bp)


@app.route("/")
def home():
    return {
        "project": "Research Funding & Innovation Intelligence Platform",
        "status": "Backend Running"
    }


@app.route("/health")
def health():
    return {
        "status": "Healthy"
    }


if __name__ == "__main__":
    app.run(debug=True)