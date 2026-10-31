const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean up
  await prisma.log.deleteMany();
  await prisma.crew.deleteMany();
  await prisma.mission.deleteMany();

  const missions = [];
  const missionNames = [
    'Apollo', 'Artemis', 'Voyager', 'Pioneer', 'Viking', 'Mariner', 'Cassini', 
    'Galileo', 'New Horizons', 'Juno', 'Curiosity', 'Perseverance', 'Opportunity',
    'Sputnik', 'Vostok', 'Soyuz', 'Skylab', 'Mir', 'ISS', 'Shenzhou', 'Tiangong',
    'Kepler', 'Hubble', 'James Webb', 'Chandra', 'Spitzer', 'Dawn', 'Rosetta',
    'Huygens', 'Parker', 'Solar Orbiter', 'Lucy', 'Psyche', 'Europa Clipper'
  ];

  for (let i = 1; i <= 200; i++) {
    const nameBase = missionNames[i % missionNames.length];
    const mission = await prisma.mission.create({
      data: {
        name: `${nameBase} ${Math.floor(i / 10) + 1}-${i % 10}`,
        launchDate: new Date(2000 + Math.floor(i / 10), i % 12, (i % 28) + 1),
        rocket: i % 3 === 0 ? 'Saturn V' : i % 3 === 1 ? 'Falcon 9' : 'SLS',
        description: `This is a long description for mission ${i}. It contains a lot of unnecessary text that willbloat the payload if sent to the client. Space research is vital for the future of humanity. We need to explore the stars and find new worlds. This mission is part of a larger initiative to establish a base on the Moon and eventually Mars. The telemetry data collected will be invaluable for future generations of scientists and explorers.`.repeat(10),
      },
    });

    // Create 3 crew members for each
    for (let c = 1; c <= 3; c++) {
      await prisma.crew.create({
        data: {
          name: `Astronaut ${i}-${c}`,
          role: c === 1 ? 'Commander' : c === 2 ? 'Pilot' : 'Specialist',
          nationality: c === 1 ? 'USA' : c === 2 ? 'Europe' : 'Japan',
          missionId: mission.id,
        },
      });
    }

    // Create 5 logs for each
    for (let l = 1; l <= 5; l++) {
      await prisma.log.create({
        data: {
          event: `Event ${l} for Mission ${i}`,
          details: `Detailed description of event ${l}. Something important happened at this stage of the mission. We are monitoring all systems and they appear to be functioning within normal parameters. This log entry is also quite large to simulate payload bloat.`.repeat(5),
          timestamp: new Date(),
          missionId: mission.id,
        },
      });
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
