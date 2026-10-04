function speakEnglish(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1.1;
  window.speechSynthesis.speak(utterance);
}

function initNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function showSystemNotification(title, body, targetSpace) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    const noti = new Notification(title, {
      body: body,
      icon: 'favicon.ico',
      vibrate: [200, 100, 200]
    });
    noti.onclick = () => {
      window.focus();
      if (targetSpace && typeof switchSpace === 'function') {
        switchSpace(targetSpace);
      }
    };
  } else if (Notification.permission === 'default') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        showSystemNotification(title, body, targetSpace);
      }
    });
  }
}

function playNoteReceivedVoice() {
  speakEnglish("I love you");
  showSystemNotification("💖 Loved Ones (Couple)", "ချစ်သူဆီမှ စာတိုအသစ် ရောက်ရှိလာပါသည်", "couple");
}

function playDoodleReceivedVoice() {
  speakEnglish("I love you");
  showSystemNotification("💖 Loved Ones (Couple)", "ချစ်သူဆီမှ ပုံဆွဲအသစ် ရောက်ရှိလာပါသည်", "couple");
}

function triggerFamilyVoice() {
  speakEnglish("Hello everyone");
  showSystemNotification("🏡 Loved Ones (Family)", "မိသားစု Sticky Note အသစ် ရောက်ရှိလာပါသည်", "family");
}

function triggerFriendsVoice() {
  speakEnglish("Hello my friends");
  showSystemNotification("✨ Loved Ones (Friends)", "သူငယ်ချင်း Squad Message အသစ် ရောက်ရှိလာပါသည်", "friends");
}

let lastAnnouncedMilestone = null;

function checkAndTriggerMilestoneVoice(daysLeft, milestoneTarget) {
  const milestoneKey = `${milestoneTarget}_${daysLeft}`;
  if (lastAnnouncedMilestone === milestoneKey) return;

  if (daysLeft === 30) {
    speakEnglish(`One month left until our ${milestoneTarget} days anniversary`);
    lastAnnouncedMilestone = milestoneKey;
  } else if (daysLeft === 7) {
    speakEnglish(`One week left until our ${milestoneTarget} days anniversary`);
    lastAnnouncedMilestone = milestoneKey;
  } else if (daysLeft === 3) {
    speakEnglish(`Three days left until our ${milestoneTarget} days anniversary`);
    lastAnnouncedMilestone = milestoneKey;
  } else if (daysLeft === 1) {
    speakEnglish(`Tomorrow is our ${milestoneTarget} days anniversary`);
    lastAnnouncedMilestone = milestoneKey;
  } else if (daysLeft === 0) {
    speakEnglish(`Happy ${milestoneTarget} days anniversary! I love you so much!`);
    lastAnnouncedMilestone = milestoneKey;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initNotificationPermission();
});