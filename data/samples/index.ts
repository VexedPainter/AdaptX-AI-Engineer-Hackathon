/**
 * Synthetic Sample Data Generator
 * 
 * Generates 50+ messy, realistic sample documents for evaluation:
 * - 20 contracts (inconsistent formatting, partial info, typos)
 * - 15 chat logs (informal language, interruptions, missing timestamps)
 * - 15 support tickets (varied structure, mixed quality)
 * 
 * These are deliberately noisy to test real-world extraction quality.
 */

// ─── Contract Samples ───────────────────────────────────────────────────────

export const contractSamples: Array<{ content: string; source: string }> = [
  {
    source: 'contract_001_service_agreement.txt',
    content: `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into as of March 15, 2024, by and between:

Acme Corp, a Delaware corporation with offices at 456 Innovation Drive, Suite 200, San Jose, CA 95112 ("Provider")
AND
TechStart Inc., organized under the laws of California, at 789 Market Street, San Francisco, CA 94103 ("Client")

WHEREAS Client desires to engage Provider for software development services;

1. SCOPE OF WORK
Provider shall deliver a custom CRM platform including:
- User management module
- Sales pipeline dashboard
- Reporting & analytics engine
The project shall be completed in 3 phases over 6 months.

2. COMPENSATION
Total project fee: $245,000 USD, payable as follows:
- Phase 1 (Design): $65,000 due upon signing
- Phase 2 (Development): $120,000 due at milestone completion
- Phase 3 (Testing & Launch): $60,000 due upon final delivery
Late payments incur a 1.5% monthly penalty.

3. TERM
This agreement is effective from March 15 2024 through September 15, 2024. 
The agreement does NOT auto-renew.

4. CONFIDENTIALITY
Both parties agree to maintain strict confidentiality of all proprietary information shared during the engagement. This obligation survives for 3 years post-termination.

5. TERMINATION
Either party may terminate with 30 days written notice. Upon termination, Client pays for all work completed to date.

6. LIABILITY
Provider's total liability is capped at the total contract value ($245,000).

7. GOVERNING LAW
This Agreement shall be governed by the laws of the State of California.

8. DISPUTE RESOLUTION
Any disputes shall be resolved through binding arbitration in San Francisco, CA.

Signed by:
  Provider: Jane Chen, CEO of Acme Corp
  Client: Robert Kim, CTO of TechStart Inc.
  Date of execution: March 12, 2024`
  },
  {
    source: 'contract_002_nda_messy.txt',
    content: `NON DISCLOSURE AGREEEMENT  (NDA)

Date: Jan 5 2024

Between:
  GlobalTech Solutions LLC (the "Discloser") -- 123 Tech Park, Austin TX 78701
  contact: legal@globaltech-solutions.com, ph: (512) 555-0198

and

  InnoVate Labs -- a startup based out of Boulder, CO
  Contact person: Sarah Mitchell, sarah.m@innovatelabs.io

This NDA is effective upon signing and covers all proprietary info, trade secrets, biz plans, customer lists, and technical documentation shared between the parteis.

Term: This NDA remains in effect for 2 years from teh signing date.

Obligations:
- Neither party shall disclose confidential info to third parties without prior writen consent
- All materials must be returned within 15 days upon termination  
- exceptions include information already publically known or independently devloped

Remedies: The disclosing party is entitled to seek injunctive relief for any breach.

Governing law: State of Texas

NON-COMPETE: Receiving party agrees not to compete directly in the discloser's market for 12 months after termination.

Signed,
  John Patterson - VP Legal, GlobalTech Solutions
  Sarah Mitchell - Founder & CEO, InnoVate Labs
  execution date -- January 5th 2024`
  },
  {
    source: 'contract_003_lease.txt',
    content: `COMMERCIAL LEASE AGREEMENT

Landlord: Westfield Properties Group
  Address: 2100 Commercial Blvd, Floor 12, Chicago IL 60601
  Contact: property.mgmt@westfieldprop.com

Tenant: DataFlow Analytics, Inc.
  Represented by: Michael Torres, COO
  Email: m.torres@dataflow-analytics.com  phone (312) 555-0147

PREMISES: Suite 450, approximately 3,200 sq ft at 2100 Commercial Blvd.

LEASE TERM:
  - Start: July 1, 2024
  - End: June 30, 2027 (3 year lease)
  - Auto-renewal: Yes, for successive 1-year periods unless 90 days notice given

RENT:
  Monthly rent: $8,500.00/month
  Annual increase: 3% per year
  Security deposit: $17,000 (2 months rent)
  Late fee: $250 if rent is received after the 5th of the month

MAINTENANCE: Landlord responsible for structural repairs, HVAC, common areas
  Tenant responsible for interior maintenance, fixtures, utilities

INSURANCE: Tenant must maintain commercial general liability insurance 
  minimum $1,000,000 per occurrence

TERMINATION: Either party may terminate with 90 days written notice.
  Early termination by tenant incurs a penalty equal to 3 months rent.

GOVERNING LAW: State of Illinois

Executed on: June 15, 2024

___________________________
Westfield Properties Group
By: Amanda Richards, Property Manager

___________________________
DataFlow Analytics, Inc.
By: Michael Torres, COO`
  },
  {
    source: 'contract_004_consulting_informal.txt',
    content: `Consulting Engagement Letter

Hey team - here's the formal version of what we discussed on the call:

This letter confirms that Bright Minds Consulting (that's us) will provide strategic advisory services to PeakPerformance Gym Chain starting Feb 1st 2024.

What we'll do:
  * Market analysis for 3 new locations (Denver, Portland, Austin)
  * Competitive landscape assessment
  * Growth strategy recommendations  
  * Monthly advisory calls with leadership team

Payment: 
  Our fee is $15,000/month, billed at the end of each month
  Net 30 payment terms
  Late payments: 2% monthly
  
  Total estimated engagement: 6 months ($90,000 total)

The engagement auto-renews monthly after the initial 6 month period unless either side gives 30 days notice.

IP: Any deliverables we create belong to PeakPerformance once paid for.

Confidentiality: standard mutual NDA terms apply - we won't share your financials or strategy docs with anyone, period. 2 year survival clause.

Limitation of liability: our liability is limited to fees paid in the last 3 months.

Contact info:
  Bright Minds: Alex Rivera, Managing Partner, alex@brightmindsconsulting.com
  PeakPerformance: Dana Walsh, CEO, dana.walsh@peakperformancegym.com, (303)555-0234

Governing law: Colorado

Please sign below to confirm.

Signed: Alex Rivera, Feb 1 2024
Countersigned: Dana Walsh, Jan 30, 2024`
  },
  {
    source: 'contract_005_purchase_order.txt',
    content: `PURCHASE ORDER #PO-2024-3847

Date: April 22 2024

BUYER:
  Manufacturing Plus LLC
  567 Industrial Way, Detroit MI 48201
  Purchasing Agent: Kevin O'Brien
  kobrien@manufacturingplus.net
  (313) 555-0291

SELLER/VENDOR:
  SteelWorks International
  890 Commerce Drive, Pittsburgh PA 15222
  Sales Rep: Lisa Chang
  lchang@steelworks-intl.com

ITEMS ORDERED:
  1. Structural Steel Beams (Grade A992) - 500 units @ $180/unit = $90,000
  2. Steel Plates (1/2" thick) - 200 units @ $95/unit = $19,000
  3. Fastener Kit (industrial grade) - 50 kits @ $120/kit = $6,000
  4. Welding supplies assortment - 1 lot @ $3,500 = $3,500

  Subtotal: $118,500
  Shipping & Handling: $4,200
  Tax (6%): $7,110
  TOTAL: $129,810

PAYMENT TERMS:
  50% upon order confirmation ($64,905)
  50% upon delivery ($64,905)
  Net 45 from invoice date
  Late penalty: 1% monthly

DELIVERY:
  Expected by: June 1 2024
  Ship to: 567 Industrial Way, Detroit MI 48201

WARRANTY: All materials warranted against defects for 12 months from delivery.

GOVERNING LAW: Michigan

This PO is NOT subject to auto-renewal.

Authorized by: Kevin O'Brien, Purchasing Director
Date signed: April 22, 2024`
  },
  {
    source: 'contract_006_employment.txt',
    content: `EMPLOYMENT AGREEMENT

This agreement is between TechVista Solutions ("Employer"), 
1200 Innovation Pkwy, Seattle WA 98101
and
Priya Sharma ("Employee"), starting Date: May 1, 2024

Position: Senior Software Engineer
Reports to: VP of Engineering
Location: Seattle, WA (hybrid - 3 days in office)

COMPENSATION:
  Base salary: $165,000 annually, paid bi-weekly
  Signing bonus: $10,000 (clawback if employee leaves within 12 months)
  Stock options: 5,000 shares, 4-year vesting with 1-year cliff
  Annual bonus: up to 15% of base salary, performance-dependent

BENEFITS:
  - Health, dental, vision insurance (company pays 90%)
  - 401(k) with 4% match
  - 20 PTO days/year
  - $2,000 annual learning/development budget

TERM: At-will employment. No fixed end date.
The agreement does not auto-renew (it's at-will).

CONFIDENTIALITY: Employee agrees to maintain confidentiality of all proprietary 
information for 2 years post-employment.

NON-COMPETE: Employee agrees not to work for a direct competitor for 12 months 
after separation. Limited to the Seattle metro area.

IP ASSIGNMENT: All work product created during employment belongs to Employer.

TERMINATION:
  - Either party can terminate at will with 2 weeks notice
  - Severance: 4 weeks salary for involuntary termination without cause

GOVERNING LAW: Washington State

Signed:
  Employer: Mark Thompson, VP Engineering, TechVista Solutions
  Employee: Priya Sharma
  Date: April 25, 2024`
  },
  {
    source: 'contract_007_license_messy.txt',
    content: `Software License Agreement -- DRAFT v3 (FINAL)

Effective: 06/01/2024

LICENSOR: CloudScale Software Inc
  HQ: 3400 Cloud Way, Austin TX 78759
  Contact: licensing@cloudscale.io

LICENSEE: RetailMax Corporation 
  1800 Retail Plaza, Floor 8
  New York, NY 10001
  Attn: IT Procurement - James Wilson  jwilson@retailmax.com
  phone 212-555-0333

GRANT: Licensor grants Licensee a non-exclusive, non-transferable license to use 
the CloudScale Enterprise Platform ("Software") for internal business purposes.

LICENSED USERS: up to 500 seats

FEES:
  - Annual license fee: $120,000/year
  - Per-seat overage: $300/seat/year for seats above 500
  - Support & maintenance: included in license fee (24/7 priority support)
  - Payment: annually in advance, due within 30 days of invoice

TERM: 
  Initial term: 2 years (June 1 2024 - May 31 2026)
  Auto-renewal: YES for successive 1-year terms
  Cancellation requires 60 days notice before renewal date

WARRANTIES:
  - Software will perform materially as described in documentation
  - 99.9% uptime SLA for cloud-hosted components
  - Warranty period: duration of the license

LIABILITY: 
  Licensor liability capped at fees paid in preceding 12 months

GOVERNING LAW: State of Texas
DISPUTE RESOLUTION: Arbitration in Austin, TX

Confidential: YES - this agreement and its terms are confidential

Signed:
  CloudScale Software: Patricia Kim, VP Sales
  RetailMax Corp: James Wilson, Director of IT
  Execution date: May 28 2024`
  },
  {
    source: 'contract_008_partnership.txt',
    content: `PARTNERSHIP AGREEMENT

Between:
  GreenField Ventures (Partner A) - 400 Venture Lane, Palo Alto CA 94301
    Represented by: Dr. Emily Foster, Managing Partner
    efoster@greenfieldvc.com

  and

  UrbanGrow Technologies (Partner B) - 55 Startup Blvd, San Jose CA 95110
    Represented by: Carlos Mendez, CEO
    carlos@urbangrow.tech  (408) 555-0412

DATE: September 1, 2024

PURPOSE: Joint development and commercialization of IoT-based urban farming technology.

CONTRIBUTIONS:
  Partner A: $2,000,000 in funding + industry connections
  Partner B: Technology, IP, and operational expertise

PROFIT SHARING:
  Partner A: 40%
  Partner B: 60%

MANAGEMENT:
  Joint steering committee with equal representation
  Major decisions require unanimous consent
  Day-to-day operations managed by Partner B

TERM: 5 years from effective date, auto-renewal for 2-year terms.
  Either party can exit with 180 days notice.

INTELLECTUAL PROPERTY:
  New IP developed jointly is co-owned
  Pre-existing IP remains with original owner

CONFIDENTIALITY: All partnership information is strictly confidential. 
  Survival: 5 years after termination.

DISPUTE RESOLUTION: Mediation first, then arbitration in San Francisco.

GOVERNING LAW: California

Signed:
  Emily Foster, Managing Partner, GreenField Ventures
  Carlos Mendez, CEO, UrbanGrow Technologies
  Date: August 29, 2024`
  },
  {
    source: 'contract_009_saas_subscription.txt',
    content: `SaaS Subscription Agreement

Subscriber: MegaCorp International, 1 Corporate Dr, NYC 10005
  contact - j.anderson@megacorp.com
  
Provider: QuickBooks Cloud (a division of FinTech Solutions Ltd)
  support@quickbookscloud.io

effective date - March 1 2024

Plan: Enterprise Plus
  - Unlimited users
  - Advanced reporting
  - API access
  - Dedicated account manager

Pricing:
  $2,400/month ($28,800/yr)
  Billed annually in advance
  first invoice due upon contract signing

  if subscriber upgrades mid-term, prorated charges apply

Term:
  1 year initial, auto-renews annually
  30 days notice to cancel before renewal

Data:
  - All subscriber data remains property of subscriber
  - Provider will not access data except for troubleshooting (with permission)
  - Data export available in CSV/JSON at any time
  - Upon termination: data available for download for 30 days, then deleted

uptime SLA: 99.95%
  credits for downtime exceeding SLA

support: 24/7 email & chat, phone during business hours (9-6 ET)

liability cap: 12 months of fees paid

governing law: New York

sig:
  QuickBooks Cloud - Maria Santos, Account Executive
  MegaCorp - Jennifer Anderson, CFO
  signed march 1, 2024`
  },
  {
    source: 'contract_010_service_ugly.txt',
    content: `CONTRACT FOR CLEANING SERVICES

date: 2024-02-15

between SPARKLE CLEAN PROS, LLC ("Contractor")
 located at 890 Main Street, Suite B
 Denver, CO 80202
 owner: Miguel Reyes
 email sparkle.pros@gmail.com
 ph (720)555-0156

and

SUNRISE MEDICAL CENTER ("Client")
 4500 Health Way
 Denver CO 80204
 facilities mgr: Tom Baker  tbaker@sunrisemedical.org

scope:
 - daily cleaning of 25,000 sq ft medical facility
 - include waiting rooms, exam rooms, hallways, restrooms
 - biohazard waste handling per OSHA standards
 - deep cleaning every Saturday
 - window cleaning monthly

cost:
 monthly fee: $12,500
 no annual increase for first year
 2% increase years 2 and 3
 payment due by 10th of each month
 late fee $500 after 15th

term: 3 yrs starting March 1 2024 thru Feb 28 2027
 auto-renewal: no

insurance: contractor must carry $2M general liability + workers comp

termination: 60 days written notice, or immediate for cause

indemnification: contractor indemnifies client against claims arising from contractor's negligence

confidential: YES - medical facility - HIPAA compliance required

dispute: mediation then arbitration in Denver

governing law: Colorado

___
Miguel Reyes, Owner, Sparkle Clean Pros
Feb 15 2024

___
Tom Baker, Facilities Manager, Sunrise Medical Center
Feb 14 2024`
  },
  {
    source: 'contract_011_franchise.txt',
    content: `FRANCHISE AGREEMENT

Franchisor: BurgerNation Holdings, Inc.
  Corporate HQ: 7700 Franchise Blvd, Dallas TX 75201
  Contact: franchise.legal@burgernation.com

Franchisee: Smith Family Restaurants LLC
  Owner: David and Maria Smith
  Address: 1234 Oak Street, Nashville TN 37201
  Email: dsmith1234@gmail.com
  Phone: 615-555-0187

Grant: Franchisor grants Franchisee the right to operate one (1) BurgerNation restaurant at 456 Broadway, Nashville TN 37203.

Term: 10 years, effective January 1 2024
Auto-renewal: YES, for two successive 5-year terms if franchisee is in good standing

FEES:
  Initial franchise fee: $35,000 (one-time)
  Monthly royalty: 6% of gross revenue
  Marketing fund contribution: 2% of gross revenue
  Technology fee: $500/month

Estimated initial investment: $350,000 - $500,000 (including build-out, equipment, initial inventory)

TERRITORY: Exclusive within 3-mile radius of the restaurant location

Training: 4-week training program at corporate HQ (mandatory)

Standards: Franchisee must maintain BurgerNation brand standards including menu, decor, uniforms, and food quality specifications

Termination: Franchisor may terminate for material breach with 30 days cure period. Franchisee may terminate with 6 months notice and payment of remaining royalties for the balance of the term.

GOVERNING LAW: Texas

NON-COMPETE: Franchisee shall not operate a competing quick-service restaurant within 10 miles for 2 years after termination.

CONFIDENTIAL: All operational manuals, recipes, and business systems are strictly confidential.

Signed:
  BurgerNation Holdings: Robert Taylor, VP Franchise Development
  Smith Family Restaurants: David Smith, Managing Member
  Date: December 15, 2023`
  },
  {
    source: 'contract_012_vendor_supply.txt',
    content: `Vendor Supply Agreement

This is between FreshFoods Distributors (supplier) at 900 Warehouse Row Memphis TN 38103 and CafeChain Inc (buyer) 200 Restaurant Ave Chicago IL 60605.

Contact for supplier: ops@freshfoods-dist.com 
Contact for buyer: procurement@cafechain.com, Attn: Susan Park

Effective April 1 2024

Products: Fresh produce, dairy products, baked goods
Delivery: 3x per week (Mon/Wed/Fri) before 6am
Min order: $2,000 per delivery

Pricing:
  - Per published price list (updated quarterly)
  - Volume discount: 5% on orders exceeding $10,000/week
  - Payment: Net 30 from delivery date

Estimated annual value: $500,000

Quality: All products must meet FDA food safety standards. Supplier provides certificates of origin upon request.

Term: 2 years. Does not auto-renew.
Termination: 45 days notice by either party.

Force majeure: Neither party liable for failures due to natural disasters, pandemics, supply chain disruptions beyond their control.

Warranty: Supplier warrants all products are fresh, properly stored, and meet quality specs. Defective products replaced at no cost.

liability limited to cost of defective goods

governing law: Tennessee

Signed April 1, 2024
Susan Park, VP Procurement, CafeChain Inc
Robert Green, Sales Director, FreshFoods Distributors`
  },
  {
    source: 'contract_013_maintenance.txt',
    content: `IT MAINTENANCE & SUPPORT CONTRACT

Provider: ByteGuard IT Services
  321 Server Lane, Reston VA 20190
  Acct Manager: Amy Chen, achen@byteguard.net, 703-555-0234

Client: Regional Bank Corp
  1500 Finance Street, Richmond VA 23219
  IT Director: James Wright, jwright@regionalbankcorp.com

EFFECTIVE: July 1 2024 through June 30 2025

SCOPE OF SERVICES:
  a) 24/7 monitoring of all network infrastructure
  b) Monthly security patching & updates  
  c) Quarterly vulnerability assessments
  d) Incident response (SLA: critical - 1hr, high - 4hr, medium - 8hr, low - 24hr)
  e) Annual disaster recovery testing
  f) On-site support: up to 40 hours/month included

FEES:
  Monthly retainer: $18,000
  On-site hours over 40/month: $200/hour
  Emergency after-hours callout: $350/hour
  Total annual value: $216,000

Payment: Net 15 from invoice date
Late fee: 1.5% monthly

AUTO-RENEWAL: Yes, for 1-year terms, 90 days notice to cancel

CONFIDENTIALITY: Extremely high - banking data, customer PII, financial records. Provider staff must pass background checks. NDA survives 5 years post-termination.

COMPLIANCE: Provider must comply with SOX, PCI-DSS, and applicable banking regulations.

LIABILITY: Limited to 12 months of fees paid.

INDEMNIFICATION: Provider indemnifies Client against data breaches caused by Provider's negligence.

GOVERNING LAW: Commonwealth of Virginia

DISPUTE: Arbitration in Richmond, VA

Signed:
  ByteGuard IT Services: Amy Chen, Account Manager (July 1, 2024)
  Regional Bank Corp: James Wright, IT Director (June 28, 2024)`
  },
  {
    source: 'contract_014_marketing.txt',
    content: `MARKETING SERVICES AGREEMENT

Agency: Pixel Perfect Marketing  
  creative@pixelperfectmktg.com
  88 Ad Avenue, Suite 300, Miami FL 33101

Client: SunCoast Resorts & Hotels
  marketing@suncoasthotels.com  
  5000 Beach Blvd, Miami Beach FL 33139
  Mktg Director: Isabella Torres, 305-555-0278

Date: Feb 1 2024

Services:
  - Social media management (Instagram, Facebook, TikTok, LinkedIn)
  - Content creation: 20 posts/week across all platforms
  - Monthly email newsletter campaigns
  - Quarterly brand photoshoots
  - SEO & SEM management
  - Monthly analytics reports

Compensation:
  Base retainer: $22,000/month
  Ad spend management fee: 15% of total ad spend
  Photoshoot days: $3,500/day (up to 4/year included)
  Total estimated annual: $300,000 (excl ad spend)

Payment: Net 30
Late: 2%/month

Term: 1 year starting Feb 1 2024 - Jan 31 2025
Auto-renew: YES for 6 month periods
Cancel: 60 days before renewal

IP: All creative assets belong to Client once paid
  Agency retains right to use work in portfolio

Confidentiality: yes - guest data, revenue figures, strategy docs

Non-compete: Agency won't take on competing hotel chains in Miami-Dade County during contract + 6 months

Liability: capped at 3 months fees

Governing: Florida law
Disputes: mediation in Miami

Signatures:
  Creative Director: Jordan Blake, Pixel Perfect Marketing
  Isabella Torres, Marketing Director, SunCoast Resorts
  Both signed January 28 2024`
  },
  {
    source: 'contract_015_research.txt',
    content: `Joint Research Collaboration Agreement

Party 1: University of Pacific Northwest, Dept of Computer Science
  Prof. Katherine Lee, Principal Investigator
  klee@upnw.edu
  
Party 2: NeuralNet Dynamics, Inc.
  300 AI Blvd, Seattle WA 98109
  Dr. Raj Patel, CTO
  raj@neuralnetdynamics.com, (206) 555-0199

Project: "Advanced Natural Language Understanding for Medical Records"
Funding: $750,000 total
  University contribution: $250,000 (in-kind: lab space, student researchers)
  NeuralNet contribution: $500,000 (cash + compute resources)

Duration: 2 years, September 1 2024 to August 31 2026
Not subject to auto-renewal.

Deliverables:
  - Quarterly progress reports
  - Joint publications (min 2 peer-reviewed papers)
  - Working prototype by month 18
  - Final report and code repository

IP:
  Joint IP: new discoveries made during collaboration
  Background IP: remains with originating party
  Licensing: NeuralNet gets first right to commercialize, with royalty sharing (60% NeuralNet, 40% University)

Confidentiality: 
  Research data is confidential until publication
  Patient data (anonymized) handled per HIPAA
  Survival: 3 years post-termination

Publication:
  Both parties must approve publications before submission
  30-day review period

Termination:
  For cause: 30 days notice
  Without cause: 90 days notice
  Funding obligations prorated upon early termination

Governing law: Washington State

Signed:
  Prof. Katherine Lee, UPNW (Aug 25, 2024)
  Dr. Raj Patel, NeuralNet Dynamics (Aug 20, 2024)`
  },
  {
    source: 'contract_016_staffing.txt',
    content: `TEMPORARY STAFFING AGREEMENT

Staffing Agency: FlexWork Solutions, Inc. 
  2200 Employment Way, Dallas TX 75201
  Contact: placements@flexworksolutions.com

Client Company: LogiTrans Shipping Co.
  800 Logistics Lane, Fort Worth TX 76102
  HR Manager: Patricia Davis, pdavis@logitrans.com

Effective immediately upon signing - May 15 2024

FlexWork will provide temporary warehouse and logistics workers to LogiTrans as needed.

RATES:
  Warehouse associates: $28/hr (billed to client)
  Forklift operators: $35/hr
  Shift supervisors: $45/hr
  Overtime: 1.5x standard rate
  Holiday: 2x standard rate

MARKUP: Client rates include FlexWork's margin (approximately 35% over worker pay)

TERMS:
  Minimum booking: 4 hours
  24-hour cancellation policy (no charge)
  Less than 24 hours: 50% of booked hours billed

  Payment: Net 15 from weekly invoice
  Late payment: 1.5% monthly

TEMP-TO-HIRE:
  Client may hire temp workers permanently after 520 hours worked
  Conversion fee: 15% of annual salary (waived after 520 hrs)

INSURANCE: FlexWork carries workers compensation and $5M liability insurance

TERM: 1 year, auto-renews for 1 year periods
  Cancel with 30 days notice

NON-SOLICITATION: Client shall not directly recruit FlexWork workers during placement + 6 months after

governing law -- texas

signed May 15 2024
FlexWork Solutions: Diane Martinez, VP Operations
LogiTrans: Patricia Davis, HR Manager`
  },
  {
    source: 'contract_017_construction.txt',
    content: `CONSTRUCTION CONTRACT

Owner: Riverside Development Co.  
  3000 Developer Way, Phoenix AZ 85001
  Project Manager: Steve Wilson, swilson@riversidedev.com

General Contractor: BuildRight Construction LLC
  1100 Hammer Ave, Tempe AZ 85281
  Jake Morrison, President
  jake@buildright-az.com  phone (480) 555-0345

PROJECT: Riverside Mixed-Use Complex - Phase 2
  Location: 5th Avenue & Main Street, Scottsdale AZ
  Scope: 4-story commercial/residential building, 60,000 sq ft

CONTRACT VALUE: $8,750,000

PAYMENT SCHEDULE:
  10% deposit upon signing: $875,000
  Monthly progress payments based on % completion
  10% retention held until final inspection
  Final payment within 30 days of certificate of completion

TIMELINE:
  Start: April 1, 2024
  Substantial completion: March 31, 2025
  Final completion: April 30, 2025
  Liquidated damages for delay: $5,000/day

WARRANTY: 2 years on workmanship, manufacturer warranties on materials

INSURANCE: Contractor maintains builders risk, GL ($5M), workers comp

CHANGE ORDERS: Written approval required. Costs documented before work begins.

DISPUTE RESOLUTION: Mediation, then binding arbitration in Maricopa County

TERMINATION: Owner may terminate for convenience with payment for work completed + 5% of remaining contract value

force majeure: standard clause - weather, natural disasters, supply chain issues

This contract does not auto-renew.

governing law: Arizona

Confidential: yes

Signed:
  Steve Wilson, PM, Riverside Development - March 25, 2024
  Jake Morrison, President, BuildRight Construction - March 25, 2024`
  },
  {
    source: 'contract_018_data_processing.txt',
    content: `DATA PROCESSING AGREEMENT (DPA)

Controller: HealthFirst Insurance Group
  500 Insurance Plaza, Hartford CT 06103
  DPO: Laura Kim, dpo@healthfirst-insurance.com

Processor: CloudStore Data Services, Inc.
  222 Cloud Ct, Ashburn VA 20147
  Privacy team: privacy@cloudstoredata.com

effective date: 2024-08-01

Purpose: Processor will store and process policyholder records, claims data, and medical information on behalf of Controller.

Data Categories:
  - Personal identifiers (name, DOB, SSN, address)
  - Health records (diagnoses, treatments, prescriptions)
  - Financial data (premium payments, claims amounts)
  - Communication records

Processing Activities:
  - Secure storage in SOC 2 Type II certified data centers
  - Backup and disaster recovery
  - Data analytics (aggregated, de-identified only)
  - Query processing for claims adjudication

Sub-processors: Processor must obtain Controller's written consent before engaging sub-processors. Current approved: AWS (hosting), Snowflake (analytics).

Security Measures:
  - AES-256 encryption at rest
  - TLS 1.3 for data in transit
  - Multi-factor authentication for all access
  - Annual penetration testing
  - SOC 2 Type II audit reports provided annually

Data Breach Notification: Processor must notify Controller within 24 hours of discovering a breach.

Data Retention: Per Controller's retention schedule. Default: 7 years post-policy termination.

Data Deletion: Upon termination, Processor deletes all Controller data within 90 days, provides written certification.

TERM: 3 years, auto-renews for 1-year terms
  90 days notice to terminate

Total annual value: $360,000

Liability: Processor liable for data breaches caused by its negligence, capped at $5,000,000

COMPLIANCE: HIPAA, state insurance regulations, SOC 2

GOVERNING LAW: Connecticut

Signed Aug 1 2024
HealthFirst: Laura Kim, Data Protection Officer
CloudStore: Nathan Brooks, VP Enterprise, nbrooks@cloudstoredata.com`
  },
  {
    source: 'contract_019_subscription_messy.txt',
    content: `subscription agreement -- analytics pro

provider:  analytix.io  (Analytix Software Corp, 99 Data Drive, SFO CA 94105)
subscriber:  Midwest Manufacturing Group
  contact: ops-team@midwestmfg.com

start date 2024-03-15

plan: Professional
  10 user seats
  50GB storage
  API access (10k calls/day)
  Priority email support

cost:
  $599/month per the annual plan = $7,188/yr
  paid upfront annually
  no refunds for early cancellation

additional users: $49/seat/month
storage overage: $0.50/GB/month over 50GB

auto-renew YES on annual basis
  cancel 30 days before renewal

uptime guarantee: 99.5%
  credits issued for downtime (10% of monthly for each hour below SLA, max 30%)

data ownership: subscriber owns their data
data portability: export in CSV, JSON, or via API

support hours: M-F 9am-6pm Pacific
response time: within 4 business hours

limitation of liability: 12 months of fees

confidential: subscriber data and usage patterns are confidential

governing law: California

signed 3/15/2024 by:
  analytix: sam nguyen, account exec
  midwest mfg: karen whitfield, operations director`
  },
  {
    source: 'contract_020_event_services.txt',
    content: `EVENT SERVICES CONTRACT

Client: TechConnect Conference 2024
  Organizer: EventPro Management, LLC
  1500 Event Center Dr, Las Vegas NV 89101
  coordinator@eventpromgmt.com
  Rachel Green, Event Director, (702) 555-0298

Venue & Services Provider: Grand Convention Center
  2000 Convention Way, Las Vegas NV 89109
  events@grandconvention.com

EVENT DETAILS:
  Name: TechConnect 2024 Annual Conference
  Dates: October 15-17, 2024 (3 days)
  Expected attendance: 2,500
  
SPACES BOOKED:
  - Main Ballroom (day 1-3): keynotes, capacity 3,000
  - 6 breakout rooms (day 1-3): workshops, cap 200 each
  - Exhibition Hall (day 1-3): vendor booths, 50,000 sq ft
  - VIP lounge access (all days)

SERVICES INCLUDED:
  - AV equipment (projectors, screens, sound systems, lighting)
  - WiFi (dedicated 1Gbps line for event)
  - Catering: breakfast, lunch, 2 coffee breaks daily for 2,500 pax
  - Security: 20 guards for all event hours
  - Parking: 500 spaces

PRICING:
  Venue rental: $85,000
  AV package: $25,000
  Catering ($95/person/day x 2500 x 3): $712,500
  Security: $15,000
  WiFi: $5,000
  Miscellaneous: $7,500
  
  GRAND TOTAL: $850,000

PAYMENT:
  25% deposit upon signing: $212,500
  25% by Sept 1, 2024: $212,500
  50% balance 7 days before event (Oct 8): $425,000
  Late payments: $2,500/day
  
CANCELLATION:
  >90 days: 25% of total (deposit forfeited)
  60-90 days: 50% of total
  <60 days: 100% of total (no refund)

INSURANCE: Client must carry event liability insurance ($5M minimum)

Force majeure: If event cannot be held due to acts of God, pandemic, government order - parties negotiate in good faith for rebooking or refund minus costs incurred.

no auto-renewal (single event)

GOVERNING LAW: Nevada

Signed:
  Rachel Green, Event Director, EventPro Management (July 10, 2024)
  Marcus Johnson, Sales Director, Grand Convention Center (July 10, 2024)`
  },
];

// ─── Chat Log Samples ───────────────────────────────────────────────────────

export const chatLogSamples: Array<{ content: string; source: string }> = [
  {
    source: 'chat_001_support_escalation.txt',
    content: `[Slack - #customer-support] 

[09:15 AM] Sarah (Support Agent): Hey team, I've got a customer on the line who's been having login issues for 3 days. Ticket #SUP-4521. Anyone seen this before?

[09:16 AM] Mike (Support Agent): Yeah we had a similar case last week. Was it after the password reset flow?

[09:17 AM] Sarah: Exactly! They reset their password on the mobile app and now can't log in on desktop

[09:18 AM] DevBot: 🔍 Related KB articles: "Password sync delay between mobile/desktop" (last updated 6 months ago)

[09:19 AM] Sarah: That KB article is outdated. The new auth service doesn't work the same way

[09:22 AM] Mike: I think this is related to the JWT token migration we did last month. The mobile app generates v2 tokens but desktop still validates v1

[09:23 AM] Sarah: That makes sense! Customer name is John Patterson, enterprise account. He's threatening to escalate to his account manager

[09:25 AM] Lisa (Manager): @Sarah go ahead and escalate to engineering. This is the 5th report this week. I'm making this P1

[09:26 AM] Sarah: Done. Created JIRA ENG-1234. @DevTeam please look at the JWT v1/v2 compatibility issue

[09:30 AM] Dave (Engineer): Looking at it now. I can see the issue in the auth logs. Should have a fix by EOD

[09:31 AM] Lisa: Great. @Sarah please let Mr. Patterson know we have engineering actively working on it. Offer him a 1-month credit on his account. 

[09:32 AM] Sarah: Will do. Thanks everyone!
[09:35 AM] Sarah: UPDATE: Mr. Patterson accepted the credit offer and is satisfied with the escalation timeline. Will follow up tomorrow AM.`
  },
  {
    source: 'chat_002_sales_discussion.txt',
    content: `Teams Chat - Sales Standup 03/12

[10:00] Jennifer (Sales Lead): Good morning team! Let's do our quick standup. Who wants to go first?

[10:01] Tom: I'll go. Had a great call with Meridian Corp yesterday. They're interested in our Enterprise plan - potentially 200 seats. They want a demo next Tuesday.

[10:02] Jennifer: Nice! What's their budget looking like?

[10:02] Tom: They mentioned $50k-75k annual range. I think we can get them to $65k with the right package

[10:03] Aisha: That's great Tom. I had a rough day yesterday tbh. Lost the Pinnacle deal - they went with a competitor. Price was the main objection.

[10:04] Jennifer: Sorry to hear that Aisha. Let's do a post-mortem on that deal. Can you send me the proposal and their feedback?

[10:04] Aisha: Already sent it. I think we need more flexible pricing tiers for mid-market companies

[10:05] Jennifer: Agreed - I'll bring that up with product team. @Aisha schedule a meeting with me this week to discuss

[10:06] Marcus: My update - Renewal for DataVault is confirmed. $120k annual, 3-year commitment!! 🎉

[10:07] Jennifer: Amazing Marcus!!! That's a huge win. Let's make sure we celebrate that

[10:07] Tom: Congrats Marcus!

[10:08] Jennifer: Alright team, action items:
- Tom: Prep Meridian demo for Tuesday
- Aisha: Post-mortem meeting with me, send proposal
- Marcus: Get DataVault paperwork finalized
- ALL: Update pipeline in CRM by EOD Friday

[10:09] Jennifer: Oh one more thing - Q1 target is $2.5M and we're at $1.8M with 3 weeks left. Let's push hard. Meeting adjourned!`
  },
  {
    source: 'chat_003_bug_triage.txt',
    content: `Discord - #bug-triage

[2:14 PM] Alex (QA): 🐛 New bug found in v2.4.1 release. The export function is generating corrupt CSV files when the dataset exceeds 10,000 rows. Reproducible on Chrome and Firefox.

[2:15 PM] Priya (Dev): Oh no, can you share the error log?

[2:16 PM] Alex: ` + '```' + `
ERROR: Buffer overflow in csv_exporter.ts line 347
Stack: at CsvWriter.writeChunk() -> at StreamProcessor.flush()
Memory usage spiked to 2.1GB before crash
` + '```' + `

[2:17 PM] Alex: Also affects Safari. I've tested with 3 different datasets. Consistently fails at ~10,200 rows

[2:18 PM] Priya: I see it. The writeChunk function isn't releasing memory between batches. This is a regression from the streaming refactor in PR #892

[2:19 PM] Kevin (Tech Lead): This needs to be hot-patched ASAP. It's blocking 3 enterprise customers from their month-end reports

[2:20 PM] Kevin: @Priya can you have a fix ready for review by 4 PM today?

[2:21 PM] Priya: Yes, I already know the fix. Need to add proper buffer flushing between chunks. Should be a 20-line change

[2:22 PM] Alex: I'll prep the regression tests. Should we also add a memory usage test?

[2:23 PM] Kevin: Yes absolutely. Decision: we'll do a hotfix release v2.4.2 tonight after the fix is verified. @Alex please also test with datasets up to 100K rows to make sure we have headroom

[2:25 PM] Priya: PR is up: #901. Ready for review

[2:30 PM] Kevin: LGTM, merging. @Alex please verify on staging

[2:45 PM] Alex: ✅ Verified on staging. Export works correctly up to 150K rows. Memory stays under 500MB. Ship it!

[2:46 PM] Kevin: Deploying v2.4.2 now. Follow up: I want a post-incident review this Friday to discuss how this regression slipped through. `
  },
  {
    source: 'chat_004_product_planning.txt',
    content: `Slack - #product-planning

[11:00 AM] Nina (Product Manager): Hi everyone! Q2 planning kickoff. Let's align on priorities. I've shared the roadmap doc in the channel.

[11:02 AM] Dev1 (Ryan): I looked at the doc. The AI summarization feature seems ambitious for one quarter. Are we sure about the timeline?

[11:03 AM] Nina: Good question. We've already done the spike - the model integration is mostly done. Remaining work is UI and testing. @Ryan what's your estimate?

[11:05 AM] Ryan: If we keep scope to just document summarization (not meeting notes like originally proposed), probably 6-8 weeks with 2 devs

[11:06 AM] Designer (Yuki): I have the mocks ready. Want me to share?

[11:06 AM] Nina: Yes please!

[11:07 AM] Yuki: [shared: ai-summary-mockups-v3.fig]

[11:08 AM] Nina: These look great Yuki. Love the progressive disclosure approach

[11:10 AM] Ryan: Looks clean. One concern - the streaming response UI might be tricky to get right. @Yuki did you consider a loading state?

[11:11 AM] Yuki: Yes, screen 4 in the file shows the skeleton loader + streaming text animation

[11:12 AM] PM2 (Chris): Can we also discuss the API rate limiting feature? We've had 3 customer complaints about abuse this month

[11:13 AM] Nina: Absolutely. That's priority 2. @Chris can you write up the requirements by Wednesday?

[11:14 AM] Chris: Done, I'll have it in Confluence by Wed EOD

[11:15 AM] Nina: OK team, decisions made today:
1. AI summarization is a GO for Q2 - scoped to document summaries only
2. API rate limiting is priority 2 - Chris owns the requirements
3. Meeting notes AI feature pushed to Q3

[11:16 AM] Nina: Next planning session is next Monday 11 AM. Everyone please review the updated roadmap before then. Thanks!`
  },
  {
    source: 'chat_005_incident_response.txt',
    content: `PagerDuty Chat - INCIDENT-2024-0312

[03:12 AM] ALERT BOT: 🚨 CRITICAL - Production API response time > 5000ms. Affected services: user-auth, payment-gateway, order-service

[03:14 AM] OnCall-Sarah: Acknowledging. Checking dashboards now

[03:15 AM] OnCall-Sarah: Confirmed - p99 latency is at 8.2 seconds. Normal is ~200ms. CPU on primary DB cluster is at 97%

[03:16 AM] OnCall-Sarah: @incident-commander need escalation. This is affecting all checkout flows

[03:17 AM] IC-Marcus: Here. Declaring SEV-1 incident. Opening war room.

[03:18 AM] IC-Marcus: @DBA-team @platform-team need eyes on this immediately

[03:20 AM] DBA-Tom: Looking at the DB. There's a runaway query from the recommendations engine eating all CPU. Query ID: QRY-88721. It's doing a full table scan on the 500M row products table

[03:22 AM] DBA-Tom: This query was deployed with last night's release (v4.12.0). It's missing an index

[03:23 AM] IC-Marcus: Decision: roll back v4.12.0 to v4.11.9 immediately

[03:24 AM] Platform-Jake: Initiating rollback now. ETA 5 minutes

[03:29 AM] Platform-Jake: Rollback complete. Monitoring...

[03:31 AM] OnCall-Sarah: Latency dropping. p99 now at 450ms and falling. CPU at 45%

[03:33 AM] IC-Marcus: Good. Keeping SEV-1 status for now until we confirm full recovery

[03:40 AM] OnCall-Sarah: All metrics back to normal. p99 = 195ms. Error rate back to baseline

[03:41 AM] IC-Marcus: Downgrading to SEV-3. Incident resolved. Total customer impact: ~28 minutes

[03:42 AM] IC-Marcus: Action items:
1. @recommendations-team fix the missing index and re-deploy properly
2. @DBA-Tom set up query performance guard rails
3. Post-incident review Thursday 2pm
4. Customer comms team notify affected customers by 9am

[03:43 AM] IC-Marcus: Good work everyone. Closing the war room.`
  },
  {
    source: 'chat_006_customer_onboarding.txt',
    content: `Live Chat - Customer Onboarding Session

[14:00] Agent_Kim: Welcome to SmartFlow! I'm Kim, your onboarding specialist. How can I help you get started today?

[14:01] Customer_JessicaM: Hi Kim! We just purchased the Business plan. My team of 15 people needs to get set up. Where do we start?

[14:02] Agent_Kim: Great choice! Let me walk you through the setup. First, have you received your admin credentials via email?

[14:03] Customer_JessicaM: Yes got them this morning. Already logged in. But I'm confused about the workspace setup - should I create one workspace for the whole company or separate ones per department?

[14:04] Agent_Kim: For a team of 15, I'd recommend one workspace with separate channels per department. This keeps communication flowing while maintaining organization. Let me share a setup guide...

[14:05] Agent_Kim: [shared: quickstart-guide-business.pdf]

[14:06] Customer_JessicaM: Perfect. One more thing - can we integrate with our existing Jira and Slack? We use those heavily

[14:07] Agent_Kim: Absolutely! Both integrations are available on the Business plan. Go to Settings > Integrations. The Jira setup takes about 5 minutes, Slack is even faster with OAuth.

[14:08] Customer_JessicaM: awesome thanks. And what about data migration? We're coming from Asana and have about 2 years of project data

[14:09] Agent_Kim: We have an Asana import tool! You can find it under Settings > Import Data > From Asana. It'll bring over projects, tasks, assignments, and comments. Usually takes 30-60 mins for 2 years of data.

[14:10] Agent_Kim: One heads up - custom fields from Asana may need manual mapping. I'd recommend doing the import into a test workspace first.

[14:12] Customer_JessicaM: Great advice. Last question - our IT team wants to know about SSO. We use Okta.

[14:13] Agent_Kim: Okta SSO is fully supported! Your IT admin can set it up via SAML 2.0. Here's the SSO config guide: [link]. If they hit any issues, they can contact our security team directly at sso-support@smartflow.io

[14:14] Customer_JessicaM: This has been super helpful Kim. I think we're good to get started! 

[14:15] Agent_Kim: Wonderful! I'm scheduling a 30-min check-in call for next Wednesday at 2 PM to make sure everything's running smoothly. You'll get a calendar invite shortly. Don't hesitate to reach out before then if you need anything!

[14:16] Customer_JessicaM: Sounds good, thanks Kim!`
  },
  {
    source: 'chat_007_design_review.txt',
    content: `slack #design-review 2024-04-03

elena (design lead) 9:30am: morning team. posting the homepage redesign for review. we need to finalize by friday for the spring launch

elena: [shared homepage_v5_final_FINAL.fig]

tyler (frontend) 9:32: oh wow this is different from v4. you moved the hero section below the nav?

elena 9:33: yes, user testing showed 67% of users scrolled past the old hero without engaging. the new layout puts the value prop front and center

mark (product) 9:35: i like the direction but im worried about the CTA placement. its below the fold on mobile

elena: good catch. @tyler can you check the responsive breakpoints? we might need a sticky CTA on mobile

tyler 9:37: yeah i can prototype that today. also the font size on the testimonials section looks tiny - 12px?

elena: should be 14px, i'll fix in figma

maya (marketing) 9:40: love the new hero copy. one thing tho - can we A/B test the two headline options? "Transform your workflow" vs "Work smarter, not harder"

mark 9:41: +1 on A/B testing. lets run it for 2 weeks after launch

elena 9:43: agreed. decisions:
1. keep new hero layout
2. add sticky CTA on mobile (tyler)
3. fix testimonial font to 14px
4. a/b test headlines post-launch (maya to set up)
5. elena updates figma by thursday

elena: anything else? if not, lets reconvene friday morning for final sign-off

tyler: lgtm
mark: 👍
maya: all good`
  },
  {
    source: 'chat_008_hiring.txt',
    content: `Teams - Hiring Committee Discussion

[2:00 PM] HR_Sandra: Hi team, we need to make a decision on the Senior Backend Engineer candidates. We interviewed 4 this week.

[2:01 PM] TechLead_Dan: I'll share my rankings:
1. Candidate A (Maria Chen) - Excellent system design, strong Go experience, great cultural fit. 9/10
2. Candidate C (James Lee) - Strong algorithms, good AWS knowledge, but communication could be better. 7/10
3. Candidate B (Alex Kumar) - Good potential but seems more mid-level. 6/10
4. Candidate D (Sophie Martin) - Doesn't meet the distributed systems requirement. 4/10

[2:03 PM] EM_Rachel: I agree with Dan's ranking. Maria was outstanding in the system design round. She designed a event-driven architecture for our scale in real-time. Really impressed.

[2:04 PM] HR_Sandra: What about compensation expectations? Maria asked for $195K base + equity

[2:05 PM] TechLead_Dan: That's at the top of our range but I think she's worth it. She'd be productive from day 1

[2:06 PM] EM_Rachel: Agreed. She has 8 years experience and currently at FAANG. We need to be competitive

[2:07 PM] HR_Sandra: Budget approved up to $200K for this role. Decision?

[2:08 PM] EM_Rachel: Let's extend offer to Maria Chen. $195K base, standard equity package, $15K signing bonus

[2:09 PM] TechLead_Dan: +1. Also recommend we keep James Lee warm as backup in case Maria declines

[2:10 PM] HR_Sandra: Decided. I'll prepare the offer letter today and send by tomorrow morning. @EM_Rachel can you do the verbal offer call?

[2:11 PM] EM_Rachel: Yes, I'll call Maria tomorrow at 10 AM

[2:12 PM] HR_Sandra: Great. Follow up needed: reject candidates B and D with standard feedback emails. Keep C (James) in pipeline - ask him to wait 1 week.`
  },
  {
    source: 'chat_009_deployment_chaos.txt',
    content: `Slack #deployments

[16:45] deploy-bot: ⚠️ Deployment started: api-gateway v3.8.0 to production
[16:47] deploy-bot: ✅ Rolling update: 2/10 pods updated
[16:48] deploy-bot: ✅ Rolling update: 5/10 pods updated
[16:49] deploy-bot: ❌ Pod api-gateway-7f8b9 CrashLoopBackOff

[16:50] ops-nina: uhh that doesnt look good. @dev-team anyone know about v3.8.0 changes?

[16:51] dev-raj: let me check... it was my PR. Added new middleware for request tracing

[16:52] ops-nina: the error logs show "Cannot find module '@opentelemetry/api-logs'" 

[16:53] dev-raj: oh no, i think i forgot to add it to the production dependencies. its in devDependencies 😱

[16:54] ops-nina: ok rolling back to v3.7.2 NOW. 5 pods are on the broken version

[16:55] deploy-bot: 🔄 Rollback initiated: api-gateway v3.7.2
[16:57] deploy-bot: ✅ Rollback complete. All pods healthy.

[16:58] ops-nina: crisis averted. @dev-raj please fix the package.json and get a proper review before redeploying

[16:59] dev-raj: on it. sorry about that. moving the dep now and adding a CI check for this

[17:00] ops-nina: @team-lead-pat FYI - failed deployment. total downtime: approximately 0 (caught during rolling update, healthy pods handled traffic). but we need that CI check.

[17:02] team-lead-pat: thanks for the quick response nina. @dev-raj lets add a pre-deploy validation step. action item: add dependency audit to CI pipeline by friday

[17:03] dev-raj: will do. again, really sorry

[17:04] ops-nina: no harm done this time. the rollback strategy worked exactly as designed 👍`
  },
  {
    source: 'chat_010_budget_planning.txt',
    content: `teams chat -- Q3 Budget Planning

[10:00] CFO-Linda: morning everyone. lets finalize the Q3 engineering budget. current ask is $1.2M, we need to get to $1M

[10:01] VP-Eng-Mark: that's going to be tough Linda. our biggest line items are:
- Cloud infra: $420K
- Headcount (new hires): $350K 
- Tooling/licenses: $180K
- Contractor budget: $150K
- Training & conferences: $100K

[10:03] CFO-Linda: can we reduce cloud costs? I've heard we're over-provisioned

[10:04] DevOps-Sam: actually yes. I've been meaning to propose a right-sizing initiative. i estimate we can cut 25-30% of our AWS spend by eliminating unused resources and moving to reserved instances. that's roughly $100-125K in savings

[10:05] CFO-Linda: that's exactly what i want to hear. @Sam can you have a detailed plan by next week?

[10:06] Sam: yep

[10:07] VP-Eng-Mark: for headcount, we absolutely need the 2 senior engineers. they're critical for the platform migration. but maybe we can push the junior hire to Q4?

[10:08] CFO-Linda: that works. saves about $45K in Q3. what about contractors?

[10:09] Mark: we can reduce contractor spend by $50K if we bring the UI work in-house. our new frontend dev can handle it

[10:10] CFO-Linda: good. so we're looking at:
- Cloud: $420K → $300K (-$120K)
- Headcount: $350K → $305K (-$45K)
- Tooling: $180K (no change - these are committed contracts)
- Contractors: $150K → $100K (-$50K)
- Training: $100K → $75K (-$25K)
TOTAL: $960K ✅ under the $1M target

[10:12] Mark: i can live with that. the training reduction hurts but we can supplement with free online resources

[10:13] CFO-Linda: great. decisions finalized. @Mark send me the updated budget spreadsheet by wednesday. @Sam cloud optimization plan by next monday. adjourned.`
  },
  {
    source: 'chat_011_customer_complaint.txt',
    content: `live chat transcript

[08:22] customer_mike_r: hi, i need to talk to someone about my order. this is ridiculous

[08:22] bot: Welcome to ShopFast support! I'll connect you with an agent shortly.

[08:23] agent_lisa: Hello Mike! I'm Lisa, how can I help you today?

[08:24] customer_mike_r: i ordered a laptop 2 weeks ago, order #SF-20240301-7823, and it still hasn't arrived. the tracking shows its stuck in Memphis since March 5th

[08:25] agent_lisa: I'm sorry about that, Mike. Let me look into your order right away.

[08:26] agent_lisa: I can see order #SF-20240301-7823 - Dell XPS 15, ordered Feb 28. You're right, the tracking shows it's been at the Memphis distribution center since March 5. That's definitely unusual.

[08:27] customer_mike_r: ive called fedex twice and they say to contact the shipper. ive been going back and forth for a week. im about to just request a refund

[08:28] agent_lisa: I completely understand your frustration. Let me take care of this for you. I'm going to:
1. File a lost package claim with FedEx on our end
2. Ship you a replacement unit immediately with expedited 2-day shipping at no extra cost

[08:29] customer_mike_r: ok that sounds good. will the replacement be the same config? i need the 32GB RAM version

[08:30] agent_lisa: Yes, I'll make sure it's the exact same configuration. I'll also apply a 15% discount to your next order as an apology for the inconvenience.

[08:31] customer_mike_r: alright lisa, i appreciate you actually doing something about it. the previous agent just told me to wait

[08:32] agent_lisa: I'm sorry about your previous experience. Your replacement will ship today and you should receive it by March 12. I'll send you the new tracking number via email within the hour.

[08:33] customer_mike_r: thanks lisa. that works for me

[08:34] agent_lisa: You're welcome, Mike! Is there anything else I can help with?

[08:34] customer_mike_r: no thats it. thanks

[08:35] agent_lisa: Great! I hope you enjoy the laptop. Have a wonderful day! [Session ended]`
  },
  {
    source: 'chat_012_sprint_retro.txt',
    content: `slack #sprint-retro -- Sprint 24 Retrospective

scrum-master-jo 3:00pm: alright team, sprint 24 is done. lets do our retro. 
format: 🟢 what went well, 🔴 what didnt, 💡 improvements

🟢 WHAT WENT WELL:
dev-amy 3:02: shipped the new dashboard on time! feels great
dev-carlos 3:03: pair programming sessions were super productive this sprint
qa-ben 3:03: zero critical bugs in production this sprint 🎉
dev-amy 3:04: also the new CI pipeline saved us probably 2hrs/day in build times

🔴 WHAT DIDN'T GO WELL:
qa-ben 3:06: too many last-minute scope additions. we accepted 3 stories mid-sprint that werent planned
dev-carlos 3:07: agreed. one of those stories had unclear requirements and i spent 2 days going back and forth with product
dev-amy 3:08: standup meetings are running too long. sometimes 25-30 min instead of 15
scrum-master-jo 3:09: noted. all valid points

💡 IMPROVEMENTS:
dev-carlos 3:11: can we have a hard rule - no new stories after day 2 of sprint?
qa-ben 3:12: +1 and maybe a requirement that all stories need acceptance criteria BEFORE sprint planning
dev-amy 3:13: for standups - what if we do async standups on slack monday/wednesday and only meet in person tuesday/thursday?
scrum-master-jo 3:14: i like all three ideas

scrum-master-jo 3:15: ok decisions:
1. no new stories after sprint day 2 (emergency exceptions need PO + SM approval)
2. mandatory acceptance criteria on all stories before planning
3. trial async standups M/W for next 2 sprints, evaluate

scrum-master-jo 3:16: velocity this sprint: 42 points (target was 40). good job team. sprint 25 starts monday. have a great weekend! 🏖️`
  },
  {
    source: 'chat_013_vendor_negotiation.txt',
    content: `email thread imported to teams chat

[From: procurement@acmecorp.com]
Subject: RE: Annual License Renewal - Enterprise Suite

Hi CloudVendor team,

We've been a loyal customer for 4 years, but I need to be honest - we've received a competitive offer from AlternativeCloud at 30% below your renewal quote of $480,000/year.

We'd like to stay with you, but we need:
1. At minimum a 20% discount on the renewal price
2. Extended payment terms (quarterly vs annual upfront)
3. Addition of the Advanced Analytics module at no extra cost

Please let us know by Friday.

Best regards,
Patricia Chen, VP Procurement, Acme Corp

---

[From: enterprise@cloudvendor.io]
RE: RE: Annual License Renewal

Hi Patricia,

Thank you for your transparency. We value our partnership with Acme Corp greatly. 

After internal discussion, here's what we can offer:
1. 15% discount = $408,000/year (down from $480K)
2. Quarterly billing: approved
3. Advanced Analytics module: included for the first year, then $24,000/year addon

Additionally, we'll assign a dedicated Customer Success Manager and provide priority support escalation.

This is our best offer and represents significant value. Would you like to schedule a call to discuss?

Best,
David Kim, Enterprise Account Director, CloudVendor

---

[teams chat follow-up]
[Patricia 2:30pm]: got CloudVendors counter-offer. see above. thoughts?

[CFO-James 2:35pm]: the 15% is decent but not the 20% we wanted. the analytics module inclusion for yr1 is good though

[Patricia 2:37pm]: i think we can push to 18%. their competition knows they cant afford to lose a 4-year customer

[CFO-James 2:38pm]: go for it. our walk-away number is $400K. anything above $420K, we seriously consider the alternative

[Patricia 2:40pm]: got it. ill counter at $394K (18% off) and settle for $408K. will update by EOD friday`
  },
  {
    source: 'chat_014_security_alert.txt',
    content: `Slack #security-ops

[11:45 PM] SIEM-Alert: 🔴 CRITICAL: Unusual authentication pattern detected
- Source IP: 185.220.101.xxx (TOR exit node)
- Target: admin panel (admin.ourapp.com)  
- Failed attempts: 47 in last 5 minutes
- Accounts targeted: admin@, root@, ceo@, it-admin@

[11:46 PM] SecOps-Night-Kate: Acknowledging. This looks like a brute force attack against the admin panel.

[11:47 PM] Kate: Immediate actions taken:
1. ✅ Blocked source IP at WAF level
2. ✅ Enabled additional rate limiting on admin login (max 3 attempts/min)
3. ✅ Checking if any accounts were compromised

[11:50 PM] Kate: No successful logins from the attacking IP. All targeted accounts have MFA enabled so the password attempts alone wouldn't have worked.

[11:52 PM] Kate: However, I'm seeing similar patterns from 2 other IPs in the last hour. Escalating to CISO.

[11:55 PM] CISO-Robert: Thanks Kate. Let's do the following:
1. Block the entire TOR exit node list at the WAF
2. Force password reset for all admin accounts
3. Review access logs for the past 72 hours
4. Enable geo-blocking - only allow admin access from US/Canada

[11:57 PM] Kate: All done except geo-blocking - need change approval for that

[11:58 PM] CISO-Robert: Approved. Emergency change CHNG-2024-0089. Implement now.

[12:01 AM] Kate: ✅ Geo-blocking enabled. Only US and Canada IPs can reach admin panel.

[12:03 AM] Kate: Incident summary:
- Type: Brute force / credential stuffing
- Impact: None (blocked before compromise)
- Duration: ~20 minutes of attack activity
- Accounts affected: 0 compromised
- Action items: pen test of admin panel next week, review of all service accounts

[12:04 AM] CISO-Robert: Good work Kate. I'll draft the incident report in the morning. Let me know if anything else comes up tonight.`
  },
  {
    source: 'chat_015_project_kickoff.txt',
    content: `Slack - #project-atlas

[Monday 9:00 AM] PM-Diana: 🚀 Project Atlas Kickoff! Welcome to the team everyone. This channel will be our home for the next 4 months.

[9:01] PM-Diana: Quick recap for anyone joining late: Project Atlas is a complete redesign of our data pipeline architecture. Goal: reduce processing latency from 45min to under 5min for real-time analytics.

[9:03] Eng-Wei: excited to work on this! quick question - are we replacing Kafka or building on top of it?

[9:04] Architect-Sam: we're keeping Kafka but replacing the batch processing layer with Apache Flink for stream processing. I'll share the architecture doc today

[9:05] PM-Diana: timeline overview:
- Sprint 1-2 (Apr 1-26): Architecture finalization + POC
- Sprint 3-5 (Apr 29 - Jun 7): Core implementation
- Sprint 6-7 (Jun 10 - Jul 5): Integration testing + migration
- Sprint 8 (Jul 8-19): Production rollout + monitoring

[9:07] Data-Eng-Maya: for the migration, are we doing big bang or gradual cutover?

[9:08] Architect-Sam: gradual. we'll run both pipelines in parallel for 2 weeks, comparing output. shadow mode basically

[9:09] PM-Diana: resource allocation:
- Sam: Architecture lead
- Wei + Maya: Core development
- Lisa: DevOps/Infrastructure  
- Raj: QA/Testing
- Me: PM + stakeholder management

[9:10] QA-Raj: do we have a testing strategy doc yet? stream processing testing is quite different from batch

[9:11] PM-Diana: not yet - that's your first deliverable Raj! testing strategy doc due end of sprint 1

[9:12] PM-Diana: action items from kickoff:
1. @Sam share architecture doc by Wednesday
2. @Raj testing strategy by Apr 12
3. @Lisa set up development environment by Apr 5
4. @ALL review architecture doc and add comments by Friday
5. First standup: Wednesday 9:30 AM

follow up required by end of week on environment setup

[9:13] PM-Diana: let's make this a success team! 💪`
  },
];

// ─── Support Ticket Samples ─────────────────────────────────────────────────

export const supportTicketSamples: Array<{ content: string; source: string }> = [
  {
    source: 'ticket_001_login_bug.txt',
    content: `Ticket #TK-2024-0891
Subject: Can't login after password change
Priority: HIGH
Status: Open
Created: 2024-03-10T14:23:00Z

Customer: Angela Martinez
Email: a.martinez@bigretail.com
Account: BigRetail Corp (Enterprise, Account #ENT-4521)

Description:
I changed my password yesterday using the "forgot password" link and now I can't log in at all. I've tried on Chrome, Firefox, and Safari. Each time I enter my new password it says "Invalid credentials" even though I JUST set it.

I've also tried:
- Clearing browser cache and cookies
- Using incognito/private mode
- Resetting password again (got the email, set a new one, still doesn't work)

This is blocking my entire team from accessing our Q1 reports which are due to our board on Friday. We have 45 users on our account and 3 others are experiencing the same issue.

Agent Notes (Sarah K):
- Verified customer identity via security questions
- Confirmed password reset emails were sent and received
- Checked auth logs: password hash IS being updated in the DB but the session service is serving a stale cache
- This appears related to the auth service migration from last week
- Escalated to Engineering team, JIRA: ENG-1234

Resolution Steps:
1. Cleared the auth cache for customer's account (2024-03-10 15:00)
2. Customer confirmed login successful (2024-03-10 15:05)
3. Identified root cause: Redis cache TTL for auth tokens set to 24h, should be 5min
4. Engineering deployed fix (2024-03-10 18:30)

Resolution: Fixed - auth cache TTL misconfiguration from v4.2.1 deployment
Resolved: 2024-03-10T18:30:00Z

Tags: login, authentication, cache, regression, enterprise
Related Tickets: TK-2024-0887, TK-2024-0893

Customer Satisfaction: 4/5 (satisfied with resolution speed, frustrated it happened)`
  },
  {
    source: 'ticket_002_billing_dispute.txt',
    content: `SUPPORT TICKET

ID: TK-2024-1102  
Created: March 15, 2024, 9:47 AM EST
Channel: Email
Priority: Medium
Status: Resolved

Customer Information:
  Name: David Chen
  Email: dchen@startupxyz.com
  Company: StartupXYZ  
  Plan: Growth ($99/month)
  Account ID: GRW-7891

Subject: Charged twice for March subscription

Message:
Hi support team,

I just noticed I was charged $99 twice on March 1st for my subscription. My credit card shows:
- Mar 1: SMARTPLATFORM *GROWTH $99.00
- Mar 1: SMARTPLATFORM *GROWTH $99.00

I should only be charged once. Please refund the duplicate charge.

My credit card ending in 4532.

Thanks,
David

---
Agent Response (Mike T, 2024-03-15 11:20 AM):

Hi David,

Thank you for reaching out. I've investigated your account and confirmed the duplicate charge. This was caused by a brief payment processing error on our end during our March billing cycle. 

I've initiated a refund of $99.00 to your card ending in 4532. Please allow 5-7 business days for the refund to appear on your statement.

Refund reference: REF-20240315-D7891

I apologize for the inconvenience.

---
Resolution: Refund processed for duplicate charge.
Root Cause: Payment gateway timeout caused retry that resulted in double charge. Fix deployed to payment service (idempotency key now enforced).

Tags: billing, duplicate-charge, refund, payment-gateway
Related: TK-2024-1098, TK-2024-1105 (same root cause)
SLA: Response within 2 hours (met), Resolution within 24 hours (met)
CSAT: 5/5`
  },
  {
    source: 'ticket_003_feature_request.txt',
    content: `Ticket: FEAT-2024-0234
Type: Feature Request  
Priority: Low
Status: Open (Under Review)
Created: 2024-03-20

Customer: Sarah O'Brien
  sobrien@designstudio.co
  DesignStudio Inc - Premium plan
  Account: PRM-2234

Subject: Dark mode for the dashboard

Hey team! Love the product, been using it for about 8 months now. 

One thing that would make a HUGE difference for our team: dark mode!! We work late nights often and the bright white dashboard is really harsh on the eyes. Several team members have mentioned this.

Specifically would love:
- System-preference detection (match OS dark/light mode)
- Manual toggle in settings
- Dark mode for ALL screens including reports and analytics
- Custom accent colors would be a bonus

I know this is a big ask but it would really improve our daily experience. Happy to beta test if you need volunteers!

Cheers,
Sarah

---
Agent Notes (Jennifer L):
- Feature request logged in product backlog
- Forwarded to Product team for Q3 consideration
- 47 other customers have requested this feature
- Currently on the product roadmap for Q3 2024

Response sent:
Hi Sarah! Thank you for the detailed feature request. Great news - dark mode is on our product roadmap for Q3 2024! I've added your feedback and specific requirements to the feature spec. We'd love to have you as a beta tester - I'll reach out when we're ready. In the meantime, you might find the browser extension "Dark Reader" helpful as a temporary workaround.

Status: Open - routed to Product Team
Tags: feature-request, dark-mode, ui, accessibility
No SLA applicable for feature requests
CSAT: not yet rated`
  },
  {
    source: 'ticket_004_data_loss_critical.txt',
    content: `URGENT - CRITICAL TICKET

Ticket ID: TK-2024-0567
Priority: CRITICAL
Status: Escalated → Resolved
Created: 2024-02-28T06:15:00Z
Resolved: 2024-02-28T14:30:00Z

Customer: Northwest Healthcare Systems
  IT Admin: Robert Williams, rwilliams@nwhealthcare.org
  Account: ENT-1001 (Enterprise Platinum)
  Tier: Enterprise

Subject: ENTIRE PROJECT DATA MISSING AFTER UPGRADE

URGENT DESCRIPTION:
After your system upgrade last night, our entire "Patient Portal 2.0" project is GONE. This project contained 18 months of work including:
- 340+ tasks
- 150 documents
- Complete sprint history
- All team assignments

There are 28 people on this project team who cannot work right now. This is a HIPAA-regulated healthcare project and we need this data recovered IMMEDIATELY.

I need an update within 30 minutes or I'm escalating to your CEO.

Resolution Timeline:
06:15 - Ticket created (auto-assigned P1)
06:18 - Agent Marcus acknowledged, began investigation
06:25 - Escalated to Engineering - Senior DB Admin pulled in
06:40 - Root cause identified: Database migration script had a bug that incorrectly archived projects with > 300 tasks
06:45 - Customer updated: data is NOT lost, it was moved to archive tables
07:30 - Recovery script written and tested on staging
08:00 - Data restoration initiated on production
09:15 - All project data restored successfully
09:20 - Customer verified - all 340 tasks, 150 docs present and correct
09:30 - Bug fix deployed to prevent recurrence
14:30 - Post-incident call with customer completed

Root Cause: Migration script v2.14.1 had incorrect WHERE clause that archived active projects exceeding 300 tasks.

Agent: Marcus Johnson (Primary), Engineering: DBA-Lisa Park

Resolution: Data fully restored from archive tables. Migration script patched (v2.14.2). Added safeguard: projects cannot be archived without explicit admin confirmation.

Tags: data-loss, critical, migration-bug, enterprise, healthcare, HIPAA
Related: Internal post-mortem DOC-2024-0089

SLA: 
  First response: 30 min (met at 3 min)
  Resolution: 4 hours for critical (met at 3h 15min)
  SLA Breached: No

CSAT: 3/5 (data recovered but unhappy it happened at all - understandably)`
  },
  {
    source: 'ticket_005_api_integration.txt',
    content: `Support Ticket TK-2024-0445

Submitted via: Developer Portal
Date: 2024-03-08
Priority: High
Status: Resolved

Customer: 
  Name: Wei Zhang  
  Email: wei@fintechpro.io
  Company: FinTechPro Solutions
  Plan: Enterprise
  Acct: ENT-3356

Subject: REST API returning 500 errors on batch endpoint

Description:
Our integration is failing when calling POST /api/v2/records/batch with more than 100 records. We get a 500 Internal Server Error with no useful error message in the response body. 

This worked fine until your v2.3 API update last Tuesday.

Request details:
- Endpoint: POST https://api.platform.io/v2/records/batch
- Auth: Bearer token (valid, works on other endpoints)
- Payload: JSON array with 150 records (each ~2KB)
- Response: 500 {"error": "Internal Server Error"} 
- Our API client version: 3.1.0

We process approximately 5000 records per day through this endpoint. This is blocking our production pipeline.

Steps already tried:
1. Reduced batch size to 50 - works ✅
2. 100 records - works ✅  
3. 101+ records - fails ❌
4. Different API keys - same result
5. Raw curl request - same result

Agent Notes (Tech Support - Raj S):
- Confirmed issue reproduction
- API logs show memory limit exceeded on batch processing pod
- v2.3 update changed the batch processing to load all records into memory before writing (regression from streaming approach in v2.2)
- Escalated to API team

Resolution:
- Engineering deployed hotfix (v2.3.1) restoring streaming batch processing
- New batch limit: 1000 records per request (documented in API changelog)
- Customer confirmed working with 500-record batches

Tags: api, batch-endpoint, regression, 500-error, enterprise
Related: TK-2024-0443, TK-2024-0449 (same API regression)

SLA Response: 4 hours (met - responded in 2h)
SLA Resolution: 24 hours for high (met - resolved in 8h)
SLA Breached: No

CSAT: 4/5`
  },
  {
    source: 'ticket_006_performance.txt',
    content: `ticket TK-2024-0712
created: march 12 2024
priority: medium
status: in progress

customer info
  james butler
  jbutler@acmefinance.com
  Acme Financial Services - enterprise plan
  account ENT-5567

subject: Dashboard loading extremely slow (30+ seconds)

message:
Our analytics dashboard has become unusably slow over the past week. Pages that used to load in 2-3 seconds now take 30+ seconds. Sometimes they time out completely.

This affects:
- Main dashboard
- Custom reports
- Data export page

We have about 2 million records in our account. Is there a data limit we're hitting?

Our team of 35 people relies on these dashboards for daily operations. Please advise.

---
agent response (Chris W, 3/12 2pm):

Hi James, thanks for the detailed report. I've done some initial investigation:

1. Your account data volume (2M records) is within our supported limits (up to 10M)
2. However, I noticed several custom report queries running unoptimized aggregations across your full dataset
3. Our performance team has identified a missing index on your account's data partition

Next steps:
- Adding the missing index (scheduled for tonight's maintenance window)
- Our solutions team will review your custom reports for optimization opportunities
- I'll check in with you tomorrow to confirm improvements

Expected resolution: within 48 hours

---
update 3/13:
- index added overnight
- dashboard load time improved from 30s to 8s
- still above target (<3s), further optimization needed

update 3/14:
- query optimizer applied to 3 custom reports
- load time now at 2.5s - within normal range
- customer confirmed resolution

tags: performance, slow-dashboard, database, indexing, enterprise
resolution: added missing database index + optimized custom report queries
sla: response in 4h (met), resolution in 48h (met)
csat: 4/5 -- "much better now, hope it stays this way"`
  },
  {
    source: 'ticket_007_mobile_crash.txt',
    content: `Zendesk Ticket #38291

Priority: High
Channel: In-App Feedback
Created: 2024-03-18T11:30:00Z
Status: Open → Resolved

Customer Details:
  Maria Gonzalez
  maria.g@retailchain.com
  RetailChain Inc (Business plan, Account BIZ-9012)

Subject: iOS app crashes when uploading photos

the app keeps crashing every time I try to upload product photos. I'm using iPhone 15 Pro with iOS 17.4. 

Steps to reproduce:
1. Open the app
2. Go to Products → Add New Product
3. Tap "Add Photo"
4. Select photo from camera roll
5. App immediately crashes back to home screen

I've tried:
- restarting phone
- reinstalling app (version 4.2.1)
- using different photos (same result with any photo)

This is urgent because we need to upload 200 new product photos for our spring catalog launch next week.

---
Support Agent: Alex T
Investigation:
- Crash logs show memory exception when processing HEIF images > 8MP
- iPhone 15 Pro default photo format is HEIF at 48MP
- App's image processing library doesn't handle HEIF properly
- Affects all iPhones using HEIF format (iPhone 8 and later)

Workaround provided:
- Change phone settings: Settings → Camera → Formats → "Most Compatible" (saves as JPEG)
- This allows uploads to work while we fix the HEIF handling

Permanent fix:
- Engineering ticket MOBILE-891 created
- Fix shipped in app version 4.2.2 (March 22 release)

Resolution: Workaround provided immediately, permanent fix in v4.2.2
Tags: mobile, ios, crash, image-upload, heif, camera
Related: Zendesk #38245 (similar report from Android user)

SLA:
  Response SLA: 4 hours - met (responded in 45 min)
  Resolution SLA: 48 hours for high - met (workaround in 2h, fix in 4 days)
  Breached: No

CSAT: 4/5`
  },
  {
    source: 'ticket_008_email_integration.txt',
    content: `Support Case SC-2024-3211

Customer: Tom Anderson
  tom.anderson@lawfirmllp.com
  Anderson & Associates LLP
  Plan: Professional
  Account: PRO-4455

Priority: High
Status: Waiting on Customer → Resolved
Created: 2024-04-02

Subject: Email integration stopped syncing 3 days ago

Hi, our Outlook email integration has been broken since Saturday. No new emails are being pulled into our case management system. We're a law firm and missing client communications is a serious issue for us.

Details:
- Integration was working fine for 6 months
- Last successful sync: March 30, 2024 at 11:47 PM
- We use Microsoft 365 Business
- No changes made on our end
- Error message in settings: "OAuth token expired - re-authentication required"

We rely on this integration for ALL client communications. There are potentially hundreds of emails we've missed.

---
Agent: Rebecca M (Apr 2, 10 AM)

Hi Tom,

I can see the issue. Your Microsoft 365 OAuth token expired on March 30th. This happens when Microsoft rotates their authentication tokens (typically every 90 days).

To fix this:
1. Go to Settings → Integrations → Microsoft 365
2. Click "Reconnect"
3. Sign in with your Microsoft admin account
4. Authorize the app permissions

Once reconnected, the system will perform a backfill of all emails since March 30th. This may take 1-2 hours depending on volume.

---
Customer reply (Apr 2, 11:30 AM):
Did the reconnection. Getting an error: "insufficient permissions - admin consent required"

---
Agent reply (Apr 2, 12:00 PM):
The "admin consent" error means your Microsoft 365 admin needs to approve the app permissions. Since you mentioned you're the firm administrator, try going to Azure Portal → Enterprise Applications → find our app → Grant admin consent.

If you're not the M365 admin, please ask whoever manages your Microsoft account to do this step.

---
Customer reply (Apr 2, 2:00 PM):
Got our IT guy to grant consent. Integration is reconnecting now... emails are flowing in! Looks like about 340 emails being backfilled.

---
Agent (Apr 2, 2:15 PM):
Excellent! The backfill is running. All emails from March 30 onward will be synced. To prevent this from happening again, I'd recommend:
1. Setting a calendar reminder to re-authenticate every 80 days
2. We're adding auto-renewal of OAuth tokens in our next release (May)

Resolution: OAuth token re-authentication + admin consent granted
Tags: integration, email, oauth, microsoft-365, token-expiry
Related: SC-2024-3198 (similar M365 auth issue)

SLA:
  Response: 2h (met - 13 min)
  Resolution: 24h (met - 4h)
  Breached: No

CSAT: 5/5 - "Rebecca was fantastic and very patient"

Internal Note: This is the 12th OAuth expiry ticket this quarter. Product team needs to implement automatic token refresh. Flagged in product meeting.`
  },
  {
    source: 'ticket_009_security_concern.txt',
    content: `TICKET: SEC-2024-0045

Classification: SECURITY
Priority: Critical → High
Status: Resolved

Reporter: Jennifer Park, CISO
  jpark@medicohealth.org
  MedicoHealth Systems
  Enterprise Platinum Account: ENT-1500

Created: 2024-03-25T08:00:00Z
Resolved: 2024-03-25T16:00:00Z

Subject: Potential unauthorized access - suspicious login activity

Description:
Our security monitoring detected unusual login activity on our account:

1. 2024-03-24 at 11:47 PM EST: Successful login from IP 203.45.xx.xx (Singapore)
   User: admin@medicohealth.org
   Our admin team is entirely US-based. Nobody travels to Singapore.

2. 2024-03-24 at 11:52 PM: Bulk data export initiated (5000 patient records)
   Export was interrupted at 2300 records before auto-timeout

3. 2024-03-25 at 12:01 AM: Same IP attempted to create a new admin user
   Failed - MFA challenge wasn't completed

We've already:
- Changed all admin passwords
- Revoked all active sessions
- Enabled geo-restriction (US only)

We need you to:
1. Confirm the exact data accessed during the breach window
2. Provide access logs for the past 30 days
3. Help us determine if any data was actually exfiltrated
4. Provide a report for our HIPAA breach assessment

Assigned Agent: Security Response Team Lead - Nathan Cole

Investigation Results:
- Access logs confirmed unauthorized session from Singapore IP
- The admin password was likely compromised via credential stuffing (password was reused from a 2023 data breach on another service - verified via Have I Been Pwned)
- Data export reached 2,300 records before the session timeout terminated it
- Export was to a temporary file on our servers - file was NOT downloaded externally
- No evidence of data exfiltration beyond our platform
- New admin user creation was blocked by MFA

Actions Taken:
1. Full access log export provided to customer (30 days)
2. Confirmed no data left our servers
3. Temporary export file securely deleted
4. IP address and associated ASN blocked
5. Implemented stricter session policies for enterprise accounts
6. HIPAA breach assessment report provided

Resolution: Security incident investigated. No data exfiltrated. Access secured.

Tags: security, unauthorized-access, credential-stuffing, HIPAA, enterprise, data-breach-investigation

SLA:
  Response: 15 min for critical security (met - 5 min)
  Resolution: 8 hours (met - 8 hours)
  Breached: No

CSAT: 4/5 (appreciated fast response, concerned it was possible in first place)

Post-Incident: Mandatory password rotation policy implemented for all enterprise accounts. Credential monitoring service activated.`
  },
  {
    source: 'ticket_010_onboarding.txt',
    content: `Ticket: TK-2024-1234
Subject: Need help setting up SSO with Okta
Priority: Medium
Status: Resolved
Created: April 5 2024

Customer:
  Rachel Torres
  rachel@globallogistics.com
  GlobalLogistics Inc
  Business plan, Account BIZ-8876

Description:
We just upgraded to the Business plan and I'm trying to set up SSO with Okta but I'm stuck. I followed the documentation but when I test the SAML connection I get:

"SAML Response validation failed: Invalid audience"

Our Okta setup:
- Okta tenant: globallogistics.okta.com
- SSO URL: https://globallogistics.okta.com/app/smartplatform/sso/saml
- Entity ID: http://www.okta.com/abc123xyz
- We're using SAML 2.0

I've double-checked the ACS URL and it matches what's in our settings.

Can someone help? We need this working before we onboard our 60 users next Monday.

---
Agent: Technical Support - Deepak R (Apr 5, 2:30 PM)

Hi Rachel,

The "Invalid audience" error typically means there's a mismatch between the Entity ID configured in Okta and what our platform expects.

Here's what needs to match exactly:

In our platform (Settings > SSO):
- Entity ID should be: https://app.smartplatform.io/saml/metadata

In Okta:
- Audience URI (SP Entity ID) should be: https://app.smartplatform.io/saml/metadata

Common mistakes:
1. HTTP vs HTTPS mismatch
2. Trailing slash difference
3. Using the Okta Entity ID instead of ours

Could you verify these values match?

---
Customer (Apr 5, 3:15 PM):
That was it!! I had the Okta entity ID in both fields instead of your platform's entity ID. SSO is working now.

One more question - how do we set up auto-provisioning (SCIM)?

---
Agent (Apr 5, 3:30 PM):
Great news! For SCIM provisioning:
1. In our platform: Settings > SSO > Enable SCIM
2. Copy the SCIM endpoint URL and Bearer token
3. In Okta: Add SCIM provisioning to the app
4. Enter the endpoint URL and token
5. Enable "Create Users" and "Deactivate Users"

Here's our SCIM setup guide: [link]

Let me know if you need help with that!

---
Customer (Apr 5, 4:00 PM):
Got SCIM working too. You guys are great. Thanks Deepak!

Resolution: SSO Entity ID mismatch corrected + SCIM provisioning configured
Tags: sso, okta, saml, scim, onboarding, enterprise
SLA: met (response 30min, resolution 1.5h)
CSAT: 5/5`
  },
  {
    source: 'ticket_011_data_export.txt',
    content: `ticket #TK-2024-0990
date: 2024-03-28
priority: medium → high (escalated)
status: resolved

customer: Kevin Park
  kpark@marketingagency.com
  MarketingAgency Pro - Business plan
  account BIZ-6678

subject: Data export fails for reports over 50MB

description:
When I try to export our monthly analytics report, the export starts but then fails with a generic "Export failed" error. This report is about 75MB in CSV format.

Smaller reports (under 50MB) export fine. But our main monthly report always fails.

I need this data for a client presentation on April 1st. Please help ASAP.

agent notes (support-anna):
- confirmed issue: export timeout set to 60 seconds, large exports take longer
- current workaround: break export into date ranges
- filed engineering ticket for async export feature

resolution steps:
1. helped customer break report into 4 weekly segments (each ~20MB)
2. provided instructions for manual concatenation of CSV files
3. escalated to engineering for proper fix: async export with email notification

engineering update (3/29):
- async export feature added to sprint backlog
- expected in next release (v5.1, mid-April)
- interim fix: increased export timeout to 300 seconds for enterprise accounts

customer follow-up:
- customer was able to complete presentation with segmented exports
- will switch to async export when available

tags: export, csv, performance, timeout, large-data
product: analytics-platform, component: data-export

sla info:
  response time sla: 4 hours
  resolution sla: 24 hours  
  sla breached: no
  actual response: 1 hour
  actual resolution: 6 hours (workaround provided)

related tickets: none
csat: 3/5 - "workaround was OK but the export should just work for any size"`
  },
  {
    source: 'ticket_012_permissions_bug.txt',
    content: `Support Ticket

ID: TK-2024-0833
Date: 2024-03-22
Priority: High
Status: Resolved

FROM: Lisa Chen, Team Lead
  lchen@techcorp.io
  TechCorp Solutions (Premium plan)
  Account: PRM-3344

SUBJECT: Team members can see confidential HR documents after latest update

DESCRIPTION:
After your update on March 20th, our regular team members can now see folders that should be restricted to HR and Management only. Specifically:

- "HR - Salary Reviews" folder is visible to ALL 40 users
- "Management - Strategic Plans" folder is visible to ALL 40 users
- These folders contain sensitive employee data

This is a serious privacy/security issue. We need this fixed immediately.

Permissions SHOULD be:
- HR folders: HR team (5 users) + CEO only
- Management folders: Management team (8 users) only
- Everything else: all 40 users

INVESTIGATION (Agent: Support-Marcus):
- Confirmed permission issue affecting customer's workspace
- Root cause: March 20 update (v4.5.0) included a change to the permission inheritance model
- Bug: new "workspace-level" permissions were overriding folder-level restrictions
- Scope: affects approximately 200 workspaces with custom folder permissions

RESOLUTION:
1. Emergency hotfix deployed (v4.5.1) - March 22, 4:30 PM
2. Customer's folder permissions restored to correct state
3. Verified: HR folders now only accessible to authorized 5+1 users
4. Verified: Management folders accessible to authorized 8 users only
5. Audit log provided showing no unauthorized downloads during exposure window

EXPOSURE WINDOW: March 20 10:00 AM to March 22 4:30 PM (~54 hours)
Audit confirmed: 0 unauthorized file downloads during exposure period

Tags: security, permissions, bug, privacy, regression, hotfix
Related: TK-2024-0835, TK-2024-0839 (same permission bug)

SLA:
  Response: 1 hour for security issues (met - 15 min)  
  Resolution: 4 hours for high/security (MISSED - took 6.5 hours due to hotfix deployment)
  SLA Breached: YES - resolution SLA missed by 2.5 hours
  Breach Reason: Hotfix required code change, testing, and phased deployment

CSAT: 2/5 - customer very unhappy about the exposure, considering competitor evaluation

Internal Note: This is a P1 customer satisfaction issue. Account Manager @Jake needs to schedule a call with customer within 24 hours. Consider offering credit or service upgrade.`
  },
  {
    source: 'ticket_013_webhook_setup.txt',
    content: `TK-2024-1456
Priority: Low
Status: Resolved  
Created: April 10, 2024

Customer: Alex Rivera
  alex@devshop.io
  DevShop - Growth plan (Account GRW-5543)

Subject: Need help configuring webhooks

Hi, I'm trying to set up webhooks to get notifications when tasks are completed in our project management workspace. I've read the docs but I'm confused about the payload format.

Questions:
1. What authentication method do webhooks use? (HMAC? API key header?)
2. Can I filter events to only receive 'task.completed' events?
3. What's the retry policy if my endpoint is temporarily down?
4. Is there a webhook testing/debugging tool?

We want to integrate with our internal Slack bot so team leads get notified instantly when deliverables are completed.

---
Agent: Dev Support - Priya M (Apr 10, 11 AM)

Hi Alex! Great questions. Here are the answers:

1. Authentication: We use HMAC-SHA256 signatures. Each webhook request includes an X-Webhook-Signature header. You verify by computing HMAC of the raw body using your webhook secret key.

2. Event filtering: Yes! When creating a webhook endpoint in Settings → Webhooks, you can select specific event types. Choose "task.completed" to only receive those events.

3. Retry policy: 
   - We retry up to 5 times with exponential backoff
   - Intervals: 1min, 5min, 30min, 2h, 12h
   - After 5 failures, the webhook is automatically disabled (you'll get an email)

4. Testing: Use the "Send Test Event" button in the webhook settings page. You can also use a service like webhook.site for debugging.

I also recommend checking out our webhook reference page: [link to docs]

Let me know if you need any help with the Slack bot integration!

---
Customer (Apr 10, 2 PM):
Perfect, got it working! The test event feature was super helpful. Thanks Priya!

Resolution: Documentation guidance provided, customer successfully configured webhooks
Tags: webhooks, integration, api, documentation, developer
Product: platform, Component: integrations

SLA: response 4h (met - 1h), resolution same-day (met)
CSAT: 5/5`
  },
  {
    source: 'ticket_014_account_merge.txt',
    content: `Ticket: TK-2024-0678
Priority: Medium
Status: Resolved
Date: March 18, 2024

Customer: Patricia Nguyen
  patricia@globalconsulting.com
  Global Consulting Group
  Has 2 accounts: FREE-9901 (old) and BIZ-5521 (new)

Subject: Please merge my two accounts

Hi,

I created a free account last year to test your product (patricia.nguyen@gmail.com, Account FREE-9901). We liked it so I created a business account with my work email (patricia@globalconsulting.com, Account BIZ-5521).

Now I have data split across both accounts:
- Free account: 47 projects, 230 tasks, 15 documents from testing
- Business account: new projects since February

Can you merge everything from the free account into the business account? I want to keep the business account email as primary.

Also please delete the free account after migration.

---
Agent: Account Support - Tyler K

Hi Patricia,

I can help with the account merge. Here's the plan:

1. I'll export all data from FREE-9901 (47 projects, 230 tasks, 15 docs)
2. Import into BIZ-5521 under a "Migrated" folder
3. Verify counts match
4. Delete FREE-9901 after your confirmation

Important notes:
- Project settings and custom fields will be preserved
- File attachments will be migrated
- Activity history/comments will be preserved
- User assignments will be mapped to your new account email

Timeline: This will take about 2-3 hours to complete. I'll email you when it's done.

---
Update (March 18, 4:30 PM):
Migration complete:
- 47/47 projects migrated ✓
- 230/230 tasks migrated ✓  
- 15/15 documents migrated ✓
- 89 file attachments migrated ✓

Awaiting customer confirmation to delete old account.

---
Customer (March 19, 9 AM):
Everything looks great! Please go ahead and delete the free account.

---
Agent (March 19, 9:30 AM):
Free account FREE-9901 deleted. Migration complete!

Resolution: Account data merged from FREE-9901 → BIZ-5521, old account deleted
Tags: account-merge, data-migration, account-management
SLA: response 2h (met), resolution 24h (met - 18h total)
CSAT: 5/5 - "smooth process, great communication"`
  },
  {
    source: 'ticket_015_compliance.txt',
    content: `COMPLIANCE REQUEST - TK-2024-0901

Priority: High
Status: Resolved
Created: 2024-03-26
Channel: Email

Customer Details:
  Organization: EuroBank AG
  Contact: Klaus Weber, Data Protection Officer
  Email: k.weber@eurobank.de
  Account: ENT-2001 (Enterprise - EU Region)
  Tier: Enterprise

Subject: GDPR Data Subject Access Request + Right to Erasure

Dear Support Team,

Under GDPR Articles 15 and 17, I am submitting the following requests on behalf of our customer Hans Schmidt (account holder):

1. DATA ACCESS REQUEST (Art. 15):
   Please provide a complete copy of all personal data you hold relating to:
   - Email: h.schmidt@eurobank.de
   - User ID: USR-45782
   This includes but is not limited to: profile data, activity logs, exported reports, IP addresses, and any data shared with third-party processors.

2. RIGHT TO ERASURE (Art. 17):
   After providing the data export, please permanently delete all personal data for this user from your systems, including backups, within the legally required timeframe (30 days).

3. CONFIRMATION:
   Please confirm:
   a) All sub-processors who may hold this user's data
   b) The data retention periods applied
   c) Written confirmation of deletion when complete

This request must be fulfilled within 30 days per GDPR requirements.

Regards,
Klaus Weber, DPO

---
Agent: Privacy Team Lead - Sophie Laurent

Processing timeline:
Day 1 (Mar 26): Request received, identity verification initiated
Day 3 (Mar 28): Identity verified via secure token sent to registered email
Day 5 (Mar 30): Complete data export generated (42MB encrypted archive)
Day 5 (Mar 30): Data sent via secure link (AES-256, 48hr expiry)
Day 7 (Apr 1): Customer confirmed receipt of data export
Day 10 (Apr 4): Erasure process initiated
Day 12 (Apr 6): Primary database records deleted
Day 15 (Apr 9): Backup propagation complete
Day 20 (Apr 14): Written confirmation sent:
  - Sub-processors notified: AWS (hosting), Mixpanel (analytics), SendGrid (email)
  - Retention: standard 30-day backup rotation
  - All data confirmed deleted across primary and backup systems

Resolution: GDPR DSAR fulfilled within 20 days (under 30-day requirement)
Tags: gdpr, dsar, right-to-erasure, privacy, compliance, eu, enterprise
Product: platform, Component: privacy-compliance

SLA: GDPR 30-day requirement (met - completed in 20 days)
No standard SLA applies - GDPR timeline governs

CSAT: 5/5 - "Professional handling of a sensitive request"`
  },
];
