import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import Sidebar from "../components/Sidebar";
import { getItems, updateItem, deleteItem, getCurrentUser, getClaims } from "../services/mockDataService";

/**
 * MyReports Page
 * Allows demo student to manage, edit, mark resolved, and delete their campus reports.
 */
export default function MyReports({ onOpenReport }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // "all", "active", "resolved"
  const [editingItem, setEditingItem] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const currentUser = await getCurrentUser();
    const allItems = await getItems();
    const allClaims = await getClaims();

    setUser(currentUser);
    setItems(allItems);
    setClaims(allClaims);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const userId = user ? user.id : "user-101";
  // Filter items owned by the current student
  const myReports = items.filter((i) => i.ownerUserId === userId || i.ownerUserId === "user-101");

  const filteredReports = myReports.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "resolved") return item.status === "resolved";
    if (activeTab === "active") return item.status !== "resolved";
    return true;
  });

  const handleToggleResolved = async (item) => {
    const newStatus = item.status === "resolved" ? "active" : "resolved";
    await updateItem(item.id, { status: newStatus });
    await loadData();
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this campus report?")) {
      await deleteItem(itemId);
      await loadData();
    }
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditDesc(item.description);
    setEditLocation(item.location);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    await updateItem(editingItem.id, {
      title: editTitle,
      description: editDesc,
      location: editLocation
    });
    setEditingItem(null);
    await loadData();
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Header */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 custom-shadow mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-on-surface">My Campus Reports</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Manage your submitted lost and found listings, track recovery statuses, and view matches.
          </p>
        </div>

        <button
          onClick={() => onOpenReport ? onOpenReport("lost") : navigate("/report")}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-container hover:bg-primary text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
        >
          <span className="material-symbols-outlined text-[17px]">add_circle</span>
          <span>New Report</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar */}
        <Sidebar
          user={user}
          activeReportsCount={myReports.length}
          activeClaimsCount={claims.filter((c) => c.claimantId === userId).length}
        />

        {/* Main Content */}
        <div className="flex-1 space-y-5">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-surface-container-lowest p-1.5 rounded-xl border border-outline-variant text-xs w-fit custom-shadow">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "all"
                  ? "bg-secondary-fixed text-on-secondary-fixed font-bold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              All Reports ({myReports.length})
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "active"
                  ? "bg-secondary-fixed text-on-secondary-fixed font-bold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Active ({myReports.filter((i) => i.status !== "resolved").length})
            </button>
            <button
              onClick={() => setActiveTab("resolved")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "resolved"
                  ? "bg-secondary-fixed text-on-secondary-fixed font-bold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Resolved ({myReports.filter((i) => i.status === "resolved").length})
            </button>
          </div>

          {/* Reports List */}
          {filteredReports.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center custom-shadow">
              <span className="material-symbols-outlined text-outline text-[36px] mb-2">
                inventory_2
              </span>
              <h3 className="font-headline font-bold text-base text-on-surface">No Reports Found</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1 mb-4">
                You have no listings in the "{activeTab}" view. Misplaced something? Report it now.
              </p>
              <button
                onClick={() => onOpenReport ? onOpenReport("lost") : navigate("/report")}
                className="px-4 py-2 bg-primary-container text-white text-xs font-medium rounded-lg"
              >
                Create Lost Report
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 custom-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-20 h-20 rounded-xl object-cover bg-surface-container shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge type={item.type} />
                        {item.status === "resolved" ? (
                          <StatusBadge status="resolved" />
                        ) : (
                          <span className="bg-blue-50 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                            Active
                          </span>
                        )}
                        <span className="text-[11px] text-outline">• {item.timeAgo}</span>
                      </div>

                      <h3 className="font-headline font-bold text-sm sm:text-base text-on-surface">
                        {item.title}
                      </h3>

                      <p className="text-xs text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-outline">location_on</span>
                        {item.location} • {item.category}
                      </p>

                      <p className="text-xs text-outline line-clamp-1 max-w-md">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-outline-variant justify-end">
                    <Link
                      to={`/matches/${item.id}`}
                      className="px-3 py-1.5 bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed/80 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                      title="View AI counter matches"
                    >
                      <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        auto_awesome
                      </span>
                      <span>Matches</span>
                    </Link>

                    <button
                      onClick={() => handleToggleResolved(item)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                        item.status === "resolved"
                          ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      }`}
                    >
                      {item.status === "resolved" ? "Reopen" : "Mark Recovered"}
                    </button>

                    <button
                      onClick={() => startEdit(item)}
                      className="p-1.5 text-outline hover:text-on-surface rounded-lg hover:bg-surface-container-low transition-colors"
                      title="Edit Report"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-rose-600 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete Report"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md p-6 custom-shadow animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <h3 className="font-headline font-bold text-base text-on-surface">Edit Report Details</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-outline hover:text-on-surface p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Campus Location</label>
                <input
                  type="text"
                  required
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3.5 py-1.5 text-xs text-on-surface-variant hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary-container text-white font-medium text-xs rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

