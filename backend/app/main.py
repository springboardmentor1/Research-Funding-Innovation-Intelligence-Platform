from fastapi import FastAPI

app = FastAPI(
    title="Research Funding & Innovation Intelligence Platform",
    description="AI-powered platform for funding discovery, research intelligence, patent analysis, and commercialization.",
    version="1.0.0"
)

@app.get("/")
def root():
    return {
        "status": "success",
        "message": "Research Funding & Innovation Intelligence Platform API is running!"
    }