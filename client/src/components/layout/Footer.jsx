import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Scale, Globe, Heart, Lock, ExternalLink, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-brand-100 text-textSecondary text-xs mt-20 relative overflow-hidden">
      {/* Soft Purple Glow Blobs in Background */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-200/20 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: Platform Purpose */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-indigo-600 flex items-center justify-center text-lg text-white shadow-purple-glow">
                🏛️
              </div>
              <span className="text-xl font-extrabold text-gradient-hero font-['Outfit']">JanAudit</span>
            </div>
            <p className="text-textSecondary text-xs leading-relaxed">
              India's Citizen-Powered Public Accountability Platform. Every promise tracked, every claim evidenced, every score explainable.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-brand-700 font-bold">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Pro-Democracy • Pro-Transparency</span>
            </div>
          </div>

          {/* Col 2: Core Modules */}
          <div>
            <h4 className="text-textPrimary font-bold text-xs uppercase tracking-wider mb-4 font-['Outfit']">
              Civic Modules
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/" className="hover:text-brand-600 transition-colors font-medium">🗣️ Anonymous Voice Wall</Link></li>
              <li><Link to="/politicians" className="hover:text-brand-600 transition-colors font-medium">🏛️ MP & MLA Directory</Link></li>
              <li><Link to="/promises" className="hover:text-brand-600 transition-colors font-medium">🗳️ Wada Tracker (Promises)</Link></li>
              <li><Link to="/rti-factory" className="hover:text-brand-600 transition-colors font-medium">📜 RTI Factory (Drafts)</Link></li>
              <li><Link to="/petitions" className="hover:text-brand-600 transition-colors font-medium">🤝 Petitions Center</Link></li>
              <li><Link to="/constituency-map" className="hover:text-brand-600 transition-colors font-medium">🗺️ Leaflet Issue Map</Link></li>
            </ul>
          </div>

          {/* Col 3: Gamification & Media */}
          <div>
            <h4 className="text-textPrimary font-bold text-xs uppercase tracking-wider mb-4 font-['Outfit']">
              Culture & Engagement
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/meme-studio" className="hover:text-brand-600 transition-colors font-medium">🎭 Meme Studio & Roasts</Link></li>
              <li><Link to="/protest-jukebox" className="hover:text-brand-600 transition-colors font-medium">🎵 Protest Jukebox (Awaaz)</Link></li>
              <li><Link to="/neta-cards" className="hover:text-brand-600 transition-colors font-medium">🃏 Collectible Neta Cards</Link></li>
              <li><Link to="/bounties" className="hover:text-brand-600 transition-colors font-medium">🎯 Investigation Bounties</Link></li>
              <li><Link to="/andolan" className="hover:text-brand-600 transition-colors font-medium">📢 Andolan 48h Live Room</Link></li>
              <li><Link to="/about" className="hover:text-brand-600 transition-colors font-medium">📐 Published Scoring Algorithm</Link></li>
            </ul>
          </div>

          {/* Col 4: Legal & Safe Harbor Compliance */}
          <div className="space-y-3">
            <h4 className="text-textPrimary font-bold text-xs uppercase tracking-wider font-['Outfit']">
              Legal Architecture
            </h4>
            <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-200/80 text-[11px] space-y-2 text-textSecondary glass-card">
              <p className="flex items-center space-x-1.5 text-emerald-700 font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>Zero-PII & EXIF Stripped</span>
              </p>
              <p className="leading-relaxed">
                Intermediary Safe Harbor protected under Section 79 of the IT Act, 2000.
              </p>
              <p className="border-t border-brand-200/60 pt-2 text-[10px]">
                <strong className="text-textPrimary">Grievance Redressal Officer:</strong><br />
                Adv. R. Narayanan (SLA: 24h ack, 15d resolution)
              </p>
              <Link
                to="/grievance"
                className="inline-block text-brand-700 hover:text-brand-800 font-bold text-[11px]"
              >
                File IT Rules 2021 Grievance →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-brand-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-textMuted">
          <p>© 2026 JanAudit Civic Platform. Open Source Data from ADR, PRS India, ECI & Digital Sansad.</p>
          <div className="flex items-center space-x-4 mt-3 sm:mt-0">
            <span className="font-semibold text-textSecondary">Legal Defense Fund: 5% Reserved</span>
            <span>•</span>
            <Link to="/about" className="hover:text-brand-700 font-medium">Algorithm Transparency</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
