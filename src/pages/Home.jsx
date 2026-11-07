import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import SearchBar from "../components/SearchBar";
import { getItems } from "../services/mockDataService";

/**
 * Home Page (Landing Page)
 * Directly translates the Stitch exported code.html hero and recent items grid.
 */
export default function Home({ onOpenReport, onOpenClaim }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filterType, setFilterType] = useState("all"); // "all", "lost", "found"
  const [matchBannerVisible, setMatchBannerVisible] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getItems();
      setItems(data);
    }
    loadData();
  }, []);

  // Filter items based on selected pill
  const filteredItems = items.filter((item) => {
    if (filterType === "all") return true;
    return item.type === filterType;
  });

  const handleHeroSearch = (query, zone) => {
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (zone && zone !== "all") params.append("zone", zone);
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <div className="flex-1 w-full">
      {/* ========================================================================= */}
      {/* 2. HERO / SEARCH SECTION                                                 */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-8 w-full">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 sm:p-10 custom-shadow text-center max-w-4xl mx-auto">
          {/* AI Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-primary text-xs font-semibold mb-4">
            <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
            <span>AI-Powered Student Lost & Found</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl font-headline font-bold text-on-surface tracking-tight">
            Campus Lost & Found
          </h1>
          <p className="text-on-surface-variant text-sm sm:text-base max-w-xl mx-auto mt-2 mb-8">
            Quickly report or recover misplaced student cards, earbuds, flasks, and gear with instant campus zone matching.
          </p>

          {/* Practical Search Control */}
          <SearchBar onSearch={handleHeroSearch} />

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              onClick={() => onOpenReport ? onOpenReport("lost") : navigate("/report?type=lost")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium text-xs sm:text-sm hover:bg-rose-100 transition-all active:scale-95 shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">report_problem</span>
              <span>I Lost Something</span>
            </button>

            <button
              onClick={() => onOpenReport ? onOpenReport("found") : navigate("/report?type=found")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium text-xs sm:text-sm hover:bg-emerald-100 transition-all active:scale-95 shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>I Found Something</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CONCISE AI SMART MATCH NOTIFICATION (STUDENT FRIENDLY)                 */}
      {/* ========================================================================= */}
      {matchBannerVisible && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-2 w-full">
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              </span>
              <div>
                <div className="font-headline font-semibold text-xs sm:text-sm text-on-surface flex items-center gap-2">
                  <span>High-Confidence Match Suggested</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    96% MATCH
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  A found <strong>AirPods Pro Case</strong> logged at Main Library matches your report from this afternoon.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <Link
                to="/matches/item-2"
                className="bg-primary hover:bg-primary/90 text-white font-medium text-xs px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
              >
                <span>View & Verify</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
              <button
                onClick={() => setMatchBannerVisible(false)}
                className="text-xs text-outline hover:text-on-surface px-2 py-1 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. ESSENTIAL ITEM GRID ('RECENT ITEMS')                                    */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full" id="recent-items">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-headline font-bold text-on-surface">Recent Campus Items</h2>
            <p className="text-xs text-on-surface-variant">Live catalog logged by campus students and security desks.</p>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-lg border border-outline-variant text-xs self-start sm:self-auto">
            <button
              onClick={() => setFilterType("all")}
              className={`px-2.5 py-1 rounded transition-all ${
                filterType === "all"
                  ? "bg-white text-primary font-semibold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("lost")}
              className={`px-2.5 py-1 rounded transition-all ${
                filterType === "lost"
                  ? "bg-white text-primary font-semibold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Lost
            </button>
            <button
              onClick={() => setFilterType("found")}
              className={`px-2.5 py-1 rounded transition-all ${
                filterType === "found"
                  ? "bg-white text-primary font-semibold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Found
            </button>
          </div>
        </div>

        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredItems.slice(0, 8).map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onClaimClick={(it) => onOpenClaim ? onOpenClaim(it) : navigate(`/item/${it.id}`)}
            />
          ))}
        </div>

        {/* Explore More CTA */}
        <div className="text-center mt-10">
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-container-low hover:bg-surface-container text-on-surface font-medium text-xs rounded-xl border border-outline-variant transition-all custom-shadow"
          >
            <span>Explore All Campus Listings</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </main>

      {/* Campus Zones Quick Grid */}
      <section className="bg-surface-container-low border-t border-outline-variant py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="font-headline font-bold text-lg text-on-surface">Campus Recovery Zones</h3>
            <p className="text-xs text-on-surface-variant mt-1">Browse items located in key academic buildings, hubs, and dining halls.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: "Main Library", zone: "library", icon: "local_library", count: "3 items" },
              { name: "Student Union", zone: "student-union", icon: "groups", count: "2 items" },
              { name: "Science Complex", zone: "science", icon: "science", count: "2 items" },
              { name: "Rec Sports Center", zone: "sports", icon: "fitness_center", count: "1 item" },
              { name: "Dining Commons", zone: "dining", icon: "restaurant", count: "1 item" },
              { name: "East Quad", zone: "east-quad", icon: "park", count: "2 items" }
            ].map((z) => (
              <Link
                key={z.zone}
                to={`/browse?zone=${z.zone}`}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 text-center hover:border-primary transition-all custom-shadow group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-primary flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">{z.icon}</span>
                </div>
                <h4 className="font-semibold text-xs text-on-surface">{z.name}</h4>
                <p className="text-[10px] text-outline mt-0.5">{z.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

