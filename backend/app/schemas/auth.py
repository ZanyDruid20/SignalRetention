from pydantic import BaseModel, EmailStr

class AuthUser(BaseModel):
    clerk_user_id: str
    email : EmailStr | None = None
    name: str | None = None

class AuthTokenPayload(BaseModel):
    sub: str
    email: EmailStr | None = None
    name: str | None = None