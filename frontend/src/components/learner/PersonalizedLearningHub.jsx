import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LearnerTopNav from "./LearnerTopNav";
import { mockStudent } from "../../data/mockCourses";
import {
  Target,
  Crown,
  Zap,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Play,
  Lock,
  ChevronLeft,
  FileText,
  X,
  Trash2,
} from "lucide-react";
import {
  getCourseProgress,
  getPublishedCourseDetail,
  getStudentProfile,
  toLearnerStudentProfile,
  toLessonRowsFromCourseDetail,
  getStudentLessonDetail,
  submitStudentLessonQuiz,
  completeStudentLessonChecked,
  createStudentNote,
  getStudentNotes,
  deleteStudentNote,
} from "../../api/courseApi";

export default function PersonalizedLearningHub() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(mockStudent);
  const [lessons, setLessons] = useState([]);
  const [course, setCourse] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  // New state for 3-panel layout
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [currentLessonContent, setCurrentLessonContent] = useState(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [submittingQuizId, setSubmittingQuizId] = useState(null);
  const [answersByQuiz, setAnswersByQuiz] = useState({});
  const [completingLesson, setCompletingLesson] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);

  // Notes state
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesTab, setNotesTab] = useState("new"); // "new" or "my"
  const [myNotes, setMyNotes] = useState([]);
  const [noteFilter, setNoteFilter] = useState("lesson"); // "lesson" or "course"
  const [newNoteForm, setNewNoteForm] = useState({
    title: "",
    description: "",
  });

  const enrolledCourse = course;

  const hydrateCourse = async () => {
    const [detail, progress, profileData] = await Promise.all([
      getPublishedCourseDetail(courseId),
      getCourseProgress(courseId),
      getStudentProfile(),
    ]);

    setCourse(detail);
    setProgressData(progress);
    const mappedLessons = toLessonRowsFromCourseDetail(detail).map(
      (lesson) => ({
        ...lesson,
        isCompleted: progress.completed_lesson_ids.includes(lesson.id),
        isUnlocked:
          progress.completed_lesson_ids.includes(lesson.id) ||
          progress.earned_credits >= lesson.requiredCreditsToUnlock,
      }),
    );
    setLessons(mappedLessons);

    const resolvedProfile = toLearnerStudentProfile(profileData, mockStudent);
    setStudent({
      ...resolvedProfile,
      earnedCredits: progress.earned_credits,
    });
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await hydrateCourse();
      } catch (error) {
        console.error("Failed to load learning hub data:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [courseId]);

  // Reload notes when lesson selection or filter changes
  useEffect(() => {
    if (notesOpen && notesTab === "my") {
      loadNotes();
    }
  }, [selectedLessonId, noteFilter, notesOpen, notesTab]);

  const completedCount = lessons.filter((l) => l.isCompleted).length;
  const totalCount = lessons.length;
  const courseProgress = Math.round((completedCount / totalCount) * 100);
  const creditsToTarget = Math.max(150 - student.earnedCredits, 0);

  // Helper function to load lesson content
  const loadLessonContent = async (lessonId) => {
    try {
      setLoadingLesson(true);
      const content = await getStudentLessonDetail(courseId, lessonId);
      setCurrentLessonContent(content);
      setAnswersByQuiz({});
    } catch (error) {
      console.error("Failed to load lesson:", error);
    } finally {
      setLoadingLesson(false);
    }
  };

  // Helper function to set quiz answer
  const setAnswer = (quizId, questionId, selectedOptionId) => {
    setAnswersByQuiz((prev) => ({
      ...prev,
      [quizId]: {
        ...(prev[quizId] || {}),
        [questionId]: selectedOptionId,
      },
    }));
  };

  // Helper function to submit quiz
  const handleSubmitQuiz = async (quiz) => {
    const answers = currentLessonContent?.quizzes?.find(
      (q) => q.id === quiz.id,
    );
    if (!answers) return;

    // Validate all questions answered
    const answeredCount = Object.keys(answersByQuiz[quiz.id] || {}).length;
    const totalQuestions = quiz.questions?.length || 0;
    if (answeredCount !== totalQuestions) {
      alert(`Please answer all ${totalQuestions} questions before submitting.`);
      return;
    }

    try {
      setSubmittingQuizId(quiz.id);
      const payload = {
        answers: Object.entries(answersByQuiz[quiz.id] || {}).map(
          ([questionId, optionId]) => ({
            question_id: parseInt(questionId),
            selected_option: optionId,
          }),
        ),
      };
      await submitStudentLessonQuiz(
        courseId,
        selectedLessonId,
        quiz.id,
        payload,
      );
      // Reload lesson content to show quiz results
      await loadLessonContent(selectedLessonId);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      alert("Failed to submit quiz. Please try again.");
    } finally {
      setSubmittingQuizId(null);
    }
  };

  // Helper function to mark lesson complete
  const handleCompleteLesson = async () => {
    if (!selectedLessonId) return;
    try {
      setCompletingLesson(true);
      await completeStudentLessonChecked(courseId, selectedLessonId);
      // Refresh progress to get updated credits
      const progress = await getCourseProgress(courseId);
      setProgressData(progress);
      setStudent((prev) => ({
        ...prev,
        earnedCredits: progress.earned_credits,
      }));
      if (course) {
        const refreshedLessons = toLessonRowsFromCourseDetail(course).map(
          (lesson) => ({
            ...lesson,
            isCompleted: progress.completed_lesson_ids.includes(lesson.id),
            isUnlocked:
              progress.completed_lesson_ids.includes(lesson.id) ||
              progress.earned_credits >= lesson.requiredCreditsToUnlock,
          }),
        );
        setLessons(refreshedLessons);
      }
      // Reload lesson content to show completion status
      await loadLessonContent(selectedLessonId);
    } catch (error) {
      console.error("Failed to complete lesson:", error);
      alert("Failed to mark lesson complete. Please try again.");
    } finally {
      setCompletingLesson(false);
    }
  };

  // Helper functions for notes
  const loadNotes = async () => {
    if (noteFilter === "lesson" && !selectedLessonId) {
      setMyNotes([]);
      return;
    }
    const notes = await getStudentNotes(
      courseId,
      noteFilter === "lesson"
        ? { lessonId: selectedLessonId, context: "lesson" }
        : {}, // Show all notes when filter is "course"
    );
    setMyNotes(notes);
  };

  const handleCreateNote = async () => {
    if (!newNoteForm.title.trim() || !newNoteForm.description.trim()) {
      alert("Please fill in both title and description");
      return;
    }

    try {
      await createStudentNote(courseId, {
        title: newNoteForm.title,
        description: newNoteForm.description,
        lessonId: noteFilter === "lesson" ? selectedLessonId : null,
        context: noteFilter === "lesson" ? "lesson" : "course",
      });
      setNewNoteForm({ title: "", description: "" });
      setNotesTab("my");
      await loadNotes();
    } catch (error) {
      console.error("Failed to create note:", error);
      alert("Failed to create note. Please try again.");
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteStudentNote(courseId, noteId);
      await loadNotes();
    } catch (error) {
      console.error("Failed to delete note:", error);
      alert("Failed to delete note. Please try again.");
    }
  };

  const handleOpenNotes = async () => {
    setNotesOpen(true);
    await loadNotes();
  };

  // Helper function to resolve media URLs
  const resolveMediaUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `http://localhost:8000${url.startsWith("/") ? url : "/" + url}`;
  };

  // Helper function to convert to embeddable video URL
  const toEmbeddableVideoUrl = (url) => {
    if (!url) return "";
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be")
        ? url.split("/").pop()
        : new URLSearchParams(new URL(url).search).get("v");
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  // Create grouped lessons by chapter for right panel
  const lessonsByChapter = useMemo(() => {
    const groupedByChapter = {};
    lessons.forEach((lesson) => {
      const chapterId = lesson.chapterId;
      const chapterTitle = lesson.chapterTitle;
      if (!groupedByChapter[chapterId]) {
        groupedByChapter[chapterId] = {
          chapterId,
          chapterTitle,
          chapterOrder: lesson.chapterOrder ?? Number.MAX_SAFE_INTEGER,
          lessons: [],
        };
      }
      groupedByChapter[chapterId].lessons.push(lesson);
    });
    const orderedChapters = Object.values(groupedByChapter).sort(
      (a, b) => a.chapterOrder - b.chapterOrder,
    );

    return orderedChapters.map((chapter, index) => {
      const previousChapter = orderedChapters[index - 1];
      const previousChapterCompleted = !previousChapter
        ? true
        : previousChapter.lessons.every((lesson) => lesson.isCompleted);

      return {
        ...chapter,
        isLocked: !previousChapterCompleted,
      };
    });
  }, [lessons]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <LearnerTopNav />

      <div className="max-w-full mx-auto px-4 py-6">
        {loading && (
          <div className="mb-6 bg-white rounded-xl border border-gray-100 p-4 text-sm text-gray-500">
            Loading learning progress...
          </div>
        )}

        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 px-4 py-2  rounded-lg text-blue-600 font-medium hover:bg-gray-100 transition-colors"
        >
          ← Back to Dashboard
        </button>

        <div className="relative">
          {/* Expand Left Sidebar Button - Positioned Absolutely */}
          {leftSidebarCollapsed && (
            <button
              onClick={() => setLeftSidebarCollapsed(false)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white border border-gray-200 rounded-full p-2 hover:bg-gray-100 transition-colors shadow-md"
              title="Expand left sidebar"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {/* Expand Right Sidebar Button - Positioned Absolutely */}
          {rightSidebarCollapsed && (
            <button
              onClick={() => setRightSidebarCollapsed(false)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-white border border-gray-200 rounded-full p-2 hover:bg-gray-100 transition-colors shadow-md"
              title="Expand right sidebar"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}

          <div
            className={`grid gap-6 h-[calc(100vh-200px)] transition-all duration-300`}
            style={{
              gridTemplateColumns: `${leftSidebarCollapsed ? "0" : "1fr"} 2fr ${rightSidebarCollapsed ? "0" : "1fr"}`,
            }}
          >
            {/* LEFT PANEL - Learning Track */}
            {!leftSidebarCollapsed && (
              <div className="relative space-y-4 overflow-y-auto pr-2">
                {/* Collapse Button */}
                <button
                  onClick={() => setLeftSidebarCollapsed(true)}
                  className="absolute -right-6 top-0 z-20 bg-white border border-gray-200 rounded-full p-1 hover:bg-gray-100 transition-colors"
                  title="Collapse left sidebar"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                {/* Top 10% Badge */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl px-6 py-4 shadow-sm border border-blue-200 sticky top-0 z-10">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {(student.name || "S").charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {student.name}
                        </p>
                        <p className="text-xs text-gray-600">{student.level}</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-full px-3 py-2 border-2 border-yellow-400 text-center flex-shrink-0">
                      <p className="text-xs font-bold text-yellow-600">
                        Top 10%
                      </p>
                      <p className="text-xs text-gray-600">This Week</p>
                    </div>
                  </div>
                </div>

                {/* Learning Track - Course Info */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    {course?.thumbnail && (
                      <img
                        src={resolveMediaUrl(course.thumbnail)}
                        alt={course.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-sm">
                        {course?.title || "Loading..."}
                      </h3>
                      <p className="text-xs text-gray-600">Learning Track</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${courseProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {completedCount}/{totalCount} lessons completed
                  </p>
                </div>
              </div>
            )}

            {/* Expand Left Sidebar Button */}
            {leftSidebarCollapsed && (
              <button
                onClick={() => setLeftSidebarCollapsed(false)}
                className="flex items-center justify-center bg-white border border-gray-200 rounded-2xl hover:bg-gray-100 transition-colors"
                title="Expand left sidebar"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            )}

            {/* CENTER PANEL - Lesson Viewer */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-y-auto">
              {loadingLesson ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading lesson...</p>
                  </div>
                </div>
              ) : !selectedLessonId || !currentLessonContent ? (
                <div className="flex items-center justify-center h-full p-6">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">
                      Select a lesson to begin
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Click on a lesson from the right panel to view content
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8">
                  {/* Close Button */}
                  <button
                    onClick={() => {
                      setSelectedLessonId(null);
                      setCurrentLessonContent(null);
                    }}
                    className="mb-4 text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"
                  >
                    ← Back to Lessons
                  </button>

                  {/* Video Section */}
                  {currentLessonContent?.lesson_video_embed_url ||
                  currentLessonContent?.lesson_video_file_url ? (
                    <div className="mb-6">
                      <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                        {toEmbeddableVideoUrl(
                          currentLessonContent?.lesson_video_embed_url,
                        ) && (
                          <iframe
                            width="100%"
                            height="100%"
                            src={toEmbeddableVideoUrl(
                              currentLessonContent.lesson_video_embed_url,
                            )}
                            title="Lesson Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Lesson Content */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {currentLessonContent?.title}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span>
                        📚 {currentLessonContent?.duration_minutes} min
                      </span>
                      <span>
                        ⭐ +{currentLessonContent?.credits_awarded} credits
                      </span>
                    </div>
                    <div
                      className="prose prose-sm max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{
                        __html: currentLessonContent?.content,
                      }}
                    />
                  </div>

                  {/* Exercise Files */}
                  {currentLessonContent?.exercise_files &&
                    currentLessonContent.exercise_files.length > 0 && (
                      <div className="mb-6 border-t pt-6">
                        <h3 className="font-bold text-gray-900 mb-4">
                          📄 Exercise Files
                        </h3>
                        <div className="space-y-2">
                          {currentLessonContent.exercise_files.map((file) => (
                            <a
                              key={file.id}
                              href={resolveMediaUrl(file.file_url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              <span>📎</span>
                              <span className="text-sm font-medium text-blue-600">
                                {file.display_name}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Quizzes */}
                  {currentLessonContent?.quizzes &&
                    currentLessonContent.quizzes.length > 0 && (
                      <div className="mb-6 border-t pt-6">
                        <h3 className="font-bold text-gray-900 mb-4">
                          📝 Lesson Quiz
                        </h3>
                        {currentLessonContent.quizzes.map((quiz) => (
                          <div
                            key={quiz.id}
                            className="bg-blue-50 rounded-lg p-4 mb-4"
                          >
                            <h4 className="font-semibold text-gray-900 mb-4">
                              {quiz.title}
                            </h4>
                            <div className="space-y-4">
                              {quiz.questions &&
                                quiz.questions.map((question) => (
                                  <div
                                    key={question.id}
                                    className="bg-white rounded-lg p-4"
                                  >
                                    <p className="font-medium text-gray-900 mb-3">
                                      {question.question_text}
                                    </p>
                                    <div className="space-y-2">
                                      {(
                                        question.options ||
                                        [
                                          question.option_a && {
                                            id: "a",
                                            option_text: question.option_a,
                                          },
                                          question.option_b && {
                                            id: "b",
                                            option_text: question.option_b,
                                          },
                                          question.option_c && {
                                            id: "c",
                                            option_text: question.option_c,
                                          },
                                          question.option_d && {
                                            id: "d",
                                            option_text: question.option_d,
                                          },
                                        ].filter(Boolean)
                                      ).map((option) => (
                                        <label
                                          key={option.id}
                                          className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                                        >
                                          <input
                                            type="radio"
                                            name={`question-${question.id}`}
                                            value={option.id}
                                            checked={
                                              answersByQuiz[quiz.id]?.[
                                                question.id
                                              ] === option.id
                                            }
                                            onChange={() =>
                                              setAnswer(
                                                quiz.id,
                                                question.id,
                                                option.id,
                                              )
                                            }
                                            disabled={
                                              submittingQuizId === quiz.id
                                            }
                                            className="w-4 h-4"
                                          />
                                          <span className="text-gray-700">
                                            {option.option_text}
                                          </span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                            </div>
                            <button
                              onClick={() => handleSubmitQuiz(quiz)}
                              disabled={submittingQuizId === quiz.id}
                              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition-colors"
                            >
                              {submittingQuizId === quiz.id
                                ? "Submitting..."
                                : "Submit Quiz"}
                            </button>
                            {currentLessonContent.quiz_results?.[quiz.id] && (
                              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-700 font-medium">
                                  ✓ Quiz completed! Score:{" "}
                                  {
                                    currentLessonContent.quiz_results[quiz.id]
                                      .score
                                  }
                                  %
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Completion Button */}
                  <div className="border-t pt-6">
                    <button
                      onClick={handleCompleteLesson}
                      disabled={completingLesson}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                      {completingLesson
                        ? "Marking complete..."
                        : "✓ Mark Lesson Complete"}
                    </button>
                    {currentLessonContent?.is_completed && (
                      <p className="text-center text-green-600 text-sm mt-2">
                        ✓ This lesson is completed
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT PANEL - Lesson Navigation */}
            {!rightSidebarCollapsed && (
              <div className="relative h-full">
                {/* Collapse Button */}
                <button
                  onClick={() => setRightSidebarCollapsed(true)}
                  className="absolute -left-6 top-0 z-20 bg-white border border-gray-200 rounded-full p-1 hover:bg-gray-100 transition-colors"
                  title="Collapse right sidebar"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-y-auto p-4 h-full">
                  {!notesOpen ? (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Lessons</h3>
                        <button
                          onClick={handleOpenNotes}
                          className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Open notes"
                        >
                          <FileText className="w-5 h-5 text-blue-600" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {lessonsByChapter.map((chapter) => (
                          <div key={chapter.chapterId}>
                            {/* Chapter Header */}
                            <button
                              onClick={() =>
                                setExpandedChapters((prev) => ({
                                  ...prev,
                                  [chapter.chapterId]: !prev[chapter.chapterId],
                                }))
                              }
                              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <span className="font-semibold text-gray-900 text-sm text-left">
                                {chapter.chapterTitle}
                              </span>
                              {expandedChapters[chapter.chapterId] ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>

                            {/* Lessons List */}
                            {expandedChapters[chapter.chapterId] && (
                              <div className="pl-2 space-y-1 mt-1">
                                {chapter.lessons.map((lesson) => (
                                  <button
                                    key={lesson.id}
                                    onClick={() => {
                                      if (
                                        chapter.isLocked ||
                                        !lesson.isUnlocked
                                      ) {
                                        return;
                                      }
                                      setSelectedLessonId(lesson.id);
                                      loadLessonContent(lesson.id);
                                    }}
                                    disabled={
                                      chapter.isLocked || !lesson.isUnlocked
                                    }
                                    className={`w-full text-left p-3 rounded-lg transition-all ${
                                      selectedLessonId === lesson.id
                                        ? "bg-blue-100 border-l-4 border-blue-600"
                                        : chapter.isLocked || !lesson.isUnlocked
                                          ? "bg-gray-50 opacity-70 cursor-not-allowed"
                                          : "hover:bg-gray-50"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 text-sm truncate">
                                          {lesson.title}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                          {lesson.duration_minutes} mins
                                        </p>
                                      </div>
                                      <div className="flex-shrink-0">
                                        {lesson.isCompleted ? (
                                          <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 rounded-full">
                                            <span className="text-xs font-bold text-green-700">
                                              ✓
                                            </span>
                                          </span>
                                        ) : chapter.isLocked ||
                                          !lesson.isUnlocked ? (
                                          <Lock className="w-4 h-4 text-gray-400" />
                                        ) : (
                                          <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-200 rounded-full">
                                            <span className="text-xs text-gray-500">
                                              ◦
                                            </span>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Notes Panel */}
                      <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                          <button
                            onClick={() => setNotesOpen(false)}
                            className="p-1 rounded hover:bg-gray-100"
                            title="Back to lessons"
                          >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                          </button>
                          <h3 className="font-bold text-gray-900">Notes</h3>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 mb-4 border-b border-gray-200">
                          <button
                            onClick={() => setNotesTab("new")}
                            className={`px-3 py-2 text-sm font-medium transition-colors ${
                              notesTab === "new"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            New Note
                          </button>
                          <button
                            onClick={() => {
                              setNotesTab("my");
                              loadNotes();
                            }}
                            className={`px-3 py-2 text-sm font-medium transition-colors ${
                              notesTab === "my"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            My Notes
                          </button>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto">
                          {notesTab === "new" ? (
                            <div className="space-y-4">
                              {/* Note Context Selection */}
                              <div className="flex gap-2 mb-4">
                                <button
                                  onClick={() => setNoteFilter("lesson")}
                                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                    noteFilter === "lesson"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  This Section
                                </button>
                                <button
                                  onClick={() => setNoteFilter("course")}
                                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                    noteFilter === "course"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  Course
                                </button>
                              </div>

                              {/* Form */}
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Title{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Title your note"
                                    value={newNoteForm.title}
                                    onChange={(e) =>
                                      setNewNoteForm({
                                        ...newNoteForm,
                                        title: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Description{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <textarea
                                    placeholder="Scribble away!"
                                    value={newNoteForm.description}
                                    onChange={(e) =>
                                      setNewNoteForm({
                                        ...newNoteForm,
                                        description: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows="4"
                                  />
                                </div>
                              </div>

                              {/* Save Button */}
                              <button
                                onClick={handleCreateNote}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {/* Filter Buttons */}
                              <div className="flex gap-2 mb-4">
                                <button
                                  onClick={() => {
                                    setNoteFilter("lesson");
                                    loadNotes();
                                  }}
                                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                    noteFilter === "lesson"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  This Section
                                </button>
                                <button
                                  onClick={() => {
                                    setNoteFilter("course");
                                    loadNotes();
                                  }}
                                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                    noteFilter === "course"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  Course
                                </button>
                              </div>

                              {/* Notes List */}
                              {myNotes.length > 0 ? (
                                myNotes.map((note) => (
                                  <div
                                    key={note.id}
                                    className="p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 text-sm">
                                          {note.title}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                          {note.description}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-2">
                                          {new Date(
                                            note.createdAt,
                                          ).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <button
                                        onClick={() =>
                                          handleDeleteNote(note.id)
                                        }
                                        className="p-1 rounded hover:bg-red-50 transition-colors flex-shrink-0"
                                        title="Delete note"
                                      >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-8">
                                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                  <p className="text-gray-500 text-sm">
                                    No notes yet
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
