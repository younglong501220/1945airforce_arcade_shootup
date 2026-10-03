import { useCallback, useEffect, useRef, useState } from 'react';
import { sound } from './audio';
import { GameRenderer } from './renderer';
import {
  Afterimage,
  Boss,
  BossBattleRecord,
  BossCombatSample,
  Bullet,
  Cloud,
  DropItem,
  Enemy,
  FloatingText,
  GAME_MODES,
  GameMode,
  HighScoreRecord,
  Island,
  Particle,
  PLANES,
  PlaneType,
  Raindrop,
  Shockwave,
  SkillType,
  WEAPONS,
  WeaponType,
  WEATHERS,
  WeatherType,
} from './types';

const STORAGE_KEY_HISCORE = '1945_airforce_hiscores_v2';
const STORAGE_KEY_MAX_HITS = '1945_airforce_max_hits_v1';

export function useArcadeEngine() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-level UI states
  const [gameState, setGameState] = useState<'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'STAGE_CLEAR' | 'GAME_OVER' | 'CHALLENGE_SUCCESS'>('TITLE_MENU');
  const [gameMode, setGameMode] = useState<GameMode>('CAMPAIGN');
  const [selectedPlane, setSelectedPlane] = useState<PlaneType>('P51');
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>('VULCAN');
  const [currentWeather, setCurrentWeather] = useState<WeatherType>('CLEAR');

  // Configurable Max Allowed Hits (Minimum 3, Maximum 10)
  const [maxHitsAllowed, setMaxHitsAllowedState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MAX_HITS);
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 3 && val <= 10) return val;
      }
    } catch {}
    return 3;
  });

  const setMaxHitsAllowed = useCallback((hits: number) => {
    const clamped = Math.max(3, Math.min(10, hits));
    setMaxHitsAllowedState(clamped);
    const s = stateRef.current;
    s.maxHitsAllowed = clamped;
    s.maxHp = clamped;
    s.hp = clamped;
    setHp(clamped);
    setMaxHp(clamped);
    try {
      localStorage.setItem(STORAGE_KEY_MAX_HITS, clamped.toString());
    } catch {}
  }, []);

  // Latest Boss Battle Replay data
  const [latestBossBattle, setLatestBossBattle] = useState<BossBattleRecord | null>(null);

  // Gameplay HUD states
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISCORE);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed[0].score : 0;
      }
    } catch {}
    return 0;
  });
  const [stage, setStage] = useState<number>(1);
  const [hp, setHp] = useState<number>(maxHitsAllowed);
  const [maxHp, setMaxHp] = useState<number>(maxHitsAllowed);
  const [bombs, setBombs] = useState<number>(2);
  const [power, setPower] = useState<number>(1);
  const [hasWingman, setHasWingman] = useState<boolean>(false);
  const [hasShield, setHasShield] = useState<boolean>(false);
  const [enemiesDefeated, setEnemiesDefeated] = useState<number>(0);
  const [bossesDefeated, setBossesDefeated] = useState<number>(0);
  const [autoFire, setAutoFire] = useState<boolean>(true);

  // Challenge Mode Timer (in seconds)
  const [timeRemaining, setTimeRemaining] = useState<number>(90);

  // Skill Cooldowns (in seconds remaining, 0 = ready)
  const [skillCd, setSkillCd] = useState<Record<SkillType, number>>({
    SHIELD: 0,
    BOOST: 0,
    AIR_STRIKE: 0,
  });
  const [activeSkills, setActiveSkills] = useState<{
    shield: boolean;
    boost: boolean;
  }>({ shield: false, boost: false });

  // References for the 60fps game loop
  const animFrameId = useRef<number | null>(null);
  const keys = useRef<Record<string, boolean>>({});
  const isPointerDown = useRef<boolean>(false);
  const touchOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Game internal mutable state
  const stateRef = useRef({
    score: 0,
    stage: 1,
    hp: maxHitsAllowed,
    maxHp: maxHitsAllowed,
    maxHitsAllowed: maxHitsAllowed,
    bombs: 2,
    power: 1,
    hasWingman: false,
    hasShield: false,
    enemiesDefeated: 0,
    bossesDefeated: 0,
    planeType: 'P51' as PlaneType,
    weaponType: 'VULCAN' as WeaponType,
    gameMode: 'CAMPAIGN' as GameMode,
    timeRemaining: 90,
    timeTimer: 0,
    playerX: 218,
    playerY: 600,
    playerW: 44,
    playerH: 44,
    speed: 6.2,
    shootCooldown: 0,
    fireRate: 9,
    invincibleTimer: 0,
    screenFlash: 0,
    screenShake: 0,
    bossWarningTimer: 0,
    oceanOffset: 0,
    propFrame: 0,

    // Boss combat replay tracker
    bossTracker: null as {
      active: boolean;
      bossName: string;
      bossTitle: string;
      stage: number;
      initialBossHp: number;
      initialPlayerHp: number;
      totalDamage: number;
      bombsUsed: number;
      hitsTaken: number;
      startFrame: number;
      lastSampleFrame: number;
      samples: BossCombatSample[];
      pendingEvent?: string;
    } | null,

    // Active skills timers (in frames, 60 frames = 1s)
    cdShield: 0,
    durShield: 0,
    cdBoost: 0,
    durBoost: 0,
    cdAirStrike: 0,

    // Weather System State
    weather: 'CLEAR' as WeatherType,
    weatherTimer: 0,
    weatherChangeAlert: 0,
    raindrops: [] as Raindrop[],
    lightningTimer: 0,
    lightningCooldown: 180,
    lightningBolt: [] as { x: number; y: number }[],

    bullets: [] as Bullet[],
    enemyBullets: [] as Bullet[],
    enemies: [] as Enemy[],
    items: [] as DropItem[],
    particles: [] as Particle[],
    shockwaves: [] as Shockwave[],
    afterimages: [] as Afterimage[],
    floatingTexts: [] as FloatingText[],
    clouds: [] as Cloud[],
    islands: [] as Island[],
    currentBoss: null as Boss | null,
    spawnCounter: 0,
    nextEnemyId: 1,
    nextItemId: 1,
    nextTextId: 1,
    running: false,
  });

  // Initialize background elements
  const initEnvironment = useCallback(() => {
    const s = stateRef.current;
    s.clouds = Array.from({ length: 7 }, () => ({
      x: Math.random() * 480,
      y: Math.random() * 720,
      size: 40 + Math.random() * 60,
      speed: 0.7 + Math.random() * 0.9,
      opacity: 0.12 + Math.random() * 0.12,
    }));

    s.raindrops = Array.from({ length: 75 }, () => ({
      x: Math.random() * 520,
      y: Math.random() * 740,
      length: 12 + Math.random() * 14,
      speed: 18 + Math.random() * 8,
      opacity: 0.5 + Math.random() * 0.4,
    }));

    s.islands = [
      {
        x: 120,
        y: 150,
        width: 140,
        height: 100,
        speed: 0.35,
        color: '#15803d',
        sandColor: '#d4b26f',
        points: [],
      },
      {
        x: 360,
        y: 480,
        width: 180,
        height: 130,
        speed: 0.35,
        color: '#166534',
        sandColor: '#ca8a04',
        points: [],
      },
      {
        x: 200,
        y: 800,
        width: 110,
        height: 90,
        speed: 0.35,
        color: '#14532d',
        sandColor: '#eab308',
        points: [],
      },
    ];
  }, []);

  // Save High Score record
  const recordHighScore = useCallback(
    (finalScore: number, finalStage: number, plane: PlaneType, weapon: WeaponType, mode: GameMode) => {
      try {
        const recordsStr = localStorage.getItem(STORAGE_KEY_HISCORE);
        const records: HighScoreRecord[] = recordsStr ? JSON.parse(recordsStr) : [];
        records.push({
          score: finalScore,
          stage: finalStage,
          mode,
          plane,
          weapon,
          date: new Date().toLocaleDateString('zh-TW', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        });
        records.sort((a, b) => b.score - a.score);
        const top5 = records.slice(0, 5);
        localStorage.setItem(STORAGE_KEY_HISCORE, JSON.stringify(top5));
        if (top5.length > 0 && top5[0].score > highScore) {
          setHighScore(top5[0].score);
        }
      } catch {}
    },
    [highScore]
  );

  // Create explosion particles helper
  const addExplosion = (x: number, y: number, count = 15, isBig = false) => {
    const s = stateRef.current;
    sound.playExplosion(isBig);
    if (isBig) {
      s.screenShake = 12;
      s.shockwaves.push({
        x,
        y,
        radius: 10,
        maxRadius: 100,
        color: '#f59e0b',
        alpha: 0.9,
      });
    }

    const colors = ['#fef08a', '#f97316', '#ef4444', '#f59e0b', '#cbd5e1'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * (isBig ? 6 : 4) + 1;
      s.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * (isBig ? 5 : 3),
        life: 20 + Math.random() * 15,
        maxLife: 35,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  };

  // Weapon-specific hit impact spark & explosion effects (Laser, Homing, Vulcan, Rocket)
  const addWeaponHitEffect = (x: number, y: number, b: Bullet) => {
    const s = stateRef.current;
    if (b.isLaser) {
      // Laser Piercing Electric Plasma Burst & Concentric Energy Rings
      s.shockwaves.push({
        x,
        y,
        radius: 4,
        maxRadius: 32,
        color: '#06b6d4',
        alpha: 0.95,
        lineWidth: 3.5,
      });

      // Expanding laser energy ring
      s.particles.push({
        x,
        y,
        vx: 0,
        vy: 0,
        radius: 3,
        life: 12,
        maxLife: 12,
        color: '#22d3ee',
        type: 'ring',
      });

      // Hyper-bright cyan & white electric plasma needles
      for (let i = 0; i < 14; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 5.2 + 2.0;
        s.particles.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          radius: 1.8 + Math.random() * 2.2,
          life: 9 + Math.random() * 8,
          maxLife: 17,
          color: Math.random() > 0.4 ? '#22d3ee' : '#a5f3fc',
          type: 'electric',
          glow: true,
        });
      }
    } else if (b.isHoming) {
      // Homing Missile Emerald-Jade Chemical Detonation
      sound.playExplosion(false);
      s.screenShake = Math.max(s.screenShake, 5);
      s.shockwaves.push({
        x,
        y,
        radius: 6,
        maxRadius: 44,
        color: '#10b981',
        alpha: 0.95,
        lineWidth: 4,
      });

      const homingColors = ['#10b981', '#34d399', '#059669', '#6ee7b7', '#fef08a'];
      for (let i = 0; i < 16; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 5.0 + 1.5;
        s.particles.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          radius: 2.2 + Math.random() * 2.2,
          life: 14 + Math.random() * 10,
          maxLife: 24,
          color: homingColors[Math.floor(Math.random() * homingColors.length)],
          type: 'spark',
          glow: true,
        });
      }

      // Billowing chemical smoke puffs
      for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 1.8 + 0.6;
        s.particles.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          radius: 3.5,
          grow: 0.25,
          life: 20 + Math.random() * 12,
          maxLife: 32,
          color: 'rgba(203, 213, 225, 0.75)',
          type: 'smoke',
        });
      }
    } else if (b.isRocket) {
      // Heavy Airburst Blast with dual shockwaves
      addExplosion(x, y, 22, true);
      s.shockwaves.push({
        x,
        y,
        radius: 8,
        maxRadius: 75,
        color: '#ea580c',
        alpha: 0.95,
        lineWidth: 5,
      });
      s.shockwaves.push({
        x,
        y,
        radius: 4,
        maxRadius: 50,
        color: '#f97316',
        alpha: 0.9,
        lineWidth: 3.5,
      });
    } else {
      // Vulcan / Machine Gun Kinetic Ricochet Spark Burst & Metal Shrapnel
      s.shockwaves.push({
        x,
        y,
        radius: 3,
        maxRadius: 22,
        color: '#f59e0b',
        alpha: 0.8,
        lineWidth: 2.5,
      });

      const vulcanColors = ['#ffffff', '#fef08a', '#fbbf24', '#f59e0b'];
      for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 4.2 + 1.5;
        s.particles.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          radius: 1.6 + Math.random() * 1.8,
          life: 8 + Math.random() * 7,
          maxLife: 15,
          color: vulcanColors[Math.floor(Math.random() * vulcanColors.length)],
          type: 'tracer',
          glow: true,
        });
      }

      // Shrapnel metallic debris
      for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 3 + 1;
        s.particles.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          radius: 2 + Math.random() * 1.5,
          life: 12 + Math.random() * 8,
          maxLife: 20,
          color: '#cbd5e1',
          type: 'debris',
        });
      }
    }
  };

  // Add floating text
  const addFloatingText = (x: number, y: number, text: string, color = '#fef08a') => {
    const s = stateRef.current;
    s.floatingTexts.push({
      id: s.nextTextId++,
      x,
      y,
      text,
      color,
      life: 30,
      maxLife: 30,
    });
  };

  // Switch primary weapon
  const changeWeapon = useCallback((weapon: WeaponType) => {
    stateRef.current.weaponType = weapon;
    stateRef.current.fireRate = WEAPONS[weapon].fireRate;
    setCurrentWeapon(weapon);
    addFloatingText(
      stateRef.current.playerX + stateRef.current.playerW / 2,
      stateRef.current.playerY - 20,
      `WEAPON: ${WEAPONS[weapon].name}`,
      WEAPONS[weapon].iconColor
    );
  }, []);

  // Cycle or toggle weather condition
  const cycleWeather = useCallback((target?: WeatherType) => {
    const s = stateRef.current;
    const order: WeatherType[] = ['CLEAR', 'STORM', 'FOG'];
    const next = target || order[(order.indexOf(s.weather) + 1) % order.length];
    s.weather = next;
    s.weatherTimer = 0;
    s.weatherChangeAlert = 180;
    setCurrentWeather(next);
    addFloatingText(240, 180, `氣候劇變: ${WEATHERS[next].name}`, WEATHERS[next].color);
  }, []);

  // Trigger Active Skills (Aegis Shield, Afterburner Boost, Tactical Air Strike)
  const activateSkill = useCallback((type: SkillType) => {
    const s = stateRef.current;
    if (!s.running) return;

    if (type === 'SHIELD') {
      if (s.cdShield > 0) return;
      s.cdShield = 20 * 60; // 20s
      s.durShield = 5 * 60; // 5s
      sound.playSkillShield();
      addFloatingText(s.playerX + s.playerW / 2, s.playerY - 25, 'AEGIS SHIELD ACTIVATED!', '#38bdf8');

      // Barrier deployment shockwave & perimeter electric discharge
      s.shockwaves.push({
        x: s.playerX + s.playerW / 2,
        y: s.playerY + s.playerH / 2,
        radius: 8,
        maxRadius: 52,
        color: '#38bdf8',
        alpha: 0.95,
        lineWidth: 4,
      });

      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI * 2) / 12;
        s.particles.push({
          x: s.playerX + s.playerW / 2 + Math.cos(a) * 36,
          y: s.playerY + s.playerH / 2 + Math.sin(a) * 36,
          vx: Math.cos(a) * 3,
          vy: Math.sin(a) * 3,
          radius: 2,
          life: 14,
          maxLife: 14,
          color: '#38bdf8',
          type: 'electric',
          glow: true,
        });
      }
    } else if (type === 'BOOST') {
      if (s.cdBoost > 0) return;
      s.cdBoost = 15 * 60; // 15s
      s.durBoost = 4 * 60; // 4s
      sound.playSkillBoost();
      addFloatingText(s.playerX + s.playerW / 2, s.playerY - 25, 'AFTERBURNER BOOST!', '#eab308');

      // Ignition blast wave
      s.shockwaves.push({
        x: s.playerX + s.playerW / 2,
        y: s.playerY + s.playerH / 2,
        radius: 10,
        maxRadius: 65,
        color: '#eab308',
        alpha: 0.95,
        lineWidth: 4,
      });

      // Mach cone ignition sparks
      for (let i = 0; i < 16; i++) {
        const a = Math.PI / 2 + (Math.random() - 0.5) * 1.4;
        const spd = Math.random() * 6 + 4;
        s.particles.push({
          x: s.playerX + s.playerW / 2 + (Math.random() - 0.5) * 16,
          y: s.playerY + s.playerH,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd,
          radius: 2.5,
          life: 12 + Math.random() * 8,
          maxLife: 20,
          color: Math.random() > 0.5 ? '#38bdf8' : '#eab308',
          type: 'mach_cone',
          glow: true,
        });
      }
    } else if (type === 'AIR_STRIKE') {
      if (s.cdAirStrike > 0) return;
      s.cdAirStrike = 25 * 60; // 25s
      sound.playSkillAirStrike();
      addFloatingText(240, 200, 'TACTICAL AIR STRIKE INCOMING!', '#dc2626');

      // Fullscreen Explosive Light Flash & Screen Shake
      s.screenFlash = 32;
      s.screenShake = 22;

      // Carpet bombing shockwaves across the battlefield
      s.shockwaves.push({
        x: 240,
        y: 320,
        radius: 15,
        maxRadius: 320,
        color: '#fef08a',
        alpha: 0.95,
        lineWidth: 6,
      });
      s.shockwaves.push({
        x: 120,
        y: 260,
        radius: 10,
        maxRadius: 240,
        color: '#ef4444',
        alpha: 0.9,
        lineWidth: 5,
      });
      s.shockwaves.push({
        x: 360,
        y: 260,
        radius: 10,
        maxRadius: 240,
        color: '#f97316',
        alpha: 0.9,
        lineWidth: 5,
      });

      // Battlefield carpet fireballs
      for (let i = 0; i < 20; i++) {
        const bx = 30 + Math.random() * 420;
        const by = 80 + Math.random() * 400;
        s.particles.push({
          x: bx,
          y: by,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          radius: 3 + Math.random() * 4,
          life: 18 + Math.random() * 12,
          maxLife: 30,
          color: Math.random() > 0.5 ? '#fef08a' : '#f97316',
          type: 'spark',
          glow: true,
        });
      }

      // Launch heavy barrage of 14 air strike rockets across screen in wave formation
      for (let i = 0; i < 14; i++) {
        const rx = 24 + i * 32;
        s.bullets.push({
          x: rx,
          y: 720 + (i % 2) * 20,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -15.5,
          isPlayer: true,
          damage: 5.0,
          radius: 6.5,
          color: '#fb923c',
          isRocket: true,
          blastRadius: 70,
        });
      }
    }
  }, []);

  // Player shooting logic with 4 Weapon Types
  const firePlayerBullets = () => {
    const s = stateRef.current;
    const cx = s.playerX + s.playerW / 2;
    const cy = s.playerY;

    if (s.weaponType === 'LASER') {
      sound.playBeamLaser();
      const beamDamage = 1.2 * s.power;
      s.bullets.push({
        x: cx,
        y: cy - 20,
        vx: 0,
        vy: -18,
        isPlayer: true,
        damage: beamDamage,
        radius: 6,
        color: '#22d3ee',
        isLaser: true,
        laserHeight: 40,
      });

      if (s.power >= 3) {
        s.bullets.push({
          x: cx - 12,
          y: cy - 10,
          vx: -0.5,
          vy: -18,
          isPlayer: true,
          damage: beamDamage * 0.7,
          radius: 5,
          color: '#22d3ee',
          isLaser: true,
          laserHeight: 35,
        });
        s.bullets.push({
          x: cx + 12,
          y: cy - 10,
          vx: 0.5,
          vy: -18,
          isPlayer: true,
          damage: beamDamage * 0.7,
          radius: 5,
          color: '#22d3ee',
          isLaser: true,
          laserHeight: 35,
        });
      }
    } else if (s.weaponType === 'HOMING') {
      sound.playMissileLaunch();
      const count = s.power >= 3 ? 4 : 2;
      for (let i = 0; i < count; i++) {
        const offset = (i - (count - 1) / 2) * 14;
        s.bullets.push({
          x: cx + offset,
          y: cy,
          vx: offset * 0.2,
          vy: -8,
          isPlayer: true,
          damage: 2.2,
          radius: 4.5,
          color: '#34d399',
          isHoming: true,
        });
      }
    } else if (s.weaponType === 'ROCKET') {
      sound.playRocketLaunch();
      s.bullets.push({
        x: cx,
        y: cy - 6,
        vx: 0,
        vy: -10,
        isPlayer: true,
        damage: 3.5 * (s.power * 0.7),
        radius: 6.5,
        color: '#fb923c',
        isRocket: true,
        blastRadius: 50,
      });

      if (s.power >= 2) {
        s.bullets.push({
          x: cx - 15,
          y: cy,
          vx: -1.0,
          vy: -9.5,
          isPlayer: true,
          damage: 2.8,
          radius: 5.5,
          color: '#fb923c',
          isRocket: true,
          blastRadius: 40,
        });
        s.bullets.push({
          x: cx + 15,
          y: cy,
          vx: 1.0,
          vy: -9.5,
          isPlayer: true,
          damage: 2.8,
          radius: 5.5,
          color: '#fb923c',
          isRocket: true,
          blastRadius: 40,
        });
      }
    } else {
      // Standard VULCAN
      sound.playLaser(s.planeType);
      if (s.power === 1) {
        s.bullets.push({ x: cx, y: cy, vx: 0, vy: -12, isPlayer: true, damage: 1.5, radius: 4.5, color: '#fef08a' });
      } else if (s.power === 2) {
        s.bullets.push({ x: cx - 10, y: cy, vx: 0, vy: -12, isPlayer: true, damage: 1.5, radius: 4.5, color: '#fef08a' });
        s.bullets.push({ x: cx + 10, y: cy, vx: 0, vy: -12, isPlayer: true, damage: 1.5, radius: 4.5, color: '#fef08a' });
      } else if (s.power === 3) {
        s.bullets.push({ x: cx, y: cy - 4, vx: 0, vy: -13, isPlayer: true, damage: 1.8, radius: 4.5, color: '#fef08a' });
        s.bullets.push({ x: cx - 12, y: cy, vx: -2.0, vy: -12, isPlayer: true, damage: 1.5, radius: 4.5, color: '#fde047' });
        s.bullets.push({ x: cx + 12, y: cy, vx: 2.0, vy: -12, isPlayer: true, damage: 1.5, radius: 4.5, color: '#fde047' });
      } else {
        s.bullets.push({ x: cx - 8, y: cy, vx: -1.0, vy: -13, isPlayer: true, damage: 2.0, radius: 5, color: '#fef08a' });
        s.bullets.push({ x: cx + 8, y: cy, vx: 1.0, vy: -13, isPlayer: true, damage: 2.0, radius: 5, color: '#fef08a' });
        s.bullets.push({ x: cx - 18, y: cy, vx: -3.5, vy: -11, isPlayer: true, damage: 1.8, radius: 5, color: '#fde047' });
        s.bullets.push({ x: cx + 18, y: cy, vx: 3.5, vy: -11, isPlayer: true, damage: 1.8, radius: 5, color: '#fde047' });
      }
    }

    // Wingmen squadron fire
    if (s.hasWingman) {
      s.bullets.push({
        x: s.playerX - 22,
        y: s.playerY + 12,
        vx: 0,
        vy: -11,
        isPlayer: true,
        damage: 1.0,
        radius: 3.5,
        color: '#34d399',
      });
      s.bullets.push({
        x: s.playerX + s.playerW + 22,
        y: s.playerY + 12,
        vx: 0,
        vy: -11,
        isPlayer: true,
        damage: 1.0,
        radius: 3.5,
        color: '#34d399',
      });
    }
  };

  // Trigger Mega Bomb (Screen Clear)
  const useBomb = useCallback(() => {
    const s = stateRef.current;
    if (s.bombs <= 0 || !s.running) return;

    s.bombs--;
    setBombs(s.bombs);
    s.screenFlash = 25;
    s.screenShake = 20;
    sound.playBomb();

    s.shockwaves.push({
      x: s.playerX + s.playerW / 2,
      y: s.playerY + s.playerH / 2,
      radius: 10,
      maxRadius: 400,
      color: '#38bdf8',
      alpha: 1,
    });

    s.enemyBullets.length = 0;

    s.enemies.forEach((enemy) => {
      enemy.hp -= 25;
      addExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 10);
    });

    if (s.currentBoss) {
      s.currentBoss.hp -= 35;
      addExplosion(s.currentBoss.x + s.currentBoss.width / 2, s.currentBoss.y + s.currentBoss.height / 2, 25, true);
      addFloatingText(s.currentBoss.x + s.currentBoss.width / 2, s.currentBoss.y + 40, 'BOMB HIT! -35', '#ef4444');
      if (s.bossTracker && s.bossTracker.active) {
        s.bossTracker.totalDamage += 35;
        s.bossTracker.bombsUsed++;
        s.bossTracker.pendingEvent = '釋放清屏終極炸彈 (BOMB)';
      }
    }

    addFloatingText(s.playerX + s.playerW / 2, s.playerY - 20, 'BOMB DETONATED!', '#38bdf8');
  }, []);

  // Spawn dynamic enemies based on Mode
  const spawnEnemyWave = () => {
    const s = stateRef.current;
    s.spawnCounter++;

    // Boss Rush mode spawns Boss immediately!
    if (s.gameMode === 'BOSS_RUSH' && !s.currentBoss && s.bossWarningTimer <= 0) {
      if (s.stage <= 3) {
        s.bossWarningTimer = 60;
        sound.playBossAlarm();
      }
    }

    if (!s.currentBoss && s.bossWarningTimer <= 0) {
      const spawnRate = s.gameMode === 'SURVIVAL' ? 35 : s.gameMode === 'TIME_ATTACK' ? 32 : 50;

      // Scout wave
      if (s.spawnCounter % spawnRate === 0) {
        const x = 30 + Math.random() * (480 - 60 - 32);
        s.enemies.push({
          id: s.nextEnemyId++,
          type: 'scout',
          x,
          y: -40,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 3.2 + Math.min(s.stage * 0.4, 2.0),
          width: 32,
          height: 32,
          hp: 2 + Math.floor(s.stage * 0.5),
          maxHp: 2 + Math.floor(s.stage * 0.5),
          scoreVal: 100,
          color: '#dc2626',
          shootTimer: Math.floor(Math.random() * 30),
          shootInterval: Math.max(45, 80 - s.stage * 5),
          bulletSpeed: 4.5,
          patternTimer: 0,
        });
      }

      // Interceptor dive wave
      if (s.spawnCounter % (spawnRate * 2.2) === 0) {
        const x = Math.random() > 0.5 ? 40 : 400;
        s.enemies.push({
          id: s.nextEnemyId++,
          type: 'interceptor',
          x,
          y: -40,
          vx: x < 200 ? 1.6 : -1.6,
          vy: 4.2,
          width: 28,
          height: 36,
          hp: 4 + s.stage,
          maxHp: 4 + s.stage,
          scoreVal: 250,
          color: '#ea580c',
          shootTimer: 0,
          shootInterval: 45,
          bulletSpeed: 5.0,
          patternTimer: 0,
        });
      }

      // Heavy Bomber wave
      if (s.spawnCounter % (spawnRate * 3.2) === 0) {
        const x = 50 + Math.random() * (480 - 100 - 64);
        s.enemies.push({
          id: s.nextEnemyId++,
          type: 'bomber',
          x,
          y: -60,
          vx: (Math.random() - 0.5) * 0.8,
          vy: 1.6,
          width: 64,
          height: 54,
          hp: 14 + s.stage * 4,
          maxHp: 14 + s.stage * 4,
          scoreVal: 500,
          color: '#334155',
          shootTimer: 10,
          shootInterval: 55,
          bulletSpeed: 4.0,
          patternTimer: 0,
        });
      }

      // Trigger Boss in Campaign or Survival based on score threshold
      if (s.gameMode !== 'TIME_ATTACK' && s.gameMode !== 'BOSS_RUSH') {
        const targetScore = s.stage * 2500;
        if (s.score >= targetScore) {
          s.bossWarningTimer = 110;
          sound.playBossAlarm();
        }
      }
    }

    // Summon Boss once warning finishes
    if (s.bossWarningTimer > 0) {
      s.bossWarningTimer--;
      if (s.bossWarningTimer === 1) {
        let bossName = '空中戰艦 · 扶桑號';
        let bossTitle = 'Yamato-Class Flying Cruiser';
        let bossW = 160;
        let bossH = 100;
        let bossHp = 120 + s.stage * 40;

        if (s.stage === 2) {
          bossName = '齊柏林重空母';
          bossTitle = 'Armored Zeppelin Fortress';
          bossW = 180;
          bossH = 110;
          bossHp = 180;
        } else if (s.stage >= 3) {
          bossName = '終極決戰 · 震電超重型母艦';
          bossTitle = 'Project Shinden Mega-Carrier';
          bossW = 200;
          bossH = 120;
          bossHp = 260 + (s.stage - 3) * 50;
        }

        s.currentBoss = {
          stage: s.stage,
          name: bossName,
          title: bossTitle,
          x: 240 - bossW / 2,
          y: -bossH,
          targetY: 65,
          width: bossW,
          height: bossH,
          hp: bossHp,
          maxHp: bossHp,
          speedX: 2.0,
          timer: 0,
          color: '#475569',
        };

        s.bossTracker = {
          active: true,
          bossName,
          bossTitle,
          stage: s.stage,
          initialBossHp: bossHp,
          initialPlayerHp: s.hp,
          totalDamage: 0,
          bombsUsed: 0,
          hitsTaken: 0,
          startFrame: s.propFrame,
          lastSampleFrame: s.propFrame,
          samples: [
            {
              timeSec: 0,
              timeLabel: '00:00',
              bossHp: bossHp,
              bossHpPct: 100,
              playerHp: s.hp,
              playerHpPct: Math.round((s.hp / s.maxHp) * 100),
              cumulativeDamage: 0,
              dps: 0,
              event: '旗艦接敵: 首領降臨',
            },
          ],
        };
      }
    }
  };

  // Main tick loop
  const gameTick = () => {
    const s = stateRef.current;
    if (!s.running) return;

    s.propFrame++;
    s.oceanOffset += 1.5;

    // Challenge Mode Timer Tick (60 ticks ~ 1 sec)
    if (s.gameMode === 'TIME_ATTACK') {
      s.timeTimer++;
      if (s.timeTimer >= 60) {
        s.timeTimer = 0;
        s.timeRemaining--;
        setTimeRemaining(s.timeRemaining);
        if (s.timeRemaining <= 0) {
          s.running = false;
          setGameState('CHALLENGE_SUCCESS');
          recordHighScore(s.score, s.stage, s.planeType, s.weaponType, s.gameMode);
          return;
        }
      }
    }

    // Active skills duration and cooldown ticks
    if (s.durShield > 0) s.durShield--;
    if (s.cdShield > 0) s.cdShield--;
    if (s.durBoost > 0) s.durBoost--;
    if (s.cdBoost > 0) s.cdBoost--;
    if (s.cdAirStrike > 0) s.cdAirStrike--;

    // Boost Skill: Emit trailing afterimages and supersonic mach cone sparks
    if (s.durBoost > 0) {
      if (s.propFrame % 2 === 0) {
        s.afterimages.push({
          x: s.playerX,
          y: s.playerY,
          width: s.playerW,
          height: s.playerH,
          planeType: s.planeType,
          life: 14,
          maxLife: 14,
          color: '#38bdf8',
        });
      }

      // Continuous Mach cone & afterburner thrust fire particles
      for (let i = 0; i < 2; i++) {
        s.particles.push({
          x: s.playerX + s.playerW / 2 + (Math.random() - 0.5) * 22,
          y: s.playerY + s.playerH + 2,
          vx: (Math.random() - 0.5) * 1.8,
          vy: 5 + Math.random() * 4,
          radius: 2.2 + Math.random() * 1.5,
          life: 8 + Math.random() * 6,
          maxLife: 14,
          color: Math.random() > 0.45 ? '#38bdf8' : '#eab308',
          type: 'mach_cone',
        });
      }
    }

    // Shield Skill: Shimmering forcefield perimeter electric sparks
    if (s.durShield > 0 && s.propFrame % 3 === 0) {
      const a = Math.random() * Math.PI * 2;
      s.particles.push({
        x: s.playerX + s.playerW / 2 + Math.cos(a) * 38,
        y: s.playerY + s.playerH / 2 + Math.sin(a) * 38,
        vx: Math.cos(a + Math.PI / 2) * (Math.random() * 2 - 1),
        vy: Math.sin(a + Math.PI / 2) * (Math.random() * 2 - 1),
        radius: 1.6 + Math.random() * 1.2,
        life: 8 + Math.random() * 6,
        maxLife: 14,
        color: '#a5f3fc',
        type: 'electric',
        glow: true,
      });
    }

    // Update Afterimages decay
    for (let i = s.afterimages.length - 1; i >= 0; i--) {
      s.afterimages[i].life--;
      if (s.afterimages[i].life <= 0) {
        s.afterimages.splice(i, 1);
      }
    }

    // Update Skill UI states once every 10 frames
    if (s.propFrame % 10 === 0) {
      setSkillCd({
        SHIELD: Math.ceil(s.cdShield / 60),
        BOOST: Math.ceil(s.cdBoost / 60),
        AIR_STRIKE: Math.ceil(s.cdAirStrike / 60),
      });
      setActiveSkills({
        shield: s.durShield > 0,
        boost: s.durBoost > 0,
      });
    }

    // Periodic Boss battle combat telemetry sampling (every 30 frames ~ 0.5s)
    if (s.currentBoss && s.bossTracker && s.bossTracker.active) {
      if (s.propFrame - s.bossTracker.lastSampleFrame >= 30) {
        s.bossTracker.lastSampleFrame = s.propFrame;
        const elapsedSec = Math.max(0, Math.floor((s.propFrame - s.bossTracker.startFrame) / 60));
        const m = Math.floor(elapsedSec / 60);
        const sec = elapsedSec % 60;
        const timeLabel = `${m < 10 ? '0' : ''}${m}:${sec < 10 ? '0' : ''}${sec}`;

        s.bossTracker.samples.push({
          timeSec: elapsedSec,
          timeLabel,
          bossHp: Math.max(0, Math.round(s.currentBoss.hp)),
          bossHpPct: Math.max(0, Math.round((s.currentBoss.hp / s.currentBoss.maxHp) * 100)),
          playerHp: s.hp,
          playerHpPct: Math.max(0, Math.round((s.hp / s.maxHp) * 100)),
          cumulativeDamage: Math.round(s.bossTracker.totalDamage),
          dps: elapsedSec > 0 ? Math.round(s.bossTracker.totalDamage / elapsedSec) : Math.round(s.bossTracker.totalDamage),
          event: s.bossTracker.pendingEvent,
        });
        s.bossTracker.pendingEvent = undefined;
      }
    }

    // Decay screenshake & screenflash
    if (s.screenShake > 0) s.screenShake *= 0.88;
    if (s.screenFlash > 0) s.screenFlash--;
    if (s.invincibleTimer > 0) s.invincibleTimer--;

    // Update Island parallax
    for (const island of s.islands) {
      island.y += island.speed;
      if (island.y > 720 + island.height) {
        island.y = -island.height - 50;
        island.x = 40 + Math.random() * (480 - 80 - island.width);
      }
    }

    // Update Clouds
    for (const cloud of s.clouds) {
      cloud.y += cloud.speed;
      if (cloud.y > 720 + cloud.size) {
        cloud.y = -cloud.size - 20;
        cloud.x = Math.random() * 480;
      }
    }

    // Dynamic Weather Cycle & Atmospheric Effects
    s.weatherTimer++;
    if (s.weatherChangeAlert > 0) s.weatherChangeAlert--;

    // Automatic random weather shift every ~30 seconds (1800 frames)
    if (s.weatherTimer > 1800) {
      s.weatherTimer = 0;
      const weathers: WeatherType[] = ['CLEAR', 'STORM', 'FOG'];
      const pool = weathers.filter((w) => w !== s.weather);
      const next = pool[Math.floor(Math.random() * pool.length)];
      s.weather = next;
      s.weatherChangeAlert = 180;
      setCurrentWeather(next);
      addFloatingText(240, 180, `氣候劇變: ${WEATHERS[next].name}`, WEATHERS[next].color);
      if (next === 'STORM') sound.playBossAlarm();
    }

    // Storm Physics: Driving slanted rain & random lightning strikes
    if (s.weather === 'STORM') {
      for (const r of s.raindrops) {
        r.y += r.speed;
        r.x -= 1.2;
        if (r.y > 740) {
          r.y = -20;
          r.x = Math.random() * 520;
        }
      }

      if (s.lightningTimer > 0) s.lightningTimer--;

      s.lightningCooldown--;
      if (s.lightningCooldown <= 0) {
        s.lightningTimer = 14;
        s.lightningCooldown = 180 + Math.random() * 220;
        s.screenShake = Math.max(s.screenShake, 4.5);

        // Branching electric lightning bolt
        let lx = 80 + Math.random() * 320;
        let ly = 0;
        const bolt: { x: number; y: number }[] = [{ x: lx, y: ly }];
        while (ly < 480) {
          ly += 30 + Math.random() * 35;
          lx += (Math.random() - 0.5) * 55;
          bolt.push({ x: lx, y: ly });
        }
        s.lightningBolt = bolt;
      }
    }

    // Player keyboard movement (Boost multiplies speed by 1.8x, Weather applies wind/fog drag)
    let moveX = 0;
    let moveY = 0;
    if (keys.current['ArrowLeft'] || keys.current['KeyA']) moveX -= 1;
    if (keys.current['ArrowRight'] || keys.current['KeyD']) moveX += 1;
    if (keys.current['ArrowUp'] || keys.current['KeyW']) moveY -= 1;
    if (keys.current['ArrowDown'] || keys.current['KeyS']) moveY += 1;

    const weatherSpeedMult = WEATHERS[s.weather]?.speedMultiplier ?? 1.0;
    const baseSpeed = s.speed * weatherSpeedMult;
    const currentSpeed = s.durBoost > 0 ? baseSpeed * 1.8 : baseSpeed;

    if (moveX !== 0 || moveY !== 0) {
      const len = Math.hypot(moveX, moveY) || 1;
      s.playerX += (moveX / len) * currentSpeed;
      s.playerY += (moveY / len) * currentSpeed;
    }

    s.playerX = Math.max(8, Math.min(480 - s.playerW - 8, s.playerX));
    s.playerY = Math.max(10, Math.min(720 - s.playerH - 15, s.playerY));

    // Player autofire / shooting cadence
    s.shootCooldown--;
    const wantFire = autoFire || keys.current['Space'] || isPointerDown.current;
    if (wantFire && s.shootCooldown <= 0) {
      firePlayerBullets();
      s.shootCooldown = s.fireRate;
    }

    // Spawn waves
    spawnEnemyWave();

    // Update Boss
    if (s.currentBoss) {
      const boss = s.currentBoss;
      boss.timer++;

      if (boss.y < boss.targetY) {
        boss.y += 1.2;
      } else {
        boss.x += boss.speedX;
        if (boss.x <= 20 || boss.x >= 480 - boss.width - 20) {
          boss.speedX = -boss.speedX;
        }
      }

      // Boss shooting patterns
      if (boss.timer % 40 === 0) {
        sound.playEnemyShoot();
        const cx = boss.x + boss.width / 2;
        const cy = boss.y + boss.height;

        if (boss.stage === 1) {
          for (let i = -2; i <= 2; i++) {
            s.enemyBullets.push({
              x: cx + i * 15,
              y: cy,
              vx: i * 1.5,
              vy: 4.2,
              isPlayer: false,
              damage: 1,
              radius: 5,
              color: '#ef4444',
            });
          }
        } else if (boss.stage === 2) {
          const shots = 8;
          for (let i = 0; i < shots; i++) {
            const angle = boss.timer * 0.08 + (i * Math.PI * 2) / shots;
            s.enemyBullets.push({
              x: cx,
              y: boss.y + boss.height / 2,
              vx: Math.cos(angle) * 3.8,
              vy: Math.sin(angle) * 3.8,
              isPlayer: false,
              damage: 1,
              radius: 5,
              color: '#f97316',
            });
          }
        } else {
          for (let i = -3; i <= 3; i++) {
            s.enemyBullets.push({
              x: cx + i * 18,
              y: cy,
              vx: i * 1.6,
              vy: 4.5,
              isPlayer: false,
              damage: 1,
              radius: 5.5,
              color: '#dc2626',
            });
          }
        }
      }

      // Check collision between Player Bullets and Boss
      for (let bi = s.bullets.length - 1; bi >= 0; bi--) {
        const b = s.bullets[bi];
        if (b.x > boss.x && b.x < boss.x + boss.width && b.y > boss.y && b.y < boss.y + boss.height) {
          boss.hp -= b.damage;
          addWeaponHitEffect(b.x, b.y, b);

          if (s.bossTracker && s.bossTracker.active) {
            s.bossTracker.totalDamage += b.damage;
          }

          // Piercing laser doesn't disappear immediately
          if (!b.isLaser) {
            s.bullets.splice(bi, 1);
          }

          if (boss.hp <= 0) {
            addExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2, 45, true);
            s.score += 3000;
            s.bossesDefeated++;
            addFloatingText(boss.x + boss.width / 2, boss.y + boss.height / 2, '+3000 BOSS CLEAR!', '#fef08a');

            if (s.bossTracker && s.bossTracker.active) {
              const durSec = Math.max(1, Math.floor((s.propFrame - s.bossTracker.startFrame) / 60));
              const m = Math.floor(durSec / 60);
              const sec = durSec % 60;
              s.bossTracker.samples.push({
                timeSec: durSec,
                timeLabel: `${m < 10 ? '0' : ''}${m}:${sec < 10 ? '0' : ''}${sec}`,
                bossHp: 0,
                bossHpPct: 0,
                playerHp: s.hp,
                playerHpPct: Math.round((s.hp / s.maxHp) * 100),
                cumulativeDamage: Math.round(s.bossTracker.totalDamage),
                dps: Math.round(s.bossTracker.totalDamage / durSec),
                event: '★ 巨型戰艦擊沉 (BOSS CLEAR)',
              });

              setLatestBossBattle({
                bossName: s.bossTracker.bossName,
                bossTitle: s.bossTracker.bossTitle,
                stage: s.bossTracker.stage,
                durationSec: durSec,
                totalDamage: Math.round(s.bossTracker.totalDamage),
                avgDps: Math.round(s.bossTracker.totalDamage / durSec),
                bossDefeated: true,
                playerSurvived: true,
                hitsTakenDuringBoss: s.bossTracker.hitsTaken,
                maxHitsAllowed: s.maxHp,
                bombsUsed: s.bossTracker.bombsUsed,
                samples: s.bossTracker.samples,
              });
              s.bossTracker.active = false;
            }

            s.items.push({
              id: s.nextItemId++,
              x: boss.x + boss.width / 2,
              y: boss.y + boss.height / 2,
              vy: 1.6,
              type: Math.random() > 0.5 ? 'P' : 'B',
              size: 24,
              wobble: 0,
            });

            s.currentBoss = null;

            if (s.gameMode === 'BOSS_RUSH' && s.stage >= 3) {
              s.running = false;
              setGameState('CHALLENGE_SUCCESS');
              recordHighScore(s.score, s.stage, s.planeType, s.weaponType, s.gameMode);
              return;
            }

            s.stage++;
            setStage(s.stage);
            setScore(s.score);
            setBossesDefeated(s.bossesDefeated);
            break;
          }
        }
      }
    }

    // Update Player Bullets (with Homing guidance physics)
    for (let i = s.bullets.length - 1; i >= 0; i--) {
      const b = s.bullets[i];

      // Homing missile target tracking
      if (b.isHoming) {
        let targetX = 0;
        let targetY = 0;
        let found = false;

        if (s.currentBoss) {
          targetX = s.currentBoss.x + s.currentBoss.width / 2;
          targetY = s.currentBoss.y + s.currentBoss.height / 2;
          found = true;
        } else if (s.enemies.length > 0) {
          // Find closest enemy
          let minDist = 9999;
          for (const e of s.enemies) {
            const d = Math.hypot(e.x - b.x, e.y - b.y);
            if (d < minDist) {
              minDist = d;
              targetX = e.x + e.width / 2;
              targetY = e.y + e.height / 2;
              found = true;
            }
          }
        }

        if (found) {
          const desiredAngle = Math.atan2(targetY - b.y, targetX - b.x);
          const currentAngle = Math.atan2(b.vy, b.vx);
          const speed = 11;
          const turnRate = 0.18;
          const newAngle = currentAngle + (desiredAngle - currentAngle) * turnRate;
          b.vx = Math.cos(newAngle) * speed;
          b.vy = Math.sin(newAngle) * speed;
        }
      }

      b.x += b.vx;
      b.y += b.vy;

      // Emit weapon flight trail particles
      if (b.isLaser) {
        // Laser energy filament electric spark trails & backwards-pulsing energy rings
        if (Math.random() < 0.65) {
          s.particles.push({
            x: b.x + (Math.random() - 0.5) * 8,
            y: b.y + Math.random() * (b.laserHeight || 30),
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            radius: 1.5 + Math.random() * 1.8,
            life: 8 + Math.random() * 8,
            maxLife: 16,
            color: Math.random() > 0.4 ? '#22d3ee' : '#a5f3fc',
            type: 'electric',
            glow: true,
          });
        }
        if (Math.random() < 0.25) {
          s.particles.push({
            x: b.x,
            y: b.y + 10,
            vx: 0,
            vy: 2.5,
            radius: 3.5,
            life: 8,
            maxLife: 8,
            color: '#22d3ee',
            type: 'ring',
          });
        }
      } else if (b.isHoming) {
        // Homing missile billowing smoke contrail and rocket exhaust
        const angle = Math.atan2(b.vy, b.vx);
        const tailX = b.x - Math.cos(angle) * 10;
        const tailY = b.y - Math.sin(angle) * 10;

        // Expanding contrail smoke puff
        s.particles.push({
          x: tailX + (Math.random() - 0.5) * 2.5,
          y: tailY + (Math.random() - 0.5) * 2.5,
          vx: -Math.cos(angle) * 0.7 + (Math.random() - 0.5) * 0.5,
          vy: -Math.sin(angle) * 0.7 + (Math.random() - 0.5) * 0.5,
          radius: 2.2,
          grow: 0.18,
          life: 18 + Math.random() * 10,
          maxLife: 28,
          color: 'rgba(226, 232, 240, 0.75)',
          type: 'smoke',
        });

        // Fiery thruster flare spark
        if (Math.random() < 0.75) {
          s.particles.push({
            x: tailX,
            y: tailY,
            vx: -Math.cos(angle) * (2.2 + Math.random() * 2),
            vy: -Math.sin(angle) * (2.2 + Math.random() * 2),
            radius: 1.2 + Math.random() * 1.6,
            life: 6 + Math.random() * 6,
            maxLife: 12,
            color: Math.random() > 0.45 ? '#34d399' : '#f97316',
            type: 'spark',
          });
        }
      } else if (b.isRocket) {
        // Heavy rocket smoke clouds and propulsion flame
        s.particles.push({
          x: b.x + (Math.random() - 0.5) * 4,
          y: b.y + 12,
          vx: (Math.random() - 0.5) * 1.2,
          vy: 2.5 + Math.random() * 1.5,
          radius: 3.5,
          grow: 0.28,
          life: 20 + Math.random() * 10,
          maxLife: 30,
          color: 'rgba(203, 213, 225, 0.7)',
          type: 'smoke',
        });
        s.particles.push({
          x: b.x,
          y: b.y + 10,
          vx: (Math.random() - 0.5) * 1.8,
          vy: 3 + Math.random() * 2,
          radius: 2 + Math.random() * 2,
          life: 8 + Math.random() * 6,
          maxLife: 14,
          color: '#f97316',
          type: 'spark',
        });
      } else {
        // Vulcan / machine gun golden tracer sparks
        if (Math.random() < 0.45) {
          s.particles.push({
            x: b.x + (Math.random() - 0.5) * 2,
            y: b.y + 6,
            vx: -b.vx * 0.15 + (Math.random() - 0.5) * 0.8,
            vy: 2.0 + Math.random() * 1.5,
            radius: 1.5 + Math.random() * 1.5,
            life: 6 + Math.random() * 6,
            maxLife: 12,
            color: Math.random() > 0.4 ? '#fef08a' : '#f59e0b',
            type: 'tracer',
          });
        }
      }

      if (b.y < -30 || b.x < -30 || b.x > 510) {
        s.bullets.splice(i, 1);
      }
    }

    const triggerPlayerHit = (): boolean => {
      s.hp--;
      setHp(s.hp);
      s.invincibleTimer = 65;
      s.screenShake = 15;
      if (s.power > 1) {
        s.power--;
        setPower(s.power);
      }
      addExplosion(s.playerX + s.playerW / 2, s.playerY + s.playerH / 2, 25, true);

      if (s.bossTracker && s.bossTracker.active) {
        s.bossTracker.hitsTaken++;
        s.bossTracker.pendingEvent = '戰機遭受敵方火力命中 (HIT)';
      }

      if (s.hp <= 0) {
        s.running = false;
        if (s.bossTracker && s.bossTracker.active) {
          const durSec = Math.max(1, Math.floor((s.propFrame - s.bossTracker.startFrame) / 60));
          const m = Math.floor(durSec / 60);
          const sec = durSec % 60;
          s.bossTracker.samples.push({
            timeSec: durSec,
            timeLabel: `${m < 10 ? '0' : ''}${m}:${sec < 10 ? '0' : ''}${sec}`,
            bossHp: s.currentBoss ? Math.max(0, Math.round(s.currentBoss.hp)) : 0,
            bossHpPct: s.currentBoss ? Math.max(0, Math.round((s.currentBoss.hp / s.currentBoss.maxHp) * 100)) : 0,
            playerHp: 0,
            playerHpPct: 0,
            cumulativeDamage: Math.round(s.bossTracker.totalDamage),
            dps: Math.round(s.bossTracker.totalDamage / durSec),
            event: '✕ 戰機被毀 (PLAYER DOWN)',
          });

          setLatestBossBattle({
            bossName: s.bossTracker.bossName,
            bossTitle: s.bossTracker.bossTitle,
            stage: s.bossTracker.stage,
            durationSec: durSec,
            totalDamage: Math.round(s.bossTracker.totalDamage),
            avgDps: Math.round(s.bossTracker.totalDamage / durSec),
            bossDefeated: false,
            playerSurvived: false,
            hitsTakenDuringBoss: s.bossTracker.hitsTaken,
            maxHitsAllowed: s.maxHp,
            bombsUsed: s.bossTracker.bombsUsed,
            samples: s.bossTracker.samples,
          });
          s.bossTracker.active = false;
        }
        setGameState('GAME_OVER');
        recordHighScore(s.score, s.stage, s.planeType, s.weaponType, s.gameMode);
        return true;
      }
      return false;
    };

    // Update Enemy Bullets & Player Hit Check
    const px = s.playerX + s.playerW / 2;
    const py = s.playerY + s.playerH / 2;

    for (let i = s.enemyBullets.length - 1; i >= 0; i--) {
      const eb = s.enemyBullets[i];
      eb.x += eb.vx;
      eb.y += eb.vy;

      if (s.invincibleTimer <= 0) {
        const dist = Math.hypot(eb.x - px, eb.y - py);
        if (dist < 15) {
          s.enemyBullets.splice(i, 1);

          // Active Aegis Skill absorbs completely without losing shield item!
          if (s.durShield > 0) {
            addExplosion(px, py, 6);
            addFloatingText(px, py - 20, 'AEGIS DEFLECT!', '#38bdf8');
            continue;
          }

          if (s.hasShield) {
            s.hasShield = false;
            setHasShield(false);
            s.invincibleTimer = 40;
            addExplosion(px, py, 12);
            addFloatingText(px, py - 20, 'SHIELD BROKEN', '#38bdf8');
          } else {
            if (triggerPlayerHit()) return;
          }
          continue;
        }
      }

      if (eb.y > 740 || eb.x < -30 || eb.x > 510) {
        s.enemyBullets.splice(i, 1);
      }
    }

    // Update Regular Enemies
    for (let ei = s.enemies.length - 1; ei >= 0; ei--) {
      const enemy = s.enemies[ei];
      enemy.x += enemy.vx;
      enemy.y += enemy.vy;
      enemy.shootTimer++;

      if (enemy.shootTimer % enemy.shootInterval === 0 && enemy.y > 20 && enemy.y < 500) {
        sound.playEnemyShoot();
        const ecx = enemy.x + enemy.width / 2;
        const ecy = enemy.y + enemy.height;

        if (enemy.type === 'scout') {
          s.enemyBullets.push({
            x: ecx,
            y: ecy,
            vx: 0,
            vy: enemy.bulletSpeed,
            isPlayer: false,
            damage: 1,
            radius: 4.5,
            color: '#ef4444',
          });
        } else if (enemy.type === 'interceptor') {
          const angle = Math.atan2(py - ecy, px - ecx);
          s.enemyBullets.push({
            x: ecx,
            y: ecy,
            vx: Math.cos(angle) * enemy.bulletSpeed,
            vy: Math.sin(angle) * enemy.bulletSpeed,
            isPlayer: false,
            damage: 1,
            radius: 4.5,
            color: '#f97316',
          });
        } else if (enemy.type === 'bomber') {
          s.enemyBullets.push({
            x: ecx - 12,
            y: ecy,
            vx: -1.2,
            vy: enemy.bulletSpeed,
            isPlayer: false,
            damage: 1,
            radius: 5,
            color: '#ef4444',
          });
          s.enemyBullets.push({
            x: ecx + 12,
            y: ecy,
            vx: 1.2,
            vy: enemy.bulletSpeed,
            isPlayer: false,
            damage: 1,
            radius: 5,
            color: '#ef4444',
          });
        }
      }

      // Check player bullet hits enemy
      let enemyDestroyed = false;
      for (let bi = s.bullets.length - 1; bi >= 0; bi--) {
        const b = s.bullets[bi];
        if (b.x > enemy.x && b.x < enemy.x + enemy.width && b.y > enemy.y && b.y < enemy.y + enemy.height) {
          enemy.hp -= b.damage;
          addWeaponHitEffect(b.x, b.y, b);

          // Rocket explosive splash
          if (b.isRocket && b.blastRadius) {
            addExplosion(b.x, b.y, 20, true);
            // Damage nearby enemies within blastRadius
            for (const other of s.enemies) {
              if (other.id !== enemy.id) {
                const dist = Math.hypot(other.x - b.x, other.y - b.y);
                if (dist < b.blastRadius) {
                  other.hp -= b.damage * 0.8;
                }
              }
            }
          }

          if (!b.isLaser) {
            s.bullets.splice(bi, 1);
          }

          if (enemy.hp <= 0) {
            enemyDestroyed = true;
            addExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 16);
            s.score += enemy.scoreVal;
            s.enemiesDefeated++;
            addFloatingText(enemy.x + enemy.width / 2, enemy.y, `+${enemy.scoreVal}`);
            setScore(s.score);
            setEnemiesDefeated(s.enemiesDefeated);

            // Supply crate drops
            const rand = Math.random();
            if (rand < 0.32) {
              const types: DropItem['type'][] = [
                'P',
                'P',
                'B',
                'W',
                'S',
                'STAR',
                'W_LASER',
                'W_HOMING',
                'W_ROCKET',
              ];
              const itemType = types[Math.floor(Math.random() * types.length)];
              s.items.push({
                id: s.nextItemId++,
                x: enemy.x + enemy.width / 2,
                y: enemy.y + enemy.height / 2,
                vy: 1.5,
                type: itemType,
                size: 22,
                wobble: Math.random() * Math.PI,
              });
            }

            s.enemies.splice(ei, 1);
            break;
          }
        }
      }

      if (enemyDestroyed) continue;

      // Enemy crash into player
      if (s.invincibleTimer <= 0) {
        if (
          s.playerX < enemy.x + enemy.width &&
          s.playerX + s.playerW > enemy.x &&
          s.playerY < enemy.y + enemy.height &&
          s.playerY + s.playerH > enemy.y
        ) {
          // If Afterburner Boost is active: Ram and destroy enemy without damage!
          if (s.durBoost > 0) {
            addExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 20);
            s.score += enemy.scoreVal;
            s.enemies.splice(ei, 1);
            addFloatingText(px, py - 25, 'RAM KILL!', '#eab308');
            continue;
          }

          addExplosion(px, py, 20);
          s.enemies.splice(ei, 1);

          if (s.durShield > 0) {
            addFloatingText(px, py - 20, 'SHIELD DEFLECTED!', '#38bdf8');
            continue;
          }

          if (s.hasShield) {
            s.hasShield = false;
            setHasShield(false);
            s.invincibleTimer = 40;
            addFloatingText(px, py - 20, 'SHIELD BROKEN', '#38bdf8');
          } else {
            if (triggerPlayerHit()) return;
          }
          continue;
        }
      }

      if (enemy.y > 760) {
        s.enemies.splice(ei, 1);
      }
    }

    // Update Dropped Items
    for (let i = s.items.length - 1; i >= 0; i--) {
      const item = s.items[i];
      item.y += item.vy;
      item.wobble += 0.05;

      const dist = Math.hypot(item.x - px, item.y - py);
      if (dist < 32) {
        sound.playPowerUp(item.type);
        if (item.type === 'P') {
          s.power = Math.min(4, s.power + 1);
          setPower(s.power);
          addFloatingText(px, py - 25, 'POWER UP!', '#eab308');
        } else if (item.type === 'B') {
          s.bombs = Math.min(5, s.bombs + 1);
          setBombs(s.bombs);
          addFloatingText(px, py - 25, '+1 BOMB', '#ef4444');
        } else if (item.type === 'W') {
          s.hasWingman = true;
          setHasWingman(true);
          addFloatingText(px, py - 25, 'WINGMEN SQUADRON', '#10b981');
        } else if (item.type === 'S') {
          s.hasShield = true;
          setHasShield(true);
          addFloatingText(px, py - 25, 'ENERGY SHIELD', '#38bdf8');
        } else if (item.type === 'STAR') {
          s.score += 500;
          setScore(s.score);
          addFloatingText(px, py - 25, '+500 BONUS', '#f59e0b');
        } else if (item.type === 'W_LASER') {
          changeWeapon('LASER');
        } else if (item.type === 'W_HOMING') {
          changeWeapon('HOMING');
        } else if (item.type === 'W_ROCKET') {
          changeWeapon('ROCKET');
        }

        s.items.splice(i, 1);
        continue;
      }

      if (item.y > 740) {
        s.items.splice(i, 1);
      }
    }

    // Update Particles with physics drag and radius growth
    for (let i = s.particles.length - 1; i >= 0; i--) {
      const p = s.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.94;
      p.vy *= 0.94;
      if (p.grow) {
        p.radius += p.grow;
      }
      p.life--;
      if (p.life <= 0) s.particles.splice(i, 1);
    }

    // Update Shockwaves
    for (let i = s.shockwaves.length - 1; i >= 0; i--) {
      const sw = s.shockwaves[i];
      sw.radius += 6.5;
      sw.alpha -= 0.038;
      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        s.shockwaves.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
      const ft = s.floatingTexts[i];
      ft.y -= 0.8;
      ft.life--;
      if (ft.life <= 0) s.floatingTexts.splice(i, 1);
    }
  };

  // Render loop
  const renderLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = stateRef.current;
    const renderer = new GameRenderer(ctx, canvas.width, canvas.height);

    ctx.save();
    if (s.screenShake > 0.5) {
      const dx = (Math.random() - 0.5) * s.screenShake;
      const dy = (Math.random() - 0.5) * s.screenShake;
      ctx.translate(dx, dy);
    }

    renderer.drawBackground(
      s.oceanOffset,
      s.islands,
      s.clouds,
      s.weather,
      s.lightningTimer > 0 ? 1 : 0
    );

    // Atmospheric weather layers
    if (s.weather === 'CLEAR') {
      renderer.drawSunRays(s.propFrame);
    } else if (s.weather === 'STORM') {
      renderer.drawStormWeather(s.raindrops, s.lightningTimer, s.lightningBolt);
    }

    renderer.drawItems(s.items);
    renderer.drawEnemies(s.enemies);
    if (s.currentBoss) renderer.drawBoss(s.currentBoss);

    if (s.running) {
      renderer.drawAfterimages(s.afterimages);
      renderer.drawPlayer(
        s.playerX,
        s.playerY,
        s.playerW,
        s.playerH,
        s.planeType,
        s.invincibleTimer,
        s.propFrame,
        s.hasWingman,
        s.hasShield,
        s.durShield > 0,
        s.durBoost > 0
      );
    }

    renderer.drawBullets(s.bullets);
    renderer.drawBullets(s.enemyBullets);
    renderer.drawParticles(s.particles);
    renderer.drawShockwaves(s.shockwaves);
    renderer.drawClouds(s.clouds);

    // Fog Weather: Dense mist veil and directional searchlight cone
    if (s.weather === 'FOG') {
      renderer.drawFogWeather(s.playerX, s.playerY, s.playerW, s.playerH, s.propFrame);
    }

    renderer.drawFloatingTexts(s.floatingTexts);

    if (s.bossWarningTimer > 0) {
      renderer.drawBossWarning(s.bossWarningTimer);
    }

    if (s.weatherChangeAlert > 0) {
      renderer.drawWeatherBanner(s.weather, s.weatherChangeAlert);
    }

    if (s.screenFlash > 0) {
      renderer.drawScreenExplosiveFlash(s.screenFlash);
    }

    ctx.restore();
  }, []);

  // Frame runner
  useEffect(() => {
    let active = true;

    const frame = () => {
      if (!active) return;
      gameTick();
      renderLoop();
      animFrameId.current = requestAnimationFrame(frame);
    };

    animFrameId.current = requestAnimationFrame(frame);

    return () => {
      active = false;
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [renderLoop]);

  // Start / Restart Game action
  const startGame = useCallback(
    (planeArg?: PlaneType | unknown, modeArg?: GameMode, weaponArg?: WeaponType, hitsArg?: number) => {
      sound.init();
      sound.playCoin();
      initEnvironment();

      const chosenPlane: PlaneType =
        typeof planeArg === 'string' && (planeArg === 'P51' || planeArg === 'SPITFIRE' || planeArg === 'P38')
          ? (planeArg as PlaneType)
          : PLANES[selectedPlane]
          ? selectedPlane
          : 'P51';

      const chosenMode: GameMode = modeArg || gameMode || 'CAMPAIGN';
      const chosenWeapon: WeaponType = weaponArg || currentWeapon || 'VULCAN';

      const planeInfo = PLANES[chosenPlane] || PLANES.P51;
      const s = stateRef.current;
      s.score = 0;
      s.stage = 1;

      // Customizable Hits Allowed (Minimum 3, Maximum 10, selectable 3 to 9 in Challenge Mode)
      const startingHp = typeof hitsArg === 'number' && hitsArg >= 3 && hitsArg <= 10
        ? hitsArg
        : Math.max(3, Math.min(10, maxHitsAllowed));
      s.hp = startingHp;
      s.maxHp = startingHp;
      s.maxHitsAllowed = startingHp;
      setHp(startingHp);
      setMaxHp(startingHp);

      s.bombs = planeInfo.bombCapacity;
      s.power = 1;
      s.hasWingman = false;
      s.hasShield = false;
      s.enemiesDefeated = 0;
      s.bossesDefeated = 0;
      s.planeType = chosenPlane;
      s.weaponType = chosenWeapon;
      s.gameMode = chosenMode;
      s.speed = planeInfo.speed;
      s.fireRate = WEAPONS[chosenWeapon].fireRate;
      s.timeRemaining = 90;
      s.timeTimer = 0;
      s.cdShield = 0;
      s.durShield = 0;
      s.cdBoost = 0;
      s.durBoost = 0;
      s.cdAirStrike = 0;

      s.playerX = 240 - 22;
      s.playerY = 600;
      s.bullets = [];
      s.enemyBullets = [];
      s.enemies = [];
      s.items = [];
      s.particles = [];
      s.shockwaves = [];
      s.afterimages = [];
      s.floatingTexts = [];
      s.currentBoss = null;
      s.bossWarningTimer = 0;
      s.bossTracker = null;
      s.weather = 'CLEAR';
      s.weatherTimer = 0;
      s.weatherChangeAlert = 120;
      s.running = true;

      setCurrentWeather('CLEAR');
      setScore(0);
      setStage(1);
      setHp(startingHp);
      setMaxHp(startingHp);
      setBombs(planeInfo.bombCapacity);
      setPower(1);
      setHasWingman(false);
      setHasShield(false);
      setEnemiesDefeated(0);
      setBossesDefeated(0);
      setTimeRemaining(90);
      setSelectedPlane(chosenPlane);
      setGameMode(chosenMode);
      setCurrentWeapon(chosenWeapon);
      setGameState('PLAYING');
    },
    [selectedPlane, gameMode, currentWeapon, initEnvironment]
  );

  // Toggle Pause (with Escape and P support)
  const togglePause = useCallback(() => {
    setGameState((prev) => {
      if (prev === 'PLAYING') {
        stateRef.current.running = false;
        return 'PAUSED';
      } else if (prev === 'PAUSED') {
        stateRef.current.running = true;
        return 'PLAYING';
      }
      return prev;
    });
  }, []);

  // Setup Keyboard Listeners (WASD, Arrows, Space, B/X, P/Escape, Q/E/R for skills, 1-4 for weapons)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;

      if (e.code === 'KeyB' || e.code === 'KeyX') {
        useBomb();
      }
      if (e.code === 'KeyP' || e.code === 'Escape') {
        togglePause();
      }
      // Skills
      if (e.code === 'KeyQ') {
        activateSkill('SHIELD');
      }
      if (e.code === 'KeyE') {
        activateSkill('BOOST');
      }
      if (e.code === 'KeyR') {
        activateSkill('AIR_STRIKE');
      }
      // Quick weapon hotkeys 1-4
      if (e.code === 'Digit1') changeWeapon('VULCAN');
      if (e.code === 'Digit2') changeWeapon('LASER');
      if (e.code === 'Digit3') changeWeapon('HOMING');
      if (e.code === 'Digit4') changeWeapon('ROCKET');
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [useBomb, togglePause, activateSkill, changeWeapon]);

  // Touch and pointer tracking on Canvas
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isPointerDown.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    sound.init();

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = (e.clientX - rect.left) * scaleX;
    const clientY = (e.clientY - rect.top) * scaleY;

    touchOffset.current = {
      x: clientX - (stateRef.current.playerX + stateRef.current.playerW / 2),
      y: clientY - (stateRef.current.playerY + stateRef.current.playerH / 2) + 30,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDown.current || !stateRef.current.running) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = (e.clientX - rect.left) * scaleX;
    const clientY = (e.clientY - rect.top) * scaleY;

    stateRef.current.playerX = clientX - touchOffset.current.x - stateRef.current.playerW / 2;
    stateRef.current.playerY = clientY - touchOffset.current.y - stateRef.current.playerH / 2;
  };

  const handlePointerUp = () => {
    isPointerDown.current = false;
  };

  return {
    canvasRef,
    gameState,
    gameMode,
    setGameMode,
    selectedPlane,
    setSelectedPlane,
    currentWeapon,
    changeWeapon,
    currentWeather,
    weatherInfo: WEATHERS[currentWeather],
    cycleWeather,
    score,
    highScore,
    stage,
    hp,
    maxHp,
    bombs,
    power,
    hasWingman,
    hasShield,
    enemiesDefeated,
    bossesDefeated,
    timeRemaining,
    skillCd,
    activeSkills,
    autoFire,
    setAutoFire,
    maxHitsAllowed,
    setMaxHitsAllowed,
    latestBossBattle,
    setLatestBossBattle,
    startGame,
    togglePause,
    useBomb,
    activateSkill,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
