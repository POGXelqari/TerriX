/**
 * TerriX Scenario Studio - Economy & Multipliers Visualizer
 * Interactive Canvas chart simulating resource generation over ticks 0-3000.
 */

import { store } from "../state.js";

export class EconomyPanel {
  constructor(containerElement) {
    this.container = containerElement;
    this.chartCanvas = null;
    this.chartCtx = null;
    this.init();
    store.subscribe((state, changedKeys) => {
      if (changedKeys.some(k => ["aIncomeValue", "tIncomeValue", "iIncomeValue", "sResourcesValue"].includes(k))) {
        this.updateInputs();
        this.renderChart();
      }
    });
  }

  init() {
    this.container.innerHTML = `
      <div class="panel-section">
        <div class="panel-title">Economic Multipliers</div>
        <div class="form-row">
          <label>Base Attack Income</label>
          <input type="range" id="econAIncome" min="0" max="255" value="${store.get("aIncomeValue")}">
          <span id="lblAIncome" class="val-badge">${store.get("aIncomeValue")}</span>
        </div>
        <div class="form-row">
          <label>Territorial Income</label>
          <input type="range" id="econTIncome" min="0" max="255" value="${store.get("tIncomeValue")}">
          <span id="lblTIncome" class="val-badge">${store.get("tIncomeValue")}</span>
        </div>
        <div class="form-row">
          <label>Interest Rate System</label>
          <input type="range" id="econIIncome" min="0" max="255" value="${store.get("iIncomeValue")}">
          <span id="lblIIncome" class="val-badge">${store.get("iIncomeValue")}</span>
        </div>
        <div class="form-row">
          <label>Starting Troop Balance</label>
          <input type="number" id="econStartTroops" class="studio-input" min="0" max="2047" value="${store.get("sResourcesValue")}">
        </div>
      </div>

      <div class="panel-section">
        <div class="panel-title">Projected Growth Curve (Ticks 0–3000)</div>
        <canvas id="econChart" width="310" height="180" style="width: 100%; height: 180px; background: #0f172a; border-radius: 6px; border: 1px solid #334155;"></canvas>
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-dim); margin-top: 4px;">
          <span>Tick 0</span>
          <span>Tick 1500</span>
          <span>Tick 3000</span>
        </div>
      </div>
    `;

    this.chartCanvas = document.getElementById("econChart");
    if (this.chartCanvas) {
      this.chartCtx = this.chartCanvas.getContext("2d");
    }

    this.bindInputs();
    this.renderChart();
  }

  bindInputs() {
    const bindRange = (id, labelId, stateKey) => {
      const el = document.getElementById(id);
      const lbl = document.getElementById(labelId);
      if (el && lbl) {
        el.addEventListener("input", (e) => {
          const val = parseInt(e.target.value);
          lbl.textContent = val;
          store.set(stateKey, val);
          this.renderChart();
        });
      }
    };

    bindRange("econAIncome", "lblAIncome", "aIncomeValue");
    bindRange("econTIncome", "lblTIncome", "tIncomeValue");
    bindRange("econIIncome", "lblIIncome", "iIncomeValue");

    const startEl = document.getElementById("econStartTroops");
    if (startEl) {
      startEl.addEventListener("change", (e) => {
        store.set("sResourcesValue", Math.max(0, Math.min(2047, parseInt(e.target.value) || 0)));
        this.renderChart();
      });
    }
  }

  updateInputs() {
    const aEl = document.getElementById("econAIncome");
    if (aEl) aEl.value = store.get("aIncomeValue");
    const tEl = document.getElementById("econTIncome");
    if (tEl) tEl.value = store.get("tIncomeValue");
    const iEl = document.getElementById("econIIncome");
    if (iEl) iEl.value = store.get("iIncomeValue");
    const sEl = document.getElementById("econStartTroops");
    if (sEl) sEl.value = store.get("sResourcesValue");
  }

  renderChart() {
    if (!this.chartCtx) return;
    const ctx = this.chartCtx;
    const w = this.chartCanvas.width;
    const h = this.chartCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw grid
    ctx.strokeStyle = "rgba(51, 65, 85, 0.4)";
    ctx.lineWidth = 1;
    for (let x = 40; x < w; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 30; y < h; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const aIncome = store.get("aIncomeValue");
    const tIncome = store.get("tIncomeValue");
    const iIncome = store.get("iIncomeValue");
    const sResources = store.get("sResourcesValue");

    // Simulate 3000 ticks with step 30
    const points = [];
    let balance = sResources;
    let territory = 100;

    for (let tick = 0; tick <= 3000; tick += 30) {
      // Simulate organic growth
      territory += Math.floor(Math.sqrt(territory) * 0.4);
      const incA = aIncome;
      const incT = Math.floor((territory * tIncome) / 128);
      const incI = Math.floor((balance * iIncome) / 2048);
      balance += (incA + incT + incI) * 0.3;

      points.push({ tick, balance });
    }

    const maxBal = Math.max(...points.map(p => p.balance), 10000);

    // Draw curve
    ctx.beginPath();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;

    points.forEach((p, idx) => {
      const x = (p.tick / 3000) * (w - 20) + 10;
      const y = h - (p.balance / maxBal) * (h - 30) - 10;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Fill gradient under curve
    ctx.lineTo(w - 10, h - 10);
    ctx.lineTo(10, h - 10);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(56, 189, 248, 0.25)");
    grad.addColorStop(1, "rgba(56, 189, 248, 0.0)");
    ctx.fillStyle = grad;
    ctx.fill();

    // Max balance tag
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText(`Max: ${Math.round(maxBal).toLocaleString()}`, 12, 18);
  }
}
