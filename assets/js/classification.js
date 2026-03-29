/**
 * Classification Training Interactive Demo
 */

let demoData = null;
let currentImageIndex = 0;
let userLabels = {};  // Maps image id to user's label (0 or 1)

async function init() {
  try {
    // Load demo data
    demoData = await loadJSON('../../data/classification_demo.json');
    
    // Set up event listeners
    document.getElementById('btnBomb').addEventListener('click', () => labelImage(1));
    document.getElementById('btnNotBomb').addEventListener('click', () => labelImage(0));
    document.getElementById('btnSubmit').addEventListener('click', submitAndShowResults);
    
    // Load first image
    loadImage(0);
  } catch (error) {
    console.error('Failed to initialize demo:', error);
    alert('Failed to load demo data. Please check the console.');
  }
}

function loadImage(index) {
  if (!demoData || index < 0 || index >= demoData.session.length) {
    return;
  }
  
  currentImageIndex = index;
  const item = demoData.session[index];
  
  const imageDisplay = document.getElementById('imageDisplay');
  const imagePath = `../../assets/images/${item.image_dir}/${item.image_path}`;
  
  // Clear and load new image
  imageDisplay.innerHTML = '<div class="image-loading">Loading image...</div>';
  
  const img = new Image();
  img.onload = () => {
    imageDisplay.innerHTML = '';
    imageDisplay.appendChild(img);
  };
  img.onerror = () => {
    imageDisplay.innerHTML = `<div class="image-loading" style="color: var(--danger-color);">Error loading image</div>`;
  };
  img.src = imagePath;
  
  // Update progress
  updateProgress();
}

function labelImage(label) {
  const item = demoData.session[currentImageIndex];
  userLabels[item.id] = label;
  item.labeled = true;
  item.student_label = label;
  
  // Update accuracy
  updateProgress();
  
  // Move to next unlabeled image
  let nextIndex = currentImageIndex + 1;
  while (nextIndex < demoData.session.length && demoData.session[nextIndex].labeled) {
    nextIndex++;
  }
  
  if (nextIndex < demoData.session.length) {
    loadImage(nextIndex);
  } else {
    // All images labeled, show submit button prominence
    document.getElementById('btnBomb').disabled = true;
    document.getElementById('btnNotBomb').disabled = true;
  }
}

function updateProgress() {
  const labeled = Object.keys(userLabels).length;
  const total = demoData.session.length;
  
  // Update counter
  document.getElementById('progressCounter').textContent = `${labeled} / ${total}`;
  
  // Update progress bar
  const progress = (labeled / total) * 100;
  document.getElementById('progressBarFill').style.width = progress + '%';
  
  // Calculate current accuracy
  if (labeled > 0) {
    let correct = 0;
    for (const id in userLabels) {
      const item = demoData.session.find(x => x.id == id);
      if (item && userLabels[id] === item.ground_truth) {
        correct++;
      }
    }
    const accuracy = Math.round((correct / labeled) * 100);
    document.getElementById('currentAccuracy').textContent = accuracy + '%';
  }
}

function submitAndShowResults() {
  // Calculate metrics
  let tp = 0;  // True positives: predicted bomb, actually bomb
  let tn = 0;  // True negatives: predicted not bomb, actually not bomb
  let fp = 0;  // False positives: predicted bomb, actually not bomb
  let fn = 0;  // False negatives: predicted not bomb, actually bomb
  
  let correct = 0;
  let total = 0;
  
  demoData.session.forEach(item => {
    if (item.id in userLabels) {
      total++;
      const predicted = userLabels[item.id];
      const actual = item.ground_truth;
      
      if (predicted === actual) {
        correct++;
      }
      
      // Confusion matrix
      if (actual === 1) {  // Bomb
        if (predicted === 1) {
          tp++;
        } else {
          fn++;
        }
      } else {  // Not bomb
        if (predicted === 1) {
          fp++;
        } else {
          tn++;
        }
      }
    }
  });
  
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  
  // Update results display
  document.getElementById('finalAccuracy').textContent = accuracy + '%';
  document.getElementById('totalLabeled').textContent = total;
  document.getElementById('correctCount').textContent = correct;
  document.getElementById('incorrectCount').textContent = total - correct;
  
  // Update confusion matrix
  document.getElementById('tp').textContent = tp;
  document.getElementById('tn').textContent = tn;
  document.getElementById('fp').textContent = fp;
  document.getElementById('fn').textContent = fn;
  
  // Hide labeling interface, show results
  document.querySelector('.classification-container').style.display = 'none';
  document.getElementById('resultsContainer').classList.add('show');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init);
