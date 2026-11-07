import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { createItem, calculateSmartMatches } from "../services/mockDataService";
import { CATEGORIES, CAMPUS_ZONES } from "../data/sampleData";

/**
 * ReportItem Page
 * Dedicated full-screen report intake page with image preview and AI match transition.
 */
export default function ReportItem() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [type, setType] = useState(searchParams.get("type") || "lost");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Electronics & Audio");
  const [location, setLocation] = useState("Main University Library");
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [contactNote, setContactNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedItem, setSubmittedItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const qType = searchParams.get("type");
    if (qType === "lost" || qType === "found") {
      setType(qType);
    }
  }, [searchParams]);

  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please specify the item title.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const zoneMatch = CAMPUS_ZONES.find((z) => location.toLowerCase().includes(z.name.toLowerCase().split(" ")[0]))?.id || "library";

      const created = await createItem({
        title,
        type,
        category,
        location,
        zone: zoneMatch,
        date: new Date(date).toISOString(),
        description: description + (contactNote ? ` | Reporter Note: ${contactNote}` : ""),
        imageUrl: imagePreview || (type === "lost"
          ? "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80"
          : "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80")
      });

      // Calculate matches for this newly created item
      const potentialMatches = await calculateSmartMatches(created.id);
      setMatches(potentialMatches);
      setSubmittedItem(created);
    } catch (err) {
      setError("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
      {submittedItem ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 sm:p-10 custom-shadow text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[36px]">check_circle</span>
          </div>

          <div>
            <h2 className="text-2xl font-headline font-bold text-on-surface">
              Report Submitted Successfully!
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto mt-1">
              Your {submittedItem.type.toUpperCase()} report for <strong>"{submittedItem.title}"</strong> has been logged into the live campus system.
            </p>
          </div>

          {/* Smart Match Teaser */}
          {matches.length > 0 ? (
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 max-w-md mx-auto text-left flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-[24px] shrink-0 mt-0.5">
                auto_awesome
              </span>
              <div>
                <p className="text-xs font-bold text-on-surface">
                  {matches.length} Potential Smart Matches Detected!
                </p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  Top match: <strong>{matches[0].candidate.title}</strong> ({matches[0].matchScore}% similarity).
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-outline">
              FindIt AI will continuously index new items and alert you when a match is submitted.
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            {matches.length > 0 && (
              <Link
                to={`/matches/${submittedItem.id}`}
                className="px-5 py-2.5 bg-primary-container hover:bg-primary text-white font-medium text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
                <span>View Smart Matches</span>
              </Link>
            )}

            <Link
              to="/my-reports"
              className="px-4 py-2.5 bg-surface-container-low hover:bg-surface-container text-on-surface font-medium text-xs rounded-xl border border-outline-variant transition-colors"
            >
              Go to My Reports
            </Link>

            <button
              onClick={() => {
                setSubmittedItem(null);
                setTitle("");
                setDescription("");
                setImagePreview("");
              }}
              className="px-4 py-2.5 text-xs text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Report Another Item
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 sm:p-10 custom-shadow">
          {/* Header */}
          <div className="flex items-center gap-3 pb-5 border-b border-outline-variant mb-6">
            <span className="w-10 h-10 rounded-xl bg-primary-container text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">add_circle</span>
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-headline font-bold text-on-surface">
                Report Campus Lost or Found Item
              </h1>
              <p className="text-xs text-on-surface-variant">
                Fill in key characteristics to power instant algorithmic matching across campus zones.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type Radio Cards */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-2">
                Report Type *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`border rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all ${
                    type === "lost"
                      ? "border-rose-500 bg-rose-50/40 text-rose-800 shadow-xs ring-1 ring-rose-500"
                      : "border-outline-variant hover:bg-surface-container-low text-on-surface"
                  }`}
                >
                  <input
                    type="radio"
                    name="reportItemType"
                    value="lost"
                    checked={type === "lost"}
                    onChange={() => setType("lost")}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <span className="text-xs font-bold block">I Lost Something</span>
                    <span className="text-[11px] text-on-surface-variant">
                      Item misplaced on university campus
                    </span>
                  </div>
                </label>

                <label
                  className={`border rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all ${
                    type === "found"
                      ? "border-emerald-600 bg-emerald-50/40 text-emerald-800 shadow-xs ring-1 ring-emerald-600"
                      : "border-outline-variant hover:bg-surface-container-low text-on-surface"
                  }`}
                >
                  <input
                    type="radio"
                    name="reportItemType"
                    value="found"
                    checked={type === "found"}
                    onChange={() => setType("found")}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold block">I Found Something</span>
                    <span className="text-[11px] text-on-surface-variant">
                      Item located and in safe student/desk custody
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Item Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Black Sony WF-1000XM4 Wireless Earbuds, Yellow Hydro Flask"
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs sm:text-sm text-on-surface focus:bg-white focus:border-primary outline-none transition-all placeholder:text-outline"
              />
            </div>

            {/* Category & Campus Zone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface focus:bg-white focus:border-primary outline-none transition-all"
                >
                  {CATEGORIES.filter((c) => c !== "All Categories").map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Campus Location / Zone *
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface focus:bg-white focus:border-primary outline-none transition-all"
                >
                  {CAMPUS_ZONES.filter((z) => z.id !== "all").map((zone) => (
                    <option key={zone.id} value={zone.name}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Logged */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Date Incident Occurred
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full sm:w-1/2 px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface focus:bg-white focus:border-primary outline-none transition-all"
              />
            </div>

            {/* Photo Upload Box */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Item Photo (Optional but significantly enhances AI match score)
              </label>
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-outline-variant h-48 bg-surface-container">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImagePreview("")}
                    className="absolute top-3 right-3 bg-black/70 text-white rounded-full p-1.5 hover:bg-black transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-outline-variant rounded-xl p-6 text-center bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <span className="material-symbols-outlined text-[32px] text-primary">
                    add_a_photo
                  </span>
                  <p className="text-xs text-on-surface font-semibold mt-1">Upload an image</p>
                  <p className="text-[11px] text-outline mt-0.5">JPG, PNG, or WEBP (Max 5MB)</p>
                </label>
              )}
            </div>

            {/* Distinct Features */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Distinct Features / Specific Details
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention specific markings, scratches, stickers, brand model, case color, or table/locker number..."
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface focus:bg-white focus:border-primary outline-none transition-all placeholder:text-outline"
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
              <Link
                to="/browse"
                className="px-4 py-2 text-xs text-on-surface-variant hover:text-on-surface rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-primary-container hover:bg-primary text-white font-medium text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-2 shadow-sm active:scale-95 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">check</span>
                <span>{submitting ? "Publishing report..." : "Publish Report"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

