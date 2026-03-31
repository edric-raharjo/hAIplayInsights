let classificationState = {
  demoData: null,
  currentImageIndex: 0,
  userLabels: [],
  confusionMatrix: { tp: 0, tn: 0, fp: 0, fn: 0 }
};

async function initClassification() {
  try {
    const btnBall = document.getElementById('btnBall');
    if (!btnBall) {
      setTimeout(initClassification, 500);
      return;
    }

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

function classificationLabelImage(label) {
  classificationState.userLabels[classificationState.currentImageIndex] = label;
  
  if (classificationState.currentImageIndex < classificationState.demoData.session.length - 1) {
    classificationShowImage(classificationState.currentImageIndex + 1);
  } else {
    const container = document.getElementById('imageDisplay');
    container.innerHTML = '<div style="text-align:center;"><h3>All items labeled!</h3><p>Click "Train Model & Test" to evaluate on the unseen Test Set.</p></div>';
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

  const progressText = document.createElement('p');
  progressText.textContent = `Training Item ${index + 1} / ${classificationState.demoData.session.length}`;
  progressText.style.marginBottom = '12px';
  progressText.style.color = '#6b7280';
  progressText.style.fontSize = '14px';
  progressText.style.fontWeight = 'bold';
  slideContainer.appendChild(progressText);

  // Story text
  const storyText = document.createElement('h3');
  storyText.textContent = imageData.story_text || "Is this a ball?";
  storyText.style.color = '#1f2937';
  storyText.style.marginBottom = '1.5rem';
  storyText.style.fontSize = '1.25rem';
  slideContainer.appendChild(storyText);

  // Emoji instead of image
  const emojiDisplay = document.createElement('div');
  emojiDisplay.textContent = imageData.emoji || '❓';
  emojiDisplay.style.fontSize = '6rem';
  emojiDisplay.style.lineHeight = '1';
  emojiDisplay.style.margin = '1rem 0';
  emojiDisplay.style.filter = 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))';
  slideContainer.appendChild(emojiDisplay);

  const trackerContainer = document.createElement('div');
  trackerContainer.style.display = 'flex';
  trackerContainer.style.gap = '2rem';
  trackerContainer.style.marginTop = '1.5rem';

  const ballsLabeled = classificationState.userLabels.map((l, i) => l === 1 ? (classificationState.demoData.session[i].emoji || '❓') : '').join('');
  const ballTracker = document.createElement('div');
  ballTracker.style.padding = '10px';
  ballTracker.style.border = '2px solid #ef4444';
  ballTracker.style.borderRadius = '8px';
  ballTracker.style.minWidth = '120px';
  ballTracker.innerHTML = `<span style="font-size:0.9rem;font-weight:bold;color:#ef4444;margin-bottom:5px;display:block;">Taught as Ball</span><div style="font-size:1.5rem;display:flex;flex-wrap:wrap;gap:4px;justify-content:center;max-width:150px;">${ballsLabeled}</div>`;

  const notBallsLabeled = classificationState.userLabels.map((l, i) => l === 0 ? (classificationState.demoData.session[i].emoji || '❓') : '').join('');
  const notBallTracker = document.createElement('div');
  notBallTracker.style.padding = '10px';
  notBallTracker.style.border = '2px solid #10b981';
  notBallTracker.style.borderRadius = '8px';
  notBallTracker.style.minWidth = '120px';
  notBallTracker.innerHTML = `<span style="font-size:0.9rem;font-weight:bold;color:#10b981;margin-bottom:5px;display:block;">Taught as Not Ball</span><div style="font-size:1.5rem;display:flex;flex-wrap:wrap;gap:4px;justify-content:center;max-width:150px;">${notBallsLabeled}</div>`;

  trackerContainer.appendChild(ballTracker);
  trackerContainer.appendChild(notBallTracker);
  slideContainer.appendChild(trackerContainer);

  imageDisplay.appendChild(slideContainer);
}

// Simple KNN Prediction
function euclideanDistance(a, b) {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}

function predictKNN(testFeatures, trainData, k=3) {
    let distances = trainData.map(trainPoint => ({
        label: trainPoint.label,
        dist: euclideanDistance(testFeatures, trainPoint.features)
    }));
    distances.sort((a, b) => a.dist - b.dist);
    
    let kNearest = distances.slice(0, k);
    let score = 0;
    kNearest.forEach(pt => { if (pt.label === 1) score++; });
    return score > k/2 ? 1 : 0;
}

function classificationSubmitAnswers() {
  const labeledData = [];
  classificationState.userLabels.forEach((label, i) => {
      if (label !== null) {
          labeledData.push({
              features: classificationState.demoData.session[i].features,
              label: label // THIS IS WHAT THE USER TAUGHT IT! Garbage In -> Garbage Out
          });
      }
  });
  
  if (labeledData.length < 3) {
      alert('Please label at least 3 items to compile a training set.');
      return;
  }

  classificationState.confusionMatrix = { tp: 0, tn: 0, fp: 0, fn: 0 };
  
  // Test on unseen test_set !
  const testSet = classificationState.demoData.test_set;
  let testResultsHTML = '<div style="display:flex; flex-wrap:wrap; justify-content:center; gap: 10px; margin: 15px 0;">';
  
  // Actually tracking correctly for test set metrics (comparing prediction against actual ground truth)
  testSet.forEach(imageData => {
      const pred = predictKNN(imageData.features, labeledData, 3);
      const actual = imageData.ground_truth; // The REAL objective label
      
      let resColor = '';
      if (pred === actual) {
          resColor = '#10b981'; // green for correct prediction
          if (pred === 1) classificationState.confusionMatrix.tp++;
          else classificationState.confusionMatrix.tn++;
      } else {
           resColor = '#ef4444'; // red for wrong prediction
           if (pred === 1) classificationState.confusionMatrix.fp++;
           else classificationState.confusionMatrix.fn++;
      }
      
      // Highlight the test emoji based on whether the model got it right or wrong.
      testResultsHTML += `<div style="display:flex; flex-direction:column; align-items:center; border: 2px solid ${resColor}; border-radius: 8px; padding: 8px; background: white;">
          <div style="font-size:2rem; line-height: 1;">${imageData.emoji}</div>
          <div style="font-size:0.75rem; color: #64748b; margin-top:4px;">Pred: ${pred===1 ? 'Ball' : 'Not'}</div>
          <div style="font-size:0.75rem; font-weight:bold; color: ${resColor};">Act: ${actual===1 ? 'Ball' : 'Not'}</div>
       </div>`;
  });
  testResultsHTML += '</div>';

  classificationShowResults(testResultsHTML);
}

function classificationShowResults(testHtml) {
  const { tp, tn, fp, fn } = classificationState.confusionMatrix;
  const total = tp + tn + fp + fn;
  const accuracy = ((tp + tn) / total * 100).toFixed(2);

  const display = document.getElementById('classificationImageDisplay') || document.getElementById('imageDisplay');
  display.innerHTML = `
    <div style="text-align: center; padding: 20px; background: #f9fafb; border-radius: 8px; width: 100%; height: 100%; overflow-y: auto;">
      <h2 style="margin-top: 0; color: #1f2937;">Testing on Unseen Data</h2>
      <p style="color: #64748b; font-size: 1rem; margin-bottom: 15px;">
        Model trained on <strong>${classificationState.userLabels.filter(x => x!==null).length}</strong> user-labeled items.<br/>
        <em>If you labeled a lot of fruits as "balls", the model learned that feature pattern and will fail! (Garbage In = Garbage Out)</em>
      </p>
      
      ${testHtml}
      
      <div style="margin: 20px 0; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 28px; font-weight: bold; color: ${accuracy > 80 ? '#10b981' : (accuracy > 50 ? '#f59e0b' : '#ef4444')}; margin: 10px 0;">${accuracy}% Accuracy on Test Set</p>
        <div style="display:flex; justify-content: center; gap: 2rem; margin-top: 10px;">
           <div style="color: #10b981; font-size: 1.2rem; font-weight: 500;">✅ Correct: ${tp + tn}</div>
           <div style="color: #ef4444; font-size: 1.2rem; font-weight: 500;">❌ Incorrect: ${fp + fn}</div>
        </div>
      </div>
      <button onclick="location.reload()" class="btn btn-primary" style="margin-top:20px; padding: 10px 20px; font-size: 1.1rem; cursor:pointer;">Reset & Train Again</button>
    </div>
  `;

  document.getElementById('btnBall').style.display = 'none';
  document.getElementById('btnNotBall').style.display = 'none';
  document.getElementById('btnSubmit').style.display = 'none';
  
  // Also change the intro text slightly context
  const taskCard = document.querySelector('.task-card');
  if(taskCard) taskCard.style.display = 'none';
}
