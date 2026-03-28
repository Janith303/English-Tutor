// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/home/Home';
import Login from './components/home/login';
import SignUp from './components/home/singup';
import BecomeTutor from './components/home/becometutor';
import LearnerDashboard from "./components/pages/LearnerDashboard";
import QuizHome from "./components/quiz/QuizHome";
import StudentDashboard from "./components/student/StudentDashboard";
import StudentSignUp from "./components/studentsignup/mailverify";
import StudentSignUpStep2 from "./components/studentsignup/interest";
import PlacementTest from "./components/studentsignup/placementtest";
import QandAPage from './components/qa/QandAPage';
import Studenttutor from './components/stutorsignup/verify';
import Stexperiance from './components/stutorsignup/experiance';
import Stmailverify from './components/stutorsignup/stmailverify';
import TutorSignup from './components/tutorsignup/tsignup';
import DailyQuizStart from "./components/quiz/DailyQuizStart";
import DailyQuizGame from "./components/quiz/DailyQuizGame";
import DailyQuizResult from "./components/quiz/DailyQuizResult";
import VocabularyQuizStart from "./components/quiz/VocabularyQuizStart";
import VocabularyQuizGame from "./components/quiz/VocabularyQuizGame";
import VocabularyQuizResult from "./components/quiz/VocabularyQuizResult";
import GrammarQuizStart from "./components/quiz/GrammarQuizStart";
import GrammarQuizGame from "./components/quiz/GrammarQuizGame";
import GrammarQuizResult from "./components/quiz/GrammarQuizResult";
import ReadingQuizStart from "./components/quiz/ReadingQuizStart";
import ReadingQuizGame from "./components/quiz/ReadingQuizGame";
import ReadingQuizResult from "./components/quiz/ReadingQuizResult";

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
            <Route path="/signup/sverify" element={<StudentSignUp />} />
            <Route path="/signup/interests" element={<StudentSignUpStep2 />} />
            <Route path="/signup/test" element={<PlacementTest />} />
            <Route path="/qa" element={<QandAPage />} />
            <Route path="/stsignup/stverify" element={<Studenttutor />} />
            <Route path="/stsignup/stexperiance" element={<Stexperiance />} />
            <Route path="/stsignup/mailverify" element={<Stmailverify />} />
            <Route path="/becometutor" element={<BecomeTutor />} />
            <Route path="/tutor/stverify" element={<TutorSignup />} />
            <Route path="/daily-quiz" element={<DailyQuizStart />} />
            <Route path="/daily-quiz/play" element={<DailyQuizGame />} />
            <Route path="/daily-quiz/result" element={<DailyQuizResult />} />
            <Route path="/vocabulary-quiz" element={<VocabularyQuizStart />} />
            <Route path="/vocabulary-quiz/play" element={<VocabularyQuizGame />} />
            <Route path="/vocabulary-quiz/result" element={<VocabularyQuizResult />} />
            <Route path="/grammar-quiz" element={<GrammarQuizStart />} />
            <Route path="/grammar-quiz/play" element={<GrammarQuizGame />} />
            <Route path="/grammar-quiz/result" element={<GrammarQuizResult />} />
            <Route path="/reading-quiz" element={<ReadingQuizStart />} />
            <Route path="/reading-quiz/play" element={<ReadingQuizGame />} />
            <Route path="/reading-quiz/result" element={<ReadingQuizResult />} />
          </Routes>
    </Router>
  );
}

export default App;