from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.models.action_log import ActionLog
from app.models.cancellation import CancellationRequest
from app.models.contract import Contract
from app.models.reminder import Reminder
from app.models.user import User
from app.models.notification_settings import NotificationSettings
from app.routers import contracts, dashboard, reminders, cancellations, actions
from app.routers.auth import router as auth_router
from app.routers import notification_settings

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SubPilot AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(contracts.router)
app.include_router(dashboard.router)
app.include_router(reminders.router)
app.include_router(cancellations.router)
app.include_router(actions.router)
app.include_router(notification_settings.router)

@app.get("/")
def root():
    return {"message": "SubPilot AI is running"}
