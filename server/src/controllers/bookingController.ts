import { Request, Response } from 'express';
import { BookingService } from '../services/bookingService';
import { PricingService } from '../services/pricingService';
import prisma from '../utils/prisma';

export class BookingController {

    // GET /api/config (Fetch all courts, coaches, rules for frontend)
    static async getConfig(req: Request, res: Response) {
        try {
            const courts = await prisma.court.findMany();
            const coaches = await prisma.coach.findMany();
            const equipment = await prisma.equipment.findMany();
            const rules = await prisma.pricingRule.findMany();
            res.json({ courts, coaches, equipment, rules });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch config' });
        }
    }

    // GET /api/availability?date=2023-10-10
    static async getAvailability(req: Request, res: Response) {
        try {
            const { date } = req.query;
            if (!date) return res.status(400).json({ error: 'Date required' });

            // Check for all slots (9-21)
            const slots = Array.from({ length: 13 }, (_, i) => i + 9);
            const result: any = {};

            for (const slot of slots) {
                result[slot] = await BookingService.checkAvailability(new Date(date as string), slot);
            }

            res.json(result);
        } catch (error) {
            res.status(500).json({ error: 'Failed to check availability' });
        }
    }

    // POST /api/bookings
    static async createBooking(req: Request, res: Response) {
        try {
            const { userId, courtId, date, slot, coachId, equipment } = req.body;
            const bookingDate = new Date(date);

            const booking = await BookingService.createBooking(
                userId || 'guest',
                courtId,
                bookingDate,
                slot,
                coachId,
                equipment
            );

            res.json({ success: true, booking });
        } catch (error: any) {
            console.error(error);
            res.status(400).json({ error: error.message || 'Booking failed' });
        }
    }

    // POST /api/waitlist
    static async joinWaitlist(req: Request, res: Response) {
        try {
            const { userId, courtId, date, slot } = req.body;
            const waitlistEntry = await BookingService.addToWaitlist(
                userId || 'guest',
                courtId,
                new Date(date),
                slot
            );
            res.json({ success: true, waitlistEntry });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // DELETE /api/bookings/:id
    static async cancelBooking(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await BookingService.cancelBooking(id);
            res.json({ success: true });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
    // GET /api/bookings?userId=... (or empty for all if admin)
    static async getBookings(req: Request, res: Response) {
        try {
            const { userId } = req.query;
            const where = userId ? { userId: userId as string } : {};

            const bookings = await prisma.booking.findMany({
                where,
                include: { court: true, coach: true },
                orderBy: { date: 'desc' }
            });
            res.json(bookings);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch bookings' });
        }
    }
}
