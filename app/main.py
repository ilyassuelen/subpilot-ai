from fastapi import FastAPI

from app.core.database import Base, engine
from app.models.action_log import ActionLog
from app.models.cancellation import CancellationRequest
from app.models.contract import Contract
from app.models.reminder import Reminder
from app.routers import contracts, dashboard, reminders, cancellations, actions

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SubPilot AI")

app.include_router(contracts.router)
app.include_router(dashboard.router)
app.include_router(reminders.router)
app.include_router(cancellations.router)
app.include_router(actions.router)

@app.get("/")
def root():
    return {"message": "SubPilot AI is running"}
