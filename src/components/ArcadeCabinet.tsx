import React from 'react';
import {
  Heart,
  Bomb as BombIcon,
  Pause,
  Play,
  RotateCcw,
  Zap,
  Users,
  Shield,
  Trophy,
  Flame,
  Rocket,
  Timer,
  Skull,
  Award,
  Activity,
  Sliders,
  Sun,
  CloudLightning,
  CloudFog,
} from 'lucide-react';
import {
  BossBattleRecord,
  GAME_MODES,
  GameMode,
  PLANES,
  PlaneType,
  SkillType,
  WEAPONS,
  WeaponType,
  WeatherInfo,
  WeatherType,
} from '../game/types';

interface ArcadeCabinetProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  gameState: 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'STAGE_CLEAR' | 'GAME_OVER' | 'CHALLENGE_SUCCESS';
  gameMode: GameMode;
  selectedPlane: PlaneType;
  currentWeapon: WeaponType;
  currentWeather?: WeatherType;
  weatherInfo?: WeatherInfo;
  onCycleWeather?: () => void;
  score: number;
  highScore: number;
  stage: number;
  hp: number;
  maxHp: number;
  maxHitsAllowed: number;
  onSetMaxHitsAllowed: (hits: number) => void;
  bombs: number;
  power: number;
  hasWingman: boolean;
  hasShield: boolean;
  enemiesDefeated: number;
  bossesDefeated: number;
  timeRemaining: number;
  skillCd: Record<SkillType, number>;
  activeSkills: { shield: boolean; boost: boolean };
  latestBossBattle: BossBattleRecord | null;
  onOpenBossReplay: () => void;
  autoFire: boolean;
  crtMode: boolean;
  onToggleAutoFire: () => void;
  onStartGame: () => void;
  onTogglePause: () => void;
  onUseBomb: () => void;
  onActivateSkill: (skill: SkillType) => void;
  onOpenHangar: () => void;
  onOpenArmory: () => void;
  onOpenModes: () => void;
  onPointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp: () => void;
}

export const ArcadeCabinet: React.FC<ArcadeCabinetProps> = ({
  canvasRef,
  gameState,
  gameMode,
  selectedPlane,
  currentWeapon,
  currentWeather,
  weatherInfo,
  onCycleWeather,
  score,
  highScore,
  stage,
  hp,
  maxHp,
  maxHitsAllowed,
  onSetMaxHitsAllowed,
  bombs,
  power,
  hasWingman,
  hasShield,
  enemiesDefeated,
  bossesDefeated,
  timeRemaining,
  skillCd,
  activeSkills,
  latestBossBattle,
  onOpenBossReplay,
  autoFire,
  crtMode,
  onToggleAutoFire,
  onStartGame,
  onTogglePause,
  onUseBomb,
  onActivateSkill,
  onOpenHangar,
  onOpenArmory,
  onOpenModes,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}) => {
  const currentPlane = PLANES[selectedPlane] || PLANES.P51;
  const weaponInfo = WEAPONS[currentWeapon] || WEAPONS.VULCAN;
  const modeInfo = GAME_MODES[gameMode] || GAME_MODES.CAMPAIGN;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative w-full max-w-[480px] aspect-[2/3] max-h-[85vh] bg-slate-950 rounded-xl overflow-hidden border-4 border-slate-700 shadow-2xl shadow-emerald-950/30 flex flex-col crt-screen">
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        width={480}
        height={720}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="w-full h-full block touch-none cursor-crosshair object-contain"
      />

      {/* CRT Scanline Filter */}
      {crtMode && <div className="absolute inset-0 scanlines-overlay pointer-events-none z-20" />}

      {/* Active Game HUD (During Playing / Paused) */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <>
          {/* Top Bar HUD */}
          <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start pointer-events-none z-10 font-tech text-xs select-none">
            {/* Top Left: Score, High Score & HP */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 font-bold font-arcade tracking-wider drop-shadow-md">
                  1P <span className="text-white tabular-nums">{score.toLocaleString()}</span>
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                HI:{' '}
                <span className="text-amber-300 font-bold tabular-nums">
                  {Math.max(highScore, score).toLocaleString()}
                </span>
              </div>

              {/* Health Hearts */}
              <div className="flex items-center flex-wrap gap-1 max-w-[170px] pt-0.5">
                {Array.from({ length: maxHp }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-3.5 h-3.5 drop-shadow ${
                      i < hp ? 'text-red-500 fill-red-500 animate-pulse' : 'text-slate-600 fill-transparent'
                    }`}
                  />
                ))}
                {(hasShield || activeSkills.shield) && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-sky-400 bg-sky-950/80 px-1 py-0.5 rounded border border-sky-500 ml-1">
                    <Shield className="w-3 h-3" /> {activeSkills.shield ? 'AEGIS' : 'SHIELD'}
                  </span>
                )}
              </div>
            </div>

            {/* Center Mode / Challenge Timer Banner */}
            {gameMode === 'TIME_ATTACK' && (
              <div className="pointer-events-auto bg-amber-950/80 border border-amber-500/80 px-2.5 py-1 rounded flex items-center gap-1.5 text-amber-300 font-arcade text-xs animate-pulse">
                <Timer className="w-3.5 h-3.5 text-amber-400" />
                <span>{formatTimer(timeRemaining)}</span>
              </div>
            )}
            {gameMode === 'BOSS_RUSH' && (
              <div className="bg-red-950/80 border border-red-500/80 px-2 py-0.5 rounded text-[10px] font-arcade text-red-300">
                BOSS RUSH {stage}/3
              </div>
            )}
            {gameMode === 'SURVIVAL' && (
              <div className="bg-purple-950/80 border border-purple-500/80 px-2 py-0.5 rounded text-[10px] font-arcade text-purple-300 flex items-center gap-1">
                <Skull className="w-3 h-3 text-purple-400" /> SURVIVAL {hp}/{maxHp}
              </div>
            )}

            {/* Top Right: Stage, Bomb, Power & Pause Button */}
            <div className="text-right space-y-1">
              <div className="flex items-center justify-end gap-2">
                <span className="text-sky-400 font-bold font-arcade text-[11px] drop-shadow">
                  STAGE {stage}
                </span>
                <button
                  onClick={onTogglePause}
                  className="pointer-events-auto p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded border border-slate-600 transition-colors"
                  title={gameState === 'PAUSED' ? '繼續遊戲 (P/Esc)' : '暫停遊戲 (P/Esc)'}
                >
                  {gameState === 'PAUSED' ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Bombs, Weapon & Status */}
              <div className="flex items-center justify-end gap-1.5 text-xs">
                <span className="flex items-center gap-1 font-bold text-red-400 bg-red-950/70 px-1.5 py-0.5 rounded border border-red-700">
                  <BombIcon className="w-3 h-3" /> {bombs}
                </span>

                <span
                  className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded border truncate max-w-[85px]"
                  style={{
                    backgroundColor: `${weaponInfo.iconColor}20`,
                    borderColor: weaponInfo.iconColor,
                    color: weaponInfo.iconColor,
                  }}
                  title={weaponInfo.name}
                >
                  {currentWeapon} P{power}
                </span>

                {hasWingman && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-300 bg-emerald-950/70 px-1 py-0.5 rounded border border-emerald-600">
                    <Users className="w-3 h-3" />
                  </span>
                )}
              </div>

              {/* Dynamic Weather Badge Indicator */}
              {weatherInfo && (
                <div className="flex items-center justify-end pt-0.5">
                  <button
                    onClick={onCycleWeather}
                    className="pointer-events-auto inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border backdrop-blur-sm hover:brightness-125 transition-all shadow-sm"
                    style={{
                      backgroundColor: `${weatherInfo.color}25`,
                      borderColor: `${weatherInfo.color}80`,
                      color: weatherInfo.color,
                    }}
                    title={`海域氣候：${weatherInfo.name} (${weatherInfo.description}) - 點擊手動切換`}
                  >
                    {weatherInfo.id === 'CLEAR' && <Sun className="w-2.5 h-2.5 text-sky-400" />}
                    {weatherInfo.id === 'STORM' && <CloudLightning className="w-2.5 h-2.5 text-indigo-400" />}
                    {weatherInfo.id === 'FOG' && <CloudFog className="w-2.5 h-2.5 text-slate-300" />}
                    <span>{weatherInfo.name}</span>
                    {weatherInfo.id === 'STORM' && (
                      <span className="text-[8px] text-amber-300 font-mono font-normal">(-15%速)</span>
                    )}
                    {weatherInfo.id === 'FOG' && (
                      <span className="text-[8px] text-sky-200 font-mono font-normal">(探照燈)</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Active Skills Bar */}
          <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2">
            <button
              onClick={() => onActivateSkill('SHIELD')}
              disabled={skillCd.SHIELD > 0}
              className={`w-11 h-11 rounded-lg flex flex-col items-center justify-center font-arcade text-[9px] border transition-transform active:scale-95 shadow-lg select-none ${
                activeSkills.shield
                  ? 'bg-sky-500 border-sky-200 text-white animate-pulse shadow-sky-500/50'
                  : skillCd.SHIELD === 0
                  ? 'bg-slate-900/90 border-sky-400 text-sky-400 hover:bg-sky-950'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              title="護盾 [Q]"
            >
              <Shield className="w-3.5 h-3.5 mb-0.5" />
              <span>{skillCd.SHIELD > 0 ? `${skillCd.SHIELD}s` : 'Q:盾'}</span>
            </button>

            <button
              onClick={() => onActivateSkill('BOOST')}
              disabled={skillCd.BOOST > 0}
              className={`w-11 h-11 rounded-lg flex flex-col items-center justify-center font-arcade text-[9px] border transition-transform active:scale-95 shadow-lg select-none ${
                activeSkills.boost
                  ? 'bg-amber-500 border-amber-200 text-slate-950 animate-pulse shadow-amber-500/50'
                  : skillCd.BOOST === 0
                  ? 'bg-slate-900/90 border-amber-400 text-amber-400 hover:bg-amber-950'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              title="超頻渦輪加速 [E]"
            >
              <Flame className="w-3.5 h-3.5 mb-0.5" />
              <span>{skillCd.BOOST > 0 ? `${skillCd.BOOST}s` : 'E:速'}</span>
            </button>

            <button
              onClick={() => onActivateSkill('AIR_STRIKE')}
              disabled={skillCd.AIR_STRIKE > 0}
              className={`w-11 h-11 rounded-lg flex flex-col items-center justify-center font-arcade text-[9px] border transition-transform active:scale-95 shadow-lg select-none ${
                skillCd.AIR_STRIKE === 0
                  ? 'bg-slate-900/90 border-red-500 text-red-400 hover:bg-red-950'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              title="戰術空襲 [R]"
            >
              <Rocket className="w-3.5 h-3.5 mb-0.5" />
              <span>{skillCd.AIR_STRIKE > 0 ? `${skillCd.AIR_STRIKE}s` : 'R:襲'}</span>
            </button>
          </div>

          {/* Right Bottom: Auto-fire & Bomb Button */}
          <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2">
            <button
              onClick={onToggleAutoFire}
              className={`px-2 py-2 rounded-lg text-[10px] font-tech font-bold border transition-colors shadow-lg ${
                autoFire
                  ? 'bg-emerald-900/80 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900/80 border-slate-700 text-slate-400'
              }`}
            >
              連發:{autoFire ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={onUseBomb}
              disabled={bombs <= 0}
              className={`w-13 h-13 rounded-full flex flex-col items-center justify-center font-arcade font-bold text-[9px] shadow-2xl transition-transform active:scale-90 border-2 select-none ${
                bombs > 0
                  ? 'bg-gradient-to-b from-red-500 to-red-800 border-red-200 text-white shadow-red-900/60 animate-bounce'
                  : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed opacity-50'
              }`}
            >
              <BombIcon className="w-3.5 h-3.5 mb-0.5" />
              <span>BOMB</span>
            </button>
          </div>
        </>
      )}

      {/* TITLE SCREEN OVERLAY */}
      {gameState === 'TITLE_MENU' && (
        <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-between p-4 text-center overflow-y-auto">
          <div className="w-full pt-1">
            <span className="text-[10px] font-tech text-yellow-400 tracking-widest font-semibold block mb-0.5">
              CLASSIC SHOOT 'EM UP
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold font-arcade text-yellow-400 tracking-wider drop-shadow-[0_4px_10px_rgba(250,204,21,0.4)]">
              1945 AIR FORCE
            </h1>
            <p className="text-[11px] text-slate-400 font-tech">二戰街機空戰 · 復刻強化版</p>
          </div>

          {/* Plane & Mode Selection Cards */}
          <div className="w-full max-w-sm space-y-2 my-1.5 text-xs">
            {/* Plane Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 shadow-xl text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-yellow-400 font-tech">出擊戰機</span>
                <button
                  onClick={onOpenHangar}
                  className="text-[11px] text-blue-400 hover:text-blue-300 underline font-tech"
                >
                  機庫更換
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center border font-arcade font-bold text-[10px] shrink-0"
                  style={{ backgroundColor: `${currentPlane.color}25`, borderColor: currentPlane.color }}
                >
                  {selectedPlane}
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs">{currentPlane.name}</h3>
                  <p className="text-[10px] text-slate-400">{currentPlane.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Weapon & Mode Card */}
            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-cyan-400 font-bold font-tech">主要武器</span>
                  <button onClick={onOpenArmory} className="text-[11px] text-cyan-400 hover:underline">
                    武器庫
                  </button>
                </div>
                <div className="font-bold text-white text-xs truncate">{weaponInfo.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">破壞 {weaponInfo.baseDamage}</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-amber-400 font-bold font-tech">作戰模式</span>
                  <button onClick={onOpenModes} className="text-[11px] text-amber-400 hover:underline">
                    更換
                  </button>
                </div>
                <div className="font-bold text-white text-xs truncate">{modeInfo.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{modeInfo.badge}</div>
              </div>
            </div>

            {/* Max Hits Configuration Card (3 to 9 hits, up to 10) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-left">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-red-400 font-bold font-tech flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-red-400" /> 挑戰生命點數 (3~9 點)
                </span>
                <span className="text-xs font-mono font-bold text-yellow-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {maxHitsAllowed} 點 (被擊中 {maxHitsAllowed} 次結束)
                </span>
              </div>
              <div className="grid grid-cols-8 gap-1 pt-0.5">
                {[3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => onSetMaxHitsAllowed(num)}
                    className={`py-1 text-center font-mono font-bold text-xs rounded transition-colors ${
                      maxHitsAllowed === num
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/30 ring-1 ring-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                    title={`被擊中 ${num} 次才結束`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Controls & High Score */}
          <div className="text-xs text-slate-400 space-y-1 font-tech">
            <p className="text-slate-300 font-medium">鍵盤 [WASD] 移動 · [空白] 射擊 · [B] 炸彈 · [Q/E/R] 技能</p>
            <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 font-tech pt-0.5">
              <span className="flex items-center gap-1 text-sky-400"><Sun className="w-3 h-3" /> 晴天巡航</span>
              <span className="flex items-center gap-1 text-indigo-400"><CloudLightning className="w-3 h-3" /> 暴風雷雨 (-15%速)</span>
              <span className="flex items-center gap-1 text-slate-300"><CloudFog className="w-3 h-3" /> 濃霧探照</span>
            </div>
            {highScore > 0 && (
              <div className="pt-0.5 flex items-center justify-center gap-1.5 text-amber-400 font-arcade text-[10px]">
                <Trophy className="w-3.5 h-3.5" /> HI-SCORE: {highScore.toLocaleString()}
              </div>
            )}
          </div>

          {/* Start Mission Button */}
          <button
            onClick={() => onStartGame()}
            className="w-full max-w-xs py-3 px-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-arcade font-bold text-sm rounded-lg shadow-lg shadow-emerald-500/30 transition-transform active:scale-95"
          >
            出擊 START MISSION
          </button>
        </div>
      )}

      {/* PAUSE OVERLAY */}
      {gameState === 'PAUSED' && (
        <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 border-2 border-yellow-400 flex items-center justify-center text-yellow-400 mb-3 animate-pulse">
            <Pause className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-arcade text-yellow-400 mb-1">作戰暫停 PAUSED</h2>
          <p className="text-xs text-slate-400 mb-5 font-tech">按 [P] 鍵或 [Esc] 鍵隨時恢復作戰</p>

          <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-xl p-3.5 mb-5 text-left text-xs font-tech space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>目前得分</span>
              <span className="font-arcade text-yellow-400">{score.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>戰鬥關卡</span>
              <span className="font-mono text-sky-400">Stage {stage}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>目前武器</span>
              <span className="font-mono text-cyan-400">{weaponInfo.name}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>擊墜總數</span>
              <span className="font-mono text-white">{enemiesDefeated} 架</span>
            </div>
          </div>

          <div className="space-y-2.5 w-52">
            <button
              onClick={onTogglePause}
              className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold font-tech text-sm rounded transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" /> 恢復遊戲 (RESUME)
            </button>
            <button
              onClick={() => onStartGame()}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold font-tech text-sm rounded transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> 重新出擊 (RETRY)
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER OVERLAY */}
      {gameState === 'GAME_OVER' && (
        <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-extrabold font-arcade text-red-500 tracking-wider mb-1 animate-pulse">
            MISSION FAILED
          </h2>
          <span className="text-xs text-slate-400 font-tech mb-4">戰機遭受擊墜，任務中止</span>

          <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4 text-left space-y-2 font-tech text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400 font-arcade text-[10px]">FINAL SCORE</span>
              <span className="text-lg font-bold text-yellow-400 font-arcade tabular-nums">
                {score.toLocaleString()}
              </span>
            </div>

            {score >= highScore && score > 0 && (
              <div className="text-center py-1 text-emerald-400 font-arcade text-[10px] bg-emerald-950/60 rounded border border-emerald-700">
                🏆 NEW HIGH SCORE RECORD!
              </div>
            )}

            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">達成關卡 (Stage)</span>
              <span className="font-bold text-sky-400 font-mono">Stage {stage}</span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">擊墜敵機 (Downed)</span>
              <span className="font-bold text-white font-mono">{enemiesDefeated} 架</span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">擊沉巨型戰艦 (Bosses)</span>
              <span className="font-bold text-yellow-400 font-mono">{bossesDefeated} 艘</span>
            </div>
          </div>

          {/* Boss Replay Trigger Button if boss was encountered */}
          {latestBossBattle && (
            <button
              onClick={onOpenBossReplay}
              className="w-full max-w-xs py-2.5 px-4 mb-3 bg-gradient-to-r from-red-950 to-slate-900 hover:from-red-900 hover:to-slate-800 text-yellow-400 font-arcade text-[10px] rounded-lg border border-red-500/60 shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Activity className="w-4 h-4 text-red-400" />
              <span>戰鬥重播摘要 (BOSS REPLAY & DPS)</span>
            </button>
          )}

          <button
            onClick={() => onStartGame()}
            className="w-full max-w-xs py-3.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-arcade font-bold text-xs rounded-lg shadow-lg shadow-yellow-500/20 transition-transform active:scale-95"
          >
            再次挑戰 PLAY AGAIN
          </button>
        </div>
      )}

      {/* CHALLENGE SUCCESS OVERLAY */}
      {gameState === 'CHALLENGE_SUCCESS' && (
        <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-2">
            <Award className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold font-arcade text-emerald-400 tracking-wider mb-1">
            CHALLENGE CLEAR!
          </h2>
          <span className="text-xs text-slate-400 font-tech mb-4">極限作戰達成！恭喜王牌飛行員！</span>

          <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4 text-left space-y-2 font-tech text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400 font-arcade text-[10px]">TOTAL SCORE</span>
              <span className="text-lg font-bold text-yellow-400 font-arcade tabular-nums">
                {score.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">挑戰模式 (Mode)</span>
              <span className="font-bold text-amber-400 font-mono">{modeInfo.name}</span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">擊墜敵機 (Downed)</span>
              <span className="font-bold text-white font-mono">{enemiesDefeated} 架</span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">擊沉巨型戰艦</span>
              <span className="font-bold text-emerald-400 font-mono">{bossesDefeated} 艘</span>
            </div>
          </div>

          {/* Boss Replay Trigger Button if boss was encountered */}
          {latestBossBattle && (
            <button
              onClick={onOpenBossReplay}
              className="w-full max-w-xs py-2.5 px-4 mb-3 bg-gradient-to-r from-emerald-950 to-slate-900 hover:from-emerald-900 hover:to-slate-800 text-yellow-400 font-arcade text-[10px] rounded-lg border border-emerald-500/60 shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>戰鬥重播摘要 (BOSS REPLAY & DPS)</span>
            </button>
          )}

          <button
            onClick={() => onStartGame()}
            className="w-full max-w-xs py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-arcade font-bold text-xs rounded-lg shadow-lg shadow-emerald-500/20 transition-transform active:scale-95"
          >
            再次挑戰 PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  );
};
