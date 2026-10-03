import {
  Afterimage,
  Boss,
  Bullet,
  Cloud,
  DropItem,
  Enemy,
  FloatingText,
  Island,
  Particle,
  PlaneType,
  Raindrop,
  Shockwave,
  WEATHERS,
  WeatherType,
} from './types';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  public setDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  // Draw scrolling deep ocean and wave patterns with dynamic weather conditions
  public drawBackground(
    oceanOffset: number,
    islands: Island[],
    clouds: Cloud[],
    weather: WeatherType = 'CLEAR',
    stormFlash = 0
  ) {
    const ctx = this.ctx;

    // Sea gradient based on atmospheric weather conditions
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    if (weather === 'STORM') {
      if (stormFlash > 0) {
        oceanGrad.addColorStop(0, '#1e1b4b');
        oceanGrad.addColorStop(0.5, '#2e1065');
        oceanGrad.addColorStop(1, '#1e293b');
      } else {
        oceanGrad.addColorStop(0, '#060b14');
        oceanGrad.addColorStop(0.5, '#0b1322');
        oceanGrad.addColorStop(1, '#0f172a');
      }
    } else if (weather === 'FOG') {
      oceanGrad.addColorStop(0, '#141f2e');
      oceanGrad.addColorStop(0.5, '#1e2d3d');
      oceanGrad.addColorStop(1, '#28394e');
    } else {
      // CLEAR: Pacific WWII azure ocean
      oceanGrad.addColorStop(0, '#0c2340');
      oceanGrad.addColorStop(0.5, '#0a3254');
      oceanGrad.addColorStop(1, '#0e4166');
    }
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle water ripples / wave foam
    const rippleAlpha = weather === 'STORM' ? 0.08 : weather === 'FOG' ? 0.03 : 0.05;
    ctx.fillStyle = weather === 'STORM' ? `rgba(224, 231, 255, ${rippleAlpha})` : `rgba(255, 255, 255, ${rippleAlpha})`;
    for (let y = (oceanOffset % 60) - 60; y < this.height; y += 60) {
      for (let x = 20; x < this.width; x += 100) {
        const waveX = x + Math.sin((y + oceanOffset) * 0.02) * 15;
        ctx.fillRect(waveX, y, 40, 2);

        // Sun glints on clear weather
        if (weather === 'CLEAR' && (x + y) % 120 === 0) {
          ctx.fillStyle = 'rgba(254, 240, 138, 0.28)';
          ctx.fillRect(waveX + 15, y - 1, 6, 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${rippleAlpha})`;
        }
      }
    }

    // Draw tropical islands with sandy beach contours
    for (const island of islands) {
      ctx.save();
      ctx.translate(island.x, island.y);

      // Sand rim
      ctx.fillStyle = weather === 'STORM' ? '#78716c' : weather === 'FOG' ? '#94a3b8' : island.sandColor || '#d4b26f';
      ctx.beginPath();
      ctx.ellipse(0, 0, island.width * 0.58, island.height * 0.58, 0, 0, Math.PI * 2);
      ctx.fill();

      // Lush jungle interior
      ctx.fillStyle = weather === 'STORM' ? '#0f291e' : weather === 'FOG' ? '#1e3a2f' : island.color || '#165b33';
      ctx.beginPath();
      ctx.ellipse(0, 0, island.width * 0.45, island.height * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hill shadow
      ctx.fillStyle = '#061a10';
      ctx.beginPath();
      ctx.arc(island.width * 0.1, island.height * 0.1, island.width * 0.25, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Clouds dynamic shadow cast on ocean (dimmed in storm or fog)
    const shadowOpacity = weather === 'STORM' ? 0.38 : weather === 'FOG' ? 0.12 : 0.25;
    for (const c of clouds) {
      ctx.fillStyle = `rgba(0, 15, 30, ${shadowOpacity})`;
      ctx.beginPath();
      ctx.ellipse(c.x + 30, c.y + 50, c.size * 0.9, c.size * 0.6, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw Subtle Sun Rays for Clear Weather
  public drawSunRays(propFrame: number) {
    const ctx = this.ctx;
    ctx.save();
    const rayCount = 4;
    for (let i = 0; i < rayCount; i++) {
      const offsetX = 50 + i * 110 + Math.sin((propFrame + i * 40) * 0.015) * 20;
      const grad = ctx.createLinearGradient(offsetX, 0, offsetX - 40, this.height);
      grad.addColorStop(0, 'rgba(254, 240, 138, 0.13)');
      grad.addColorStop(0.5, 'rgba(254, 240, 138, 0.05)');
      grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(offsetX - 25, 0);
      ctx.lineTo(offsetX + 35, 0);
      ctx.lineTo(offsetX + 70, this.height);
      ctx.lineTo(offsetX - 50, this.height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Draw Driving Rain and Thunder Lightning for Storm Weather
  public drawStormWeather(
    raindrops: Raindrop[],
    lightningTimer: number,
    lightningBolt?: { x: number; y: number }[]
  ) {
    const ctx = this.ctx;

    // Ambient storm darkness vignette
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.32)';
    ctx.fillRect(0, 0, this.width, this.height);

    // Driving slanted raindrops
    ctx.strokeStyle = 'rgba(199, 210, 254, 0.65)';
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (const r of raindrops) {
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x - 3, r.y + r.length);
    }
    ctx.stroke();

    // Lightning Flash & Electric Bolt Strike
    if (lightningTimer > 0) {
      const alpha = Math.min(0.65, lightningTimer / 8);
      ctx.fillStyle = `rgba(224, 231, 255, ${alpha})`;
      ctx.fillRect(0, 0, this.width, this.height);

      if (lightningBolt && lightningBolt.length > 1) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#818cf8';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.moveTo(lightningBolt[0].x, lightningBolt[0].y);
        for (let i = 1; i < lightningBolt.length; i++) {
          ctx.lineTo(lightningBolt[i].x, lightningBolt[i].y);
        }
        ctx.stroke();

        // Secondary thinner lightning branch
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#c7d2fe';
        ctx.beginPath();
        for (let i = 1; i < lightningBolt.length - 1; i++) {
          if (i % 2 === 1) {
            ctx.moveTo(lightningBolt[i].x, lightningBolt[i].y);
            ctx.lineTo(lightningBolt[i].x + 35, lightningBolt[i].y + 25);
          }
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Draw Dense Volumetric Fog and Player Searchlight Cone
  public drawFogWeather(
    playerX: number,
    playerY: number,
    playerW: number,
    playerH: number,
    propFrame: number
  ) {
    const ctx = this.ctx;
    ctx.save();

    const px = playerX + playerW / 2;
    const py = playerY + playerH / 2;

    // Drifting background fog clouds
    ctx.fillStyle = 'rgba(203, 213, 225, 0.16)';
    for (let i = 0; i < 4; i++) {
      const fogX = ((propFrame * 0.8 + i * 140) % (this.width + 200)) - 100;
      const fogY = 80 + i * 160;
      ctx.beginPath();
      ctx.ellipse(fogX, fogY, 130, 45, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Heavy Atmospheric Fog Veil (Darkens screen except illuminated areas)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    ctx.fillRect(0, 0, this.width, this.height);

    // Carve out Forward Searchlight & Proximity Visibility
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';

    // 1. Forward illuminating searchlight cone
    const beamCutout = ctx.createRadialGradient(px, py, 15, px, py - 260, 360);
    beamCutout.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
    beamCutout.addColorStop(0.65, 'rgba(0, 0, 0, 0.8)');
    beamCutout.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = beamCutout;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px - 145, 0);
    ctx.lineTo(px + 145, 0);
    ctx.closePath();
    ctx.fill();

    // 2. Proximity circle around aircraft
    const proxCutout = ctx.createRadialGradient(px, py, 20, px, py, 135);
    proxCutout.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
    proxCutout.addColorStop(0.7, 'rgba(0, 0, 0, 0.75)');
    proxCutout.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = proxCutout;
    ctx.beginPath();
    ctx.arc(px, py, 135, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Visual Golden-White Searchlight Ray Appearance
    ctx.save();
    const rayGrad = ctx.createLinearGradient(px, py, px, 0);
    rayGrad.addColorStop(0, 'rgba(254, 240, 138, 0.32)');
    rayGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.16)');
    rayGrad.addColorStop(1, 'rgba(254, 240, 138, 0.02)');
    ctx.fillStyle = rayGrad;
    ctx.beginPath();
    ctx.moveTo(px, py - 5);
    ctx.lineTo(px - 140, 0);
    ctx.lineTo(px + 140, 0);
    ctx.closePath();
    ctx.fill();

    // Searchlight lens flare at fighter nose
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#fde047';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(px, py - 18, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // Draw Tactical Weather Alert Banner
  public drawWeatherBanner(weather: WeatherType, bannerTimer: number) {
    if (bannerTimer <= 0) return;
    const ctx = this.ctx;
    const info = WEATHERS[weather];
    if (!info) return;

    const alpha = Math.min(1, bannerTimer / 25);
    ctx.save();
    ctx.globalAlpha = alpha;

    const y = 85;
    const h = 38;

    // Dark sleek tactical banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fillRect(40, y, this.width - 80, h);

    ctx.strokeStyle = info.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(40, y, this.width - 80, h);

    // Weather icon and text
    ctx.fillStyle = info.color;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let conditionNote = '';
    if (weather === 'STORM') conditionNote = ' · 航速 -15% (暴風阻力)';
    else if (weather === 'FOG') conditionNote = ' · 開啟戰機探照燈';
    else conditionNote = ' · 航速 100% (晴空全速)';

    ctx.fillText(`${info.badge}：${info.name}${conditionNote}`, this.width / 2, y + h / 2);

    ctx.restore();
  }

  // Draw floating clouds above scenery
  public drawClouds(clouds: Cloud[]) {
    const ctx = this.ctx;
    for (const c of clouds) {
      ctx.fillStyle = `rgba(255, 255, 255, ${c.opacity || 0.18})`;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size * 0.6, 0, Math.PI * 2);
      ctx.arc(c.x - c.size * 0.4, c.y + 10, c.size * 0.45, 0, Math.PI * 2);
      ctx.arc(c.x + c.size * 0.4, c.y + 8, c.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw fighter silhouette for afterimages and ghost trails
  public drawPlaneSilhouette(planeType: PlaneType, strokeColor: string, fillColor: string) {
    const ctx = this.ctx;
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = fillColor;
    ctx.lineWidth = 1.8;

    if (planeType === 'P51') {
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(5, -6);
      ctx.lineTo(26, 6);
      ctx.lineTo(24, 13);
      ctx.lineTo(6, 11);
      ctx.lineTo(12, 19);
      ctx.lineTo(0, 22);
      ctx.lineTo(-12, 19);
      ctx.lineTo(-6, 11);
      ctx.lineTo(-24, 13);
      ctx.lineTo(-26, 6);
      ctx.lineTo(-5, -6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (planeType === 'SPITFIRE') {
      ctx.beginPath();
      ctx.ellipse(0, 4, 27, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, 0, 6, 23, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // P38 Lightning
      ctx.beginPath();
      ctx.ellipse(0, -4, 6.5, 14, 0, 0, Math.PI * 2);
      ctx.rect(-28, 0, 56, 7);
      ctx.rect(-17, -16, 6, 36);
      ctx.rect(11, -16, 6, 36);
      ctx.fill();
      ctx.stroke();
    }
  }

  // Draw trailing motion-blur afterimages for Afterburner Boost skill
  public drawAfterimages(afterimages: Afterimage[]) {
    const ctx = this.ctx;
    for (const img of afterimages) {
      const alpha = Math.max(0, img.life / img.maxLife) * 0.55;
      if (alpha <= 0.01) continue;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(img.x + img.width / 2, img.y + img.height / 2);
      ctx.shadowColor = img.color || '#38bdf8';
      ctx.shadowBlur = 12;

      this.drawPlaneSilhouette(
        img.planeType,
        img.color || '#38bdf8',
        'rgba(56, 189, 248, 0.22)'
      );

      ctx.restore();
    }
  }

  // Draw Player Aircraft with WWII detail and active skill auras
  public drawPlayer(
    x: number,
    y: number,
    width: number,
    height: number,
    planeType: PlaneType,
    invincibleTimer: number,
    propFrame: number,
    hasWingman: boolean,
    hasShield: boolean,
    isShieldActive: boolean,
    isBoosting: boolean
  ) {
    const ctx = this.ctx;

    // Invincibility flicker
    if (invincibleTimer > 0 && Math.floor(invincibleTimer / 4) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);

    // Afterburner Speed Boost Trail & Supersonic Mach Cones
    if (isBoosting) {
      ctx.save();
      // Supersonic Mach Shockwave Cone
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(-width * 0.7, 14);
      ctx.lineTo(0, -height * 0.45);
      ctx.lineTo(width * 0.7, 14);
      ctx.stroke();

      // Energetic supersonic wake plume
      const wakeGrad = ctx.createLinearGradient(0, 16, 0, 85);
      wakeGrad.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
      wakeGrad.addColorStop(0.4, 'rgba(234, 179, 8, 0.35)');
      wakeGrad.addColorStop(1, 'rgba(234, 179, 8, 0)');
      ctx.fillStyle = wakeGrad;
      ctx.beginPath();
      ctx.moveTo(-width * 0.45, 18);
      ctx.lineTo(0, 80 + Math.random() * 22);
      ctx.lineTo(width * 0.45, 18);
      ctx.closePath();
      ctx.fill();

      // High-speed wind streaks
      ctx.strokeStyle = '#a5f3fc';
      ctx.lineWidth = 2;
      for (let i = -3; i <= 3; i++) {
        const sx = i * 8;
        const sy = 10 + Math.random() * 8;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + (Math.random() - 0.5) * 4, sy + 38 + Math.random() * 22);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Propeller spinning blur
    ctx.fillStyle = 'rgba(255, 240, 160, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, -22, 14, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Jet / Engine thrust fire
    const flameH = (isBoosting ? 26 : 10) + Math.sin(propFrame * 0.8) * 6;
    const flameGrad = ctx.createLinearGradient(0, 18, 0, 18 + flameH);
    flameGrad.addColorStop(0, '#fef08a');
    flameGrad.addColorStop(0.3, isBoosting ? '#06b6d4' : '#f97316');
    flameGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = flameGrad;

    if (planeType === 'P38') {
      // Twin boom engines
      ctx.beginPath();
      ctx.moveTo(-16, 20);
      ctx.lineTo(-12, 20 + flameH);
      ctx.lineTo(-8, 20);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(8, 20);
      ctx.lineTo(12, 20 + flameH);
      ctx.lineTo(16, 20);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(-4, 20);
      ctx.lineTo(0, 20 + flameH);
      ctx.lineTo(4, 20);
      ctx.fill();
    }

    // Aircraft Body Rendering
    if (planeType === 'P51') {
      // P-51 Mustang
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(-26, 6);
      ctx.lineTo(-24, 13);
      ctx.lineTo(0, 5);
      ctx.lineTo(24, 13);
      ctx.lineTo(26, 6);
      ctx.closePath();
      ctx.fill();

      // Wing barrels
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-18, -4, 2, 8);
      ctx.fillRect(16, -4, 2, 8);

      // Fuselage
      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath();
      ctx.ellipse(0, 0, 7.5, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cockpit
      ctx.fillStyle = '#93c5fd';
      ctx.fillRect(-3, -11, 6, 9);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-1.5, -9, 3, 4);

      // Yellow nose
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(0, -18, 5, 0, Math.PI, true);
      ctx.fill();

      // Tail
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-12, 16, 24, 3);
    } else if (planeType === 'SPITFIRE') {
      // Supermarine Spitfire
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.ellipse(0, 4, 27, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // RAF Roundel
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(-16, 4, 4, 0, Math.PI * 2);
      ctx.arc(16, 4, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-16, 4, 2.5, 0, Math.PI * 2);
      ctx.arc(16, 4, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(-16, 4, 1.2, 0, Math.PI * 2);
      ctx.arc(16, 4, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Sleek fuselage
      ctx.fillStyle = '#047857';
      ctx.beginPath();
      ctx.ellipse(0, 0, 6, 23, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cockpit
      ctx.fillStyle = '#6ee7b7';
      ctx.fillRect(-2.5, -9, 5, 9);

      // Tail
      ctx.fillStyle = '#059669';
      ctx.fillRect(-10, 18, 20, 2.5);
    } else {
      // P-38 Lightning
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.ellipse(0, -4, 6.5, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#d97706';
      ctx.fillRect(-28, 0, 56, 7);

      ctx.fillStyle = '#92400e';
      ctx.fillRect(-17, -16, 6, 36);
      ctx.fillRect(11, -16, 6, 36);

      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-17, 18, 34, 4);

      ctx.fillStyle = '#fde68a';
      ctx.fillRect(-2.5, -10, 5, 8);
    }

    // Wingman Escorts (Squadron)
    if (hasWingman) {
      this.drawWingman(-36, 12, propFrame);
      this.drawWingman(36, 12, propFrame);
    }

    // Energy Shield Bubble or Active Aegis Skill
    if (hasShield || isShieldActive) {
      const shieldRadius = isShieldActive ? 38 : 32;
      const shieldColor = isShieldActive ? '#38bdf8' : '#0284c7';

      ctx.save();
      // Outer glowing ring
      ctx.strokeStyle = isShieldActive ? 'rgba(56, 189, 248, 0.95)' : 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = isShieldActive ? 3.5 : 2;
      ctx.shadowColor = shieldColor;
      ctx.shadowBlur = isShieldActive ? 14 : 6;
      ctx.beginPath();
      ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Translucent energy sphere fill
      ctx.fillStyle = isShieldActive ? 'rgba(56, 189, 248, 0.22)' : 'rgba(56, 189, 248, 0.12)';
      ctx.fill();

      // Active Aegis Skill: Rotating Hexagonal Forcefield Mesh
      if (isShieldActive) {
        const hexAngle = propFrame * 0.025;
        ctx.strokeStyle = 'rgba(165, 243, 252, 0.65)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = hexAngle + (i * Math.PI) / 3;
          const hx = Math.cos(a) * (shieldRadius * 0.88);
          const hy = Math.sin(a) * (shieldRadius * 0.88);
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.stroke();

        // Hexagon center radial spokes
        for (let i = 0; i < 6; i++) {
          const a = hexAngle + (i * Math.PI) / 3;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * (shieldRadius * 0.88), Math.sin(a) * (shieldRadius * 0.88));
          ctx.stroke();
        }

        // Orbiting energy plasmons & connecting electric arcs
        for (let i = 0; i < 4; i++) {
          const angle = (propFrame * 0.08) + (i * Math.PI) / 2;
          const px = Math.cos(angle) * shieldRadius;
          const py = Math.sin(angle) * shieldRadius;

          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#a5f3fc';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();

          // Electric arc connecting neighboring nodes
          if (i % 2 === 0) {
            const nextAngle = angle + Math.PI / 4;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(Math.cos(nextAngle) * (shieldRadius * 0.85), Math.sin(nextAngle) * (shieldRadius * 0.85));
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    }

    ctx.restore();
  }

  // Draw escort mini-fighter
  private drawWingman(offsetX: number, offsetY: number, propFrame: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(offsetX, offsetY);

    ctx.fillStyle = 'rgba(255, 240, 160, 0.5)';
    ctx.beginPath();
    ctx.ellipse(0, -10, 8, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.lineTo(-12, 4);
    ctx.lineTo(12, 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#047857';
    ctx.fillRect(-3, -7, 6, 15);

    ctx.fillStyle = '#f97316';
    ctx.fillRect(-1.5, 8, 3, 4 + Math.sin(propFrame) * 2);

    ctx.restore();
  }

  // Draw Enemies with WWII tactical designs
  public drawEnemies(enemies: Enemy[]) {
    const ctx = this.ctx;
    for (const enemy of enemies) {
      ctx.save();
      ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);

      if (enemy.type === 'scout') {
        // Zero Fighter (A6M style)
        ctx.fillStyle = enemy.color || '#dc2626';
        ctx.beginPath();
        ctx.moveTo(0, 16);
        ctx.lineTo(-enemy.width / 2, -10);
        ctx.lineTo(enemy.width / 2, -10);
        ctx.closePath();
        ctx.fill();

        // Hinomaru Red Sun
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (enemy.type === 'bomber') {
        // Heavy Torpedo Bomber
        ctx.fillStyle = '#475569';
        ctx.fillRect(-enemy.width / 2, -8, enemy.width, 14);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-enemy.width / 2 + 6, -14, 8, 22);
        ctx.fillRect(enemy.width / 2 - 14, -14, 8, 22);

        ctx.fillStyle = enemy.color || '#334155';
        ctx.fillRect(-8, -enemy.height / 2, 16, enemy.height);

        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-4, -enemy.height / 2 + 4, 8, 8);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 6, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (enemy.type === 'interceptor') {
        // Dive interceptor
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.moveTo(0, 18);
        ctx.lineTo(-enemy.width / 2, -14);
        ctx.lineTo(0, -6);
        ctx.lineTo(enemy.width / 2, -14);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-2, -12, 4, 20);
      } else {
        // Heavy Gunboat / Ace
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-enemy.width / 2, -enemy.height / 2, enemy.width, enemy.height);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-enemy.width / 2 + 4, -enemy.height / 2 + 4, enemy.width - 8, enemy.height - 8);
      }

      ctx.restore();
    }
  }

  // Draw Epic Multi-Stage Boss Battle Fleet
  public drawBoss(boss: Boss) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(boss.x, boss.y);

    if (boss.stage === 1) {
      // Sky Cruiser Fuso
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, boss.width, boss.height);

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, 20);
      ctx.lineTo(boss.width / 2, boss.height + 15);
      ctx.lineTo(boss.width, 20);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#475569';
      ctx.fillRect(15, 12, boss.width - 30, boss.height - 24);

      // Main Triple Turret
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(boss.width / 2, boss.height / 2, 18, 0, Math.PI * 2);
      ctx.fill();

      // Gun Barrels
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(boss.width / 2 - 8, boss.height / 2 + 10, 4, 22);
      ctx.fillRect(boss.width / 2 - 2, boss.height / 2 + 12, 4, 24);
      ctx.fillRect(boss.width / 2 + 4, boss.height / 2 + 10, 4, 22);

      // Flank weapon pods
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(10, boss.height - 18, 14, 14);
      ctx.fillRect(boss.width - 24, boss.height - 18, 14, 14);
    } else if (boss.stage === 2) {
      // Zeppelin Armored Dreadnought
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(boss.width / 2, boss.height / 2, boss.width / 2, boss.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(boss.width / 2, boss.height / 2, boss.width / 2 - 8, boss.height / 2 - 8, 0, 0, Math.PI * 2);
      ctx.stroke();

      const rot = (boss.timer * 0.05) % (Math.PI * 2);
      ctx.save();
      ctx.translate(boss.width / 2, boss.height / 2);
      ctx.rotate(rot);
      ctx.fillStyle = '#dc2626';
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        ctx.fillRect(Math.cos(angle) * 25 - 5, Math.sin(angle) * 25 - 5, 10, 10);
      }
      ctx.restore();
    } else {
      // Project Shinden Mega-Carrier
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.moveTo(boss.width / 2, boss.height + 25);
      ctx.lineTo(0, boss.height * 0.4);
      ctx.lineTo(20, 0);
      ctx.lineTo(boss.width - 20, 0);
      ctx.lineTo(boss.width, boss.height * 0.4);
      ctx.closePath();
      ctx.fill();

      const coreGrad = ctx.createRadialGradient(
        boss.width / 2,
        boss.height / 2,
        2,
        boss.width / 2,
        boss.height / 2,
        24
      );
      coreGrad.addColorStop(0, '#fef08a');
      coreGrad.addColorStop(0.5, '#ea580c');
      coreGrad.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(boss.width / 2, boss.height / 2, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    this.drawBossHpBar(boss);
  }

  // Draw arcade Boss Health Gauge & Stage Title
  private drawBossHpBar(boss: Boss) {
    const ctx = this.ctx;
    const barW = this.width - 80;
    const barX = 40;
    const barY = 38;
    const hpRatio = Math.max(0, boss.hp / boss.maxHp);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(barX - 4, barY - 18, barW + 8, 32);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(barX - 4, barY - 18, barW + 8, 32);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${boss.name} · ${boss.title}`, barX, barY - 4);

    ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
    ctx.fillRect(barX, barY, barW, 9);

    const hpGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    hpGrad.addColorStop(0, '#f87171');
    hpGrad.addColorStop(0.5, '#ef4444');
    hpGrad.addColorStop(1, '#b91c1c');
    ctx.fillStyle = hpGrad;
    ctx.fillRect(barX, barY, barW * hpRatio, 9);
  }

  // Draw Bullets with distinct weapon visuals (Vulcan, Laser, Homing, Rockets)
  public drawBullets(bullets: Bullet[]) {
    const ctx = this.ctx;
    for (const b of bullets) {
      if (b.isPlayer) {
        if (b.isLaser) {
          // Continuous piercing laser beam with multi-layer high-energy glow
          const h = b.laserHeight || 30;
          ctx.save();

          // Outer plasma aura glow
          const outerGrad = ctx.createLinearGradient(b.x - 7, 0, b.x + 7, 0);
          outerGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
          outerGrad.addColorStop(0.3, 'rgba(6, 182, 212, 0.45)');
          outerGrad.addColorStop(0.5, 'rgba(165, 243, 252, 0.8)');
          outerGrad.addColorStop(0.7, 'rgba(6, 182, 212, 0.45)');
          outerGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
          ctx.fillStyle = outerGrad;
          ctx.fillRect(b.x - 7, b.y, 14, h);

          // Intense cyan laser core
          ctx.fillStyle = '#22d3ee';
          ctx.fillRect(b.x - 2.5, b.y, 5, h);

          // Pure white hyper-concentrated central filament
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(b.x - 1, b.y - 1, 2, h + 2);

          // Leading edge energy diamond tip
          ctx.fillStyle = '#a5f3fc';
          ctx.beginPath();
          ctx.moveTo(b.x, b.y - 4);
          ctx.lineTo(b.x + 4, b.y);
          ctx.lineTo(b.x, b.y + 4);
          ctx.lineTo(b.x - 4, b.y);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        } else if (b.isHoming) {
          // Homing tactical micro-missile with fins and animated rocket exhaust
          ctx.save();
          ctx.translate(b.x, b.y);
          const angle = Math.atan2(b.vy, b.vx);
          ctx.rotate(angle + Math.PI / 2);

          // Stabilizer fins
          ctx.fillStyle = '#047857';
          ctx.beginPath();
          ctx.moveTo(-5, 4);
          ctx.lineTo(-2, 0);
          ctx.lineTo(-2, 5);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(5, 4);
          ctx.lineTo(2, 0);
          ctx.lineTo(2, 5);
          ctx.closePath();
          ctx.fill();

          // Missile aerodynamic body
          ctx.fillStyle = '#10b981';
          ctx.fillRect(-2.5, -6, 5, 11);

          // Warhead cone
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.moveTo(-2.5, -6);
          ctx.lineTo(0, -11);
          ctx.lineTo(2.5, -6);
          ctx.closePath();
          ctx.fill();

          // Thruster nozzle
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-1.5, 5, 3, 2);

          // Dynamic pulsing flame jet
          const jetLen = 5 + Math.random() * 4;
          const jetGrad = ctx.createLinearGradient(0, 6, 0, 6 + jetLen);
          jetGrad.addColorStop(0, '#ffffff');
          jetGrad.addColorStop(0.3, '#fef08a');
          jetGrad.addColorStop(0.7, '#f97316');
          jetGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = jetGrad;
          ctx.beginPath();
          ctx.moveTo(-1.5, 6);
          ctx.lineTo(0, 6 + jetLen);
          ctx.lineTo(1.5, 6);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        } else if (b.isRocket) {
          // Heavy armor-piercing rocket with stabilizers and heavy plume
          ctx.save();
          ctx.translate(b.x, b.y);
          const angle = Math.atan2(b.vy, b.vx);
          ctx.rotate(angle + Math.PI / 2);

          // Heavy stabilizing fins
          ctx.fillStyle = '#c2410c';
          ctx.beginPath();
          ctx.moveTo(-6, 6);
          ctx.lineTo(-3, 0);
          ctx.lineTo(-3, 8);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(6, 6);
          ctx.lineTo(3, 0);
          ctx.lineTo(3, 8);
          ctx.closePath();
          ctx.fill();

          // Rocket fuselage
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(-3.5, -8, 7, 16);

          // Warhead cap
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.moveTo(-3.5, -8);
          ctx.lineTo(0, -13);
          ctx.lineTo(3.5, -8);
          ctx.closePath();
          ctx.fill();

          // Core flame
          const flameH = 6 + Math.random() * 5;
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(-1.5, 8, 3, flameH);

          ctx.restore();
        } else {
          // Standard Vulcan golden machine gun tracer bullets
          ctx.save();

          // Elongated tracer streak behind bullet
          const trailLen = 14;
          const angle = Math.atan2(b.vy, b.vx);
          const tailX = b.x - Math.cos(angle) * trailLen;
          const tailY = b.y - Math.sin(angle) * trailLen;

          const tracerGrad = ctx.createLinearGradient(b.x, b.y, tailX, tailY);
          tracerGrad.addColorStop(0, '#ffffff');
          tracerGrad.addColorStop(0.2, '#fef08a');
          tracerGrad.addColorStop(0.6, '#f59e0b');
          tracerGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');

          ctx.strokeStyle = tracerGrad;
          ctx.lineWidth = b.radius * 1.4;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();

          // Bright bullet head
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius * 0.9, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      } else {
        // Red glowing enemy bullet orbs with bright inner core
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Draw Supply Drops with Weapon modules
  public drawItems(items: DropItem[]) {
    const ctx = this.ctx;
    for (const item of items) {
      ctx.save();
      const wobbleX = Math.sin(item.wobble) * 2;
      ctx.translate(item.x + wobbleX, item.y);

      const size = item.size;
      let bgColor = '#eab308';
      let border = '#fef08a';
      let label = 'P';

      if (item.type === 'B') {
        bgColor = '#dc2626';
        border = '#fca5a5';
        label = 'B';
      } else if (item.type === 'W') {
        bgColor = '#059669';
        border = '#6ee7b7';
        label = 'W';
      } else if (item.type === 'S') {
        bgColor = '#2563eb';
        border = '#93c5fd';
        label = 'S';
      } else if (item.type === 'STAR') {
        bgColor = '#f59e0b';
        border = '#fff';
        label = '★';
      } else if (item.type === 'W_LASER') {
        bgColor = '#0891b2';
        border = '#22d3ee';
        label = 'L';
      } else if (item.type === 'W_HOMING') {
        bgColor = '#059669';
        border = '#34d399';
        label = 'H';
      } else if (item.type === 'W_ROCKET') {
        bgColor = '#ea580c';
        border = '#fb923c';
        label = 'R';
      }

      ctx.fillStyle = bgColor;
      ctx.fillRect(-size / 2, -size / 2, size, size);

      ctx.strokeStyle = border;
      ctx.lineWidth = 2;
      ctx.strokeRect(-size / 2, -size / 2, size, size);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 0, 0);

      ctx.restore();
    }
  }

  // Draw Explosion Particles & Weapon Debris with Specialized Renderers
  public drawParticles(particles: Particle[]) {
    const ctx = this.ctx;
    for (const p of particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;

      if (p.type === 'smoke') {
        // Expanding soft smoke puff
        ctx.fillStyle = p.color || 'rgba(226, 232, 240, 0.7)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.radius), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'electric' || p.type === 'laser') {
        // Electric / Laser plasma spark diamond with glowing center & electric discharge
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - p.radius * 2);
        ctx.lineTo(p.x + p.radius * 0.8, p.y);
        ctx.lineTo(p.x, p.y + p.radius * 2);
        ctx.lineTo(p.x - p.radius * 0.8, p.y);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.8, p.radius * 0.45), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'ring') {
        // Concentric expanding laser/thruster ring
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.radius), 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'mach_cone') {
        // Supersonic wind shock streak
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x - p.radius * 2, p.y + p.radius * 1.5);
        ctx.lineTo(p.x, p.y);
        ctx.lineTo(p.x + p.radius * 2, p.y + p.radius * 1.5);
        ctx.stroke();
      } else if (p.type === 'tracer') {
        // High-speed kinetic tracer spark oriented along velocity vector
        const len = Math.hypot(p.vx, p.vy) * 2.2 + 4;
        const angle = Math.atan2(p.vy, p.vx);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(1.2, p.radius);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - Math.cos(angle) * len, p.y - Math.sin(angle) * len);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.9, p.radius * 0.75), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'debris') {
        // Tumbling angular metallic shrapnel
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.life * 0.3);
        ctx.fillRect(-p.radius, -p.radius * 0.6, p.radius * 2, p.radius * 1.2);
        ctx.restore();
      } else {
        // Standard sparks & debris
        ctx.fillStyle = p.color;
        if (p.glow) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.radius), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // Draw Shockwave Blast Rings with Dynamic Line Widths and Colors
  public drawShockwaves(shockwaves: Shockwave[]) {
    const ctx = this.ctx;
    for (const s of shockwaves) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, s.alpha);
      ctx.strokeStyle = s.color || '#38bdf8';
      ctx.lineWidth = s.lineWidth || 3.5;
      ctx.shadowColor = s.color || '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Thin inner secondary pulse ring
      if (s.radius > 12) {
        ctx.globalAlpha = Math.max(0, s.alpha * 0.5);
        ctx.lineWidth = Math.max(1, (s.lineWidth || 3.5) * 0.5);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * 0.72, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  // Draw Fullscreen Explosive Light Flash with Radial Starburst
  public drawScreenExplosiveFlash(flash: number) {
    if (flash <= 0) return;
    const ctx = this.ctx;
    const intensity = Math.min(1, flash / 24);

    ctx.save();
    // Blinding white-gold radial explosive flash
    const grad = ctx.createRadialGradient(
      this.width / 2,
      this.height * 0.45,
      10,
      this.width / 2,
      this.height * 0.45,
      this.height * 0.8
    );
    grad.addColorStop(0, `rgba(255, 255, 255, ${intensity * 0.95})`);
    grad.addColorStop(0.35, `rgba(254, 240, 138, ${intensity * 0.8})`);
    grad.addColorStop(0.7, `rgba(249, 115, 22, ${intensity * 0.5})`);
    grad.addColorStop(1, `rgba(220, 38, 38, ${intensity * 0.3})`);

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Dynamic explosive beam rays across battlefield
    ctx.strokeStyle = `rgba(255, 255, 255, ${intensity * 0.6})`;
    ctx.lineWidth = 2.5;
    const cx = this.width / 2;
    const cy = this.height * 0.45;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 + (flash * 0.05);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * this.height, cy + Math.sin(angle) * this.height);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Draw floating arcade scores
  public drawFloatingTexts(texts: FloatingText[]) {
    const ctx = this.ctx;
    for (const t of texts) {
      ctx.save();
      const alpha = Math.max(0, t.life / t.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = t.color;
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    }
  }

  // Draw Red Pulsing Warning for approaching Boss
  public drawBossWarning(timer: number) {
    const ctx = this.ctx;
    const isFlashing = Math.floor(timer / 8) % 2 === 0;

    ctx.save();
    ctx.fillStyle = isFlashing ? 'rgba(220, 38, 38, 0.75)' : 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, this.height * 0.42, this.width, 70);

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, this.height * 0.42, this.width, 70);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚠️ WARNING: 巨型航空戰艦接近 ⚠️', this.width / 2, this.height * 0.47);

    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('ALL FIGHTERS PREPARE FOR BATTLE', this.width / 2, this.height * 0.50);

    ctx.restore();
  }
}
