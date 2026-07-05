# USER_FLOWS.md

# Overview

This document describes the primary user journeys for the platform.

Current scope covers:

- MVP Initial (Market Validation)
- MVP Phase 1 (Renting Out Property)

Future verticals will add additional workflows.

---

# User Types

- Tenant
- Property Owner
- Property Agent
- Administrator

---

# MVP Initial - Market Validation

## Goal

Validate market demand and collect qualified leads before launching the full marketplace.

---

## Tenant Registration Flow

### Goal

Allow prospective tenants to register their rental requirements.

### Flow

Landing Page
→ Click "Find a Property"
→ Create Account / Register Interest
→ Complete Requirement Form
→ Submit Requirements
→ Confirmation Page

### Information Collected

- Preferred location
- Budget range
- Property type
- Bedrooms
- Bathrooms
- Property size
- Pet friendly requirement
- Move-in date

### Outcome

Tenant profile is created.

Operations team can manually search for matching properties.

---

## Owner Registration Flow

### Goal

Allow owners to express interest in listing properties.

### Flow

Landing Page
→ Click "Rent Out My Property"
→ Create Account / Register Interest
→ Submit Property Information
→ Confirmation Page

### Information Collected

- Property location
- Property type
- Bedrooms
- Bathrooms
- Rental price
- Contact information

### Outcome

Owner profile and property lead are created.

Operations team can manually contact owner.

---

# MVP Phase 1 - Renting Out Property

# Tenant Flows

---

## Tenant Onboarding Flow

### Goal

Understand tenant requirements and create a searchable profile.

### Flow

Register
→ Verify Email
→ Complete Tenant Profile
→ Save Preferences
→ Tenant Dashboard

### Information Captured

Personal Information

- Name
- Email
- Phone

Rental Preferences

- Location
- Budget
- Property type
- Bedrooms
- Bathrooms
- Property size
- Pet friendly
- Move-in date

### Outcome

Tenant profile becomes available for matching.

---

## Browse Properties Flow

### Goal

Allow tenant to discover properties independently.

### Flow

Dashboard
→ Browse Properties
→ Apply Filters
→ View Property List
→ Open Property Details
→ Save Property OR Express Interest

### Filters

- Location
- Budget
- Property type
- Bedrooms
- Bathrooms
- Property size
- Pet friendly

### Outcome

Tenant finds relevant properties.

---

## Property Recommendation Flow

### Goal

Provide tenants with matched properties.

### Flow

Matching Engine Finds Property
→ Tenant Receives Notification
→ Tenant Reviews Property
→ Accept Interest OR Reject Property

### If Rejected

Property marked as unsuitable.

Future matching should learn from rejection.

### If Accepted

Viewing process begins.

---

## Property Viewing Flow

### Goal

Allow tenant to view property.

### Flow

Tenant Interested
→ Owner/Agent Approves Match
→ Tenant Receives Viewing Invitation
→ Schedule Viewing
→ Attend Viewing

### Outcome

Tenant decides whether to continue.

---

## Save Property Flow

### Goal

Allow tenant to revisit properties later.

### Flow

Property Details
→ Save Property
→ Saved Properties List

### Outcome

Property added to favorites.

---

# Owner / Agent Flows

---

## Owner Onboarding Flow

### Goal

Allow owner or agent to participate on platform.

### Flow

Register
→ Verify Email
→ Complete Profile
→ Dashboard

### Outcome

Owner account created.

---

## Create Property Listing Flow

### Goal

Add a property to the marketplace.

### Flow

Dashboard
→ Add Property
→ Complete Property Form
→ Upload Images
→ Submit Listing

### Property Information

Basic Information

- Property title
- Description
- Property type

Location

- Address
- Area
- Nearby landmarks

Property Details

- Bedrooms
- Bathrooms
- Property size
- Floor
- Furnished status

Pricing

- Monthly rent
- Deposit

Media

- Photos
- Videos (future)

### Outcome

Property enters review queue.

---

## Property Approval Flow

### Goal

Maintain listing quality.

### Flow

Property Submitted
→ Admin Review
→ Approve OR Reject

### If Approved

Property becomes visible.

### If Rejected

Owner receives feedback.

---

## Receive Tenant Match Flow

### Goal

Connect owners with qualified tenants.

### Flow

Matching Engine Finds Tenant
→ Owner Receives Tenant Summary
→ Review Tenant
→ Approve OR Reject

### If Rejected

No further action.

### If Approved

Tenant receives notification.

---

## Manage Property Flow

### Goal

Maintain property listing.

### Flow

Dashboard
→ View Property
→ Edit Listing
→ Update Availability
→ Archive Property

### Outcome

Property remains current.

---

# Admin Flows

---

## Property Review Flow

### Goal

Prevent fraudulent or low-quality listings.

### Flow

Admin Dashboard
→ Review Submitted Property
→ Verify Information
→ Approve OR Reject

### Outcome

Only approved properties become public.

---

## User Management Flow

### Goal

Maintain platform integrity.

### Flow

Admin Dashboard
→ Search User
→ Review Profile
→ Suspend OR Reactivate

---

# Matching Workflow

### Goal

Connect the right tenant with the right property.

### Flow

Tenant Requirements Created
→ Property Listing Created
→ Matching Rules Executed
→ Candidate Matches Identified
→ Owner Review
→ Tenant Notification
→ Viewing Arrangement

### Matching Criteria

- Location
- Budget
- Property type
- Bedrooms
- Bathrooms
- Property size
- Pet policy

### Outcome

Property viewing is scheduled.

---

# Future Flows

These workflows are outside MVP scope.

## Owner / Agent Operations

- Tenant management
- Rental contracts
- Rent collection
- Maintenance requests

## Service Marketplace

- Request service
- Service provider assignment
- Appointment booking
- Payment processing
- Service reviews
