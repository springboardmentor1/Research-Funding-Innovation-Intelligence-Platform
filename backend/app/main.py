from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {
        "message": "Research Funding & Innovation Intelligence Platform API is Running Successfully!"
    }