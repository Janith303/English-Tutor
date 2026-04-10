import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LearnerTopNav from "../learner/LearnerTopNav";
import privateApi from "../../api/axios";
import {
  completeStudentLessonChecked,
  getStudentLessonDetail,
  submitStudentLessonQuiz,
} from "../../api/courseApi";

const API_ORIGIN = (() => {
  try {
    return new URL(privateApi.defaults.baseURL || window.location.origin)
      .origin;
  } catch {
    return window.location.origin;
  }
})();

function resolveMediaUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_ORIGIN}${String(url).startsWith("/") ? "" : "/"}${url}`;
}

function toEmbeddableVideoUrl(url) {
  if (!url) return "";

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host.includes("youtube.com")) {
      if (parsed.pathname === "/watch") {
        const videoId = parsed.searchParams.get("v");
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        const videoId = parsed.pathname.split("/")[2];
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }

      if (parsed.pathname.startsWith("/embed/")) {
        return url;
      }
    }

    if (host === "youtu.be" || host.endsWith(".youtu.be")) {
      const videoId = parsed.pathname.replace("/", "");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    return url;
  } catch {
    return url;
  }
}

export default function LessonReaderPage() {
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams();

  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [submittingQuizId, setSubmittingQuizId] = useState(null);
  const [error, setError] = useState("");
  const [lesson, setLesson] = useState(null);
  const [answersByQuiz, setAnswersByQuiz] = useState({});

  const coverImageUrl = resolveMediaUrl(lesson?.lesson_image_url);
  const lessonVideoFileUrl = resolveMediaUrl(lesson?.lesson_video_file_url);
  const embeddedVideoUrl = toEmbeddableVideoUrl(lesson?.lesson_video_embed_url);

  const loadLesson = async () => {
    setLoading(true);
    setError("");

    try {
      const detail = await getStudentLessonDetail(courseId, lessonId);
      setLesson(detail);
    } catch (loadError) {
      console.error("Failed to load lesson:", loadError);
      setError(
        loadError?.response?.data?.error ||
          "Could not load this lesson right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLesson();
  }, [courseId, lessonId]);

  const setAnswer = (quizId, questionId, selectedOption) => {
    setAnswersByQuiz((prev) => ({
      ...prev,
      [quizId]: {
        ...(prev[quizId] || {}),
        [questionId]: selectedOption,
      },
    }));
  };

  const handleSubmitQuiz = async (quiz) => {
    const selectedAnswers = answersByQuiz[quiz.id] || {};
    const missingAnswer = quiz.questions.find(
      (question) => !selectedAnswers[question.id],
    );
    if (missingAnswer) {
      alert("Please answer every question before submitting this quiz.");
      return;
    }

    const payload = {
      answers: quiz.questions.map((question) => ({
        question_id: question.id,
        selected_option: selectedAnswers[question.id],
      })),
    };

    setSubmittingQuizId(quiz.id);
    try {
      await submitStudentLessonQuiz(courseId, lessonId, quiz.id, payload);
      await loadLesson();
    } catch (submitError) {
      alert(
        submitError?.response?.data?.error ||
          "Failed to submit quiz. Please try again.",
      );
    } finally {
      setSubmittingQuizId(null);
    }
  };

  const handleCompleteLesson = async () => {
    setCompleting(true);
    try {
      await completeStudentLessonChecked(courseId, lessonId);
      alert("Lesson completed successfully.");
      navigate(`/learning/${courseId}`);
    } catch (completeError) {
      alert(
        completeError?.response?.data?.error ||
          "Could not complete this lesson yet.",
      );
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LearnerTopNav />

      <div className="max-w-5xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(`/learning/${courseId}`)}
          className="mb-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Back to Learning Hub
        </button>

        {loading && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 text-sm text-gray-600">
            Loading lesson...
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && lesson && (
          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {lesson.title}
                </h1>
                {lesson.is_completed ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    Completed
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                    In Progress
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-4">{lesson.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 text-xs text-gray-600">
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  Duration: {lesson.duration_minutes} min
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  Credits: +{lesson.credits_awarded}
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  Unlock Credits: {lesson.required_credits_to_unlock}
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  Earned Credits: {lesson.earned_credits}
                </div>
              </div>

              {!lesson.is_unlocked && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700 mb-4">
                  This lesson is currently locked. Complete previous lessons and
                  credit requirements first.
                </div>
              )}

              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 whitespace-pre-wrap text-sm text-gray-800">
                {lesson.content || "No lesson content is available yet."}
              </div>

              {(coverImageUrl || lessonVideoFileUrl || embeddedVideoUrl) && (
                <div className="mt-4 space-y-4">
                  {coverImageUrl && (
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-2">
                        Lesson Cover Image
                      </p>
                      <img
                        src={coverImageUrl}
                        alt="Lesson cover"
                        className="w-full max-h-[360px] object-cover rounded-xl border border-gray-200 bg-gray-100"
                      />
                    </div>
                  )}

                  {lessonVideoFileUrl && (
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-2">
                        Lesson Video
                      </p>
                      <video
                        controls
                        className="w-full rounded-xl border border-gray-200 bg-black"
                        src={lessonVideoFileUrl}
                      >
                        Your browser does not support video playback.
                      </video>
                    </div>
                  )}

                  {embeddedVideoUrl && (
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-2">
                        Embedded Video
                      </p>
                      <div className="w-full aspect-video rounded-xl border border-gray-200 overflow-hidden bg-black">
                        <iframe
                          src={embeddedVideoUrl}
                          title="Embedded lesson video"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                {lesson.lesson_link_url && (
                  <a
                    href={lesson.lesson_link_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Open lesson link
                  </a>
                )}
                {lesson.lesson_video_file_url && (
                  <a
                    href={lessonVideoFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Open lesson video file
                  </a>
                )}
                {lesson.lesson_video_embed_url && (
                  <a
                    href={lesson.lesson_video_embed_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Open embedded video
                  </a>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                Exercise Files
              </h2>
              {!lesson.exercise_files?.length && (
                <p className="text-sm text-gray-500">
                  No exercise files for this lesson.
                </p>
              )}

              <div className="space-y-2">
                {(lesson.exercise_files || []).map((file) => (
                  <a
                    key={file.id}
                    href={file.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block border border-gray-200 rounded-lg px-3 py-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    {file.display_name || "Exercise file"}
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                Quiz Blocks
              </h2>
              {!lesson.quizzes?.length && (
                <p className="text-sm text-gray-500">
                  No quiz is attached to this lesson.
                </p>
              )}

              <div className="space-y-4">
                {(lesson.quizzes || []).map((quiz, idx) => (
                  <div
                    key={quiz.id || idx}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {idx + 1}. {quiz.title}
                      </h3>
                      <span className="text-xs font-semibold text-gray-500">
                        Pass {quiz.passing_score}%
                      </span>
                    </div>

                    {quiz.attempt && (
                      <div className="mb-2 text-xs">
                        <span
                          className={`font-semibold ${
                            quiz.attempt.passed
                              ? "text-green-600"
                              : "text-amber-700"
                          }`}
                        >
                          Latest: {quiz.attempt.score_percent}%
                        </span>
                      </div>
                    )}

                    <p className="text-sm text-gray-600 mb-3">
                      {quiz.instructions}
                    </p>

                    <div className="space-y-3">
                      {(quiz.questions || []).map((question, qIdx) => (
                        <div
                          key={question.id || qIdx}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                        >
                          <p className="text-sm font-medium text-gray-800 mb-2">
                            Q{qIdx + 1}. {question.question_text}
                          </p>

                          <div className="space-y-1 text-sm">
                            {["A", "B", "C", "D"].map((option) => (
                              <label
                                key={`${question.id}-${option}`}
                                className="flex items-center gap-2 text-gray-700"
                              >
                                <input
                                  type="radio"
                                  name={`quiz-${quiz.id}-question-${question.id}`}
                                  value={option}
                                  checked={
                                    (answersByQuiz[quiz.id] || {})[
                                      question.id
                                    ] === option
                                  }
                                  onChange={() =>
                                    setAnswer(quiz.id, question.id, option)
                                  }
                                />
                                <span>
                                  {option}.{" "}
                                  {question[`option_${option.toLowerCase()}`]}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleSubmitQuiz(quiz)}
                      disabled={
                        submittingQuizId === quiz.id || !lesson.is_unlocked
                      }
                      className="mt-3 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50"
                    >
                      {submittingQuizId === quiz.id
                        ? "Submitting..."
                        : "Submit Quiz"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {!lesson.is_completed && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Complete Lesson
                  </h2>
                  <p className="text-sm text-gray-600">
                    Completion checks sequential unlock, credits, drip rule, and
                    quiz pass if required.
                  </p>
                </div>
                <button
                  onClick={handleCompleteLesson}
                  disabled={completing || !lesson.can_complete}
                  className="px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold disabled:opacity-50"
                >
                  {completing ? "Completing..." : "Mark as Completed"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
