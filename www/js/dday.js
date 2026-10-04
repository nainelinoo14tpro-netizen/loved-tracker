function calculateDetailedDiff(startDateStr) {
  const start = new Date(startDateStr);
  const now = new Date();
  const diffTime = now.getTime() - start.getTime();
  const totalDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonthDays;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { totalDays, years, months, days };
}

function calculateNext100Milestone(totalDays) {
  const currentBlock = Math.floor(totalDays / 100);
  const targetMilestone = (currentBlock + 1) * 100;
  const daysLeft = targetMilestone - totalDays;
  const progressPercent = Math.min(100, Math.max(0, (totalDays % 100)));

  return {
    targetMilestone,
    daysLeft,
    progressPercent
  };
}

function updateDDayUI(startDateStr) {
  if (!startDateStr) return;

  const { totalDays, years, months, days } = calculateDetailedDiff(startDateStr);
  const milestone = calculateNext100Milestone(totalDays);

  const totalDaysEl = document.getElementById('totalLoveDays');
  const detailEl = document.getElementById('loveDaysDetail');
  const milestoneTitleEl = document.getElementById('milestoneTitle');
  const milestoneDaysLeftEl = document.getElementById('milestoneDaysLeft');
  const progressFillEl = document.getElementById('milestoneProgressFill');

  if (totalDaysEl) totalDaysEl.innerText = totalDays;
  if (detailEl) detailEl.innerText = `${years} နှစ်၊ ${months} လ၊ ${days} ရက်`;

  if (milestoneTitleEl) {
    milestoneTitleEl.innerText = `ရက် ${milestone.targetMilestone} ပြည့်ဖို့`;
  }
  if (milestoneDaysLeftEl) {
    milestoneDaysLeftEl.innerText = `${milestone.daysLeft} ရက်လို`;
  }
  if (progressFillEl) {
    progressFillEl.style.width = `${milestone.progressPercent}%`;
  }

  if (typeof checkAndTriggerMilestoneVoice === 'function') {
    checkAndTriggerMilestoneVoice(milestone.daysLeft, milestone.targetMilestone);
  }
}