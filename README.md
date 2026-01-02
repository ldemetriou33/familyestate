# Abbey OS - Strategic Core

A comprehensive portfolio management system for UK rental properties, hotel, and F&B operations.

## Features

- **Portfolio Overview**: Track 12 UK rental properties with LTV, weighted average interest rates, and monthly cashflow
- **SONIA Tracker**: Real-time tracking of the Sterling Overnight Index Average rate from Bank of England
- **Hospitality Management**: Monitor hotel performance and financial metrics
- **F&B Operations**: Weekly target tracker for cafe operations (£15,000/week baseline)

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Deploy to GitHub
npm run deploy
# or
./deploy.sh
```

## Deployment

To automatically push changes to GitHub:

1. **Using npm script**: `npm run deploy`
2. **Using deployment script**: `./deploy.sh`
3. **Manual**: `git add -A && git commit -m "Your message" && git push origin main`

A git post-commit hook is configured to automatically push after each commit.

## Project Structure

```
├── lib/
│   ├── constants.ts              # Property data (12 rentals, hotel, cafe)
│   ├── utils.ts                   # Utility functions (GBP formatting, dates)
│   ├── portfolio-calculations.ts  # Portfolio metrics calculations
│   └── services/
│       └── sonia.ts               # SONIA rate tracking service
├── components/
│   ├── sections/
│   │   ├── PortfolioSection.tsx  # Portfolio overview dashboard
│   │   ├── HospitalitySection.tsx # Hotel management
│   │   └── FBSection.tsx          # F&B operations with weekly tracker
│   └── ui/                        # Shadcn/UI components
└── app/                           # Next.js app directory
```

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Lucide React Icons
- Shadcn/UI components

## Currency & Date Formats

- All currency displayed in GBP (£)
- Dates formatted in UK format (DD/MM/YYYY)
