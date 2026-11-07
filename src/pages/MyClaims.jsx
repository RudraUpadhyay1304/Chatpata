import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import Sidebar from "../components/Sidebar";
import { getClaims, updateClaimStatus, getCurrentUser, getItems } from "../services/mockDataService";

/**
 * MyClaims Page
 * Tracks submitted claim verifications, reviews received claims, and manages statuses.
 */
export default function MyClaims() {
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState([]);
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("submitted"); // "submitted", "received"
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const currentUser = await getCurrentUser();
    const allClaims = await getClaims();
    const allItems = await getItems();

    setUser(currentUser);
    setClaims(allClaims);
    setItems(allItems);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const userId = user ? user.id : "user-101";

  // Filter claims
  const submittedClaims = claims.filter((c) => c.claimantId === userId || c.claimantId === "user-101");
  const receivedClaims = claims.filter((c) => c.claimantId !== userId && c.claimantId !== "user-101");

  const handleUpdateStatus = async (claimId, newStatus) => {
    const note = prompt(`Enter notes for ${newStatus.toUpperCase()}:`, newStatus === "approved" ? "Ownership verified. Pickup at Science Atrium Desk." : "Incomplete serial proof.");
    if (note !== null) {
      await updateClaimStatus(claimId, newStatus, note);
      await loadData();
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Header */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 custom-shadow mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-on-surface">Campus Claims Center</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Track ownership proof reviews, pickup authorizations, and verify claims on found items.
          </p>
        </div>

        <Link
          to="/browse?type=found"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-container hover:bg-primary text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
        >
          <span className="material-symbols-outlined text-[17px]">search</span>
          <span>Browse Found Items to Claim</span>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar */}
        <Sidebar
          user={user}
          activeReportsCount={items.filter((i) => i.ownerUserId === userId).length}
          activeClaimsCount={submittedClaims.length}
        />

        {/* Main Content */}
        <div className="flex-1 space-y-5">
          {/* Tab Selector */}
          <div className="flex items-center gap-2 border-b border-outline-variant pb-2">
            <button
              onClick={() => setActiveTab("submitted")}
              className={`pb-2 px-3 text-xs font-headline font-bold transition-all relative ${
                activeTab === "submitted"
                  ? "text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Claims I Submitted ({submittedClaims.length})
            </button>
            <button
              onClick={() => setActiveTab("received")}
              className={`pb-2 px-3 text-xs font-headline font-bold transition-all relative ${
                activeTab === "received"
                  ? "text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Claims Received ({receivedClaims.length})
            </button>
          </div>

          {/* List Display */}
          {activeTab === "submitted" ? (
            submittedClaims.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-10 text-center custom-shadow">
                <span className="material-symbols-outlined text-outline text-[36px] mb-2">
                  verified
                </span>
                <h3 className="font-headline font-bold text-sm text-on-surface">No Submitted Claims</h3>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1 mb-4">
                  You haven't submitted any ownership verification claims yet. See a found item that belongs to you?
                </p>
                <Link
                  to="/browse?type=found"
                  className="px-4 py-2 bg-primary-container text-white text-xs font-medium rounded-lg inline-block"
                >
                  Browse Found Items
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {submittedClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 custom-shadow space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-outline-variant">
                      <div>
                        <span className="text-[10px] text-outline uppercase font-semibold">
                          Claim Request #{claim.id}
                        </span>
                        <h3 className="font-headline font-bold text-base text-on-surface mt-0.5">
                          {claim.itemTitle}
                        </h3>
                        <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[13px] text-outline">location_on</span>
                          {claim.itemLocation}
                        </p>
                      </div>

                      <div className="self-start sm:self-auto">
                        <StatusBadge status={claim.status} />
                      </div>
                    </div>

                    {/* Proof statement */}
                    <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant text-xs">
                      <span className="font-semibold text-on-surface block mb-1">
                        Submitted Proof of Ownership:
                      </span>
                      <p className="text-on-surface-variant">{claim.proofDescription}</p>
                    </div>

                    {/* Reviewer Note */}
                    {claim.reviewerNotes && (
                      <div className="flex items-start gap-2 text-xs text-outline bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                        <span className="material-symbols-outlined text-primary text-[16px] shrink-0">
                          info
                        </span>
                        <p className="text-on-surface-variant">
                          <strong className="text-primary font-semibold">Security Note: </strong>
                          {claim.reviewerNotes}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 text-xs text-outline">
                      <span>Submitted on {new Date(claim.date).toLocaleDateString()}</span>
                      <Link
                        to={`/item/${claim.itemId}`}
                        className="text-primary font-semibold hover:underline"
                      >
                        View Original Listing
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            receivedClaims.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-10 text-center custom-shadow">
                <span className="material-symbols-outlined text-outline text-[36px] mb-2">
                  inbox
                </span>
                <h3 className="font-headline font-bold text-sm text-on-surface">No Claims Received</h3>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1">
                  No other students have submitted ownership claims on items you've found or turned in.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {receivedClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 custom-shadow space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-outline-variant">
                      <div>
                        <span className="text-[10px] text-outline uppercase font-semibold">
                          Claimant: {claim.claimantName} ({claim.claimantEmail})
                        </span>
                        <h3 className="font-headline font-bold text-base text-on-surface mt-0.5">
                          {claim.itemTitle}
                        </h3>
                      </div>

                      <div className="self-start sm:self-auto">
                        <StatusBadge status={claim.status} />
                      </div>
                    </div>

                    <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant text-xs">
                      <span className="font-semibold text-on-surface block mb-1">
                        Claimant's Proof Statement:
                      </span>
                      <p className="text-on-surface-variant">{claim.proofDescription}</p>
                    </div>

                    {/* Verification Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant">
                      <button
                        onClick={() => handleUpdateStatus(claim.id, "rejected")}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition-colors"
                      >
                        Reject Claim
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(claim.id, "approved")}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                      >
                        Approve & Authorize Pickup
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

