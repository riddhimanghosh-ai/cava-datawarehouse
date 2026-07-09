import {
  Wallet,
  BarChart3,
  Boxes,
  Factory,
  Megaphone,
  Sparkles,
} from "lucide-react";

export const TOP_LEVEL = [
  { href: "/assistant", label: "Ask AI", icon: Sparkles },
];

export const GROUPS = [
  {
    title: "Sales",
    icon: BarChart3,
    items: [
      { href: "/sales/primary-secondary", label: "Primary & Secondary Sales" },
      { href: "/sales/daily-report", label: "Daily Sales Report" },
      { href: "/sales/city-report", label: "City-Level Sales Report" },
      { href: "/sales/campaign-report", label: "Campaign Sales Report" },
    ],
  },
  {
    title: "Inventory & Demand Forecasting",
    icon: Boxes,
    items: [
      { href: "/inventory", label: "Inventory" },
      { href: "/forecasting", label: "Demand Forecasting" },
    ],
  },
  {
    title: "Supply Chain Management",
    icon: Factory,
    items: [
      { href: "/scm", label: "SCM" },
      { href: "/pricing", label: "Pricing Tracker" },
    ],
  },
  {
    title: "Marketing",
    icon: Megaphone,
    items: [
      { href: "/marketing/shopify-analytics", label: "Shopify Analytics" },
      { href: "/marketing/google-analytics", label: "Google Analytics" },
      { href: "/marketing/meta-ads", label: "Meta & Google Ads" },
      { href: "/marketing/events", label: "Events & Campaigns" },
      { href: "/marketing/social-comments", label: "Social Comments" },
      { href: "/marketing/price-tracker", label: "Competitor Price Tracker" },
      { href: "/marketing/new-launches", label: "New Launch Detector" },
      { href: "/marketing/stockout-sniper", label: "Stockout Sniper" },
    ],
  },
];

export const BOTTOM_LEVEL = [{ href: "/cashflow", label: "Cash Flow", icon: Wallet }];
