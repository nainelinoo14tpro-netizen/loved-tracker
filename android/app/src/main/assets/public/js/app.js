let enteredPin = "";
let pinSetupStep = 1;
let newPinDraft = "";
let currentActiveSpace = 'couple';
let pendingInitialSpace = 'couple';

function initPinState() {
  const savedPin = localStorage.getItem('userPin');
  const title = document.getElementById('pinTitle');
  const hint = document.getElementById('pinHint');
  if (!savedPin) {
    pinSetupStep = 1;
    if (title) title.innerText = "PIN နံပါတ်အသစ် သတ်မှတ်ပါ";
    if (hint) hint.innerText = "ဂဏန်း ၄ လုံး ရိုက်ထည့်ပါ";
  } else {
    pinSetupStep = 0;
    if (title) title.innerText = "Passcode ရိုက်ထည့်ပါ";
    if (hint) hint.innerText = "";
  }
}

function enterPin(num) {
  if (enteredPin.length < 4) {
    enteredPin += num;
    updatePinDots();
  }
  if (enteredPin.length === 4) {
    setTimeout(processPin, 150);
  }
}

function deletePin() {
  enteredPin = enteredPin.slice(0, -1);
  updatePinDots();
}

function resetPin() {
  enteredPin = "";
  updatePinDots();
}

function updatePinDots() {
  const dots = document.querySelectorAll('.pin-dots .dot');
  dots.forEach((dot, index) => {
    dot.classList.toggle('filled', index < enteredPin.length);
  });
}

function processPin() {
  const savedPin = localStorage.getItem('userPin');
  const title = document.getElementById('pinTitle');
  const hint = document.getElementById('pinHint');

  if (!savedPin) {
    if (pinSetupStep === 1) {
      newPinDraft = enteredPin;
      enteredPin = "";
      updatePinDots();
      pinSetupStep = 2;
      if (title) title.innerText = "PIN ကို အတည်ပြုပါ";
      if (hint) hint.innerText = "ရိုက်ခဲ့သော PIN ကို ထပ်ရိုက်ပါ";
    } else if (pinSetupStep === 2) {
      if (enteredPin === newPinDraft) {
        localStorage.setItem('userPin', newPinDraft);
        document.getElementById('pinLockScreen').style.display = 'none';
        openSpaceSelectModal();
      } else {
        alert("PIN နံပါတ်များ မကိုက်ညီပါ။ အသစ်ပြန်လည် သတ်မှတ်ပါ။");
        newPinDraft = "";
        enteredPin = "";
        pinSetupStep = 1;
        initPinState();
        updatePinDots();
      }
    }
  } else {
    if (enteredPin === savedPin) {
      document.getElementById('pinLockScreen').style.display = 'none';
    } else {
      alert("Passcode မှားယွင်းနေပါသည်");
      resetPin();
    }
  }
}

function openSpaceSelectModal() {
  const modal = document.getElementById('spaceSelectModal');
  if (modal) modal.style.display = 'flex';
}

function selectInitialSpace(space) {
  pendingInitialSpace = space;
  document.querySelectorAll('.space-select-option').forEach(el => el.classList.remove('selected'));
  const wrap = document.getElementById('initialJoinCodeWrap');
  const label = document.getElementById('initialJoinLabel');
  const input = document.getElementById('initialJoinInput');
  if (wrap) wrap.style.display = 'block';

  if (space === 'couple') {
    if (label) label.innerText = "💖 Couple Join Code ထည့်ပါ:";
    if (input) input.value = pairCodes.couple;
  } else if (space === 'family') {
    if (label) label.innerText = "🏡 Family Join Code ထည့်ပါ:";
    if (input) input.value = pairCodes.family;
  } else if (space === 'friends') {
    if (label) label.innerText = "✨ Friends Join Code ထည့်ပါ:";
    if (input) input.value = pairCodes.friends;
  }
}

function confirmInitialSpace() {
  const input = document.getElementById('initialJoinInput');
  const val = input ? input.value.trim().toUpperCase() : '';
  if (val) {
    if (pendingInitialSpace === 'couple') {
      pairCodes.couple = val;
      localStorage.setItem('pairCode_couple', val);
    } else if (pendingInitialSpace === 'family') {
      pairCodes.family = val;
      localStorage.setItem('pairCode_family', val);
    } else if (pendingInitialSpace === 'friends') {
      pairCodes.friends = val;
      localStorage.setItem('pairCode_friends', val);
    }
    initSyncChannels();
  }
  const modal = document.getElementById('spaceSelectModal');
  if (modal) modal.style.display = 'none';
  switchSpace(pendingInitialSpace);
}

function switchSpace(spaceName) {
  currentActiveSpace = spaceName;

  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.space-section').forEach(sec => sec.classList.remove('active'));

  if (spaceName === 'couple') {
    document.getElementById('tabCouple').classList.add('active');
    document.getElementById('coupleSpace').classList.add('active');
  } else if (spaceName === 'family') {
    document.getElementById('tabFamily').classList.add('active');
    document.getElementById('familySpace').classList.add('active');
  } else if (spaceName === 'friends') {
    document.getElementById('tabFriends').classList.add('active');
    document.getElementById('friendsSpace').classList.add('active');
  }

  updateHeaderPairBadge();
}

function updateHeaderPairBadge() {
  const badgeText = document.getElementById('pairStatusText');
  if (!badgeText) return;

  if (currentActiveSpace === 'couple') {
    badgeText.innerText = `💖 ${pairCodes.couple}`;
  } else if (currentActiveSpace === 'family') {
    badgeText.innerText = `🏡 ${pairCodes.family}`;
  } else if (currentActiveSpace === 'friends') {
    badgeText.innerText = `✨ ${pairCodes.friends}`;
  }
}

function openPairModal() {
  document.getElementById('pairCodeCoupleInput').value = pairCodes.couple;
  document.getElementById('pairCodeFamilyInput').value = pairCodes.family;
  document.getElementById('pairCodeFriendsInput').value = pairCodes.friends;
  document.getElementById('pairModal').style.display = 'flex';
}

function closePairModal() {
  document.getElementById('pairModal').style.display = 'none';
}

function saveAllPairCodes() {
  const cCode = document.getElementById('pairCodeCoupleInput').value.trim().toUpperCase() || 'LOVE-777';
  const famCode = document.getElementById('pairCodeFamilyInput').value.trim().toUpperCase() || 'FAM-101';
  const friCode = document.getElementById('pairCodeFriendsInput').value.trim().toUpperCase() || 'SQUAD-999';

  pairCodes.couple = cCode;
  pairCodes.family = famCode;
  pairCodes.friends = friCode;

  localStorage.setItem('pairCode_couple', cCode);
  localStorage.setItem('pairCode_family', famCode);
  localStorage.setItem('pairCode_friends', friCode);

  initSyncChannels();
  updateHeaderPairBadge();
  closePairModal();

  alert("Join Codes အားလုံးကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ!");
}

function openCoupleEditModal() {
  const profile = getSavedCoupleProfile();
  document.getElementById('editMeNameInput').value = profile.nameMe;
  document.getElementById('editPartnerNameInput').value = profile.namePartner;
  document.getElementById('coupleEditModal').style.display = 'flex';
}

function closeCoupleEditModal() {
  document.getElementById('coupleEditModal').style.display = 'none';
}

function getSavedCoupleProfile() {
  return JSON.parse(localStorage.getItem('coupleProfile')) || {
    nameMe: 'ကိုကို',
    namePartner: 'သဲလေး',
    photoMe: '',
    photoPartner: ''
  };
}

async function saveCoupleProfile() {
  const profile = getSavedCoupleProfile();
  profile.nameMe = document.getElementById('editMeNameInput').value.trim() || 'ကိုကို';
  profile.namePartner = document.getElementById('editPartnerNameInput').value.trim() || 'သဲလေး';

  const fileMe = document.getElementById('editMePhotoInput').files[0];
  const filePartner = document.getElementById('editPartnerPhotoInput').files[0];

  if (fileMe) profile.photoMe = await fileToBase64(fileMe);
  if (filePartner) profile.photoPartner = await fileToBase64(filePartner);

  applyCoupleProfile(profile, true);
  closeCoupleEditModal();
}

function applyCoupleProfile(profile, broadcast) {
  localStorage.setItem('coupleProfile', JSON.stringify(profile));

  document.getElementById('nameMeDisplay').innerText = profile.nameMe;
  document.getElementById('namePartnerDisplay').innerText = profile.namePartner;

  if (profile.photoMe) {
    document.getElementById('avatarMe').innerHTML = `<img src="${profile.photoMe}" alt="Me">`;
  }
  if (profile.photoPartner) {
    document.getElementById('avatarPartner').innerHTML = `<img src="${profile.photoPartner}" alt="Partner">`;
  }

  if (broadcast && syncChannels.couple) {
    syncChannels.couple.postMessage({ type: 'COUPLE_PROFILE_UPDATE', payload: profile });
  }
}

function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

let familyMembers = JSON.parse(localStorage.getItem('familyMembersList')) || [
  { id: 1, name: 'ဖေဖေ', photo: '', emoji: '👨' },
  { id: 2, name: 'မေမေ', photo: '', emoji: '👩' },
  { id: 3, name: 'ညီမလေး', photo: '', emoji: '👧' }
];

let friendsMembers = JSON.parse(localStorage.getItem('friendsMembersList')) || [
  { id: 1, name: 'မင်းခန့်', photo: '', emoji: '😎' },
  { id: 2, name: 'သုတ', photo: '', emoji: '🤠' },
  { id: 3, name: 'ရဲရင့်', photo: '', emoji: '🥳' },
  { id: 4, name: 'ဆုဆု', photo: '', emoji: '🌸' }
];

function renderMembers() {
  const famGrid = document.getElementById('familyMembersGrid');
  const famCount = document.getElementById('familyMemberCount');
  if (famGrid) {
    famCount.innerText = `${familyMembers.length} ယောက်`;
    famGrid.innerHTML = familyMembers.map(m => `
      <div class="member-item-card">
        <button class="btn-del-member" onclick="deleteFamilyMember(${m.id})">✕</button>
        <div class="member-avatar" onclick="editMemberPhoto('family', ${m.id})">
          ${m.photo ? `<img src="${m.photo}">` : m.emoji || '👤'}
        </div>
        <span class="member-name" onclick="renameMember('family', ${m.id})">${m.name}</span>
      </div>
    `).join('');
  }

  const friGrid = document.getElementById('friendsMembersGrid');
  const friCount = document.getElementById('friendsMemberCount');
  if (friGrid) {
    friCount.innerText = `${friendsMembers.length} ယောက်`;
    friGrid.innerHTML = friendsMembers.map(m => `
      <div class="member-item-card">
        <button class="btn-del-member" onclick="deleteFriendMember(${m.id})">✕</button>
        <div class="member-avatar" onclick="editMemberPhoto('friends', ${m.id})">
          ${m.photo ? `<img src="${m.photo}">` : m.emoji || '👤'}
        </div>
        <span class="member-name" onclick="renameMember('friends', ${m.id})">${m.name}</span>
      </div>
    `).join('');
  }
}

function addNewFamilyMember() {
  const name = prompt("မိသားစုဝင် နာမည်ရိုက်ထည့်ပါ:");
  if (!name || !name.trim()) return;
  familyMembers.push({ id: Date.now(), name: name.trim(), photo: '', emoji: '🏡' });
  applyFamilyData(familyMembers, true);
}

function deleteFamilyMember(id) {
  if (confirm("ဤအဖွဲ့ဝင်ကို ဖျက်မည်မှာ သေချာပါသလား?")) {
    familyMembers = familyMembers.filter(m => m.id !== id);
    applyFamilyData(familyMembers, true);
  }
}

function addNewFriendMember() {
  const name = prompt("သူငယ်ချင်း နာမည်ရိုက်ထည့်ပါ:");
  if (!name || !name.trim()) return;
  friendsMembers.push({ id: Date.now(), name: name.trim(), photo: '', emoji: '✨' });
  applyFriendsData(friendsMembers, true);
}

function deleteFriendMember(id) {
  if (confirm("ဤသူငယ်ချင်းကို ဖျက်မည်မှာ သေချာပါသလား?")) {
    friendsMembers = friendsMembers.filter(m => m.id !== id);
    applyFriendsData(friendsMembers, true);
  }
}

function renameMember(type, id) {
  const list = type === 'family' ? familyMembers : friendsMembers;
  const member = list.find(m => m.id === id);
  if (!member) return;

  const newName = prompt("နာမည်အသစ် ပြောင်းပါ:", member.name);
  if (newName && newName.trim()) {
    member.name = newName.trim();
    if (type === 'family') applyFamilyData(familyMembers, true);
    else applyFriendsData(friendsMembers, true);
  }
}

function editMemberPhoto(type, id) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async () => {
    const file = input.files[0];
    if (file) {
      const base64 = await fileToBase64(file);
      const list = type === 'family' ? familyMembers : friendsMembers;
      const member = list.find(m => m.id === id);
      if (member) {
        member.photo = base64;
        if (type === 'family') applyFamilyData(familyMembers, true);
        else applyFriendsData(friendsMembers, true);
      }
    }
  };
  input.click();
}

function applyFamilyData(data, broadcast) {
  familyMembers = data;
  localStorage.setItem('familyMembersList', JSON.stringify(familyMembers));
  renderMembers();
  if (broadcast && syncChannels.family) {
    syncChannels.family.postMessage({ type: 'FAMILY_SYNC', payload: familyMembers });
  }
}

function applyFriendsData(data, broadcast) {
  friendsMembers = data;
  localStorage.setItem('friendsMembersList', JSON.stringify(friendsMembers));
  renderMembers();
  if (broadcast && syncChannels.friends) {
    syncChannels.friends.postMessage({ type: 'FRIENDS_SYNC', payload: friendsMembers });
  }
}

let familyNotes = JSON.parse(localStorage.getItem('savedFamilyNotes')) || [
  { id: 'fn_1', text: 'ဒီနေ့ ညနေ ဈေးဝယ်စရာစာရင်း' },
  { id: 'fn_2', text: 'မေမေ့မွေးနေ့ နောက် ၃ ရက်အလို!' }
];

function renderFamilyNotes() {
  const container = document.getElementById('familyNotesList');
  if (!container) return;
  container.innerHTML = familyNotes.map(n => `
    <div class="sticky-note" id="note_${n.id}">
      <span>📌 ${n.text}</span>
      <button class="btn-del-note" onclick="deleteFamilyNote('${n.id}')">✕</button>
    </div>
  `).join('');
}

function addFamilyNote() {
  const noteText = prompt("မိသားစု Sticky Note အသစ်ရေးပါ:");
  if (!noteText || !noteText.trim()) return;
  const newNote = { id: 'fn_' + Date.now(), text: noteText.trim() };
  applyNewFamilyNote(newNote, true);
}

function applyNewFamilyNote(noteObj, broadcast) {
  if (typeof noteObj === 'string') {
    noteObj = { id: 'fn_' + Date.now(), text: noteObj };
  }
  familyNotes.push(noteObj);
  localStorage.setItem('savedFamilyNotes', JSON.stringify(familyNotes));
  renderFamilyNotes();
  if (broadcast && syncChannels.family) {
    syncChannels.family.postMessage({ type: 'FAMILY_NOTE_ADD', payload: noteObj });
  }
}

function deleteFamilyNote(id) {
  removeFamilyNoteFromUI(id, true);
}

function removeFamilyNoteFromUI(id, broadcast) {
  familyNotes = familyNotes.filter(n => n.id !== id);
  localStorage.setItem('savedFamilyNotes', JSON.stringify(familyNotes));
  renderFamilyNotes();
  if (broadcast && syncChannels.family) {
    syncChannels.family.postMessage({ type: 'FAMILY_NOTE_DELETE', payload: id });
  }
}

let friendsNotes = JSON.parse(localStorage.getItem('savedFriendsNotes')) || [
  { id: 'frn_1', text: 'နောက်လ ခရီးထွက်ဖို့ အင်္ကျီဆင်တူ ဝယ်ကြမယ်' },
  { id: 'frn_2', text: 'စနေနေ့ ညနေ Pizza ဆုံစားကြမယ်' }
];

function renderFriendsNotes() {
  const container = document.getElementById('friendsNotesList');
  if (!container) return;
  container.innerHTML = friendsNotes.map((n, i) => `
    <div class="sticky-note squad-note ${i % 2 === 0 ? 'yellow' : ''}" id="note_${n.id}">
      <span>💬 ${n.text}</span>
      <button class="btn-del-note" onclick="deleteFriendsNote('${n.id}')">✕</button>
    </div>
  `).join('');
}

function addFriendsNote() {
  const noteText = prompt("သူငယ်ချင်းများအတွက် Note အသစ် ရေးပါ:");
  if (!noteText || !noteText.trim()) return;
  const newNote = { id: 'frn_' + Date.now(), text: noteText.trim() };
  applyNewFriendsNote(newNote, true);
}

function applyNewFriendsNote(noteObj, broadcast) {
  if (typeof noteObj === 'string') {
    noteObj = { id: 'frn_' + Date.now(), text: noteObj };
  }
  friendsNotes.push(noteObj);
  localStorage.setItem('savedFriendsNotes', JSON.stringify(friendsNotes));
  renderFriendsNotes();
  if (broadcast && syncChannels.friends) {
    syncChannels.friends.postMessage({ type: 'FRIENDS_NOTE_ADD', payload: noteObj });
  }
}

function deleteFriendsNote(id) {
  removeFriendsNoteFromUI(id, true);
}

function removeFriendsNoteFromUI(id, broadcast) {
  friendsNotes = friendsNotes.filter(n => n.id !== id);
  localStorage.setItem('savedFriendsNotes', JSON.stringify(friendsNotes));
  renderFriendsNotes();
  if (broadcast && syncChannels.friends) {
    syncChannels.friends.postMessage({ type: 'FRIENDS_NOTE_DELETE', payload: id });
  }
}

function pinCurrentNoteToWidget() {
  const liveInput = document.getElementById('liveNoteInput');
  const text = liveInput && liveInput.value.trim() 
    ? liveInput.value.trim() 
    : prompt("Home Screen Widget ပေါ် တင်လိုသော စာသား ရိုက်ထည့်ပါ:", "တို့နှစ်ယောက် အမြဲပျော်ရွှင်ကြမယ် ❤️");

  if (!text) return;

  localStorage.setItem('widget_note_content', text);
  document.getElementById('currentWidgetNoteDisplay').innerText = `"${text}"`;
  alert("Widget ပေါ်သို့ စာသား အောင်မြင်စွာ တင်လိုက်ပါပြီ! 📱");
}

function onStartDateChange() {
  const val = document.getElementById('loveStartDate').value;
  if (val) {
    localStorage.setItem('loveStartDate', val);
    updateDDayUI(val);
  }
}

function triggerLoveHeartbeat() {
  speakEnglish("I love you so much!");
}

window.addEventListener('DOMContentLoaded', () => {
  initPinState();

  const savedStartDate = localStorage.getItem('loveStartDate') || '2026-05-18';
  document.getElementById('loveStartDate').value = savedStartDate;
  updateDDayUI(savedStartDate);

  initSyncChannels();
  updateHeaderPairBadge();

  const savedProfile = getSavedCoupleProfile();
  applyCoupleProfile(savedProfile, false);

  renderMembers();
  renderFamilyNotes();
  renderFriendsNotes();

  const savedWidgetNote = localStorage.getItem('widget_note_content');
  if (savedWidgetNote) {
    document.getElementById('currentWidgetNoteDisplay').innerText = `"${savedWidgetNote}"`;
  }
});