/**
 * K-Means Clustering Interactive Demo
 */

let demoData = null;
let currentStep = 0;
let isAutoPlaying = false;
let autoPlayInterval = null;

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#a855f7', '#ec4899', '#6366f1', '#14b8a6'];

async function init() {
  try {
    // Load demo data
    demoData = await loadJSON('../../data/kmeans_demo.json');
    
    // Set up event listeners
    document.getElementById('btnNext').addEventListener('click', nextStep);
    document.getElementById('btnPrevious').addEventListener('click', previousStep);
    document.getElementById('btnReset').addEventListener('click', resetDemo);
    document.getElementById('btnAutoPlay').addEventListener('click', toggleAutoPlay);
    
    // Initial render
    renderStep(0);
  } catch (error) {
    console.error('Failed to initialize demo:', error);
    alert('Failed to load demo data. Please check the console.');
  }
}

function renderStep(stepIndex) {
  if (!demoData || stepIndex < 0 || stepIndex >= demoData.steps.length) {
    return;
  }
  
  currentStep = stepIndex;
  const step = demoData.steps[stepIndex];
  
  // Update UI elements
  document.getElementById('stepDescription').textContent = step.description;
  document.getElementById('statPoints').textContent = step.points.length;
  document.getElementById('statClusters').textContent = demoData.metadata.k;
  document.getElementById('statIteration').textContent = step.iteration;
  document.getElementById('statPhase').textContent = step.phase;
  
  // Update progress
  const progress = ((stepIndex + 1) / demoData.steps.length) * 100;
  document.getElementById('progressFill').style.width = progress + '%';
  document.getElementById('progressText').textContent = `${stepIndex + 1} / ${demoData.steps.length}`;
  
  // Update button states
  document.getElementById('btnPrevious').disabled = stepIndex === 0;
  document.getElementById('btnNext').disabled = stepIndex === demoData.steps.length - 1;
  
  // Render canvas
  drawVisualization(step);
}

function drawVisualization(step) {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const padding = 50;
  const width = canvas.width - 2 * padding;
  const height = canvas.height - 2 * padding;
  
  // Clear canvas
  ctx.fillStyle = '#fafafa';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw grid
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 10; i++) {
    const x = padding + (width / 10) * i;
    const y = padding + (height / 10) * i;
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, canvas.height - padding);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(canvas.width - padding, y);
    ctx.stroke();
  }
  
  // Draw axes
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.stroke();
  
  // Helper to convert data coordinates to canvas coordinates
  const toCanvasX = (x) => padding + (x / 100) * width;
  const toCanvasY = (y) => canvas.height - padding - (y / 100) * height;
  
  // Draw data points
  step.points.forEach((point, idx) => {
    const canvasX = toCanvasX(point[0]);
    const canvasY = toCanvasY(point[1]);
    
    // Get cluster color if point is assigned
    let color = '#d1d5db';
    if (step.assignments[idx] !== null && step.assignments[idx] !== undefined) {
      color = COLORS[step.assignments[idx] % COLORS.length];
    }
    
    // Draw point
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, 5, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw point border
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
  
  // Draw centers
  step.centers.forEach((center, idx) => {
    const canvasX = toCanvasX(center[0]);
    const canvasY = toCanvasY(center[1]);
    
    // Draw center as a larger circle with special marking
    ctx.fillStyle = COLORS[idx % COLORS.length];
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw center border
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw inner circle
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, 3, 0, 2 * Math.PI);
    ctx.fill();
  });
  
  // Draw labels
  ctx.fillStyle = '#6b7280';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 5; i++) {
    ctx.fillText((i * 20).toString(), padding - 10, canvas.height - padding - (height / 5) * i + 4);
  }
  ctx.textAlign = 'center';
  for (let i = 0; i <= 5; i++) {
    ctx.fillText((i * 20).toString(), padding + (width / 5) * i, canvas.height - padding + 15);
  }
}

function nextStep() {
  if (currentStep < demoData.steps.length - 1) {
    renderStep(currentStep + 1);
  }
}

function previousStep() {
  if (currentStep > 0) {
    renderStep(currentStep - 1);
  }
}

function resetDemo() {
  stopAutoPlay();
  renderStep(0);
}

function toggleAutoPlay() {
  if (isAutoPlaying) {
    stopAutoPlay();
  } else {
    startAutoPlay();
  }
}

function startAutoPlay() {
  isAutoPlaying = true;
  document.getElementById('btnAutoPlay').classList.add('btn-secondary');
  document.getElementById('btnAutoPlay').textContent = '⏸ Stop';
  
  autoPlayInterval = setInterval(() => {
    if (currentStep < demoData.steps.length - 1) {
      nextStep();
    } else {
      stopAutoPlay();
    }
  }, 1500); // 1.5 seconds per step
}

function stopAutoPlay() {
  isAutoPlaying = false;
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
  }
  document.getElementById('btnAutoPlay').classList.remove('btn-secondary');
  document.getElementById('btnAutoPlay').textContent = 'Auto Play';
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init);
