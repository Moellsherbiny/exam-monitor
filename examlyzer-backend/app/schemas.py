from typing import Optional
from pydantic import BaseModel, EmailStr

class StudentLogin(BaseModel):
    email: EmailStr
    password: str

class StudentBase(BaseModel):
    full_name: str
    username: str
    email: EmailStr
    student_image: Optional[str] = None
    
class StudentCreate(StudentBase):
    password: str

class StudentOut(StudentBase):
    id: int

    class Config:
        from_attributes = True
