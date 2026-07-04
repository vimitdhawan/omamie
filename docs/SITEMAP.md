# SITEMAP.md

# Overview

This document defines the application structure and navigation hierarchy.

Current scope includes:

- MVP Initial (Market Validation)
- MVP Phase 1 (Renting Out Property)

Future verticals are included as placeholders for future expansion.

---

# Public Website

## Home

Purpose

- Explain platform value
- Collect leads
- Drive registrations

URL

```txt
/
```

Sections

- Hero
- How It Works
- For Tenants
- For Owners
- Featured Properties (future)
- Testimonials (future)
- FAQ
- Contact

Actions

- Find a Property
- Rent Out My Property

---

## Find a Property

URL

```txt
/find-property
```

Purpose

Tenant registration and lead collection.

---

## Rent Out My Property

URL

```txt
/rent-out-property
```

Purpose

Owner registration and lead collection.

---

## About

URL

```txt
/about
```

---

## Contact

URL

```txt
/contact
```

---

## Privacy Policy

URL

```txt
/privacy
```

---

## Terms of Service

URL

```txt
/terms
```

---

# Authentication

## Login

```txt
/login
```

---

## Register

```txt
/register
```

---

## Forgot Password

```txt
/forgot-password
```

---

# Tenant Portal

## Dashboard

```txt
/tenant/dashboard
```

Purpose

Tenant home page.

Sections

- Recommended Properties
- Saved Properties
- Recent Activity
- Notifications

---

## Browse Properties

```txt
/tenant/properties
```

Purpose

Property search.

Features

- Search
- Filtering
- Sorting

---

## Property Details

```txt
/tenant/properties/[propertyId]
```

Purpose

View complete property information.

Actions

- Save Property
- Express Interest
- Contact Owner (future)

---

## Saved Properties

```txt
/tenant/saved-properties
```

---

## Matches

```txt
/tenant/matches
```

Purpose

Properties matched by platform.

---

## Viewing Requests

```txt
/tenant/viewings
```

Purpose

Manage scheduled viewings.

---

## Notifications

```txt
/tenant/notifications
```

---

## Profile

```txt
/tenant/profile
```

Sections

- Personal Information
- Rental Preferences
- Contact Information

---

## Account Settings

```txt
/tenant/settings
```

---

# Owner / Agent Portal

## Dashboard

```txt
/owner/dashboard
```

Purpose

Overview of listings and tenant activity.

Sections

- Active Listings
- Pending Reviews
- Tenant Matches
- Notifications

---

## Properties

```txt
/owner/properties
```

Purpose

Manage property listings.

---

## Create Property

```txt
/owner/properties/new
```

Purpose

Create new listing.

---

## Property Details

```txt
/owner/properties/[propertyId]
```

Purpose

View property information.

Actions

- Edit
- Archive
- Mark Unavailable

---

## Edit Property

```txt
/owner/properties/[propertyId]/edit
```

---

## Tenant Matches

```txt
/owner/matches
```

Purpose

Review matched tenants.

Actions

- Approve
- Reject

---

## Viewing Requests

```txt
/owner/viewings
```

Purpose

Coordinate property viewings.

---

## Notifications

```txt
/owner/notifications
```

---

## Profile

```txt
/owner/profile
```

---

## Settings

```txt
/owner/settings
```

---

# Admin Portal

## Dashboard

```txt
/admin
```

Purpose

Platform overview.

---

## Property Approvals

```txt
/admin/property-approvals
```

Purpose

Review submitted properties.

Actions

- Approve
- Reject

---

## Property Details

```txt
/admin/property-approvals/[propertyId]
```

---

## Users

```txt
/admin/users
```

Purpose

Manage platform users.

---

## User Details

```txt
/admin/users/[userId]
```

---

## Properties

```txt
/admin/properties
```

Purpose

View all properties.

---

## Matches

```txt
/admin/matches
```

Purpose

Monitor matching activity.

---

## Viewings

```txt
/admin/viewings
```

Purpose

Monitor viewing requests.

---

## Reports

```txt
/admin/reports
```

Purpose

Platform analytics.

---

# Future Vertical: Omamie

Placeholder routes.

```txt
/omamie/dashboard
/omamie/properties
/omamie/tenants
/omamie/contracts
/omamie/payments
/omamie/maintenance
```

---

# Future Vertical: Service Marketplace

Placeholder routes.

```txt
/services
/services/categories
/services/bookings
/services/providers
/services/reviews
```

---

# Primary Navigation

## Public Navigation

- Home
- Find Property
- Rent Out Property
- About
- Contact
- Login

---

## Tenant Navigation

- Dashboard
- Browse Properties
- Matches
- Saved Properties
- Viewings
- Notifications
- Profile

---

## Owner Navigation

- Dashboard
- Properties
- Matches
- Viewings
- Notifications
- Profile

---

## Admin Navigation

- Dashboard
- Property Approvals
- Users
- Properties
- Matches
- Reports

---

# MVP Scope

Included

- Public website
- Authentication
- Tenant portal
- Owner portal
- Admin portal
- Property matching
- Viewing management

Excluded

- Payments
- Messaging
- Contracts
- Service marketplace
- Property management
- Reviews and ratings
- Mobile application
