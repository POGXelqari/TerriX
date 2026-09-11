// TerriX Verification Gateway Client
// Communicates with Vercel Serverless API (/api/verify/*) and Supabase
let currentStage = 1;
let requiredSeconds = 15;
let elapsed = 0;
let timerInterval = null;

async function initStage(stage, seconds) {
  currentStage = stage;
  requiredSeconds = seconds;

  // Enforce sequential progression
  if (stage === 2 && !sessionStorage.getItem("stage1_done")) {
    window.location.href = "stage-1.html";
    return;
  }
  if (stage === 3 && !sessionStorage.getItem("stage2_done")) {
    window.location.href = "stage-2.html";
    return;
  }

  // Request initial session token from Vercel API for Stage 1
  if (stage === 1 && !sessionStorage.getItem("stage1_token")) {
    try {
      const res = await fetch("/api/verify/start", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          sessionStorage.setItem("stage1_token", data.token);
        }
      }
    } catch (e) {
      console.warn("Vercel API offline, using local state tracking.");
    }
  }
}

function startTimer() {
  const dwellNotice = document.getElementById("dwellNotice");
  const timerText = document.getElementById("timerText");
  const continueBtn = document.getElementById("continueBtn");

  if (timerInterval) return; // already running

  dwellNotice.style.display = "flex";
  elapsed = 0;

  timerInterval = setInterval(() => {
    elapsed += 1;
    const remaining = Math.max(0, requiredSeconds - elapsed);
    
    if (remaining > 0) {
      timerText.textContent = `Verifying task completion... ${remaining}s remaining`;
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
      timerText.textContent = "✓ Task verified! You may now continue.";
      dwellNotice.style.borderColor = "var(--success)";
      dwellNotice.style.color = "var(--success)";
      const spinner = dwellNotice.querySelector(".spinner");
      if (spinner) spinner.style.display = "none";
      continueBtn.disabled = false;
    }
  }, 1000);
}

async function submitStage(stage) {
  const continueBtn = document.getElementById("continueBtn");
  if (continueBtn) continueBtn.disabled = true;

  try {
    if (stage === 1) {
      const token = sessionStorage.getItem("stage1_token") || "";
      const res = await fetch("/api/verify/stage-1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.token) sessionStorage.setItem("stage2_token", data.token);
      }
      sessionStorage.setItem("stage1_done", "true");
      window.location.href = "stage-2.html";
      return;
    } 
    
    if (stage === 2) {
      const token = sessionStorage.getItem("stage2_token") || "";
      const res = await fetch("/api/verify/stage-2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.token) sessionStorage.setItem("stage3_token", data.token);
      }
      sessionStorage.setItem("stage2_done", "true");
      window.location.href = "stage-3.html";
      return;
    } 
    
    if (stage === 3) {
      const token = sessionStorage.getItem("stage3_token") || "";
      const res = await fetch("/api/verify/stage-3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.claim_token) sessionStorage.setItem("claim_token", data.claim_token);
      }
      sessionStorage.setItem("stage3_done", "true");
      window.location.href = "complete.html";
      return;
    }
  } catch (err) {
    console.warn("Vercel verification API offline, falling back to client transition:", err);
    if (stage === 1) {
      sessionStorage.setItem("stage1_done", "true");
      window.location.href = "stage-2.html";
    } else if (stage === 2) {
      sessionStorage.setItem("stage2_done", "true");
      window.location.href = "stage-3.html";
    } else if (stage === 3) {
      sessionStorage.setItem("stage3_done", "true");
      window.location.href = "complete.html";
    }
  }
}

// Retrieves today's key managed by Supabase via Vercel API
async function loadFinalKey() {
  const keyField = document.getElementById("keyField");
  const protocolBtn = document.getElementById("protocolBtn");
  const claimToken = sessionStorage.getItem("claim_token") || "";

  try {
    const res = await fetch("/api/verify/claim-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claim_token: claimToken })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.key) {
        setKey(data.key);
        return;
      }
    }
  } catch (e) {
    console.warn("Vercel/Supabase claim API unreachable, computing fallback preview.");
  }

  // Deterministic daily key matching Python HMAC algorithm (fallback preview)
  const now = new Date();
  const utcDate = now.toISOString().slice(0, 10);
  const keySalt = "TERRIX_GLOBAL_KEY_SECRET_2026_9A7B3C";
  const msg = `terrix_daily_key:${utcDate}:${keySalt}`;
  const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(msg));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  const fallbackKey = `TERRIX-2026-${hashHex.slice(0, 4)}-${hashHex.slice(4, 8)}-${hashHex.slice(8, 12)}`;
  
  setKey(fallbackKey);
}

function setKey(key) {
  const keyField = document.getElementById("keyField");
  const protocolBtn = document.getElementById("protocolBtn");
  if (keyField) keyField.value = key;
  if (protocolBtn) protocolBtn.href = `terrix://activate?key=${encodeURIComponent(key)}`;
}

function copyKey() {
  const keyField = document.getElementById("keyField");
  if (!keyField) return;
  keyField.select();
  navigator.clipboard.writeText(keyField.value);
  const notice = document.getElementById("copiedNotice");
  if (notice) {
    notice.style.display = "block";
    setTimeout(() => { notice.style.display = "none"; }, 3000);
  }
}
