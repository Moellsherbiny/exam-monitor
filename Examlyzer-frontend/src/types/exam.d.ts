interface Question {
  id: string;
  text: string;
  options?: string[];
  correctAnswer: string | string[];
  type: 'multiple-choice' | 'complete' | 'correct-incorrect';
  // ... other question properties
}

interface ExamDetails {
  id: string;
  name: string;
  questions: Question[];
  // ... other exam details
}

interface StudentDetails {
  id: string;
  name: string;
  // ... other student details
}