import { useState, useRef } from "react";
import { mockStudent } from "../../data/mockCourses";

let _id = 100;
const uid = () => `id-${++_id}`;
const INITIAL_CHAPTERS = [
  {
    id: "ch-1",
    title: "Chapter One",
    collapsed: false,
    lessons: [
      { id: "ls-1-1", title: "Lesson One" },
      { id: "ls-1-2", title: "Lesson Two" },
      { id: "ls-1-3", title: "Lesson Three" },
    ],
  },
  {
    id: "ch-2",
    title: "Chapter Two",
    collapsed: false,
    lessons: [
      { id: "ls-2-1", title: "Lesson One" },
      { id: "ls-2-2", title: "Lesson Two" },
    ],
  },
];

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
      className="w-4 h-4 text-gray-400 flex-shrink-0"
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
  const ref = useRef();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-full max-w-sm mx-4">
        <h3 className="font-bold text-gray-900 text-base mb-4">
          Rename {label}
        </h3>
        <input
          ref={ref}
          autoFocus
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && val.trim()) onConfirm(val.trim());
            if (e.key === "Escape") onCancel();
          }}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-400 bg-gray-50 mb-4"
          maxLength={80}
        />
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-400 hover:text-gray-600 font-medium"
          >
            Cancel
          </button>
          <button
            disabled={!val.trim()}
            onClick={() => val.trim() && onConfirm(val.trim())}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function LessonRow({ lesson, chapterId, onDelete, onRename, dragProps }) {
  return (
    <div
      className="flex items-center gap-3 px-5 py-3.5 bg-white hover:bg-gray-100 border-b border-gray-200 last:border-0 group transition-colors"
      style={{ cursor: "default" }}
    >
      <span
        {...dragProps}
        className="cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-800 transition-colors flex-shrink-0"
      >
        <DragHandle />
      </span>

      <DocIcon />

      <span
        onClick={() => onRename(lesson)}
        className="flex-1 text-sm text-gray-900 font-medium cursor-pointer hover:text-gray-700 transition-colors select-none"
        title="Click to rename"
      >
        {lesson.title}
      </span>

      <button
        onClick={() => onDelete(chapterId, lesson.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-400"
        title="Delete lesson"
      >
        <TrashIcon />
      </button>
    </div>
  );
}

function AddLessonBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 py-3.5 bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors border-t border-gray-200"
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
  onRenameChapter,
  onRenameLesson,
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white">
      <div className="flex items-center gap-3 px-5 py-4 bg-white group border-b border-gray-200">
        <span className="cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-800 transition-colors flex-shrink-0">
          <DragHandle />
        </span>

        <button
          onClick={() => onToggle(chapter.id)}
          className="text-gray-600 hover:text-gray-800 transition-colors flex-shrink-0"
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
          className="flex-1 text-sm font-semibold text-gray-900 cursor-pointer hover:text-gray-700 transition-colors select-none"
          title="Click to rename"
        >
          {chapter.title}
        </span>

        <span className="text-xs text-gray-600 mr-2 tabular-nums">
          {chapter.lessons.length} lesson
          {chapter.lessons.length !== 1 ? "s" : ""}
        </span>

        <button
          onClick={() => onDeleteChapter(chapter.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
          title="Delete chapter"
        >
          <TrashIcon />
        </button>
      </div>

      {!chapter.collapsed && (
        <div className="border-t border-gray-200">
          {chapter.lessons.length === 0 && (
            <p className="text-xs text-gray-600 py-3 text-center">
              No lessons yet
            </p>
          )}
          {chapter.lessons.map((lesson) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              chapterId={chapter.id}
              onDelete={onDeleteLesson}
              onRename={(l) => onRenameLesson(chapter.id, l)}
              dragProps={{}}
            />
          ))}
          <AddLessonBtn onClick={() => onAddLesson(chapter.id)} />
        </div>
      )}
    </div>
  );
}

export default function CourseStructurePage({
  onBack,
  courseName = "Advanced Business English & Negotiation",
}) {
  const [chapters, setChapters] = useState(INITIAL_CHAPTERS);
  const [renaming, setRenaming] = useState(null);

  const addChapter = () => {
    setChapters((prev) => [
      ...prev,
      {
        id: uid(),
        title: `Chapter ${prev.length + 1}`,
        collapsed: false,
        lessons: [],
      },
    ]);
  };

  const deleteChapter = (chapterId) => {
    if (!window.confirm("Delete this chapter and all its lessons?")) return;
    setChapters((prev) => prev.filter((c) => c.id !== chapterId));
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

  const confirmRenameChapter = (newTitle) => {
    setChapters((prev) =>
      prev.map((c) =>
        c.id === renaming.item.id ? { ...c, title: newTitle } : c,
      ),
    );
    setRenaming(null);
  };

  const addLesson = (chapterId) => {
    setChapters((prev) =>
      prev.map((c) =>
        c.id === chapterId
          ? {
              ...c,
              lessons: [
                ...c.lessons,
                { id: uid(), title: `Lesson ${c.lessons.length + 1}` },
              ],
            }
          : c,
      ),
    );
  };

  const deleteLesson = (chapterId, lessonId) => {
    setChapters((prev) =>
      prev.map((c) =>
        c.id === chapterId
          ? { ...c, lessons: c.lessons.filter((l) => l.id !== lessonId) }
          : c,
      ),
    );
  };

  const renameLesson = (chapterId, lesson) =>
    setRenaming({ type: "lesson", chapterId, item: lesson });

  const confirmRenameLesson = (newTitle) => {
    setChapters((prev) =>
      prev.map((c) =>
        c.id === renaming.chapterId
          ? {
              ...c,
              lessons: c.lessons.map((l) =>
                l.id === renaming.item.id ? { ...l, title: newTitle } : l,
              ),
            }
          : c,
      ),
    );
    setRenaming(null);
  };

  const totalLessons = chapters.reduce((sum, c) => sum + c.lessons.length, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 w-full px-0 py-0 flex flex-col gap-0">
        <div className="flex items-center gap-0">
          <button
            onClick={onBack}
            className="text-gray-700 hover:text-gray-900 transition-colors flex-shrink-0"
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
          <h1 className="text-2xl font-bold text-gray-900">Course Structure</h1>
        </div>

        <div>
          <button
            onClick={addChapter}
            className="flex items-center gap-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-900 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex-shrink-0"
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
          <div className="flex flex-col items-center justify-center py-20 gap-4 border-2 border-dashed border-gray-200 rounded-2xl">
            <svg
              className="w-10 h-10 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <p className="text-gray-600 text-sm">
              No chapters yet. Add your first chapter above.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {chapters.map((chapter) => (
              <ChapterBlock
                key={chapter.id}
                chapter={chapter}
                onToggle={toggleChapter}
                onDeleteChapter={deleteChapter}
                onAddLesson={addLesson}
                onDeleteLesson={deleteLesson}
                onRenameChapter={renameChapter}
                onRenameLesson={renameLesson}
              />
            ))}

            <button
              onClick={addChapter}
              className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-2xl text-sm font-medium text-gray-600 hover:text-gray-800 transition-all group"
            >
              <span className="w-6 h-6 bg-gray-200 group-hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </span>
              Add Chapter
            </button>
          </div>
        )}
      </main>

      <div className="border-t border-gray-200 bg-white px-8 py-4 flex items-center justify-end gap-3">
        <button
          onClick={onBack}
          className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition-colors"
        >
          Discard
        </button>
        <button
          onClick={() => alert("Course structure saved!")}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Save
        </button>
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
