# 🚀 Space Mission Logs: End-to-End Optimization Challenge

Welcome to the **Performance Engineering Sprint**! This repository is intentionally built with several major performance "antipatterns" that you must identify, measure, and fix.

## 🛰️ About the Project
This application is a dashboard for **Space Mission Logs**. It displays a catalog of 200 missions, including telemetry data, crew members, and event logs. While the UI looks professional, the engine under the hood is struggling.

## 🛠️ How to Run

### 1. Backend Setup
1. `cd backend`
2. `npm install`
3. Update your `.env` with a valid PostgreSQL `DATABASE_URL`.
4. Run `npx prisma db push` to sync the schema.
5. Run `npm run seed` to populate the mission logs.
6. Run `npm start` to launch the server on port 3001.

### 2. Frontend Setup
1. `cd frontend`
2. `npm install`
3. Run `npm run dev` to launch the dashboard on port 3000.

---

## 🔍 Your Mission: Target 8 Bottlenecks
You must find and remediate the following issues. Use the **Network Tab** and **React Profiler** to prove the improvements.

### 🕵️ Backend Hints
1. **The N+1 Trap**: Look at the logic in `GET /api/missions`. Are you looping and making queries inside that loop? 
2. **Payload Weight**: Every mission has a massive description. Does the "List View" really need it? Check Prisma `@select`.
3. **Missing Pagination**: The server sends all 200 items at once. Implement `limit` and `page` parameters.
4. **Data Squeeze**: Express is sending JSON as raw text. Learn about the `compression` middleware to reduce size by ~80%.

### 🕵️ Frontend Hints
5. **Memoization Sabotage**: `MissionCard` is wrapped in `React.memo`, yet it re-renders every time you type. Check the `style` prop—is it a stable reference?
6. **The Blocked Thread**: Searching is laggy. Look for a heavy computation in `MissionList.jsx` and wrap it in `useMemo`.
7. **Redundant Fetching**: The app makes two network requests on mount. Fix the dependency array and add an `AbortController` cleanup.
8. **DOM Pressure**: Rendering 200 complex cards at once kills performance. Use client-side slicing to implement a "Load More" system.

---

## 📈 Success Criteria
You have completed the challenge when:
- Database queries per request drop from **401 to 1**.
- Initial data transfer drops from **2MB+ to <50KB**.
- Search feel is instantaneous (0ms blocking time).
- You can document all improvements in your `FINAL_REPORT.md`.

Good luck, Commander! 👨‍🚀
