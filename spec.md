# Lepzo — Computer Sales & Services Marketplace

## Current State

The app has a working backend with these data stores:
- Users (principal → UserProfile with role, professional info, mobile)
- Services (id → Service with name, category, price range)
- Bookings (id → Booking with customer, service, date, status, assigned professional)
- Messages (id → ChatMessage per booking)
- BookingHistory (principal → booking count)
- BrandingConfig (site-wide branding)

Frontend has: Landing page, Services page, Customer Dashboard, Professional Kanban Dashboard, Admin Panel (Overview, Services, Bookings, Customers, Technicians, Branding tabs), In-app Chat, Booking Calendar, Service Comparison.

## Requested Changes (Diff)

### Add

**Backend tables:**
1. **Reviews** — Customer can submit a review (rating 1-5, comment) for a completed booking. One review per booking.
2. **Payments** — Payment record created when a booking is completed or when customer confirms payment. Fields: id, bookingId, customer, amount, status (pending/paid/refunded), createdAt.
3. **Admin table** — Already handled via AccessControl. Admin profile stores display name and contact email for the admin panel header.

**Backend functions:**
- `submitReview(bookingId, rating, comment)` — customer only, booking must be completed
- `getReviewsForService(serviceId)` — public
- `getReviewsForProfessional(professional)` — public
- `createPayment(bookingId, amount)` — system creates when booking confirmed
- `updatePaymentStatus(paymentId, status)` — admin only
- `getPaymentsForBooking(bookingId)` — user/admin
- `getAllPayments()` — admin only

**Frontend:**
- Review form shown in Customer Dashboard after a booking is completed (star rating + comment)
- Reviews panel shown on Service detail cards (average rating, review count)
- Payments tab in Admin Panel — lists all payments, admin can mark as paid/refunded
- Customer Dashboard shows payment status for each booking

### Modify

- `createBooking` — also creates a pending payment record automatically
- Admin Panel — add Payments tab
- Customer Dashboard — show rating widget for completed bookings, show payment status badge
- Professional Dashboard — show average rating received

### Remove

Nothing removed.

## Implementation Plan

1. Add `Review` and `Payment` types to backend
2. Add `reviews` and `payments` maps, `nextReviewId`, `nextPaymentId` counters
3. Implement `submitReview`, `getReviewsForService`, `getReviewsForProfessional`
4. Implement `createPayment` (internal + public), `updatePaymentStatus`, `getPaymentsForBooking`, `getAllPayments`
5. Modify `createBooking` to auto-create a pending payment
6. Update frontend: Reviews widget on customer dashboard completed bookings
7. Update frontend: Payments tab in Admin Panel
8. Update frontend: Service card average rating display
9. Update frontend: Professional dashboard average rating earned
