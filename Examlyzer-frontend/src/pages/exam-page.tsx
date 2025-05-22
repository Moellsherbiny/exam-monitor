import{ useEffect, useRef, useState } from 'react';

const ExamMonitor = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [warningAlert, setWarningAlert] = useState<string | null>(null);
  const [terminationAlert, setTerminationAlert] = useState<string | null>(null);

  const studentId = 'student123'; // Replace with dynamic student ID
  const examId = 'exam456';     // Replace with dynamic exam ID
  const websocketUrl = `ws://localhost:8000/ws/monitor/${studentId}/${examId}`;

  useEffect(() => {
    const ws = new WebSocket(websocketUrl);
    setSocket(ws);

    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const statusTextElement = statusRef.current;

    ws.onopen = () => {
      if (statusTextElement) {
        statusTextElement.textContent = '✅ Connected to WebSocket';
        statusTextElement.style.color = 'green';
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.warning) {
        setWarningAlert(`⚠️ ${data.warning}\nDetails: ${JSON.stringify(data.details)}`);
        // Optionally, you could implement a more styled alert using react-bootstrap here
      }
      if (data.action === 'terminate') {
        setTerminationAlert('🚫 Exam terminated due to cheating.');
        ws.close();
      }
    };

    ws.onerror = (err) => {
      if (statusTextElement) {
        statusTextElement.textContent = '❌ WebSocket error';
        statusTextElement.style.color = 'red';
      }
      console.error(err);
    };

    ws.onclose = () => {
      if (statusTextElement) {
        statusTextElement.textContent = '🔌 WebSocket closed';
        statusTextElement.style.color = 'gray';
      }
      setSocket(null);
    };

    // Access webcam
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoElement) {
          videoElement.srcObject = stream;
          const intervalId = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN && videoElement && canvasElement) {
              captureAndSendFrame(videoElement, canvasElement, ws);
            }
          }, 1000); // send every second
          return () => clearInterval(intervalId); // Cleanup on unmount
        }
      })
      .catch((err) => {
        console.error('Camera error:', err);
        if (statusTextElement) {
          statusTextElement.textContent = '🚫 Cannot access webcam';
        }
      });

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [websocketUrl]); // Re-establish connection if URL changes

  const captureAndSendFrame = (video: HTMLVideoElement, canvas: HTMLCanvasElement, ws: WebSocket) => {
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob && ws.readyState === WebSocket.OPEN) {
          blob.arrayBuffer().then((buffer) => {
            ws.send(buffer);
          });
        }
      },
      'image/jpeg',
      0.6
    ); // compress to save bandwidth
  };

  return (
    <div style={{ fontFamily: 'sans-serif', background: '#f0f0f0', padding: '20px', textAlign: 'center' }}>
      <h1>Cheating Detector WebSocket Test</h1>
      <video id="video" autoPlay muted ref={videoRef} style={{ border: '2px solid #444', borderRadius: '10px', marginTop: '20px' }} />
      <canvas id="canvas" style={{ display: 'none' }} ref={canvasRef} />
      <p id="status" ref={statusRef}>
        Connecting...
      </p>
      {warningAlert && <Alert variant="warning">{warningAlert}</Alert>}
      {terminationAlert && <Alert variant="danger">{terminationAlert}</Alert>}
    </div>
  );
};

export default ExamMonitor;