// ─── Detect which page we're on ──────────────────────────────────────────────
const page     = location.pathname.split('/').pop() || 'index.html';
const isIndex  = page === 'index.html' || page === '';
const isTeam   = !isIndex && page.endsWith('.html');
const jsonPath = isIndex ? 'data/teamInfo.json' : '../data/teamInfo.json';
const teamRoot = isIndex ? 'teams/' : '';

// ─── Fetch JSON then route ────────────────────────────────────────────────────
fetch(jsonPath)
  .then(r => r.json())
  .then(data => {
    buildNav(data);
    if (isIndex) buildHomePage(data);
    if (isTeam)  buildTeamPage(data, page.replace('.html', ''));
  })
  .catch(err => console.error('Could not load teamInfo.json:', err));

// ─── NAV: built dynamically for every page ───────────────────────────────────
function buildNav(data) {
  const ul = document.querySelector('.nav-links');
  if (!ul) return;

  const homeHref  = isIndex ? 'index.html'   : '../index.html';
  const teamHref  = id => isIndex ? `teams/${id}.html` : `${id}.html`;

  ul.innerHTML = `<li><a href="${homeHref}">Home</a></li>` +
    data.teams.map(t =>
      `<li><a href="${teamHref(t.id)}">${t.name}</a></li>`
    ).join('');

  // Highlight active link
  const current = page;
  ul.querySelectorAll('a').forEach(a => {
    if (a.getAttribute('href').split('/').pop() === current)
      a.classList.add('active');
  });

  // Mobile toggle
  const hamburger = document.querySelector('.nav-hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', () => ul.classList.toggle('open'));
    ul.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => ul.classList.remove('open'))
    );
  }
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function buildHomePage(data) {
  const s = data.season;
  const teams = data.teams;
  const total = teams.length;
  const drivers = teams.reduce((n, t) => n + t.drivers.length, 0);

  // Season badge
  setTxt('season-badge', `${s.year} SEASON`);

  // Hero text
  setTxt('hero-subtitle', `All ${total} Teams · ${drivers} Drivers · ${s.tagline}`);
  setTxt('hero-desc', s.description);

  // Page title & footer
  document.title = `The F1 Hub — ${s.year} Season`;
  updateFooter(s.year);

  // Section title
  setTxt('section-year', s.year);

  // Team grid
  const grid = document.getElementById('teams-grid');
  if (grid) {
    grid.innerHTML = teams.map(t => `
      <a href="teams/${t.id}.html" class="team-card" style="--team-color:${t.color}">
        <div class="tc-top-bar"></div>
        <div class="tc-inner">
          <div class="tc-idx">${t.index} / ${total}</div>
          <div class="tc-dot"></div>
          <img class="tc-logo" src="images/${t.logo}" alt="${t.name} logo" onerror="this.style.display='none'" />
          <div class="tc-name">${t.name}</div>
          <div class="tc-engine">${t.powerUnit}</div>
          <div class="tc-drivers">
            ${t.drivers.map(d =>
              `<div class="tc-driver"><span class="dn">${d.number}</span> ${d.name}</div>`
            ).join('')}
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
}

// ─── TEAM PAGE ────────────────────────────────────────────────────────────────
function buildTeamPage(data, teamId) {
  const team = data.teams.find(t => t.id === teamId);
  if (!team) return;
  const year = data.season.year;

  // Team color
  document.documentElement.style.setProperty('--team-color', team.color);

  // Page title & eyebrow
  document.title = `${team.name} — The F1 Hub ${year}`;
  updateFooter(year);
  setTxt('th-eyebrow', `${year} Formula 1 Season`);

  // Hero
  setTxt('th-deco-num', team.name.slice(0, 2).toUpperCase());
  setTxt('th-name', team.name);
  const logoEl = document.getElementById('th-logo');
  if (logoEl) {
    logoEl.src = `../images/${team.logo}`;
    logoEl.alt = `${team.name} logo`;
    logoEl.onerror = () => logoEl.style.display = 'none';
  }
  setTxt('meta-fullname', team.fullName);
  setTxt('meta-base', team.base);
  setTxt('meta-tp', team.teamPrincipal);
  setTxt('meta-pu', team.powerUnit);

  // Drivers section title
  setTxt('drivers-title', `Drivers · ${year}`);

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
function setTxt(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

// ─── Footer: update year dynamically ─────────────────────────────────────────
// (called after fetch resolves, year injected via buildHomePage/buildTeamPage)
function updateFooter(year) {
  const el = document.getElementById('footer-note');
  if (el) el.innerHTML = `${year} Formula 1 Season · Fan Reference Guide · Not affiliated with Formula 1 or the FIA`;
}
