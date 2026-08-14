import React from 'react';
import {
  ShieldCheck,
  Scale,
  Database,
  Lock,
  ExternalLink,
  Code,
  Award,
  Sparkles,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-purple-hero border border-brand-200/80 shadow-glass relative overflow-hidden glass-panel">
        <div className="flex items-center space-x-2 text-brand-700 font-bold text-xs uppercase tracking-wider font-mono mb-2">
          <span className="px-2 py-0.5 rounded-full bg-brand-100/70 border border-brand-200">📐 ALGORITHM TRANSPARENCY</span>
          <span>•</span>
          <span className="text-emerald-700 font-bold">100% AUDITABLE CODE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gradient-hero font-['Outfit']">
          How JanHisab Computes Accountability
        </h1>
        <p className="text-xs sm:text-sm text-textSecondary mt-2 max-w-2xl leading-relaxed">
          No black-box algorithms. No partisan bias. Every score on this platform is computable by anyone using published equations and verified public databases.
        </p>
      </div>

      {/* The Master Formula */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white border border-brand-200/80 shadow-glass glass-card space-y-6">
        <h2 className="text-2xl font-black text-textPrimary font-['Outfit'] flex items-center space-x-2">
          <Scale className="w-6 h-6 text-brand-600" />
          <span>The 4-Pillar Impact Score™ Equation</span>
        </h2>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-sm leading-relaxed overflow-x-auto shadow-inner">
          <p className="text-brand-300 font-bold mb-2">// Master Mathematical Composite Formula</p>
          <p className="text-white">Impact Score = (0.45 × ObjectiveData) + (0.25 × VerifiedOutcomes) + (0.20 × WilsonDampenedSentiment) + (0.10 × TrustDecay)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-textSecondary">
          <div className="p-5 rounded-2xl bg-brand-50/50 border border-brand-100 space-y-2">
            <h4 className="font-bold text-textPrimary text-sm font-['Outfit']">1. Objective Data (45%)</h4>
            <p>Direct metrics from Digital Sansad, PRS India & ECI Affidavits:</p>
            <ul className="list-disc pl-4 space-y-1 text-slate-700">
              <li>Parliament / Assembly Attendance Rate (15%)</li>
              <li>Legislative Questions & Debates Raised (15%)</li>
              <li>Criminal Affidavits & Conviction Penalties (20%)</li>
              <li>MPLAD / MLALAD Fund Sanction & Utilization (15%)</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
            <h4 className="font-bold text-emerald-900 text-sm font-['Outfit']">2. Verified Outcomes (25%)</h4>
            <p>Ground delivery corroborated by multiple citizens and RTI documents:</p>
            <ul className="list-disc pl-4 space-y-1 text-emerald-800">
              <li>Manifesto Promise Delivery Ratio (30%)</li>
              <li>Geotagged Issue Resolutions (30%)</li>
              <li>Public RTI Response Vault Disclosures (25%)</li>
              <li>Certified Evidence Sources Attached (15%)</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
            <h4 className="font-bold text-purple-900 text-sm font-['Outfit']">3. Community Sentiment (20%)</h4>
            <p>Wilson 95% confidence interval + Quadratic cost:</p>
            <ul className="list-disc pl-4 space-y-1 text-purple-800">
              <li>Quadratic dampening: Effective Weight = √credits spent</li>
              <li>Wilson lower-bound neutralizes low-sample brigade bursts</li>
              <li>Constituency Registered Voter Weight = 3.0x multiplier</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-textPrimary text-sm font-['Outfit']">4. Trust Decay Factor (10%)</h4>
            <p>Exponential decay favoring fresh verified work:</p>
            <ul className="list-disc pl-4 space-y-1 text-slate-700">
              <li>Decay Rate: e^(-λ × Δt) where λ = 0.05 / month</li>
              <li>Promises delivered in the last 6 months receive highest weight</li>
              <li>Past unaddressed issues compound penalties over time</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Anti-IT-Cell Brigade Proofs */}
      <div className="p-8 rounded-3xl bg-white border border-brand-200/80 shadow-glass glass-card space-y-4">
        <h3 className="text-xl font-bold text-textPrimary font-['Outfit'] flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Anti-Bot & Anti-Brigading Protections</span>
        </h3>
        <div className="space-y-3 text-xs text-textSecondary leading-relaxed">
          <p>
            Political parties routinely employ coordinated IT cells to flood social media polls. JanHisab neutralizes this via three mathematical barriers:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100">
              <strong className="text-textPrimary block mb-1">1. Quadratic Cost</strong>
              <span>Casting 10 votes requires 100 points ($n^2$), preventing single coordinated accounts from hijacking rankings.</span>
            </div>
            <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100">
              <strong className="text-textPrimary block mb-1">2. Wilson Confidence</strong>
              <span>A politician with 5 positive bot votes will never outrank one with 5,000 mixed authentic votes.</span>
            </div>
            <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100">
              <strong className="text-textPrimary block mb-1">3. Evidence Multipliers</strong>
              <span>Verified RTI copies grant a 3.0x multiplier, making hard facts 300% more powerful than unverified claims.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Sources Citations */}
      <div className="p-8 rounded-3xl bg-white border border-brand-200/80 shadow-glass glass-card space-y-4">
        <h3 className="text-xl font-bold text-textPrimary font-['Outfit'] flex items-center space-x-2">
          <Database className="w-5 h-5 text-brand-600" />
          <span>Open Data Citations & Sources</span>
        </h3>
        <p className="text-xs text-textSecondary">
          All baseline parliamentary and asset records are sourced under the Open Government Data (OGD) Platform India:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center font-bold text-textPrimary">
            🏛️ PRS Legislative Research
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center font-bold text-textPrimary">
            📜 ADR / MyNeta Affidavits
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center font-bold text-textPrimary">
            🗳️ Election Commission of India
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center font-bold text-textPrimary">
            💻 Digital Sansad (Lok Sabha)
          </div>
        </div>
      </div>
    </div>
  );
}
