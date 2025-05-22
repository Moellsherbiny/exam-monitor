/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Alert, 
  Spinner,
  Badge,
  Form,
  InputGroup,
  Card,
  ListGroup,
  Tab,
  Tabs
} from 'react-bootstrap';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { parseISO } from 'date-fns/parseISO';
import { FaDownload, FaTrash, FaSearch, FaEye } from 'react-icons/fa';

interface ReportSummary {
  filename: string;
  student_id: string;
  exam_id: string;
  timestamp: string;
  violation_count: number;
  size: number;
}

interface Violation {
  timestamp: string;
  reason: string;
  details: any;
}

interface FullReport {
  student_id: string;
  exam_id: string;
  violations: Violation[];
  termination_time: string;
}

const ReportsDashboard: React.FC = () => {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<FullReport | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/reports');
      setReports(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      setError('Failed to load reports. Please try again.');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadReportDetails = async (filename: string) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/reports/${filename}`);
      setSelectedReport(response.data);
      setShowModal(true);
    } catch (err) {
      setError('Failed to load report details.');
      console.error('Error loading report:', err);
    }
  };

  const downloadReport = async (filename: string) => {
    try {
      const response = await axios.get(`/api/reports/${filename}/download`, {
        responseType: 'blob'
      });
      saveAs(new Blob([response.data]), filename);
    } catch (err) {
      setError('Failed to download report.');
      console.error('Error downloading report:', err);
    }
  };

  const deleteReport = async (filename: string) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    
    try {
      await axios.delete(`/api/reports/${filename}`);
      fetchReports(); // Refresh the list
    } catch (err) {
      setError('Failed to delete report.');
      console.error('Error deleting report:', err);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.exam_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return matchesSearch && report.timestamp.startsWith(today);
    }
    if (activeTab === 'high') {
      return matchesSearch && report.violation_count >= 3;
    }
    return matchesSearch;
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="container-fluid py-4">
      <h1 className="mb-4">Exam Monitoring Reports</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k as string)}
              className="mb-3"
            >
              <Tab eventKey="all" title="All Reports" />
              <Tab eventKey="today" title="Today" />
              <Tab eventKey="high" title="High Violations" />
            </Tabs>
            
            <InputGroup style={{ width: '300px' }}>
              <Form.Control
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
            </InputGroup>
          </div>
          
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <Alert variant="info">No reports found</Alert>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Exam ID</th>
                    <th>Date/Time</th>
                    <th>Violations</th>
                    <th>File Size</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report.filename}>
                      <td>{report.student_id}</td>
                      <td>{report.exam_id}</td>
                      <td>{format(parseISO(report.timestamp), 'PPpp')}</td>
                      <td>
                        <Badge 
                          bg={report.violation_count >= 3 ? 'danger' : 'warning'} 
                          pill
                        >
                          {report.violation_count}
                        </Badge>
                      </td>
                      <td>{formatFileSize(report.size)}</td>
                      <td>
                        <Button
                          variant="info"
                          size="sm"
                          className="me-2"
                          onClick={() => loadReportDetails(report.filename)}
                          title="View Details"
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={() => downloadReport(report.filename)}
                          title="Download"
                        >
                          <FaDownload />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => deleteReport(report.filename)}
                          title="Delete"
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Report Details Modal */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Report Details - {selectedReport?.student_id} (Exam: {selectedReport?.exam_id})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReport && (
            <>
              <div className="mb-3">
                <strong>Termination Time:</strong>{' '}
                {format(parseISO(selectedReport.termination_time), 'PPpp')}
              </div>
              
              <h5>Violations ({selectedReport.violations.length})</h5>
              <ListGroup variant="flush">
                {selectedReport.violations.map((violation, index) => (
                  <ListGroup.Item key={index}>
                    <div className="d-flex justify-content-between">
                      <strong>#{index + 1}: {violation.reason}</strong>
                      <small className="text-muted">
                        {format(parseISO(violation.timestamp), 'HH:mm:ss')}
                      </small>
                    </div>
                    <div className="mt-2">
                      <pre className="bg-light p-2 rounded">
                        {JSON.stringify(violation.details, null, 2)}
                      </pre>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowModal(false)}
          >
            Close
          </Button>
          <Button 
            variant="primary"
            onClick={() => selectedReport && downloadReport(selectedReport.student_id + '_' + selectedReport.exam_id + '.json')}
          >
            Download Report
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReportsDashboard;