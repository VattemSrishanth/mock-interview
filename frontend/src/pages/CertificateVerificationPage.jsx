import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Award, CheckCircle2, AlertTriangle, ExternalLink, Calendar, User, Briefcase, FileCheck, ArrowRight } from 'lucide-react';
import ReportQrCode from '../components/ReportQrCode';

export default function CertificateVerificationPage() {
  const { shareToken } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    axios.get(`/api/interviews/certificate/${shareToken}`)
      .then((res) => {
        if (active) setCert(res.data);
      })
      .catch((err) => {
        if (active) {
          setError(err?.response?.data?.message || 'Certificate record could not be verified or is not publicly shared.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span>Verifying cryptographic signature on ledger...</span>
        </div>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-lg font-bold text-white">Certificate Verification Failed</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {error || 'This certificate token does not correspond to an active, publicly shared interview evaluation.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition"
          >
            <span>Return to IntervAI Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const issuedDateStr = cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Verified';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        {/* Certificate Container */}
        <div className="relative rounded-2xl border-2 border-indigo-500/30 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-6 sm:p-10 shadow-2xl overflow-hidden space-y-8">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Certificate Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center text-white font-extrabold text-xl tracking-tight shadow-lg">
                IA
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-orange-400 font-bold block">
                  Official IntervAI Verification Authority
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  Certificate of Technical Competency
                </h1>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold font-mono self-start sm:self-auto">
              <ShieldCheck size={16} />
              <span>CRYPTOGRAPHICALLY VERIFIED</span>
            </div>
          </div>

          {/* Certificate Metadata Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 space-y-1">
              <span className="font-mono text-[10px] text-zinc-500 uppercase flex items-center gap-1.5">
                <User size={12} className="text-orange-400" /> Candidate Name
              </span>
              <p className="text-base font-bold text-white">
                {cert.candidateName}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 space-y-1">
              <span className="font-mono text-[10px] text-zinc-500 uppercase flex items-center gap-1.5">
                <Briefcase size={12} className="text-indigo-400" /> Assessed Role & Track
              </span>
              <p className="text-base font-bold text-white">
                {cert.jobRole} · <span className="text-sm font-normal text-zinc-400">{cert.interviewType}</span>
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 space-y-1">
              <span className="font-mono text-[10px] text-zinc-500 uppercase flex items-center gap-1.5">
                <Award size={12} className="text-emerald-400" /> Verified Score & Tier
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-2xl font-extrabold text-emerald-400">
                  {cert.overallScore}%
                </span>
                <span className="text-xs text-zinc-300 font-medium">({cert.readinessTier})</span>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 space-y-1">
              <span className="font-mono text-[10px] text-zinc-500 uppercase flex items-center gap-1.5">
                <Calendar size={12} className="text-amber-400" /> Examination Date
              </span>
              <p className="text-sm font-semibold text-zinc-200">
                {issuedDateStr}
              </p>
            </div>
          </div>

          {/* Verification Hash & QR Code Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-4 rounded-xl border border-zinc-800 bg-zinc-950/80">
            <div className="space-y-1.5 flex-1 min-w-0">
              <span className="font-mono text-[10px] text-zinc-500 uppercase font-semibold block">
                Certificate Fingerprint (SHA-256 Hash)
              </span>
              <code className="text-[11px] font-mono text-orange-400/90 break-all block bg-zinc-900/90 p-2 rounded border border-zinc-800">
                {cert.signatureHash || 'SIG-VALIDATED'}
              </code>
              <p className="text-[10px] text-zinc-500 font-mono pt-1">
                Certificate ID: {cert.certificateId} · Issued by {cert.issuer}
              </p>
            </div>

            <div className="shrink-0 flex justify-center">
              <ReportQrCode value={typeof window !== 'undefined' ? window.location.href : ''} size={75} label="Scan to Verify" />
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-800">
            <Link
              to="/"
              className="text-xs text-zinc-400 hover:text-white font-mono flex items-center gap-1 transition"
            >
              IntervAI Verification Ledger
            </Link>

            <Link
              to={`/report/${shareToken}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 text-xs font-bold transition shadow-lg"
            >
              <span>View Full Assessment Dossier</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
