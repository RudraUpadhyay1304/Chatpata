import React, { useState } from "react";
import { createClaim } from "../services/mockDataService";

/**
 * ClaimModal Component
 * Interactive modal for verifying ownership and submitting claims.
 */
export default function ClaimModal({ isOpen, onClose, item, onClaimSuccess }) {
  const [proof, setProof] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proof.trim()) {
      setError("Please describe unique details to prove ownership.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await createClaim({
        itemId: item.id,
        itemTitle: item.title,
        itemLocation: item.location,
        itemType: item.type,
        proofDescription: proof + (contactInfo ? ` | Contact: ${contactInfo}` : "")
      });

      setSubmitted(true);
      if (onClaimSuccess) onClaimSuccess(item);
    } catch (err) {
      setError("Failed to submit claim. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setProof("");
    setContactInfo("");
    setSubmitted(false);
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md p-6 custom-shadow animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">
              verified
            </span>
            <h3 className="font-headline font-bold text-base text-on-surface">
              Item Claim Verification
            </h3>
          </div>
          <button
            onClick={handleResetAndClose}
            className="text-outline hover:text-on-surface p-1 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">check_circle</span>
            </div>
            <h4 className="font-headline font-bold text-base text-on-surface">Claim Submitted!</h4>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              Campus security and the student finder have received your ownership details. You will receive an update in <span className="font-semibold text-primary">My Claims</span>.
            </p>
            <div className="pt-3">
              <button
                onClick={handleResetAndClose}
                className="w-full py-2 bg-primary-container hover:bg-primary text-white font-medium text-xs rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="py-4 space-y-4">
            {/* Target Item Summary */}
            <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant">
              <h4 className="font-headline font-semibold text-sm text-on-surface">
                {item.title}
              </h4>
              <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-outline">location_on</span>
                {item.location}
              </p>
            </div>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Prove Ownership (Passcode, engraving, sticker description) *
              </label>
              <textarea
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                required
                rows={3}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface focus:bg-white focus:border-primary outline-none transition-all placeholder:text-outline"
                placeholder="Describe unique details only the rightful owner would know..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Alternate Phone or Pickup Note (Optional)
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="e.g., Can pick up today at 3pm"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface focus:bg-white focus:border-primary outline-none transition-all placeholder:text-outline"
              />
            </div>

            <p className="text-[11px] text-outline leading-relaxed">
              Campus security or the student finder will review your claim before releasing pickup instructions.
            </p>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-3.5 py-2 text-xs text-on-surface-variant hover:text-on-surface rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-primary-container hover:bg-primary text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1 shadow-sm active:scale-95 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>{submitting ? "Submitting..." : "Submit Claim"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

