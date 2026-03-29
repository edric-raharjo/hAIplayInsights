/**
 * Common utilities for all demos
 */

/**
 * Load JSON data from a file path
 * @param {string} path - Path to JSON file
 * @returns {Promise<Object>} - Parsed JSON data
 */
async function loadJSON(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading JSON:', error);
    throw error;
  }
}

/**
 * Format a number to 2 decimal places
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
function formatNumber(num) {
  return Math.round(num * 100) / 100;
}

/**
 * Calculate Euclidean distance between two points
 * @param {Array<number>} p1 - [x, y]
 * @param {Array<number>} p2 - [x, y]
 * @returns {number} - Distance
 */
function euclideanDistance(p1, p2) {
  return Math.sqrt(
    Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2)
  );
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum
 * @param {number} max - Maximum
 * @returns {number} - Clamped value
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Get element safely
 * @param {string} id - Element ID
 * @returns {HTMLElement|null}
 */
function getEl(id) {
  return document.getElementById(id);
}

/**
 * Create and append element
 * @param {string} tag - HTML tag name
 * @param {Object} attrs - Attributes {id, class, ...}
 * @param {HTMLElement} parent - Parent element
 * @returns {HTMLElement}
 */
function createElement(tag, attrs = {}, parent = null) {
  const el = document.createElement(tag);
  Object.keys(attrs).forEach(key => {
    if (key === 'class') {
      el.className = attrs[key];
    } else if (key === 'text') {
      el.textContent = attrs[key];
    } else if (key === 'html') {
      el.innerHTML = attrs[key];
    } else {
      el.setAttribute(key, attrs[key]);
    }
  });
  if (parent) parent.appendChild(el);
  return el;
}

/**
 * Add event listener with cleanup reference
 * @param {HTMLElement} el - Element
 * @param {string} event - Event name
 * @param {Function} handler - Handler function
 */
function on(el, event, handler) {
  if (el) el.addEventListener(event, handler);
}

/**
 * Set loading state for button
 * @param {HTMLElement} button - Button element
 * @param {boolean} isLoading - Is loading
 * @param {string} loadingText - Text while loading
 */
function setButtonLoading(button, isLoading, loadingText = 'Loading...') {
  if (isLoading) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = loadingText;
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || 'Submit';
  }
}

/**
 * Round to nearest decimal place
 * @param {number} num - Number
 * @param {number} places - Decimal places
 * @returns {number}
 */
function round(num, places = 2) {
  return Math.round(num * Math.pow(10, places)) / Math.pow(10, places);
}

/**
 * Generate random color
 * @returns {string} - Hex color
 */
function randomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

/**
 * Interpolate between two colors
 * @param {string} color1 - Hex color 1
 * @param {string} color2 - Hex color 2
 * @param {number} t - Interpolation factor (0-1)
 * @returns {string} - Interpolated hex color
 */
function interpolateColor(color1, color2, t) {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);
  const r1 = (c1 >> 16) & 255;
  const g1 = (c1 >> 8) & 255;
  const b1 = c1 & 255;
  const r2 = (c2 >> 16) & 255;
  const g2 = (c2 >> 8) & 255;
  const b2 = c2 & 255;
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Color palette for clustering
 */
const COLORS = {
  blue: '#2563eb',
  red: '#ef4444',
  green: '#10b981',
  yellow: '#f59e0b',
  purple: '#a855f7',
  pink: '#ec4899',
  indigo: '#6366f1',
  teal: '#14b8a6'
};

const COLOR_ARRAY = Object.values(COLORS);

/**
 * Get color by index (cycles through palette)
 * @param {number} index - Index
 * @returns {string} - Hex color
 */
function getColor(index) {
  return COLOR_ARRAY[index % COLOR_ARRAY.length];
}
