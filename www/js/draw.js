let canvas, ctx;
let isDrawing = false;
let currentColor = '#ff4d6d';
let brushSize = 5;
let isEraser = false;
let drawHistory = [];

window.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('doodleCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    startDrawing({ offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top });
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    draw({ offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top });
  }, { passive: false });

  canvas.addEventListener('touchend', stopDrawing);

  saveDrawState();
});

function startDrawing(e) {
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

function draw(e) {
  if (!isDrawing) return;
  ctx.lineWidth = brushSize;
  if (isEraser) {
    ctx.strokeStyle = '#ffffff';
  } else {
    ctx.strokeStyle = currentColor;
  }
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
}

function stopDrawing() {
  if (isDrawing) {
    isDrawing = false;
    ctx.closePath();
    saveDrawState();
  }
}

function setDrawColor(color) {
  isEraser = false;
  currentColor = color;
  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.classList.toggle('active', btn.style.background === color || btn.dataset.color === color);
  });
  const eraserBtn = document.getElementById('eraserBtn');
  if (eraserBtn) eraserBtn.classList.remove('active');
}

function setBrushSize(size) {
  brushSize = parseInt(size, 10);
}

function toggleEraser() {
  isEraser = !isEraser;
  const eraserBtn = document.getElementById('eraserBtn');
  if (eraserBtn) {
    eraserBtn.classList.toggle('active', isEraser);
  }
}

function clearCanvas() {
  if (!ctx || !canvas) return;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  saveDrawState();
}

function saveDrawState() {
  if (!canvas) return;
  drawHistory.push(canvas.toDataURL());
  if (drawHistory.length > 20) {
    drawHistory.shift();
  }
}

function undoDraw() {
  if (drawHistory.length <= 1) {
    clearCanvas();
    return;
  }
  drawHistory.pop();
  const prevImg = new Image();
  prevImg.src = drawHistory[drawHistory.length - 1];
  prevImg.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(prevImg, 0, 0);
  };
}

function openDrawModal() {
  const modal = document.getElementById('drawModal');
  if (modal) {
    modal.style.display = 'flex';
    if (drawHistory.length === 0) {
      clearCanvas();
    }
  }
}

function closeDrawModal() {
  const modal = document.getElementById('drawModal');
  if (modal) modal.style.display = 'none';
}