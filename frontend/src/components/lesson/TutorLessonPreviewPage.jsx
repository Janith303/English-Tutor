import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TutorTopNav from "../tutor/TutorTopNav";
import { tutorProfile } from "../../data/tutorDashboardData";
import { getTutorLessonAuthoring } from "../../api/courseApi";

export default function TutorLessonPreviewPage() {
  const navigate = useNavigate();
  const { courseId, chapterId, lessonId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lesson, setLesson] = useState(null);

  useEffect(() => {
    const loadPreview = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getTutorLessonAuthoring(chapterId, lessonId);
        setLesson(data);
      } catch (previewError) {
        console.error("Failed to load lesson preview:", previewError);
        setError(
          previewError?.response?.data?.error ||
            "Could not load preview for this lesson.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [chapterId, lessonId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <TutorTopNav
        activePage="courses"
        onNavigate={() => {}}
        tutor={tutorProfile}
        onLogout={() => navigate("/")}
      />

      <div className="max-w-4xl mx-auto px-6 py-7">
        <button
          onClick={() =>
            navigate(
              `/tutor/courses/${courseId}/chapter/${chapterId}/lesson/${lessonId}/edit`,
            )
          }
          className="text-sm text-blue-600 hover:text-blue-700 font-semibold mb-4"
        >
          Back to Lesson Editor
        </button>

        {loading && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 text-sm text-gray-600">
            Loading preview...
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
              <div className="flex items-center justify-between gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {lesson.title}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                  {lesson.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{lesson.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600 mb-5">
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
                  Drip Delay: {lesson.drip_delay_days} day(s)
                </div>
              </div>

              <div className="prose max-w-none text-sm text-gray-800 whitespace-pre-wrap border border-gray-200 rounded-xl p-4 bg-gray-50">
                {lesson.content || "No lesson content yet."}
              </div>

              {lesson.lesson_link_url && (
                <a
                  href={lesson.lesson_link_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-4 text-sm text-blue-600 hover:text-blue-700"
                >
                  Open lesson link
                </a>
              )}

              {lesson.lesson_video_embed_url && (
                <a
                  href={lesson.lesson_video_embed_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-2 ml-4 text-sm text-blue-600 hover:text-blue-700"
                >
                  Open embedded video URL
                </a>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                Exercise Files
              </h2>
              {!lesson.exercise_files?.length && (
                <p className="text-sm text-gray-500">
                  No exercise files attached.
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
                  No quiz blocks attached.
                </p>
              )}

              <div className="space-y-4">
                {(lesson.quizzes || []).map((quiz, idx) => (
                  <div
                    key={quiz.id || idx}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {idx + 1}. {quiz.title}
                      </h3>
                      <span className="text-xs font-semibold text-gray-500">
                        Pass: {quiz.passing_score}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {quiz.instructions}
                    </p>

                    <div className="space-y-2">
                      {(quiz.questions || []).map((question, qIdx) => (
                        <div
                          key={question.id || qIdx}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                        >
                          <p className="text-sm font-medium text-gray-800 mb-1">
                            Q{qIdx + 1}. {question.question_text}
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>A. {question.option_a}</li>
                            <li>B. {question.option_b}</li>
                            <li>C. {question.option_c}</li>
                            <li>D. {question.option_d}</li>
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
