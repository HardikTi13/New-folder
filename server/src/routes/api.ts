import { Router } from 'express';
import { BookingController } from '../controllers/bookingController';
import { AdminController } from '../controllers/adminController';

const router = Router();

router.get('/config', BookingController.getConfig);
router.get('/availability', BookingController.getAvailability);
router.post('/bookings', BookingController.createBooking);

router.get('/bookings', BookingController.getBookings);
router.post('/waitlist', BookingController.joinWaitlist);
router.delete('/bookings/:id', BookingController.cancelBooking);

// Admin Routes
router.post('/admin/rules', AdminController.createRule);
router.delete('/admin/rules/:id', AdminController.deleteRule);
router.post('/admin/courts', AdminController.createCourt);

export default router;
