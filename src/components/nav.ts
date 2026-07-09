import {
  LayoutDashboard,
  Wallet,
  BarChart3,
  Boxes,
  Factory,
  Megaphone,
} from "lucide-react";

export const TOP_LEVEL = [{ href: "/", label: "Overview", icon: LayoutDashboard }];

export const GROUPS = [
  {
    title: "Sales",
    icon: BarChart3,
    items: [
      { href: "/sales/primary-secondary", label: "Primary & Secondary Sales" },
      { href: "/sales/daily-report", label: "Daily Sales Report" },
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
      { href: "/marketing", label: "Marketing Pulse" },
      { href: "/marketing/events", label: "Events & Campaigns" },
      { href: "/marketing/social-comments", label: "Social Comments" },
      { href: "/marketing/price-tracker", label: "Competitor Price Tracker" },
      { href: "/marketing/new-launches", label: "New Launch Detector" },
      { href: "/marketing/stockout-sniper", label: "Stockout Sniper" },
    ],
  },
];

export const BOTTOM_LEVEL = [{ href: "/cashflow", label: "Cash Flow", icon: Wallet }];
