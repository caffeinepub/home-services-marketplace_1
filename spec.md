# Computer Sales & Services

## Current State

- Landing page with hero, 6 category cards, stats bar
- Services page with category filter, service cards, booking modal
- Role-based routing: Customer, Professional, Admin
- Customer Dashboard: upcoming/past bookings, cancel pending orders
- Professional Dashboard: Kanban board (New / In Progress / Completed), earnings panel
- Admin Panel:
  - Platform stats (Total Users, Technicians, Total Bookings, Completed, Revenue)
  - Services Management: full CRUD (add, edit, delete)
  - Bookings Management: filter by status, assign/reassign technician via dropdown dialog

## Requested Changes (Diff)

### Add

**Admin Panel - Technicians Management section:**
- List all registered technicians (from `listProfessionals()`) with name, specialization/category, and assigned job count (derived from all bookings)
- Promote any regular user to Admin via `assignCallerUserRole()` -- for managing user roles
- Show each technician's active jobs count (bookings in `inProgress` or `confirmed` status assigned to them)

**Admin Panel - Platform Analytics section:**
- Booking status breakdown: visual summary (counts per status) displayed as stat bars/cards
- Category breakdown: how many bookings per service category (derived from bookings + services)
- Quick revenue estimate: completed bookings * average service price

**Admin Panel - Enhanced Bookings view:**
- Add address column to the bookings table
- Add "Update Status" action alongside Assign button so admin can manually change booking status from the panel
- Show booking creation date/time

**Admin Panel - Section navigation sidebar or tabs:**
- Since the panel now has 4 sections (Overview, Services, Bookings, Technicians), add a left sidebar nav or tab bar to switch between sections cleanly instead of one long scrolling page

### Modify

- Admin Panel layout: convert from single scrolling page to tabbed/sidebar navigation with sections: Overview, Services, Bookings, Technicians
- Bookings table: add address column, booking date column, and Update Status action
- Stats section: add booking breakdown analytics below the stat cards

### Remove

- Nothing removed

## Implementation Plan

1. Update `AdminPanel.tsx` to support multi-section layout with a left sidebar navigation (Overview, Services, Bookings, Technicians)
2. Build Technicians section: table of professionals with name, category, job counts (active/completed)
3. Build Analytics subsection within Overview: booking status breakdown + category breakdown bars
4. Enhance Bookings table: add address, created-at, and Update Status dialog
5. Add `useUpdateBookingStatus` mutation (already exists in useQueries) wired to admin panel for status override
6. All new interactive elements get proper `data-ocid` markers
