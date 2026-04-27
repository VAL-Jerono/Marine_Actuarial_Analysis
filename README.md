# AIG Marine Liability — Actuarial Intelligence Platform
### Built for Oceanic Shipping Co. · Analysis Period 2018–2023 · Pricing Year 2024

**Live Platform:** https://oceanic-shipping-analysis.vercel.app/

---

> This platform turns six years of Oceanic Shipping Co.'s claims history into a living, interactive actuarial workspace. Every number you see — from the $13.0M recommended premium to the $3.8M IBNR reserve — is derived from your actual 100-claim dataset, processed through the same techniques a specialist actuarial team would apply. This document explains what was built, how each technique works, and why it matters to you.

---

## Table of Contents

1. [What Was Built](#what-was-built)
2. [The Data Foundation](#the-data-foundation)
3. [Module 1 — Portfolio Overview Dashboard](#module-1--portfolio-overview-dashboard)
4. [Module 2 — Claims Explorer](#module-2--claims-explorer)
5. [Module 3 — Pricing Model (Step-by-Step Walkthrough)](#module-3--pricing-model-step-by-step-walkthrough)
6. [Module 4 — Advanced Actuarial Analytics](#module-4--advanced-actuarial-analytics)
7. [Key Outputs at a Glance](#key-outputs-at-a-glance)
8. [Technology Stack](#technology-stack)
9. [Acknowledgements](#acknowledgements)

---

## What Was Built

This is a **single-page React application** deployed on Vercel. It has four fully interactive modules:

| Module | Purpose |
|--------|---------|
| **Overview Dashboard** | Portfolio-level KPIs, loss trends, and a pricing summary banner |
| **Claims Explorer** | Filterable, sortable table of all 100 claims with exploratory charts |
| **Pricing Model** | A guided 7-step walkthrough from raw frequency data to final 2024 premium |
| **Advanced Analytics** | Five extended actuarial techniques: credibility, reserving, tail risk, loss ratios, and risk segmentation |

Nothing is static. Sliders, toggles, and confidence-level selectors let you interact with the underlying actuarial models in real time.

---

## The Data Foundation

Your dataset covers **100 marine liability claims** filed between 2018 and 2023. Before any analysis could begin, each claim needed to be put on a consistent basis. Here is what that involved.

### Claim Fields

Each of the 100 claims carries:

- **Gross incurred loss** — the raw insurer cost before any deductible recovery
- **Deductible** — your policy retention per claim, subtracted to arrive at the net cost
- **Net incurred loss** — gross minus deductible; the amount that matters for premium calculation
- **Policy limits** — the maximum the insurer pays per claim (capped exposures)
- **Cause of loss** — Human Error, Technical Failure, Criminal Activity, or Natural Disaster
- **Claim type** — Collision Liability, Cargo Liability, Damage to Other Vessels, Environmental Pollution, or Injury to Third Parties
- **Location** — Indian Ocean, Atlantic Ocean, Mediterranean Sea, or Pacific Ocean
- **Gross Tonnage** — the vessel size measure used to normalise frequency
- **Prior claims** — number of previous claims on that insured (a risk indicator)
- **Status** — Closed, Open, or In Litigation

### Inflation Adjustment

A claim paid in 2018 and one paid in 2023 are not directly comparable — construction costs, salvage costs, and legal settlements all drift upward over time. To make every claim comparable in today's money, each net loss was multiplied by a compound inflation index:

```
Inflation Index (2018 claim) = (1 + annual_rate)^5  ≈ 1.2053
Inflation Index (2023 claim) = (1 + annual_rate)^0  = 1.0000
```

The result is the **inflation-adjusted net incurred loss** used in all severity and premium calculations.

### Attritional vs. Large Loss Separation

Marine liability portfolios routinely experience one or two extremely large losses that, if left in the dataset, would distort the average severity calculation and produce a premium that is either wildly conservative or dangerously inadequate depending on whether the next policy year repeats that event.

The platform separates claims into two buckets:

- **Attritional claims** (the 99 regular claims) — used to calculate the base pure premium through the frequency–severity method
- **Large loss** (CLM-00100, the single catastrophic event) — modelled separately as a return-period loading

This is standard actuarial practice. You price the everyday risk from everyday data, then add a separate, explicit charge for the once-in-twenty-years event.

---

## Module 1 — Portfolio Overview Dashboard

The dashboard opens with six headline KPIs drawn from your claims data:

| KPI | Value | What It Means |
|----|-------|---------------|
| Total Claims | 100 | Six years of experience across your fleet |
| Total Incurred | $58.1M | Gross losses before deductibles |
| Average Severity | $581K | Mean cost per claim |
| Closed Claims | ~72% | Proportion with no further development risk |
| In Litigation | ~15 | Claims where adverse development is possible |
| Final Premium (2024) | $13.0M | Recommended renewal premium |

### Claims Volume and Incurred by Year

A dual-axis bar chart shows both the number of claims (left axis) and total incurred loss (right axis) for each year 2018–2023. The peak in 2020–2021 is visible and discussed in the pricing module — it aligns with COVID-era operational disruption, reduced dry-dock maintenance, and reduced oversight.

### Claims by Type (Donut Chart)

The donut breaks your portfolio into its five claim types by count. This matters because different types have very different severity profiles. Environmental Pollution claims tend to be expensive and slow to settle; Injury to Third Parties claims tend to be smaller but more frequent.

### Average Severity Trend

An area chart traces inflation-adjusted average severity per year. The 2023 point ($465K) is notably lower than the 2020–2021 peak — the platform notes this may reflect a genuine portfolio improvement, but could equally reflect **IBNR understatement** on recent claims that have not yet fully developed. This is why the reserving module is important.

### Cause of Loss and Geographic Spread

Progress bars show both the claim count by cause (Human Error is typically dominant in marine liability) and the aggregate incurred loss by ocean region. The geographic split matters for treaty reinsurance and for understanding whether your exposure is concentrated in high-risk corridors.

### Pricing Summary Banner

A five-column banner at the bottom of the dashboard summarises the entire pricing chain at a glance: Pure Premium → Large Loss Loading → Total Risk Premium → Final Premium → Sensitivity at +6% severity shock.

---

## Module 2 — Claims Explorer

This module gives you and your underwriters direct access to every claim record. It is designed for exploratory data analysis (EDA).

### Filterable Table

You can filter claims by year, claim type, cause of loss, or claim status. The table is sortable by any column and displays all fields including the inflation-adjusted and capped net figures that feed the pricing model.

### Built-in Charts

The explorer includes charts that update dynamically based on your active filters:

- **Severity distribution histogram** — shows how losses are spread. A heavy right tail (a few very large values) is the most important feature of marine liability data and directly motivates the large loss separation above.
- **Claims by type and cause** — cross-tabulations to spot concentration risk
- **Annual trend** — filtered to whatever subset you have selected

This module is particularly useful when you want to answer questions like: *"What were our Collision Liability claims in the Atlantic Ocean in 2021?"* — select those filters and the table and charts update immediately.

---

## Module 3 — Pricing Model (Step-by-Step Walkthrough)

This is the core actuarial deliverable. The pricing model walks through seven steps, each one building on the last, to arrive at the 2024 recommended premium.

---

### Step 1 — Claim Frequency Analysis

**What it is:** How often does a loss happen, per unit of exposure?

**The technique:** Rather than simply counting claims per year (which is affected by how much fleet you were operating), frequency is expressed as **claims per unit of Gross Tonnage**. This normalises for fleet size.

```
Frequency (year y) = Number of attritional claims in year y
                     ─────────────────────────────────────
                     Total Gross Tonnage insured in year y
```

The chart shows this ratio for each year with the six-year average marked as a dashed reference line. The average frequency used in pricing is:

```
Average Frequency = 3.758 × 10⁻⁷ claims per GT
```

Translated: for every 1,000,000 tonnes of shipping in your fleet, you expect approximately 0.376 attritional claims per year.

---

### Step 2 — Loss Severity Analysis

**What it is:** When a loss occurs, how much does it cost on average?

**The technique:** The average of inflation-adjusted, capped net incurred losses across all attritional claims, by year. The capping step ensures no single year is distorted by its worst claim.

```
Average Severity = $588,228 per attritional claim
```

The 2020 peak (~$660K) and the 2023 low (~$465K) are both visible. The platform notes the 2023 figure may be understated because recent claims are still open — this feeds directly into the IBNR reserve discussion in Module 4.

---

### Step 3 — Expected Loss per GT

**What it is:** Frequency × Severity combined into a single rate.

```
Expected Loss per GT = Frequency × Severity
                     = 3.758×10⁻⁷ × $588,228
                     = $0.2212 per GT
```

This is the fundamental exposure rate. It peaked at $0.289 in 2020–2021 and has since declined — useful context for the underwriter deciding whether 2024 should be priced closer to the long-run average or the recent trend.

---

### Step 4 — Pure Premium Calculation

**What it is:** The total expected attritional loss for your 2024 fleet, before any expenses or profit.

```
Pure Premium = Average Frequency × Average Severity × 2024 Expected GT

             = 3.758×10⁻⁷ × $588,228 × 40,000,000

             = $8,840,000
```

The 40 million GT figure is the expected insured tonnage for the 2024 policy year. This is the single most important input assumption — a 5% change in expected tonnage produces a 5% change in pure premium. The sensitivity analysis in Step 7 allows you to test this.

---

### Step 5 — Large Loss Identification

**What it is:** Finding the outlier claim that sits outside normal experience.

CLM-00100 is the large loss event — a claim so severe that including it in the attritional average would overstate the expected frequency of such events. Instead, it is modelled separately.

Inflation-adjusted cost of CLM-00100: **$5,253,947**

---

### Step 6 — Large Loss Loading (Return Period Method)

**What it is:** How much premium do you need to collect each year to pay for an event that only happens once every 20 years?

**The technique:** The return period method spreads the cost of the large loss over its expected recurrence interval.

```
Large Loss Loading = Inflation-adjusted large loss cost
                    ──────────────────────────────────
                    Return period (years)

                   = $5,253,947 ÷ 20

                   = $262,697
```

A 1-in-20-year return period is a reasonable actuarial assumption for a single catastrophic event in a portfolio of this size. If you believe such events could recur more frequently — for example, if your fleet is operating in higher-risk corridors — the loading should be increased by shortening the return period.

---

### Step 7 — Final Premium Build-Up and Sensitivity Analysis

**What it is:** Stacking the risk premium with expense and profit loadings to arrive at the charged premium.

```
Total Risk Premium  = Pure Premium + Large Loss Loading
                    = $8,840,000 + $262,697
                    = $9,102,697

Final Premium       = Total Risk Premium × (1 + Expense Loading) × (1 + Profit Margin)
                    = $9,102,697 × 1.30 × 1.10
                    = $13,016,858  ≈  $13.0M
```

The default loadings are 30% expenses and 10% profit margin. These are fully interactive — drag the sliders to test different commercial positions.

**Sensitivity Analysis** calculates the final premium across a range of severity shocks from −10% to +20%. This is the answer to the question: *"What if claims are worse than history suggests?"*

| Severity Shock | Final Premium | Change |
|---------------|---------------|--------|
| −10% | $11.7M | −10.0% |
| 0% (Base) | $13.0M | — |
| +6% | $13.8M | +5.8% |
| +15% | $15.0M | +14.9% |
| +20% | $15.6M | +19.9% |

The near-linear relationship between severity shock and premium change is expected — it reflects the fact that severity is a direct multiplier in the pure premium formula.

---

## Module 4 — Advanced Actuarial Analytics

Five extended techniques are available in this module. Each represents a layer of sophistication beyond the base pricing model.

---

### ① Bühlmann Credibility Weighting

**The problem it solves:** Your 100-claim dataset is meaningful, but it is not large enough to be treated as the whole truth. Industry-wide data covers thousands of similar vessels. How do you combine your own experience with the industry benchmark in a principled way?

**The technique — Bühlmann Credibility:** This is one of the most important results in actuarial science. The credibility-weighted estimate is:

```
Credibility Estimate = Z × (Own Experience)  +  (1 − Z) × (Industry Benchmark)

where:  Z = n / (n + k)
        n = number of your own claims = 99
        k = Bühlmann k-factor = 25  (reflects variability in the portfolio)
```

With 99 claims and k = 25:

```
Z = 99 / (99 + 25) = 79.8%
```

This means your own experience carries approximately **80% weight** and the industry benchmark carries **20% weight** in the blended severity estimate. The chart shows how this weight shifts as claim count grows — with 200 claims, Z would reach 89%, and you would become nearly self-sufficient.

**Why it matters:** If you have had an unusually bad run of claims, pure experience-based pricing overstates the true risk. If you have been fortunate, it understates it. Credibility weighting pulls both extremes toward a more reliable centre.

**Interactive control:** The industry average severity slider (default $550,000) lets you test how sensitive the blended premium is to the benchmark assumption. A one-standard-deviation shift in the industry benchmark moves the final credibility premium by approximately $350K.

---

### ② Loss Development Triangle & IBNR Reserve

**The problem it solves:** When a claim is first reported, the insurer typically does not know the final cost. A Collision Liability claim reported in 2023 may still be litigated in 2026. The reported loss at the end of 2023 understates the ultimate cost. How much more will those open claims develop?

**The technique — Chain-Ladder Loss Development:** A development triangle is constructed by arranging your claims data by accident year (the year the incident occurred) and development period (how many months after the incident the loss was measured). Each cell shows the cumulative incurred loss for that accident year at that stage of development.

The table in the platform shows 2018–2023 accident years with development periods at 12, 24, 36, 48, and 60 months.

**Age-to-Age Loss Development Factors (LDFs):**

| Development Period | Factor | Interpretation |
|-------------------|--------|----------------|
| 12 → 24 months | 1.097 | Losses grow 9.7% between first and second year of development |
| 24 → 36 months | 1.034 | 3.4% further growth |
| 36 → 48 months | 1.010 | Portfolio is largely settled by this point |
| 48 → 60 months | 1.002 | Tail development is minimal |
| Tail factor | 1.001 | Beyond 60 months, near-zero development |

These factors are multiplied together (the **cumulative development factor**) and applied to the current reported losses to estimate the **ultimate incurred loss** for each accident year.

**IBNR Reserve (Incurred But Not Reported):**

```
IBNR = Ultimate Estimated Loss − Currently Reported Loss
```

| Accident Year | Reported | Ultimate Estimate | IBNR Reserve | % Still to Develop |
|--------------|----------|-------------------|-------------|-------------------|
| 2023 | $7.4M | $8.4M | $974K | 13.1% |
| 2022 | $9.8M | $10.5M | $698K | 7.2% |
| 2021 | $12.0M | $13.0M | $1.0M | 8.5% |
| 2020 | $12.1M | $13.2M | $1.1M | 9.2% |
| **Total** | | | **$3.8M** | |

**Your balance sheet currently understates ultimate losses by approximately $3.8 million.** This reserve needs to be held against open and IBNR claims. The reserving note in the platform flags that the 20+ open and in-litigation claims could cause actual development to exceed the Chain-Ladder estimate, warranting a prudence margin of 5–8%.

---

### ③ VaR & TVaR — Aggregate Loss Distribution

**The problem it solves:** The pure premium tells you what losses are *on average*. But what happens in a bad year? What is the maximum you could reasonably expect to pay in a single policy year, at a given level of confidence?

**The technique — Lognormal Aggregate Loss Distribution:** Aggregate losses (the total of all claims in a year) are modelled using a lognormal distribution. This distribution is standard in insurance because it is always positive, right-skewed (occasional very large years are possible), and calibrated from two parameters: the mean and the coefficient of variation.

```
Parameters calibrated from your data:
  Mean (μ) = $9,104,667  (the pure premium)
  Coefficient of Variation (CV) = 0.32  (standard deviation as a fraction of the mean)
```

**Value at Risk (VaR):** The loss level that will not be exceeded in X% of years.

```
VaR at 95% confidence ≈ $13.2M
```
Interpretation: In 95 out of 100 policy years, your aggregate loss will be below $13.2M. In 5 out of 100 years, it will exceed this amount.

**Tail Value at Risk (TVaR):** The *average* loss in the worst years beyond the VaR threshold.

```
TVaR at 95% confidence ≈ $15.6M
```
Interpretation: In the 5% of years where losses exceed the VaR, the average outcome is $15.6M — not just marginally above the VaR, but significantly higher. This is why marine insurers and reinsurers focus on TVaR rather than VaR when sizing capital and catastrophe covers.

**Full percentile table:**

| Percentile | Aggregate Loss |
|-----------|----------------|
| 50th (median) | $8.7M |
| 75th | $10.9M |
| 90th | $13.2M |
| 95th | $14.8M |
| 99th | $18.4M |
| 99.5th | $19.6M |

The interactive confidence selector (90%, 95%, 99%) updates the VaR and TVaR figures in real time and highlights the tail region of the distribution curve in red.

---

### ④ Loss Ratio Analysis & Burning Cost Rate

**The problem it solves:** Premium adequacy over time. Was the premium you paid in each year sufficient to cover the losses incurred?

**Loss Ratio:**

```
Loss Ratio = Net Incurred Losses / Premium Earned
```

A loss ratio above 100% means the insurer paid out more in claims than it collected in premium (before expenses). A loss ratio below ~65% on a marine liability account typically suggests over-pricing.

| Year | Loss Ratio | Signal |
|------|-----------|--------|
| 2018 | ~61% | Favourable — lowest frequency year |
| 2019 | ~75% | Normal range |
| 2020 | ~103% | Adverse — COVID-era peak |
| 2021 | ~99% | Near break-even |
| 2022 | ~85% | Recovering |
| 2023 | ~68% | Improving, but may be IBNR-understated |

**Burning Cost Rate (BCR):** The loss ratio expressed as a rate per unit of Gross Tonnage. This strips out premium pricing entirely and shows the raw underlying cost of risk per unit of exposure. It is used to benchmark against other marine liability portfolios and to set minimum technical rates.

```
BCR = Total Inflation-Adjusted Net Losses
      ─────────────────────────────────────
      Total Gross Tonnage × Number of Years
```

The chart shows BCR broken down by claim type. Collision Liability typically dominates — it has both high frequency and high severity — while Injury to Third Parties has a lower BCR despite its frequency.

---

### ⑤ Risk Segmentation Matrix

**The problem it solves:** Not all risks in your portfolio are equal. Where is the loss concentration, and which combinations of cause and claim type are generating the most cost?

**The heatmap** cross-tabulates four causes of loss against five claim types, showing the aggregate incurred loss in each cell. The colour intensity (blue → red) maps directly to loss quantum. Cells you should pay attention to:

- **Human Error × Collision Liability** — typically the most expensive intersection in any marine liability portfolio
- **Criminal Activity × Damage to Other Vessels** — piracy-related incidents in certain ocean regions
- **Natural Disaster × Environmental Pollution** — weather events that result in cargo spills or grounding

**The radar chart** profiles each claim type simultaneously on two dimensions: average severity (how expensive per claim) and frequency (how often). Types that sit far out on both axes are your highest-priority risk management targets.

**Practical use:** If you are making investments in fleet safety or crew training, the risk segmentation matrix tells you which intervention produces the greatest expected loss reduction. Human Error causes are directly amenable to training and procedural controls. Technical Failure causes point to maintenance investment.

---

## Key Outputs at a Glance

| Output | Value | Source |
|--------|-------|--------|
| Recommended 2024 Premium | **$13.02M** | Frequency × Severity × GT + Large Loss Loading + 30% Exp + 10% Profit |
| Pure Risk Premium | **$8.84M** | Attritional experience only |
| Large Loss Loading | **$263K** | 1-in-20 year return period on CLM-00100 |
| Credibility Factor (Z) | **79.8%** | Bühlmann with k=25, n=99 |
| Credibility-Weighted Severity | **$578K** | Blending own ($588K) with industry ($550K default) |
| IBNR Reserve Estimate | **$3.8M** | Chain-Ladder across 2020–2023 accident years |
| VaR at 95% | **$13.2M** | Lognormal aggregate distribution |
| TVaR at 95% | **$15.6M** | Conditional tail expectation |
| Average Loss Ratio | **~82%** | 2018–2023, attritional basis |
| Severity Shock (+6%) Premium | **$13.78M** | +5.83% above base case |

---

## Technology Stack.

| Component | Technology | Role |
|-----------|-----------|------|
| UI Framework | React 18 | Component architecture and state management |
| Build Tool | Vite | Fast development server and production bundling |
| Charts | Recharts | All interactive visualisations (bar, line, area, pie, radar) |
| Hosting | Vercel | Zero-config deployment with CDN distribution |
| Data | Embedded JSON | All 100 claims and derived pricing tables in `src/data.js` |
| Styling | Inline CSS with CSS variables | Dark theme, consistent design tokens |

No external API calls are made. All data is embedded in the application bundle, which means the platform works offline and there are no data privacy concerns about claims data leaving your environment.

---

---

## Acknowledgements

This platform was built as the capstone deliverable for the **AIG Actuarial Analyst Virtual Experience Programme**, hosted on [Forage](https://www.theforage.com/).

The programme simulates the work of a Specialty Lines Actuarial Analyst at AIG, guiding participants through two tasks:

- **Task 1** — Understanding actuarial responsibilities, marine insurance perils and coverages, and building an outline for experience-based pricing analysis


- **Task 2** — Applying those principles to a real Marine Liability claims dataset: cleaning and preparing data, conducting EDA, building a pricing model, and communicating risk and uncertainty to stakeholders

The claims dataset, client context (Oceanic Shipping Co.), and analytical brief were all provided by AIG and Forage as part of this simulation. The platform here represents a full-stack implementation of the Task 2 deliverable — taking the Excel-based analysis brief and building it into a live, interactive actuarial dashboard.

All actuarial methodology, code, and visualisations were developed by **V. Jerono**.

> **AIG** is one of the world's leading international insurance organisations, with specialist expertise across Specialty Lines including Marine, Aviation, and Energy liability.
>
> **Forage** builds free virtual work experience programmes that give students and early-career professionals access to real-world tasks from top employers.

---

*Analyst: V. Jerono · AIG Specialty Lines Actuarial · Marine Liability Pricing Analysis*
*Platform: https://oceanic-shipping-analysis.vercel.app/*