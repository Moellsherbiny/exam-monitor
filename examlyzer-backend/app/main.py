from fastapi import Depends, FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from .database import Base, engine
from .routes import students, websocket , reports, count_people
from .services.auth import authenticate_admin, create_access_token
import uvicorn

Base.metadata.create_all(bind=engine)
app = FastAPI(
    title="Examlyzer - Remote Exam Monitoring System",
    description="Graduation Project for monitoring students during online exams using AI.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ممكن تحدد الدومين بتاع الواجهة بدل * لو حابب
    # allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/admin/login")
def login_teacher(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_admin(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    access_token = create_access_token(data=user)
    return {"access_token": access_token, "token_type": "bearer"}

@app.websocket("/ws/echo/{student_id}")
async def websocket_endpoint(websocket: WebSocket, student_id: int):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            print(f"Message from student {student_id}: {data}")
            if data == "close":
                await websocket.close()
                break
            if data == "ping":
                await websocket.send_text("pong")
            elif data == "hello":
                await websocket.send_text("Hello!")
            elif data == "goodbye":
                await websocket.send_text("Goodbye!")
            else:
                await websocket.send_text("Unknown command")

            await websocket.send_text(f"Message text was: {data}")
    except WebSocketDisconnect:
        print(f"Student {student_id} disconnected")
    except Exception as e:
        print(f"Error: {e}")

app.include_router(websocket.router, prefix="/ws", tags=["WebSocket"])
app.include_router(students.router, prefix="/api", tags=["Students"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])
app.include_router(count_people.router, prefix="/api", tags=["Count People"])
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
