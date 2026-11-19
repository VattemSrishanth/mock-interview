import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Play, 
  Lightbulb, 
  Send, 
  Award, 
  CheckCircle, 
  AlertTriangle, 
  FileCode, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Terminal
} from 'lucide-react';
import MultiRoundPipelineHUD from '../components/MultiRoundPipelineHUD';
import AdaptiveHintLadderDrawer from '../components/AdaptiveHintLadderDrawer';
import SimulatedOfferLetterModal from '../components/SimulatedOfferLetterModal';
import { SUPPORTED_LANGUAGES, evaluateExecution, detectComplexityHeuristics, calculateRoundScore } from '../utils/codeSandboxUtils';
import assessmentApi from '../api/assessment';

const TARGET_COMPANIES = [
  { name: 'Google', tier: 'TIER_1_PRODUCT', role: 'Software Development Engineer I (L3)', cutoff: 82 },
  { name: 'Amazon', tier: 'TIER_1_PRODUCT', role: 'SDE-1 (AWS Cloud & Distributed Engines)', cutoff: 80 },
  { name: 'Microsoft', tier: 'TIER_1_PRODUCT', role: 'Software Engineer (Core Systems & Azure)', cutoff: 80 },
  { name: 'Swiggy', tier: 'TIER_2_GROWTH', role: 'Full-Stack SDE (High-Concurrency Platforms)', cutoff: 72 },
  { name: 'Cred', tier: 'TIER_2_GROWTH', role: 'Backend Engineer (FinTech Microservices)', cutoff: 74 },
  { name: 'Tata Consultancy Services', tier: 'TIER_3_ENTERPRISE', role: 'Digital Software Engineer', cutoff: 62 },
];

const ROUND_PROBLEMS = [
  {
    round: 1,
    title: 'Round 1: Two Sum (Optimal Hash Mapping)',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Target: O(N) Time and O(N) Space.'],
    testCases: [
      { input: '[2, 7, 11, 15], 9', expected: '[0, 1]' },
      { input: '[3, 2, 4], 6', expected: '[1, 2]' },
      { input: '[3, 3], 6', expected: '[0, 1]' }
    ]
  },
  {
    round: 2,
    title: 'Round 2: Longest Substring Without Repeating Characters',
    description: 'Given a string `s`, find the length of the longest substring without duplicate characters using an optimal two-pointer sliding window invariant.',
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.'],
    testCases: [
      { input: '"abcabcbb"', expected: '3' },
      { input: '"bbbbb"', expected: '1' },
      { input: '"pwwkew"', expected: '3' }
    ]
  },
  {
    round: 3,
    title: 'Round 3: Distributed In-Memory LRU Cache',
    description: 'Design a high-throughput Least Recently Used (LRU) data structure with O(1) get and put operations, thread-safety, and TTL expiration support.',
    constraints: ['Capacity <= 10^5', 'Both get and put must run in amortized O(1) time.'],
    testCases: [
      { input: '["LRUCache", "put", "get"], [[2], [1, 1], [1]]', expected: '[null, null, 1]' }
    ]
  },
  {
    round: 4,
    title: 'Round 4: Bar Raiser & Technical Leadership Scenario',
    description: 'Describe an architecture migration from a monolithic SQL database to distributed event-driven microservices with zero downtime and strict data consistency.',
    constraints: ['Explain CAP theorem trade-offs', 'Outline outbox pattern and CDC (Change Data Capture)'],
    testCases: [
      { input: '"system_scalability_review"', expected: '"approved"' }
    ]
  }
];

export default function MultiRoundAssessmentPage() {
  const [selectedCompany, setSelectedCompany] = useState(TARGET_COMPANIES[0]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [pipelineData, setPipelineData] = useState(null);
  const [roundResults, setRoundResults] = useState([]);
  const [cumulativeScore, setCumulativeScore] = useState(0);
  const [status, setStatus] = useState('IN_PROGRESS');
  
  // Sandbox state
  const [language, setLanguage] = useState(SUPPORTED_LANGUAGES[0].id);
  const [code, setCode] = useState(SUPPORTED_LANGUAGES[0].defaultCode);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  
  // Hint ladder state
  const [hintDrawerOpen, setHintDrawerOpen] = useState(false);
  const [unlockedHintLevel, setUnlockedHintLevel] = useState(0);
  const [hints, setHints] = useState({});
  const [hintPenalty, setHintPenalty] = useState(0);

  // Offer modal state
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerData, setOfferData] = useState(null);

  useEffect(() => {
    initPipeline();
  }, [selectedCompany]);

  const initPipeline = async () => {
    try {
      const res = await assessmentApi.startPipeline('Vattem Srishanth', selectedCompany.name, selectedCompany.role);
      setPipelineData(res);
      setRoundResults([]);
      setCurrentRoundIndex(0);
      setCumulativeScore(0);
      setStatus('IN_PROGRESS');
      setUnlockedHintLevel(0);
      setHintPenalty(0);
      setHints({});
      setOfferData(null);
    } catch (e) {
      // Local mock fallback
      setPipelineData({
        pipelineId: 'PIPE-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        companyName: selectedCompany.name,
        companyTier: selectedCompany.tier,
        targetRole: selectedCompany.role,
        cutoffThreshold: selectedCompany.cutoff
      });
      setRoundResults([]);
      setCurrentRoundIndex(0);
      setCumulativeScore(0);
      setStatus('IN_PROGRESS');
    }
  };

  const handleLanguageChange = (langId) => {
    setLanguage(langId);
    const found = SUPPORTED_LANGUAGES.find((l) => l.id === langId);
    if (found) setCode(found.defaultCode);
    setExecutionResult(null);
  };

  const handleRunCode = () => {
    setExecuting(true);
    setTimeout(() => {
      const currentProblem = ROUND_PROBLEMS[currentRoundIndex] || ROUND_PROBLEMS[0];
      const result = evaluateExecution(code, language, currentProblem.testCases);
      setExecutionResult(result);
      setExecuting(false);
    }, 400);
  };

  const handleUnlockHint = async (level) => {
    const penaltyMap = { 1: 5, 2: 10, 3: 20 };
    setUnlockedHintLevel(level);
    setHintPenalty((prev) => prev + (penaltyMap[level] || 5));

    try {
      const currentProblem = ROUND_PROBLEMS[currentRoundIndex];
      const hintRes = await assessmentApi.requestHint({
        problemTitle: currentProblem.title,
        problemDescription: currentProblem.description,
        requestedTier: level,
        language
      });
      setHints((prev) => ({ ...prev, [`level${level}`]: hintRes }));
    } catch (e) {
      setHints((prev) => ({
        ...prev,
        [`level${level}`]: {
          hintText: level === 1
            ? 'Consider using an auxiliary Hash Map to store elements as you iterate, giving O(1) lookups.'
            : level === 2
            ? 'Iterate once over nums with index i. Calculate complement = target - nums[i]. Check if map contains complement.'
            : 'Initialize Map. For i=0..len-1: complement=target-nums[i]. If map.has(complement) return [map.get(complement), i]. Else map.set(nums[i], i).'
        }
      }));
    }
  };

  const handleSubmitRound = async () => {
    const currentProblem = ROUND_PROBLEMS[currentRoundIndex] || ROUND_PROBLEMS[0];
    const testCases = currentProblem.testCases || [];
    const execution = executionResult || evaluateExecution(code, language, testCases);
    
    const score = calculateRoundScore({
      passedCount: execution.passedCount,
      totalCount: execution.totalCount,
      hintPenalty,
      timeSpentSec: 720
    });

    const passed = score >= (selectedCompany.cutoff - 5);

    const newResult = {
      roundType: currentProblem.title,
      roundIndex: currentRoundIndex + 1,
      score,
      cutoff: selectedCompany.cutoff,
      passed,
      keyStrengths: 'Demonstrated clean code structure, correct algorithmic complexity, and handled primary test suites.',
      areasForImprovement: hintPenalty > 0 ? 'Minimize reliance on hint ladders during initial problem formulation.' : 'Excellent independent problem solving.'
    };

    const updatedResults = [...roundResults, newResult];
    setRoundResults(updatedResults);

    const total = updatedResults.reduce((acc, r) => acc + r.score, 0);
    const avgScore = Math.round((total / updatedResults.length) * 10) / 10;
    setCumulativeScore(avgScore);

    if (currentRoundIndex + 1 < ROUND_PROBLEMS.length) {
      setCurrentRoundIndex(currentRoundIndex + 1);
      // Reset editor for next round
      const nextLang = SUPPORTED_LANGUAGES.find((l) => l.id === language);
      setCode(nextLang ? nextLang.defaultCode : '');
      setExecutionResult(null);
      setUnlockedHintLevel(0);
      setHintPenalty(0);
    } else {
      // Completed all 4 rounds!
      if (avgScore >= selectedCompany.cutoff) {
        setStatus('OFFER_EXTENDED');
        try {
          const offer = await assessmentApi.generateOffer(pipelineData?.pipelineId || 'PIPE-AUTO');
          setOfferData(offer);
        } catch (e) {
          setOfferData({
            candidateName: 'Vattem Srishanth',
            companyName: selectedCompany.name,
            companyTier: selectedCompany.tier,
            designation: selectedCompany.role,
            tentativeJoiningDate: 'August 2027',
            workLocation: 'Bengaluru / Hyderabad, India',
            formattedTotalCtc: selectedCompany.tier === 'TIER_1_PRODUCT' ? '₹32,00,000 INR (32.0 LPA)' : '₹18,00,000 INR (18.0 LPA)',
            baseSalaryPaise: 240000000,
            variableBonusPaise: 40000000,
            joiningBonusPaise: 40000000,
            digitalVerificationHash: 'c7e841f87920ab7183e921d7465'
          });
        }
        setOfferModalOpen(true);
      } else {
        setStatus('ROUND_FAILED');
      }
    }
  };

  const currentProblem = ROUND_PROBLEMS[currentRoundIndex] || ROUND_PROBLEMS[0];
  const heuristics = detectComplexityHeuristics(code);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Title & Company Picker */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-indigo-400" />
            <span>Virtual Multi-Round Assessment Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulate realistic 4-round technical recruitment drives with automated cutoff benchmarking and corporate offers.
          </p>
        </div>

        {/* Company Selector */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 pl-2">Target Enterprise:</span>
          <select
            value={selectedCompany.name}
            onChange={(e) => {
              const comp = TARGET_COMPANIES.find((c) => c.name === e.target.value);
              if (comp) setSelectedCompany(comp);
            }}
            className="bg-slate-800 border-none text-xs text-slate-100 font-semibold rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500"
          >
            {TARGET_COMPANIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.tier === 'TIER_1_PRODUCT' ? 'FAANG / Tier-1' : 'Unicorn / Enterprise'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Multi-Round Stepper HUD */}
      <MultiRoundPipelineHUD
        companyName={selectedCompany.name}
        companyTier={selectedCompany.tier}
        roleTitle={selectedCompany.role}
        currentRoundIndex={currentRoundIndex}
        roundResults={roundResults}
        cumulativeScore={cumulativeScore}
        cutoffThreshold={selectedCompany.cutoff}
        status={status}
      />

      {/* Offer Banner Trigger (if unlocked) */}
      {status === 'OFFER_EXTENDED' && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <span className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Award className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-emerald-200">Official Placement Offer Letter Ready</h3>
              <p className="text-xs text-emerald-400">All 4 rounds cleared with benchmark cutoff score.</p>
            </div>
          </div>
          <button
            onClick={() => setOfferModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center space-x-1.5"
          >
            <span>View Offer Letter</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Two-Column Workspace: Problem Description vs Code Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Problem Details (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">
                Stage {currentRoundIndex + 1} of 4
              </span>
              <button
                onClick={() => setHintDrawerOpen(true)}
                className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>AI Hint Ladder ({unlockedHintLevel}/3)</span>
              </button>
            </div>

            <h3 className="text-base font-bold text-slate-100 mt-3">{currentProblem.title}</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
              {currentProblem.description}
            </p>

            {/* Constraints */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <h4 className="text-[11px] uppercase font-mono text-slate-400 font-semibold mb-2">Technical Constraints</h4>
              <ul className="space-y-1 text-xs text-slate-300">
                {currentProblem.constraints.map((c, i) => (
                  <li key={i} className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Heuristics Linter Feedback */}
            <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center justify-between font-mono text-[11px] text-slate-400 mb-1">
                <span>Estimated Time: <strong className="text-emerald-400">{heuristics.estimatedTime}</strong></span>
                <span>Space: <strong className="text-indigo-400">{heuristics.estimatedSpace}</strong></span>
              </div>
              {heuristics.warnings.map((w, idx) => (
                <div key={idx} className="mt-1.5 flex items-start space-x-1.5 text-amber-400 text-[10px]">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor & Test Case Benchmarks (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col">
            {/* Editor Toolbar */}
            <div className="bg-slate-850 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-200">Solution Sandbox</span>
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1 border border-slate-700"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleLanguageChange(language)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
                  title="Reset to starter snippet"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRunCode}
                  disabled={executing}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{executing ? 'Executing...' : 'Run Test Cases'}</span>
                </button>
              </div>
            </div>

            {/* Code Textarea */}
            <div className="relative">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={14}
                className="w-full bg-slate-950 text-slate-200 font-mono text-xs p-4 resize-none border-none focus:outline-none focus:ring-0 leading-relaxed"
                placeholder="// Write your algorithmic solution here..."
                spellCheck="false"
              />
            </div>

            {/* Benchmark / Test Execution Results */}
            {executionResult && (
              <div className="bg-slate-950/80 p-4 border-t border-slate-800 text-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-slate-200">
                      Test Suite Execution: {executionResult.passedCount} / {executionResult.totalCount} Passed
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 space-x-3">
                    <span>Runtime: <strong className="text-emerald-400">{executionResult.durationMs}ms</strong></span>
                    <span>Memory: <strong className="text-indigo-400">{executionResult.memoryKb} KB</strong></span>
                  </div>
                </div>

                <div className="space-y-2">
                  {executionResult.results.map((r) => (
                    <div
                      key={r.testCaseIndex}
                      className={`p-2.5 rounded-lg border text-[11px] font-mono flex items-center justify-between ${
                        r.passed
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      <div>
                        <span>Case {r.testCaseIndex}: Input: {r.input} &bull; Expected: {r.expected}</span>
                        {!r.passed && <div className="text-rose-400 mt-0.5">Actual: {r.actual}</div>}
                      </div>
                      <span className="font-bold">{r.passed ? 'PASSED' : 'FAILED'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Round Submission Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center">
              <div className="text-xs text-slate-400">
                Hint penalty deduction: <span className="font-mono text-rose-400">-{hintPenalty} pts</span>
              </div>
              <button
                onClick={handleSubmitRound}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center space-x-2 transition"
              >
                <span>Submit Round Solution</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Adaptive Hint Ladder Drawer */}
      <AdaptiveHintLadderDrawer
        isOpen={hintDrawerOpen}
        onClose={() => setHintDrawerOpen(false)}
        unlockedLevel={unlockedHintLevel}
        hints={hints}
        onUnlockHint={handleUnlockHint}
        totalPenalty={hintPenalty}
      />

      {/* Simulated Offer Letter Modal */}
      <SimulatedOfferLetterModal
        isOpen={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
        offer={offerData}
      />
    </div>
  );
}
