import { getSettings } from "./settings.js";
import { describeGame, matchesFilters } from "./lobbyFilters.js";


const SOUND_REPEATS = 3;
const SOUND_INTERVAL = 260;

let rooms = null;
let playGameSound = null;
let showPopup = null;
const roomStates = [];

function playReminderSound() {
    for (let i = 0; i < SOUND_REPEATS; i++) setTimeout(() => playGameSound?.(), i * SOUND_INTERVAL);
}

function setRooms(lobbyRooms) {
    rooms = lobbyRooms;
    roomStates.length = 0;
}

function setSound(playSound) {
    playGameSound = playSound;
}

function setPopupHandler(handler) {
    showPopup = handler;
}

function check() {
    if (rooms === null) return;
    const rules = getSettings().lobbyReminderRules || [];
    if (rules.length === 0) return;
    for (let index = 0; index < rooms.length; index++) {
        const room = rooms[index];
        if (!room) continue;
        const game = {
            map: room[dictionary.lobbyRoomMap],
            mode: room[dictionary.lobbyRoomMode],
            isContest: !!room[dictionary.lobbyRoomIsContest]
        };
        const timeLeft = room[dictionary.lobbyRoomTimeLeft];
        const state = roomStates[index] ?? (roomStates[index] = { timeLeft: -1, reminded: null });
        if (timeLeft > state.timeLeft) state.reminded = null;
        state.timeLeft = timeLeft;

        const key = game.map + ":" + game.mode + ":" + game.isContest;
        if (state.reminded === key) continue;
        if (!matchesFilters(rules, game)) continue;
        state.reminded = key;
        const description = describeGame(game);
        console.log(`FX lobby reminder: ${description} (starts in ${timeLeft}s)`);
        showPopup?.(`Reminder: ${description}`);
        playReminderSound();
    }
}

export default { setRooms, setSound, setPopupHandler, check };
