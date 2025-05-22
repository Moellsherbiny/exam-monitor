import React, { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { motion } from "framer-motion";

const AdminLoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/admin/login', new URLSearchParams({
        username,
        password,
      }));
      login(res.data.access_token);
    } catch {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <Row>
        <Col>
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="shadow-lg p-4 rounded-4" style={{ width: '24rem' }}>
              <Card.Body>
                <Card.Title className="text-center mb-4 fs-3 fw-bold text-primary">
                  تسجيل دخول المسؤول
                </Card.Title>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleLogin} dir="rtl"> {/* Added dir="rtl" to the form */}
                  <Form.Group className="mb-3" controlId="formUsername">
                    <Form.Label>اسم المستخدم</Form.Label>
                    <Form.Control
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="أدخل اسم المستخدم"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label>كلمة المرور</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="أدخل كلمة المرور"
                      required
                    />
                  </Form.Group>

                  <div className="d-grid">
                    <Button variant="primary" type="submit" disabled={loading}>
                      {loading ? <Spinner animation="border" size="sm" /> : "تسجيل الدخول"}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLoginPage;
