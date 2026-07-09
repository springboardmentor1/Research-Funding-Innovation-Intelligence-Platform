import uvicorn

if __name__ == "__main__":
    print("Starting Research Funding & Innovation Intelligence Platform API...")
    print("API Documentation will be available at: http://127.0.0.1:8000/docs")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
