from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Optional
from datetime import datetime
from pathlib import Path
from ..services import face_detection
import numpy as np
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
import io
import json
import logging

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

active_students: Dict[str, Dict] = {}
REPORTS_DIR = Path("reports")
REPORTS_DIR.mkdir(exist_ok=True)

class ViolationTracker:
    def __init__(self, max_violations: int = 3):
        self.violations = 0
        self.max_violations = max_violations
        self.violation_history = []
        self.last_violation_time = None
        
    def add_violation(self, reason: str, details: dict):
        self.violations += 1
        violation_record = {
            "timestamp": datetime.now().isoformat(),
            "reason": reason,
            "details": details
        }
        self.violation_history.append(violation_record)
        self.last_violation_time = datetime.now()
        return self.violations
        
    def should_terminate(self) -> bool:
        return self.violations >= self.max_violations
        
    def time_since_last_violation(self) -> Optional[float]:
        if self.last_violation_time is None:
            return None
        return (datetime.now() - self.last_violation_time).total_seconds()

@router.websocket("/monitor/{student_id}/{exam_id}")
async def websocket_endpoint(websocket: WebSocket, student_id: str, exam_id: str):
    await websocket.accept()
    tracker = ViolationTracker(max_violations=3)
    is_closed = False
    
    try:
        # Register student as active
        active_students[student_id] = {
            "exam_id": exam_id,
            "start_time": datetime.now(),
            "status": "monitoring"
        }
        
        logger.info(f"Started monitoring student {student_id} for exam {exam_id}")
        
        while True:
            try:
                data = await websocket.receive_bytes()
                result = face_detection.cheating_detector.analyze_frame(data)

                # Convert NumPy types to native Python types for JSON serialization
                result["details"] = {
                    k: int(v) if isinstance(v, (np.integer, np.uint64)) else 
                       float(v) if isinstance(v, (np.floating, float)) else 
                       v for k, v in result.get("details", {}).items()
                }

                if result["is_cheating"]:
                    violations = tracker.add_violation(result["reason"], result["details"])
                    
                    # Send warning with violation count
                    warning_msg = (f"Violation {violations}/{tracker.max_violations}: "
                                f"{result['reason']}")
                    
                    await websocket.send_json({
                        "type": "warning",
                        "message": warning_msg,
                        "violation_count": violations,
                        "details": result["details"],
                        "timestamp": datetime.now().isoformat()
                    })
                    
                    logger.warning(f"Student {student_id} violation {violations}: {result['reason']}")
                    
                    # Check if we should terminate the exam
                    if tracker.should_terminate():
                        termination_reason = (f"Exam terminated due to {violations} "
                                        f"cheating violations")
                        
                        # Generate violation report
                        report_data = {
                            "student_id": student_id,
                            "exam_id": exam_id,
                            "violations": tracker.violation_history,
                            "termination_time": datetime.now().isoformat()
                        }
                        
                        # Save report to file
                        report_path = REPORTS_DIR / f"violation_{student_id}_{exam_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                        with open(report_path, "w") as f:
                            json.dump(report_data, f, indent=2)
                        
                        # Send termination notice
                        await websocket.send_json({
                            "type": "termination",
                            "reason": termination_reason,
                            "violations": violations,
                            "report_path": str(report_path),
                            "timestamp": datetime.now().isoformat()
                        })
                        
                        logger.error(f"Terminating exam for student {student_id}: {termination_reason}")
                        await websocket.close()
                        is_closed = True
                        break
                
                else:
                    # Send regular heartbeat with status
                    await websocket.send_json({
                        "type": "status",
                        "message": "Monitoring normal",
                        "violation_count": tracker.violations,
                        "timestamp": datetime.now().isoformat()
                    })
                    
            except WebSocketDisconnect:
                raise
            except Exception as e:
                logger.error(f"Error processing frame for student {student_id}: {str(e)}")
                await websocket.send_json({
                    "type": "error",
                    "message": "System error processing your video feed",
                    "timestamp": datetime.now().isoformat()
                })

    except WebSocketDisconnect:
        logger.info(f"Student {student_id} disconnected from exam {exam_id}")
    except Exception as e:
        logger.error(f"WebSocket error for student {student_id}: {str(e)}")
    finally:
        # Clean up
        if student_id in active_students:
            del active_students[student_id]
            
        if not is_closed:
            try:
                await websocket.close()
            except RuntimeError:
                pass  # Already closed
                
        logger.info(f"Ended monitoring session for student {student_id}")

def generate_pdf_report(student_id: str, exam_id: str, violations: list) -> Path:
    """Generate a PDF violation report"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = REPORTS_DIR / f"violation_{student_id}_{exam_id}_{timestamp}.pdf"
    
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Add report header
    c.setFont("Helvetica-Bold", 16)
    c.drawString(72, height - 72, f"Exam Violation Report")
    c.setFont("Helvetica", 12)
    c.drawString(72, height - 92, f"Student ID: {student_id}")
    c.drawString(72, height - 112, f"Exam ID: {exam_id}")
    c.drawString(72, height - 132, f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Add violations
    y_position = height - 172
    c.setFont("Helvetica-Bold", 14)
    c.drawString(72, y_position, "Violations:")
    y_position -= 30
    
    for i, violation in enumerate(violations, 1):
        c.setFont("Helvetica-Bold", 12)
        c.drawString(72, y_position, f"Violation {i}: {violation['reason']}")
        y_position -= 20
        
        c.setFont("Helvetica", 10)
        details = json.dumps(violation['details'], indent=2)
        for line in details.split('\n'):
            if y_position < 100:
                c.showPage()
                y_position = height - 72
            c.drawString(80, y_position, line)
            y_position -= 15
        
        y_position -= 10
    
    c.save()
    
    with open(report_path, "wb") as f:
        f.write(buffer.getvalue())
    
    return report_path