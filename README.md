# FindIt — Campus Lost & Found Platform

A campus-scale Lost & Found web platform engineered for universities, students, and campus administrators. Built with **pure vanilla HTML, CSS, and JavaScript** with zero build steps, deployed seamlessly on Vercel Serverless Functions with MongoDB Atlas.

---

## 🌟 Key Highlights

- **Pure Web Standards**: Built entirely using pure HTML5, CSS3, and modern vanilla JavaScript. No React, JSX, Vite, or Tailwind build chains.
- **Serverless Backend**: 11 lightweight Node.js serverless functions running inside `/api` on Vercel.
- **Real Cloud Database**: Persistent MongoDB Atlas collections for `users`, `items`, `claims`, and `login_attempts`.
- **Production-Ready Security**:
  - `bcryptjs` password hashing with salt generation (never plain text).
  - JWT sessions stored in `httpOnly`, `SameSite=Lax`, `Secure` cookies.
  - Brute-force rate limiting: accounts locked after 5 failed attempts in 15 minutes via MongoDB TTL index.
  - Strict input sanitization and regex escaping to prevent NoSQL injection.
  - XSS defense: all user-supplied text rendered via `textContent`.
- **Heuristic Smart Matching**: Algorithmic counter-matching engine evaluating category overlap, campus zone proximity, and title/description token intersections on real database items.
- **Client-Side Canvas Compression**: Automatic image scaling to max 800px and JPEG ~0.7 quality under 300 KB before upload to MongoDB data URLs.

---

## 📁 Repository Structure

```text
├── api/                     # Vercel Serverless API endpoints (11 files)
│   ├── auth/
│   │   ├── register.js      # POST /api/auth/register
│   │   ├── login.js         # POST /api/auth/login
│   │   ├── logout.js        # POST /api/auth/logout
│   │   └── me.js            # GET /api/auth/me
│   ├── items/
│   │   ├── index.js         # GET (search/filter/pagination) & POST /api/items
│   │   ├── [id].js          # GET, PUT, DELETE /api/items/[id]
│   │   └── [id]/matches.js  # GET /api/items/[id]/matches
│   ├── claims/
│   │   ├── index.js         # GET & POST /api/claims
│   │   └── [id].js          # PATCH /api/claims/[id]
│   ├── stats.js             # GET /api/stats (live database counts)
│   └── users/me.js          # PATCH /api/users/me (profile updates)
├── lib/                     # Core backend helpers (modularized)
│   ├── db.js                # MongoDB connection pool & auto-indexing
│   ├── auth.js              # Password hashing & JWT cookie helpers
│   ├── rateLimit.js         # Brute-force rate limiting with TTL
│   ├── validation.js        # Input sanitization & size guards
│   └── matching.js          # Heuristic smart matching algorithm
├── public/                  # Static frontend files (served at root /)
│   ├── css/
│   │   └── style.css        # Vanilla CSS matching collegiate design system
│   ├── js/                  # Vanilla JavaScript controllers
│   │   ├── api.js           # Centralized fetch client
│   │   ├── common.js        # Navbar, footer, modals, auth guards, resizer
│   │   ├── index.js         # Home page controller
│   │   ├── login.js         # Login page controller
│   │   ├── register.js      # Registration page controller
│   │   ├── dashboard.js     # Student portal dashboard
│   │   ├── browse.js        # Catalog search & filter directory
│   │   ├── report.js        # Report item form
│   │   ├── item.js          # Item details view & actions
│   │   ├── matches.js       # Smart matches breakdown
│   │   ├── my-reports.js    # My reports management
│   │   ├── my-claims.js     # Claims verification center
│   │   └── profile.js       # Student profile & settings
│   ├── index.html           # Landing page
│   ├── login.html           # Sign In page
│   ├── register.html        # Registration page
│   ├── dashboard.html       # Dashboard portal
│   ├── browse.html          # Browse directory
│   ├── report.html          # Item report page
│   ├── item.html            # Item details page (?id=)
│   ├── matches.html         # Smart matches page (?id=)
│   ├── my-reports.html      # User reports page
│   ├── my-claims.html       # User claims page
│   └── profile.html         # User profile page
├── test/
│   └── test-backend.js      # Comprehensive automated backend test suite
├── .env.example             # Environment variable template
├── .gitignore               # Ignored files (node_modules, .env)
├── package.json             # Pure Node.js dependencies
├── server.js                # Built-in local dev server
├── SETUP_GUIDE.md           # Step-by-step setup, MongoDB Atlas, and Vercel guide
└── vercel.json              # Vercel deployment configuration
```

---

## 🚀 Quick Start Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Comprehensive Verification Suite**:
   ```bash
   npm test
   ```

3. **Configure Database**:
   Copy `.env.example` to `.env` and fill in your `MONGODB_URI` and `JWT_SECRET` (see [SETUP_GUIDE.md](SETUP_GUIDE.md)):
   ```bash
   cp .env.example .env
   ```

4. **Start the Application**:
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.
