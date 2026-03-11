# Lepzo

## Current State
Lepzo is a full-stack IT services marketplace with Admin, Customer, and Technician roles. Current routes include /demo (DemoPage), and there is no About/Contact page. Technicians can self-register without any admin review step. The demo route was removed from the navbar but the page/route still exists in the codebase.

## Requested Changes (Diff)

### Add
- AboutPage: a new /about page with contact info, business hours, and FAQ section
- Technician pending-review banner: after a technician registers, show a "pending admin review" banner in ProfessionalDashboard using localStorage flag; no backend changes

### Modify
- App.tsx: remove demoRoute and DemoPage import; add aboutRoute pointing to AboutPage
- Navbar: add About link in desktop nav
- RegistrationPage: set localStorage flag `lepzo_tech_pending` after professional registers
- ProfessionalDashboard: read localStorage flag and show dismissible pending-review banner

### Remove
- DemoPage import and route from App.tsx (keep the file, just remove the route)

## Implementation Plan
1. Create src/frontend/src/pages/AboutPage.tsx with contact info, FAQ, business hours
2. Modify App.tsx: remove demoRoute, add aboutRoute
3. Modify Navbar.tsx: add About nav link
4. Modify RegistrationPage.tsx: set localStorage flag after professional registration
5. Modify ProfessionalDashboard.tsx: show dismissible pending-review banner if flag set
