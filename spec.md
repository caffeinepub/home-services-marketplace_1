# Home Services Marketplace

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- **Service Catalog**: Browse services by category (Cleaning, Plumbing, Electrician, Carpentry, Painting, AC Repair). Each service has a name, description, price range, and category.
- **Booking Flow**: Users can select a service, choose a date/time slot, enter their address, and confirm a booking.
- **User Dashboard**: View upcoming and past bookings, cancel pending bookings, view booking status.
- **Professional Dashboard**: Professionals can view jobs assigned to them, update job status (Pending → In Progress → Completed).
- **Admin Panel**: View platform stats (total users, professionals, bookings), manage service listings (add/edit/remove), view all bookings.
- **Role-based access**: Three roles — Customer, Professional, Admin. Each sees their own dashboard.
- **Sample content**: Pre-seeded service categories and sample services.

### Modify
- Nothing (new project).

### Remove
- Nothing (new project).

## Implementation Plan
1. Select `authorization` component for role-based access.
2. Generate Motoko backend with:
   - User profiles with roles (Customer, Professional, Admin)
   - Service catalog CRUD
   - Booking management (create, list, update status, cancel)
   - Platform stats query for admin
3. Build frontend with:
   - Landing page with service category grid
   - Service detail + booking form
   - Customer dashboard (my bookings)
   - Professional dashboard (assigned jobs, status updates)
   - Admin panel (stats, service management, all bookings)
   - Role-based routing after login
