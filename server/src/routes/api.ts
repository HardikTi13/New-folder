import { Router } from 'express';
import { BookingController } from '../controllers/bookingController';

const router = Router();

router.get('/config', BookingController.getConfig);
router.get('/availability', BookingController.getAvailability);
router.post('/bookings', BookingController.createBooking);

router.get('/bookings', BookingController.getBookings);

export default router;
