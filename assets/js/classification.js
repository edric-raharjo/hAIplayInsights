/**
 * Image Classification Demo - Ball Detection (Embedded version)
 */

let classificationState = {
  demoData: null,
  currentImageIndex: 0,
  userLabels: [],
  confusionMatrix: { tp: 0, tn: 0, fp: 0, fn: 0 }
};

async function initClassification() {
  try {
    classificationState.demoData = await loadJSON('data/classification_demo.json');
    classificationState.userLabels = new Array(classificationState.demoData.session.length).fill(null);
    
    document.getElementById('btnBall').addEventListener('click', () => classificationLabelImage(1));
    document.getElementById('btnNotBall').addEventListener('click', () => classificationLabelImage(0));
    document.getElementById('btnSubmit').addEventListener('click', classificationSubmitAnswers);
    
    classificationShowImage(0);
  } catch (error) {
    console.error('Failed to initialize Classification demo:', error);
  }
}

function classificationShowImage(index) {
  if (!classificationState.demoData || index < 0 || index >= classificationState.demoData.session.length) {
    return;
  }
  
  classificationState.currentImageIndex = index;
  const imageData = classificationState.demoData.session[index];
  const imageDisplay = document.getElementById('classificationImageDisplay') || document.getElementById('imageDisplay');
  
  imageDisplay.innerHTML = '';
  
  const slideContainer = document.createElement('div');
  slideContainer.style.display = 'flex';
  slideContainer.style.flexDirection = 'column';
  slideContainer.style.alignItems = 'center';
  slideContainer.style.justifyContent = 'center';
  slideContainer.style.height = '100%';
  slideContainer.style.textAlign = 'center';
  slideContainer.style.padding = '2rem';
  slideContainer.style.animation = 'fadeIn 0.3s ease-in';

  // Story text (Officer Doggo)
  const storyText = document.createElement('h3');
  storyText.textContent = imageData.story_text || "Officer Doggo is inspecting an item...";
  storyText.style.color = '#1f2937';
  storyText.style.marginBottom = '1.5rem';
  storyText.style.fontSize = '1.25rem';
  slideContainer.appendChild(storyText);

  // Emoji instead of image
  const emojiDisplay = document.createElement('div');
  emojiDisplay.textContent = imageData.emoji || '📦';
  emojiDisplay.style.fontSize = '8rem';
  emojiDisplay.style.lineHeight = '1';
  emojiDisplay.style.margin = '1rem 0';
  emojiDisplay.style.filter = 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))';
  slideContainer.appendChild(emojiDisplay);

  const characterFace = document.createElement('div');
  characterFace.textContent = '🐕';
  characterFace.style.fontSize = '3rem';
  characterFace.style.marginTop = '1rem';
  slideContainer.appendChild(characterFace);
  
  const trackerContainer = document.createElement('div');
  trackerContainer.style.display = 'flex';
  trackerContainer.style.gap = '2rem';
  trackerContainer.style.marginTop = '1.5rem';
  
  const ballsLabeled = classificationState.userLabels.map((l, i) => l === 1 ? (classificationState.demoData.session[i].emoji || '📦') : '').join('');
  const ballTracker = document.createElement('div');
  ballTracker.style.padding = '10px';
  ballTracker.style.border = '2px solid #ef4444';
  ballTracker.style.borderRadius = '8px';
  ballTracker.style.minWidth = '120px';
  ballTracker.innerHTML = `<span style="font-size:0.9rem;font-weight:bold;color:#ef4444;margin-bottom:5px;display:block;">History (Ball)</span><div style="font-size:1.5rem;display:flex;flex-wrap:wrap;gap:4px;justify-content:center;max-width:150px;">${ballsLabeled}</div>`;

  const notBallsLabeled = classificationState.userLabels.map((l, i) => l === 0 ? (classificationState.demoData.session[i].emoji || '📦') : '').join('');
  const notBallTracker = document.createElement('div');
  notBallTracker.style.padding = '10px';
  notBallTracker.style.border = '2px solid #6b7280';
  notBallTracker.style.borderRadius = '8px';
  notBallTracker.style.minWidth = '120px';
  notBallTracker.innerHTML = `<span style="font-size:0.9rem;font-weight:bold;color:#6b7280;margin-bottom:5px;display:block;">History (Not Ball)</span><div style="font-size:1.5rem;display:flex;flex-wrap:wrap;gap:4px;justify-content:center;max-width:150px;">${notBallsLabeled}</div>`;

  trackerContainer.appendChild(ballTracker);
  trackerContainer.appendChild(notBallTracker);
  slideContainer.appendChild(trackerContainer);

  imageDisplay.appendChild(slideContainer);

  const progressText = document.createElement('p');
  progressText.textContent = `Slide ${index + 1} / ${classificationState.demoData.session.length}`;
  progressText.style.marginTop = '12px';
  progressText.style.color = '#6b7280';
  progressText.style.fontSize = '14px';
  imageDisplay.appendChild(progressText);

  // Check how many labels
  const labeledCount = classificationState.userLabels.filter(l => l !== null).length;
  
  // Auto-advance styling
  document.getElementById('btnSubmit').disabled = labeledCount < 6 && index < classificationState.demoData.session.length - 1;

  updateClassificationButtonStates();
}

function updateClassificationButtonStates() {
  const userLabel = classificationState.userLabels[classificationState.currentImageIndex];
  const ballBtn = document.getElementById('btnBall');
  const notballBtn = document.getElementById('btnNotBall');

  ballBtn.classList.remove('btn-secondary');
  notballBtn.classList.remove('btn-secondary');
  
  if (userLabel === 1) {
    ballBtn.classList.add('btn-secondary');
  } else if (userLabel === 0) {
    notballBtn.classList.add('btn-secondary');
  }
}

function classificationLabelImage(label) {
  classificationState.userLabels[classificationState.currentImageIndex] = label;
  
  updateClassificationButtonStates();
  
  const labeledCount = classificationState.userLabels.filter(l => l !== null).length;
  document.getElementById('btnSubmit').disabled = labeledCount < 6;
  
  if (classificationState.currentImageIndex < classificationState.demoData.session.length - 1) {
    setTimeout(() => {
      classificationShowImage(classificationState.currentImageIndex + 1);
    }, 200);
  }
}

function classificationSubmitAnswers() {
  const labeledCount = classificationState.userLabels.filter(label => label !== null).length;
  if (labeledCount < 6) {
    alert('Please label at least 6 items before submitting.');
    return;
  }

  classificationState.confusionMatrix = { tp: 0, tn: 0, fp: 0, fn: 0 };

  classificationState.demoData.session.forEach((imageData, i) => {
    const prediction = classificationState.userLabels[i];
    if (prediction === null) return;
    
    const actual = imageData.ground_truth;

    if (prediction === 1 && actual === 1) classificationState.confusionMatrix.tp++;
    else if (prediction === 0 && actual === 0) classificationState.confusionMatrix.tn++;
    else if (prediction === 1 && actual === 0) classificationState.confusionMatrix.fp++;
    else if (prediction === 0 && actual === 1) classificationState.confusionMatrix.fn++;
  });
  
  classificationShowResults();
}

function classificationShowResults() {
  const { tp, tn, fp, fn } = classificationState.confusionMatrix;
  const total = tp + tn + fp + fn;
  const accuracy = ((tp + tn) / total * 100).toFixed(2);
  const precision = (tp / (tp + fp) * 100).toFixed(2);
  const recall = (tp / (tp + fn) * 100).toFixed(2);
  
  const display = document.getElementById('classificationImageDisplay') || document.getElementById('imageDisplay');
  display.innerHTML = `
    <div style="text-align: center; padding: 20px; background: #f9fafb; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #1f2937;">Your Results</h3>
      <div style="margin: 20px 0;">
        <p style="font-size: 24px; font-weight: bold; color: #2563eb; margin: 10px 0;">${accuracy}% Accuracy</p>
        <p style="color: #10b981; margin: 5px 0;">Right: ${tp + tn} / ${total}</p>
        <p style="color: #ef4444; margin: 5px 0;">Wrong: ${fp + fn} / ${total}</p>
      </div>
    </div>
  `;
  
  document.getElementById('btnBall').style.display = 'none';
  document.getElementById('btnNotBall').style.display = 'none';
  document.getElementById('btnSubmit').style.display = 'none';
}





