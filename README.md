# FindIt — Campus Lost & Found Platform

A campus-scale Lost & Found web platform engineered for universities, students, and campus administrators. Built with **pure vanilla HTML, CSS, and JavaScript** with zero build steps, deployed seamlessly on Vercel Serverless Functions with MongoDB Atlas.

---

## 🌟 Key Highlights

- **Pure Web Standards**: Built entirely using pure HTML5, CSS3, and modern vanilla JavaScript. No React, JSX, Vite, or Tailwind build chains.
- **Pure Node.js Serverless Backend**: 10 lightweight Node.js serverless functions running inside `/api` on Vercel, with a native `http.createServer()` local development server (`server.js`) — zero Express.js dependencies.
- **Real Cloud Database**: Persistent MongoDB Atlas collections for `users`, `items`, and `claims` with automatic connection pooling and indexing.
- **Production-Ready Security**:
  - Stateless session tokens stored in `httpOnly`, `SameSite=Lax`, `Secure` cookies.
  - Strict input sanitization and regex escaping to prevent NoSQL injection.
  - XSS defense: all user-supplied text rendered via safe DOM `textContent`.
- **Mandatory Reporter Contact**: Enforces a verified contact phone number (at least 10 digits) on every report, enabling direct peer-to-peer communication between finders and owners.
- **Designated Campus Areas**: Categorized spatial tagging across campus zones (Main Gate parking area, Principal Office, Academic Block, B/C/D/E Blocks, CS & Cyber Departments, Football Ground, Basketball Court, Sports Departmental Area, Yashwant Hall) with a dynamic "Other" option for custom locations.
- **Client-Side Canvas Compression**: Automatic image scaling to max 800px and JPEG ~0.7 quality under 300 KB before upload to MongoDB data URLs.
- **Ownership Verification Workflow**: Structured claim submission requiring descriptive proof of ownership before claims can be reviewed and approved by the item reporter.

---

## 📁 Repository Structure

```text
├── api/                     # Vercel Serverless API endpoints (10 files)
│   ├── auth/
│   │   ├── register.js      # POST /api/auth/register
│   │   ├── login.js         # POST /api/auth/login
│   │   ├── logout.js        # POST /api/auth/logout
│   │   └── me.js            # GET /api/auth/me
│   ├── items/
│   │   ├── index.js         # GET (search/filter/pagination) & POST /api/items
│   │   └── [id].js          # GET, PUT, DELETE /api/items/[id]
│   ├── claims/
│   │   ├── index.js         # GET & POST /api/claims
│   │   └── [id].js          # PATCH /api/claims/[id]
│   ├── stats.js             # GET /api/stats (live database counts)
│   └── users/me.js          # PATCH /api/users/me (profile updates)
├── lib/                     # Core backend helpers (modularized)
│   ├── db.js                # MongoDB connection pool & auto-indexing
│   ├── auth.js              # Cookie session tokens (signToken, verifyToken)
│   └── validation.js        # Input sanitization, phone validation & campus zones
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
│   │   ├── item.js          # Item details view & actions
│   │   ├── my-reports.js    # My reports management
│   │   ├── my-claims.js     # Claims verification center
│   │   └── profile.js       # Student profile & settings
│   ├── index.html           # Landing page
│   ├── login.html           # Sign In page
│   ├── register.html        # Registration page
│   ├── dashboard.html       # Dashboard portal
│   ├── browse.html          # Browse directory
│   ├── item.html            # Item details page (?id=)
│   ├── my-reports.html      # User reports page
│   ├── my-claims.html       # User claims page
│   └── profile.html         # User profile page
├── .gitignore               # Ignored files (node_modules, .env, reports)
├── package.json             # Pure Node.js dependencies (cookie, dotenv, mongodb)
├── server.js                # Native Node.js local dev server (http.createServer)
└── vercel.json              # Vercel deployment configuration
```

---

## 🚀 Quick Start Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Database**:
   Create a `.env` file in the root directory and set your MongoDB Atlas connection string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/findit?retryWrites=true&w=majority
   PORT=3000
   ```

3. **Start the Application**:
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.
