/**
 * K-Means Clustering Interactive Demo
 */

let kmeansState = {
  demoData: null,
  currentStep: 0,
  isAutoPlaying: false,
  autoPlayInterval: null
};

const KMEANS_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#a855f7', '#ec4899', '#6366f1', '#14b8a6'];

async function initKmeans() {
  try {
    const btnInit = document.getElementById('kmeansBtnInit');
    if (!btnInit) {
      setTimeout(initKmeans, 500);
      return;
    }
    kmeansState.demoData = await loadJSON('data/kmeans_demo.json');
    document.getElementById('kmeansBtnInit').addEventListener('click', () => kmeansJumpToPhase('initialize'));
    document.getElementById('kmeansBtnAssign').addEventListener('click', () => kmeansJumpToPhase('assign'));
    document.getElementById('kmeansBtnCenter').addEventListener('click', () => kmeansJumpToPhase('update'));
    kmeansRenderStep(0);
  } catch (error) {
    console.error('Failed to initialize K-means demo:', error);
  }
}

function kmeansJumpToPhase(targetPhase) {
  if (!kmeansState.demoData) return;
  if (targetPhase === 'initialize') { kmeansRenderStep(0); return; }
  let nextIdx = kmeansState.currentStep + 1;
  while(nextIdx < kmeansState.demoData.steps.length) {
    if(kmeansState.demoData.steps[nextIdx].phase === targetPhase) { kmeansRenderStep(nextIdx); return; }
    nextIdx++;
  }
  let wrapIdx = 0;
  while(wrapIdx <= kmeansState.currentStep && wrapIdx < kmeansState.demoData.steps.length) {
    if(kmeansState.demoData.steps[wrapIdx].phase === targetPhase) { kmeansRenderStep(wrapIdx); return; }
    wrapIdx++;
  }
}

function kmeansRenderStep(stepIndex) {
  if (!kmeansState.demoData || stepIndex < 0 || stepIndex >= kmeansState.demoData.steps.length) return;
  
  kmeansState.currentStep = stepIndex;
  const step = kmeansState.demoData.steps[stepIndex];

  document.getElementById('kmeansStepDescription').textContent = step.description;
  document.getElementById('kmeansStatPoints').textContent = step.points.length;
  document.getElementById('kmeansStatClusters').textContent = kmeansState.demoData.metadata.k;
  document.getElementById('kmeansStatIteration').textContent = step.iteration;
  document.getElementById('kmeansStatPhase').textContent = step.phase;

  const progress = ((stepIndex + 1) / kmeansState.demoData.steps.length) * 100;
  document.getElementById('kmeansProgressFill').style.width = progress + '%';
  document.getElementById('kmeansProgressText').textContent = `${stepIndex + 1} / ${kmeansState.demoData.steps.length}`;


  const canvas = document.getElementById('kmeansCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const padding = 50;
  const width = canvas.width - 2 * padding;
  const height = canvas.height - 2 * padding;

  ctx.fillStyle = '#fafafa';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 10; i++) {
    const x = padding + (width / 10) * i;
    const y = padding + (height / 10) * i;
    ctx.beginPath(); ctx.moveTo(x, padding); ctx.lineTo(x, canvas.height - padding); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(canvas.width - padding, y); ctx.stroke();
  }

  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(padding, canvas.height - padding); ctx.lineTo(canvas.width - padding, canvas.height - padding); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(padding, padding); ctx.lineTo(padding, canvas.height - padding); ctx.stroke();

  const toCanvasX = (x) => padding + (x / 100) * width;
  const toCanvasY = (y) => canvas.height - padding - (y / 100) * height;

  step.points.forEach((point, idx) => {
    const canvasX = toCanvasX(point[0]);
    const canvasY = toCanvasY(point[1]);
    let color = '#d1d5db';
    if (step.assignments && step.assignments[idx] !== null && step.assignments[idx] !== undefined) {
      color = KMEANS_COLORS[step.assignments[idx] % KMEANS_COLORS.length];
    }
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(canvasX, canvasY, 5, 0, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 1; ctx.stroke();
  });

  if (step.centers) {
    step.centers.forEach((center, idx) => {
      const canvasX = toCanvasX(center[0]);
      const canvasY = toCanvasY(center[1]);
      ctx.fillStyle = KMEANS_COLORS[idx % KMEANS_COLORS.length];
      ctx.beginPath(); ctx.arc(canvasX, canvasY, 8, 0, 2 * Math.PI); ctx.fill();
      ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(canvasX, canvasY, 3, 0, 2 * Math.PI); ctx.fill();
    });
  }

  ctx.fillStyle = '#6b7280'; ctx.font = '12px sans-serif'; ctx.textAlign = 'right';
  for (let i = 0; i <= 5; i++) {
    ctx.fillText((i * 20).toString(), padding - 10, canvas.height - padding - (height / 5) * i + 4);
  }
  ctx.textAlign = 'center';
  for (let i = 0; i <= 5; i++) {
    ctx.fillText((i * 20).toString(), padding + (width / 5) * i, canvas.height - padding + 15);
  }
}

function kmeansPreviousStep() {
  if (kmeansState.currentStep > 0) kmeansRenderStep(kmeansState.currentStep - 1);
}

function kmeansNextStep() {
  if (kmeansState.currentStep < kmeansState.demoData.steps.length - 1) kmeansRenderStep(kmeansState.currentStep + 1);
}

function kmeansResetDemo() {
  kmeansStopAutoPlay();
  kmeansRenderStep(0);
}

function kmeansToggleAutoPlay() {
  if (kmeansState.isAutoPlaying) {
    kmeansStopAutoPlay();
  } else {
    kmeansStartAutoPlay();
  }
}

function kmeansStartAutoPlay() {
  kmeansState.isAutoPlaying = true;
  document.getElementById('kmeansBtnAutoPlay').textContent = '? Stop';
  kmeansState.autoPlayInterval = setInterval(() => {
    if (kmeansState.currentStep < kmeansState.demoData.steps.length - 1) {
      kmeansRenderStep(kmeansState.currentStep + 1);
    } else {
      kmeansStopAutoPlay();
    }
  }, 1000);
}

function kmeansStopAutoPlay() {
  kmeansState.isAutoPlaying = false;
  if (kmeansState.autoPlayInterval) {
    clearInterval(kmeansState.autoPlayInterval);
    kmeansState.autoPlayInterval = null;
  }
  let btn = document.getElementById('kmeansBtnAutoPlay');
  if(btn) btn.textContent = 'Auto Play';
}

