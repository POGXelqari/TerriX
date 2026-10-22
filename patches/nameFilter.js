import { definePatch } from "../modUtils.js";

export default definePatch((modUtils) => {
    const { replaceCode, matchOne } = modUtils;

    replaceCode(`function assignHumanNames() {
        var humanCount = playerCounts.gHumans;
        var displayNames = playerData.playerNames;
        var rawNames = playerData.rawPlayerNames;
        var playerNamesData = gameState.data.playerNamesData;
        if (!playerNamesData || playerNamesData.length < humanCount) {
            for (var i = 0; i < humanCount; i++) { displayNames[i] = rawNames[i] = "Player " + randomGen.pick(1e3); }
            return;
        }
        for (i = 0; i < humanCount; i++) { displayNames[i] = rawNames[i] = playerNamesData[i]; }
    }`, `function assignHumanNames() {
        var humanCount = playerCounts.gHumans;
        var displayNames = playerData.playerNames;
        var rawNames = playerData.rawPlayerNames;
        var playerNamesData = gameState.data.playerNamesData;
        if (!playerNamesData || playerNamesData.length < humanCount) {
            for (var i = 0; i < humanCount; i++) { displayNames[i] = rawNames[i] = "Player " + randomGen.pick(1e3); }
            return;
        }
        for (i = 0; i < humanCount; i++) { displayNames[i] = rawNames[i] = __fx.nameFilter.filter(playerNamesData[i]); }
    }`);

    // Lobby player createEntry: injects nameFilter before entry object construction
    const createEntryPattern = /(\bthis\.\w+=function\(\w+,(\w+)(?:,[^,)]+){6,}\)\{)(return\{)/g;
    matchOne(createEntryPattern);
    modUtils.replace(createEntryPattern, (_match, prefix, username, ret) => {
        return `${prefix}${username}=__fx.nameFilter.filter(${username});${ret}`;
    });

    replaceCode(`function assignPresetNames() {
        var totalCount = playerCounts.gMaxPlayers;
        var displayNames = playerData.playerNames;
        var rawNames = playerData.rawPlayerNames;
        var playerNamesData = gameState.data.playerNamesData;
        for (var i = playerCounts.gHumans; i < totalCount; i++) { displayNames[i] = rawNames[i] = playerNamesData[i]; }
    }`, `function assignPresetNames() {
        var totalCount = playerCounts.gMaxPlayers;
        var displayNames = playerData.playerNames;
        var rawNames = playerData.rawPlayerNames;
        var playerNamesData = gameState.data.playerNamesData;
        for (var i = playerCounts.gHumans; i < totalCount; i++) { displayNames[i] = rawNames[i] = __fx.nameFilter.filter(playerNamesData[i]); }
    }`);
});
