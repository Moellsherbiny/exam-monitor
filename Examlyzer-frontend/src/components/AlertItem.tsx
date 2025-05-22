// src/components/AlertItem.tsx
import React from 'react';
import { Alert, Button, Row, Col } from 'react-bootstrap';
import { Alert as AlertType } from '../types/types';

interface AlertItemProps {
  alert: AlertType;
  onConfirm: (id: string) => void;
  onDismiss: (id: string) => void;
  onViewDetails: (alert: AlertType) => void;
}

const AlertItem: React.FC<AlertItemProps> = ({ alert, onConfirm, onDismiss, onViewDetails }) => {
  const getBehaviorText = () => {
    switch (alert.behaviorType) {
      case 'multiple_faces':
        return 'تم اكتشاف أكثر من وجه في الكاميرا';
      case 'looking_away':
        return 'تم اكتشاف انحراف النظر عن الشاشة';
      default:
        return 'تم اكتشاف سلوك مشبوه';
    }
  };

  return (
    <Alert variant="warning" className="mb-3">
      <Row>
        <Col md={8}>
          <h5>{alert.studentName}</h5>
          <p>{getBehaviorText()}</p>
          <small className="text-muted">
            {alert.timestamp.toLocaleTimeString()}
          </small>
        </Col>
        <Col md={4} className="d-flex align-items-center justify-content-end">
          <Button
            variant="outline-danger"
            size="sm"
            className="me-2"
            onClick={() => onConfirm(alert.id)}
          >
            تأكيد
          </Button>
          <Button
            variant="outline-success"
            size="sm"
            className="me-2"
            onClick={() => onDismiss(alert.id)}
          >
            تجاهل
          </Button>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => onViewDetails(alert)}
          >
            عرض
          </Button>
        </Col>
      </Row>
    </Alert>
  );
};

export default AlertItem;