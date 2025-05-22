import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Alert as BootstrapAlert, Button, Badge, Modal, Card } from 'react-bootstrap';
import AlertItem from './AlertItem';
import { Alert, Student, Exam } from '../types/types';

const SupervisorDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);

  useEffect(() => {
    // بيانات وهمية للعرض
    const mockAlerts: Alert[] = [
      {
        id: '1',
        studentId: 's123',
        studentName: 'أحمد محمد',
        examId: 'math-2023',
        behaviorType: 'multiple_faces',
        timestamp: new Date(),
        imageUrl: 'https://via.placeholder.com/300x200?text=Multiple+Faces+Detected',
        status: 'pending'
      },
      {
        id: '2',
        studentId: 's124',
        studentName: 'سارة علي',
        examId: 'math-2023',
        behaviorType: 'looking_away',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        imageUrl: 'https://via.placeholder.com/300x200?text=Looking+Away',
        status: 'pending'
      }
    ];

    const mockStudents: Student[] = [
      {
        id: 's123',
        name: 'أحمد محمد',
        examId: 'math-2023',
        connectionStatus: 'connected',
        lastActivity: new Date()
      },
      {
        id: 's124',
        name: 'سارة علي',
        examId: 'math-2023',
        connectionStatus: 'connected',
        lastActivity: new Date(Date.now() - 1000 * 60 * 3)
      }
    ];

    const mockExams: Exam[] = [
      {
        id: 'math-2023',
        name: 'امتحان الرياضيات النهائي',
        startTime: new Date(),
        endTime: new Date(Date.now() + 1000 * 60 * 90),
        status: 'ongoing'
      }
    ];

    setAlerts(mockAlerts);
    setStudents(mockStudents);
    setExams(mockExams);
  }, []);

  const handleConfirmCheating = (alertId: string) => {
    setAlerts(alerts.map(alert =>
      alert.id === alertId ? { ...alert, status: 'confirmed' } : alert
    ));
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts(alerts.map(alert =>
      alert.id === alertId ? { ...alert, status: 'dismissed' } : alert
    ));
  };

  const handleViewAlertDetails = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowAlertModal(true);
  };

  return (
    <Container fluid className="mt-3">
      <Row className="mb-4">
        <Col>
          <h2>لوحة مراقبة الامتحانات</h2>
          <BootstrapAlert variant="info">
            يتم مراقبة {students.length} طالب في {exams.length} امتحان نشط
          </BootstrapAlert>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <h4 className="mb-3">تنبيهات الغش الحديثة</h4>
          <div className="alerts-container" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {alerts.filter(a => a.status === 'pending').length > 0 ? (
              alerts
                .filter(a => a.status === 'pending')
                .map(alert => (
                  <AlertItem
                    key={alert.id}
                    alert={alert}
                    onConfirm={handleConfirmCheating}
                    onDismiss={handleDismissAlert}
                    onViewDetails={handleViewAlertDetails}
                  />
                ))
            ) : (
              <BootstrapAlert variant="success">
                لا توجد تنبيهات غش جديدة
              </BootstrapAlert>
            )}
          </div>

          <h4 className="mt-4 mb-3">سجل التنبيهات</h4>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>الطالب</th>
                <th>نوع السلوك</th>
                <th>الوقت</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map(alert => (
                <tr key={alert.id}>
                  <td>{alert.studentName}</td>
                  <td>
                    <Badge bg={
                      alert.behaviorType === 'multiple_faces' ? 'danger' :
                        alert.behaviorType === 'looking_away' ? 'warning' : 'secondary'
                    }>
                      {alert.behaviorType === 'multiple_faces' ? 'وجوه متعددة' :
                        alert.behaviorType === 'looking_away' ? 'انحراف النظر' : 'آخر'}
                    </Badge>
                  </td>
                  <td>{alert.timestamp.toLocaleTimeString()}</td>
                  <td>
                    <Badge bg={
                      alert.status === 'confirmed' ? 'danger' :
                        alert.status === 'dismissed' ? 'success' : 'primary'
                    }>
                      {alert.status === 'confirmed' ? 'مؤكد' :
                        alert.status === 'dismissed' ? 'مرفوض' : 'قيد المراجعة'}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleViewAlertDetails(alert)}
                    >
                      التفاصيل
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>

        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>الطلاب المتصلون</Card.Header>
            <Card.Body>
              <div className="students-list">
                {students.map(student => (
                  <div key={student.id} className="d-flex justify-content-between align-items-center mb-2">
                    <span>{student.name}</span>
                    <Badge bg={student.connectionStatus === 'connected' ? 'success' : 'danger'}>
                      {student.connectionStatus === 'connected' ? 'متصل' : 'غير متصل'}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>الامتحانات النشطة</Card.Header>
            <Card.Body>
              {exams.filter(e => e.status === 'ongoing').map(exam => (
                <div key={exam.id} className="mb-3">
                  <h5>{exam.name}</h5>
                  <div>البداية: {exam.startTime.toLocaleTimeString()}</div>
                  <div>النهاية: {exam.endTime.toLocaleTimeString()}</div>
                  <div>
                    الحالة: <Badge bg="info">قيد التنفيذ</Badge>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal لعرض تفاصيل التنبيه */}
      <Modal show={showAlertModal} onHide={() => setShowAlertModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>تفاصيل التنبيه</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAlert && (
            <div>
              <Row>
                <Col md={6}>
                  <h5>معلومات الطالب</h5>
                  <p><strong>الاسم:</strong> {selectedAlert.studentName}</p>
                  <p><strong>رقم الطالب:</strong> {selectedAlert.studentId}</p>
                  <p><strong>الامتحان:</strong> {selectedAlert.examId}</p>
                  <p><strong>الوقت:</strong> {selectedAlert.timestamp.toLocaleString()}</p>
                  <p><strong>نوع السلوك:</strong>
                    <Badge bg={
                      selectedAlert.behaviorType === 'multiple_faces' ? 'danger' :
                        selectedAlert.behaviorType === 'looking_away' ? 'warning' : 'secondary'
                    } className="ms-2">
                      {selectedAlert.behaviorType === 'multiple_faces' ? 'وجوه متعددة' :
                        selectedAlert.behaviorType === 'looking_away' ? 'انحراف النظر' : 'آخر'}
                    </Badge>
                  </p>
                </Col>
                <Col md={6}>
                  <h5>الصورة الملتقطة</h5>
                  <img
                    src={selectedAlert.imageUrl}
                    alt="Evidence"
                    className="img-fluid rounded"
                    style={{ maxHeight: '300px' }}
                  />
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={() => {
              if (selectedAlert) handleConfirmCheating(selectedAlert.id);
              setShowAlertModal(false);
            }}
          >
            تأكيد الغش
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (selectedAlert) handleDismissAlert(selectedAlert.id);
              setShowAlertModal(false);
            }}
          >
            رفض التنبيه
          </Button>
          <Button variant="outline-primary" onClick={() => setShowAlertModal(false)}>
            إغلاق
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SupervisorDashboard;