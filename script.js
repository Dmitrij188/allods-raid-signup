const scriptURL = 'https://script.google.com/macros/s/AKfycbwnlzIC0wGflvcK--3BQ_kSY6c9fEGPMQfMTBk0UfeNcAFgx7Vb990Ofn_Rua1ekdOv/exec';

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
  raids.forEach((raid, index) => {
    const raidEl = document.createElement("div");
    raidEl.className = "raid-container";
    raidEl.innerHTML = `
      <h2>Рейд ${+raid.id + 1}</h2>
      <div class="form-section">
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
        <button class="btn" onclick="joinRaid(${raid.id})">Записаться</button>
      </div>
      <div class="raid-roster" id="roster-${raid.id}">
        <h3>Состав:</h3>
        ${renderRoster(raid)}
      </div>
    `;
    raidsDiv.appendChild(raidEl);
    updateRoleOptions(raid.id);
  });
}

async function joinRaid(id) {
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

  const currentRaid = raids.find(r => +r.id === +id);
  if (!currentRaid) return alert("Рейд не найден!");

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
    server
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

    const text = await res.text();
    console.log('Signup response text:', text);
    if (text.trim() !== 'OK') {
      console.error('Save failed', res.status, text);
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
    data = await res.json();
  } catch (e) {
    console.error('loadRoster', e);
    alert('Не удалось загрузить список рейда.');
    return;
  }

  const grouped = {};
  data.forEach(row => {
    if (row.length > 10) {
      // row contains server information
      const [name, className, role, role2, role3, raidId, level, gearScore, guild, faction, server] = row;
      if (!grouped[raidId]) grouped[raidId] = [];
      grouped[raidId].push({ name, className, role, role2, role3, level, gearScore, guild, faction, server });
    } else if (row.length > 9) {
      const [name, className, role, role2, role3, raidId, level, gearScore, guild, faction] = row;
      if (!grouped[raidId]) grouped[raidId] = [];
      grouped[raidId].push({ name, className, role, role2, role3, level, gearScore, guild, faction });
    } else {
      const [name, className, role, role2, raidId, level, gearScore, guild, faction] = row;
      if (!grouped[raidId]) grouped[raidId] = [];
      grouped[raidId].push({ name, className, role, role2, level, gearScore, guild, faction });
    }
  });

  raids = Object.keys(grouped).map(id => ({ id, roster: grouped[id] }));
  renderRaids();
}

function createRaid() {
  if (raids.length >= MAX_RAIDS) return alert("Максимум 4 рейда");

  // Determine the next available raid id based on the current maximum.
  const maxId = raids.reduce((m, r) => {
    const idNum = parseInt(r.id, 10);
    return isNaN(idNum) ? m : Math.max(m, idNum);
  }, -1);
  const raidId = maxId + 1;

  // Avoid id clashes if non-sequential ids are loaded from the server.
  if (raids.some(r => String(r.id) === String(raidId))) return alert("Ошибка создания рейда");

  const raid = {
    id: raidId,
    roster: []
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
    .then(data => {
      const list = data.filter(row => row[10] == sel.server && row[9] == (sel.faction == 'league' ? 'Лига' : 'Империя'));
      const squadsById = {};
      list.forEach(row => {
        const id = row[5];
        if (!squadsById[id]) squadsById[id] = { id, type: id.length > 2 ? 'closed' : 'open', players: [] };
        squadsById[id].players.push({ name: row[0], class: row[1] });
      });
      const html = Object.values(squadsById)
        .map(s => `<div class="squad ${s.type}"><div class="type">${s.type=='open'?'Открытый':'Закрытый'}</div><div>Игроки: ${s.players.map(p=>p.name).join(', ')}</div><button>Вступить</button></div>`)
        .join('');
      document.getElementById('squads').innerHTML = html || '<p>Нет отрядов</p>';
    })
    .catch(() => {
      document.getElementById('squads').innerHTML = '<p>Ошибка загрузки</p>';
    });
}

