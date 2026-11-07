import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ReportModal from "./components/ReportModal";
import ClaimModal from "./components/ClaimModal";

// Import All 11 Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BrowseItems from "./pages/BrowseItems";
import ReportItem from "./pages/ReportItem";
import ItemDetails from "./pages/ItemDetails";
import SmartMatches from "./pages/SmartMatches";
import MyReports from "./pages/MyReports";
import MyClaims from "./pages/MyClaims";
import Profile from "./pages/Profile";

/**
 * ScrollToTop helper to reset viewport on route transition
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/**
 * App Root Component
 * Coordinates routing, global report modal, and claim verification modals.
 */
export default function App() {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportModalType, setReportModalType] = useState("lost");
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [targetClaimItem, setTargetClaimItem] = useState(null);

  const handleOpenReport = (type = "lost") => {
    setReportModalType(type);
    setReportModalOpen(true);
  };

  const handleOpenClaim = (item) => {
    setTargetClaimItem(item);
    setClaimModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-body selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      <ScrollToTop />

      {/* Global Navbar */}
      <Navbar onOpenReport={handleOpenReport} />

      {/* Main Routed Content */}
      <main className="flex-1 flex flex-col w-full">
        <Routes>
          <Route
            path="/"
            element={<Home onOpenReport={handleOpenReport} onOpenClaim={handleOpenClaim} />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={<Dashboard onOpenReport={handleOpenReport} onOpenClaim={handleOpenClaim} />}
          />
          <Route
            path="/browse"
            element={<BrowseItems onOpenClaim={handleOpenClaim} onOpenReport={handleOpenReport} />}
          />
          <Route path="/report" element={<ReportItem />} />
          <Route
            path="/item/:id"
            element={<ItemDetails onOpenClaim={handleOpenClaim} />}
          />
          <Route
            path="/matches/:id"
            element={<SmartMatches onOpenClaim={handleOpenClaim} />}
          />
          <Route
            path="/my-reports"
            element={<MyReports onOpenReport={handleOpenReport} />}
          />
          <Route path="/my-claims" element={<MyClaims />} />
          <Route path="/profile" element={<Profile />} />
          {/* Catch-all redirect to Home */}
          <Route
            path="*"
            element={<Home onOpenReport={handleOpenReport} onOpenClaim={handleOpenClaim} />}
          />
        </Routes>
      </main>

      {/* Global Footer */}
      <Footer onOpenReport={handleOpenReport} />

      {/* Global Quick Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        initialType={reportModalType}
      />

      {/* Global Quick Claim Verification Modal */}
      <ClaimModal
        isOpen={claimModalOpen}
        onClose={() => {
          setClaimModalOpen(false);
          setTargetClaimItem(null);
        }}
        item={targetClaimItem}
      />
    </div>
  );
}

