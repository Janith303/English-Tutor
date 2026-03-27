import { LEVEL_THRESHOLDS } from "../../data/mockCourses";

export default function CreditProgressPanel({ student }) {
  const thresholdInfo = LEVEL_THRESHOLDS[student.level];
  const earned = student.earnedCredits;
  const required = thresholdInfo.next;
  const progress = required ? Math.min((earned / required) * 100, 100) : 100;
  const creditGap = required ? Math.max(required - earned, 0) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-bold text-gray-900 mb-4 text-base">Your Progress</h3>

      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Earned Credits</p>
          <p className="text-2xl font-bold text-blue-600">{earned}</p>
        </div>
        {thresholdInfo.nextLevel && (
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-0.5">Next Level</p>
            <span className="bg-blue-50 text-blue-600 text-sm font-semibold px-3 py-1 rounded-full">
              {thresholdInfo.nextLevel}
            </span>
          </div>
        )}
      </div>

      {required && (
        <>
          <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>{earned} earned</span>
            <span>{required} required</span>
          </div>

          <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
            <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-amber-700 text-xs leading-relaxed">
              You need <strong>{creditGap} more credits</strong> to advance to{" "}
              <strong>{thresholdInfo.nextLevel}</strong>.
              Complete more lessons to unlock the next level!
            </p>
          </div>
        </>
      )}

      {!required && (
        <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-3">
          <p className="text-green-700 text-sm font-medium">
            🎉 You've reached the highest level — Advanced!
          </p>
        </div>
      )}
    </div>
  );
}