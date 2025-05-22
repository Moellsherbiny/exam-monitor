import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { Col, Container, Row, Table } from 'react-bootstrap';
interface Student {
  full_name: string;
  username: string;
  email: string;
  password?: string; // Password should not be displayed, but needed for adding
  image?: string; // Optional image URL
}
const StudentReportsPage = () => {
  const [students] = useState<Student[]>([ // Mock student data for demonstration
    { full_name: 'أحمد محمد', username: 'ahmed123', email: 'ahmed@example.com', image: 'https://via.placeholder.com/150' },
    { full_name: 'ليلى علي', username: 'laila456', email: 'laila@example.com', image: 'https://via.placeholder.com/150' },
    { full_name: 'خالد محمود', username: 'khaled789', email: 'khaled@example.com', image: 'https://via.placeholder.com/150' },
    { full_name: 'فاطمة حسين', username: 'fatima246', email: 'fatima@example.com', image: 'https://via.placeholder.com/150' },
  ]);

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-md p-4"
          >
            <h2 className="text-center mb-4 text-primary">
              <FileText className="mr-2" size={30} />
              تقارير الطلاب
            </h2>
            <Table striped bordered hover responsive dir="rtl">
              <thead>
                <tr>
                  <th>الصورة</th>
                  <th>الاسم الكامل</th>
                  <th>اسم المستخدم</th>
                  <th>البريد الإلكتروني</th>
                  {/* Add more report-related columns as needed */}
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={index}>
                    <td>
                      {student.image ? (
                        <img src={student.image} alt={student.full_name} className="rounded-circle" style={{ width: '50px', height: '50px' }} />
                      ) : (
                        'لا يوجد صورة'
                      )}
                    </td>
                    <td>{student.full_name}</td>
                    <td>{student.username}</td>
                    <td>{student.email}</td>
                    {/* Add more report-related data here */}
                  </tr>
                ))}
              </tbody>
            </Table>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentReportsPage;

