from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from ..models import Student, Teacher
from ..database import get_db
from sqlalchemy.orm import Session
from dotenv import load_dotenv

SECRET_KEY = "jghklfdjdslkghfdfigjsidfjsdfjidfjf"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
ADMIN_EMAIL = 'admin'
ADMIN_PASSWORD = 'admin123'

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_student(db: Session, email: str, password: str):
    student = db.query(Student).filter(Student.email == email).first()
    if not student or not verify_password(password, student.hashed_password):
        return None
    return student

def authenticate_admin(email: str, password: str):
    if email == ADMIN_EMAIL and password == ADMIN_PASSWORD:
        return {"role": "admin", "email": email}
    return None

def create_access_token(data: dict):
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def get_current_admin(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not a teacher")
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("id")
        role: str = payload.get("role")

        if user_id is None or role != "teacher":
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    teacher = db.query(Teacher).filter(Teacher.id == user_id).first()
    if teacher is None:
        raise credentials_exception

    return teacher