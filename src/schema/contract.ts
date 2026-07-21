/**
 * Extraction Schemas — Contract Documents
 * 
 * Realistic nested schema for extracting structured data from
 * legal contracts. Designed to handle real-world messiness:
 * partial dates, missing clauses, inconsistent party naming.
 */

import { z } from 'zod';

/** Schema for a party to a contract (buyer, seller, etc.) */
export const ContractPartySchema = z.object({
  name: z.string().describe('Full legal name of the party'),
  role: z.enum(['buyer', 'seller', 'licensor', 'licensee', 'provider', 'client', 'other'])
    .describe('Role of this party in the contract'),
  address: z.string().optional().describe('Mailing or registered address'),
  contactEmail: z.string().email().optional().describe('Primary contact email'),
  contactPhone: z.string().optional().describe('Primary contact phone number'),
  signatoryName: z.string().optional().describe('Name of the person who signed'),
  signatoryTitle: z.string().optional().describe('Title of the signatory (e.g., CEO, VP)'),
});

/** Schema for a financial term in the contract */
export const PaymentTermSchema = z.object({
  amount: z.number().describe('Payment amount in the specified currency'),
  currency: z.string().default('USD').describe('ISO 4217 currency code'),
  frequency: z.enum(['one_time', 'monthly', 'quarterly', 'annually', 'upon_delivery', 'milestone', 'other'])
    .describe('How often payment is due'),
  dueDate: z.string().optional().describe('Specific due date if applicable (ISO 8601 or descriptive)'),
  latePenaltyPercent: z.number().optional().describe('Late payment penalty as a percentage'),
  notes: z.string().optional().describe('Additional payment notes or conditions'),
});

/** Schema for a contract clause */
export const ContractClauseSchema = z.object({
  clauseType: z.enum([
    'termination', 'confidentiality', 'indemnification', 'liability_limitation',
    'force_majeure', 'dispute_resolution', 'intellectual_property', 'non_compete',
    'warranty', 'amendment', 'governing_law', 'assignment', 'other'
  ]).describe('Type of legal clause'),
  summary: z.string().describe('Brief summary of the clause in plain language'),
  noticePeriodDays: z.number().optional().describe('Notice period in days, if applicable'),
  jurisdiction: z.string().optional().describe('Governing jurisdiction for this clause'),
});

/** Top-level contract extraction schema */
export const ContractSchema = z.object({
  contractTitle: z.string().describe('Title or name of the contract'),
  contractType: z.enum([
    'service_agreement', 'license_agreement', 'nda', 'employment',
    'lease', 'purchase_order', 'partnership', 'consulting', 'other'
  ]).describe('Type of contract'),
  effectiveDate: z.string().describe('Date the contract takes effect (ISO 8601 or descriptive)'),
  expirationDate: z.string().optional().describe('Contract end date if applicable'),
  autoRenewal: z.boolean().describe('Whether the contract auto-renews'),
  parties: z.array(ContractPartySchema).min(1).describe('Parties involved in the contract'),
  paymentTerms: z.array(PaymentTermSchema).describe('Financial terms and payment schedule'),
  clauses: z.array(ContractClauseSchema).describe('Key legal clauses extracted'),
  totalContractValue: z.number().optional().describe('Total estimated contract value'),
  governingLaw: z.string().optional().describe('Jurisdiction governing the entire contract'),
  executionDate: z.string().optional().describe('Date the contract was signed'),
  confidential: z.boolean().default(false).describe('Whether the contract is marked confidential'),
});

export type ContractExtraction = z.infer<typeof ContractSchema>;
