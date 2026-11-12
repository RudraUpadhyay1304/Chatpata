# FindIt AI — Beginner Step-by-Step Setup & Deployment Guide

This guide walks you through setting up your free MongoDB cloud database, running the application locally on your computer, deploying it live to Vercel, and presenting it to your class.

---

## Part 1: Set Up Your Free Cloud Database (MongoDB Atlas)

MongoDB Atlas gives you a free cloud database (M0 sandbox) that never expires and requires no credit card.

### Step 1: Create an Atlas Account
1. Visit [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. Sign in and choose the **FREE (M0)** shared cluster option.
3. Select your closest cloud provider region (e.g., AWS / us-east-1 or ap-south-1).
4. Click **Create Deployment**.

### Step 2: Create a Database User
1. When prompted for database credentials, enter:
   - **Username**: choose a simple username (e.g., `findit_admin`).
   - **Password**: click "Autogenerate Secure Password" or type a strong password (e.g. `FindItSecure2026!`).
2. **Important**: Copy this password down immediately into a temporary notepad. You will need it in your connection string.
3. Click **Create Database User**.

### Step 3: Configure Network Access (Allow Vercel to Connect)
1. Under "Where would you like to connect from?", select **Cloud Environment** or navigate to **Security** &rarr; **Network Access** in the left sidebar.
2. Click **Add IP Address**.
3. Select **Allow Access from Anywhere** (`0.0.0.0/0`).
   > *Why?* Vercel serverless functions run across dynamic IP ranges, so opening `0.0.0.0/0` with your strong password ensures Vercel can always reach your database.
4. Click **Confirm**.

### Step 4: Copy Your Connection String
1. Go to **Databases** in the left sidebar and click the **Connect** button on your cluster.
2. Choose **Drivers** (Node.js).
3. Copy the connection string provided. It will look like:
   ```text
   mongodb+srv://findit_admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your real password from Step 2, and add `/findit` right before the `?` so your data saves to the `findit` database:
   ```text
   mongodb+srv://findit_admin:FindItSecure2026!@cluster0.abcde.mongodb.net/findit?retryWrites=true&w=majority
   ```

---

## Part 2: Local Development Setup

### Step 5: Create Your `.env` File
In your project folder (`lost find website`), create a file named `.env` (or copy `.env.example`):

```bash
# In Windows PowerShell:
Copy-Item .env.example .env
```

Open `.env` and fill in your values:

```env
MONGODB_URI=mongodb+srv://findit_admin:FindItSecure2026!@cluster0.abcde.mongodb.net/findit?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_random_key_for_campus_project_12345
```

### Step 6: Test Locally
You have two easy ways to run locally:

#### Option A: Built-in Node Server (Zero Extra Tools)
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Option B: Vercel CLI Emulation
```bash
npx vercel dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Part 3: Deploy to Vercel

### Step 7: Push Your Code to GitHub
Ensure you are on the `js-backend` branch:

```bash
git add .
git commit -m "Convert FindIt AI to vanilla HTML/CSS/JS with MongoDB backend"
git push -u origin js-backend
```

### Step 8: Import Repository into Vercel
1. Log in to [vercel.com](https://vercel.com).
2. Click **Add New...** &rarr; **Project**.
3. Select your repository (`Chatpata` / `lost find website`).
4. Select the branch: **`js-backend`**.
5. Framework Preset: **Other** (no build step).

### Step 9: Add Environment Variables in Vercel
Before clicking Deploy, expand the **Environment Variables** section and add:
- `MONGODB_URI`: Your Atlas connection string from Step 4.
- `JWT_SECRET`: A long random secret string (e.g. `prod_secret_campus_lost_found_2026_xyz`).

### Step 10: Deploy
1. Click **Deploy**.
2. Vercel will build your static files and deploy your `/api` serverless functions in ~20 seconds.
3. Once complete, click the generated `.vercel.app` URL to visit your live site!

---

## Part 4: Live Presentation Walkthrough Script

Use this exact 3-minute script when presenting to professors or classmates:

1. **Introduction (30 seconds)**:
   > "Hello everyone! This is **FindIt AI**, an intelligent campus lost & found web application built entirely using pure vanilla HTML, modern CSS, and JavaScript. We have no build steps, no external frameworks like React or Tailwind, and zero mock data. Everything you see is running on Vercel serverless functions connected to a real MongoDB cloud database."

2. **Account Registration & Security (45 seconds)**:
   > "I'll start by registering a new student account: `alex_student`. We enforce strict authentication rules: minimum 8-character passwords hashed with bcrypt, case-insensitive unique usernames, and session tokens stored in secure, httpOnly cookies. Notice that rate-limiting blocks brute force attacks after 5 failed attempts in 15 minutes."

3. **Reporting a Lost Item & Canvas Compression (45 seconds)**:
   > "Now let's report a lost item: *AirPods Pro White Case* at the *Main Library 2nd Floor*. When we upload a photo, our client-side HTML5 Canvas compresses and resizes the image to under 300 KB before sending it to MongoDB as a data URL, meaning zero external cloud bucket costs."

4. **Algorithmic Smart Matching (45 seconds)**:
   > "Immediately upon submission, FindIt AI runs our server-side heuristic matching engine. It compares category, campus building proximity, and keyword token overlap against real counter-items in the database. Notice how items with 0 score are excluded, showing only ranked, high-confidence matches."

5. **Cross-User Claims Verification & Resolution (30 seconds)**:
   > "If I log in as a second student who found the item, I can see the report, submit proof of ownership, and as the finder, approve the claim. The status automatically updates to 'Claimed' across both accounts in real-time."

