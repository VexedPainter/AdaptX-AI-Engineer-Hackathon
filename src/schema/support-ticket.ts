/**
 * Extraction Schemas — Support Ticket Documents
 * 
 * Realistic nested schema for extracting structured data from
 * support tickets (Zendesk, Jira Service Desk, email support).
 * Handles multi-step resolution, SLA tracking, product references.
 */

import { z } from 'zod';

/** Schema for the customer who filed the ticket */
export const TicketCustomerSchema = z.object({
  name: z.string().describe('Customer name'),
  email: z.string().email().optional().describe('Customer email address'),
  accountId: z.string().optional().describe('Customer account or organization ID'),
  tier: z.enum(['free', 'basic', 'premium', 'enterprise', 'unknown']).default('unknown')
    .describe('Customer tier or plan level'),
});

/** Schema for a product/service referenced in the ticket */
export const ProductReferenceSchema = z.object({
  productName: z.string().describe('Name of the product or service'),
  version: z.string().optional().describe('Version or SKU if mentioned'),
  component: z.string().optional().describe('Specific component or feature involved'),
});

/** Schema for a resolution step taken */
export const ResolutionStepSchema = z.object({
  stepNumber: z.number().int().describe('Order of this step in the resolution process'),
  action: z.string().describe('What action was taken'),
  performedBy: z.string().optional().describe('Who performed this action'),
  timestamp: z.string().optional().describe('When this step was taken'),
  outcome: z.string().optional().describe('Result of this action'),
});

/** Schema for SLA (Service Level Agreement) tracking */
export const SlaInfoSchema = z.object({
  responseTimeSla: z.string().optional().describe('Expected first response time (e.g., "4 hours")'),
  resolutionTimeSla: z.string().optional().describe('Expected resolution time (e.g., "24 hours")'),
  slaBreached: z.boolean().describe('Whether SLA was breached'),
  breachReason: z.string().optional().describe('Reason for SLA breach if applicable'),
});

/** Top-level support ticket extraction schema */
export const SupportTicketSchema = z.object({
  ticketId: z.string().describe('Unique ticket identifier'),
  subject: z.string().describe('Ticket subject line'),
  category: z.enum([
    'bug_report', 'feature_request', 'billing', 'account_access',
    'performance', 'integration', 'documentation', 'security', 'other'
  ]).describe('Category of the support issue'),
  priority: z.enum(['low', 'medium', 'high', 'critical'])
    .describe('Priority level of the ticket'),
  status: z.enum(['open', 'in_progress', 'waiting_on_customer', 'resolved', 'closed', 'escalated'])
    .describe('Current status of the ticket'),
  createdAt: z.string().describe('When the ticket was created (ISO 8601 or descriptive)'),
  resolvedAt: z.string().optional().describe('When the ticket was resolved'),
  customer: TicketCustomerSchema.describe('Customer who filed the ticket'),
  assignedAgent: z.string().optional().describe('Support agent assigned to the ticket'),
  product: ProductReferenceSchema.optional().describe('Product/service referenced'),
  problemDescription: z.string().describe('Detailed description of the problem'),
  rootCause: z.string().optional().describe('Identified root cause'),
  resolutionSteps: z.array(ResolutionStepSchema).describe('Steps taken to resolve the issue'),
  resolution: z.string().optional().describe('Final resolution summary'),
  sla: SlaInfoSchema.optional().describe('SLA tracking information'),
  tags: z.array(z.string()).describe('Tags or labels applied to the ticket'),
  relatedTicketIds: z.array(z.string()).describe('IDs of related support tickets'),
  customerSatisfactionScore: z.number().min(1).max(5).optional()
    .describe('CSAT score (1-5) if provided'),
  internalNotes: z.string().optional().describe('Internal agent notes (non-customer-facing)'),
});

export type SupportTicketExtraction = z.infer<typeof SupportTicketSchema>;
