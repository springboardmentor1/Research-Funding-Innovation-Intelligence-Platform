from pydantic import BaseModel

class Alert(BaseModel):
    type: str
    title: str
    detail: str
    severity: str
