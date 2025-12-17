import prisma from '../utils/prisma';
import { RuleType } from '@prisma/client';

export class PricingService {
    static async calculateTotal(
        courtId: string,
        slot: number,
        date: Date,
        coachId?: string | null,
        equipment?: { [key: string]: number }
    ) {
        let totalPrice = 0;
        const breakdown: any = {};

        // 1. Base Court Price
        const court = await prisma.court.findUnique({ where: { id: courtId } });
        if (!court) throw new Error('Court not found');

        let courtCost = court.basePrice;
        breakdown.base = courtCost;

        // 2. Fetch Active Rules
        const rules = await prisma.pricingRule.findMany();

        // Apply Multipliers
        const dayOfWeek = date.getDay(); // 0 = Sun, 6 = Sat
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        for (const rule of rules) {
            const condition = JSON.parse(rule.condition);
            let applies = true;

            if (condition.days && !condition.days.includes(dayOfWeek)) applies = false;
            // Handle day ranges if needed, but array is safer
            if (condition.hours && !condition.hours.includes(slot)) applies = false;
            if (condition.courtType && condition.courtType !== court.type) applies = false;

            if (applies) {
                if (rule.type === RuleType.MULTIPLIER) {
                    courtCost *= rule.value;
                    breakdown[rule.name] = `x${rule.value}`;
                } else if (rule.type === RuleType.FIXED_ADD) {
                    courtCost += rule.value;
                    breakdown[rule.name] = `+${rule.value}`;
                }
            }
        }

        totalPrice += courtCost;
        breakdown.courtFinal = courtCost;

        // 3. Coach
        if (coachId && coachId !== 'none') {
            const coach = await prisma.coach.findUnique({ where: { id: coachId } });
            if (coach) {
                totalPrice += coach.hourlyRate;
                breakdown.coach = coach.hourlyRate;
            }
        }

        // 4. Equipment
        if (equipment) {
            let equipTotal = 0;
            for (const [eqId, qty] of Object.entries(equipment)) {
                if (qty > 0) {
                    const item = await prisma.equipment.findUnique({ where: { id: eqId } });
                    if (item) {
                        equipTotal += item.price * qty;
                    }
                }
            }
            totalPrice += equipTotal;
            breakdown.equipment = equipTotal;
        }

        return { totalPrice, breakdown };
    }
}
