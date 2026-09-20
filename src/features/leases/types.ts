export type LeaseStatus = "active" | "ended";

export interface Lease {
  id: string;
  propertyId: string;
  tenantId: string;
  status: LeaseStatus;
  leaseStart: string;
  leaseEnd: string;
  monthlyRent: number;
  securityDeposit: number | null;
  paymentMethod: string | null;
  nextPaymentDue: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeaseWithProperty extends Lease {
  property: {
    id: string;
    title: string;
    location: string | null;
    coverImagePath: string | null;
  };
}

export interface LeaseDocument {
  id: string;
  leaseId: string;
  name: string;
  fileType: string | null;
  fileSizeBytes: number | null;
  storagePath: string;
  createdAt: string;
}

export interface LeaseDocumentWithUrl extends LeaseDocument {
  downloadUrl: string | null;
}
