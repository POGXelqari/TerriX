/**
 * TerriX Scenario Studio - Reusable UI Components & Modals
 */

export function showToast(message, type = "info", duration = 3000) {
  let toastContainer = document.getElementById("studioToastContainer");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "studioToastContainer";
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `studio-toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-fade");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

export function showModal(title, contentHtml, onConfirm = null) {
  let modalOverlay = document.getElementById("studioModalOverlay");
  if (!modalOverlay) {
    modalOverlay = document.createElement("div");
    modalOverlay.id = "studioModalOverlay";
    modalOverlay.className = "modal-overlay";
    document.body.appendChild(modalOverlay);
  }

  modalOverlay.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <span class="modal-title">${title}</span>
        <button class="modal-close" id="modalCloseBtn">&times;</button>
      </div>
      <div class="modal-body">${contentHtml}</div>
      <div class="modal-footer">
        <button class="studio-btn" id="modalCancelBtn">Cancel</button>
        ${onConfirm ? `<button class="studio-btn btn-primary" id="modalConfirmBtn">Apply</button>` : ""}
      </div>
    </div>
  `;

  modalOverlay.classList.add("active");

  const close = () => {
    modalOverlay.classList.remove("active");
  };

  document.getElementById("modalCloseBtn").onclick = close;
  document.getElementById("modalCancelBtn").onclick = close;
  if (onConfirm) {
    document.getElementById("modalConfirmBtn").onclick = () => {
      onConfirm();
      close();
    };
  }
}
