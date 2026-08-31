"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/format";
import {
  PROPERTY_TYPES,
  PROPERTY_STATUSES,
} from "@/features/properties/schema";
import type {
  Property,
  PropertyType,
  PropertyStatus,
} from "@/features/properties/types";
import { PropertyStatus as PropertyStatusEnum } from "@/features/properties/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, MousePointer } from "lucide-react";

interface PropertiesViewProps {
  properties: Property[];
}

function getStatusBadgeColor(status: PropertyStatus): string {
  switch (status) {
    case PropertyStatusEnum.ACTIVE:
      return "bg-green-100 text-green-800";
    case PropertyStatusEnum.RENTED:
      return "bg-blue-100 text-blue-800";
    case PropertyStatusEnum.INACTIVE:
      return "bg-gray-100 text-gray-800";
    case PropertyStatusEnum.REVIEW:
      return "bg-yellow-100 text-yellow-800";
    case PropertyStatusEnum.PENDING:
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getPropertyTypeLabel(type: PropertyType): string {
  return PROPERTY_TYPES[type as keyof typeof PROPERTY_TYPES] || type;
}

function getStatusLabel(status: PropertyStatus): string {
  return PROPERTY_STATUSES[status as keyof typeof PROPERTY_STATUSES] || status;
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}m ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

function StatsCards({ properties }: { properties: Property[] }) {
  const stats = useMemo(() => {
    const total = properties.length;
    const published = properties.filter(
      (p) => p.status === PropertyStatusEnum.ACTIVE
    ).length;
    const drafts = properties.filter(
      (p) =>
        p.status === PropertyStatusEnum.PENDING ||
        p.status === PropertyStatusEnum.REVIEW
    ).length;
    const rented = properties.filter(
      (p) => p.status === PropertyStatusEnum.RENTED
    ).length;

    return { total, published, drafts, rented };
  }, [properties]);

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="border-border bg-card rounded-lg border p-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Total
        </p>
        <p className="mt-2 text-3xl font-bold">{stats.total}</p>
      </div>
      <div className="border-border bg-card rounded-lg border p-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Published
        </p>
        <p className="mt-2 text-3xl font-bold text-green-600">
          {stats.published}
        </p>
      </div>
      <div className="border-border bg-card rounded-lg border p-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Drafts
        </p>
        <p className="mt-2 text-3xl font-bold text-orange-600">
          {stats.drafts}
        </p>
      </div>
      <div className="border-border bg-card rounded-lg border p-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Rented
        </p>
        <p className="mt-2 text-3xl font-bold text-blue-600">{stats.rented}</p>
      </div>
    </div>
  );
}

export function PropertiesView({
  properties: initialProperties,
}: PropertiesViewProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<PropertyType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | "all">(
    "all"
  );
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const filteredProperties = useMemo(() => {
    return initialProperties.filter((property) => {
      const matchesSearch =
        property.title.toLowerCase().includes(search.toLowerCase()) ||
        property.location.toLowerCase().includes(search.toLowerCase());
      const matchesType =
        typeFilter === "all" || property.propertyType === typeFilter;
      const matchesStatus =
        statusFilter === "all" || property.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [initialProperties, search, typeFilter, statusFilter]);

  return (
    <div className="p-6">
      <div>
        <StatsCards properties={filteredProperties} />

        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Input
              placeholder="Search properties by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="lg:max-w-xs"
            />
            <div className="flex items-center gap-2">
              <Select
                value={typeFilter}
                onValueChange={(val) =>
                  setTypeFilter(val as PropertyType | "all")
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(PROPERTY_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(val) =>
                  setStatusFilter(val as PropertyStatus | "all")
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(PROPERTY_STATUSES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <ToggleGroup
              value={[viewMode]}
              onValueChange={(val) =>
                val && val.length > 0 && setViewMode(val[0] as "table" | "grid")
              }
            >
              <ToggleGroupItem value="table" aria-label="Table view">
                Table
              </ToggleGroupItem>
              <ToggleGroupItem value="grid" aria-label="Grid view">
                Grid
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {filteredProperties.length === 0 ? (
          <div className="border-border bg-card/50 rounded-lg border p-12 text-center">
            <p className="text-muted-foreground">No properties found</p>
          </div>
        ) : viewMode === "table" ? (
          <div className="border-border overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Rent/mo</TableHead>
                  <TableHead>Beds/Baths</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">
                      {property.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {property.location}
                    </TableCell>
                    <TableCell className="text-sm">
                      {getPropertyTypeLabel(property.propertyType)}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(property.monthlyRent, "en-US", "THB")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {property.bedrooms}bd / {property.bathrooms}ba
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(property.status)}>
                        {getStatusLabel(property.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatRelativeDate(
                        property.updatedAt || property.createdAt
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/properties/${property.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-surface-soft/60 cursor-pointer"
                        >
                          <Edit className="size-4" />
                          <MousePointer className="absolute -top-1 -right-1 size-3" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((property) => (
              <Link
                key={property.id}
                href={`/properties/${property.id}`}
                className="border-border bg-card hover:bg-card/80 group relative cursor-pointer overflow-hidden rounded-lg border transition-colors"
              >
                <div className="bg-muted aspect-video" />
                <div className="space-y-3 p-4">
                  <div>
                    <h3 className="line-clamp-1 font-semibold">
                      {property.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-1 text-sm">
                      {property.location}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <p className="font-semibold">
                        {formatCurrency(property.monthlyRent, "en-US", "THB")}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {property.bedrooms}bd {property.bathrooms}ba
                      </p>
                    </div>
                    <Badge className={getStatusBadgeColor(property.status)}>
                      {getStatusLabel(property.status)}
                    </Badge>
                  </div>
                </div>
                <MousePointer className="text-muted-foreground group-hover:text-foreground absolute right-2 bottom-2 size-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
