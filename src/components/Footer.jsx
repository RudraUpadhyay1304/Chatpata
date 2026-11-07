import React from "react";
import { Link } from "react-router-dom";

/**
 * Footer Component
 * Minimalist Clean Collegiate Footer from Stitch designs.
 */
export default function Footer({ onOpenReport }) {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-outline">
        {/* Brand Label */}
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-primary-container text-white flex items-center justify-center text-[11px] font-bold">
            <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </span>
          <span className="font-headline font-semibold text-on-surface">FindIt AI</span>
          <span>• Campus Lost & Found College Project</span>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-on-surface-variant font-medium">
          <Link to="/browse" className="hover:text-primary transition-colors">
            Browse Items
          </Link>
          <Link to="/report?type=lost" className="hover:text-primary transition-colors">
            Report Lost
          </Link>
          <Link to="/report?type=found" className="hover:text-primary transition-colors">
            Report Found
          </Link>
          <Link to="/dashboard" className="hover:text-primary transition-colors">
            Student Portal
          </Link>
          <a
            href="mailto:campus-lostfound@university.edu"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <span>Campus Help Desk</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

