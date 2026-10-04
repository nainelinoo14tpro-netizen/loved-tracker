let pairCodes = {
  couple: localStorage.getItem('pairCode_couple') || 'LOVE-777',
  family: localStorage.getItem('pairCode_family') || 'FAM-101',
  friends: localStorage.getItem('pairCode_friends') || 'SQUAD-999'
};

let syncChannels = {
  couple: null,
  family: null,
  friends: null
};

function initSyncChannels() {
  if (syncChannels.couple) syncChannels.couple.close();
  syncChannels.couple = new BroadcastChannel(`channel_couple_${pairCodes.couple}`);
  syncChannels.couple.onmessage = (event) => {
    const data = event.data;
    if (data.type === 'TEXT_NOTE') {
      handleIncomingText(data.content);
    } else if (data.type === 'DOODLE_IMG') {
      handleIncomingDoodle(data.content);
    } else if (data.type === 'COUPLE_PROFILE_UPDATE') {
      applyCoupleProfile(data.payload, false);
      speakEnglish("Partner updated profile photo and name!");
    }
  };

  if (syncChannels.family) syncChannels.family.close();
  syncChannels.family = new BroadcastChannel(`channel_family_${pairCodes.family}`);
  syncChannels.family.onmessage = (event) => {
    const data = event.data;
    if (data.type === 'FAMILY_SYNC') {
      applyFamilyData(data.payload, false);
    } else if (data.type === 'FAMILY_NOTE_ADD') {
      applyNewFamilyNote(data.payload, false);
      triggerFamilyVoice();
    } else if (data.type === 'FAMILY_NOTE_DELETE') {
      removeFamilyNoteFromUI(data.payload, false);
    }
  };

  if (syncChannels.friends) syncChannels.friends.close();
  syncChannels.friends = new BroadcastChannel(`channel_friends_${pairCodes.friends}`);
  syncChannels.friends.onmessage = (event) => {
    const data = event.data;
    if (data.type === 'FRIENDS_SYNC') {
      applyFriendsData(data.payload, false);
    } else if (data.type === 'FRIENDS_NOTE_ADD') {
      applyNewFriendsNote(data.payload, false);
      triggerFriendsVoice();
    } else if (data.type === 'FRIENDS_NOTE_DELETE') {
      removeFriendsNoteFromUI(data.payload, false);
    }
  };
}

function sendTextNote() {
  const input = document.getElementById('liveNoteInput');
  const text = input.value.trim();
  if (!text) return;

  const payload = { type: 'TEXT_NOTE', content: text, time: Date.now() };
  if (syncChannels.couple) syncChannels.couple.postMessage(payload);

  renderPartnerText(text, true);
  input.value = '';
}

function sendDoodle() {
  const canvas = document.getElementById('doodleCanvas');
  if (!canvas) return;
  const imageData = canvas.toDataURL('image/png');

  const payload = { type: 'DOODLE_IMG', content: imageData, time: Date.now() };
  if (syncChannels.couple) syncChannels.couple.postMessage(payload);

  renderPartnerDoodle(imageData, true);
  closeDrawModal();
}

function handleIncomingText(text) {
  renderPartnerText(text, false);
  playNoteReceivedVoice();
}

function handleIncomingDoodle(imgData) {
  renderPartnerDoodle(imgData, false);
  playDoodleReceivedVoice();
}

function renderPartnerText(text, isMe) {
  const display = document.getElementById('partnerDisplayArea');
  if (display) {
    display.innerHTML = `<div class="partner-message-text">"${text}"<br><small style="font-size:11px;color:#888;">${isMe ? '(သင် ပို့ခဲ့သည်)' : '(ချစ်သူဆီမှ)'}</small></div>`;
  }
}

function renderPartnerDoodle(imgData, isMe) {
  const display = document.getElementById('partnerDisplayArea');
  if (display) {
    display.innerHTML = `<img src="${imgData}" alt="Doodle" /><br><small style="font-size:11px;color:#888;">${isMe ? '(သင် ပို့ခဲ့သည်)' : '(ချစ်သူဆီမှ)'}</small>`;
  }
}