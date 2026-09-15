#!/usr/bin/env python3
"""
Script to inject PIN state management and handler logic into web/pages/cbm.html
and copy the completed file to cbm_wispbyte/cbm.html.
"""

import os
import shutil

JS_PIN_LOGIC = """
    // --- PIN Authentication & Security Session State ---
    let currentActiveAccount = null;
    let pendingPinAction = null;

    function getSessionPin() {
      return sessionStorage.getItem('cbm_session_pin') || '';
    }
    function setSessionPin(pin) {
      if (pin) sessionStorage.setItem('cbm_session_pin', pin);
    }
    function clearSessionPin() {
      sessionStorage.removeItem('cbm_session_pin');
    }

    function openPinModal() {
      if (!currentActiveAccount || !currentActiveAccount.account_name) {
        showToast('Please lookup an account first.', 'info');
        return;
      }
      const modal = document.getElementById('pinManageModal');
      const accInput = document.getElementById('managePinAcc');
      const currentGroup = document.getElementById('managePinCurrentGroup');
      const modalTitle = document.getElementById('managePinModalTitle');
      const submitBtn = document.getElementById('btnSubmitManagePin');
      const resDiv = document.getElementById('managePinResult');

      accInput.value = currentActiveAccount.account_name;
      resDiv.innerHTML = '';
      document.getElementById('managePinNew').value = '';
      document.getElementById('managePinConfirm').value = '';
      document.getElementById('managePinCurrent').value = '';

      if (currentActiveAccount.has_pin) {
        modalTitle.innerText = "Change CBM Access PIN";
        currentGroup.style.display = "block";
        submitBtn.innerText = "Update PIN";
      } else {
        modalTitle.innerText = "Set 6-Digit Access PIN";
        currentGroup.style.display = "none";
        submitBtn.innerText = "Set PIN";
      }
      modal.classList.add('active');
    }

    function closePinManageModal() {
      document.getElementById('pinManageModal').classList.remove('active');
    }

    async function handleManagePinSubmit(e) {
      e.preventDefault();
      const account_name = document.getElementById('managePinAcc').value.trim();
      const current_pin = document.getElementById('managePinCurrent').value.trim();
      const pin = document.getElementById('managePinNew').value.trim();
      const confirm_pin = document.getElementById('managePinConfirm').value.trim();
      const resDiv = document.getElementById('managePinResult');

      if (!/^\d{4,8}$/.test(pin)) {
        showToast('PIN must be 4 to 8 digits.', 'error');
        resDiv.innerHTML = '<span class="text-red">✗ PIN must consist of 4 to 8 numeric digits.</span>';
        return;
      }
      if (pin !== confirm_pin) {
        showToast('New PIN and confirmation do not match.', 'error');
        resDiv.innerHTML = '<span class="text-red">✗ New PIN and confirmation do not match.</span>';
        return;
      }

      resDiv.innerHTML = '<span style="color: var(--text-dim);">Saving Access PIN...</span>';
      try {
        const res = await fetch('/api/cbm/auth/set-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account_name, pin, current_pin })
        });
        const data = await res.json();
        if (res.ok) {
          setSessionPin(pin);
          showToast(data.message || 'PIN configured successfully!', 'success');
          resDiv.innerHTML = `<span class="text-green">✓ ${data.message}</span>`;
          setTimeout(() => {
            closePinManageModal();
            lookupAccount();
          }, 900);
        } else {
          showToast(data.message || 'Failed to update PIN.', 'error');
          resDiv.innerHTML = `<span class="text-red">✗ ${data.message}</span>`;
        }
      } catch (err) {
        showToast(err.message, 'error');
        resDiv.innerHTML = `<span class="text-red">✗ Error: ${err.message}</span>`;
      }
    }

    function requestPinAuthorization(actionCallback, reasonHtml) {
      const sessionPin = getSessionPin();
      if (sessionPin) {
        actionCallback(sessionPin);
        return;
      }
      pendingPinAction = actionCallback;
      const modal = document.getElementById('pinPromptModal');
      document.getElementById('pinPromptAccName').innerText = currentActiveAccount ? currentActiveAccount.account_name : '';
      if (reasonHtml) {
        document.getElementById('pinPromptDesc').innerHTML = reasonHtml;
      }
      document.getElementById('promptPinInput').value = '';
      document.getElementById('promptPinResult').innerHTML = '';
      modal.classList.add('active');
      setTimeout(() => document.getElementById('promptPinInput').focus(), 100);
    }

    function closePinPromptModal() {
      document.getElementById('pinPromptModal').classList.remove('active');
      pendingPinAction = null;
    }

    function submitPinPrompt(e) {
      e.preventDefault();
      const pin = document.getElementById('promptPinInput').value.trim();
      if (!pin) return;
      if (document.getElementById('promptRememberPin').checked) {
        setSessionPin(pin);
      }
      const cb = pendingPinAction;
      closePinPromptModal();
      if (cb) {
        cb(pin);
      }
    }
"""

def update_js():
    target_file = 'g:/TerriX/web/pages/cbm.html'
    with open(target_file, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Insert JS_PIN_LOGIC right after <script>
    if 'currentActiveAccount = null' not in html:
        html = html.replace('  <script>\n', '  <script>\n' + JS_PIN_LOGIC + '\n', 1)

    # 2. Update handleSaveProfile to support PIN
    old_handle_save_profile = """    async function handleSaveProfile(e) {
      e.preventDefault();
      const account_name = document.getElementById('editProfileAcc').value.trim();
      const display_name = document.getElementById('editProfileName').value.trim();
      const avatar_url = document.getElementById('editProfileAvatar').value.trim();
      const resDiv = document.getElementById('editProfileResult');

      if (!avatar_url) {
        showToast('Profile picture is required for account authenticity.', 'error');
        resDiv.innerHTML = '<span class="text-red">✗ Profile picture is required for account authenticity.</span>';
        return;
      }

      resDiv.innerHTML = '<span style="color: var(--text-dim);">Saving profile changes...</span>';
      try {
        const res = await fetch('/api/cbm/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account_name, display_name, avatar_url })
        });"""

    new_handle_save_profile = """    async function handleSaveProfile(e) {
      e.preventDefault();
      const account_name = document.getElementById('editProfileAcc').value.trim();
      const display_name = document.getElementById('editProfileName').value.trim();
      const avatar_url = document.getElementById('editProfileAvatar').value.trim();
      const pin = (document.getElementById('editProfilePin') ? document.getElementById('editProfilePin').value.trim() : '') || getSessionPin();
      const resDiv = document.getElementById('editProfileResult');

      if (!avatar_url) {
        showToast('Profile picture is required for account authenticity.', 'error');
        resDiv.innerHTML = '<span class="text-red">✗ Profile picture is required for account authenticity.</span>';
        return;
      }

      resDiv.innerHTML = '<span style="color: var(--text-dim);">Saving profile changes...</span>';
      try {
        const res = await fetch('/api/cbm/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account_name, display_name, avatar_url, pin })
        });"""

    if old_handle_save_profile in html:
        html = html.replace(old_handle_save_profile, new_handle_save_profile, 1)

    # 3. Update lookupAccount to record currentActiveAccount, render PIN/Verified badges, and auto-populate
    old_lookup_account = """          const acc = data.account;
          setActiveUser(acc);

          document.getElementById('accDisplayName').innerText = acc.display_name || acc.account_name;
          document.getElementById('accAccountName').innerText = acc.account_name;
          document.getElementById('accClanTag').innerText = acc.clan_tag || 'ANTI-OG';
          document.getElementById('accRole').innerText = acc.role ? (acc.role.charAt(0).toUpperCase() + acc.role.slice(1)) : 'Member';
          document.getElementById('accBalVal').innerText = acc.deposited_gold.toFixed(2) + ' Gold';
          document.getElementById('accTotalDep').innerText = `${acc.total_deposited_gold.toFixed(2)} Gold`;
          document.getElementById('accTotalWith').innerText = `${acc.total_withdrawn_gold.toFixed(2)} Gold`;"""

    new_lookup_account = """          const acc = data.account;
          currentActiveAccount = acc;
          setActiveUser(acc);

          document.getElementById('accDisplayName').innerText = acc.display_name || acc.account_name;
          document.getElementById('accAccountName').innerText = acc.account_name;
          document.getElementById('accClanTag').innerText = acc.clan_tag || 'ANTI-OG';
          document.getElementById('accRole').innerText = acc.role ? (acc.role.charAt(0).toUpperCase() + acc.role.slice(1)) : 'Member';
          document.getElementById('accBalVal').innerText = acc.deposited_gold.toFixed(2) + ' Gold';
          document.getElementById('accTotalDep').innerText = `${acc.total_deposited_gold.toFixed(2)} Gold`;
          document.getElementById('accTotalWith').innerText = `${acc.total_withdrawn_gold.toFixed(2)} Gold`;

          // PIN and Verified Badges
          const pinBadge = document.getElementById('accPinBadge');
          if (pinBadge) {
            if (acc.has_pin) {
              pinBadge.className = 'game-pill green';
              pinBadge.innerHTML = '🔒 PIN Protected';
              pinBadge.title = 'Cryptographically protected with 6-digit access PIN. Click to change.';
            } else {
              pinBadge.className = 'game-pill red';
              pinBadge.innerHTML = '⚠️ Set Access PIN';
              pinBadge.title = 'No PIN configured! Click to set 6-digit PIN.';
            }
          }

          const verBadge = document.getElementById('accVerifiedBadge');
          if (verBadge) {
            if (acc.is_verified) {
              verBadge.className = 'game-pill green';
              verBadge.innerHTML = '✓ Verified Owner';
              verBadge.title = 'In-game ownership confirmed via confirmed game ledger deposits.';
            } else {
              verBadge.className = 'game-pill mono';
              verBadge.innerHTML = 'Unverified Identity';
              verBadge.title = 'Transfer at least 1 Gold to vault in-game to verify ownership.';
            }
          }

          // Prepopulate form targets
          if (document.getElementById('wAccName')) document.getElementById('wAccName').value = acc.account_name;
          if (document.getElementById('wTargetAcc')) document.getElementById('wTargetAcc').value = acc.account_name;
          if (document.getElementById('donateAccName')) document.getElementById('donateAccName').value = acc.account_name;
          if (document.getElementById('pmCbmUser')) document.getElementById('pmCbmUser').value = acc.account_name;
          if (document.getElementById('pmLookupUser')) document.getElementById('pmLookupUser').value = acc.account_name;

          // Auto-fill session PIN if active
          const sPin = getSessionPin();
          if (sPin) {
            if (document.getElementById('wPin')) document.getElementById('wPin').value = sPin;
            if (document.getElementById('donatePin')) document.getElementById('donatePin').value = sPin;
            if (document.getElementById('editProfilePin')) document.getElementById('editProfilePin').value = sPin;
            if (document.getElementById('pmPin')) document.getElementById('pmPin').value = sPin;
          }

          // Render verified destination buttons for withdrawal
          const destContainer = document.getElementById('wVerifiedDestinations');
          if (destContainer) {
            destContainer.innerHTML = '';
            const selfBtn = document.createElement('button');
            selfBtn.type = 'button';
            selfBtn.className = 'btn-game btn-game-secondary btn-game-sm';
            selfBtn.innerText = `Verified Target: ${acc.account_name}`;
            selfBtn.onclick = () => { document.getElementById('wTargetAcc').value = acc.account_name; };
            destContainer.appendChild(selfBtn);
          }"""

    if old_lookup_account in html:
        html = html.replace(old_lookup_account, new_lookup_account, 1)

    # 4. Update handleWithdraw to prompt for PIN and pass PIN in payload
    old_handle_withdraw = """    async function handleWithdraw(e) {
      e.preventDefault();
      const account_name = document.getElementById('wAccName').value.trim();
      const target_account = document.getElementById('wTargetAcc').value.trim();
      const amount_gold = parseInt(document.getElementById('wAmount').value, 10);
      const resDiv = document.getElementById('wResult');

      resDiv.innerHTML = '<span style="color: var(--text-dim);">Submitting withdrawal request...</span>';
      try {
        const res = await fetch('/api/cbm/withdraw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account_name, target_account, amount_gold })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(data.message, 'success');
          resDiv.innerHTML = `<span class="text-green">✓ ${data.message}</span>`;
          loadStatus();
          if (account_name) lookupAccount();
        } else {
          showToast(data.message || data.error, 'error');
          resDiv.innerHTML = `<span class="text-red">✗ ${data.message || data.error}</span>`;
        }
      } catch (err) {
        showToast(err.message, 'error');
        resDiv.innerHTML = `<span class="text-red">✗ Error: ${err.message}</span>`;
      }
    }"""

    new_handle_withdraw = """    async function handleWithdraw(e) {
      e.preventDefault();
      const account_name = document.getElementById('wAccName').value.trim();
      const target_account = document.getElementById('wTargetAcc').value.trim() || account_name;
      const amount_gold = parseInt(document.getElementById('wAmount').value, 10);
      const resDiv = document.getElementById('wResult');

      let pin = (document.getElementById('wPin') ? document.getElementById('wPin').value.trim() : '') || getSessionPin();
      if (currentActiveAccount && currentActiveAccount.has_pin && !pin) {
        requestPinAuthorization((authorizedPin) => {
          if (document.getElementById('wPin')) document.getElementById('wPin').value = authorizedPin;
          executeWithdraw(account_name, target_account, amount_gold, authorizedPin, resDiv);
        }, `Enter your 6-digit CBM Access PIN to disburse <strong>${amount_gold} Gold</strong> to <strong>${target_account}</strong>.`);
        return;
      }

      executeWithdraw(account_name, target_account, amount_gold, pin, resDiv);
    }

    async function executeWithdraw(account_name, target_account, amount_gold, pin, resDiv) {
      resDiv.innerHTML = '<span style="color: var(--text-dim);">Submitting withdrawal request...</span>';
      try {
        const res = await fetch('/api/cbm/withdraw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account_name, target_account, amount_gold, pin })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(data.message, 'success');
          resDiv.innerHTML = `<span class="text-green">✓ ${data.message}</span>`;
          loadStatus();
          if (account_name) lookupAccount();
        } else {
          if (res.status === 401) {
            clearSessionPin();
          }
          showToast(data.message || data.error, 'error');
          resDiv.innerHTML = `<span class="text-red">✗ ${data.message || data.error}</span>`;
        }
      } catch (err) {
        showToast(err.message, 'error');
        resDiv.innerHTML = `<span class="text-red">✗ Error: ${err.message}</span>`;
      }
    }"""

    if old_handle_withdraw in html:
        html = html.replace(old_handle_withdraw, new_handle_withdraw, 1)

    # 5. Update handleDonate to prompt for PIN and pass PIN in payload
    old_handle_donate = """    async function handleDonate(e) {
      e.preventDefault();
      const account_name = document.getElementById('donateAccName').value.trim();
      const amount_gold = parseFloat(document.getElementById('donateAmount').value);
      const message = document.getElementById('donateMessage').value.trim();
      const resDiv = document.getElementById('donateResult');

      if (!account_name || isNaN(amount_gold) || amount_gold <= 0) {
        showToast("Enter a valid account name and contribution amount.", 'error');
        return;
      }

      resDiv.innerHTML = '<span style="color: var(--text-dim);">Processing Clan War Chest contribution...</span>';
      try {
        const res = await fetch('/api/cbm/donate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            account_name,
            amount_gold,
            message
          })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(`🛡️ Thank you! Contributed ${amount_gold.toFixed(2)} Gold to Clan Reserves!`, 'success');
          resDiv.innerHTML = `<div class="game-subpanel" style="padding: 10px; border-color: var(--game-green); color: var(--game-green); font-size: 13px;">
            ✓ ${data.message}<br><span style="color: var(--text-dim); font-size: 11px;">Remaining Balance: ${data.donation.new_balance_gold.toFixed(2)} Gold • Bank Reserves Expanded 1:1</span>
          </div>`;
          document.getElementById('donateAmount').value = '';
          document.getElementById('donateMessage').value = '';
          loadStatus();
          loadDonors();
          lookupAccount();
        } else {
          showToast(data.message || 'Donation failed.', 'error');
          resDiv.innerHTML = `<span class="text-red">✗ ${data.message}</span>`;
        }
      } catch (err) {
        showToast(err.message, 'error');
        resDiv.innerHTML = `<span class="text-red">✗ Error: ${err.message}</span>`;
      }
    }"""

    new_handle_donate = """    async function handleDonate(e) {
      e.preventDefault();
      const account_name = document.getElementById('donateAccName').value.trim();
      const amount_gold = parseFloat(document.getElementById('donateAmount').value);
      const message = document.getElementById('donateMessage').value.trim();
      const resDiv = document.getElementById('donateResult');

      if (!account_name || isNaN(amount_gold) || amount_gold <= 0) {
        showToast("Enter a valid account name and contribution amount.", 'error');
        return;
      }

      let pin = (document.getElementById('donatePin') ? document.getElementById('donatePin').value.trim() : '') || getSessionPin();
      if (currentActiveAccount && currentActiveAccount.has_pin && !pin) {
        requestPinAuthorization((authorizedPin) => {
          if (document.getElementById('donatePin')) document.getElementById('donatePin').value = authorizedPin;
          executeDonate(account_name, amount_gold, message, authorizedPin, resDiv);
        }, `Enter your 6-digit CBM Access PIN to authorize a <strong>${amount_gold.toFixed(2)} Gold</strong> contribution to the Clan War Chest.`);
        return;
      }

      executeDonate(account_name, amount_gold, message, pin, resDiv);
    }

    async function executeDonate(account_name, amount_gold, message, pin, resDiv) {
      resDiv.innerHTML = '<span style="color: var(--text-dim);">Processing Clan War Chest contribution...</span>';
      try {
        const res = await fetch('/api/cbm/donate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            account_name,
            amount_gold,
            message,
            pin
          })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(`🛡️ Thank you! Contributed ${amount_gold.toFixed(2)} Gold to Clan Reserves!`, 'success');
          resDiv.innerHTML = `<div class="game-subpanel" style="padding: 10px; border-color: var(--game-green); color: var(--game-green); font-size: 13px;">
            ✓ ${data.message}<br><span style="color: var(--text-dim); font-size: 11px;">Remaining Balance: ${data.donation.new_balance_gold.toFixed(2)} Gold • Bank Reserves Expanded 1:1</span>
          </div>`;
          document.getElementById('donateAmount').value = '';
          document.getElementById('donateMessage').value = '';
          loadStatus();
          loadDonors();
          lookupAccount();
        } else {
          if (res.status === 401) {
            clearSessionPin();
          }
          showToast(data.message || 'Donation failed.', 'error');
          resDiv.innerHTML = `<span class="text-red">✗ ${data.message}</span>`;
        }
      } catch (err) {
        showToast(err.message, 'error');
        resDiv.innerHTML = `<span class="text-red">✗ Error: ${err.message}</span>`;
      }
    }"""

    if old_handle_donate in html:
        html = html.replace(old_handle_donate, new_handle_donate, 1)

    # 6. Update handleLinkPaymentMethod to pass pin in payload
    old_link_payload = """        const payload = {
          cbm_username,
          verification_type: currentPmMethod,
          territorial_account,
          territorial_password,
          display_name,
          is_primary
        };"""

    new_link_payload = """        const pin = (document.getElementById('pmPin') ? document.getElementById('pmPin').value.trim() : '') || getSessionPin();
        const payload = {
          cbm_username,
          verification_type: currentPmMethod,
          territorial_account,
          territorial_password,
          display_name,
          is_primary,
          pin
        };"""

    if old_link_payload in html:
        html = html.replace(old_link_payload, new_link_payload, 1)

    # 7. Update loadUserPaymentMethods to add destination buttons for verified linked accounts
    old_render_pm = """            card.innerHTML = `
              <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 3px;">
                  <strong class="mono" style="font-size: 14px; color: #fff;">${pm.territorial_account_name}</strong>
                  ${pm.is_primary ? '<span class="game-pill gold" style="font-size: 9px; padding: 1px 4px;">PRIMARY</span>' : ''}
                </div>
                <div style="font-size: 11px; color: var(--text-dim); font-family: system-ui, sans-serif;">
                  ${pm.display_name ? `Label: <strong style="color: #cbd5e1;">${pm.display_name}</strong> • ` : ''}Lifetime Transacted: ${pm.total_transacted_gold || 0} Gold
                </div>
              </div>
              <div>
                <span class="${badgeClass}">
                  ${badgeLabel}
                </span>
              </div>
            `;
            container.appendChild(card);"""

    new_render_pm = """            card.innerHTML = `
              <div>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 3px;">
                  <strong class="mono" style="font-size: 14px; color: #fff;">${pm.territorial_account_name}</strong>
                  ${pm.is_primary ? '<span class="game-pill gold" style="font-size: 9px; padding: 1px 4px;">PRIMARY</span>' : ''}
                </div>
                <div style="font-size: 11px; color: var(--text-dim); font-family: system-ui, sans-serif;">
                  ${pm.display_name ? `Label: <strong style="color: #cbd5e1;">${pm.display_name}</strong> • ` : ''}Lifetime Transacted: ${pm.total_transacted_gold || 0} Gold
                </div>
              </div>
              <div>
                <span class="${badgeClass}">
                  ${badgeLabel}
                </span>
              </div>
            `;
            container.appendChild(card);

            // Also append verified target button to withdrawal form
            const destContainer = document.getElementById('wVerifiedDestinations');
            if (destContainer && pm.status === 'VERIFIED') {
              const pmBtn = document.createElement('button');
              pmBtn.type = 'button';
              pmBtn.className = 'btn-game btn-game-secondary btn-game-sm';
              pmBtn.innerText = `Linked: ${pm.territorial_account_name}`;
              pmBtn.onclick = () => { document.getElementById('wTargetAcc').value = pm.territorial_account_name; };
              destContainer.appendChild(pmBtn);
            }"""

    if old_render_pm in html:
        html = html.replace(old_render_pm, new_render_pm, 1)

    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(html)
    print("JavaScript logic updated successfully in web/pages/cbm.html.")

    # Copy to cbm_wispbyte/cbm.html
    wisp_file = 'g:/TerriX/cbm_wispbyte/cbm.html'
    shutil.copy2(target_file, wisp_file)
    print("Copied updated cbm.html to cbm_wispbyte/cbm.html.")

if __name__ == '__main__':
    update_js()
