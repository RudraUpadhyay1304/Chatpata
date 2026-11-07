import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import ClaimModal from "../components/ClaimModal";
import { getItemById } from "../services/mockDataService";

/**
 * ItemDetails Page
 * Comprehensive view of an individual campus lost or found listing.
 */
export default function ItemDetails({ onOpenClaim }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadItem() {
      const data = await getItemById(id);
      setItem(data);
      setLoading(false);
    }
    loadItem();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-2">
          <span className="material-symbols-outlined text-primary text-[32px] animate-spin">
            progress_activity
          </span>
          <p className="text-xs text-on-surface-variant font-medium">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex-1 max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-surface-container text-outline flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[32px]">inventory_2</span>
        </div>
        <h2 className="text-xl font-headline font-bold text-on-surface">Item Not Found</h2>
        <p className="text-xs text-on-surface-variant">
          The requested campus item listing does not exist or has already been returned to its owner.
        </p>
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-medium rounded-lg"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Directory</span>
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isFound = item.type === "found";

  return (
    <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Campus Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-medium rounded-lg border border-outline-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? "check" : "share"}
            </span>
            <span>{copied ? "Link Copied!" : "Share"}</span>
          </button>
        </div>
      </div>

      {/* Main Item Container */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden custom-shadow grid grid-cols-1 md:grid-cols-12 gap-0">
        {/* Left Column: Image Showcase */}
        <div className="md:col-span-5 bg-surface-container relative min-h-[300px] md:min-h-full">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80";
            }}
          />

          <div className="absolute top-4 left-4 flex items-center gap-2">
            <StatusBadge type={item.type} />
            {item.matchConfidence && (
              <StatusBadge matchScore={item.matchConfidence} />
            )}
          </div>

          {item.isSecurityDesk && (
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-outline-variant text-[11px] font-semibold text-primary flex items-center gap-1 shadow-xs">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              <span>Secured at Campus Security Desk</span>
            </div>
          )}
        </div>

        {/* Right Column: Listing Details & Actions */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Category & Date */}
            <div className="flex items-center justify-between text-xs text-outline">
              <span className="bg-surface-container-low px-2.5 py-1 rounded-md text-on-surface-variant font-medium">
                {item.category}
              </span>
              <span>Logged {item.timeAgo || "recently"}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface">
              {item.title}
            </h1>

            {/* Location Pill */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-container-low border border-outline-variant text-xs text-on-surface">
              <span className="material-symbols-outlined text-primary text-[19px]">location_on</span>
              <div>
                <span className="font-semibold block">{item.location}</span>
                <span className="text-[11px] text-outline">Designated Campus Recovery Zone</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-xs text-on-surface uppercase tracking-wider mb-1.5">
                Description & Distinguishing Features
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed whitespace-pre-line bg-surface-container-lowest p-3 rounded-lg border border-outline-variant">
                {item.description || "No specific marks mentioned."}
              </p>
            </div>

            {/* Custody Info */}
            <div className="pt-2 border-t border-outline-variant grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-outline block">Reported By</span>
                <span className="font-medium text-on-surface">{item.reporterName}</span>
              </div>
              <div>
                <span className="text-[11px] text-outline block">Official Contact</span>
                <span className="font-medium text-primary">{item.reporterContact}</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-6 mt-6 border-t border-outline-variant flex flex-col sm:flex-row items-center gap-3">
            {isFound ? (
              <button
                onClick={() => setClaimModalOpen(true)}
                className="w-full sm:flex-1 py-2.5 bg-primary-container hover:bg-primary text-white font-medium text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Submit Claim Request</span>
              </button>
            ) : (
              <button
                onClick={() => navigate(`/report?type=found&refTitle=${encodeURIComponent(item.title)}`)}
                className="w-full sm:flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>I Found This Item!</span>
              </button>
            )}

            <Link
              to={`/matches/${item.id}`}
              className="w-full sm:w-auto px-4 py-2.5 bg-secondary-fixed hover:bg-secondary-fixed/80 text-on-secondary-fixed font-semibold text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              <span>Find Smart Matches</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      <ClaimModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        item={item}
        onClaimSuccess={() => {
          // Optional callback
        }}
      />
    </div>
  );
}

