# Computer Sales & Services Marketplace

## Current State
- A home services marketplace with categories: Cleaning, Plumbing, Electrician, Carpentry, Painting, AC Repair
- Landing page hero text and content reference "home services" and homeowners
- Services page has seed data for home-related services
- Professional Dashboard shows a flat list of active/completed jobs
- Admin Panel manages services and shows platform stats
- Registration page allows choosing Customer or Professional role with home-service categories
- Backend categories are: #cleaning, #plumbing, #electrician, #carpentry, #painting, #acRepair

## Requested Changes (Diff)

### Add
- Professional Dashboard: Kanban-style job board with columns — New Orders, In Progress, Completed — for technicians to drag/click-move jobs between stages
- Professional Dashboard: Earnings analytics panel showing total earnings (calculated from job prices), jobs completed count, and a simple earnings summary
- New service categories for computers: laptopRepair, desktopRepair, computerSales, accessoriesSales, networkSetup, dataRecovery
- Seed data for computer/laptop/accessories services in ServicesPage and backend initialize()

### Modify
- LandingPage: Rebrand all text to computer sales & services context. Hero title, subtitle, stats labels (e.g. "Happy Customers", "Certified Technicians"), features section ("Certified Technicians", "Same-Day Service", "Warranty on Repairs"), CTA text
- LandingPage: Update 6 category cards with computer categories and appropriate icons (Laptop, Monitor, Mouse, Wifi, HardDrive, Database)
- ServicesPage: Update category tabs and seed services to reflect computer/laptop/accessories services
- AdminPanel: Update category list to computer categories in service form dropdown
- RegistrationPage: Update professional category options to computer service categories
- ProfessionalDashboard: Replace flat job list with Kanban columns (New / In Progress / Completed). Each job card shows service name, customer, date, price range. Action button moves job to next stage
- ProfessionalDashboard: Add earnings panel at top showing total earned (sum of maxPrice for completed jobs as estimate), count of completed jobs, and count of active jobs
- Backend: Replace home-service categories with computer-service categories. Update initialize() seed data with computer services

### Remove
- All references to cleaning, plumbing, painting, carpentry, AC repair, electrician in categories and seed data
- "homeowners" language on landing page

## Implementation Plan
1. Regenerate Motoko backend with new computer service categories (laptopRepair, desktopRepair, computerSales, accessoriesSales, networkSetup, dataRecovery) and updated seed data
2. Update LandingPage: new copy, computer category cards with correct icons
3. Update ServicesPage: new category list, new seed services for computers/laptops/accessories
4. Update AdminPanel: new category dropdown items and labels
5. Update RegistrationPage: new professional categories
6. Rebuild ProfessionalDashboard with Kanban columns and earnings analytics
7. Update useQueries.ts getCategoryLabel helper for new categories
