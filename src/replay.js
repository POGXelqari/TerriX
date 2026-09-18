import { getVar } from "./gameInterface.js";
import { getSettings } from "./settings.js";
import hoveringTooltip from "./hoveringTooltip.js";

const replay = {
    totalTicks: 0,
    seekTarget: null,
    restoreState: null,
    isRestarting: false,
    tick: 0,
    hooks: null,
    controls: null,
    togglePlayPause: () => {},
    restartReplay: () => {},

    registerHooks(hooks) {
        this.hooks = hooks;
        this.tick = 0;
        if (!this.isRestarting) this.seekTarget = this.restoreState = null;
        this.isRestarting = false;
    },

    isWatching() {
        return Boolean(getVar("gIsReplay") && getVar("gameState") !== 0);
    },

    getTotalTicks() {
        const flags = getVar("tickFlags"), counts = getVar("tickCounts");
        if (!counts) return 0;
        if (counts !== this.countedEntries) {
            this.countedEntries = counts;
            this.totalTicks = 0;
            for (let i = 0; i < counts.length; i++) this.totalTicks += flags[i] ? 1 : counts[i];
        }
        return this.totalTicks;
    },

    getTickDuration() {
        const interval = this.hooks ? this.hooks.getTickInterval() : 56;
        return getVar("gSelectableSpawn") && !getVar("gIsSingleplayer") ? interval * 7 : interval;
    },

    seek(targetTick) {
        if (!this.isWatching() || !this.hooks) return;
        this.seekTarget = Math.max(0, Math.min(Math.round(targetTick), this.getTotalTicks()));
        if (this.seekTarget >= this.tick) return;
        if (!this.restoreState) this.restoreState =
            { playing: this.controls.fxIsPlaying(), speed: this.controls.fxGetSpeedIndex() };
        this.isRestarting = true;
        this.restartReplay();
    },

    frame() {
        if (this.seekTarget === null) return false;
        const hooks = this.hooks;
        const deadline = performance.now() + 40;
        while (this.tick < this.seekTarget && !hooks.isEnded() && performance.now() < deadline)
            hooks.advance();
        hooks.finishTick();
        hooks.requestRedraw();
        if (this.tick < this.seekTarget && !hooks.isEnded()) return true;
        this.seekTarget = null;
        const restore = this.restoreState;
        if (restore) {
            this.restoreState = null;
            this.controls.fxSetSpeedIndex(restore.speed);
            if (restore.playing && !hooks.isEnded() && !this.controls.fxIsPlaying()) this.togglePlayPause();
        }
        return true;
    }
};

function createElement(tag, className, parent) {
    const element = document.createElement(tag);
    element.className = className;
    parent.append(element);
    return element;
}

const bar = createElement("div", "flex d-none", document.getElementById("windowContainer"));
bar.id = "replayTimebar";
const currentTime = createElement("span", "replay-time", bar);
const track = createElement("div", "replay-track", bar);
const totalTime = createElement("span", "replay-time color-light-gray", bar);
const fill = createElement("div", "replay-fill", track);
const marker = createElement("div", "replay-target d-none", track);

let drag = null;

const trackFraction = (event) => {
    const rect = track.getBoundingClientRect();
    if (!rect.width) return 0;
    const fraction = (event.clientX - rect.left) / rect.width;
    return fraction < 0 ? 0 : fraction > 1 ? 1 : fraction;
};
track.addEventListener("pointerdown", (event) => {
    if (!replay.isWatching()) return;
    event.preventDefault();
    track.setPointerCapture(event.pointerId);
    drag = trackFraction(event);
});
track.addEventListener("pointermove", (event) => {
    if (drag !== null) drag = trackFraction(event);
});
track.addEventListener("pointerup", (event) => {
    if (drag === null) return;
    drag = null;
    replay.seek(trackFraction(event) * replay.getTotalTicks());
});
track.addEventListener("pointercancel", () => drag = null);

const formatTime = (time) => {
    let s = Math.floor(time / 1000);
    const m = Math.floor(s / 60);
    s %= 60;
    return m + (s < 10 ? ":0" : ":") + s;
};

function updateBar() {
    requestAnimationFrame(updateBar);
    const visible = getSettings().showReplayTimebar && replay.isWatching() && !getVar("uiHidden");
    bar.classList.toggle("d-none", !visible);
    if (!visible) {
        drag = null;
        return;
    }
    const panelTop = replay.controls && replay.controls.fxGetPanelTop();
    const scale = hoveringTooltip.canvasPixelScale || window.devicePixelRatio || 1;
    if (panelTop > 0) bar.style.bottom = Math.max(0, Math.round(window.innerHeight - panelTop / scale) + 8) + "px";

    const total = replay.getTotalTicks();
    const seeking = replay.seekTarget !== null && total !== 0;
    let fraction = total ? Math.min(replay.tick / total, 1) : 0;
    if (drag !== null) fraction = drag;

    fill.style.width = (fraction * 100).toFixed(2) + "%";
    bar.classList.toggle("seeking", seeking);
    marker.classList.toggle("d-none", !seeking);
    if (seeking) marker.style.left = (Math.min(replay.seekTarget / total, 1) * 100).toFixed(2) + "%";

    const tickDuration = replay.getTickDuration();
    currentTime.textContent = formatTime(fraction * total * tickDuration);
    totalTime.textContent = formatTime(total * tickDuration);
}
requestAnimationFrame(updateBar);

export default replay;
