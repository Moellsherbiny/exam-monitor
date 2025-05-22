import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Button, Container, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: 'user',
};

const StudentView: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStartCamera = () => {
    setCameraStarted(true);
  };

  const handleStartExam = () => {
    setLoading(true);

    // تحقق بسيط من الكاميرا
    if (webcamRef.current && webcamRef.current.video?.readyState === 4) {
      // Simulate some async check like API call
      setTimeout(() => {
        setLoading(false);
        navigate('/exam');
      }, 1000);
    } else {
      alert('يجب تشغيل الكاميرا أولاً قبل بدء الامتحان');
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} className="text-center">
          <h2 className="mb-4">مرحبًا بك في نظام الامتحانات</h2>

          {!cameraStarted ? (
            <Button onClick={handleStartCamera} variant="primary">
              تشغيل الكاميرا
            </Button>
          ) : (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="rounded shadow mt-3"
              />
              <div className="mt-4">
                <Button
                  onClick={handleStartExam}
                  variant="success"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" /> جاري بدء الامتحان...
                    </>
                  ) : (
                    'بدء الامتحان'
                  )}
                </Button>
              </div>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default StudentView;
