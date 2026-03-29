const fs = require('fs');
let html = fs.readFileSync('e:/Files/Projects/HAIplay/insights/demos/classification/index.html', 'utf8');

let startIndex = html.indexOf('<div class=\"classification-container\">');
let endIndex = html.indexOf('<!-- Results Section -->');

let newHtml = \      <div class=\"classification-container\" style=\"padding: 0; background: transparent; border: none;\">
        <div class=\"demo-content-wrapper\" style=\"display: grid; grid-template-columns: 1fr 350px; gap: 2rem; align-items: start; margin-bottom: 2rem;\">
          
          <!-- Image Display -->
          <div class=\"image-display\" id=\"imageDisplay\" style=\"min-height: 400px; margin-bottom: 0;\">
            <div class=\"image-loading\">Loading first image...</div>
          </div>

          <!-- Right Controls -->
          <div class=\"controls-section\" style=\"background-color: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 1.5rem; display: flex; flex-direction: column; height: 100%; min-height: 400px;\">
            <!-- Instructions -->
            <div class=\"instructions\">
              <strong>?? Task:</strong> Look at each image and classify it as a <strong>"Ball"</strong> or <strong>"Not Ball"</strong>.
            </div>

            <!-- Progress Info -->
            <div class=\"progress-info\">
              <div class=\"progress-info-left\">
                <div class=\"progress-counter\" id=\"progressCounter\">0 / 32</div>     
                <div class=\"progress-bar-mini\">
                  <div class=\"progress-bar-fill\" id=\"progressBarFill\" style=\"width: 0%;\"></div>
                </div>
              </div>
              <div class=\"accuracy-badge\">
                Accuracy: <span id=\"currentAccuracy\">0%</span>
              </div>
            </div>

            <div style=\"flex-grow: 1;\"></div>

            <!-- Control Buttons -->
            <div class=\"button-group-large\" style=\"margin-top: auto; padding-top: 1rem;\">
              <button id=\"btnBall\" class=\"btn-large btn-danger\" style=\"background-color: #ef4444; border:none; color:white;\">?? Ball</button>    
              <button id=\"btnNotBall\" class=\"btn-large btn-secondary\" style=\"background-color: #10b981; border:none; color:white;\">? Not Ball</button>
            </div>

            <button id=\"btnSubmit\" class=\"btn btn-primary\" style=\"width: 100%; padding: 1rem; font-size: 1.1rem; background-color: #2563eb; border:none; color:white; border-radius: 8px; font-weight: bold; cursor: pointer;\">
              ?? Submit & See Results
            </button>
          </div>
        </div>

        \;
html = html.substring(0, startIndex) + newHtml + html.substring(endIndex);
fs.writeFileSync('e:/Files/Projects/HAIplay/insights/demos/classification/index.html', html);
console.log('Restructured Classification via JS');
