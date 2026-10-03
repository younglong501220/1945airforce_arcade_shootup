import React, { useEffect, useState } from 'react';
import { X, Trophy, Trash2 } from 'lucide-react';
import { HighScoreRecord, PLANES } from '../game/types';

interface RecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHighScore: number;
}

const STORAGE_KEY_HISCORE = '1945_airforce_hiscores_v1';

export const RecordsModal: React.FC<RecordsModalProps> = ({ isOpen, onClose, currentHighScore }) => {
  const [records, setRecords] = useState<HighScoreRecord[]>([]);

  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_HISCORE);
        if (saved) {
          setRecords(JSON.parse(saved));
        } else if (currentHighScore > 0) {
          setRecords([
            {
              score: currentHighScore,
              stage: 1,
              mode: 'CAMPAIGN',
              plane: 'P51',
              weapon: 'VULCAN',
              date: '剛剛',
            },
          ]);
        }
      } catch {}
    }
  }, [isOpen, currentHighScore]);

  const clearRecords = () => {
    localStorage.removeItem(STORAGE_KEY_HISCORE);
    setRecords([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-slate-700 rounded-xl shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <div>
              <h2 className="text-xl font-bold font-arcade text-yellow-400">榮譽榜 HALL OF FAME</h2>
              <p className="text-xs text-slate-400 font-tech">歷史戰功與最高擊墜紀錄</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="關閉榮譽榜"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Records table */}
        <div className="mb-6">
          {records.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              尚無飛行戰績紀錄。出擊迎戰以奪下首個榮譽！
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {records.map((rec, index) => {
                const planeName = PLANES[rec.plane]?.name || rec.plane;
                return (
                  <div key={index} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded flex items-center justify-center font-arcade font-bold ${
                        index === 0
                          ? 'bg-yellow-400 text-slate-950'
                          : index === 1
                          ? 'bg-slate-300 text-slate-950'
                          : index === 2
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-bold text-white font-mono flex items-center gap-1.5">
                          <span>{planeName}</span>
                          {rec.mode && (
                            <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-yellow-400">
                              {rec.mode === 'TIME_ATTACK' ? '90s獵殺' : rec.mode === 'BOSS_RUSH' ? '首領連戰' : rec.mode === 'SURVIVAL' ? '生存戰' : '戰役'}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {rec.date} · 關卡 {rec.stage} {rec.weapon ? `· ${rec.weapon}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-bold text-yellow-400 font-arcade tabular-nums">
                        {rec.score.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-400">POINTS</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {records.length > 0 && (
            <button
              onClick={clearRecords}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 py-1.5 px-3 rounded hover:bg-red-950/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> 清除紀錄
            </button>
          )}
          <div className="ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              返回機臺
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
