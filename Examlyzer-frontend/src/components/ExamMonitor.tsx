import React, { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-bootstrap';

interface ExamMonitorProps {
  studentId: string;
  examId: string;
}

interface WarningData {
  type: string;
  message: string;
  violation_count?: number;
  details?: any;
  timestamp?: string;
}

const ExamMonitor: React.FC<ExamMonitorProps> = ({ studentId, examId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('جارٍ الاتصال...');
  const [warnings, setWarnings] = useState<WarningData[]>([]);
  const [isTerminated, setIsTerminated] = useState<boolean>(false);
  const [violationCount, setViolationCount] = useState<number>(0);
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket URL - replace with your actual backend URL
  const websocketUrl = `ws://localhost:8000/ws/monitor/${studentId}/${examId}`;;

  useEffect(() => {
    // Initialize WebSocket connection
    const ws = new WebSocket(websocketUrl);
    wsRef.current = ws;

    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;

    // WebSocket event handlers
    ws.onopen = () => {
      setConnectionStatus('✅ تم الاتصال بنجاح');
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data: WarningData = JSON.parse(event.data);
        console.log('Received message:', data);

        switch (data.type) {
          case 'warning':
            setWarnings(prev => [...prev, data]);
            setViolationCount(data.violation_count || 0);
            break;
          case 'termination':
            setIsTerminated(true);
            setConnectionStatus('🚫 تم إنهاء الاختبار');
            setWarnings(prev => [...prev, data]);
            ws.close();
            break;
          case 'status':
            // Update status if needed
            break;
          case 'error':
            setWarnings(prev => [...prev, data]);
            break;
          default:
            console.warn('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('❌ خطأ في الاتصال');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      if (!isTerminated) {
        setConnectionStatus('🔌 تم قطع الاتصال');
      }
    };

    // Start video stream and frame capture
    let mediaStream: MediaStream | null = null;
    let captureInterval: NodeJS.Timeout;

    const startVideoCapture = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 640, 
            height: 480,
            facingMode: 'user' 
          } 
        });

        if (videoElement) {
          videoElement.srcObject = mediaStream;
          
          // Start capturing frames every second
          captureInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN && videoElement && canvasElement) {
              captureAndSendFrame(videoElement, canvasElement, ws);
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Camera error:', error);
        setConnectionStatus('🚫 لا يمكن الوصول إلى الكاميرا');
      }
    };

    startVideoCapture();

    // Tab visibility handlers
    const handleVisibilityChange = () => {
      if (document.hidden && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ 
          event: 'tab_switched',
          timestamp: new Date().toISOString()
        }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      clearInterval(captureInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [websocketUrl, isTerminated]);

  const captureAndSendFrame = (
    video: HTMLVideoElement, 
    canvas: HTMLCanvasElement, 
    ws: WebSocket
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to JPEG and send
    canvas.toBlob(
      (blob) => {
        if (blob && ws.readyState === WebSocket.OPEN) {
          blob.arrayBuffer().then((buffer) => {
            ws.send(buffer);
          });
        }
      },
      'image/jpeg',
      0.7 // Quality (0.7 is a good balance between quality and size)
    );
  };

  // Styles
  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      background: '#f8f9fa',
      color: '#212529',
      padding: '20px',
      borderRadius: '8px',
      maxWidth: '800px',
      margin: '20px auto',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    videoContainer: {
      position: 'relative',
      marginBottom: '20px',
    },
    video: {
      width: '100%',
      borderRadius: '6px',
      border: '2px solid #dee2e6',
    },
    status: {
      padding: '10px',
      backgroundColor: '#e9ecef',
      borderRadius: '4px',
      marginBottom: '15px',
      textAlign: 'center' as const,
    },
    alert: {
      marginTop: '10px',
      textAlign: 'right' as const,
    },
    warningList: {
      maxHeight: '300px',
      overflowY: 'auto' as const,
      marginTop: '20px',
    },
    terminatedAlert: {
      backgroundColor: '#dc3545',
      color: 'white',
      padding: '15px',
      borderRadius: '4px',
      textAlign: 'center' as const,
      marginBottom: '20px',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        نظام مراقبة الاختبار - الطالب: {studentId}
      </h2>

      {isTerminated && (
        <div style={styles.terminatedAlert}>
          <h4>تم إنهاء الاختبار بسبب مخالفات متعددة</h4>
          <p>عدد المخالفات: {violationCount}</p>
        </div>
      )}

      <div style={styles.status}>
        <strong>حالة الاتصال:</strong> {connectionStatus}
        {violationCount > 0 && (
          <span> | <strong>عدد المخالفات:</strong> {violationCount}</span>
        )}
      </div>

      <div style={styles.videoContainer}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={styles.video}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      <div style={styles.warningList}>
        {warnings.map((warning, index) => (
          <Alert 
            key={index}
            variant={
              warning.type === 'termination' ? 'danger' : 
              warning.type === 'warning' ? 'warning' : 'info'
            }
            style={styles.alert}
          >
            <div>
              <strong>
                {warning.type === 'termination' ? 'إنهاء الاختبار' : 
                 warning.type === 'warning' ? 'تحذير' : 'إشعار'}
              </strong>
              <div>{warning.message}</div>
              {warning.details && (
                <div style={{ fontSize: '0.8em', marginTop: '5px' }}>
                  <pre>{JSON.stringify(warning.details, null, 2)}</pre>
                </div>
              )}
              {warning.timestamp && (
                <div style={{ fontSize: '0.7em', color: '#6c757d' }}>
                  {new Date(warning.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          </Alert>
        ))}
      </div>
    </div>
  );
};

export default ExamMonitor;