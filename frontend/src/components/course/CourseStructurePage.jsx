import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createTutorChapter,
  createTutorLesson,
  deleteTutorChapter,
  deleteTutorLesson,
  getTutorChapters,
  updateTutorChapter,
  updateTutorLesson,
} from "../../api/courseApi";

const helperTextClass = "text-base text-black mt-2";

const inputClass =
  "w-full rounded-lg border border-slate-400 bg-slate-50 px-4 py-3 text-base text-slate-700 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none";

function DragHandle({ className = "" }) {
  return (
    <svg
      className={`w-4 h-4 ${className}`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <circle cx="7" cy="4" r="1.4" />
      <circle cx="13" cy="4" r="1.4" />
      <circle cx="7" cy="10" r="1.4" />
      <circle cx="13" cy="10" r="1.4" />
      <circle cx="7" cy="16" r="1.4" />
      <circle cx="13" cy="16" r="1.4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg
      className="w-4 h-4 text-slate-400 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function RenameModal({ label, defaultValue, onConfirm, onCancel }) {
  const [val, setVal] = useState(defaultValue);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-7 w-full max-w-sm mx-4">
        <h3 className="text-xl font-bold text-black mb-5">Rename {label}</h3>
        <input
          autoFocus
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && val.trim()) onConfirm(val.trim());
            if (e.key === "Escape") onCancel();
          }}
          className={`${inputClass} mb-5`}
          maxLength={80}
        />
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 text-base text-slate-600 hover:text-black font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!val.trim()}
            onClick={() => val.trim() && onConfirm(val.trim())}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-base font-semibold rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function LessonRow({ lesson, chapterId, onDelete, onRename, onOpen }) {
  return (
    <div
      className="flex items-center gap-3 px-5 py-4 bg-white hover:bg-slate-50 border-b border-slate-200 last:border-0 group transition-colors"
      style={{ cursor: "default" }}
    >
      <span className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-black transition-colors flex-shrink-0">
        <DragHandle />
      </span>

      <DocIcon />

      <span
        onClick={() => onOpen(chapterId, lesson.id)}
        className="flex-1 text-base text-black font-semibold cursor-pointer hover:text-slate-700 transition-colors select-none"
        title="Click to edit lesson content"
      >
        {lesson.title}
      </span>

      <button
        onClick={() => onRename(lesson)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-black text-sm font-semibold"
        title="Rename lesson"
      >
        Rename
      </button>

      <button
        onClick={() => onDelete(chapterId, lesson.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-500"
        title="Delete lesson"
      >
        <TrashIcon />
      </button>
    </div>
  );
}

function AddLessonBtn({ onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-2 py-3.5 bg-white hover:bg-indigo-50 disabled:opacity-40 text-indigo-600 hover:text-indigo-700 text-base font-medium transition-colors border-t border-slate-200"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
      New lesson
    </button>
  );
}

function ChapterBlock({
  chapter,
  onToggle,
  onDeleteChapter,
  onAddLesson,
  onDeleteLesson,
  onOpenLesson,
  onRenameChapter,
  onRenameLesson,
  disabled,
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center gap-3 px-5 py-4 bg-white group border-b border-slate-200">
        <span className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-black transition-colors flex-shrink-0">
          <DragHandle />
        </span>

        <button
          onClick={() => onToggle(chapter.id)}
          className="text-slate-600 hover:text-black transition-colors flex-shrink-0"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${chapter.collapsed ? "-rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <span
          onClick={() => onRenameChapter(chapter)}
          className="flex-1 text-base font-semibold text-black cursor-pointer hover:text-slate-700 transition-colors select-none"
          title="Click to rename"
        >
          {chapter.title}
        </span>

        <span className="text-sm text-slate-600 mr-2 tabular-nums">
          {chapter.lessons.length} lesson
          {chapter.lessons.length !== 1 ? "s" : ""}
        </span>

        <button
          onClick={() => onDeleteChapter(chapter.id)}
          disabled={disabled}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 disabled:opacity-20"
          title="Delete chapter"
        >
          <TrashIcon />
        </button>
      </div>

      {!chapter.collapsed && (
        <div className="border-t border-slate-200">
          {chapter.lessons.length === 0 && (
            <p className="text-sm text-slate-600 py-4 text-center">
              No lessons yet
            </p>
          )}
          {chapter.lessons.map((lesson) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              chapterId={chapter.id}
              onDelete={onDeleteLesson}
              onOpen={onOpenLesson}
              onRename={(l) => onRenameLesson(chapter.id, l)}
            />
          ))}
          <AddLessonBtn
            onClick={() => onAddLesson(chapter.id)}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}

function normalizeChapters(raw = []) {
  return raw.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    order: chapter.order,
    collapsed: false,
    lessons: (chapter.lessons || []).map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      order: lesson.order,
      duration_minutes: lesson.duration_minutes,
      credits_awarded: lesson.credits_awarded,
      required_credits_to_unlock: lesson.required_credits_to_unlock,
    })),
  }));
}

export default function CourseStructurePage({ onBack, courseName, courseId }) {
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [renaming, setRenaming] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const totalLessons = useMemo(
    () => chapters.reduce((sum, c) => sum + c.lessons.length, 0),
    [chapters],
  );

  useEffect(() => {
    const load = async () => {
      if (!courseId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const data = await getTutorChapters(courseId);
        setChapters(normalizeChapters(data));
      } catch (err) {
        console.error("Failed to load chapters:", err);
        setError(
          err?.response?.data?.error || "Unable to load course structure.",
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [courseId]);

  const refreshChapters = async () => {
    const data = await getTutorChapters(courseId);
    setChapters(normalizeChapters(data));
  };

  const addChapter = async () => {
    if (!courseId) return;
    setSaving(true);
    try {
      await createTutorChapter(courseId, {
        title: `Chapter ${chapters.length + 1}`,
      });
      await refreshChapters();
    } catch (err) {
      alert(
        JSON.stringify(
          err?.response?.data || "Failed to create chapter. Please try again.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteChapterById = async (chapterId) => {
    if (!window.confirm("Delete this chapter and all its lessons?")) return;
    setSaving(true);
    try {
      await deleteTutorChapter(courseId, chapterId);
      await refreshChapters();
    } catch (err) {
      alert(
        JSON.stringify(
          err?.response?.data || "Failed to delete chapter. Please try again.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleChapter = (chapterId) => {
    setChapters((prev) =>
      prev.map((c) =>
        c.id === chapterId ? { ...c, collapsed: !c.collapsed } : c,
      ),
    );
  };

  const renameChapter = (chapter) =>
    setRenaming({ type: "chapter", item: chapter });

  const confirmRenameChapter = async (newTitle) => {
    setSaving(true);
    try {
      await updateTutorChapter(courseId, renaming.item.id, { title: newTitle });
      await refreshChapters();
      setRenaming(null);
    } catch (err) {
      alert(
        JSON.stringify(
          err?.response?.data || "Failed to rename chapter. Please try again.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const addLesson = async (chapterId) => {
    const chapter = chapters.find((c) => c.id === chapterId);
    const lessonCount = chapter?.lessons?.length || 0;

    setSaving(true);
    try {
      await createTutorLesson(chapterId, {
        title: `Lesson ${lessonCount + 1}`,
        duration_minutes: 15,
        credits_awarded: 10,
        required_credits_to_unlock: 0,
      });
      await refreshChapters();
    } catch (err) {
      alert(
        JSON.stringify(
          err?.response?.data || "Failed to create lesson. Please try again.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteLessonById = async (chapterId, lessonId) => {
    setSaving(true);
    try {
      await deleteTutorLesson(chapterId, lessonId);
      await refreshChapters();
    } catch (err) {
      alert(
        JSON.stringify(
          err?.response?.data || "Failed to delete lesson. Please try again.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const renameLesson = (chapterId, lesson) =>
    setRenaming({ type: "lesson", chapterId, item: lesson });

  const openLessonEditor = (chapterId, lessonId) => {
    if (!courseId) return;
    navigate(
      `/tutor/courses/${courseId}/chapter/${chapterId}/lesson/${lessonId}/edit`,
    );
  };

  const confirmRenameLesson = async (newTitle) => {
    setSaving(true);
    try {
      await updateTutorLesson(renaming.chapterId, renaming.item.id, {
        title: newTitle,
      });
      await refreshChapters();
      setRenaming(null);
    } catch (err) {
      alert(
        JSON.stringify(
          err?.response?.data || "Failed to rename lesson. Please try again.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 w-full px-0 py-0 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-slate-700 hover:text-black transition-colors flex-shrink-0"
            title="Back"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-4xl font-bold text-black mt-1">
              Course Structure
            </h1>
            <p className={helperTextClass}>{courseName}</p>
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-base text-slate-700">
            Loading chapters and lessons...
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 text-red-700 rounded-2xl border border-red-100 p-6 text-base">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div>
              <button
                onClick={addChapter}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 rounded-lg text-indigo-600 hover:border-indigo-600 hover:bg-indigo-50 transition-colors font-semibold disabled:opacity-40"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New chapter
              </button>
            </div>

            {chapters.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 border-2 border-dashed border-slate-300 rounded-2xl bg-white">
                <p className="text-slate-600 text-base">
                  No chapters yet. Add your first chapter above.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {chapters.map((chapter) => (
                  <ChapterBlock
                    key={chapter.id}
                    chapter={chapter}
                    onToggle={toggleChapter}
                    onDeleteChapter={deleteChapterById}
                    onAddLesson={addLesson}
                    onDeleteLesson={deleteLessonById}
                    onOpenLesson={openLessonEditor}
                    onRenameChapter={renameChapter}
                    onRenameLesson={renameLesson}
                    disabled={saving}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <div className="border-t border-slate-200 bg-white px-8 py-5 flex items-center justify-between gap-3 mt-6">
        <span className="text-sm text-slate-600 font-semibold">
          {chapters.length} chapter(s) · {totalLessons} lesson(s)
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
          >
            Back
          </button>
          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>

      {renaming && (
        <RenameModal
          label={renaming.type === "chapter" ? "Chapter" : "Lesson"}
          defaultValue={renaming.item.title}
          onConfirm={
            renaming.type === "chapter"
              ? confirmRenameChapter
              : confirmRenameLesson
          }
          onCancel={() => setRenaming(null)}
        />
      )}
    </div>
  );
}
