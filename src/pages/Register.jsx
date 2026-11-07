import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/mockDataService";

/**
 * Register Page
 * Student registration flow with validation and instant session seeding.
 */
export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !studentId.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreeTerms) {
      setError("Please accept the Campus Honor Code.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await register({
        name,
        email,
        studentId,
        department
      });
      navigate("/dashboard");
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10 flex items-center justify-center w-full">
      <div className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 sm:p-8 custom-shadow">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary-container text-white flex items-center justify-center font-bold mx-auto mb-3 shadow-sm">
            <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </div>
          <h2 className="text-2xl font-headline font-bold text-on-surface">Student Registration</h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Create your campus profile to track lost belongings and verify claims.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name & Student ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Alex Chen"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface focus:bg-white focus:border-primary outline-none transition-all placeholder:text-outline"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Student ID Number *
              </label>
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g., STU-84920"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface focus:bg-white focus:border-primary outline-none transition-all placeholder:text-outline"
              />
            </div>
          </div>

          {/* Email & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                University Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface focus:bg-white focus:border-primary outline-none transition-all placeholder:text-outline"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Department / Major
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface focus:bg-white focus:border-primary outline-none transition-all"
              >
                <option>Computer Science & Engineering</option>
                <option>Biomedical Sciences</option>
                <option>Mechanical & Electrical Engineering</option>
                <option>School of Business & Economics</option>
                <option>Liberal Arts & Humanities</option>
                <option>Design & Architecture</option>
              </select>
            </div>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface focus:bg-white focus:border-primary outline-none transition-all placeholder:text-outline"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface focus:bg-white focus:border-primary outline-none transition-all placeholder:text-outline"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-outline hover:text-on-surface flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
              <span>{showPassword ? "Hide passwords" : "Show passwords"}</span>
            </button>
          </div>

          {/* Terms & Honor Code */}
          <div className="flex items-start">
            <input
              id="agreeTerms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary"
            />
            <label htmlFor="agreeTerms" className="ml-2 text-xs text-on-surface-variant cursor-pointer leading-relaxed">
              I agree to abide by the Campus Honor Code, accurately report items, and verify ownership honestly.
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary-container hover:bg-primary text-white font-medium text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
          >
            <span>{loading ? "Registering student..." : "Complete Registration"}</span>
            <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 pt-4 border-t border-outline-variant text-center text-xs text-on-surface-variant">
          <span>Already registered? </span>
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in to existing account
          </Link>
        </div>
      </div>
    </div>
  );
}

