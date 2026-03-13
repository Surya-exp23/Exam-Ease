import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ExamPage from './pages/ExamPage';
import CompletionPage from './pages/CompletionPage';
import ThemeToggle from './components/ThemeToggle';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/exam" element={<ExamPage />} />
          <Route path="/complete" element={<CompletionPage />} />
          {/* Legacy route redirect */}
          <Route path="/dashboard" element={<Navigate to="/student-dashboard" replace />} />
        </Routes>
        <ThemeToggle />
      </Router>
    </AuthProvider>
  );
}

export default App;
