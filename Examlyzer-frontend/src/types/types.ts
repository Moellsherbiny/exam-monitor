// src/types/types.ts
export interface Alert {
  id: string;
  studentId: string;
  studentName: string;
  examId: string;
  behaviorType: "multiple_faces" | "looking_away" | "phone_detected" | "other";
  timestamp: Date;
  imageUrl: string;
  status: "pending" | "confirmed" | "dismissed";
}

export interface Student {
  id: string;
  name: string;
  examId: string;
  connectionStatus: "connected" | "disconnected";
  lastActivity: Date;
}

export interface Exam {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  status: "scheduled" | "ongoing" | "completed";
}
