"use client";

import * as React from "react";

/**
 * Lets the table owning these rows drop a resolved (approved/rejected) property from its own
 * state. The table keeps the queue in React state, so a server revalidate alone would leave
 * the row on screen until the next navigation.
 */
export const ReviewQueueContext = React.createContext<{
  onResolved: (propertyId: string) => void;
} | null>(null);
