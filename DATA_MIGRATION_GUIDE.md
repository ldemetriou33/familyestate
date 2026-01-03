# Data Migration Guide: From Mock Data to Real Data

## Current Status

**Good News:** Most of your dashboard is **already using real data** from the database! The `getDashboardData()` function queries Prisma directly, so once you add data to the database, it will automatically appear.

## What's Using Real Data vs Mock Data

### ✅ Already Using Real Data (Database Queries)
- **Command Center** - Portfolio overview, alerts, actions
- **Hotel Section** - Bookings, occupancy, revenue (from database)
- **Cafe Section** - Sales, transactions (from database)
- **Portfolio Section** - Properties, units, rent roll (from database)
- **Finance Section** - Cash position, transactions, debt (from database)

### ⚠️ Still Using Mock/Hardcoded Data
- **PortfolioSection** (`components/sections/PortfolioSection.tsx`) - Uses `rentalProperties` from `lib/constants.ts`
- **EnergyDashboard** (`components/energy/EnergyDashboard.tsx`) - Has hardcoded energy metrics
- Some forecasting functions may use sample data

## How to Switch to Real Data

### Step 1: Add Your Properties & Units

1. Go to **Portfolio Admin**: https://familyestate.vercel.app/dashboard/admin/portfolio
2. Click **"Add Property"** for each property:
   - Hotel
   - Cafe
   - Each residential building
3. Click **"Add Unit"** for each room/flat:
   - Hotel rooms
   - Residential flats
   - Cafe (if you want to track it as a unit)

### Step 2: Import Historical Data (Optional)

1. Go to **Data Import**: https://familyestate.vercel.app/dashboard/admin/import
2. Upload CSV files:
   - **Bank Statements** - Past transactions
   - **Hotel Daily Metrics** - Historical occupancy/revenue
   - **Rent Roll** - Tenant payment history

### Step 3: Connect Integrations (Automatic Updates)

## How Integrations Work

### ✅ Yes, Integrations Update Everything Automatically!

When you connect integrations, they work in **real-time** and **automatically**:

#### 1. **Xero Integration** (Accounting)
- **What it syncs:**
  - Bank transactions
  - Profit & Loss reports
  - Cash at Bank balance
  - Invoices and bills
  
- **How it works:**
  - Runs daily at 7 AM via cron job (`/api/cron/sync`)
  - Pulls latest data from Xero API
  - Updates `FinancialTransaction`, `CashPosition` tables
  - **No manual work needed!**

- **Setup:**
  1. Go to Settings → Integrations
  2. Click "Connect" on Xero
  3. Authorize Abbey OS in Xero
  4. Data syncs automatically every day

#### 2. **Cloudbeds Integration** (Hotel PMS)
- **What it syncs:**
  - New bookings
  - Check-ins/Check-outs
  - Room status
  - Revenue data
  
- **How it works:**
  - Uses **webhooks** (real-time)
  - When a booking is created in Cloudbeds → Abbey OS receives webhook
  - Automatically creates `Booking` record
  - Updates `HotelMetric` table
  - **Instant updates, no delay!**

- **Setup:**
  1. Go to Settings → Integrations
  2. Click "Connect" on Cloudbeds
  3. Authorize Abbey OS
  4. Configure webhook URL in Cloudbeds dashboard:
     - URL: `https://familyestate.vercel.app/api/webhooks/cloudbeds`
     - Events: `reservation_created`, `checked_in`, `checked_out`
  5. Webhooks fire automatically when events happen

#### 3. **Square Integration** (Cafe POS)
- **What it syncs:**
  - Sales transactions
  - Daily revenue
  - Tips and gratuities
  - Menu item sales
  
- **How it works:**
  - Uses **webhooks** (real-time)
  - When a payment is processed in Square → Abbey OS receives webhook
  - Automatically creates `CafeTransaction` record
  - Updates `CafeSales` table
  - **Instant updates!**

- **Setup:**
  1. Go to Settings → Integrations
  2. Click "Connect" on Square
  3. Authorize Abbey OS
  4. Configure webhook in Square Developer Dashboard:
     - URL: `https://familyestate.vercel.app/api/webhooks/square`
     - Events: `payment.updated`, `order.created`
  5. Webhooks fire automatically

## Integration Sync Schedule

| Integration | Update Frequency | Method |
|------------|------------------|--------|
| **Xero** | Daily at 7 AM | Cron Job (Polling) |
| **Cloudbeds** | Real-time | Webhooks (Push) |
| **Square** | Real-time | Webhooks (Push) |

## What Gets Updated Automatically

Once integrations are connected:

### Xero Updates:
- ✅ Cash Position (operating balance, reserve balance)
- ✅ Financial Transactions (income, expenses)
- ✅ Profit & Loss data
- ✅ Bank account balances

### Cloudbeds Updates:
- ✅ Hotel Bookings (new reservations)
- ✅ Room Status (checked in/out)
- ✅ Daily Metrics (occupancy, ADR, RevPAR)
- ✅ Guest Information

### Square Updates:
- ✅ Cafe Transactions (sales)
- ✅ Daily Sales Summary
- ✅ Tips and Gratuities
- ✅ Revenue Metrics

## Manual Data Entry (If Needed)

If you don't use integrations, you can still add data manually:

1. **Portfolio Admin** - Add properties/units
2. **Data Import** - Upload CSV files
3. **Daily Log** - Add context notes
4. **Manual Forms** - Some sections have add/edit buttons

## Troubleshooting

### "No data showing"
- Check if you've added properties in Portfolio Admin
- Verify database connection (check Vercel environment variables)
- Try clicking "Seed Demo Data" to test

### "Integrations not syncing"
- Verify webhook URLs are correct in Cloudbeds/Square dashboards
- Check Vercel logs for webhook errors
- Ensure `DATABASE_URL` is set in Vercel
- Check integration connection status in Settings → Integrations

### "Data not updating"
- Xero syncs daily - wait until 7 AM
- Cloudbeds/Square use webhooks - check if webhooks are configured
- Manually trigger sync from Settings → Integrations → Refresh

## Next Steps

1. ✅ Add your properties via Portfolio Admin
2. ✅ Connect Xero for accounting data
3. ✅ Connect Cloudbeds for hotel bookings
4. ✅ Connect Square for cafe sales
5. ✅ Upload historical CSV data (optional)
6. ✅ Watch the dashboard populate automatically!

---

**Note:** The dashboard will automatically show real data once it's in the database. No code changes needed - just add data through the UI or integrations!

