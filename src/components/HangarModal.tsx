import React from 'react';
import { PlaneType, PLANES } from '../game/types';
import { X, Shield, Zap, Flame, Bomb } from 'lucide-react';

interface HangarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlane: PlaneType;
  onSelectPlane: (plane: PlaneType) => void;
}

export const HangarModal: React.FC<HangarModalProps> = ({
  isOpen,
  onClose,
  selectedPlane,
  onSelectPlane,
}) => {
  if (!isOpen) return null;

  const planeKeys: PlaneType[] = ['P51', 'SPITFIRE', 'P38'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-slate-700 rounded-xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div>
            <h2 className="text-xl font-bold font-arcade text-yellow-400">戰機機庫 HANGAR</h2>
            <p className="text-xs text-slate-400 mt-1 font-tech">選擇本次作戰出擊的主力戰鷹</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="關閉機庫"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plane Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {planeKeys.map((key) => {
            const p = PLANES[key];
            const isSelected = selectedPlane === key;

            return (
              <div
                key={key}
                onClick={() => onSelectPlane(key)}
                className={`cursor-pointer rounded-lg p-4 border-2 transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-yellow-400 bg-slate-800/90 shadow-lg shadow-yellow-500/10'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-600'
                }`}
              >
                <div>
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold font-tech text-yellow-400 tracking-wide">
                      {p.subtitle}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold font-arcade bg-yellow-400 text-slate-950 px-1.5 py-0.5 rounded">
                        SELECTED
                      </span>
                    )}
                  </div>

                  {/* Plane Name */}
                  <h3 className="text-base font-bold text-white mb-2">{p.name}</h3>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">{p.description}</p>

                  {/* Plane Specs */}
                  <div className="space-y-2 text-xs text-slate-300 font-tech">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Zap className="w-3.5 h-3.5 text-emerald-400" /> 機動速度
                      </span>
                      <span className="font-mono text-emerald-400">{p.speed.toFixed(1)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Shield className="w-3.5 h-3.5 text-blue-400" /> 耐久護甲
                      </span>
                      <span className="font-mono text-blue-400">{p.maxHp} HP</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Bomb className="w-3.5 h-3.5 text-red-400" /> 初始炸彈
                      </span>
                      <span className="font-mono text-red-400">{p.bombCapacity} 枚</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Flame className="w-3.5 h-3.5 text-amber-400" /> 武器特性
                      </span>
                      <span className="font-mono text-amber-400 truncate max-w-[120px] text-right">
                        {p.bulletType}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className={`mt-4 w-full py-2 text-xs font-bold rounded transition-colors ${
                    isSelected
                      ? 'bg-yellow-400 text-slate-950 hover:bg-yellow-300'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {isSelected ? '出擊配置中' : '選擇此戰機'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-800 pt-4 flex justify-between items-center text-xs text-slate-400">
          <span>所有戰機皆可藉由戰場掉落物解鎖四級重裝火力與僚機支援。</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
          >
            完成配置
          </button>
        </div>
      </div>
    </div>
  );
};
