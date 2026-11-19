import React from 'react';
import { Award, CheckCircle, Download, X, Building, ShieldCheck, Calendar, MapPin, Sparkles } from 'lucide-react';

export default function SimulatedOfferLetterModal({ isOpen, onClose, offer }) {
  if (!isOpen || !offer) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (paise) => {
    if (!paise) return '₹0';
    const rupees = paise / 100;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(rupees);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Confetti / Top celebratory header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 p-6 text-white text-center relative overflow-hidden">
          <div className="flex justify-center mb-2">
            <span className="p-3 bg-white/20 backdrop-blur-md rounded-2xl ring-4 ring-white/30 animate-bounce">
              <Award className="w-8 h-8 text-amber-300" />
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Congratulations, {offer.candidateName}!</h2>
          <p className="text-sm text-emerald-100 mt-1">
            Official Placement Offer Extended by <span className="font-semibold">{offer.companyName}</span>
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offer Letter Body */}
        <div className="p-6 space-y-6 text-slate-200">
          {/* Metadata pill strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Offer ID</span>
              <span className="font-semibold text-slate-200 font-mono">{offer.offerId || 'OFR-2026-X'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Designation</span>
              <span className="font-semibold text-slate-200 truncate block">{offer.designation}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Tentative Joining</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-400" />
                {offer.tentativeJoiningDate || 'July 2027'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-mono">Work Location</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-rose-400" />
                {offer.workLocation || 'Bengaluru, India'}
              </span>
            </div>
          </div>

          {/* Compensation Breakdown Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
            <div className="px-4 py-2.5 bg-slate-800/80 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Annual Compensation Structure (CTC)</span>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">{offer.formattedTotalCtc}</span>
            </div>
            <div className="divide-y divide-slate-800/60 text-xs">
              <div className="px-4 py-2.5 flex justify-between items-center">
                <span className="text-slate-300">Base Salary (Guaranteed Cash)</span>
                <span className="font-mono font-medium text-slate-100">{formatCurrency(offer.baseSalaryPaise)}</span>
              </div>
              <div className="px-4 py-2.5 flex justify-between items-center">
                <span className="text-slate-300">Target Performance Variable Bonus</span>
                <span className="font-mono font-medium text-slate-100">{formatCurrency(offer.variableBonusPaise)}</span>
              </div>
              <div className="px-4 py-2.5 flex justify-between items-center">
                <span className="text-slate-300">Joining & Relocation Incentive</span>
                <span className="font-mono font-medium text-slate-100">{formatCurrency(offer.joiningBonusPaise)}</span>
              </div>
              <div className="px-4 py-2.5 flex justify-between items-center">
                <span className="text-slate-300">Equity / Restricted Stock Units (RSUs)</span>
                <span className="font-mono font-medium text-slate-100">{formatCurrency(offer.rsuStockGrantPaise)}</span>
              </div>
              <div className="px-4 py-3 bg-emerald-950/20 flex justify-between items-center font-bold text-sm text-emerald-300 border-t border-emerald-500/20">
                <span>Total Annual CTC</span>
                <span className="font-mono text-base text-emerald-400">{offer.formattedTotalCtc}</span>
              </div>
            </div>
          </div>

          {/* Benefits & Perks */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Corporate Health & Lifestyle Benefits Included
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {(offer.benefitsAndPerks || [
                'Comprehensive Health & Family Insurance',
                'Wellness Stipend & WFH Home-Office Budget',
                'Annual Tech Conference & Certification Fund',
                'Hybrid Work Schedule & Catered Meals'
              ]).map((perk, i) => (
                <div key={i} className="flex items-center space-x-2 text-slate-300 bg-slate-800/30 p-2 rounded-lg border border-slate-800">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[11px]">{perk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Hash Footer */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Digital Verification Hash:</span>
            </div>
            <span className="truncate max-w-[280px] text-slate-400" title={offer.digitalVerificationHash}>
              {offer.digitalVerificationHash || 'a7f9c8e2b109348d9482bf...'}
            </span>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
          >
            Review Later
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/20 flex items-center space-x-1.5 transition"
          >
            <Download className="w-4 h-4" />
            <span>Save & Print PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
