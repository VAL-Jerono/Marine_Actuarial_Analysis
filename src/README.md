# AIG Marine Liability — Actuarial Intelligence Platform

A production-grade actuarial analytics dashboard built on real Marine Liability claims data (Oceanic Shipping Co., 2018–2023).

## Features

### Core (Task 2 requirements)
- **Claims Explorer** — Interactive filterable table + EDA charts (100 claims)
- **Pricing Model** — 10-step walkthrough: Frequency → Severity → Pure Premium → Large Loss Loading → Final Premium
- **Sensitivity Analysis** — Interactive sliders for severity shock, expense loading, profit margin

### Extended Actuarial Analytics
- **Bühlmann Credibility Weighting** — Blends own experience with industry benchmark; interactive k-factor
- **Loss Development Triangle** — Chain-Ladder method, age-to-age LDFs, IBNR reserve estimation (~$3.8M)
- **VaR / TVaR** — Lognormal aggregate loss distribution, Value at Risk and Tail Value at Risk at 90/95/99%
- **Loss Ratio & Burning Cost Rate** — Annual loss ratios by year + burning cost segmented by claim type
- **Risk Segmentation Matrix** — Cause × Type incurred loss heatmap + radar risk profiling

## Deploy to Vercel

### Option 1: Vercel CLI
```bash
npm install -g vercel
cd marine-actuarial
vercel --prod
```

### Option 2: GitHub + Vercel Dashboard
1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → Import repo
3. Framework: Vite (auto-detected)
4. Click Deploy

### Option 3: Drag & Drop
1. Run `npm run build`
2. Drag the `dist/` folder to vercel.com/new

## Local Development
```bash
npm install
npm run dev
```

## Tech Stack
- React 18 + Vite
- Recharts (all visualizations)
- No external API calls — all data embedded

## Data
100 claims, 2018–2023 | Currency: USD | Analysis: Pricing Year 2024
Analyst: V. Jerono | AIG Specialty Lines Actuarial
