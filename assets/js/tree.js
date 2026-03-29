/**
 * Decision Tree with Gini Impurity Interactive Demo
 */

let demoData = null;
let treeState = {
  splits: [],  // List of splits made so far
  children: {  // Tree nodes (key = node_id, value = {left, right, split_info})
    root: null
  }
};

const NODE_RADIUS = 40;
const NODE_SPACING_X = 150;
const NODE_SPACING_Y = 120;

async function init() {
  try {
    demoData = await loadJSON('../../data/tree_demo.json');
    
    // Set up event listeners
    document.getElementById('btnShowHint').addEventListener('click', showOptimalSplitHint);
    document.getElementById('btnReset').addEventListener('click', resetTree);
    
    // Initialize root node
    treeState.children.root = {
      id: 'root',
      samples: Array.from({length: demoData.metadata.total_samples}, (_, i) => i),
      labels: demoData.initial_state.labels,
      gini: demoData.initial_state.gini,
      split: null,
      children: {}
    };
    
    // Initial render
    renderCurrentNode();
    renderTree();
  } catch (error) {
    console.error('Failed to initialize demo:', error);
    alert('Failed to load demo data. Please check the console.');
  }
}

function getCurrentNode() {
  let node = treeState.children.root;
  for (const splitId of treeState.splits) {
    const split = node.split;
    if (splitId === 'left') {
      node = node.children.left;
    } else if (splitId === 'right') {
      node = node.children.right;
    }
  }
  return node;
}

function renderCurrentNode() {
  const node = getCurrentNode();
  
  // Update Gini
  document.getElementById('currentGini').textContent = node.gini.toFixed(4);
  
  // Update counts
  const labels = node.labels;
  const approved = labels.filter(l => l === 1).length;
  const notApproved = labels.filter(l => l === 0).length;
  
  document.getElementById('sampleCount').textContent = labels.length;
  document.getElementById('approvedCount').textContent = approved;
  document.getElementById('notApprovedCount').textContent = notApproved;
  
  const purity = Math.round((Math.max(approved, notApproved) / labels.length) * 100);
  document.getElementById('purityPercent').textContent = purity + '%';
  
  // Populate dataset table
  const tableBody = document.getElementById('datasetTableBody');
  tableBody.innerHTML = '';
  
  node.samples.slice(0, 15).forEach(sampleIdx => {
    const sample = demoData.initial_state.dataset[sampleIdx];
    const label = demoData.initial_state.labels[sampleIdx];
    
    const row = createElement('tr', {}, tableBody);
    createElement('td', {text: sample.age.toString()}, row);
    createElement('td', {text: (sample.income / 1000).toFixed(0) + 'k'}, row);
    createElement('td', {text: sample.employment_years.toString()}, row);
    
    const approvedTd = createElement('td', {
      text: label === 1 ? '✓ Yes' : '✗ No',
      class: label === 1 ? 'approved-1' : 'approved-0'
    }, row);
  });
  
  // Render split options
  renderSplitOptions(node);
  
  // Update tree stats
  updateTreeStats();
}

function renderSplitOptions(node) {
  const container = document.getElementById('splitsContainer');
  container.innerHTML = '';
  
  if (!node.split) {
    // Node hasn't been split, show options
    demoData.split_options.forEach(option => {
      const div = createElement('div', {class: 'split-option'}, container);
      
      createElement('div', {
        class: 'split-text',
        text: option.description
      }, div);
      
      const metricsDiv = createElement('div', {class: 'split-metrics'}, div);
      
      createElement('div', {class: 'split-metric'}, metricsDiv).innerHTML = `
        <div class="split-metric-label">Gini After</div>
        <div class="split-metric-value">${option.gini.toFixed(4)}</div>
      `;
      
      createElement('div', {class: 'split-metric'}, metricsDiv).innerHTML = `
        <div class="split-metric-label">Info Gain</div>
        <div class="split-metric-value">${option.information_gain.toFixed(4)}</div>
      `;
      
      createElement('div', {class: 'split-metric'}, metricsDiv).innerHTML = `
        <div class="split-metric-label">Samples L/R</div>
        <div class="split-metric-value">${option.left_samples}/${option.right_samples}</div>
      `;
      
      div.addEventListener('click', () => applySplit(option));
    });
  } else {
    // Node is already split
    const info = document.createElement('p');
    info.textContent = `✓ Already split on: ${node.split.description}`;
    info.style.color = 'var(--secondary-color)';
    info.style.fontWeight = '600';
    container.appendChild(info);
    
    const childInfo = document.createElement('p');
    childInfo.textContent = `Left: ${node.children.left.labels.length} samples | Right: ${node.children.right.labels.length} samples`;
    childInfo.style.color = 'var(--text-secondary)';
    childInfo.style.fontSize = '0.9rem';
    childInfo.style.marginTop = '1rem';
    container.appendChild(childInfo);
  }
}

function showOptimalSplitHint() {
  const node = getCurrentNode();
  
  if (node.split) {
    alert('This node is already split!');
    return;
  }
  
  const bestOption = demoData.split_options.reduce((best, current) => {
    return current.information_gain > best.information_gain ? current : best;
  });
  
  alert(
    `💡 Optimal Split Hint:\n\n` +
    `Feature: ${bestOption.description}\n` +
    `Information Gain: ${bestOption.information_gain.toFixed(4)}\n` +
    `Gini after split: ${bestOption.gini.toFixed(4)}\n\n` +
    `This split gives the highest information gain!`
  );
}

function applySplit(splitOption) {
  const node = getCurrentNode();
  
  if (node.split) {
    alert('This node is already split. Use Reset to start over.');
    return;
  }
  
  // Partition samples
  const feature = splitOption.feature;
  const threshold = splitOption.threshold;
  
  const leftSamples = [];
  const leftLabels = [];
  const rightSamples = [];
  const rightLabels = [];
  
  node.samples.forEach((sampleIdx, i) => {
    const sample = demoData.initial_state.dataset[sampleIdx];
    if (sample[feature] <= threshold) {
      leftSamples.push(sampleIdx);
      leftLabels.push(node.labels[i]);
    } else {
      rightSamples.push(sampleIdx);
      rightLabels.push(node.labels[i]);
    }
  });
  
  // Calculate Gini for children
  const leftGini = calculateGini(leftLabels);
  const rightGini = calculateGini(rightLabels);
  
  // Update node
  node.split = splitOption;
  node.children.left = {
    id: node.id + '_L',
    samples: leftSamples,
    labels: leftLabels,
    gini: leftGini,
    split: null,
    children: {}
  };
  node.children.right = {
    id: node.id + '_R',
    samples: rightSamples,
    labels: rightLabels,
    gini: rightGini,
    split: null,
    children: {}
  };
  
  // Update UI
  renderCurrentNode();
  renderTree();
}

function calculateGini(labels) {
  if (!labels || labels.length === 0) return 0;
  
  let gini = 1;
  const counts = {0: 0, 1: 0};
  
  labels.forEach(label => {
    counts[label]++;
  });
  
  const total = labels.length;
  Object.values(counts).forEach(count => {
    const p = count / total;
    gini -= p * p;
  });
  
  return Math.round(gini * 10000) / 10000;
}

function resetTree() {
  treeState.splits = [];
  treeState.children.root.split = null;
  treeState.children.root.children = {};
  
  renderCurrentNode();
  renderTree();
}

function renderTree() {
  const svg = document.getElementById('treeSvg');
  svg.innerHTML = '';
  
  const width = svg.clientWidth || 500;
  const height = svg.clientHeight || 500;
  
  function drawNode(node, x, y, offsetX) {
    // Draw node circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', NODE_RADIUS);
    circle.setAttribute('fill', '#fff');
    circle.setAttribute('stroke', node === getCurrentNode() ? '#2563eb' : '#e5e7eb');
    circle.setAttribute('stroke-width', node === getCurrentNode() ? '3' : '2');
    svg.appendChild(circle);
    
    // Draw text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('font-size', '11');
    text.setAttribute('font-weight', '600');
    text.textContent = `G: ${node.gini.toFixed(3)}`;
    svg.appendChild(text);
    
    // Draw sample count below
    const countText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    countText.setAttribute('x', x);
    countText.setAttribute('y', y + 15);
    countText.setAttribute('text-anchor', 'middle');
    countText.setAttribute('font-size', '9');
    countText.setAttribute('fill', '#6b7280');
    countText.textContent = `n=${node.samples.length}`;
    svg.appendChild(countText);
    
    // Draw children if split
    if (node.split && node.children.left && node.children.right) {
      const leftX = x - offsetX;
      const rightX = x + offsetX;
      const childY = y + NODE_SPACING_Y;
      
      // Draw edges
      const leftLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      leftLine.setAttribute('x1', x);
      leftLine.setAttribute('y1', y + NODE_RADIUS);
      leftLine.setAttribute('x2', leftX);
      leftLine.setAttribute('y2', childY - NODE_RADIUS);
      leftLine.setAttribute('stroke', '#e5e7eb');
      leftLine.setAttribute('stroke-width', '2');
      svg.appendChild(leftLine);
      
      const rightLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      rightLine.setAttribute('x1', x);
      rightLine.setAttribute('y1', y + NODE_RADIUS);
      rightLine.setAttribute('x2', rightX);
      rightLine.setAttribute('y2', childY - NODE_RADIUS);
      rightLine.setAttribute('stroke', '#e5e7eb');
      rightLine.setAttribute('stroke-width', '2');
      svg.appendChild(rightLine);
      
      // Recursively draw children
      drawNode(node.children.left, leftX, childY, offsetX / 2);
      drawNode(node.children.right, rightX, childY, offsetX / 2);
    }
  }
  
  drawNode(treeState.children.root, width / 2, 40, width / 4);
}

function updateTreeStats() {
  // Count depth and nodes
  let maxDepth = 0;
  let nodeCount = 1;
  let leafGinis = [treeState.children.root.gini];
  
  function traverse(node, depth) {
    maxDepth = Math.max(maxDepth, depth);
    if (node.split) {
      nodeCount += 2;
      traverse(node.children.left, depth + 1);
      traverse(node.children.right, depth + 1);
    } else {
      leafGinis.push(node.gini);
    }
  }
  
  traverse(treeState.children.root, 0);
  
  const avgGini = (leafGinis.reduce((a, b) => a + b, 0) / leafGinis.length).toFixed(4);
  
  document.getElementById('treeDepth').textContent = maxDepth;
  document.getElementById('nodeCount').textContent = nodeCount;
  document.getElementById('avgLeafGini').textContent = avgGini;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init);
