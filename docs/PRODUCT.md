# Product Overview

We are building a property platform that helps connect tenants, property owners, agents, and service providers.

The platform is designed as a multi-vertical product where new business areas can be added over time without requiring major architectural changes.

The long-term vision is to become a complete property ecosystem that helps users find, rent, manage, and maintain properties.

---

# Product Vision

Create a modern property platform that simplifies:

- Finding rental properties
- Renting out properties
- Managing properties
- Property maintenance services

The system should be modular and designed for future expansion.

---

# Product-Market Fit (PMF)

## Problem Statement

Finding suitable rental properties and qualified tenants is inefficient and opaque. Tenants waste time browsing fragmented listings, while owners struggle to reach reliable renters. There is no single platform that intelligently matches tenant requirements with available properties, making the whole process slow and frustrating for all parties.

## Target Market

### Tenants

Individuals and families actively searching for rental properties who value a quick, transparent search and a personalized matching process.

### Owners & Agents

Property owners and agents looking to increase occupancy rates, reduce vacancy periods, and connect with pre-qualified tenants without manual effort.

## Value Proposition

A centralized Omamie property management platform that connects the right tenants with the right properties. By collecting structured requirements from tenants and detailed property data from owners, the platform automates intelligent matching, saving time and reducing friction for everyone involved.

## Validation Strategy (MVP Initial)

Before building a fully automated marketplace, we validate demand through a manual operations approach:

- **Landing Pages**: Drive traffic and collect leads from both tenants and owners.
- **Tenant Registration**: Capture detailed rental requirements (location, budget, size, pets, timeline).
- **Owner Registration**: Capture property details and owner contact information.
- **Manual Matching**: Operations team manually matches tenant profiles with property listings to gauge interest and refine the matching algorithm.
- **Lead Management**: Track registrations, matches, and engagement to confirm market fit before investing in full automation.

This lightweight approach allows us to learn quickly, iterate on the product, and prove that both sides of the marketplace are willing to participate.

## Success Indicators

Key metrics to validate PMF during the MVP Initial phase:

- Tenant registrations
- Owner registrations
- Number of submitted properties
- Match requests generated
- User engagement (return visits, profile completions)

## Assumptions & Risks

- **Demand exists**: There is sufficient volume of tenants and owners in target markets willing to use a new platform.
- **Manual operations scale**: Early manual matching can be sustained long enough to validate the model without burning out the operations team.
- **Data quality**: Users are willing to provide accurate and detailed requirements and property information.
- **Market timing**: Property markets are dynamic; economic shifts could affect willingness to rent or list.
- **Competition**: Existing property portals may already satisfy user needs; our intelligent matching and user experience must differentiate us.

## Roadmap to PMF

| Phase       | Focus                                      | Key Milestone                                   |
| ----------- | ------------------------------------------ | ----------------------------------------------- |
| MVP Initial | Manual matching, lead collection           | 100 tenant registrations, 20 owner listings     |
| MVP Phase 1 | Self-service property search and matching  | 500 active tenants, 50 properties, 100 matches  |
| MVP Phase 2 | Full marketplace with booking and payments | 1,000+ active users, self-sustaining match rate |

By progressing through these phases, we systematically de-risk the product and move from validated learning to a scalable automated platform.

---

# Product Verticals

## Vertical 1: Renting Out Property (MVP)

Connect tenants with property owners and agents.

### Tenant Benefits

- Find suitable rental properties
- Receive property recommendations
- Save time searching
- Get notified when matching properties become available

### Owner / Agent Benefits

- List rental properties
- Reach qualified tenants
- Manage property inquiries
- Increase occupancy rates

---

## Vertical 2: Owner / Agent Operations (Future)

Help owners manage their properties without hassle.

Potential features:

- Tenant management
- Rental contract management
- Payment tracking
- Maintenance management
- Property performance dashboard
- Communication tools

---

## Vertical 3: Service Marketplace (Future)

Connect property owners with trusted service providers.

Potential services:

- Air conditioner cleaning
- Air conditioner repair
- House cleaning
- Washing machine repair
- Plumbing
- Bathroom repair
- Electrical work
- Painting
- General maintenance

---

# Product Design Principles

## Modular Architecture

Each vertical should operate independently while sharing common platform capabilities.

Examples:

- Authentication
- User profiles
- Notifications
- Messaging
- Payments
- Search
- Analytics

New verticals should be addable without impacting existing ones.

---

# User Types

## Tenant

A user looking for rental properties.

### Goals

- Find suitable properties
- View property details
- Receive recommendations
- Schedule property viewings

---

## Owner

A property owner renting out their property.

### Goals

- Publish property listings
- Receive qualified tenant matches
- Manage inquiries

---

## Agent

An agent representing property owners.

### Goals

- Manage multiple properties
- Find suitable tenants
- Coordinate viewings

---

## Administrator

Internal platform operator.

### Goals

- Review listings
- Approve properties
- Manage users
- Ensure platform quality

---

# Product Roadmap

## MVP Initial (Market Validation)

Goal:

Validate market demand before building the complete platform.

### Features

Landing page

Tenant registration

Owner registration

Property interest collection

Lead management

Basic admin dashboard

### Tenant Information

Collect:

- Preferred location
- Budget
- Property type
- Bedrooms
- Pet requirements
- Move-in timeline

### Owner Information

Collect:

- Property location
- Property type
- Number of bedrooms
- Rental price
- Contact information

The platform manually connects tenants and owners.

No self-service marketplace is required at this stage.

---

# MVP Phase 1

## Renting Out Property

### Tenant Workflow

#### Step 1

Create account.

#### Step 2

Complete rental requirements profile.

Examples:

- Location
- Budget
- Property type
- Bedrooms
- Bathrooms
- Property size
- Pet friendly requirement

#### Step 3

View matching properties.

Options:

- Browse available properties
- Receive recommendations
- Receive email notifications

#### Step 4

Review property details.

Options:

- Interested
- Not Interested

#### Step 5

Arrange property viewing.

Options:

- Platform-assisted viewing
- Direct owner/agent contact

---

### Owner / Agent Workflow

#### Step 1

Create account.

#### Step 2

Submit property listing.

Required information:

- Property title
- Description
- Location
- Rental price
- Property size
- Bedrooms
- Bathrooms
- Amenities
- Images

#### Step 3

Property enters review process.

Initially all listings require manual approval.

#### Step 4

Property becomes visible to tenants.

#### Step 5

Receive tenant matches.

#### Step 6

Approve or reject tenant interest.

#### Step 7

Coordinate viewing process.

---

# Matching Process

The platform matches:

Tenant Requirements
⇄
Property Attributes

Matching factors may include:

- Location
- Budget
- Property type
- Bedrooms
- Bathrooms
- Property size
- Pet policy

When a match is found:

1. Owner/Agent receives tenant profile.
2. Owner/Agent approves interest.
3. Tenant receives notification.
4. Viewing is arranged.

---

# Success Metrics

## MVP Initial

- Tenant registrations
- Owner registrations
- Number of submitted properties
- Match requests
- User engagement

## MVP

- Active listings
- Successful matches
- Property viewings
- Tenant conversion rate
- Owner retention rate

---

# Non-Functional Requirements

- Mobile-first design
- Responsive UI
- Fast search experience
- Secure authentication
- Scalable architecture
- Extensible vertical-based design
- Audit logging
- Notification system

---

# Future Opportunities

- Property operations tools
- Service marketplace
- Contract management
- Rent payments
- Tenant screening
- AI-powered property matching
- Maintenance requests
- Service provider booking
- Property analytics
