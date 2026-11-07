import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import ItemCard from "../components/ItemCard";
import StatusBadge from "../components/StatusBadge";
import { getCurrentUser, getItems, getClaims } from "../services/mockDataService";

/**
 * Dashboard Page
 * Central hub for the student with telemetry stat cards, recent reports, and activity feed.
 */
export default function Dashboard({ onOpenReport, onOpenClaim }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      const currentUser = await getCurrentUser();
      const allItems = await getItems();
      const allClaims = await getClaims();

      setUser(currentUser);
      setItems(allItems);
      setClaims(allClaims);
      setLoading(false);
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-2">
          <span className="material-symbols-outlined text-primary text-[32px] animate-spin">
            progress_activity
          </span>
          <p className="text-xs text-on-surface-variant font-medium">Loading student dashboard...</p>
        </div>
      </div>
    );
  }

  // Filter items reported by this user (or mock items with owner 'user-101')
  const userId = user ? user.id : "user-101";
  const myReports = items.filter((i) => i.ownerUserId === userId || i.ownerUserId === "user-101");
  const myClaims = claims.filter((c) => c.claimantId === userId || c.claimantId === "user-101");
  const totalLost = items.filter((i) => i.type === "lost").length;
  const totalFound = items.filter((i) => i.type === "found").length;

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Top Welcome Header */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 custom-shadow mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-primary text-[11px] font-semibold mb-2">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              school
            </span>
            <span>Campus Student Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface">
            Welcome back, {user ? user.name : "Alex Chen"}!
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Student ID: <span className="font-semibold text-primary">{user ? user.studentId : "#STU-84920"}</span> • {user ? user.department : "Computer Science & Engineering"}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onOpenReport ? onOpenReport("lost") : navigate("/report?type=lost")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium text-xs hover:bg-rose-100 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">report_problem</span>
            <span>Report Lost</span>
          </button>
          <button
            onClick={() => onOpenReport ? onOpenReport("found") : navigate("/report?type=found")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium text-xs hover:bg-emerald-100 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>Report Found</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar */}
        <Sidebar
          user={user}
          activeReportsCount={myReports.length}
          activeClaimsCount={myClaims.length}
        />

        {/* Right Content */}
        <div className="flex-1 space-y-6">
          {/* Telemetry Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              title="Campus Catalog"
              value={items.length}
              icon="inventory_2"
              color="primary"
            />
            <StatCard
              title="Lost Items"
              value={totalLost}
              icon="search"
              color="rose"
            />
            <StatCard
              title="Found Items"
              value={totalFound}
              icon="check_circle"
              color="emerald"
            />
            <StatCard
              title="My Claims"
              value={myClaims.length}
              icon="verified"
              color="amber"
            />
          </div>

          {/* AI Match Alert Box */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[19px]">auto_awesome</span>
              </span>
              <div>
                <div className="font-headline font-semibold text-xs sm:text-sm text-on-surface flex items-center gap-2">
                  <span>Smart Match Available for Your Lost Item</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    96% AI MATCH
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Your report for <strong>AirPods Pro</strong> matches a found listing turned in at Main Library.
                </p>
              </div>
            </div>
            <Link
              to="/matches/item-2"
              className="bg-primary hover:bg-primary/90 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-xs"
            >
              <span>View Match Details</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          {/* My Active Reports Section */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 custom-shadow">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant">
              <div>
                <h3 className="font-headline font-bold text-base text-on-surface">My Active Reports</h3>
                <p className="text-xs text-on-surface-variant">Items you have currently reported lost or found on campus.</p>
              </div>
              <Link
                to="/my-reports"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
              >
                <span>View All ({myReports.length})</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>

            {myReports.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant text-xs">
                You haven't reported any lost or found items yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myReports.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="border border-outline-variant rounded-xl p-3.5 flex gap-3 hover:border-primary/50 transition-all bg-surface-container-lowest"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-20 h-20 rounded-lg object-cover bg-surface-container shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <StatusBadge type={item.type} />
                          <span className="text-[10px] text-outline">{item.timeAgo}</span>
                        </div>
                        <h4 className="font-semibold text-xs text-on-surface line-clamp-1">{item.title}</h4>
                        <p className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[12px] text-outline">location_on</span>
                          <span className="truncate">{item.location}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-outline-variant text-xs">
                        <Link
                          to={`/matches/${item.id}`}
                          className="text-primary font-semibold hover:underline flex items-center gap-0.5 text-[11px]"
                        >
                          <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                          <span>Find Matches</span>
                        </Link>
                        <span className="text-outline">•</span>
                        <Link
                          to={`/item/${item.id}`}
                          className="text-on-surface-variant hover:text-on-surface text-[11px]"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Campus Activity Feed */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 custom-shadow">
            <h3 className="font-headline font-bold text-base text-on-surface mb-1">Recent Campus Activity</h3>
            <p className="text-xs text-on-surface-variant mb-4">Latest updates across campus lost & found intake points.</p>

            <div className="space-y-3">
              {[
                {
                  icon: "check_circle",
                  color: "text-emerald-600 bg-emerald-50",
                  title: "Student ID - Emma Watson verified and returned",
                  location: "Science Atrium Desk",
                  time: "2 hours ago"
                },
                {
                  icon: "auto_awesome",
                  color: "text-primary bg-blue-50",
                  title: "96% AI Similarity match detected for AirPods Pro",
                  location: "Main University Library",
                  time: "35 mins ago"
                },
                {
                  icon: "report_problem",
                  color: "text-rose-600 bg-rose-50",
                  title: "New lost report logged: Hydro Flask 32oz Yellow",
                  location: "Student Union Cafe",
                  time: "1 hour ago"
                },
                {
                  icon: "inventory_2",
                  color: "text-secondary bg-secondary-fixed/50",
                  title: "Found wallet deposited with campus security",
                  location: "East Quad Pavilion",
                  time: "4 hours ago"
                }
              ].map((act, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-surface-container-low transition-colors">
                  <div className={`w-8 h-8 rounded-lg ${act.color} flex items-center justify-center shrink-0`}>
                    <span className="material-symbols-outlined text-[17px]">{act.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-on-surface">{act.title}</p>
                    <p className="text-[11px] text-outline mt-0.5">{act.location} • {act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

