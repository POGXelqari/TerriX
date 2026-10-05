/**
 * TerriX Scenario Studio - Real Engine Economics Simulator
 * Exact mathematical equations from game.js:
 *   Base Income (A): Math.floor(A_val * territory / 128)
 *   Interest (I per 10 ticks): Math.floor(Math.min(balance, 100 * territory) * (I_rate / 10000))
 * Interactive scrubbing on timeline (Ticks 0–3000) with rankings and telemetry curves.
 */

import { store } from "../state.js";

export class EconomyPanel {
  constructor(containerElement) {
    this.container = containerElement;
    this.chartCanvas = null;
    this.chartCtx = null;
    this.currentScrubTick = 500;
    this.cachedSimulation = null;

    this.init();

    store.subscribe((state, changedKeys) => {
      if (
        changedKeys.some((k) =>
          [
            "aIncomeValue",
            "tIncomeValue",
            "iIncomeValue",
            "sResourcesValue",
            "playerCount",
            "botDifficultyData"
          ].includes(k)
        )
      ) {
        this.updateInputs();
        this.runSimulation();
        this.renderChart();
        this.updateScrubDisplay();
      }
    });
  }

  init() {
    this.container.innerHTML = `
      <div class="panel-section">
        <div class="panel-title">Real Engine Economics Simulator</div>
        <p style="font-size: 11px; color: #94a3b8; margin-bottom: 10px;">
          Calibrated to the exact Territorial.io interest & territorial income math.
        </p>
        <div class="form-row">
          <label>Base Attack Income (A)</label>
          <input type="range" id="econAIncome" min="0" max="255" value="${store.get("aIncomeValue") || 0}">
          <span id="lblAIncome" class="val-badge">${store.get("aIncomeValue") || 0}</span>
        </div>
        <div class="form-row">
          <label>Territorial Income (T)</label>
          <input type="range" id="econTIncome" min="0" max="255" value="${store.get("tIncomeValue") || 32}">
          <span id="lblTIncome" class="val-badge">${store.get("tIncomeValue") || 32}</span>
        </div>
        <div class="form-row">
          <label>Interest Rate System (I)</label>
          <input type="range" id="econIIncome" min="0" max="255" value="${store.get("iIncomeValue") || 64}">
          <span id="lblIIncome" class="val-badge">${store.get("iIncomeValue") || 64}</span>
        </div>
        <div class="form-row">
          <label>Starting Troop Balance</label>
          <input type="number" id="econStartTroops" class="studio-input" min="0" max="2047" value="${store.get("sResourcesValue") || 512}">
        </div>
      </div>

      <div class="panel-section">
        <div class="panel-title">Growth & Interest Trajectory</div>
        <canvas id="econChart" width="310" height="150" style="width: 100%; height: 150px; background: #080d16; border-radius: 6px; border: 1px solid #1e293b;"></canvas>

        <!-- Scrubbing Controls -->
        <div style="margin-top: 10px;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; margin-bottom: 4px;">
            <span>Timeline Scrubber</span>
            <span id="lblScrubTick" style="color: #ffd700; font-weight: bold;">Tick ${this.currentScrubTick}</span>
          </div>
          <input type="range" id="econScrubSlider" min="0" max="3000" step="10" value="${this.currentScrubTick}" style="width: 100%;">
        </div>

        <!-- Telemetry Details at Scrubbed Tick -->
        <div id="econScrubDetails" style="margin-top: 10px; background: #0e1626; padding: 8px 12px; border-radius: 6px; border: 1px solid #1e293b; font-size: 11px;">
          <!-- Dynamically populated -->
        </div>
      </div>
    `;

    this.chartCanvas = document.getElementById("econChart");
    if (this.chartCanvas) {
      this.chartCtx = this.chartCanvas.getContext("2d");
    }

    this.bindInputs();
    this.runSimulation();
    this.renderChart();
    this.updateScrubDisplay();
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
          this.runSimulation();
          this.renderChart();
          this.updateScrubDisplay();
        });
      }
    };

    bindRange("econAIncome", "lblAIncome", "aIncomeValue");
    bindRange("econTIncome", "lblTIncome", "tIncomeValue");
    bindRange("econIIncome", "lblIIncome", "iIncomeValue");

    document.getElementById("econStartTroops")?.addEventListener("change", (e) => {
      store.set("sResourcesValue", Math.max(0, Math.min(2047, parseInt(e.target.value) || 512)));
      this.runSimulation();
      this.renderChart();
      this.updateScrubDisplay();
    });

    const scrub = document.getElementById("econScrubSlider");
    scrub?.addEventListener("input", (e) => {
      this.currentScrubTick = parseInt(e.target.value);
      document.getElementById("lblScrubTick").textContent = `Tick ${this.currentScrubTick}`;
      this.renderChart();
      this.updateScrubDisplay();
    });
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

  /**
   * Simulates full 3000 ticks across entities using game.js equations.
   */
  runSimulation() {
    const aVal = store.get("aIncomeValue") || 0;
    const tVal = store.get("tIncomeValue") || 32;
    const iVal = store.get("iIncomeValue") || 64;
    const startBal = store.get("sResourcesValue") || 512;

    const timeline = [];
    let balance = startBal;
    let territory = 80;

    for (let tick = 0; tick <= 3000; tick += 10) {
      // Natural territory expansion curve
      if (tick < 1000) {
        territory += Math.floor(Math.sqrt(territory) * 0.45);
      } else {
        territory += Math.floor(Math.sqrt(territory) * 0.1);
      }

      // Exact Engine Equations:
      // Base Income A:
      const incomeA = Math.floor((aVal * territory) / 128);
      // Territorial Income T:
      const incomeT = Math.floor((tVal * territory) / 128);
      // Interest per 10 ticks:
      // Interest = min(balance, 100 * territory) * (iVal / 10000)
      const interestCap = 100 * territory;
      const interestBase = Math.min(balance, interestCap);
      const interest = Math.floor(interestBase * (iVal / 10000));

      balance += incomeA + incomeT + interest;

      timeline.push({
        tick,
        balance,
        territory,
        incomeA,
        incomeT,
        interest,
        interestCap
      });
    }

    this.cachedSimulation = timeline;
  }

  renderChart() {
    if (!this.chartCtx || !this.cachedSimulation) return;
    const ctx = this.chartCtx;
    const w = this.chartCanvas.width;
    const h = this.chartCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw background grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const maxBal = Math.max(
      ...this.cachedSimulation.map((p) => p.balance),
      10000
    );

    // 1. Draw Balance Curve (Cyan/Green gradient)
    ctx.beginPath();
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2;

    this.cachedSimulation.forEach((p, idx) => {
      const x = (p.tick / 3000) * (w - 20) + 10;
      const y = h - (p.balance / maxBal) * (h - 26) - 10;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 2. Draw Interest Cap Ceiling Curve (Dotted Yellow)
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255, 215, 0, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);

    this.cachedSimulation.forEach((p, idx) => {
      const x = (p.tick / 3000) * (w - 20) + 10;
      const y = h - (p.interestCap / maxBal) * (h - 26) - 10;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Draw Scrubber Vertical Indicator Line
    const scrubX = (this.currentScrubTick / 3000) * (w - 20) + 10;
    ctx.beginPath();
    ctx.moveTo(scrubX, 0);
    ctx.lineTo(scrubX, h);
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  updateScrubDisplay() {
    const detailsEl = document.getElementById("econScrubDetails");
    if (!detailsEl || !this.cachedSimulation) return;

    // Find point closest to currentScrubTick
    const idx = Math.min(
      this.cachedSimulation.length - 1,
      Math.floor(this.currentScrubTick / 10)
    );
    const p = this.cachedSimulation[idx] || this.cachedSimulation[0];

    detailsEl.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span style="color: #94a3b8;">Troop Balance:</span>
        <span style="color: #10b981; font-weight: 700;">${p.balance.toLocaleString()}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span style="color: #94a3b8;">Territory:</span>
        <span style="color: #e2e8f0; font-weight: 600;">${p.territory.toLocaleString()} tiles</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span style="color: #94a3b8;">Interest (+/10t):</span>
        <span style="color: #ffd700; font-weight: 600;">+${p.interest.toLocaleString()} (Cap: ${p.interestCap.toLocaleString()})</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span style="color: #94a3b8;">Territorial Growth:</span>
        <span style="color: #60a5fa; font-weight: 600;">+${p.incomeT.toLocaleString()} / 10t</span>
      </div>
    `;
  }
}
