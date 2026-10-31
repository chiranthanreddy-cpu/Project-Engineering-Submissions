const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Issue B1: No Pagination
// Issue B2: Over-fetching (includes strategyNote)
router.get('/', async (req, res) => {
  try {
    // Fetches ALL scores and ALL fields (including heavy strategyNote)
    const scores = await prisma.score.findMany({
      orderBy: { date: 'desc' }
    });
    
    res.json(scores);
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

module.exports = router;
