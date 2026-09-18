const MAP_NAMES = ["White Arena", "Black Arena", "Island", "Mountains 1", "Desert", "Swamp",
    "White Plains", "Cliffs", "Pond", "Halo", "Europe", "World 1", "Caucasia", "Africa",
    "Middle East", "Scandinavia", "North America", "South America", "Asia", "Australia",
    "Island Kingdom", "Mountains 2", "World 2", "British Isles", "Mare Nostrum"];

const MAP_DISPLAY_ORDER = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 22, 23, 24,
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 20, 21];

export const ANY = "any";
export const NONE = "none";

export const gameOptions = [
    { value: NONE, label: "None" },
    { value: ANY, label: "Any" },
    { value: "1v1", label: "1v1" },
    { value: "br", label: "Battle Royale" },
    { value: "zombie", label: "Zombie" },
    { value: "team", label: "All Teams" }
].concat([2, 3, 4, 5, 6, 7].map(count => ({ value: "team" + count, label: count + " Teams" })));

export const mapOptions = [{ value: ANY, label: "Any" }].concat(
    MAP_DISPLAY_ORDER.map(index => ({ value: index.toString(), label: MAP_NAMES[index] }))
);

export const contestOptions = [
    { value: ANY, label: "Any" },
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" }
];

function getGameMapNames() {
    const names = window[dictionary.mapHolder]?.[dictionary.mapInfo]?.[dictionary.mapNames];
    return Array.isArray(names) && names.length ? names : null;
}

export function refreshMapOptions(selectElement) {
    const names = getGameMapNames();
    if (!selectElement || !names) return;
    const listed = new Set();
    Array.from(selectElement.options).forEach(option => {
        if (option.value === ANY) return;
        const index = parseInt(option.value, 10);
        listed.add(index);
        if (names[index] === undefined) option.remove();
        else option.textContent = names[index];
    });
    names.forEach((name, index) => {
        if (listed.has(index)) return;
        const option = document.createElement("option");
        option.setAttribute("value", index.toString());
        option.textContent = name;
        selectElement.append(option);
    });
}

/** @param {number} mapIndex */
export function getMapName(mapIndex) {
    return getGameMapNames()?.[mapIndex] ?? MAP_NAMES[mapIndex] ?? "Map " + mapIndex;
}

export function getGameType(mode) {
    if (mode <= 6) return "team";
    if (mode === 7 || mode === 10) return "br";
    if (mode === 8) return "1v1";
    if (mode === 9) return "zombie";
    return null;
}

export function getTeamCount(mode) {
    return mode <= 6 ? mode + 2 : null;
}

export function describeGame({ map, mode, isContest }) {
    const type = getGameType(mode);
    const teamCount = getTeamCount(mode);
    return (isContest ? "Contest: " : "") + getMapName(map)
        + (teamCount !== null ? " - " + teamCount + " Teams"
            : type === "br" ? " - Battle Royale" : type === "1v1" ? " - 1v1"
                : type === "zombie" ? " - Zombie" : "");
}

function matchesRule(rule, { map, mode, isContest }) {
    if (rule.game === NONE) return false;
    if (rule.contest !== ANY && (rule.contest === "yes") !== isContest) return false;
    if (rule.map !== ANY && parseInt(rule.map, 10) !== map) return false;
    if (rule.game !== ANY) {
        const type = getGameType(mode);
        if (rule.game === "team") {
            if (type !== "team") return false;
        } else if (rule.game.startsWith("team")) {
            if (type !== "team" || getTeamCount(mode) !== parseInt(rule.game.slice(4), 10)) return false;
        } else if (rule.game !== type) return false;
    }
    return true;
}

export function matchesFilters(rules, game) {
    return rules.length !== 0 && rules.some(rule => matchesRule(rule, game));
}
