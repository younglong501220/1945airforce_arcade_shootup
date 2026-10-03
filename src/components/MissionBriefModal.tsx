import React from 'react';
import { X, Crosshair, Sparkles, ShieldAlert, Swords, Flame, Target } from 'lucide-react';

interface MissionBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MissionBriefModal: React.FC<MissionBriefModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-slate-700 rounded-xl shadow-2xl p-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div>
            <h2 className="text-xl font-bold font-arcade text-yellow-400">作戰手冊 BRIEFING</h2>
            <p className="text-xs text-slate-400 mt-1 font-tech">1945 街機空戰復刻版·最高機密航空行動綱領</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="關閉作戰手冊"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="space-y-6 text-sm text-slate-300">
          {/* Controls */}
          <div>
            <h3 className="text-xs font-bold font-arcade text-emerald-400 mb-2.5 flex items-center gap-2">
              <Crosshair className="w-4 h-4" /> 操作指令 (FLIGHT CONTROLS)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="font-bold text-white block mb-1">電腦鍵盤操作</span>
                <ul className="space-y-1 text-slate-300 font-mono">
                  <li><strong className="text-yellow-400">[WASD / 方向鍵]</strong> 操控戰機 360° 移動</li>
                  <li><strong className="text-yellow-400">[空白鍵 Space]</strong> 航炮射擊 (支援連發)</li>
                  <li><strong className="text-red-400">[B 鍵 / X 鍵]</strong> 釋放清屏終極炸彈</li>
                  <li><strong className="text-sky-400">[Q 鍵]</strong> 展開 5 秒能量偏向神盾</li>
                  <li><strong className="text-amber-400">[E 鍵]</strong> 超頻渦輪衝刺 (+80% 航速 & 撞毀敵機)</li>
                  <li><strong className="text-orange-400">[R 鍵]</strong> 呼叫友軍戰術火箭空襲</li>
                  <li><strong className="text-blue-400">[P 鍵 / Esc]</strong> 暫停 / 恢復作戰</li>
                </ul>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="font-bold text-white block mb-1">手機與平板觸控</span>
                <ul className="space-y-1 text-slate-300">
                  <li>直接在遊戲畫面以手指<strong>滑動拖曳</strong>戰機，自動位移不遮擋視線。</li>
                  <li>左下方提供 <strong>[Q:盾]、[E:速]、[R:襲]</strong> 三大主動技能快捷鍵。</li>
                  <li>點擊右下方<strong>紅色 BOMB 按鈕</strong>釋放全螢幕清屏震波。</li>
                  <li>右上角暫停鍵隨時暫停遊戲，方便處理事務。</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Weapons & Skills */}
          <div>
            <h3 className="text-xs font-bold font-arcade text-cyan-400 mb-2.5 flex items-center gap-2">
              <Target className="w-4 h-4" /> 武器庫系統 (WEAPON SYSTEMS)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-800/60 rounded border border-slate-700">
                <strong className="text-yellow-400">重裝機炮散彈 (Vulcan)</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">經典穿甲散彈，隨升級可達到 4 重扇形狂暴彈幕。</p>
              </div>
              <div className="p-2 bg-slate-800/60 rounded border border-slate-700">
                <strong className="text-cyan-400">聚焦粒子光束 (Piercing Laser)</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">拾取 [L] 箱解鎖，貫穿直線敵陣，瞬間高傷。</p>
              </div>
              <div className="p-2 bg-slate-800/60 rounded border border-slate-700">
                <strong className="text-emerald-400">追蹤獵殺微型彈 (Homing Missiles)</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">拾取 [H] 箱解鎖，自動轉向追擊畫面最靠近的敵機或 Boss。</p>
              </div>
              <div className="p-2 bg-slate-800/60 rounded border border-slate-700">
                <strong className="text-orange-400">重型空爆彈 (Heavy Rockets)</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">拾取 [R] 箱解鎖，命中敵機時觸發範圍衝擊波。</p>
              </div>
            </div>
          </div>

          {/* Challenge Modes */}
          <div>
            <h3 className="text-xs font-bold font-arcade text-purple-400 mb-2.5 flex items-center gap-2">
              <Swords className="w-4 h-4" /> 挑戰模式 (CHALLENGE MODES)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-800/60 rounded border border-slate-700">
                <strong className="text-white">90 秒急速獵殺 (Time Attack)</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">限時倒數 90 秒，擊落最多敵機衝擊歷史最高分！</p>
              </div>
              <div className="p-2 bg-slate-800/60 rounded border border-slate-700">
                <strong className="text-white">巨型戰艦死鬥 (Boss Rush)</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">連續決戰三大航空旗艦，無喘息彈幕馬拉松！</p>
              </div>
            </div>
          </div>

          {/* Boss warning alert */}
          <div className="bg-red-950/40 border border-red-800/60 p-3 rounded-lg flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-red-400 block mb-0.5">巨型航空旗艦 BOSS 戰情報</strong>
              <p className="text-slate-300 leading-relaxed">
                巨型戰艦配備多管火炮與旋轉環形彈幕。善用 [Q] 能量神盾抵擋集中火線，配合 [E] 渦輪衝刺調整走位，或適時以 [B] 清屏炸彈反制！
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-4 mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold rounded-lg transition-colors"
          >
            明白，準備迎敵
          </button>
        </div>
      </div>
    </div>
  );
};
