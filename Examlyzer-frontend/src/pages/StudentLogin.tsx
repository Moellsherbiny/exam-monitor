import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card } from 'react-bootstrap';
import '../Login.css';
import { useNavigate } from 'react-router-dom';
const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('الرجاء إدخال اسم المستخدم وكلمة المرور.');
      return;
    }
    navigate(`/exam/${username}`);
  };

  return (
    <div className="login-bg d-flex align-items-center justify-content-center vh-100">
      <Container>
        <Row className="align-items-center">
          <Col md={6} className="mb-4 mb-md-0 text-light animate__animated animate__fadeInLeft">
            <h1 className="mb-3">نظام كشف الغش</h1>
            <p className="lead">
              ضمن مشروع تخرج بكلية التربية النوعية - جامعة دمياط. سيتم استخدام نظام كشف الغش في الامتحانات من خلال تحليل سلوك الطلاب باستخدام الذكاء الاصطناعي.
            </p>

          </Col>

          <Col md={6}>
            <Card className="p-4 shadow-lg animate__animated animate__fadeInUp rounded-4 glass-card">
              <h4 className="text-center mb-4">تسجيل الدخول</h4>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                  <Form.Label>اسم المستخدم</Form.Label>
                  <Form.Control type="text" value={username} onChange={e => setUsername(e.target.value)} required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>كلمة المرور</Form.Label>
                  <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>الدور</Form.Label>
                </Form.Group>

                <Button type="submit" variant="primary" className="w-100">دخول</Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
