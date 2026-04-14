from pydantic import BaseModel


class EmailPreviewResponse(BaseModel):
    """Schema returned by the API for a send-ready email preview."""

    to: str
    subject: str
    body: str
    mailto_link: str
