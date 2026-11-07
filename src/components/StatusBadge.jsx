import React from "react";

/**
 * StatusBadge Component
 * Standardized status indicators aligned with the Stitch Design System.
 */
export default function StatusBadge({ type, status, matchScore, isSecurityDesk, className = "" }) {
  // 1. Found vs Lost Badge
  if (type === "found") {
    return (
      <span className={`inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 tracking-wide ${className}`}>
        FOUND
      </span>
    );
  }

  if (type === "lost") {
    return (
      <span className={`inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-rose-200 tracking-wide ${className}`}>
        LOST
      </span>
    );
  }

  // 2. Claim / Report Status Badges
  if (status === "approved" || status === "resolved") {
    return (
      <span className={`inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200 ${className}`}>
        <span className="material-symbols-outlined text-[14px]">check_circle</span>
        {status === "resolved" ? "Resolved / Returned" : "Approved"}
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span className={`inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200 ${className}`}>
        <span className="material-symbols-outlined text-[14px]">schedule</span>
        Pending Review
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className={`inline-flex items-center gap-1 bg-rose-50 text-rose-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-rose-200 ${className}`}>
        <span className="material-symbols-outlined text-[14px]">cancel</span>
        Rejected
      </span>
    );
  }

  // 3. AI Match Badge
  if (matchScore) {
    return (
      <span className={`inline-flex items-center gap-0.5 bg-blue-50 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-200 ${className}`}>
        <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
        {matchScore}% Match
      </span>
    );
  }

  // 4. Security Desk Badge
  if (isSecurityDesk) {
    return (
      <span className={`inline-flex items-center gap-0.5 bg-blue-50 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-200 ${className}`}>
        <span className="material-symbols-outlined text-[11px]">badge</span>
        Security Desk
      </span>
    );
  }

  return null;
}

