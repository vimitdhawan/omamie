src/features/auth/schema.ts
● 23 [security] Public signup schema accepts role "admin", allowing self-provisioned admin access.
src/features/properties/storage.ts
● [correctness] Objects missing created_at default to epoch (new Date(0)), making them look older than ORPHAN_GRACE_MS immediately.
src/app/(protected)/@agentOwner/matches/matches-client.tsx
● 264 [correctness] handleStatusChange clears debounceTimer.current without resetting it, leaving a stale ref for other debounced callers.
src/features/properties/service.ts
● [correctness] savePropertyListing leaves status as pre-finalize value if finalizePropertyImagesRpc throws mid-way, while uploaded files are already persisted.
