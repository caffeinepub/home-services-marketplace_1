# Computer Sales & Services

## Current State

- Landing page with computer/tech branding, 6 service categories
- Services page with category filters and booking modal
- Customer Dashboard: upcoming/past bookings, cancel pending bookings
- Professional Dashboard: Kanban board (New Orders / In Progress / Completed), earnings panel
- Admin Panel: platform stats (5 cards), services management (CRUD table), placeholder note for bookings management
- Role-based routing: customer, professional, admin
- Backend supports: service CRUD, booking creation/cancellation, assignment to professional, status transitions, platform stats
- Backend does NOT have: getAllBookings (admin), listProfessionals (admin)

## Requested Changes (Diff)

### Add
- Backend: `getAllBookings()` query - admin-only, returns all bookings in the system
- Backend: `listProfessionals()` query - admin-only, returns all registered professionals with their Principal and profile
- Frontend: Admin Bookings Management section inside AdminPanel replacing the current placeholder note
  - Table of all bookings with columns: ID, Service, Customer (shortened principal), Date/Time, Status badge, Assigned Technician, Actions
  - Filter tabs: All / Pending / Confirmed / In Progress / Completed / Cancelled
  - "Assign Technician" action on each pending/unassigned booking - opens a dialog with a dropdown of available technicians to select from
  - Status badge coloring matching existing status classes
  - Loading, empty, and error states

### Modify
- AdminPanel.tsx: Replace the "Bookings Note" placeholder section with the new full Bookings Management section

### Remove
- The placeholder note/card about bookings in the Admin Panel

## Implementation Plan

1. Add `getAllBookings` (admin-only) and `listProfessionals` (admin-only) to `main.mo`
2. Re-generate Motoko code to update `backend.d.ts` with new APIs
3. Add `useAllBookings`, `useListProfessionals`, and `useAssignBooking` hooks to `useQueries.ts`
4. Build the Bookings Management section in `AdminPanel.tsx`:
   - Filter tabs for booking status
   - Bookings table with all columns
   - Assign Technician dialog with professional dropdown
   - Loading/empty/error states with data-ocid markers
