const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const GAMES = [
  'Donkey Kong', 'Pac-Man', 'Space Invaders', 'Galaga', 'Frogger', 
  'Asteroids', 'Dig Dug', 'Centipede', 'Ms. Pac-Man', 'BurgerTime',
  'Defender', 'Joust', 'Q*bert', 'Tempest', 'Pole Position'
];

const PLAYERS = [
  'Billy Mitchell', 'Steve Wiebe', 'Walter Day', 'Hank Chien', 'Robbie Lakeman',
  'John McAllister', 'George Rogers', 'Jeff Willms', 'Ross Benziger', 'Eric Akeson',
  'SillyGamer', 'RetroKing', 'HighScorer99', 'PixelMaster', 'JoystickHero'
];

const LOREM_IPSUM = `To achieve a high score in this classic arcade game, you must focus on pattern recognition and precise timing. The strategy involves clearing the bottom row first while maintaining awareness of incoming threats from above. Always keep your movement fluid and avoid getting trapped in the corners. The most critical part of the run happens around level 5 where the speed increases significantly. You should prioritize power-ups that grant temporary invulnerability or clear the screen. Remember that consistency is better than taking high-risk shortcuts that could end your run prematurely. Watch the top players' replays to understand the optimal route through the maze. Practice the ladder trick consistently to save precious seconds in the early stages. The bonus stage is where you can really pull ahead if you manage to collect all the items without dying. Finally, keep your cool even when the screen gets crowded. Total focus is required for a million-point run.`;

async function main() {
  console.log('Seeding 300 scores...');
  
  await prisma.score.deleteMany();

  const scores = [];
  for (let i = 0; i < 305; i++) {
    scores.push({
      game: GAMES[Math.floor(Math.random() * GAMES.length)],
      player: PLAYERS[Math.floor(Math.random() * PLAYERS.length)],
      score: Math.floor(Math.random() * 998999) + 1000,
      date: new Date(1980 + Math.floor(Math.random() * 45), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
      strategyNote: LOREM_IPSUM
    });
  }

  await prisma.score.createMany({
    data: scores
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
