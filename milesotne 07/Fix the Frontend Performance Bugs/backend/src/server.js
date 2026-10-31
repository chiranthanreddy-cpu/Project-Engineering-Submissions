import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory Data Generator (550+ Products)
const products = [];
for (let i = 1; i <= 550; i++) {
  products.push({
    id: i,
    name: `Premium Product ${i}`,
    price: parseFloat((Math.random() * 1000 + 50).toFixed(2)),
    description: `Description for Product ${i}. High-quality inventory item designed for efficiency.`,
    imageUrl: `https://picsum.photos/seed/${i + 100}/400/400`,
    createdAt: new Date().toISOString()
  });
}

// Endpoints
app.get('/api/products', (req, res) => {
  // Return all items to simulate a heavy frontend load
  console.log(`GET /api/products - Dispatching ${products.length} items`);
  res.json(products);
});

app.listen(PORT, () => {
  console.log(`Backend (In-Memory) running on http://localhost:${PORT}`);
});
