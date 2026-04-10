// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Home from "./components/home/Home";
import Login from "./components/home/login";
import SignUp from "./components/home/singup";
import BecomeTutor from "./components/home/becometutor";
import PersonalizedLearningHub from "./components/learner/PersonalizedLearningHub";
import QuizHome from "./components/quiz/QuizHome";
import LearnerDashboard from "./components/learner/LearnerDashboard";
import StudentDashboard from "./components/student/StudentDashboard";
import StudentSignUp from "./components/studentsignup/mailverify";
import StudentSignUpStep2 from "./components/studentsignup/interest";
import PlacementTest from "./components/studentsignup/placementtest";
import QandAPage from "./components/qa/QandAPage";
import Studenttutor from "./components/stutorsignup/verify";
import Stexperiance from "./components/stutorsignup/experiance"; // Check if 'experience'
import Stmailverify from "./components/stutorsignup/stmailverify";
import TutorSignup from "./components/tutorsignup/tsignup";
import MyLearningPage from "./components/mylearning/MyLearningPage";
import TutorDetailsPage from "./components/learner/TutorDetailsPage";
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
import IdiomsQuizStart from "./components/quiz/IdiomsQuizStart";
import IdiomsQuizGame from "./components/quiz/IdiomsQuizGame";
import IdiomsQuizResult from "./components/quiz/IdiomsQuizResult";
import WritingQuizStart from "./components/quiz/WritingQuizStart";
import WritingQuizGame from "./components/quiz/WritingQuizGame";
import WritingQuizResult from "./components/quiz/WritingQuizResult";
import SentenceQuizStart from "./components/quiz/SentenceQuizStart";
import SentenceQuizGame from "./components/quiz/SentenceQuizGame";
import SentenceQuizResult from "./components/quiz/SentenceQuizResult";
import QuizPlay from "./components/quiz/QuizPlay";
import TutorQandA from "./components/qa/TutorQandA";
import TutorDashboardPage from "./components/tutor/TutorDashboardPage";
import EditCoursePage from "./components/course/EditCoursePage";
import TutorCreateQuizPage from "./components/tutor/TutorCreateQuizPage";
import TutorLessonEditorPage from "./components/lesson/TutorLessonEditorPage";
import TutorLessonPreviewPage from "./components/lesson/TutorLessonPreviewPage";
import LessonReaderPage from "./components/lesson/LessonReaderPage";
import VibrantMeshBackground from "./components/ui/VibrantMeshBackground";
import Waitingapproval from "./components/home/waitingtoverify";
import Admin from "./components/admin/admindash";

function AppRoutes() {
  const location = useLocation();
  const hasGlobalMesh = location.pathname !== "/signup";

  return (
    <div
      className={`relative min-h-screen overflow-x-hidden ${hasGlobalMesh ? "app-mesh-scope app-mesh-active" : ""}`}
    >
      {hasGlobalMesh && <VibrantMeshBackground />}
      <div className={hasGlobalMesh ? "relative z-10" : ""}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/becometutor" element={<BecomeTutor />} />

          {/* Dashboard & Learning */}
          <Route path="/dashboard" element={<LearnerDashboard />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/my-learning" element={<MyLearningPage />} />
          <Route
            path="/learning/:courseId/lesson/:lessonId"
            element={<LessonReaderPage />}
          />
          <Route
            path="/learning/:courseId"
            element={<PersonalizedLearningHub />}
          />
          <Route path="/course/:courseId" element={<TutorDetailsPage />} />

          {/* Features */}
          <Route path="/quiz" element={<QuizHome />} />
          <Route path="/quiz/:id/play" element={<QuizPlay />} />
          <Route path="/qa" element={<QandAPage />} />
          <Route path="/tutor-qa" element={<TutorQandA />} />

          {/* Student Signup Flow */}
          <Route path="/signup/sverify" element={<StudentSignUp />} />
          <Route path="/signup/interests" element={<StudentSignUpStep2 />} />
          <Route path="/signup/test" element={<PlacementTest />} />

          {/* Tutor/Combined Signup Flow */}
          <Route path="/stsignup/stverify" element={<Studenttutor />} />
          <Route path="/stsignup/stexperiance" element={<Stexperiance />} />
          <Route path="/stsignup/mailverify" element={<Stmailverify />} />
          <Route path="/tutor/stverify" element={<TutorSignup />} />
          <Route path="/tutor/dashboard" element={<TutorDashboardPage />} />
          <Route path="/edit-course" element={<EditCoursePage />} />
          <Route
            path="/tutor/courses/:courseId/chapter/:chapterId/lesson/:lessonId/edit"
            element={<TutorLessonEditorPage />}
          />
          <Route
            path="/tutor/courses/:courseId/chapter/:chapterId/lesson/:lessonId/preview"
            element={<TutorLessonPreviewPage />}
          />
          <Route path="/tutor/create-quiz" element={<TutorCreateQuizPage />} />

          <Route path="/daily-quiz" element={<DailyQuizStart />} />
          <Route path="/daily-quiz/play" element={<DailyQuizGame />} />
          <Route path="/daily-quiz/result" element={<DailyQuizResult />} />
          <Route path="/vocabulary-quiz" element={<VocabularyQuizStart />} />
          <Route
            path="/vocabulary-quiz/play"
            element={<VocabularyQuizGame />}
          />
          <Route
            path="/vocabulary-quiz/result"
            element={<VocabularyQuizResult />}
          />
          <Route path="/grammar-quiz" element={<GrammarQuizStart />} />
          <Route path="/grammar-quiz/play" element={<GrammarQuizGame />} />
          <Route path="/grammar-quiz/result" element={<GrammarQuizResult />} />
          <Route path="/reading-quiz" element={<ReadingQuizStart />} />
          <Route path="/reading-quiz/play" element={<ReadingQuizGame />} />
          <Route path="/reading-quiz/result" element={<ReadingQuizResult />} />
          <Route path="/waiting-approval" element={<Waitingapproval />} />
          <Route path="/admin/dashboard" element={<Admin />} />

          <Route path="/daily-quiz" element={<DailyQuizStart />} />
          <Route path="/daily-quiz/play" element={<DailyQuizGame />} />
          <Route path="/daily-quiz/result" element={<DailyQuizResult />} />
          <Route path="/vocabulary-quiz" element={<VocabularyQuizStart />} />
          <Route
            path="/vocabulary-quiz/play"
            element={<VocabularyQuizGame />}
          />
          <Route
            path="/vocabulary-quiz/result"
            element={<VocabularyQuizResult />}
          />
          <Route path="/grammar-quiz" element={<GrammarQuizStart />} />
          <Route path="/grammar-quiz/play" element={<GrammarQuizGame />} />
          <Route path="/grammar-quiz/result" element={<GrammarQuizResult />} />
          <Route path="/reading-quiz" element={<ReadingQuizStart />} />
          <Route path="/reading-quiz/play" element={<ReadingQuizGame />} />
          <Route path="/reading-quiz/result" element={<ReadingQuizResult />} />
          <Route path="/idioms-quiz" element={<IdiomsQuizStart />} />
          <Route path="/idioms-quiz/play" element={<IdiomsQuizGame />} />
          <Route path="/idioms-quiz/result" element={<IdiomsQuizResult />} />
          <Route path="/writing-quiz" element={<WritingQuizStart />} />
          <Route path="/writing-quiz/play" element={<WritingQuizGame />} />
          <Route path="/writing-quiz/result" element={<WritingQuizResult />} />
          <Route path="/sentence-quiz" element={<SentenceQuizStart />} />
          <Route path="/sentence-quiz/play" element={<SentenceQuizGame />} />
          <Route
            path="/sentence-quiz/result"
            element={<SentenceQuizResult />}
          />
          <Route path="/admin/requests" element={<Admin />} />
          <Route path="/admin/student-tutors" element={<Admin />} />
          <Route path="/admin/users" element={<Admin />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
