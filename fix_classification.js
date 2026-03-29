const fs = require('fs');
let html = fs.readFileSync('e:/Files/Projects/HAIplay/insights/demos/classification/index.html', 'utf8');

let startIndex = html.indexOf('<div class="classification-container">');
let endIndex = html.indexOf('<!-- Results Section -->');

if (startIndex === -1 || endIndex === -1) {
    console.error("Tags not found in classification HTML!");
    process.exit(1);
}

let newHtml = `      <div class="classification-container" style="padding: 0; background: transparent; border: none;">
        <div class="demo-content-wrapper" style="display: grid; grid-template-columns: 1fr 350px; gap: 2rem; align-items: start; margin-bottom: 2rem;">
          
          <!-- Image Display -->
          <div class="image-display" id="imageDisplay" style="min-height: 400px; margin-bottom: 0;">
            <div class="image-loading">Loading first image...</div>
          </div>

          <!-- Right Controls -->
          <div class="controls-section" style="background-color: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 1.5rem; display: flex; flex-direction: column; height: 100%; min-height: 400px; box-sizing: border-box;">
            <!-- Instructions -->
            <div class="instructions" style="background-color: #eff6ff; border-left: 4px solid var(--primary-color); padding: 1rem; border-radius: 4px; margin-bottom: 1.5rem; color: #333; font-size: 0.95rem;">
              <strong>📌 Task:</strong> Look at each image and classify it as a <strong>"Ball"</strong> or <strong>"Not Ball"</strong>.
            </div>

            <!-- Progress Info -->
            <div class="progress-info" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding: 1rem; background-color: var(--bg-color); border-radius: 6px;">
              <div class="progress-info-left" style="flex: 1;">
                <div class="progress-counter" id="progressCounter" style="font-weight: 700; font-size: 1.25rem; color: var(--primary-color);">0 / 32</div>     
                <div class="progress-bar-mini" style="height: 6px; background-color: var(--border-color); border-radius: 3px; margin-top: 0.5rem; overflow: hidden;">
                  <div class="progress-bar-fill" id="progressBarFill" style="width: 0%; height: 100%; background-color: var(--primary-color); transition: width 0.3s ease;"></div>
                </div>
              </div>
              <div class="accuracy-badge" style="background-color: var(--secondary-color); color: white; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; font-size: 0.9rem; margin-left: 1rem;">
                Accuracy: <span id="currentAccuracy">0%</span>
              </div>
            </div>

            <div style="flex-grow: 1;"></div>

            <!-- Control Buttons -->
            <div class="button-group-large" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: auto; margin-bottom: 1rem; padding-top: 1rem;">
              <button id="btnBall" class="btn-large btn-danger" style="background-color: #ef4444; border:none; color:white; padding: 1rem; font-size: 1.1rem; font-weight: 600; border-radius: 8px; cursor: pointer;">🎾 Ball</button>    
              <button id="btnNotBall" class="btn-large btn-secondary" style="background-color: #10b981; border:none; color:white; padding: 1rem; font-size: 1.1rem; font-weight: 600; border-radius: 8px; cursor: pointer;">✅ Not Ball</button>
            </div>

            <button id="btnSubmit" class="btn btn-primary" style="width: 100%; padding: 1rem; font-size: 1.1rem; background-color: #2563eb; border:none; color:white; border-radius: 8px; font-weight: bold; cursor: pointer;">
              📊 Submit & See Results
            </button>
          </div>
        </div>

        `;
html = html.substring(0, startIndex) + newHtml + html.substring(endIndex);
fs.writeFileSync('e:/Files/Projects/HAIplay/insights/demos/classification/index.html', html);
console.log('Restructured Classification UI');
