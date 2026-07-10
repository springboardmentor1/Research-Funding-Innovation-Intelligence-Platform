from pydantic import BaseModel


class OrganizationCreate(BaseModel):
    organization_name: str
    organization_type: str
    country: str
    website: str


class OrganizationResponse(OrganizationCreate):
    id: int

    class Config:
        from_attributes = True