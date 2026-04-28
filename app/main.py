from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.models.action_log import ActionLog
from app.models.cancellation import CancellationRequest
from app.models.contract import Contract
from app.models.notification_settings import NotificationSettings
from app.models.reminder import Reminder
from app.models.user import User
from app.routers import (
    actions,
    cancellations,
    contracts,
    dashboard,
    reminders,
    notification_settings,
    notifications,
    savings_insights,
)
from app.routers.auth import router as auth_router
from app.services.notifications.reminder_agent_scheduler import (
    start_reminder_agent_scheduler,
    stop_reminder_agent_scheduler,
)

Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start and stop background services with the FastAPI application."""
    start_reminder_agent_scheduler()
    yield
    stop_reminder_agent_scheduler()


app = FastAPI(title="SubPilot AI", lifespan=lifespan)

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
app.include_router(notifications.router)
app.include_router(savings_insights.router)


@app.get("/")
def root():
    return {"message": "SubPilot AI is running"}
