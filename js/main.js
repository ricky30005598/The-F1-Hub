// ─── Mobile nav toggle ───────────────────────────────────────────────────────
const hamburger = document.querySelector('.nav-hamburger');
const navLinks  = document.querySelector('.nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => navLinks.classList.remove('open'))
  );
}

// ─── Highlight active nav link ───────────────────────────────────────────────
(function () {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href').split('/').pop() === page)
      a.classList.add('active');
  });
})();

// ─── Detect which page we're on ──────────────────────────────────────────────
const page = location.pathname.split('/').pop() || 'index.html';
const isIndex = page === 'index.html' || page === '';
const isTeamPage = !isIndex && page.endsWith('.html');

// ─── Path to JSON (relative: works from both root and /teams/) ────────────────
const jsonPath = isIndex ? 'data/teamInfo.json' : '../data/teamInfo.json';

// ─── Fetch & route ───────────────────────────────────────────────────────────
fetch(jsonPath)
  .then(r => r.json())
  .then(data => {
    if (isIndex)     buildHomePage(data.teams);
    if (isTeamPage)  buildTeamPage(data.teams, page.replace('.html', ''));
  })
  .catch(err => console.error('Could not load teamInfo.json:', err));

// ─── HOME PAGE: inject team cards ────────────────────────────────────────────
function buildHomePage(teams) {
  const grid = document.getElementById('teams-grid');
  if (!grid) return;

  const total = teams.length;
  grid.innerHTML = teams.map(t => `
    <a href="teams/${t.id}.html" class="team-card" style="--team-color:${t.color}">
      <div class="tc-top-bar"></div>
      <div class="tc-inner">
        <div class="tc-idx">${t.index} / ${total}</div>
        <div class="tc-dot"></div>
        <div class="tc-name">${t.name}</div>
        <div class="tc-engine">${t.powerUnit}</div>
        <div class="tc-drivers">
          ${t.drivers.map(d => `
            <div class="tc-driver"><span class="dn">${d.number}</span> ${d.name}</div>
          `).join('')}
        </div>
        <div class="tc-arrow">View Team
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </a>
  `).join('');
}

// ─── TEAM PAGE: inject all content ───────────────────────────────────────────
function buildTeamPage(teams, teamId) {
  const team = teams.find(t => t.id === teamId);
  if (!team) return;

  // Apply team color
  document.documentElement.style.setProperty('--team-color', team.color);

  // Hero section
  set('th-deco-num', team.name.slice(0, 2).toUpperCase());
  set('th-name', team.name);
  set('meta-fullname', team.fullName);
  set('meta-base', team.base);
  set('meta-tp', team.teamPrincipal);
  set('meta-pu', team.powerUnit);

  // Document title
  document.title = `${team.name} — The F1 Hub 2026`;

  // Drivers
  const driversEl = document.getElementById('drivers-duo');
  if (driversEl) {
    driversEl.innerHTML = team.drivers.map(d => `
      <div class="d-card">
        <div class="d-bg-num">${d.number}</div>
        <div class="d-name">${d.name}</div>
        <div class="d-nat">${d.nationality}</div>
        <div class="d-badge">No. ${d.number}</div>
      </div>
    `).join('');
  }

  // Tech specs
  const specsEl = document.getElementById('tech-specs');
  if (specsEl) {
    specsEl.innerHTML = [
      ['Chassis',    team.chassis],
      ['Power Unit', team.engine],
      ['Gearbox',    team.gearbox],
      ['Fuel',       team.fuel],
      ['Tyres',      team.tyres],
      ['HQ',         team.hq],
    ].map(([k, v]) => `
      <div class="spec-row">
        <span class="spec-k">${k}</span>
        <span class="spec-v">${v}</span>
      </div>
    `).join('');
  }

  // Stats
  const statsEl = document.getElementById('stats-band');
  if (statsEl) {
    statsEl.innerHTML = team.stats.map(s => `
      <div class="stat-item">
        <div class="stat-num">${s.value}</div>
        <div class="stat-lbl">${s.label}</div>
      </div>
    `).join('');
  }

  // About
  const aboutEl = document.getElementById('about-txt');
  if (aboutEl) {
    aboutEl.innerHTML = team.about.map(p => `<p>${p}</p>`).join('');
  }
}

// ─── Helper ──────────────────────────────────────────────────────────────────
function set(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}
