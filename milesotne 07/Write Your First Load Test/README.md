# 🎬 Write Your First Load Test – Movie Quote API

Welcome to **Milestone 07 of the Project Engineering Track!** In this challenge, you will load test a "Movie Quote Vault" – a full-stack application that provides access to 1,000 famous movie quotes.

## 📌 The Challenge
The API you are working with has two versions of the same endpoint:
1.  **Unpaginated**: Returns all 1,000 quotes in a single response (slow, memory-heavy).
2.  **Paginated**: Returns quotes 20 at a time with metadata (fast, lightweight).

Your mission is to write an **Artillery load test** that simulates 50 concurrent users over 30 seconds, compares the performance of these endpoints, and identifies hidden bottlenecks.

---

## 🛠️ Technology Stack
- **Backend**: Node.js + Express (located in `/server`) - No Database.
- **Frontend**: React + Vite (located in `/client`) - A cinematic UI for the vault.
- **Load Testing**: Artillery.io

---

## 🚀 Getting Started

### 1. Setup the API (Backend)
```bash
cd server
npm install
npm start
```
> The API will run on `http://localhost:3001`.

### 2. Setup the Vault (Frontend)
```bash
cd client
npm install
npm run dev
```
> The UI will run on `http://localhost:3000`.

### 3. Manual Testing
Before writing the load test, manually test the endpoints using `curl` or Postman:
- `GET http://localhost:3001/api/quotes/unpaginated`
- `GET http://localhost:3001/api/quotes?page=1&limit=20`
- `POST http://localhost:3001/api/favorites` with `{ "quoteId": 1 }`

**Note**: Document any suspicious behavior (CORS errors, wrong page counts, server lag) in a `Changes.md` file.

---

## 🎯 Your Mission – Write the Load Test

### Step 1: Install Artillery
```bash
npm install -g artillery
artillery version
```

### Step 2: Create `load-test.yml`
Create a configuration file in the project root that targets `http://localhost:3001` and simulates **50 virtual users** ramping up over **30 seconds**. You must include three scenarios:
1. `GET /api/quotes/unpaginated`
2. `GET /api/quotes?page=1&limit=20`
3. `POST /api/favorites`

### Step 3: Performance Analysis
After running your test, produce a **`LOAD_TEST.md`** report containing:
- Metrics for each endpoint (Median, p95, Throughput, Error Rate).
- A written comparison between the unpaginated and paginated endpoints.
- An explanation of what **p95** means and why it matters.
- (Optional) Observations on the 5 hidden errors injected into the code.

---

## 🏆 Submission Requirements
To complete this milestone, you must:
1.  **Pull Request**: Create a PR titled `test: add load test comparing paginated vs unpaginated endpoints` on a branch named `challenge-solution`.
2.  **Files**: Include `load-test.yml`, `LOAD_TEST.md`, and `Changes.md`.
3.  **Video**: Record a 2–3 minute video demonstrating manual testing, running the Artillery test, and interpreting the output.

---

## ⚠️ Important Note
The starter repository is **intentionally broken** with 5 hidden errors (missing CORS, chunked transfer issues, pagination off‑by‑one, synchronous blocking, and no input validation). You do **not** need to fix these – just document how they affect your metrics!

Good luck – and may your quotes be fast and your p95 be low! 🚀
