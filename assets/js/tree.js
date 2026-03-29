/**
 * Decision Tree with Gini Impurity Interactive Demo
 */

let treeState = {
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
        { age: 55, income: 100000, employment_years: 20, label: 1 },
        { age: 60, income: 110000, employment_years: 25, label: 1 },
        { age: 20, income: 25000, employment_years: 0, label: 0 },
        { age: 41, income: 76000, employment_years: 9, label: 1 },
        { age: 47, income: 88000, employment_years: 11, label: 0 },
        { age: 52, income: 98000, employment_years: 14, label: 1 }
    ],
    features: ['age', 'income', 'employment_years'],
    root: null,
    activeNode: null,
    nextNodeId: 1
};

function calculateGini(samples) {
    if (samples.length === 0) return 0;
    let counts = { 0: 0, 1: 0 };
    samples.forEach(s => counts[s.label]++);
    let p0 = counts[0] / samples.length;
    let p1 = counts[1] / samples.length;
    return 1 - (p0 * p0 + p1 * p1);
}

function findBestSplitForFeature(samples, feature) {
    if (samples.length < 2) return null;
    let counts = { 0: 0, 1: 0 };
    samples.forEach(s => counts[s.label]++);
    if (counts[0] === samples.length || counts[1] === samples.length) return null;

    let sorted = [...samples].sort((a, b) => a[feature] - b[feature]);
    let bestGini = Infinity;
    let bestThreshold = null;
    let bestLeft = [];
    let bestRight = [];
    
    for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i][feature] === sorted[i+1][feature]) continue;
        let threshold = (sorted[i][feature] + sorted[i+1][feature]) / 2;
        let left = sorted.slice(0, i + 1);
        let right = sorted.slice(i + 1);
        
        let giniLeft = calculateGini(left);
        let giniRight = calculateGini(right);
        let weightedGini = (left.length / samples.length) * giniLeft + (right.length / samples.length) * giniRight;
        
        if (weightedGini < bestGini) {
            bestGini = weightedGini;
            bestThreshold = threshold;
            bestLeft = left;
            bestRight = right;
        }
    }
    
    if (bestThreshold === null) return null;
    return { feature, threshold: bestThreshold, gini: bestGini, left: bestLeft, right: bestRight };
}

function initTree() {
    let btnIdeal = document.getElementById('btnIdealTree');
    let btnReset = document.getElementById('btnResetTree');
    
    // Safety check if DOM is trailing behind the script execution
    if(!btnIdeal && !btnReset) {
        let treeCanvas = document.getElementById('treeCanvas');
        if(!treeCanvas) {
            setTimeout(initTree, 500);
            return;
        }
    }

    if(btnIdeal) btnIdeal.addEventListener('click', treeBuildIdeal);
    if(btnReset) btnReset.addEventListener('click', treeReset);
    
    treeReset();
}

function treeReset() {
    treeState.nextNodeId = 1;
    let initialGini = calculateGini(treeState.samples);
    treeState.root = {
        id: treeState.nextNodeId++,
        samples: [...treeState.samples],
        gini: initialGini,
        feature: null,
        threshold: null,
        left: null,
        right: null,
        x: 500,
        y: 50
    };
    treeSetActiveNode(treeState.root);
    treeRenderViz();
}

function treeSetActiveNode(node) {
    treeState.activeNode = node;
    document.getElementById('treeErrorBox').style.display = 'none';

    // Update table
    let tbody = document.getElementById('treeTableBody');
    tbody.innerHTML = '';
    node.samples.forEach(s => {
        let tr = document.createElement('tr');
        tr.innerHTML = '<td>' + Math.round(s.age) + 
                       '</td><td>$' + s.income.toLocaleString() + 
                       '</td><td>' + s.employment_years + 
                       '</td><td><span style="padding: 2px 6px; border-radius: 4px; background: ' + (s.label === 1 ? '#dcfce7' : '#fee2e2') + '; color: ' + (s.label === 1 ? '#166534' : '#991b1b') + ';">' + (s.label === 1 ? 'Hired' : 'Rejected') + '</span></td>';
        tbody.appendChild(tr);
    });

    document.getElementById('treeNodeSamplesCount').textContent = node.samples.length;
    document.getElementById('treeTargetGini').textContent = node.gini.toFixed(4);

    treeState.features.forEach(f => {
        let container = document.getElementById('actions_' + f);
        if(container) container.innerHTML = '';
    });
    
    let statusMsg = document.getElementById('treeNodeStatusMsg');
    if(statusMsg) statusMsg.innerHTML = '';

    if (node.gini === 0 || node.samples.length < 2) {
        if(statusMsg) statusMsg.innerHTML = '<span style="color: #059669;">&#10004; Node is pure. No further splits needed.</span>';
        return;
    }
    if (node.left || node.right) {
        if(statusMsg) statusMsg.innerHTML = '<span style="color: #6b7280; font-style: italic;">Node already split. Select a leaf node to continue.</span>';
        return;
    }

    treeState.features.forEach(f => {
        let actContainer = document.getElementById('actions_' + f);
        if(!actContainer) return;
        
        let info = document.createElement('div');
        info.className = 'split-info-text';
        info.style.textAlign = 'center';
        
        let btnCalc = document.createElement('button');
        btnCalc.className = 'feature-calc-btn';
        btnCalc.textContent = 'Calculate Gini';
        
        let btnSplit = document.createElement('button');
        btnSplit.className = 'feature-split-btn';
        btnSplit.textContent = 'Split Here!';
        
        actContainer.appendChild(btnCalc);
        actContainer.appendChild(btnSplit);
        actContainer.appendChild(info);
        
        btnCalc.addEventListener('click', () => {
            let splitInfo = findBestSplitForFeature(node.samples, f);
            if (!splitInfo) {
                info.textContent = 'Cannot split';
            } else {
                info.innerHTML = '<div style="margin-top:2px;">Thresh: &lt; ' + splitInfo.threshold + '</div><div>Gini: ' + splitInfo.gini.toFixed(4) + '</div>';
                btnSplit.style.display = 'inline-block';
                btnCalc.style.display = 'none';
                
                btnSplit.onclick = () => {
                    if (splitInfo.gini >= node.gini) {
                        treeShowError("This split does not reduce the Gini Impurity! Try another feature.");
                        return;
                    }
                    node.feature = splitInfo.feature;
                    node.threshold = splitInfo.threshold;
                    node.left = { id: treeState.nextNodeId++, samples: splitInfo.left, gini: calculateGini(splitInfo.left), feature: null, threshold: null, left: null, right: null };
                    node.right = { id: treeState.nextNodeId++, samples: splitInfo.right, gini: calculateGini(splitInfo.right), feature: null, threshold: null, left: null, right: null };
                    
                    treeRenderViz();
                    treeSetActiveNode(node.left); // Default select left child
                };
            }
        });
    });
}

function treeShowError(msg) {
    let box = document.getElementById('treeErrorBox');
    box.textContent = msg;
    box.style.display = 'block';
}

function treeCalculateLayout(node, x, y, dx) {
    if (!node) return;
    node.x = x;
    node.y = y;
    if (node.left) treeCalculateLayout(node.left, x - dx, y + 100, dx * 0.55);
    if (node.right) treeCalculateLayout(node.right, x + dx, y + 100, dx * 0.55);
}

function treeRenderViz() {
    let svg = document.getElementById('treeCanvas');
    svg.innerHTML = '';
    treeCalculateLayout(treeState.root, 500, 50, 240);
    treeDrawNodeConnections(svg, treeState.root);
    treeDrawNodeElements(svg, treeState.root);
}

function treeDrawNodeConnections(svg, node) {
    if (!node) return;
    if (node.left) {
        let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', node.x); line.setAttribute('y1', node.y);
        line.setAttribute('x2', node.left.x); line.setAttribute('y2', node.left.y);
        line.setAttribute('stroke', '#cbd5e1'); line.setAttribute('stroke-width', '2');
        svg.appendChild(line);
        treeDrawNodeConnections(svg, node.left);
    }
    if (node.right) {
        let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', node.x); line.setAttribute('y1', node.y);
        line.setAttribute('x2', node.right.x); line.setAttribute('y2', node.right.y);
        line.setAttribute('stroke', '#cbd5e1'); line.setAttribute('stroke-width', '2');
        svg.appendChild(line);
        treeDrawNodeConnections(svg, node.right);
    }
}

function treeDrawNodeElements(svg, node) {
    if (!node) return;
    
    let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.style.cursor = 'pointer';
    g.onclick = () => {
        treeSetActiveNode(node);
        treeRenderViz();
    };

    let circle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    circle.setAttribute('x', node.x - 70);
    circle.setAttribute('y', node.y - 30);
    circle.setAttribute('width', 140);
    circle.setAttribute('height', 60);
    circle.setAttribute('rx', 8);
    let circleClass = 'node-circle';
    if(node.gini === 0) circleClass += ' pure';
    if(node.id === treeState.activeNode?.id) circleClass += ' active';
    circle.setAttribute('class', circleClass);
    
    let text1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text1.setAttribute('x', node.x);
    text1.setAttribute('y', node.y - 5);
    text1.setAttribute('text-anchor', 'middle');
    text1.setAttribute('class', 'node-label');
    text1.textContent = node.feature ? `${node.feature} < ${node.threshold.toFixed(1)}` : "Leaf";

    let text2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text2.setAttribute('x', node.x);
    text2.setAttribute('y', node.y + 15);
    text2.setAttribute('text-anchor', 'middle');
    text2.setAttribute('class', 'node-text');
    text2.textContent = `G: ${node.gini.toFixed(3)} | n=${node.samples.length}`;
    
    g.appendChild(circle);
    g.appendChild(text1);
    g.appendChild(text2);
    svg.appendChild(g);
    
    treeDrawNodeElements(svg, node.left);
    treeDrawNodeElements(svg, node.right);
}

function treeBuildIdeal() {
    treeReset();
    let queue = [treeState.root];
    while(queue.length > 0) {
        let n = queue.shift();
        if(n.gini === 0 || n.samples.length < 2) continue;
        
        let best = null;
        treeState.features.forEach(f => {
            let s = findBestSplitForFeature(n.samples, f);
            if(s && (!best || s.gini < best.gini)) { best = s; }
        });
        
        if (best && best.gini < n.gini) {
            n.feature = best.feature;
            n.threshold = best.threshold;
            n.left = { id: treeState.nextNodeId++, samples: best.left, gini: calculateGini(best.left), feature: null, threshold: null, left: null, right: null };
            n.right = { id: treeState.nextNodeId++, samples: best.right, gini: calculateGini(best.right), feature: null, threshold: null, left: null, right: null };
            queue.push(n.left, n.right);
        }
    }
    treeRenderViz();
    treeSetActiveNode(treeState.root);
}

