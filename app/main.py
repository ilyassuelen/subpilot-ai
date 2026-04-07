from fastapi import FastAPI

from app.core.database import Base, engine
from app.models.contract import Contract
from app.routers import contracts

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SubPilot AI")

app.include_router(contracts.router)

@app.get("/")
def root():
    return {"message": "SubPilot AI is running"}
