# 🛒 PerfStore Challenge: Fix the Frontend Performance Bugs (Broken Starter)

Welcome to **Milestone 7** of the Project Engineering Track! In this challenge, you will take on the role of a Performance Engineer tasked with optimizing a sluggish, janky React application. 

This repository starts as a "broken" version. Your goal is to identify **five specific performance anti-patterns** using the React Profiler and resolve them to create a butter-smooth user experience.

---

## 🛠️ Project Setup Guide

### 🏛️ Technology Stack
- **Frontend**: React 18 + Vite (for lightning-fast HMR and building).
- **Backend**: Node.js + Express (streamlined for high-throughput product retrieval).
- **In-Memory Store**: No database setup required. 550+ products are generated instantly on server startup.
- **Styling**: Tailwind CSS (for a bespoke, premium design).

### 1. Prerequisites
Before you start, ensure you have the following installed:
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)

### 2. Backend Setup (In-Memory)
The backend provides a catalog of over 500+ products generated instantly in memory. **No database setup required.**

1.  **Navigate to the backend folder**:
    ```bash
    cd backend
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start the API Server**:
    ```bash
    npm run dev
    ```
    The backend will dynamically generate the product catalog and run at `http://localhost:5000`.

### 3. Frontend Setup (The Challenge)
The frontend contains the performance bottlenecks that need your expertise.

1.  **Navigate to the frontend folder**:
    ```bash
    cd frontend
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start the Development Server**:
    ```bash
    npm run dev
    ```
    The frontend should now be running at `http://localhost:5173`.

---

## 🔎 The Performance Audit Checklist

Your task is to identify and fix these five severe bugs that are currently "breaking" the user experience:

| ID | Issue | Symptom | How to Debug? |
|---|---|---|---|
| **#1** | **Unnecessary Re-render** | Child components update even when their own data is static. | Look for unstable props (like inline objects) passed to `ProductCard`. |
| **#2** | **Expensive Computation** | Typing in the search box feels laggy and delays input. | Find heavy logic running directly in the `ProductList` render function. |
| **#3** | **Double Fetch on Mount** | Open the Network tab. Why are two identical `/products` requests made? | Double-check the `useEffect` dependencies and cleanup in `ProductsPage`. |
| **#4** | **Large State Rendering** | The UI freezes briefly when hundreds of items load at once. | Determine if the entire state needs to be rendered in the DOM simultaneously. |
| **#5** | **Unstable Callback** | Every delete operation causes a full "cascading" re-render. | Trace the reference identity of functions passed as props to children. |

---

## 📝 Submission Document
As part of this milestone, you MUST fill out:
- **`PERF_REPORT.md`**: Record your profiling data before and after each fix.
- **`Changes.md`**: Explain the "Why" and "How" behind each architectural decision you made.

**Good luck, Engineer!** 💻🚀
