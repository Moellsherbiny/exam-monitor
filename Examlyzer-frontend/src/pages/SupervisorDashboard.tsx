import React from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import '../Dashboard.css';

const SupervisorDashboard: React.FC = () => {
  return (
    <div className="dashboard-bg d-flex align-items-center justify-content-center vh-100">
      <Container>
        <Row className="justify-content-center text-center animate__animated animate__fadeIn">
          <Col md={8}>
            <Card className="p-4 glass-card shadow-lg rounded-4">
              <h2 className="mb-3">مرحبًا بك في بوابة المشرف</h2>
              <p className="mb-4">
                يمكنك إدارة الطلاب، مراجعة الامتحانات، وتحليل النتائج.
              </p>
              <div className="d-flex gap-3 justify-content-center">
                <Button variant="primary" href="/supervisor/students">قائمة الطلاب</Button>
                <Button variant="outline-light" href="/supervisor/exams">إدارة الامتحانات</Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SupervisorDashboard;
