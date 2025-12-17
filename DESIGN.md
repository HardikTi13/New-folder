# System Design & Implementation Notes

## Database Design
The database is modeled using PostgreSQL and managed via Prisma ORM. The core entities are:

- **Court**: Represents physical playing areas. Properties include `type` (INDOOR/OUTDOOR) and `basePrice`.
- **Coach**: Represents staff members available for booking, with an `hourlyRate`.
- **Equipment**: Inventory items (rackets, shoes) with a `stock` level and `price`.
- **Booking**: The central transaction record. It links a `User` (string ID) to a `Court`, and optionally a `Coach`. It also stores `equipment` selections as a JSON blob (snapshot of items/qty) to handle flexibility without a complex join table, given the simple inventory decrement logic.
- **PricingRule**: Configurable logic for dynamic pricing. Stored as flexible JSON conditions to allow admin-defined rules without code changes.
- **Waitlist**: Tracks users interested in specific slots that are fully booked.

This schema ensures data integrity via foreign keys while allowing flexibility (JSON) for complex pricing conditions and equipment aggregates.

## Pricing Engine Approach
The pricing logic is decoupled from the booking creation to ensure "Dynamic Pricing" is robust and testable.
- **Service-Based**: `PricingService.calculateTotal` is a standalone pure function that accepts booking parameters and returns a calculated price + breakdown.
- **Dynamic Rules**: Instead of hardcoding "Weekend" or "Peak Hour" logic, the system queries the `PricingRule` table.
- **JSON Conditions**: Each rule contains a `condition` JSON object (e.g., `{ "days": [0, 6], "hours": [18, 19, 20] }`). The engine iterates through active rules, evaluates these conditions against the booking context (Date/Time/Court), and applies multipliers or fixed fees accordingly.
- **Stackability**: Operations are sequential—base price is modified by rules in order, then add-ons (Coach, Equipment) are summed. This meets the requirement for stacking rules (e.g., Indoor + Peak + Weekend).

## Concurrency & Availability
- **Atomic Transactions**: Booking creation uses `prisma.$transaction`. Availability checks (Court, Coach, Equipment) and record insertion happen within the same transaction scope to prevent race conditions.
- **Equipment Inventory**: For a given slot, we verify availability by aggregating all *other* bookings in that time window and ensuring the total used + requested quantity does not exceed global `stock`.
- **Waitlist**: If a slot is unavailable, users can join a Waitlist. When a booking is cancelled, the system checks the Waitlist for that slot and triggers a notification (mocked) to the next user in line.
