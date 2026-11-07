import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { getCurrentUser, setCurrentUser, logout, resetToDemoData, getItems, getClaims } from "../services/mockDataService";

/**
 * Profile Page
 * Displays student profile credentials, notification settings, and demo environment resets.
 */
export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [savedMessage, setSavedMessage] = useState("");
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const currentUser = await getCurrentUser();
      const allItems = await getItems();
      const allClaims = await getClaims();

      if (currentUser) {
        setUser(currentUser);
        setName(currentUser.name);
        setPhone(currentUser.phone || "+1 (555) 382-9401");
        setDepartment(currentUser.department);
      }
      setItems(allItems);
      setClaims(allClaims);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user) return;

    const updated = {
      ...user,
      name,
      phone,
      department
    };

    await setCurrentUser(updated);
    setUser(updated);
    setSavedMessage("Profile updated successfully!");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const handleResetData = () => {
    if (window.confirm("Reset all campus lost & found demo data back to initial seeds?")) {
      resetToDemoData();
      window.location.reload();
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const userId = user ? user.id : "user-101";
  const myReportsCount = items.filter((i) => i.ownerUserId === userId).length;
  const myClaimsCount = claims.filter((c) => c.claimantId === userId).length;

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Header */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 custom-shadow mb-6">
        <h1 className="text-2xl font-headline font-bold text-on-surface">Student Profile & Settings</h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Review your university credentials, contact options, and lost & found matching notifications.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar */}
        <Sidebar
          user={user}
          activeReportsCount={myReportsCount}
          activeClaimsCount={myClaimsCount}
        />

        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          {/* Identity Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 custom-shadow">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="w-20 h-20 rounded-full bg-secondary-fixed text-primary flex items-center justify-center font-bold text-2xl shrink-0 shadow-sm">
                {user ? user.initials : "AC"}
              </div>

              <div className="text-center sm:text-left flex-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 mb-1">
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                  <span>Verified Campus Student</span>
                </div>
                <h2 className="text-xl font-headline font-bold text-on-surface">
                  {user ? user.name : "Alex Chen"}
                </h2>
                <p className="text-xs text-on-surface-variant">{user ? user.email : "alex.chen@university.edu"}</p>
                <p className="text-xs text-primary font-semibold mt-0.5">
                  ID: {user ? user.studentId : "#STU-84920"} • {user ? user.department : "Computer Science & Engineering"}
                </p>

                {/* Micro Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-outline-variant text-left">
                  <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant">
                    <span className="text-[10px] text-outline uppercase font-semibold block">My Reports</span>
                    <span className="font-bold text-sm text-on-surface">{myReportsCount} Active</span>
                  </div>
                  <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant">
                    <span className="text-[10px] text-outline uppercase font-semibold block">Recovered</span>
                    <span className="font-bold text-sm text-emerald-700">3 Items</span>
                  </div>
                  <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant">
                    <span className="text-[10px] text-outline uppercase font-semibold block">Claims</span>
                    <span className="font-bold text-sm text-primary">{myClaimsCount} Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 custom-shadow">
            <h3 className="font-headline font-bold text-base text-on-surface mb-1">Edit Student Information</h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Update details used when campus security verifies your identity during pickup.
            </p>

            {savedMessage && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>{savedMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:bg-white focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:bg-white focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none focus:bg-white focus:border-primary"
                >
                  <option>Computer Science & Engineering</option>
                  <option>Biomedical Sciences</option>
                  <option>Mechanical & Electrical Engineering</option>
                  <option>School of Business & Economics</option>
                  <option>Liberal Arts & Humanities</option>
                  <option>Design & Architecture</option>
                </select>
              </div>

              {/* Notification Preferences */}
              <div className="pt-3 border-t border-outline-variant space-y-2">
                <span className="block text-xs font-semibold text-on-surface">Campus AI Notifications</span>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-on-surface-variant">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="w-4 h-4 text-primary rounded border-outline-variant"
                  />
                  <span>Send instant email when FindIt AI detects a 80%+ match for my lost item</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-on-surface-variant">
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="w-4 h-4 text-primary rounded border-outline-variant"
                  />
                  <span>SMS alert when campus security approves a claim verification request</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary-container hover:bg-primary text-white font-medium text-xs rounded-lg transition-colors shadow-xs"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Demo Controls Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 custom-shadow">
            <h3 className="font-headline font-bold text-base text-on-surface mb-1">Demo Environment Controls</h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Options for class presentation and project evaluation.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleResetData}
                className="px-4 py-2 bg-surface-container-low hover:bg-surface-container text-on-surface font-medium text-xs rounded-lg border border-outline-variant transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span>Reset Demo Seed Data</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-xs rounded-lg border border-rose-200 transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Simulated Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

