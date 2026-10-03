import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Activity,
  Heart,
  Skull,
  Award,
  Shield,
  Bomb,
  Clock,
  TrendingUp,
  Crosshair,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  CartesianGrid,
} from 'recharts';
import { BossBattleRecord, BossCombatSample } from '../game/types';

interface BossReplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: BossBattleRecord | null;
}

export const BossReplayModal: React.FC<BossReplayModalProps> = ({ isOpen, onClose, record }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentSampleIndex, setCurrentSampleIndex] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  // Reset playback when modal opens
  useEffect(() => {
    if (isOpen && record && record.samples.length > 0) {
      setCurrentSampleIndex(0);
      setIsPlaying(true);
    }
  }, [isOpen, record]);

  // Dynamic Replay Loop
  useEffect(() => {
    if (!isOpen || !isPlaying || !record || record.samples.length <= 1) return;

    timerRef.current = window.setInterval(() => {
      setCurrentSampleIndex((prev) => {
        if (prev >= record.samples.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 450); // advance sample every 450ms for smooth cinematic replay

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPlaying, record]);

  if (!isOpen || !record) return null;

  const samples = record.samples || [];
  const currentSample: BossCombatSample =
    samples[currentSampleIndex] || samples[samples.length - 1] || {
      timeSec: 0,
      timeLabel: '00:00',
      bossHp: 0,
      bossHpPct: 0,
      playerHp: 0,
      playerHpPct: 0,
      cumulativeDamage: 0,
      dps: 0,
    };

  const handleRestartReplay = () => {
    setCurrentSampleIndex(0);
    setIsPlaying(true);
  };

  const handleSeek = (index: number) => {
    setCurrentSampleIndex(Math.max(0, Math.min(samples.length - 1, index)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl p-5 md:p-7 my-6 text-slate-100 font-tech">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border font-arcade font-bold ${
                record.bossDefeated
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400'
                  : 'bg-red-950/80 border-red-500 text-red-400'
              }`}
            >
              {record.bossDefeated ? <Award className="w-5 h-5" /> : <Skull className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-bold font-arcade text-yellow-400">
                  戰鬥重播摘要 BATTLE REPLAY
                </h2>
                <span
                  className={`text-[10px] font-bold font-arcade px-2 py-0.5 rounded ${
                    record.bossDefeated
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {record.bossDefeated ? '擊沉勝出 CLEAR' : '戰機被毀 FAILED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-tech mt-0.5">
                Stage {record.stage} · {record.bossName} ({record.bossTitle})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="關閉戰鬥重播"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-sky-400" /> 戰鬥總時長
            </span>
            <div className="text-lg font-bold font-arcade text-white tabular-nums">
              {record.durationSec} 秒
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-yellow-400" /> 總輸出破壞
            </span>
            <div className="text-lg font-bold font-arcade text-yellow-400 tabular-nums">
              {record.totalDamage.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> 平均火力 DPS
            </span>
            <div className="text-lg font-bold font-arcade text-cyan-400 tabular-nums">
              {record.avgDps}/秒
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
              <Heart className="w-3.5 h-3.5 text-red-400" /> 承受命中損耗
            </span>
            <div className="text-lg font-bold font-mono text-red-400 tabular-nums">
              {record.hitsTakenDuringBoss} / {record.maxHitsAllowed} 次
            </div>
          </div>
        </div>

        {/* Dynamic Timeline Scrubbing & Health Gauges */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-lg font-bold transition-transform active:scale-95"
                title={isPlaying ? '暫停重播' : '播放重播'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={handleRestartReplay}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                title="從頭播放"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <div className="text-xs font-mono text-slate-300">
                時標: <span className="font-bold text-yellow-400">{currentSample.timeLabel}</span> /{' '}
                <span className="text-slate-400">
                  {samples[samples.length - 1]?.timeLabel || '00:00'}
                </span>
              </div>
            </div>

            {/* Live Instant DPS & Event Badge */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs text-slate-400 font-mono">
                即時累積傷害: <strong className="text-white">{currentSample.cumulativeDamage}</strong>
              </span>
              {currentSample.event && (
                <span className="text-[10px] font-bold font-tech px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 truncate max-w-[180px]">
                  {currentSample.event}
                </span>
              )}
            </div>
          </div>

          {/* Timeline Slider */}
          <input
            type="range"
            min={0}
            max={Math.max(0, samples.length - 1)}
            value={currentSampleIndex}
            onChange={(e) => {
              setIsPlaying(false);
              handleSeek(parseInt(e.target.value));
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-400 mb-4"
          />

          {/* Live Progress Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Boss Remaining HP Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span className="flex items-center gap-1.5 text-red-400 font-bold">
                  <Skull className="w-3.5 h-3.5" /> 首領殘餘生命 (BOSS HP)
                </span>
                <span className="font-mono text-red-400 font-bold">
                  {currentSample.bossHpPct}% ({currentSample.bossHp})
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-red-600 to-rose-400 h-full transition-all duration-300"
                  style={{ width: `${Math.max(0, currentSample.bossHpPct)}%` }}
                />
              </div>
            </div>

            {/* Player Remaining HP Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Shield className="w-3.5 h-3.5" /> 戰機殘餘生命 (PLAYER HP)
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {currentSample.playerHpPct}% ({currentSample.playerHp} 命)
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full transition-all duration-300"
                  style={{ width: `${Math.max(0, currentSample.playerHpPct)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recharts Area Chart: Boss Degradation & Player Health Curve */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-arcade font-bold text-yellow-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-yellow-400" /> 火力損耗走勢圖 (COMBAT DEGRADATION & OUTPUT)
            </h3>
            <div className="flex items-center gap-3 text-[11px] font-tech">
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> 首領生命%
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> 戰機生命%
              </span>
            </div>
          </div>

          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={samples} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="bossHpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="playerHpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} unit="%" />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as BossCombatSample;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs space-y-1 font-tech">
                          <div className="font-bold text-yellow-400 font-mono">時間: {label}</div>
                          <div className="text-red-400">
                            首領生命: <strong className="font-mono">{data.bossHpPct}%</strong> ({data.bossHp} HP)
                          </div>
                          <div className="text-emerald-400">
                            戰機耐久: <strong className="font-mono">{data.playerHpPct}%</strong> ({data.playerHp} 命)
                          </div>
                          <div className="text-cyan-400">
                            累積傷害: <strong className="font-mono">{data.cumulativeDamage}</strong>
                          </div>
                          <div className="text-slate-300">
                            秒傷 DPS: <strong className="font-mono">{data.dps}</strong>
                          </div>
                          {data.event && (
                            <div className="text-[10px] text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-700 mt-1">
                              標記: {data.event}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="bossHpPct"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#bossHpGrad)"
                  name="首領生命"
                />
                <Area
                  type="monotone"
                  dataKey="playerHpPct"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#playerHpGrad)"
                  name="戰機生命"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">作戰戰術總結:</span>
            <span>
              使用炸彈: <strong className="text-yellow-400">{record.bombsUsed}</strong> 枚 ·
              被擊中次數: <strong className="text-red-400">{record.hitsTakenDuringBoss}</strong> / {record.maxHitsAllowed}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold rounded-lg transition-colors"
          >
            返回結算畫面
          </button>
        </div>
      </div>
    </div>
  );
};
