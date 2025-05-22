# reports.py (backend)
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
import json
from datetime import datetime
from typing import List, Dict
import os

router = APIRouter()

REPORTS_DIR = Path("reports")
REPORTS_DIR.mkdir(exist_ok=True)

class Report:
    def __init__(self, file_path: Path):
        self.file_path = file_path
        self._data = None
    
    @property
    def data(self) -> Dict:
        if self._data is None:
            with open(self.file_path, 'r') as f:
                self._data = json.load(f)
        return self._data
    
    @property
    def student_id(self) -> str:
        return self.data.get('student_id', '')
    
    @property
    def exam_id(self) -> str:
        return self.data.get('exam_id', '')
    
    @property
    def timestamp(self) -> datetime:
        return datetime.fromisoformat(self.data.get('termination_time', datetime.now().isoformat()))
    
    @property
    def violation_count(self) -> int:
        return len(self.data.get('violations', []))

@router.get("/reports", response_model=List[Dict])
async def list_reports():
    """List all available reports"""
    reports = []
    for file in REPORTS_DIR.glob("*.json"):
        try:
            report = Report(file)
            reports.append({
                "filename": file.name,
                "student_id": report.student_id,
                "exam_id": report.exam_id,
                "timestamp": report.timestamp.isoformat(),
                "violation_count": report.violation_count,
                "size": file.stat().st_size
            })
        except Exception as e:
            print(f"Error loading report {file}: {e}")
    
    # Sort by timestamp (newest first)
    return sorted(reports, key=lambda x: x['timestamp'], reverse=True)

@router.get("/reports/{filename}")
async def get_report(filename: str):
    """Get detailed report data"""
    file_path = REPORTS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Report not found")
    
    try:
        return Report(file_path).data
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error loading report: {str(e)}")

@router.get("/reports/{filename}/download")
async def download_report(filename: str):
    """Download report file"""
    file_path = REPORTS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Report not found")
    return FileResponse(file_path, filename=filename)

@router.delete("/reports/{filename}")
async def delete_report(filename: str):
    """Delete a report"""
    file_path = REPORTS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Report not found")
    
    try:
        file_path.unlink()
        return {"status": "success", "message": f"Report {filename} deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting report: {str(e)}")