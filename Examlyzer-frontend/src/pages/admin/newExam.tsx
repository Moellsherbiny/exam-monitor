import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";
import { Container, Row, Col, Button } from "react-bootstrap";

const StartExamPage = () => {
  const handleStartExam = () => {
    // Implement exam starting logic here (e.g., redirect to exam page)
    alert('سيتم بدء الاختبار قريبًا...');
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-md p-4 text-center"
          >
            <h2 className="mb-4 text-primary">
              <PlayCircle className="mr-2" size={30} />
              بدء الاختبار
            </h2>
            <p className="mb-4">
              اضغط على الزر لبدء الاختبار.
            </p>
            <Button variant="success" onClick={handleStartExam} size="lg">
              ابدأ الاختبار الآن
            </Button>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default StartExamPage;