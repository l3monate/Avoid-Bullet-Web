// Avoid Bullet - pixi.js 버전 (Processing 원본을 포팅)
// 좌표 원점: 화면 왼쪽 위. 속도 단위: pps (pixel per second).
'use strict';

// ======================= 설정 =======================
const SCREEN_W = 900, SCREEN_H = 900;
const BG_COLOR = 0x91cedf, FLOOR_COLOR = 0xffffff;
const FLOOR_Y = 850;
const MAX_DT = 0.05;
const FONT_FAMILY = '"Malgun Gothic", "NanumGothic", "Noto Sans CJK KR", "Noto Serif CJK KR", sans-serif';

const FLOOR_ALPHA = 1.0, PLAYER_ALPHA = 1.0;
const COOLDOWN_BAR_ALPHA = 1.0, COOLDOWN_BAR_BG_ALPHA = 1.0;
const BULLET_ALPHA = 1.0, SPIKE_ALPHA = 1.0, BOMB_ALPHA = 1.0, EXPLOSION_ALPHA = 1.0, LIMIT_ALPHA = 1.0;

// 플레이어
const PLAYER_W = 50, PLAYER_H = 50, PLAYER_COLOR = 0xffffff;
const PLAYER_SPEED = 400, JUMP_SPEED = 800, GRAVITY = 2000;

// 대쉬
const DASH_DURATION = 2, DASH_SPEED_MULT = 2, DASH_COOLDOWN = 10, DASH_COLOR = 0x24e8ff;
const AFTERIMAGE_INTERVAL = 0.05, AFTERIMAGE_ALPHA = 0.2, AFTERIMAGE_FADE_TIME = 0.2, AFTERIMAGE_COLOR = 0x24e8ff;

// 쿨타임 바
const COOLDOWN_BAR_COLOR = 0x24e8ff, COOLDOWN_BAR_BG = 0xdddddd;
const COOLDOWN_BAR_W = 300, COOLDOWN_BAR_H = 14, COOLDOWN_BAR_OFFSET_Y = 18;

const IDLE_DEATH_TIME = 3;

// 테스트
const IMMORTALLITY = false;
const INITIAL_SCORE = 0;

// 점수
const SCORE_TICK = 0.01, SCORE_BASE_INCREMENT = 1.0, SCORE_GROWTH_RATE = 0.01, SCORE_GROWTH_STEP = 100;
const SCORE_X = 16, SCORE_Y = 12, SCORE_TEXT_SIZE = 28, SCORE_LABEL = '점수 ';

// 탄알
const BULLET_W = 15, BULLET_H = 15, BULLET_COLOR = 0xff0000, BULLET_SPEED = 500;
const SPAWN_INTERVAL = 0.07, BULLET_SPAWN_Y = 0, BULLET_ACTIVATE_SCORE = 0;
const TIMER_EPSILON = 0.000001;

// 가시
const SPIKE_ACTIVATE_SCORE = 0, SPIKE_SPAWN_MIN = 5, SPIKE_SPAWN_MAX = 10;
const SPIKE_W = 18, SPIKE_H = 50, SPIKE_SPEED = 300, SPIKE_HOLD_TIME = 0.2, SPIKE_COLOR = 0xff0000;
const SPIKE_WARN_TIME = 0.8, SPIKE_WARN_BLINK = 0.125, SPIKE_WARN_ALPHA = 0.3;
const SPIKE_WARN_COLOR_A = 0xff0000, SPIKE_WARN_COLOR_B = 0xffffff;

// 폭탄
const BOMB_ACTIVATE_SCORE = 0, BOMB_SPAWN_MIN = 2.5, BOMB_SPAWN_MAX = 5;
const BOMB_W = 60, BOMB_H = 60, BOMB_COLOR = 0xf2b65a, BOMB_SPEED = 400, BOMB_SPAWN_Y = 0;
const EXPLOSION_DIAMETER = 200, EXPLOSION_COLOR = 0xd46b6b, EXPLOSION_TIME = 0.6;

// 저격
const SNIPE_ACTIVATE_SCORE = 0, SNIPE_SPAWN_MIN = 5, SNIPE_SPAWN_MAX = 10;
const SNIPE_W = 50, SNIPE_H = SCREEN_H, SNIPE_AIM_TIME = 2, SNIPE_AIM_MAX_ALPHA = 0.8, SNIPE_TRACK_SPEED = 250;
const SNIPE_AIM_COLOR = 0xe86aaa, SNIPE_FIRE_COLOR_START = 0xffffff, SNIPE_FIRE_COLOR_END = 0xe86aaa;
const SNIPE_FIRE_START_ALPHA = 1.0, SNIPE_FADE_TIME = 0.3;

// 제한 공격
const LIMIT_ACTIVATE_SCORE = 0, LIMIT_SPAWN_MIN = 10, LIMIT_SPAWN_MAX = 15;
const LIMIT_SAFE_MIN = 100, LIMIT_SAFE_MAX = 400, LIMIT_ZONE_H = SCREEN_H, LIMIT_BOX_H = SCREEN_H;
const LIMIT_WARN_TIME = 3, LIMIT_WARN_BLINK = 0.125, LIMIT_WARN_ALPHA = 0.3;
const LIMIT_WARN_COLOR_A = 0xff0000, LIMIT_WARN_COLOR_B = 0xffffff;
const LIMIT_SPEED = 1800, LIMIT_COLOR = 0x9c3dff, LIMIT_FADE_TIME = 0.1;

// 사망 원인 (우선순위 순서)
const DEATH_BULLET = 0, DEATH_DASH_WALL = 1, DEATH_SPIKE = 2, DEATH_BOMB = 3,
      DEATH_EXPLOSION = 4, DEATH_IDLE = 5, DEATH_LIMIT = 6, DEATH_SNIPE = 7;
const DEATH_MESSAGES = [
  '탄알에 맞아 사망', '대쉬 중 벽에 충돌', '가시에 찔려 사망', '폭탄에 맞아 사망',
  '폭발에 휘말려 사망', '지겨워서 사망', '소멸됨', '저격됨'
];

// 메뉴 / 텍스트
const RESUME_COUNTDOWN = 3;
const MENU_OVERLAY_COLOR = 0xffffff, MENU_OVERLAY_ALPHA = 0.7, TEXT_COLOR = 0x000000;
const TITLE_TEXT_SIZE = 48, BODY_TEXT_SIZE = 24, HINT_TEXT_SIZE = 20, COUNTDOWN_TEXT_SIZE = 120;
const MENU_TOP_OFFSET_Y = -160, MENU_TITLE_GAP = 70, MENU_LINE_GAP = 40;
const PAUSE_TEXT = '일시정지', PAUSE_HINT_TEXT = 'ESC: 재개', CURRENT_SCORE_LABEL = '현재 점수: ';
const GAME_OVER_TEXT = 'GAME OVER', RESTART_TEXT = 'R: 다시 시작', PLAY_COUNT_SUFFIX = '번째 플레이';
const FINAL_SCORE_LABEL = '최종 점수: ', BEST_SCORE_LABEL = '최고 점수: ';
const NEW_BEST_PREFIX = '최고점수를 ', NEW_BEST_SUFFIX = '점으로 갱신했습니다.';

const STATS_KEY = 'avoidBulletStats';

// ======================= 유틸 =======================
const random = (a, b) => a + Math.random() * (b - a);
const constrain = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function lerpColor(c1, c2, t) {
  const ch = (c, s) => (c >> s) & 255;
  const m = s => Math.round(ch(c1, s) + (ch(c2, s) - ch(c1, s)) * t);
  return (m(16) << 16) | (m(8) << 8) | m(0);
}

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function circleHitsRect(cx, cy, r, rx, ry, rw, rh) {
  const nx = constrain(cx, rx, rx + rw), ny = constrain(cy, ry, ry + rh);
  return Math.hypot(cx - nx, cy - ny) <= r;
}

// ======================= 기록 (localStorage) =======================
const stats = { totalPlays: 0, bestScore: 0 };

function loadStats() {
  try {
    const o = JSON.parse(localStorage.getItem(STATS_KEY) || '{}');
    stats.totalPlays = o.totalPlays | 0;
    stats.bestScore = o.bestScore | 0;
  } catch (e) { /* 저장소를 못 읽으면 0으로 시작 */ }
}

function saveStats() {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch (e) { /* 무시 */ }
}

// ======================= 그리기 헬퍼 =======================
let g;   // 매 프레임 지우고 다시 그리는 Graphics (Processing 즉시 모드와 동일)

function drawRect(x, y, w, h, color, alpha) {
  g.rect(x, y, w, h).fill({ color, alpha });
}

// ======================= 게임 객체 =======================
class Spawner {
  constructor(activateScore, minDelay, maxDelay, lead) {
    Object.assign(this, { activateScore, minDelay, maxDelay, lead });
    this.armed = false;
    this.warned = false;
    this.timeLeft = 0;
  }
  nextDelay() { return Math.max(random(this.minDelay, this.maxDelay), this.lead); }
  update(score, dt) {
    let spawn = false;
    if (!this.armed) {
      if (score < this.activateScore) return false;
      this.armed = true;
      this.warned = false;
      this.timeLeft = this.nextDelay();
    }
    this.timeLeft -= dt;
    if (!this.warned && this.timeLeft <= this.lead) {
      this.warned = true;
      spawn = true;
    }
    if (this.timeLeft <= 0) {
      this.timeLeft += this.nextDelay();
      this.warned = false;
    }
    return spawn;
  }
}

class Player {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = PLAYER_W; this.h = PLAYER_H;
    this.vy = 0;
    this.onGround = true;
    this.dashing = false;
    this.dashTime = 0;
    this.cooldownTimer = DASH_COOLDOWN;
    this.afterTimer = 0;
    this.wallHit = false;
    this.idleTime = 0;
    this.afterimages = [];
  }
  centerX() { return this.x + this.w / 2; }

  toggleDash() {
    if (this.dashing) { this.dashing = false; return; }
    if (this.cooldownTimer < DASH_COOLDOWN) return;
    this.dashing = true;
    this.dashTime = 0;
    this.cooldownTimer = 0;
    this.afterTimer = 0;
    if (this.x <= 0 || this.x + this.w >= SCREEN_W) this.wallHit = true;
  }

  update(dt) {
    if (keys.left || keys.right || keys.up) this.idleTime = 0;
    else this.idleTime += dt;

    this.cooldownTimer = Math.min(this.cooldownTimer + dt, DASH_COOLDOWN);
    if (this.dashing) {
      this.dashTime += dt;
      if (this.dashTime >= DASH_DURATION) this.dashing = false;
    }

    let dir = 0;
    if (keys.left) dir -= 1;
    if (keys.right) dir += 1;
    const speed = PLAYER_SPEED * (this.dashing ? DASH_SPEED_MULT : 1);
    const nx = this.x + dir * speed * dt;
    if (this.dashing && (nx <= 0 || nx + this.w >= SCREEN_W)) this.wallHit = true;
    this.x = nx - SCREEN_W * Math.floor(nx / SCREEN_W);   // 벽 넘어가기(순환)

    if (this.dashing) {
      this.afterTimer += dt;
      while (this.afterTimer >= AFTERIMAGE_INTERVAL - TIMER_EPSILON) {
        this.afterTimer -= AFTERIMAGE_INTERVAL;
        this.afterimages.push({ x: this.x, y: this.y, age: 0 });
      }
    }
    for (let i = this.afterimages.length - 1; i >= 0; i--) {
      const a = this.afterimages[i];
      a.age += dt;
      if (a.age >= AFTERIMAGE_FADE_TIME) this.afterimages.splice(i, 1);
    }

    if (keys.up && this.onGround) {
      this.vy = -JUMP_SPEED;
      this.onGround = false;
    }
    if (!this.onGround) {
      this.vy += GRAVITY * dt;
      this.y += this.vy * dt;
      if (this.y + this.h >= FLOOR_Y) {
        this.y = FLOOR_Y - this.h;
        this.vy = 0;
        this.onGround = true;
      }
    }
  }

  overlaps(rx, ry, rw, rh) {
    return rectsOverlap(this.x, this.y, this.w, this.h, rx, ry, rw, rh)
        || rectsOverlap(this.x - SCREEN_W, this.y, this.w, this.h, rx, ry, rw, rh);
  }
  overlapsCircle(cx, cy, r) {
    return circleHitsRect(cx, cy, r, this.x, this.y, this.w, this.h)
        || circleHitsRect(cx, cy, r, this.x - SCREEN_W, this.y, this.w, this.h);
  }

  displayAfterimages() {
    for (const a of this.afterimages) {
      const alpha = AFTERIMAGE_ALPHA * (1 - a.age / AFTERIMAGE_FADE_TIME);
      drawRect(a.x, a.y, this.w, this.h, AFTERIMAGE_COLOR, alpha);
      drawRect(a.x - SCREEN_W, a.y, this.w, this.h, AFTERIMAGE_COLOR, alpha);
    }
  }
  display() {
    const c = this.dashing ? DASH_COLOR : PLAYER_COLOR;
    drawRect(this.x, this.y, this.w, this.h, c, PLAYER_ALPHA);
    drawRect(this.x - SCREEN_W, this.y, this.w, this.h, c, PLAYER_ALPHA);
  }
}

class Bullet {
  constructor(x, y) { this.x = x; this.y = y; this.w = BULLET_W; this.h = BULLET_H; }
  update(dt) { this.y += BULLET_SPEED * dt; }
  hits(p) { return p.overlaps(this.x, this.y, this.w, this.h); }
  display() { drawRect(this.x, this.y, this.w, this.h, BULLET_COLOR, BULLET_ALPHA); }
}

class Spike {
  constructor() { this.h = 0; this.age = 0; this.timer = 0; this.phase = 'WARN'; }
  update(dt) {
    switch (this.phase) {
      case 'WARN':
        this.age += dt;
        if (this.age >= SPIKE_WARN_TIME) this.phase = 'RISE';
        break;
      case 'RISE':
        this.h += SPIKE_SPEED * dt;
        if (this.h >= SPIKE_H) { this.h = SPIKE_H; this.phase = 'HOLD'; this.timer = 0; }
        break;
      case 'HOLD':
        this.timer += dt;
        if (this.timer >= SPIKE_HOLD_TIME) this.phase = 'FALL';
        break;
      case 'FALL':
        this.h -= SPIKE_SPEED * dt;
        if (this.h <= 0) { this.h = 0; this.phase = 'DONE'; }
        break;
    }
  }
  done() { return this.phase === 'DONE'; }
  hits(p) {
    if (this.phase === 'WARN' || this.phase === 'DONE') return false;
    return p.overlaps(0, FLOOR_Y - SPIKE_H, SCREEN_W, SPIKE_H);
  }
  displayWarning() {
    if (this.phase !== 'WARN') return;
    const first = Math.floor(this.age / SPIKE_WARN_BLINK) % 2 === 0;
    drawRect(0, FLOOR_Y - SPIKE_H, SCREEN_W, SPIKE_H,
             first ? SPIKE_WARN_COLOR_A : SPIKE_WARN_COLOR_B, SPIKE_WARN_ALPHA);
  }
  display() {
    if (this.phase === 'WARN' || this.phase === 'DONE' || this.h <= 0) return;
    const w = SCREEN_W / SPIKE_W;
    const apexY = FLOOR_Y - this.h;
    const baseY = apexY + SPIKE_H;
    // 바닥 아래로 숨은 부분은 잘라낸다 (삼각형을 y=FLOOR_Y 에서 자르면 더 작은 닮은꼴 삼각형)
    const t = Math.min(1, (FLOOR_Y - apexY) / SPIKE_H);
    const cutY = Math.min(baseY, FLOOR_Y);
    for (let i = 0; i < SPIKE_W; i++) {
      const x = i * w, mid = x + w / 2, half = (w / 2) * t;
      g.poly([mid, apexY, mid + half, cutY, mid - half, cutY]).fill({ color: SPIKE_COLOR, alpha: SPIKE_ALPHA });
    }
  }
}

class Bomb {
  constructor(x, y) { this.x = x; this.y = y; this.w = BOMB_W; this.h = BOMB_H; }
  update(dt) { this.y += BOMB_SPEED * dt; }
  landed() { return this.y + this.h >= FLOOR_Y; }
  hits(p) { return p.overlaps(this.x, this.y, this.w, this.h); }
  display() { drawRect(this.x, this.y, this.w, this.h, BOMB_COLOR, BOMB_ALPHA); }
}

class Explosion {
  constructor(cx, cy) { this.cx = cx; this.cy = cy; this.age = 0; }
  update(dt) { this.age += dt; }
  done() { return this.age >= EXPLOSION_TIME; }
  remaining() { return Math.max(0, 1 - this.age / EXPLOSION_TIME); }
  hits(p) { return p.overlapsCircle(this.cx, this.cy, EXPLOSION_DIAMETER / 2 * this.remaining()); }
  display() {
    const r = EXPLOSION_DIAMETER / 2 * this.remaining();
    g.circle(this.cx, this.cy, r).fill({ color: EXPLOSION_COLOR, alpha: EXPLOSION_ALPHA * this.remaining() });
  }
}

class Snipe {
  constructor(startX) {
    this.cx = startX;
    this.age = 0;
    this.fireAge = 0;
    this.firing = false;
    this.justFired = false;
  }
  update(dt, targetX) {
    this.justFired = false;
    if (!this.firing) {
      const step = SNIPE_TRACK_SPEED * dt;
      this.cx += constrain(targetX - this.cx, -step, step);
      this.age += dt;
      if (this.age >= SNIPE_AIM_TIME) { this.firing = true; this.justFired = true; }
    } else {
      this.fireAge += dt;
    }
  }
  done() { return this.firing && this.fireAge >= SNIPE_FADE_TIME; }
  hits(p) { return p.overlaps(this.cx - SNIPE_W / 2, 0, SNIPE_W, SNIPE_H); }
  displayAim() {
    if (this.firing) return;
    drawRect(this.cx - SNIPE_W / 2, 0, SNIPE_W, SNIPE_H,
             SNIPE_AIM_COLOR, SNIPE_AIM_MAX_ALPHA * (this.age / SNIPE_AIM_TIME));
  }
  displayFire() {
    if (!this.firing) return;
    const p = Math.min(1, this.fireAge / SNIPE_FADE_TIME);
    drawRect(this.cx - SNIPE_W / 2, 0, SNIPE_W, SNIPE_H,
             lerpColor(SNIPE_FIRE_COLOR_START, SNIPE_FIRE_COLOR_END, p), SNIPE_FIRE_START_ALPHA * (1 - p));
  }
}

class Limitation {
  constructor() {
    const safeW = random(LIMIT_SAFE_MIN, LIMIT_SAFE_MAX);
    const safeX = random(0, SCREEN_W - safeW);
    this.zx = [0, safeX + safeW];
    this.zw = [safeX, SCREEN_W - (safeX + safeW)];
    this.age = 0;
    this.boxY = -LIMIT_BOX_H;
    this.fade = 0;
    this.phase = 'WARN';
  }
  update(dt) {
    if (this.phase === 'WARN') {
      this.age += dt;
      if (this.age >= LIMIT_WARN_TIME) this.phase = 'FALL';
    } else if (this.phase === 'FALL') {
      this.boxY += LIMIT_SPEED * dt;
      if (this.boxY + LIMIT_BOX_H >= FLOOR_Y) {
        this.boxY = FLOOR_Y - LIMIT_BOX_H;
        this.phase = 'FADE';
        this.fade = 0;
      }
    } else if (this.phase === 'FADE') {
      this.fade += dt;
      if (this.fade >= LIMIT_FADE_TIME) this.phase = 'DONE';
    }
  }
  done() { return this.phase === 'DONE'; }
  hits(p) {
    if (this.phase !== 'FALL' && this.phase !== 'FADE') return false;
    for (let i = 0; i < 2; i++) {
      if (this.zw[i] > 0 && p.overlaps(this.zx[i], this.boxY, this.zw[i], LIMIT_BOX_H)) return true;
    }
    return false;
  }
  displayWarning() {
    if (this.phase !== 'WARN') return;
    const first = Math.floor(this.age / LIMIT_WARN_BLINK) % 2 === 0;
    const c = first ? LIMIT_WARN_COLOR_A : LIMIT_WARN_COLOR_B;
    for (let i = 0; i < 2; i++) {
      if (this.zw[i] > 0) drawRect(this.zx[i], 0, this.zw[i], LIMIT_ZONE_H, c, LIMIT_WARN_ALPHA);
    }
  }
  display() {
    if (this.phase !== 'FALL' && this.phase !== 'FADE') return;
    const alpha = this.phase === 'FADE' ? 1 - Math.min(1, this.fade / LIMIT_FADE_TIME) : 1;
    for (let i = 0; i < 2; i++) {
      if (this.zw[i] > 0) drawRect(this.zx[i], this.boxY, this.zw[i], LIMIT_BOX_H, LIMIT_COLOR, LIMIT_ALPHA * alpha);
    }
  }
}

// ======================= 게임 상태 =======================
const STATE_PLAYING = 0, STATE_PAUSED = 1, STATE_COUNTDOWN = 2, STATE_GAMEOVER = 3;

let state, player, bullets, spikes, bombs, explosions, snipes, limits;
let spikeSpawner, bombSpawner, snipeSpawner, limitSpawner;
let bulletTimer, score, scoreTimer, countdown, lastTime;
let deathCause = 0, finalScore = 0, newBest = false;
const keys = { left: false, right: false, up: false };

function resetGame() {
  stats.totalPlays++;
  saveStats();

  player = new Player(SCREEN_W / 2 - PLAYER_W / 2, FLOOR_Y - PLAYER_H);
  bullets = []; spikes = []; bombs = []; explosions = []; snipes = []; limits = [];

  spikeSpawner = new Spawner(SPIKE_ACTIVATE_SCORE, SPIKE_SPAWN_MIN, SPIKE_SPAWN_MAX, SPIKE_WARN_TIME);
  bombSpawner  = new Spawner(BOMB_ACTIVATE_SCORE, BOMB_SPAWN_MIN, BOMB_SPAWN_MAX, 0);
  snipeSpawner = new Spawner(SNIPE_ACTIVATE_SCORE, SNIPE_SPAWN_MIN, SNIPE_SPAWN_MAX, SNIPE_AIM_TIME);
  limitSpawner = new Spawner(LIMIT_ACTIVATE_SCORE, LIMIT_SPAWN_MIN, LIMIT_SPAWN_MAX, LIMIT_WARN_TIME);

  bulletTimer = 0;
  score = INITIAL_SCORE;
  scoreTimer = 0;
  state = STATE_PLAYING;
  lastTime = performance.now();
}

const displayScore = () => Math.round(score);

function updateScore(dt) {
  scoreTimer += dt;
  while (scoreTimer >= SCORE_TICK - TIMER_EPSILON) {
    scoreTimer -= SCORE_TICK;
    score += SCORE_BASE_INCREMENT * Math.pow(1 + SCORE_GROWTH_RATE, Math.floor(score / SCORE_GROWTH_STEP));
  }
}

function endGame(cause) {
  state = STATE_GAMEOVER;
  deathCause = cause;
  finalScore = displayScore();
  newBest = stats.totalPlays > 1 && finalScore > stats.bestScore;
  if (finalScore > stats.bestScore) stats.bestScore = finalScore;
  saveStats();
}

function updateGame(dt) {
  player.update(dt);
  updateScore(dt);

  if (score >= BULLET_ACTIVATE_SCORE) {
    bulletTimer += dt;
    while (bulletTimer >= SPAWN_INTERVAL - TIMER_EPSILON) {
      bulletTimer -= SPAWN_INTERVAL;
      bullets.push(new Bullet(random(0, SCREEN_W - BULLET_W), BULLET_SPAWN_Y));
    }
  }

  if (spikeSpawner.update(score, dt)) spikes.push(new Spike());
  if (bombSpawner.update(score, dt)) bombs.push(new Bomb(random(0, SCREEN_W - BOMB_W), BOMB_SPAWN_Y));
  if (snipeSpawner.update(score, dt)) snipes.push(new Snipe(player.centerX()));
  if (limitSpawner.update(score, dt)) limits.push(new Limitation());

  const hit = new Array(DEATH_MESSAGES.length).fill(false);

  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.update(dt);
    if (b.hits(player)) hit[DEATH_BULLET] = true;
    if (b.y > FLOOR_Y) bullets.splice(i, 1);
  }
  for (let i = spikes.length - 1; i >= 0; i--) {
    const s = spikes[i];
    s.update(dt);
    if (s.hits(player)) hit[DEATH_SPIKE] = true;
    if (s.done()) spikes.splice(i, 1);
  }
  for (let i = bombs.length - 1; i >= 0; i--) {
    const b = bombs[i];
    b.update(dt);
    if (b.hits(player)) hit[DEATH_BOMB] = true;
    if (b.landed()) {
      explosions.push(new Explosion(b.x + b.w / 2, FLOOR_Y - b.h / 2));
      bombs.splice(i, 1);
    }
  }
  for (let i = explosions.length - 1; i >= 0; i--) {
    const e = explosions[i];
    e.update(dt);
    if (e.hits(player)) hit[DEATH_EXPLOSION] = true;
    if (e.done()) explosions.splice(i, 1);
  }
  for (let i = snipes.length - 1; i >= 0; i--) {
    const s = snipes[i];
    s.update(dt, player.centerX());
    if (s.justFired && s.hits(player)) hit[DEATH_SNIPE] = true;
    if (s.done()) snipes.splice(i, 1);
  }
  for (let i = limits.length - 1; i >= 0; i--) {
    const l = limits[i];
    l.update(dt);
    if (l.hits(player)) hit[DEATH_LIMIT] = true;
    if (l.done()) limits.splice(i, 1);
  }

  if (player.wallHit) hit[DEATH_DASH_WALL] = true;
  if (player.idleTime >= IDLE_DEATH_TIME) hit[DEATH_IDLE] = true;

  if (IMMORTALLITY) return;

  for (let c = 0; c < hit.length; c++) {   // 우선순위: 인덱스가 낮은 쪽
    if (hit[c]) { endGame(c); return; }
  }
}

// ======================= 텍스트 (풀링) =======================
let textLayer;
const textPool = [];
let textUsed = 0;

// anchorX/anchorY: 0 = 왼쪽/위, 0.5 = 가운데
function drawText(str, x, y, size, ax, ay) {
  let t = textPool[textUsed];
  if (!t) {
    t = new PIXI.Text({ text: '', style: { fontFamily: FONT_FAMILY, fontSize: size, fill: TEXT_COLOR } });
    textLayer.addChild(t);
    textPool.push(t);
  }
  textUsed++;
  t.visible = true;
  if (t.text !== str) t.text = str;
  if (t.style.fontSize !== size) t.style.fontSize = size;
  t.anchor.set(ax, ay);
  t.position.set(x, y);
}

// ======================= 그리기 =======================
function drawWorld() {
  drawRect(0, FLOOR_Y, SCREEN_W, SCREEN_H - FLOOR_Y, FLOOR_COLOR, FLOOR_ALPHA);
  drawCooldownBar();

  for (const s of spikes) s.displayWarning();
  for (const l of limits) l.displayWarning();
  for (const s of snipes) s.displayAim();

  for (const b of bullets) b.display();
  for (const s of spikes) s.display();
  for (const b of bombs) b.display();
  for (const e of explosions) e.display();
  for (const s of snipes) s.displayFire();
  for (const l of limits) l.display();

  player.displayAfterimages();
  player.display();
}

function drawCooldownBar() {
  const ratio = constrain(player.cooldownTimer / DASH_COOLDOWN, 0, 1);
  const bx = (SCREEN_W - COOLDOWN_BAR_W) / 2;
  const by = FLOOR_Y + COOLDOWN_BAR_OFFSET_Y;
  drawRect(bx, by, COOLDOWN_BAR_W, COOLDOWN_BAR_H, COOLDOWN_BAR_BG, COOLDOWN_BAR_BG_ALPHA);
  drawRect(bx, by, COOLDOWN_BAR_W * ratio, COOLDOWN_BAR_H, COOLDOWN_BAR_COLOR, COOLDOWN_BAR_ALPHA);
}

function drawMenu() {
  drawRect(0, 0, SCREEN_W, SCREEN_H, MENU_OVERLAY_COLOR, MENU_OVERLAY_ALPHA);

  const cx = SCREEN_W / 2, cy = SCREEN_H / 2;
  const C = (s, y, size) => drawText(s, cx, y, size, 0.5, 0.5);

  if (state === STATE_PAUSED) {
    let y = cy + MENU_TOP_OFFSET_Y;
    C(PAUSE_TEXT, y, TITLE_TEXT_SIZE);
    y += MENU_TITLE_GAP;
    C(CURRENT_SCORE_LABEL + displayScore(), y, BODY_TEXT_SIZE);
    y += MENU_LINE_GAP;
    C(BEST_SCORE_LABEL + stats.bestScore, y, BODY_TEXT_SIZE);
    y += MENU_LINE_GAP;
    C(PAUSE_HINT_TEXT, y, HINT_TEXT_SIZE);
    y += MENU_LINE_GAP;
    C(RESTART_TEXT, y, HINT_TEXT_SIZE);
  } else if (state === STATE_COUNTDOWN) {
    C(String(Math.ceil(countdown)), cy, COUNTDOWN_TEXT_SIZE);
  } else if (state === STATE_GAMEOVER) {
    let y = cy + MENU_TOP_OFFSET_Y;
    C(GAME_OVER_TEXT, y, TITLE_TEXT_SIZE);
    y += MENU_TITLE_GAP;
    C(stats.totalPlays + PLAY_COUNT_SUFFIX, y, BODY_TEXT_SIZE);
    y += MENU_LINE_GAP;
    C(FINAL_SCORE_LABEL + finalScore, y, BODY_TEXT_SIZE);
    if (stats.totalPlays > 1) {
      y += MENU_LINE_GAP;
      C(BEST_SCORE_LABEL + stats.bestScore, y, BODY_TEXT_SIZE);
      if (newBest) {
        y += MENU_LINE_GAP;
        C(NEW_BEST_PREFIX + stats.bestScore + NEW_BEST_SUFFIX, y, BODY_TEXT_SIZE);
      }
    }
    y += MENU_LINE_GAP;
    C(DEATH_MESSAGES[deathCause], y, BODY_TEXT_SIZE);
    y += MENU_LINE_GAP;
    C(RESTART_TEXT, y, HINT_TEXT_SIZE);
  }
}

function render() {
  g.clear();
  for (const t of textPool) t.visible = false;
  textUsed = 0;

  drawWorld();
  if (state !== STATE_PLAYING) drawMenu();
  drawText(SCORE_LABEL + displayScore(), SCORE_X, SCORE_Y, SCORE_TEXT_SIZE, 0, 0);
}

// ======================= 입력 =======================
function toggleEscape() {
  if (state === STATE_PLAYING) {
    state = STATE_PAUSED;
  } else if (state === STATE_PAUSED) {
    state = STATE_COUNTDOWN;
    countdown = RESUME_COUNTDOWN;
  } else if (state === STATE_COUNTDOWN) {
    state = STATE_PAUSED;
  }
}

window.addEventListener('keydown', e => {
  if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
  if (e.repeat) return;
  if (e.key === 'Escape') { toggleEscape(); return; }
  if (e.key === 'ArrowLeft') keys.left = true;
  if (e.key === 'ArrowRight') keys.right = true;
  if (e.key === 'ArrowUp') keys.up = true;
  if (e.code === 'ShiftLeft' && state === STATE_PLAYING) player.toggleDash();
  if ((e.key === 'r' || e.key === 'R') && (state === STATE_GAMEOVER || state === STATE_PAUSED)) resetGame();
});

window.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft') keys.left = false;
  if (e.key === 'ArrowRight') keys.right = false;
  if (e.key === 'ArrowUp') keys.up = false;
});

// 창이 포커스를 잃으면 키가 눌린 채로 남지 않게 한다
window.addEventListener('blur', () => { keys.left = keys.right = keys.up = false; });

// ======================= 시작 =======================
(async () => {
  const app = new PIXI.Application();
  await app.init({
    width: SCREEN_W, height: SCREEN_H, background: BG_COLOR,
    antialias: true, resolution: window.devicePixelRatio || 1, autoDensity: true
  });
  document.body.appendChild(app.canvas);

  g = new PIXI.Graphics();
  textLayer = new PIXI.Container();
  app.stage.addChild(g, textLayer);

  loadStats();
  resetGame();

  app.ticker.add(() => {
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, MAX_DT);
    lastTime = now;

    if (state === STATE_PLAYING) {
      updateGame(dt);
    } else if (state === STATE_COUNTDOWN) {
      countdown -= dt;
      if (countdown <= 0) state = STATE_PLAYING;
    }
    render();
  });
})();
