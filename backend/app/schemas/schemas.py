from pydantic import BaseModel

class PaperSchema(BaseModel):
    title: str


class GrantSchema(BaseModel):
    title: str


class PatentSchema(BaseModel):
    title: str