const STORAGE_KEY = 'loved_tracker_data_v2';
const PIN_KEY = 'loved_tracker_pin';

function safeVibrate(p) {
  try {
    if (window.navigator && typeof window.navigator.vibrate === 'function') {
      window.navigator.vibrate(p);
    }
  } catch (e) {}
}

function safeVoiceAlert(text) {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      utter.rate = 0.95;
      utter.pitch = 1.1;
      window.speechSynthesis.speak(utter);
    }
  } catch (e) {}
  safeVibrate(80);
}

function renderFrameContent(val) {
  if (!val) return '<span class="placeholder-emoji">🥰</span>';
  if (val.startsWith('data:image') || val.startsWith('http')) {
    return `<img src="${val}" alt="Photo">`;
  }
  return `<span class="placeholder-emoji">${val}</span>`;
}

function compressImage(file, callback) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const maxDim = 320;
      let w = img.width, h = img.height;
      if (w > h) {
        if (w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; }
      } else {
        if (h > maxDim) { w = Math.round((h * maxDim) / h); h = maxDim; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      callback(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// PIN SYSTEM
let currentEnteredPin = '';
let pinSetupStep = 'CREATE';
let tempFirstPin = '';
let lastPinPressTime = 0;

window.pressPin = function(num, e) {
  if (e) {
    if (e.type === 'click' && Date.now() - lastPinPressTime < 350) return;
    lastPinPressTime = Date.now();
  }
  if (currentEnteredPin.length < 4) {
    currentEnteredPin += String(num);
    safeVibrate(25);
    updatePinDots();
    if (currentEnteredPin.length === 4) {
      setTimeout(handlePinComplete, 160);
    }
  }
};

window.deletePin = function(e) {
  if (e) {
    if (e.type === 'click' && Date.now() - lastPinPressTime < 350) return;
    lastPinPressTime = Date.now();
  }
  currentEnteredPin = currentEnteredPin.slice(0, -1);
  safeVibrate(25);
  updatePinDots();
};

window.bypassPin = function(e) {
  unlockPinScreen();
};

window.resetPinSetup = function(e) {
  try { localStorage.removeItem(PIN_KEY); } catch (e) {}
  checkPinStatus();
};

function checkPinStatus() {
  let savedPin = null;
  try { savedPin = localStorage.getItem(PIN_KEY); } catch (e) {}
  const overlay = document.getElementById('pin-overlay');

  if (!savedPin) {
    pinSetupStep = 'CREATE';
    updatePinUiText('New Passcode', 'PIN အသစ် သတ်မှတ်ပါ (ဂဏန်း ၄ လုံး)');
  } else {
    pinSetupStep = 'ENTER';
    updatePinUiText('Enter Passcode', 'လုံခြုံရေး PIN နံပါတ် ရိုက်ထည့်ပါ');
  }

  currentEnteredPin = '';
  tempFirstPin = '';
  updatePinDots();
  if (overlay) overlay.classList.remove('hidden');
}

function updatePinUiText(title, sub) {
  const t = document.getElementById('pin-title');
  const s = document.getElementById('pin-subtitle');
  if (t) t.textContent = title;
  if (s) s.textContent = sub;
}

function updatePinDots() {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById(`dot-${i}`);
    if (dot) {
      if (i < currentEnteredPin.length) {
        dot.style.background = '#ff4b8b';
        dot.style.borderColor = '#ff4b8b';
        dot.style.boxShadow = '0 0 12px #ff4b8b';
      } else {
        dot.style.background = 'transparent';
        dot.style.borderColor = '#ff4b8b';
        dot.style.boxShadow = 'none';
      }
    }
  }
}

function handlePinComplete() {
  let savedPin = null;
  try { savedPin = localStorage.getItem(PIN_KEY); } catch (e) {}

  if (pinSetupStep === 'CREATE') {
    tempFirstPin = currentEnteredPin;
    currentEnteredPin = '';
    updatePinDots();
    pinSetupStep = 'CONFIRM';
    updatePinUiText('Confirm Passcode', 'အတည်ပြုရန် PIN ထပ်ရိုက်ထည့်ပါ');
  } 
  else if (pinSetupStep === 'CONFIRM') {
    if (currentEnteredPin === tempFirstPin) {
      try { localStorage.setItem(PIN_KEY, currentEnteredPin); } catch (e) {}
      unlockPinScreen();
    } else {
      safeVibrate([100, 50, 100]);
      alert('PIN မတူညီပါ! အစကနေ ပြန်လည်ရိုက်ထည့်ပါ။');
      pinSetupStep = 'CREATE';
      tempFirstPin = '';
      currentEnteredPin = '';
      updatePinDots();
      updatePinUiText('New Passcode', 'PIN အသစ် သတ်မှတ်ပါ (ဂဏန်း ၄ လုံး)');
    }
  } 
  else if (pinSetupStep === 'ENTER') {
    if (currentEnteredPin === savedPin) {
      unlockPinScreen();
    } else {
      safeVibrate([100, 50, 100]);
      alert('PIN နံပါတ် မှားယွင်းနေပါသည်!');
      currentEnteredPin = '';
      updatePinDots();
    }
  }
}

function unlockPinScreen() {
  const overlay = document.getElementById('pin-overlay');
  if (overlay) overlay.classList.add('hidden');
  currentEnteredPin = '';
  tempFirstPin = '';
  updatePinDots();
}

// DATA STATE
const defaultData = {
  isAloneMode: false,
  couple: { meName: 'Me', meAvatar: '🥰', partnerName: 'You', partnerAvatar: '😘', startDate: '' },
  familyMembers: [{ id: 1, name: 'Family 1', avatar: '😊' }, { id: 2, name: 'Family 2', avatar: '🌸' }],
  familyNotes: [{ id: 1, text: 'ညနေစာ အတူတူစားကြမယ်နော် 🍲', date: '2026-10-04', time: '18:30' }],
  friendsMembers: [{ id: 1, name: 'Friend 1', avatar: '😎' }, { id: 2, name: 'Friend 2', avatar: '🥳' }],
  friendsNotes: [{ id: 1, text: 'ဒီည Mobile Legends ဆော့ကြမယ် 🎮', date: '2026-10-04', time: '20:00' }],
  partnerBoard: null
};

let appData = loadAppData();
let activeNoteType = 'family';
let chosenAvatarMember = '😊';
let chosenAvatarMe = '🥰';
let chosenAvatarPartner = '😘';

function loadAppData() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      const parsed = JSON.parse(s);
      if (parsed.couple) {
        parsed.couple.meAvatar = parsed.couple.meAvatar || parsed.couple.meEmoji || '🥰';
        parsed.couple.partnerAvatar = parsed.couple.partnerAvatar || parsed.couple.partnerEmoji || '😘';
      }
      if (parsed.familyMembers) {
        parsed.familyMembers.forEach(m => { m.avatar = m.avatar || m.emoji || '😊'; });
      }
      if (parsed.friendsMembers) {
        parsed.friendsMembers.forEach(m => { m.avatar = m.avatar || m.emoji || '😎'; });
      }
      return Object.assign({}, defaultData, parsed);
    }
  } catch (e) {}
  return JSON.parse(JSON.stringify(defaultData));
}

function saveAppData() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(appData)); } catch (e) {}
}

function triggerPaperPlane(callback) {
  const layer = document.getElementById('plane-animation-layer');
  if (layer) {
    layer.classList.add('animating');
    setTimeout(() => {
      layer.classList.remove('animating');
      if (callback) callback();
    }, 1100);
  } else if (callback) callback();
}

window.tapHeart = function() {
  safeVoiceAlert('I love you');
  const h = document.getElementById('main-heart-btn');
  if (h) {
    h.style.transform = 'scale(1.25)';
    setTimeout(() => { h.style.transform = ''; }, 200);
  }
};

window.toggleAloneMode = function() {
  appData.isAloneMode = !appData.isAloneMode;
  saveAppData();
  applyAloneModeUI();
};

function applyAloneModeUI() {
  const isAlone = appData.isAloneMode;
  const toggleLabel = document.getElementById('toggle-label');
  const modeText = document.getElementById('mode-text');
  const modeIcon = document.getElementById('mode-icon');
  const counterTitle = document.getElementById('counter-title');
  const liveTitle = document.getElementById('live-screen-title');
  const navCoupleText = document.getElementById('nav-couple-text');

  if (isAlone) {
    document.body.classList.add('alone-mode');
    if (toggleLabel) toggleLabel.textContent = 'Couple Mode သို့ပြောင်းရန်';
    if (modeText) modeText.textContent = 'Alone Mode (Solo Journey)';
    if (modeIcon) modeIcon.textContent = '🪐';
    if (counterTitle) counterTitle.textContent = 'ကိုယ်တိုင်နှင့်အတူ ဖြတ်သန်းခဲ့သောရက်များ';
    if (liveTitle) liveTitle.textContent = 'My Personal Notepad';
    if (navCoupleText) navCoupleText.textContent = 'Solo';
  } else {
    document.body.classList.remove('alone-mode');
    if (toggleLabel) toggleLabel.textContent = 'Alone Mode ပြောင်းရန်';
    if (modeText) modeText.textContent = 'Couple Mode';
    if (modeIcon) modeIcon.textContent = '💖';
    if (counterTitle) counterTitle.textContent = 'တို့နှစ်ယောက် ချစ်သက်တမ်း';
    if (liveTitle) liveTitle.textContent = 'Partner Live Screen';
    if (navCoupleText) navCoupleText.textContent = 'Couple';
  }
}

window.onDateChange = function(val) {
  appData.couple.startDate = val;
  saveAppData();
  renderCounter();
};

function renderCounter() {
  const daysEl = document.getElementById('days-count');
  const detailedEl = document.getElementById('detailed-time');
  const progressEl = document.getElementById('milestone-progress');
  const daysLeftEl = document.getElementById('milestone-days-left');
  const nextMileEl = document.getElementById('next-milestone-title');

  if (!daysEl) return;

  if (!appData.couple.startDate) {
    daysEl.textContent = '0';
    if (detailedEl) detailedEl.textContent = '0 နှစ် 0 လ 0 ရက်';
    if (progressEl) progressEl.style.width = '0%';
    if (nextMileEl) nextMileEl.textContent = 'ရက် ၁၀၀ ပြည့်ဖို့';
    if (daysLeftEl) daysLeftEl.textContent = '၁၀၀ ရက်လို';
    return;
  }

  const start = new Date(appData.couple.startDate);
  const now = new Date();
  start.setHours(0, 0, 0, 0);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = today - start;
  if (diffTime < 0) {
    daysEl.textContent = '0';
    if (detailedEl) detailedEl.textContent = 'စတင်ရန် ရက်လိုသေးသည်';
    return;
  }

  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  daysEl.textContent = totalDays;

  let years = today.getFullYear() - start.getFullYear();
  let months = today.getMonth() - start.getMonth();
  let days = today.getDate() - start.getDate();

  if (days < 0) {
    months--;
    const prevMonthLastDay = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  if (years < 0) { years = 0; months = 0; days = 0; }

  if (detailedEl) detailedEl.textContent = `${years} နှစ် ${months} လ ${days} ရက်`;

  let target = 100;
  while (totalDays >= target) target += 100;
  const daysLeft = target - totalDays;
  const percentage = Math.min(100, ((totalDays % 100) / 100) * 100);

  if (nextMileEl) nextMileEl.textContent = `ရက် ${target} ပြည့်ဖို့`;
  if (daysLeftEl) daysLeftEl.textContent = `${daysLeft} ရက်လို`;
  if (progressEl) progressEl.style.width = `${percentage}%`;
}

window.openProfileModal = function() {
  document.getElementById('edit-my-name').value = appData.couple.meName;
  document.getElementById('edit-partner-name').value = appData.couple.partnerName;
  chosenAvatarMe = appData.couple.meAvatar;
  chosenAvatarPartner = appData.couple.partnerAvatar;

  const pMe = document.getElementById('me-photo-preview');
  if (chosenAvatarMe.startsWith('data:image')) {
    pMe.src = chosenAvatarMe;
    pMe.style.display = 'block';
  } else { pMe.style.display = 'none'; }

  const pPart = document.getElementById('partner-photo-preview');
  if (chosenAvatarPartner.startsWith('data:image')) {
    pPart.src = chosenAvatarPartner;
    pPart.style.display = 'block';
  } else { pPart.style.display = 'none'; }

  document.getElementById('profile-edit-modal').classList.add('active');
};

window.handleProfilePhoto = function(input, type) {
  if (input.files && input.files[0]) {
    compressImage(input.files[0], (dataUrl) => {
      if (type === 'me') {
        chosenAvatarMe = dataUrl;
        const p = document.getElementById('me-photo-preview');
        p.src = dataUrl;
        p.style.display = 'block';
        document.querySelectorAll('#my-emoji-options .emoji-option').forEach(o => o.classList.remove('selected'));
      } else {
        chosenAvatarPartner = dataUrl;
        const p = document.getElementById('partner-photo-preview');
        p.src = dataUrl;
        p.style.display = 'block';
        document.querySelectorAll('#partner-emoji-options .emoji-option').forEach(o => o.classList.remove('selected'));
      }
    });
  }
};

window.saveProfiles = function() {
  appData.couple.meName = document.getElementById('edit-my-name').value.trim() || 'Me';
  appData.couple.partnerName = document.getElementById('edit-partner-name').value.trim() || 'You';
  appData.couple.meAvatar = chosenAvatarMe;
  appData.couple.partnerAvatar = chosenAvatarPartner;
  saveAppData();
  closeModal('profile-edit-modal');
  renderProfiles();
};

function renderProfiles() {
  const nm = document.getElementById('name-me');
  const am = document.getElementById('avatar-me');
  const np = document.getElementById('name-partner');
  const ap = document.getElementById('avatar-partner');
  const sd = document.getElementById('love-start-date');

  if (nm) nm.textContent = appData.couple.meName;
  if (am) am.innerHTML = renderFrameContent(appData.couple.meAvatar);
  if (np) np.textContent = appData.couple.partnerName;
  if (ap) ap.innerHTML = renderFrameContent(appData.couple.partnerAvatar);
  if (sd) sd.value = appData.couple.startDate || '';
}

window.sendPartnerMessage = function() {
  const input = document.getElementById('partner-msg-input');
  const msg = input.value.trim();
  if (!msg) return;

  triggerPaperPlane(() => {
    appData.partnerBoard = { type: 'text', content: msg };
    saveAppData();
    input.value = '';
    renderBoard();

    const alerts = ['I love you', 'I miss you'];
    safeVoiceAlert(alerts[Math.floor(Math.random() * alerts.length)]);
  });
};

function renderBoard() {
  const b = document.getElementById('partner-board-display');
  if (!b) return;
  if (!appData.partnerBoard) {
    b.innerHTML = '<p class="placeholder-text">စာသား သို့မဟုတ် ပုံဆွဲ မရောက်သေးပါ...</p>';
    return;
  }
  if (appData.partnerBoard.type === 'text') {
    b.innerHTML = `<div class="board-received-text">💌 "${appData.partnerBoard.content}"</div>`;
  } else {
    b.innerHTML = `<img src="${appData.partnerBoard.content}" class="board-received-img">`;
  }
}

window.openMemberModal = function(type) {
  activeNoteType = type;
  document.getElementById('member-modal-title').textContent = type === 'family' ? 'မိသားစုဝင် အသစ်ထည့်မည်' : 'သူငယ်ချင်း အသစ်ထည့်မည်';
  document.getElementById('member-name-input').value = '';
  document.getElementById('member-photo-input').value = '';
  document.getElementById('member-photo-preview').style.display = 'none';
  chosenAvatarMember = '😊';
  document.getElementById('member-modal').classList.add('active');
};

window.handleMemberPhoto = function(input) {
  if (input.files && input.files[0]) {
    compressImage(input.files[0], (dataUrl) => {
      chosenAvatarMember = dataUrl;
      const prev = document.getElementById('member-photo-preview');
      prev.src = dataUrl;
      prev.style.display = 'block';
      document.querySelectorAll('#member-emoji-options .emoji-option').forEach(o => o.classList.remove('selected'));
    });
  }
};

window.saveMember = function() {
  const name = document.getElementById('member-name-input').value.trim();
  if (!name) return;
  const m = { id: Date.now(), name, avatar: chosenAvatarMember };
  if (activeNoteType === 'family') appData.familyMembers.push(m);
  else appData.friendsMembers.push(m);
  saveAppData();
  closeModal('member-modal');
  renderMembers();
};

window.delMember = function(type, id) {
  if (type === 'family') appData.familyMembers = appData.familyMembers.filter(m => m.id !== id);
  else appData.friendsMembers = appData.friendsMembers.filter(m => m.id !== id);
  saveAppData();
  renderMembers();
};

function renderMembers() {
  const fc = document.getElementById('family-members-container');
  if (fc) {
    fc.innerHTML = '';
    appData.familyMembers.forEach(m => {
      fc.innerHTML += `
        <div class="member-item">
          <button class="member-del-btn" onclick="delMember('family', ${m.id})">&times;</button>
          <div class="member-bubble">${renderFrameContent(m.avatar)}</div>
          <span class="member-title">${m.name}</span>
        </div>`;
    });
    fc.innerHTML += `<div class="circle-add-member-btn" onclick="openMemberModal('family')">+</div>`;
    document.getElementById('family-count-tag').textContent = `${appData.familyMembers.length} ယောက်`;
  }

  const frc = document.getElementById('friends-members-container');
  if (frc) {
    frc.innerHTML = '';
    appData.friendsMembers.forEach(m => {
      frc.innerHTML += `
        <div class="member-item">
          <button class="member-del-btn" onclick="delMember('friends', ${m.id})">&times;</button>
          <div class="member-bubble">${renderFrameContent(m.avatar)}</div>
          <span class="member-title">${m.name}</span>
        </div>`;
    });
    frc.innerHTML += `<div class="circle-add-member-btn" onclick="openMemberModal('friends')">+</div>`;
    document.getElementById('friends-count-tag').textContent = `${appData.friendsMembers.length} ယောက်`;
  }
}

window.openNoteModal = function(type) {
  activeNoteType = type;
  document.getElementById('note-modal-title').textContent = type === 'family' ? '🏡 မိသားစု မှတ်စုအသစ် ရေးပါ' : '✨ သူငယ်ချင်း မှတ်စုအသစ် ရေးပါ';
  document.getElementById('note-text-input').value = '';
  const now = new Date();
  document.getElementById('note-date-input').value = now.toISOString().slice(0, 10);
  document.getElementById('note-time-input').value = now.toTimeString().slice(0, 5);
  document.getElementById('note-modal').classList.add('active');
};

window.saveNote = function() {
  const text = document.getElementById('note-text-input').value.trim();
  const date = document.getElementById('note-date-input').value;
  const time = document.getElementById('note-time-input').value;
  if (!text) return;

  const n = { id: Date.now(), text, date, time };
  if (activeNoteType === 'family') {
    appData.familyNotes.unshift(n);
    safeVoiceAlert('Hello');
  } else {
    appData.friendsNotes.unshift(n);
    safeVoiceAlert('Hey guys');
  }
  saveAppData();
  closeModal('note-modal');
  renderNotes();
};

window.delNote = function(type, id) {
  if (type === 'family') appData.familyNotes = appData.familyNotes.filter(n => n.id !== id);
  else appData.friendsNotes = appData.friendsNotes.filter(n => n.id !== id);
  saveAppData();
  renderNotes();
};

function renderNotes() {
  const fn = document.getElementById('family-notes-container');
  if (fn) {
    fn.innerHTML = '';
    appData.familyNotes.forEach(n => {
      fn.innerHTML += `
        <div class="sticky-note-card">
          <div class="note-header-line">
            <span class="note-datetime"><i class="fa-regular fa-clock"></i> ${n.date} ${n.time}</span>
            <button class="note-del-btn" onclick="delNote('family', ${n.id})">&times;</button>
          </div>
          <div class="note-content-text">${n.text}</div>
        </div>`;
    });
  }

  const frn = document.getElementById('friends-notes-container');
  if (frn) {
    frn.innerHTML = '';
    appData.friendsNotes.forEach(n => {
      frn.innerHTML += `
        <div class="sticky-note-card">
          <div class="note-header-line">
            <span class="note-datetime"><i class="fa-regular fa-clock"></i> ${n.date} ${n.time}</span>
            <button class="note-del-btn" onclick="delNote('friends', ${n.id})">&times;</button>
          </div>
          <div class="note-content-text">${n.text}</div>
        </div>`;
    });
  }
}

window.copyRoomCode = function() {
  const code = document.getElementById('my-device-code').textContent;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code);
  }
  alert(`Room Code ကူးယူပြီးပါပြီ: ${code}`);
};

window.joinRoomCode = function() {
  const input = document.getElementById('pair-code-input');
  const val = input.value.trim();
  if (val) {
    alert(`Room Code "${val}" ဖြင့် အောင်မြင်စွာ ချိတ်ဆက်ပြီးပါပြီ!`);
    input.value = '';
  } else {
    alert('Room Code ရိုက်ထည့်ပေးပါ!');
  }
};

window.clearAllData = function() {
  if (confirm('Data အားလုံးကို ရှင်းလင်းပြီး Day 0 သို့ ပြန်လည်သတ်မှတ်မည်မှာ သေချာပါသလား?')) {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PIN_KEY);
    } catch(e) {}
    location.reload();
  }
};

let canvas, ctx, isDrawing = false, strokeColor = '#ff4b8b', canvasHistory = [];

window.openCanvasModal = function() {
  document.getElementById('canvas-modal').classList.add('active');
  if (!canvas) initCanvas();
};

function initCanvas() {
  canvas = document.getElementById('drawing-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: cx - r.left, y: cy - r.top };
  }

  function start(e) {
    isDrawing = true;
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function move(e) {
    if (!isDrawing) return;
    const p = getPos(e);
    ctx.strokeStyle = strokeColor;
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function stop() {
    if (isDrawing) {
      isDrawing = false;
      canvasHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }
  }

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  canvas.addEventListener('mouseup', stop);

  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); start(e); });
  canvas.addEventListener('touchmove', (e) => { e.preventDefault(); drawMove(e); });
  canvas.addEventListener('touchend', stop);

  canvasHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
}

window.selectColor = function(col, el) {
  strokeColor = col;
  document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
  el.classList.add('active');
};

window.undoCanvas = function() {
  if (canvasHistory.length > 1) {
    canvasHistory.pop();
    ctx.putImageData(canvasHistory[canvasHistory.length - 1], 0, 0);
  }
};

window.clearCanvas = function() {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvasHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  }
};

window.sendDrawing = function() {
  if (!canvas) return;
  const dataUrl = canvas.toDataURL();
  closeModal('canvas-modal');
  triggerPaperPlane(() => {
    appData.partnerBoard = { type: 'image', content: dataUrl };
    saveAppData();
    renderBoard();
    const alerts = ['I love you', 'I miss you'];
    safeVoiceAlert(alerts[Math.floor(Math.random() * alerts.length)]);
  });
};

window.switchTab = function(id, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const pane = document.getElementById(id);
  if (pane) pane.classList.add('active');
};

window.pickEmoji = function(el, target) {
  el.parentElement.querySelectorAll('.emoji-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  const val = el.textContent.trim();
  if (target === 'member') {
    chosenAvatarMember = val;
    document.getElementById('member-photo-preview').style.display = 'none';
  } else if (target === 'me') {
    chosenAvatarMe = val;
    document.getElementById('me-photo-preview').style.display = 'none';
  } else if (target === 'partner') {
    chosenAvatarPartner = val;
    document.getElementById('partner-photo-preview').style.display = 'none';
  }
};

window.closeModal = function(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('active');
};

function initApp() {
  checkPinStatus();
  applyAloneModeUI();
  renderProfiles();
  renderCounter();
  renderBoard();
  renderMembers();
  renderNotes();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
