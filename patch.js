const fs = require('fs');
let code = fs.readFileSync('e:/Files/Projects/HAIplay/insights/assets/js/kmeans.js', 'utf8');
const regex = /async function initKmeans\(\) \{[\s\S]*?function kmeansRenderStep\(stepIndex\) \{/;
code = code.replace(regex, 
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
function kmeansRenderStep(stepIndex) {.trim());
fs.writeFileSync('e:/Files/Projects/HAIplay/insights/assets/js/kmeans.js', code);
