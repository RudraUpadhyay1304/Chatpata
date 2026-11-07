import React from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * Sidebar Component
 * Side navigation for student portal and dashboard pages.
 */
export default function Sidebar({ user, activeReportsCount = 0, activeClaimsCount = 0 }) {
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: "dashboard" },
    { label: "Browse Catalog", path: "/browse", icon: "search" },
    { label: "Report Item", path: "/report", icon: "add_circle" },
    {
      label: "My Reports",
      path: "/my-reports",
      icon: "inventory_2",
      badge: activeReportsCount > 0 ? activeReportsCount : null
    },
    {
      label: "My Claims",
      path: "/my-claims",
      icon: "verified",
      badge: activeClaimsCount > 0 ? activeClaimsCount : null
    },
    { label: "Student Profile", path: "/profile", icon: "person" }
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-4">
      {/* Student Profile Card in Sidebar */}
      {user && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 custom-shadow">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-secondary-fixed text-primary flex items-center justify-center font-bold text-sm shadow-xs">
              {user.initials || "AC"}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-headline font-bold text-xs sm:text-sm text-on-surface truncate">
                {user.name}
              </h4>
              <p className="text-[11px] text-primary font-semibold">{user.studentId}</p>
              <p className="text-[10px] text-outline truncate">{user.department}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-2.5 custom-shadow space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-secondary-fixed text-on-secondary-fixed font-semibold"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`material-symbols-outlined text-[19px] ${
                    isActive ? "text-primary" : "text-outline"
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Campus Security Help Banner */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 custom-shadow text-xs">
        <div className="flex items-center gap-2 text-primary font-semibold font-headline mb-1">
          <span className="material-symbols-outlined text-[17px]">shield</span>
          <span>Campus Security Info</span>
        </div>
        <p className="text-[11px] text-on-surface-variant leading-relaxed">
          High-value lost items (wallets, laptops, official IDs) are handed over to the Science Atrium Security Desk daily at 5:00 PM.
        </p>
      </div>
    </aside>
  );
}

