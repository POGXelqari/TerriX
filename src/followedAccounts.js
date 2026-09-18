import { getSettings } from "./settings.js";
import WindowManager from "./windowManager.js";

const NICKNAME_SEPARATOR = " - ";
const NICKNAME_MAX_LENGTH = 20;
const WINDOW_NAME = "followedAccountNicknames";
const SETTINGS_WINDOW_NAME = "settings";

let source = () => [];
let editedNicknames = {};

function setSource(accountNameGetter) {
  if (typeof accountNameGetter === "function") source = accountNameGetter;
}

function getAccounts() {
  const accountNames = source();
  return Array.isArray(accountNames) ? accountNames.slice() : [];
}

function cleanUp(nicknames) {
  const cleaned = {};
  if (nicknames === null || typeof nicknames !== "object") return cleaned;
  Object.keys(nicknames).forEach((accountName) => {
    const nickname = typeof nicknames[accountName] === "string"
      ? nicknames[accountName].trim().slice(0, NICKNAME_MAX_LENGTH) : "";
    if (nickname) cleaned[accountName] = nickname;
  });
  return cleaned;
}

function getNickname(accountName) {
  const nicknames = getSettings().followedAccountNicknames;
  const nickname = nicknames === null || typeof nicknames !== "object" ? "" : nicknames[accountName];
  return typeof nickname === "string" ? nickname.trim() : "";
}

function label(accountName) {
  const nickname = getNickname(accountName);
  return nickname ? accountName + NICKNAME_SEPARATOR + nickname : accountName;
}

function decorate(accountNames) {
  if (!Array.isArray(accountNames)) return accountNames;
  return accountNames.map((accountName) => label(accountName));
}

const nicknamesWindow = WindowManager.create({
  name: WINDOW_NAME,
  closeWithButton: true,
  modal: true,
  beforeOpen: function () {
    WindowManager.setWindowVisible(SETTINGS_WINDOW_NAME, false);
    render();
  },
  onClose: function () {
    if (WindowManager.isWindowOpen(SETTINGS_WINDOW_NAME)) WindowManager.setWindowVisible(SETTINGS_WINDOW_NAME, true);
  }
});
const windowTitle = document.createElement("h1");
windowTitle.innerText = "Followed Account Nicknames";
const windowNote = document.createElement("small");
windowNote.innerText =
  "Nicknames are shown next to the account name in the \"Followed Accounts\" list. Close this menu and click \"Save Settings\" to apply.";
const rows = document.createElement("div");
nicknamesWindow.append(windowTitle, windowNote, document.createElement("br"), rows);

function render() {
  rows.innerHTML = "";
  const accountNames = getAccounts();
  if (!accountNames.length) {
    const empty = document.createElement("small");
    empty.innerText = "You aren't following any accounts yet.";
    rows.append(empty);
    return;
  }
  accountNames.forEach((accountName) => {
    const row = document.createElement("div");
    row.className = "nickname-row";
    const name = document.createElement("span");
    name.className = "nickname-account";
    name.textContent = accountName;
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = NICKNAME_MAX_LENGTH;
    input.placeholder = "Nickname";
    input.value = editedNicknames[accountName] || "";
    input.addEventListener("input", () => editedNicknames[accountName] = input.value);
    row.append(name, input);
    rows.append(row);
  });
}

export function FollowedAccountNicknames(container) {
  const title = document.createElement("p");
  const heading = document.createElement("b");
  heading.innerText = "Followed account nicknames";
  title.append(heading);
  const note = document.createElement("small");
  note.innerText = "Label the accounts you follow with your own names, so the \"Followed Accounts\" list is easier to read.";
  const openButton = document.createElement("button");
  openButton.innerText = "Edit nicknames";
  openButton.addEventListener("click", () => WindowManager.openWindow(WINDOW_NAME));
  container.append(title, note, document.createElement("br"), openButton);

  this.update = function (currentSettings) {
    editedNicknames = cleanUp(currentSettings.followedAccountNicknames);
  };
  this.save = function (targetSettings) {
    targetSettings.followedAccountNicknames = cleanUp(editedNicknames);
  };
}

export default { setSource, decorate, label, getNickname };
