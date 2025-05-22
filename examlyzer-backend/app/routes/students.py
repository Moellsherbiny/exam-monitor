from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..models import Student
from ..schemas import StudentLogin, StudentOut, StudentCreate
from ..services import auth
from typing import List
from ..database import get_db
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

router = APIRouter(prefix="/students", tags=["Students"])

@router.post("/login")
def student_login(data: StudentLogin, db: Session = Depends(get_db)):
    student = auth.authenticate_student(db, data.email, data.password)
    if not student:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = auth.create_access_token({"sub": student.email})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    # تحقق إن الطالب مش موجود قبل كدا
    db_student = db.query(Student).filter(Student.email == student.email).first()
    if db_student:
        raise HTTPException(status_code=400, detail="Student already exists")
    hashed_pw = get_password_hash(student.password)
    new_student = Student(full_name=student.full_name,
                          username=student.username,
                          student_image=student.student_image,
                          email=student.email,
                          hashed_password=hashed_pw)
    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return new_student