// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/home/Home';
import Login from './components/home/login';
import SignUp from './components/home/singup';
import LearnerDashboard from "./components/pages/LearnerDashboard";
import QuizHome from "./components/quiz/QuizHome";
import StudentDashboard from "./components/student/StudentDashboard";

function App() {
  return (
    <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<LearnerDashboard />} />
            <Route path="/quiz" element={<QuizHome />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
          </Routes>
    </Router>
  );
}

export default App;