const AGENTS_URL = './data/agents.json';
const ROLES_URL  = './data/roles.json';
 
let AGENTS    = [];
let ROLES     = [];
let roleCounts = {};
 
async function loadData() {
  try {
    const agentsRes = await fetch(AGENTS_URL);
    AGENTS = await agentsRes.json();
 
    roleCounts = {};
    AGENTS.forEach(a => {
      const roleName = a.role.name;
      roleCounts[roleName] = (roleCounts[roleName] || 0) + 1;
    });
 
    const rolesRes = await fetch(ROLES_URL);
    ROLES = await rolesRes.json();
 
    renderAgents();
    renderRoles();
  } catch (err) {
    console.error('Error loading data:', err);
  }
}
 
loadData();
 
/* Canvas Glitch Achtergrond */

(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');
 
  let W, H;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
 
  const RED   = 'rgba(255,70,85,';
  const CYAN  = 'rgba(0,200,190,';
  const WHITE = 'rgba(236,232,225,';
  const NUM_BLOCKS = 28;
 
  class Block {
    constructor() { this.reset(true); }
 
    reset(initial) {
      this.x   = Math.random() * (W || 1200);
      this.y   = initial ? Math.random() * (H || 800) : (H || 800) + 20;
      this.w   = 4 + Math.random() * 80;
      this.h   = 2 + Math.random() * 18;
 
      if (Math.random() < 0.3) {
        this.w = 3 + Math.random() * 10;
        this.h = 3 + Math.random() * 10;
      }
 
      this.vy = -(0.12 + Math.random() * 0.35);
      this.vx = (Math.random() - 0.5) * 0.18;
 
      this.alpha      = 0.04 + Math.random() * 0.18;
      this.alphaBase  = this.alpha;
      this.alphaSpeed = 0.003 + Math.random() * 0.007;
      this.alphaPhase = Math.random() * Math.PI * 2;
 
      this.glitchTimer     = 60 + Math.random() * 200;
      this.glitchCountdown = this.glitchTimer;
      this.glitching       = false;
      this.glitchDuration  = 0;
      this.glitchOffsetX   = 0;
 
      const r = Math.random();
      this.colorBase = r < 0.70 ? RED : r < 0.90 ? CYAN : WHITE;
 
      this.filled     = Math.random() < 0.45;
      this.scaleX     = 1;
      this.scaleSpeed = 0.008 + Math.random() * 0.012;
      this.scalePhase = Math.random() * Math.PI * 2;
    }
 
    update(t) {
      this.y += this.vy;
      this.x += this.vx;
 
      this.alpha  = this.alphaBase * (0.5 + 0.5 * Math.sin(t * this.alphaSpeed + this.alphaPhase));
      this.scaleX = 0.8 + 0.4 * Math.abs(Math.sin(t * this.scaleSpeed + this.scalePhase));
 
      this.glitchCountdown--;
      if (this.glitchCountdown <= 0 && !this.glitching) {
        this.glitching      = true;
        this.glitchDuration = 3 + Math.floor(Math.random() * 6);
        this.glitchOffsetX  = (Math.random() - 0.5) * 40;
        this.alpha          = Math.min(1, this.alphaBase * 3.5);
      }
      if (this.glitching) {
        this.glitchDuration--;
        if (this.glitchDuration <= 0) {
          this.glitching       = false;
          this.glitchCountdown = this.glitchTimer * (0.7 + Math.random() * 0.6);
          this.glitchOffsetX   = 0;
        }
      }
 
      if (this.y < -40) this.reset(false);
    }
 
    draw(ctx) {
      const dx = this.x + (this.glitching ? this.glitchOffsetX : 0);
      const dy = this.y;
      const dw = this.w * this.scaleX;
      const dh = this.h;
 
      ctx.save();
      const a = Math.max(0, Math.min(1, this.alpha));
      if (this.filled) {
        ctx.fillStyle = this.colorBase + a + ')';
        ctx.fillRect(dx, dy, dw, dh);
      } else {
        ctx.strokeStyle = this.colorBase + a + ')';
        ctx.lineWidth   = 1;
        ctx.strokeRect(dx + 0.5, dy + 0.5, dw - 1, dh - 1);
      }
 
      if (this.glitching) {
        ctx.globalAlpha = a * 0.4;
        if (this.filled) {
          ctx.fillStyle = this.colorBase + (a * 0.4) + ')';
          ctx.fillRect(dx - this.glitchOffsetX * 0.6, dy + 2, dw, dh);
        } else {
          ctx.strokeStyle = this.colorBase + (a * 0.4) + ')';
          ctx.strokeRect(dx - this.glitchOffsetX * 0.6 + 0.5, dy + 2 + 0.5, dw - 1, dh - 1);
        }
      }
      ctx.restore();
    }
  }
 
  class Scanline {
    constructor() { this.reset(true); }
    reset(initial) {
      this.x     = Math.random() * (W || 1200);
      this.y     = initial ? Math.random() * (H || 800) : -4;
      this.w     = 30 + Math.random() * 200;
      this.vy    = 0.2 + Math.random() * 0.5;
      this.alpha = 0.03 + Math.random() * 0.07;
    }
    update() {
      this.y += this.vy;
      if (this.y > (H || 800) + 4) this.reset(false);
    }
    draw(ctx) {
      ctx.save();
      ctx.fillStyle = RED + this.alpha + ')';
      ctx.fillRect(this.x, this.y, this.w, 1);
      ctx.restore();
    }
  }
 
  const blocks    = Array.from({ length: NUM_BLOCKS }, () => new Block());
  const scanlines = Array.from({ length: 12 }, () => new Scanline());
 
  let t = 0;
  function loop() {
    ctx.clearRect(0, 0, W, H);
 
    ctx.save();
    ctx.strokeStyle = 'rgba(255,70,85,0.025)';
    ctx.lineWidth   = 0.5;
    const step = 60;
    for (let i = -H; i < W + H; i += step) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + H, H);
      ctx.stroke();
    }
    ctx.restore();
 
    scanlines.forEach(s => { s.update(); s.draw(ctx); });
    blocks.forEach(b   => { b.update(t); b.draw(ctx); });
 
    t++;
    requestAnimationFrame(loop);
  }
  loop();
})();
 
/* Main */

let currentSort       = { key: 'name', dir: 1 };
let currentRoleFilter = 'all';
let currentSearch     = '';

const roleClass   = r => ({ Duelist: 'role-duelist', Controller: 'role-controller', Sentinel: 'role-sentinel', Initiator: 'role-initiator' }[r] ?? 'role-initiator');
const roleColor   = { Duelist: 'var(--duelist)', Controller: 'var(--controller)', Sentinel: 'var(--sentinel)', Initiator: 'var(--initiator)' };

/* Templates */

function buildAbilityTags(abilities, extraClass = '') {
  return abilities.map(ab => {
    const span = document.createElement('span');
    span.className = `ability-tag${extraClass ? ' ' + extraClass : ''}`;
    span.textContent = ab;
    return span.outerHTML;
  }).join('');
}

function buildAgentRow(a, index, animationIndex) {
  return `
    <div class="agent-row ${roleClass(a.role.name)}" data-agent-index="${index}" style="animation-delay:${animationIndex * 0.04}s">
      <div class="agent-info">
        <div class="agent-avatar"><img src="${a.imageUrl}" alt="${a.name}" class="agent-avatar-img"></div>
        <div class="agent-name-wrap">
          <div class="agent-name">${a.name}</div>
          <div class="agent-role">${a.role.name}</div>
        </div>
      </div>
      <div class="releaseDate">${a.releaseDate}</div>
      <div class="abilities-cell">${buildAbilityTags(a.abilities)}</div>
      <div><span class="rarity-badge">${a.difficulty}</span></div>
      <div><span class="active-dot ${a.beginnerFriendly ? 'on' : 'off'}"></span></div>
      <div><a class="action-link" data-agent-index="${index}">View</a></div>
    </div>`;
}

function buildAgentCard(a, index) {
  return `
    <div class="agent-card ${roleClass(a.role.name)}" data-agent-index="${index}" style="animation-delay:${index * 0.03}s">
      <div class="agent-card-image">
        <div class="agent-card-image-placeholder"><img src="${a.fullImageUrl}" alt="${a.name}" class="agent-avatar-img"></div>
        <div class="role-stripe" style="background:${roleColor[a.role.name]}"></div>
        <div class="rarity-corner">${a.role.name}</div>
      </div>
      <div class="agent-card-body">
        <div class="agent-card-name">${a.name}</div>
        <div class="agent-card-desc">${a.description}</div>
        <div class="agent-card-stats">
          <div class="stat-row"><span class="stat-label">Agent Number</span><span class="stat-value">${a.agentNumber}</span></div>
          <div class="stat-row"><span class="stat-label">Origin</span><span class="stat-value">${a.origin}</span></div>
          <div class="stat-row"><span class="stat-label">Release Date</span><span class="stat-value">${a.releaseDate}</span></div>
          <div class="stat-row"><span class="stat-label">Difficulty</span><span class="stat-value">${a.difficulty}</span></div>
          <div class="stat-row"><span class="stat-label">Beginner Friendly</span><span class="stat-value">${a.beginnerFriendly ? 'Yes' : 'No'}</span></div>
        </div>
      </div>
    </div>`;
}

function buildRoleRow(g, i) {
  return `
    <div class="agent-row" data-role-name="${g.name}" style="grid-template-columns: 0.8fr 0.4fr 1fr 1.3fr; animation-delay:${i * 0.08}s">
      <div class="agent-info">
        <div class="agent-avatar" style="font-size:24px; display:flex; align-items:center; justify-content:center; border-color:${roleColor[g.role]};">
          <span><img src="${g.iconUrl}" alt="${g.name}"></span>
        </div>
        <div class="agent-name-wrap">
          <div class="agent-name" style="color:${roleColor[g.name]}">${g.name}</div>
          <div class="agent-role">${roleCounts[g.name]} agents</div>
        </div>
      </div>
      <div class="playstyle" style="color:var(--white)">${g.playstyle}</div>
      <div class="description">${g.description}</div>
      <div class="responsability" style="font-style:italic;">${g.primaryResponsibility}</div>
    </div>`;
}

function buildPopupInner(a) {
  return `
    <div class="popup-image" style="background:linear-gradient(135deg, var(--dark-mid), var(--dark));border-bottom:2px solid ${roleColor[a.role.name]};">
      <span style="font-size:100px;filter:drop-shadow(0 0 24px ${roleColor[a.role.name]})">
        <img src="${a.fullImageUrl}" alt="${a.name}" class="agent-avatar-img">
      </span>
    </div>
    <div class="popup-body">
      <div class="popup-name">${a.name}</div>
      <div class="popup-desc">${a.description}</div>
      <div class="popup-stats">
        <div class="popup-stat"><div class="popup-stat-label">Agent Number</div><div class="popup-stat-value">${a.agentNumber}</div></div>
        <div class="popup-stat"><div class="popup-stat-label">Origin</div><div class="popup-stat-value">${a.origin}</div></div>
        <div class="popup-stat"><div class="popup-stat-label">Release Date</div><div class="popup-stat-value" style="font-size:14px;letter-spacing:1px;">${a.releaseDate}</div></div>
        <div class="popup-stat"><div class="popup-stat-label">Race</div><div class="popup-stat-value">${a.race}</div></div>
        <div class="popup-stat"><div class="popup-stat-label">Difficulty</div><div class="popup-stat-value">${a.difficulty}</div></div>
        <div class="popup-stat"><div class="popup-stat-label">Beginner Friendly</div><div class="popup-stat-value">${a.beginnerFriendly ? 'Yes' : 'No'}</div></div>
        <div class="popup-stat"><div class="popup-stat-label">Playstyle</div><div class="popup-stat-value">${a.role.playstyle}</div></div>
        <div class="popup-stat">
          <div class="popup-stat-label">Role</div>
          <div class="popup-stat-value">
            <a class="role-popup-link" data-role-name="${a.role.name}" style="color:${roleColor[a.role.name]};cursor:pointer;text-decoration:underline;text-underline-offset:4px;">${a.role.name}</a>
          </div>
        </div>
      </div>
      <div class="popup-abilities">
        <div class="popup-abilities-title">SPECIAL ABILITIES</div>
        <div class="popup-ability-list">${buildAbilityTags(a.abilities, roleClass(a.role.name))}</div>
      </div>
    </div>`;
}

function buildRolePopupInner(role) {
  const agentList = AGENTS.filter(a => a.role.name === role.name);
  const color = roleColor[role.name];

  return `
    <div class="popup-image" style="background:linear-gradient(135deg, var(--dark-mid), var(--dark));border-bottom:2px solid ${color};display:flex;align-items:center;justify-content:center;height:200px;">
      <img src="${role.iconUrl}" alt="${role.name}" style="width:80px;height:80px;filter:drop-shadow(0 0 20px ${color});">
    </div>
    <div class="popup-body">
      <div class="popup-name">${role.name}</div>
      <div class="popup-desc">${role.description}</div>
      <div class="popup-stats">
        <div class="popup-stat"><div class="popup-stat-label">Playstyle</div><div class="popup-stat-value" style="color:${color}">${role.playstyle}</div></div>
        <div class="popup-stat"><div class="popup-stat-label">Agent Count</div><div class="popup-stat-value">${roleCounts[role.name]}</div></div>
        <div class="popup-stat" style="grid-column:1/-1"><div class="popup-stat-label">Primary Responsibility</div><div class="popup-stat-value" style="font-size:15px;letter-spacing:1px;font-style:italic;">${role.primaryResponsibility}</div></div>
      </div>
      <div class="popup-abilities">
        <div class="popup-abilities-title" style="color:${color}">AGENTS IN THIS ROLE</div>
        <div class="popup-ability-list">
          ${agentList.map(a => `
            <span class="ability-tag ${roleClass(role.name)}" data-agent-index="${AGENTS.indexOf(a)}" style="cursor:pointer;" title="View ${a.name}">
              ${a.name}
            </span>
          `).join('')}
        </div>
      </div>
    </div>`;
}

/* Render functies */

function renderAgents() {
  let agents = AGENTS.slice();

  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    agents = agents.filter(a => a.name.toLowerCase().includes(q));
  }

  if (currentRoleFilter !== 'all') {
    agents = agents.filter(a => a.role.name === currentRoleFilter);
  }

  agents.sort((a, b) => {
    let va = currentSort.key === 'releaseDate' ? new Date(a.releaseDate) : a[currentSort.key];
    let vb = currentSort.key === 'releaseDate' ? new Date(b.releaseDate) : b[currentSort.key];
    return (va < vb ? -1 : va > vb ? 1 : 0) * currentSort.dir;
  });

  document.getElementById('agents-list').innerHTML =
    agents.map((a, i) => buildAgentRow(a, AGENTS.indexOf(a), i)).join('');
}

function renderAgentCards() {
  document.getElementById('agents-grid').innerHTML =
    AGENTS.map((a, i) => buildAgentCard(a, i)).join('');
}

function renderRoles() {
  document.getElementById('roles-list').innerHTML =
    ROLES.map((g, i) => buildRoleRow(g, i)).join('');
}

/* Agent Popup */

const agentPopup    = document.getElementById('agent-popup');
const popupInner    = document.getElementById('popup-inner');
const popupCloseBtn = document.querySelector('.popup-close');

function openPopup(index) {
  popupInner.innerHTML = buildPopupInner(AGENTS[index]);
  agentPopup.classList.add('open');
}

function closePopup() {
  agentPopup.classList.remove('open');
}

popupCloseBtn.addEventListener('click', closePopup);

agentPopup.addEventListener('click', e => {
  if (e.target === agentPopup) closePopup();
});

/* Role Popup */

const rolePopup      = document.getElementById('role-popup');
const rolePopupInner = document.getElementById('role-popup-inner');
const roleCloseBtn   = document.querySelector('.role-popup-close');

function openRolePopup(roleName) {
  const role = ROLES.find(r => r.name === roleName);
  if (!role) return;
  rolePopupInner.innerHTML = buildRolePopupInner(role);
  rolePopup.classList.add('open');

  rolePopupInner.querySelectorAll('.ability-tag[data-agent-index]').forEach(tag => {
    tag.addEventListener('click', () => {
      closeRolePopup();
      openPopup(Number(tag.dataset.agentIndex));
    });
  });
}

function closeRolePopup() {
  rolePopup.classList.remove('open');
}

roleCloseBtn.addEventListener('click', closeRolePopup);

rolePopup.addEventListener('click', e => {
  if (e.target === rolePopup) closeRolePopup();
});

agentPopup.addEventListener('click', e => {
  const link = e.target.closest('.role-popup-link');
  if (link) {
    closePopup();
    openRolePopup(link.dataset.roleName);
  }
});

/* Eventlistener Agent Rows */

document.getElementById('agents-list').addEventListener('click', e => {
  const link = e.target.closest('.action-link');
  const row  = e.target.closest('.agent-row');

  if (link) {
    e.stopPropagation();
    openPopup(Number(link.dataset.agentIndex));
    return;
  }
  if (row) {
    openPopup(Number(row.dataset.agentIndex));
  }
});

/* Eventlistener Agent Cards */

document.getElementById('agents-grid').addEventListener('click', e => {
  const card = e.target.closest('.agent-card');
  if (card) openPopup(Number(card.dataset.agentIndex));
});

/* Eventlistener Role Rows */

document.getElementById('roles-list').addEventListener('click', e => {
  const row = e.target.closest('.agent-row[data-role-name]');
  if (row) openRolePopup(row.dataset.roleName);
});

/* Navigatie */

function navigation(name, btn) {
  document.querySelectorAll('.page-section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  btn.classList.add('active');

  if (name === 'agents') renderAgentCards();
  if (name === 'roles')  renderRoles();
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => navigation(item.dataset.view, item));
});

/* Zoeken */

document.getElementById('search-input').addEventListener('input', e => {
  currentSearch = e.target.value;
  renderAgents();
});

/* Filteren */

document.querySelector('.filter-bar').addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;

  currentRoleFilter = btn.dataset.role;
  document.querySelectorAll('.filter-btn').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');
  renderAgents();
});

/* Sorteren */

function sortBy(key) {
  currentSort.dir = currentSort.key === key ? currentSort.dir * -1 : 1;
  currentSort.key = key;

  document.querySelectorAll('.sortable').forEach(el => {
    el.classList.remove('sorted');
    el.querySelector('.sort-arrow').textContent = '▲';
  });

  const activeCol = document.querySelector(`[data-sort="${key}"]`);
  activeCol.classList.add('sorted');
  activeCol.querySelector('.sort-arrow').textContent = currentSort.dir === 1 ? '▲' : '▼';

  renderAgents();
}

document.querySelector('.table-header').addEventListener('click', e => {
  const col = e.target.closest('.sortable');
  if (col) sortBy(col.dataset.sort);
});