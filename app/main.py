from fastapi import FastAPI

from app.core.database import Base, engine
from app.models.contract import Contract

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SubPilot AI")

@app.get("/")
def root():
    return {"message": "SubPilot AI is running"}
