import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Monitor,
  Plane,
  BookOpen,
  Trophy,
  ShieldAlert,
  Zap,
  Bomb,
  Heart,
  Users,
  Crosshair,
  Swords,
  Flame,
  Shield,
  Rocket,
  Activity,
} from 'lucide-react';
import { useArcadeEngine } from './game/useArcadeEngine';
import { ArcadeCabinet } from './components/ArcadeCabinet';
import { HangarModal } from './components/HangarModal';
import { ArmoryModal } from './components/ArmoryModal';
import { ModeSelectModal } from './components/ModeSelectModal';
import { MissionBriefModal } from './components/MissionBriefModal';
import { RecordsModal } from './components/RecordsModal';
import { BossReplayModal } from './components/BossReplayModal';
import { sound } from './game/audio';
import { GAME_MODES, PLANES, WEAPONS } from './game/types';

export default function App() {
  const engine = useArcadeEngine();

  // Audio & Display toggles
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [crtMode, setCrtMode] = useState<boolean>(true);

  // Modals
  const [isHangarOpen, setIsHangarOpen] = useState<boolean>(false);
  const [isArmoryOpen, setIsArmoryOpen] = useState<boolean>(false);
  const [isModesOpen, setIsModesOpen] = useState<boolean>(false);
  const [isBriefOpen, setIsBriefOpen] = useState<boolean>(false);
  const [isRecordsOpen, setIsRecordsOpen] = useState<boolean>(false);
  const [isBossReplayOpen, setIsBossReplayOpen] = useState<boolean>(false);

  const toggleSound = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const currentPlane = PLANES[engine.selectedPlane] || PLANES.P51;
  const currentWeapon = WEAPONS[engine.currentWeapon] || WEAPONS.VULCAN;
  const currentMode = GAME_MODES[engine.gameMode] || GAME_MODES.CAMPAIGN;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-tech selection:bg-yellow-500 selection:text-slate-950">
      {/* Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (Clean Nav Links) - Zone 3 (1-2 Actions) */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-4 md:px-8 py-3.5 flex items-center justify-between">
        {/* Zone 1: Single text element Brand Wordmark */}
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="text-lg md:text-xl font-bold font-arcade tracking-tight text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            1945 AIR FORCE
          </a>
          <span className="hidden sm:inline-block text-xs text-slate-500 font-mono">
            v2.5 終極作戰
          </span>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="flex items-center gap-3 sm:gap-6 text-xs md:text-sm font-medium">
          <button
            onClick={() => setIsHangarOpen(true)}
            className="text-slate-300 hover:text-yellow-400 transition-colors flex items-center gap-1.5"
          >
            <Plane className="w-4 h-4 text-yellow-400" />
            <span className="hidden sm:inline">機庫</span>
          </button>
          <button
            onClick={() => setIsArmoryOpen(true)}
            className="text-slate-300 hover:text-yellow-400 transition-colors flex items-center gap-1.5"
          >
            <Crosshair className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">武器庫</span>
          </button>
          <button
            onClick={() => setIsModesOpen(true)}
            className="text-slate-300 hover:text-yellow-400 transition-colors flex items-center gap-1.5"
          >
            <Swords className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">挑戰模式</span>
          </button>
          <button
            onClick={() => setIsBriefOpen(true)}
            className="text-slate-300 hover:text-yellow-400 transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">作戰簡報</span>
          </button>
          <button
            onClick={() => setIsRecordsOpen(true)}
            className="text-slate-300 hover:text-yellow-400 transition-colors flex items-center gap-1.5"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">榮譽榜</span>
          </button>
          {engine.latestBossBattle && (
            <button
              onClick={() => setIsBossReplayOpen(true)}
              className="text-red-400 hover:text-yellow-400 transition-colors flex items-center gap-1.5 animate-pulse"
              title="檢視最近一次 Boss 戰鬥火力輸出與生命損耗重播"
            >
              <Activity className="w-4 h-4 text-red-400" />
              <span className="hidden sm:inline">戰鬥重播</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Actions (Sound FX & CRT Toggle) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCrtMode(!crtMode)}
            className={`p-2 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              crtMode
                ? 'bg-emerald-950/70 text-emerald-400 border-emerald-600'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="切換復古 CRT 掃描線濾鏡"
            aria-label="CRT 濾鏡切換"
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline">CRT {crtMode ? '開' : '關'}</span>
          </button>

          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              !isMuted
                ? 'bg-yellow-950/70 text-yellow-400 border-yellow-600'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="切換音效"
            aria-label="音效開關"
          >
            {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{!isMuted ? '音效' : '靜音'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Arena: 1440px wide layout baseline with side briefing panels */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
        {/* Left Side Tactical Panel (Desktop only) */}
        <aside className="hidden xl:flex flex-col gap-4 w-72 shrink-0">
          {/* Tactical Telemetry Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
            <h2 className="text-xs font-arcade font-bold text-yellow-400 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" /> 戰情儀表 TELEMETRY
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">執勤戰機</span>
                <div className="font-bold text-white text-sm">{currentPlane.name}</div>
                <div className="text-[11px] text-slate-400">{currentPlane.subtitle}</div>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                <span className="text-[10px] text-cyan-400 font-bold block mb-0.5">主炮武器</span>
                <div className="font-bold text-white text-xs">{currentWeapon.name}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  等級 P{engine.power} · 傷害 {currentWeapon.baseDamage}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
                  <span className="text-slate-400 text-[10px] block">作戰模式</span>
                  <span className="font-tech text-purple-400 font-bold truncate block">{currentMode.name}</span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
                  <span className="text-slate-400 text-[10px] block">關卡進度</span>
                  <span className="font-arcade text-sky-400 text-xs">STAGE {engine.stage}</span>
                </div>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-red-400" /> 耐久生命
                  </span>
                  <span className="font-mono text-red-400 font-bold">
                    {engine.hp} / {engine.maxHp}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Bomb className="w-3.5 h-3.5 text-orange-400" /> 清屏炸彈
                  </span>
                  <span className="font-mono text-orange-400 font-bold">{engine.bombs} 枚</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-emerald-400" /> 僚機掩護
                  </span>
                  <span className={`font-mono font-bold ${engine.hasWingman ? 'text-emerald-400' : 'text-slate-600'}`}>
                    {engine.hasWingman ? '就緒編隊' : '未啟動'}
                  </span>
                </div>
              </div>

              {/* Skills Cooldown Monitor */}
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80 space-y-1 text-[11px] font-mono">
                <span className="text-[10px] text-slate-400 block font-tech mb-1">主動技能狀態 (鍵位 Q/E/R)</span>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1 text-sky-400"><Shield className="w-3 h-3" /> Q:神盾</span>
                  <span>{engine.skillCd.SHIELD > 0 ? `${engine.skillCd.SHIELD}s` : 'READY'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1 text-amber-400"><Flame className="w-3 h-3" /> E:渦輪</span>
                  <span>{engine.skillCd.BOOST > 0 ? `${engine.skillCd.BOOST}s` : 'READY'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1 text-red-400"><Rocket className="w-3 h-3" /> R:空襲</span>
                  <span>{engine.skillCd.AIR_STRIKE > 0 ? `${engine.skillCd.AIR_STRIKE}s` : 'READY'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setIsHangarOpen(true)}
                  className="py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded transition-colors text-center"
                >
                  更換戰機
                </button>
                <button
                  onClick={() => setIsArmoryOpen(true)}
                  className="py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded transition-colors text-center"
                >
                  武器庫
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Center: The Game Cabinet Area */}
        <div className="flex flex-col items-center justify-center w-full max-w-[480px]">
          <ArcadeCabinet
            canvasRef={engine.canvasRef}
            gameState={engine.gameState}
            gameMode={engine.gameMode}
            selectedPlane={engine.selectedPlane}
            currentWeapon={engine.currentWeapon}
            currentWeather={engine.currentWeather}
            weatherInfo={engine.weatherInfo}
            onCycleWeather={engine.cycleWeather}
            score={engine.score}
            highScore={engine.highScore}
            stage={engine.stage}
            hp={engine.hp}
            maxHp={engine.maxHp}
            maxHitsAllowed={engine.maxHitsAllowed}
            onSetMaxHitsAllowed={engine.setMaxHitsAllowed}
            bombs={engine.bombs}
            power={engine.power}
            hasWingman={engine.hasWingman}
            hasShield={engine.hasShield}
            enemiesDefeated={engine.enemiesDefeated}
            bossesDefeated={engine.bossesDefeated}
            timeRemaining={engine.timeRemaining}
            skillCd={engine.skillCd}
            activeSkills={engine.activeSkills}
            latestBossBattle={engine.latestBossBattle}
            onOpenBossReplay={() => setIsBossReplayOpen(true)}
            autoFire={engine.autoFire}
            crtMode={crtMode}
            onToggleAutoFire={() => engine.setAutoFire(!engine.autoFire)}
            onStartGame={() => engine.startGame()}
            onTogglePause={engine.togglePause}
            onUseBomb={engine.useBomb}
            onActivateSkill={engine.activateSkill}
            onOpenHangar={() => setIsHangarOpen(true)}
            onOpenArmory={() => setIsArmoryOpen(true)}
            onOpenModes={() => setIsModesOpen(true)}
            onPointerDown={engine.handlePointerDown}
            onPointerMove={engine.handlePointerMove}
            onPointerUp={engine.handlePointerUp}
          />
        </div>

        {/* Right Side Mission Intel Panel (Desktop only) */}
        <aside className="hidden xl:flex flex-col gap-4 w-72 shrink-0">
          {/* Controls Overview */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
            <h2 className="text-xs font-arcade font-bold text-emerald-400 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> 鍵位備忘 CONTROLS
            </h2>

            <div className="space-y-1.5 text-xs font-tech">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">移動戰機</span>
                <span className="font-mono text-yellow-400 font-bold">W A S D / 方向鍵</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">航炮發射</span>
                <span className="font-mono text-yellow-400 font-bold">空白鍵 Space</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">清屏炸彈</span>
                <span className="font-mono text-red-400 font-bold">B 鍵 / X 鍵</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">能量神盾 [5秒]</span>
                <span className="font-mono text-sky-400 font-bold">Q 鍵</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">超頻渦輪加速</span>
                <span className="font-mono text-amber-400 font-bold">E 鍵</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">戰術火箭空襲</span>
                <span className="font-mono text-orange-400 font-bold">R 鍵</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">作戰暫停 / 恢復</span>
                <span className="font-mono text-blue-400 font-bold">P 鍵 / Esc</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">數字切換武器</span>
                <span className="font-mono text-cyan-400">1 ~ 4 鍵</span>
              </div>
            </div>
          </div>

          {/* Enemy & Boss Intel */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
            <h2 className="text-xs font-arcade font-bold text-red-400 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> 敵艦情報 INTEL
            </h2>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                <div className="font-bold text-white">Stage 1: 扶桑號航空巡洋艦</div>
                <div className="text-[11px] text-slate-400">三聯裝主力艦炮 · 5連發扇形重彈</div>
              </div>

              <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                <div className="font-bold text-white">Stage 2: 齊柏林空中要塞</div>
                <div className="text-[11px] text-slate-400">重裝飛艇裝甲 · 360° 迴轉環狀彈幕</div>
              </div>

              <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                <div className="font-bold text-white">Stage 3: 震電超重型母艦</div>
                <div className="text-[11px] text-slate-400">前掠翼終極兵器 · 螺旋密集彈幕</div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-500 font-tech">
        1945 Air Force Arcade · 忠實還原二戰街機縱向射擊榮光 · 武器庫與技能系統 · 限時與連戰挑戰模式
      </footer>

      {/* Modals */}
      <HangarModal
        isOpen={isHangarOpen}
        onClose={() => setIsHangarOpen(false)}
        selectedPlane={engine.selectedPlane}
        onSelectPlane={(plane) => {
          engine.setSelectedPlane(plane);
          setIsHangarOpen(false);
          if (engine.gameState === 'TITLE_MENU') {
            engine.startGame(plane);
          }
        }}
      />

      <ArmoryModal
        isOpen={isArmoryOpen}
        onClose={() => setIsArmoryOpen(false)}
        currentWeapon={engine.currentWeapon}
        onSelectWeapon={(weapon) => {
          engine.changeWeapon(weapon);
          setIsArmoryOpen(false);
        }}
      />

      <ModeSelectModal
        isOpen={isModesOpen}
        onClose={() => setIsModesOpen(false)}
        selectedMode={engine.gameMode}
        onSelectMode={(mode, hp) => {
          engine.setGameMode(mode);
          if (typeof hp === 'number') {
            engine.setMaxHitsAllowed(hp);
          }
          setIsModesOpen(false);
          if (engine.gameState === 'TITLE_MENU') {
            engine.startGame(undefined, mode, undefined, hp);
          }
        }}
        maxHitsAllowed={engine.maxHitsAllowed}
        onSetMaxHitsAllowed={engine.setMaxHitsAllowed}
      />

      <MissionBriefModal
        isOpen={isBriefOpen}
        onClose={() => setIsBriefOpen(false)}
      />

      <RecordsModal
        isOpen={isRecordsOpen}
        onClose={() => setIsRecordsOpen(false)}
        currentHighScore={engine.highScore}
      />

      <BossReplayModal
        isOpen={isBossReplayOpen}
        onClose={() => setIsBossReplayOpen(false)}
        record={engine.latestBossBattle}
      />
    </div>
  );
}
