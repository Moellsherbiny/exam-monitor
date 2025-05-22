import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import TakeExamPage from './components/ExamPage';
import StudentLogin from './pages/StudentLogin';
import ReportsDashboard from './components/Reports';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/exam/:examId" element={<TakeExamPage />} />

        <Route path="/" element={<StudentLogin />} />
        <Route path="/admin/reports" element={<ReportsDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;