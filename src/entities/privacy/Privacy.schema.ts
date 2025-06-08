import { z } from "zod";

export enum PrivacyConsentStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  WITHDRAWN = "withdrawn",
}

// Simple privacy consent record
export const PrivacyConsentSchema = z.object({
  id: z.number(),
  userId: z.string().uuid(),
  tenantId: z.number(),
  status: z.nativeEnum(PrivacyConsentStatus),
  acceptedAt: z.string().nullable(),
  withdrawnAt: z.string().nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  privacyPolicyVersion: z.string(), // Track which version they agreed to
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Form for accepting privacy policy
export const PrivacyAcceptanceSchema = z.object({
  acceptPrivacyPolicy: z.boolean().refine((val) => val === true, {
    message: "You must accept the privacy policy to continue",
  }),
  acceptTermsOfService: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms of service to continue",
  }),
  acceptDataProcessing: z.boolean().refine((val) => val === true, {
    message: "You must consent to data processing to use this platform",
  }),
});

export type PrivacyConsent = z.infer<typeof PrivacyConsentSchema>;
export type PrivacyAcceptance = z.infer<typeof PrivacyAcceptanceSchema>;
