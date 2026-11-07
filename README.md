# FindIt AI — Smart Campus Lost & Found Platform (Frontend)

FindIt AI is an intelligent, campus-scale lost and found web application engineered for college students, university staff, and campus security. Built with **React.js**, **Vite**, **Tailwind CSS**, and **React Router DOM**, this platform faithfully translates Google Stitch UI designs into a responsive, accessible, and interactive experience.

---

## 1. Project Overview & Design Philosophy

The visual and functional architecture follows the **Collegiate Intelligent SaaS** design language:
- **Primary Colors:** Deep Navy (`#172D55`), Royal Blue Accent (`#004BC5` / `#2764E8`), Soft Blue Highlights (`#EDF4FF`).
- **Surfaces & Canvas:** Layered cool-tinted cards (`#FFFFFF`, `#F8FAFF`, `#ECEEF3`) with navy-tinted ambient shadows.
- **Typography:** **Manrope** for authoritative headlines and **Inter** for crisp, data-dense item metadata.
- **Icons:** Google Material Symbols Outlined and Lucide React.
- **Architecture:** 100% frontend implementation with zero backend dependencies, utilizing an isolated mock service layer and `localStorage`.

---

## 2. Technology Stack

- **Framework:** React.js 18 (Functional components, Hooks)
- **Language:** JavaScript (ES6+ / JSX)
- **Build Tool:** Vite
- **Routing:** React Router DOM v6
- **Styling:** Tailwind CSS + PostCSS + Custom CSS variables matching `DESIGN.md`
- **Typography & Icons:** Google Fonts (Manrope, Inter), Material Symbols Outlined, Lucide React
- **Data Persistence:** Browser `localStorage` via asynchronous mock data service

---

## 3. How to Install Dependencies

Make sure **Node.js** (v18 or higher) and **npm** are installed on your machine.

Open your terminal in the project root directory and run:

```bash
npm install
```

This installs all required frontend packages: `react`, `react-dom`, `react-router-dom`, `lucide-react`, `tailwindcss`, `postcss`, `autoprefixer`, and `@vitejs/plugin-react`.

---

## 4. How to Run the Frontend

Start the Vite development server:

```bash
npm run dev
```

The application will start locally at:
👉 **`http://localhost:3000`** (or the port indicated in your terminal).

To create a production build:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

---

## 5. Available Application Routes

All 11 required pages are connected using React Router:

| Route | Page | Description |
| :--- | :--- | :--- |
| `/` | **Landing Page** | Campus hero with search bar, quick zone selector, high-confidence AI match alert banner, recent campus listings grid, and campus recovery zones. |
| `/login` | **Student Login** | Simulated authentication with email & password inputs, password visibility toggle, remember-me checkbox, and one-click demo credentials auto-fill. |
| `/register` | **Student Registration** | Student onboarding form (Name, University Email, Student ID, Department, Passwords, Campus Honor Code acceptance). |
| `/dashboard` | **Student Dashboard** | Central student portal displaying telemetry stat cards, high-confidence match alerts, user's recent reports, and live campus activity feed. |
| `/browse` | **Browse Items** | Live searchable catalog with status filters (All, Lost, Found), category dropdown, campus zone filter, and sort order. Includes empty state handling. |
| `/report` | **Report Lost/Found** | Interactive reporting form with Lost/Found toggle, photo preview upload, campus location dropdown, and immediate smart match calculation. |
| `/item/:id` | **Item Details** | Full listing overview with high-res photo, status badges, location, security desk verification badge, reporter contact, and "Submit Claim Request". |
| `/matches/:id` | **Smart Matches** | Algorithmic text and heuristic counter-matching screen. Evaluates title keyword overlap, category intersections, and building zone proximity with transparent percentage scores. |
| `/my-reports` | **My Reports** | Student listing management: filter by active/resolved, inline editing, report deletion, and marking items as recovered. |
| `/my-claims` | **My Claims** | Ownership claim verification tracking: submitted claims, received claims on found items, proof descriptions, and approval/rejection workflows. |
| `/profile` | **Student Profile** | Student identity card, contact details, campus notification toggles, and demo reset controls. |

---

## 6. Demo Login Instructions

The application simulates frontend session management via `localStorage`. No actual server or backend connection is needed.

### Pre-configured Demo Student Account:
- **Email:** `alex.chen@university.edu`
- **Password:** `password123` (or any string)
- **Student ID:** `#STU-84920`
- **Role:** Student (Computer Science & Engineering)

> **Quick Tip:** On the `/login` page, simply click the **"Auto-fill"** button to instantly populate these demo credentials and sign in.

---

## 7. Sample Data Architecture

All initial mock records are defined in:
📁 **`src/data/sampleData.js`**

### Seed Data Includes:
- **AirPods Pro in Case** (Found • 96% Match • Main Library)
- **Hydro Flask 32oz Yellow** (Lost • Student Union Cafe)
- **Student ID - Emma Watson** (Found • Secured at Science Atrium Desk)
- **Brown Leather Bi-Fold Wallet** (Found • East Quad Pavilion)
- **Black Sony Wireless Earbuds** (Lost • Rec Sports Complex Gym)
- **Blue Stainless Water Bottle** (Found • Dining Commons)
- **Calculus III Spiral Notebook** (Lost • Science Complex Lecture Hall B)
- **North Face Borealis Backpack** (Found • Library Circulation Desk)
- **Brass Keychain with Dorm Key** (Lost • East Quad Pavilion)
- **Bose QuietComfort 45 Headphones** (Found • Student Union Info Booth)

Data is automatically seeded into the browser's `localStorage` on first launch. If you wish to reset all reports and claims back to their initial state, navigate to the **Profile** page (`/profile`) and click **"Reset Demo Seed Data"**.

---

## 8. Smart Matching Algorithm (Demo Explanation)

Implemented in `src/services/mockDataService.js` (`calculateSmartMatches`):
- Operates on the client side without external AI APIs or paid models.
- When an item is selected, the algorithm finds complementary listings (e.g. Lost ↔ Found).
- Computes a similarity score based on:
  1. **Category Alignment:** Matches within the same category receive +35 base points.
  2. **Campus Zone Proximity:** Same campus zone (e.g., Main Library) grants +25 points.
  3. **Keyword Overlap:** Evaluates title and description token frequency (excluding common stopwords) for up to +38 points.
- Normalizes scores into a realistic match percentage (50% – 98%) and provides transparent human-readable match explanations (e.g., *'Same Campus Zone (Main Library)'*, *'Key terms match: AirPods, Case'*).

---

## 9. Future Backend Integration Guide

The code is strictly structured so that **UI components never touch `localStorage` directly**. All data access goes through:
📁 **`src/services/mockDataService.js`**

All functions in `mockDataService.js` return standard JavaScript **Promises** (using `async`/`await`).

### How to Transition to Node.js + Express + MySQL:

When you are ready to build the backend:

1. **Create an Express API Server** (e.g., `http://localhost:5000/api`):
   - `GET /api/items` & `POST /api/items`
   - `GET /api/items/:id` & `PUT /api/items/:id` & `DELETE /api/items/:id`
   - `GET /api/claims` & `POST /api/claims` & `PUT /api/claims/:id`
   - `POST /api/auth/login` & `POST /api/auth/register`
   - `GET /api/items/:id/matches`

2. **Update `src/services/mockDataService.js`**:
   Replace the `localStorage` lookups with `fetch` or `axios` calls:
   ```javascript
   // Example migration in mockDataService.js:
   const API_BASE_URL = "http://localhost:5000/api";

   export async function getItems() {
     const res = await fetch(`${API_BASE_URL}/items`);
     return await res.json();
   }

   export async function createItem(itemData) {
     const res = await fetch(`${API_BASE_URL}/items`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(itemData)
     });
     return await res.json();
   }
   ```

Because your React components (`Home.jsx`, `Dashboard.jsx`, `BrowseItems.jsx`, etc.) only consume functions from `mockDataService.js`, **zero changes will be required in the React UI components** when connecting your backend!

---

## 10. Folder Structure

```
stitch_findit_ai_campus_platform/
│
├── public/
│   └── assets/
│       └── stitch-design-preview.png
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Sticky header with search, auth avatar, responsive menu
│   │   ├── Sidebar.jsx         # Portal navigation with student ID & quick metrics
│   │   ├── Footer.jsx          # Collegiate minimalist footer
│   │   ├── ItemCard.jsx        # 16:10 card with status pills, AI match chip, hover states
│   │   ├── SearchBar.jsx       # Campus zone & keyword search bar
│   │   ├── StatusBadge.jsx     # Standardized status pills (LOST, FOUND, PENDING, APPROVED)
│   │   ├── StatCard.jsx        # Telemetry metrics card
│   │   ├── ClaimModal.jsx      # Proof-of-ownership verification modal
│   │   └── ReportModal.jsx     # Quick report intake modal
│   │
│   ├── pages/
│   │   ├── Home.jsx            # Landing page matching Stitch code.html
│   │   ├── Login.jsx           # Demo student login
│   │   ├── Register.jsx        # Student registration
│   │   ├── Dashboard.jsx       # Student command center
│   │   ├── BrowseItems.jsx     # Comprehensive catalog with filters
│   │   ├── ReportItem.jsx      # Full report intake page with image preview
│   │   ├── ItemDetails.jsx     # Individual item listing & custody instructions
│   │   ├── SmartMatches.jsx    # Algorithmic similarity matching breakdown
│   │   ├── MyReports.jsx       # User report management & recovery toggle
│   │   ├── MyClaims.jsx        # Ownership claim tracking & verification
│   │   └── Profile.jsx         # Student profile & demo resets
│   │
│   ├── data/
│   │   └── sampleData.js       # Seed datasets & campus locations
│   │
│   ├── services/
│   │   └── mockDataService.js  # Isolated async data layer & smart text matching
│   │
│   ├── styles/
│   │   └── global.css          # Design system CSS variables & font bindings
│   │
│   ├── App.jsx                 # Route declarations & global modal state
│   └── main.jsx                # React root mount
│
├── code.html                   # Original Stitch prototype export
├── DESIGN.md                   # Stitch Design System specification
├── screen.png                  # Stitch visual screenshot
├── index.html                  # HTML entry point with Google Fonts & Material Symbols
├── package.json                # Project dependencies and Vite build scripts
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.js          # Tailwind theme tokens (Collegiate Intelligent SaaS)
├── vite.config.js              # Vite server & React configuration
└── README.md                   # Project documentation & setup guide
```

