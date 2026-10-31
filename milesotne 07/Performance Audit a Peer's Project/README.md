# Arcade Heroes: High Score Wall (Performance Challenge)

Welcome to the **Arcade Heroes Performance Audit**. Your mission is to identify and resolve 6 critical performance bottlenecks in this full-stack application.

## 🚀 Setup Instructions

### 1. Backend Setup (Port 3001)
```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

### 2. Frontend Setup (Port 3000)
```bash
cd frontend
npm install
npm run dev
```

---

## 🕵️ The Performance Audit

There are **6 intentional issues** hidden in this codebase. Use Chrome DevTools (Network tab) and the React Profiler to find them.

### 🗄️ Backend Challenges

#### **B1: The Heavy Payload (No Pagination)**
*   **Problem**: The API returns all 300+ records at once.
*   **Hint**: Look at `backend/src/routes/scores.js`. Use Prisma's `skip` and `take` parameters to implement limit-based fetching.

#### **B2: Data Over-fetching**
*   **Problem**: The JSON contains a heavy `strategyNote` field that isn't used in the list view.
*   **Hint**: Modify your Prisma query to use the `select` property. Only fetch the fields that the UI actually displays.

#### **B3: Raw Transmission (No Compression)**
*   **Problem**: Data is being sent uncompressed.
*   **Hint**: Install the `compression` middleware and apply it to the main Express app in `backend/src/index.js`.

---

### ⚛️ Frontend Challenges

#### **F1: The Ghost Request (Double Fetch)**
*   **Problem**: The Network tab shows TWO identical API calls on every page load.
*   **Hint**: This is caused by React 18 Strict Mode and a missing cleanup. Use an `AbortController` inside your `useEffect` to cancel the request when the component unmounts.

#### **F2: The CPU Bottleneck (Expensive Search)**
*   **Problem**: Typing in the search box feels laggy as the list grows.
*   **Hint**: The filter logic is running on every render. Wrap it in a `useMemo` hook so it only recalculates when the search term or the data actually changes.

#### **F3: The Waterfall Re-render (Unstable Callbacks)**
*   **Problem**: Deleting one card causes EVERY other card to re-render.
*   **Hint**: The `onDelete` handler is being re-created on every render. Use `useCallback` to stabilize the function and wrap the `ScoreCard` component in `React.memo`.

---

## 🏆 Submission
Fix all 6 issues to achieve "Perfect Performance" status!
