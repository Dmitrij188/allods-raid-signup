const scriptURL = 'https://script.google.com/macros/s/AKfycbwhc5nt8Gj5iYaotBpBsNeD0StVEkCbRW97uthV2JUEYMdPG4mxjeMwPwf44-Tk9imd/exec';

const musicBtn = document.getElementById("musicBtn");
const musicTracks = [
  new Audio("23 - IL1_TEST.mp3"),
  new Audio("27 - MenuAmbient.mp3"),
  new Audio("5fc0f02753de4.mp3"),
  new Audio("5fc0f2c121559.mp3"),
  new Audio("5fc0f2c121d42.mp3"),
  new Audio("5fc0f0274957e.mp3"),
  new Audio("5fc0f0274d775.mp3"),
  new Audio("5fc0f3990fad5.mp3")
];
let currentTrack = 0;
musicTracks.forEach(track => {
  track.volume = 0.5;
  track.loop = false;
});
musicTracks.forEach((track, index) => {
  track.addEventListener("ended", () => {
    currentTrack = (index + 1) % musicTracks.length;
    musicTracks[currentTrack].play();
  });
});
musicTracks[0].play();

function toggleMusic() {
  if (musicTracks[currentTrack].paused) {
    musicTracks[currentTrack].play();
    musicBtn.textContent = "Выключить музыку";
  } else {
    musicTracks.forEach(track => track.pause());
    musicBtn.textContent = "Включить музыку";
  }
}

function changeTrack(step) {
  const wasPaused = musicTracks[currentTrack].paused;
  musicTracks[currentTrack].pause();
  musicTracks[currentTrack].currentTime = 0;
  currentTrack = (currentTrack + step + musicTracks.length) % musicTracks.length;
  if (!wasPaused) {
    musicTracks[currentTrack].play();
  }
}

function nextTrack() {
  changeTrack(1);
}

function prevTrack() {
  changeTrack(-1);
}

const MAX_RAIDS = 4;
const MAX_PLAYERS = 12;
let raids = [];
let squadList = [];
let authorizedRaids = {};

const classes = ["Жрец", "Воин", "Паладин", "Лучник", "Мистик", "Друид", "Демонолог", "Инженер", "Некромант", "Маг", "Бард"];
const roles = ["ДД", "Хил", "Сап", "Танк"];
const servers = [
  { id: 1, name: "Нить судьбы" },
  { id: 2, name: "Молодая Гвардия" },
  { id: 3, name: "Наследие Богов" },
  { id: 4, name: "Вечный Зов" },
  { id: 5, name: "Звезда Удачи" }
];

const classIcons = {
  "Жрец": "jrec.png",
  "Воин": "AaXElGEQ.png",
  "Паладин": "paladin.png",
  "Лучник": "luchnik.png",
  "Мистик": "mistik.png",
  "Друид": "druid.png",
  "Демонолог": "demon.png",
  "Инженер": "inginer.png",
  "Некромант": "nekromant.png",
  "Маг": "mag.png",
  "Бард": "bard.png"
};

const roleIcons = {
  "ДД": "atack.png",
  "Хил": "heal.png",
  "Сап": "support.png",
  "Танк": "tank.png"
};

const allowedRolesByClass = {
  "Жрец": ["Хил", "ДД"],
  "Друид": ["Хил", "ДД"],
  "Некромант": ["Хил", "ДД"],
  "Инженер": ["Сап", "ДД"],
  "Бард": ["Сап", "ДД"],
  "Паладин": ["Танк", "ДД"],
  "Демонолог": ["Танк", "ДД"],
  "Воин": ["Танк", "ДД"],
  "Лучник": ["ДД", "Танк"],
  "Мистик": ["ДД"],
  "Маг": ["ДД"]
};

async function fetchCharacterInfo(name, serverId) {
  try {
    let searchRes;
    try {
      searchRes = await fetch('https://api.allodswiki.ru/api/v1/armory/avatars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filter: { name, server: serverId } })
      });
    } catch (e) {
      console.error('search api', e);
      throw new Error('network');
    }
    if (!searchRes.ok) {
      console.error('search api', searchRes.status, searchRes.statusText);
      return { error: 'network' };
    }
    const list = (await searchRes.json()).data || [];
    if (!Array.isArray(list) || list.length !== 1) {
      return { error: 'not_found' };
    }
    const charId = list[0].id;
    let charRes;
    try {
      charRes = await fetch(`https://api.allodswiki.ru/api/v1/armory/avatars/${charId}`);
    } catch (e) {
      console.error('character api', e);
      throw new Error('network');
    }
    if (!charRes.ok) {
      console.error('character api', charRes.status, charRes.statusText);
      return { error: 'network' };
    }
    const data = (await charRes.json()).data;

    return {
      level: data.level,
      gearScore: data.gear_score,
      faction: data.faction,
      guild: data.guild
    };
  } catch (e) {
    console.error('fetchCharacterInfo', e);
    return { error: 'network' };
  }
}

function buildRoleOptions(arr, includeEmpty) {
  const empty = includeEmpty ? '<option value="">—</option>' : '';
  return empty + arr.map(r => `<option>${r}</option>`).join('');
}

function updateRoleOptions(id) {
  const className = document.getElementById(`class-${id}`).value;
  const allowed = allowedRolesByClass[className] || ["ДД"];
  const roleSel = document.getElementById(`role-${id}`);
  const role2Sel = document.getElementById(`role2-${id}`);
  const role3Sel = document.getElementById(`role3-${id}`);

  const prevRole = roleSel.value;
  const prevRole2 = role2Sel.value;
  const prevRole3 = role3Sel.value;

  roleSel.innerHTML = buildRoleOptions(allowed, false);
  role2Sel.innerHTML = buildRoleOptions(roles, true);
  role3Sel.innerHTML = buildRoleOptions(roles, true);

  if (prevRole && allowed.includes(prevRole)) {
    roleSel.value = prevRole;
  }
  if (prevRole2) {
    role2Sel.value = prevRole2;
  }
  if (prevRole3) {
    role3Sel.value = prevRole3;
  }
}

function roleOption(role, label) {
  const icon = roleIcons[role]
    ? `<img src="${roleIcons[role]}" alt="${role}" class="role-icon">`
    : "";
  return `<span class='role-label'>${icon}${label}</span>`;
}

function renderRoster(raid) {
  if (!raid.roster.length) return '<p>Пока никто не записался.</p>';
  const rows = raid.roster.map(p => {
    const icon = classIcons[p.className]
      ? `<img class='class-icon' src="${classIcons[p.className]}" alt="${p.className}">`
      : '';
    const primary = roleOption(p.role, p.role);
    const secondary = p.role2 ? roleOption(p.role2, p.role2) : '-';
    const tertiary = p.role3 ? roleOption(p.role3, p.role3) : '-';
    return `
      <tr>
        <td>${icon}${p.name}</td>
        <td>${p.className}</td>
        <td class='primary-role'>${primary}</td>
        <td>${secondary}</td>
        <td>${tertiary}</td>
        <td>${p.level ?? '-'}</td>
        <td>${p.gearScore ?? '-'}</td>
        <td>${p.guild || '-'}</td>
        <td>${p.faction || '-'}</td>
      </tr>`;
  }).join('');

  return `
    <table class='roster-table'>
      <thead>
        <tr>
          <th>Имя</th>
          <th>Класс</th>
          <th class='primary-role'>Осн. роль</th>
          <th>Доп. роль</th>
          <th>Крайний случай</th>
          <th>Уровень</th>
          <th>GearScore</th>
          <th>Гильдия</th>
          <th>Фракция</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>`;
}

function renderRaids() {
  const raidsDiv = document.getElementById("raids");
  raidsDiv.innerHTML = "";
  const factionName = sel.faction === 'league' ? 'Лига' : 'Империя';
  raids.filter(r =>
    r.server == sel.server &&
    r.dungeon == sel.dungeon &&
    r.faction == factionName
  ).forEach((raid, index) => {
    const raidEl = document.createElement("div");
    raidEl.className = "raid-container";
    raidEl.dataset.index = index;
    const isClosed = String(raid.id).length > 2;
    const typeLabel = isClosed ? 'Закрытый' : 'Открытый';
    const headerId = index + 1;
    raidEl.innerHTML = `
      <h2>Отряд ${headerId} (${typeLabel})</h2>
      <button class="btn join-btn" onclick="showJoinForm(${index})">Вступить</button>
      <div class="code-section" id="code-${index}" style="display:none">
        <label>Код: <input type="password" id="code-input-${index}"></label>
        <button class="btn" onclick="verifyCode(${index})">Продолжить</button>
      </div>
      <div class="form-section" id="form-${index}" style="display:none">
        <label>Имя: <input type="text" id="name-${raid.id}" maxlength="16" minlength="3" pattern="[А-Яа-яЁё]{3,16}"></label>
        <label>Класс:
          <select id="class-${raid.id}" onchange="updateRoleOptions(${raid.id})">
            ${classes.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </label>
        <label class="role-label">${("Основная роль:")}
          <select id="role-${raid.id}">
            ${roles.map(r => `<option>${r}</option>`).join('')}
          </select>
        </label>
        <label>Доп. роль:
          <select id="role2-${raid.id}">
            <option value="">—</option>
            ${roles.map(r => `<option>${r}</option>`).join('')}
          </select>
        </label>
        <label>Доп. роль (крайний случай):
          <select id="role3-${raid.id}">
            <option value="">—</option>
            ${roles.map(r => `<option>${r}</option>`).join('')}
          </select>
        </label>
        <label>Сервер:
          <select id="server-${raid.id}">
            ${servers.map(s => `<option value="${s.id}">${s.name} (${s.id})</option>`).join('')}
          </select>
        </label>
        <button class="btn" onclick="joinRaid(${index})">Записаться</button>
      </div>
      <div class="raid-roster" id="roster-${raid.id}">
        <h3>Состав:</h3>
        ${renderRoster(raid)}
      </div>
    `;
    raidsDiv.appendChild(raidEl);
    updateRoleOptions(raid.id);
    const serverSelect = document.getElementById(`server-${raid.id}`);
    if (serverSelect) serverSelect.value = raid.server;
  });
}

function showJoinForm(index) {
  const raid = raids[index];
  if (!raid) return;
  const isClosed = String(raid.id).length > 2;
  const codeDiv = document.getElementById(`code-${index}`);
  const form = document.getElementById(`form-${index}`);
  if (isClosed && !authorizedRaids[index]) {
    if (codeDiv) codeDiv.style.display = codeDiv.style.display === 'none' ? 'block' : 'none';
  } else if (form) {
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  }
}

function verifyCode(index) {
  const raid = raids[index];
  if (!raid) return;
  const input = document.getElementById(`code-input-${index}`);
  if (!input) return;
  if (input.value.trim() === String(raid.id)) {
    authorizedRaids[index] = true;
    document.getElementById(`code-${index}`).style.display = 'none';
    const form = document.getElementById(`form-${index}`);
    if (form) form.style.display = 'block';
  } else {
    alert('Неверный код');
  }
}

async function joinRaid(index) {
  const raid = raids[index];
  if (!raid) return alert('Рейд не найден!');
  const id = raid.id;
  const isClosed = String(id).length > 2;
  if (isClosed && !authorizedRaids[index]) {
    return alert('Сначала введите код отряда.');
  }
  const name = document.getElementById(`name-${id}`).value.trim();
  const className = document.getElementById(`class-${id}`).value;
  const role = document.getElementById(`role-${id}`).value;
  const role2 = document.getElementById(`role2-${id}`).value;
  const role3 = document.getElementById(`role3-${id}`).value;
  const server = document.getElementById(`server-${id}`).value;

  // Mandatory fields: name, className, role and server

  if (!/^[А-Яа-яЁё]{3,16}$/.test(name)) {
    return alert("Имя должно содержать от 3 до 16 символов, кириллицей, без пробелов.");
  }

  if (!className) {
    return alert('Выберите класс.');
  }

  if (!role) {
    return alert('Укажите основную роль.');
  }

  if (!server) {
    return alert('Выберите сервер.');
  }

  const currentRaid = raid;

  // Disallow using the same character name across all raids
  const nameTaken = raids.some(r =>
    r.roster.some(p => p.name.toLowerCase() === name.toLowerCase())
  );
  if (nameTaken) {
    return alert('Игрок с таким именем уже записан.');
  }

  if (currentRaid.roster.length >= MAX_PLAYERS) {
    return alert("Этот рейд уже заполнен (12 игроков).");
  }

  const duplicate = currentRaid.roster.some(p => {
    const sameName = p.name.toLowerCase() === name.toLowerCase();
    if (!sameName) return false;
    // if server information is available, compare it as well
    if ('server' in p) {
      return String(p.server) === String(server);
    }
    return true;
  });
  if (duplicate) {
    return alert("Вы уже записаны в этот рейд.");
  }

  const allowed = allowedRolesByClass[className] || ["ДД"];
  if (!allowed.includes(role)) {
    return alert("Этот класс не может выполнять выбранную роль.");
  }

  const charInfo = await fetchCharacterInfo(name, server);
  if (!charInfo || charInfo.error) {
    let msg;
    if (charInfo && charInfo.error === 'network') {
      msg = 'Ошибка связи с сервером. Попробуйте позже.';
    } else if (charInfo && charInfo.error === 'not_found') {
      msg = 'Персонаж не найден на выбранном сервере';
    } else {
      msg = 'Персонаж не найден или найдено несколько результатов.';
    }
    return alert(msg);
  }

  const payload = {
    name,
    className,
    role,
    role2,
    role3,
    raidId: id,
    level: charInfo.level,
    gearScore: charInfo.gearScore,
    guild: charInfo.guild,
    faction: charInfo.faction,
    server,
    dungeon: sel.dungeon
  };

  try {
    const res = await fetch(scriptURL, {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(payload)
    });

    console.log('Signup status:', res.status, res.statusText);
    if (!res.ok) {
      const text = await res.text();
      console.error('Save failed', res.status, text);
      alert('Не удалось сохранить данные в Google Sheets.');
      return;
    }

    const data = await res.json();
    console.log('Signup response:', data);
    if (!data || data.status !== 'ok') {
      console.error('Save failed', res.status, JSON.stringify(data));
      alert('Не удалось сохранить данные в Google Sheets.');
      return;
    }

    console.log('Data saved successfully');
    console.log('Saved', payload);
  } catch (e) {
    console.error('Signup failed', e);
    alert('Не удалось сохранить данные в Google Sheets.');
    return;
  }

  await loadRoster();
}

async function loadRoster() {
  let data;
  try {
    const res = await fetch(scriptURL, { mode: 'cors' });
    if (!res.ok) {
      console.error('loadRoster', res.status, res.statusText);
      alert('Не удалось загрузить список рейда.');
      return;
    }
    const result = await res.json();
    if (result && result.status === 'ok' && Array.isArray(result.data)) {
      data = result.data;
    } else {
      console.error('loadRoster', 'bad response', result);
      alert('Не удалось загрузить список рейда.');
      return;
    }
  } catch (e) {
    console.error('loadRoster', e);
    alert('Не удалось загрузить список рейда.');
    return;
  }

  const factionName = sel.faction === 'league' ? 'Лига' : 'Империя';
  const filtered = data.filter(row =>
    row[10] == sel.server &&
    row[9] == factionName &&
    row[11] == sel.dungeon
  );

  const grouped = {};
  filtered.forEach(row => {
    const [name, className, role, role2, role3, raidId,
      level, gearScore, guild, faction, server, dungeon] = row;
    if (!grouped[raidId]) {
      grouped[raidId] = { server, faction, dungeon, players: [] };
    }
    grouped[raidId].players.push({
      name, className, role, role2, role3,
      level, gearScore, guild, faction, server, dungeon
    });
  });

  raids = Object.keys(grouped).map(id => ({
    id,
    server: grouped[id].server,
    faction: grouped[id].faction,
    dungeon: grouped[id].dungeon,
    roster: grouped[id].players
  }));
  renderRaids();
}

function createRaid() {
  if (raids.length >= MAX_RAIDS) return alert("Максимум 4 рейда");
  const closed = confirm('Создать закрытый отряд?');
  let raidId;
  if (closed) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
    raidId = '';
    for (let i=0;i<8;i++) raidId += chars[Math.floor(Math.random()*chars.length)];
    alert('Код закрытого отряда: ' + raidId);
  } else {
    // Determine the next available raid id based on the current maximum.
    const maxId = raids.reduce((m, r) => {
      const idNum = parseInt(r.id, 10);
      return isNaN(idNum) ? m : Math.max(m, idNum);
    }, -1);
    raidId = maxId + 1;

    // Avoid id clashes if non-sequential ids are loaded from the server.
    if (raids.some(r => String(r.id) === String(raidId))) return alert('Ошибка создания рейда');
  }

  const raid = {
    id: raidId,
    roster: [],
    server: sel.server,
    dungeon: sel.dungeon,
    faction: sel.faction === 'league' ? 'Лига' : 'Империя'
  };
  raids.push(raid);
  renderRaids();
}

loadRoster();

const progress = [document.getElementById('p1'), document.getElementById('p2'), document.getElementById('p3'), document.getElementById('p4')];
let sel = { server: null, dungeon: null, faction: null };
function showStep(n) {
  ['step1','step2','step3','step4'].forEach((id,i) => {
    document.getElementById(id).style.display = i === n-1 ? 'block' : 'none';
    progress[i].classList.toggle('active', i <= n-1);
  });
}
function onSelect(step, id) {
  if (step === 1) {
    sel.server = id;
    showStep(2);
  } else if (step === 2) {
    sel.dungeon = id;
    showStep(3);
  } else if (step === 3) {
    sel.faction = id;
    document.getElementById('bgVideo').style.display = 'none';
    loadSquads();
    loadRoster();
    showStep(4);
  }
}
document.querySelectorAll('.servers div').forEach(el => el.onclick = () => onSelect(1, el.dataset.id));
document.querySelectorAll('.dungeons div').forEach(el => el.onclick = () => onSelect(2, el.dataset.id));
document.querySelectorAll('.factions div').forEach(el => el.onclick = () => onSelect(3, el.dataset.id));
function loadSquads() {
  document.getElementById('squads').innerHTML = '<p>Загрузка отрядов...</p>';
  fetch(scriptURL, { mode: 'cors' })
    .then(r => r.json())
    .then(result => {
      const rows = result && result.status === 'ok' ? result.data : null;
      if (!rows) throw new Error('bad response');
      const list = rows.filter(row =>
        row[10] == sel.server &&
        row[9] == (sel.faction == 'league' ? 'Лига' : 'Империя') &&
        row[11] == sel.dungeon
      );
      const squadsById = {};
      list.forEach(row => {
        const id = row[5];
        if (!squadsById[id]) squadsById[id] = { id, type: id.length > 2 ? 'closed' : 'open', players: [] };
        squadsById[id].players.push({ name: row[0], class: row[1] });
      });
      squadList = Object.values(squadsById);
      const html = squadList
        .map((s,i) => `<div class="squad ${s.type}"><div class="type">${s.type=='open'?'Открытый':'Закрытый'}</div><div>Игроки: ${s.players.map(p=>p.name).join(', ')}</div><button onclick="enterSquad(${i},'${s.type}')">Вступить</button></div>`)
        .join('');
      document.getElementById('squads').innerHTML = html || '<p>Нет отрядов</p>';
    })
    .catch(() => {
      document.getElementById('squads').innerHTML = '<p>Ошибка загрузки</p>';
    });
}

function enterSquad(index, type) {
  const raid = squadList[index];
  if (!raid) return;
  const id = raid.id;
  if (type === 'closed') {
    const code = prompt('Введите код для вступления');
    if (!code || code !== id) return alert('Неверный код');
  }
  loadRoster().then(() => {
    showStep(4);
    const idx = raids.findIndex(r => String(r.id) === String(id));
    const el = document.querySelector(`#raids .raid-container[data-index='${idx}']`);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });
}

function joinByCode() {
  const code = prompt('Введите код отряда');
  if (!code) return;
  fetch(scriptURL, { mode: 'cors' })
    .then(r => r.json())
    .then(result => {
      const rows = result && result.status === 'ok' ? result.data : null;
      if (!rows) throw new Error('bad response');
      const row = rows.find(r => r[5] === code);
      if (!row) {
        alert('Отряд не найден');
        return;
      }
      sel.server = row[10];
      sel.faction = row[9] === 'Лига' ? 'league' : 'empire';
      sel.dungeon = row[11];
      showStep(4);
      loadRoster().then(() => {
        const idx = raids.findIndex(r => String(r.id) === String(code));
        const el = document.querySelector(`#raids .raid-container[data-index='${idx}']`);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    })
    .catch(() => alert('Ошибка поиска отряда'));
}

