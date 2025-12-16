import { PrismaClient, CourtType, RuleType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Create Courts
    const courts = [
        { name: 'North Indoor', type: CourtType.INDOOR, basePrice: 100.0 },
        { name: 'South Indoor', type: CourtType.INDOOR, basePrice: 100.0 },
        { name: 'East Outdoor', type: CourtType.OUTDOOR, basePrice: 70.0 },
        { name: 'West Outdoor', type: CourtType.OUTDOOR, basePrice: 70.0 },
    ];

    for (const court of courts) {
        await prisma.court.create({ data: court });
    }

    // 2. Create Equipment
    await prisma.equipment.createMany({
        data: [
            { name: 'Badminton Racket', stock: 20, price: 15.0 },
            { name: 'Shoes Pair', stock: 20, price: 10.0 },
        ],
    });

    // 3. Create Coaches
    await prisma.coach.createMany({
        data: [
            { name: 'Coach John', hourlyRate: 50.0 },
            { name: 'Coach Sarah', hourlyRate: 55.0 },
            { name: 'Coach Mike', hourlyRate: 45.0 },
        ],
    });

    // 4. Create Pricing Rules
    await prisma.pricingRule.createMany({
        data: [
            { name: 'Peak Hour', type: RuleType.MULTIPLIER, value: 1.2, condition: JSON.stringify({ hours: [18, 19, 20] }) }, // 6PM - 9PM
            { name: 'Weekend', type: RuleType.MULTIPLIER, value: 1.1, condition: JSON.stringify({ days: [0, 6] }) }, // Sun, Sat
        ],
    });

    console.log('Seed data insert completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
