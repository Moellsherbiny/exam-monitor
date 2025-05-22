import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';


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

export default AddStudentPage;