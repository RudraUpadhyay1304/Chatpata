import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/mockDataService";

/**
 * Login Page
 * Student authentication page with demo auto-fill and password toggle.
 */
export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("alex.chen@university.edu");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFillDemo = () => {
    setEmail("alex.chen@university.edu");
    setPassword("campus2026");
    setError("");
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-12 flex items-center justify-center w-full">
      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 sm:p-8 custom-shadow">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary-container text-white flex items-center justify-center font-bold mx-auto mb-3 shadow-sm">
            <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </div>
          <h2 className="text-2xl font-headline font-bold text-on-surface">Student Sign In</h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Access your campus lost & found dashboard and claim requests.
          </p>
        </div>

        {/* Demo Credentials Quick Banner */}
        <div className="mb-5 p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs flex items-center justify-between">
          <div>
            <span className="font-semibold text-primary block">Demo Student Account</span>
            <span className="text-[11px] text-on-surface-variant">alex.chen@university.edu</span>
          </div>
          <button
            type="button"
            onClick={handleAutoFillDemo}
            className="text-[11px] font-semibold bg-white border border-blue-200 text-primary px-2.5 py-1 rounded-md hover:bg-blue-50 transition-colors shadow-xs"
          >
            Auto-fill
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              University Email
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
                mail
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs sm:text-sm text-on-surface focus:bg-white focus:border-primary outline-none transition-all placeholder:text-outline"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-on-surface">Password</label>
              <button
                type="button"
                onClick={() => alert("Demo Mode: You can sign in with any password or use the auto-fill button above.")}
                className="text-[11px] text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
                lock
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs sm:text-sm text-on-surface focus:bg-white focus:border-primary outline-none transition-all placeholder:text-outline"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-outline hover:text-on-surface transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary"
            />
            <label htmlFor="rememberMe" className="ml-2 text-xs text-on-surface-variant cursor-pointer">
              Remember me on this browser
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary-container hover:bg-primary text-white font-medium text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
          >
            <span>{loading ? "Signing in..." : "Sign In to Campus Portal"}</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 pt-4 border-t border-outline-variant text-center text-xs text-on-surface-variant">
          <span>New student to FindIt AI? </span>
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Create an account
          </Link>
        </div>

        {/* Demo Disclaimer */}
        <p className="text-[10px] text-outline text-center mt-4">
          Note: Simulated Frontend Demo Authentication using browser localStorage.
        </p>
      </div>
    </div>
  );
}

