import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import { getItems } from "../services/mockDataService";
import { CATEGORIES, CAMPUS_ZONES } from "../data/sampleData";

/**
 * BrowseItems Page
 * Interactive catalog with comprehensive filters, keyword search, zone selector, and sorting.
 */
export default function BrowseItems({ onOpenClaim, onOpenReport }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States initialized from URL query params
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || "all");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All Categories");
  const [selectedZone, setSelectedZone] = useState(searchParams.get("zone") || "all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    async function loadData() {
      const data = await getItems();
      setItems(data);
      setLoading(false);
    }
    loadData();
  }, []);

  // Update URL params when filters change
  const applyFilterChange = (newQ, newType, newCat, newZone) => {
    const params = new URLSearchParams();
    if (newQ) params.set("q", newQ);
    if (newType !== "all") params.set("type", newType);
    if (newCat !== "All Categories") params.set("category", newCat);
    if (newZone !== "all") params.set("zone", newZone);
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilterChange(searchQuery, selectedType, selectedCategory, selectedZone);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedCategory("All Categories");
    setSelectedZone("all");
    setSortBy("newest");
    setSearchParams({});
  };

  // Filter and Sort Logic
  const filteredItems = items.filter((item) => {
    // 1. Type filter
    if (selectedType !== "all" && item.type !== selectedType) return false;

    // 2. Category filter
    if (selectedCategory !== "All Categories" && item.category !== selectedCategory) return false;

    // 3. Zone filter
    if (selectedZone !== "all" && item.zone !== selectedZone) return false;

    // 4. Keyword search (title + description + location)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = (item.description || "").toLowerCase().includes(q);
      const matchLoc = (item.location || "").toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc) return false;
    }

    return true;
  });

  // Sorting
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "oldest") {
      return new Date(a.date) - new Date(b.date);
    }
    // Default newest
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-headline font-bold text-on-surface">
          Campus Lost & Found Directory
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          Search and filter all registered lost and found articles across university grounds.
        </p>
      </div>

      {/* Filter Toolbar Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 sm:p-5 custom-shadow mb-8 space-y-4">
        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords (e.g. AirPods, Hydro Flask, Wallet, Keys)..."
              className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs sm:text-sm text-on-surface focus:bg-white focus:border-primary outline-none transition-all placeholder:text-outline"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-primary-container hover:bg-primary text-white font-medium text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
          >
            <span className="material-symbols-outlined text-[17px]">search</span>
            <span>Search</span>
          </button>
        </form>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-outline-variant">
          {/* Status Type Toggle */}
          <div>
            <label className="block text-[11px] font-semibold text-outline mb-1 uppercase tracking-wider">
              Status Type
            </label>
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant text-xs">
              {["all", "lost", "found"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setSelectedType(t);
                    applyFilterChange(searchQuery, t, selectedCategory, selectedZone);
                  }}
                  className={`flex-1 py-1 rounded text-center capitalize transition-all ${
                    selectedType === t
                      ? "bg-white text-primary font-semibold shadow-xs"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-outline mb-1 uppercase tracking-wider">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                applyFilterChange(searchQuery, selectedType, e.target.value, selectedZone);
              }}
              className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface focus:bg-white focus:border-primary outline-none transition-all"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Campus Location Zone */}
          <div>
            <label className="block text-[11px] font-semibold text-outline mb-1 uppercase tracking-wider">
              Campus Zone
            </label>
            <select
              value={selectedZone}
              onChange={(e) => {
                setSelectedZone(e.target.value);
                applyFilterChange(searchQuery, selectedType, selectedCategory, e.target.value);
              }}
              className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface focus:bg-white focus:border-primary outline-none transition-all"
            >
              {CAMPUS_ZONES.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-outline mb-1 uppercase tracking-wider">
              Sort Order
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface focus:bg-white focus:border-primary outline-none transition-all"
            >
              <option value="newest">Newest Logged First</option>
              <option value="oldest">Oldest Logged First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-on-surface-variant font-medium">
          Showing <span className="font-bold text-on-surface">{sortedItems.length}</span> campus listings
          {(selectedType !== "all" || selectedCategory !== "All Categories" || selectedZone !== "all" || searchQuery) && (
            <span> with applied filters</span>
          )}
        </p>

        {(selectedType !== "all" || selectedCategory !== "All Categories" || selectedZone !== "all" || searchQuery) && (
          <button
            onClick={handleResetFilters}
            className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">refresh</span>
            <span>Reset All Filters</span>
          </button>
        )}
      </div>

      {/* Grid or Empty State */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <span className="material-symbols-outlined text-primary text-[32px] animate-spin">
            progress_activity
          </span>
          <p className="text-xs text-on-surface-variant">Loading campus items...</p>
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center max-w-lg mx-auto custom-shadow my-8 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-surface-container text-outline flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[32px]">search_off</span>
          </div>
          <h3 className="font-headline font-bold text-base text-on-surface">No Campus Items Found</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            We couldn't find any listings matching your specific search query or active filter tags.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-surface-container-low hover:bg-surface-container text-on-surface font-medium text-xs rounded-lg border border-outline-variant transition-colors"
            >
              Clear Filters
            </button>
            <button
              onClick={() => onOpenReport ? onOpenReport("lost") : null}
              className="px-4 py-2 bg-primary-container hover:bg-primary text-white font-medium text-xs rounded-lg transition-colors shadow-xs"
            >
              Report a Missing Item
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sortedItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onClaimClick={(it) => onOpenClaim ? onOpenClaim(it) : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}

