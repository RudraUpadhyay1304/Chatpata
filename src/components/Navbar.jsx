import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser, logout } from "../services/mockDataService";

/**
 * Navbar Component
 * Matches Stitch header navigation with responsive mobile menu & user dropdown.
 */
export default function Navbar({ onOpenReport }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sync user from localStorage
  const refreshUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  useEffect(() => {
    refreshUser();
  }, [location.pathname]);

  // Click outside listener for user dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/browse");
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setUserMenuOpen(false);
    navigate("/login");
  };

  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 hover:opacity-90 transition-opacity">
          <span className="w-8 h-8 rounded-lg bg-primary-container text-white flex items-center justify-center font-bold shadow-sm">
            <span className="material-symbols-outlined text-[19px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </span>
          <span className="text-xl font-headline font-bold text-primary tracking-tight">
            FindIt AI
          </span>
        </Link>

        {/* Quick Search Bar (Desktop) */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lost & found items on campus..."
              className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs placeholder:text-outline focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
        </form>

        {/* Nav Links & Actions (Desktop) */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            to="/browse"
            className="text-on-surface-variant hover:text-primary font-medium text-xs px-2.5 py-1.5 rounded-md transition-colors"
          >
            Browse Items
          </Link>

          <Link
            to="/dashboard"
            className="text-on-surface-variant hover:text-primary font-medium text-xs px-2.5 py-1.5 rounded-md transition-colors"
          >
            Dashboard
          </Link>

          {/* Quick Report Button */}
          <button
            onClick={() => {
              if (onOpenReport) {
                onOpenReport("lost");
              } else {
                navigate("/report");
              }
            }}
            className="inline-flex items-center gap-1.5 bg-primary-container hover:bg-primary text-white font-medium text-xs px-3.5 py-2 rounded-lg shadow-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[17px]">add_circle</span>
            <span>Report Item</span>
          </button>

          {/* User Profile / Auth State */}
          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low px-2.5 py-2 rounded-lg transition-all border border-transparent hover:border-outline-variant text-xs font-medium"
              >
                <span className="w-6 h-6 rounded-full bg-secondary-fixed text-primary flex items-center justify-center text-[11px] font-bold">
                  {currentUser.initials || "AC"}
                </span>
                <span className="hidden md:inline">{currentUser.name.split(" ")[0]} (Student)</span>
                <span className="material-symbols-outlined text-[16px] text-outline">
                  {userMenuOpen ? "expand_less" : "expand_more"}
                </span>
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-1 w-52 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-level2 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-outline-variant">
                    <p className="font-semibold text-xs text-on-surface">{currentUser.name}</p>
                    <p className="text-[11px] text-outline truncate">{currentUser.email}</p>
                    <p className="text-[10px] text-primary font-semibold mt-0.5">{currentUser.studentId}</p>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">dashboard</span>
                    Dashboard
                  </Link>

                  <Link
                    to="/my-reports"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                    My Reports
                  </Link>

                  <Link
                    to="/my-claims"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    My Claims
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">person</span>
                    Profile
                  </Link>

                  <div className="border-t border-outline-variant my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    Sign Out (Demo)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-primary hover:underline px-2.5 py-1.5"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs font-semibold bg-primary-container text-white px-3 py-1.5 rounded-lg hover:bg-primary transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="sm:hidden flex items-center gap-2">
          <button
            onClick={() => {
              if (onOpenReport) onOpenReport("lost");
              else navigate("/report");
            }}
            className="p-1.5 bg-primary-container text-white rounded-lg"
            title="Report Item"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-lg border border-outline-variant"
          >
            <span className="material-symbols-outlined text-[20px]">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-outline-variant bg-surface-container-lowest p-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full mb-3">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs outline-none"
            />
          </form>

          <nav className="flex flex-col space-y-1">
            <Link
              to="/browse"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-xs font-medium text-on-surface hover:bg-surface-container-low flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">search</span>
              Browse Items
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-xs font-medium text-on-surface hover:bg-surface-container-low flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">dashboard</span>
              Dashboard
            </Link>
            <Link
              to="/my-reports"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-xs font-medium text-on-surface hover:bg-surface-container-low flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">inventory_2</span>
              My Reports
            </Link>
            <Link
              to="/my-claims"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-xs font-medium text-on-surface hover:bg-surface-container-low flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">verified</span>
              My Claims
            </Link>
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-xs font-medium text-on-surface hover:bg-surface-container-low flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">person</span>
              Profile
            </Link>
          </nav>

          <div className="border-t border-outline-variant pt-3 flex items-center justify-between">
            {currentUser ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-secondary-fixed text-primary flex items-center justify-center text-xs font-bold">
                    {currentUser.initials}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-on-surface">{currentUser.name}</p>
                    <p className="text-[10px] text-outline">{currentUser.studentId}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-rose-600 font-medium px-2 py-1 rounded hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-semibold border border-outline-variant rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-semibold bg-primary text-white rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

