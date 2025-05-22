from fastapi import APIRouter
from fastapi.responses import JSONResponse
import cv2
import numpy as np
import requests

router = APIRouter()

ESP32_CAM_URL = "http://192.168.137.216/cam-hi.jpg"  
@router.get("/count_people/")
def count_people():
    try:
        # Step 1: Fetch image from ESP32
        response = requests.get(ESP32_CAM_URL, timeout=5)
        image_array = np.frombuffer(response.content, np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

        # Step 2: People detection using HOG + SVM
        hog = cv2.HOGDescriptor()
        hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
        boxes, _ = hog.detectMultiScale(image, winStride=(8, 8))

        return JSONResponse(content={
            "people_count": len(boxes),
            "status": "success"
        })

    except Exception as e:
        return JSONResponse(status_code=500, content={
            "error": str(e),
            "status": "failed"
        })
