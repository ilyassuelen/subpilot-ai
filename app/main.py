from fastapi import FastAPI

app = FastAPI(title="SubPilot AI")

@app.get("/")
def root():
    return {"message": "SubPilot AI is running"}