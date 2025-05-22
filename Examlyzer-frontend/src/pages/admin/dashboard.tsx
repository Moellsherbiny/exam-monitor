import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { Table } from 'react-bootstrap'; // Import Table for displaying reports
import { PlusCircle, FileText, PlayCircle } from 'lucide-react'; // Import icons
import { motion } from 'framer-motion';

// Interface for Student Data
interface Student {
  full_name: string;
  username: string;
  email: string;
  password?: string; // Password should not be displayed, but needed for adding
  image?: string; // Optional image URL
}

// --- Add Student Page Component ---
const AddStudentPage = () => {
  const [newStudent, setNewStudent] = useState<Student>({
    full_name: '',
    username: '',
    email: '',
    password: '', // Add password field
    image: '',
  });
  const [students, setStudents] = useState<Student[]>([]); // State to hold student data
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStudent({ ...newStudent, [name]: value });
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation (you can add more robust validation)
    if (!newStudent.full_name || !newStudent.username || !newStudent.email || !newStudent.password) {
      setErrorMessage('الرجاء ملء جميع الحقول.');
      setSuccessMessage(null);
      return;
    }

    // Email format validation (simple check)
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(newStudent.email)) {
      setErrorMessage('الرجاء إدخال بريد إلكتروني صحيح.');
      setSuccessMessage(null);
      return;
    }

    // Simulate adding student (in real app, you'd send to a server)
    setStudents([...students, newStudent]); // Add to local state
    setNewStudent({ // Clear form
      full_name: '',
      username: '',
      email: '',
      password: '',
      image: '',
    });
    setSuccessMessage('تم إضافة الطالب بنجاح.');
    setErrorMessage(null);
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-md p-4"
          >
            <h2 className="text-center mb-4 text-primary">
              <PlusCircle className="mr-2" size={30} />
              إضافة طالب جديد
            </h2>
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            <Form onSubmit={handleAddStudent} dir="rtl">
              <Form.Group className="mb-3" controlId="formFullName">
                <Form.Label>الاسم الكامل</Form.Label>
                <Form.Control
                  type="text"
                  name="full_name"
                  value={newStudent.full_name}
                  onChange={handleInputChange}
                  placeholder="أدخل الاسم الكامل"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formUsername">
                <Form.Label>اسم المستخدم</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={newStudent.username}
                  onChange={handleInputChange}
                  placeholder="أدخل اسم المستخدم"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>البريد الإلكتروني</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={newStudent.email}
                  onChange={handleInputChange}
                  placeholder="أدخل البريد الإلكتروني"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label>كلمة المرور</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={newStudent.password || ''} // keep empty
                  onChange={handleInputChange}
                  placeholder="أدخل كلمة المرور"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formImage">
                <Form.Label>الصورة (اختياري)</Form.Label>
                <Form.Control
                  type="text"
                  name="image"
                  value={newStudent.image || ''}
                  onChange={handleInputChange}
                  placeholder="أدخل رابط الصورة"
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100">
                إضافة الطالب
              </Button>
            </Form>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

// --- Student Reports Page Component ---
const StudentReportsPage = () => {
  const [students] = useState<Student[]>([ // Mock student data for demonstration
    { full_name: 'أحمد محمد', username: 'ahmed123', email: 'ahmed@example.com', image: 'https://via.placeholder.com/150' },
    { full_name: 'ليلى علي', username: 'laila456', email: 'laila@example.com', image: 'https://via.placeholder.com/150' },
    { full_name: 'خالد محمود', username: 'khaled789', email: 'khaled@example.com', image: 'https://via.placeholder.com/150' },
    { full_name: 'فاطمة حسين', username: 'fatima246', email: 'fatima@example.com', image: 'https://via.placeholder.com/150' },
  ]);

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-md p-4"
          >
            <h2 className="text-center mb-4 text-primary">
              <FileText className="mr-2" size={30} />
              تقارير الطلاب
            </h2>
            <Table striped bordered hover responsive dir="rtl">
              <thead>
                <tr>
                  <th>الصورة</th>
                  <th>الاسم الكامل</th>
                  <th>اسم المستخدم</th>
                  <th>البريد الإلكتروني</th>
                  {/* Add more report-related columns as needed */}
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={index}>
                    <td>
                      {student.image ? (
                        <img src={student.image} alt={student.full_name} className="rounded-circle" style={{ width: '50px', height: '50px' }} />
                      ) : (
                        'لا يوجد صورة'
                      )}
                    </td>
                    <td>{student.full_name}</td>
                    <td>{student.username}</td>
                    <td>{student.email}</td>
                    {/* Add more report-related data here */}
                  </tr>
                ))}
              </tbody>
            </Table>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

// --- Start Exam Page Component ---
const StartExamPage = () => {
  const handleStartExam = () => {
    // Implement exam starting logic here (e.g., redirect to exam page)
    alert('سيتم بدء الاختبار قريبًا...');
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-md p-4 text-center"
          >
            <h2 className="mb-4 text-primary">
              <PlayCircle className="mr-2" size={30} />
              بدء الاختبار
            </h2>
            <p className="mb-4">
              اضغط على الزر لبدء الاختبار.
            </p>
            <Button variant="success" onClick={handleStartExam} size="lg">
              ابدأ الاختبار الآن
            </Button>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

// --- Main App Component (Router) ---
const AdminPanel = () => {
  const [activePage, setActivePage] = useState<'add' | 'reports' | 'exam'>('add');

  return (
    <div className="d-flex">
      {/* Sidebar Navigation */}
      <div
        className="bg-light border-end"
        style={{ width: '250px', minHeight: '100vh' }}
        dir="rtl" // Set the direction to right-to-left
      >
        <div className="p-3">
          <h1 className="h4 mb-4 text-center">لوحة تحكم المسؤول</h1>
          <ul className="list-unstyled">
            <li className="mb-2">
              <Button
                variant={activePage === 'add' ? 'primary' : 'outline-primary'}
                className="w-100 text-right" // Use text-right for right alignment
                onClick={() => setActivePage('add')}
              >
                <PlusCircle className="ml-2" size={20} /> {/* Use ml-2 for left margin */}
                إضافة طالب
              </Button>
            </li>
            <li className="mb-2">
              <Button
                variant={activePage === 'reports' ? 'primary' : 'outline-primary'}
                className="w-100 text-right"
                onClick={() => setActivePage('reports')}
              >
                <FileText className="ml-2" size={20} />
                تقارير الطلاب
              </Button>
            </li>
            <li className="mb-2">
              <Button
                variant={activePage === 'exam' ? 'primary' : 'outline-primary'}
                className="w-100 text-right"
                onClick={() => setActivePage('exam')}
              >
                <PlayCircle className="ml-2" size={20} />
                بدء الاختبار
              </Button>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow-1">
        {activePage === 'add' && <AddStudentPage />}
        {activePage === 'reports' && <StudentReportsPage />}
        {activePage === 'exam' && <StartExamPage />}
      </div>
    </div>
  );
};

export default AdminPanel;
