/* ==================== GLOBAL APP STATE & STORAGE ==================== */
const STORAGE_KEY = 'loved_tracker_data_v2';

const defaultState = {
  currentTab: 'couple',
  theme: 'theme-couple',
  coupleAlone: false,
  familyAlone: false,
  friendsAlone: false,
  joinCodes: {
    couple: 'LOVE-999',
    family: 'FAM-101',
    friends: 'SQUAD-999'
  },
  profiles: {
    me: {
      name: 'ကိုကို',
      photo: null, // null means use default avatar
      defaultAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=KoKo'
    },
    partner: {
      name: 'သဲလေး',
      photo: null,
      defaultAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ThaeLay'
    }
  },
  relationshipStartDate: '2026-05-18',
  liveScreen: {
    type: null, // 'text' | 'image'
    content: ''
  },
  familyMembers: [
    { id: 1, name: 'ဖေဖေ', avatar: '👨' },
    { id: 2, name: 'မေမေ', avatar: '👩' },
    { id: 3, name: 'ညီမလေး', avatar: '👧' }
  ],
  friendsMembers: [
    { id: 1, name: 'မင်းခန့်', avatar: '😎' },
    { id: 2, name: 'သုတ', avatar: '🤠' },
    { id: 3, name: 'ရဲရင့်', avatar: '🥳' },
    { id: 4, name: 'ဆုဆု', avatar: '🌸' }
  ],
  familyNotes: [
    { id: 1, text: 'ညနေစာ အတူတူစားကြမယ်နော် 🍲' }
  ],
  friendsNotes: [
    { id: 1, text: 'ဒီည Mobile Legends ဆော့ကြမယ် 🎮' }
  ]
};

let appState = loadState();

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
  } catch (e) {
    return defaultState;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  syncToNativeWidget();
}

/* ==================== DOM ELEMENTS SELECTION ==================== */
const bodyEl = document.body;
const statusBarBg = document.getElementById('statusBarBg');

// Navigation
const navCoupleBtn = document.getElementById('navCoupleBtn');
const navFamilyBtn = document.getElementById('navFamilyBtn');
const navFriendsBtn = document.getElementById('navFriendsBtn');
const openJoinCodeBtn = document.getElementById('openJoinCodeBtn');

const tabCouple = document.getElementById('tab-couple');
const tabFamily = document.getElementById('tab-family');
const tabFriends = document.getElementById('tab-friends');

// Couple Tab Elements
const toggleCoupleAloneBtn = document.getElementById('toggleCoupleAloneBtn');
const coupleModeLabel = document.getElementById('coupleModeLabel');
const partnerProfileItem = document.getElementById('partnerProfileItem');
const avatarMeImg = document.getElementById('avatarMeImg');
const avatarPartnerImg = document.getElementById('avatarPartnerImg');
const nameMeText = document.getElementById('nameMeText');
const namePartnerText = document.getElementById('namePartnerText');
const btnHeartTrigger = document.getElementById('btnHeartTrigger');
const milestoneTitle = document.getElementById('milestoneTitle');
const daysCountText = document.getElementById('daysCountText');
const detailDurationText = document.getElementById('detailDurationText');
const startDateInput = document.getElementById('startDateInput');
const goalProgressBar = document.getElementById('goalProgressBar');
const nextGoalTitle = document.getElementById('nextGoalTitle');
const nextGoalRemaining = document.getElementById('nextGoalRemaining');

// Live Screen Elements
const viewportPlaceholder = document.getElementById('viewportPlaceholder');
const liveTextDisplay = document.getElementById('liveTextDisplay');
const liveImageDisplay = document.getElementById('liveImageDisplay');
const liveMessageInput = document.getElementById('liveMessageInput');
const btnSendMessage = document.getElementById('btnSendMessage');
const btnOpenDrawing = document.getElementById('btnOpenDrawing');

// Family & Friends Elements
const familyMembersList = document.getElementById('familyMembersList');
const familyCountBadge = document.getElementById('familyCountBadge');
const familyNotesGrid = document.getElementById('familyNotesGrid');
const btnAddFamilyMember = document.getElementById('btnAddFamilyMember');
const btnAddFamilyNote = document.getElementById('btnAddFamilyNote');
const toggleFamilyAloneBtn = document.getElementById('toggleFamilyAloneBtn');

const friendsMembersList = document.getElementById('friendsMembersList');
const friendsCountBadge = document.getElementById('friendsCountBadge');
const friendsNotesGrid = document.getElementById('friendsNotesGrid');
const btnAddFriendMember = document.getElementById('btnAddFriendMember');
const btnAddFriendNote = document.getElementById('btnAddFriendNote');
const toggleFriendsAloneBtn = document.getElementById('toggleFriendsAloneBtn');

// Modals
const joinCodeModal = document.getElementById('joinCodeModal');
const closeJoinCodeModal = document.getElementById('closeJoinCodeModal');
const inputCoupleCode = document.getElementById('inputCoupleCode');
const inputFamilyCode = document.getElementById('inputFamilyCode');
const inputFriendsCode = document.getElementById('inputFriendsCode');
const btnSaveJoinCodes = document.getElementById('btnSaveJoinCodes');

const editProfileModal = document.getElementById('editProfileModal');
const openEditProfileBtn = document.getElementById('openEditProfileBtn');
const closeEditProfileModal = document.getElementById('closeEditProfileModal');
const editMyNameInput = document.getElementById('editMyNameInput');
const editMyPhotoInput = document.getElementById('editMyPhotoInput');
const btnResetMyPhoto = document.getElementById('btnResetMyPhoto');
const editPartnerNameInput = document.getElementById('editPartnerNameInput');
const editPartnerPhotoInput = document.getElementById('editPartnerPhotoInput');
const btnResetPartnerPhoto = document.getElementById('btnResetPartnerPhoto');
const btnSaveProfile = document.getElementById('btnSaveProfile');

// Drawing Modal & Canvas
const drawingModal = document.getElementById('drawingModal');
const closeDrawingModal = document.getElementById('closeDrawingModal');
const liveDrawingCanvas = document.getElementById('liveDrawingCanvas');
const btnUndoCanvas = document.getElementById('btnUndoCanvas');
const btnClearCanvas = document.getElementById('btnClearCanvas');
const btnSendCanvasDrawing = document.getElementById('btnSendCanvasDrawing');
const colorDots = document.querySelectorAll('.color-dot');

/* ==================== INITIALIZATION ==================== */
document.addEventListener('DOMContentLoaded', () => {
  renderTab(appState.currentTab);
  renderProfiles();
  calculateMilestone();
  renderLiveScreen();
  renderFamily();
  renderFriends();
  initDrawingCanvas();
});

/* ==================== 1. DYNAMIC TABS & NAVIGATION ==================== */
function switchTab(tabKey) {
  appState.currentTab = tabKey;
  
  // Theme class for Body
  bodyEl.className = '';
  if (tabKey === 'couple') bodyEl.classList.add('theme-couple');
  else if (tabKey === 'family') bodyEl.classList.add('theme-family');
  else if (tabKey === 'friends') bodyEl.classList.add('theme-friends');

  // Update Nav Active state
  [navCoupleBtn, navFamilyBtn, navFriendsBtn].forEach(btn => btn.classList.remove('active'));
  [tabCouple, tabFamily, tabFriends].forEach(tab => tab.classList.remove('active'));

  if (tabKey === 'couple') {
    navCoupleBtn.classList.add('active');
    tabCouple.classList.add('active');
  } else if (tabKey === 'family') {
    navFamilyBtn.classList.add('active');
    tabFamily.classList.add('active');
  } else if (tabKey === 'friends') {
    navFriendsBtn.classList.add('active');
    tabFriends.classList.add('active');
  }

  saveState();
}

function renderTab(tabKey) {
  switchTab(tabKey);
}

navCoupleBtn.addEventListener('click', () => switchTab('couple'));
navFamilyBtn.addEventListener('click', () => switchTab('family'));
navFriendsBtn.addEventListener('click', () => switchTab('friends'));

/* ==================== 2. ALONE MODE TOGGLES ==================== */
toggleCoupleAloneBtn.addEventListener('click', () => {
  appState.coupleAlone = !appState.coupleAlone;
  updateCoupleModeUI();
  saveState();
});

function updateCoupleModeUI() {
  if (appState.coupleAlone) {
    coupleModeLabel.textContent = '👤 Alone Mode (Self Love)';
    toggleCoupleAloneBtn.textContent = 'Couple Mode သို့ပြန်ပြောင်းရန်';
    partnerProfileItem.style.display = 'none';
    milestoneTitle.textContent = 'ကိုယ့်ကိုယ်ကို ချစ်သည့်ရက်ပေါင်း';
  } else {
    coupleModeLabel.textContent = '💖 Couple Mode';
    toggleCoupleAloneBtn.textContent = 'Alone Mode ပြောင်းရန်';
    partnerProfileItem.style.display = 'flex';
    milestoneTitle.textContent = 'တို့နှစ်ယောက် ချစ်သက်တမ်း';
  }
}

toggleFamilyAloneBtn.addEventListener('click', () => {
  appState.familyAlone = !appState.familyAlone;
  document.getElementById('familyModeLabel').textContent = appState.familyAlone ? '👤 My Home Note (Alone)' : '🏡 Family Mode';
  toggleFamilyAloneBtn.textContent = appState.familyAlone ? 'Family Mode သို့ပြန်ပြောင်းရန်' : 'Alone Mode ပြောင်းရန်';
  saveState();
});

toggleFriendsAloneBtn.addEventListener('click', () => {
  appState.friendsAlone = !appState.friendsAlone;
  document.getElementById('friendsModeLabel').textContent = appState.friendsAlone ? '👤 My Personal Hub (Alone)' : '✨ Squad Mode';
  toggleFriendsAloneBtn.textContent = appState.friendsAlone ? 'Squad Mode သို့ပြန်ပြောင်းရန်' : 'Alone Mode ပြောင်းရန်';
  saveState();
});

/* ==================== 3. HEART AUDIO & HAPTIC VIBRATION ==================== */
btnHeartTrigger.addEventListener('click', () => {
  // 1. Heartbeat Vibration (ဒုတ်... ဒုတ်...)
  if (navigator.vibrate) {
    navigator.vibrate([100, 120, 150]);
  }

  // 2. "I Love You" Voice Audio synthesis
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance('I love you');
    utterance.pitch = 1.2;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  // 3. UI Animation bounce
  btnHeartTrigger.style.transform = 'scale(1.4)';
  setTimeout(() => {
    btnHeartTrigger.style.transform = '';
  }, 250);
});

/* ==================== 4. PROFILES & 3:4 RATIO WITH REMOVE ==================== */
function renderProfiles() {
  updateCoupleModeUI();

  nameMeText.textContent = appState.profiles.me.name;
  avatarMeImg.src = appState.profiles.me.photo || appState.profiles.me.defaultAvatar;

  namePartnerText.textContent = appState.profiles.partner.name;
  avatarPartnerImg.src = appState.profiles.partner.photo || appState.profiles.partner.defaultAvatar;

  startDateInput.value = appState.relationshipStartDate;
}

openEditProfileBtn.addEventListener('click', () => {
  editMyNameInput.value = appState.profiles.me.name;
  editPartnerNameInput.value = appState.profiles.partner.name;
  editProfileModal.classList.add('show');
});

closeEditProfileModal.addEventListener('click', () => {
  editProfileModal.classList.remove('show');
});

// Reset Photo to Default Avatar
btnResetMyPhoto.addEventListener('click', () => {
  appState.profiles.me.photo = null;
  renderProfiles();
  alert('မိမိဓာတ်ပုံကို မူရင်း Avatar သို့ ပြန်ထားလိုက်ပါပြီ။');
});

btnResetPartnerPhoto.addEventListener('click', () => {
  appState.profiles.partner.photo = null;
  renderProfiles();
  alert('ချစ်သူ့ဓာတ်ပုံကို မူရင်း Avatar သို့ ပြန်ထားလိုက်ပါပြီ။');
});

// Save Profile Updates
btnSaveProfile.addEventListener('click', () => {
  if (editMyNameInput.value.trim()) {
    appState.profiles.me.name = editMyNameInput.value.trim();
  }
  if (editPartnerNameInput.value.trim()) {
    appState.profiles.partner.name = editPartnerNameInput.value.trim();
  }

  const readAndSaveImage = (inputEl, targetKey) => {
    return new Promise(resolve => {
      if (inputEl.files && inputEl.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
          appState.profiles[targetKey].photo = e.target.result;
          resolve();
        };
        reader.readAsDataURL(inputEl.files[0]);
      } else {
        resolve();
      }
    });
  };

  Promise.all([
    readAndSaveImage(editMyPhotoInput, 'me'),
    readAndSaveImage(editPartnerPhotoInput, 'partner')
  ]).then(() => {
    saveState();
    renderProfiles();
    editProfileModal.classList.remove('show');
  });
});

/* ==================== 5. D-DAY MILESTONE LOGIC ==================== */
function calculateMilestone() {
  const start = new Date(appState.relationshipStartDate);
  const now = new Date();
  const diffTime = Math.abs(now - start);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  daysCountText.textContent = diffDays;

  // Years, Months, Days breakdown
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  const days = Math.floor((diffDays % 365) % 30);
  detailDurationText.textContent = `${years} နှစ် ${months} လ ${days} ရက်`;

  // Milestone Progress
  const nextMilestone = Math.ceil((diffDays + 1) / 100) * 100;
  const remaining = nextMilestone - diffDays;
  nextGoalTitle.textContent = `ရက် ${nextMilestone} ပြည့်ဖို့`;
  nextGoalRemaining.textContent = `${remaining} ရက်လို`;
  
  const percentage = Math.min(100, Math.max(0, ((100 - remaining) / 100) * 100));
  goalProgressBar.style.width = `${percentage}%`;
}

startDateInput.addEventListener('change', (e) => {
  appState.relationshipStartDate = e.target.value;
  saveState();
  calculateMilestone();
});

/* ==================== 6. PARTNER LIVE SCREEN & HORIZONTAL ACTIONS ==================== */
function renderLiveScreen() {
  if (!appState.liveScreen.content) {
    viewportPlaceholder.style.display = 'block';
    liveTextDisplay.style.display = 'none';
    liveImageDisplay.style.display = 'none';
  } else if (appState.liveScreen.type === 'text') {
    viewportPlaceholder.style.display = 'none';
    liveImageDisplay.style.display = 'none';
    liveTextDisplay.style.display = 'block';
    liveTextDisplay.textContent = appState.liveScreen.content;
  } else if (appState.liveScreen.type === 'image') {
    viewportPlaceholder.style.display = 'none';
    liveTextDisplay.style.display = 'none';
    liveImageDisplay.style.display = 'block';
    liveImageDisplay.src = appState.liveScreen.content;
  }
}

btnSendMessage.addEventListener('click', () => {
  const text = liveMessageInput.value.trim();
  if (!text) return;
  appState.liveScreen = { type: 'text', content: text };
  liveMessageInput.value = '';
  saveState();
  renderLiveScreen();
});

/* ==================== 7. DRAWING CANVAS WITH UNDO & PALETTE ==================== */
let ctx = liveDrawingCanvas.getContext('2d');
let isDrawing = false;
let currentColor = '#FF4B72';
let canvasHistory = [];

function initDrawingCanvas() {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 4;
  ctx.strokeStyle = currentColor;

  function saveCanvasStep() {
    canvasHistory.push(ctx.getImageData(0, 0, liveDrawingCanvas.width, liveDrawingCanvas.height));
    if (canvasHistory.length > 20) canvasHistory.shift();
  }

  function getCanvasCoords(e) {
    const rect = liveDrawingCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (liveDrawingCanvas.width / rect.width),
      y: (clientY - rect.top) * (liveDrawingCanvas.height / rect.height)
    };
  }

  function startDraw(e) {
    isDrawing = true;
    saveCanvasStep();
    const coords = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  }

  function drawMove(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCanvasCoords(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  }

  function stopDraw() {
    isDrawing = false;
  }

  liveDrawingCanvas.addEventListener('mousedown', startDraw);
  liveDrawingCanvas.addEventListener('mousemove', drawMove);
  window.addEventListener('mouseup', stopDraw);

  liveDrawingCanvas.addEventListener('touchstart', startDraw, { passive: false });
  liveDrawingCanvas.addEventListener('touchmove', drawMove, { passive: false });
  window.addEventListener('touchend', stopDraw);

  // Color Selector
  colorDots.forEach(dot => {
    dot.addEventListener('click', () => {
      colorDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      currentColor = dot.getAttribute('data-color');
      ctx.strokeStyle = currentColor;
    });
  });

  // Undo Button
  btnUndoCanvas.addEventListener('click', () => {
    if (canvasHistory.length > 0) {
      const lastState = canvasHistory.pop();
      ctx.putImageData(lastState, 0, 0);
    }
  });

  // Clear Button
  btnClearCanvas.addEventListener('click', () => {
    saveCanvasStep();
    ctx.clearRect(0, 0, liveDrawingCanvas.width, liveDrawingCanvas.height);
  });
}

btnOpenDrawing.addEventListener('click', () => {
  drawingModal.classList.add('show');
});

closeDrawingModal.addEventListener('click', () => {
  drawingModal.classList.remove('show');
});

btnSendCanvasDrawing.addEventListener('click', () => {
  const dataUrl = liveDrawingCanvas.toDataURL('image/png');
  appState.liveScreen = { type: 'image', content: dataUrl };
  saveState();
  renderLiveScreen();
  drawingModal.classList.remove('show');
});

/* ==================== 8. FAMILY & FRIENDS (NO OVERLAP / CLIPPING) ==================== */
function renderFamily() {
  familyCountBadge.textContent = `${appState.familyMembers.length} ယောက်`;
  familyMembersList.innerHTML = appState.familyMembers.map(m => `
    <div class="member-card-wrapper">
      <div class="member-avatar-circle">
        <span style="font-size: 2rem; display: flex; align-items: center; justify-content: center; height: 100%;">${m.avatar}</span>
      </div>
      <button type="button" class="btn-member-del" onclick="deleteFamilyMember(${m.id})">×</button>
      <div class="member-label">${m.name}</div>
    </div>
  `).join('');

  familyNotesGrid.innerHTML = appState.familyNotes.map(n => `
    <div class="sticky-note-item">${n.text}</div>
  `).join('');
}

window.deleteFamilyMember = function(id) {
  appState.familyMembers = appState.familyMembers.filter(m => m.id !== id);
  saveState();
  renderFamily();
};

btnAddFamilyMember.addEventListener('click', () => {
  const name = prompt('မိသားစုဝင် အမည် ထည့်ပါ-');
  if (name) {
    appState.familyMembers.push({ id: Date.now(), name, avatar: '👤' });
    saveState();
    renderFamily();
  }
});

btnAddFamilyNote.addEventListener('click', () => {
  const text = prompt('ကပ်လိုသော မှတ်စုစာသား ရိုက်ထည့်ပါ-');
  if (text) {
    appState.familyNotes.push({ id: Date.now(), text });
    saveState();
    renderFamily();
  }
});

function renderFriends() {
  friendsCountBadge.textContent = `${appState.friendsMembers.length} ယောက်`;
  friendsMembersList.innerHTML = appState.friendsMembers.map(m => `
    <div class="member-card-wrapper">
      <div class="member-avatar-circle">
        <span style="font-size: 2rem; display: flex; align-items: center; justify-content: center; height: 100%;">${m.avatar}</span>
      </div>
      <button type="button" class="btn-member-del" onclick="deleteFriendMember(${m.id})">×</button>
      <div class="member-label">${m.name}</div>
    </div>
  `).join('');

  friendsNotesGrid.innerHTML = appState.friendsNotes.map(n => `
    <div class="sticky-note-item" style="background: #e0e7ff; color: #3730a3;">${n.text}</div>
  `).join('');
}

window.deleteFriendMember = function(id) {
  appState.friendsMembers = appState.friendsMembers.filter(m => m.id !== id);
  saveState();
  renderFriends();
};

btnAddFriendMember.addEventListener('click', () => {
  const name = prompt('သူငယ်ချင်း အမည် ထည့်ပါ-');
  if (name) {
    appState.friendsMembers.push({ id: Date.now(), name, avatar: '😎' });
    saveState();
    renderFriends();
  }
});

btnAddFriendNote.addEventListener('click', () => {
  const text = prompt('Friends Hub တွင် ကပ်လိုသော စာသား ရိုက်ထည့်ပါ-');
  if (text) {
    appState.friendsNotes.push({ id: Date.now(), text });
    saveState();
    renderFriends();
  }
});

/* ==================== 9. CLEAN ROOM LOGIC & JOIN CODES ==================== */
openJoinCodeBtn.addEventListener('click', () => {
  inputCoupleCode.value = appState.joinCodes.couple;
  inputFamilyCode.value = appState.joinCodes.family;
  inputFriendsCode.value = appState.joinCodes.friends;
  joinCodeModal.classList.add('show');
});

closeJoinCodeModal.addEventListener('click', () => {
  joinCodeModal.classList.remove('show');
});

btnSaveJoinCodes.addEventListener('click', () => {
  const newCouple = inputCoupleCode.value.trim() || 'LOVE-999';
  const newFamily = inputFamilyCode.value.trim() || 'FAM-101';
  const newFriends = inputFriendsCode.value.trim() || 'SQUAD-999';

  // Clean Room Check: If couple code changes, reset live screen to prevent cross-contamination
  if (appState.joinCodes.couple !== newCouple) {
    appState.liveScreen = { type: null, content: '' };
  }
  if (appState.joinCodes.family !== newFamily) {
    appState.familyNotes = [];
  }
  if (appState.joinCodes.friends !== newFriends) {
    appState.friendsNotes = [];
  }

  appState.joinCodes.couple = newCouple;
  appState.joinCodes.family = newFamily;
  appState.joinCodes.friends = newFriends;

  saveState();
  renderLiveScreen();
  renderFamily();
  renderFriends();
  joinCodeModal.classList.remove('show');
  alert('Join Codes များ သိမ်းဆည်းပြီး Clean Room အသစ်သို့ ချိတ်ဆက်လိုက်ပါပြီ။');
});

/* ==================== 10. NATIVE WIDGET DATA SYNC ==================== */
function syncToNativeWidget() {
  const widgetData = {
    days: daysCountText.textContent || '0',
    title: milestoneTitle.textContent || 'တို့နှစ်ယောက် ချစ်သက်တမ်း',
    liveContent: appState.liveScreen.type === 'text' ? appState.liveScreen.content : (appState.liveScreen.type === 'image' ? '[Drawing]' : 'No message')
  };
  localStorage.setItem('loved_tracker_widget_data', JSON.stringify(widgetData));
}
