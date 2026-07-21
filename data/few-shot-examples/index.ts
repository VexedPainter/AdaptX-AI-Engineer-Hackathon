/**
 * Curated Few-Shot Examples for Qdrant Seeding
 * 
 * 5 examples per document type (15 total) used as retrieval targets.
 * Each example shows correct extraction from noisy input text.
 */

import type { FewShotExample } from '../../src/types/index.js';

export const fewShotExamples: FewShotExample[] = [
  // ─── Contract Examples ──────────────────────────────────────────────────
  {
    id: 'fs-contract-001',
    documentType: 'contract',
    inputText: 'Service Agreement between ABC Corp and XYZ Ltd, effective Jan 1 2024. ABC Corp (Provider, 100 Main St, Boston MA) will deliver consulting services. Total fee $50,000, payable monthly at $10,000/month for 5 months. Auto-renewal: No. Governing law: Massachusetts. Confidentiality clause with 2 year survival. Termination with 30 days notice. Signed by John Doe, CEO of ABC Corp and Jane Smith, CFO of XYZ Ltd on Dec 28 2023.',
    expectedOutput: {
      contractTitle: 'Service Agreement',
      contractType: 'service_agreement',
      effectiveDate: 'Jan 1 2024',
      expirationDate: null,
      autoRenewal: false,
      parties: [
        { name: 'ABC Corp', role: 'provider', address: '100 Main St, Boston MA', signatoryName: 'John Doe', signatoryTitle: 'CEO' },
        { name: 'XYZ Ltd', role: 'client', signatoryName: 'Jane Smith', signatoryTitle: 'CFO' }
      ],
      paymentTerms: [
        { amount: 10000, currency: 'USD', frequency: 'monthly' }
      ],
      clauses: [
        { clauseType: 'confidentiality', summary: 'Mutual confidentiality with 2 year survival clause' },
        { clauseType: 'termination', summary: 'Either party may terminate with 30 days notice', noticePeriodDays: 30 }
      ],
      totalContractValue: 50000,
      governingLaw: 'Massachusetts',
      executionDate: 'Dec 28 2023',
      confidential: false
    }
  },
  {
    id: 'fs-contract-002',
    documentType: 'contract',
    inputText: 'NDA between TechCo and InnovateLtd. Effective upon signing (March 5, 2024). Both parties agree not to disclose confidential information for 3 years. Governing law: California. Non-compete: 12 months post-termination. Contact: legal@techco.com. Signed by Sarah Kim, General Counsel.',
    expectedOutput: {
      contractTitle: 'Non-Disclosure Agreement',
      contractType: 'nda',
      effectiveDate: 'March 5, 2024',
      autoRenewal: false,
      parties: [
        { name: 'TechCo', role: 'other', contactEmail: 'legal@techco.com', signatoryName: 'Sarah Kim', signatoryTitle: 'General Counsel' },
        { name: 'InnovateLtd', role: 'other' }
      ],
      paymentTerms: [],
      clauses: [
        { clauseType: 'confidentiality', summary: 'Mutual non-disclosure of confidential information for 3 years' },
        { clauseType: 'non_compete', summary: '12 months non-compete post-termination' }
      ],
      governingLaw: 'California',
      executionDate: 'March 5, 2024',
      confidential: true
    }
  },
  {
    id: 'fs-contract-003',
    documentType: 'contract',
    inputText: 'Software License Agreement. CloudSoft Inc (licensor) grants DataCorp (licensee) a non-exclusive license. Annual fee: $96,000. Term: 2 years starting June 2024. Auto-renews annually. 60 days notice to cancel. 99.9% uptime SLA. Liability capped at 12 months fees. Texas law.',
    expectedOutput: {
      contractTitle: 'Software License Agreement',
      contractType: 'license_agreement',
      effectiveDate: 'June 2024',
      autoRenewal: true,
      parties: [
        { name: 'CloudSoft Inc', role: 'licensor' },
        { name: 'DataCorp', role: 'licensee' }
      ],
      paymentTerms: [
        { amount: 96000, currency: 'USD', frequency: 'annually' }
      ],
      clauses: [
        { clauseType: 'warranty', summary: '99.9% uptime SLA' },
        { clauseType: 'liability_limitation', summary: 'Liability capped at 12 months of fees paid' },
        { clauseType: 'termination', summary: 'Auto-renews annually with 60 days notice to cancel', noticePeriodDays: 60 }
      ],
      totalContractValue: 192000,
      governingLaw: 'Texas',
      confidential: false
    }
  },
  {
    id: 'fs-contract-004',
    documentType: 'contract',
    inputText: 'Purchase Order #PO-5522 from BuildCo to SupplyCo. Date: May 2024. Items: 100 widgets at $50 each ($5000), 50 gears at $120 each ($6000). Total: $11,000. Payment: Net 30. Warranty: 12 months. No auto-renewal. Michigan law.',
    expectedOutput: {
      contractTitle: 'Purchase Order #PO-5522',
      contractType: 'purchase_order',
      effectiveDate: 'May 2024',
      autoRenewal: false,
      parties: [
        { name: 'BuildCo', role: 'buyer' },
        { name: 'SupplyCo', role: 'seller' }
      ],
      paymentTerms: [
        { amount: 11000, currency: 'USD', frequency: 'one_time' }
      ],
      clauses: [
        { clauseType: 'warranty', summary: '12 months warranty on all items' }
      ],
      totalContractValue: 11000,
      governingLaw: 'Michigan',
      confidential: false
    }
  },
  {
    id: 'fs-contract-005',
    documentType: 'contract',
    inputText: 'Consulting Agreement. BrightAdvisors (consultant) for MegaRetail (client). Scope: market research and strategy. $200/hour, estimated 400 hours over 6 months. Total est: $80,000. Payment monthly. Term: Jan-Jun 2024. Does not auto-renew. 30 day termination. Colorado law. Confidential.',
    expectedOutput: {
      contractTitle: 'Consulting Agreement',
      contractType: 'consulting',
      effectiveDate: 'January 2024',
      expirationDate: 'June 2024',
      autoRenewal: false,
      parties: [
        { name: 'BrightAdvisors', role: 'provider' },
        { name: 'MegaRetail', role: 'client' }
      ],
      paymentTerms: [
        { amount: 80000, currency: 'USD', frequency: 'monthly', notes: '$200/hour, estimated 400 hours' }
      ],
      clauses: [
        { clauseType: 'termination', summary: 'Termination with 30 days notice', noticePeriodDays: 30 },
        { clauseType: 'confidentiality', summary: 'Agreement is confidential' }
      ],
      totalContractValue: 80000,
      governingLaw: 'Colorado',
      confidential: true
    }
  },

  // ─── Chat Log Examples ──────────────────────────────────────────────────
  {
    id: 'fs-chat-001',
    documentType: 'chat_log',
    inputText: '[10:00] PM-Alice: standup time! Tom, go first.\n[10:01] Dev-Tom: working on the API refactor. should be done today. blocked on the DB schema change tho\n[10:02] PM-Alice: who owns that? @DBA-Jim can you help?\n[10:03] DBA-Jim: on it, will have the migration ready by 2pm\n[10:04] PM-Alice: great. action item: Jim delivers DB migration by 2pm, Tom continues API work after that',
    expectedOutput: {
      conversationId: 'standup',
      platform: 'slack',
      startTime: '10:00',
      participants: [
        { name: 'PM-Alice', role: 'manager' },
        { name: 'Dev-Tom', role: 'agent' },
        { name: 'DBA-Jim', role: 'agent' }
      ],
      summary: 'Daily standup discussing API refactor progress and DB schema change blocker',
      sentiment: 'neutral',
      topics: [{ topic: 'API refactor progress', resolved: false, resolution: 'In progress, dependent on DB migration' }],
      actionItems: [
        { description: 'Deliver DB migration', assignee: 'DBA-Jim', deadline: '2pm', priority: 'high', status: 'open' },
        { description: 'Continue API refactor after DB migration', assignee: 'Dev-Tom', priority: 'medium', status: 'open' }
      ],
      decisions: [],
      escalated: false,
      followUpRequired: true,
      language: 'en'
    }
  },
  {
    id: 'fs-chat-002',
    documentType: 'chat_log',
    inputText: 'Live Chat: [14:00] Agent_Kim: Hi, how can I help?\n[14:01] Customer_Joe: my account is locked out, error code E-401\n[14:03] Agent_Kim: let me check... I see your account was locked due to too many failed login attempts\n[14:04] Agent_Kim: I\'ve unlocked it. Please try logging in with your current password\n[14:05] Customer_Joe: works now, thanks Kim!\n[14:06] Agent_Kim: Happy to help! Have a great day!',
    expectedOutput: {
      conversationId: 'live-chat-session',
      platform: 'live_chat',
      startTime: '14:00',
      endTime: '14:06',
      participants: [
        { name: 'Agent_Kim', role: 'agent' },
        { name: 'Customer_Joe', role: 'customer' }
      ],
      summary: 'Customer locked out of account due to failed login attempts. Agent unlocked the account successfully.',
      sentiment: 'positive',
      topics: [{ topic: 'Account lockout (error E-401)', resolved: true, resolution: 'Account unlocked by agent' }],
      actionItems: [],
      decisions: [],
      escalated: false,
      followUpRequired: false,
      messageCount: 6,
      language: 'en'
    }
  },
  {
    id: 'fs-chat-003',
    documentType: 'chat_log',
    inputText: 'Slack #engineering: [9:00] CTO-Mark: team, we need to decide on the database for the new microservice. Options: PostgreSQL or MongoDB.\n[9:02] Dev-Sarah: Postgres for sure - we need ACID compliance for financial data\n[9:03] Dev-Raj: agree with Sarah, MongoDB doesnt give us the transaction guarantees we need\n[9:05] CTO-Mark: decided - PostgreSQL it is. @Sarah please set up the schema by Friday',
    expectedOutput: {
      conversationId: 'engineering-discussion',
      platform: 'slack',
      startTime: '9:00',
      endTime: '9:05',
      participants: [
        { name: 'CTO-Mark', role: 'manager' },
        { name: 'Dev-Sarah', role: 'agent' },
        { name: 'Dev-Raj', role: 'agent' }
      ],
      summary: 'Team decided on PostgreSQL over MongoDB for new microservice database, citing need for ACID compliance with financial data.',
      sentiment: 'positive',
      topics: [{ topic: 'Database selection for new microservice', resolved: true, resolution: 'PostgreSQL selected for ACID compliance' }],
      actionItems: [{ description: 'Set up PostgreSQL schema', assignee: 'Dev-Sarah', deadline: 'Friday', priority: 'high', status: 'open' }],
      decisions: [{ decision: 'Use PostgreSQL for the new microservice', madeBy: 'CTO-Mark', context: 'ACID compliance needed for financial data' }],
      escalated: false,
      followUpRequired: true,
      followUpDeadline: 'Friday',
      language: 'en'
    }
  },
  {
    id: 'fs-chat-004',
    documentType: 'chat_log',
    inputText: 'Teams - Support Escalation: [15:00] Agent-Lisa: customer is furious about 3rd billing error this quarter. Acct #1234. Threatening to cancel.\n[15:02] Manager-Pat: escalate to billing team immediately. What was the error?\n[15:03] Lisa: double charged $500 again. Same issue as Jan and Feb\n[15:05] Pat: unacceptable. @billing fix this NOW and issue full refund + 1 month credit. I\'ll call the customer personally.',
    expectedOutput: {
      conversationId: 'support-escalation',
      platform: 'teams',
      startTime: '15:00',
      endTime: '15:05',
      participants: [
        { name: 'Agent-Lisa', role: 'agent' },
        { name: 'Manager-Pat', role: 'manager' }
      ],
      summary: 'Customer escalation over recurring billing double-charge errors. Manager decided to issue full refund plus one month credit and personally call the customer.',
      sentiment: 'escalated',
      topics: [{ topic: 'Recurring billing double-charge error', resolved: false, resolution: 'Escalated to billing team for immediate fix' }],
      actionItems: [
        { description: 'Fix billing error and issue full refund + 1 month credit', assignee: 'billing team', priority: 'urgent', status: 'open' },
        { description: 'Call customer personally', assignee: 'Manager-Pat', priority: 'urgent', status: 'open' }
      ],
      decisions: [{ decision: 'Issue full refund plus 1 month credit to retain customer', madeBy: 'Manager-Pat' }],
      escalated: true,
      escalationReason: 'Third billing error this quarter, customer threatening cancellation',
      followUpRequired: true,
      language: 'en'
    }
  },
  {
    id: 'fs-chat-005',
    documentType: 'chat_log',
    inputText: 'Discord #dev: [20:00] Alex: just pushed the fix for the login bug, PR #456 ready for review\n[20:05] Sam: reviewed, LGTM. merging to main\n[20:06] Bot: PR #456 merged to main\n[20:07] Alex: deploying to staging now\n[20:15] Alex: staging looks good, all tests pass. deploying to prod\n[20:25] Alex: ✅ prod deploy complete. login bug fixed!',
    expectedOutput: {
      conversationId: 'dev-deployment',
      platform: 'discord',
      startTime: '20:00',
      endTime: '20:25',
      participants: [
        { name: 'Alex', role: 'agent' },
        { name: 'Sam', role: 'agent' },
        { name: 'Bot', role: 'bot' }
      ],
      summary: 'Login bug fix deployed to production. PR #456 reviewed, merged, tested on staging, and deployed successfully.',
      sentiment: 'positive',
      topics: [{ topic: 'Login bug fix deployment', resolved: true, resolution: 'Fix deployed to production successfully' }],
      actionItems: [],
      decisions: [],
      escalated: false,
      followUpRequired: false,
      language: 'en'
    }
  },

  // ─── Support Ticket Examples ────────────────────────────────────────────
  {
    id: 'fs-ticket-001',
    documentType: 'support_ticket',
    inputText: 'Ticket #5001. Subject: Cannot export reports. Priority: High. Customer: John Lee (john@acme.com, Acme Inc, Enterprise). Created March 5 2024. The CSV export button returns a 500 error. Agent Sarah investigated - found a timeout issue with large datasets. Workaround: export in smaller date ranges. Fix deployed in v3.2.1. Resolved March 6. Tags: export, bug, csv. CSAT: 4/5.',
    expectedOutput: {
      ticketId: '5001',
      subject: 'Cannot export reports',
      category: 'bug_report',
      priority: 'high',
      status: 'resolved',
      createdAt: 'March 5 2024',
      resolvedAt: 'March 6 2024',
      customer: { name: 'John Lee', email: 'john@acme.com', accountId: 'Acme Inc', tier: 'enterprise' },
      assignedAgent: 'Sarah',
      problemDescription: 'CSV export button returns a 500 error',
      rootCause: 'Timeout issue with large datasets',
      resolutionSteps: [
        { stepNumber: 1, action: 'Investigated export error', performedBy: 'Sarah' },
        { stepNumber: 2, action: 'Provided workaround: export in smaller date ranges' },
        { stepNumber: 3, action: 'Fix deployed in v3.2.1' }
      ],
      resolution: 'Fix deployed in v3.2.1',
      tags: ['export', 'bug', 'csv'],
      relatedTicketIds: [],
      customerSatisfactionScore: 4
    }
  },
  {
    id: 'fs-ticket-002',
    documentType: 'support_ticket',
    inputText: 'Feature Request FR-234. Dark mode for mobile app. From: Lisa Park (lisa@design.co, DesignCo, Premium plan). Low priority, open. Created April 1 2024. Customer wants dark mode on iOS and Android apps. 50+ other requests for same feature. Routed to product team for Q3. Tags: feature-request, mobile, dark-mode.',
    expectedOutput: {
      ticketId: 'FR-234',
      subject: 'Dark mode for mobile app',
      category: 'feature_request',
      priority: 'low',
      status: 'open',
      createdAt: 'April 1 2024',
      customer: { name: 'Lisa Park', email: 'lisa@design.co', accountId: 'DesignCo', tier: 'premium' },
      problemDescription: 'Customer wants dark mode on iOS and Android apps',
      resolutionSteps: [{ stepNumber: 1, action: 'Routed to product team for Q3 consideration' }],
      tags: ['feature-request', 'mobile', 'dark-mode'],
      relatedTicketIds: [],
      internalNotes: '50+ other requests for same feature'
    }
  },
  {
    id: 'fs-ticket-003',
    documentType: 'support_ticket',
    inputText: 'Billing ticket BIL-789. Double charged $49.99 in February. Customer: Mark Jones, mark@smallbiz.net, SmallBiz LLC, Basic plan. Medium priority. Resolved: refund issued, REF-12345. Payment gateway duplicate charge bug. Fixed with idempotency key. CSAT 5/5. SLA met.',
    expectedOutput: {
      ticketId: 'BIL-789',
      subject: 'Double charged $49.99 in February',
      category: 'billing',
      priority: 'medium',
      status: 'resolved',
      createdAt: 'February 2024',
      customer: { name: 'Mark Jones', email: 'mark@smallbiz.net', accountId: 'SmallBiz LLC', tier: 'basic' },
      problemDescription: 'Customer was double charged $49.99 in February billing cycle',
      rootCause: 'Payment gateway duplicate charge bug',
      resolutionSteps: [
        { stepNumber: 1, action: 'Confirmed duplicate charge in billing system' },
        { stepNumber: 2, action: 'Issued refund REF-12345' },
        { stepNumber: 3, action: 'Fixed with idempotency key on payment gateway' }
      ],
      resolution: 'Refund issued (REF-12345), idempotency fix deployed',
      tags: ['billing', 'duplicate-charge', 'refund'],
      relatedTicketIds: [],
      customerSatisfactionScore: 5
    }
  },
  {
    id: 'fs-ticket-004',
    documentType: 'support_ticket',
    inputText: 'Security Ticket SEC-101. Unauthorized access detected. CRITICAL. From: Amy Chen, CISO, amy@finserv.com, FinServ Corp, Enterprise. Created March 10 2024. Suspicious login from unknown IP in Russia at 3AM. Account had weak password. No data exfiltrated (confirmed by audit). Password reset, MFA enforced, IP blocked. Resolved March 10. SLA: response 5min (met), resolution 2hr (met). CSAT 4/5. Tags: security, unauthorized-access.',
    expectedOutput: {
      ticketId: 'SEC-101',
      subject: 'Unauthorized access detected',
      category: 'security',
      priority: 'critical',
      status: 'resolved',
      createdAt: 'March 10 2024',
      resolvedAt: 'March 10 2024',
      customer: { name: 'Amy Chen', email: 'amy@finserv.com', accountId: 'FinServ Corp', tier: 'enterprise' },
      problemDescription: 'Suspicious login from unknown IP in Russia at 3AM, potential unauthorized access',
      rootCause: 'Account had weak password',
      resolutionSteps: [
        { stepNumber: 1, action: 'Investigated suspicious login activity' },
        { stepNumber: 2, action: 'Confirmed no data exfiltrated via audit' },
        { stepNumber: 3, action: 'Password reset forced' },
        { stepNumber: 4, action: 'MFA enforced on account' },
        { stepNumber: 5, action: 'Suspicious IP blocked' }
      ],
      resolution: 'No breach confirmed. Password reset, MFA enforced, IP blocked.',
      sla: { responseTimeSla: '5 minutes', resolutionTimeSla: '2 hours', slaBreached: false },
      tags: ['security', 'unauthorized-access'],
      relatedTicketIds: [],
      customerSatisfactionScore: 4
    }
  },
  {
    id: 'fs-ticket-005',
    documentType: 'support_ticket',
    inputText: 'Performance ticket PERF-456. Dashboard slow (20s load time). Medium priority. Customer: Bob Taylor, bob@retailco.com, RetailCo, Business plan. Created March 15. Cause: missing database index on orders table (5M rows). Index added, load time reduced to 2s. Resolved March 16. Tags: performance, database. SLA: response 2h met, resolution 24h met. CSAT 4/5.',
    expectedOutput: {
      ticketId: 'PERF-456',
      subject: 'Dashboard slow (20s load time)',
      category: 'performance',
      priority: 'medium',
      status: 'resolved',
      createdAt: 'March 15 2024',
      resolvedAt: 'March 16 2024',
      customer: { name: 'Bob Taylor', email: 'bob@retailco.com', accountId: 'RetailCo', tier: 'basic' },
      problemDescription: 'Dashboard loading very slowly, 20 second load times',
      rootCause: 'Missing database index on orders table with 5 million rows',
      resolutionSteps: [
        { stepNumber: 1, action: 'Diagnosed slow query performance' },
        { stepNumber: 2, action: 'Added missing index to orders table' },
        { stepNumber: 3, action: 'Verified load time reduced to 2 seconds' }
      ],
      resolution: 'Database index added, load time reduced from 20s to 2s',
      sla: { responseTimeSla: '2 hours', resolutionTimeSla: '24 hours', slaBreached: false },
      tags: ['performance', 'database'],
      relatedTicketIds: [],
      customerSatisfactionScore: 4
    }
  },
];
