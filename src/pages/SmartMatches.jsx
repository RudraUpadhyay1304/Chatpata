import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import ClaimModal from "../components/ClaimModal";
import { getItemById, calculateSmartMatches } from "../services/mockDataService";

/**
 * SmartMatches Page
 * Frontend-only demonstration of algorithmic similarity matching with breakdown telemetry.
 */
export default function SmartMatches({ onOpenClaim }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [targetItem, setTargetItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatchForClaim, setSelectedMatchForClaim] = useState(null);

  useEffect(() => {
    async function loadMatches() {
      const item = await getItemById(id);
      if (item) {
        setTargetItem(item);
        const matchResults = await calculateSmartMatches(item.id);
        setMatches(matchResults);
      }
      setLoading(false);
    }
    loadMatches();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-2">
          <span className="material-symbols-outlined text-primary text-[32px] animate-spin">
            progress_activity
          </span>
          <p className="text-xs text-on-surface-variant font-medium">
            Running FindIt text similarity analysis...
          </p>
        </div>
      </div>
    );
  }

  if (!targetItem) {
    return (
      <div className="flex-1 max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-headline font-bold text-on-surface">Target Item Not Found</h2>
        <Link to="/browse" className="text-xs text-primary font-semibold hover:underline">
          Return to Browse Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to={`/item/${targetItem.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to "{targetItem.title}" Details</span>
        </Link>
      </div>

      {/* Target Item Reference Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 custom-shadow mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={targetItem.imageUrl}
              alt={targetItem.title}
              className="w-16 h-16 rounded-xl object-cover bg-surface-container shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                  Source Item for Matching
                </span>
                <StatusBadge type={targetItem.type} />
              </div>
              <h2 className="font-headline font-bold text-base sm:text-lg text-on-surface">
                {targetItem.title}
              </h2>
              <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[13px] text-outline">location_on</span>
                {targetItem.location} • {targetItem.category}
              </p>
            </div>
          </div>

          <div className="bg-secondary-fixed text-on-secondary-fixed px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
            <span>{matches.length} Counter-Matches Found</span>
          </div>
        </div>
      </div>

      {/* Algorithm Transparency Banner */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 mb-8 flex items-start gap-3 text-xs shadow-xs">
        <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
          info
        </span>
        <div className="leading-relaxed">
          <p className="font-semibold text-primary">
            FindIt AI — Smart Matching Engine (Frontend Demo)
          </p>
          <p className="text-on-surface-variant mt-0.5">
            This algorithm performs client-side text heuristic matching by evaluating token overlap between item titles, category intersections, and building zone proximity. No external proprietary AI API is used.
          </p>
        </div>
      </div>

      {/* Match Results */}
      <div>
        <h3 className="font-headline font-bold text-lg text-on-surface mb-4">
          Ranked Counter-Item Matches
        </h3>

        {matches.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-10 text-center custom-shadow">
            <div className="w-12 h-12 rounded-xl bg-surface-container text-outline flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[24px]">search</span>
            </div>
            <h4 className="font-headline font-bold text-sm text-on-surface">
              No Counter-Matches Found Yet
            </h4>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto mt-1">
              Currently no complementary {targetItem.type === "lost" ? "found" : "lost"} listings match this item's keywords or campus zone. You will be notified when someone logs a match.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map(({ candidate, matchScore, reasons, overlappingWords }) => (
              <div
                key={candidate.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 custom-shadow hover:border-primary/50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                {/* Candidate Info */}
                <div className="flex items-start gap-4 flex-1">
                  <img
                    src={candidate.imageUrl}
                    alt={candidate.title}
                    className="w-24 h-24 rounded-xl object-cover bg-surface-container shrink-0"
                  />

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge type={candidate.type} />
                      <span className="text-[11px] text-outline font-medium">
                        {candidate.category}
                      </span>
                      <span className="text-[11px] text-outline">• Logged {candidate.timeAgo}</span>
                    </div>

                    <h4 className="font-headline font-bold text-base text-on-surface">
                      {candidate.title}
                    </h4>

                    <p className="text-xs text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-outline">location_on</span>
                      {candidate.location}
                    </p>

                    {/* Breakdown Reasons */}
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {reasons.map((reason, rIdx) => (
                        <span
                          key={rIdx}
                          className="bg-surface-container-low border border-outline-variant text-on-surface text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[12px] text-emerald-600">check</span>
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Score & Action Column */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-44 pt-3 md:pt-0 border-t md:border-t-0 border-outline-variant shrink-0 gap-3">
                  {/* Score Pill */}
                  <div className="text-left md:text-right">
                    <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-1 rounded-full border border-emerald-200">
                      <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        auto_awesome
                      </span>
                      <span>{matchScore}% MATCH</span>
                    </div>
                    <span className="text-[10px] text-outline block mt-0.5">High Confidence</span>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center gap-2">
                    {candidate.type === "found" ? (
                      <button
                        onClick={() => setSelectedMatchForClaim(candidate)}
                        className="px-4 py-2 bg-primary-container hover:bg-primary text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1 shadow-sm active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[15px]">verified</span>
                        <span>Claim Match</span>
                      </button>
                    ) : (
                      <Link
                        to={`/item/${candidate.id}`}
                        className="px-4 py-2 bg-surface-container-low hover:bg-surface-container text-on-surface font-medium text-xs rounded-lg border border-outline-variant transition-colors"
                      >
                        View Report
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Claim Modal for Selected Candidate */}
      {selectedMatchForClaim && (
        <ClaimModal
          isOpen={!!selectedMatchForClaim}
          onClose={() => setSelectedMatchForClaim(null)}
          item={selectedMatchForClaim}
          onClaimSuccess={() => setSelectedMatchForClaim(null)}
        />
      )}
    </div>
  );
}

