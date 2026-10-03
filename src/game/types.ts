export type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'STAGE_CLEAR' | 'GAME_OVER' | 'CHALLENGE_SUCCESS';

export type GameMode = 'CAMPAIGN' | 'TIME_ATTACK' | 'BOSS_RUSH' | 'SURVIVAL';

export interface GameModeInfo {
  id: GameMode;
  name: string;
  subtitle: string;
  description: string;
  badge: string;
  icon: string;
  color: string;
}

export const GAME_MODES: Record<GameMode, GameModeInfo> = {
  CAMPAIGN: {
    id: 'CAMPAIGN',
    name: '經典戰役模式',
    subtitle: 'Classic Campaign',
    description: '循序漸進攻略關卡、迎擊巡弋敵機，擊沉三大傳奇巨型航空戰艦。',
    badge: '經典核心',
    icon: 'Flag',
    color: '#3b82f6',
  },
  TIME_ATTACK: {
    id: 'TIME_ATTACK',
    name: '90秒急速獵殺',
    subtitle: 'Blitz Time Attack',
    description: '限時 90 秒內不間斷迎戰密集機群，以最高擊墜效率突破得分極限！',
    badge: '限時挑戰',
    icon: 'Timer',
    color: '#eab308',
  },
  BOSS_RUSH: {
    id: 'BOSS_RUSH',
    name: '巨型戰艦死鬥',
    subtitle: 'Boss Rush Marathon',
    description: '連續迎戰 Stage 1~3 扶桑號、齊柏林要塞與震電母艦，考驗極限閃避！',
    badge: '首領連戰',
    icon: 'Skull',
    color: '#ef4444',
  },
  SURVIVAL: {
    id: 'SURVIVAL',
    name: '極限生存挑戰',
    subtitle: 'Hardcore Survival',
    description: '敵機彈幕倍增且攻擊欲望更強，可自訂 3~9 點挑戰生命，考驗王牌王座之實！',
    badge: '硬派極限',
    icon: 'ShieldOff',
    color: '#a855f7',
  },
};

export type WeatherType = 'CLEAR' | 'STORM' | 'FOG';

export interface WeatherInfo {
  id: WeatherType;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  badge: string;
  color: string;
  speedMultiplier: number;
  visibility: 'FULL' | 'REDUCED' | 'FOG_CONE';
}

export const WEATHERS: Record<WeatherType, WeatherInfo> = {
  CLEAR: {
    id: 'CLEAR',
    name: '晴空萬里',
    subtitle: 'Clear Skies',
    description: '海面風平浪靜，戰機能見度 100%，航速發揮極致。',
    icon: 'Sun',
    badge: '晴空巡航',
    color: '#38bdf8',
    speedMultiplier: 1.0,
    visibility: 'FULL',
  },
  STORM: {
    id: 'STORM',
    name: '暴風雷雨',
    subtitle: 'Thunderstorm',
    description: '狂風驟雨伴隨強雷暴，戰機機動航速下降 15%，伴有雷電轟鳴。',
    icon: 'CloudLightning',
    badge: '雷雨亂流',
    color: '#818cf8',
    speedMultiplier: 0.85,
    visibility: 'REDUCED',
  },
  FOG: {
    id: 'FOG',
    name: '濃霧迷航',
    subtitle: 'Dense Sea Fog',
    description: '重度海霧籠罩，視野受阻，僅能依賴戰機前方錐形探照燈偵搜敵情。',
    icon: 'CloudFog',
    badge: '迷霧探照',
    color: '#cbd5e1',
    speedMultiplier: 0.92,
    visibility: 'FOG_CONE',
  },
};

export type WeaponType = 'VULCAN' | 'LASER' | 'HOMING' | 'ROCKET';

export interface WeaponInfo {
  id: WeaponType;
  name: string;
  subtitle: string;
  description: string;
  iconColor: string;
  bulletColor: string;
  fireRate: number; // tick delay
  baseDamage: number;
}

export const WEAPONS: Record<WeaponType, WeaponInfo> = {
  VULCAN: {
    id: 'VULCAN',
    name: '重裝機炮散彈 (Vulcan)',
    subtitle: '廣角覆蓋 · 狂暴壓制',
    description: '經典二戰高射速穿甲航炮，隨火力提升升級為 4 重扇形彈幕。',
    iconColor: '#f59e0b',
    bulletColor: '#fef08a',
    fireRate: 9,
    baseDamage: 1.5,
  },
  LASER: {
    id: 'LASER',
    name: '聚焦粒子光束 (Piercing Laser)',
    subtitle: '貫穿直線 · 瞬間高傷',
    description: '發射連續貫穿敵陣的高能光束，能直接穿透小型敵機直擊後方要害。',
    iconColor: '#06b6d4',
    bulletColor: '#22d3ee',
    fireRate: 6,
    baseDamage: 1.2,
  },
  HOMING: {
    id: 'HOMING',
    name: '追蹤獵殺微型彈 (Homing Missiles)',
    subtitle: '自動鎖敵 · 精確制導',
    description: '發射具備紅外導引的追蹤微型導彈，自動轉向追擊畫面中最接近的敵機或 Boss。',
    iconColor: '#10b981',
    bulletColor: '#34d399',
    fireRate: 11,
    baseDamage: 2.2,
  },
  ROCKET: {
    id: 'ROCKET',
    name: '大口徑重型空爆彈 (Heavy Rockets)',
    subtitle: '範圍爆破 · 裝甲摧毀',
    description: '重型火箭砲，命中敵機時觸發二次衝擊波，對群體機群造成範圍性毀滅。',
    iconColor: '#f97316',
    bulletColor: '#fb923c',
    fireRate: 13,
    baseDamage: 3.5,
  },
};

export type SkillType = 'SHIELD' | 'BOOST' | 'AIR_STRIKE';

export interface SkillInfo {
  id: SkillType;
  name: string;
  hotkey: string;
  cooldown: number; // seconds
  duration: number; // seconds
  description: string;
  color: string;
}

export const SKILLS: Record<SkillType, SkillInfo> = {
  SHIELD: {
    id: 'SHIELD',
    name: '能量神盾 (Aegis Shield)',
    hotkey: 'Q',
    cooldown: 20,
    duration: 5,
    description: '展開 5 秒高能偏向護盾，免疫所有敵方子彈並反彈部分撞擊。',
    color: '#0284c7',
  },
  BOOST: {
    id: 'BOOST',
    name: '超頻渦輪 (Afterburner)',
    hotkey: 'E',
    cooldown: 15,
    duration: 4,
    description: '戰機航速提升 80%，期間可撞毀小型敵機且不損生命！',
    color: '#eab308',
  },
  AIR_STRIKE: {
    id: 'AIR_STRIKE',
    name: '戰術空襲 (Squadron Strike)',
    hotkey: 'R',
    cooldown: 25,
    duration: 2,
    description: '呼叫兩架友軍 B-25 轟炸機掠過戰場，發射大量重型火箭犁平前線！',
    color: '#dc2626',
  },
};

export type PlaneType = 'P51' | 'SPITFIRE' | 'P38';

export interface PlaneInfo {
  id: PlaneType;
  name: string;
  subtitle: string;
  speed: number;
  maxHp: number;
  fireRate: number;
  bombCapacity: number;
  bulletType: string;
  description: string;
  color: string;
  wingColor: string;
}

export const PLANES: Record<PlaneType, PlaneInfo> = {
  P51: {
    id: 'P51',
    name: 'P-51 Mustang',
    subtitle: '平衡型·美軍主力戰機',
    speed: 6.2,
    maxHp: 3,
    fireRate: 9,
    bombCapacity: 2,
    bulletType: '穿甲機槍 & 扇形散彈',
    description: '經典戰馬式機體，兼具頂級機動性與均衡火力，新手與老將的最佳拍檔。',
    color: '#2563eb',
    wingColor: '#60a5fa',
  },
  SPITFIRE: {
    id: 'SPITFIRE',
    name: 'Supermarine Spitfire',
    subtitle: '敏捷型·皇家空軍噴火',
    speed: 7.2,
    maxHp: 3,
    fireRate: 7,
    bombCapacity: 2,
    bulletType: '高頻微型導彈 & 聚焦機炮',
    description: '超高機動速度與疾速射速，能在敵方重重彈幕中穿梭自如，專精定點突破。',
    color: '#059669',
    wingColor: '#34d399',
  },
  P38: {
    id: 'P38',
    name: 'P-38 Lightning',
    subtitle: '重裝型·雙身惡魔重戰機',
    speed: 5.4,
    maxHp: 4,
    fireRate: 11,
    bombCapacity: 3,
    bulletType: '雙聯重型加農炮 & 廣角重彈',
    description: '堅固的雙發雙尾撐重戰機，擁有 4 格耐久度與超大範圍爆震空襲炸彈。',
    color: '#d97706',
    wingColor: '#fbbf24',
  },
};

export interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isPlayer: boolean;
  damage: number;
  radius: number;
  color: string;
  weaponType?: WeaponType;
  isLaser?: boolean;
  laserHeight?: number;
  isHoming?: boolean;
  isRocket?: boolean;
  blastRadius?: number;
  targetId?: number;
}

export type EnemyType = 'scout' | 'interceptor' | 'bomber' | 'torpedo' | 'ace';

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  scoreVal: number;
  color: string;
  shootTimer: number;
  shootInterval: number;
  bulletSpeed: number;
  patternTimer: number;
}

export interface Boss {
  stage: number;
  name: string;
  title: string;
  x: number;
  y: number;
  targetY: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  speedX: number;
  timer: number;
  color: string;
}

export type ItemType = 'P' | 'B' | 'W' | 'S' | 'STAR' | 'W_LASER' | 'W_HOMING' | 'W_ROCKET';

export interface DropItem {
  id: number;
  x: number;
  y: number;
  vy: number;
  type: ItemType;
  size: number;
  wobble: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  maxLife: number;
  color: string;
  type?: 'spark' | 'smoke' | 'plasma' | 'electric' | 'laser' | 'missile_plume' | 'tracer' | 'debris' | 'ring' | 'mach_cone';
  grow?: number;
  glow?: boolean;
}

export interface Afterimage {
  x: number;
  y: number;
  width: number;
  height: number;
  planeType: PlaneType;
  life: number;
  maxLife: number;
  color: string;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  lineWidth?: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface Cloud {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

export interface Island {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;
  sandColor: string;
  points: { dx: number; dy: number }[];
}

export interface HighScoreRecord {
  score: number;
  stage: number;
  mode: GameMode;
  plane: PlaneType;
  weapon: WeaponType;
  date: string;
}

export interface BossCombatSample {
  timeSec: number;
  timeLabel: string;
  bossHp: number;
  bossHpPct: number;
  playerHp: number;
  playerHpPct: number;
  cumulativeDamage: number;
  dps: number;
  event?: string;
}

export interface Raindrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
}

export interface BossBattleRecord {
  bossName: string;
  bossTitle: string;
  stage: number;
  durationSec: number;
  totalDamage: number;
  avgDps: number;
  bossDefeated: boolean;
  playerSurvived: boolean;
  hitsTakenDuringBoss: number;
  maxHitsAllowed: number;
  bombsUsed: number;
  samples: BossCombatSample[];
}

