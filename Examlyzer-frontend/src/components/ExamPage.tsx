/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import { Container, Card, Button, Form, ProgressBar, Badge } from 'react-bootstrap';
import ExamMonitor from './ExamMonitor';
import { useParams, useNavigate } from 'react-router-dom';

// تعريف أنواع الأسئلة بشكل موسع
type QuestionBase = {
  id: string;
  text: string;
  explanation?: string;
  points: number;
};

type MultipleChoiceQuestion = QuestionBase & {
  type: 'multiple-choice';
  options: { id: string; text: string }[];
  correctAnswer: string;
};

type TrueFalseQuestion = QuestionBase & {
  type: 'true-false';
  correctAnswer: boolean;
};

type FillInBlankQuestion = QuestionBase & {
  type: 'fill-in-blank';
  blanks: { id: string; correctAnswer: string }[];
  userAnswers?: string[];
};

type EssayQuestion = QuestionBase & {
  type: 'essay';
  maxLength: number;
};

type Question = MultipleChoiceQuestion | TrueFalseQuestion | FillInBlankQuestion | EssayQuestion;

type ExamDetails = {
  id: string;
  name: string;
  duration: number; // بالدقائق
  instructions: string[];
  passingScore: number;
  questions: Question[];
};

type UserAnswers = {
  [questionId: string]: string | boolean | string[] | undefined;
};

const TakeExamPage = () => {
  const [exam, setExam] = useState<ExamDetails | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [examState, setExamState] = useState<'instructions' | 'active' | 'results' | 'review'>('instructions');
  const [score, setScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { examId } = useParams();
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const monitorRef = useRef<HTMLDivElement>(null);

  // تحميل بيانات الاختبار
  useEffect(() => {
    const loadExam = async () => {
      // هنا يمكنك استبدال هذا بطلب API فعلي
      const mockExam: ExamDetails = {
        id: examId || 'default',
        name: 'اختبار أساسيات البرمجة',
        duration: 10,
        passingScore: 70,
        instructions: [
          'اقرأ كل سؤال بعناية قبل الإجابة',
          'لديك 10 دقيقة لإكمال الاختبار',
          'لا يمكنك العودة إلى الأسئلة السابقة بعد الإجابة عليها',
          'سيتم مراقبة جلسة الاختبار عبر الكاميرا',
        ],
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            text: 'ما هو نوع البيانات الذي يستخدم لتخزين القيم المنطقية في JavaScript؟',
            points: 1,
            options: [
              { id: 'opt1', text: 'string' },
              { id: 'opt2', text: 'number' },
              { id: 'opt3', text: 'boolean' },
              { id: 'opt4', text: 'object' }
            ],
            correctAnswer: 'opt3',
            explanation: 'يستخدم النوع boolean لتخزين القيم المنطقية (true/false)'
          },
          {
            id: 'q2',
            type: 'true-false',
            text: 'يمكن استخدام حلقة for لتكرار تنفيذ كتلة من التعليمات البرمجية',
            points: 1,
            correctAnswer: true
          },
          {
            id: 'q3',
            type: 'fill-in-blank',
            text: 'تستخدم العبارة ______ لإنشاء دالة في JavaScript',
            points: 2,
            blanks: [{ id: 'blank1', correctAnswer: 'function' }]
          },
          {
            id: 'q4',
            type: 'essay',
            text: 'اشرح الفرق بين let و var في JavaScript',
            points: 3,
            maxLength: 500
          }
        ]
      };
      
      setExam(mockExam);
      setTimeLeft(mockExam.duration * 60);
    };

    loadExam();
  }, [examId]);

  // إعداد المؤقت
  useEffect(() => {
    if (examState !== 'active') return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        if (timerRef.current) {
          clearInterval(timerRef.current as NodeJS.Timeout);
        }
      }
    };
  }, [examState]);

  const currentQuestion = exam?.questions[currentQuestionIndex];

  const handleAnswerChange = (value: string | boolean | string[]) => {
    if (!currentQuestion) return;
    
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const startExam = () => {
    setExamState('active');
  };

  const goToNextQuestion = () => {
    if (!exam) return;
    
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    calculateScore();
    setExamState('results');
    if (timerRef.current) {
      if (timerRef.current) {
        clearInterval(timerRef.current as NodeJS.Timeout);
      }
    }
  };

  const handleAutoSubmit = () => {
    calculateScore();
    setExamState('results');
    clearInterval(timerRef.current as NodeJS.Timeout);
  };

  const calculateScore = () => {
    if (!exam) return;

    let correct = 0;
    let total = 0;

    exam.questions.forEach(question => {
      total += question.points;
      
      const userAnswer = userAnswers[question.id];
      
      switch (question.type) {
        case 'multiple-choice':
          if (userAnswer === question.correctAnswer) {
            correct += question.points;
          }
          break;
          
        case 'true-false':
          if (userAnswer === question.correctAnswer) {
            correct += question.points;
          }
          break;
          
        case 'fill-in-blank':
          if (Array.isArray(userAnswer) && 
              userAnswer.length === question.blanks.length &&
              userAnswer.every((ans, i) => 
                ans?.toLowerCase() === question.blanks[i].correctAnswer.toLowerCase())) {
            correct += question.points;
          }
          break;
          
        // الأسئلة المقالية لا يتم تصحيحها تلقائياً
        case 'essay':
          break;
      }
    });

    setScore({ correct, total });
    setIsSubmitting(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'multiple-choice':
        return (
          <div className="mt-4">
            {currentQuestion.options.map(option => (
              <Form.Check
                key={option.id}
                type="radio"
                id={`${currentQuestion.id}-${option.id}`}
                label={option.text}
                name={currentQuestion.id}
                checked={userAnswers[currentQuestion.id] === option.id}
                onChange={() => handleAnswerChange(option.id)}
                className="mb-2"
              />
            ))}
          </div>
        );
        
      case 'true-false':
        return (
          <div className="mt-4">
            <Form.Check
              type="radio"
              label="صحيح"
              name={currentQuestion.id}
              checked={userAnswers[currentQuestion.id] === true}
              onChange={() => handleAnswerChange(true)}
              className="mb-2"
            />
            <Form.Check
              type="radio"
              label="خطأ"
              name={currentQuestion.id}
              checked={userAnswers[currentQuestion.id] === false}
              onChange={() => handleAnswerChange(false)}
            />
          </div>
        );
        
      case 'fill-in-blank':
        return (
          <Form.Control
            type="text"
            value={(userAnswers[currentQuestion.id] as string) || ''}
            onChange={(e) => handleAnswerChange([e.target.value])}
            className="mt-3"
            placeholder="أدخل الإجابة هنا"
          />
        );
        
      case 'essay':
        return (
          <Form.Control
            as="textarea"
            rows={5}
            value={(userAnswers[currentQuestion.id] as string) || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="mt-3"
            placeholder="اكتب إجابتك هنا..."
            maxLength={currentQuestion.maxLength}
          />
        );
    }
  };

  if (!exam) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري التحميل...</span>
        </div>
        <p className="mt-3">جاري تحميل الاختبار...</p>
      </Container>
    );
  }

  if (examState === 'instructions') {
    return (
      <Container className="mt-5" dir="rtl">
        <Card className="shadow">
          <Card.Header className="bg-primary text-white">
            <h2 className="mb-0">تعليمات الاختبار: {exam.name}</h2>
          </Card.Header>
          <Card.Body>
            <div className="mb-4">
              <h5>معلومات الاختبار:</h5>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">عدد الأسئلة: {exam.questions.length}</li>
                <li className="list-group-item">مدة الاختبار: {exam.duration} دقيقة</li>
                <li className="list-group-item">الدرجة النهائية: {exam.questions.reduce((sum, q) => sum + q.points, 0)}</li>
                <li className="list-group-item">الدرجة المطلوبة للنجاح: {exam.passingScore}%</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h5>تعليمات هامة:</h5>
              <ul className="list-group">
                {exam.instructions.map((instruction, idx) => (
                  <li key={idx} className="list-group-item">{idx + 1}. {instruction}</li>
                ))}
              </ul>
            </div>
            
            <div className="d-grid gap-2">
              <Button variant="primary" size="lg" onClick={startExam}>
                بدء الاختبار
              </Button>
              <Button variant="outline-secondary" onClick={() => navigate('/')}>
                الرجوع
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (examState === 'active' && currentQuestion) {
    return (
      <Container className="exam-container" dir="rtl">
        {/* شريط التقدم والوقت */}
        <div className="exam-header sticky-top bg-white py-3 shadow-sm">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">{exam.name}</h4>
            <div className="d-flex align-items-center">
              <Badge bg="warning" className="me-2 fs-6">
                {formatTime(timeLeft)}
              </Badge>
              <ProgressBar 
                now={(currentQuestionIndex + 1) / exam.questions.length * 100} 
                style={{ width: '150px' }} 
                variant="success"
                label={`${currentQuestionIndex + 1}/${exam.questions.length}`}
              />
            </div>
          </div>
        </div>

        {/* نافذة المراقبة */}
        <div ref={monitorRef} className="monitor-window">
          <ExamMonitor studentId="current-student" examId={examId || ''} />
        </div>

        {/* سؤال الاختبار */}
        <Card className="mt-4 shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start">
              <h5 className="question-text mb-4">
                <span className="badge bg-primary me-2">السؤال {currentQuestionIndex + 1}</span>
                {currentQuestion.text}
              </h5>
              <span className="badge bg-secondary">نقاط: {currentQuestion.points}</span>
            </div>

            {renderQuestion()}

            <div className="d-flex justify-content-between mt-5">
              <Button 
                variant="outline-secondary" 
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                disabled={currentQuestionIndex === 0}
              >
                السابق
              </Button>
              
              {currentQuestionIndex < exam.questions.length - 1 ? (
                <Button 
                  variant="primary" 
                  onClick={goToNextQuestion}
                  disabled={!userAnswers[currentQuestion.id]}
                >
                  التالي
                </Button>
              ) : (
                <Button 
                  variant="danger" 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'جاري التصحيح...' : 'إنهاء الاختبار'}
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (examState === 'results') {
    const percentage = Math.round((score.correct / score.total) * 100);
    const isPassed = percentage >= exam.passingScore;
    
    return (
      <Container className="mt-5" dir="rtl">
        <Card className="shadow">
          <Card.Header className={`text-white ${isPassed ? 'bg-success' : 'bg-danger'}`}>
            <h2 className="mb-0">نتائج الاختبار</h2>
          </Card.Header>
          <Card.Body>
            <div className="text-center mb-4">
              <h3 className={isPassed ? 'text-success' : 'text-danger'}>
                {isPassed ? 'مبروك! لقد نجحت في الاختبار' : 'للأسف، لم تحقق النجاح'}
              </h3>
              
              <div className="my-4">
                <ProgressBar 
                  now={percentage} 
                  label={`${percentage}%`} 
                  variant={isPassed ? 'success' : 'danger'} 
                  style={{ height: '30px' }}
                  animated
                />
                <small>الدرجة المطلوبة للنجاح: {exam.passingScore}%</small>
              </div>
              
              <p>
                لقد أجبت بشكل صحيح على <strong>{score.correct}</strong> من أصل <strong>{score.total}</strong> نقطة
              </p>
            </div>
            
            <div className="d-grid gap-2">
              <Button 
                variant="outline-primary" 
                onClick={() => setExamState('review')}
              >
                عرض الإجابات
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => navigate('/')}
              >
                العودة للصفحة الرئيسية
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (examState === 'review') {
    return (
      <Container className="mt-4" dir="rtl">
        <Card className="shadow">
          <Card.Header className="bg-info text-white">
            <h2>مراجعة الإجابات</h2>
          </Card.Header>
          <Card.Body>
            {exam.questions.map((question, idx) => (
              <div key={question.id} className="mb-5">
                <h5>
                  <span className="badge bg-secondary me-2">السؤال {idx + 1}</span>
                  {question.text}
                </h5>
                
                <div className="ps-4 mt-3">
                  <p className="mb-1">
                    <strong>إجابتك:</strong> {JSON.stringify(userAnswers[question.id]) || 'لم يتم الإجابة'}
                  </p>
                  
                  {question.type !== 'essay' && (
                    <p className="mb-1">
                      <strong>الإجابة الصحيحة:</strong> {'correctAnswer' in question 
                        ? JSON.stringify(question.correctAnswer) 
                        : 'يتم تقييمها يدويًا'}
                    </p>
                  )}
                  
                  {question.explanation && (
                    <div className="alert alert-info mt-2">
                      <strong>شرح:</strong> {question.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <Button 
              variant="secondary" 
              onClick={() => navigate('/')}
              className="mt-3"
            >
              العودة للصفحة الرئيسية
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return null;
};

export default TakeExamPage;