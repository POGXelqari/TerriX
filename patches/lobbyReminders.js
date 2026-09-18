import { definePatch, insert } from "../modUtils.js";

export default definePatch(({ matchCode, insertCode, modifyCode, matchRawCode }) => {

    matchCode(`function LobbyRoom() {
        this.lobbyRoomState = 0;
        this.lobbyRoomMap = 0;
        this.lobbyRoomMapSeed = 0;
        this.lobbyRoomMode = 0;
        this.lobbyRoomNextMap = 0;
        this.lobbyRoomNextMapSeed = 0;
        this.lobbyRoomNextMode = 0;
        this.lobbyRoomIsContest = 0;
        this.lobbyRoomTimeLeft = 0;
        this.lobbyRoomSpawningSeed = 0;
        this.lobbyRoomPlayerIndex = 0;
        this.lobbyRoomTeamOffset = 0;
        this.lobbyRoomChatLog = [];
        this.lobbyRoomChatId = 1048575;
        /*...*/
    }`, {
        addToDictionary: ["lobbyRoomState", "lobbyRoomMap", "lobbyRoomMode",
            "lobbyRoomIsContest", "lobbyRoomTimeLeft"]
    })

    matchCode(`function getMapName(mapIndex, unusedMapSeed) { return mapHolder.mapInfo.mapNames[mapIndex] }`,
        { addToDictionary: ["mapHolder", "mapInfo", "mapNames"] })

    const { container, pushMessage, messageTextField } = matchRawCode(
        `resultText=formatList(entries," is"," are"," in the lobby.");if(resultText.length){container.message.pushMessage({id:7,messageTextField:resultText})}list1=[];list2=[];counter=0}`
    )

    insertCode(`this.di = function () {
        for (var index = 0; index < this.lobbyRooms.length; index++) { this.lobbyRooms[index] = new LobbyRoom }
        this.lobbySelection[0] = settingsHolder.userSettings.data[158].value
        /* here */
    }`, `__fx.lobbyReminders.setRooms(this.lobbyRooms);
    __fx.lobbyReminders.setPopupHandler(function (text) { bq.message.aEd({ id: 7, s: text }); });`,
        { dictionary: { bq: container, aEd: pushMessage, s: messageTextField } })

    modifyCode(`this.onFullLobbyUpdate = function () {
        updateLobbyUI(true);
        lobbyManager.joinTracker.di();
        ${insert(`__fx.lobbyReminders.check();`)}
    };
    this.onLobbyUpdate = function () {
        lobbyManager.joinTracker.onLobbyUpdate();
        updateRoomTimers();
        updateLobbyUI(false);
        ${insert(`__fx.lobbyReminders.check();`)}
    }`)

    insertCode(`/* here */
    function replayPendingSound() { pendingSoundCount++; notificationSound.play() }
    this.play = function () {
        if (!soundsLoaded) { return }
        var timeNow = performance.now();
        /*...*/
    }`, `__fx.lobbyReminders.setSound(function () { notificationSound.play(); });`)
})
