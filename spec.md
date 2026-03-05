# Computer Sales & Services

## Current State
Full-stack marketplace for computer sales and services with:
- Landing page with 6 service categories
- Services page with booking modal
- Role-based dashboards: Customer (bookings), Professional (Kanban), Admin (full panel)
- Admin Panel with sidebar nav: Overview (stats + analytics), Services CRUD, Bookings management, Technicians list
- Backend APIs for services, bookings, professionals, platform stats

## Requested Changes (Diff)

### Add
- **Service Comparison Tool** on Services page: users can select up to 3 services to compare side-by-side (name, category, price range, description). A "Compare" toggle button on each service card; floating comparison bar at bottom shows selected count and opens a comparison modal/drawer.
- **Enhanced Booking Calendar** on the booking modal: replace the plain date text input with a visual calendar date picker (using a calendar component) with time slot selection (Morning/Afternoon/Evening radio buttons). Already has timeSlot field in backend.
- **Demo Credentials Page** (`/demo`) accessible from navbar and landing page: shows demo login info for Admin, Customer, and Technician roles in a clean card layout. Since the app uses Internet Identity (no username/password), the page explains the role system and shows what each role can access, plus a note that role assignment is done by admin after first login. Includes a table of features per role.

### Modify
- ServicesPage: add comparison toggle button to each service card and a fixed comparison bar at the bottom.
- BookingModal: upgrade date input to a proper calendar date picker and improve time slot UI to radio buttons with labels.
- Navbar: add "Demo Credentials" link.
- LandingPage: add a "View Demo" or "Try the Demo" CTA that links to `/demo`.

### Remove
- Nothing removed.

## Implementation Plan
1. Create `src/frontend/src/pages/DemoPage.tsx` — roles table with feature access matrix, login flow explanation.
2. Create `src/frontend/src/components/CompareBar.tsx` — floating bottom bar showing selected services for comparison.
3. Create `src/frontend/src/components/CompareModal.tsx` — side-by-side comparison table dialog.
4. Modify `ServicesPage.tsx` — add compare state, compare toggle button on each card, render CompareBar + CompareModal.
5. Modify `BookingModal.tsx` — replace date text input with Calendar component + radio time slot buttons.
6. Modify `App.tsx` — add `/demo` route.
7. Modify `Navbar.tsx` — add Demo Credentials nav link.
8. Modify `LandingPage.tsx` — add "Try Demo" CTA button linking to `/demo`.
