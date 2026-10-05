/**
 * TerriX Scenario Studio - Diplomacy & Alliances Matrix Panel
 * Manages pre-signed NAPs, permanent alliances, and timed truces between entities.
 */

import { store } from "../state.js";
import { showToast } from "../ui/components.js";

export class DiplomacyPanel {
  constructor(container) {
    this.container = container;
    this.render();
    store.subscribe((state, changedKeys) => {
      if (changedKeys.includes("diplomacy") || changedKeys.includes("playerNamesData")) {
        this.updateTables();
      }
    });
  }

  render() {
    this.container.innerHTML = `
      <div class="panel-section">
        <div class="panel-title">Diplomatic Relations & Alliances</div>
        <p style="font-size: 11px; color: #94a3b8; margin-bottom: 12px;">
          Configure pre-signed Non-Aggression Pacts (NAPs), permanent peace pacts, and combat truce timers prior to tick 0.
        </p>

        <!-- Add Relation Form -->
        <div style="background: rgba(14, 22, 38, 0.6); padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 14px;">
          <div style="display: flex; gap: 6px; margin-bottom: 8px;">
            <div style="flex: 1;">
              <label style="font-size: 10px; color: #94a3b8;">Party A</label>
              <select id="selDiplomacyPartyA" class="studio-input" style="width: 100%;"></select>
            </div>
            <div style="flex: 1;">
              <label style="font-size: 10px; color: #94a3b8;">Party B</label>
              <select id="selDiplomacyPartyB" class="studio-input" style="width: 100%;"></select>
            </div>
          </div>

          <div style="display: flex; gap: 6px; align-items: flex-end;">
            <div style="flex: 1.2;">
              <label style="font-size: 10px; color: #94a3b8;">Treaty Type</label>
              <select id="selDiplomacyType" class="studio-input" style="width: 100%;">
                <option value="nap">Non-Aggression Pact (NAP)</option>
                <option value="alliance">Permanent Alliance</option>
                <option value="truce">Truce Until Tick</option>
              </select>
            </div>
            <div id="colTruceDuration" style="flex: 0.8; display: none;">
              <label style="font-size: 10px; color: #94a3b8;">Freeze Ticks</label>
              <input type="number" id="inpTruceTick" class="studio-input" value="300" min="10" max="5000" style="width: 100%;">
            </div>
            <button id="btnAddDiplomacyTreaty" class="studio-btn btn-primary" style="height: 28px; padding: 0 12px;">+ Sign</button>
          </div>
        </div>

        <!-- Active Treaties List -->
        <div class="panel-subtitle" style="font-size: 11px; font-weight: 700; color: #e2e8f0; margin-bottom: 6px;">Active Treaties & Pacts</div>
        <div id="diplomacyTreatiesList" style="display: flex; flex-direction: column; gap: 6px; max-height: 280px; overflow-y: auto;">
          <!-- Dynamically populated -->
        </div>
      </div>
    `;

    this.populatePlayerSelects();
    this.initEvents();
    this.updateTables();
  }

  populatePlayerSelects() {
    const pCount = store.get("playerCount") || 512;
    const names = store.get("playerNamesData") || [];
    const selA = document.getElementById("selDiplomacyPartyA");
    const selB = document.getElementById("selDiplomacyPartyB");
    if (!selA || !selB) return;

    let html = "";
    for (let i = 0; i < Math.min(pCount, 128); i++) {
      const name = names[i] || (i === 0 ? "Player" : `Bot ${i}`);
      html += `<option value="${i}">${i}: ${name}</option>`;
    }
    selA.innerHTML = html;
    selB.innerHTML = html;
    if (selB.options.length > 1) selB.selectedIndex = 1;
  }

  initEvents() {
    const selType = document.getElementById("selDiplomacyType");
    const colTruce = document.getElementById("colTruceDuration");
    selType?.addEventListener("change", (e) => {
      if (colTruce) {
        colTruce.style.display = e.target.value === "truce" ? "block" : "none";
      }
    });

    document.getElementById("btnAddDiplomacyTreaty")?.addEventListener("click", () => {
      const p1 = parseInt(document.getElementById("selDiplomacyPartyA").value);
      const p2 = parseInt(document.getElementById("selDiplomacyPartyB").value);
      if (p1 === p2) {
        showToast("Cannot establish treaty between a party and itself", "error");
        return;
      }

      const type = document.getElementById("selDiplomacyType").value;
      const dip = store.get("diplomacy") || { naps: [], alliances: [], truces: [] };

      if (type === "nap") {
        if (!dip.naps.some(([a, b]) => (a === p1 && b === p2) || (a === p2 && b === p1))) {
          dip.naps.push([p1, p2]);
          showToast(`Signed NAP between #${p1} and #${p2}`, "success");
        }
      } else if (type === "alliance") {
        if (!dip.alliances.some(([a, b]) => (a === p1 && b === p2) || (a === p2 && b === p1))) {
          dip.alliances.push([p1, p2]);
          showToast(`Formed Permanent Alliance between #${p1} and #${p2}`, "success");
        }
      } else if (type === "truce") {
        const tick = parseInt(document.getElementById("inpTruceTick").value) || 300;
        dip.truces.push({ p1, p2, untilTick: tick });
        showToast(`Established Truce until Tick ${tick} between #${p1} and #${p2}`, "success");
      }

      store.set("diplomacy", dip, false, true);
      this.updateTables();
    });
  }

  updateTables() {
    const listEl = document.getElementById("diplomacyTreatiesList");
    if (!listEl) return;

    const dip = store.get("diplomacy") || { naps: [], alliances: [], truces: [] };
    const names = store.get("playerNamesData") || [];

    if (dip.naps.length === 0 && dip.alliances.length === 0 && dip.truces.length === 0) {
      listEl.innerHTML = `<div style="font-size: 11px; color: #64748b; padding: 10px; text-align: center;">No treaties signed. Add NAPs or alliances above.</div>`;
      return;
    }

    let items = "";

    // NAPs
    dip.naps.forEach(([p1, p2], idx) => {
      const name1 = names[p1] || `#${p1}`;
      const name2 = names[p2] || `#${p2}`;
      items += `
        <div style="display: flex; justify-content: space-between; align-items: center; background: #131d31; padding: 6px 10px; border-radius: 4px; border-left: 3px solid #0070e0;">
          <div style="font-size: 12px; color: #e2e8f0;">
            <span style="color: #60a5fa; font-weight: 600;">[NAP]</span> ${name1} 🤝 ${name2}
          </div>
          <button class="studio-btn btn-danger btn-remove-nap" data-idx="${idx}" style="padding: 2px 6px; font-size: 10px;">✕</button>
        </div>
      `;
    });

    // Alliances
    dip.alliances.forEach(([p1, p2], idx) => {
      const name1 = names[p1] || `#${p1}`;
      const name2 = names[p2] || `#${p2}`;
      items += `
        <div style="display: flex; justify-content: space-between; align-items: center; background: #131d31; padding: 6px 10px; border-radius: 4px; border-left: 3px solid #10b981;">
          <div style="font-size: 12px; color: #e2e8f0;">
            <span style="color: #10b981; font-weight: 600;">[ALLIANCE]</span> ${name1} 🛡️ ${name2}
          </div>
          <button class="studio-btn btn-danger btn-remove-alliance" data-idx="${idx}" style="padding: 2px 6px; font-size: 10px;">✕</button>
        </div>
      `;
    });

    // Truces
    dip.truces.forEach((t, idx) => {
      const name1 = names[t.p1] || `#${t.p1}`;
      const name2 = names[t.p2] || `#${t.p2}`;
      items += `
        <div style="display: flex; justify-content: space-between; align-items: center; background: #131d31; padding: 6px 10px; border-radius: 4px; border-left: 3px solid #ffd700;">
          <div style="font-size: 12px; color: #e2e8f0;">
            <span style="color: #ffd700; font-weight: 600;">[TRUCE]</span> ${name1} ⏳ ${name2} (Tick ${t.untilTick})
          </div>
          <button class="studio-btn btn-danger btn-remove-truce" data-idx="${idx}" style="padding: 2px 6px; font-size: 10px;">✕</button>
        </div>
      `;
    });

    listEl.innerHTML = items;

    listEl.querySelectorAll(".btn-remove-nap").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.target.dataset.idx);
        dip.naps.splice(idx, 1);
        store.set("diplomacy", dip, false, true);
        this.updateTables();
      });
    });

    listEl.querySelectorAll(".btn-remove-alliance").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.target.dataset.idx);
        dip.alliances.splice(idx, 1);
        store.set("diplomacy", dip, false, true);
        this.updateTables();
      });
    });

    listEl.querySelectorAll(".btn-remove-truce").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.target.dataset.idx);
        dip.truces.splice(idx, 1);
        store.set("diplomacy", dip, false, true);
        this.updateTables();
      });
    });
  }
}
