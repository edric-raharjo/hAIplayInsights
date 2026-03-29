const fs = require('fs');

let html = fs.readFileSync('e:/Files/Projects/HAIplay/insights/demos/kmeans/index.html', 'utf8');

let startIndex = html.indexOf('<div class="controls-section">');
let endIndex = html.indexOf('</div> <!-- closes demo-content-wrapper -->');

if (startIndex === -1 || endIndex === -1) {
    console.error("Tags not found in kmeans HTML!");
    process.exit(1);
}

let newHtml = `        <div class="controls-section" style="background-color: var(--card-bg, #ffffff); border: 1px solid var(--border-color, #e5e7eb); border-radius: 8px; padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; height: 100%; box-sizing: border-box; min-height: 400px;">
        
        <div>
          <!-- Step Information -->
          <div class="step-info" style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 1rem; margin-bottom: 1rem; border-radius: 4px;">
            <div class="step-info-label" style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 0.25rem; font-weight: 600;">Current Step</div>
            <div class="step-info-text" id="kmeansStepDescription" style="font-size: 1.05rem; color: #1f2937; font-weight: 600; line-height: 1.3;">Initializing...</div>
          </div>

          <!-- Progress -->
          <div class="progress-bar" style="margin-bottom: 1rem;">
            <div class="progress-label" style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #6b7280; font-weight: 600; margin-bottom: 0.4rem;">
              <span>Progress</span>
              <span id="kmeansProgressText">0 / 0</span>
            </div>
            <div class="progress-track" style="height: 8px; background-color: #e5e7eb; border-radius: 4px; overflow: hidden;">
              <div class="progress-fill" id="kmeansProgressFill" style="height: 100%; background-color: #2563eb; width: 0%; transition: width 0.3s ease;"></div>
            </div>
          </div>
        </div>

        <!-- Control Buttons -->
        <div class="button-grid" style="display: flex; gap: 0.5rem; margin-bottom: 1rem; width: 100%;">
          <button id="kmeansBtnInit" style="flex:1; padding: 0.7rem; font-size: 0.9rem; font-weight: bold; background-color: #f3f4f6; border: 1px solid #d1d5db; color: #374151; border-radius: 6px; cursor: pointer;">INITIALIZE</button>
          <button id="kmeansBtnAssign" style="flex:1; padding: 0.7rem; font-size: 0.9rem; font-weight: bold; background-color: #2563eb; border: 1px solid #2563eb; color: #ffffff; border-radius: 6px; cursor: pointer;">ASSIGN</button>
          <button id="kmeansBtnCenter" style="flex:1; padding: 0.7rem; font-size: 0.9rem; font-weight: bold; background-color: #10b981; border: 1px solid #10b981; color: #ffffff; border-radius: 6px; cursor: pointer;">CENTER</button>
        </div>

        <!-- Statistics grid -->
        <div class="stats-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
          <div class="stat-box" style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 0.75rem; border-radius: 8px; text-align: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <div class="stat-label" style="font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Data Points</div>
            <div class="stat-value" id="kmeansStatPoints" style="font-size: 1.4rem; font-weight: 800; color: #0f172a; margin-top: 0.25rem;">0</div>
          </div>
          <div class="stat-box" style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 0.75rem; border-radius: 8px; text-align: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <div class="stat-label" style="font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Clusters</div>
            <div class="stat-value" id="kmeansStatClusters" style="font-size: 1.4rem; font-weight: 800; color: #0f172a; margin-top: 0.25rem;">0</div>
          </div>
          <div class="stat-box" style="background-color: #f0fdf4; border: 1px solid #cbd5e1; padding: 0.75rem; border-radius: 8px; text-align: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <div class="stat-label" style="font-size: 0.75rem; font-weight: 700; color: #475569; text-transform: uppercase;">Iteration</div>
            <div class="stat-value" id="kmeansStatIteration" style="font-size: 1.4rem; font-weight: 800; color: #3b82f6; margin-top: 0.25rem;">0</div>
          </div>
          <div class="stat-box" style="background-color: #fffbeb; border: 1px solid #a7f3d0; padding: 0.75rem; border-radius: 8px; text-align: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <div class="stat-label" style="font-size: 0.75rem; font-weight: 700; color: #059669; text-transform: uppercase;">Phase</div>
            <div class="stat-value" id="kmeansStatPhase" style="font-size: 1.1rem; font-weight: 800; color: #047857; margin-top: 0.4rem; text-transform: capitalize;">-</div>
          </div>
        </div>

        <!-- Legend -->
        <div class="legend" style="display: flex; gap: 1rem; justify-content: center; align-items: center; padding-top: 0.75rem; border-top: 1px solid #e5e7eb; font-size: 0.8rem; color: #4b5563;">
          <div class="legend-item" style="display: flex; align-items: center; gap: 0.4rem;">
            <div class="legend-color" style="width: 14px; height: 14px; border-radius: 50%; background-color: #d1d5db; border: 1px solid #9ca3af;"></div> 
            <span>Points</span>
          </div>
          <div class="legend-item" style="display: flex; align-items: center; gap: 0.4rem;">
            <div class="legend-color center" style="width: 18px; height: 18px; border-radius: 50%; background-color: #2563eb; border: 2px solid #1e40af; box-shadow: inset 0 0 0 1px white;"></div>
            <span>Centers</span>
          </div>
        </div>
      </div>
`;
html = html.substring(0, startIndex) + newHtml + html.substring(endIndex);
fs.writeFileSync('e:/Files/Projects/HAIplay/insights/demos/kmeans/index.html', html);
console.log('Restructured kmeans');
