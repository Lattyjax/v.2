/**
 * Latimore Brand Story & Strategy Templates
 * Migrated from Vite partner project
 */

export const BRAND_STORY = {
  founder: 'Jackson M. Latimore Sr.',
  origin: 'Jackson M. Latimore Sr. survived sudden cardiac arrest on December 7, 2010, while playing basketball at East Stroudsburg University. An AED was available and used by trainers to restart his heart. This life-altering event, combined with the story of Greg Moyer (who passed away in 2000 due to the lack of an AED), became the foundation for Latimore Life & Legacy LLC.',
  mission: 'To help families and organizations protect what matters and build legacies that outlive them — using clear education and preparation, never fear-based messaging.',
  tagline: 'Protecting Today. Securing Tomorrow.',
  hashtag: '#TheBeatGoesOn',
}

export const FUNNEL_BLUEPRINTS = [
  {
    id: 'f1',
    name: 'The Mortgage Protection Mastery',
    category: 'Life Insurance',
    persona: 'New Homeowners',
    stages: ['Regional FB Hook', 'Home Security Webinar', 'Direct App Link'],
    description:
      'A focused strategy to convert recent homebuyers by framing life insurance as the ultimate mortgage safeguard.',
  },
  {
    id: 'f2',
    name: 'Wealth Engine (IUL Depth)',
    category: 'Life Insurance',
    persona: 'High Income Accumulators',
    stages: ['LinkedIn Strategy Post', 'The 3 Rules of Money PDF', 'Discovery Call'],
    description:
      'Deep-dive educational funnel focusing on the "And" asset (IUL) for tax-advantaged growth.',
  },
  {
    id: 'f3',
    name: 'Safe Income Advantage (FIA)',
    category: 'Annuities',
    persona: 'Retirees (Age 60+)',
    stages: ['Volatility News Hook', 'Personal Pension Video', 'In-Person Review'],
    description:
      'Designed for the risk-averse looking for market-proof income and the Rule of 72 benefits.',
  },
]

export const LANDING_PAGE_BLUEPRINTS = [
  {
    id: 'lp1',
    name: 'The Legacy Protector (Classic)',
    category: 'General Life',
    sections: ['Hero: Family Security', 'The Jackson Story', '3-Bucket Education', 'Legacy Form'],
    description: 'A clean, high-trust layout focusing on the emotional core of protection.',
  },
  {
    id: 'lp2',
    name: 'The IUL Wealth Builder',
    category: 'Wealth Building',
    sections: ['Tax-Free Growth Hook', 'Market Volatility Comparison', 'Living Benefits Grid', 'Apply Now'],
    description: 'Modern, data-driven layout for younger professionals interested in IUL.',
  },
  {
    id: 'lp3',
    name: 'Annuity Safety Net',
    category: 'Retirement',
    sections: ['Market Crash Proof Hero', 'Personal Pension Explainer', 'Client Testimonials', 'Free Review CTA'],
    description: 'Trust-heavy layout for seniors worried about their nest egg.',
  },
]

export const FORM_BLUEPRINTS = [
  {
    id: 'frm1',
    name: 'Velocity Instant Quote',
    fields: ['Full Name', 'DOB', 'Tobacco Status', 'Coverage Amount'],
    description: 'Lightweight lead capture for Ethos/Velocity Term leads.',
  },
  {
    id: 'frm2',
    name: 'Full Legacy Discovery',
    fields: ['Family Size', 'Mortgage Balance', 'Current Assets', 'Goal Ranking'],
    description: 'Comprehensive discovery form for IUL and Holistic Legacy planning.',
  },
  {
    id: 'frm3',
    name: 'Pension Analysis Request',
    fields: ['Retirement Year', 'Current 401k Balance', 'Risk Tolerance', 'Desired Income'],
    description: 'Targeted form for FIA and Annuity opportunities.',
  },
]

export const LIBRARY_TEMPLATES = [
  {
    id: 'l0',
    category: 'Legacy & Estate',
    subCategory: 'Legacy Protection',
    title: 'The Importance of Securing Legacy',
    description:
      "A high-impact strategy explaining how life insurance acts as the ultimate bedrock for a family's future.",
    structure:
      "Open with the concept that a legacy isn't just what you leave FOR someone, but what you leave IN them. Transition to the financial tools (IUL/Term) that ensure the mission continues. Emphasize preparation over fear. CTA: Start building your legacy blueprint today.",
    hashtags: ['LegacyBuilding', 'FamilyFirst', '#TheBeatGoesOn', 'LatimoreLegacy'],
  },
  {
    id: 'l1',
    category: 'Life Insurance',
    subCategory: 'Mortgage Protection',
    title: 'Home Security Beyond the Locks',
    description: 'A compelling post explaining why life insurance is the ultimate mortgage safety net.',
    structure:
      'Start by asking homeowners what their biggest monthly expense is. Transition to the risk of losing income. Explain how mortgage protection works as a specific term policy. Call to action: "Ensure your family keeps the keys, no matter what."',
    hashtags: ['MortgageProtection', 'Homeowners', 'PeaceOfMind'],
  },
  {
    id: 'l2',
    category: 'Life Insurance',
    subCategory: 'IUL',
    title: 'The "And" Asset Strategy (Builder Plus 4)',
    description:
      'Explaining Indexed Universal Life for both protection and supplemental retirement using the North American Builder Plus 4.',
    structure:
      'Focus on the "Tax-Free" bucket. Compare traditional savings to IUL growth potential with a 0% floor. Emphasize the death benefit AND the living benefits. End with a legacy-building prompt. Reference IRS codes 7702A, 72E, and 101A.',
    hashtags: ['IUL', 'TaxFreeRetirement', 'WealthBuilding'],
  },
  {
    id: 'l3',
    category: 'Annuities',
    subCategory: 'FIA',
    title: 'Safe Income Advantage (Rule of 72)',
    description:
      'Breaking down Fixed Indexed Annuities (FIA) for retirees worried about market volatility, highlighting the F&G Safe Income Advantage.',
    structure:
      'Acknowledge the stress of market swings. Introduce the "Personal Pension". Detail the Rule of 72 benefit: 7.2% compounded roll-up rate that doubles the income base every 10 years if deferred.',
    hashtags: ['Annuities', 'RetirementPlanning', 'FinancialSafety'],
  },
  {
    id: 'l4',
    category: 'Life Insurance',
    subCategory: 'Final Expense',
    title: 'A Gift of Love, Not a Burden',
    description: 'Soft and empathetic approach to Final Expense coverage for seniors.',
    structure:
      'Open with a warm family memory. Pivot to the reality of funeral costs. Explain how a small policy removes the financial burden from children. Tagline: #TheBeatGoesOn.',
    hashtags: ['FinalExpense', 'Seniors', 'LegacyLove'],
  },
  {
    id: 'l5',
    category: 'Business Protection',
    subCategory: 'Key Person',
    title: 'Protecting the Leadership Beat',
    description:
      'Business insurance for key employees and partners, specifically for school districts and SMEs.',
    structure:
      'Ask a superintendent or business owner what happens if a vital leader is lost. Discuss transition costs and continuity. Propose Key Person Insurance as a stabilizer for the organization.',
    hashtags: ['SchoolDistricts', 'KeyPersonInsurance', 'ContinuityPlanning'],
  },
  {
    id: 'l6',
    category: 'Life Insurance',
    subCategory: 'Ethos Velocity',
    title: 'Protection in 10 Minutes',
    description:
      'Highlighting the "Velocity Engine" via the Ethos platform for quick term life needs.',
    structure:
      'Focus on speed and simplicity. 10-minute online application, no medical exams for many, instant decisions. Ideal for busy young families in Central PA.',
    hashtags: ['Ethos', 'QuickLifeInsurance', 'ModernProtection'],
  },
]

export const NAV_ITEMS_NEW = [
  { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line', href: '/admin/dashboard' },
  { id: 'links', label: 'Portals & Links', icon: 'fa-link', href: '/admin/links' },
  { id: 'docs', label: 'Brochures & Docs', icon: 'fa-folder-open', href: '/admin/docs' },
  { id: 'inbox', label: 'Inbox (Intake)', icon: 'fa-inbox', href: '/admin/inbox' },
  { id: 'crm', label: 'Life Hub CRM', icon: 'fa-users-gear', href: '/admin/crm/hub' },
  { id: 'library', label: 'Strategy Library', icon: 'fa-book-bookmark', href: '/admin/library' },
  { id: 'vault', label: 'Asset Vault', icon: 'fa-vault', href: '/admin/vault' },
  { id: 'creator', label: 'Content Architect', icon: 'fa-pen-nib', href: '/admin/content/creator' },
  { id: 'tools', label: 'Marketing Tools', icon: 'fa-toolbox', href: '/admin/marketing' },
  { id: 'funnels', label: 'Legacy Hub', icon: 'fa-filter-circle-dollar', href: '/admin/funnels' },
  { id: 'schedule', label: 'Schedule', icon: 'fa-calendar-check', href: '/admin/content/schedule' },
  { id: 'campaigns', label: 'Campaigns', icon: 'fa-calendar-days', href: '/admin/content/campaigns' },
  { id: 'connectors', label: 'Integrations', icon: 'fa-plug', href: '/admin/connectors' },
  { id: 'settings', label: 'Settings', icon: 'fa-gear', href: '/admin/settings' },
]
