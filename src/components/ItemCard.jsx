import React from "react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

/**
 * ItemCard Component
 * Faithfully reproduces the Stitch card design for campus lost & found listings.
 */
export default function ItemCard({ item, onClaimClick }) {
  if (!item) return null;

  const isFound = item.type === "found";

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden custom-shadow hover:border-primary/50 transition-all flex flex-col group">
      {/* Image Container with Badges */}
      <div className="relative h-44 bg-surface-container overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Clean fallback placeholder if network fails
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80";
          }}
        />

        {/* Top-Left: Type Badge (FOUND / LOST) */}
        <div className="absolute top-2.5 left-2.5">
          <StatusBadge type={item.type} />
        </div>

        {/* Top-Right: AI Match or Security Desk Badge */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
          {item.matchConfidence && (
            <StatusBadge matchScore={item.matchConfidence} />
          )}
          {item.isSecurityDesk && (
            <StatusBadge isSecurityDesk={true} />
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/item/${item.id}`} className="hover:text-primary transition-colors">
            <h3 className="font-headline font-semibold text-sm text-on-surface line-clamp-1">
              {item.title}
            </h3>
          </Link>

          <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-[13px] text-outline">location_on</span>
            <span className="line-clamp-1">{item.location}</span>
          </p>

          <p className="text-[11px] text-outline mt-0.5">
            Logged {item.timeAgo || "recently"}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-3 mt-3 border-t border-outline-variant flex items-center gap-2">
          {isFound ? (
            <button
              onClick={() => onClaimClick ? onClaimClick(item) : null}
              className="w-full py-1.5 bg-primary-container hover:bg-primary text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1 active:scale-[0.99]"
            >
              <span>View & Claim</span>
            </button>
          ) : (
            <Link
              to={`/item/${item.id}`}
              className="w-full py-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface font-medium text-xs rounded-lg transition-colors border border-outline-variant flex items-center justify-center gap-1 text-center"
            >
              <span>View Details</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

