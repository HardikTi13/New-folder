import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export class AdminController {

    // POST /api/admin/rules
    static async createRule(req: Request, res: Response) {
        try {
            const { name, type, value, condition } = req.body;
            const rule = await prisma.pricingRule.create({
                data: { name, type, value, condition: JSON.stringify(condition) }
            });
            res.json(rule);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // DELETE /api/admin/rules/:id
    static async deleteRule(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await prisma.pricingRule.delete({ where: { id } });
            res.json({ success: true });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // POST /api/admin/courts
    static async createCourt(req: Request, res: Response) {
        try {
            const { name, type, basePrice } = req.body;
            const court = await prisma.court.create({
                data: { name, type, basePrice }
            });
            res.json(court);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
