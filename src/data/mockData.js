// ============================================================
// ANCHOR — Portfolio Data, Market Data & Scenario Logic
// Real stock tickers linked to Yahoo Finance for live prices
// ============================================================

// Goldman Sachs–style portfolio for a retail investor
export const mockPortfolio = {
  user: "Sarah",
  goal: "Buy a house",
  goalYear: 2027,
  totalValue: 500000,
  monthlyInvestment: 15000,
  targetAmount: 6000000, // ₹60L house target
  allocation: { equity: 62, debt: 28, gold: 10 },

  // STOCKS — linked to real tickers (Yahoo Finance)
  stocks: [
    {
      id: "s1",
      name: "Reliance Industries",
      ticker: "RELIANCE.NS",
      exchange: "NSE",
      shares: 20,
      buyPrice: 2450,
      currentPrice: 2510,
      value: 50200,
      change: +0.8,
      sector: "Energy & Telecom",
      risk: "Medium",
      yahooUrl: "https://finance.yahoo.com/quote/RELIANCE.NS",
    },
    {
      id: "s2",
      name: "Infosys",
      ticker: "INFY.NS",
      exchange: "NSE",
      shares: 35,
      buyPrice: 1380,
      currentPrice: 1425,
      value: 49875,
      change: +1.4,
      sector: "Information Technology",
      risk: "Medium",
      yahooUrl: "https://finance.yahoo.com/quote/INFY.NS",
    },
    {
      id: "s3",
      name: "HDFC Bank",
      ticker: "HDFCBANK.NS",
      exchange: "NSE",
      shares: 30,
      buyPrice: 1620,
      currentPrice: 1598,
      value: 47940,
      change: -1.3,
      sector: "Banking & Finance",
      risk: "Low-Medium",
      yahooUrl: "https://finance.yahoo.com/quote/HDFCBANK.NS",
    },
    {
      id: "s4",
      name: "Tata Motors",
      ticker: "TATAMOTORS.NS",
      exchange: "NSE",
      shares: 60,
      buyPrice: 780,
      currentPrice: 812,
      value: 48720,
      change: +2.1,
      sector: "Automobiles",
      risk: "High",
      yahooUrl: "https://finance.yahoo.com/quote/TATAMOTORS.NS",
    },
  ],

  // MUTUAL FUNDS — SEBI-registered, real AMCs
  funds: [
    {
      id: "f1",
      name: "Axis Bluechip Fund",
      amcCode: "AXISMF",
      type: "Equity – Large Cap",
      value: 115000,
      units: 2840,
      nav: 40.49,
      change: +2.4,
      risk: "High",
      expenseRatio: 0.54,
      minSip: 500,
      category: "Equity",
      amfiUrl: "https://www.amfiindia.com/",
    },
    {
      id: "f2",
      name: "HDFC Mid-Cap Opportunities",
      amcCode: "HDFCMF",
      type: "Equity – Mid Cap",
      value: 76000,
      units: 1521,
      nav: 49.97,
      change: -1.1,
      risk: "Very High",
      expenseRatio: 0.89,
      minSip: 500,
      category: "Equity",
      amfiUrl: "https://www.amfiindia.com/",
    },
    {
      id: "f3",
      name: "SBI Short Term Debt Fund",
      amcCode: "SBIMF",
      type: "Debt – Short Duration",
      value: 140000,
      units: 5833,
      nav: 24.00,
      change: +0.6,
      risk: "Low",
      expenseRatio: 0.40,
      minSip: 500,
      category: "Debt",
      amfiUrl: "https://www.amfiindia.com/",
    },
    {
      id: "f4",
      name: "Nippon India Gold ETF",
      amcCode: "NIPPONMF",
      type: "Gold ETF",
      value: 50000,
      units: 890,
      nav: 56.18,
      change: +1.8,
      risk: "Medium",
      expenseRatio: 0.82,
      minSip: null,
      category: "Gold",
      amfiUrl: "https://www.amfiindia.com/",
    },
  ],

  riskScore: 6.4,
  goalProgress: 68,
  onTrack: true,
  vulnerabilities: [
    "Sensitive to short-term market swings due to 62% equity exposure",
    "Low liquidity buffer — forced selling could lock in losses",
    "Mid-cap holdings (HDFC Mid-Cap) carry higher volatility",
  ],
};

// ============================================================
// RISK EXPOSURE ENGINE — Detailed breakdown for Radical Transparency
// ============================================================
export function getRiskBreakdown() {
  return {
    overall: 6.4,
    label: "Moderate-High",
    components: [
      {
        name: "Market Risk",
        score: 7.2,
        label: "High",
        color: "var(--rose)",
        explanation: "62% of your portfolio is in equities (stocks + equity mutual funds). If markets fall 20%, your portfolio could lose approximately ₹62,000 in value. This is normal for long-term investors but painful if you need cash soon.",
        simple: "Your money is in things that can go up and down a lot. A bad week could mean losing ₹62,000 on paper.",
      },
      {
        name: "Liquidity Risk",
        score: 5.8,
        label: "Medium",
        color: "var(--amber)",
        explanation: "Most of your assets are in mutual funds with 1-3 day settlement. Stocks can be sold same day. However, exit loads and short-term tax penalties apply if you sell within 1 year. Emergency cash availability is limited.",
        simple: "If you needed money urgently tomorrow, it would take 1-3 days to get it, and you might pay a penalty fee.",
      },
      {
        name: "Concentration Risk",
        score: 5.2,
        label: "Medium",
        color: "var(--amber)",
        explanation: "Your equity holdings are spread across 4 sectors (Energy, IT, Banking, Auto). However, 3 of 4 stocks are sensitive to economic slowdowns. A recession could impact all simultaneously.",
        simple: "You're not putting all eggs in one basket, but your baskets are all in the same room.",
      },
      {
        name: "Inflation Risk",
        score: 4.1,
        label: "Low-Medium",
        color: "var(--sage)",
        explanation: "28% in debt funds helps, but if inflation stays above 6%, your debt returns may not keep pace. Gold (10%) partially hedges this. Overall inflation protection is adequate but not strong.",
        simple: "If prices rise fast, your safer investments might not grow fast enough to keep up.",
      },
    ],
  };
}

// ============================================================
// MACROECONOMIC SCENARIO ENGINE
// ============================================================
export const macroScenarios = [
  {
    id: "market_crash",
    label: "Market Crash",
    description: "Markets fall 20–30% (like 2020 COVID crash)",
    icon: "↓",
    severity: "high",
    presets: { marketDrop: 25, cashNeed: 0 },
    context: "Historical precedent: Nifty 50 fell 38% in Feb–Mar 2020. Recovery took 8 months.",
  },
  {
    id: "inflation_spike",
    label: "Inflation Spike",
    description: "CPI rises above 8% for 6+ months",
    icon: "↑",
    severity: "medium",
    presets: { marketDrop: 10, cashNeed: 0 },
    context: "High inflation erodes debt fund returns and squeezes corporate margins, hitting mid-cap stocks hardest.",
    specialNote: "Recommendation: Increase gold allocation to 15-20% as inflation hedge.",
  },
  {
    id: "rate_hike",
    label: "RBI Rate Hike",
    description: "Interest rates rise 1–2% (tightening cycle)",
    icon: "⬆",
    severity: "medium",
    presets: { marketDrop: 12, cashNeed: 0 },
    context: "Rate hikes hurt growth stocks and long-duration bonds. Banking stocks may benefit short-term.",
    specialNote: "Move debt funds to shorter-duration funds to reduce interest rate sensitivity.",
  },
  {
    id: "geopolitical",
    label: "Geopolitical Shock",
    description: "Global conflict or trade war disruption",
    icon: "⚡",
    severity: "high",
    presets: { marketDrop: 18, cashNeed: 0 },
    context: "Like Russia-Ukraine in 2022, which caused Nifty to fall 15% in 6 weeks. Oil-linked sectors recover last.",
    specialNote: "Energy sector (Reliance) may initially spike, then correct.",
  },
  {
    id: "job_loss",
    label: "Job Instability",
    description: "Income disruption — need emergency funds",
    icon: "⚠",
    severity: "high",
    presets: { marketDrop: 0, cashNeed: 30 },
    context: "Personal financial shock is often more damaging than market shock for retail investors.",
  },
  {
    id: "recession",
    label: "Mild Recession",
    description: "GDP growth slows to below 4% for 2 quarters",
    icon: "↘",
    severity: "medium",
    presets: { marketDrop: 15, cashNeed: 10 },
    context: "Mid-cap funds typically fall 25-30% in recessions. Large-cap and debt funds are more resilient.",
  },
];

// ============================================================
// SCENARIO ENGINE — Extended with macro + rebalancing suggestions
// ============================================================
export function runScenario({ marketDrop, cashNeed, emotion, macroId }) {
  let equityShift = 0;
  let goalDelay   = 0;
  let confidence  = 90;

  if (marketDrop >= 10) { equityShift += 10; confidence -= 5; }
  if (marketDrop >= 20) { equityShift += 8;  confidence -= 5; }
  if (marketDrop >= 30) { equityShift += 7;  confidence -= 5; }
  if (cashNeed   >= 10) { equityShift += 5;  confidence -= 3; }
  if (cashNeed   >= 20) { equityShift += 8;  confidence -= 4; }
  if (cashNeed   >= 30) { equityShift += 5;  confidence -= 3; }
  if (emotion === "anxious") { equityShift += 3; confidence -= 2; }

  goalDelay   = Math.round((marketDrop * 0.35) + (cashNeed * 0.25));
  equityShift = Math.min(equityShift, 35);
  confidence  = Math.max(confidence, 55);

  const newEquity = Math.max(mockPortfolio.allocation.equity - equityShift, 30);
  const newDebt   = Math.min(mockPortfolio.allocation.debt + Math.round(equityShift * 0.7), 55);
  const newGold   = Math.min(mockPortfolio.allocation.gold + Math.round(equityShift * 0.3), 20);

  const amountShifted = (equityShift / 100) * mockPortfolio.totalValue;
  const taxImpact     = Math.round(amountShifted * 0.012);
  const exitLoad      = Math.round(amountShifted * 0.005);

  // Specific stock & fund rebalancing suggestions
  const rebalancingSuggestions = buildRebalancingSuggestions(marketDrop, cashNeed, macroId, equityShift);
  const macro = macroScenarios.find(s => s.id === macroId) || null;

  return {
    equityShift,
    goalDelay,
    confidence,
    newAllocation: { equity: newEquity, debt: newDebt, gold: newGold },
    taxImpact,
    exitLoad,
    steps: buildSteps(equityShift, cashNeed, emotion, macroId),
    doNothingConsequence: buildDoNothingText(marketDrop, cashNeed, goalDelay),
    rebalancingSuggestions,
    macroContext: macro?.context || null,
    macroSpecialNote: macro?.specialNote || null,
  };
}

function buildRebalancingSuggestions(marketDrop, cashNeed, macroId, equityShift) {
  const suggestions = [];

  if (equityShift <= 0) {
    suggestions.push({ action: "Hold", asset: "All positions", reason: "No rebalancing needed in this scenario.", type: "hold" });
    return suggestions;
  }

  // Stocks to consider reducing
  if (marketDrop >= 20 || macroId === "market_crash" || macroId === "recession") {
    suggestions.push({
      action: "Reduce",
      asset: "HDFC Mid-Cap Opportunities Fund",
      detail: "Mid-cap funds fall 2x harder than large-caps in crashes",
      amount: "Partial — move 50% of this fund's value to SBI Short Term Debt",
      type: "sell",
      reason: "Mid-cap historically drops 30-40% in market crashes vs 15-20% for large-cap",
    });
    suggestions.push({
      action: "Reduce",
      asset: "Tata Motors (TATAMOTORS.NS)",
      detail: "Auto stocks are cyclical — highly sensitive to slowdowns",
      amount: "Consider trimming 30-40% of your holding",
      type: "sell",
      reason: "Auto sector is typically one of the first to fall in economic downturns",
    });
  }

  if (macroId === "inflation_spike") {
    suggestions.push({
      action: "Increase",
      asset: "Nippon India Gold ETF",
      detail: "Gold is the strongest inflation hedge",
      amount: "Increase allocation from 10% to 18%",
      type: "buy",
      reason: "Gold has historically outperformed during high-inflation periods",
    });
    suggestions.push({
      action: "Switch",
      asset: "SBI Short Term Debt Fund",
      detail: "Move to a floating rate fund to protect from inflation erosion",
      amount: "Switch 50% of your debt fund to a floating rate bond fund",
      type: "switch",
      reason: "Floating rate funds adjust returns with RBI rate changes, protecting your purchasing power",
    });
  }

  if (macroId === "rate_hike") {
    suggestions.push({
      action: "Switch",
      asset: "SBI Short Term Debt Fund",
      detail: "Short-duration is better when rates are rising",
      amount: "Already in short-term — no action needed on this holding",
      type: "hold",
      reason: "Your existing debt fund is correctly positioned for rate hikes",
    });
    suggestions.push({
      action: "Hold",
      asset: "HDFC Bank (HDFCBANK.NS)",
      detail: "Banks benefit from rate hikes via better net interest margins",
      amount: "Maintain or increase your HDFC Bank position",
      type: "hold",
      reason: "Rate hike cycles are generally positive for well-capitalized banks",
    });
  }

  if (cashNeed >= 20) {
    suggestions.push({
      action: "Liquidate First",
      asset: "SBI Short Term Debt Fund (partial)",
      detail: "Lowest exit load, no tax penalty on debt funds held >3 years",
      amount: `Withdraw ₹${Math.round((cashNeed / 100) * mockPortfolio.totalValue).toLocaleString("en-IN")} from this fund first`,
      type: "liquidate",
      reason: "Liquidating debt funds avoids selling equities at a loss. This is the most tax-efficient source of emergency cash.",
    });
  }

  // Always end with a stable hold
  if (suggestions.length === 0 || !suggestions.find(s => s.type === "hold")) {
    suggestions.push({
      action: "Hold",
      asset: "Axis Bluechip Fund & Reliance Industries",
      detail: "Large-cap, stable holdings — no action needed",
      amount: "Maintain current positions",
      type: "hold",
      reason: "These are your portfolio anchors — high-quality assets that should weather volatility",
    });
  }

  return suggestions;
}

function buildSteps(equityShift, cashNeed, emotion, macroId) {
  const steps = [];
  if (equityShift > 0) {
    steps.push(`Shift ${equityShift}% of your equity holdings into short-term debt funds`);
  }
  if (macroId === "inflation_spike") {
    steps.push("Increase your gold allocation from 10% to 18% using Nippon India Gold ETF");
  }
  if (cashNeed >= 20) {
    steps.push("Pause your monthly SIP top-up for the next 6 months");
    steps.push("Create a liquid fund emergency buffer of at least ₹75,000");
  }
  if (emotion === "anxious") {
    steps.push("Set a price alert on your equity stocks — only review if they fall more than 10%");
  }
  steps.push("Schedule a portfolio review in 3 months or when Nifty moves more than 8%");
  return steps;
}

function buildDoNothingText(marketDrop, cashNeed, goalDelay) {
  if (goalDelay === 0) return "You're in good shape — no urgent action needed.";
  if (goalDelay <= 6)  return `Your house goal could slip by about ${goalDelay} months. Minor but worth watching.`;
  if (goalDelay <= 14) return `You may need to wait an extra ${goalDelay} months before you can afford your house. That's ${goalDelay} more months of rent.`;
  return `Your house goal could be pushed back by ~${goalDelay} months — over a year of extra waiting and rent payments.`;
}

// ============================================================
// CHATBOT CONTEXT — Portfolio-aware Q&A data
// ============================================================
export function getPortfolioContext() {
  const p = mockPortfolio;
  const totalStockValue = p.stocks.reduce((s, x) => s + x.value, 0);
  const totalFundValue  = p.funds.reduce((s, x) => s + x.value, 0);

  return `
You are Anchor, a friendly and knowledgeable portfolio assistant for a Goldman Sachs hackathon demo.
You are speaking with Sarah, a 26-year-old first-time investor who wants to buy a house by 2027.

SARAH'S PORTFOLIO SUMMARY:
- Total portfolio value: ₹${p.totalValue.toLocaleString("en-IN")}
- Monthly SIP: ₹${p.monthlyInvestment.toLocaleString("en-IN")}
- Goal: Buy a house by ${p.goalYear}, target ₹60 lakhs
- Goal progress: ${p.goalProgress}% saved
- Allocation: ${p.allocation.equity}% Equity, ${p.allocation.debt}% Debt, ${p.allocation.gold}% Gold

STOCKS (Total: ₹${totalStockValue.toLocaleString("en-IN")}):
${p.stocks.map(s => `- ${s.name} (${s.ticker}): ${s.shares} shares at ₹${s.currentPrice}, current value ₹${s.value.toLocaleString("en-IN")}, today: ${s.change > 0 ? "+" : ""}${s.change}%`).join("\n")}

MUTUAL FUNDS (Total: ₹${totalFundValue.toLocaleString("en-IN")}):
${p.funds.map(f => `- ${f.name}: ₹${f.value.toLocaleString("en-IN")}, NAV ₹${f.nav}, expense ratio ${f.expenseRatio}%, today: ${f.change > 0 ? "+" : ""}${f.change}%`).join("\n")}

KEY RISKS:
- Sensitive to short-term market swings (62% equity)
- Low liquidity buffer
- Mid-cap fund carries higher volatility

YOUR ROLE:
- Answer in simple, jargon-free language
- Always relate answers to Sarah's actual portfolio and goal
- Never recommend specific buy/sell decisions as hard advice — frame as education
- Keep answers concise (3-5 sentences max unless a complex question)
- If asked about a stock or fund Sarah owns, give specific details from her holdings
- Mention the "Scenario Engine" or "Transparency Panel" features when relevant
- You are NOT a licensed financial advisor — remind Sarah to consult one for major decisions
- Only discuss stocks and mutual funds — not crypto, real estate investment, or derivatives
`.trim();
}
