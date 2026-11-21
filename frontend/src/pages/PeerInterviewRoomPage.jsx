import React, { useState, useEffect } from 'react';
import {
  Users,
  PlusCircle,
  LogIn,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Code2,
  Video,
  Award,
  Mic,
  ArrowRight,
} from 'lucide-react';
import peerMockApi from '../api/peerMock';
import PeerMockInterviewRoomModal from '../components/PeerMockInterviewRoomModal';
import VoiceAcousticFeedbackWidget from '../components/VoiceAcousticFeedbackWidget';
import { useAuth } from '../context/AuthContext';

export default function PeerInterviewRoomPage() {
  const { user } = useAuth();
  const [activeRooms, setActiveRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [createRole, setCreateRole] = useState('Full Stack Software Engineer');
  const [createDifficulty, setCreateDifficulty] = useState('INTERMEDIATE');

  // Active modal session state
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);

  // Acoustic Calibration Simulator State
  const [simulatedWpm, setSimulatedWpm] = useState(142);
  const [simulatedPitch, setSimulatedPitch] = useState(150);
  const [simulatedFillers, setSimulatedFillers] = useState(2);
  const [isMicTesting, setIsMicTesting] = useState(false);

  useEffect(() => {
    fetchActiveRooms();
  }, []);

  const fetchActiveRooms = async () => {
    setIsLoading(true);
    try {
      const data = await peerMockApi.listActiveRooms();
      setActiveRooms(Array.isArray(data) ? data : []);
    } catch (e) {
      // Mock fallback if offline or backend cold start
      setActiveRooms([
        {
          roomId: 'mock-1',
          roomCode: 'DEV89X',
          hostUserName: 'Arjun M.',
          targetRole: 'Senior Backend Engineer (Java / Distributed)',
          difficultyLevel: 'ADVANCED',
          status: 'WAITING_FOR_PEER',
          createdAt: new Date().toISOString(),
        },
        {
          roomId: 'mock-2',
          roomCode: 'REACT4',
          hostUserName: 'Sneha R.',
          targetRole: 'Frontend Architect (React / Next.js)',
          difficultyLevel: 'INTERMEDIATE',
          status: 'WAITING_FOR_PEER',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setJoinError('');
    try {
      const room = await peerMockApi.createRoom(createRole, createDifficulty);
      setCurrentRoom(room);
      setIsRoomModalOpen(true);
      fetchActiveRooms();
    } catch (err) {
      // Offline fallback
      const fallbackRoom = {
        roomId: 'offline-' + Date.now(),
        roomCode: 'PEER' + Math.floor(1000 + Math.random() * 9000),
        hostUserId: user?.id || 1001,
        hostUserName: user?.name || 'You',
        targetRole: createRole,
        difficultyLevel: createDifficulty,
        status: 'WAITING_FOR_PEER',
        sharedCodeSnapshot: '// Start coding your solution collaboratively here...\n',
        activeCodingQuestion: 'Design an in-memory Key-Value store with TTL and prefix search.',
      };
      setCurrentRoom(fallbackRoom);
      setIsRoomModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setIsLoading(true);
    setJoinError('');
    try {
      const room = await peerMockApi.joinRoom(joinCode.trim().toUpperCase(), user?.name || 'Peer Candidate');
      setCurrentRoom(room);
      setIsRoomModalOpen(true);
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Unable to join peer room. Please verify the 6-character room code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCode = async (newCode) => {
    if (currentRoom?.roomCode) {
      try {
        await peerMockApi.updateCode(currentRoom.roomCode, newCode);
      } catch (e) {
        // Ignored
      }
    }
  };

  const handleSubmitRubric = async (rubric) => {
    if (currentRoom?.roomCode) {
      return await peerMockApi.submitRubric(currentRoom.roomCode, rubric);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      {/* Container */}
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
              <Users className="w-3.5 h-3.5" /> Phase 7 Collaborative Peer Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Peer Mock Interview Rooms & WebRTC Lab
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Conduct reciprocal technical mock interviews with peers. Experience dual live video, synchronized code editing,
              real-time acoustic speech telemetry, and mutual 4-pillar rubric grading.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchActiveRooms}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Lobby
            </button>
          </div>
        </div>

        {/* Action Grid: Create Room vs Join Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Room Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-4">
                <PlusCircle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white mb-1">Host a Peer Mock Room</h2>
              <p className="text-xs text-slate-400 mb-5">
                Generate an instant room code. Share it with a friend or let a peer join from the community lobby.
              </p>

              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Interview Track</label>
                  <select
                    value={createRole}
                    onChange={(e) => setCreateRole(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Full Stack Software Engineer">Full Stack Software Engineer (Java + React)</option>
                    <option value="Backend Distributed Systems Engineer">Backend Distributed Systems (Spring / Go)</option>
                    <option value="Frontend Architecture Specialist">Frontend Architect (React / TypeScript)</option>
                    <option value="Cloud & DevOps Site Reliability Engineer">Cloud & DevOps / SRE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Seniority Level</label>
                  <select
                    value={createDifficulty}
                    onChange={(e) => setCreateDifficulty(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ENTRY_LEVEL">Entry-Level / Campus Graduate</option>
                    <option value="INTERMEDIATE">Intermediate (2–5 Years)</option>
                    <option value="SENIOR_LEAD">Senior / Staff Architect (5+ Years)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  <Users className="w-4 h-4" />
                  {isLoading ? 'Creating Room...' : 'Launch Instant Peer Room'}
                </button>
              </form>
            </div>
          </div>

          {/* Join Room Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center mb-4">
                <LogIn className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white mb-1">Enter with Room Code</h2>
              <p className="text-xs text-slate-400 mb-5">
                Have a 6-character room invite from another candidate? Enter it below to join their live session.
              </p>

              <form onSubmit={handleJoinRoom} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">6-Character Room Code</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="e.g. 7X9K2B"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="w-full p-3 uppercase tracking-widest text-center font-mono font-bold text-lg rounded-xl bg-slate-950 border border-white/10 text-teal-400 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                  />
                  {joinError && <p className="text-xs text-red-400 mt-2 font-medium">{joinError}</p>}
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-teal-400" /> WebRTC P2P Encrypted Session
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Video and audio streams are transmitted directly peer-to-peer with minimal latency.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !joinCode.trim()}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-600/30 transition-all disabled:opacity-50"
                >
                  <ArrowRight className="w-4 h-4" />
                  {isLoading ? 'Connecting...' : 'Join Peer Session'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Acoustic Speech Telemetry Calibration Bay */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Voice & Acoustic Calibration Bay
            </h2>
            <button
              type="button"
              onClick={() => setIsMicTesting(!isMicTesting)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center gap-1.5"
            >
              <Mic className="w-3.5 h-3.5 text-indigo-400" />
              {isMicTesting ? 'Stop Mic Test' : 'Test Acoustic Mic'}
            </button>
          </div>

          <VoiceAcousticFeedbackWidget
            wpm={simulatedWpm}
            pitchHz={simulatedPitch}
            stabilityScore={89}
            fillerCount={simulatedFillers}
            fillerBreakdown={{ um: 1, like: 1 }}
            isMicActive={isMicTesting}
            voiceSteadiness="BALANCED"
          />
        </div>

        {/* Active Open Rooms Lobby */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Community Lobby: Open Peer Sessions</h2>
              <p className="text-xs text-slate-400">Join other developers currently waiting for mock interview partners.</p>
            </div>
            <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-white/5">
              {activeRooms.length} Active Rooms
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRooms.map((r) => (
              <div
                key={r.roomCode}
                className="p-4 rounded-2xl bg-slate-800/40 border border-white/5 hover:border-indigo-500/30 transition-all flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-white">{r.hostUserName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {r.roomCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{r.targetRole}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Tier: {r.difficultyLevel}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setJoinCode(r.roomCode);
                    handleJoinRoom({ preventDefault: () => {} });
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-indigo-600 hover:text-white text-slate-200 transition-colors"
                >
                  Join Room
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isRoomModalOpen && currentRoom && (
        <PeerMockInterviewRoomModal
          isOpen={isRoomModalOpen}
          onClose={() => setIsRoomModalOpen(false)}
          room={currentRoom}
          currentUser={user || { id: 1001, username: 'Candidate' }}
          onUpdateCode={handleUpdateCode}
          onSubmitRubric={handleSubmitRubric}
        />
      )}
    </div>
  );
}
