import express from 'express';
import dotenv from 'dotenv';
import { generateQuotes } from './data/generateQuotes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ERROR #1: CORS missing (No Access-Control-Allow-Origin)
// app.use(cors()); // Missing!

app.use(express.static('public'));
app.use(express.json());

const quotes = generateQuotes();
const favorites = [];

console.log(`Loaded ${quotes.length} movie quotes`);

// GET /api/quotes/unpaginated
// ERROR #2: Missing Content-Length header / Chunked transfer
app.get('/api/quotes/unpaginated', (req, res) => {
  // We manually set Chunked transfer to simulate potential issues with large payloads under load
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Content-Type', 'application/json');
  res.write(JSON.stringify(quotes));
  res.end();
});

// GET /api/quotes?page=1&limit=20
app.get('/api/quotes', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const total = quotes.length;
  
  // ERROR #3: Miscalculates totalPages when total is exactly divisible by limit
  const totalPages = (total % limit === 0) 
    ? (total / limit) + 1  // Should be exactly 500 for limit=20, but returns 501
    : Math.ceil(total / limit);

  const results = {
    currentPage: page,
    totalPages: totalPages,
    total: total,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    data: quotes.slice(startIndex, endIndex)
  };

  res.json(results);
});

// POST /api/favorites
app.post('/api/favorites', (req, res) => {
  // ERROR #4: Artificial delay is SYNCHRONOUS BLOCKING
  const start = Date.now();
  while (Date.now() < start + 50) {
    // This blocks the entire event loop for 50ms per request
  }

  const { quoteId } = req.body;

  // ERROR #5: No input validation
  // Will store { quoteId: undefined } or null if body is missing it
  favorites.push({ quoteId, timestamp: new Date() });

  res.status(200).json({ success: true, message: "Added to favorites" });
});

// GET /api/favorites
app.get('/api/favorites', (req, res) => {
  // Join favorite IDs with the actual quote data
  const result = favorites.map(fav => {
    const quote = quotes.find(q => q.id === parseInt(fav.quoteId));
    return { ...fav, quote: quote ? quote : { quote: "Unknown Quote", movie: "Unknown" } };
  });
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Movie Quote API (Broken) running on http://localhost:${PORT}`);
});
