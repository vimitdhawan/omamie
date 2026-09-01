"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import type { AdminProperty } from "../types";
import { formatDate, getStatusVariant } from "../utils";
import { approvePropertyAction, rejectPropertyAction } from "../actions";

type PropertyReviewTableProps = {
  properties: AdminProperty[];
};

export function PropertyReviewTable({ properties }: PropertyReviewTableProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleApprove = async (propertyId: string, title: string) => {
    setLoading(propertyId);
    const result = await approvePropertyAction(propertyId);
    setLoading(null);

    if (result.success) {
      toast.success(`Property "${title}" approved successfully`);
    } else {
      toast.error(result.errorMessage || "Failed to approve property");
    }
  };

  const handleReject = async (propertyId: string, title: string) => {
    setLoading(propertyId);
    const result = await rejectPropertyAction(propertyId);
    setLoading(null);

    if (result.success) {
      toast.success(`Property "${title}" rejected`);
    } else {
      toast.error(result.errorMessage || "Failed to reject property");
    }
  };

  if (properties.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        No properties pending review
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Property</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Rent</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
            <TableRow key={property.id}>
              <TableCell className="font-medium">{property.title}</TableCell>
              <TableCell className="capitalize">
                {property.propertyType}
              </TableCell>
              <TableCell>{property.location}</TableCell>
              <TableCell>${property.monthlyRent.toLocaleString()}/mo</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm">
                    {property.ownerName || "Unknown"}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {property.ownerEmail}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(property.status)}>
                  {property.status}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(property.createdAt)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleApprove(property.id, property.title)}
                    disabled={loading === property.id}
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(property.id, property.title)}
                    disabled={loading === property.id}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
