import React, { useState } from 'react';
import {
  Layers,
  Server,
  Database,
  Cpu,
  Share2,
  HardDrive,
  Network,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { ARCHITECTURE_PRESETS } from '../utils/systemDesignCalculator';

export default function SystemDesignCanvas({
  initialScenario = 'tinyurl',
  onEvaluate,
  className = '',
}) {
  const [nodes, setNodes] = useState(ARCHITECTURE_PRESETS[initialScenario]?.nodes || []);
  const [edges, setEdges] = useState(ARCHITECTURE_PRESETS[initialScenario]?.edges || []);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const componentPalette = [
    { type: 'LOAD_BALANCER', label: 'Load Balancer', icon: Network, tech: 'NGINX / HAProxy' },
    { type: 'MICROSERVICE', label: 'App Service', icon: Cpu, tech: 'Spring Boot / Go' },
    { type: 'CACHE', label: 'Memory Cache', icon: HardDrive, tech: 'Redis Cluster' },
    { type: 'SQL_DATABASE', label: 'Relational DB', icon: Database, tech: 'PostgreSQL' },
    { type: 'NOSQL_DATABASE', label: 'Distributed NoSQL', icon: Database, tech: 'Cassandra' },
    { type: 'MESSAGE_QUEUE', label: 'Event Queue', icon: Layers, tech: 'Apache Kafka' },
  ];

  const handleAddNode = (paletteItem) => {
    const id = 'node_' + Date.now().toString().slice(-4);
    const newNode = {
      id,
      type: paletteItem.type,
      label: paletteItem.label,
      technology: paletteItem.tech,
      x: 100 + (nodes.length % 5) * 120,
      y: 100 + Math.floor(nodes.length / 5) * 90,
      instances: paletteItem.type.includes('DATABASE') || paletteItem.type === 'LOAD_BALANCER' ? 2 : 3,
      replicationStrategy: 'MASTER_SLAVE',
    };
    setNodes([...nodes, newNode]);
    setSelectedNodeId(id);
  };

  const handleRemoveNode = (id) => {
    setNodes(nodes.filter((n) => n.id !== id));
    setEdges(edges.filter((e) => e.sourceNodeId !== id && e.targetNodeId !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const handleConnect = (sourceId, targetId) => {
    if (sourceId === targetId) return;
    const edgeExists = edges.some(
      (e) => e.sourceNodeId === sourceId && e.targetNodeId === targetId
    );
    if (!edgeExists) {
      const newEdge = {
        id: `e_${Date.now()}`,
        sourceNodeId: sourceId,
        targetNodeId: targetId,
        protocol: 'HTTPS',
        synchronous: true,
      };
      setEdges([...edges, newEdge]);
    }
  };

  const handleRunEvaluation = () => {
    setIsEvaluating(true);
    // Instant client-side heuristic evaluation
    const spofs = [];
    let hasLB = false;
    let hasCache = false;
    let hasDB = false;

    for (const n of nodes) {
      if (n.type === 'LOAD_BALANCER') hasLB = true;
      if (n.type === 'CACHE') hasCache = true;
      if (n.type.includes('DATABASE')) {
        hasDB = true;
        if (n.instances <= 1) {
          spofs.push(`Database [${n.label}] has 1 instance with no failover replica.`);
        }
      }
      if (n.type === 'MICROSERVICE' && n.instances <= 1) {
        spofs.push(`Microservice [${n.label}] lacks multi-instance horizontal scaling.`);
      }
    }

    const recs = [];
    if (!hasLB && nodes.length > 2) recs.push('Add an ingress Load Balancer to distribute client requests.');
    if (!hasCache && hasDB) recs.push('Introduce a Redis caching tier to offload hot read queries from disk.');
    if (spofs.length === 0) recs.push('Zero single points of failure detected across critical paths!');

    const score = Math.max(40, Math.min(98, 85 - spofs.length * 15 + (hasCache ? 8 : 0) + (hasLB ? 7 : 0)));

    setTimeout(() => {
      setEvaluationResult({
        scalabilityScore: score,
        availabilityScore: Math.max(50, 100 - spofs.length * 18),
        spofs,
        recommendations: recs,
      });
      setIsEvaluating(false);
      if (onEvaluate) {
        onEvaluate({ nodes, edges, score, spofs });
      }
    }, 400);
  };

  const loadPreset = (key) => {
    if (ARCHITECTURE_PRESETS[key]) {
      setNodes(ARCHITECTURE_PRESETS[key].nodes);
      setEdges(ARCHITECTURE_PRESETS[key].edges);
      setSelectedNodeId(null);
      setEvaluationResult(null);
    }
  };

  return (
    <div className={`rounded-3xl border border-white/10 bg-slate-900/90 backdrop-blur-xl p-5 shadow-2xl flex flex-col text-slate-100 ${className}`}>
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              System Architecture Whiteboard
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                CANVAS
              </span>
            </h3>
            <p className="text-xs text-slate-400">Design distributed topologies and analyze fault tolerance live</p>
          </div>
        </div>

        {/* Preset Selector & Action Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800 border border-white/5 text-xs">
            <span className="text-slate-400 px-2 font-medium">Preset:</span>
            <button
              type="button"
              onClick={() => loadPreset('tinyurl')}
              className="px-2.5 py-1 rounded-lg hover:bg-white/10 text-slate-200 transition-colors"
            >
              TinyURL
            </button>
            <button
              type="button"
              onClick={() => loadPreset('uber')}
              className="px-2.5 py-1 rounded-lg hover:bg-white/10 text-slate-200 transition-colors"
            >
              Uber Dispatch
            </button>
          </div>

          <button
            type="button"
            onClick={handleRunEvaluation}
            disabled={isEvaluating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
            {isEvaluating ? 'Evaluating...' : 'Analyze Architecture'}
          </button>
        </div>
      </div>

      {/* Palette Toolbar */}
      <div className="flex flex-wrap items-center gap-2 py-3 border-b border-white/5">
        <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Add Block:
        </span>
        {componentPalette.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.type}
              type="button"
              onClick={() => handleAddNode(p)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/5 hover:border-indigo-500/30 text-xs transition-all"
            >
              <Icon className="w-3.5 h-3.5 text-indigo-400" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Canvas Area */}
      <div className="relative w-full h-[400px] bg-slate-950/80 rounded-2xl border border-white/5 mt-4 overflow-hidden shadow-inner p-4">
        {/* Canvas Grid Background pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* SVG Edges Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {edges.map((e) => {
            const src = nodes.find((n) => n.id === e.sourceNodeId);
            const tgt = nodes.find((n) => n.id === e.targetNodeId);
            if (!src || !tgt) return null;
            return (
              <g key={e.id}>
                <line
                  x1={src.x + 60}
                  y1={src.y + 35}
                  x2={tgt.x + 60}
                  y2={tgt.y + 35}
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeDasharray={e.synchronous ? 'none' : '4 4'}
                  opacity="0.6"
                />
              </g>
            );
          })}
        </svg>

        {/* Render Nodes */}
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          return (
            <div
              key={node.id}
              onClick={() => {
                if (selectedNodeId && selectedNodeId !== node.id) {
                  handleConnect(selectedNodeId, node.id);
                  setSelectedNodeId(null);
                } else {
                  setSelectedNodeId(isSelected ? null : node.id);
                }
              }}
              style={{
                position: 'absolute',
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: '140px',
              }}
              className={`cursor-pointer rounded-2xl p-2.5 border transition-all select-none ${
                isSelected
                  ? 'bg-indigo-600/30 border-indigo-400 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-400'
                  : 'bg-slate-900 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-indigo-300">
                  {node.instances}x
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveNode(node.id);
                  }}
                  className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <h4 className="text-xs font-bold text-white truncate">{node.label}</h4>
              <p className="text-[10px] text-slate-400 truncate">{node.technology}</p>
            </div>
          );
        })}

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-xs">
            <Layers className="w-8 h-8 mb-2 opacity-50" />
            <span>Canvas is empty. Select components from the toolbar above to start designing.</span>
          </div>
        )}
      </div>

      {/* Evaluation Results Footer */}
      {evaluationResult && (
        <div className="mt-4 p-4 rounded-2xl bg-slate-800/60 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-300">Scalability Rating:</span>
              <span className="text-sm font-extrabold text-indigo-400">
                {evaluationResult.scalabilityScore}%
              </span>
              <span className="text-xs font-semibold text-slate-300 ml-4">High Availability:</span>
              <span className="text-sm font-extrabold text-emerald-400">
                {evaluationResult.availabilityScore}%
              </span>
            </div>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                evaluationResult.spofs.length === 0
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              {evaluationResult.spofs.length === 0 ? 'Zero SPOFs' : `${evaluationResult.spofs.length} SPOFs Detected`}
            </span>
          </div>

          {evaluationResult.spofs.length > 0 && (
            <div className="space-y-1">
              {evaluationResult.spofs.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}

          {evaluationResult.recommendations.length > 0 && (
            <div className="pt-2 border-t border-white/5 space-y-1">
              {evaluationResult.recommendations.map((r, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
