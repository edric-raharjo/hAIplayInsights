
const treeState = {
    samples: [
        { age: 25, income: 45000, employment_years: 2, label: 0 },
        { age: 30, income: 55000, employment_years: 4, label: 1 },
        { age: 35, income: 65000, employment_years: 6, label: 1 },
        { age: 40, income: 75000, employment_years: 8, label: 1 },
        { age: 45, income: 85000, employment_years: 10, label: 0 },
        { age: 22, income: 30000, employment_years: 1, label: 0 },
        { age: 28, income: 48000, employment_years: 3, label: 0 },
        { age: 32, income: 60000, employment_years: 5, label: 0 },
        { age: 38, income: 70000, employment_years: 7, label: 1 },
        { age: 50, income: 90000, employment_years: 12, label: 1 },
        { age: 24, income: 35000, employment_years: 1, label: 1 },
        { age: 29, income: 52000, employment_years: 4, label: 0 },
        { age: 36, income: 68000, employment_years: 5, label: 1 },
        { age: 42, income: 80000, employment_years: 9, label: 0 },
        { age: 48, income: 95000, employment_years: 15, label: 1 },
        { age: 26, income: 40000, employment_years: 2, label: 0 },
        { age: 31, income: 58000, employment_years: 3, label: 1 },
        { age: 34, income: 62000, employment_years: 6, label: 0 },
        { age: 39, income: 72000, employment_years: 8, label: 1 },
        { age: 55, income: 100000, employment_years: 20, label: 1 }
    ],
    features: ['age', 'income', 'employment_years'],
    root: null,
    activeNode: null,
    pendingSplit: null // { feature, threshold, leftSamples, rightSamples }
};

// Calculate Gini Impurity for a set of samples
function calculateGini(samples) {
    if (samples.length === 0) return 0;
    let counts = { 0: 0, 1: 0 };
    samples.forEach(s => counts[s.label]++);
    let p0 = counts[0] / samples.length;
    let p1 = counts[1] / samples.length;
    return 1 - (p0 * p0 + p1 * p1);
}

// Find best split for a given feature
function findBestSplitForFeature(samples, feature) {
    if (samples.length < 2) return null;
    
    // Check if node is pure
    let counts = { 0: 0, 1: 0 };
    samples.forEach(s => counts[s.label]++);
    if (counts[0] === samples.length || counts[1] === samples.length) return null;
    
    samples.sort((a, b) => a[feature] - b[feature]);
    
    let bestGini = Infinity;
    let bestThreshold = null;
    let bestLeft = [];
    let bestRight = [];
    
    for (let i = 0; i < samples.length - 1; i++) {
        if (samples[i][feature] === samples[i+1][feature]) continue;
        
        let threshold = (samples[i][feature] + samples[i+1][feature]) / 2;
        let left = samples.slice(0, i + 1);
        let right = samples.slice(i + 1);
        
        let giniLeft = calculateGini(left);
        let giniRight = calculateGini(right);
        
        // Weighted Gini
        let gini = (left.length / samples.length) * giniLeft + (right.length / samples.length) * giniRight;
        
        if (gini < bestGini) {
            bestGini = gini;
            bestThreshold = threshold;
            bestLeft = left;
            bestRight = right;
        }
    }
    
    if (bestThreshold === null) return null;
    
    return { feature, threshold: bestThreshold, gini: bestGini, leftSamples: bestLeft, rightSamples: bestRight };
}

// Global best split search just for hint
function findOverallBestSplit(samples) {
    let best = null;
    treeState.features.forEach(f => {
        let split = findBestSplitForFeature(samples, f);
        if (split && (!best || split.gini < best.gini)) {
            best = split;
        }
    });
    return best;
}

// Initialize tree
window.initTree = function() {
    treeState.root = {
        id: 'node_0',
        samples: [...treeState.samples],
        gini: calculateGini(treeState.samples),
        depth: 0,
        x: 400,
        y: 50,
        left: null,
        right: null,
        splitFeature: null,
        splitThreshold: null
    };
    treeState.activeNode = treeState.root;
    
    // Attach event listeners
    const el = document.getElementById('btnGiniAge');
    if (el) el.onclick = () => treeCalculateFeatureGini('age');
    const el2 = document.getElementById('btnGiniIncome');
    if (el2) el2.onclick = () => treeCalculateFeatureGini('income');
    const el3 = document.getElementById('btnGiniYears');
    if (el3) el3.onclick = () => treeCalculateFeatureGini('employment_years');
    
    const elSplit = document.getElementById('btnApplySplit');
    if (elSplit) elSplit.onclick = treeExecuteSplit;
    
    const elReset = document.getElementById('treeReset');
    if (elReset) elReset.onclick = window.initTree;
    
    const elHint = document.getElementById('treeShowHint');
    if (elHint) elHint.onclick = () => {
        const node = treeState.activeNode;
        if (!node) return;
        const best = findOverallBestSplit(node.samples);
        if (best) {
            alert(`Hint: The optimal split is '${best.feature}' with a Gini impurity of ${best.gini.toFixed(4)}.`);
        } else {
            alert("No further splits possible here (node may be pure or identical values).");
        }
    };
    
    treeRenderActiveNode();
    treeDrawSVG();
};

function treeCalculateFeatureGini(featName) {
    if (!treeState.activeNode) return;
    const node = treeState.activeNode;
    
    // Is node pure or too small?
    if (node.gini === 0 || node.samples.length < 2) {
        alert("This node is either pure or too small to split further.");
        return;
    }
    
    const split = findBestSplitForFeature(node.samples, featName);
    
    if (!split) {
        alert("Cannot split on this feature (all values might be the same).");
        return;
    }
    
    treeState.pendingSplit = split;
    
    // Update Action Area
    const actionArea = document.getElementById('splitActionArea');
    if (!actionArea) return;
    
    const actionText = document.getElementById('splitActionText');
    const leftCount = document.getElementById('splitActionLeftCount');
    const rightCount = document.getElementById('splitActionRightCount');
    const actionGini = document.getElementById('splitActionGini');
    
    let threshDisp = split.threshold;
    if (featName === 'income') threshDisp = "$" + split.threshold;
    
    if (actionText) actionText.textContent = `Split on: ${featName} <= ${threshDisp}`;
    if (leftCount) leftCount.textContent = split.leftSamples.length;
    if (rightCount) rightCount.textContent = split.rightSamples.length;
    if (actionGini) actionGini.textContent = split.gini.toFixed(4);
    
    actionArea.style.display = 'block';
}

function treeExecuteSplit() {
    if (!treeState.activeNode || !treeState.pendingSplit) return;
    
    const node = treeState.activeNode;
    const split = treeState.pendingSplit;
    
    // Prevent overriding existing splits via UI
    if (node.left || node.right) {
         alert("Node already split!");
         return;
    }
    
    node.splitFeature = split.feature;
    node.splitThreshold = split.threshold;
    
    const xOffset = 300 / Math.pow(2, node.depth + 1.2);
    const yOffset = 80;
    
    node.left = {
        id: node.id + '_L',
        samples: split.leftSamples,
        gini: calculateGini(split.leftSamples),
        depth: node.depth + 1,
        x: node.x - xOffset,
        y: node.y + yOffset,
        left: null,
        right: null,
        splitFeature: null,
        splitThreshold: null
    };
    
    node.right = {
        id: node.id + '_R',
        samples: split.rightSamples,
        gini: calculateGini(split.rightSamples),
        depth: node.depth + 1,
        x: node.x + xOffset,
        y: node.y + yOffset,
        left: null,
        right: null,
        splitFeature: null,
        splitThreshold: null
    };
    
    treeState.pendingSplit = null;
    const area = document.getElementById('splitActionArea');
    if (area) area.style.display = 'none';
    
    // Set active to the new left child automatically
    treeState.activeNode = node.left;
    
    treeRenderActiveNode();
    treeDrawSVG();
}


function treeRenderActiveNode() {
    const tableBody = document.getElementById('treeDatasetTableBody');
    if (tableBody) tableBody.innerHTML = '';
    
    const node = treeState.activeNode;
    
    const area = document.getElementById('splitActionArea');
    if (area) area.style.display = 'none';
    treeState.pendingSplit = null;
    
    const nodeTitle = document.getElementById('treeNodeTitle');
    const giniText = document.getElementById('treeCurrentGini');
    const samplesCount = document.getElementById('treeSampleCount');
    let calcRow = document.getElementById('calcGiniRow');
    if (!calcRow) {
        // Fallback for calcGiniRow missing ID potentially, let's grab the row holding btnGiniAge
        const btnAge = document.getElementById('btnGiniAge');
        if (btnAge) calcRow = btnAge.closest('tr');
    }
    
    if (!node) {
        if (nodeTitle) nodeTitle.textContent = "No Node Selected";
        if (giniText) giniText.textContent = "-";
        if (samplesCount) samplesCount.textContent = "0";
        if (calcRow) calcRow.style.display = 'none';
        return;
    }
    
    if (nodeTitle) nodeTitle.textContent = node.id === 'node_0' ? 'Root Node Data' : `Node '${node.id}' Data`;
    if (giniText) giniText.textContent = node.gini.toFixed(4);
    if (samplesCount) samplesCount.textContent = node.samples.length;
    
    // Hide Gini calculation buttons for pure/empty/split nodes
    if (calcRow) {
        if (node.gini === 0 || node.left || node.right) {
            calcRow.style.display = 'none';
        } else {
            calcRow.style.display = 'table-row';
        }
    }
    
    if (tableBody) {
        const displaySamples = node.samples.slice(0, 10);
        displaySamples.forEach(sample => {
            const row = document.createElement('tr');
            const labelStr = sample.label === 1 ? 'Yes' : 'No';
            const labelColor = sample.label === 1 ? '#059669' : '#dc2626';
            const incomeStr = (sample.income / 1000).toFixed(0) + "k";
            row.innerHTML = `<td style="padding: 0.5rem; border-bottom: 1px solid var(--border-color); text-align: center;">${sample.age}</td>
                             <td style="padding: 0.5rem; border-bottom: 1px solid var(--border-color); text-align: center;">${incomeStr}</td>
                             <td style="padding: 0.5rem; border-bottom: 1px solid var(--border-color); text-align: center;">${sample.employment_years}</td>
                             <td style="padding: 0.5rem; border-bottom: 1px solid var(--border-color); text-align: center; font-weight:bold; color: ${labelColor};">${labelStr}</td>`;
            tableBody.appendChild(row);
        });
        
        if (node.samples.length > 10) {
            const info = document.createElement('tr');
            info.innerHTML = `<td colspan="4" style="padding:0.5rem;text-align:center;color:gray; border-bottom: 1px solid var(--border-color);">... ${node.samples.length - 10} more samples</td>`;
            tableBody.appendChild(info);
        }
    }
}

function treeDrawSVG() {
    const svg = document.getElementById('treeSvg');
    if (!svg) return;
    svg.innerHTML = '';
    
    if (!treeState.root) return;
    
    let maxDepth = 0;
    let nodeCount = 0;
    let leafGiniSum = 0;
    let leafCount = 0;
    
    function drawNode(node) {
        nodeCount++;
        if (node.depth > maxDepth) maxDepth = node.depth;
        
        if (!node.left && !node.right) {
            leafCount++;
            leafGiniSum += node.gini;
        }
        
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.style.cursor = 'pointer';
        
        const isAct = (treeState.activeNode && treeState.activeNode.id === node.id);
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', node.x - 60);
        rect.setAttribute('y', node.y - 30);
        rect.setAttribute('width', 120);
        rect.setAttribute('height', 60);
        rect.setAttribute('rx', 8);
        rect.setAttribute('fill', node.gini === 0 ? '#dcfce7' : '#ffffff');
        rect.setAttribute('stroke', isAct ? '#2563eb' : (node.gini === 0 ? '#10b981' : '#cbd5e1'));
        rect.setAttribute('stroke-width', isAct ? 3 : 1.5);
        
        g.onclick = function() {
            treeState.activeNode = node;
            treeRenderActiveNode();
            treeDrawSVG(); 
        };
        
        const textGini = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textGini.setAttribute('x', node.x);
        textGini.setAttribute('y', node.y - 12);
        textGini.setAttribute('text-anchor', 'middle');
        textGini.setAttribute('font-size', '11');
        textGini.setAttribute('fill', '#475569');
        textGini.textContent = `G: ${node.gini.toFixed(3)} (n=${node.samples.length})`;
        
        const textSplit = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textSplit.setAttribute('x', node.x);
        textSplit.setAttribute('y', node.y + 10);
        textSplit.setAttribute('text-anchor', 'middle');
        textSplit.setAttribute('font-size', '12');
        textSplit.setAttribute('fill', '#1e293b');
        textSplit.setAttribute('font-weight', '600');
        
        if (node.splitFeature) {
            let featNm = node.splitFeature;
            let threshVal = node.splitThreshold;
            if (featNm === 'income') threshVal = "$" + threshVal;
            if (featNm === 'employment_years') featNm = "years";
            textSplit.textContent = `${featNm} <= ${threshVal}`;
        } else {
            textSplit.textContent = node.gini === 0 ? "Pure" : "Leaf";
        }
        
        g.appendChild(rect);
        g.appendChild(textGini);
        g.appendChild(textSplit);
        svg.appendChild(g);
        
        if (node.left) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', node.x);
            line.setAttribute('y1', node.y + 30);
            line.setAttribute('x2', node.left.x);
            line.setAttribute('y2', node.left.y - 30);
            line.setAttribute('stroke', '#94a3b8');
            line.setAttribute('stroke-width', 2);
            svg.insertBefore(line, svg.firstChild); 
            drawNode(node.left);
        }
        
        if (node.right) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', node.x);
            line.setAttribute('y1', node.y + 30);
            line.setAttribute('x2', node.right.x);
            line.setAttribute('y2', node.right.y - 30);
            line.setAttribute('stroke', '#94a3b8');
            line.setAttribute('stroke-width', 2);
            svg.insertBefore(line, svg.firstChild);
            drawNode(node.right);
        }
    }
    
    drawNode(treeState.root);
    
    // Update stats
    const dEl = document.getElementById('treeDepth');
    if (dEl) dEl.textContent = maxDepth;
    const nCount = document.getElementById('treeNodeCount');
    if (nCount) nCount.textContent = nodeCount;
    const avgLeaf = document.getElementById('treeAvgLeafGini');
    if (avgLeaf) avgLeaf.textContent = leafCount > 0 ? (leafGiniSum / leafCount).toFixed(4) : "-";
}
