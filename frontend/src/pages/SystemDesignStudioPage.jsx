import React, { useState } from 'react';
import {
  Layers,
  Cpu,
  Database,
  Calculator,
  Sliders,
  CheckCircle,
  HardDrive,
  Network,
  Zap,
} from 'lucide-react';
import SystemDesignCanvas from '../components/SystemDesignCanvas';
import { calculateCapacityMetrics, classifyTrafficTier } from '../utils/systemDesignCalculator';

export default function SystemDesignStudioPage() {
  const [dau, setDau] = useState(2500000); // 2.5 Million DAU
  const [readWriteRatio, setReadWriteRatio] = useState(10); // 10:1 Read
  const [avgPayloadKb, setAvgPayloadKb] = useState(2.0); // 2 KB payload
  const [activeScenario, setActiveScenario] = useState('tinyurl');

  const capacity = calculateCapacityMetrics({
    dau,
    readWriteRatio,
    avgPayloadKb,
  });

  const traffic = classifyTrafficTier(capacity.avgQps);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
              <Layers className="w-3.5 h-3.5" /> Phase 8 System Design Studio
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Interactive System Design & Distributed Architecture Studio
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Model high-scale distributed systems, calculate mathematical capacity projections (QPS, Bandwidth, 5-Year Storage),
              and validate microservice topologies against Single Points of Failure.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono">
              Status: <span className="text-emerald-400 font-bold">READY</span>
            </span>
          </div>
        </div>

        {/* Capacity Planning Simulator Panel */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Calculator className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white">Back-of-the-Envelope Capacity Estimator</h2>
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${traffic.color}`}>
              {traffic.label}
            </span>
          </div>

          {/* Controls Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* DAU */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-800/40 border border-white/5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Daily Active Users (DAU)</span>
                <span className="font-bold text-indigo-400">{(dau / 1000000).toFixed(1)}M Users</span>
              </div>
              <input
                type="range"
                min="50000"
                max="10000000"
                step="50000"
                value={dau}
                onChange={(e) => setDau(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Read/Write Ratio */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-800/40 border border-white/5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Read-to-Write Ratio</span>
                <span className="font-bold text-indigo-400">{readWriteRatio} : 1 (Read-heavy)</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={readWriteRatio}
                onChange={(e) => setReadWriteRatio(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Average Payload Size */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-800/40 border border-white/5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Average Request Payload</span>
                <span className="font-bold text-indigo-400">{avgPayloadKb} KB</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="20"
                step="0.5"
                value={avgPayloadKb}
                onChange={(e) => setAvgPayloadKb(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          {/* Computed Metrics HUD */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/5 text-center">
              <span className="text-[10px] text-slate-400 font-medium block mb-1">Average QPS</span>
              <span className="text-xl font-extrabold text-white">{capacity.avgQps}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Peak: {capacity.peakQps} QPS</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/5 text-center">
              <span className="text-[10px] text-slate-400 font-medium block mb-1">Ingress Bandwidth</span>
              <span className="text-xl font-extrabold text-teal-400">{capacity.ingressBandwidthMbps}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Mbps</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/5 text-center">
              <span className="text-[10px] text-slate-400 font-medium block mb-1">Annual Storage</span>
              <span className="text-xl font-extrabold text-indigo-400">{capacity.annualStorageTb}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">TB / year</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/5 text-center">
              <span className="text-[10px] text-slate-400 font-medium block mb-1">RAM Cache (80/20)</span>
              <span className="text-xl font-extrabold text-amber-400">{capacity.recommendedCacheMemoryGb}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">GB RAM</span>
            </div>
          </div>
        </div>

        {/* Interactive Architecture Whiteboard Canvas */}
        <SystemDesignCanvas initialScenario={activeScenario} />
      </div>
    </div>
  );
}
