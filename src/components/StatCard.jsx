import React from "react";

/**
 * StatCard Component
 * Displays quantitative dashboard metrics with collegiate design styling.
 */
export default function StatCard({ title, value, icon, change, color = "primary" }) {
  const colorMap = {
    primary: "bg-blue-50 text-primary border-blue-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200"
  };

  const activeColor = colorMap[color] || colorMap.primary;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 custom-shadow flex items-center justify-between">
      <div>
        <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface mt-1">{value}</h3>
        {change && (
          <p className="text-[11px] text-outline mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px] text-emerald-600">trending_up</span>
            {change}
          </p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${activeColor}`}>
        <span className="material-symbols-outlined text-[24px]">{icon}</span>
      </div>
    </div>
  );
}

