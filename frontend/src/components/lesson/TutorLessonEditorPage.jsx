import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import TutorTopNav from "../tutor/TutorTopNav";
import RichTextEditor from "../course/RichTextEditor";
import { tutorProfile } from "../../data/tutorDashboardData";
import {
  createTutorLessonQuiz,
  deleteTutorLessonFile,
  deleteTutorLessonQuiz,
  getTutorLessonAuthoring,
  updateTutorLessonAuthoring,
  updateTutorLessonQuiz,
  uploadTutorLessonFile,
} from "../../api/courseApi";

const defaultQuestion = (order = 1) => ({
  id: null,
  question_text: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_option: "A",
  order,
});

const defaultQuiz = (order = 1) => ({
  id: null,
  title: "",
  instructions: "",
  passing_score: 70,
  order,
  status: "DRAFT",
  questions: [defaultQuestion(1)],
});

const cardClass =
  "bg-white rounded-2xl border border-slate-200 shadow-sm p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-md";

const panelTitleClass = "text-xl font-bold text-black mb-7";

const labelClass = "block text-base font-semibold text-black mb-3";

const inputClass =
  "w-full rounded-lg border border-slate-400 bg-slate-50 px-4 py-3 text-base text-slate-700 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none";

const inputCompactClass =
  "rounded-lg border border-slate-400 bg-slate-50 px-4 py-2.5 text-base text-slate-700 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none";

const textareaClass = `${inputClass} resize-none`;

const selectClass =
  "w-full rounded-lg border border-slate-400 bg-slate-50 px-4 py-2.5 text-base text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none";

const quizBlockClass =
  "border border-slate-200 rounded-xl p-5 bg-slate-50 transition-all duration-200 hover:-translate-y-1 hover:shadow-sm";

const questionCardClass =
  "border border-slate-200 rounded-lg p-4 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm";

function mapQuizFromApi(quiz) {
  return {
    id: quiz.id,
    title: quiz.title || "",
    instructions: quiz.instructions || "",
    passing_score: Number(quiz.passing_score || 70),
    order: Number(quiz.order || 1),
    status: quiz.status || "DRAFT",
    questions: (quiz.questions || []).map((question, idx) => ({
      id: question.id,
      question_text: question.question_text || "",
      option_a: question.option_a || "",
      option_b: question.option_b || "",
      option_c: question.option_c || "",
      option_d: question.option_d || "",
      correct_option: question.correct_option || "A",
      order: Number(question.order || idx + 1),
    })),
  };
}

function hasQuizValidationErrors(quizzes) {
  for (const quiz of quizzes) {
    if (!quiz.title.trim()) {
      return "Each quiz needs a title.";
    }

    if (!quiz.questions.length) {
      return "Each quiz must contain at least one question.";
    }

    for (const question of quiz.questions) {
      if (!question.question_text.trim()) {
        return "Each question must include question text.";
      }

      const options = [
        question.option_a,
        question.option_b,
        question.option_c,
        question.option_d,
      ];
      if (options.some((value) => !String(value || "").trim())) {
        return "Each question must have all 4 options filled.";
      }

      if (!["A", "B", "C", "D"].includes(question.correct_option)) {
        return "Each question must define one correct option.";
      }
    }
  }

  return null;
}

function MediaUploadDropzone({
  inputId,
  title,
  accept,
  selectedFileName,
  helperText,
  onFileSelect,
}) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files?.[0] || null;
    if (!dropped) return;
    onFileSelect(dropped);
  };

  const handleChange = (event) => {
    const selected = event.target.files?.[0] || null;
    onFileSelect(selected);
  };

  return (
    <div>
      <p className="text-sm font-semibold text-black mb-3">{title}</p>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden ${
          dragging
            ? "border-indigo-500 bg-indigo-50 scale-[1.01] shadow-sm"
            : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50 hover:-translate-y-0.5 hover:shadow-sm"
        }`}
        style={{ minHeight: "150px" }}
      >
        <input
          id={inputId}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
        />

        <label
          htmlFor={inputId}
          className="flex flex-col items-center justify-center py-8 gap-2.5 px-4 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100">
            <svg
              className="w-5 h-5 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <p className="text-sm font-semibold text-black text-center tracking-wide">
            DRAG & DROP
          </p>
          <p className="text-sm text-slate-600 text-center leading-relaxed">
            {helperText}
          </p>

          {selectedFileName && (
            <p className="text-sm text-slate-700 font-medium text-center max-w-full truncate">
              {selectedFileName}
            </p>
          )}
        </label>
      </div>
    </div>
  );
}

export default function TutorLessonEditorPage() {
  const navigate = useNavigate();
  const { courseId, chapterId, lessonId } = useParams();

  const [activePage, setActivePage] = useState("courses");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [error, setError] = useState("");
  const [lastSaved, setLastSaved] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    duration_minutes: 15,
    credits_awarded: 10,
    required_credits_to_unlock: 0,
    status: "DRAFT",
    publish_at: "",
    drip_delay_days: 0,
    require_quiz_pass_for_completion: true,
    lesson_link_url: "",
    lesson_video_embed_url: "",
  });

  const [existingMedia, setExistingMedia] = useState({
    lesson_image_url: "",
    lesson_video_file_url: "",
  });
  const [lessonImageFile, setLessonImageFile] = useState(null);
  const [lessonVideoFile, setLessonVideoFile] = useState(null);

  const [exerciseFiles, setExerciseFiles] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [initialQuizIds, setInitialQuizIds] = useState([]);

  const lessonStats = useMemo(
    () => ({
      fileCount: exerciseFiles.length,
      quizCount: quizzes.length,
      questionCount: quizzes.reduce(
        (sum, quiz) => sum + quiz.questions.length,
        0,
      ),
    }),
    [exerciseFiles, quizzes],
  );

  const loadLesson = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getTutorLessonAuthoring(chapterId, lessonId);

      const publishAt = data.publish_at
        ? new Date(data.publish_at).toISOString().slice(0, 16)
        : "";

      setForm({
        title: data.title || "",
        description: data.description || "",
        content: data.content || "",
        duration_minutes: Number(data.duration_minutes || 15),
        credits_awarded: Number(data.credits_awarded || 0),
        required_credits_to_unlock: Number(
          data.required_credits_to_unlock || 0,
        ),
        status: data.status || "DRAFT",
        publish_at: publishAt,
        drip_delay_days: Number(data.drip_delay_days || 0),
        require_quiz_pass_for_completion:
          data.require_quiz_pass_for_completion !== false,
        lesson_link_url: data.lesson_link_url || "",
        lesson_video_embed_url: data.lesson_video_embed_url || "",
      });

      setExistingMedia({
        lesson_image_url: data.lesson_image_url || "",
        lesson_video_file_url: data.lesson_video_file_url || "",
      });

      setExerciseFiles(data.exercise_files || []);

      const mappedQuizzes = (data.quizzes || []).map(mapQuizFromApi);
      setQuizzes(mappedQuizzes);
      setInitialQuizIds(mappedQuizzes.map((quiz) => quiz.id).filter(Boolean));
    } catch (loadError) {
      console.error("Failed to load lesson authoring data:", loadError);
      setError(
        loadError?.response?.data?.error ||
          "Could not load lesson details. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLesson();
  }, [chapterId, lessonId]);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addQuiz = () => {
    setQuizzes((prev) => [...prev, defaultQuiz(prev.length + 1)]);
  };

  const removeQuiz = (quizIndex) => {
    setQuizzes((prev) => prev.filter((_, idx) => idx !== quizIndex));
  };

  const updateQuizField = (quizIndex, field, value) => {
    setQuizzes((prev) =>
      prev.map((quiz, idx) =>
        idx === quizIndex ? { ...quiz, [field]: value } : quiz,
      ),
    );
  };

  const addQuestion = (quizIndex) => {
    setQuizzes((prev) =>
      prev.map((quiz, idx) => {
        if (idx !== quizIndex) return quiz;
        return {
          ...quiz,
          questions: [
            ...quiz.questions,
            defaultQuestion(quiz.questions.length + 1),
          ],
        };
      }),
    );
  };

  const removeQuestion = (quizIndex, questionIndex) => {
    setQuizzes((prev) =>
      prev.map((quiz, idx) => {
        if (idx !== quizIndex) return quiz;
        if (quiz.questions.length === 1) return quiz;
        const questions = quiz.questions.filter(
          (_, qIdx) => qIdx !== questionIndex,
        );
        return {
          ...quiz,
          questions: questions.map((question, qIdx) => ({
            ...question,
            order: qIdx + 1,
          })),
        };
      }),
    );
  };

  const updateQuestionField = (quizIndex, questionIndex, field, value) => {
    setQuizzes((prev) =>
      prev.map((quiz, idx) => {
        if (idx !== quizIndex) return quiz;
        return {
          ...quiz,
          questions: quiz.questions.map((question, qIdx) =>
            qIdx === questionIndex ? { ...question, [field]: value } : question,
          ),
        };
      }),
    );
  };

  const handleExerciseFileUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadingFile(true);
    try {
      const created = await uploadTutorLessonFile(lessonId, {
        file,
        display_name: file.name,
      });
      setExerciseFiles((prev) => [...prev, created]);
    } catch (uploadError) {
      alert(
        uploadError?.response?.data?.error ||
          "Failed to upload exercise file. Please try again.",
      );
    } finally {
      setUploadingFile(false);
    }
  };

  const handleExerciseFileDelete = async (fileId) => {
    if (!window.confirm("Delete this exercise file?")) return;

    try {
      await deleteTutorLessonFile(lessonId, fileId);
      setExerciseFiles((prev) => prev.filter((item) => item.id !== fileId));
    } catch (deleteError) {
      alert(
        deleteError?.response?.data?.error || "Failed to delete exercise file.",
      );
    }
  };

  const syncQuizzes = async (statusForSave) => {
    const currentQuizIds = [];
    const savedQuizzes = [];

    for (let quizIndex = 0; quizIndex < quizzes.length; quizIndex += 1) {
      const quiz = quizzes[quizIndex];
      const payload = {
        title: quiz.title,
        instructions: quiz.instructions,
        passing_score: Number(quiz.passing_score || 70),
        order: quizIndex + 1,
        status: statusForSave,
        questions: quiz.questions.map((question, questionIndex) => ({
          id: question.id || undefined,
          question_text: question.question_text,
          option_a: question.option_a,
          option_b: question.option_b,
          option_c: question.option_c,
          option_d: question.option_d,
          correct_option: question.correct_option,
          order: questionIndex + 1,
        })),
      };

      let savedQuiz;
      if (quiz.id) {
        savedQuiz = await updateTutorLessonQuiz(lessonId, quiz.id, payload);
      } else {
        savedQuiz = await createTutorLessonQuiz(lessonId, payload);
      }
      currentQuizIds.push(savedQuiz.id);
      savedQuizzes.push(mapQuizFromApi(savedQuiz));
    }

    const deletedIds = initialQuizIds.filter(
      (id) => !currentQuizIds.includes(id),
    );
    for (const quizId of deletedIds) {
      await deleteTutorLessonQuiz(lessonId, quizId);
    }

    if (!currentQuizIds.length) {
      setInitialQuizIds([]);
      setQuizzes([]);
      return;
    }

    setInitialQuizIds(currentQuizIds);
    setQuizzes(savedQuizzes);
  };

  const saveLesson = async (statusForSave) => {
    const quizError = hasQuizValidationErrors(quizzes);
    if (quizError) {
      alert(quizError);
      return false;
    }

    if (!form.title.trim()) {
      alert("Lesson title is required.");
      return false;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description,
        content: form.content,
        duration_minutes: Number(form.duration_minutes || 1),
        credits_awarded: Number(form.credits_awarded || 0),
        required_credits_to_unlock: Number(
          form.required_credits_to_unlock || 0,
        ),
        status: statusForSave,
      };

      const publishAt = form.publish_at || null;
      const dripDelayDays = Number(form.drip_delay_days || 0);
      const hasAvailabilityRules = Boolean(publishAt) || dripDelayDays > 0;

      if (statusForSave === "PUBLISHED" || hasAvailabilityRules) {
        payload.publish_at = publishAt;
        payload.drip_delay_days = dripDelayDays;

        // This flag only matters when quizzes exist.
        if (quizzes.length > 0) {
          payload.require_quiz_pass_for_completion =
            !!form.require_quiz_pass_for_completion;
        }
      }

      const lessonLinkUrl = String(form.lesson_link_url || "").trim();
      if (lessonLinkUrl) {
        payload.lesson_link_url = lessonLinkUrl;
      }

      const lessonVideoEmbedUrl = String(
        form.lesson_video_embed_url || "",
      ).trim();
      if (lessonVideoEmbedUrl) {
        payload.lesson_video_embed_url = lessonVideoEmbedUrl;
      }

      if (lessonImageFile) {
        payload.lesson_image = lessonImageFile;
      }
      if (lessonVideoFile) {
        payload.lesson_video_file = lessonVideoFile;
      }

      const savedLesson = await updateTutorLessonAuthoring(
        chapterId,
        lessonId,
        payload,
      );

      if (quizzes.length) {
        await syncQuizzes(statusForSave);
      } else {
        for (const quizId of initialQuizIds) {
          await deleteTutorLessonQuiz(lessonId, quizId);
        }
        setInitialQuizIds([]);
      }

      setForm((prev) => ({
        ...prev,
        status: savedLesson.status || statusForSave,
      }));

      const now = new Date();
      setLastSaved(
        `Last saved at ${now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
      );
      return true;
    } catch (saveError) {
      console.error("Failed to save lesson:", saveError);
      alert(
        saveError?.response?.data?.error ||
          "Failed to save lesson. Please check your fields.",
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TutorTopNav
          activePage={activePage}
          onNavigate={setActivePage}
          tutor={tutorProfile}
          onLogout={() => navigate("/")}
        />
        <div className="max-w-5xl mx-auto px-8 py-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-base text-black">
            Loading lesson editor...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TutorTopNav
        activePage={activePage}
        onNavigate={setActivePage}
        tutor={tutorProfile}
        onLogout={() => navigate("/")}
      />

      <div className="max-w-5xl mx-auto px-8 py-10 text-base">
        <div className="flex flex-wrap items-start justify-between gap-6 mb-12">
          <div>
            <button
              onClick={() => {
                if (window.history.state?.idx > 0) {
                  navigate(-1);
                  return;
                }
                navigate(`/edit-course?courseId=${courseId}`);
              }}
              className="flex items-center gap-2 text-slate-700 hover:text-black transition-colors"
            >
              &lt; Back to Course Structure
            </button>
            <h1 className="text-4xl font-bold text-black mt-8">
              Lesson Authoring
            </h1>
            <p className="text-base text-black mt-6">
              Fill the fields below to build one lesson. Required fields are
              marked clearly.
            </p>
          </div>

          <div className="flex items-center">
            <button
              onClick={() => saveLesson("PUBLISHED")}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Publish Lesson
            </button>
          </div>
        </div>

        {lastSaved && (
          <div className="text-sm text-slate-700 mb-6">{lastSaved}</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-4 text-base mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div className={cardClass}>
              <h2 className={panelTitleClass}>Lesson Basics (Required)</h2>

              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Lesson Title *</label>
                  <p className="text-sm text-slate-600 mb-2">
                    Example: "Past Tense Verbs in Daily Conversations"
                  </p>
                  <input
                    value={form.title}
                    onChange={(event) =>
                      handleFormChange("title", event.target.value)
                    }
                    placeholder="Enter a clear lesson name learners will see"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Lesson Description *</label>
                  <p className="text-sm text-slate-600 mb-2">
                    Short summary shown before learners open the lesson.
                  </p>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      handleFormChange("description", event.target.value)
                    }
                    rows={3}
                    placeholder="What will learners learn in this lesson?"
                    className={textareaClass}
                  />
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <h2 className={panelTitleClass}>Lesson Content (Main Body)</h2>
              <p className="text-sm text-slate-600 mb-5">
                Main teaching content. You can write text, add links, and
                structure notes for learners.
              </p>
              <RichTextEditor
                name="content"
                value={form.content}
                onChange={(value) => handleFormChange("content", value)}
                placeholder="Write the full lesson script, examples, and activities learners should follow"
              />
            </div>

            <div className={cardClass}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-black">
                  Quiz Blocks (Optional)
                </h2>
                <button
                  onClick={addQuiz}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg text-indigo-600 hover:border-indigo-600 hover:bg-indigo-50 transition-colors font-medium"
                >
                  <Plus size={18} />
                  Add Quiz Block
                </button>
              </div>

              <p className="text-sm text-slate-600 mb-4">
                Add one or more quizzes only if needed. If quiz pass is enabled,
                learners must pass to complete this lesson.
              </p>

              {!quizzes.length && (
                <p className="text-base text-black">
                  No quiz blocks added yet.
                </p>
              )}

              <div className="space-y-6">
                {quizzes.map((quiz, quizIndex) => (
                  <div
                    key={`quiz-${quiz.id || quizIndex}`}
                    className={quizBlockClass}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-black">
                        Quiz {quizIndex + 1}
                      </h3>
                      <button
                        onClick={() => removeQuiz(quizIndex)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove quiz"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className={labelClass}>Quiz Title *</label>
                        <input
                          value={quiz.title}
                          onChange={(event) =>
                            updateQuizField(
                              quizIndex,
                              "title",
                              event.target.value,
                            )
                          }
                          placeholder="Example: Quick Check - Past Tense"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Pass Mark (%) *</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={quiz.passing_score}
                          onChange={(event) =>
                            updateQuizField(
                              quizIndex,
                              "passing_score",
                              Number(event.target.value || 0),
                            )
                          }
                          placeholder="Example: 70"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <textarea
                      value={quiz.instructions}
                      onChange={(event) =>
                        updateQuizField(
                          quizIndex,
                          "instructions",
                          event.target.value,
                        )
                      }
                      rows={2}
                      placeholder="Quiz instructions for learners (optional)"
                      className={`${textareaClass} mb-4`}
                    />

                    <div className="space-y-4">
                      {quiz.questions.map((question, questionIndex) => (
                        <div
                          key={`question-${question.id || questionIndex}`}
                          className={questionCardClass}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-base font-bold text-black">
                              Question {questionIndex + 1}
                            </p>
                            <button
                              onClick={() =>
                                removeQuestion(quizIndex, questionIndex)
                              }
                              className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              title="Remove question"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <textarea
                            value={question.question_text}
                            onChange={(event) =>
                              updateQuestionField(
                                quizIndex,
                                questionIndex,
                                "question_text",
                                event.target.value,
                              )
                            }
                            rows={2}
                            placeholder="Question text *"
                            className={`${textareaClass} mb-3`}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <input
                              value={question.option_a}
                              onChange={(event) =>
                                updateQuestionField(
                                  quizIndex,
                                  questionIndex,
                                  "option_a",
                                  event.target.value,
                                )
                              }
                              placeholder="Option A *"
                              className={inputCompactClass}
                            />
                            <input
                              value={question.option_b}
                              onChange={(event) =>
                                updateQuestionField(
                                  quizIndex,
                                  questionIndex,
                                  "option_b",
                                  event.target.value,
                                )
                              }
                              placeholder="Option B *"
                              className={inputCompactClass}
                            />
                            <input
                              value={question.option_c}
                              onChange={(event) =>
                                updateQuestionField(
                                  quizIndex,
                                  questionIndex,
                                  "option_c",
                                  event.target.value,
                                )
                              }
                              placeholder="Option C *"
                              className={inputCompactClass}
                            />
                            <input
                              value={question.option_d}
                              onChange={(event) =>
                                updateQuestionField(
                                  quizIndex,
                                  questionIndex,
                                  "option_d",
                                  event.target.value,
                                )
                              }
                              placeholder="Option D *"
                              className={inputCompactClass}
                            />
                          </div>

                          <div>
                            <label className={labelClass}>
                              Correct Answer *
                            </label>
                            <select
                              value={question.correct_option}
                              onChange={(event) =>
                                updateQuestionField(
                                  quizIndex,
                                  questionIndex,
                                  "correct_option",
                                  event.target.value,
                                )
                              }
                              className={selectClass}
                            >
                              <option value="A">Correct: Option A</option>
                              <option value="B">Correct: Option B</option>
                              <option value="C">Correct: Option C</option>
                              <option value="D">Correct: Option D</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => addQuestion(quizIndex)}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 rounded-lg text-indigo-600 hover:border-indigo-600 hover:bg-indigo-50 transition-colors font-medium"
                    >
                      <Plus size={18} />
                      Add Question to This Quiz
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <div className={cardClass}>
              <h2 className={panelTitleClass}>
                Publishing & Availability Rules (Optional)
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                Leave these blank to use default availability behavior.
              </p>

              <div className="space-y-6">
                <div>
                  <label className={labelClass}>
                    Publish Date & Time (Optional)
                  </label>
                  <p className="text-sm text-slate-600 mb-2">
                    Leave empty to publish immediately when you click "Publish
                    Lesson".
                  </p>
                  <input
                    type="datetime-local"
                    value={form.publish_at}
                    onChange={(event) =>
                      handleFormChange("publish_at", event.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Drip Delay After Enrollment (Days)
                  </label>
                  <p className="text-sm text-slate-600 mb-2">
                    Example: 3 means learners can open this lesson 3 days after
                    enrolling.
                  </p>
                  <input
                    type="number"
                    min={0}
                    value={form.drip_delay_days}
                    onChange={(event) =>
                      handleFormChange(
                        "drip_delay_days",
                        Number(event.target.value || 0),
                      )
                    }
                    className={inputClass}
                  />
                </div>

                <label className="flex items-start gap-3 text-base text-black font-semibold">
                  <input
                    type="checkbox"
                    checked={form.require_quiz_pass_for_completion}
                    onChange={(event) =>
                      handleFormChange(
                        "require_quiz_pass_for_completion",
                        event.target.checked,
                      )
                    }
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Require learners to pass quiz before lesson completion (only
                  when quiz blocks exist)
                </label>
              </div>
            </div>

            <div className={cardClass}>
              <h2 className={panelTitleClass}>Lesson Settings</h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>
                      Estimated Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.duration_minutes}
                      onChange={(event) =>
                        handleFormChange(
                          "duration_minutes",
                          Number(event.target.value || 1),
                        )
                      }
                      placeholder="Example: 20"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Credits Awarded After Completion
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={form.credits_awarded}
                      onChange={(event) =>
                        handleFormChange(
                          "credits_awarded",
                          Number(event.target.value || 0),
                        )
                      }
                      placeholder="Example: 10"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Credits Required to Unlock This Lesson
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.required_credits_to_unlock}
                    onChange={(event) =>
                      handleFormChange(
                        "required_credits_to_unlock",
                        Number(event.target.value || 0),
                      )
                    }
                    placeholder="Example: 30 (use 0 if no credit lock)"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    External Lesson Link (Optional)
                  </label>
                  <input
                    value={form.lesson_link_url}
                    onChange={(event) =>
                      handleFormChange("lesson_link_url", event.target.value)
                    }
                    placeholder="Example: https://docs.google.com/..."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Embedded Video URL (Optional)
                  </label>
                  <input
                    value={form.lesson_video_embed_url}
                    onChange={(event) =>
                      handleFormChange(
                        "lesson_video_embed_url",
                        event.target.value,
                      )
                    }
                    placeholder="Example: YouTube embed link"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <h2 className={panelTitleClass}>Media Uploads (Optional)</h2>
              <p className="text-sm text-slate-600 mb-4">
                Add files only if you want extra lesson media.
              </p>
              <div className="space-y-6">
                <div>
                  <MediaUploadDropzone
                    inputId="lesson-cover-image-upload"
                    title="Lesson Cover Image (Optional)"
                    accept="image/*"
                    selectedFileName={lessonImageFile?.name}
                    helperText="or click to browse image files from your computer"
                    onFileSelect={setLessonImageFile}
                  />
                  <p className="text-sm text-slate-600 mt-2 text-center">
                    JPG, PNG, WebP recommended
                  </p>
                  {existingMedia.lesson_image_url && (
                    <a
                      href={existingMedia.lesson_image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-sm text-indigo-600 mt-2 text-center"
                    >
                      View current image
                    </a>
                  )}
                </div>

                <div>
                  <MediaUploadDropzone
                    inputId="lesson-video-upload"
                    title="Upload Lesson Video File (Optional)"
                    accept="video/*"
                    selectedFileName={lessonVideoFile?.name}
                    helperText="or click to browse video files from your computer"
                    onFileSelect={setLessonVideoFile}
                  />
                  <p className="text-sm text-slate-600 mt-2 text-center">
                    MP4 recommended for broader compatibility
                  </p>
                  {existingMedia.lesson_video_file_url && (
                    <a
                      href={existingMedia.lesson_video_file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-sm text-indigo-600 mt-2 text-center"
                    >
                      View current video
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <h2 className={panelTitleClass}>
                Downloadable Exercise Files (Optional) ({lessonStats.fileCount})
              </h2>

              <p className="text-sm text-slate-600 mb-2">
                Upload worksheets, answer sheets, or practice documents learners
                can download.
              </p>

              <input
                type="file"
                onChange={handleExerciseFileUpload}
                disabled={uploadingFile}
                className="mb-4 block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border file:border-indigo-600 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:border-indigo-700 hover:file:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:file:border-slate-300 disabled:file:bg-slate-300"
              />

              <div className="space-y-3">
                {exerciseFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between gap-2 border border-slate-200 rounded-lg px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-base text-indigo-600 hover:text-indigo-700 truncate"
                    >
                      {file.display_name || "Exercise File"}
                    </a>
                    <button
                      onClick={() => handleExerciseFileDelete(file.id)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete file"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {!exerciseFiles.length && (
                  <p className="text-base text-black">No files uploaded yet.</p>
                )}
              </div>
            </div>

            <div className={cardClass}>
              <h2 className="text-lg font-bold text-black mb-2">Snapshot</h2>
              <div className="text-base text-black space-y-2">
                <p>Status: {form.status}</p>
                <p>Quizzes: {lessonStats.quizCount}</p>
                <p>Questions: {lessonStats.questionCount}</p>
                <p>Exercise files: {lessonStats.fileCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
