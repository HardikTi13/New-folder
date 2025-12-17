import prisma from '../utils/prisma';
import { PricingService } from './pricingService';

export class BookingService {
    static async checkAvailability(date: Date, slot: number) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const bookings = await prisma.booking.findMany({
            where: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                startTime: slot,
            },
            include: { court: true, coach: true },
        });

        const bookedCourtIds = bookings.map(b => b.courtId);
        const bookedCoachIds = bookings.filter(b => b.coachId).map(b => b.coachId as string);

        return { bookedCourtIds, bookedCoachIds };
    }

    static async createBooking(
        userId: string,
        courtId: string,
        date: Date,
        slot: number,
        coachId?: string,
        equipment?: { [key: string]: number }
    ) {
        // ATOMIC TRANSACTION
        return await prisma.$transaction(async (tx) => {
            // 1. Check Court Avail (with lock if possible, relying on unique constraint or check)
            const existing = await tx.booking.findFirst({
                where: { courtId, date, startTime: slot },
            });
            if (existing) throw new Error('Court already booked for this slot');

            // 2. Check Coach Avail
            if (coachId && coachId !== 'none') {
                const coachBusy = await tx.booking.findFirst({
                    where: { coachId, date, startTime: slot },
                });
                if (coachBusy) throw new Error('Coach not available for this slot');
            }

            // 3. Check Equipment Availability
            if (equipment) {
                const slotBookings = await tx.booking.findMany({
                    where: { date: date, startTime: slot }
                });

                for (const [eqId, qty] of Object.entries(equipment)) {
                    if (qty <= 0) continue;
                    const item = await tx.equipment.findUnique({ where: { id: eqId } });
                    if (!item) throw new Error(`Equipment ${eqId} not found`);

                    let used = 0;
                    for (const b of slotBookings) {
                        const bEq = b.equipment as any;
                        if (bEq && bEq[eqId]) used += bEq[eqId];
                    }

                    if (used + qty > item.stock) {
                        throw new Error(`Insufficient stock for ${item.name}. Available: ${item.stock - used}`);
                    }
                }
            }

            // 4. Calculate Price
            const { totalPrice } = await PricingService.calculateTotal(courtId, slot, date, coachId, equipment);

            // Create Booking
            const booking = await tx.booking.create({
                data: {
                    userId,
                    courtId,
                    coachId: coachId === 'none' ? null : coachId,
                    date,
                    startTime: slot,
                    endTime: slot + 1,
                    totalPrice,
                    equipment: equipment ?? undefined,
                }
            });

            return booking;
        });
    }

    static async addToWaitlist(userId: string, courtId: string, date: Date, slot: number) {
        // Check if actually full? Optional but good practice.
        // For now, just add.
        return await prisma.waitlist.create({
            data: { userId, courtId, date, startTime: slot }
        });
    }

    static async cancelBooking(bookingId: string) {
        return await prisma.$transaction(async (tx) => {
            const booking = await tx.booking.delete({
                where: { id: bookingId }
            });

            // Check Waitlist
            const nextInLine = await tx.waitlist.findFirst({
                where: {
                    courtId: booking.courtId,
                    date: booking.date,
                    startTime: booking.startTime
                },
                orderBy: { createdAt: 'asc' }
            });

            if (nextInLine) {
                // Mock Notification
                console.log(`[NOTIFICATION] Slot freed! Notifying User ${nextInLine.userId} for Court ${booking.courtId} at ${booking.startTime}:00`);
                // Optional: Auto-book? "Notify next person" usually means email them to book.
                // We will leave it as notification only.
            }

            return booking;
        });
    }
}
