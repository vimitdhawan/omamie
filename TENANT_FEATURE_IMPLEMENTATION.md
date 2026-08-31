# Tenant Property Search & Viewing Request Implementation

## Summary

Complete implementation of tenant-facing property search, browsing, saving, and viewing request features for the Omamie property management platform.

---

## Database Schema (Migrations)

### 1. `viewing_requests` Table

**File:** `supabase/migrations/20260901000001_create_viewing_requests.sql`

Tracks tenant viewing requests with full lifecycle management:

- Statuses: `pending` → `accepted` → `confirmed` → `completed`
- Alternative flows: `rejected`, `cancelled`
- Stores proposed viewing times from agents
- Timestamps for request, response, and confirmation

### 2. `saved_properties` Table

**File:** `supabase/migrations/20260901000002_create_saved_properties.sql`

Simple join table for tenant property bookmarks:

- Many-to-many relationship (profiles ↔ properties)
- Unique constraint prevents duplicate saves
- Cascading deletes maintain data integrity

### 3. RLS Policy

**File:** `supabase/migrations/20260901000003_add_tenant_browse_properties_policy.sql`

Security policy allowing authenticated tenants to browse all active properties.

---

## Feature Modules

### Properties Feature Extension

**Location:** `src/features/properties/`

**New Files:**

- `types.ts` - Added `PropertySearchFilters`, `PropertyWithMeta`
- `schema.ts` - Added `searchFiltersSchema`
- `repository.ts` - Added search functions with filtering
- `actions.ts` - Added `searchPropertiesAction`, `getPropertyDetailAction`

**Capabilities:**

- Full-text location search (ILIKE pattern matching)
- Filter by: property type, bedrooms, bathrooms, price range, furnished status, amenities
- Metadata enrichment (isSaved, hasRequested flags)

### Saved Properties Feature

**Location:** `src/features/saved-properties/`

Complete CRUD module:

- `types.ts` - SavedProperty type definitions
- `schema.ts` - Validation schemas
- `repository.ts` - Database operations (create, delete, list, check)
- `service.ts` - Business logic layer
- `actions.ts` - Server Actions (toggle, get list)

### Viewing Requests Feature

**Location:** `src/features/viewing-requests/`

Full lifecycle management:

- `types.ts` - Request types with property joins
- `schema.ts` - Validation schemas
- `repository.ts` - Database operations with status transitions
- `service.ts` - Business logic with permission checks
- `actions.ts` - Server Actions (create, cancel, confirm, list)

---

## UI Components

### shadcn/ui Components Added

- `dialog` - Modal dialogs
- `checkbox` - Form checkboxes
- `badge` - Status badges
- `avatar` - User avatars
- `slider` - Range sliders
- `dropdown-menu` - User menu (custom implementation)
- `scroll-area` - Scrollable containers
- `sheet` - Side panels

**Note:** Base UI imports updated to use namespace pattern (`Dialog.Root`, etc.)

### Custom Components

#### Layout Components

- **TenantNav** (`src/components/custom/tenant-nav.tsx`)
  - Sticky navigation header
  - Desktop: full menu with user dropdown
  - Mobile: hamburger menu (future enhancement)

- **TenantFooter** (`src/components/custom/tenant-footer.tsx`)
  - Links, social media, copyright

#### Property Components

- **PropertyCard** (`src/features/properties/components/property-card.tsx`)
  - Card display with image, details, price
  - Save button (heart icon)
  - "I'm Interested" CTA

- **PropertyGrid** (`src/features/properties/components/property-grid.tsx`)
  - Responsive 2-column grid
  - Empty state handling

- **PropertyFilters** (`src/features/properties/components/property-filters.tsx`)
  - Sidebar filter panel
  - Property type, furnished status, amenities
  - Reset functionality

- **PropertySearchBar** (`src/features/properties/components/property-search-bar.tsx`)
  - Location search input
  - Search button

#### Viewing Request Components

- **ViewingRequestDialog** (`src/features/viewing-requests/components/viewing-request-dialog.tsx`)
  - Modal form for requesting viewings
  - Optional message field (500 char limit)
  - Success callback

- **ViewingRequestCard** (`src/features/viewing-requests/components/viewing-request-card.tsx`)
  - Displays request with property preview
  - Status badges
  - Proposed viewing time display
  - Cancel/Confirm actions

---

## Tenant Routes

### Route Structure

**Base:** `src/app/(protected)/@tenant/`

All routes use the tenant parallel route slot and require authentication.

### Pages

#### 1. Browse Properties (`/browse-properties`)

**File:** `browse-properties/page.tsx`

Client component with:

- Search bar (location filter)
- Sidebar filters
- Property grid with infinite scroll potential
- Save/interest actions
- ViewingRequestDialog integration

#### 2. Property Detail (`/browse-properties/[id]`)

**Files:**

- `browse-properties/[id]/page.tsx` (Server Component)
- `browse-properties/[id]/property-detail-client.tsx` (Client Component)

Features:

- Full property information
- Image display
- Amenities list
- Save/Request actions
- Back navigation

#### 3. My Requests (`/my-requests`)

**File:** `my-requests/page.tsx`

Tabbed interface:

- **Property Interest** - Pending requests
- **Matches** - Accepted/confirmed viewings
- **Completed** - Finished/rejected/cancelled

Right rail CTA for creating search requests.

#### 4. Saved Properties (`/saved`)

**File:** `saved/page.tsx`

- Grid of saved properties
- Unsave functionality
- Empty state

#### 5. Matches (`/matches`)

**File:** `matches/page.tsx`

Filtered view showing only accepted/confirmed viewing requests with confirm action.

#### 6. My Rental (`/my-rental`)

**File:** `my-rental/page.tsx`

Placeholder for future active lease information.

### Layout

**File:** `layout.tsx`

- TenantNav header
- Main content area
- TenantFooter
- Sonner toaster for notifications

---

## Technical Notes

### Type Safety

- Temporary type definitions added for `viewing_requests` and `saved_properties` tables
- Type assertions used (`as never`) to bypass Supabase type checks until migrations are applied
- Production: regenerate types with `supabase gen types typescript`

### Authentication

- All actions require authenticated user
- Profile ID extracted from session
- RLS policies enforce tenant-only access

### Data Flow

1. User interacts with UI component
2. Component calls Server Action
3. Server Action validates with Zod schema
4. Service layer checks permissions
5. Repository executes database query
6. Response flows back to UI
7. Optimistic updates + revalidation

### Image Handling

- Placeholder images via `placehold.co`
- Production: integrate with property image uploads

### Performance Considerations

- Server Components for initial data fetching
- Client Components for interactivity
- Revalidation paths on mutations
- Future: implement pagination/infinite scroll

---

## Next Steps

### Immediate (Required for Launch)

1. **Apply Migrations**

   ```bash
   supabase db push
   ```

2. **Regenerate Types**

   ```bash
   supabase gen types typescript --local > src/lib/supabase/types.ts
   ```

3. **Remove Type Assertions**
   - Update `viewing-requests/repository.ts`
   - Update `saved-properties/repository.ts`
   - Remove `as never` casts

### Short-term Enhancements

- Mobile navigation menu (Sheet component)
- Property image upload integration
- Notifications system (bell icon)
- Advanced location search (geocoding, lat/lng)
- Pagination for search results
- Size/sqm filtering (if added to schema)

### Medium-term Features

- Real-time updates (Supabase Realtime)
- Chat between tenants and agents
- Calendar integration for viewing scheduling
- Document upload (tenant applications)
- Lease management (My Rental page)

---

## Testing Checklist

### Unit Tests (Future)

- [ ] Service layer logic
- [ ] Repository CRUD operations
- [ ] Schema validations

### Integration Tests

- [ ] Search with filters
- [ ] Save/unsave property
- [ ] Create viewing request
- [ ] Cancel viewing request
- [ ] Confirm viewing request
- [ ] Viewing request status transitions

### Manual Testing

- [ ] Browse properties as authenticated tenant
- [ ] Search by location
- [ ] Filter by property type, bedrooms, price
- [ ] Save a property
- [ ] Unsave a property
- [ ] Request a viewing
- [ ] Cancel a viewing request
- [ ] View saved properties page
- [ ] View my requests page
- [ ] Check responsive design (mobile/tablet/desktop)

---

## Deployment Notes

### Environment Variables

Required:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Database Setup

1. Run migrations in order
2. Verify RLS policies are active
3. Test with tenant and agent/owner users

### Build Verification

```bash
npm run lint
npm run build
```

Both commands should complete successfully (warnings are acceptable).

---

## File Manifest

### Database

- `supabase/migrations/20260901000001_create_viewing_requests.sql`
- `supabase/migrations/20260901000002_create_saved_properties.sql`
- `supabase/migrations/20260901000003_add_tenant_browse_properties_policy.sql`

### Features

- `src/features/properties/` (extended)
- `src/features/saved-properties/` (new - 5 files)
- `src/features/viewing-requests/` (new - 5 files)

### Components

- `src/components/ui/` (7 shadcn components)
- `src/components/custom/tenant-nav.tsx`
- `src/components/custom/tenant-footer.tsx`
- `src/features/properties/components/` (4 components)
- `src/features/viewing-requests/components/` (2 components)

### Routes

- `src/app/(protected)/@tenant/layout.tsx` (updated)
- `src/app/(protected)/@tenant/browse-properties/` (2 files)
- `src/app/(protected)/@tenant/browse-properties/[id]/` (2 files)
- `src/app/(protected)/@tenant/my-requests/page.tsx`
- `src/app/(protected)/@tenant/saved/page.tsx`
- `src/app/(protected)/@tenant/matches/page.tsx`
- `src/app/(protected)/@tenant/my-rental/page.tsx`

### Types

- `src/types/actions.ts` (ActionResult type)

---

## Known Issues & Limitations

1. **Type Safety**: Temporary type definitions used until migrations applied
2. **Images**: Using placeholder images only
3. **Mobile Nav**: Hamburger menu not yet implemented
4. **Notifications**: Bell icon placeholder (no functionality)
5. **Location Search**: Basic ILIKE matching (no geocoding)
6. **Pagination**: Not implemented (loads all results)
7. **Size Filtering**: Omitted as per requirements

---

## Support & Troubleshooting

### Build Errors

If you encounter type errors:

1. Ensure migrations are applied: `supabase db push`
2. Regenerate types: `supabase gen types typescript --local > src/lib/supabase/types.ts`
3. Remove temporary type definitions in repository files

### Runtime Errors

- Check Supabase connection
- Verify environment variables
- Check browser console for client-side errors
- Check server logs for API errors

### RLS Policy Issues

- Verify user is authenticated
- Check user role in session
- Ensure RLS policies are enabled on tables

---

**Implementation completed:** 2026-08-31  
**Status:** ✅ Build passing, lint passing (warnings only)  
**Ready for:** Migration application and type regeneration
