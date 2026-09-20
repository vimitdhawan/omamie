import Link from "next/link";
import Image from "next/image";
import { getAuthSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  Banknote,
  CalendarDays,
  Download,
  FileText,
  ImageIcon,
  MapPin,
  ShieldCheck,
  Wallet,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  getTenantLeaseAction,
  getLeaseDocumentsAction,
} from "@/features/leases/actions";
import { getPublicImageUrl } from "@/lib/storage-url";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

function formatFileSize(bytes: number | null): string {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function MyRentalsPage() {
  const session = await getAuthSession();
  if (!session?.profileId || session.role !== "tenant") {
    redirect("/login");
  }

  const lease = await getTenantLeaseAction();
  const documents = lease ? await getLeaseDocumentsAction(lease.id) : [];

  return (
    <main className="flex-1 bg-white px-4 pt-6 pb-12">
      <div className="mx-auto max-w-[1100px]">
        {!lease ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-lg border text-center">
            <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
              <FileText className="size-6" />
            </div>
            <div>
              <p className="text-foreground text-base font-semibold">
                You don&apos;t have an active rental yet
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Once your lease is finalized by the property owner, it will show
                up here.
              </p>
            </div>
            <Link
              href="/explore"
              className={buttonVariants({ variant: "default" })}
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Hero card */}
            <Card className="overflow-hidden p-0">
              <div className="grid grid-cols-1 md:grid-cols-[320px_1fr]">
                <div className="bg-surface-soft relative aspect-[4/3] w-full md:aspect-auto">
                  {lease.property.coverImagePath ? (
                    <Image
                      src={getPublicImageUrl(lease.property.coverImagePath)}
                      alt={lease.property.title}
                      fill
                      sizes="(min-width: 768px) 320px, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                      <ImageIcon className="size-8" />
                    </div>
                  )}
                </div>

                <div className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-foreground text-xl font-semibold">
                        {lease.property.title}
                      </h2>
                      <p className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                        <MapPin className="size-4" />
                        {lease.property.location || "Address not set"}
                      </p>
                    </div>
                    <Badge className="shrink-0 bg-green-100 text-green-700">
                      Lease Active
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                        Lease Period
                      </p>
                      <p className="text-foreground mt-1 flex items-center gap-1 text-sm">
                        <CalendarDays className="size-4" />
                        {formatDate(lease.leaseStart)} –{" "}
                        {formatDate(lease.leaseEnd)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                        Property ID
                      </p>
                      <p className="text-foreground mt-1 text-sm">
                        {lease.property.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Link
                      href={`/explore/${lease.property.id}`}
                      className={buttonVariants({ variant: "default" })}
                    >
                      View Full Details
                    </Link>
                    <Button variant="outline" disabled>
                      Contact Owner
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Overview + documents */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <h3 className="text-foreground text-base font-semibold">
                  Rental Overview
                </h3>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Wallet className="text-primary mt-0.5 size-5 shrink-0" />
                    <div>
                      <p className="text-foreground text-sm font-medium">
                        Monthly Rent
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {formatCurrency(lease.monthlyRent, "en-US", "THB")}
                        {lease.nextPaymentDue &&
                          ` · due ${formatDate(lease.nextPaymentDue)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ShieldCheck className="text-primary mt-0.5 size-5 shrink-0" />
                    <div>
                      <p className="text-foreground text-sm font-medium">
                        Deposit Held
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {lease.securityDeposit != null
                          ? formatCurrency(
                              lease.securityDeposit,
                              "en-US",
                              "THB"
                            )
                          : "Not on file"}
                        {" · held by the property owner"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Banknote className="text-primary mt-0.5 size-5 shrink-0" />
                    <div>
                      <p className="text-foreground text-sm font-medium">
                        Payment Method
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {lease.paymentMethod || "Not on file"}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-foreground text-base font-semibold">
                  Documents
                </h3>
                <Separator className="my-4" />
                {documents.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No documents have been uploaded for this lease yet.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {documents.map((document) => (
                      <li
                        key={document.id}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="bg-surface-soft text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md">
                            <FileText className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-foreground truncate text-sm font-medium">
                              {document.name}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {formatFileSize(document.fileSizeBytes)}
                            </p>
                          </div>
                        </div>
                        {document.downloadUrl ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            render={
                              <a
                                href={document.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Download ${document.name}`}
                              />
                            }
                          >
                            <Download className="size-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" disabled>
                            <Download className="size-4" />
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            {/* Maintenance bar */}
            <Card className="flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
                  <Wrench className="size-5" />
                </div>
                <div>
                  <p className="text-foreground text-sm font-medium">
                    Maintenance & Issues
                  </p>
                  <p className="text-muted-foreground flex items-center gap-1 text-xs">
                    <AlertTriangle className="size-3" />
                    No active requests
                  </p>
                </div>
              </div>
              <Button disabled className="shrink-0">
                Report an Issue
              </Button>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
