import React from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import '../Dashboard.css';

const StudentDashboard: React.FC = () => {
  return (
    <div className="dashboard-bg d-flex align-items-center justify-content-center vh-100">
      <Container>
        <Row className="justify-content-center text-center animate__animated animate__fadeIn">
          <Col md={8}>
            <Card className="p-4 glass-card shadow-lg rounded-4">
              <h2 className="mb-3">مرحبًا بك في بوابة الطالب</h2>
              <p className="mb-4">
                يمكنك الآن بدء الامتحان أو استعراض نتائجك السابقة.
              </p>
              <div className="d-flex gap-3 justify-content-center">
                <Button variant="primary" href="/student/exam">بدء الامتحان</Button>
                <Button variant="outline-light" href="/student/results">عرض النتائج</Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default StudentDashboard;
