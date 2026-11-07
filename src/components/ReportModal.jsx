import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createItem } from "../services/mockDataService";
import { CATEGORIES, CAMPUS_ZONES } from "../data/sampleData";

/**
 * ReportModal Component
 * Reusable modal for quickly logging lost or found items from anywhere in the app.
 */
export default function ReportModal({ isOpen, onClose, initialType = "lost", onItemCreated }) {
  const navigate = useNavigate();
  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Electronics & Audio");
  const [location, setLocation] = useState("Main University Library");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialType) setType(initialType);
  }, [initialType]);

  if (!isOpen) return null;

  // Handle local image file upload preview
  const handleImageFileChange = (e) => {
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
      setError("Please provide an item title.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // Find matching campus zone ID
      const zoneMatch = CAMPUS_ZONES.find((z) => location.toLowerCase().includes(z.name.toLowerCase().split(" ")[0]))?.id || "library";

      const created = await createItem({
        title,
        type,
        category,
        location,
        zone: zoneMatch,
        description,
        imageUrl: imagePreview || (type === "lost"
          ? "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80"
          : "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80")
      });

      // Clear state and close
      setTitle("");
      setDescription("");
      setImagePreview("");
      onClose();

      if (onItemCreated) {
        onItemCreated(created);
      } else {
        // Navigate to the newly created item or smart matches
        navigate(`/matches/${created.id}`);
      }
    } catch (err) {
      setError("Error creating report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-lg p-6 custom-shadow max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">
              add_circle
            </span>
            <h3 className="font-headline font-bold text-base text-on-surface">
              {type === "lost" ? "Report a Lost Item" : "Report a Found Item"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-outline hover:text-on-surface p-1 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Item Status Toggle */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5">
              Item Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`border rounded-lg p-2.5 flex items-center gap-2 cursor-pointer transition-colors ${
                  type === "lost"
                    ? "border-rose-500 bg-rose-50/50 text-rose-800"
                    : "border-outline-variant hover:bg-surface-container-low text-on-surface"
                }`}
              >
                <input
                  type="radio"
                  name="modalItemStatus"
                  value="lost"
                  checked={type === "lost"}
                  onChange={() => setType("lost")}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs font-medium">I Lost It</span>
              </label>

              <label
                className={`border rounded-lg p-2.5 flex items-center gap-2 cursor-pointer transition-colors ${
                  type === "found"
                    ? "border-emerald-600 bg-emerald-50/50 text-emerald-800"
                    : "border-outline-variant hover:bg-surface-container-low text-on-surface"
                }`}
              >
                <input
                  type="radio"
                  name="modalItemStatus"
                  value="found"
                  checked={type === "found"}
                  onChange={() => setType("found")}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-medium">I Found It</span>
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
              placeholder="e.g., Black Sony Headphones, Blue Hydro Flask"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface focus:bg-white focus:border-primary outline-none transition-all placeholder:text-outline"
            />
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface focus:bg-white focus:border-primary outline-none"
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
                Campus Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface focus:bg-white focus:border-primary outline-none"
              >
                {CAMPUS_ZONES.filter((z) => z.id !== "all").map((zone) => (
                  <option key={zone.id} value={zone.name}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Photo (Optional but helps AI matching)
            </label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-outline-variant h-36 bg-surface-container">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImagePreview("")}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-outline-variant rounded-xl p-4 text-center bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <span className="material-symbols-outlined text-[24px] text-primary">
                  add_a_photo
                </span>
                <p className="text-xs text-on-surface font-medium mt-1">Click to upload photo</p>
                <p className="text-[11px] text-outline">JPG or PNG (max 5MB)</p>
              </label>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Distinct Features / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mention any stickers, scratches, case color, or exact table location..."
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface focus:bg-white focus:border-primary outline-none transition-all placeholder:text-outline"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs text-on-surface-variant hover:text-on-surface rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary-container hover:bg-primary text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>{submitting ? "Submitting..." : "Submit Report"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

