const STORAGE_KEY = 'loved_tracker_data_v2';
const PIN_KEY = 'loved_tracker_pin';

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getCurrentTimeStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag] || tag));
}

const defaultState = {
  isAloneMode: false,
  couple: {
    meName: 'Me',
    meEmoji: '🥰',
    partnerName: 'You',
    partnerEmoji: '😘',
    startDate: ''
  },
  familyMembers: [
    { id: 1, name: 'Family 1', emoji: '😊' },
    { id: 2, name: 'Family 2', emoji: '🌸' }
  ],
  familyNotes: [
    { id: 1, text: 'ညနေစာ အတူတူစားကြမယ်နော် 🍲', date: getTodayStr(), time: '18:30' }
  ],
  friendsMembers: [
    { id: 1, name: 'Friend 1', emoji: '😎' },
    { id: 2, name: 'Friend 2', emoji: '🥳' }
  ],
  friendsNotes: [
    { id: 1, text: 'ဒီည Mobile Legends ဆော့ကြမယ် 🎮', date: getTodayStr(), time: '20:00' }
  ],
  partnerBoard: null
};

let appState = loadState();
let currentEnteredPin = '';
let pinSetupStep = 'CREATE';
let tempFirstPin = '';
let activeNoteTarget = 'family';
let selectedMemberEmoji = '😊';
let selectedMyEmoji = '🥰';
let selectedPartnerEmoji = '😘';

function startApp() {
  initPinSystem();
  initNavigation();
  initAloneMode();
  initCoupleSection();
  initMembersAndNotes();
  initCanvasDrawing();
  initSettings();
  renderAll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}

function initPinSystem() {
  checkPinStatus();

  document.querySelectorAll('.pin-key[data-key]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentEnteredPin.length < 4) {
        currentEnteredPin += btn.getAttribute('data-key');
        updatePinDots();
        if (currentEnteredPin.length === 4) {
          setTimeout(handlePinComplete, 150);
        }
      }
    });
  });

  document.getElementById('pin-del-btn').addEventListener('click', (e) => {
    e.preventDefault();
    currentEnteredPin = currentEnteredPin.slice(0, -1);
    updatePinDots();
  });

  document.getElementById('pin-bio-btn').addEventListener('click', (e) => {
    e.preventDefault();
    if (localStorage.getItem(PIN_KEY)) {
      unlockPinScreen();
    }
  });
}

function checkPinStatus() {
  const savedPin = localStorage.getItem(PIN_KEY);
  const pinOverlay = document.getElementById('pin-overlay');

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
  pinOverlay.classList.remove('hidden');
}

function updatePinUiText(title, subtitle) {
  const titleEl = document.getElementById('pin-title');
  const subEl = document.getElementById('pin-subtitle');
  if (titleEl) titleEl.textContent = title;
  if (subEl) subEl.textContent = subtitle;
}

function handlePinComplete() {
  const savedPin = localStorage.getItem(PIN_KEY);

  if (pinSetupStep === 'CREATE') {
    tempFirstPin = currentEnteredPin;
    currentEnteredPin = '';
    updatePinDots();
    pinSetupStep = 'CONFIRM';
    updatePinUiText('Confirm Passcode', 'အတည်ပြုရန် PIN ထပ်ရိုက်ထည့်ပါ');
  } 
  else if (pinSetupStep === 'CONFIRM') {
    if (currentEnteredPin === tempFirstPin) {
      localStorage.setItem(PIN_KEY, currentEnteredPin);
      unlockPinScreen();
    } else {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
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
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      alert('PIN နံပါတ် မှားယွင်းနေပါသည်!');
      currentEnteredPin = '';
      updatePinDots();
    }
  }
}

function unlockPinScreen() {
  const pinOverlay = document.getElementById('pin-overlay');
  if (pinOverlay) pinOverlay.classList.add('hidden');
  currentEnteredPin = '';
  tempFirstPin = '';
  updatePinDots();
}

function updatePinDots() {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById(`dot-${i}`);
    if (dot) {
      if (i < currentEnteredPin.length) dot.classList.add('filled');
      else dot.classList.remove('filled');
    }
  }
}

function playVoiceAlert(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = 0.95;
    utter.pitch = 1.1;
    window.speechSynthesis.speak(utter);
  }
  if (navigator.vibrate) navigator.vibrate(80);
}

document.getElementById('main-heart-btn').addEventListener('click', () => {
  playVoiceAlert('I love you');
  const heart = document.getElementById('main-heart-btn');
  heart.style.transform = 'scale(1.25)';
  setTimeout(() => { heart.style.transform = ''; }, 200);
});

function triggerAirplane(onComplete) {
  const layer = document.getElementById('plane-animation-layer');
  layer.classList.add('animating');
  setTimeout(() => {
    layer.classList.remove('animating');
    if (onComplete) onComplete();
  }, 1100);
}

function initAloneMode() {
  const toggleBtn = document.getElementById('alone-mode-toggle');
  toggleBtn.addEventListener('click', () => {
    appState.isAloneMode = !appState.isAloneMode;
    saveState();
    applyAloneModeUI();
  });
  applyAloneModeUI();
}

function applyAloneModeUI() {
  const isAlone = appState.isAloneMode;
  const toggleLabel = document.getElementById('toggle-label');
  const modeText = document.getElementById('mode-text');
  const modeIcon = document.getElementById('mode-icon');
  const counterTitle = document.getElementById('counter-title');

  if (isAlone) {
    document.body.classList.add('alone-mode');
    toggleLabel.textContent = 'Couple Mode သို့ပြောင်းရန်';
    modeText.textContent = 'Alone Mode (Solo Journey)';
    modeIcon.textContent = '🪐';
    counterTitle.textContent = 'ကိုယ်တိုင်နှင့်အတူ ဖြတ်သန်းခဲ့သောရက်များ';
    document.getElementById('live-screen-title').textContent = 'My Personal Notepad';
  } else {
    document.body.classList.remove('alone-mode');
    toggleLabel.textContent = 'Alone Mode ပြောင်းရန်';
    modeText.textContent = 'Couple Mode';
    modeIcon.textContent = '💖';
    counterTitle.textContent = 'တို့နှစ်ယောက် ချစ်သက်တမ်း';
    document.getElementById('live-screen-title').textContent = 'Partner Live Screen';
  }
}

function initCoupleSection() {
  const dateInput = document.getElementById('love-start-date');
  dateInput.value = appState.couple.startDate || '';
  
  dateInput.addEventListener('change', (e) => {
    appState.couple.startDate = e.target.value;
    saveState();
    updateCounter();
  });

  const editModal = document.getElementById('profile-edit-modal');
  document.getElementById('edit-profiles-btn').addEventListener('click', () => {
    document.getElementById('edit-my-name').value = appState.couple.meName;
    document.getElementById('edit-partner-name').value = appState.couple.partnerName;
    selectedMyEmoji = appState.couple.meEmoji;
    selectedPartnerEmoji = appState.couple.partnerEmoji;
    highlightEmojiSelection('my-emoji-options', selectedMyEmoji);
    highlightEmojiSelection('partner-emoji-options', selectedPartnerEmoji);
    editModal.classList.add('active');
  });

  setupEmojiPicker('my-emoji-options', (emoji) => { selectedMyEmoji = emoji; });
  setupEmojiPicker('partner-emoji-options', (emoji) => { selectedPartnerEmoji = emoji; });

  document.getElementById('close-profile-modal-btn').addEventListener('click', () => {
    editModal.classList.remove('active');
  });

  document.getElementById('save-profiles-btn').addEventListener('click', () => {
    appState.couple.meName = document.getElementById('edit-my-name').value.trim() || 'Me';
    appState.couple.partnerName = document.getElementById('edit-partner-name').value.trim() || 'You';
    appState.couple.meEmoji = selectedMyEmoji;
    appState.couple.partnerEmoji = selectedPartnerEmoji;
    saveState();
    editModal.classList.remove('active');
    renderProfiles();
  });

  document.getElementById('send-msg-btn').addEventListener('click', () => {
    const textInput = document.getElementById('partner-msg-input');
    const msg = textInput.value.trim();
    if (!msg) return;

    triggerAirplane(() => {
      appState.partnerBoard = { type: 'text', content: msg };
      saveState();
      textInput.value = '';
      renderPartnerBoard();
      
      const coupleAlerts = ['I love you', 'I miss you'];
      playVoiceAlert(coupleAlerts[Math.floor(Math.random() * coupleAlerts.length)]);
    });
  });
}

function updateCounter() {
  const daysEl = document.getElementById('days-count');
  const detailedEl = document.getElementById('detailed-time');
  const progressEl = document.getElementById('milestone-progress');
  const milestoneDaysLeft = document.getElementById('milestone-days-left');
  const milestoneTitle = document.getElementById('next-milestone-title');

  if (!appState.couple.startDate) {
    daysEl.textContent = '0';
    detailedEl.textContent = '0 နှစ် 0 လ 0 ရက်';
    progressEl.style.width = '0%';
    milestoneTitle.textContent = 'ရက် ၁၀၀ ပြည့်ဖို့';
    milestoneDaysLeft.textContent = '၁၀၀ ရက်လို';
    return;
  }

  const start = new Date(appState.couple.startDate);
  const now = new Date();
  const diffTime = now - start;
  const days = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  daysEl.textContent = days;

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let remainingDays = now.getDate() - start.getDate();

  if (remainingDays < 0) {
    months--;
    remainingDays += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  detailedEl.textContent = `${Math.max(0, years)} နှစ် ${Math.max(0, months)} လ ${Math.max(0, remainingDays)} ရက်`;

  let target = 100;
  while (days >= target) target += 100;
  const daysLeft = target - days;
  const percentage = Math.min(100, ((days % 100) / 100) * 100);

  milestoneTitle.textContent = `ရက် ${target} ပြည့်ဖို့`;
  milestoneDaysLeft.textContent = `${daysLeft} ရက်လို`;
  progressEl.style.width = `${percentage}%`;
}

function initMembersAndNotes() {
  const noteModal = document.getElementById('note-modal');
  const memberModal = document.getElementById('member-modal');

  document.getElementById('add-family-note-btn').addEventListener('click', () => {
    activeNoteTarget = 'family';
    openNoteModal('🏡 မိသားစု မှတ်စုအသစ် ရေးပါ');
  });

  document.getElementById('add-friends-note-btn').addEventListener('click', () => {
    activeNoteTarget = 'friends';
    openNoteModal('✨ သူငယ်ချင်း မှတ်စုအသစ် ရေးပါ');
  });

  function openNoteModal(title) {
    document.getElementById('note-modal-title').textContent = title;
    document.getElementById('note-text-input').value = '';
    document.getElementById('note-date-input').value = getTodayStr();
    document.getElementById('note-time-input').value = getCurrentTimeStr();
    noteModal.classList.add('active');
  }

  document.getElementById('close-note-modal-btn').addEventListener('click', () => {
    noteModal.classList.remove('active');
  });

  document.getElementById('save-note-btn').addEventListener('click', () => {
    const text = document.getElementById('note-text-input').value.trim();
    const date = document.getElementById('note-date-input').value || getTodayStr();
    const time = document.getElementById('note-time-input').value || getCurrentTimeStr();

    if (!text) return;

    const newNote = { id: Date.now(), text, date, time };
    if (activeNoteTarget === 'family') {
      appState.familyNotes.unshift(newNote);
      playVoiceAlert('Hello');
    } else {
      appState.friendsNotes.unshift(newNote);
      playVoiceAlert('Hey guys');
    }

    saveState();
    noteModal.classList.remove('active');
    renderNotes();
  });

  setupEmojiPicker('member-emoji-options', (emoji) => { selectedMemberEmoji = emoji; });

  document.getElementById('close-member-modal-btn').addEventListener('click', () => {
    memberModal.classList.remove('active');
  });

  document.getElementById('save-member-btn').addEventListener('click', () => {
    const name = document.getElementById('member-name-input').value.trim();
    if (!name) return;

    const newMember = { id: Date.now(), name, emoji: selectedMemberEmoji };
    if (activeNoteTarget === 'family') {
      appState.familyMembers.push(newMember);
    } else {
      appState.friendsMembers.push(newMember);
    }

    saveState();
    memberModal.classList.remove('active');
    renderMembers();
  });
}

function openMemberModal(target) {
  activeNoteTarget = target;
  document.getElementById('member-name-input').value = '';
  document.getElementById('member-modal-title').textContent = target === 'family' ? 'မိသားစုဝင် အသစ်ထည့်မည်' : 'သူငယ်ချင်း အသစ်ထည့်မည်';
  document.getElementById('member-modal').classList.add('active');
}

function initCanvasDrawing() {
  const canvas = document.getElementById('drawing-canvas');
  const ctx = canvas.getContext('2d');
  const canvasModal = document.getElementById('canvas-modal');
  let isDrawing = false;
  let currentColor = '#ff4b8b';
  let historyStack = [];

  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  document.getElementById('open-canvas-btn').addEventListener('click', () => {
    canvasModal.classList.add('active');
    saveCanvasState();
  });

  document.getElementById('close-canvas-modal-btn').addEventListener('click', () => {
    canvasModal.classList.remove('active');
  });

  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      currentColor = dot.getAttribute('data-color');
    });
  });

  function saveCanvasState() {
    historyStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  }

  document.getElementById('canvas-undo-btn').addEventListener('click', () => {
    if (historyStack.length > 1) {
      historyStack.pop();
      ctx.putImageData(historyStack[historyStack.length - 1], 0, 0);
    }
  });

  document.getElementById('canvas-clear-btn').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveCanvasState();
  });

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function startDraw(e) {
    isDrawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function drawMove(e) {
    if (!isDrawing) return;
    const pos = getPos(e);
    ctx.strokeStyle = currentColor;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function stopDraw() {
    if (isDrawing) {
      isDrawing = false;
      saveCanvasState();
    }
  }

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', drawMove);
  canvas.addEventListener('mouseup', stopDraw);

  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDraw(e); });
  canvas.addEventListener('touchmove', (e) => { e.preventDefault(); drawMove(e); });
  canvas.addEventListener('touchend', stopDraw);

  document.getElementById('send-drawing-btn').addEventListener('click', () => {
    const dataUrl = canvas.toDataURL();
    canvasModal.classList.remove('active');

    triggerAirplane(() => {
      appState.partnerBoard = { type: 'image', content: dataUrl };
      saveState();
      renderPartnerBoard();
      
      const coupleAlerts = ['I love you', 'I miss you'];
      playVoiceAlert(coupleAlerts[Math.floor(Math.random() * coupleAlerts.length)]);
    });
  });
}

function initNavigation() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetTab = btn.getAttribute('data-tab');
      document.getElementById(targetTab).classList.add('active');
    });
  });
}

function initSettings() {
  document.getElementById('clear-all-data-btn').addEventListener('click', () => {
    if (confirm('Data အားလုံးကို ရှင်းလင်းပြီး Day 0 သို့ ပြန်လည်သတ်မှတ်မည်မှာ သေချာပါသလား?')) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PIN_KEY);
      appState = JSON.parse(JSON.stringify(defaultState));
      saveState();
      location.reload();
    }
  });

  document.getElementById('change-pin-btn').addEventListener('click', () => {
    localStorage.removeItem(PIN_KEY);
    checkPinStatus();
  });
}

function renderAll() {
  renderProfiles();
  updateCounter();
  renderPartnerBoard();
  renderMembers();
  renderNotes();
}

function renderProfiles() {
  document.getElementById('name-me').textContent = appState.couple.meName;
  document.getElementById('avatar-me').textContent = appState.couple.meEmoji;
  document.getElementById('name-partner').textContent = appState.couple.partnerName;
  document.getElementById('avatar-partner').textContent = appState.couple.partnerEmoji;
}

function renderPartnerBoard() {
  const display = document.getElementById('partner-board-display');
  if (!appState.partnerBoard) {
    display.innerHTML = `<p class="placeholder-text" id="board-empty-text">ချစ်သူဆီက စာသား သို့မဟုတ် ပုံဆွဲ မရောက်သေးပါ...</p>`;
    return;
  }

  if (appState.partnerBoard.type === 'text') {
    display.innerHTML = `<div class="board-received-text">💌 "${escapeHtml(appState.partnerBoard.content)}"</div>`;
  } else if (appState.partnerBoard.type === 'image') {
    display.innerHTML = `<img src="${appState.partnerBoard.content}" class="board-received-img" alt="Drawing">`;
  }
}

function renderMembers() {
  const famContainer = document.getElementById('family-members-container');
  famContainer.innerHTML = '';
  appState.familyMembers.forEach(m => {
    famContainer.innerHTML += `
      <div class="member-item">
        <button class="member-del-btn" onclick="deleteMember('family', ${m.id})">&times;</button>
        <div class="member-bubble">${m.emoji}</div>
        <span class="member-title">${escapeHtml(m.name)}</span>
      </div>
    `;
  });
  famContainer.innerHTML += `<div class="circle-add-member-btn" onclick="openMemberModal('family')">+</div>`;
  document.getElementById('family-count-tag').textContent = `${appState.familyMembers.length} ယောက်`;

  const friContainer = document.getElementById('friends-members-container');
  friContainer.innerHTML = '';
  appState.friendsMembers.forEach(m => {
    friContainer.innerHTML += `
      <div class="member-item">
        <button class="member-del-btn" onclick="deleteMember('friends', ${m.id})">&times;</button>
        <div class="member-bubble">${m.emoji}</div>
        <span class="member-title">${escapeHtml(m.name)}</span>
      </div>
    `;
  });
  friContainer.innerHTML += `<div class="circle-add-member-btn" onclick="openMemberModal('friends')">+</div>`;
  document.getElementById('friends-count-tag').textContent = `${appState.friendsMembers.length} ယောက်`;
}

function renderNotes() {
  const famNotes = document.getElementById('family-notes-container');
  famNotes.innerHTML = '';
  appState.familyNotes.forEach(n => {
    famNotes.innerHTML += `
      <div class="sticky-note-card">
        <div class="note-header-line">
          <span class="note-datetime"><i class="fa-regular fa-clock"></i> ${n.date} ${n.time}</span>
          <button class="note-del-btn" onclick="deleteNote('family', ${n.id})">&times;</button>
        </div>
        <div class="note-content-text">${escapeHtml(n.text)}</div>
      </div>
    `;
  });

  const friNotes = document.getElementById('friends-notes-container');
  friNotes.innerHTML = '';
  appState.friendsNotes.forEach(n => {
    friNotes.innerHTML += `
      <div class="sticky-note-card">
        <div class="note-header-line">
          <span class="note-datetime"><i class="fa-regular fa-clock"></i> ${n.date} ${n.time}</span>
          <button class="note-del-btn" onclick="deleteNote('friends', ${n.id})">&times;</button>
        </div>
        <div class="note-content-text">${escapeHtml(n.text)}</div>
      </div>
    `;
  });
}

window.deleteMember = function(type, id) {
  if (type === 'family') {
    appState.familyMembers = appState.familyMembers.filter(m => m.id !== id);
  } else {
    appState.friendsMembers = appState.friendsMembers.filter(m => m.id !== id);
  }
  saveState();
  renderMembers();
};

window.deleteNote = function(type, id) {
  if (type === 'family') {
    appState.familyNotes = appState.familyNotes.filter(n => n.id !== id);
  } else {
    appState.friendsNotes = appState.friendsNotes.filter(n => n.id !== id);
  }
  saveState();
  renderNotes();
};

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return JSON.parse(JSON.stringify(defaultState));
  try {
    return { ...defaultState, ...JSON.parse(saved) };
  } catch(e) {
    return JSON.parse(JSON.stringify(defaultState));
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function setupEmojiPicker(containerId, onSelect) {
  const container = document.getElementById(containerId);
  container.querySelectorAll('.emoji-option').forEach(opt => {
    opt.addEventListener('click', () => {
      container.querySelectorAll('.emoji-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      onSelect(opt.textContent.trim());
    });
  });
}

function highlightEmojiSelection(containerId, currentEmoji) {
  const container = document.getElementById(containerId);
  container.querySelectorAll('.emoji-option').forEach(opt => {
    if (opt.textContent.trim() === currentEmoji) opt.classList.add('selected');
    else opt.classList.remove('selected');
  });
}
