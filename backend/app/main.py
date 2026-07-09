from fastapi import FastAPI

app = FastAPI(title="Research Funding & Innovation Intelligence Platform")

@app.get("/")
def health_check():
    return {"status": "backend is running"}