import React from 'react';
import { X, Zap, Shield, Flame, Rocket, Radio, Target, Crosshair } from 'lucide-react';
import { SKILLS, SkillType, WEAPONS, WeaponType } from '../game/types';

interface ArmoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeapon: WeaponType;
  onSelectWeapon: (weapon: WeaponType) => void;
}

export const ArmoryModal: React.FC<ArmoryModalProps> = ({
  isOpen,
  onClose,
  currentWeapon,
  onSelectWeapon,
}) => {
  if (!isOpen) return null;

  const weaponKeys: WeaponType[] = ['VULCAN', 'LASER', 'HOMING', 'ROCKET'];
  const skillKeys: SkillType[] = ['SHIELD', 'BOOST', 'AIR_STRIKE'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-slate-700 rounded-xl shadow-2xl p-6 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-xl font-bold font-arcade text-cyan-400">武器庫與技能 ARMORY</h2>
              <p className="text-xs text-slate-400 font-tech">配置航炮武器系統與戰機主動戰術技能</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="關閉武器庫"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Primary Weapon Loadout */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-arcade font-bold text-yellow-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-yellow-400" /> 主要武器系統 (PRIMARY WEAPONS)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">戰鬥中拾取 [L] / [H] / [R] 可隨時切換</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {weaponKeys.map((key) => {
              const w = WEAPONS[key];
              const isSelected = currentWeapon === key;

              return (
                <div
                  key={key}
                  onClick={() => onSelectWeapon(key)}
                  className={`cursor-pointer rounded-lg p-3.5 border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-cyan-400 bg-slate-800/90 shadow-lg shadow-cyan-500/10'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-600'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-white text-sm">{w.name}</span>
                      {isSelected && (
                        <span className="text-[10px] font-bold font-arcade bg-cyan-400 text-slate-950 px-1.5 py-0.5 rounded">
                          EQUIPPED
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-cyan-300 font-tech mb-2">{w.subtitle}</div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">{w.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-slate-800 text-slate-400">
                    <span>射速: {w.fireRate <= 7 ? '極速' : w.fireRate <= 10 ? '快速' : '重型'}</span>
                    <span>基礎破壞: {w.baseDamage.toFixed(1)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Active Tactical Skills */}
        <div className="mb-6">
          <h3 className="text-xs font-arcade font-bold text-emerald-400 mb-3 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-emerald-400" /> 主動戰術技能 (TACTICAL SKILLS)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {skillKeys.map((key) => {
              const s = SKILLS[key];

              return (
                <div key={key} className="bg-slate-800/70 border border-slate-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-white text-xs">{s.name}</span>
                    <span className="text-[10px] font-mono font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-700 text-yellow-400">
                      [{s.hotkey} 鍵]
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-2.5">{s.description}</p>
                  <div className="text-[11px] font-tech text-slate-400 flex justify-between pt-1.5 border-t border-slate-800">
                    <span>持續: {s.duration} 秒</span>
                    <span className="text-amber-400 font-mono">冷卻: {s.cooldown}s</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-xs text-slate-400">
          <span>手機端可在螢幕右下方直接點擊技能按鈕觸發。</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors"
          >
            確認武裝
          </button>
        </div>
      </div>
    </div>
  );
};
