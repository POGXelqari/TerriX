#!/usr/bin/env python3
"""
Script to inject PIN Authentication, Closed-Loop Withdrawal enforcement,
and Zero-Trust In-Game Identity Badges into web/pages/cbm.html and cbm_wispbyte/cbm.html.
"""

import os
import shutil

MODAL_CSS = """
    /* Modal Dialog Styling */
    .cbm-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(4, 7, 13, 0.78);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 1000;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .cbm-modal-backdrop.active {
      display: flex;
    }
    .cbm-modal-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-bright);
      border-radius: var(--radius-lg);
      max-width: 440px;
      width: 100%;
      padding: 24px;
      box-shadow: 0 20px 48px rgba(0, 0, 0, 0.6);
      position: relative;
      animation: modalSlideIn 0.2s ease-out;
    }
    @keyframes modalSlideIn {
      from { opacity: 0; transform: translateY(12px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
"""

MODAL_HTML = """
  <!-- Modal: Action Authorization Prompt -->
  <div id="pinPromptModal" class="cbm-modal-backdrop">
    <div class="cbm-modal-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">🔒</span>
          <h3 style="font-size: 17px; font-weight: 700; color: #fff;">Authorization Required</h3>
        </div>
        <button type="button" class="btn-game btn-game-secondary btn-game-sm" onclick="closePinPromptModal()" style="border-radius: 50%; width: 28px; height: 28px; padding: 0;">✕</button>
      </div>

      <p style="font-size: 13px; color: var(--text-dim); line-height: 1.5; margin-bottom: 16px;" id="pinPromptDesc">
        Please enter your 6-digit CBM Access PIN to authorize this balance action on account <strong id="pinPromptAccName" style="color: #fff;"></strong>.
      </p>

      <form onsubmit="submitPinPrompt(event)">
        <div class="game-form-group">
          <label>6-Digit Access PIN</label>
          <input type="password" id="promptPinInput" class="game-input" maxlength="8" placeholder="••••••" autocomplete="off" inputmode="numeric" required autofocus style="text-align: center; font-size: 24px; letter-spacing: 0.3em;">
        </div>

        <div class="game-form-group" style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
          <input type="checkbox" id="promptRememberPin" checked style="accent-color: var(--paypal-blue); width: 16px; height: 16px; cursor: pointer;">
          <label for="promptRememberPin" style="margin-bottom: 0; font-size: 12px; cursor: pointer; color: var(--text-dim);">Keep authorized for this browser session</label>
        </div>

        <div style="display: flex; gap: 10px;">
          <button type="submit" class="btn-game btn-game-primary" style="flex: 1;">Authorize Action</button>
          <button type="button" class="btn-game btn-game-secondary" onclick="closePinPromptModal()">Cancel</button>
        </div>
      </form>
      <div id="promptPinResult" style="margin-top: 12px;"></div>
    </div>
  </div>

  <!-- Modal: Set / Change PIN -->
  <div id="pinManageModal" class="cbm-modal-backdrop">
    <div class="cbm-modal-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">🔑</span>
          <h3 id="managePinModalTitle" style="font-size: 17px; font-weight: 700; color: #fff;">Configure Access PIN</h3>
        </div>
        <button type="button" class="btn-game btn-game-secondary btn-game-sm" onclick="closePinManageModal()" style="border-radius: 50%; width: 28px; height: 28px; padding: 0;">✕</button>
      </div>

      <p style="font-size: 13px; color: var(--text-dim); line-height: 1.5; margin-bottom: 16px;">
        Your 6-digit PIN cryptographically signs withdrawals, profile changes, and loan requests. PBKDF2-HMAC-SHA256 encrypted.
      </p>

      <form onsubmit="handleManagePinSubmit(event)">
        <div class="game-form-group">
          <label>Target Account</label>
          <input type="text" id="managePinAcc" class="game-input" disabled style="opacity: 0.7; cursor: not-allowed;">
        </div>

        <div class="game-form-group" id="managePinCurrentGroup" style="display: none;">
          <label>Current 6-Digit PIN</label>
          <input type="password" id="managePinCurrent" class="game-input" maxlength="8" placeholder="••••••" autocomplete="off" inputmode="numeric">
        </div>

        <div class="game-form-group">
          <label>New 6-Digit PIN</label>
          <input type="password" id="managePinNew" class="game-input" maxlength="8" placeholder="Enter 6 digits (0-9)" required autocomplete="off" inputmode="numeric">
        </div>

        <div class="game-form-group">
          <label>Confirm New PIN</label>
          <input type="password" id="managePinConfirm" class="game-input" maxlength="8" placeholder="Re-enter 6 digits" required autocomplete="off" inputmode="numeric">
        </div>

        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button type="submit" class="btn-game btn-game-primary" style="flex: 1;" id="btnSubmitManagePin">Save Access PIN</button>
          <button type="button" class="btn-game btn-game-secondary" onclick="closePinManageModal()">Cancel</button>
        </div>
      </form>
      <div id="managePinResult" style="margin-top: 12px;"></div>
    </div>
  </div>
"""

def update_html():
    target_file = 'g:/TerriX/web/pages/cbm.html'
    with open(target_file, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Insert Modal CSS before </style>
    if '.cbm-modal-backdrop' not in html:
        html = html.replace('  </style>', MODAL_CSS + '\n  </style>', 1)

    # 2. Update In-Game Identity Card header (Badges + Security PIN button)
    old_identity_header = """                  <span class="game-pill mono">Account: <strong id="accAccountName" style="color: #fff;">None</strong></span>
                  <span class="game-pill blue">Clan: <strong id="accClanTag">ANTI-OG</strong></span>
                  <span class="game-pill green">Role: <strong id="accRole">Member</strong></span>
                </div>
              </div>
            </div>
            <div>
              <button class="btn-game btn-game-secondary" onclick="openProfileEdit()">✏️ Edit Profile</button>
            </div>"""

    new_identity_header = """                  <span class="game-pill mono">Account: <strong id="accAccountName" style="color: #fff;">None</strong></span>
                  <span class="game-pill blue">Clan: <strong id="accClanTag">ANTI-OG</strong></span>
                  <span class="game-pill green">Role: <strong id="accRole">Member</strong></span>
                  <span id="accPinBadge" class="game-pill" style="cursor: pointer;" onclick="openPinModal()" title="Configure Access PIN">🔒 Checking PIN...</span>
                  <span id="accVerifiedBadge" class="game-pill blue">Unverified Identity</span>
                </div>
              </div>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn-game btn-game-secondary" onclick="openPinModal()" id="btnManagePin">🔑 Security PIN</button>
              <button class="btn-game btn-game-secondary" onclick="openProfileEdit()">✏️ Edit Profile</button>
            </div>"""

    if old_identity_header in html:
        html = html.replace(old_identity_header, new_identity_header, 1)

    # 3. Add PIN field to Edit Profile form
    old_profile_avatar_group = """            <!-- Avatar Preview & Presets -->
            <div class="game-subpanel" style="margin-bottom: 16px; display: flex; align-items: center; gap: 14px;">"""

    new_profile_avatar_group = """            <div class="game-form-group" id="profilePinGroup">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="margin-bottom: 0;">6-Digit CBM Access PIN</label>
                <span id="profilePinNote" style="font-size: 11px; color: var(--text-dim);">Required if PIN protected</span>
              </div>
              <input type="password" id="editProfilePin" class="game-input" maxlength="8" placeholder="••••••" autocomplete="off" inputmode="numeric">
            </div>

            <!-- Avatar Preview & Presets -->
            <div class="game-subpanel" style="margin-bottom: 16px; display: flex; align-items: center; gap: 14px;">"""

    if old_profile_avatar_group in html and 'editProfilePin' not in html:
        html = html.replace(old_profile_avatar_group, new_profile_avatar_group, 1)

    # 4. Enhance Outbound Withdrawal Desk (Closed-Loop Banner, Destination selector, PIN input)
    old_withdrawal_form = """          <form onsubmit="handleWithdraw(event)">
            <div class="game-form-group">
              <label>Your Registered Account Name</label>
              <input type="text" id="wAccName" class="game-input" placeholder="e.g. B8bbq" required>
            </div>

            <div class="game-form-group">
              <label>Recipient In-Game Account</label>
              <input type="text" id="wTargetAcc" class="game-input" placeholder="Defaults to your account name">
            </div>

            <div class="game-form-group">
              <label>Withdrawal Amount (Gold Units)</label>
              <input type="number" id="wAmount" class="game-input" min="1" max="50" placeholder="1" required>
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 4px; font-family: system-ui, sans-serif;">
                <span style="color: var(--text-dim);">Platform Fee:</span>
                <strong class="text-green">0.00 Gold (Covered 100% by Bank)</strong>
              </div>
            </div>

            <button type="submit" class="btn-game btn-game-primary" style="width: 100%;">Authorize & Disburse Withdrawal</button>
          </form>"""

    new_withdrawal_form = """          <!-- Closed-Loop Protection Banner -->
          <div class="game-subpanel" style="margin-bottom: 14px; border-left: 3px solid var(--paypal-blue); background: var(--panel-2);">
            <div style="display: flex; gap: 10px; align-items: flex-start;">
              <span style="font-size: 18px;">🛡️</span>
              <div>
                <strong style="color: #fff; font-size: 12px; text-transform: uppercase;">Closed-Loop Anti-Fraud Protection</strong>
                <p style="color: var(--text-dim); font-size: 12px; line-height: 1.45; margin-top: 2px;">
                  Withdrawals strictly return to your verified in-game account on record or a verified linked payment method. Siphoning funds to unauthorized third parties is rejected.
                </p>
              </div>
            </div>
          </div>

          <form onsubmit="handleWithdraw(event)">
            <div class="game-form-group">
              <label>Your Registered Account Name</label>
              <input type="text" id="wAccName" class="game-input" placeholder="e.g. B8bbq" required>
            </div>

            <div class="game-form-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="margin-bottom: 0;">Recipient In-Game Account</label>
                <span style="font-size: 11px; color: var(--success);">🔒 Closed-Loop Enforced</span>
              </div>
              <input type="text" id="wTargetAcc" class="game-input" placeholder="Defaults to your registered account">
              <div id="wVerifiedDestinations" style="display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap;"></div>
            </div>

            <div class="game-form-group" id="wPinGroup">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="margin-bottom: 0;">6-Digit CBM Access PIN</label>
                <span id="wPinStatusLabel" style="font-size: 11px; color: var(--text-dim);">Required if account is PIN protected</span>
              </div>
              <input type="password" id="wPin" class="game-input" maxlength="8" placeholder="••••••" autocomplete="off" inputmode="numeric">
            </div>

            <div class="game-form-group">
              <label>Withdrawal Amount (Gold Units)</label>
              <input type="number" id="wAmount" class="game-input" min="1" max="50" placeholder="1" required>
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 4px; font-family: system-ui, sans-serif;">
                <span style="color: var(--text-dim);">Platform Fee:</span>
                <strong class="text-green">0.00 Gold (Covered 100% by Bank)</strong>
              </div>
            </div>

            <button type="submit" class="btn-game btn-game-primary" style="width: 100%;">Authorize & Disburse Withdrawal</button>
          </form>"""

    if old_withdrawal_form in html:
        html = html.replace(old_withdrawal_form, new_withdrawal_form, 1)

    # 5. Add PIN field to Donate Form
    old_donate_memo = """              <div class="game-form-group">
                <label>Encouragement / Memo (Optional)</label>
                <input type="text" id="donateMessage" class="game-input" placeholder="e.g. Clan treasury contribution" maxlength="120">
              </div>"""

    new_donate_memo = """              <div class="game-form-group">
                <label>Encouragement / Memo (Optional)</label>
                <input type="text" id="donateMessage" class="game-input" placeholder="e.g. Clan treasury contribution" maxlength="120">
              </div>

              <div class="game-form-group" id="donatePinGroup">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <label style="margin-bottom: 0;">6-Digit CBM Access PIN</label>
                  <span style="font-size: 11px; color: var(--text-dim);">Required if PIN protected</span>
                </div>
                <input type="password" id="donatePin" class="game-input" maxlength="8" placeholder="••••••" autocomplete="off" inputmode="numeric">
              </div>"""

    if old_donate_memo in html and 'donatePin' not in html:
        html = html.replace(old_donate_memo, new_donate_memo, 1)

    # 6. Add PIN field to Link Payment Method form
    old_pm_primary = """            <div class="game-form-group" style="display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" id="pmIsPrimary" checked style="accent-color: var(--game-green); width: 16px; height: 16px; cursor: pointer;">
              <label for="pmIsPrimary" style="margin-bottom: 0; font-size: 12px; cursor: pointer;">Set as Primary Payment Method</label>
            </div>"""

    new_pm_primary = """            <div class="game-form-group" id="pmPinGroup">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="margin-bottom: 0;">6-Digit CBM Access PIN</label>
                <span style="font-size: 11px; color: var(--text-dim);">Required if PIN protected</span>
              </div>
              <input type="password" id="pmPin" class="game-input" maxlength="8" placeholder="••••••" autocomplete="off" inputmode="numeric">
            </div>

            <div class="game-form-group" style="display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" id="pmIsPrimary" checked style="accent-color: var(--game-green); width: 16px; height: 16px; cursor: pointer;">
              <label for="pmIsPrimary" style="margin-bottom: 0; font-size: 12px; cursor: pointer;">Set as Primary Payment Method</label>
            </div>"""

    if old_pm_primary in html and 'pmPin' not in html:
        html = html.replace(old_pm_primary, new_pm_primary, 1)

    # 7. Add Modals before </body>
    if 'pinPromptModal' not in html:
        html = html.replace('</body>', MODAL_HTML + '\n</body>', 1)

    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Base HTML structure updated successfully.")

if __name__ == '__main__':
    update_html()
