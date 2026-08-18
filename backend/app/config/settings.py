from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")

# External API Keys
SEMANTIC_SCHOLAR_API_KEY = os.getenv("SEMANTIC_SCHOLAR_API_KEY")
CROSSREF_EMAIL = os.getenv("CROSSREF_EMAIL")
LENS_API_KEY = os.getenv("LENS_API_KEY")

# Government Funding APIs
NSF_API_KEY = os.getenv("NSF_API_KEY")
NIH_API_KEY = os.getenv("NIH_API_KEY")
GRANTS_GOV_API_KEY = os.getenv("GRANTS_GOV_API_KEY")