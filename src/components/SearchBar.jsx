import React, { useState } from "react";
import { CAMPUS_ZONES } from "../data/sampleData";

/**
 * SearchBar Component
 * Matches the Stitch hero search control and browse filter bar.
 */
export default function SearchBar({
  initialQuery = "",
  initialZone = "all",
  onSearch,
  placeholder = "What did you lose? (e.g., AirPods, Hydro Flask, ID)"
}) {
  const [query, setQuery] = useState(initialQuery);
  const [zone, setZone] = useState(initialZone);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query, zone);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface-container-low p-2 rounded-xl border border-outline-variant flex flex-col sm:flex-row gap-2 w-full max-w-2xl mx-auto"
    >
      <div className="relative flex-1">
        <span className="material-symbols-outlined absolute left-3 top-3 text-outline text-[18px]">
          search
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2 bg-white border border-outline-variant rounded-lg text-xs sm:text-sm text-on-surface focus:border-primary outline-none transition-all placeholder:text-outline"
        />
      </div>

      <select
        value={zone}
        onChange={(e) => setZone(e.target.value)}
        className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-xs sm:text-sm text-on-surface-variant focus:border-primary outline-none transition-all"
      >
        {CAMPUS_ZONES.map((z) => (
          <option key={z.id} value={z.id}>
            {z.name}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="bg-primary-container hover:bg-primary text-white font-medium text-xs sm:text-sm px-5 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-95 shadow-sm"
      >
        <span className="material-symbols-outlined text-[17px]">search</span>
        <span>Search</span>
      </button>
    </form>
  );
}

