import React, { useState, useEffect } from 'react';
import {
  X,
  Flag,
  Timer,
  Skull,
  ShieldOff,
  Swords,
  Heart,
  Shield,
  Check,
  Minus,
  Plus,
  Zap,
} from 'lucide-react';
import { GAME_MODES, GameMode } from '../game/types';

interface ModeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode, hp?: number) => void;
  maxHitsAllowed: number;
  onSetMaxHitsAllowed: (hits: number) => void;
}

export const ModeSelectModal: React.FC<ModeSelectModalProps> = ({
  isOpen,
  onClose,
  selectedMode,
  onSelectMode,
  maxHitsAllowed,
  onSetMaxHitsAllowed,
}) => {
  const [localHp, setLocalHp] = useState<number>(maxHitsAllowed);
  const [activeMode, setActiveMode] = useState<GameMode>(selectedMode);

  // Sync state whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setLocalHp(Math.max(3, Math.min(9, maxHitsAllowed)));
      setActiveMode(selectedMode);
    }
  }, [isOpen, maxHitsAllowed, selectedMode]);

  if (!isOpen) return null;

  const modeKeys: GameMode[] = ['CAMPAIGN', 'TIME_ATTACK', 'BOSS_RUSH', 'SURVIVAL'];
  const lifePointOptions = [3, 4, 5, 6, 7, 8, 9];

  const handleHpChange = (value: number) => {
    const clamped = Math.max(3, Math.min(9, value));
    setLocalHp(clamped);
    onSetMaxHitsAllowed(clamped);
  };

  const handleConfirmAndDeploy = (mode: GameMode = activeMode) => {
    onSetMaxHitsAllowed(localHp);
    onSelectMode(mode, localHp);
    onClose();
  };

  const getModeIcon = (key: GameMode) => {
    switch (key) {
      case 'CAMPAIGN':
        return <Flag className="w-5 h-5 text-blue-400" />;
      case 'TIME_ATTACK':
        return <Timer className="w-5 h-5 text-yellow-400" />;
      case 'BOSS_RUSH':
        return <Skull className="w-5 h-5 text-red-400" />;
      case 'SURVIVAL':
        return <ShieldOff className="w-5 h-5 text-purple-400" />;
    }
  };

  const getHpTierLabel = (points: number) => {
    switch (points) {
      case 3:
        return '極限硬派 · 容錯 3 次';
      case 4:
        return '進階老兵 · 容錯 4 次';
      case 5:
        return '均衡防護 · 容錯 5 次';
      case 6:
        return '裝甲強化 · 容錯 6 次';
      case 7:
        return '重裝巡航 · 容錯 7 次';
      case 8:
        return '鋼鐵要塞 · 容錯 8 次';
      case 9:
        return '最高耐久 · 容錯 9 次';
      default:
        return `容錯 ${points} 次`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl p-5 md:p-7 my-6 font-tech text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-950/70 border border-yellow-500/80 flex items-center justify-center text-yellow-400">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold font-arcade text-yellow-400">
                挑戰模式與初始生命設定
              </h2>
              <p className="text-xs text-slate-400 font-tech">
                自訂戰機進入挑戰時的初始生命值 (HP 3 ~ 9 點)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="關閉模式選擇"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Life Points (初始生命 HP: 3 ~ 9) Slider & Options Control Area */}
        <div className="bg-slate-950/90 border-2 border-red-500/50 rounded-xl p-4 md:p-5 mb-5 shadow-xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Section Title & Current Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-red-950/90 rounded-lg border border-red-600/80 text-red-400 shadow-md shadow-red-900/40">
                <Heart className="w-5 h-5 fill-red-500 text-red-500" />
              </div>
              <div>
                <span className="font-bold text-white text-sm md:text-base">
                  初始生命值設定 (INITIAL HP)
                </span>
                <p className="text-[11px] text-slate-400 font-tech">
                  滑動滑桿或點選按鈕，設定 3 至 9 點生命值
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="text-xs text-slate-400">目前生命:</span>
              <span className="font-arcade text-sm font-bold text-yellow-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-700 shadow-inner">
                {localHp} HP
              </span>
            </div>
          </div>

          {/* Range Slider for HP 3 to 9 */}
          <div className="px-2 mb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleHpChange(localHp - 1)}
                disabled={localHp <= 3}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 flex items-center justify-center border border-slate-700 transition-colors shrink-0"
                aria-label="減少1點生命"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex-1 space-y-1.5">
                <input
                  type="range"
                  min="3"
                  max="9"
                  step="1"
                  value={localHp}
                  onChange={(e) => handleHpChange(parseInt(e.target.value, 10))}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500 focus:outline-none"
                  aria-label="初始生命值滑桿"
                />
                {/* Tick marks on slider */}
                <div className="flex justify-between text-[11px] font-mono font-bold text-slate-400 px-0.5">
                  {lifePointOptions.map((val) => (
                    <span
                      key={val}
                      onClick={() => handleHpChange(val)}
                      className={`cursor-pointer transition-colors ${
                        localHp === val ? 'text-yellow-400 font-bold scale-110' : 'hover:text-white'
                      }`}
                    >
                      {val}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleHpChange(localHp + 1)}
                disabled={localHp >= 9}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 flex items-center justify-center border border-slate-700 transition-colors shrink-0"
                aria-label="增加1點生命"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Select Buttons (選項 3 ~ 9) */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-3">
            {lifePointOptions.map((points) => {
              const isSelected = localHp === points;
              return (
                <button
                  key={points}
                  type="button"
                  onClick={() => handleHpChange(points)}
                  className={`py-2 px-1 rounded-xl font-mono font-bold text-sm transition-all flex flex-col items-center justify-center gap-0.5 border ${
                    isSelected
                      ? 'bg-gradient-to-b from-red-500 to-rose-700 text-white border-white shadow-lg shadow-red-600/40 scale-105 ring-2 ring-red-400/50'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600 hover:bg-slate-800/80'
                  }`}
                >
                  <span className="text-base">{points}</span>
                  <span className="text-[10px] opacity-75 font-tech">HP</span>
                </button>
              );
            })}
          </div>

          {/* Live Hearts Display and Tactical Tier description */}
          <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px] font-mono">戰機耐久:</span>
              <div className="flex items-center flex-wrap gap-1">
                {Array.from({ length: localHp }).map((_, i) => (
                  <Heart
                    key={i}
                    className="w-4 h-4 text-red-500 fill-red-500 drop-shadow animate-pulse"
                  />
                ))}
              </div>
            </div>

            <div className="text-[11px] text-amber-300 font-mono text-center sm:text-right">
              <span className="text-slate-400 mr-1.5">配置規格:</span>
              <strong className="text-yellow-400">{getHpTierLabel(localHp)}</strong>
            </div>
          </div>
        </div>

        {/* Mode list selection */}
        <div className="space-y-3 mb-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>選擇作戰挑戰模式</span>
            <span className="text-[11px] text-slate-500 font-normal">點擊模式卡片即可選擇</span>
          </div>

          {modeKeys.map((key) => {
            const m = GAME_MODES[key];
            const isSelected = activeMode === key;

            return (
              <div
                key={key}
                onClick={() => setActiveMode(key)}
                className={`cursor-pointer rounded-xl p-3.5 md:p-4 border-2 transition-all flex items-start gap-4 ${
                  isSelected
                    ? 'border-yellow-400 bg-slate-800/90 shadow-lg shadow-yellow-500/10 ring-1 ring-yellow-400/40'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="p-3 bg-slate-950 rounded-lg shrink-0 mt-0.5 border border-slate-800">
                  {getModeIcon(key)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm">{m.name}</h3>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {m.badge}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-bold font-arcade bg-yellow-400 text-slate-950 px-2 py-0.5 rounded flex items-center gap-1">
                        <Check className="w-3 h-3" /> SELECTED
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-tech mb-1">{m.subtitle}</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{m.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-300 font-tech text-center sm:text-left">
            已設定: <strong className="text-yellow-400">{GAME_MODES[activeMode].name}</strong> · 初始生命{' '}
            <strong className="text-red-400 underline font-mono">{localHp} HP</strong>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors text-xs"
            >
              取消
            </button>
            <button
              onClick={() => handleConfirmAndDeploy(activeMode)}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-arcade font-bold text-xs rounded-lg transition-transform active:scale-95 shadow-md shadow-yellow-500/20 flex items-center justify-center gap-1.5"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              確定並以此 HP 出擊
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
