import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Code2,
  CheckCircle,
  Copy,
  Send,
  Star,
  Award,
  Share2,
  FileText,
  Play,
} from 'lucide-react';

export default function PeerMockInterviewRoomModal({
  isOpen,
  onClose,
  room,
  currentUser = { id: 1001, username: 'Candidate' },
  onUpdateCode,
  onSubmitRubric,
}) {
  const [activeTab, setActiveTab] = useState('code'); // 'code' | 'rubric'
  const [code, setCode] = useState(room?.sharedCodeSnapshot || '');
  const [copied, setCopied] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Rubric form state
  const [rubricScores, setRubricScores] = useState({
    problemSolvingScore: 8,
    technicalAccuracyScore: 8,
    communicationScore: 9,
    codeQualityScore: 8,
    strengthFeedback: 'Strong structural thinking and modular code organization.',
    growthOpportunities: 'Consider testing edge cases earlier in the explanation.',
    recommendedForHire: true,
  });
  const [isSubmittingRubric, setIsSubmittingRubric] = useState(false);
  const [rubricSubmitted, setRubricSubmitted] = useState(false);

  useEffect(() => {
    if (room?.sharedCodeSnapshot && room.sharedCodeSnapshot !== code) {
      setCode(room.sharedCodeSnapshot);
    }
  }, [room?.sharedCodeSnapshot]);

  if (!isOpen || !room) return null;

  const isHost = room.hostUserId === currentUser.id;
  const peerName = isHost ? room.peerUserName || 'Waiting for Peer...' : room.hostUserName;
  const roomStatus = room.status || 'READY';

  const handleCopyCode = () => {
    if (room?.roomCode) {
      navigator.clipboard.writeText(room.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCodeChange = (e) => {
    const val = e.target.value;
    setCode(val);
    if (onUpdateCode) {
      onUpdateCode(val);
    }
  };

  const handleRubricSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingRubric(true);
    try {
      if (onSubmitRubric) {
        await onSubmitRubric({
          ...rubricScores,
          reviewerUserId: currentUser.id,
          reviewerName: currentUser.username || 'Peer Reviewer',
        });
      }
      setRubricSubmitted(true);
    } catch (err) {
      // Ignored
    } finally {
      setIsSubmittingRubric(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl h-[90vh] bg-slate-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Peer Mock Interview Collaborative Room</h2>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {room.roomCode}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    roomStatus === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  }`}
                >
                  {roomStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Target Role: <span className="text-slate-200 font-medium">{room.targetRole}</span> • Difficulty:{' '}
                <span className="text-slate-200 font-medium">{room.difficultyLevel}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-indigo-400" />
              {copied ? 'Copied Code!' : `Code: ${room.roomCode}`}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Split View */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Panel: Video Cards & Problem Overview (5 cols) */}
          <div className="lg:col-span-5 border-r border-white/10 p-5 flex flex-col gap-4 overflow-y-auto bg-slate-900/50">
            {/* Dual Video Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Local Video Card */}
              <div className="relative rounded-2xl bg-slate-800 border border-white/10 aspect-video flex flex-col items-center justify-center overflow-hidden shadow-inner">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'Y'}
                </div>
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] px-2 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md">
                  <span className="font-medium text-slate-200 truncate">
                    {currentUser.username || 'You'} ({isHost ? 'Host' : 'Peer'})
                  </span>
                  <div className="flex items-center gap-1">
                    {videoEnabled ? <Video className="w-3 h-3 text-emerald-400" /> : <VideoOff className="w-3 h-3 text-red-400" />}
                    {audioEnabled ? <Mic className="w-3 h-3 text-emerald-400" /> : <MicOff className="w-3 h-3 text-red-400" />}
                  </div>
                </div>
              </div>

              {/* Peer Video Card */}
              <div className="relative rounded-2xl bg-slate-800/90 border border-white/10 aspect-video flex flex-col items-center justify-center overflow-hidden shadow-inner">
                {room.peerUserId || !isHost ? (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {peerName.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 p-2 text-center">
                    <div className="w-8 h-8 rounded-full border-2 border-indigo-400/40 border-t-indigo-400 animate-spin" />
                    <span className="text-[11px] text-slate-400">Waiting for peer candidate to join...</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] px-2 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md">
                  <span className="font-medium text-slate-200 truncate">{peerName}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">WebRTC</span>
                </div>
              </div>
            </div>

            {/* In-Call Controls */}
            <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-800/60 border border-white/5">
              <button
                type="button"
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  audioEnabled ? 'bg-white/10 text-slate-200 hover:bg-white/20' : 'bg-red-500/20 text-red-300'
                }`}
              >
                {audioEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                {audioEnabled ? 'Mute' : 'Unmute'}
              </button>
              <button
                type="button"
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  videoEnabled ? 'bg-white/10 text-slate-200 hover:bg-white/20' : 'bg-red-500/20 text-red-300'
                }`}
              >
                {videoEnabled ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                {videoEnabled ? 'Stop Video' : 'Start Video'}
              </button>
            </div>

            {/* Problem Overview Card */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 flex-1">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <FileText className="w-4 h-4" /> Live Round Challenge
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">{room.activeCodingQuestion}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Take turns asking clarifying questions, designing data structures, and validating algorithmic complexity.
                Use the synchronized code workspace on the right to implement and debug live.
              </p>
            </div>
          </div>

          {/* Right Panel: Tabs for Code vs Mutual Rubric (7 cols) */}
          <div className="lg:col-span-7 flex flex-col overflow-hidden bg-slate-900">
            {/* Tabs */}
            <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/10 bg-slate-800/40">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('code')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'code'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" /> Synchronized Code Pad
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('rubric')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'rubric'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" /> Peer Evaluation Rubric
                </button>
              </div>

              {activeTab === 'code' && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Real-time Sync
                  </span>
                </div>
              )}
            </div>

            {/* Tab 1: Code Pad */}
            {activeTab === 'code' && (
              <div className="flex-1 flex flex-col p-4 overflow-hidden">
                <div className="flex items-center justify-between pb-2 text-xs text-slate-400 font-mono">
                  <span>Language: Java / JavaScript (Auto)</span>
                  <span>UTF-8 • Shared Canvas</span>
                </div>
                <textarea
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="// Collaborate live with your peer here..."
                  className="flex-1 w-full bg-slate-950 font-mono text-xs text-emerald-300 p-4 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500/50 resize-none leading-relaxed"
                />
              </div>
            )}

            {/* Tab 2: Peer Rubric Evaluation */}
            {activeTab === 'rubric' && (
              <div className="flex-1 p-6 overflow-y-auto">
                {rubricSubmitted ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">Peer Evaluation Submitted!</h3>
                    <p className="text-xs text-slate-400 max-w-sm mb-4">
                      Your evaluation has been recorded and merged into the mutual assessment scorecard for this room.
                    </p>
                    <button
                      type="button"
                      onClick={() => setRubricSubmitted(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors"
                    >
                      Update Evaluation
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRubricSubmit} className="space-y-4">
                    <div className="border-b border-white/10 pb-3">
                      <h3 className="text-sm font-bold text-white">Evaluate {peerName}</h3>
                      <p className="text-xs text-slate-400">
                        Score your peer honestly across the 4 key engineering dimensions.
                      </p>
                    </div>

                    {/* Scores Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Problem Solving */}
                      <div className="p-3.5 rounded-xl bg-slate-800/40 border border-white/5 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-200">Problem Solving</span>
                          <span className="font-bold text-indigo-400">{rubricScores.problemSolvingScore}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={rubricScores.problemSolvingScore}
                          onChange={(e) =>
                            setRubricScores({ ...rubricScores, problemSolvingScore: Number(e.target.value) })
                          }
                          className="w-full accent-indigo-500"
                        />
                      </div>

                      {/* Technical Accuracy */}
                      <div className="p-3.5 rounded-xl bg-slate-800/40 border border-white/5 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-200">Technical Accuracy</span>
                          <span className="font-bold text-indigo-400">{rubricScores.technicalAccuracyScore}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={rubricScores.technicalAccuracyScore}
                          onChange={(e) =>
                            setRubricScores({ ...rubricScores, technicalAccuracyScore: Number(e.target.value) })
                          }
                          className="w-full accent-indigo-500"
                        />
                      </div>

                      {/* Communication */}
                      <div className="p-3.5 rounded-xl bg-slate-800/40 border border-white/5 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-200">Communication & Pacing</span>
                          <span className="font-bold text-indigo-400">{rubricScores.communicationScore}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={rubricScores.communicationScore}
                          onChange={(e) =>
                            setRubricScores({ ...rubricScores, communicationScore: Number(e.target.value) })
                          }
                          className="w-full accent-indigo-500"
                        />
                      </div>

                      {/* Code Quality */}
                      <div className="p-3.5 rounded-xl bg-slate-800/40 border border-white/5 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-200">Code Modularity & Cleanliness</span>
                          <span className="font-bold text-indigo-400">{rubricScores.codeQualityScore}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={rubricScores.codeQualityScore}
                          onChange={(e) =>
                            setRubricScores({ ...rubricScores, codeQualityScore: Number(e.target.value) })
                          }
                          className="w-full accent-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Qualitative Feedback */}
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Key Strengths Observed
                        </label>
                        <textarea
                          rows={2}
                          value={rubricScores.strengthFeedback}
                          onChange={(e) => setRubricScores({ ...rubricScores, strengthFeedback: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Growth & Improvement Areas
                        </label>
                        <textarea
                          rows={2}
                          value={rubricScores.growthOpportunities}
                          onChange={(e) =>
                            setRubricScores({ ...rubricScores, growthOpportunities: e.target.value })
                          }
                          className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={rubricScores.recommendedForHire}
                          onChange={(e) =>
                            setRubricScores({ ...rubricScores, recommendedForHire: e.target.checked })
                          }
                          className="rounded border-white/20 text-indigo-600 focus:ring-indigo-500"
                        />
                        Recommend for Offer / Progression
                      </label>

                      <button
                        type="submit"
                        disabled={isSubmittingRubric}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {isSubmittingRubric ? 'Recording...' : 'Submit Evaluation'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
