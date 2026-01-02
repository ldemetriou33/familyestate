# Abbey OS - Enterprise Architecture Roadmap

## Vision: The Sellable Product

Abbey OS is evolving from a **Dashboard** (displaying data) to a **Control System** (governance, automation, and truth). This document outlines the 7-layer architecture required for an enterprise-grade, investor-ready platform.

---

## The 7-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     LAYER 7: EVIDENCE-BASED AI                  │
│         AI recommendations reference specific source records     │
├─────────────────────────────────────────────────────────────────┤
│                     LAYER 6: GOVERNANCE (RBAC)                  │
│         Approval thresholds, decision logs, audit trails        │
├─────────────────────────────────────────────────────────────────┤
│                 LAYER 5: DEBT & COVENANT ENGINE                 │
│         Loan covenants, stress tests, refi defense              │
├─────────────────────────────────────────────────────────────────┤
│                    LAYER 4: PRICING ENGINE                      │
│         Dynamic rates, seasonal multipliers, proposals          │
├─────────────────────────────────────────────────────────────────┤
│                  LAYER 3: ACT (CLOSED LOOPS)                    │
│         Workflow actions, approvals, execution, verification    │
├─────────────────────────────────────────────────────────────────┤
│                LAYER 2: REAL INTEGRATIONS                       │
│         Xero, Stripe, PMS, POS, Bank feeds                      │
├─────────────────────────────────────────────────────────────────┤
│               LAYER 1: TRUTH & CONTROLS                         │
│         Data freshness, reconciliation, period close            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Truth & Controls (The Trust Layer) ✅ Schema Complete

### Purpose
Every piece of data must be traceable, verifiable, and reconcilable. This is the foundation for audit-grade financial reporting.

### Schema Components
- **Data Provenance Fields** (added to all metric models):
  - `dataSource`: Where the data came from (XERO, MANUAL, PMS, etc.)
  - `confidence`: VERIFIED, HIGH, MEDIUM, LOW, UNKNOWN
  - `lastUpdatedAt`: When the data was last refreshed
  - `integrationId`: Which integration imported this data

- **Reconciliation System**:
  - `ReconciliationStatus` enum: PENDING, MATCHED, UNMATCHED, FLAGGED
  - `ReconciliationRun` model: Batch reconciliation runs
  - `ReconciliationItem` model: Individual matches/mismatches

- **Period Close**:
  - `AccountingPeriod` model: OPEN, SOFT_CLOSE, HARD_CLOSE, ARCHIVED
  - Board Pack generation support
  - Prevents modifications to closed periods

### UI Component
- **`<DataHealthIndicator />`** ✅ Complete
  - Green dot: Live/Today
  - Amber dot: ≤3 days old
  - Red dot: >7 days old
  - Tooltip: Source, confidence, reconciliation status

### Backend Logic (TODO)
```typescript
// lib/reconciliation/engine.ts
async function runReconciliation(periodStart: Date, periodEnd: Date) {
  // 1. Fetch all bank transactions in period
  // 2. Fetch all PMS revenue in period
  // 3. Fetch all POS sales in period
  // 4. Match bank to source (within tolerance)
  // 5. Flag unmatched items
  // 6. Generate ReconciliationRun record
}
```

---

## Layer 2: Real Integrations (Ingestion) ✅ Schema Complete

### Purpose
Move from manual CSV uploads to live data feeds from accounting, PMS, and POS systems.

### Schema Components
- **`IntegrationConnection`** model:
  - Provider (XERO, STRIPE, OPERA_PMS, etc.)
  - Credentials (encrypted JSON)
  - Sync frequency (REALTIME, HOURLY, DAILY)
  - Last sync status and timestamp

- **`IntegrationSyncLog`** model:
  - Records processed/created/updated/failed
  - Error messages and details

### Supported Integrations (Roadmap)

| Provider | Type | Priority | Status |
|----------|------|----------|--------|
| Xero | Accounting | P1 | 🔴 Planned |
| Stripe | Payments | P1 | 🔴 Planned |
| Cloudbeds | Hotel PMS | P1 | 🔴 Planned |
| Square | Cafe POS | P2 | 🔴 Planned |
| GoCardless | Direct Debit | P2 | 🔴 Planned |
| Bank of England | SONIA Rate | P3 | 🟢 Live |

### Integration Architecture (TODO)
```typescript
// lib/integrations/xero.ts
export class XeroConnector {
  async authenticate(connectionId: string): Promise<void>
  async syncBankTransactions(): Promise<SyncResult>
  async syncInvoices(): Promise<SyncResult>
  async syncBills(): Promise<SyncResult>
}
```

---

## Layer 3: The "Act" Layer (Closed Loops) ✅ Schema Complete

### Purpose
Actions are not just "To Do" items—they're workflows with approvals, execution, and verification.

### Workflow States
```
DRAFT → PENDING_APPROVAL → APPROVED → SCHEDULED → IN_PROGRESS 
    → EXECUTED → VERIFICATION_REQ → VERIFIED
                                   ↘ FAILED
```

### Schema Components
- **`ActionItem`** (enhanced):
  - `workflowStatus`: Full workflow tracking
  - `actionType`: ARREARS_CHASE, RATE_CHANGE, etc.
  - `scheduledFor`, `executedAt`, `verifiedAt`

- **`ActionApproval`** model:
  - Approver, approved/rejected, comments

- **`ActionExecution`** model:
  - Step-by-step execution tracking
  - Input/output data for each step

### Example: Arrears Chase Workflow
```
Step 1: GENERATE_EMAIL → Generate arrears letter from template
Step 2: SEND_EMAIL → Send via email provider
Step 3: LOG_RESPONSE → Wait for response/payment
Step 4: RECONCILE → Check if payment received
Step 5: VERIFY → Mark action complete or escalate
```

### Backend Logic (TODO)
```typescript
// lib/workflows/arrears-chase.ts
export const arrearsChaseWorkflow = {
  steps: [
    { name: 'GENERATE_EMAIL', handler: generateArrearsLetter },
    { name: 'SEND_EMAIL', handler: sendEmail },
    { name: 'AWAIT_RESPONSE', handler: awaitResponse, timeout: '7d' },
    { name: 'RECONCILE_PAYMENT', handler: reconcilePayment },
    { name: 'VERIFY_COMPLETION', handler: verifyCompletion },
  ]
}
```

---

## Layer 4: Pricing Engine (Revenue Levers) ✅ Schema Complete

### Purpose
Dynamic pricing based on occupancy, seasonality, lead time, and market conditions.

### Schema Components
- **`PricingRule`** model:
  - Min/Max/Base rates
  - Seasonal multipliers (PEAK, SHOULDER, OFF_PEAK)
  - Day-of-week factors (JSON: {"monday": 0.9, "friday": 1.2})
  - Occupancy-based adjustments
  - Lead time adjustments

- **`RateProposal`** model:
  - Current vs. proposed rate
  - Reasoning (AI or manual)
  - Approval workflow
  - Applied date tracking

### Pricing Algorithm (TODO)
```typescript
// lib/pricing/engine.ts
function calculateOptimalRate(
  propertyId: string,
  date: Date,
  currentOccupancy: number
): RateProposal {
  const rule = getPricingRule(propertyId)
  
  let rate = rule.baseRate
  
  // Apply seasonal multiplier
  rate *= getSeasonMultiplier(date, rule)
  
  // Apply day-of-week factor
  rate *= getDayOfWeekFactor(date, rule)
  
  // Apply occupancy adjustment
  if (currentOccupancy < rule.occupancyThresholdLow) {
    rate *= rule.lowOccupancyMultiplier
  } else if (currentOccupancy > rule.occupancyThresholdHigh) {
    rate *= rule.highOccupancyMultiplier
  }
  
  // Clamp to min/max
  return Math.min(Math.max(rate, rule.minRate), rule.maxRate)
}
```

---

## Layer 5: Debt & Covenant Engine (Refi Defense) ✅ Schema Complete

### Purpose
Track loan covenants, run stress tests, and prepare for refinancing conversations.

### Schema Components
- **`LoanCovenant`** model:
  - Metric (DSCR, LTV, ICR)
  - Threshold and operator (>=, <=)
  - Current value and breach status
  - Test frequency and next test date

- **`DebtStressTest`** model:
  - Scenario definitions (+1% rate, -10% revenue)
  - Results (new payment, new DSCR, covenant breaches)

### Key Metrics
| Metric | Definition | Typical Threshold |
|--------|------------|-------------------|
| DSCR | (NOI / Debt Service) | ≥ 1.25 |
| LTV | (Loan / Value) | ≤ 75% |
| ICR | (EBIT / Interest) | ≥ 2.0 |

### Stress Test Scenarios (TODO)
```typescript
// lib/debt/stress-tests.ts
const scenarios = [
  { name: 'Base Case', rateChange: 0, revenueChange: 0 },
  { name: '+1% Interest', rateChange: 0.01, revenueChange: 0 },
  { name: '+2% Interest', rateChange: 0.02, revenueChange: 0 },
  { name: '10% Revenue Drop', rateChange: 0, revenueChange: -0.10 },
  { name: 'Perfect Storm', rateChange: 0.02, revenueChange: -0.10 },
]
```

---

## Layer 6: Governance (RBAC) ✅ Schema Complete

### Purpose
Role-based access control, approval thresholds, and decision audit trails.

### Schema Components
- **`Organization`** model:
  - Multi-tenancy support
  - Timezone, currency, fiscal year settings

- **`OrganizationMember`** model:
  - Links users to organizations with roles

- **`Permission`** model:
  - Granular resource + action permissions
  - Optional property-level scoping

- **`ApprovalThreshold`** model:
  - Role-based spending limits
  - Secondary approver requirements

- **`DecisionLog`** model:
  - Major decisions with reasoning
  - Supporting documents
  - Audit trail for investors/board

### Role Permissions Matrix

| Action | STAFF | ACCOUNTANT | GM | OWNER |
|--------|-------|------------|-----|-------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| Create Expense | ✅ | ✅ | ✅ | ✅ |
| Approve <£500 | ❌ | ✅ | ✅ | ✅ |
| Approve <£5,000 | ❌ | ❌ | ✅ | ✅ |
| Approve Unlimited | ❌ | ❌ | ❌ | ✅ |
| Change Rates | ❌ | ❌ | ✅ | ✅ |
| Close Period | ❌ | ❌ | ❌ | ✅ |
| System Config | ❌ | ❌ | ❌ | ✅ |

---

## Layer 7: Evidence-Based AI ✅ Schema Fields Added

### Purpose
AI recommendations must be traceable to specific source records, not "black box" suggestions.

### Schema Components
- **`aiSourceRecords`** field (added to):
  - `ActionItem`
  - `Alert`
  - `Forecast`
  - `RateProposal`

- **`aiReasoningJson`** field:
  - Full reasoning chain
  - Confidence scores
  - Data points used

### AI Transparency Requirements
```typescript
interface AIRecommendation {
  id: string
  title: string
  reasoning: string
  
  // Evidence
  sourceRecords: {
    type: 'HotelMetric' | 'CafeSales' | 'RentRoll' | 'Forecast'
    id: string
    relevantValue: number
  }[]
  
  confidence: number // 0-1
  
  // Audit
  modelVersion: string
  generatedAt: Date
}
```

### Example AI Recommendation with Evidence
```json
{
  "title": "Reduce hotel rates for next week",
  "reasoning": "Occupancy forecast is 42% (below 65% threshold). Historical data shows 15% booking increase with 10% rate reduction during low periods.",
  "sourceRecords": [
    { "type": "Forecast", "id": "fc_123", "relevantValue": 0.42 },
    { "type": "HotelMetric", "id": "hm_456", "relevantValue": 0.38 },
    { "type": "PricingRule", "id": "pr_789", "relevantValue": 85.00 }
  ],
  "confidence": 0.78
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Current Sprint) ✅
- [x] Schema upgrade with data provenance
- [x] Reconciliation models
- [x] Integration connection models
- [x] Governance models (Organization, Permission)
- [x] DataHealthIndicator component

### Phase 2: Trust Layer (Next Sprint)
- [ ] Reconciliation engine (BankTx vs PMS vs POS)
- [ ] Period close functionality
- [ ] Board pack generation structure
- [ ] Wrap all widgets with DataHealthIndicator

### Phase 3: Integrations
- [ ] Xero connector (OAuth flow)
- [ ] Bank feed connector
- [ ] Cloudbeds PMS connector
- [ ] Square POS connector

### Phase 4: Workflows
- [ ] Arrears chase workflow
- [ ] Maintenance request workflow
- [ ] Rate change approval workflow
- [ ] Expense approval workflow

### Phase 5: Revenue Optimization
- [ ] Pricing rule engine
- [ ] Rate proposal generation
- [ ] Seasonal multiplier calculations
- [ ] Occupancy-based dynamic pricing

### Phase 6: Debt Management
- [ ] Covenant tracking dashboard
- [ ] Automated covenant testing
- [ ] Stress test runner
- [ ] Refinancing scenario modeling

### Phase 7: Full Governance
- [ ] RBAC middleware
- [ ] Approval workflow UI
- [ ] Decision log capture
- [ ] Audit trail reports

---

## Technical Debt to Address

1. **Mock Data Removal**: Replace `lib/mock-data/seed.ts` with real database queries
2. **Prisma Client Generation**: Ensure `prisma generate` runs on all environments
3. **Environment Variables**: Document all required env vars
4. **Error Handling**: Standardize error responses across server actions
5. **Caching Strategy**: Implement React Query or SWR for client-side caching

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Data freshness (avg) | Manual | <1 hour |
| Reconciliation rate | 0% | >95% |
| Automated actions | 0% | >50% |
| AI evidence coverage | 0% | 100% |
| Approval audit trail | None | Complete |

---

## Appendix: Schema Summary

### New Enums (13)
- DataSource, ReconciliationStatus, DataConfidence, PeriodStatus
- ActionWorkflowStatus, ActionType
- RateProposalStatus, SeasonType
- ApprovalType, DecisionType
- IntegrationProvider, IntegrationStatus, SyncFrequency

### New Models (15)
- Organization, OrganizationMember, Permission
- ApprovalThreshold, DecisionLog
- IntegrationConnection, IntegrationSyncLog
- AccountingPeriod
- ReconciliationRun, ReconciliationItem
- ActionApproval, ActionExecution
- PricingRule, RateProposal
- LoanCovenant, DebtStressTest

### Enhanced Models (12)
- All metric models now have: dataSource, confidence, lastUpdatedAt
- FinancialTransaction: + reconciliationStatus, matchedTo fields
- HotelMetric: + reconciliationStatus
- CafeSales: + reconciliationStatus
- ActionItem: + workflowStatus, actionType, AI evidence fields
- Alert: + aiSourceRecords
- Forecast: + aiSourceRecords

---

**Document Version**: 3.0  
**Last Updated**: January 2026  
**Status**: Architecture Approved, Implementation In Progress

