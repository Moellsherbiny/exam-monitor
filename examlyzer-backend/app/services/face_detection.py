import cv2
import numpy as np
from collections import deque
import time

class CheatingDetector:
    def __init__(self):
        # Load Haar cascades for face and eye detection
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
        
        # Movement detection parameters
        self.prev_frame = None
        self.movement_threshold = 500000  # Adjusted threshold for significant movement
        self.movement_history = deque(maxlen=15)  # Using deque for efficient history tracking
        self.stable_history = deque(maxlen=30)  # Track stability over longer period
        
        # Frame processing parameters
        self.resize_factor = 0.5  # Reduce processing load
        self.min_face_size = (100, 100)  # Minimum face size to consider
        
        # Movement detection enhancements
        self.consecutive_movement_frames = 0
        self.consecutive_stable_frames = 0
        self.movement_confirmation_threshold = 5  # Need 5 consecutive frames with movement
        self.stability_confirmation_threshold = 10  # Need 10 stable frames to reset
        
        # Eye detection parameters
        self.min_eye_detections = 1  # Minimum eyes to detect
        self.eye_detection_failures = 0
        self.max_eye_failures = 5  # Allowed consecutive eye detection failures
        
        # Performance tracking
        self.frame_count = 0
        self.start_time = time.time()
        
        # Cheating state tracking
        self.cheating_state = {
            'multiple_faces': False,
            'no_face': False,
            'no_eyes': False,
            'excessive_movement': False
        }

    def analyze_frame(self, image_data: bytes) -> dict:
        # Start frame processing timer
        frame_start_time = time.time()
        
        # Convert bytes to numpy array and decode image
        try:
            nparr = np.frombuffer(image_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                raise ValueError("Invalid image data")
        except Exception as e:
            return {
                "error": f"Image decoding failed: {str(e)}",
                "is_cheating": False,
                "reason": "Invalid frame"
            }
        
        # Resize for faster processing
        img = cv2.resize(img, (0, 0), fx=self.resize_factor, fy=self.resize_factor)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply histogram equalization for better detection
        gray = cv2.equalizeHist(gray)
        
        # Initialize results dictionary
        results = {
            "is_cheating": False,
            "reason": "",
            "details": {
                "face_count": 0,
                "eyes_detected": 0,
                "movement_level": 0,
                "movement_percentage": 0.0,
                "processing_time": 0,
                "fps": 0
            },
            "warnings": []
        }

        try:
            # Face detection with optimized parameters
            faces = self.face_cascade.detectMultiScale(
                gray, 
                scaleFactor=1.05,  # More sensitive scaling
                minNeighbors=6,    # More strict neighbor count
                minSize=self.min_face_size,
                flags=cv2.CASCADE_SCALE_IMAGE
            )
            results["details"]["face_count"] = len(faces)
            
            # Multiple faces detection
            if len(faces) > 1:
                self.cheating_state['multiple_faces'] = True
                results.update({
                    "is_cheating": True,
                    "reason": "Multiple faces detected",
                })
                results["warnings"].append(f"Detected {len(faces)} faces in frame")
            else:
                self.cheating_state['multiple_faces'] = False
            
            # No face detection
            if len(faces) == 0:
                self.cheating_state['no_face'] = True
                results.update({
                    "is_cheating": True,
                    "reason": "No face detected",
                })
                results["warnings"].append("No face detected in frame")
            else:
                self.cheating_state['no_face'] = False
                
                # Eye detection within the main face (largest face if multiple)
                (x, y, w, h) = max(faces, key=lambda f: f[2]*f[3])  # Get largest face
                roi_gray = gray[y:y+h, x:x+w]
                
                # Detect eyes with more stringent parameters
                eyes = self.eye_cascade.detectMultiScale(
                    roi_gray,
                    scaleFactor=1.1,
                    minNeighbors=5,
                    minSize=(30, 30)
                )
                results["details"]["eyes_detected"] = len(eyes)
                
                # Eye detection failure tracking
                if len(eyes) < self.min_eye_detections:
                    self.eye_detection_failures += 1
                    if self.eye_detection_failures >= self.max_eye_failures:
                        self.cheating_state['no_eyes'] = True
                        results.update({
                            "is_cheating": True,
                            "reason": "Eyes not detected consistently",
                        })
                        results["warnings"].append(f"Eye detection failed for {self.eye_detection_failures} consecutive frames")
                else:
                    self.eye_detection_failures = 0
                    self.cheating_state['no_eyes'] = False

            # Enhanced movement detection
            if self.prev_frame is not None:
                movement_level, movement_percentage = self.detect_movement(self.prev_frame, gray)
                results["details"]["movement_level"] = movement_level
                results["details"]["movement_percentage"] = movement_percentage
                
                # Update movement history
                self.movement_history.append(movement_level)
                self.stable_history.append(movement_level < self.movement_threshold)
                
                # Calculate smoothed movement using weighted average
                weights = np.linspace(0.1, 1.0, len(self.movement_history))
                avg_movement = np.average(list(self.movement_history), weights=weights)
                
                # Check for consecutive movement frames
                if movement_level > self.movement_threshold:
                    self.consecutive_movement_frames += 1
                    self.consecutive_stable_frames = 0
                else:
                    self.consecutive_movement_frames = max(0, self.consecutive_movement_frames - 1)
                    self.consecutive_stable_frames += 1
                
                # Only flag cheating if we have consistent movement
                if (self.consecutive_movement_frames >= self.movement_confirmation_threshold and 
                    avg_movement > self.movement_threshold):
                    self.cheating_state['excessive_movement'] = True
                    results.update({
                        "is_cheating": True,
                        "reason": "Excessive movement detected",
                    })
                    results["warnings"].append(f"Sustained movement over {self.consecutive_movement_frames} frames")
                elif self.consecutive_stable_frames >= self.stability_confirmation_threshold:
                    self.cheating_state['excessive_movement'] = False

            # Update previous frame
            self.prev_frame = gray.copy()
            
            # Determine overall cheating state
            cheating_reasons = [k for k, v in self.cheating_state.items() if v]
            if cheating_reasons:
                results.update({
                    "is_cheating": True,
                    "reason": ", ".join(cheating_reasons)
                })

            # Update frame count and calculate FPS
            self.frame_count += 1
            elapsed_time = time.time() - self.start_time
            results["details"]["fps"] = self.frame_count / elapsed_time if elapsed_time > 0 else 0
            
        except Exception as e:
            print(f"Analysis error: {e}")
            results["error"] = str(e)
            results["is_cheating"] = False  # Default to not cheating on error
        
        # Record processing time
        results["details"]["processing_time"] = time.time() - frame_start_time
        
        return results

    def detect_movement(self, prev_frame, current_frame):
        # Compute absolute difference between frames
        diff = cv2.absdiff(prev_frame, current_frame)
        
        # Apply Gaussian blur to reduce noise
        blur = cv2.GaussianBlur(diff, (5, 5), 0)
        
        # Adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            blur, 255, 
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 
            11, 2
        )
        
        # Morphological operations to clean up the thresholded image
        kernel = np.ones((3, 3), np.uint8)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=1)
        
        # Calculate movement metrics
        movement_pixels = np.sum(thresh) / 255  # Count of changed pixels
        total_pixels = thresh.shape[0] * thresh.shape[1]
        movement_percentage = (movement_pixels / total_pixels) * 100
        
        # Apply non-linear scaling to emphasize larger movements
        movement_score = int(movement_pixels * (1 + movement_percentage/100))
        
        return movement_score, movement_percentage

    def reset(self):
        """Reset the detector's state between different videos or sessions"""
        self.prev_frame = None
        self.movement_history.clear()
        self.stable_history.clear()
        self.consecutive_movement_frames = 0
        self.consecutive_stable_frames = 0
        self.eye_detection_failures = 0
        self.frame_count = 0
        self.start_time = time.time()
        self.cheating_state = {
            'multiple_faces': False,
            'no_face': False,
            'no_eyes': False,
            'excessive_movement': False
        }
        
    def get_performance_metrics(self):
        """Return performance metrics"""
        elapsed_time = time.time() - self.start_time
        return {
            "total_frames": self.frame_count,
            "elapsed_time": elapsed_time,
            "fps": self.frame_count / elapsed_time if elapsed_time > 0 else 0,
            "movement_history": list(self.movement_history),
            "current_state": self.cheating_state
        }


# Global instance
cheating_detector = CheatingDetector()