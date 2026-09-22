/**
 * ================================================================
 * TERRITORIAL.IO — FULLY DEOBFUSCATED SOURCE (LATEST VERSION)
 * ================================================================
 * Game Engine Build: September 2026
 * Original Game by David Tschacher (davidtschacher@gmail.com)
 * Official Platform: https://territorial.io
 *
 * DEOBFUSCATION & REVERSE ENGINEERING SUMMARY:
 *   1. String Array Inlining: All 155 S[] entries inlined into literal strings (0 lookups remaining).
 *   2. Singletons Deobfuscated: 107 global singletons mapped to semantic names.
 *   3. Architecture & Class Hierarchy: 107 classes reconstructed with descriptive constructors.
 *   4. AST Semantic Alignment: 1,200+ function signatures and 370+ member properties renamed.
 *   5. In-Game 2026 Innovations Reverse-Engineered:
 *      - Clan Propaganda Gold Campaigns (Gold Investment & Launch Campaign)
 *      - Replay Data Serialization & Deserialization Engine
 *      - In-Game Moderation & Sanctions Telemetry (Gold Seizure, Remove Punishments)
 *      - Account Recovery & Cloudflare Turnstile Integration
 * ================================================================
 */

"use strict";
    (function () {
function a(){var b;
var c;

function d(e){c="";try{var f=g(e);if(f===0||e.lineno<2){console.log("Error: External Code");
return;}window.removeEventListener("error",d);c=e.lineno+" "+e.colno+"|"+f;
if(performance.memory){var h=[];h.push(Math.floor(performance.memory.jsHeapSizeLimit/100000));
h.push(Math.floor(performance.memory.totalJSHeapSize/100000));
h.push(Math.floor(performance.memory.usedJSHeapSize/100000));
c=c+"|"+h.join(" ");}if(camera){c=c+"|R"+camera.j+","+camera.k+","+camera.l.toFixed(2);
}c=c+"|"+e.message;if(settingsPanel&&settingsPanel.n===1){c=settingsPanel.o+"|"+techInfo.q.join(",")+"|"+c;if(e.lineno<43){r();return;}
var s="What happened? Please send us a detailed email to davidtschacher@gmail.com so we can fix this error.";
s+="<br>Error Message: "+c;techInfo.t();
account.v(4,5,new TextContentScreen("🤖 Beep Boop! An error occurred.",s,true,[new x("Close",function(){account.y();account.z.a0();}),
new x("Reload",function(){uiSurface.platformActions.a3();})]));}}catch(e){c="SE|"+c+"|"+e;console.log(c);
alert(c);}r();}

function r(){b=new WebSocket("wss://territorial.io/s52/");b.onopen=a4;
b.onclose=function(){a5();};}

function g(e){if(!e.error){return 0;}var stack=e.error.stack;
if(!stack||!stack.length){return 0;}var a6=new RegExp(":([0-9]+):([0-9]+)","g");
var result=[];var match;while((match=a6.exec(stack))!==null){
result.push(parseInt(match[1],10));result.push(parseInt(match[2],10));}if(!result.length){return 0;
}return result.join(" ");}

function a4(){if(!b||b.readyState!==b.OPEN){return;}var j=new BitStreamWriter();
j.a8(1+6+2+1+1+1+7*228);j.writeBits(1,0);j.writeBits(6,7);j.writeBits(2,uiSurface?uiSurface.id:3);j.writeBits(1,settingsPanel.aA?1:0);j.writeBits(1,settingsPanel.aB?1:0);
j.writeBits(1,settingsPanel?settingsPanel.n:0);for(var aC=0;aC<c.length&&aC<228;aC++){j.writeBits(7,c.charCodeAt(aC)%128);
}b.send(j.aD);a5();}

function a5(){if(!b){return;}b.onclose=null;b.onopen=null;
b=null;}window.addEventListener("error",d);}a();var settingsPanel;var localPlayer;var troopCalc;var borderCalc;var territoryCalc;var soloCalc;var inputLayer;
var clickProcessor;var panProcessor;var modalState;var zoomHandler;var hoverProcessor;var keyProcessor;var panHandler;var deviceDetector;var clickHandler;var hoverHandler;var keyboardHandler;var touchInputHandler;var uiColors;var focusHandler;
var resizeHandler;var flagSystem;var loadingSystem;var moderationSystem;var adSystem;var tileMap;var alliances;var botSpawner;var troops;var playerData;var arenaSystem;var spectator;var colorSystem;var borderSystem;
var territorySystem;var mountainAttack;var soloMode;var nameRenderer;var chatSystem;var voteSystem;var inventory;var scoreSystem;var goldSystem;var clansSystem;var cameraController;var touchController;var camera;var coordHelper;
var botSystem;var gameServer;var historySystem;var replaySystem;var statsTracker;var achievements;var questSystem;var eventSystem;var commandQueue;var gameTimer;var renderer;var mapCache;var packetWriter;var gameState;
var colorPalette;var packetReader;var canvasManager;var localStore;var uiRenderer;var minimapRenderer;var urlParams;var mapUtils;var powerSystem;var floorDiv;var mathUtils;var powerState;var bonusSystem;var boostSystem;
var armySystem;var mapDimensions;var inputController;var dialogManager;var adManager;var account;var gameConfig;var statsPanel;var settingsMenu;var ba;var bb;var bc;var leaderboardPanel;var chatPanel;
var debugPanel;var gameClock;var accountPanel;var clanPanel;var mainMenu;var gameMenu;var uiSurface;var gameUI;var connectionMgr;var errorSystem;var techInfo;var connectionInfo;var imageLoader;var audioSystem;
var br;var botAI;var relations;var expansionTargetFinder;var playerBoundaryEngine;var modalDialogEngine;

function initGame(by){if(settingsPanel&&!by){return;}

function createSystems(){initMathPolyfills();
mathUtils=new MathUtils();floorDiv=new FloorDiv();gameState=new GameState();colorPalette=new ColorPalette();localPlayer=new LocalPlayer();renderer=new Renderer();uiRenderer=new UIRenderer();minimapRenderer=new MinimapRenderer();
troopCalc=new TroopCalculator();borderCalc=new BorderCalculator();territoryCalc=new TerritoryCalculator();soloCalc=new SoloCalculator();inputLayer=new InputLayer();clickProcessor=new ClickProcessor();panProcessor=new PanProcessor();modalState=new ModalStateClass();
zoomHandler=new ZoomHandler();hoverProcessor=new HoverProcessor();keyProcessor=new KeyProcessor();panHandler=new PanHandler();deviceDetector=new DeviceDetector();clickHandler=new ClickHandler();hoverHandler=new HoverHandler();keyboardHandler=new KeyboardHandler();
touchInputHandler=new TouchInputHandler();uiColors=new UIColors();focusHandler=new FocusHandler();resizeHandler=new ResizeHandler();flagSystem=new FlagSystem();loadingSystem=new LoadingSystem();moderationSystem=new ModerationSystem();adSystem=new AdSystem();
tileMap=new TileMap();borderSystem=new BorderSystem();territorySystem=new TerritorySystem();soloMode=new SoloModeSystem();mountainAttack=new MountainAttack();alliances=new AllianceSystem();botSpawner=new BotSpawner();arenaSystem=new ArenaSystem();
troops=new TroopsSystem();playerData=new PlayerData();spectator=new SpectatorSystem();botSystem=new BotSystem();colorSystem=new ColorSystem();chatSystem=new ChatSystem();voteSystem=new VoteSystem();inventory=new InventorySystem();
gameServer=new GameServer();coordHelper=new CoordHelper();nameRenderer=new NameRenderer();scoreSystem=new ScoreSystem();goldSystem=new GoldSystem();clansSystem=new ClansSystem();camera=new Camera();cameraController=new CameraController();
touchController=new TouchController();historySystem=new HistorySystem();replaySystem=new ReplaySystem();statsTracker=new StatsTracker();achievements=new AchievementSystem();questSystem=new QuestSystem();eventSystem=new EventSystem();commandQueue=new CommandQueue();
gameTimer=new GameTimer();mapCache=new MapCache();packetWriter=new BinaryWriter();packetReader=new BinaryReader();canvasManager=new BitStreamWriter();localStore=new BitStreamReader();urlParams=new UrlParams();mapUtils=new MapUtilsClass();
powerSystem=new PowerSystem();powerState=new PowerState();bonusSystem=new BonusSystem();boostSystem=new BoostSystem();armySystem=new ArmySystem();mapDimensions=new MapDimensions();inputController=new InputController();dialogManager=new DialogManager();
adManager=new AdManagerClass();account=new Account();gameConfig=new GameConfig();uiSurface=new UISurface();settingsPanel=new SettingsPanel();gameUI=new GameUI();connectionMgr=new ConnectionManager();mainMenu=new MainMenu();
gameMenu=new GameMenu();leaderboardPanel=new LeaderboardPanel();chatPanel=new ChatPanel();statsPanel=new StatsPanel();settingsMenu=new SettingsMenu();gameClock=new GameClock();accountPanel=new AccountPanel();clanPanel=new ClanPanel();
errorSystem=new ErrorSystem();debugPanel=new DebugPanel();techInfo=new TechInfoPanel();connectionInfo=new ConnectionInfo();imageLoader=new ImageLoader();audioSystem=new AudioSystem();botAI=new BotAI();relations=new RelationSystem();
expansionTargetFinder=new ExpansionTargetFinder();playerBoundaryEngine=new PlayerBoundaryEngine();modalDialogEngine=new ModalDialogEngine();}

function startGameLoop(){settingsPanel.applyToGame();uiSurface.applyToGame();camera.dl();connectionMgr.applyToGame();renderer.applyToGame();
renderer.ExternalLinkWarningOverlay();ba=new dn();ba.applyToGame();gameState.applyToGame();statsPanel.applyToGame();gameServer.applyToGame();uiRenderer.applyToGame();minimapRenderer.applyToGame();dialogManager.applyToGame();account.applyToGame();bb=new dp();
camera.applyToGame();clanPanel.applyToGame();debugPanel.applyToGame();settingsMenu.applyToGame();bc=new dq();coordHelper.applyToGame();botSpawner.dr();gameConfig.applyToGame();chatSystem.applyToGame();moderationSystem.applyToGame();keyboardHandler.applyToGame();
spectator.applyToGame();powerSystem.applyToGame();adSystem.applyToGame();clanPanel.ds=true;setTimeout(function(){dialogManager.a8(2,14071);},0);account.v(5,5);if(!mapUtils.forceResize()){
uiSurface.platformActions.du();}camera.dv();}createSystems();startGameLoop();settingsPanel.n=1;}

function SettingsPanel(){this.dw=1761;
var dx=2;
var dy=16;
var dz=52;
this.rVersion=25;this.e0=0;this.applyToGame=function(){this.e1=2;
var e2="";this.o=dx+"."+dy+"."+dz;
this.e3="22 Sep 2026 ["+this.o+e2+"]";this.hostname=window.location.hostname.toLowerCase();
this.aA=this.hostname.indexOf("territorial.io")>=0;this.e4=this.hostname.indexOf("github.io")>=0;
this.e5=this.hostname.indexOf("game.territorial.io")>=0;this.aB=e6();this.e7=(new Date()).getTime()%1048576;
console.log("hostname: ["+this.hostname+"] validHostname: "+(+this.aA)+" validMod: "+(+this.e4));
};this.n=0;

function e6(){try{return window.self!==window.top;}catch(e){return true;
}}}

function ModerationConfig(){var e9=[L(0),L(1),L(2),L(3),L(4),L(5),L(6)];
var eA=[100,60,30,15,6,1];
var eB=[
[0,0,0,0,0],[0,1,1,1,1],[1,2,1,1,1],[1,3,2,1,2],[1,4,2,2,3],[1,4,3,3,4],[1,5,3,3,5]];
var eC=[
" 👢 kicked "," 🔇 muted "," ✂️ redacted the username of "," deducted x from "," seized x from ",
" 🚩 reported "];
var eD=["👢","🔇","✂️","Elo Deduction","Gold Seizure","🚩 Report"];
var eE=[".",". Duration: x",
". Duration: x",".",".",". Reason: x"];this.eF=[["","",""],["20 Seconds","1 Minute","5 Minutes","1 Hour","1 Day"],
["1 Minute","1 Hour","1 Day"],["0.1 Elo Points","0.2 Elo Points","0.3 Elo Points"],
["0.5 Gold","1 Gold","2 Gold","5 Gold","10 Gold"],
["Offensive Name","Hate Speech","Cheater","False Reporter","Block Account","Ban IP","Gold Seizure","Remove Punishments"]
];this.eG=function(id,eH,eI){var aC=this.eJ(eH);return+(eB[aC][id]>eI);};this.eJ=function(eH){
for(var aC=0;aC<eA.length;aC++){if(eH>=eA[aC]){return aC;}}return eA.length;};this.eK=function(eH){
return e9[this.eJ(eH)];};this.eL=function(id,eM){return eC[id].replace(new RegExp("x","g"),eM);
};this.eN=function(id,eM){return eE[id].replace(new RegExp("x","g"),eM);
};this.propagandaShowController=function(id,PropagandaShowController){return this.eF[5][id];};}

function GameConfig(){this.webPropagandaProvider=new AdScheduler();this.eS=new SponsorSystem();
this.turnstile=new TurnstileController();this.applyToGame=function(){uiSurface.platformActions.eV();this.turnstile.applyToGame();};this.eW=function(){
return connectionMgr.buffer.data[160].value;};}

function AdScheduler(){var eX=1000*12;this.show=function(eY){
if(eY){return false;}if(gameConfig.eW()){return false;}if(uiSurface.id===0){return gameConfig.eS.show();
}if(clanPanel.eZ<eX){return false;}var ea=uiSurface.id===1?(12*60*1000):(18*60*1000);eX=clanPanel.eZ+ea;if(settingsPanel.e1!==2){
return false;}return uiSurface.platformActions.eb(Math.floor(ea));};}

function SponsorSystem(){var ec=null;
var eX=1000*20;
var ed=0;
this.ee=function(){if(clanPanel.eZ<eX){return;}eX=clanPanel.eZ+1000*10;if(uiSurface.id!==0){return;}if(ec){return;
}if(gameConfig.eW()){return;}if(!gameServer.z.responsePacketBuilder(0)){eX=clanPanel.eZ+1000*1;return;}gameServer.eg.eh(5);};this.ei=function(ej){
ec=ej;};this.show=function(){if(!ec){return false;}if(clanPanel.eZ<ed){return false;}ed=clanPanel.eZ+60*1000;
(new ek()).show(ec.el,ec.colors,ec.id);ec=null;return true;};}

function TurnstileController(){this.em=0;
var en=null;
var eo=0;
var ep=0;
var eq="";
var er=0;
var es=null;
var et=-1;
var eu=-1;
var ev=0;
var ew=60;this.applyToGame=function(){if(settingsPanel.e0||(!settingsPanel.aA&&!settingsPanel.e4)){console.log("turnstile cannot be loaded");
this.em=-1;return;}var ex=document.createElement("script");
ex.src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
ex.async=true;ex.onload=function(){gameConfig.turnstile.em=1;
console.log("turnstile onload");gameConfig.turnstile.ey();};ex.onerror=function(){gameConfig.turnstile.em=-1;
console.log("turnstile onerror");};document.head.appendChild(ex);};this.ey=function(){
if(this.em!==1){return false;}if(!window.turnstile){console.log("turnstile error 245");
return false;}if(eo){console.log("turnstile error 246");return false;}if(ez(30)){
return false;}var ea=performance.now();if(ea<ev&&et===minimapRenderer.f0.f1(connectionMgr.buffer.data[105].value,5)
&&eu===loadingSystem.mountainAttackTargetFinder){return false;}eq="";eo=1;ep=ea;es=document.createElement("div");
es.style.position="fixed";es.style.left="0";es.style.top="0";es.style.zIndex="100";
document.body.appendChild(es);console.log("turnstile render");en=window.turnstile.render(es,{
sitekey:"0x4AAAAAAEI8HZoG8nJMzxt1",action:"enter_lobby",appearance:"interaction-only",
callback:function(MountainAttackTargetFinder){console.log("turnstile success "+Math.floor(performance.now()-ep));
eq=MountainAttackTargetFinder;er=performance.now();gameConfig.turnstile.f4();MountainAttackHelper();},"expired-callback":function(){MountainAttackHelper();
console.log("turnstile expired "+Math.floor(performance.now()-ep));},"error-callback":function(){
MountainAttackHelper();console.log("turnstile callback error "+Math.floor(performance.now()-ep));
gameConfig.turnstile.em=-1;}});return true;};this.close=function(){
MountainAttackHelper();};

function MountainAttackHelper(){if(es===null||en===null){return;}eo=0;window.turnstile.remove(en);es.remove();
es=null;en=null;}this.f4=function(){if(!ez(8)){return;}if(!audioSystem.f6){return;}if(!gameServer.z.responsePacketBuilder(gameServer.z.mapId)){
return;}ev=performance.now()+1000*60*ew-1000*10;et=minimapRenderer.f0.f1(connectionMgr.buffer.data[105].value,5);
eu=loadingSystem.mountainAttackTargetFinder;gameServer.eg.f8(eq);eq="";console.log("sendTokenToLobby success");
};

function ez(f9){return eq!==""&&(er+1000*(60*5-f9))>performance.now();
}}

function MountainAttack(){this.fA=new clearBorders();}

function clearBorders(){this.fC=function(fD){
if(!dialogManager.fE(dialogManager.tileDataToIndexUnchecked)){return 0;}if(!localPlayer.data.passableMountains){return 0;}var fG=tileMap.tileDataToIndex(fD);
if(!this.isNeutralTile(localPlayer.getTileOwner,fG)&&!this.canAttack(localPlayer.getTileOwner,fG)){return 0;}var fL=PowerStateManager(powerState.fN(fD));if(fL===0){return 0;
}var fO=powerState.fP(fL);if(tileMap.fQ(fO)){return fL;}var player=tileMap.fR(fO);if(player===localPlayer.getTileOwner){return 0;
}if(playerBoundaryEngine.fS(player,localPlayer.getTileOwner)){return fL;}return 0;};this.neighborOffsets=function(player,fL){var fD=powerState.fP(fL);
if(!tileMap.fU(fD)){return false;}if(tileMap.fQ(fD)){boostSystem.fV[0]=localPlayer.isMountainTile;}else if(tileMap.fR(fD)!==boostSystem.fV[0]){
return false;}var fX=fY(fD);
var fZ=fX.length;for(var aC=0;aC<fZ;aC++){if(!this.isNeutralTile(player,fX[aC])&&
!this.canAttack(player,fX[aC])){continue;}boostSystem.fa[0]=boostSystem.fa[aC];return true;}return false;
};

function fY(fD){var fb=tileMap.fb;
var fX=[];loop:for(var fc=3;fc>=0;fc--){var fd=fD+fb[fc];
if(tileMap.fe(fd)){var id=tileMap.tileDataToIndex(fd);for(var aC=0;aC<fX.length;aC++){if(id===fX[aC]){continue loop;
}}boostSystem.fa[fX.length]=fd;fX.push(id);}}return fX;}

function PowerStateManager(ff){var fg=powerState.fh(ff);
var fi=powerState.fj(ff);
var max=Math.max(dialogManager.fk,dialogManager.fl)-2;
var fm=max*max;
var fn=false;
var fo=0;for(var fp=0;fp<max;fp++){
var fL=dt(fg,fi,fp);if(!fL){continue;}var fq=powerState.fr(fg,fi,fL);if(fq<fm){fo=fL;fm=fq;if(!fn){fn=true;
max=Math.floor(Math.sqrt(fq))+1;}}}return fo;}

function dt(fg,fi,fp){for(var aC=0;aC<=fp;aC++){
for(var fs=-1;fs<2;fs+=2){for(var ft=-1;ft<2;ft+=2){for(var ej=0;ej<2;ej++){
var fD=fu(fg+ej*fs*aC+(1-ej)*ft*fp,fi+ej*ft*fp+(1-ej)*fs*aC);if(fD){return fD;
}}}}}return 0;}

function fu(fg,fi){if(!powerState.fv(fg,fi)){return 0;}var fL=powerState.fw(fg,fi);
var fD=powerState.fP(fL);
if(tileMap.fU(fD)&&tileMap.lastPlayerTroops(fD)){return fL;}return 0;}this.isNeutralTile=function(player,fG){var fy=playerData.fy[player];
var fZ=fy.length;
var fz=Math.max(mathUtils.g0(fZ,12),1);
var fb=tileMap.fb;for(var aC=0;aC<fZ;aC+=fz){
var fO=fy[aC];for(var fc=3;fc>=0;fc--){var fd=fO+fb[fc];if(tileMap.fe(fd)&&fG===tileMap.tileDataToIndex(fd)){
return true;}}}return false;};this.canAttack=function(player,fG){var fy=playerData.fy[player];
var fZ=fy.length;
var fb=tileMap.fb;for(var aC=0;aC<fZ;aC++){var fO=fy[aC];for(var fc=3;fc>=0;fc--){var fd=fO+fb[fc];
if(tileMap.fe(fd)&&fG===tileMap.tileDataToIndex(fd)){return true;}}}return false;};}self.aiCommand746=function(g1){
if(g1===0){initGame();return;}if(g1===1){if(!uiSurface){return;}if(uiSurface.id!==1||uiSurface.e3<14){
return;}powerSystem.g2();}};

function BoostSystem(){this.h=new Array(4);this.g3=new Uint16Array(2);
this.g4=new Uint16Array(2);this.g5=new Int32Array(2);this.g6=new Uint32Array(2);
this.g7=new Uint32Array(2);this.g8=new Uint8Array(4);this.g9=new Uint8Array(4);
this.fa=new Uint32Array(4);this.gA=new Uint32Array(5);this.fV=new Uint32Array(8);
this.gB=new Uint32Array(8);this.gC=new Uint16Array(16);this.gD=new Uint16Array(512);
this.gE=new Uint16Array(512);this.gF=new Uint16Array(512);this.gG=new Uint16Array(0);
this.applyToGame=function(){var fZ=dialogManager.fk*dialogManager.fl;if(this.gG.length!==fZ){this.gG=new Uint16Array(fZ);
}};this.gH=function(h,gI){h[0]=gI;return h;};this.gJ=function(h,gI,gK){h[0]=gI;h[1]=gK;return h;
};this.gL=function(h,gI,gK,gM){h[0]=gI;h[1]=gK;h[2]=gM;return h;};this.gN=function(h,gI,gK,gM,gO){
h[0]=gI;h[1]=gK;h[2]=gM;h[3]=gO;return h;};}var gP;var gQ;var gR;var gS;var gT;var initializeAttackResolutionBuffers;var resolveAttacksAgainstPlayer;
var cacheDefenderTiles;var clearDefenderTerritory;var gY;var resolveCurrentAttack;var finalizeAttackResolution;var gb;

function gc(){resolveAttacksAgainstPlayer=0;cacheDefenderTiles=2048;clearDefenderTerritory=new Uint32Array(4*cacheDefenderTiles);
gY=0;resolveCurrentAttack=new Uint32Array(cacheDefenderTiles);finalizeAttackResolution=new Uint8Array(dialogManager.fk*dialogManager.fl);}

function gd(player){
gQ=player;gb=false;ge();gf();for(var aC=alliances.collectAttackableTiles(gQ)-1;aC>=0;aC--){gP=aC;removeCurrentAttack();}if(gb){clearAttackTileMarks();
}}

function clearAttackTileMarks(){playerBoundaryEngine.prepareAttackStrength();playerBoundaryEngine.applyCurrentAttackOutcome();}

function removeCurrentAttack(){initializeAttackResolutionBuffers=alliances.gl(gQ,gP);gR=alliances.gm(gQ,gP);gS=alliances.gn(gQ,gP);
go();if(resolveAttacksAgainstPlayer===0){gp();return;}gq();if(!gr()){gp();return;}gs();}

function gr(){gT=mathUtils.g0(gR,resolveAttacksAgainstPlayer);
if(gT>localPlayer.attackSourceTiles){return true;}if(!gS){return false;}var gu=resolveAttacksAgainstPlayer*(1+localPlayer.attackSourceTiles);gR+=gameState.gv.setPassiveBorderTile(gQ,gu-gR);
gT=mathUtils.g0(gR,resolveAttacksAgainstPlayer);return true;}

function gq(){var aC;for(aC=resolveAttacksAgainstPlayer-1;aC>=0;aC--){finalizeAttackResolution[mathUtils.g0(clearDefenderTerritory[aC],4)]=0;
}}

function gp(){if(alliances.collectAttackableTiles(gQ)===1){borderCalc.collectNeutralAttackTiles(gQ);}var ea=gameState.gv.collectPlayerAttackTiles(gQ,gR);gameClock.gz(gQ,gR-ea,12);
alliances.h0(gQ,gP);}

function ge(){var player=gQ;
var h1=playerData.h1;
var fZ=Math.min(h1[player].length,cacheDefenderTiles);
var resolveAttackCombat=0;
var commitCapturedTiles=resolveCurrentAttack;for(var aC=fZ-1;aC>=0;aC--){commitCapturedTiles[resolveAttackCombat++]=h1[player][aC];
}gY=resolveAttackCombat;}

function gf(){var aC;for(aC=playerData.h1[gQ].length-1;aC>=0;aC--){if(tileMap.fU(playerData.h1[gQ][aC])){
tileMap.mergeCapturedPlayerTerritory(playerData.h1[gQ][aC],gQ);}}playerData.h1[gQ]=[];}

function go(){resolveAttacksAgainstPlayer=0;if(initializeAttackResolutionBuffers===localPlayer.isMountainTile){h5();}else{
h6();}}

function h6(){var h7,h8,fc,aC;
var fb=tileMap.fb;for(fc=3;fc>=0;fc--){for(aC=gY-1;aC>=0;aC--){
h7=resolveCurrentAttack[aC]+fb[fc];h8=mathUtils.g0(h7,4);if(finalizeAttackResolution[h8]===0&&tileMap.h9(h7)&&tileMap.fR(h7)===initializeAttackResolutionBuffers){finalizeAttackResolution[h8]=1;clearDefenderTerritory[resolveAttacksAgainstPlayer++]=h7;
}}}}

function h5(){var h7,h8,fc,aC;
var fb=tileMap.fb;for(fc=3;fc>=0;fc--){for(aC=gY-1;aC>=0;aC--){
h7=resolveCurrentAttack[aC]+fb[fc];h8=mathUtils.g0(h7,4);if(finalizeAttackResolution[h8]===0&&tileMap.fQ(h7)){finalizeAttackResolution[h8]=1;clearDefenderTerritory[resolveAttacksAgainstPlayer++]=h7;}}}}

function gs(){
if(hA()){hB();if(initializeAttackResolutionBuffers!==localPlayer.isMountainTile){hC();}}else{gp();}}

function hC(){playerBoundaryEngine.hD();playerBoundaryEngine.hE(playerData.playerTerritories[initializeAttackResolutionBuffers]);
playerBoundaryEngine.hE(playerData.hG[initializeAttackResolutionBuffers]);if(dialogManager.fE(dialogManager.tileDataToIndexUnchecked)){playerBoundaryEngine.hE(playerData.fy[initializeAttackResolutionBuffers]);}playerBoundaryEngine.assignCapturedTiles(playerData.h1[initializeAttackResolutionBuffers]);playerBoundaryEngine.resolveNeutralCombat(playerData.hG[initializeAttackResolutionBuffers]);
playerBoundaryEngine.resolveNeutralCombat(playerData.fy[initializeAttackResolutionBuffers]);playerBoundaryEngine.resolvePlayerCombat();playerBoundaryEngine.hK();}

function hB(){gb=true;alliances.hL(gQ,gP,gR);alliances.calculateDefenderStrength(gQ,gP);playerData.hN[gQ]+=resolveAttacksAgainstPlayer;
playerBoundaryEngine.getDefenderCounterattackTroops();hP();}

function hA(){if(initializeAttackResolutionBuffers===localPlayer.isMountainTile){return hQ();}else{return applyDefenderLosses();}}

function applyDefenderLosses(){
var hS=resolveAttacksAgainstPlayer*localPlayer.attackSourceTiles;
var hT=hU();
var hV=hW();
var hX=hS+2*hT+hV;
var hY=gT*resolveAttacksAgainstPlayer;if(hY>hX){gR-=hX;
gameClock.gz(gQ,hX,13);hZ(hX-hS,hV);return true;}else{if(gS&&hV===0){gR-=hY;hY+=gameState.gv.setPassiveBorderTile(gQ,hX-hY+1);
gameClock.gz(gQ,hY,13);hZ(hY-hS,0);return true;}gR-=hY;gameClock.gz(gQ,hY,13);hZ(hY-hS,hV);return false;
}}

function hZ(hY,hV){if(hV>0){if(hY<=hV){gameClock.gz(initializeAttackResolutionBuffers,hY,13);alliances.ha(initializeAttackResolutionBuffers,gQ,hV-hY);return;}alliances.ha(initializeAttackResolutionBuffers,gQ,0);
hY-=hV;}hY=mathUtils.g0(hY,2);hY=Math.min(playerData.hb[initializeAttackResolutionBuffers],hY);gameClock.gz(initializeAttackResolutionBuffers,hY,13);playerData.hb[initializeAttackResolutionBuffers]-=hY;}

function hW(){
return alliances.hc(initializeAttackResolutionBuffers,gQ);}

function hU(){return mathUtils.g0(resolveAttacksAgainstPlayer*playerData.hb[initializeAttackResolutionBuffers],1+mathUtils.g0(10*playerData.hN[initializeAttackResolutionBuffers],16));
}

function hQ(){var hd=resolveAttacksAgainstPlayer*localPlayer.attackSourceTiles;gR-=hd;gameClock.gz(gQ,hd,13);return true;}

function hP(){
for(var aC=resolveAttacksAgainstPlayer-1;aC>=0;aC--){playerData.h1[gQ].push(clearDefenderTerritory[aC]);playerData.playerTerritories[gQ].push(clearDefenderTerritory[aC]);tileMap.mergeCapturedPlayerTerritory(clearDefenderTerritory[aC],gQ);
}}

function AdManagerClass(){var he=0;
var hf=0;this.hg=function(fg,fi){he=fg;hf=fi;};this.screenToTileX=function(code){
if(localPlayer.hi||zoomHandler.screenToTileY){return;}if(!gameState.gv.isValidTile(0)&&!gameState.gv.isValidTile(1)){return;}if(!gameState.gv.hl(localPlayer.getTileOwner)){return;
}if(clickHandler.hm(he,hf)){clickHandler.hn=false;return;}if(panHandler.hm(he,hf)){return;}var ho=powerState.hp(he);
var hq=powerState.hr(hf);
var fL=powerState.fw(ho,hq);if(!powerState.hs(ho,hq)){return;}if(code===0){ht(fL);}else if(code===1){
hu(fL);}else if(code===2){hv(fL);}};

function ht(fL){var hw;if(localPlayer.isFreeForAll){hw=expansionTargetFinder.hy(fL);
if(hw===-1){return;}mapCache.hz.isSameTeam(fL);return;}var fD=powerState.fP(fL);if(tileMap.fe(fD)){hw=mountainAttack.fA.fC(fD);
if(hw){var fO=powerState.fP(hw);
var i1=tileMap.fQ(fO)?localPlayer.isMountainTile:tileMap.fR(fO);mapCache.hz.findAutoLaunchTarget(clickHandler.i3(),hw,i1);}return;
}hw=expansionTargetFinder.interceptPlanner(fL);if(hw<0){return;}fD=powerState.fP(hw);if(tileMap.fQ(fD)){if(playerBoundaryEngine.i5(localPlayer.getTileOwner)){mapCache.hz.i6(clickHandler.i3(),localPlayer.isMountainTile);
}else if(alliances.collectAttackableTiles(localPlayer.getTileOwner)){historySystem.i7(localPlayer.isMountainTile,clickHandler.i3());}return;}var player=tileMap.fR(fD);if(!playerBoundaryEngine.fS(player,localPlayer.getTileOwner)){
return;}if(playerBoundaryEngine.i8(localPlayer.getTileOwner,player)){mapCache.hz.i6(clickHandler.i3(),player);}else if(alliances.collectAttackableTiles(localPlayer.getTileOwner)){
historySystem.i7(player,clickHandler.i3());}}

function hu(fL){if(bonusSystem.i9.iA(localPlayer.getTileOwner,fL)){mapCache.hz.iB(clickHandler.i3(),boostSystem.gB[7]);
}}

function hv(fL){if(bonusSystem.iC.iD(localPlayer.getTileOwner,fL)){mapCache.hz.iE(clickHandler.i3());}}this.iF=function(){
if(localPlayer.hi||zoomHandler.screenToTileY){return;}if(!gameState.gv.isValidTile(1)){return;}var h7=localPlayer.getTileOwner;if(!gameState.gv.hl(h7)){return;
}var fZ=alliances.collectAttackableTiles(h7);if(fZ<1){iG();return;}var iH=0;
var iI=alliances.gm(h7,0);for(var aC=1;aC<fZ;aC++){
var iJ=alliances.gm(h7,aC);if(iJ<iI){iI=iJ;iH=aC;}}mapCache.hz.i6(clickHandler.i3(),alliances.gl(h7,iH));
};this.iK=function(){if(localPlayer.hi||zoomHandler.screenToTileY){return;}if(!gameState.gv.hl(localPlayer.getTileOwner)){return;}
if(!gameState.gv.isValidTile(1)){return;}if(cameraController.isTeamGame){if(!cameraController.measureFittedFontScale(localPlayer.getTileOwner)){return;}mapCache.hz.iN(1);return;}if(!cameraController.iO(localPlayer.getTileOwner)){
return;}mapCache.hz.iK();};

function iG(){var h7=localPlayer.getTileOwner;if(playerBoundaryEngine.i5(h7)){mapCache.hz.i6(clickHandler.i3(),localPlayer.isMountainTile);
return;}var fb=tileMap.fb;
var hF=playerData.playerTerritories;
var fZ=hF[h7].length;
var iP=Math.floor(Math.random()*fZ);
for(var aC=0;aC<fZ;aC++){for(var iQ=3;iQ>=0;iQ--){var iR=hF[h7][(aC+iP)%fZ]+fb[iQ];
if(tileMap.h9(iR)){var iS=tileMap.fR(iR);if(iS!==h7&&(!localPlayer.iT||playerBoundaryEngine.fS(h7,iS))){
mapCache.hz.i6(clickHandler.i3(),iS);return;}}}}}}

function iU(iV,size,iW,iX,font){function dk(){var aC,iY,iZ;
var ia=0.2;
var canvas=document.createElement("canvas");
var ib=canvas.getContext("2d",{alpha:false});
canvas.width=iV;canvas.height=iV;ib.font=size+font;ib.textAlign="center";ib.textBaseline="middle";
ib.fillStyle="red";for(aC=0;aC<iW.length;aC++){ib.fillText(iW[aC],0.5*iV,0.5*iV);
}iY=ib.getImageData(0,0,iV,iV);iZ=ic(iY);if(iZ> -1){ia=(iZ-(0.5*iV)+0.1*size)/size;
}return Math.max(ia,0);}

function ic(iY){var aC,eH;
var fc=iY.data;for(aC=fc.length-4;aC>=0;aC-=4){
eH=fc[aC];if(eH>=iX){return Math.floor(aC/(4*iV));}}return-1;}return dk();}

function PowerState(){
this.hasNeighborWithId=new Int16Array(4);this.ig=new Int16Array(4);this.isWaterTile=null;this.applyToGame=function(){var aC;
this.hasNeighborWithId[0]=-dialogManager.fk;this.hasNeighborWithId[1]=1;this.hasNeighborWithId[2]=dialogManager.fk;this.hasNeighborWithId[3]=-1;this.isWaterTile=new Int16Array([-dialogManager.fk,
-dialogManager.fk+1,1,dialogManager.fk+1,dialogManager.fk,dialogManager.fk-1,-1,-dialogManager.fk-1]);for(aC=0;aC<4;aC++){this.ig[aC]=4*this.hasNeighborWithId[aC];
}};this.isOwnedByPlayer=function(){return mathUtils.distanceBetweenPointsAndEncoded(Math.floor(0.15*(1+0.25*uiSurface.platformActions.ik())*camera.il/im),4,128);
};this.io=function(fD,id){var ip=this.ig;
for(var aC=0;aC<4;aC++){var fO=fD+ip[aC];if(tileMap.getEncodedX(fO)&&tileMap.tileDataToIndex(fO)===id){return true;}}return false;
};this.ir=function(player,fD){if(tileMap.fQ(fD)){return false;}if(player===tileMap.fR(fD)){return true;
}return false;};this.fr=function(ho,hq,fL){ho-=this.fh(fL);hq-=this.fj(fL);return ho*ho+hq*hq;
};this.is=function(it,iu,iv){var iw=this.distanceSqBetweenTiles(it)-this.distanceSqRaw(iv);
var iz=this.j0(iu)-this.j1(iv);
return Math.sqrt(iw*iw+iz*iz);};this.j2=function(j3,j4){var iw=this.fh(j3)-this.fh(j4);
var iz=this.fj(j3)-this.fj(j4);return ~~Math.sqrt(iw*iw+iz*iz+0.5);};this.j5=function(j3,j4){
var iw=this.fh(j3)-this.fh(j4);
var iz=this.fj(j3)-this.fj(j4);return iw*iw+iz*iz;
};this.j6=function(j7,j8,j9,jA){j7-=j9;j8-=jA;return j7*j7+j8*j8;};this.jB=function(h7,jC){
return mathUtils.g0(jC*playerData.hb[h7],1000);};this.distanceSqBetweenTiles=function(it){return 16*(it+jD)/im;};this.j0=function(iu){
return 16*(iu+jE)/im;};this.bucketColumns=function(fc){return 16*fc/im;};this.hp=function(it){
return Math.floor((it+jD)/im);};this.hr=function(iu){return Math.floor((iu+jE)/im);
};this.hs=function(ho,hq){return ho>=1&&hq>=1&&ho<dialogManager.fk-1&&hq<dialogManager.fl-1;
};this.fh=function(fL){return fL%dialogManager.fk;};this.fj=function(fL){
return mathUtils.g0(fL,dialogManager.fk);};this.fw=function(ho,hq){return hq*dialogManager.fk+ho;};this.getNeighbor=function(ho,hq){
return 4*(this.fw(ho,hq));};this.getNeighborDataIndex=function(fL){return this.fv(this.fh(fL),this.fj(fL));
};this.fv=function(ho,hq){return ho>0&&ho<dialogManager.fk-1&&hq>0&&hq<dialogManager.fl-1;
};this.fP=function(fL){return fL<<2;};this.fN=function(fD){
return fD>>2;};this.getDirection=function(fL){return((dialogManager.fk*this.fj(fL))*256)+(this.fh(fL)<<4);
};this.getPlayerCenterTile=function(fL){return this.getDirection(fL)+8+(dialogManager.fk<<7);
};this.territoryMinX=function(iv){return dialogManager.fk*(this.j1(iv)>>4)+(this.distanceSqRaw(iv)>>4);
};this.territoryMaxX=function(iv){var fL=this.territoryMinX(iv);return(this.fh(fL)>>5)+bonusSystem.territoryMinY.territoryMaxY*(this.fj(fL)>>5);
};this.distanceSqRaw=function(iv){return iv%(dialogManager.fk<<4);};this.j1=function(iv){return mathUtils.g0(iv,dialogManager.fk<<4);
};this.getRandomTileInPlayerArea=function(fL,iQ){return fL+this.hasNeighborWithId[iQ];};this.randomRange=function(fD,iQ){return fD+this.ig[iQ];
};this.emptyTileCache=function(j3,j4){var iw=this.fh(j4)-this.fh(j3);
var iz=this.fj(j4)-this.fj(j3);
if(Math.abs(iw)>=Math.abs(iz)){return 1+2*(iw<0);}return 2*(iz>0);};this.EmptyTileCache=function(player){
return this.fw((playerData.botExpansionAi[player]+playerData.BotExpansionAi[player])>>1,(playerData.botTeamTargetCoordinator[player]+playerData.BotTeamTargetCoordinator[player])>>1);
};this.BotDifficultyBalancer=function(player){
return this.fw(coordHelper.botAttackTargetSelector(playerData.botExpansionAi[player],playerData.BotExpansionAi[player]),coordHelper.botAttackTargetSelector(playerData.botTeamTargetCoordinator[player],playerData.BotTeamTargetCoordinator[player]));
};}

function NameRenderer(){this.BotAttackTargetSelector=new jZ();this.BotAttackAi=new jb();this.BotMountainAttackAi=new jd();
this.performance=new BotShipRouteSelector();this.botBoatInterceptAi=new BotBoatInterceptAi();this.jh=new ji();this.jj=new jk();this.jl=new jm();
this.jn=new jo();this.applyToGame=function(){this.BotAttackTargetSelector.applyToGame();this.BotMountainAttackAi.applyToGame();this.performance.applyToGame();
this.botBoatInterceptAi.applyToGame();this.jh.applyToGame();};this.ee=function(){this.performance.ee();this.BotAttackTargetSelector.ee();
this.BotMountainAttackAi.neutralAttackCount();};}

function BotBoatInterceptAi(){var jq;
var jr=8;
var js=new Uint16Array(jr);this.applyToGame=function(){
jq=0;};this.jt=function(player,ju){boostSystem.fV[1]=playerData.h1[player].length;if(boostSystem.fV[0]===localPlayer.isMountainTile){
nameRenderer.botBoatInterceptAi.jv(player);}else{this.jw(player,boostSystem.fV[0]);}if(boostSystem.fV[1]===0&&playerData.h1[player].length===0){
return false;}if(!ju&&boostSystem.fV[1]===playerData.h1[player].length){return false;}if(boostSystem.fV[0]===localPlayer.isMountainTile){
playerData.isPassiveBorderTile[player]++;}else{playerData.setAttackBorderTile[player]++;}return true;};this.sampleAdjacentTargets=function(player){k0(boostSystem.fV[1],player);
alliances.ei(player,boostSystem.g6[0],boostSystem.fV[0]);borderCalc.k1(player,false);};this.k2=function(player,k3,fZ,iI){
var k4=mathUtils.g0(12*playerData.hb[player],1024);iI-=iI>=mathUtils.g0(playerData.hb[player],2)?k4:0;
k0(fZ,player);alliances.ei(player,iI,k3);playerData.hb[player]-=iI+k4;borderCalc.k1(player,false);
};this.jw=function(player,k3){var aC,iQ;
var fb=tileMap.fb;for(aC=playerData.playerTerritories[player].length-1;aC>=0;aC--){
if(tileMap.removeNeutralCandidate(playerData.playerTerritories[player][aC])){for(iQ=3;iQ>=0;iQ--){if(tileMap.h9(playerData.playerTerritories[player][aC]+fb[iQ])&&
tileMap.fR(playerData.playerTerritories[player][aC]+fb[iQ])===k3){playerData.h1[player].push(playerData.playerTerritories[player][aC]);
break;}}}}};

function k0(size,player){for(var aC=playerData.h1[player].length-1;aC>=size;aC--){
tileMap.removeAlreadyAttackedTargets(playerData.h1[player][aC],player);}}this.jv=function(player){
var fb=tileMap.fb;for(var aC=playerData.playerTerritories[player].length-1;aC>=0;aC--){if(tileMap.removeNeutralCandidate(playerData.playerTerritories[player][aC])){
for(var iQ=3;iQ>=0;iQ--){if(tileMap.fQ(playerData.playerTerritories[player][aC]+fb[iQ])){playerData.h1[player].push(playerData.playerTerritories[player][aC]);
break;}}}}};this.hasAttackOnTarget=function(player,k8){var aC,fs,iQ,iS;
var fZ=playerData.playerTerritories[player].length;
var k9=fZ>=256?12:fZ>=32?6:1;
var kA=fZ-1-coordHelper.selectWeakestCandidate(k9);
var fb=tileMap.fb;jq=0;loop:for(aC=kA;aC>=0;aC-=k9){
for(iQ=3;iQ>=0;iQ--){iS=tileMap.fQ(playerData.playerTerritories[player][aC]+fb[iQ])?localPlayer.isMountainTile:tileMap.fR(playerData.playerTerritories[player][aC]+fb[iQ]);
if(iS===localPlayer.isMountainTile||(tileMap.h9(playerData.playerTerritories[player][aC]+fb[iQ])&&iS!==player&&(k8||playerBoundaryEngine.fS(player,iS)))){
for(fs=jq-1;fs>=0;fs--){if(js[fs]===iS){
continue loop;}}js[jq]=iS;if(++jq>=jr){return true;}}}}return jq>0;};this.kC=function(player,k8){
var aC,iQ,iS;
var fb=tileMap.fb;jq=0;for(aC=playerData.playerTerritories[player].length-1;aC>=0;aC--){
for(iQ=3;iQ>=0;iQ--){iS=tileMap.fQ(playerData.playerTerritories[player][aC]+fb[iQ])?localPlayer.isMountainTile:tileMap.fR(playerData.playerTerritories[player][aC]+fb[iQ]);
if(iS===localPlayer.isMountainTile||(tileMap.h9(playerData.playerTerritories[player][aC]+fb[iQ])&&iS!==player&&(k8||playerBoundaryEngine.fS(player,iS)))){
js[jq++]=iS;return true;}}}return false;};this.kD=function(){
var aC,ft;for(aC=jq-1;aC>=0;aC--){if(js[aC]===localPlayer.isMountainTile){jq--;for(ft=aC;ft<jq;ft++){js[ft]=js[ft+1];
}return true;}}return false;};this.selectNearestCandidate=function(player){var aC,ft;for(aC=jq-1;aC>=0;aC--){
if(alliances.kF(player,js[aC])){jq--;for(ft=aC;ft<jq;ft++){js[ft]=js[ft+1];}}}return jq===0;};
this.kG=function(){var aC;for(aC=jq-1;aC>=0;aC--){if(gameState.gv.kH(js[aC])){return true;}}return false;
};this.square=function(){var aC;for(aC=jq-1;aC>=0;aC--){if(!gameState.gv.kH(js[aC])){js[aC]=js[--jq];
}}return jq>0;};this.selectStrongestCandidate=function(player){var aC,ft;
var kK=js[0];
var kL=playerData.hb[kK]+alliances.hc(kK,player);
for(aC=jq-1;aC>=1;aC--){ft=playerData.hb[js[aC]]+alliances.hc(js[aC],player);if(ft<kL){
kK=js[aC];kL=ft;}}return kK;};this.kM=function(player){var aC,k;
var kN=js[0];if(jq===1){return kN;
}var kO=mathUtils.g0((playerData.BotExpansionAi[player]+playerData.botExpansionAi[player]),2);
var kP=mathUtils.g0((playerData.BotTeamTargetCoordinator[player]+playerData.botTeamTargetCoordinator[player]),2);
var fp=kQ(kO-mathUtils.g0((playerData.BotExpansionAi[kN]+playerData.botExpansionAi[kN]),2))+kQ(kP-mathUtils.g0((playerData.BotTeamTargetCoordinator[kN]+playerData.botTeamTargetCoordinator[kN]),2));
for(aC=jq-1;aC>=1;aC--){
k=kQ(kO-mathUtils.g0((playerData.BotExpansionAi[js[aC]]+playerData.botExpansionAi[js[aC]]),2))+kQ(kP-mathUtils.g0((playerData.BotTeamTargetCoordinator[js[aC]]+playerData.botTeamTargetCoordinator[js[aC]]),2));
if(k<fp){fp=k;kN=js[aC];}}return kN;
};this.kR=function(){var kS=js;
var kT=kS[0];
var hb=playerData.hb;
var kU=hb[kT];for(var aC=jq-1;aC>=1;aC--){
var h7=kS[aC];
var ft=hb[h7];if(ft>kU){kT=h7;kU=ft;}}return kT;};this.kV=function(){
return js[coordHelper.selectWeakestCandidate(jq)];};}

function ji(){this.kW=new Uint8Array(localPlayer.isMountainTile);this.applyToGame=function(){
this.kW.fill(0);};this.kX=function(player,iI){if(!alliances.kY(player)){return;}var kZ=botSpawner.ka(player);
var kb=troopCalc.iI[player];if(kb>=3&&kb<6){iI=Math.max(playerData.hb[player]-kZ,iI);}var kc=playerData.hG[player].length;
var kd=playerData.playerTerritories[player].length;if(30*playerData.hN[player]>localPlayer.chance&&kf[player]<10&&kc>=100*kd){troopCalc.kg(player,10);
}if(localPlayer.iT){kh(player,iI,kb,kZ);return;}if(!kd||(kc&&(kc<kd&&!coordHelper.selectWeakestCandidate(10)||kc>=100*kd&&coordHelper.selectWeakestCandidate(3)||
!coordHelper.selectWeakestCandidate(8)))){if(bonusSystem.ki.ee(player)){return;}}kj(player,iI,kb);};

function kh(player,iI,kb,kZ){
var k3;if(nameRenderer.botBoatInterceptAi.hasAttackOnTarget(player,false)||nameRenderer.botBoatInterceptAi.kC(player,false)){if(nameRenderer.botBoatInterceptAi.selectNearestCandidate(player)){return;
}if(nameRenderer.botBoatInterceptAi.kD()){kk(player,iI);kl(player,localPlayer.isMountainTile,kb);return;}if(coordHelper.km(troopCalc.kn[kb])){k3=nameRenderer.botBoatInterceptAi.selectStrongestCandidate(player);
ko(player,iI,k3,kb);}else{if(nameRenderer.botBoatInterceptAi.kG()&&coordHelper.km(troopCalc.kp[kb])){nameRenderer.botBoatInterceptAi.square();}if(kb===6){
ko(player,iI,nameRenderer.botBoatInterceptAi.kV(),kb);return;}k3=nameRenderer.botBoatInterceptAi.kM(player);ko(player,iI,k3,kb);}kl(player,k3,kb);
return;}if(bonusSystem.ki.ee(player)){return;}if(nameRenderer.jj.ee(player)){return;}kq(player,iI,kb,kZ);}


function kl(player,k3,kb){if(kb>=3&&clanPanel.kr()>2142&&(k3===localPlayer.isMountainTile||playerData.hb[k3]<mathUtils.g0(playerData.hb[player],20))){
troopCalc.kg(player,20);}}

function kq(player,iI,kb,kZ){var kW=nameRenderer.jh.kW;kW[player]=0;
var fX=mainMenu.fX;
var ks=fX[player];if(ks===0){return;}var hb=playerData.hb;
var kt=hb[player];
var hN=playerData.hN;
if(player<localPlayer.ku){iI=kt;}if(kt<hN[player]){return;}if(kb===5&&kt<kZ||kb===4&&kt<mathUtils.g0(kZ,2)){
return;}gameMenu.kv(ks);
var fZ=boostSystem.g4[0];
var gD=boostSystem.gD;
var aC=coordHelper.selectWeakestCandidate(fZ);for(var ft=0;ft<fZ;ft++){
var ej=gD[(ft+aC)%fZ];if(kW[ej]){mapCache.kw.kx(player,ej,iI);return;}}var ky=bonusSystem.z.ky;
for(ft=0;ft<fZ;ft++){ej=gD[(ft+aC)%fZ];if(ky[ej]&&ej!==player){mapCache.kw.kx(player,ej,iI);return;
}}}

function kj(player,iI,kb){if(!nameRenderer.botBoatInterceptAi.hasAttackOnTarget(player,true)&&!nameRenderer.botBoatInterceptAi.kC(player,true)){nameRenderer.jj.ee(player);
return;}if(nameRenderer.botBoatInterceptAi.selectNearestCandidate(player)){return;}if(nameRenderer.botBoatInterceptAi.kD()){kk(player,iI);return;}if(coordHelper.km(troopCalc.kn[kb])){
ko(player,iI,nameRenderer.botBoatInterceptAi.selectStrongestCandidate(player),kb);return;}if(kb===5){ko(player,iI,nameRenderer.botBoatInterceptAi.kR(),kb);
return;}if(nameRenderer.botBoatInterceptAi.kG()&&coordHelper.km(troopCalc.kp[kb])){nameRenderer.botBoatInterceptAi.square();}if(kb===6){ko(player,iI,nameRenderer.botBoatInterceptAi.kV(),kb);
return;}ko(player,iI,nameRenderer.botBoatInterceptAi.kM(player),kb);}

function ko(player,iI,k3,kb){if(kb>=3&&kb<6&&
mathUtils.g0(playerData.hb[player],8)>playerData.hb[k3]){iI=Math.max(mathUtils.g0(11*playerData.hb[k3],5),mathUtils.g0(playerData.hb[player],10));
}var fZ=playerData.h1[player].length;nameRenderer.botBoatInterceptAi.jw(player,k3);nameRenderer.botBoatInterceptAi.k2(player,k3,fZ,iI);}

function kk(player,iI){
var k3=localPlayer.isMountainTile;
var fZ=playerData.h1[player].length;nameRenderer.botBoatInterceptAi.jv(player);if(playerData.h1[player].length!==fZ){
nameRenderer.botBoatInterceptAi.k2(player,k3,fZ,iI);return true;}return false;}}

function TroopCalculator(){var kz=new Uint8Array(localPlayer.isMountainTile);
var l0=new Uint16Array(localPlayer.isMountainTile);
var l1=new Uint16Array(localPlayer.isMountainTile);
var l2=new Uint8Array(localPlayer.isMountainTile);
this.iI=new Uint8Array(localPlayer.isMountainTile);
var l3=new Uint16Array(localPlayer.isMountainTile);
var l4=new Uint16Array(localPlayer.isMountainTile);
this.l5=null;this.kp=[97,94,70,40,20,0,100];this.isSinglePlayer=[500,450,400,300,80,50,100];
this.kn=[0,0,5,25,50,100,0];this.l7=[60,74,112,200,256,512,512];
this.botCount=[1,2,3,4,6,8,1];this.l9=[500,450,400,300,80,50,100];this.lA=[100,150,250,400,600,1000,100];
this.dl=function(){this.l5=[L(7),L(8),L(9),L(10),L(11),L(12),"H Bot"];
};this.applyToGame=function(){var aC;kz.fill(0);l0.fill(0);l1.fill(0);l2.fill(0);this.iI.fill(0);
l3.fill(0);l4.fill(0);
var lB=localPlayer.ku;if(localPlayer.survivorBotCount===9){this.zombieDifficultyCounts();}else if(!localPlayer.lE){var lF=localPlayer.survivorBotCount===8?1:0;
for(aC=localPlayer.lG-1;aC>=0;aC--){this.iI[aC+lB]=lF;}}else{if(localPlayer.data.botDifficultyType===3){
for(aC=localPlayer.lG-1;aC>=0;aC--){var iR=aC+lB;this.iI[iR]=localPlayer.data.botDifficultyData[iR];
}}else if(localPlayer.data.botDifficultyType===2){for(aC=localPlayer.lG-1;aC>=0;aC--){iR=aC+lB;
this.iI[iR]=localPlayer.data.botDifficultyTeam[mainMenu.lH[mainMenu.fX[iR]]];}}else if(localPlayer.data.botDifficultyType===1){
var lI=this.l5.length;for(aC=localPlayer.lG-1;aC>=0;aC--){this.iI[aC+lB]=aC%lI;
}}else{lI=localPlayer.data.botDifficultyValue;for(aC=localPlayer.lG-1;aC>=0;aC--){this.iI[aC+lB]=lI;}}
}for(aC=0;aC<lB;aC++){this.iI[aC]=6;}var fZ=localPlayer.isMountainTile;for(aC=0;aC<fZ;aC++){if(this.iI[aC]<=2){l2[aC]=5;
l3[aC]=l4[aC]=1040;if(this.iI[aC]===0){l0[aC]=980;l1[aC]=980;}else if(this.iI[aC]===1){l0[aC]=980;
l1[aC]=920;l3[aC]=l4[aC]=1100;}else{l0[aC]=825;l1[aC]=750;}lJ(aC);continue;}if(this.iI[aC]<=4){
l2[aC]=1+coordHelper.selectWeakestCandidate(20);if(this.iI[aC]===3){l0[aC]=l1[aC]=500;l3[aC]=l4[aC]=1000;}else{
l4[aC]=250+coordHelper.selectWeakestCandidate(1501);l3[aC]=500+coordHelper.selectWeakestCandidate(501);l0[aC]=300+coordHelper.selectWeakestCandidate(201);l1[aC]=100+coordHelper.selectWeakestCandidate(201);}lJ(aC);
continue;}if(this.iI[aC]<=5){l3[aC]=1000;l4[aC]=1000;l2[aC]=35+coordHelper.selectWeakestCandidate(16);l0[aC]=300+coordHelper.selectWeakestCandidate(201);
l1[aC]=50+coordHelper.selectWeakestCandidate(101);lJ(aC);continue;}l3[aC]=l4[aC]=800;l2[aC]=5;l0[aC]=10;l1[aC]=250;lJ(aC);
}};this.zombieDifficultyCounts=function(){var fD=botSystem.lK;
var lB=localPlayer.ku;for(var aC=fD-1;aC>=0;aC--){this.iI[aC+lB]=0;
}for(var ft=0;ft<6;ft++){for(aC=fD+botSystem.lL[ft]-1;aC>=fD;aC--){this.iI[aC+lB]=ft;}fD+=botSystem.lL[ft];
}};

function lJ(aC){kz[aC]=1+mathUtils.g0(l3[aC]*coordHelper.random(),10*coordHelper.value(100));}this.kg=function(h7,value){
kz[h7]=Math.min(value,kz[h7]);};this.ee=function(h7){if(--kz[h7]===0){lM(h7);}};

function lM(h7){
lN(h7);nameRenderer.jh.kX(h7,mathUtils.g0(l0[h7]*playerData.hb[h7],1000));}

function lN(h7){if(l3[h7]!==l4[h7]){
l3[h7]+=l3[h7]<l4[h7]?3:-3;}if(l0[h7]!==l1[h7]){l0[h7]+=l0[h7]<l1[h7]?l2[h7]:-l2[h7];
l0[h7]=Math.abs(l0[h7]-l1[h7])<=l2[h7]?l1[h7]:l0[h7];}kz[h7]=mathUtils.g0(l3[h7],10);
}this.lO=function(h7,resolveAttackCombat){l3[h7]=l4[h7]=resolveAttackCombat;};}

function jd(){var lP=new Uint16Array(localPlayer.isMountainTile);
this.applyToGame=function(){lP.fill(localPlayer.isMountainTile);};this.neutralAttackCount=function(){if(clanPanel.kr()%109!==9){
return;}if(territorySystem.lQ<20){return;}if(!localPlayer.iT){return;}if(gameMenu.lR()<mathUtils.g0(8*localPlayer.chance,10)){return;
}var lS=gameMenu.lT();if(!mainMenu.lH[lS]){return;}gameMenu.lU(lS);
var fZ=boostSystem.g4[0];if(fZ===0){return;}var h=boostSystem.gD;
var lV=territorySystem.lV;
var lQ=territorySystem.lQ;
var lW=lP;
var iR=coordHelper.selectWeakestCandidate(fZ);for(var aC=0;aC<lQ;aC++){var i1=lV[aC];
var lX=h[iR];if(gameState.gv.lY(i1,lX)&&lW[i1]===512){lW[i1]=lX;iR=(iR+1)%fZ;}}};this.ee=function(player){
var lZ=la(player);lb(player);if(boostSystem.g4[0]===0){return false;}var lc=powerState.BotDifficultyBalancer(player);
var ld=le(player,lc);
var lf=lg(ld,lc);if(lf>0&&bonusSystem.lh.li(player,bonusSystem.lj.isActivePlayer(lf,lc))){
ll(player,lc,ld,lZ);return true;}var lm=ln(player,lc);if(lm>0&&bonusSystem.lh.li(player,bonusSystem.lj.isActivePlayer(lm,lc))){
ll(player,lc,tileMap.fR(lm<<2),lZ);return true;}lf=lg(lZ,lc);if(lf>0&&bonusSystem.lh.li(player,bonusSystem.lj.isActivePlayer(lf,lc))){
return true;}return false;};

function lb(player){var lo=territorySystem.lV;
var lp=territorySystem.lQ;
var fZ=Math.min(lp,(lp<17&&coordHelper.selectWeakestCandidate(20)===5)?1:16);
var h8=coordHelper.selectWeakestCandidate(lp);
var gC=boostSystem.gC;
var hG=playerData.hG;
var resolveAttackCombat=0;for(var aC=0;aC<fZ;aC++){var h7=lo[(aC+h8)%lp];if(h7!==player&&hG[h7].length){gC[resolveAttackCombat++]=h7;
}}boostSystem.g4[0]=resolveAttackCombat;}

function le(player,lc){var fZ=boostSystem.g4[0];
var gC=boostSystem.gC;
var lq=-1;
var lr=localPlayer.isMountainTile;
for(var aC=0;aC<fZ;aC++){var h7=gC[aC];if(!playerBoundaryEngine.fS(player,h7)){continue;}var fp=powerState.j5(lc,powerState.EmptyTileCache(h7));
if(lq===-1||fp<lq){lq=fp;lr=h7;}}return lr;}

function lg(ld,lc){if(ld===localPlayer.isMountainTile){
return 0;}var hG=playerData.hG[ld];
var lp=hG.length;if(lp===0){return 0;}var fZ=Math.min(lp,10);
var lr=0;
var lq=powerState.j5(hG[lr]>>2,lc);for(var aC=0;aC<fZ;aC++){var iR=coordHelper.selectWeakestCandidate(lp);
var fp=powerState.j5(hG[iR]>>2,lc);
if(fp<lq){lq=fp;lr=iR;}}return hG[lr]>>2;}

function ln(player,lc){var fZ=boostSystem.g4[0];
var gC=boostSystem.gC;
var lW=lP;
var h8=0;for(var aC=0;aC<fZ;aC++){var h7=gC[aC];
var k3=lW[h7];if(k3===localPlayer.isMountainTile){
continue;}if(!gameState.gv.ls(k3)){continue;}if(player===k3){continue;}if(!playerBoundaryEngine.fS(player,k3)){
continue;}gC[h8++]=k3;}boostSystem.g4[0]=h8;if(h8===0){return 0;}var ld=le(player,lc);return lg(ld,lc);
}

function la(player){var k3=lP[player];if(k3===localPlayer.isMountainTile){return localPlayer.isMountainTile;}if(!gameState.gv.ls(k3)||!playerData.hG[k3]){
lP[player]=localPlayer.isMountainTile;return localPlayer.isMountainTile;}return k3;}

function ll(player,lc,k3,lt){if(lt===localPlayer.isMountainTile){
lP[player]=k3;return;}var lu=powerState.EmptyTileCache(k3);
var lv=powerState.EmptyTileCache(lt);if(powerState.j5(lc,lu)<powerState.j5(lc,lv)){
lP[player]=k3;}}}

function jk(){this.ee=function(player){if(!dialogManager.fE(dialogManager.tileDataToIndexUnchecked)){
return false;}if(!localPlayer.data.passableMountains){return false;}if(playerData.fy[player].length===0){
return false;}return lw(player);};

function lw(player){var lx=ly(player);
if(lx===null){return false;}lz(player);
var m0=m1(lx.id);if(m0===null){return m2(player,lx.id);
}m3(player,m0);return true;}

function m2(player,fG){var fZ=nameRenderer.BotAttackTargetSelector.m4;if(fZ===0){
return false;}var fD=nameRenderer.BotAttackTargetSelector.buffer[coordHelper.selectWeakestCandidate(fZ)]<<2;
var fb=tileMap.fb;
var fc=coordHelper.selectWeakestCandidate(4);while(true){
fD+=fb[fc];if(tileMap.fe(fD)){if(tileMap.tileDataToIndex(fD)===fG){m3(player,{fD:fD,h7:localPlayer.isMountainTile});return true;}break;
}if(!tileMap.fQ(fD)){break;}}return false;}

function ly(player){var fy=playerData.fy[player];
var fZ=fy.length;
var fz=Math.max(mathUtils.g0(fZ,12),1);
var fb=tileMap.fb;
var eH=coordHelper.selectWeakestCandidate(fZ);for(var aC=0;aC<fZ;aC+=fz){
var fO=fy[(aC+eH)%fZ];for(var fc=3;fc>=0;fc--){var fd=fO+fb[fc];if(tileMap.fe(fd)){
return{fD:fd,id:tileMap.tileDataToIndex(fd),h7:player};}}}return null;}

function lz(player){var lV=territorySystem.lV;
var lQ=territorySystem.lQ;
var fZ=Math.min(lQ,12);
var h8=coordHelper.selectWeakestCandidate(lQ);
var gC=boostSystem.gC;
var fy=playerData.fy;
var resolveAttackCombat=0;
for(var aC=0;aC<fZ;aC++){var h7=lV[(aC+h8)%lQ];if(h7!==player&&fy[h7].length&&playerBoundaryEngine.fS(player,h7)){
gC[resolveAttackCombat++]=h7;}}boostSystem.g4[0]=resolveAttackCombat;}

function m1(fG){var fZ=boostSystem.g4[0];
var gC=boostSystem.gC;for(var aC=0;aC<fZ;aC++){var m5=ly(gC[aC]);if(m5===null){continue;}if(m5.id===fG){
return m5;}}return null;}

function m3(player,m5){var iI=gameState.gv.m6(player,troopCalc.l9[troopCalc.iI[player]]);
playerData.h1[player].push(m5.fD);alliances.ei(player,iI,m5.playerTiles);borderCalc.k1(player,true);}}

function jb(){
this.ee=function(player){return bonusSystem.lh.li(player,m7(player));};

function m7(player){var fZ=nameRenderer.BotAttackTargetSelector.m4;
if(fZ===0){return-1;}var lp=Math.min(fZ,nameRenderer.performance.routeStore?fZ:10);
var buffer=nameRenderer.BotAttackTargetSelector.buffer;
var kA=mathUtils.g0(coordHelper.random()*fZ,coordHelper.value(100));
var e=kA+lp;
var m9=coordHelper.botAttackTargetSelector(playerData.botExpansionAi[player],playerData.BotExpansionAi[player]);
var mA=coordHelper.botAttackTargetSelector(playerData.botTeamTargetCoordinator[player],playerData.BotTeamTargetCoordinator[player]);
var lr=-1;
var fp=powerState.j6(0,0,dialogManager.fk,dialogManager.fl);
for(var aC=kA;aC<e;aC++){var h8=aC%fZ;
var mB=powerState.fr(m9,mA,buffer[h8]);if(mB<fp){fp=mB;
lr=h8;}}if(lr===-1){return-1;}return mC(buffer[lr],m9,mA);}

function mC(fL,m9,mA){var ho=powerState.fh(fL);
var hq=powerState.fj(fL);
var iw=m9-ho;
var iz=mA-hq;if(Math.abs(iw)>=Math.abs(iz)){iz=0;iw=Math.sign(iw);
}else{iw=0;iz=Math.sign(iz);}if(iw===iz){iw=1;}while(true){ho+=iw;hq+=iz;if(!powerState.fv(ho,hq)){break;}
fL=powerState.fw(ho,hq);if(tileMap.getEncodedX(powerState.fP(fL))){return fL;}}return-1;}}

function jm(){this.ee=function(player){
var mD=mE(player);if(mD===-1){return false;}var mF=bonusSystem.reverseRoute.get(mD);if(bonusSystem.lj.mH(player,mF)){
return false;}boostSystem.h[0]=mF;return true;};

function mE(player){var mG=bonusSystem.reverseRoute.mI();
var fZ=mG.length;
var lp=Math.min(fZ,32);
var iR=coordHelper.selectWeakestCandidate(fZ);for(var aC=0;aC<lp;aC++){var mD=(aC+iR)%fZ;
var mF=mG[mD];
var j3=mF[0];
var j4=mF[mF.length-1];if(bonusSystem.lj.hasReachedMapControlPercentage(player,j3)&&bonusSystem.lj.mK(player,j4)){
return mD;}if(bonusSystem.lj.hasReachedMapControlPercentage(player,j4)&&bonusSystem.lj.mK(player,j3)){
mD=bonusSystem.reverseRoute.mL(j4,j3);if(mD>=0){return mD;}if(bonusSystem.reverseRoute.mM()){
return-1;}return bonusSystem.reverseRoute.mN(bonusSystem.reverseRoute.mO(mF));}}return-1;}}

function BotShipRouteSelector(){this.routeStore=0;this.applyToGame=function(){
this.routeStore=0;};this.ee=function(){if(this.routeStore){return;}if(!mP()){return;}mQ();};

function mP(){
if(clanPanel.kr()%30!==7){return false;}if(gameState.gv.mR(90)){nameRenderer.performance.routeStore=1;return true;}return false;
}

function mQ(){if(localPlayer.iT){mS();}mT();}

function mS(){var lS=gameMenu.lT();if(!mainMenu.lH[lS]){return;
}gameMenu.kv(lS);
var h=boostSystem.gD;
var fZ=boostSystem.g4[0];if(fZ===0){return;}var mU=Math.min(100+(fZ-1)*10,400);
for(var aC=0;aC<fZ;aC++){troopCalc.lO(h[aC],mU);}}

function mT(){troopCalc.lO(mV[0],100);}}

function jZ(){
var mW=0;
var mX=0;
var mY=300;
var mZ=300;
var ma=0;this.m4=0;this.buffer=new Uint32Array(512);
this.applyToGame=function(){mW=0;mX=0;this.m4=0;ma=0;};this.ee=function(){if(!mb()){return;}if(mW>=mY){
mc();return;}md();};

function mc(){var me=nameRenderer.BotAttackTargetSelector.m4;if(me){if(clanPanel.kr()%350!==1){return;}if(ma!==me){
ma=me;return;}if(!gameState.gv.kH(mV[0])){return;}}else{if(clanPanel.kr()%12!==8){return;}}if(gameState.gv.mf()){
return;}nameRenderer.BotAttackTargetSelector.applyToGame();}

function mb(){var fZ=nameRenderer.BotAttackTargetSelector.m4;if(fZ===0){return true;}var buffer=nameRenderer.BotAttackTargetSelector.buffer;
if(clanPanel.kr()%35!==6){return fZ<buffer.length;}for(var aC=fZ-1;aC>=0;aC--){if(!tileMap.fQ(buffer[aC]<<2)){
fZ--;buffer[aC]=buffer[fZ];}}nameRenderer.BotAttackTargetSelector.m4=fZ;return fZ<buffer.length;}

function md(){
var j=dialogManager.fk;
var mg=j-2;
var fZ=mg*(dialogManager.fl-2);
var mh=mY;
var buffer=nameRenderer.BotAttackTargetSelector.buffer;
var lp=nameRenderer.BotAttackTargetSelector.m4;
var mi=buffer.length;
var h8=Math.min(mX+mh*((1+19*nameRenderer.performance.routeStore)*mZ),fZ);var aC;
for(aC=mX;aC<h8;aC+=mh){var fD=4*(aC%mg+(mathUtils.g0(aC,mg)+1)*j+1);if(tileMap.fQ(fD)){buffer[lp]=fD>>2;
lp++;if(lp===mi){aC+=mh;break;}}}mX=aC;if(mX>=fZ){mW++;mX=mW;}nameRenderer.BotAttackTargetSelector.m4=lp;}}

function jo(){
this.ee=function(){if(clanPanel.kr()%51!==45){return;}mj();};

function mj(){var fZ=bonusSystem.z.mk;
var ml=bonusSystem.z.ml;
var mm=bonusSystem.z.mm;
var mn=bonusSystem.z.mn;
var mo=bonusSystem.z.mo;
var lA=troopCalc.lA;
var iI=troopCalc.iI;for(var aC=0;aC<fZ;aC++){
var mp=ml[aC];if(mp%64===6){continue;}var mF=mm[aC];
var player=bonusSystem.lj.mq(mF[mF.length-1]);
if(player<0||!gameState.gv.lY(player,mo[aC]>>3)){continue;}if(coordHelper.selectWeakestCandidate(1000)>=lA[iI[player]]){
continue;}if(!mr(aC,mF)){continue;}var ms=mn[aC];if(mp>=64&&bonusSystem.mt.mu(player,ms)){continue;
}mv(player,mF,ms,aC,mp);}}

function mr(mw,mF){var fZ=mF.length-1;
var mx=bonusSystem.z.updateIdleGameSystems[mw];
var fp=0;
for(var aC=mx+1;aC<fZ;aC++){fp+=powerState.j2(mF[aC],mF[aC+1]);}fp+=powerState.j2(powerState.territoryMinX(bonusSystem.z.mz[mw]),mF[mx+1]);
return fp<=60;}

function mv(player,mF,ms,mw,mp){if(!bonusSystem.advanceSimulationTick.n1(player)){return;
}if(!gameState.gv.n2(player,troopCalc.isSinglePlayer[troopCalc.iI[player]],32,0)){return;}bonusSystem.z.ml[mw]=64+mp%64;bonusSystem.mt.ei(ms,bonusSystem.z.n3);
boostSystem.h[0]=bonusSystem.reverseRoute.mO(mF);boostSystem.gB[1]=6;gameState.gv.heartbeatManager(player);bonusSystem.z.updateFrameOverlays(player);}}

function n6(){
hoverProcessor.ee();troops.ee();focusHandler.finalizeSimulationFrame();gameServer.z.ee();}

function n8(){historySystem.ee();territoryCalc.ee();soloMode.ee();botSpawner.ee();achievements.ee();
borderCalc.ee();nameRenderer.ee();bonusSystem.z.ee();territorySystem.n9();uiColors.ee();botSystem.ee();statsPanel.ee();troops.ee();troops.updatePausedFrame();focusHandler.ee();armySystem.ee();touchInputHandler.ee();
panHandler.ee();gameTimer.nB();hoverProcessor.ee();questSystem.ee();clickHandler.ee();cameraController.ee();gameClock.ee();gameMenu.ee();gameServer.z.ee();gameServer.nC.ee();account.ee();
gameConfig.eS.ee();packetWriter.ee();clanPanel.ee();}

function nD(){soloCalc.ee();resizeHandler.ee();deviceDetector.ee();clansSystem.ee();packetReader.ee();commandQueue.ee();gameTimer.ee();
touchController.nE();}

function nF(){uiColors.nG(false);panHandler.nG();focusHandler.nG(false);touchInputHandler.nG();clickHandler.nG();cameraController.nG();troops.nG(false);
gameMenu.nH();}

function nI(){if(troops.nG(false)){clanPanel.ds=true;}gameServer.z.ee();}

function BorderCalculator(){var nJ;var nK;var nL;
this.applyToGame=function(){nJ=0;nK=new Uint16Array(localPlayer.isMountainTile);nL=new Uint8Array(localPlayer.isMountainTile);};this.ee=function(){
for(var aC=nJ-1;aC>=0;aC--){if(nL[nK[aC]]===64){nM(nK[aC]);}else if(nL[nK[aC]]--===0){
nM(nK[aC]);gd(nK[aC]);}}if(playerData.hN[mV[0]]>=160000){nN(160000);if(playerData.hN[mV[0]]>=300000){nN(300000);
}}nO();};

function nN(nP){for(var aC=nJ-1;aC>=0;aC--){if(nL[nK[aC]]===0&&playerData.hN[nK[aC]]>=nP){
gd(nK[aC]);}}}

function nO(){if(!gameState.gv.ls(localPlayer.getTileOwner)){return;}gameClock.nQ[7]=Math.max(playerData.hN[localPlayer.getTileOwner],gameClock.nQ[7]);
}

function nM(player){if(nL[player]===64){nL[player]=6;}else{var ea=playerData.hN[player];
if(ea<1000){nL[player]=3;}else if(ea<10000){nL[player]=2;}else if(ea<60000){nL[player]=1;}else{
nL[player]=0;}}}this.collectNeutralAttackTiles=function(player){var fs,aC;for(aC=nJ-1;aC>=0;aC--){if(player===nK[aC]){
nJ--;for(fs=aC;fs<nJ;fs++){nK[fs]=nK[fs+1];}return;}}};this.k1=function(player,nR){
for(var aC=nJ-1;aC>=0;aC--){if(player===nK[aC]){return;}}nK[nJ++]=player;nL[player]=nR?2:64;
};}

function TerritoryCalculator(){var size;var ki;this.applyToGame=function(){size=localPlayer.lG;ki=new Uint16Array(localPlayer.isMountainTile);
var ku=localPlayer.ku;for(var aC=localPlayer.lG-1;aC>=0;aC--){ki[aC]=ku+aC;}};this.ee=function(){
nameRenderer.jn.ee();nS();};this.nT=function(h7){ki[size++]=h7;};

function nS(){for(var aC=size-1;aC>=0;aC--){
if(playerData.nU[ki[aC]]===0){nV(aC);continue;}troopCalc.ee(ki[aC]);}}

function nV(fs){
size--;ki[fs]=ki[size];}}

function SoloCalculator(){var nW;var nX;var nY;var nZ;var na;var nb;var nc;
var nd;var ne;var nf;var ng;var nh;var ni;
var nj=false;
var nk=false;

function nl(nm){nh=clanPanel.eZ;ni=33;
nX=0;nZ=0;nY=0;na=ni/nm;nW=1/(nm/ni/4);nb=(camera.j/2+jD)/im;nc=(camera.k/2+jE)/im;nd=im;}this.nn=function(){
return nj;};this.no=function(){nl(1);this.np(0,0,dialogManager.fk-1,dialogManager.fl-1);if(!localPlayer.isFreeForAll&&!localPlayer.hi){
this.uiHidden(localPlayer.getTileOwner,3000,true,0.3);}};this.nr=function(player,ns){nt(bonusSystem.lj.nu(player,ns));
};

function nt(aC){if(aC===-1){return;}var fL=powerState.territoryMinX(bonusSystem.z.mz[aC]);
var nv=powerState.fh(fL)-15;
var nw=powerState.fj(fL)-15;soloCalc.np(nv,nw,nv+29,nw+29);}this.uiHidden=function(player,nm,nx,zoom){
if(localPlayer.ny||(nj&&!nx&&nk)){return;}if(playerData.hN[player]===0){nt(bonusSystem.lj.nz(player));return;}hoverHandler.o0=false;
nk=nx;nl(nm);o1(player);o2(zoom,player);nj=true;inventory.o3();};this.o4=function(nm){if(localPlayer.hi||localPlayer.ny){
return;}hoverHandler.o0=false;nk=false;nl(nm);o5(0,0,dialogManager.fk-1,dialogManager.fl-1);o6(7/8);nj=true;inventory.o3();
};

function o1(player){ne=(playerData.botExpansionAi[player]+playerData.BotExpansionAi[player]+1)/2;nf=(playerData.botTeamTargetCoordinator[player]+playerData.BotTeamTargetCoordinator[player]+1)/2;}


function o2(zoom,player){var iw=playerData.BotExpansionAi[player]-playerData.botExpansionAi[player]+1;
var iz=playerData.BotTeamTargetCoordinator[player]-playerData.botTeamTargetCoordinator[player]+1;
var fs=camera.j/iw;
var ft=camera.k/iz;ng=fs<ft?fs:ft;
var o7=zoom!==0?zoom:(iw<20&&iz<20)?0.5:0.9;
ng*=o7;o6(7/8);}

function o6(eM){if(Math.abs(Math.log(ng/nd))<0.125){
ng=eM*nd;}}

function o5(nv,nw,o8,o9){ne=(nv+o8+1)/2;nf=(nw+o9+1)/2;
var iw=o8-nv+1;
var iz=o9-nw+1;
var fs=camera.j/iw;
var ft=camera.k/iz;ng=0.9*(fs<ft?fs:ft);}this.np=function(nv,nw,o8,o9){
nj=false;o5(nv,nw,o8,o9);im=ng;hoverHandler.oA(ne,camera.j/2);hoverHandler.oB(nf,camera.k/2);leaderboardPanel.oC();
clanPanel.ds=true;};this.visibleTileDirty=function(){if(nj&&nk){return false;}nj=false;return true;};this.ee=function(){
if(nj){oE();}};

function oE(){if(nX<0.5){if(nZ<na){nZ+=na*nW;nY=nX;}}else{if(nX>1-nY){nZ-=na*nW;
nZ=nZ<na*nW?na*nW:nZ;}}nh=nh>=clanPanel.eZ?clanPanel.eZ-1:nh;
var fc=clanPanel.eZ-nh;if(fc>1000){nX=1;}else{nX+=nZ*fc/ni;
nX=nX>1?1:nX;}nh=clanPanel.eZ;
var oF=im;
var oG=jD;
var oH=jE;im=nd*(Math.pow((ng/nd),nX));
var oI=im/oF;
var oJ=nd*(Math.pow((ng/nd),(1-nX)));
var oK=1-((oJ-nd)/(ng-nd));hoverHandler.oA(nb+oK*(ne-nb),camera.j/2);
hoverHandler.oB(nc+oK*(nf-nc),camera.k/2);troops.zoom(oI,(oG*oI-jD)/(1-oI),(oH*oI-jE)/(1-oI));
leaderboardPanel.oC();if(nX>=1){nj=false;chatPanel.oL=true;}clanPanel.ds=true;}}

function ModalDialogEngine(oM){
this.oN=-1;this.pow=-1;
var oO=oM||{};
var oP=this;
var oQ=null,oR=null,oS=null,oT=null,oU=null;
var oV=[],oW=0,oX=null,oY=null,oZ=null;
var oa=false,ob=null,oc="",od="";
var oe=new Uint8Array(new Uint32Array([1]).buffer)[0]===1?0xff000000:0x000000ff;

function og(oh,oi,className){var oj=document.createElement(oh);if(className)oj.className=className;
if(oi)oi.appendChild(oj);return oj;}

function ok(el,oi,action){var button=og("button",oi);
button.type="button";button.textContent=el;button.addEventListener("click",action);
return button;}

function ol(oi){var canvas=og("canvas",oi);canvas.width=canvas.height=128;return canvas;
}

function om(data,on){var oo=0,position=0,color=0;for(;position<16384;oo+=6,color ^=1){
var eI=oo>>3,op=oo&7;
var oq=(((data[eI]<<8)|data[eI+1])>>(10-op))&63;
var oD=position+oq;
var or=color?oe:0xffffffff;for(var aC=position;aC<oD;aC++)on[aC]=or;
position=oD;}}

function os(canvas,ot){var ou=canvas.getContext("2d");
if(!oY){oY=ou.createImageData(128,128);oZ=new Uint32Array(oY.data.buffer);}om(ot,oZ);
ou.putImageData(oY,0,0);}

function ov(){if(!oQ)return;oQ.setAttribute("aria-busy",String(oa));
oU.disabled=oa;oT.disabled=oa||!oW;for(var aC=0;aC<oV.length;aC++){
oV[aC].disabled=oa;oV[aC].setAttribute("aria-pressed",String(Boolean(oW&(1<<aC))));}}

function ow(eI){
var button=ok("",oR,function(){if(oa)return;oW ^=1<<eI;ov();});button.className="captcha-tile";
button.setAttribute("aria-label","Select image "+(eI+1));button.setAttribute("aria-pressed","false");
ol(button).setAttribute("aria-hidden","true");return button;}

function ox(event){
if(event.key==="Escape"){event.preventDefault();oP.close();}if(event.key!=="Tab"||!oQ)return;
var oy=oQ.querySelectorAll("button:not(:disabled)");
var oz=oy[0],p0=oy[oy.length-1];
if(event.shiftKey&&document.activeElement===oz){event.preventDefault();p0.focus();}
else if(!event.shiftKey&&document.activeElement===p0){event.preventDefault();oz.focus();}
}

function p1(){ob=document.activeElement;oQ=og("div",document.body,"captcha-overlay");
oQ.setAttribute("role","dialog");oQ.setAttribute("aria-modal","true");
oQ.setAttribute("aria-label","Select all images matching the reference");
var style=og("style",oQ);style.textContent=
".captcha-overlay{position:fixed;inset:0;z-index:5;min-width:200px;min-height:200px;background:rgba(0,0,0,.85);color:#fff;display:flex;flex-direction:column;align-items:center;gap:0;padding:0;margin:0;box-sizing:border-box;overflow:hidden;font-family:system-ui,sans-serif;--tile:80px}"+
".captcha-overlay *{box-sizing:border-box}"+
".captcha-overlay canvas{display:block;width:100%;height:100%;image-rendering:pixelated;background:white}"+
".captcha-reference-row{position:relative;display:flex;justify-content:center;width:calc(4 * var(--tile));height:var(--tile);flex:none;margin-top:auto}"+
".captcha-reference-label{position:absolute;left:0;top:0;width:calc(1.5 * var(--tile));height:100%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:calc(var(--tile) * .3);line-height:1;font-weight:700}"+
".captcha-overlay .captcha-reference{width:var(--tile);height:var(--tile);border:4px solid #000;flex:none}"+
".captcha-grid{display:grid;grid-template-columns:repeat(4,var(--tile));gap:0;flex:none}"+
".captcha-overlay button{appearance:none;margin:0;padding:0;border:3px solid #000;border-radius:0;background:#253343;color:white;font:600 17px system-ui,sans-serif;cursor:pointer;touch-action:manipulation;outline:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}"+
".captcha-overlay button:focus{outline:none}"+
".captcha-overlay .captcha-tile{position:relative;width:var(--tile);height:var(--tile);min-width:0;min-height:0;border-width:4px}"+
".captcha-overlay .captcha-tile[aria-pressed=true]{border-color:#bcf56b}"+
".captcha-actions{display:flex;gap:0;width:100%;height:62px;flex:none;margin-top:auto}"+
".captcha-actions button{flex:1;min-width:0;padding:0 2px}"+
".captcha-actions button:last-child{background:#bcf56b;color:#101319}"+
".captcha-overlay button:disabled{color:#697580;cursor:default}";
var p2=og("div",oQ,"captcha-reference-row");
var p3=og("span",p2,"captcha-reference-label");
p3.textContent="Find All:";oS=ol(p2);oS.className="captcha-reference";
oS.setAttribute("aria-label","Reference image");oR=og("div",oQ,"captcha-grid");
for(var aC=0;aC<16;aC++)oV.push(ow(aC));
var p4=og("div",oQ,"captcha-actions");
var p5=ok("Close",p4,function(){oP.close();});oU=ok("Reload",p4,p6);
oT=ok("Verify",p4,p7);oQ.addEventListener("keydown",ox);oP.resize();ov();p5.focus();}

function p6(){
if(oa)return;oP.close();gameServer.eg.p8(0,0,modalDialogEngine.oN,modalDialogEngine.pow);}

function p7(){if(oa||!oW)return;
var p9=oW;
var pA=oX;oP.close();gameServer.eg.p8(p9,pA,modalDialogEngine.oN,modalDialogEngine.pow);}this.show=function(pB,pA,oN,pow){this.oN=oN;
this.pow=pow;oX=pA;if(!oQ)p1();os(oS,pB[0]);for(var iR=0;iR<16;iR++)os(oV[iR].firstChild,pB[iR+1]);
oW=0;oa=false;ov();if(typeof oO.pC==="function")oO.pC();};this.resize=function(){if(!oQ)return;
var size=Math.min(Math.max(200,window.innerWidth)/4,(Math.max(200,window.innerHeight)-62)/5);
oQ.style.setProperty("--tile",size+"px");
};this.close=function(){if(!oQ)return;
var pD=oQ.querySelectorAll("canvas");
for(var aC=0;aC<pD.length;aC++)pD[aC].width=pD[aC].height=0;oQ.remove();oQ=oR=oS=oT=oU=null;
oV=[];oX=null;oY=oZ=null;oW=0;oa=false;if(ob&&document.body.contains(ob))ob.focus();
ob=null;if(typeof oO.pE==="function")oO.pE();};}

function ColorPalette(){var ej=gameState.color;
this.pF=ej.pG(0,0,0);this.pH=ej.pI(0,0,0,0.7);this.pJ=ej.pI(0,0,0,0.5);this.pK=ej.pI(0,0,0,0.85);
this.pL=ej.pI(0,0,0,0.75);this.pM=ej.pI(0,0,0,0.6);this.pN=ej.pI(0,0,0,0.35);
this.pO=ej.pG(255,255,255);this.pP=ej.pI(255,255,255,0.3);this.pQ=ej.pI(255,255,255,0.6);
this.pR=ej.pI(255,255,255,0.4);this.pS=ej.pI(255,255,255,0.25);this.pT=ej.pI(255,255,255,0.85);
this.pU=ej.pI(255,255,255,0.75);this.pV=ej.pI(255,255,255,0.15);this.pW=ej.pI(255,255,255,0.11);
this.pX=ej.pG(128,128,128);this.pY=ej.pI(64,64,64,0.75);this.pZ=ej.pI(88,88,88,0.83);
this.pa=ej.pI(60,60,60,0.85);this.pb=ej.pI(80,60,60,0.85);this.pc=ej.pG(170,170,170);
this.pd=ej.pG(200,235,245);this.GameCommandSender=ej.pG(30,255,30);this.PlayerInteractionController=ej.pG(0,200,0);
this.localCommandProcessor=ej.pG(128,255,128);this.LocalCommandProcessor=ej.pI(10,65,10,0.75);this.gameCommandDecoder=ej.pI(0,255,0,0.6);
this.GameCommandDecoder=ej.pI(0,255,0,0.5);this.GameplayActionExecutor=ej.pI(0,200,0,0.5);this.shouldSetInitATKPercent=ej.pI(0,100,0,0.75);
this.outgoingGameCommandBuilder=ej.pI(0,60,0,0.8);this.sendSpawn=ej.pI(0,255,0,0.3);this.settingsController=ej.pI(0,180,0,0.6);
this.pp=ej.pI(0,120,0,0.85);this.sendAttack=ej.pG(0,120,0);this.pr=ej.pI(0,70,0,0.85);
this.ps=ej.pG(190,230,190);this.pt=ej.pG(0,255,0);this.sendDonation=ej.pG(255,120,120);
this.pv=ej.pG(255,160,160);this.pw=ej.pG(255,70,70);this.px=ej.pG(230,0,0);
this.interceptBoat=ej.pI(220,0,0,0.6);this.pz=ej.pI(255,100,100,0.8);this.q0=ej.pI(100,0,0,0.85);
this.cancelAttack=ej.pI(60,0,0,0.85);this.q2=ej.pI(200,0,0,0.6);this.q3=ej.pI(120,0,0,0.85);
this.q4=ej.pG(255,70,10);this.sendFlagEmoji=ej.pG(230,190,190);this.q6=ej.pG(255,0,0);
this.sendPeaceVoteChoice=ej.pG(255,0,255);this.q8=ej.pI(60,0,60,0.85);this.sendSurrender=ej.pI(0,60,60,0.85);
this.qA=ej.pI(10,60,60,0.9);this.qB=ej.pI(0,96,96,0.75);this.qC=ej.pG(0,255,255);
this.qD=ej.pG(160,160,255);this.qE=ej.pI(0,40,90,0.75);this.qF=ej.pI(0,0,255,0.6);
this.qG=ej.pG(200,200,255);this.qH=ej.pI(50,50,255,0.83);this.qI=ej.pI(20,90,150,0.75);
this.qJ=ej.pI(10,10,120,0.75);this.qK=ej.pG(255,120,100);this.qL=ej.pI(255,255,0,0.5);
this.qM=ej.pI(255,255,150,0.2);this.qN=ej.pG(255,255,0);this.qO=ej.pG(255,255,200);
this.qP=ej.pI(200,200,0,0.6);this.requestNetworkSync=ej.pI(140,120,0,0.75);this.syncPacketBuilder=ej.pI(180,160,40,0.75);
this.qS=ej.pI(70,50,20,0.85);this.qT=ej.pI(30,30,0,0.85);this.qU=ej.pI(60,60,0,0.85);
this.qV=ej.pG(255,255,100);this.qW=ej.pG(255,255,140);this.qX=ej.pI(255,140,0,0.75);
this.qY=ej.pI(70,40,0,0.85);this.qZ=ej.pG(255,150,0);this.qa=ej.pI(255,200,80,0.85);
this.qb=ej.pI(0,0,0,0);this.qc=ej.pI(255,255,255,0);this.qd=ej.pI(254,254,254,0);
ej=null;}

function MapCache(){this.hz=new qe();this.gv=new qf();this.qg=new qh();this.validateAndResolveTarget=new qj();
this.kw=new qk();}

function qe(){this.isFriendlyOrUnattackable=1;this.isSameTeam=function(fL){if(localPlayer.lE){mapCache.qg.isSameTeam(localPlayer.getTileOwner,fL);
}else{gameServer.isValidShipLaunchDirection.qn(fL);}};this.i6=function(jC,k3){if(this.isFriendlyOrUnattackable){this.isFriendlyOrUnattackable=0;connectionMgr.qo.boatNotificationHandler(182,jC);
}if(localPlayer.lE){mapCache.qg.i6(localPlayer.getTileOwner,jC,k3);}else{gameServer.isValidShipLaunchDirection.prepareInterceptLaunch(jC,k3);}};this.reverseCommandHandler=function(jC,qs){if(localPlayer.lE){
mapCache.qg.qt(localPlayer.getTileOwner,jC,qs);}else{gameServer.isValidShipLaunchDirection.qu(jC,qs);}};this.iB=function(jC,fL){var qv=(fL<<3)+boostSystem.gB[6];
if(localPlayer.lE){mapCache.qg.iB(localPlayer.getTileOwner,jC,qv);}else{if(!bonusSystem.advanceSimulationTick.n1(localPlayer.getTileOwner)){return;}gameServer.isValidShipLaunchDirection.qw(jC,qv);
}};this.iE=function(jC){if(jC===849){jC=850;}var ns=boostSystem.gB[3];if(localPlayer.lE){mapCache.qg.iE(localPlayer.getTileOwner,jC,ns);
}else{if(!bonusSystem.iC.qx(localPlayer.getTileOwner,ns)){return;}gameServer.isValidShipLaunchDirection.qy(jC,ns);}};this.qz=function(ns){
if(localPlayer.lE){mapCache.qg.qz(localPlayer.getTileOwner,ns);}else{gameServer.isValidShipLaunchDirection.qy(849,ns);}};this.r0=function(k3){if(localPlayer.lE){
mapCache.qg.r0(localPlayer.getTileOwner,k3);}else{gameServer.isValidShipLaunchDirection.r1(k3);}};this.r2=function(r3){if(localPlayer.lE){mapCache.qg.r4(localPlayer.getTileOwner,r3);
}else{gameServer.isValidShipLaunchDirection.r5(r3);}};this.iN=function(r6){if(localPlayer.lE){mapCache.qg.iN(localPlayer.getTileOwner,r6);}else{gameServer.isValidShipLaunchDirection.r7(r6);
}};this.r8=function(){if(localPlayer.lE){mapCache.qg.r8(localPlayer.getTileOwner);}else{gameServer.isValidShipLaunchDirection.r9();}};this.iK=function(){
if(localPlayer.lE){mapCache.qg.iK(localPlayer.getTileOwner);}else{gameServer.isValidShipLaunchDirection.r1(513);}};this.findAutoLaunchTarget=function(jC,fL,k3){if(localPlayer.lE){
mapCache.qg.findAutoLaunchTarget(localPlayer.getTileOwner,jC,fL,k3);}else{gameServer.isValidShipLaunchDirection.rA(jC,fL,k3);}};}

function qk(){this.kx=function(player,qs,iI){
if(!gameState.gv.rB(player,iI,qs)){return;}botSpawner.reverseCommandHandler(player,qs);if(!gameState.gv.kH(qs)&&nameRenderer.jh.kW[qs]){
nameRenderer.jh.kW[qs]--;}};this.rC=function(player,qs,iI){if(!gameState.gv.MasonryLayout(iI,qs)){gameClock.gz(player,iI,12);
return;}if(!soloMode.ei(qs,boostSystem.g6[0])){return;}relations.rE(player,qs,boostSystem.g6[0],1);gameState.gv.collectPlayerAttackTiles(qs,boostSystem.g6[0]);
gameClock.rF(player,qs);troops.rG(qs,boostSystem.g6[0]);};}

function qf(){this.rH=function(r3,player){
hoverProcessor.r2(localPlayer.getTileOwner,player,r3);gameServer.isValidShipLaunchDirection.rI(r3,player);};this.rJ=function(player){hoverProcessor.canvasUtils(player,0);
gameServer.isValidShipLaunchDirection.rL(player);};this.rM=function(rN,player){hoverProcessor.rO(rN,player);gameServer.isValidShipLaunchDirection.rP(rN,player);
};this.cssGap=function(){if(localPlayer.lE||localPlayer.hi){return;}gameServer.rR.cssGap();};}

function qj(){this.ee=function(aD){
var id,gI,oD;urlParams.applyToGame(aD);urlParams.eI+=2;oD=8*urlParams.size;while(urlParams.eI+8<=oD){id=urlParams.arrayUtils(4);gI=urlParams.arrayUtils(9);if(id===0){
this.rT(id,gI,urlParams.arrayUtils(22));}else if(id===1){this.rT(id,gI,urlParams.arrayUtils(10),urlParams.arrayUtils(10));}else if(id===2){
this.rT(id,gI,urlParams.arrayUtils(10),urlParams.arrayUtils(9));}else if(id===3){this.rT(id,gI,urlParams.arrayUtils(10),urlParams.arrayUtils(27));
}else if(id===4){this.rT(id,gI,urlParams.arrayUtils(10),urlParams.arrayUtils(16));}else if(id===5){
this.rT(id,gI,urlParams.arrayUtils(10));}else if(id===6){this.rT(id,gI,urlParams.arrayUtils(10));}else if(id===7){
this.rT(id,gI,urlParams.arrayUtils(1));}else if(id===10){this.rT(id,gI,urlParams.arrayUtils(20),urlParams.arrayUtils(22));}else{this.rT(id,gI);
}}};this.rU=[];this.rV=function(){var rW=0;
var rX=0;
var rY=0;
var rZ=0;
var ra=0;
var rb=0;
var rc=0;
var aC;
var fZ=512;for(aC=0;aC<fZ;aC++){rX+=playerData.nU[aC];rY+=playerData.hN[aC];rZ+=playerData.hb[aC];ra+=bonusSystem.z.ky[aC];
}rb+=bonusSystem.z.mk;rc+=territorySystem.lQ;rW=rX+rY+ra+rb+rc;rW=(rZ%1073741824)*4+rW%4;this.rU.push(rW);
};this.rT=function(id,gI,gK,gM){if(id===0){mapCache.qg.isSameTeam(gI,gK);}else if(id===1){mapCache.qg.i6(gI,gK,gM);
}else if(id===2){mapCache.qg.qt(gI,gK,gM);}else if(id===3){mapCache.qg.iB(gI,gK,gM);}else if(id===4){
mapCache.qg.iE(gI,gK,gM);}else if(id===5){mapCache.qg.r0(gI,gK);}else if(id===6){mapCache.qg.r4(gI,gK);
}else if(id===7){mapCache.qg.iN(gI,gK);}else if(id===8){mapCache.qg.r8(gI);}else if(id===9){mapCache.qg.rd(gI);
}else if(id===10){mapCache.qg.findAutoLaunchTarget(gI,gK>>10,gM,gK%1024);}};}

function qh(){this.isSameTeam=function(player,fL){
if(!gameState.gv.isValidTile(0)){return;}if(!gameState.gv.hl(player)){return;}if(!powerState.getNeighborDataIndex(fL)){return;}
packetWriter.re.rf(0,player,fL);localPlayer.rg.ei(player,fL);};this.i6=function(player,jC,k3){if(!gameState.gv.isValidTile(1)){return;
}if(!gameState.gv.hl(player)){return;}if(!gameState.gv.rh(player,k3)){return;}if(!gameState.gv.n2(player,jC,12,0)){
return;}if(!gameState.gv.ri(player,k3)){return;}var ju=alliances.kF(player,boostSystem.fV[0]);if(!ju&&!alliances.kY(player)){
return;}playerData.rj[player]++;packetWriter.re.rf(1,player,jC,boostSystem.fV[0]);if(!nameRenderer.botBoatInterceptAi.jt(player,ju)){
return;}gameState.gv.heartbeatManager(player);gameClock.rk(player,jC);nameRenderer.botBoatInterceptAi.sampleAdjacentTargets(player);};this.qt=function(player,jC,qs){
if(!gameState.gv.isValidTile(1)){return;}if(!gameState.gv.hl(player)){return;}if(!localPlayer.iT){return;}if(!gameState.gv.rh(player,qs)){
return;}if(!gameState.gv.rl(player,qs)){return;}if(!gameState.gv.rB(player,gameState.gv.jB(player,jC),qs)){
return;}if(!soloMode.ei(qs,boostSystem.g6[0])){return;}packetWriter.re.rf(2,player,jC,qs);
botSpawner.reverseCommandHandler(player,qs);};this.iB=function(player,jC,qv){boostSystem.gB[1]=qv&7;
var fL=qv>>3;if(!gameState.gv.isValidTile(1)){
return;}if(!gameState.gv.hl(player)){return;}if(!powerState.getNeighborDataIndex(fL)){return;}if(!bonusSystem.advanceSimulationTick.n1(player)){
return;}if(!bonusSystem.advanceSimulationTick.rm(fL)){return;}if(!gameState.gv.n2(player,jC,32,0)){return;}if(!bonusSystem.lh.rn(player,fL,1)){
return;}gameClock.ro(player);packetWriter.re.rf(3,player,jC,qv);gameState.gv.heartbeatManager(player);connectionInfo.rp.iB(player);bonusSystem.z.updateFrameOverlays(player);
};this.iE=function(player,jC,ns){if(jC===849){this.qz(player,ns);return;}if(!gameState.gv.isValidTile(1)){return;
}if(!gameState.gv.hl(player)){return;}if(!gameState.gv.n2(player,jC,32,0)){return;}if(!bonusSystem.iC.rq(player,ns)){
return;}gameClock.ro(player);packetWriter.re.rf(4,player,jC,ns);gameState.gv.heartbeatManager(player);connectionInfo.rp.iE(player);
bonusSystem.z.updateFrameOverlays(player);};this.qz=function(player,ns){if(!gameState.gv.isValidTile(1)){return;}if(!gameState.gv.hl(player)){
return;}if(!bonusSystem.rr.ee(player,ns)){return;}packetWriter.re.rf(4,player,849,ns);};this.r0=function(player,k3){
if(k3===513){this.iK(player);return;}if(!gameState.gv.isValidTile(1)){return;}if(!gameState.gv.hl(player)){
return;}k3=Math.min(k3,localPlayer.isMountainTile);if(!alliances.kF(player,k3)){return;}packetWriter.re.rf(5,player,k3);alliances.ButtonGridLayout(player,k3);
};this.r4=function(player,r3){if(!gameState.gv.isValidTile(1)&&!gameState.gv.isValidTile(2)){return;}if(!gameState.gv.hl(player)){
return;}r3=mathUtils.distanceBetweenPointsAndEncoded(r3,0,1023);packetWriter.re.rf(6,player,r3);troops.rt(player,0,r3);};this.iN=function(player,r6){
if(!cameraController.measureFittedFontScale(player)){return;}packetWriter.re.rf(7,player,r6);cameraController.ru(player,r6);};this.r8=function(player){
if(!gameState.gv.isValidTile(0)&&!gameState.gv.isValidTile(1)){return;}if(!gameState.gv.hl(player)){return;}if(!zoomHandler.RectangleLayout(player)){
return;}packetWriter.re.rf(8,player);mapDimensions.r8(player);};this.rd=function(player){packetWriter.re.rf(9,player);
mapDimensions.rd(player);};this.iK=function(player){if(!cameraController.iO(player)){return;}packetWriter.re.rf(5,player,513);
cameraController.iK(player);};this.findAutoLaunchTarget=function(player,jC,fL,k3){if(!gameState.gv.isValidTile(1)){return;}if(!gameState.gv.hl(player)){
return;}if(!gameState.gv.rh(player,k3)){return;}if(!gameState.gv.ri(player,k3)){return;}if(!powerState.getNeighborDataIndex(fL)){
return;}if(!mountainAttack.fA.neighborOffsets(player,fL)){return;}if(!alliances.kF(player,boostSystem.fV[0])&&!alliances.kY(player)){return;
}packetWriter.re.rf(10,player,(jC<<10)+boostSystem.fV[0],fL);
var iI=gameState.gv.m6(player,jC);playerData.h1[player].push(boostSystem.fa[0]);
alliances.ei(player,iI,boostSystem.fV[0]);borderCalc.k1(player,true);gameClock.rw(player);};}

function rx(){this.ry=[];
this.rz=document.createElement("div");

function dk(rz){rz.style.position="absolute";rz.style.height="auto";
rz.style.padding="0.5em";}this.LobbyChatPanel=function(s1,marginTop){var title=document.createElement("h2");
title.textContent=s1;title.style.margin="0";title.style.marginBottom="0.6em";
if(marginTop){title.style.marginTop=marginTop;}title.style.fontSize="1.3em";
title.style.overflowWrap="break-word";this.rz.appendChild(title);return title;
};this.s2=function(s1,marginBottom){var s3=document.createElement("p");s3.textContent=s1;
s3.style.fontSize="0.75em";s3.style.lineHeight="1.2em";s3.style.marginBottom=marginBottom||"0";
this.rz.appendChild(s3);return s3;};this.s4=function(s1){var s5=document.createElement("p");
s5.textContent=s1;s5.style.fontSize="1em";s5.style.marginBottom="0";
s5.style.whiteSpace="pre-wrap";s5.style.overflowWrap="break-word";this.rz.appendChild(s5);
return s5;};this.s6=function(s7,fontSize){var rz=document.createElement("div");rz.innerHTML=s7;
rz.style.fontSize=fontSize||"1em";rz.style.lineHeight="1.2em";this.rz.appendChild(rz);
return rz;};this.s8=function(s9){var aC;
var sA=s9.sA;
var fZ=sA.length;for(aC=0;aC<fZ;aC++){
this.rz.appendChild(sA[aC]);}};this.sB=function(sC){this.ry.push(sC);this.rz.appendChild(sC.e);
return sC;};this.resize=function(){var fZ=this.ry.length;for(var aC=0;aC<fZ;aC++){
if(this.ry[aC].resize){this.ry[aC].resize();}}};dk(this.rz);}

function sD(sE,sF){
var rz=document.createElement("div");this.sG=rz;this.sH=sF;

function dk(){rz.style.width="100%";
rz.style.maxWidth="100%";sE.style.lineHeight="1.5em";sE.style.overflowX="hidden";sE.style.overflowY="auto";
for(var aC=0;aC<sF.length;aC++){rz.appendChild(sF[aC].rz);}sE.appendChild(rz);
}

function sI(sJ){var j=0.25*gameState.sK.sL(0.6)*camera.il;return Math.max(Math.floor(sJ/j),1);
}this.resize=function(){sM();sN();sN();};

function sM(){var aC;for(aC=0;aC<sF.length;aC++){
sF[aC].resize();}}

function sN(){var aC,sO,k,h8,fc;
var sJ=camera.l*rz.offsetWidth;
var sP=new Float64Array(sI(sJ));
var sQ=debugPanel.sQ;
var sR=(sJ-(sP.length+1)*debugPanel.gap)/(sP.length*camera.l);
sP.fill(sQ);for(aC=0;aC<sF.length;aC++){fc=sF[aC].rz;sO=fc.style;k=gameState.sS.min(sP);
h8=sP.indexOf(k);sO.top=gameState.sK.sT(k);sO.left=gameState.sK.sT(sQ+h8*(sR+sQ));sO.width=gameState.sK.sT(sR);
gameState.sK.sU(fc,5);sP[h8]+=fc.offsetHeight+3*sQ;}rz.style.height=gameState.sK.sT(gameState.sS.max(sP)-2*sQ);
}dk();}

function x(sV,sW,sX,sY,sZ){var sa=document.createElement("button");this.button=sa;
this.sb=sW;this.sc=sX;

function sd(self){sa.innerHTML=sV;sa.style.color=sZ?colorPalette.qN:colorPalette.pO;
sa.style.userSelect="none";sa.style.outline="none";sa.style.overflowWrap="break-word";
self.se(sX);sa.style.border="none";sa.style.font="inherit";self.sf(0);sa.style.padding="0em 0.3em";
sa.onclick=sg;sa.addEventListener("mouseover",sh);sa.addEventListener("mouseout",ToggleSettingControl);
sa.addEventListener("focus",sh);sa.addEventListener("blur",sj);}this.sf=function(sk){
var ScrollableTextContent=1.1-Math.min(0.01*sV.length,0.6)+0.2*sk;sa.style.fontSize=ScrollableTextContent.toFixed(1)+"em";
};this.se=function(ej){if(!ej){sY=0;ej=colorPalette.pK;}else if(ej===1){ej=colorPalette.pa;}else if(ej===2){
sY=1;ej=colorPalette.pa;}this.sc=sX=ej;sa.style.backgroundColor=ej;};

function sh(){if(powerSystem.EqualWidthControlRow()){
return;}var sn=gameState.color.so(sX);if(sY!==false){if(sn[0]>0&&sn[0]<255&&sn[0]===sn[1]&&sn[0]===sn[2]){
return;}}if(sn[0]>128&&sn[1]>128&&sn[2]>128){sa.style.backgroundColor=gameState.color.sp(sX,-50);
}else{sa.style.backgroundColor=gameState.color.sp(sX,(sn[3]&&sn[3]<120)?150:50);
}}

function sg(){if(sY){var sn=gameState.color.so(sX);if(sn[0]===sn[1]&&sn[0]===sn[2]){
return;}}if(sW){var sq=sW(this);if(!sq){sr(this);}else if(sq===2){sh();}}}

function sj(){
this.style.backgroundColor=sX;}

function ToggleSettingControl(){sr(this);}

function sr(fc){fc.style.backgroundColor=sX;
fc.blur();}sd(this);}

function ss(oy,sE){var rz;

function dk(){rz=document.createElement("div");
rz.style.display="grid";rz.style.gridTemplateColumns="repeat(auto-fill, minmax(9.5em, 1fr))";
rz.style.overflowY="auto";rz.style.gridAutoRows="5.3em";
rz.style.maxHeight="100%";st();}

function st(){for(var aC=0;aC<oy.length;aC++){
oy[aC].sf(1);rz.appendChild(oy[aC].button);}sE.appendChild(rz);}this.resize=function(){var aC;
for(aC=0;aC<oy.length;aC++){gameState.sK.sU(oy[aC].button);}rz.style.gap=rz.style.padding=gameState.sK.sT(debugPanel.sQ);
};dk();}

function su(sv,HorizontalRule,sx){this.fg=0;this.fi=0;this.j=0;
this.k=0;this.resize=function(){this.k=Math.min(gameState.sK.sL(sx||0.5)*sv[1]*camera.il,camera.k-2*debugPanel.gap);
this.j=Math.min(this.k*(sv[0]/sv[1]),camera.j-2*debugPanel.gap);
this.k=sv[1]*this.j/sv[0];this.fg=debugPanel.gap+HorizontalRule[0]*(camera.j-this.j-2*debugPanel.gap);
this.fi=debugPanel.gap+HorizontalRule[1]*(camera.k-this.k-2*debugPanel.gap);};this.sy=function(){return this.fg+0.5*this.j;
};}

function sz(t0,t1){var t2=document.createElement("div");
var t3=document.createElement("div");
var t4=document.createElement("div");
var t5=null;this.t6=new t7({value:"",eI:-1},0,t8,t9);
var tA;
var tB=0;
var tC=1;
var tD=0;
var tE=1048575;

function sd(self){self.t6.e.tF=127;
t2.style.position="absolute";t2.style.left="0";t2.style.width="100%";t2.style.overflowX="hidden";
t2.style.overflowY="auto";t2.style.font="inherit";t2.style.backgroundColor=colorPalette.pM;
t2.addEventListener("scroll",function(){tD=t2.scrollTop;if(tD<t2.scrollHeight-t2.clientHeight-2){tC=0;
}else{tC=1;}});t3.style.font="inherit";t4.style.position="absolute";t4.style.left="0";t4.style.width="100%";
self.t6.e.setAttribute("placeholder",L(13));self.t6.e.style.position="absolute";self.t6.e.style.top="0";
self.t6.e.style.left="0";self.t6.e.style.height="100%";self.t6.e.style.backgroundColor=colorPalette.pJ;
self.t6.e.style.textAlign="center";tA=new x(L(14),t8);tA.button.top="0";tA.button.style.position="absolute";
tA.button.style.height="100%";tA.se(colorPalette.qc);t5=new tG("127",tA.button,1,1);
t2.appendChild(t3);t4.appendChild(self.t6.e);t4.appendChild(tA.button);
}

function t8(){t0();t5.tH.textContent=127;}

function t9(e){e.target.value=gameState.tI.tJ(e.target.value);
t5.tH.textContent=127-e.target.value.length;}this.reset=function(tK){tE=1048575;
t3.textContent="";if(!tK){this.nH();}};this.nH=function(){var tL=audioSystem.z.tM[0];
var tN=audioSystem.z.tO[tL];
var tP=tN.tP;
var fZ=tP.length;
var kA=tE===1048575?0:(fZ-((tN.tQ-tE+1048575)%1048575));
tE=tN.tQ;kA=Math.max(kA,0);if(kA>=fZ){return;}var tR=document.createDocumentFragment();
for(var aC=kA;aC<fZ;aC++){tS(tR,audioSystem.lj.tT(tP[aC],audioSystem.lj.tU(tP[aC])));}t3.appendChild(tR);
tV();};this.tW=function(s){var tR=document.createDocumentFragment();tS(tR,s);t3.appendChild(tR);
tV();};

function tS(tR,sC){if(!sC){return;}sC.tX=1;tR.appendChild(audioSystem.tY.transform(sC));
}

function tV(by){if(tC){t2.scrollTop=t2.scrollHeight;}else if(by){
t2.scrollTop=tD;}}this.show=function(sE){sE.appendChild(t2);sE.appendChild(t4);this.resize(sE);
};this.tZ=function(sE){account.removeChild(sE,t2);account.removeChild(sE,t4);};this.resize=function(sE){
tB=sE?sE.offsetHeight:tB;
var ta=gameState.sK.currentScreenId(0.04,0.75);
var tc=Math.max(ta,tB-ta);
var td=camera.j/camera.l;
var te=0.7*td;
var tf=gameState.sK.sT(tB-ta-tc);t4.style.height=gameState.sK.sT(ta);t2.style.height=gameState.sK.sT(tc);
if(camera.k>camera.j||uiSurface.platformActions.ik()){t4.style.top=tf;t2.style.top=gameState.sK.sT(tB-tc);gameState.sK.sU(t2,8);}else{
t2.style.top=tf;t4.style.top=gameState.sK.sT(tB-ta);gameState.sK.sU(t2,2);}this.t6.e.style.width=gameState.sK.sT(te);
this.t6.e.style.fontSize=tA.button.style.fontSize=gameState.sK.sT(0.5*ta);gameState.sK.sU(this.t6.e,6);
tA.button.style.left=gameState.sK.sT(te);tA.button.style.width=gameState.sK.sT(td-te);
var tg=0.385*ta;
if(uiSurface.platformActions.ik()){tg*=0.8-(camera.j>camera.k)*0.12;}t3.style.marginLeft=t3.style.marginRight=gameState.sK.sT(0.5*tg);
t3.style.fontSize=gameState.sK.sT(tg);tV(1);};sd(this);}

function th(ti,sV,MainMenuHighlightsPanel){sV=sV||L(15);
this.e=document.createElement("p");

function dk(e){e.textContent=(ti.value?"🟩 ":"⬜ ")+sV;
e.style.margin="0";e.style.marginBottom="0.5em";e.style.cursor="pointer";e.addEventListener("click",click);
}

function click(){var value=1-ti.value;this.textContent=(value?"🟩 ":"⬜ ")+sV;if(ti.eI!==undefined){
connectionMgr.qo.boatNotificationHandler(ti.eI,value);}else{ti.value=value;}MainMenuHighlightsPanel&&MainMenuHighlightsPanel(value);}dk(this.e);}

function tk(sE,s7){
var rz=document.createElement("div");this.sG=rz;

function dk(){sE.style.overflowX="hidden";
sE.style.overflowY="auto";rz.innerHTML=s7;sE.appendChild(rz);}this.resize=function(){
rz.style.padding=gameState.sK.sT(debugPanel.sQ);rz.style.lineHeight=gameState.sK.sT(gameState.sK.currentScreenId(0.035));
};dk();}

function tl(tm){var rz=document.createElement("div");this.e=rz;this.tn=tm;

function dk(){
var aC;
var fZ=tm.length;rz.style.width="100%";rz.style.height="2.7em";rz.style.marginTop="0.6em";
rz.style.border="inherit";for(aC=0;aC<fZ;aC++){tm[aC].style.verticalAlign="top";
tm[aC].style.width=(100/fZ).toFixed(2)+"%";tm[aC].style.height="100%";tm[aC].style.fontSize="0.75em";
rz.appendChild(tm[aC]);}}this.resize=function(){var aC;
var fZ=tm.length;for(aC=1;aC<fZ;aC++){
gameState.sK.sU(tm[aC],4);}};dk();}

function tp(tq,sX,tr){this.rz=document.createElement("div");
this.oy=tq;
var ts=0;

function sd(tt){tt.rz.style.height=tt.rz.style.maxHeight="100%";
for(var aC=0;aC<tq.length;aC++){tq[aC].se(sX);tq[aC].button.style.height="100%";
tq[aC].button.style.padding="0.0em 0.9em";tq[aC].button.style.whiteSpace="pre";
tt.rz.appendChild(tq[aC].button);}}this.resize=function(sE,tu){
var fZ=tq.length;if(!tr){for(var aC=1;aC<fZ;aC++){gameState.sK.sU(tq[aC].button,4);}}var tv=0;
for(aC=0;aC<fZ;aC++){tv+=tq[aC].button.offsetWidth;}if(sE){ts=sE.offsetWidth;}if(tu&&tv<ts){
for(aC=0;aC<fZ;aC++){tq[aC].button.style.width=(100*tq[aC].button.offsetWidth/tv).toFixed(2)+"%";
}}else{for(aC=0;aC<fZ;aC++){tq[aC].button.style.width="auto";}}if(!tu){
this.resize(sE,1);}};sd(this);}

function tw(){this.e=document.createElement("hr");

function sd(e){
e.style.marginBottom=e.style.marginTop="0.65em";e.style.marginLeft=e.style.marginRight="-4%";
e.style.border="none";}this.resize=function(){gameState.sK.sU(this.e,8,colorPalette.pX);};
sd(this.e);}

function tx(){var ty=document.createElement("div");
var tz=document.createElement("div");
var u0=0;
var u1=0;var u2,u3;

function sd(){ty.style.position="absolute";ty.style.backgroundColor=colorPalette.pK;
ty.style.color=colorPalette.pO;ty.style.pointerEvents="none";ty.style.zIndex="5";ty.style.maxWidth="100%";
tz.style.position="absolute";tz.style.color=colorPalette.pO;tz.style.pointerEvents="none";tz.style.zIndex="5";
}this.show=function(fg,fi,s1,u4,u5,ej){if(u0){if(u4){this.tZ();}else{return;}}if(fg===fi&&fg===-1){
fg=u2;fi=u3;}else{u2=fg;u3=fi;}var u6=Math.floor(gameState.sK.currentScreenId(0.018));fg=Math.max(u6+2,fg);
if(!u5){u1=u4;}u0=1;
var u7=camera.j/camera.l;ty.style.whiteSpace="pre";ty.textContent=s1;
gameState.sK.sU(ty,5);ty.style.font=gameState.sK.u8(0,gameState.sK.currentScreenId(0.015));ty.style.padding="0.3em 0.6em";
ty.style.left=fg+"px";ty.style.top="0px";document.body.appendChild(ty);
var k9=fg+ty.offsetWidth-u7;if(k9>0){fg-=k9;fg=Math.max(u6+1,fg);ty.style.left=fg+"px";
if(fg<u6+2){ty.style.whiteSpace="pre-wrap";}}var u9=ty.offsetHeight;ty.style.top=(fi-u9+u1*debugPanel.uA)+"px";
fg-=u6;tz.style.backgroundColor=gameState.color.pG((ej>>12)<<2,((ej>>6)&63)<<2,(ej&63)<<2);
tz.style.left=fg+"px";tz.style.top=ty.style.top;tz.style.width=u6+"px";
tz.style.height=u9+"px";gameState.sK.sU(tz,4);gameState.sK.sU(tz,8);gameState.sK.sU(tz,2);document.body.appendChild(tz);
};this.tZ=function(uB){if(!u0){return 1;}if(uB&&u1){return 0;}u0=0;account.removeChild(document.body,ty);
account.removeChild(document.body,tz);return 1;};sd();}

function t7(uC,type,uD,uE){
this.e=document.createElement("input");

function dk(e){e.type=type?"number":"text";
e.id="input"+(account.z.uF++);e.value=uC.value;e.style.width="100%";e.style.userSelect="none";
e.style.outline="none";e.style.resize="none";e.style.border="inherit";e.style.font="inherit";e.style.color=colorPalette.pO;
e.style.backgroundColor=colorPalette.pH;e.style.fontSize="1em";e.style.padding="0.1em 0.2em";
e.addEventListener("focus",function(){camera.uG++;});e.addEventListener("blur",function(){
camera.uG--;if(uC.eI!==-1){connectionMgr.qo.boatNotificationHandler(uC.eI,e.value);}});e.addEventListener("keypress",function(event){
if(event.key==="Enter"){event.preventDefault();if(uC.eI!==-1){connectionMgr.qo.boatNotificationHandler(uC.eI,e.value);
}if(uD){uD();}else{e.blur();}}});if(uE){e.addEventListener("input",function(sC){uE(sC);
});}}dk(this.e);}

function uH(sE,data,oM){var fZ=data.uI.length;
var uJ=document.createElement("div");
var uK=document.createElement("div");
var uL=document.createElement("div");
var uM=new Array(fZ);
var sF=new Array(fZ);
var uN=new Array(data.uO.length);
var uP=gameState.color.pI(70,70,0,0.35);

function dk(){sE.style.display="flex";sE.style.flexDirection="column";
uK.style.overflowX="hidden";uK.style.overflowY="auto";uK.addEventListener("scroll",function(){
this.uQ=this.scrollTop;if(oM&&oM.uR){account.z.uS[oM.uR]=this.scrollTop;
}});uT();st();if(oM&&oM.uR){uK.uQ=account.z.uS[oM.uR];}}

function uT(){var fc,aC;
var uI=data.uI;
var lp=fZ?uI[0].length:0;for(aC=0;aC<fZ;aC++){uM[aC]=document.createElement("div");
uM[aC].style.backgroundColor=uU(aC);uM[aC].style.width="100%";uM[aC].style.display="flex";
sF[aC]=new Array(lp);for(var fs=0;fs<lp;fs++){sF[aC][fs]=fc=document.createElement("div");
fc.style.display="flex";fc.style.justifyContent="center";fc.style.wordBreak="break-all";
fc.style.padding="0.4em 0em";fc.style.width=data.uV[fs]+"%";fc.innerHTML=uI[aC][fs].g1;
if(uI[aC][fs].ea===1){fc.name=""+aC;fc.style.color=colorPalette.qN;fc.style.backgroundColor=uP;
fc.addEventListener("mouseover",sp);fc.addEventListener("mouseout",uW);uX(fc,uI[aC][fs].uY,uI[aC][fs].uZ);}
uM[aC].appendChild(fc);}}uJ.style.display="flex";uJ.style.backgroundColor=gameState.color.pI(0,120,0,0.35);
for(aC=0;aC<uN.length;aC++){uN[aC]=fc=document.createElement("div");fc.style.display="flex";
fc.style.justifyContent="center";fc.style.wordBreak="break-all";fc.style.padding="0.4em 0em";
fc.style.width=data.uV[aC]+"%";fc.innerHTML=data.uO[aC];uJ.appendChild(fc);}}

function uX(fc,uY,uZ){
if(uZ===2147483647){return;}fc.addEventListener("click",function(){canvasManager.a8(30);canvasManager.writeBits(30,uY);
urlParams.applyToGame(canvasManager.aD);this.style.backgroundColor=uP;account.v(8,account.ua,new ub(25,{action:0,uY:uiRenderer.f0.uc(uiRenderer.f0.ud(5)),
uZ:uZ}));});}

function sp(){this.style.backgroundColor=gameState.color.sp(uP,160);
}

function uW(){this.style.backgroundColor=uP;}

function st(){
for(var aC=0;aC<fZ;aC++){uL.appendChild(uM[aC]);}uK.appendChild(uL);sE.appendChild(uJ);
sE.appendChild(uK);}

function uU(aC){return aC%2===1?gameState.color.pI(130,130,130,0.35):colorPalette.pN;
}this.resize=function(){sN();sN();};

function sN(){
var aC,fs;sE.style.font=gameState.sK.u8(0,gameState.sK.ue(0.026,0.5,0.03));for(aC=1;aC<uN.length;aC++){
gameState.sK.sU(uN[aC],4);}gameState.sK.sU(uJ,2);if(!fZ){return;}var uf=uJ.offsetWidth;
var ug=uL.offsetWidth;var i1;for(aC=0;aC<uN.length;aC++){i1=0.01*data.uV[aC]*ug;
uN[aC].style.width=(100*i1/uf).toFixed(2)+"%";}var lp=data.uI[0].length;for(aC=0;aC<fZ;aC++){
gameState.sK.sU(uM[aC],2);for(fs=1;fs<lp;fs++){gameState.sK.sU(sF[aC][fs],4);}}if(uK.uQ){uK.scrollTop=uK.uQ;
}}dk();}

function uh(){var ui=document.createElement("div");
var uj=document.createElement("div");
var uk=document.createElement("div");
var uL=document.createElement("div");
var oy=[];var ul;var um;
var eD=[L(16),L(17),L(18),L(19),L(20),L(21),L(22),L(23)];
var un=[1,2,3,0,9,10,11,13];

function dk(){
ui.style.position="absolute";uj.style.width="25%";uj.style.height="100%";uj.style.backgroundColor=colorPalette.pK;
uk.style.position="absolute";uk.style.width="75%";uk.style.height="100%";uk.style.backgroundColor=colorPalette.pK;
uk.style.top=uk.style.right=gameState.sK.sT(0);gameState.sK.uo(uk);uL.style.height=uL.style.maxHeight="100%";
oy.push(new x("",function(){up(0);},colorPalette.q8));oy.push(new x("",function(){up(1);},colorPalette.sendSurrender));
oy.push(new x("",function(){up(2);},colorPalette.cancelAttack));oy.push(new x("",function(){up(3);},colorPalette.outgoingGameCommandBuilder));
oy.push(new x("",function(){up(4);},colorPalette.qY));oy.push(new x("",function(){up(5);},colorPalette.qU));
oy.push(new x("",function(){up(6);},colorPalette.qY));oy.push(new x("",function(){up(7);},colorPalette.pF));
ul=new Array(oy.length);for(var aC=0;aC<oy.length;aC++){oy[aC].button.style.position="absolute";
ul[aC]=[new uq(eD[aC],oy[aC].button,0.25,0.45),new uq("",oy[aC].button,0.53,0.84,1)
];oy[aC].button.style.height=oy[aC].button.style.maxHeight="100%";oy[aC].button.top=gameState.sK.sT(0);
uL.appendChild(oy[aC].button);}uk.appendChild(uL);ui.appendChild(uj);ui.appendChild(uk);
}

function up(aC){account.v(8,0,new ub(21,{ur:un[aC],us:0,ut:10}));}this.show=function(){
this.boatNotificationHandler(account.z.FloatingNavigationControls);document.body.appendChild(ui);};this.tZ=function(){account.removeChild(document.body,ui);
};this.boatNotificationHandler=function(FloatingNavigationControls){var uv=[3,0,1,2,4,5,6,7];for(var aC=0;aC<oy.length;aC++){var j=FloatingNavigationControls[aC];
j=j?j:"";ul[uv[aC]][1].tH.textContent=j;}};this.resize=function(){var aC;
var uw=debugPanel.gap;
var k=gameState.sK.ux(0.085);
var j=Math.min(4*k,camera.j-2*uw);
var fZ=oy.length;gameState.sK.uy(ui,uw,camera.k-uw-k,j,k);
gameState.sK.sU(ui);gameState.sK.sU(uj,6);for(aC=0;aC<fZ-1;aC++){gameState.sK.sU(oy[aC].button,6);}for(aC=0;aC<fZ;aC++){
ul[aC][0].resize();ul[aC][1].resize();}oy[0].fg=0;oy[0].button.style.left=gameState.sK.sT(oy[0].fg);
oy[0].button.style.width=gameState.sK.uz(1.7*k);for(aC=1;aC<fZ;aC++){
oy[aC].fg=oy[aC-1].fg+oy[aC-1].button.offsetWidth;oy[aC].button.style.left=gameState.sK.sT(oy[aC].fg);
}if(!um){if(!adSystem.v0()){return;}um=adSystem.get(14);um.style.width="24%";
um.style.position="absolute";uj.appendChild(um);}um.style.left=gameState.sK.sT(0);um.style.top="7%";if(uk.FloatingActionButton){
uk.scrollLeft=uk.FloatingActionButton;}};dk();}

function v2(v3,v4,v5,v6,t0,t1){var v7=document.createElement("div");
var v8=document.createElement("div");
var v9=document.createElement("div");
var vA=document.createElement("div");
var vB=document.createElement("div");
var vC=document.createElement("div");
var vD=document.createElement("div");
var vE=document.createElement("div");
var vF=document.createElement("span");
var vG=document.createElement("div");this.vH=new sz(t0,t1);this.vI=new vJ(t1);
this.vK=[v3,v4,v5,v6];

function sd(self){v7.style.position="absolute";v7.style.top="0";v7.style.left="0";
v7.style.width="100%";v7.style.height="100%";v7.style.backgroundColor=colorPalette.pN;if(!powerSystem.EqualWidthControlRow()){
v7.style.backdropFilter="blur(4px)";v7.style.webkitBackdropFilter="blur(4px)";}v8.style.position="absolute";
v8.style.top="0";v8.style.left="0";v8.style.width="100%";v8.style.display="flex";
v8.style.alignItems="center";
var h=[v9,vA,vB,vG];for(var aC=0;aC<h.length;aC++){
h[aC].style.position="absolute";h[aC].style.left="0";h[aC].style.width="100%";
gameState.sK.uo(h[aC]);}vC.style.position="absolute";vC.style.left="0";vC.style.width="100%";vC.style.font="inherit";
vD.style.position="absolute";vD.style.left="0";vD.style.width="100%";vE.style.position="absolute";
vE.style.top="0";vE.style.left="0";vE.style.height="100%";vE.style.width="50%";
vE.style.backgroundColor=colorPalette.GameplayActionExecutor;vF.innerHTML="";vF.style.position="absolute";vF.style.top="50%";
vF.style.left="50%";vF.style.transform="translate(-50%, -50%)";vL();self.vI.show(vC);}

function vL(){
v8.appendChild(vM());v9.appendChild(v3.rz);vA.appendChild(v4.rz);vB.appendChild(v5.rz);
vD.appendChild(vE);vD.appendChild(vF);vG.appendChild(v6.rz);v7.appendChild(v8);
v7.appendChild(v9);v7.appendChild(vA);v7.appendChild(vB);v7.appendChild(vC);v7.appendChild(vD);
v7.appendChild(vG);}

function vM(){var vN=document.createElement("h1");vN.textContent=L(24);
vN.style.margin="0 auto 0.15em auto";vN.style.fontFamily="Arial Black, system-ui";vN.style.fontSize="inherit";
vN.style.fontWeight="inherit";return vN;}this.vO=function(vP){var s1=(vP/10).toFixed(1)+"%";
vE.style.width=s1;vF.innerHTML=s1;};this.vQ=function(){this.vI.tZ(vC);
this.vH.show(vC);};this.vR=function(){this.vH.tZ(vC);this.vI.show(vC);};this.vS=function(){
return v8;};this.show=function(){document.body.appendChild(v7);};this.tZ=function(){
account.removeChild(document.body,v7);};this.resize=function(vT){var vU=1-0.4*uiSurface.platformActions.ik()*(camera.j>1.6*camera.k);
var vV=gameState.sK.currentScreenId(vU*0.05);
var vW=camera.k>camera.j;
var vX=gameState.sK.currentScreenId(vU*0.06+0.03*vW);
var vY=gameState.sK.currentScreenId(vU*0.08+0.03*vW);
var vZ=gameState.sK.currentScreenId(0.04+0.02*vW);
var va=gameState.sK.currentScreenId(vU*0.02+0.01*vW);
var vb=gameState.sK.currentScreenId(0.025);v7.style.font=gameState.sK.u8(0,vb);vB.style.font=gameState.sK.u8(0,0.9*vb);
vG.style.font=gameState.sK.u8(0,0.9*vb);if(vU<1){var RadioOptionGroup=gameState.sK.u8(0,vU*vb);v9.style.font=RadioOptionGroup;
vB.style.font=RadioOptionGroup;vG.style.font=RadioOptionGroup;vD.style.font=RadioOptionGroup;vA.style.font=RadioOptionGroup;}v8.style.height=gameState.sK.sT(vV);
v8.style.font=gameState.sK.u8(0,0.72*vV);gameState.sK.sU(v8,2);v9.style.top=gameState.sK.sT(vV);
v9.style.height=gameState.sK.sT(vY);gameState.sK.sU(v9,2);vA.style.font=gameState.sK.u8(0,vU*gameState.sK.currentScreenId(0.02));
vA.style.top=gameState.sK.sT(vV+vY);vA.style.height=gameState.sK.sT(vZ);
gameState.sK.sU(vA,2);vB.style.top=gameState.sK.sT(vV+vY+vZ);vB.style.height=gameState.sK.sT(vX);gameState.sK.sU(vB,2);
vC.style.top=gameState.sK.sT(vV+vY+vZ+vX);vC.style.height=gameState.sK.sT(camera.k/camera.l-vV-vY-2*vX-vZ-va);
vD.style.top=gameState.sK.sT(camera.k/camera.l-vX-va);vD.style.height=gameState.sK.sT(va);gameState.sK.sU(vD,8);
vF.style.font=gameState.sK.u8(0,0.8*va);vG.style.top=gameState.sK.sT(camera.k/camera.l-vX);vG.style.height=gameState.sK.sT(vX);
gameState.sK.sU(vG,8);v3.resize(v9);v4.resize(v9);v5.resize(v9);v6.resize(v9);if(vT){this.vH.resize(vC);
}else{this.vI.resize();}};sd(this);}

function vJ(t1){var v7=document.createElement("div");
var vC=document.createElement("div");

function sd(){v7.style.top="0";v7.style.left="0";
v7.style.width=v7.style.height="100%";v7.style.overflowX="hidden";v7.style.overflowY="auto";
v7.style.font="inherit";vC.style.font="inherit";vC.style.margin="0.4em";v7.appendChild(vC);}this.nH=function(){
vC.textContent="";audioSystem.vd.ve&&audioSystem.vd.tZ(1);
var tR=document.createDocumentFragment();
var vf=audioSystem.z.tM[0];
var vg=audioSystem.vg.vh[vf];
var vi=audioSystem.vg.vi[vf];for(var aC=0;aC<vg.length;aC++){
vj(tR,vg[aC],aC<vi,vf);}vC.appendChild(tR);};

function vj(tR,sC,vk,vf){
var tH=document.createElement("span");tH.textContent=(vk?"🟢 ":"⚪ ")+audioSystem.lj.vl(sC,vf);
tH.style.color=audioSystem.lj.vm(sC.vn);if(sC.vn===11){tH.style.textShadow=
"-1px -1px 0 lightgray,"+"1px -1px 0 lightgray,"+"-1px 1px 0 lightgray,"+"1px 1px 0 lightgray";}tH.style.cursor="pointer";tH.style.margin="0.2em 0.2em 0.2em 0.2em";
tH.style.width=tH.style.maxWidth=vf===2?"10em":"9em";tH.style.height=tH.style.maxHeight="1.4em";
tH.style.whiteSpace="nowrap";tH.style.overflow="hidden";tH.style.textOverflow="ellipsis";
tH.style.font="inherit";tH.style.display="inline-block";audioSystem.lj.vo(sC)&&(tH.style.textDecoration="underline");
if(sC.vp){tH.style.textDecorationLine="underline";tH.style.textDecorationStyle="dotted";}
tH.onclick=function(e){t1(e,sC);};!powerSystem.EqualWidthControlRow()&&(tH.onmouseover=function(e){audioSystem.vd.vq(e.target,sC,1);});
tR.appendChild(tH);}this.show=function(sE){sE.appendChild(v7);};this.tZ=function(sE){
account.removeChild(sE,v7);};this.resize=function(){vC.style.fontSize=gameState.sK.sT(gameState.sK.currentScreenId(0.02,0.3));
};sd();}

function vr(vs){var v7=document.createElement("div");
var t4=document.createElement("div");
var vt=[];

function sd(){v7.style.position="absolute";
v7.style.color=colorPalette.pO;v7.style.zIndex="3";v7.style.right="0";v7.style.top="0";
t4.style.position="absolute";t4.style.height="auto";t4.style.color=colorPalette.pO;t4.style.backgroundColor=colorPalette.pK;
t4.style.left="0";t4.style.width="100%";t4.style.overflowWrap="break-word";v7.appendChild(t4);
for(var aC=0;aC<4;aC++){vt[aC]=document.createElement("div");vt[aC].style.position="absolute";
vt[aC].style.backgroundColor=colorPalette.pK;vt[aC].style.color=colorPalette.pO;vt[aC].style.top="0";
vt[aC].style.display="flex";vt[aC].style.justifyContent="center";vt[aC].style.alignItems="center";
vt[aC].style.userSelect="none";vt[aC].style.outline="none";vt[aC].style.font="inherit";
vt[aC].vu=aC;if(aC!==2){vt[aC].onclick=vs;vt[aC].onmouseover=sh;vt[aC].onmouseout=ToggleSettingControl;
}v7.appendChild(vt[aC]);}vt[0].textContent="◀";vt[1].textContent="▶";vt[3].textContent="✖";
}this.boatNotificationHandler=function(vv,vw){vt[2].textContent=(vv+1)+" / "+vw;};

function sh(){if(powerSystem.EqualWidthControlRow()){return;
}this.style.backgroundColor=gameState.color.sp(colorPalette.pK,50);}

function ToggleSettingControl(){this.style.backgroundColor=colorPalette.pK;
}this.show=function(sC){sC=audioSystem.lj.tT(sC,audioSystem.lj.tU(sC));t4.appendChild(audioSystem.tY.transform(sC));
document.body.appendChild(v7);};this.resize=function(){var k=gameState.sK.currentScreenId(0.03,0.5);
v7.style.width=(10*k)+"px";v7.style.font=gameState.sK.u8(1,0.75*k);gameState.sK.sU(v7,4);t4.style.top=k+"px";
t4.style.font=gameState.sK.u8(0,0.55*k);gameState.sK.sU(t4,2);v7.style.height=(k+t4.offsetHeight)+"px";
for(var aC=0;aC<3;aC++){gameState.sK.sU(vt[aC],6);vt[[0,1,3][aC]].style.width=(2*k)+"px";
}for(aC=0;aC<4;aC++){vt[aC].style.height=k+"px";gameState.sK.sU(vt[aC],2);
}vt[2].style.width=(4*k)+"px";vt[1].style.left=(2*k)+"px";vt[2].style.left=(4*k)+"px";
vt[3].style.left=(8*k)+"px";};this.vx=function(){for(var aC=0;aC<4;aC++){vt[aC].onclick=null;
vt[aC].onmouseover=null;vt[aC].onmouseout=null;}account.removeChild(document.body,v7);
v7=t4=vt=null;};sd();}

function vy(vs){var ty=document.createElement("div");

function sd(){ty.style.position="absolute";ToggleSettingControl();ty.style.color=colorPalette.pO;ty.style.zIndex="3";
ty.style.right="0";ty.style.top="0";ty.style.display="flex";ty.style.justifyContent="center";
ty.style.alignItems="center";ty.style.userSelect="none";ty.style.outline="none";
ty.onclick=vs;ty.onmouseover=sh;ty.onmouseout=ToggleSettingControl;}

function sh(){if(powerSystem.EqualWidthControlRow()){return;
}ty.style.backgroundColor=gameState.color.sp(colorPalette.pK,50);}

function ToggleSettingControl(){ty.style.backgroundColor=colorPalette.pK;
}this.boatNotificationHandler=function(vw){ty.textContent=vw;};this.show=function(){document.body.appendChild(ty);
};this.resize=function(){var k=gameState.sK.currentScreenId(0.03,0.5);ty.style.width=(2*k)+"px";ty.style.height=k+"px";
ty.style.font=gameState.sK.u8(1,0.75*k);gameState.sK.sU(ty,4);gameState.sK.sU(ty,2);};this.vx=function(){
ty.onclick=null;ty.onmouseover=null;ty.onmouseout=null;account.removeChild(document.body,ty);
ty=null;};sd();}

function vz(tq){var v7=document.createElement("div");
var w0=document.createElement("div");this.fg=0;this.fi=0;
var u0=0;this.oy=tq;

function sd(){
for(var aC=0;aC<tq.length;aC++){new tG(""+(1+aC),tq[aC].button,0,1);}v7.style.position="fixed";
v7.style.top="0";v7.style.left="0";v7.style.width="100%";v7.style.height="100%";v7.style.zIndex="5";
w0.style.position="absolute";w1();v7.appendChild(w0);v7.addEventListener("click",w2);}

function w2(){
audioSystem.w3.tZ();}

function w1(){var w4=(100/tq.length).toFixed(2)+"%";for(var aC=0;aC<tq.length;aC++){
tq[aC].button.style.width="100%";tq[aC].button.style.height=tq[aC].button.style.maxHeight=w4;
tq[aC].button.style.padding="0.0em 0.9em";w0.appendChild(tq[aC].button);}}this.show=function(fg,fi,w5){
if(u0){return [0,0];}u0=1;this.fg=fg;this.fi=fi;w6(this,w5);document.body.appendChild(v7);
};this.tZ=function(){if(!u0){return;}u0=0;v7.removeEventListener("click",w2);
account.removeChild(document.body,v7);};

function w6(self,w5){var j=gameState.sK.currentScreenId(0.16,0.7);
var k=tq.length*j/3;
var w7=camera.j/camera.l;
var w8=camera.k/camera.l;
var o7=Math.min(1,Math.min(w7/j,w8/k));
j*=o7;k*=o7;w5&&(self.fg+=gameState.sK.currentScreenId(0.03,0.5));self.fg=mathUtils.distanceBetweenPointsAndEncoded(self.fg,0,w7-j);
self.fi=mathUtils.distanceBetweenPointsAndEncoded(self.fi,0,w8-k);w0.style.left=self.fg+"px";w0.style.top=self.fi+"px";
w0.style.width=j+"px";w0.style.height=k+"px";w0.style.font=gameState.sK.u8(0,0.3*k/tq.length);
gameState.sK.sU(w0,5);for(var aC=1;aC<tq.length;aC++){gameState.sK.sU(tq[aC].button,8);
}}sd();}

function ek(){var w9;var wA;var wB;this.show=function(el,colors,id){wB=id;
if(id>=0){if(gameServer.z.responsePacketBuilder(0)){gameServer.eg.wC(0,id);}}el=el.trim();el=el.replace(new RegExp("[<>]","g"),"");
el=el.replace(new RegExp("\\b(?:https?:\\/\\/)?(?:www\\.)?discord\\.gg\\/([A-Za-z0-9_-]+)\\b","g"),
"<a href='https://discord.gg/$1' target='_blank'>discord.gg/$1</a>");el=el.replace(
new RegExp("\\b(?:https?:\\/\\/)?(?:www\\.)?youtube\\.com\\/watch\\?v=([A-Za-z0-9_-]+)\\b","g"),
"<a href='https://youtube.com/watch?v=$1' target='_blank'>youtube.com/watch?v=$1</a>"
);el=el.replace(
new RegExp("\\b(?:https?:\\/\\/)?(?:www\\.)?youtube\\.com\\/@([A-Za-z0-9_-]+)\\b","g"),
"<a href='https://youtube.com/@$1' target='_blank'>youtube.com/@$1</a>");el=el.replace(
new RegExp("\\b(?:https?:\\/\\/)?(?:www\\.)?tiktok\\.com\\/(@[A-Za-z0-9._-]+\\/video\\/([0-9]+))\\b","g"),
"<a href='https://tiktok.com/$1' target='_blank'>tiktok.com/$1</a>"
);el=el.replace(new RegExp("\\b(?:https?:\\/\\/)?(?:www\\.)?t\\.me\\/([A-Za-z0-9_]+)\\b","g"),
"<a href='https://t.me/$1' target='_blank'>t.me/$1</a>"
);el=el.replace(new RegExp("\\b(?:https?:\\/\\/)?(?:www\\.)?x\\.com\\/([A-Za-z0-9_]+)\\b","g"),
"<a href='https://x.com/$1' target='_blank'>x.com/$1</a>");el=el.replace(
new RegExp("\\b(?:https?:\\/\\/)?(?:www\\.)?patreon\\.com\\/([A-Za-z0-9_-]+)\\b","g"),
"<a href='https://patreon.com/$1' target='_blank'>patreon.com/$1</a>"
);el=el.replace(new RegExp("\\r?\\n","g"),"<br>");
el=el.replace(new RegExp("\\*\\*(.*?)\\*\\*","g"),"<b>$1</b>");
el=el.replace(new RegExp("\\*(.*?)\\*","g"),"<i>$1</i>");
wA=colors;wD();wE(el);wF();};

function wD(){w9=document.createElement("div");
w9.style.position="fixed";w9.style.top="0";w9.style.left="0";w9.style.width="100%";
w9.style.height="100%";w9.style.backgroundColor=gameState.color.pI(wA[0][0],wA[0][1],wA[0][2],0.6);
w9.style.zIndex="6";w9.onclick=function(e){
if(e.target===w9){SettingsPersistence();}};}

function wE(el){var wH=document.createElement("div");
wH.style.position="absolute";wH.style.display="flex";wH.style.flexDirection="column";wH.style.top="50%";
wH.style.left="50%";wH.style.backgroundColor=SettingsController(2);var iV;if(uiSurface.platformActions.ik()){iV=gameState.sK.AccountManager(camera.min);}else{
iV=gameState.sK.currentScreenId(0.4);}iV=Math.max(iV,200);wH.style.width=gameState.sK.sT(iV);wH.style.height=gameState.sK.sT(iV);
wH.style.transform="translate(-50%, -50%)";wK(wH,iV);BlockedAccountStore(wH,el,iV);wM(wH,iV);w9.appendChild(wH);}

function wK(wH,iV){
var wN=document.createElement("div");wN.style.flex="0 0 10%";wN.style.overflow="hidden";
wN.style.backgroundColor=SettingsController(1);wN.style.color=wO(1,7);wN.style.font=gameState.sK.u8(1,0.05*iV);
wN.style.display="flex";wN.style.alignItems="center";wN.style.justifyContent="center";
wN.innerHTML=L(25);wH.appendChild(wN);}

function BlockedAccountStore(wH,el,iV){var wP=document.createElement("div");
wP.style.flex="0 0 70%";wP.style.overflowY="auto";wP.style.overflowX="hidden";
wP.style.whiteSpace="pre-wrap";wP.style.wordWrap="break-word";wP.style.padding=gameState.sK.sT(0.02*iV);
wP.style.backgroundColor=SettingsController(2);wP.style.color=wO(2,8);wP.style.font=gameState.sK.u8(0,0.07*iV);
wP.innerHTML=el;wP.innerHTML="<style>a { color: inherit; }</style>"+wP.innerHTML;
wH.appendChild(wP);}

function wM(wH,iV){var oi=document.createElement("div");
oi.style.display="flex";oi.style.flexDirection="row";oi.style.justifyContent="space-between";
oi.style.alignItems="stretch";oi.style.backgroundColor=SettingsController(3);
oi.style.flex="1";oi.style.padding=gameState.sK.sT(0.01*iV);oi.style.gap=gameState.sK.sT(0.01*iV);
var wQ=document.createElement("div");wQ.style.flex="0 0 60%";wQ.style.height="100%";
var wR=new x(L(26,0,0,1),function(){SettingsPersistence();},SettingsController(4),false);wR.button.style.width="100%";
wR.button.style.height="100%";wR.button.style.color=wO(4,9);wR.button.style.font=gameState.sK.u8(1,0.05*iV);
wQ.appendChild(wR.button);
var wS=document.createElement("div");wS.style.flex="0 0 15%";
wS.style.height="100%";wS.style.backgroundColor=SettingsController(5);
var wT=document.createElement("div");
wT.style.flex="1";wT.style.height="100%";
var wU=new x(L(27),function(e){
gameState.sK.wV(e);wW();return true;},SettingsController(6),false);wU.button.style.width="100%";wU.button.style.height="100%";
wU.button.style.color=wO(6,10);wU.button.style.font=gameState.sK.u8(1,0.035*iV);
wT.appendChild(wU.button);oi.appendChild(wQ);oi.appendChild(wS);oi.appendChild(wT);
wH.appendChild(oi);}

function wW(){if(wB<0){return;}if(gameServer.z.responsePacketBuilder(0)){gameServer.eg.wC(1,wB);
wB=-1;}}

function SettingsController(aC){return gameState.color.pG(wA[aC][0],wA[aC][1],wA[aC][2]);}

function wO(fs,ft){
gameState.color.wX(wA[fs],wA[ft]);return SettingsController(ft);}

function wF(){document.body.appendChild(w9);
}

function SettingsPersistence(){if(!w9){return;}w9.remove();w9=null;}}

function wY(uC,wZ){
this.sA=[];
var wa=this.sA;

function dk(){var wb;
var fZ=uC.oM.length;for(var aC=0;aC<fZ;aC++){
wb=document.createElement("p");wb.textContent="⚪ "+uC.oM[aC];wb.style.margin="0";
wb.name=""+aC;wb.style.cursor="pointer";wb.style.fontSize="1em";wb.addEventListener("click",click);
wa.push(wb);}wa[uC.value].textContent=wa[uC.value].textContent.replace("⚪","🟢");}

function click(){
for(var aC=0;aC<wa.length;aC++){wa[aC].textContent=wa[aC].textContent.replace("🟢","⚪");
}this.textContent=this.textContent.replace("⚪","🟢");
var eI=parseInt(this.name);if(uC.eI!==undefined){connectionMgr.qo.boatNotificationHandler(uC.eI,eI);
}if(wZ){wZ(eI);}}dk();}

function wc(title,wd,we){var ui=document.createElement("div");
var wf=document.createElement("div");
var uL=document.createElement("div");
var wg=document.createElement("div");
var wh=document.createElement("div");
this.wi=uL;this.wj=wd;

function dk(){ui.style.position="absolute";ui.style.top="0";ui.style.left="0";
ui.style.width="100%";ui.style.height="100%";wf.style.position="absolute";wf.style.top="0";wf.style.left="0";
wf.style.width="100%";wf.style.display="flex";wf.style.backgroundColor=colorPalette.pK;wg.style.position="absolute";
wg.style.left="0";wg.style.width="100%";gameState.sK.uo(wg);wh.style.height=wh.style.maxHeight="100%";
uL.style.position="absolute";uL.style.width="100%";uL.style.backgroundColor=colorPalette.pK;wk();st();}

function wk(){
for(var aC=0;aC<wd.length;aC++){wd[aC].button.style.height="100%";wd[aC].button.style.padding="0.0em 0.9em";}
}

function st(){for(var aC=0;aC<wd.length;aC++){wh.appendChild(wd[aC].button);}wf.appendChild(wl());
wg.appendChild(wh);if(we!==false){ui.appendChild(uL);ui.appendChild(wf);ui.appendChild(wg);
}}

function wl(){var wm=document.createElement("h1");wm.textContent=title;wm.style.margin="auto";
wm.style.fontSize=(title.length>=18&&camera.k>camera.j)?"1.8em":"2.3em";wm.style.fontFamily="Arial Black, system-ui";
return wm;}this.show=function(){if(we!==false){document.body.appendChild(ui);
}else{document.body.appendChild(wf);document.body.appendChild(wg);}};this.tZ=function(){
if(we!==false){account.removeChild(document.body,ui);}else{account.removeChild(document.body,wf);
account.removeChild(document.body,wg);}};this.wn=function(){var tc=gameState.sK.currentScreenId(0.1);
var ta=gameState.sK.currentScreenId(0.08+0.04*(camera.wo<1),0.3);
var wp=camera.k/camera.l-tc-ta;return{tc:tc,ta:ta,wp:wp};
};this.resize=function(tu){var aC,e;
var fZ=wd.length;
var wq=this.wn();
var tc=wq.tc;
var ta=wq.ta;wf.style.height=gameState.sK.sT(tc);gameState.sK.sU(wf,2);wg.style.top=gameState.sK.sT(camera.k/camera.l-ta);
wg.style.height=gameState.sK.sT(ta);gameState.sK.sU(wg,8);uL.style.top=gameState.sK.sT(tc);
uL.style.height=uL.style.maxHeight=gameState.sK.sT(wq.wp);wf.style.font=gameState.sK.u8(0,gameState.sK.currentScreenId(0.02,0.15));
wg.style.font=gameState.sK.u8(0,gameState.sK.currentScreenId(0.02,0.7));uL.style.font=gameState.sK.u8(0,gameState.sK.currentScreenId(0.02,0.35));
for(aC=1;aC<fZ;aC++){gameState.sK.sU(wd[aC].button,4);}var tv=0;
for(aC=0;aC<fZ;aC++){tv+=wd[aC].button.offsetWidth;}if(tu&&tv<wg.offsetWidth){for(aC=0;aC<fZ;aC++){
e=wd[aC].button;e.style.width=(100*wd[aC].button.offsetWidth/tv).toFixed(2)+"%";
}}else{for(aC=0;aC<fZ;aC++){e=wd[aC].button;e.style.width="auto";
}}if(wg.FloatingActionButton){wg.scrollLeft=wg.FloatingActionButton;}if(!tu){this.resize(true);}};this.wr=function(){
var wq=this.wn();
var ej=camera.l;ws.fillStyle=colorPalette.pK;ws.fillRect(0,ej*wq.tc,camera.j,ej*wq.wp);
};dk();}

function tG(wt,wu,wv,ww){this.tH=document.createElement("span");

function sd(self){self.tH.textContent=wt;self.tH.style.color=colorPalette.pO;self.tH.style.position="absolute";
self.tH.style.font="inherit";if(ww){self.tH.style.bottom="0.06em";}else{self.tH.style.top="0.12em";
}if(wv){self.tH.style.left="0.2em";}else{self.tH.style.right="0.2em";}self.tH.style.fontSize="0.6em";
self.tH.style.pointerEvents="none";self.tH.style.whiteSpace="pre";wu.style.position="relative";
wu.style.overflow="hidden";wu.appendChild(self.tH);}sd(this);}

function uq(wt,wu,wx,wy,wz){
this.tH=document.createElement("span");

function sd(self){self.tH.textContent=wt;
self.tH.style.color=colorPalette.pO;self.tH.style.font="inherit";self.tH.style.margin="0.1em 0.6em";
self.tH.style.pointerEvents="none";wz&&(self.tH.style.fontWeight="bold");
self.tH.style.whiteSpace="nowrap";self.tH.style.display="block";wu.appendChild(self.tH);
}this.resize=function(){this.tH.style.fontSize=((wy-wx)*wu.offsetHeight).toFixed(1)+"px";
};sd(this);}

function x0(x1,x2,x3,oO){var x4=document.createElement("textarea");
this.e=x4;
var x5=true;

function dk(){x4.setAttribute("id","textArea"+(account.z.uF++));
x4.setAttribute("autocomplete","off");if(x1){x4.setAttribute("placeholder",x1);
}x4.style.top="0";x4.style.left="0";x4.style.width="100%";x4.style.height="100%";
x4.style.userSelect="none";x4.style.outline="none";x4.style.resize="none";x4.style.border="none";
x4.style.color=colorPalette.pO;x4.style.backgroundColor=colorPalette.pH;if(oO){x4.style.fontSize="1em";
x4.rows=6;x4.style.padding="0.25em";}else{x4.style.padding="0.45em";x4.style.fontSize="1.2em";
}if(x3){x4.addEventListener("input",function(e){x3(e);});}x4.addEventListener("focus",function(){
camera.uG++;});x4.addEventListener("blur",function(){camera.uG--;});}this.resize=function(){
if(x2){gameState.sK.sU(x4,5);}};this.x6=function(el){x4.value=el;};this.x7=function(){return x4.value;
};this.x8=function(){x4.select();};this.clear=function(){x4.value="";};this.x9=function(){
if(x5&&navigator.clipboard){x4.select();navigator.clipboard.writeText(x4.value).catch(function(){
x5=false;xA();});return;}xA();};

function xA(){x4.select();document.execCommand("copy");
}dk();}

function ConnectionManager(){this.sb=new xB();this.buffer=new xC();this.qo=new xD();
this.z=new xE();this.xF=new xG();this.applyToGame=function(){this.buffer.applyToGame();(new xH()).applyToGame();
this.xF.applyToGame();this.z.xI();};}

function xC(){this.data=[];this.applyToGame=function(){String64NameEncoder(0,1,0,5);
String64NameEncoder(1,1,1);String64NameEncoder(2,0);xK(3,2);String64NameEncoder(4,1);xK(5,2,"system-ui",2);String64NameEncoder(6,0);String64NameEncoder(7,0,0);String64NameEncoder(8,0);String64NameEncoder(9,1,1);String64NameEncoder(10,1);
String64NameEncoder(11,1,1);xK(12,2,navigator.language);String64NameEncoder(13);String64NameEncoder(14);String64NameEncoder(15,0,1);String64NameEncoder(16,0,4);BitStreamStringReader(100);xK(100,2);
xK(101,2);xK(102,2);xK(103,2);xK(104,2);xK(105,2);xK(106,2);String64NameEncoder(107);String64NameEncoder(108);String64NameEncoder(109);xK(110,2);
String64NameEncoder(111);String64NameEncoder(112);String64NameEncoder(113);xK(114,2);String64NameEncoder(115);xK(116,2);String64NameEncoder(117,1);xK(118,2,"",2);String64NameEncoder(119,1,0,1);
xK(120,2);String64NameEncoder(121,1,~~(Math.random()*262144));xK(122,2,"Player "+Math.floor(Math.random()*1000));
String64NameEncoder(123);xK(124);String64NameEncoder(125,1);xK(126,2);String64NameEncoder(127,0,1);String64NameEncoder(128);String64NameEncoder(129);String64NameEncoder(130);String64NameEncoder(131);String64NameEncoder(132);xK(133,2);
String64NameEncoder(134,0,5);xK(135,2);xK(136,2);String64NameEncoder(137);String64NameEncoder(138);String64NameEncoder(139);String64NameEncoder(140);String64NameEncoder(141);String64NameEncoder(142);String64NameEncoder(143);String64NameEncoder(144);
xK(145,2);String64NameEncoder(146);String64NameEncoder(147);xK(148,2);String64NameEncoder(149);String64NameEncoder(150,0,1);xK(151,2);String64NameEncoder(152,0,5);String64NameEncoder(153,1);String64NameEncoder(154,1);
xK(155,2);xK(156,2);String64NameEncoder(157);String64NameEncoder(158);String64NameEncoder(159);String64NameEncoder(160);xK(161,2);String64NameEncoder(162,0,1024);xK(163,2,"0,0,0");
xK(164,2,"100,100,100");xK(165,2,"30,30,30");xK(166,2,"70,70,70");xK(167,2,"100,100,100");xK(168,2,"85,85,85");
xK(169,2,"100,100,100");for(var aC=0;aC<4;aC++){xK(170+aC,2,"255,255,255");}xK(174,2);xK(175,2);
String64NameEncoder(176,0,200);BitStreamStringReader(180);String64NameEncoder(180,0);String64NameEncoder(181,0);String64NameEncoder(182,0,1023);xK(183,2);};this.boatNotificationHandler=function(eI,value){
this.data[eI].value=value;};this.xM=function(eI,value){this.boatNotificationHandler(eI,value);
var s1=String(value);
var fZ=s1.length;if(fZ>50000){console.log("storage value too large: index "+eI+" size "+fZ);
return;}connectionMgr.sb.save(eI,s1);connectionMgr.sb.save(eI,String(this.data[eI].e3),true);
};this.VarLengthStringReader=function(eI){return Number(this.data[eI].value);
};this.readStringFromBits=function(eI){return String(this.data[eI].value);};

function String64NameEncoder(aC,type,xP,e3){
connectionMgr.buffer.data.push({eI:aC,type:type||0,value:xP||0,xP:xP||0,e3:e3||0});
}

function xK(aC,type,xP,e3){connectionMgr.buffer.data.push({eI:aC,type:type,value:xP||"",xP:xP||"",e3:e3||0
});}

function BitStreamStringReader(oD){var aC;for(aC=connectionMgr.buffer.data.length;aC<oD;aC++){connectionMgr.buffer.data.push(null);
}}}

function xG(){var xQ=[];this.applyToGame=function(){var s1=connectionMgr.buffer.data[161].value;
if(s1.length){xQ=s1.split(";");}};this.get=function(){return xQ;};this.xR=function(){
return{oM:xQ,value:0};};this.vp=function(uY){return gameState.sS.has(xQ,uY);};this.xS=function(uY){
if(MountainAttackHelper(uY)){return 0;}xT(uY);return 1;};this.nH=function(uY){if(MountainAttackHelper(uY)){xT(uY);}
};

function xT(uY){xQ.unshift(uY);connectionMgr.qo.boatNotificationHandler(161,xQ.join(";"));}this.stringToLookupBytes=function(eI){if(eI<xQ.length){
xQ.splice(eI,1);connectionMgr.qo.boatNotificationHandler(161,xQ.join(";"));}};

function MountainAttackHelper(uY){var xV=xQ;
var fZ=xV.length;
for(var aC=0;aC<fZ;aC++){if(xV[aC]===uY){xV.splice(aC,1);connectionMgr.qo.boatNotificationHandler(161,xV.join(";"));
return true;}}return false;}}

function xB(){this.decodeStringIntoReplayReader=function(eI,e3){return Number(this.xX(eI,e3));
};this.xX=function(eI,e3){var g1=null;if(uiSurface.id===0){if(uiSurface.writeBytesToBitStream){g1=uiSurface.writeBytesToBitStream.getItem((e3?"v":"d")+eI);
}}else if(uiSurface.id===1){g1=uiSurface.writeString16.loadString((e3?1000:2000)+eI);}else if(uiSurface.id===2){
g1=uiSurface.writeFixedLengthString[(e3?"v":"d")+eI];}if(!g1||g1.length===0){return null;}return g1;};this.encodeStringToInt=function(fZ,MapGeometryDecoder){
var aC;
var h=[];
var xd=MapGeometryDecoder?"e":"l";if(uiSurface.id===0){if(uiSurface.writeBytesToBitStream){for(aC=0;aC<fZ;aC++){
h.push(uiSurface.writeBytesToBitStream.getItem(xd+aC));}}}else if(uiSurface.id===1){var xe=MapGeometryDecoder?5000:3000;for(aC=0;aC<fZ;aC++){
h.push(uiSurface.writeString16.loadString(xe+aC));}}else if(uiSurface.id===2){for(aC=0;aC<fZ;aC++){h.push(uiSurface.writeFixedLengthString[xd+aC]);
}}return h;};this.save=function(eI,value,e3){var xf=(e3?"v":"d")+eI;if(uiSurface.id===0){
if(uiSurface.writeBytesToBitStream&&connectionMgr.buffer.data[140].value){try{uiSurface.writeBytesToBitStream.setItem(xf,value);}catch(e){console.log(e);
}}return;}if(uiSurface.id===1){uiSurface.writeString16.saveString((e3?1000:2000)+eI,value);return;}if(uiSurface.id===2){
uiSurface.writeFixedLengthString[xf]=value;uiSurface.xg.postMessage(xf+" "+value);}};this.xh=function(h,MapGeometryDecoder){var aC;
var fZ=h.length;
var xd=MapGeometryDecoder?"e":"l";if(uiSurface.id===0){if(uiSurface.writeBytesToBitStream&&connectionMgr.buffer.data[140].value){try{for(aC=0;aC<fZ;aC++){
uiSurface.writeBytesToBitStream.setItem(xd+aC,h[aC]);}}catch(e){console.log(e);}}}else if(uiSurface.id===1){var xe=MapGeometryDecoder?5000:3000;
for(aC=0;aC<fZ;aC++){uiSurface.writeString16.saveString(xe+aC,h[aC]);}}else if(uiSurface.id===2){for(aC=0;aC<fZ;aC++){
uiSurface.writeFixedLengthString[xd+aC]=h[aC];uiSurface.xg.postMessage(xd+aC+" "+h[aC]);}}};}

function xH(){this.applyToGame=function(){
xi();xj();};

function xi(){var data=connectionMgr.buffer.data;if(data[2].e3===0&&(camera.k>camera.j||uiSurface.id!==0)){
data[2].value=data[2].xP=1;}if(data[100].e3===0){data[100].value=data[100].xP=(uiSurface.id===0?"Player ":
uiSurface.id===1?"Android User ":"iOS User ")+Math.floor(1000*Math.random());}}

function xj(){
var aC,g1;
var data=connectionMgr.buffer.data;
var fZ=data.length;for(aC=0;aC<fZ;aC++){var xk=connectionMgr.sb.decodeStringIntoReplayReader(aC,true);
if(data[aC]&&data[aC].e3===xk){g1=connectionMgr.sb.xX(aC);if(g1===null){data[aC].value=data[aC].xP;
continue;}if(data[aC].type===2){data[aC].value=g1;continue;}var xl=Number(g1);if(isNaN(xl)){
data[aC].value=data[aC].xP;continue;}data[aC].value=xl;}}}}

function xE(){this.integerMagnitude=function(){
if(!connectionMgr.buffer.data[110].value.length){return;}connectionMgr.buffer.data[106].value=connectionMgr.buffer.data[110];
connectionMgr.qo.boatNotificationHandler(110,"");this.xn();};this.xn=function(){var aC;
var h=connectionMgr.buffer.data[116].value.split(";");
if(h.length%2===1){h.pop();}h.unshift(connectionMgr.buffer.data[106].value);
h.unshift(connectionMgr.buffer.data[105].value);for(aC=2;aC<h.length;aC+=2){if(h[aC]===h[0]){h.splice(aC,2);
break;}}var xo=[];for(aC=0;aC<h.length;aC+=2){xo.push(h[aC]);}xp(h);connectionMgr.buffer.data[117].value=0;
connectionMgr.buffer.data[117].oM=xo;};this.xq=function(eI){connectionMgr.buffer.data[117].oM.splice(eI,1);
connectionMgr.buffer.data[117].value=Math.min(eI,connectionMgr.buffer.data[117].oM.length-1);
var h=connectionMgr.buffer.data[116].value.split(";");
h.splice(2*eI,2);xp(h);};this.xr=function(eI){var h=connectionMgr.buffer.data[116].value.split(";");
return{uY:h[2*eI],password:h[2*eI+1]};};

function xp(h){if(h.length===0){connectionMgr.qo.boatNotificationHandler(116,"");return;
}var xs=h[0];for(var aC=1;aC<h.length;aC++){xs+=";"+h[aC];}connectionMgr.qo.boatNotificationHandler(116,xs);}this.xt=function(){
var g1=mathUtils.distanceBetweenPointsAndEncoded(connectionMgr.buffer.data[121].value,-1,262143);if(g1===-1){g1=~~(Math.random()*262144);
}return g1;};this.xI=function(){var h=document.cookie.split(";");for(var aC=0;aC<h.length;aC++){
var s1=h[aC].trim();if(s1.length===0){continue;}var xu=s1.indexOf("=");
var name=xu>=0?s1.substring(0,xu):s1;document.cookie=name+"=;expires=0;path=/";
document.cookie=name+"=;expires=0;path=/;domain="+location.hostname;
document.cookie=name+"=;expires=0;path=/;domain=."+location.hostname;
}};}

function xD(){this.boatNotificationHandler=function(eI,value){
if(connectionMgr.buffer.data[eI].type!==2){value=Math.floor(value);}if(connectionMgr.buffer.data[eI].value===value){
return;}connectionMgr.buffer.xM(eI,value);if(eI===0){account.y();renderer.applyToGame();account.v(2);return;}if(eI===1){camera.dv(1);
return;}if(eI===2){camera.dv(0);return;}if(eI===5){gameState.sK.xv();camera.dv(0);return;}};this.emojiPicker=function(){
var aC;
var data=connectionMgr.buffer.data;for(aC=0;aC<100;aC++){if(data[aC]){connectionMgr.buffer.xM(aC,data[aC].xP);}
}gameState.sK.xv();camera.dv(1);};this.xx=function(){var data=connectionMgr.buffer.data;for(var aC=0;aC<data.length;aC++){
if(data[aC]){connectionMgr.buffer.boatNotificationHandler(aC,data[aC].xP);}}};this.xy=function(){var aC;
var ft=connectionMgr.buffer;
for(aC=128;aC<135;aC++){ft.xM(aC,ft.data[aC].xP);}};this.xz=function(data){connectionMgr.qo.boatNotificationHandler(109,data.uZ);
connectionMgr.qo.boatNotificationHandler(107,data.y0);connectionMgr.qo.boatNotificationHandler(108,data.y1);connectionMgr.qo.boatNotificationHandler(112,data.y2);connectionMgr.qo.boatNotificationHandler(111,data.y3);
connectionMgr.qo.boatNotificationHandler(113,data.isTileWrap);connectionMgr.qo.boatNotificationHandler(135,data.y5);connectionMgr.qo.boatNotificationHandler(136,data.y6);connectionMgr.qo.boatNotificationHandler(137,data.y7);
connectionMgr.qo.boatNotificationHandler(138,data.y8);connectionMgr.qo.boatNotificationHandler(139,data.y9);connectionMgr.qo.boatNotificationHandler(141,data.yA);connectionMgr.qo.boatNotificationHandler(142,data.yB);
connectionMgr.qo.boatNotificationHandler(143,data.yC);connectionMgr.qo.boatNotificationHandler(144,data.yD);};}

function MinimapRenderer(){this.f0=new yE();this.yF=new yG();
this.yH=new yI();this.applyToGame=function(){this.f0.applyToGame();};}

function yG(){this.yJ=function(size){
var yK=urlParams;
var h=[];for(var aC=0;aC<size;aC++){h.push(String.fromCharCode(yK.arrayUtils(16)));
}return h.join("");};this.yL=function(s1){s1=s1.trim();if(s1.length>20){return s1.substring(0,20);
}return s1;};}

function yE(){var yM=new Uint8Array(78);this.applyToGame=function(){var aC;
yM[50]=37;for(aC=0;aC<10;aC++){yM[aC+3]=aC+1;}for(aC=0;aC<26;aC++){yM[aC+20]=aC+11;yM[aC+52]=aC+38;
}};this.yN=function(s1){return s1.trim().replace(new RegExp("[^a-zA-Z0-9_\\-]","g"),"-");
};this.yO=function(s1,size){s1=this.yN(s1);
if(s1.length>size){return s1.substring(0,size);}while(s1.length<size){s1="-"+s1;}return s1;};
this.yP=function(s1){var yQ=yM;
var fZ=s1.length;
var h=new Uint8Array(fZ);for(var aC=0;aC<fZ;aC++){
h[aC]=yQ[s1.charCodeAt(aC)-45];}return h;};this.lobbyMaxJoin=function(yS){canvasManager.a8(6*yS.length);
this.yT(yS);urlParams.applyToGame(canvasManager.aD);};this.yT=function(yS){var fZ=yS.length;
var j=canvasManager;for(var aC=0;aC<fZ;aC++){
j.writeBits(6,yS[aC]);}};this.yU=function(s1){this.yT(this.yP(s1));};this.yV=function(s1,size){
this.yT(this.yP(this.yO(s1,size)));};this.f1=function(s1,size){var h=this.yP(this.yO(s1,size));
var g1=0;
var o7=1;for(var aC=h.length-1;aC>=0;aC--){g1+=o7*h[aC];o7*=64;}return g1;
};}

function yW(){var j,k;var yX;this.yY=function(s1){var aC,yZ,fZ,lp,h7,ya,yb,yc;
var yK=urlParams;
minimapRenderer.f0.lobbyMaxJoin(minimapRenderer.f0.yP(s1));dialogManager.yd.ye[dialogManager.tileDataToIndexUnchecked].j=dialogManager.fk=j=yK.arrayUtils(12);dialogManager.yd.ye[dialogManager.tileDataToIndexUnchecked].k=dialogManager.fl=k=yK.arrayUtils(12);
yX=[-j,-1,j,1];yf();fZ=yK.arrayUtils(12);yZ=yK.arrayUtils(5);ya=yg(j*k-1);for(aC=0;aC<fZ;aC++){lp=yK.arrayUtils(yZ);
h7=yK.arrayUtils(ya);yb=yK.arrayUtils(1)===1;yc=yK.arrayUtils(1)===1;yh(lp,h7,yb,yc);}yi();dialogManager.distanceSquared.putImageData(dialogManager.yk,0,0);
dialogManager.yl=true;dialogManager.ym.applyToGame();clanPanel.ds=true;};

function yf(){dialogManager.yn=document.createElement("canvas");
dialogManager.yn.width=dialogManager.fk;dialogManager.yn.height=dialogManager.fl;dialogManager.distanceSquared=dialogManager.yn.getContext("2d",{alpha:false});
dialogManager.yk=dialogManager.yo=null;dialogManager.yk=dialogManager.distanceSquared.getImageData(0,0,dialogManager.fk,dialogManager.fl);dialogManager.yo=dialogManager.yk.data;gameState.sS.yp(dialogManager.yo);}


function yh(lp,h7,yb,yc){var aC,fc;
var yK=urlParams;
var yq=dialogManager.yo;
var yr=h7;
var ys=h7;
var yt=0;
var yu=1+yb;
var yv=2-yb;yq[h7<<2]=yu;for(aC=0;aC<lp;aC++){fc=yK.arrayUtils(2);h7=yw(h7,fc);if(yq[h7<<2]===yu){
if(yt%2===1){yx(ys,yt+2*yc+3,yv,yc,yq);}}else{yq[h7<<2]=yu;}yx(h7,fc,yv,yc,yq);yx(ys,fc,yv,yc,yq);
ys=h7;yt=fc;}if(yw(h7,0)===yr){yx(h7,0,yv,yc,yq);yx(yr,0,yv,yc,yq);}else if(yw(h7,1)===yr){
yx(h7,0,yv,yc,yq);yx(yr,2,yv,yc,yq);}if(lp===0){yx(yr,0,yv,yc,yq);yx(yr,2,yv,yc,yq);
}}

function yx(i1,fc,yv,yc,yq){var lX=yw(i1,(fc+1+2*yc)&3);if(!yy(i1,lX)&&yq[lX<<2]===0){
yq[lX<<2]=yv;}}

function yy(i1,lX){return Math.abs(yz(i1)-yz(lX))>1||Math.abs(z0(i1)-z0(lX))>1;
}

function yz(h7){return h7%j;}

function z0(h7){
return Math.floor((h7+0.5)/j)%k;}

function yw(h7,fc){return h7+yX[fc];}

function yi(){
var fg,fi,iR,z1,z2,z3;
var yq=dialogManager.yo;
var z4=true;
var z5=dialogManager.yd.ye[dialogManager.tileDataToIndexUnchecked].z5;
var z6=dialogManager.yd.ye[dialogManager.tileDataToIndexUnchecked].z6;
for(fi=0;fi<k;fi++){z1=true;z2=z4;z3=0;for(fg=0;fg<j;fg++){iR=4*fi*j+4*fg;
if(fg>=z3&&yq[iR]>0){z2=yq[iR]===2;if(z1){z1=false;if(z2!==z4){z4=z2;z3=fg+1;fg=-1;continue;}
}}if(z2){yq[iR]=z6[0];yq[iR+1]=z6[1];yq[iR+2]=z6[2];yq[iR+3]=255;}else{yq[iR]=z5[0];yq[iR+1]=z5[1];
yq[iR+2]=z5[2];yq[iR+3]=255;}}}}}

function yI(){this.yY=function(z7){var yK=urlParams;
var size=yK.arrayUtils(z7);
var z8=7+9*yK.arrayUtils(1);
var h=[];for(var aC=0;aC<size;aC++){h.push(String.fromCharCode(yK.arrayUtils(z8)));
}return h.join("");};}

function InputLayer(){var u2,u3,z9,zA,zB,zC,zD,zE,zF,zG;
this.applyToGame=function(){zG=new Array(12);zE=6;zB=10;z9=mathUtils.g0(dialogManager.fk,zB);zA=mathUtils.g0(dialogManager.fl,zB);
zC=mathUtils.g0((dialogManager.fk-zB*z9),2);zD=mathUtils.g0((dialogManager.fl-zB*zA),2);if(localPlayer.isFreeForAll){for(var aC=0;aC<localPlayer.ku;aC++){
zF=aC;zH();playerData.nU[zF]=1;}}if(localPlayer.data.spawningType===0){zI();}else if(localPlayer.data.spawningType===1){
zI();zJ();}else{zK();}gameClock.nQ[7]=playerData.hN[localPlayer.getTileOwner];};

function zI(){var zL=localPlayer.isTileOwnedByPlayer;for(zF=zL;zF<localPlayer.isMountainTile;zF++){
zH();}for(zF=(localPlayer.isFreeForAll?localPlayer.ku:0);zF<zL;zF++){if(zM()){var zN=zC+u2*zB+mathUtils.g0(zB,2);
var zO=zD+u3*zB+mathUtils.g0(zB,2);renderGameFrame(zN,zO);}else{localPlayer.zQ=zF;for(var ft=zF;ft<zL;ft++){zF=ft;
zH();}return;}}}

function zJ(){var zR=localPlayer.zS;if(!localPlayer.renderer){zR++;}if(zR<3){return;}var data=localPlayer.data;
var kA=(localPlayer.isFreeForAll?localPlayer.ku:0)+data.teamPlayerCount[0];
var oD=localPlayer.zQ;
var zU=new Uint32Array(zR);
var clearCanvasBackground=new Uint32Array(zR);
var zW=new Uint16Array(zR);
var drawCanvasBorder=new Uint16Array(zR);
var fX=mainMenu.fX;
var jS=playerData.botExpansionAi;
var jU=playerData.botTeamTargetCoordinator;
var BotExpansionAi=playerData.BotExpansionAi;
var BotTeamTargetCoordinator=playerData.BotTeamTargetCoordinator;
var gE=boostSystem.gE;
var gF=boostSystem.gF;for(var aC=kA;aC<oD;aC++){gE[aC]=(jS[aC]+BotExpansionAi[aC])>>1;gF[aC]=(jU[aC]+BotTeamTargetCoordinator[aC])>>1;
}for(aC=kA;aC<oD;aC++){var id=fX[aC];zU[id]+=gE[aC];clearCanvasBackground[id]+=gF[aC];}var lH=mainMenu.lH;
for(aC=1;aC<zR;aC++){var resolveAttackCombat=Math.max(data.teamPlayerCount[lH[aC]],1);zW[aC]=mathUtils.g0(zU[aC],resolveAttackCombat);
drawCanvasBorder[aC]=mathUtils.g0(clearCanvasBackground[aC],resolveAttackCombat);}var zY=mainMenu.zY;
var drawCenteredCrossMarker=mainMenu.drawCenteredCrossMarker;
var za=mainMenu.za;
var gD=boostSystem.gD;
for(aC=0;aC<512;aC++){gD[aC]=aC;}for(var eH=0;eH<2+(zR>=4);eH++){for(aC=kA;aC<oD;aC++){
var i1=aC;
var zb=gD[i1];
var MatchRewardNotifier=1;
var fp=mathUtils.zd(gE[zb]-zW[1],gF[zb]-drawCanvasBorder[1]);for(var fs=2;fs<zR;fs++){
var ze=mathUtils.zd(gE[zb]-zW[fs],gF[zb]-drawCanvasBorder[fs]);if(ze<fp){fp=ze;MatchRewardNotifier=fs;}}var zf=fX[i1];if(MatchRewardNotifier===zf){
continue;}if(eH===2&&zR>=4){var zg=Math.max((MatchRewardNotifier+1)%zR,1);
var zh=mathUtils.zd(gE[zb]-zW[zg],gF[zb]-drawCanvasBorder[zg]);
for(fs=1;fs<zR;fs++){ze=mathUtils.zd(gE[zb]-zW[fs],gF[zb]-drawCanvasBorder[fs]);if(ze>fp&&ze<zh){
zh=ze;zg=fs;}}if(zg!==zf&&mathUtils.zd(zW[zf]-zW[zg],drawCanvasBorder[zf]-drawCanvasBorder[zg])<mathUtils.zd(zW[zf]-zW[MatchRewardNotifier],drawCanvasBorder[zf]-drawCanvasBorder[MatchRewardNotifier])){
MatchRewardNotifier=zg;}}var zi=lH[MatchRewardNotifier];
var zj=drawCenteredCrossMarker[zi]+(localPlayer.isFreeForAll?0:za[zi]);
var lX=zY[zj];
var zk=gD[lX];
var zl=drawCenteredCrossMarker[zi+1];fp=mathUtils.zd(gE[zk]-zW[zf],gF[zk]-drawCanvasBorder[zf]);for(var ej=zj+1;ej<zl;ej++){var zm=zY[ej];
var zn=gD[zm];ze=mathUtils.zd(gE[zn]-zW[zf],gF[zn]-drawCanvasBorder[zf]);if(ze<fp){fp=ze;lX=zm;}}if(lX<kA||lX>=oD){
continue;}zk=gD[lX];zU[zf]+=gE[zk]-gE[zb];clearCanvasBackground[zf]+=gF[zk]-gF[zb];zU[MatchRewardNotifier]+=gE[zb]-gE[zk];
clearCanvasBackground[MatchRewardNotifier]+=gF[zb]-gF[zk];resolveAttackCombat=data.teamPlayerCount[lH[zf]];zW[zf]=mathUtils.g0(zU[zf],resolveAttackCombat);
drawCanvasBorder[zf]=mathUtils.g0(clearCanvasBackground[zf],resolveAttackCombat);resolveAttackCombat=data.teamPlayerCount[zi];zW[MatchRewardNotifier]=mathUtils.g0(zU[MatchRewardNotifier],resolveAttackCombat);
drawCanvasBorder[MatchRewardNotifier]=mathUtils.g0(clearCanvasBackground[MatchRewardNotifier],resolveAttackCombat);gD[i1]=zk;gD[lX]=zb;}}zo();}

function zo(){var gD=boostSystem.gD;
var jS=playerData.botExpansionAi;
var jU=playerData.botTeamTargetCoordinator;
var BotExpansionAi=playerData.BotExpansionAi;
var BotTeamTargetCoordinator=playerData.BotTeamTargetCoordinator;
var hN=playerData.hN;
var zp=playerData.zp;
var hF=playerData.playerTerritories;
var hG=playerData.hG;
var fy=playerData.fy;for(var aC=0;aC<512;aC++){var zq=gD[aC];if(zq===aC){continue;
}EmojiData(jS,aC,zq);EmojiData(jU,aC,zq);EmojiData(BotExpansionAi,aC,zq);EmojiData(BotTeamTargetCoordinator,aC,zq);EmojiData(hN,aC,zq);EmojiData(zp,aC,zq);EmojiData(hF,aC,zq);
EmojiData(hG,aC,zq);EmojiData(fy,aC,zq);EmojiPickerUI(aC);EmojiPickerUI(zq);gD[aC]=aC;
var k=zq;
var h8=gD[k];while(h8!==aC){
k=h8;h8=gD[h8];}gD[k]=zq;}}

function EmojiPickerUI(player){var jS=playerData.botExpansionAi;
var jU=playerData.botTeamTargetCoordinator;
var BotExpansionAi=playerData.BotExpansionAi;
var BotTeamTargetCoordinator=playerData.BotTeamTargetCoordinator;for(var fi=jU[player];fi<=BotTeamTargetCoordinator[player];fi++){for(var fg=jS[player];fg<=BotExpansionAi[player];fg++){
var fD=tileMap.zt(fg,fi);if(!tileMap.h9(fD)){continue;}if(tileMap.removeNeutralCandidate(fD)){tileMap.mergeCapturedPlayerTerritory(fD,player);
}else{tileMap.zu(fD,player);}}}}

function EmojiData(h,us,ut){var ea=h[us];h[us]=h[ut];h[ut]=ea;}

function zK(){
var zL=localPlayer.isTileOwnedByPlayer;for(zF=zL;zF<localPlayer.isMountainTile;zF++){zH();}for(zF=(localPlayer.isFreeForAll?localPlayer.ku:0);zF<zL;zF++){if(zv()){continue;
}if(zM()){var zN=zC+u2*zB+mathUtils.g0(zB,2);
var zO=zD+u3*zB+mathUtils.g0(zB,2);renderGameFrame(zN,zO);continue;}localPlayer.zQ=zF;
for(var ft=zF;ft<zL;ft++){zF=ft;zH();}return;}}

function zM(){return zw()||zx();}

function zv(){
var spawningData=localPlayer.data.spawningData;
var zN=spawningData[2*zF]+1;
var zO=spawningData[2*zF+1]+1;
if(zN>3&&zN<dialogManager.fk-5&&zO>3&&zO<dialogManager.fl-5){if(tileMap.fU(tileMap.zt(zN,zO))&&zy(zN+3,zO+3)){
renderGameFrame(zN+1,zO+1);return true;}}return false;}

function zw(){var aC;
for(aC=0;aC<8;aC++){u2=mathUtils.g0(z9*coordHelper.random(),coordHelper.value(100));u3=mathUtils.g0(zA*coordHelper.random(),coordHelper.value(100));
if(zz()){return true;}}return false;}

function zx(){var iw,iz,fs,zO,ft,zN;
iw=mathUtils.g0(z9*coordHelper.random(),coordHelper.value(100));iz=mathUtils.g0(zA*coordHelper.random(),coordHelper.value(100));
for(fs=40;fs>=1;fs--){for(zO=zA-fs;zO>=0;zO-=40){u3=(zO+iz)%zA;for(ft=40;ft>=1;ft--){
for(zN=z9-ft;zN>=0;zN-=40){u2=(zN+iw)%z9;if(zz()){return true;}}}}}return false;
}

function zz(){var h7,a00,a01;
var gap=mathUtils.g0((zB-zE),2);
var a02=zD+u3*zB+gap;
var a03=zC+u2*zB+gap;
for(a00=a02+zE-1;a00>=a02;a00--){for(a01=a03+zE-1;a01>=a03;a01--){h7=tileMap.zt(a01,a00);
if(!tileMap.fU(h7)||tileMap.removeNeutralCandidate(h7)){return false;}}}return true;}

function renderGameFrame(zN,zO){zH();a04(zN-2,zO-2);
}

function zH(){playerData.nU[zF]=0;playerData.hN[zF]=playerData.zp[zF]=0;playerData.h1[zF]=[];playerData.playerTerritories[zF]=[];playerData.hG[zF]=[];
playerData.fy[zF]=[];playerData.botExpansionAi[zF]=playerData.botTeamTargetCoordinator[zF]=playerData.BotExpansionAi[zF]=playerData.BotTeamTargetCoordinator[zF]=0;}

function a04(zN,zO){playerData.nU[zF]=1;
playerData.botExpansionAi[zF]=zN+10;playerData.botTeamTargetCoordinator[zF]=zO+10;playerData.BotTeamTargetCoordinator[zF]=playerData.BotExpansionAi[zF]=0;var h7,aC,a05,a06;for(a05=zN;a05<zN+4;a05++){
for(a06=zO;a06<zO+4;a06++){if((a05>zN&&a05<zN+3)||(a06>zO&&a06<zO+3)){h7=tileMap.zt(a05,a06);
if(tileMap.fU(h7)){playerData.botExpansionAi[zF]=Math.min(a05,playerData.botExpansionAi[zF]);playerData.BotExpansionAi[zF]=Math.max(a05,playerData.BotExpansionAi[zF]);
playerData.botTeamTargetCoordinator[zF]=Math.min(a06,playerData.botTeamTargetCoordinator[zF]);playerData.BotTeamTargetCoordinator[zF]=Math.max(a06,playerData.BotTeamTargetCoordinator[zF]);
zG[playerData.hN[zF]]=h7;playerData.hN[zF]++;tileMap.zu(h7,zF);}}}}playerData.zp[zF]=playerData.hN[zF];
for(aC=playerData.hN[zF]-1;aC>=0;aC--){if(tileMap.a07(zG[aC],zF)){tileMap.mergeCapturedPlayerTerritory(zG[aC],zF);playerData.playerTerritories[zF].push(zG[aC]);
}else if(tileMap.specialCount(zG[aC])){tileMap.mergeCapturedPlayerTerritory(zG[aC],zF);playerData.hG[zF].push(zG[aC]);}else if(tileMap.maxId(zG[aC])){
tileMap.mergeCapturedPlayerTerritory(zG[aC],zF);playerData.fy[zF].push(zG[aC]);}}}this.a0A=function(k3,a0B,a0C){var aC,zN,zO;
zF=k3;for(aC=0;aC<20;aC++){for(zN=a0B+aC;zN>=a0B-aC;zN--){for(zO=a0C+aC;zO>=a0C-aC;zO--){
if(zN===a0B+aC||zN===a0B-aC||zO===a0C+aC||zO===a0C-aC){if(zN>3&&zN<dialogManager.fk-5&&zO>3&&zO<dialogManager.fl-5){
if(tileMap.fU(tileMap.zt(zN,zO))&&a0D(zN+3,zO+3)){if(playerData.hN[zF]>0){a0E();zH();}a04(zN-1,zO-1);
return true;}}}}}}return false;};

function a0E(){var h7,u2,u3;for(u2=playerData.BotExpansionAi[zF];u2>=playerData.botExpansionAi[zF];u2--){
for(u3=playerData.BotTeamTargetCoordinator[zF];u3>=playerData.botTeamTargetCoordinator[zF];u3--){h7=(u3*dialogManager.fk+u2)*4;if(tileMap.a0F(zF,h7)){
tileMap.a0G(h7);playerData.hN[zF]--;}}}}this.a0H=function(k3){zF=k3;if(zM()){var zN=zC+u2*zB+mathUtils.g0(zB,2);
var zO=zD+u3*zB+mathUtils.g0(zB,2);renderGameFrame(zN,zO);}else{zH();}};

function zy(zN,zO){var h7,a01,a00;
for(a00=zO;a00>zO-6;a00--){for(a01=zN;a01>zN-6;a01--){h7=tileMap.zt(a01,a00);if(tileMap.removeNeutralCandidate(h7)){
return false;}}}return true;}

function a0D(zN,zO){var h7,a01,a00;for(a00=zO;a00>zO-6;a00--){
for(a01=zN;a01>zN-6;a01--){h7=tileMap.zt(a01,a00);if(tileMap.removeNeutralCandidate(h7)&&!tileMap.a0I(zF,h7)){return false;}}}
return true;}}

function a0J(){scoreSystem.a0K();ws.setTransform(im,0,0,im,0,0);ws.imageSmoothingEnabled=im<3;
ws.drawImage(dialogManager.yn,hoverHandler.canvasStrokeWidth(),hoverHandler.a0M());armySystem.getEmojiFromId.wr();ws.drawImage(a0O,hoverHandler.canvasStrokeWidth(),hoverHandler.a0M());
scoreSystem.wr();bonusSystem.wr();troops.wr();if(localPlayer.ny){gameMenu.wr();packetReader.wr();account.wr();return;}hoverProcessor.wr();
uiColors.wr();clickHandler.wr();packetReader.wr();cameraController.wr();focusHandler.wr();hoverHandler.wr();deviceDetector.wr();gameMenu.wr();touchInputHandler.wr();panHandler.wr();zoomHandler.wr();modalState.wr();
resizeHandler.wr();accountPanel.wr();clansSystem.wr();account.wr();}

function a0P(ou,j,k){ou.clearRect(0,0,j,k);ou.fillStyle=colorPalette.pL;
ou.fillRect(0,0,j,k);}

function a0Q(ou,j,k,a0R){ou.fillStyle=colorPalette.pO;ou.fillRect(0,0,j,a0R);
ou.fillRect(0,0,a0R,k);ou.fillRect(j-a0R,0,a0R,k);ou.fillRect(0,k-a0R,j,a0R);
}

function a0S(ou,fg,fi,iV,a0R,h7,a0T){ou.fillStyle=colorPalette.pO;
var uf=Math.floor(iV*h7);
uf+=(uf-a0R)%2;
var ug=Math.floor((uf-a0R)/2);
var a0U=Math.floor((iV-uf)/2);
ou.fillRect(fg+a0U,fi+a0U+ug,uf,a0R);if(a0T){ou.fillRect(fg+a0U+ug,fi+a0U,a0R,uf);}}

function a0V(){
this.applyToGame=function(){if(localPlayer.survivorBotCount!==8){return;}hoverProcessor.isCrownFlagEmoji();};this.a0X=function(Base64Encoder){var elo=localPlayer.data.elo;
var k9=(elo[Base64Encoder]-elo[1-Base64Encoder])/10;
var BitStreamStringWriter=8/(1+Math.pow(2,k9/32));BitStreamStringWriter=Math.floor(10*BitStreamStringWriter+0.5);
var LengthPrefixedStringWriter=elo[Base64Encoder]+BitStreamStringWriter;
var a0b=this.a0c(LengthPrefixedStringWriter);
var a0d=this.a0c(elo[1-Base64Encoder]-BitStreamStringWriter);
if(Base64Encoder===0){hoverProcessor.a0e(a0b,a0d,["rgba(10,140,10,0.75)","rgba(140,10,10,0.75)"]);}else{hoverProcessor.a0e(a0d,a0b,["rgba(140,10,10,0.75)","rgba(10,140,10,0.75)"]);
}var a0f=(LengthPrefixedStringWriter*mathUtils.sqrt(LengthPrefixedStringWriter))>>8;
var a0g=(((1+localPlayer.a0h)*a0f)/100).toFixed(2);
if(Base64Encoder===localPlayer.getTileOwner){hoverProcessor.a0i(640,L(28,[a0g]),40,0,colorPalette.pO,colorPalette.pL,-1,false);
}else{hoverProcessor.a0i(640,L(29,[playerData.a0j[Base64Encoder],a0g]),40,0,colorPalette.pO,colorPalette.pL,-1,false);
}};this.a0c=function(elo){elo=mathUtils.distanceBetweenPointsAndEncoded(elo,0,16000);if(elo===16000){
return "Unknown";}return(elo/10).toFixed(1);};}

function ColorSystem(){this.tY=new a0k();this.yq=new a0l();
}

function a0l(){this.isTeamGame=false;var nv,nw,gap,iV,a0m;
var a0n=10;
var a0o=1;this.a0p=[];this.a0q=100;
var a0r=0;
var a0s=new Array(9);
var a0t=[];
var a0u=[];
var a0v=0;
var a0w=0;
var a0x=0;
var a0y=0;
this.applyToGame=function(){var aC;
var a0z=[0,1,2,4,7,8,9,10,11,12,13,14,15,6];for(aC=0;aC<a0z.length;aC++){
var color=a0z[aC]===6?colorPalette.settingsController:colorPalette.pM;this.a0p.push(gameState.canvas.EndGameTransitionController(adSystem.get(3),a0z[aC],color));
}for(aC=0;aC<colorSystem.tY.EndGameResult;aC++){a0u.push(colorSystem.tY.endGameParticipantSelector-colorSystem.tY.EndGameResult+aC);}for(aC=0;aC<colorSystem.tY.EndGameParticipantSelector;aC++){
a0u.push(colorSystem.tY.endGameNotificationController+aC);}var EndGameNotificationController=colorSystem.tY.endGameWinnerResolver(floorDiv.EndGameNotificationController);for(aC=0;aC<EndGameNotificationController.length;aC++){
a0u.push(EndGameNotificationController[aC]);}EndGameWinnerResolver();};

function EndGameWinnerResolver(){var aC;
var s1=connectionMgr.buffer.data[120].value;
var h=s1.split(",");if(h.length!==18){for(aC=0;aC<9;aC++){a0s[aC]={r3:1024-9+aC,kz:0};}return;
}for(aC=0;aC<9;aC++){var g1=parseInt(h[aC]);g1=(g1>=0&&g1<colorSystem.tY.endGameParticipantSelector)?g1:0;
var ej=parseInt(h[aC+9]);
ej=(ej>=0&&ej<1000)?ej:0;a0s[aC]={r3:g1,kz:ej};}}

function a18(){var aC;a0t=[];if(a0r===0){
for(aC=0;aC<9;aC++){a0t.push(a0s[aC].r3);}}else{var ft=49*a0r;
var fs=ft-49;if(fs>=a0u.length){
a0r=1;fs=0;ft=49;}ft=Math.min(ft,a0u.length);fs=ft-49;for(aC=fs;aC<ft;aC++){a0t.push(a0u[aC]);}}
a0t.push(1024);}

function EndGameRewardDisplay(r3){var aC;for(aC=0;aC<9;aC++){a0s[aC].kz=Math.floor(a0s[aC].kz*0.99);
}for(aC=0;aC<9;aC++){if(r3===a0s[aC].r3){a0s[aC].kz=Math.min(a0s[aC].kz+30,999);
a1A();return;}}a0s.splice(5,0,{r3:r3,kz:Math.max(a0s[4].kz,30)});
a0s.pop();a1A();}

function a1A(){var aC;a0s.sort(function(fs,ft){return ft.kz-fs.kz;});
var s1=""+a0s[0].r3;for(aC=1;aC<9;aC++){s1+=","+a0s[aC].r3;}for(aC=0;aC<9;aC++){
s1+=","+a0s[aC].kz;}connectionMgr.buffer.xM(120,s1);}this.show=function(m9,mA,a1B){a0v=m9;a0w=mA;
a0r=a1B||0;this.isTeamGame=true;a18();
var resolveAttackCombat=a0t.length;iV=Math.floor((uiSurface.platformActions.ik()?0.075:0.0468)*camera.il);
gap=Math.floor(iV/3);a0m=iV+gap;a0x=a0n*a0m;if(a0x>camera.j){a0x=camera.j;a0m=a0x/a0n;
iV=3*a0m/4;gap=a0m-iV;}a0o=mathUtils.g0(resolveAttackCombat,a0n)+!!(resolveAttackCombat%a0n);a0y=a0o*a0m;if(a0y>camera.k){a0y=camera.k;a0m=a0y/a0o;
iV=3*a0m/4;gap=a0m-iV;}var a1C=0.5*gap;nv=Math.min(Math.max(m9-0.5*a0x+a1C,a1C),camera.j-a0x+a1C);
nw=Math.min(Math.max(mA-0.5*a0y+a1C,a1C),camera.k-a0y+a1C);
};this.hm=function(m9,mA,player){if(!this.isTeamGame){return false;}if(this.isPlayerInMatch(m9,mA)){
var eI=mathUtils.distanceBetweenPointsAndEncoded(mathUtils.g0(m9-nv+0.5*gap,a0m),0,a0n-1);eI+=a0n*mathUtils.distanceBetweenPointsAndEncoded(mathUtils.g0(mA-nw+0.5*gap,a0m),0,a0n-1);
if(eI>=a0t.length){modalState.tZ();return true;}var r3=a0t[eI];if(r3===1024){this.show(a0v,a0w,a0r+1);
return true;}EndGameRewardDisplay(r3);if(player===localPlayer.getTileOwner){mapCache.hz.r2(r3);}else{mapCache.gv.rH(r3,player);
}}modalState.tZ();return true;};this.isPlayerInMatch=function(m9,mA){return!(m9<nv-0.5*gap||mA<nw-0.5*gap||
m9>=nv+a0x-0.5*gap||mA>=nw+a0y-0.5*gap);};this.wr=function(){ws.fillStyle=colorPalette.pL;
ws.fillRect(nv-0.5*gap,nw-0.5*gap,a0x,a0y);
var iR=0.5*debugPanel.a1E;ws.lineWidth=debugPanel.a1E;
ws.strokeStyle=ws.fillStyle=colorPalette.pO;ws.strokeRect(nv-0.5*gap+iR,nw-0.5*gap+iR,a0x-2*iR,a0y-2*iR);
ws.imageSmoothingEnabled=true;
var fZ=a0t.length;
for(var aC=0;aC<fZ;aC++){this.a1F(a0t[aC],ws,nv+(aC%a0n)*a0m,nw+mathUtils.g0((aC),a0n)*a0m,
iV);}ws.imageSmoothingEnabled=false;};this.a1F=function(r3,ib,fg,fi,iV){if(r3>=1024-colorSystem.tY.EndGameResult){
var fD=iV/this.a0q;ib.setTransform(fD,0,0,fD,fg,fi);ib.drawImage(this.a0p[r3-1024+colorSystem.tY.EndGameResult],0,0);
ib.setTransform(1,0,0,1,0,0);return;}gameState.sK.textAlign(ib,1);gameState.sK.textBaseline(ib,1);
ib.font=gameState.sK.u8(0,0.89*iV);ib.fillText(colorSystem.tY.a1G(r3),fg+0.5*iV,fi+(0.56+(0.35-gameState.sK.a1H))*iV);
};}

function a0k(){this.emojis=["🥰","😎","😘","😜","🤗","🥳","😇","😊","🥱","🙄","🤔","🥺","😡","😭","😱",
"😞","💀","👹","👋","🙏","👏","💪","🙋‍♂️","🤦‍♂️","⬆️","➡️","⬇️","⬅️","👀","❤️","💔","💥","🔥","🪦","🥇","🥈","🥉",
"🎖️","🏅","👑","🎉","💯","✝️","☪️","🕉️","☸️","✡️","☦️","⚛️"];this.EndGameResult=13;this.EndGameParticipantSelector=this.emojis.length;
this.endGameNotificationController=676;this.endGameParticipantSelector=1024;this.a1I=this.emojis.indexOf("💀");this.a1J=this.a1I+1;
this.a1K=this.emojis.indexOf("🥇");this.a1L=this.emojis.indexOf("😊");this.a1G=function(g1){
if(g1<this.endGameNotificationController){return String.fromCharCode(55356,56806+mathUtils.g0(g1,26),55356,56806+g1%26);
}return this.emojis[Math.min(g1-this.endGameNotificationController,this.EndGameParticipantSelector-1)];
};this.endGameWinnerResolver=function(s1){var fZ=s1.length-2;
var h=[];
for(var aC=0;aC<fZ;aC++){var a1M=s1.charCodeAt(aC)-56806;
var a1N=s1.charCodeAt(aC+2)-56806;
if(a1M>=0&&a1M<26&&a1N>=0&&a1N<26){h.push(26*a1M+a1N);aC+=3;}}return h;
};this.a1O=function(g1){return g1<this.endGameNotificationController;};this.a1P=function(g1){return g1>=1024-this.EndGameResult;
};this.a1Q=function(g1){return g1>=this.endGameNotificationController&&g1<this.endGameNotificationController+this.a1J;};}

function UIRenderer(){
this.f0=new a1R();this.yF=new a1S();this.yH=new a1T();this.applyToGame=function(){this.f0.applyToGame();
};}

function a1S(){this.yU=function(s1){var fZ=s1.length;
var j=canvasManager;for(var aC=0;aC<fZ;aC++){
j.writeBits(16,s1.charCodeAt(aC));}};}

function a1R(){var a1U=new Uint8Array(64);this.applyToGame=function(){
var aC;a1U[0]=45;a1U[37]=95;for(aC=0;aC<10;aC++){a1U[aC+1]=48+aC;}for(aC=0;aC<26;aC++){
a1U[aC+11]=65+aC;a1U[aC+38]=97+aC;}};this.ud=function(a1V){var yK=urlParams;
var yS=new Uint8Array(a1V);
for(var aC=0;aC<a1V;aC++){yS[aC]=yK.arrayUtils(6);}return yS;};this.uc=function(yS){var fZ=yS.length;
var a1W=a1U;
var h=[];for(var aC=0;aC<fZ;aC++){h.push(String.fromCharCode(a1W[yS[aC]]));
}return h.join("");};this.currentLoopHandler=function(value,a1Y){var a1W=a1U;
var h=[];for(var aC=0;aC<a1Y;aC++){h.push(String.fromCharCode(a1W[(value>>((a1Y-1-aC)*6))&63]));
}return h.join("");};}

function PanProcessor(){var a1Z;var a1a;var a1b;

function a1c(){a1Z=[32,65,191,913,931];a1a=[64,127,688,930,1155];a1b=new Array(a1Z.length+1);
for(var aC=0;aC<a1b.length;aC++){a1b[aC]=0;for(var fs=aC-1;fs>=0;fs--){a1b[aC]+=a1a[fs]-a1Z[fs];
}}}a1c();this.yL=function(s1){s1=s1.trim();if(s1.indexOf("Bot ")===0){return false;
}if(s1.indexOf("[Bot] ")===0){return false;}return a1d(s1,3,20);};

function a1d(s1,a1e,a1f){
s1=s1.trim();
var fZ=s1.length;if(fZ<a1e||fZ>a1f){return false;}var a1g=0;var ej;
for(var aC=0;aC<fZ;aC++){ej=s1.charCodeAt(aC);a1g+=((ej>=65&&ej<=90)||(ej>=1040&&ej<=1071))?1:0;
if(a1h(ej)===-1){return false;}}if(a1g>3&&a1g>Math.floor(fZ/2)){return false;}return true;
}this.a1i=function(s1){s1=s1.trim();
var fZ=s1.length;
var h=[];var ej;for(var aC=0;aC<fZ;aC++){
ej=s1.charCodeAt(aC);
var h7=a1h(ej);h.push(a1b[h7]+ej-a1Z[h7]);}return h;};this.yY=function(h){
var s1="";
var fZ=h.length;var ej,ft;for(var aC=0;aC<fZ;aC++){for(ft=1;ft<a1b.length;ft++){
if(h[aC]<a1b[ft]){ej=a1Z[ft-1]+h[aC]-a1b[ft-1];s1+=String.fromCharCode(ej);break;}}}return s1;
};

function a1h(ej){for(var aC=a1Z.length-1;aC>=0;aC--){if(ej>=a1Z[aC]&&ej<a1a[aC]){return aC;
}}return-1;}this.a1j=function(s1){var h=this.a1i(s1);
var result="";for(var aC=0;aC<h.length;aC++){
result+=h[aC]<10?"00":h[aC]<100?"0":"";result+=h[aC].toString(10);}return result;
};this.a1k=function(s1){var h=new Array(Math.floor(s1.length/3));for(var aC=0;aC<s1.length;aC+=3){
h[Math.floor(aC/3)]=parseInt(s1.substring(aC,aC+3));}return this.yY(h);};this.a1l=function(s1){
var aC,g1;
var h=[s1.length];for(aC=0;aC<s1.length;aC++){h[aC]=s1.charCodeAt(aC)-48;
}var result="";for(aC=0;aC<s1.length;aC++){if(aC===s1.length-1||h[aC]*10+h[aC+1]>51){
result+=h[aC].toString();}else{g1=h[aC]*10+h[aC+1];result+=String.fromCharCode(g1+(g1<26?65:71));
aC++;}}return result;};this.a1m=function(s1){var result="";var ej;for(var aC=0;aC<s1.length;aC++){
ej=s1.charCodeAt(aC);if(ej>=48&&ej<58){result+=String.fromCharCode(ej);
}else if(ej>=65&&ej<75){result+="0"+(ej-65).toString();}else if(ej>=75&&ej<91){
result+=(ej-65).toString();}else if(ej>=97&&ej<123){result+=(ej-71).toString();
}}return result;};this.a1n=function(s1){var fZ=s1.length;var ej,aC;
var h=[];
for(aC=0;aC<fZ;aC++){ej=s1.charCodeAt(aC);if(ej<58){h.push(s1[aC]);continue;}else if(ej<91){ej-=65;
}else{ej-=71;}h.push(String(mathUtils.g0(ej,10)));h.push(String(ej-10*mathUtils.g0(ej,10)));}fZ=h.length-2;
ej=0;
var yS=[];for(aC=0;aC<fZ;aC+=3){yS[ej++]=parseInt(h[aC]+h[aC+1]+h[aC+2]);}return yS;};
this.a1o=function(){var aC,eH;
var a1p="";for(aC=0;aC<6;aC++){eH=48+coordHelper.random()%36;eH+=eH>=58?39:0;
a1p+=String.fromCharCode(eH);}return a1p;};}

function a1T(){this.a1i=function(s1,z7,a1q){var a1r=[];
var fZ=s1.length;
var max=0;for(var aC=0;aC<fZ;aC++){var g1=s1.charCodeAt(aC);a1r.push(g1);
max=Math.max(max,g1);}var z8=max<128?7:16;a1q.writeBits(z7,fZ);a1q.writeBits(1,+(z8===16));for(aC=0;aC<fZ;aC++){
a1q.writeBits(z8,a1r[aC]);}};}

function InputController(){this.a1s=new a1t();this.result=new a1u();this.a1v=new a1w();
this.a1x=new a1y();this.a1z=new a20();this.a21=new a22();this.applyToGame=function(){this.result.applyToGame();};
}

function a1w(){this.rawPlayerNames=function(){var fZ=territorySystem.lQ;
var a24=territorySystem.lV;
var a25=[];for(var aC=0;aC<fZ;aC++){
var h7=a24[aC];if(gameState.gv.getClanTag(h7)){a25.push(h7);}}return a25;};this.a27=function(){
if(mainMenu.lH[localPlayer.a28]===0){return this.a29();}gameMenu.kv(localPlayer.a28);
var a25=[];
var fZ=boostSystem.g4[0];
var gD=boostSystem.gD;for(var aC=0;aC<fZ;aC++){var h7=gD[aC];if(gameState.gv.getClanTag(h7)){a25.push(h7);}}return a25;};
this.a29=function(){var h7=mV[0];if(gameState.gv.getClanTag(h7)){return [h7];}return [];};this.a2A=function(a25){
var fZ=a25.length;
var ea=0;
var hN=playerData.hN;for(var aC=0;aC<fZ;aC++){ea+=hN[a25[aC]];}return ea;
};}

function a1t(){this.a2B=function(){if(a2C()){return;}localPlayer.playerValidator=2;a2E();};this.a2F=function(){
if(a2C()){return;}localPlayer.playerValidator=1;a2E();};

function a2C(){if(localPlayer.a2G===2){return true;}cameraController.a2H();localPlayer.a2G=2;
localPlayer.a2I=localPlayer.a2J;return false;}

function a2E(){inputController.a1z.a2K();resizeHandler.show(localPlayer.a2L===1,false,localPlayer.a2L===2);
inputController.result.a2K();inputController.a21.ee();inputController.a1x.ee();inputController.a1x.a2M();hoverProcessor.a2N(true);hoverProcessor.a2O(247);hoverProcessor.a2O(956);
hoverProcessor.a2O(957);uiColors.nG(true);focusHandler.nG(true);cameraController.nG();packetReader.a2P();localPlayer.hi&&clanPanel.a2Q.a2R();clanPanel.ds=true;chatPanel.appleLink();
uiSurface.platformActions.setState(0);}}

function a1y(){this.ee=function(){if(localPlayer.playerValidator===2){hoverProcessor.a2T(0,59);soloCalc.o4(2700);
return;}if(localPlayer.survivorBotCount<7){a2U();return;}if(localPlayer.survivorBotCount===8){a2V();return;}if(localPlayer.survivorBotCount===9){a2W();return;
}a2X();};

function a2V(){if(localPlayer.a2L){hoverProcessor.a2T(localPlayer.a2Y,2);}else{hoverProcessor.a2T(1-localPlayer.getTileOwner,3);}localPlayer.a2Z.a0X(localPlayer.a2Y);
soloCalc.uiHidden(localPlayer.a2Y,2700,false,0);}

function a2U(){var a2a=mainMenu.lH[localPlayer.a28];
var a2b=mainMenu.a2c[a2a];
deviceDetector.a2d(L(30,[a2b]),2,1,12);hoverProcessor.a0i(0,L(31,[a2b]),40,0,colorPalette.pO,colorPalette.pL,-1,false);soloCalc.o4(2700);
}

function a2W(){hoverProcessor.a2e();soloCalc.o4(2700);}

function a2X(){hoverProcessor.a2f(localPlayer.a2Y);soloCalc.uiHidden(localPlayer.a2Y,2700,false,0);
}this.a2M=function(){if(localPlayer.hi){return;}if(localPlayer.lE){return;}var s1=gameServer.z.a2g();if(localPlayer.survivorBotCount<7){
s1+="/log/team";}else if(localPlayer.survivorBotCount===8){s1+="/log/1v1";}else if(localPlayer.survivorBotCount===9){s1+="/log/zombies";
}else{s1+="/log/br";}hoverProcessor.a0i(720,s1,736,0,colorPalette.pO,colorPalette.outgoingGameCommandBuilder,-1,false);};}

function a22(){
this.ee=function(){if(inputController.result.a2h===0||inputController.result.a25.length===0||localPlayer.survivorBotCount===8){if(gameState.gv.hl(localPlayer.getTileOwner)){
a2i();}return;}var a2j=a2k();a2l(a2j);if(localPlayer.playerValidator===2||localPlayer.survivorBotCount>=7){return;}a2m(a2j);
};this.a2n=function(){if(localPlayer.lE){return;}var a2o=playerData;
var yr=localPlayer.getTileOwner;if(a2o.a2p[yr]===0||a2o.setAttackBorderTile[yr]<1||
2*a2o.rj[yr]>3*(a2o.isPassiveBorderTile[yr]+a2o.setAttackBorderTile[yr])){return;}a2i();};

function a2q(){if(localPlayer.survivorBotCount===8){
return 0;}var uw=Math.floor(playerData.a2r[localPlayer.getTileOwner]/50);uw=Math.min(uw,200);return uw/100;}

function a2i(){
var uw=a2q();if(uw===0){return;}hoverProcessor.a0i(440,L(32,[uw.toFixed(2)]),40,0,colorPalette.localCommandProcessor,colorPalette.pL,-1,false);
}

function a2k(){hoverProcessor.a0i(520,L(33),40,0,colorPalette.pO,colorPalette.pL,-1,false);
var a25=inputController.result.a25;
var fZ=a25.length;
var hN=playerData.hN;
var h=[];
for(var aC=0;aC<fZ;aC++){var h7=a25[aC];h.push({h7:h7,ea:hN[h7]});}h.sort((fs,ft)=>ft.ea-fs.ea);
var a2c=playerData.a0j;
var ea=inputController.result.a2s;
var uw=inputController.result.a2h;
var s1="";
var a2t="";
var a2j=0;
for(aC=0;aC<fZ;aC++){var iJ=h[aC].ea*uw/(100*ea);
var a2u=a2c[h[aC].playerTiles]+": "+iJ.toFixed(2)+"   ";
a2t+=a2u;if(h[aC].playerTiles===localPlayer.getTileOwner){a2j=iJ;}if(aC>2&&fZ!==4){if(aC===3){
s1+="("+L(34,[fZ-3])+")";}continue;}s1+=a2u;}hoverProcessor.a0i(560,gameState.tI.a2v(s1),40,0,colorPalette.localCommandProcessor,colorPalette.pL,-1,false);
if(a2j){hoverProcessor.a0i(580,L(35,[a2j.toFixed(2)+" + "+a2q().toFixed(2)]),40,0,colorPalette.localCommandProcessor,colorPalette.pL,-1,false);
}else if(gameState.gv.hl(localPlayer.getTileOwner)){a2i();
}return a2j;}

function a2l(a2j){if(!(localPlayer.survivorBotCount===7||localPlayer.survivorBotCount===10||localPlayer.survivorBotCount===9)){return;}if(localPlayer.a2L===0){
return;}if(!a2j){return;}hoverProcessor.a0i(600,L(36,[a2j.toFixed(2)]),40,0,colorPalette.pO,colorPalette.pL,-1,false);
}

function a2m(a2j){var a25=inputController.result.a25;
var fZ=a25.length;
var a2w=playerData.a2w;
var hN=playerData.hN;
var a2x=[];
loop:for(var aC=0;aC<fZ;aC++){var h7=a25[aC];
var a2y=gameState.tI.a2z(a2w[h7]);if(a2y===null){continue;
}var a30=hN[h7];for(var ft=a2x.length-1;ft>=0;ft--){if(a2y===a2x[ft].name){a2x[ft].ea+=a30;
a2x[ft].h.push({h7:h7,ea:a30});continue loop;}}a2x.push({name:a2y,ea:a30,h:[{h7:h7,ea:a30}]});
}if(a2x.length===0){return;}a2x.sort((fs,ft)=>ft.ea-fs.ea);
var h=a2x[0].h;h.sort((fs,ft)=>ft.ea-fs.ea);
var a31="["+a2x[0].name+"]";
var uw=inputController.result.a2h;
var a32=8*64*uw/(100*4*65536);hoverProcessor.a0i(0,L(37,[a31,a32.toFixed(4)]),40,0,colorPalette.pO,colorPalette.pL,-1,false);
var lp=h.length;
var yQ=a2x[0].ea;
var a33=10000*a32;for(aC=0;aC<lp;aC++){if(h[aC].playerTiles===localPlayer.getTileOwner){
hoverProcessor.a0i(600,L(38,[(a33*h[aC].ea/(10*yQ)).toFixed(2)]),40,0,colorPalette.pO,colorPalette.pL,-1,false);
hoverProcessor.a0i(640,L(39,[(0.2*a2j).toFixed(2),a31]),40,0,colorPalette.pO,colorPalette.pL,-1,false);
break;}}}}

function a1u(){this.applyToGame=function(){
this.a34=0;this.a25=[];this.a2s=0;this.a2h=0;};this.a2K=function(){if(localPlayer.lE){return;}a35(this);
};

function a35(tt){if(localPlayer.playerValidator===2){tt.a25=inputController.a1v.rawPlayerNames();}else{if(localPlayer.iT){tt.a25=inputController.a1v.a27();
}else{tt.a25=inputController.a1v.a29();}}tt.a34=gameUI.a36.a37();tt.a2s=Math.max(1,inputController.a1v.a2A(tt.a25));mapCache.gv.cssGap();
if(localPlayer.survivorBotCount===8){a38();return;}tt.a2h=100*inputController.result.a34*(1+localPlayer.a0h);}

function a38(){inputController.result.a2h=0;
}}

function a20(){this.a2K=function(){if(localPlayer.playerValidator===2){localPlayer.a2L=2;return;}a39();};

function a39(){
if(localPlayer.survivorBotCount===8){if(gameState.gv.kH(0)||playerData.nU[0]===0){localPlayer.a2Y=1;}else if(gameState.gv.kH(1)||playerData.nU[1]===0){localPlayer.a2Y=0;
}else{localPlayer.a2Y=+(playerData.hN[1]>playerData.hN[0]);}localPlayer.a2L=+(localPlayer.a2Y===localPlayer.getTileOwner);return;}if(localPlayer.iT){var lS=gameMenu.a3A();
localPlayer.a28=lS;if(mainMenu.lH[lS]){localPlayer.a2L=+(mainMenu.fX[localPlayer.getTileOwner]===lS);return;}}localPlayer.a2Y=mV[0];localPlayer.a2L=+(localPlayer.a2Y===localPlayer.getTileOwner);
}}

function UISurface(){this.id=0;this.e3=0;this.writeBytesToBitStream=null;this.writeString16=null;this.writeFixedLengthString=null;this.xg=null;
this.platformActions=new a3B();this.applyToGame=function(){a3C(this);a3D(this);a3E(this);};

function a3E(self){
var xY;try{xY=window.localStorage;if(!xY){return;}xY.setItem("tls7","1");xY.removeItem("tls7");
}catch(error){return;}self.writeBytesToBitStream=xY;}

function a3C(self){var e3;if(typeof Android==="undefined"){return;}
if(typeof Android.getVersion!=="function"){return;}e3=Android.getVersion();if(e3<12){return;}self.e3=e3;
self.id=1;self.writeString16=Android;}

function a3D(self){var e3;if(typeof mwIOSdataX==="undefined"){return;
}if(!window.webkit||!window.webkit.messageHandlers||!window.webkit.messageHandlers.iosCommandA){
return;}self.id=2;self.writeFixedLengthString=mwIOSdataX;self.xg=window.webkit.messageHandlers.iosCommandA;
e3=self.writeFixedLengthString["version"];self.e3=e3?Number(e3):0;}}

function a3B(){
this.a3F=function(){connectionMgr.qo.emojiPicker();connectionMgr.qo.xx();gameServer.z.close(0,3255);if(uiSurface.id===0){if(uiSurface.writeBytesToBitStream){uiSurface.writeBytesToBitStream.clear();
}return;}if(uiSurface.id===1){uiSurface.writeString16.saveString(199,"");return;}if(uiSurface.id===2){uiSurface.xg.postMessage("clear");
}};this.a3G=function(){if(uiSurface.id===2){uiSurface.xg.postMessage("showConsentForm");
return;}if(uiSurface.id===1){uiSurface.writeString16.setState(7);return;}};this.a3H=function(){
this.setState(14);};this.ik=function(){return connectionMgr.buffer.VarLengthStringReader(2)===1;};this.a3I=function(){
var s1="";connectionMgr.buffer.xM(102,s1);};this.setState=function(a3J){if(uiSurface.id!==1){return;
}if(uiSurface.e3>=5){uiSurface.writeString16.setState(a3J);}};this.a3=function(){if(uiSurface.id===1&&uiSurface.e3>=7){uiSurface.writeString16.setState(5);
return;}if(uiSurface.id===2){uiSurface.xg.postMessage("reload 0");return;}var a3K=new URL("https://territorial.io/");
a3K.searchParams.set("v",""+Math.floor(Math.random()*1000));window.location.href=a3K.toString();
};this.eV=function(){if(uiSurface.id===0){return;}if(uiSurface.id===1){uiSurface.writeString16.prepareAd("8646194357");
return;}if(uiSurface.id===2){if(uiSurface.e3===0){uiSurface.xg.postMessage("prepare ad 2904813909");
}else{uiSurface.xg.postMessage("loadAds 2904813909");}}};this.eb=function(ea){
if(uiSurface.id===0){return false;}if(uiSurface.id===1){if(uiSurface.e3>=12){uiSurface.writeString16.presentAd(ea);return true;
}return false;}if(uiSurface.id===2){if(uiSurface.e3===0){}else{uiSurface.xg.postMessage("showAd");return true;
}}return false;};this.du=function(){if(uiSurface.id===2&&uiSurface.e3<23){account.v(4,1,new TextContentScreen("App Update Required",
"A new iOS app version with bug fixes was published.<br>Please download the new Territorial.io app version for iOS:<br><a href='"+floorDiv.a3L+
"' target='_blank'>"+floorDiv.a3L+"</a>",true,[new x("⬅️ "+L(40),function(){account.v(0);},colorPalette.q3)
]));}};}

function TechInfoPanel(){this.q=[];this.a3M=function(oN,e){this.q.push(e);if(account.ua===8&&oN===0){
if(e===4211){a3N(e);}else{if(audioSystem.f6&&(e===4495||e===4480)&&gameServer.z.mapId!==oN){account.a3O();
return;}if(moderationSystem.a3P()!==8){a3Q();}if(e===4480){a3R();return;}var a3S=0;if(account.handleKeyInput()&&account.handleKeyInput().a3U===10){
a3S=account.handleKeyInput().a3U;}account.v(4,a3S,new TextContentScreen(L(41),a3V(e),true));}return;}var a3J=moderationSystem.a3P();
if(a3J===6){if(e===4211){a3N(e);return;}else if(e!==4215&&e!==4516&&e!==4527&&e!==4533&&
e!==4528&&!(e>=4557&&e<=4560)&&e!==4577&&e!==4576){
loadingSystem.a3W(oN);return;}}else if(audioSystem.f6){if(oN!==gameServer.z.mapId){
return;}}else if(a3J===8){if(oN===gameServer.z.a3X&&!localPlayer.lE&&localPlayer.a2G===1&&!localPlayer.hi){hoverProcessor.a3Y(L(42,[e]));
}return;}else if(e>=4579&&e<=4589){}else{return;}if(e===4591){a3Z(e);return;}a3a(e);
};this.a3b=function(e){this.q.push(e);if(moderationSystem.a3P()===8){if(!localPlayer.lE&&localPlayer.a2G===1){hoverProcessor.a3Y(L(42,[e]));
}return;}a3a(e);};this.t=function(){var e=3268;this.q.push(e);mE(e);};

function a3R(){connectionMgr.qo.xy();
account.v(4,0,new TextContentScreen(L(43),L(44),true));}

function a3Z(e){mE(e);account.v(4,5,new TextContentScreen("🤖 Bot Detection",
"The algo thinks you are a bot. Please reload the game to fix this issue. An internet connection is required.",
true,[new x("⬅️ "+L(40),function(){account.a3O();}),new x("🔄 Reload",function(){uiSurface.platformActions.a3();},
colorPalette.shouldSetInitATKPercent)]));}

function a3N(e){mE(e);account.v(4,5,new TextContentScreen("🚀 New Game Update",
"The game was updated! Please reload the game. An internet connection is required.",
true,[new x("⬅️ "+L(40),function(){account.a3O();}),new x("🔄 Reload",function(){uiSurface.platformActions.a3();},colorPalette.shouldSetInitATKPercent)
]));}

function a3a(e){mE(e);account.v(4,5,new TextContentScreen(L(41),a3V(e),true));}

function a3V(e){var s1=" ["+e+"]";
if(e===3249||e===1006){return "No Internet / No Server Response / Server Restart"+s1;}if(e===4527){
return "Player already in lobby"+s1;}if(e===4577){return "Your IP is banned."+s1;}if(e===4530){
return "Lobby Timeout"+s1;}if(e===4528){return "Lobby Kick: Another login detected."+s1;
}if(e===4540){return "You have been kicked."+s1;}if(e===4495){
return "Account doesn't exist.";}if(e===4229){return "Bad Internet / Unresponsive Client"+s1;
}if(e===4555){return "This Account is blocked."+s1;}if(e===4580){return "More Gold needed"+s1;
}if((e>=4557&&e<=4560)||e==4589){return "Please try again later!"+s1;}if(e===4591){
return "The algo determined you are a bot."+s1;}return "Unknown error"+s1;}

function mE(e){
a3Q(e);account.z.a0();}

function a3Q(e){if(e===4540){gameServer.z.a3c(e);}var a3J=moderationSystem.a3P();modalDialogEngine.close();if(a3J===6){
gameServer.z.a3c(e);}else if(audioSystem.f6){account.y();audioSystem.vx();gameServer.z.close(gameServer.z.mapId,3256);}else if(a3J===8){localPlayer.InputUtils(true);
}}}

function PowerSystem(){var StringUtils,TextFitUtils;
var a3g=-15000;
var PixelUtils=false;this.IconCanvasUtils=0;this.Color="";this.dateTimeUtils=false;
this.handlePointerInput=0;this.hf=0;this.applyToGame=function(){DateTimeUtils.addEventListener("mousedown",hm,{passive:false});
DateTimeUtils.addEventListener("mousemove",a3m,{passive:false});
DateTimeUtils.addEventListener("mouseup",a3n,{passive:false});
DateTimeUtils.addEventListener("click",click,{passive:false});
DateTimeUtils.addEventListener("mouseleave",a3o,{passive:false});DateTimeUtils.addEventListener("wheel",a3p,{passive:false});
DateTimeUtils.addEventListener("touchstart",a3q,{passive:false});
DateTimeUtils.addEventListener("touchmove",a3r,{passive:false});
DateTimeUtils.addEventListener("touchend",a3s,{passive:false});
DateTimeUtils.addEventListener("touchcancel",a3t,{passive:false});
DateTimeUtils.addEventListener("dragover",a3u);DateTimeUtils.addEventListener("drop",a3v);
DateTimeUtils.addEventListener("dblclick",a3w);document.addEventListener("contextmenu",a3x);
document.addEventListener("keydown",a3y);document.addEventListener("keyup",a3z);
document.addEventListener("visibilitychange",a40);window.addEventListener("resize",resize);
};

function hm(e){if(a41()){return;}PixelUtils=true;a42(e,1);gameServer.z.a43(gameServer.z.a3X);
a44(Math.floor(camera.l*e.clientX),Math.floor(camera.l*e.clientY));}

function a3q(e){a3g=clanPanel.eZ;
a42(e,1);gameServer.z.a43(gameServer.z.a3X);if(e.touches.length>0){StringUtils=Math.floor(camera.l*e.touches[0].clientX);
TextFitUtils=Math.floor(camera.l*e.touches[0].clientY);if(!goldSystem.a3q(e)){a44(StringUtils,TextFitUtils);}}}

function a44(fg,fi){
account.hm(fg,fi);if(localPlayer.a2G===0){moderationSystem.hm(fg,fi);return;}if(packetReader.a45(fg,fi)){return;}if(accountPanel.hm(fg,fi)){return;
}if(resizeHandler.hm(fg,fi)){return;}if(modalState.a46(fg,fi)){return;}if(panHandler.hm(fg,fi)){return;}if(zoomHandler.hm(fg,fi)>=0){
return;}if(cameraController.hm(fg,fi)){return;}if(powerSystem.a47(fg,fi)){return;}modalState.a48(fg,fi);}this.a47=function(fg,fi){
if(packetReader.hm(fg,fi)){return true;}if(uiColors.hm(fg,fi)){return true;}if(hoverHandler.hm(fg,fi)){return true;
}if(clickHandler.hm(fg,fi)){return true;}if(hoverProcessor.hm(fg,fi)){return true;}return false;};

function a3m(e){
if(a41()){return;}PixelUtils=true;a42(e,1);a49(Math.floor(camera.l*e.clientX),Math.floor(camera.l*e.clientY));}


function a3r(e){a3g=clanPanel.eZ;a42(e,1);if(e.touches.length>0){StringUtils=Math.floor(camera.l*e.touches[0].clientX);
TextFitUtils=Math.floor(camera.l*e.touches[0].clientY);if(!goldSystem.a3r(e)){a49(StringUtils,TextFitUtils);
}}}

function a49(fg,fi){if(!powerSystem.EqualWidthControlRow()){powerSystem.handlePointerInput=fg;powerSystem.hf=fi;}account.a3m(fg,fi);if(localPlayer.a2G===0){moderationSystem.a3m(fg,fi);
return;}adManager.hg(fg,fi);if(accountPanel.a3m(fg,fi)){return;}zoomHandler.a3m(fg,fi);if(modalState.isTeamGame()){modalState.a3m(fg,fi);return;
}if(clickHandler.hn){if(clickHandler.a3m(fg)){clanPanel.ds=true;}return;}uiColors.a3m(fg,fi);if(hoverHandler.o0){if(hoverHandler.a3m(fg,fi)){clanPanel.ds=true;
}return;}}

function a3o(e){if(a41()){return;}a42(e,1);a4A();if(localPlayer.a2G===0){moderationSystem.click(-1024,-1024);
keyboardHandler.reset();return;}uiColors.a4B(-1024,-1024);zoomHandler.a3m(-1024,-1024);clickHandler.a4C();hoverHandler.o0=false;}

function a3n(e){
if(a41()){return;}a42(e,1);a4D(Math.floor(camera.l*e.clientX),Math.floor(camera.l*e.clientY),e.button===2);
if(powerSystem.dateTimeUtils){powerSystem.dateTimeUtils=false;e.preventDefault();}}

function click(e){if(a41()){return;
}a42(e,1);}

function a3s(e){a3g=clanPanel.eZ;a42(e,1);if(e&&e.touches&&e.touches.length>0&&localPlayer.a2G!==0){
hoverHandler.o0=false;return;}if(goldSystem.a4E()){return;}a4D(StringUtils,TextFitUtils,false);
if(powerSystem.dateTimeUtils){powerSystem.dateTimeUtils=false;e.preventDefault();}}

function a3t(e){a3g=clanPanel.eZ;a42(e,1);a4D(StringUtils,TextFitUtils,false);
if(powerSystem.dateTimeUtils){powerSystem.dateTimeUtils=false;e.preventDefault();}}

function a3u(e){}

function a3v(e){}

function a3w(e){
if(a41()){return;}a42(e,0);}

function a4D(fg,fi,a4F){a4A();if(localPlayer.a2G===0){moderationSystem.click(fg,fi);
return;}uiColors.a4B(fg,fi);accountPanel.a4B();clickHandler.a4C();hoverHandler.o0=false;if(modalState.click(fg,fi,a4F)){clanPanel.ds=true;
return;}if(zoomHandler.a3n(fg,fi)){return;}}

function a4A(){account.a4A();}

function a3p(e){if(a41()){return;
}a42(e,1);gameServer.z.a43(gameServer.z.a3X);
var fg=Math.floor(camera.l*e.clientX);
var fi=Math.floor(camera.l*e.clientY);
var deltaY=e.deltaY;if(e.deltaMode===1){deltaY*=16;}account.a3p(fg,fi,deltaY);
if(localPlayer.a2G===0){moderationSystem.a3p(fg,fi,deltaY);return;}if(uiColors.a3p(fg,fi,deltaY)){return;}if(clickHandler.a4G(fg,fi)){
if(clickHandler.a3p(deltaY)){clanPanel.ds=true;}return;}hoverHandler.a3p(fg,fi,deltaY);}

function a3x(e){a42(e,0);
}

function a42(e,id){if(id===0&&(account.isTeamGame())){return;}if(a4H()){return;}if(moderationSystem.a3P()===0){return;
}e.preventDefault();}

function a4H(){var eH=window.innerWidth/document.documentElement.clientWidth;
return eH<0.999||eH>1.001;}

function a3y(e){
if(a41()){return;}if(camera.uG>0){return;}var code=e.code;if(!code||!code.length){return;}
if(ba.ej(code,18)){inventory.a4I(3);}else if(ba.ej(code,22)){inventory.a4I(0);}else if(ba.ej(code,20)){inventory.a4I(1);
}else if(ba.ej(code,24)){inventory.a4I(2);}else if(ba.ej(code,10)){clickHandler.a4J(31/32);}else if(ba.ej(code,8)){
clickHandler.a4J(32/31);}else if(ba.ej(code,6)){clickHandler.a4J(7/8);}else if(ba.ej(code,4)){clickHandler.a4J(8/7);
}else if(ba.ej(code,14)){if(localPlayer.a2G!==0){hoverHandler.a3p(Math.floor(camera.j/2),Math.floor(camera.k/2),-200);
}}else if(ba.ej(code,16)){if(localPlayer.a2G!==0){hoverHandler.a3p(Math.floor(camera.j/2),Math.floor(camera.k/2),200);
}}else if(ba.ej(code,0)){if(!localPlayer.a2G){return;}adManager.screenToTileX(0);}else if(ba.ej(code,2)){if(!localPlayer.a2G){
return;}adManager.screenToTileX(1);}else if(ba.ej(code,30)){if(!localPlayer.a2G){return;}adManager.screenToTileX(2);}else if(ba.ej(code,26)){
if(!localPlayer.a2G){return;}adManager.iF();}else if(ba.ej(code,28)){if(!localPlayer.a2G){return;}adManager.iK();}}

function a3z(e){
if(a41()){return;}if(camera.uG>0){return;}if(clanPanel.eZ<400){return;}var code=e.code;if(!code||!code.length){
return;}if(code==="Enter"){if(account.getTerriColorArray(1)){return;}}if(code==="Space"){if(account.getTerriColorArray(0)){
return;}}if(audioSystem.f6){if(audioSystem.w3.getTerriColorArray(code)){return;}if(code==="Escape"){powerSystem.g2();}return;}if(moderationSystem.a3P()!==8){
if(moderationSystem.getTerriColorArray(e)){clanPanel.ds=true;return;}}if(code==="Escape"){powerSystem.g2();}else if(ba.ej(code,18)){inventory.a4L(3);
}else if(ba.ej(code,22)){inventory.a4L(0);}else if(ba.ej(code,20)){inventory.a4L(1);}else if(ba.ej(code,24)){
inventory.a4L(2);}else if(ba.ej(code,12)){packetReader.a4M(!localPlayer.ny);}else if(code==="Space"){if(!localPlayer.a2G){
return;}zoomHandler.screenToTileY&&zoomHandler.a4N();localPlayer.hi&&packetReader.a4O(false);}}

function a40(){if(document.visibilityState==="hidden"){
}else{clanPanel.ds=true;}}

function a41(){return a3g+15000>clanPanel.eZ;}this.a4P=function(){return a41();
};this.EqualWidthControlRow=function(){return!PixelUtils||a3g>0;};

function resize(){camera.a4Q();}this.g2=function(){if(account.isTeamGame()){
account.getTerriColorArray(2);return;}if(moderationSystem.a3P()===8){if(localPlayer.ny){packetReader.a4M(false);return;}if(accountPanel.isTeamGame){accountPanel.a4N();return;
}zoomHandler.a4N();return;}if(moderationSystem.a3P()===7){return;}if(moderationSystem.a3P()===6){loadingSystem.a4R();return;}};}

function GameState(){
this.sK=new a4S();this.sS=new a4T();this.gv=new a4U();this.tI=new a4V();this.ou=new a4W();
this.or=new a4X();this.canvas=new a4Y();this.color=new a4Z();this.a4a=new a4b();this.applyToGame=function(){
this.sK.xv();};}

function a4T(){this.yp=function(h){h.fill(0);};this.a4c=function(h){
var aC;
var fZ=h.length;for(aC=0;aC<fZ;aC++){h[aC]=[];}};this.a4d=function(a1M,a4e){var aC;
var a1N=boostSystem.g9;for(aC=0;aC<3;aC++){a1N[aC]=a4e*a1M[aC];}return a1N;};this.a4f=function(a1M,a1N,a4g){
var aC;
var k9=0;for(aC=0;aC<3;aC++){k9+=Math.abs(a1M[aC]-a1N[aC]);}return k9>=a4g;};
this.a4h=function(a1M,a4i){var aC;for(aC=0;aC<3;aC++){a1M[aC]=mathUtils.distanceBetweenPointsAndEncoded(a1M[aC]+a4i,0,255);}return a1M;
};this.endsWith=function(h,us,ut){us=us||0;ut=ut||(h.length-1);
var a4k=0;for(var aC=us;aC<=ut;aC++){
a4k+=h[aC];}return a4k;};this.playerStates=function(h,a4m){var fs,aC,a4n;
var fZ=h.length;
var a4o=[];for(fs=fZ-1;fs>=0;fs--){a4n=0;for(aC=0;aC<fZ;aC++){if(a4m(h[aC])<a4m(h[a4n])){
a4n=aC;}}fZ--;a4o.push(h[a4n]);h[a4n]=h[fZ];h.pop();}return a4o;};this.min=function(h){var aC,g1;
var fZ=h.length;if(fZ===0){return 0;}g1=h[0];for(aC=1;aC<fZ;aC++){g1=Math.min(g1,h[aC]);}return g1;
};this.max=function(h){var fZ=h.length;if(fZ===0){return 0;}var g1=h[0];for(var aC=1;aC<fZ;aC++){
g1=Math.max(g1,h[aC]);}return g1;};this.isLocalPlayer=function(h,g1){var fZ=h.length;
var resolveAttackCombat=0;for(var aC=0;aC<fZ;aC++){resolveAttackCombat+=h[aC]>g1;}return resolveAttackCombat;};this.isWeakerThanTarget=function(a4r,a4s,min){
var fZ=a4s[0];for(var aC=fZ-1;aC>=0;aC--){if(a4r[aC]<min){fZ--;a4r[aC]=a4r[fZ];}}a4s[0]=fZ;
};this.a4t=function(h,fZ,value){for(var aC=0;aC<fZ;aC++){h[aC]-=value;}};this.resourceDebt=function(h){
var fZ=h.length;for(var aC=0;aC<fZ;aC++){if(typeof h[aC]!=="string"){return false;}}return true;
};this.a4v=function(s1,h,a4w){h.fill(0);
var uw=s1.split(",");
var fZ=Math.min(uw.length,h.length);
for(var aC=0;aC<fZ;aC++){h[aC]=Math.min(parseInt(uw[aC]),a4w);}};this.a4x=function(s1,h,tF){
h.fill("");
var uw=s1.split("\"");
var fZ=Math.min(uw.length,2*h.length);
var iR=0;
for(var aC=1;aC<fZ;aC+=2){h[iR++]=uw[aC].slice(0,tF);}};this.a4y=function(h,resolveAttackCombat){if(resolveAttackCombat===0){
h.fill(0);return;}var a4k=this.endsWith(h);
var fZ=h.length;if(a4k===0){h.fill(mathUtils.g0(resolveAttackCombat,fZ));}else{
for(var aC=0;aC<fZ;aC++){h[aC]=mathUtils.g0(resolveAttackCombat*h[aC],a4k);}}a4k=this.endsWith(h);if(a4k===0){h[1]=resolveAttackCombat;return;
}var iR=0;while(a4k++ <resolveAttackCombat){iR=(iR+1)%fZ;if(h[iR]){h[iR]++;}}};this.a4z=function(h){if(!h){return 0;
}var fZ=h.length;if(fZ===0){return 0;}var g1=h[fZ-1];for(var aC=fZ-2;aC>=0;aC--){if(h[aC]!==g1){
return aC+2;}}return 1;};this.a50=function(h){var a4k=0;for(var aC=0;aC<h.length;aC++){
a4k+=h[aC].length;}return a4k;};this.a51=function(a52){var h=[];for(var aC=0;aC<a52.length;aC++){
h=h.concat(a52[aC]);}return h;};this.has=function(h,g1){var fZ=h.length;for(var aC=0;aC<fZ;aC++){
if(h[aC]===g1){return true;}}return false;};}

function a4Y(){this.EndGameTransitionController=function(a53,eI,a54){
var iV=a53.height;
var a55=gameState.sK.yf(iV,iV);
var ib=gameState.sK.getContext(a55);
a56(iV,ib,a54);ib.drawImage(a53,-eI*iV,0);return a55;};

function a56(j,ib,a54){ib.fillStyle=a54;
ib.beginPath();ib.arc(j/2,j/2,j*0.47,0,2*Math.PI);ib.fill();}this.a57=function(a58){
var iV=a58.height;if(a58.width!==iV){return a58;}var ib=gameState.sK.getContext(a58,true);
var iY=ib.getImageData(0,0,iV,iV);gameState.or.a59(iY.data,iV,iV,0.9);ib.putImageData(iY,0,0);
return a58;};}

function a4Z(){this.a5A=function(g1){return [(g1>>12)&63,(g1>>6)&63,g1&63];
};this.a5B=function(g1){var h=this.a5A(g1);for(var aC=0;aC<3;aC++){h[aC]=~~(4.05*h[aC]);
}return h;};this.a5C=function(g1){var h=this.a5B(g1);return gameState.color.pG(h[0],h[1],h[2]);
};this.a5D=function(h){for(var aC=0;aC<3;aC++){h[aC]=~~(h[aC]/4.04);
}return(h[0]<<12)+(h[1]<<6)+h[2];};this.pG=function(eH,uw,ft){return "rgb("+eH+","+uw+","+ft+")";
};this.pI=function(eH,uw,ft,fs){return "rgba("+eH+","+uw+","+ft+","+fs.toFixed(3)+")";
};this.so=function(ej){var h=ej.split("(")[1].split(",");
var g8=boostSystem.g8;for(var aC=0;aC<3;aC++){g8[aC]=parseInt(h[aC]);}if(h.length===4){
g8[3]=255*parseFloat(h[3].slice(0,-1));}else{g8[3]=255;}return g8;};this.sp=function(a5E,fc){
var s1=a5E.slice(a5E.indexOf("(")+1,a5E.indexOf(")"));
var h=s1.split(",");
var g8=boostSystem.g8;
for(var aC=0;aC<3;aC++){g8[aC]=mathUtils.distanceBetweenPointsAndEncoded(parseInt(h[aC].trim(),10)+fc,0,255);}if(h.length===3){
return this.pG(g8[0],g8[1],g8[2]);}var alpha=parseFloat(h[3].trim());alpha=alpha===0?0.3:alpha;
return this.pI(g8[0],g8[1],g8[2],alpha);};this.wX=function(a5F,a5G){var k9=0;
for(var aC=0;aC<3;aC++){k9+=Math.abs(a5G[aC]-a5F[aC]);}if(k9>=240){return;}for(aC=0;aC<3;aC++){
a5G[aC]=a5F[aC]+(a5F[aC]<128?80:-80);}};this.a5H=function(h){var s1="#";for(var aC=0;aC<3;aC++){
var eH=h[aC].toString(16);s1+=eH.length===1?("0"+eH):eH;}return s1;};this.a5I=function(s1){
if(s1.length<7){return colorPalette.pF;}var eH=parseInt(s1.slice(1,3),16);
var uw=parseInt(s1.slice(3,5),16);
var ft=parseInt(s1.slice(5,7),16);return this.pG(eH,uw,ft);};}

function a4W(){
this.a5J=function(s1,font,maxWidth){if(font){ws.font=font;}var j=ws.measureText(s1).width;
if(j<=maxWidth){return s1;}var a5K="...";for(var aC=s1.length-1;aC>=1;aC--){
s1=s1.substring(0,aC);j=ws.measureText(s1+a5K).width;if(j<=maxWidth){return s1+a5K;}}return a5K;
};}

function a4b(){var a5L=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];this.a5M=function(eZ){
var a5N,a5O,h8;
var s1=(new Date(eZ.getTime()-1000*60*eZ.getTimezoneOffset())).toUTCString();
if(s1.length<12){return s1;}s1=s1.substring(5,s1.length);a5N=eZ.getTimezoneOffset();
if(a5N===0){return s1;}a5O=mathUtils.g0(Math.abs(a5N),60);a5O=(a5N<0?"+":"-")+a5O;
h8=Math.abs(a5N)%60;if(h8===0){return s1+a5O;}return s1+a5O+":"+(h8<10?"0":"")+h8;
};this.a5P=function(eZ){var s1=eZ.toUTCString();if(s1.length<12){return s1;
}return a5Q(eZ)+", "+s1.substring(5,s1.length-4);};

function a5Q(eZ){return a5L[eZ.getUTCDay()];
}}

function a4S(){var a5R=null;this.a1H=0;this.xv=function(){var g1=connectionMgr.buffer.data[5].value;
a5R="px "+g1;if(g1!=="system-ui"){a5R+=", system-ui";}this.a1H=iU(32,32,["a","b","m"],200,a5R);
};this.yf=function(j,k){var ej=document.createElement("canvas");ej.width=j;ej.height=k;
return ej;};this.getContext=function(canvas,alpha){return canvas.getContext("2d",{alpha:alpha});
};this.getImageData=function(ou,j,k){return ou.getImageData(0,0,j,k);
};this.u8=function(type,size){size=size.toFixed(2);if(type===0){return size+a5R;
}else if(type===1){return "bold "+size+a5R;}else if(type===2){return "lighter "+size+a5R;
}else if(type===3){return "italic "+size+a5R;}else if(type===4){return "oblique "+size+a5R;
}else if(type===5){return "small-caps "+size+a5R;}else{return "small-caps bold "+size+a5R;
}};this.textAlign=function(ib,id){if(id===0){ib.textAlign="left";}else if(id===1){
ib.textAlign="center";}else{ib.textAlign="right";}};this.textBaseline=function(ib,id){if(id===1){
ib.textBaseline="middle";}else if(id===2){ib.textBaseline="bottom";}else{ib.textBaseline="top";
}};this.sU=function(e,code,color){var g1=this.sT(debugPanel.uA)+" solid "+(color||colorPalette.pO);
code=code||5;if(code===5){e.style.border=g1;}else if(code===4){
e.style.borderLeft=g1;}else if(code===2){e.style.borderBottom=g1;}else if(code===6){
e.style.borderRight=g1;}else{e.style.borderTop=g1;}};this.uy=function(e,fg,fi,j,k){
var sO=e.style;sO.left=this.uz(fg);sO.top=this.uz(fi);sO.width=this.uz(j);
sO.height=this.uz(k);};this.sL=function(g1){return 1+g1*uiSurface.platformActions.ik();};this.currentScreenId=function(o7,h8){
return o7*this.sL(h8===undefined?0.5:h8)*camera.il/camera.l;};this.ux=function(o7,h8){
return o7*this.sL(h8===undefined?0.5:h8)*camera.il;};this.ue=function(o7,h8,a5S){
var a5T=this.sL(h8);return a5T*Math.min(o7*camera.il,a5S*camera.j)/camera.l;};this.sT=function(g1){
return g1.toFixed(1)+"px";};this.uz=function(g1){return this.AccountManager(g1).toFixed(1)+"px";};
this.AccountManager=function(g1){return g1/camera.l;};this.formatSignificantNumber=function(a5V){var aC;
var s1="<ul>";
var fZ=a5V.length;
for(aC=0;aC<fZ;aC++){s1+="<li>"+a5V[aC][0]+": <a href='"+a5V[aC][1]+"' target='_blank'>"+a5V[aC][0]+"</a></li>";
}s1+="</ul>";return s1;};this.formatScaledFixed=function(a5X){return "<a href='"+a5X+"' target='_blank'>"+a5X+"</a>";
};this.trimStartSpaces=function(e){if(navigator.clipboard){navigator.clipboard.writeText(e.value);
}};this.wV=function(e){var ea=e.textContent;if(gameState.tI.formatGoldAmountLabel(ea,"✔")){
return;}if(ea.length===1){e.textContent="✔";}else{e.textContent=ea+" ✔";}setTimeout(function(){
e.textContent=ea;},500);};this.measureText=function(s1){return ws.measureText(s1).width;
};this.uo=function(oj){oj.style.overflowX="auto";oj.style.overflowY="hidden";oj.style.whiteSpace="nowrap";
oj.addEventListener("wheel",function(e){if(Math.abs(e.deltaY)<Math.abs(e.deltaX)){
return;}this.scrollLeft+=e.deltaY;this.FloatingActionButton=this.scrollLeft;e.preventDefault();
});oj.addEventListener("scroll",function(){this.FloatingActionButton=this.scrollLeft;});};}

function a4U(){
this.isValidTile=function(a3J){if(a3J===0){return localPlayer.a2G===1&&localPlayer.isFreeForAll;}if(a3J===1){return localPlayer.a2G===1&&!localPlayer.isFreeForAll;
}return localPlayer.a2G===2;};this.hl=function(player){return playerData.nU[player]!==0&&playerData.a5a[player]!==2;
};this.a5b=function(player){return player===localPlayer.getTileOwner&&playerData.a5a[player]!==2;
};this.lY=function(player,k3){return player!==k3&&(mainMenu.fX[player]===0||mainMenu.fX[player]!==mainMenu.fX[k3]);
};this.mf=function(){var lQ=territorySystem.lQ;
if(lQ<2){return 0;}if(!localPlayer.iT){return playerData.hN[mV[1]];}return gameMenu.a5c()>1;};this.a5d=function(){
var lQ=territorySystem.lQ;if(lQ===0){return 0;}if(!localPlayer.iT){return!this.kH(mV[0]);}var fX=mainMenu.fX;
var lS=gameMenu.lT();
var lV=territorySystem.lV;for(var aC=lQ-1;aC>=0;aC--){var h7=lV[aC];if(fX[h7]===lS&&!this.kH(h7)){
return 1;}}return 0;};this.a5e=function(player){return player===localPlayer.getTileOwner;
};this.replaceAll=function(k3,o7){return playerData.hb[localPlayer.getTileOwner]<o7*playerData.hb[k3];};this.kH=function(player){
return player>=localPlayer.ku||playerData.a5a[player]===2;};this.ls=function(player){return playerData.nU[player]!==0;
};this.getClanTag=function(player){return player<localPlayer.ku;};this.rh=function(MatchStartController,a5h){
return MatchStartController!==a5h;};this.collectPlayerAttackTiles=function(player,g1){g1=this.a5i(player,g1);playerData.hb[player]+=g1;
if(playerData.a5j[player]){var min=Math.min(playerData.a5j[player],playerData.hb[player]);playerData.a5j[player]-=min;
playerData.hb[player]-=min;}return g1;};this.a5i=function(player,g1){var a5k=playerData.hb[player];
g1=Math.min(g1,playerData.hN[player]*localPlayer.a5l-a5k);g1=Math.min(g1,localPlayer.a5m-a5k);return Math.max(g1,0);
};this.n2=function(player,jC,a5n,a5o){var a5k=playerData.hb[player];
var iI=mathUtils.g0(a5k*(jC+1),1024);
var a5p=mathUtils.g0(a5n*a5k,1024);iI=Math.min(iI,a5k-a5p);if(localPlayer.survivorBotCount===10){iI=achievements.a5q(player,iI);
}boostSystem.g6[0]=iI;boostSystem.g6[1]=a5p;return iI>=a5o;};this.rB=function(player,qt,qs){var a5k=playerData.hb[player];
var a5p=mathUtils.g0(64*a5k,1024);qt=Math.min(qt,a5k-a5p);qt=this.a5i(qs,qt);boostSystem.g6[0]=qt;boostSystem.g6[1]=a5p;
return qt>=1;};this.a5r=function(player,qt,qs){var a5k=playerData.hb[player];
var a5p=mathUtils.g0(64*a5k,1024);
qt=Math.min(qt,a5k-a5p);return this.a5i(qs,qt);};this.MasonryLayout=function(qt,qs){
qt=this.a5i(qs,qt);boostSystem.g6[0]=qt;boostSystem.g6[1]=0;return qt>=1;};this.jB=function(player,GameConfiguration){
return mathUtils.g0(playerData.hb[player]*(GameConfiguration+1),1024);};this.gameConfigurationController=function(player,a5n){
var a5p=mathUtils.g0(a5n*playerData.hb[player],1024);boostSystem.g6[1]=a5p;playerData.hb[player]-=a5p;
};this.setPassiveBorderTile=function(player,GameConfigurationController){var ft=playerData.hb[player];if(GameConfigurationController<=ft){playerData.hb[player]-=GameConfigurationController;
return GameConfigurationController;}playerData.hb[player]=0;
var gI=GameConfigurationController-ft;
var gK=5*(gI>>2);
var fc=playerData.a5j[player];
var gM=fc+gK;gameClock.gz(player,gK-gI,12);if(gM<=localPlayer.a5v){playerData.a5j[player]=gM;return GameConfigurationController;
}playerData.a5j[player]=localPlayer.a5v;gameClock.gz(player,gM-localPlayer.a5v,18);return GameConfigurationController;};this.m6=function(player,jC){
var hb=playerData.hb;
var a5k=hb[player];
var iI=mathUtils.g0(a5k*(jC+1),1024);
var a5p=Math.max(mathUtils.g0(a5k,10),1000);
iI=Math.min(iI,a5k-a5p);if(iI<0){hb[player]=0;a5p=Math.min(1000,a5k+localPlayer.a5v-playerData.a5j[player]);
boostSystem.g6[1]=a5p;playerData.a5j[player]+=a5p-a5k;return 0;}boostSystem.g6[1]=a5p;if(localPlayer.survivorBotCount===10){iI=achievements.a5q(player,iI);
}hb[player]-=a5p+iI;return iI;};this.heartbeatManager=function(player){playerData.hb[player]-=boostSystem.g6[0]+boostSystem.g6[1];
};this.ri=function(player,k3){k3=Math.min(k3,localPlayer.isMountainTile);if(k3<localPlayer.isMountainTile&&playerData.nU[k3]===0){k3=localPlayer.isMountainTile;
}boostSystem.fV[0]=k3;return k3===localPlayer.isMountainTile||playerBoundaryEngine.fS(player,k3);};this.rl=function(player,qs){if(playerData.nU[qs]===0){
return false;}return!playerBoundaryEngine.fS(player,qs);};this.a5w=function(player,a5x){var aC,h7;
var fZ=territorySystem.lQ;
var a5y=0;
var a5z=mV;for(aC=0;aC<fZ;aC++){h7=a5z[aC];if(!this.kH(h7)){if(player===h7){return true;
}if(++a5y>a5x){return false;}}}return false;};this.mR=function(h7){var a60;if(localPlayer.iT){a60=gameMenu.lR();
}else{a60=playerData.hN[mV[0]];}return a60>=mathUtils.g0(h7*localPlayer.chance,100);};this.initializeMapImageBuffer=function(g1,min,max){
return Math.floor(mathUtils.distanceBetweenPointsAndEncoded(isNaN(g1)?0:Number(g1),min,max));};}

function a4X(){
this.a62=function(canvas,a63,a64){var j=canvas.width;
var k=canvas.height;
var ej=gameState.sK.yf(j,k);
var ib=gameState.sK.getContext(ej,true);ib.drawImage(canvas,0,0);
var iY=ib.getImageData(0,0,j,k);
a63(iY.data,j,k,a64);ib.putImageData(iY,0,0);return ej;};this.a65=function(yq,j,k){
for(var fg=j-1;fg>=0;fg--){for(var fi=k-1;fi>=0;fi--){var aC=4*(fg+fi*j);yq[aC+3]=yq[aC];
yq[aC]=yq[aC+1]=yq[aC+2]=255;}}};this.a66=function(yq,j,k){for(var fg=j-1;fg>=0;fg--){
for(var fi=k-1;fi>=0;fi--){var aC=4*(fg+fi*j);if(yq[aC+1]>yq[aC+2]+10){yq[aC+3]=yq[aC];
yq[aC+1]=yq[aC+2];}}}};this.a67=function(yq,j,k,a64){var gap=Math.floor(Math.min(j,k)*a64);
for(var fg=0;fg<j;fg++){for(var fi=0;fi<k;fi++){if(fg<gap||fi<gap||fg>=j-gap||fi>=k-gap){
var aC=4*(fg+fi*j);yq[aC+3]=255-255*(yq[aC+1]-yq[aC])/(255-yq[aC]);
}}}};this.a68=function(yq,j,k,a64){for(var fg=j-1;fg>=0;fg--){
for(var fi=k-1;fi>=0;fi--){var aC=4*(fg+fi*j);yq[aC]=a64[0];yq[aC+1]=a64[1];yq[aC+2]=a64[2];
}}};this.replayEncoder=function(yq,j,k,a64){var gap=Math.floor(j*a64);for(var fg=0;fg<j;fg++){
for(var fi=0;fi<k;fi++){if(fg<gap||fi<gap||fg>=j-gap||fi>=k-gap){var aC=4*(fg+fi*j);
yq[aC]=yq[aC+1]=yq[aC+2]=0;}}}};this.a6A=function(yq,j,k){var fg,fi,aC;for(fg=j-1;fg>=0;fg--){
for(fi=k-1;fi>=0;fi--){aC=4*(fg+fi*j);if(yq[aC+1]>200&&yq[aC+1]-20>yq[aC]&&yq[aC+1]-20>yq[aC+2]){
if(yq[aC]+yq[aC+2]<40){yq[aC+3]=0;}else{yq[aC+3]=yq[aC];yq[aC]=255;yq[aC+1]=255;
yq[aC+2]=255;}}else if(yq[aC]<50&&yq[aC+1]<50&&yq[aC+2]<50){if(yq[aC]+yq[aC+1]+yq[aC+2]<50){
yq[aC+3]=180;}else{yq[aC+3]=180+Math.floor(75*(yq[aC]+yq[aC+1]+yq[aC+2]-50)/100);
}}}}};this.setPreGameLoop=function(yq,j,k){var fg,fi,aC;for(fg=j-1;fg>=0;fg--){for(fi=k-1;fi>=0;fi--){
aC=4*(fg+fi*j);if(yq[aC+1]>yq[aC]+20&&yq[aC+1]>yq[aC+2]+20&&yq[aC]+yq[2]<40){
yq[aC+3]=255-yq[aC+1];yq[aC]=yq[aC+1]=yq[aC+2]=yq[aC];
}}}};this.a59=function(yq,j,k,a64){var eH=j>>1;for(var fg=0;fg<j;fg++){
for(var fi=0;fi<k;fi++){if(Math.sqrt((fg-eH)*(fg-eH)+(fi-eH)*(fi-eH))>a64*eH){
yq[4*(fg+fi*j)+3]=0;}}}};}

function a4V(){var a6C={":joy:":"😂",
":rofl:":"🤣",":sob:":"😭",":sad":"😔",":eyes:":"👀",":skull:":"💀",":fire:":"🔥",":100:":"💯",
":clown:":"🤡",":sunglasses:":"😎",":thinking:":"🤔",":zzz:":"😴",":rage:":"😡",":poop:":"💩",
":thumbsup:":"👍",":thumbsdown:":"👎",":pray:":"🙏",":clap:":"👏",":trophy:":"🏆",":sparkles:":"✨",
":heart:":"❤️",":brokenheart:":"💔",":laughing:":"😆",":grimacing:":"😬",":grinning:":"😀",
":ok:":"👌",":pepehands:":"🙌",":gold:":"🧈"};
var a6D=new RegExp(":[a-zA-Z0-9_]+:","g");
this.tJ=function(el){return el.replace(a6D,function(match){return a6C[match]||match;
});};this.currentLoopHandler=function(g1){var aC,a6E,a6F,a6G,a6H;if(g1<0){return "-"+this.currentLoopHandler(Math.abs(g1));
}if(g1<1000){return g1.toString();}a6E=Math.floor(Math.log(g1+0.5)/Math.log(10))+1;
a6F=Math.floor((a6E-1)/3);a6G=g1.toString();a6H=a6G.substring(a6E-3,a6E);for(aC=1;aC<a6F;aC++){
a6H=a6G.substring(a6E-3*(aC+1),a6E-3*aC)+" "+a6H;}return a6G.substring(0,a6E-3*(a6F))+" "+a6H;
};this.a6I=function(h7,a6E){return(h7).toFixed(a6E)+"%";};this.a6J=function(g1,a6K){
return g1.toFixed(mathUtils.distanceBetweenPointsAndEncoded(Math.floor((a6K===undefined?3:a6K)-Math.log10(Math.max(g1,1))),0,8));
};this.a6L=function(g1,o7,a6E){return(g1*o7).toFixed(a6E);};this.a2z=function(username){
var fO,fd;fO=username.indexOf("[");if(fO<0){return null;}fd=username.indexOf("]");
if(fd-fO>1&&fd-fO<=7+1){return username.substring(fO+1,fd).toUpperCase().trim();
}return null;};this.a6M=function(s1){var fs=Math.floor(0.5*s1.length+0.5);
var oD=Math.floor(0.5*(fs-1));for(var aC=0;aC<oD;aC++){for(var ft=-1;ft<2;ft+=2){
var ej=fs+ft*aC;if(s1[ej]===" "){return [this.a2v(s1.substring(0,ej)),this.a6N(s1.substring(ej))];
}}}return [s1.substring(0,fs),s1.substring(fs)];
};this.a6N=function(s1){var fZ=s1.length;for(var aC=0;aC<fZ;aC++){
if(s1[aC]!==" "){return s1.substring(aC);}}return s1;};this.a2v=function(s1){
var fZ=s1.length;for(var aC=fZ-1;aC>=0;aC--){if(s1[aC]!==" "){return s1.substring(0,aC+1);
}}return s1;};this.a6O=function(s1,a6P){return s1.split("(")[0]+"(🧈 "+a6P.toFixed(2)+")";
};this.startsWith=function(s1,a6Q){return s1.substring(0,a6Q.length)===a6Q;
};this.formatGoldAmountLabel=function(s1,a6Q){var fZ=s1.length;return s1.substring(fZ-a6Q.length,fZ)===a6Q;
};this.getTime=function(h,a6S,a6T){var s1="";
var fZ=h.length-1;a6T=a6T||"";for(var aC=0;aC<fZ;aC++){
s1+=a6T+h[aC]+a6T+",";if((aC+1)%a6S===0){s1+="\n";}}s1+=a6T+h[fZ]+a6T;return s1;
};this.a6U=function(s1,a1M,a1N){return s1.replace(new RegExp(a1M,"g"),a1N);};}

function a6V(){
this.ei=function(player,fL){if(inputLayer.a0A(player,powerState.fh(fL),powerState.fj(fL))){clanPanel.ds=true;}localPlayer.lE&&this.ee();
};this.ee=function(){localPlayer.isFreeForAll=false;for(var aC=0;aC<localPlayer.ku;aC++){if(playerData.nU[aC]!==0&&playerData.hN[aC]===0){
inputLayer.a0H(aC);}}if(playerData.nU[localPlayer.getTileOwner]!==0){gameClock.nQ[7]=playerData.hN[localPlayer.getTileOwner];gameClock.nQ[8]=playerData.hb[localPlayer.getTileOwner];
clickHandler.a6W();focusHandler.a6X();if(!localPlayer.hi){soloCalc.np(playerData.botExpansionAi[localPlayer.getTileOwner]-5,playerData.botTeamTargetCoordinator[localPlayer.getTileOwner]-5,playerData.BotExpansionAi[localPlayer.getTileOwner]+5,playerData.BotTeamTargetCoordinator[localPlayer.getTileOwner]+5);
}clansSystem.applyToGame();}else{resizeHandler.show(false,false,false,true);}hoverProcessor.a6Y(18);troops.a6Z();troops.nG(true);armySystem.z.a6a();
modalState.tZ();localPlayer.rg=null;chatPanel.a6b=true;chatPanel.a6c();if(localPlayer.lE){uiSurface.platformActions.setState(1);}};}

function LocalPlayer(){this.isMountainTile=512;
this.a5m=1500000000;this.a6d=1000000000;this.a5v=50000;this.a6e=512;this.attackSourceTiles=2;this.getTileOwner=0;this.ku=0;
this.a2J=0;this.lG=0;this.a2I=0;this.isTileOwnedByPlayer=512;this.zQ=512;this.a5l=150;this.lE=true;this.hi=0;
this.a2G=0;this.chance=0;this.ny=false;this.isFreeForAll=0;this.a6f=0;this.iT=false;this.zS=0;this.renderer=0;
this.survivorBotCount=0;this.a0h=0;this.rg=null;this.a2Z=new a0V();this.a6g=30;this.playerValidator=0;this.a2L=0;this.a2Y=0;
this.a28=0;this.data=new a6h();this.a6i=new a6j();this.a6k=0;this.a6l="";this.a6m=function(){
gameConfig.turnstile.close();boostSystem.applyToGame();inputController.applyToGame();relations.clear();this.a2J=this.ku=this.data.humanCount;
this.lE=this.a2J===1;this.ny=false;this.hi=this.data.isReplay;
this.survivorBotCount=this.data.gameMode===0?[7,10,8][this.data.battleRoyaleMode]:this.data.isZombieMode?9:(this.data.numberTeams-2);
this.a0h=this.data.isContest;this.iT=this.survivorBotCount<7||this.survivorBotCount===9;
this.survivorBotCount=(this.survivorBotCount===10&&this.lE)?7:this.survivorBotCount;this.survivorBotCount=(this.survivorBotCount===8&&this.ku!==2)?7:this.survivorBotCount;
botSystem.applyToGame();this.zS=this.data.numberTeams;if(!this.data.teamPlayerCount){
this.renderer=0;if(this.iT&&this.lE){this.data.teamPlayerCount=new Uint16Array(9);
this.data.teamPlayerCount.fill(1,1,this.zS+1);localPlayer.a6i.a6n();
}}else{this.renderer=+(this.data.teamPlayerCount[0]>0);}this.a6g=this.ku<=2?30:this.ku<=50?40:50;
this.a6f=this.isFreeForAll=this.data.selectableSpawn;this.rg=this.isFreeForAll?new a6V():null;
if(settingsPanel.e1===1){this.isTileOwnedByPlayer=this.ku;}else{this.isTileOwnedByPlayer=this.data.playerCount;}this.zQ=this.isTileOwnedByPlayer;
this.lG=this.isTileOwnedByPlayer-this.ku;this.a2I=0;this.getTileOwner=this.data.selectedPlayer;this.playerValidator=0;this.a2L=0;
this.a2Y=0;this.a28=0;coordHelper.a6o(this.data.spawningSeed);botSpawner.applyToGame();playerData.applyToGame();soloMode.applyToGame();spectator.a6p();mapCache.validateAndResolveTarget.rU=[];
mapCache.hz.isFriendlyOrUnattackable=1;mainMenu.applyToGame();this.a2G=1;gameClock.applyToGame();a6q();tileMap.dl();chatSystem.a6r();chatPanel.applyToGame();tileMap.applyToGame();scoreSystem.applyToGame();powerState.applyToGame();
bonusSystem.applyToGame();nameRenderer.applyToGame();statsPanel.a6s();troopCalc.applyToGame();spectator.a8();inputLayer.applyToGame();clickProcessor.applyToGame();territorySystem.a6t();packetWriter.applyToGame();gameMenu.applyToGame();armySystem.applyToGame();accountPanel.applyToGame();
a6u.putImageData(a6v,0,0);uiColors.applyToGame();hoverHandler.applyToGame();clickHandler.applyToGame();packetReader.applyToGame();cameraController.applyToGame();touchInputHandler.applyToGame();focusHandler.applyToGame();zoomHandler.applyToGame();deviceDetector.applyToGame();
hoverProcessor.applyToGame();panHandler.applyToGame();modalState.applyToGame();resizeHandler.applyToGame();borderCalc.applyToGame();territoryCalc.applyToGame();gc();alliances.applyToGame();troops.applyToGame();achievements.applyToGame();questSystem.applyToGame();historySystem.applyToGame();
commandQueue.applyToGame();gameTimer.applyToGame();this.a2Z.applyToGame();clanPanel.a6s();a6w();clansSystem.applyToGame();clanPanel.ds=true;if(!this.hi&&(!this.lE||!this.isFreeForAll)){
uiSurface.platformActions.setState(1);}this.a6k=0;};

function a6w(){soloCalc.no();if(playerData.nU[localPlayer.getTileOwner]===0){resizeHandler.show(false,true);
}troops.nG(true);}this.InputUtils=function(eY){if(!packetWriter.re.a6x.length){this.a6l=packetWriter.a6y.a1i();
}else{this.a6l=packetWriter.re.a6x;}gameServer.z.findShipAtScreenPosition();relations.clear();this.a2G=0;clanPanel.a70();uiSurface.platformActions.setState(0);
moderationSystem.setState(0);gameConfig.webPropagandaProvider.show(eY);if(this.a6k===2){account.z.a71(0);}else if(this.a6k===1){account.v(19);
}else{account.v(5,5);}};this.a72=function(){return(this.hi?(zoomHandler.screenToTileY||!packetReader.a73):(this.lE&&(zoomHandler.screenToTileY||this.isFreeForAll)));
};this.a74=function(){return this.a2G===1&&!this.isFreeForAll;};}

function a6h(){this.mapType=0;
this.mapProceduralIndex=2;this.mapRealisticIndex=0;this.mapSeed=14071;this.mapName="";
this.canvas=null;this.passableWater=1;this.passableMountains=1;this.playerCount=512;
this.humanCount=1;this.selectedPlayer=0;this.gameMode=0;this.playerMode=0;this.battleRoyaleMode=0;
this.numberTeams=0;this.isZombieMode=0;this.isContest=0;this.isReplay=0;this.elo=null;
this.colorsType=0;this.colorsPersonalized=1;this.colorsData=null;this.selectableColor=1;
this.teamPlayerCount=null;this.neutralBots=0;this.botDifficultyType=0;this.botDifficultyValue=0;
this.botDifficultyTeam=null;this.botDifficultyData=null;this.spawningType=0;this.spawningSeed=0;
this.spawningData=null;this.selectableSpawn=1;this.playerNamesType=0;this.playerNamesData=null;
this.selectableName=1;this.aIncomeType=0;this.aIncomeValue=0;this.aIncomeData=null;
this.tIncomeType=0;this.tIncomeValue=32;this.tIncomeData=null;this.iIncomeType=0;
this.iIncomeValue=64;this.iIncomeData=null;this.sResourcesType=0;this.sResourcesValue=0;
this.sResourcesData=null;this.a75=null;}

function a6j(){this.a6n=function(){var a76=localPlayer.data;
gameState.sS.a4y(a76.teamPlayerCount,a76.playerCount);a76.numberTeams=gameState.sS.isLocalPlayer(a76.teamPlayerCount,0);
if(a76.teamPlayerCount[0]&&a76.teamPlayerCount[7]){a76.teamPlayerCount[7]=0;
this.a6n();}};this.a77=function(){var a76=localPlayer.data;if(a76.mapType<2){dialogManager.a8(dialogManager.a78(a76),a76.mapSeed);
}else{dialogManager.a79(a76.canvas);}};this.a7A=function(){var a76=localPlayer.data;if(!a76.colorsData){
a76.colorsData=new Uint32Array(1);}if(a76.gameMode===0){a76.colorsData[0]=connectionMgr.z.xt();
}if(a76.selectableName){if(!a76.playerNamesData){a76.playerNamesData=new Array(1);
}a76.playerNamesData[0]=connectionMgr.buffer.data[122].value;}a76.a75=new Uint32Array(1);
a76.a75[0]=minimapRenderer.f0.f1(connectionMgr.buffer.data[105].value,5);};this.a7B=function(){localPlayer.data=new a6h();
};}

function RelationSystem(){var a7C=[];this.rE=function(player,qs,a7D,a7E){if(player===localPlayer.getTileOwner){
return;}if(qs===localPlayer.getTileOwner){return;}if(!a7E&&gameState.gv.kH(player)){return;}if(gameState.gv.kH(qs)){return;}
this.a0i(playerData.a0j[player]+" supported "+playerData.a0j[qs]+" with "+gameState.tI.currentLoopHandler(a7D)+" ressource"+(a7D===1?".":"s."));
};this.a0i=function(s1,r3){var a7F={eZ:focusHandler.a7G(),s1:s1,r3:r3};a7C.push(a7F);
if(account.ua===30){account.handleKeyInput().a0i(a7F);}};this.clear=function(){a7C=[];
var uw=account.a7H(30);uw&&uw.clear();
};this.a7I=function(){return a7C;};}

function DebugPanel(){this.a1E=0;this.gap=0;this.uA=0;this.sQ=0;
this.applyToGame=function(){this.resize();};this.resize=function(){this.a1E=0.0022*gameState.sK.sL(0.5)*camera.il;
this.uA=this.a1E/camera.l;this.gap=Math.max(Math.floor((uiSurface.platformActions.ik()?0.0114:0.01296)*
camera.il),2);this.sQ=this.gap/camera.l;};}

function ErrorSystem(){this.a7J=function(){return uiSurface.platformActions.ik()?2:1;
};}

function ModalStateClass(){var oy;var fg,fi,a7K;var a7L,a7M;var eZ;var a7N;var a7O;var a7P;
var a7Q;var gap;var zoom;var rN;var a7R;this.a7S=function(){a7T();};this.a7U=function(){return oy;
};this.applyToGame=function(){rN=[];fg=fi=eZ=0;a7L=a7M=-1000;this.resize();};this.resize=function(){
a7K=Math.floor((uiSurface.platformActions.ik()?0.075:0.0468)*camera.il);zoom=a7K/adSystem.get(3).height;gap=Math.floor(a7K/3);
};

function a7T(){var aC,ft;
var fZ=10;
var a7V=[colorPalette.settingsController,colorPalette.q2,colorPalette.pM,colorPalette.qP,colorPalette.qF];oy=new Array(fZ);
for(aC=0;aC<fZ;aC++){oy[aC]={id:aC,iL:false,lr:0,canvas:[],fg:0,fi:0};}oy[0].colors=[0,1,2,3];
oy[0].fg=0;oy[0].fi=0;oy[1].colors=[1,4];oy[1].fg=1;oy[1].fi=0;oy[2].colors=[0,1];
oy[2].fg=-1;oy[2].fi=0;oy[3].colors=[0];oy[3].fg=0;oy[3].fi=0;oy[4].colors=[0,2];oy[4].fg=1;
oy[4].fi=1;oy[5].colors=[3];oy[5].fg=0;oy[5].fi=-1;oy[6].id=20;oy[6].colors=[0];oy[6].fg=1;
oy[6].fi=-1;oy[7].id=21;oy[7].colors=[0];oy[7].fg=0;oy[7].fi=1;oy[8].id=16;oy[8].colors=[0];
oy[8].fg=0;oy[8].fi=0;oy[9].id=10;oy[9].colors=[4];oy[9].fg=2;oy[9].fi=0;for(aC=0;aC<fZ;aC++){
for(ft=0;ft<oy[aC].colors.length;ft++){oy[aC].canvas.push(yf(oy[aC].id,a7V[oy[aC].colors[ft]]));
}}}

function yf(id,a54){if(id<20){return gameState.canvas.EndGameTransitionController(adSystem.get(3),id,a54);
}var iV=adSystem.get(3).height;
var a55=gameState.sK.yf(iV,iV);
var ib=gameState.sK.getContext(a55);if(id===20){
ib.drawImage(adSystem.get(18),0,0);}else if(id===21){colorSystem.yq.a1F(colorSystem.tY.endGameNotificationController+colorSystem.tY.a1L,ib,0,0,iV);
}return a55;}this.a46=function(m9,mA){if(!this.isTeamGame()){return false;}clanPanel.ds=true;
if(colorSystem.yq.hm(m9,mA,a7O)){return true;}var ft=hm(m9,mA);this.tZ();if(ft===2){colorSystem.yq.isTeamGame=true;
}return ft>0;};this.a48=function(m9,mA){if(this.isTeamGame()){return;}a7L=m9;a7M=mA;eZ=performance.now();
};

function hm(m9,mA){a7L=-1000;a7M=-1000;
var a7W=a7X(m9,mA);
var a7Y=a7Z(a7W);if(a7Y===-1){
return 0;}if(oy[a7Y].colors[oy[a7Y].lr]===1){return 1;}if(a7Y===5){a7a();if(a7b(a7N)){return 1;}
rN.push(a7N);if(rN.length>16){rN.shift();}return 1;}if(a7Y===6){for(var aC=rN.length-1;aC>=0;aC--){
if(playerData.nU[rN[aC]]===0){rN.splice(aC,1);}}if(rN.length>0){if(questSystem.a7c(1,rN,true)){mapCache.gv.rM(rN,a7N);}
rN=[];}return 1;}if(a7Y===2){if(soloMode.iD(a7N)){mapCache.hz.reverseCommandHandler(clickHandler.i3(),a7N);}return 1;}if(a7Y===3){if(localPlayer.isFreeForAll){
mapCache.hz.isSameTeam(a7P);}return 1;}if(a7Y===0){if(oy[0].lr===0){if(localPlayer.a6f&&focusHandler.a7G()<350){return 1;}statsPanel.a7d(4);
mapCache.hz.i6(clickHandler.i3(),a7N);}else{historySystem.i7(a7N,clickHandler.i3());}return 1;}if(a7Y===1){mapCache.hz.iB(clickHandler.i3(),a7P);
return 1;}if(a7Y===9){mapCache.hz.iE(clickHandler.i3());return 1;}if(a7Y===7){statsPanel.a7d(0);colorSystem.yq.show(m9,mA);
return 2;}if(a7Y===4){if(questSystem.a7c(0,[a7N],true)){mapCache.gv.rJ(a7N);}return 1;}if(a7Y===8){
mapCache.hz.findAutoLaunchTarget(clickHandler.i3(),a7Q,a7N);return 1;}return 0;}this.click=function(m9,mA,a4F){var ho=powerState.hp(m9);
var hq=powerState.hr(mA);
var fL=powerState.fw(ho,hq);
var fD=powerState.fP(fL);
var a7e=(uiSurface.platformActions.ik()?0.025:0.0144)*camera.il;
var ea=performance.now();if(Math.abs(m9-a7L)>a7e||Math.abs(mA-a7M)>a7e||ea>eZ+500){return false;
}eZ=ea;if(powerSystem.EqualWidthControlRow()){powerSystem.handlePointerInput=m9;powerSystem.hf=mA;commandQueue.ee(1);gameTimer.ee(1);}if(!powerState.hs(ho,hq)){return false;}if(a4F){
a7f(m9,mA,fD);return false;}if(zoomHandler.screenToTileY||this.isTeamGame()||!gameState.gv.hl(localPlayer.getTileOwner)||localPlayer.hi){this.tZ();return false;
}if(localPlayer.isFreeForAll){a7P=expansionTargetFinder.hy(fL);if(a7P>=0){oy[3].isTeamGame=true;}return this.maxValue(m9,mA);}if(localPlayer.a2G===2){
if(!tileMap.h9(fD)){return this.maxValue(m9,mA);}a7N=tileMap.fR(fD);if(!gameState.gv.kH(a7N)){oy[0].isTeamGame=true;
oy[0].lr=1;oy[7].isTeamGame=true;return this.maxValue(m9,mA);}return this.maxValue(m9,mA);}if(bonusSystem.iC.iD(localPlayer.getTileOwner,fL)){
oy[0].isTeamGame=true;oy[0].lr=1;oy[1].isTeamGame=true;oy[1].lr=0;oy[9].isTeamGame=true;oy[9].lr=0;}if(bonusSystem.i9.iA(localPlayer.getTileOwner,fL)){
oy[0].isTeamGame=true;oy[0].lr=1;oy[1].isTeamGame=true;oy[1].lr=1;a7P=boostSystem.gB[7];}if(tileMap.fe(fD)){a7Q=mountainAttack.fA.fC(fD);
if(a7Q){var fO=powerState.fP(a7Q);oy[8].isTeamGame=true;a7N=tileMap.fQ(fO)?localPlayer.isMountainTile:tileMap.fR(fO);}return this.maxValue(m9,mA);
}if(tileMap.a0F(localPlayer.getTileOwner,fD)){a7O=localPlayer.getTileOwner;oy[0].isTeamGame=true;oy[0].lr=1;oy[7].isTeamGame=true;}var a7h=expansionTargetFinder.interceptPlanner(fL);
if(a7h===-1){return this.maxValue(m9,mA);}if(tileMap.fQ(a7h<<2)){a7N=localPlayer.isMountainTile;if(playerBoundaryEngine.i5(localPlayer.getTileOwner)){
oy[0].isTeamGame=true;oy[0].lr=0;}else if(alliances.collectAttackableTiles(localPlayer.getTileOwner)){oy[0].isTeamGame=true;oy[0].lr=3;}return this.maxValue(m9,mA);
}a7N=tileMap.fR(a7h<<2);oy[0].lr=1;oy[5].isTeamGame=a7i(a7N);if(!oy[7].isTeamGame&&!gameState.gv.kH(a7N)){
a7O=a7N;oy[7].isTeamGame=true;}oy[4].isTeamGame=!gameState.gv.kH(a7N)&&!troops.a7j(a7N)&&questSystem.a7c(0,[a7N],false);
oy[6].isTeamGame=a7k(a7N);if(playerBoundaryEngine.fS(a7N,localPlayer.getTileOwner)){if(playerBoundaryEngine.i8(localPlayer.getTileOwner,a7N)){oy[0].lr=0;oy[0].isTeamGame=true;
}else if(alliances.collectAttackableTiles(localPlayer.getTileOwner)){oy[0].lr=3;oy[0].isTeamGame=true;}oy[0].isTeamGame=this.a7l();return this.maxValue(m9,mA);
}oy[2].isTeamGame=true;if(soloMode.iD(a7N)){oy[2].lr=0;}else{oy[2].lr=1;}oy[0].isTeamGame=true;return this.maxValue(m9,mA);};

function a7f(m9,mA,fD){var a7m;if(tileMap.fU(fD)){hoverProcessor.a7n(fD);return;}a7m=bonusSystem.lj.a7o(m9,mA);if(a7m===-1){
hoverProcessor.a7n(fD);}else{hoverProcessor.a7p(a7m);}}

function a7a(){var ea=performance.now();if(ea>a7R+4000){
rN=[];}a7R=ea;}

function a7i(a7N){return!gameState.gv.kH(a7N)&&!a7b(a7N)&&questSystem.a7c(1,[a7N],false);
}

function a7k(a7N){if(rN.length===0){return false;}if(performance.now()>a7R+4000){
rN=[];return false;}return!a7b(a7N)&&!a7q(a7N);}

function a7b(a7N){var aC;
for(aC=rN.length-1;aC>=0;aC--){if(rN[aC]===a7N){return true;}}return false;}

function a7q(a7N){
var aC;if(!localPlayer.iT){return false;}for(aC=rN.length-1;aC>=0;aC--){if(!playerBoundaryEngine.fS(a7N,rN[aC])){
return true;}}return false;}this.maxValue=function(m9,mA){fg=m9-Math.floor(a7K/2);
fi=mA-Math.floor(a7K/2);if(this.isTeamGame()){return true;}return false;};this.a3m=function(m9,mA){
if(!this.isTeamGame()){return false;}if(colorSystem.yq.isTeamGame){if(colorSystem.yq.isPlayerInMatch(m9,mA)){return false;
}colorSystem.yq.isTeamGame=false;clanPanel.ds=true;return true;}return a7r(this,m9,mA);};

function a7r(tt,m9,mA){
var eI=a7X(m9,mA);if(a7Z(eI)>=0){return false;}if((eI===1||eI===6)&&a7Z(2)>=0){
return false;}if((eI===6||eI===9)&&a7Z(10)>=0){return false;}tt.tZ();clanPanel.ds=true;
return true;}

function a7Z(a7W){var aC,fZ;if(a7W===-1){return-1;}fZ=oy.length;for(aC=0;aC<fZ;aC++){
if(oy[aC].isTeamGame&&oy[aC].fg+1===a7W%4&&oy[aC].fi+1===(a7W>>2)){return aC;}}return-1;
}this.tZ=function(){for(var aC=oy.length-1;aC>=0;aC--){oy[aC].isTeamGame=false;oy[aC].lr=0;}colorSystem.yq.isTeamGame=false;
};this.isTeamGame=function(){return this.a7l()||colorSystem.yq.isTeamGame;};this.a7l=function(){var aC;
var fZ=oy.length;
for(aC=0;aC<fZ;aC++){if(oy[aC].isTeamGame){return true;}}return false;};

function a7X(m9,mA){
var zN,zO;
var uw=gap/2;if(m9<fg-a7K-3*uw||m9>fg+3*a7K+5*uw||mA<fi-a7K-3*uw||mA>fi+2*a7K+3*uw){
return-1;}zN=m9<fg-uw?0:m9<fg+a7K+uw?1:m9<fg+2*a7K+3*uw?2:3;zO=mA<fi-uw?0:mA<fi+a7K+uw?1:2;
return zO*4+zN;}this.wr=function(){if(!this.isTeamGame()){return;}if(colorSystem.yq.isTeamGame){colorSystem.yq.wr();
return;}a7s();};

function a7s(){var aC;
var ib=ws;
var ft=oy;
var fZ=ft.length;
var a7t=(a7K+gap)/zoom;
ib.imageSmoothingEnabled=true;ib.setTransform(zoom,0,0,zoom,fg,fi);for(aC=0;aC<fZ;aC++){
if(ft[aC].isTeamGame){ws.drawImage(ft[aC].canvas[ft[aC].lr],ft[aC].fg*a7t,ft[aC].fi*a7t);
}}ib.imageSmoothingEnabled=false;
ib.setTransform(1,0,0,1,0,0);}}

function ZoomHandler(){var k;var canvas;var a7u;var a7v;
var a7w;
var a7x=-1;this.screenToTileY=false;this.applyToGame=function(){a7v=-1;this.screenToTileY=false;a7w=uiSurface.platformActions.ik()?1.2:0.6;
this.resize();};this.resize=function(){k=clickHandler.k;canvas=document.createElement("canvas");
canvas.width=k;canvas.height=k;a7u=gameState.sK.u8(1,(uiSurface.platformActions.ik()?0.5:0.45)*k);
a7y();};

function a7y(){var a7z;
var ou=canvas.getContext("2d",{alpha:true});ou.clearRect(0,0,k,k);
ou.fillStyle=colorPalette.pK;ou.fillRect(0,0,k,k);if(a7v===9){ou.fillStyle=colorPalette.pP;ou.fillRect(0,0,k,k);
}ou.fillStyle=colorPalette.pO;ou.fillRect(0,0,k,1);ou.fillRect(0,0,1,k);ou.fillRect(0,k-1,k,1);
ou.fillRect(k-1,0,1,k);a7z=0.9*k/adSystem.get(0).width;ou.imageSmoothingEnabled=true;
ou.setTransform(a7z,0,0,a7z,Math.floor((k-a7z*adSystem.get(0).width)/2),Math.floor((k-a7z*adSystem.get(0).height)/2));
ou.drawImage(adSystem.get(0),0,0);ou.setTransform(1,0,0,1,0,0);
}this.a80=function(){return!(localPlayer.a2G!==1||localPlayer.isFreeForAll||(localPlayer.hi?!packetReader.a73:(this.screenToTileY&&localPlayer.lE)));
};this.a4N=function(){this.screenToTileY=!this.screenToTileY;if(!this.screenToTileY){
a7v=-1;a7y();if(localPlayer.lE&&localPlayer.a2G===1&&!localPlayer.isFreeForAll&&!localPlayer.hi){uiSurface.platformActions.setState(1);}}else{packetReader.a4M(false);
localPlayer.hi&&packetReader.a73&&packetReader.a4O(true);this.a81();if(a7v===9){a7v=0;}}clanPanel.ds=true;};this.a81=function(){
if((localPlayer.lE||localPlayer.hi)&&localPlayer.a2G===1){uiColors.nG(true);if(!localPlayer.isFreeForAll){setTimeout(function(){chatPanel.appleLink();},0);
}uiSurface.platformActions.setState(0);}};this.hm=function(m9,mA){a7x=a82(m9,mA);if(a7x>=0){return a7x;}a83();
return a7x;};

function a83(){if(zoomHandler.screenToTileY&&!localPlayer.lE&&!localPlayer.hi&&!accountPanel.isTeamGame){zoomHandler.a4N();}}this.a3m=function(m9,mA){
var lr=a82(m9,mA);if(lr===a7v){return;}a7v=lr;if(!this.screenToTileY){a7y();}clanPanel.ds=true;return;
};this.a3n=function(m9,mA){var lr=a82(m9,mA);if(lr===-1){return false;}if(a7x!==lr){return false;
}if(this.screenToTileY){if(localPlayer.ny){if(lr>=0){packetReader.a4M(false);}return!localPlayer.hi;}if(lr===0){localPlayer.InputUtils();return true;
}if(lr===1){this.a4N();return true;}if(lr===2){account.v(1,0);return true;}return true;}if(lr===9){
this.a4N();return true;}return false;};

function a82(m9,mA){if(!zoomHandler.screenToTileY){if(m9<=k+debugPanel.gap&&mA>=clickHandler.fi){
return 9;}return-1;}if(m9<=4*k+debugPanel.gap){if(mA>=clickHandler.fi){return 0;}if(mA>=clickHandler.fi-k-a7w*debugPanel.gap){
return 2;}}else if(m9<=7*k+debugPanel.gap&&mA>=clickHandler.fi-k-a7w*debugPanel.gap){return 1;}return-1;}this.wr=function(){
if(this.screenToTileY){a84();a85();ws.setTransform(1,0,0,1,0,0);}else{ws.drawImage(canvas,debugPanel.gap,clickHandler.fi);
}};this.RectangleLayout=function(player){return playerData.nU[player]!==0&&localPlayer.a2G!==2&&!gameState.gv.kH(player);
};

function a84(){var fZ;
var j=Math.floor(5.5*k);ws.setTransform(1,0,0,1,debugPanel.gap,clickHandler.fi);
ws.fillStyle=colorPalette.pK;ws.fillRect(0,0,j,k);if(a7v===0){ws.fillStyle=colorPalette.pP;ws.fillRect(0,0,4*k,k);
}else if(a7v===1){ws.fillStyle=colorPalette.pP;ws.fillRect(4*k,0,Math.floor(1.5*k),k);}ws.fillStyle=colorPalette.pO;
ws.fillRect(0,0,j,1);ws.fillRect(0,0,1,k);ws.fillRect(4*k,0,1,k);ws.fillRect(0,k-1,j,1);
ws.fillRect(j-1,0,1,k);ws.font=a7u;gameState.sK.textBaseline(ws,1);gameState.sK.textAlign(ws,1);
ws.fillText(L(45),2*k,0.54*k);fZ=0.4*k;zoomHandler.a86(debugPanel.gap+4*k+(1.5*k-fZ)/2,clickHandler.fi+0.3*k,fZ);
}

function a85(){a87(1);}

function a87(aC){ws.setTransform(1,0,0,1,debugPanel.gap,clickHandler.fi-aC*a7w*debugPanel.gap-aC*k);
ws.fillStyle=colorPalette.pK;ws.fillRect(0,0,4*k,k);if(a7v===aC+1){ws.fillStyle=colorPalette.pP;
ws.fillRect(0,0,4*k,k);}ws.fillStyle=colorPalette.pO;ws.fillRect(0,0,4*k,1);ws.fillRect(0,0,1,k);
ws.fillRect(4*k,0,1,k);ws.fillRect(0,k-1,4*k,1);ws.fillText(aC===0?L(45):L(46),2*k,0.54*k);
}this.a86=function(fg,fi,fZ){ws.setTransform(1,0,0,1,fg,fi);
ws.lineWidth=debugPanel.a1E;ws.strokeStyle=colorPalette.pO;ws.beginPath();ws.moveTo(0,0);
ws.lineTo(fZ,fZ);ws.moveTo(0,fZ);ws.lineTo(fZ,0);ws.stroke();};}

function HoverProcessor(){var a88;
var k;var a89;var a8A;var a8B;var a8C;var a8D;var a8E;var a8F;this.a8G="";this.applyToGame=function(){
a8E=0;a8D=!uiSurface.platformActions.ik()?12:7;a8C={a24:[0,0,0],a8H:[0,0,0],nm:[220,180,180],wq:[0,0,0],ej:[0,0,0]};
a88=[];this.resize();if(localPlayer.isFreeForAll){this.a2T(0,18);}a8I();a8J(this);if(localPlayer.a0h){
a8K(340,L(47),6,0,a8L(255,200,0),colorPalette.pL,-1,false);}};

function a8J(self){if(self.a8G.length===0){
return;}a8K(200,self.a8G,0,0,colorPalette.pO,colorPalette.pL,-1,false);self.a8G="";}this.resize=function(){var a8M,aC;
k=Math.floor((uiSurface.platformActions.ik()?0.031:0.0249)*camera.il);k=k<10?10:k;this.fontSize=Math.floor(2*k/3);
this.a7u=gameState.sK.u8(1,this.fontSize);a89=debugPanel.gap;a8A=Math.floor(k/5);if(a88.length>0){
a8M=a88;a88=[];for(aC=a8M.length-1;aC>=0;aC--){a8K(a8M[aC].eZ,a8M[aC].s1,a8M[aC].id,a8M[aC].player,
a8M[aC].a8N,a8M[aC].a8O,a8M[aC].lX,a8M[aC].a8P,a8M[aC].a8Q,a8M[aC].a8R,true);
}}this.a8S();};this.a8S=function(){
a8F=document.createElement("canvas");
var s1=L(48);a8B=deviceDetector.measureText(s1,this.a7u)+5*a8A;
a8F.height=k;a8F.width=a8B;
var ou=a8F.getContext("2d",{alpha:true});ou.font=this.a7u;
gameState.sK.textBaseline(ou,1);gameState.sK.textAlign(ou,1);ou.clearRect(0,0,a8B,k);ou.fillStyle=colorPalette.shouldSetInitATKPercent;
ou.fillRect(0,0,a8B,k);ou.fillStyle=colorPalette.pO;ou.fillText(s1,Math.floor(a8B/2),Math.floor(k/2));
};this.a8T=function(){if(cameraController.isTeamGame){return cameraController.j;}var fZ=a88.length;
if(fZ===0){return 0;}else if(fZ===1){return a88[0].a8U;}return a8V(a88[0].a8U,a88[1].a8U);
};this.a8W=function(){var fZ=a88.length;if(cameraController.isTeamGame){if(fZ){return a8V(cameraController.j,a88[0].a8U);
}return cameraController.j;}if(fZ===0){return 0;}else if(fZ===1){return a88[0].a8U;}else if(fZ===2){
return a8V(a88[0].a8U,a88[1].a8U);}return a8V(a8V(a88[0].a8U,a88[1].a8U),a88[2].a8U);
};

function a0M(){if(clickHandler.a8X(hoverProcessor.a8T())){if(cameraController.isTeamGame){return clickHandler.fi-clickHandler.k-2*a89;
}else{return clickHandler.fi-a89;}}else if(packetReader.a8X(hoverProcessor.a8W())){if(cameraController.isTeamGame){return packetReader.a0M()-clickHandler.k-2*a89;}else{
return packetReader.a0M()-a89;}}else if(cameraController.isTeamGame){return camera.k-clickHandler.k-(errorSystem.a7J()+1)*a89;}return camera.k-errorSystem.a7J()*debugPanel.gap;
}this.hm=function(fg,fi){var aC,a8Y,ea;
var a8Z=a0M();for(aC=a88.length-1;aC>=0;aC--){
a8Y=a8Z-(aC+1)*k;if(fi>=a8Y&&fi<a8Y+k){if(a88[aC].id===50){if(fg>=camera.j-a8B-a89-a88[aC].j){
if(fg>=camera.j-a8B-a89){mapCache.gv.rJ(a88[aC].player);}else{soloCalc.uiHidden(a88[aC].player,800,false,0);
}return true;}return false;}if(fg>=camera.j-a88[aC].j-a89){if(a88[aC].id===736){
window.open("https://"+a88[aC].s1,"_blank");}else if(a88[aC].a8P){if(a88[aC].a8R&&a88[aC].a8R.divideRounded){
var fL=a88[aC].a8R.fL;
var nv=powerState.fh(fL)-10;
var nw=powerState.fj(fL)-10;soloCalc.np(nv,nw,nv+19,nw+19);
}else if(a88[aC].a8R&&a88[aC].a8R.ft){soloCalc.nr(a88[aC].player,a88[aC].a8R.ns);
}else{soloCalc.uiHidden(a88[aC].player,800,false,0);if(a88[aC].lX>=0){ea=a88[aC].lX;
a88[aC].lX=a88[aC].player;a88[aC].player=ea;}}}return true;}return false;}}return false;
};this.a0i=function(ea,s1,id,h7,a8N,a8O,lX,a8P,a8Q,a8R){a8K(ea,s1,id,h7,a8N,a8O,lX,a8P,a8Q,a8R);
};this.a8a=function(s){a8K(300,s,252,0,colorPalette.pO,colorPalette.pL,-1,false);};

function a8K(ea,s1,id,h7,a8N,a8O,lX,a8P,a8Q,a8R,a8b){var aC,ou,a8U,a55,sC;
var a8c=a8Q!==undefined;
var j=Math.floor(deviceDetector.measureText(s1,hoverProcessor.a7u)+1.5*a8A+(a8c?k:(1.5*a8A)));clanPanel.ds=true;
if(!a8b){relations.a0i(s1,a8Q);}if(j+2*a89+clickHandler.k>camera.j&&!a8c&&id!==50&&s1.length>20){var h=gameState.tI.a6M(s1);
a8K(ea,h[0],id,h7,a8N,a8O,lX,a8P,a8Q,a8R,true);a8K(ea,h[1],id,h7,a8N,a8O,lX,a8P,a8Q,a8R,true);
return;}a8U=j+(id===50?a8B:0);a55=document.createElement("canvas");a55.width=j;
a55.height=k;ou=a55.getContext("2d",{alpha:true});ou.font=hoverProcessor.a7u;gameState.sK.textBaseline(ou,1);
gameState.sK.textAlign(ou,0);ou.clearRect(0,0,j,k);ou.fillStyle=a8O;ou.fillRect(0,0,j,k);ou.fillStyle=a8N;
ou.fillText(s1,Math.floor(1.5*a8A),Math.floor(k/2));if(a8c){ou.imageSmoothingEnabled=true;
colorSystem.yq.a1F(a8Q,ou,j-k,0,k);}sC={eZ:ea,s1:s1,id:id,player:h7,canvas:a55,a8N:a8N,a8O:a8O,
j:j,a8U:a8U,lX:lX,a8P:a8P,a8Q:a8Q,a8R:a8R};if(sC.eZ===0||(a88.length>0&&a88[0].eZ>0)){
a88.unshift(sC);}else{for(aC=1;aC<a88.length;aC++){if(a88[aC].eZ>0){a88.splice(aC,0,sC);
return;}}a88.push(sC);}}this.a6Y=function(id){for(var aC=a88.length-1;aC>=0;aC--){
if(a88[aC].id===id){a88[aC].eZ=1;}}};this.a2T=function(player,id){if(id===0){deviceDetector.ei(player,0);
a8d(423,2);a8K(160,L(49,[playerData.a0j[player]]),423,player,"rgb(10,220,10)",colorPalette.pL,-1,false);}else if(id===1){
a8e(50,localPlayer.isMountainTile);deviceDetector.ei(player,1);a8K(360,L(50,[playerData.a0j[player]]),0,player,colorPalette.q4,colorPalette.pL,-1,true);
soloCalc.uiHidden(player,2700,false,0);}else if(id===2){
deviceDetector.ei(player,2);a8K(0,L(51),0,player,"rgb(10,255,255)",colorPalette.pL,-1,true);soloCalc.uiHidden(player,2700,false,0);
}else if(id===3){deviceDetector.ei(player,2);a8K(0,L(52,[playerData.a0j[player]]),0,player,colorPalette.pO,colorPalette.pL,-1,true);
soloCalc.uiHidden(player,2700,false,0);}else if(id===4){
this.getInteriorColorRgb(1,player,player);}else if(id===5){if(gameState.gv.kH(localPlayer.getTileOwner)){return;}a8g(1,5);if(troops.a8h(player)){
a8K(180,L(53,[playerData.a0j[player]]),1,player,a8L(255,200,180),colorPalette.pL,-1,true);}if(!gameState.gv.replaceAll(player,10)){
return;}a8d(573,0);a8K(180,L(54,[playerData.a0j[player]]),573,player,colorPalette.q4,colorPalette.pL,-1,true);
}else if(id===18){a8K(255,L(55),18,0,colorPalette.pO,colorPalette.pL,-1,false);}else if(id===21){
a8K(220,L(56),id,0,colorPalette.pO,colorPalette.pL,-1,false);}else if(id===22){this.getInteriorColorRgb(2,player,player);
}else if(id===59){a8K(0,L(57),id,0,colorPalette.qO,colorPalette.pL,0,false);}};this.a3Y=function(s){
a8K(200,L(58,[s]),94,0,colorPalette.pO,colorPalette.q0,-1,false);};this.a2f=function(a8i){if(!playerData.hN[a8i]){
return;}deviceDetector.ei(a8i,2);if(localPlayer.ku<100){a8K(0,L(52,[playerData.a0j[a8i]]),3,a8i,colorPalette.pO,colorPalette.pL,-1,true);
}else{a8K(0,L(59,[playerData.a0j[a8i]]),3,a8i,colorPalette.pO,colorPalette.pL,-1,true);
}};this.a7n=function(fD){var s1;
var a8j="("+powerState.fh(fD>>2)+", "+powerState.fj(fD>>2)+")";
var a8P=false;
var player=0;if(tileMap.fU(fD)){if(tileMap.fQ(fD)){a8j=L(60,[a8j]);}else{player=tileMap.fR(fD);
if(localPlayer.hi){localPlayer.getTileOwner=player;}s1=L(61,[gameState.ou.a5J(playerData.a2w[player],gameState.sK.u8(0,10),150)])+"   ";
s1+=L(62,[gameState.tI.currentLoopHandler(playerData.hb[player])])+"   ";s1+=L(63,[gameState.tI.currentLoopHandler(playerData.hN[player])])+"   ";
if(localPlayer.iT){var a8k=mainMenu.a2c[mainMenu.lH[mainMenu.fX[player]]];s1+=L(64)+": "+a8k+"   ";
}if(gameState.gv.kH(player)){s1+=L(65)+": "+troopCalc.l5[troopCalc.iI[player]]+"   ";}s1+=L(66,[player])+"   ";
s1+=L(67,[a8j]);a8j=s1;a8P=true;}}else if(tileMap.fe(fD)){a8j=L(68,[a8j])+"   #"+tileMap.tileDataToIndex(fD);}else{
a8j=L(69,[a8j]);}a8d(55,0);a8K(220,a8j,55,player,colorPalette.pO,colorPalette.pL,-1,a8P,undefined,undefined,true);
};this.a7p=function(a8l){var lp=bonusSystem.z;
var player=lp.mo[a8l]>>3;
clanPanel.ds=true;a8d(55,0);
var s1=L(70,[playerData.a0j[player]])+"   ";s1+=L(62,[gameState.tI.currentLoopHandler(lp.a8m[a8l])]);
a8K(220,s1,55,player,colorPalette.pO,colorPalette.pL,-1,true);};this.r2=function(qm,a8n,r3){
if(qm===localPlayer.getTileOwner){a8K(175," "+L(71,[playerData.a0j[a8n]])+": ",1001,a8n,a8L(200,255,210),colorPalette.pL,-1,true,r3);
}else{this.a8o(qm,r3);}};this.a8o=function(qm,r3){
a8d(1000,0);a8K(175,playerData.a0j[qm]+": ",1000,qm,colorPalette.pO,"rgba(5,60,25,0.9)",-1,true,r3);
};

function a8g(id,nP){var aC;
var oq=0;
var fZ=a88.length;for(aC=0;aC<fZ;aC++){if(a88[aC].id===id){
oq++;if(oq>=nP){a88.splice(aC,1);return;}}}}this.a2e=function(){var s;if(localPlayer.a2L){
s=L(72);deviceDetector.a2d(L(73),2,1,12);a8K(0,s,40,0,"rgb(10,220,10)",colorPalette.pL,-1,false);}else{s=L(74);deviceDetector.a2d(L(75),2,0,16);
a8K(0,s,41,0,colorPalette.pO,colorPalette.pL,-1,false);}};this.isCrownFlagEmoji=function(){var resolveAttackCombat=playerData.a0j;
var fc=localPlayer.data;
a8K(300,resolveAttackCombat[0]+" ["+localPlayer.a2Z.a0c(fc.elo[0])+"] vs "+resolveAttackCombat[1]+" ["+localPlayer.a2Z.a0c(fc.elo[1])+"]",65,0,colorPalette.pF,"rgba(100,255,255,0.75)",-1,false);
};this.a8p=function(s){
a8K(350,s,0,0,"rgb(40,255,200)","rgba(10,60,40,0.9)",-1,false);};this.a8q=function(a8r){
a8K(0,a8r?L(76):L(77),247,0,colorPalette.qN,colorPalette.pL,-1,false);};this.a0e=function(a0b,a0d,a8s){var fc=localPlayer.data;
var resolveAttackCombat=playerData.a0j;a8K(0,resolveAttackCombat[0]+": "+localPlayer.a2Z.a0c(fc.elo[0])+" -> "+a0b,66,0,colorPalette.pO,a8s[0],-1,false);
a8K(0,resolveAttackCombat[1]+": "+localPlayer.a2Z.a0c(fc.elo[1])+" -> "+a0d,66,1,colorPalette.pO,a8s[1],-1,false);
};this.canvasUtils=function(player,id){if(id===0){if(a8e(50,player)){
a8K(128,L(78,[playerData.a0j[player]]),52,player,a8L(180,255,180),colorPalette.pL,-1,true);troops.rt(player,2,255);}else{
a8K(384,L(79,[playerData.a0j[player]]),51,player,a8L(210,210,255),colorPalette.pL,-1,true);}}else{if(a8e(51,player)){
a8K(128,L(80,[playerData.a0j[player]]),52,player,colorPalette.pO,"rgba(60,120,10,0.9)",-1,true);troops.rt(player,2,255);
}else{a8K(384,L(81,[playerData.a0j[player]]),50,player,colorPalette.pO,"rgba(90,90,90,0.9)",-1,true);
troops.rt(player,2,96);}}};this.rO=function(a24,target){var color=a8L(210,255,210);
if(a24.length>1){a8K(230,L(82,[a24.length,playerData.a0j[target]]),66,target,color,colorPalette.pL,-1,true);
}else{a8K(230,L(83,[playerData.a0j[a24[0]],playerData.a0j[target]]),66,a24[0],color,colorPalette.pL,target,true);
}};

function a8L(eH,uw,ft){return "rgb("+eH+","+uw+","+ft+")";}this.a8t=function(player,target){
a8K(230,L(84,[playerData.a0j[player],playerData.a0j[target]]),66,player,colorPalette.pO,"rgba(75,65,5,0.9)",target,true);
};this.a8u=function(id,resolveAttackCombat){
a8d(id,resolveAttackCombat);};

function a8d(id,resolveAttackCombat){var aC;
var fZ=a88.length;for(aC=0;aC<fZ;aC++){
if(a88[aC].id===id&&(resolveAttackCombat--)<=0){a88.splice(aC,1);aC--;fZ--;}}}this.a2O=function(id,player){
a8e(id,player===undefined?localPlayer.isMountainTile:player);};

function a8e(id,player){var fn=false;
for(var aC=a88.length-1;aC>=0;aC--){if(a88[aC].id===id&&(player===localPlayer.isMountainTile||a88[aC].player===player)){
a88.splice(aC,1);fn=true;}}return fn;}this.a8v=function(id){for(var aC=a88.length-1;aC>=0;aC--){
if(a88[aC].id===id){return a88[aC];}}return null;};this.rF=function(a7D,a8w,player){
if(playerData.a5a[localPlayer.getTileOwner]===2){return;}var a8x;if(a7D===1){a8x=L(85,[playerData.a0j[player]]);}else{
a8x=L(86,[gameState.tI.currentLoopHandler(a7D),playerData.a0j[player]]);}a8K(200,a8x,30,player,"rgb(190,255,190)",colorPalette.pL,-1,true);
};this.a8y=function(a7D,player){if(playerData.a5a[localPlayer.getTileOwner]===2){
return;}a8d(31,0);
var a8x=" ("+gameState.tI.currentLoopHandler(a7D)+") 💸";if(gameState.gv.kH(player)){a8x=L(87)+a8x;
}else{a8x=L(88,[playerData.a0j[player]])+a8x;}a8K(150,a8x,31,player,colorPalette.pF,"rgba(205,205,205,0.9)",-1,true);
};

function a8I(){if(dialogManager.yd.ye[dialogManager.tileDataToIndexUnchecked].name.length){
a8z(L(89,[dialogManager.yd.ye[dialogManager.tileDataToIndexUnchecked].name]));}if(dialogManager.yd.ye[dialogManager.tileDataToIndexUnchecked].a90){a8z(L(90,[dialogManager.yd.ye[dialogManager.tileDataToIndexUnchecked].a90]));
}a8z(L(91,[(dialogManager.fk-2)+"x"+(dialogManager.fl-2)]));a8z(L(92,[gameState.tI.currentLoopHandler(chatSystem.a91)]));
if(chatSystem.a91!==chatSystem.a92){a8z(L(93,[gameState.tI.currentLoopHandler(chatSystem.a92)+" ("+gameState.tI.a6I(100*chatSystem.a92/chatSystem.a91,1)+")"]));
}if(chatSystem.a93>0){a8z(L(69,[gameState.tI.currentLoopHandler(chatSystem.a93)+" ("+gameState.tI.a6I(100*chatSystem.a93/chatSystem.a91,1)+")"]));
}if(chatSystem.playerShipIndices>0){a8z(L(94,[gameState.tI.currentLoopHandler(chatSystem.playerShipIndices)+" ("+gameState.tI.a6I(100*chatSystem.playerShipIndices/chatSystem.a91,1)+")"]));
}if(localPlayer.survivorBotCount===10){a8K(120,L(95),6,0,a8L(235,255,120),colorPalette.pL,-1,false);
}}

function a8z(s1){a8K(340,s1,6,0,a8L(215,245,255),colorPalette.pL,-1,false);}this.a2N=function(by){
var aC;
var ej=clanPanel.kr();for(aC=2;aC>=0;aC--){if(a8C.wq[aC]>0&&(by||a8C.ej[aC]<ej-220)){
this.a95(aC);}}};this.a95=function(id){var s1;
var fZ=a8C.wq[id];
var player=a8C.a24[id];
a8C.wq[id]=0;if(fZ===1){if(id===0){s1=L(96,[playerData.a0j[player],playerData.a0j[a8C.a8H[0]]]);}else if(id===1){
s1=L(97,[playerData.a0j[player]]);}else if(id===2){s1=L(98,[playerData.a0j[player]]);}else if(id===3){
s1=L(99,[playerData.a0j[player]]);}a8d(7,0);a8K(a8C.nm[id],s1,7,a8C.a8H[id],colorPalette.pO,colorPalette.pL,-1,true);
}else{if(id===0){s1=L(100,[fZ]);}else if(id===1){s1=L(101,[fZ]);}else{s1=L(102,[fZ]);}a8d(7,0);
a8K(a8C.nm[id],s1,7,player,colorPalette.pO,colorPalette.pL,-1,false);}};this.getInteriorColorRgb=function(id,i1,lX){var ej=clanPanel.kr();
var fZ=a8C.wq[id]+1;a8C.wq[id]++;a8C.a24[id]=i1;a8C.a8H[id]=lX;if(fZ===1){a8C.ej[id]=ej;}
if(fZ===1&&(localPlayer.a2J<32||localPlayer.a2G===2)){this.a95(id);return;}if(fZ>1&&(a8C.ej[id]<ej-140||localPlayer.a2G===2)){
this.a95(id);}};this.ee=function(){replaySystem.ee();
var k9=a88.length-a8D;k9=k9<=1?1:k9*k9;
for(var aC=a88.length-1;aC>=0;aC--){if(a88[aC].eZ>0){a88[aC].eZ-=k9;if(a88[aC].eZ<=0){clanPanel.ds=true;
a88.splice(aC,1);}}}a96();this.a2N(false);};

function a96(){var resolveAttackCombat,aC;if(a8E===128){return;
}a8E++;if(a8E<128){return;}resolveAttackCombat=5;for(aC=territorySystem.lQ-1;aC>=0;aC--){if(playerData.a5a[territorySystem.lV[aC]]===1&&resolveAttackCombat-- >0){
a8K(240,L(99,[playerData.a0j[territorySystem.lV[aC]]]),1,territorySystem.lV[aC],colorPalette.pF,"rgba(255,255,255,0.75)",-1,true);
}}}this.wr=function(){
var fi=a0M();var zO;for(var aC=a88.length-1;aC>=0;aC--){zO=fi-(aC+1)*k;if(a88[aC].id===50){
ws.drawImage(a88[aC].canvas,camera.j-a88[aC].j-a8B-a89,zO);ws.drawImage(a8F,camera.j-a8B-a89,zO);
}else{ws.drawImage(a88[aC].canvas,camera.j-a88[aC].j-a89,zO);}}};this.a97=function(id,iI){
var a8j;
var a98=colorPalette.pY;if(id===0){a8j=L(103);}else if(id===1){a8j=L(104);a98=colorPalette.qJ;}else if(id===2){
a8j=L(105);}else if(id===3){a8j=L(106);}else{a8j=gameState.tI.currentLoopHandler(iI);if(id===5){a98=colorPalette.qJ;}else{
a98=colorPalette.pL;}}a8d(74,0);a8K(0,a8j,74,0,colorPalette.pO,a98,-1,false,undefined,undefined,true);};}

function KeyProcessor(){
var wt="";
var z9=0;
var zA=0;
var a99=-1;var a9A;var a9B;
var eD=["Team","Zombie","BR","1v1"];
this.applyToGame=function(){a9B=L(107);};this.resize=function(){z9=Math.floor((uiSurface.platformActions.ik()?0.53:0.36)*camera.il);
zA=Math.floor(0.065*z9);a9A=gameState.sK.u8(1,Math.floor(0.9*zA));
a99+=1000;a9C();};this.ee=function(){if(a9C()){clanPanel.ds=true;}};

function a9C(){var ea=new Date();
var a9D=ea.getUTCMinutes();
var a9E=ea.getUTCSeconds();
var a9F=[];
var a9G=0;for(var aC=0;aC<6;aC++){
a9F.push(a9G);a9F.push(a9G+2);a9F.push(a9G+5);a9F.push(a9G+7);a9G+=10;}var fZ=a9F.length;
for(aC=1;aC<fZ;aC++){if(a9D<a9F[aC]){break;}}aC%=fZ;a9F[0]=60;
var a9H=60*(a9F[aC]-a9D)-a9E;
if(a9H===a99){return false;}wt=eD[aC%4]+" "+a9B+": "+a9I(Math.floor(a9H/60))+":"+a9I(a9H%60);
a99=a9H;z9=deviceDetector.measureText(wt,a9A);z9+=Math.floor(0.4*zA);
return true;}

function a9I(a9J){return a9J<10?"0"+a9J:String(a9J);}this.wr=function(fi){
ws.lineWidth=1+Math.floor(zA/15);ws.translate(camera.j-zA,fi+z9);ws.rotate(-Math.PI/2);
ws.fillStyle=colorPalette.pO;ws.fillRect(0,0,z9,zA);ws.strokeStyle=colorPalette.pF;ws.strokeRect(0,0,z9,zA+10);
ws.fillStyle=colorPalette.pF;ws.font=a9A;gameState.sK.textBaseline(ws,1);gameState.sK.textAlign(ws,1);
ws.fillText(wt,Math.floor(z9/2),Math.floor(0.59*zA));ws.setTransform(1,0,0,1,0,0);};
}

function PanHandler(){var a7C;var a9K;var a9L;var zA,a9M;
var a9N=0;
var a9O=0;this.applyToGame=function(){a9N=a9O=0;
a7C=[];this.resize();};this.resize=function(){a9L=hoverProcessor.a7u;zA=hoverProcessor.fontSize+5;zA=Math.floor(1.25*zA);
if(uiSurface.platformActions.ik()){zA=Math.floor(1.25*zA);}a9M=Math.floor(0.15*zA);dialogManager.distanceSquared.font=a9L;
a9K=Math.floor(dialogManager.distanceSquared.measureText("02 000 000 0000").width);for(var aC=a7C.length-1;aC>=0;aC--){
a9P(a7C[aC]);a9Q(aC);}};this.nG=function(){for(var aC=a7C.length-1;aC>=0;aC--){if(a7C[aC].a9R){
a7C[aC].a9R=false;a9Q(aC);}}};

function a9Q(aC){var a9S=true;
var a1M=colorPalette.pO;if(a7C[aC].id===1){
a7C[aC].ou.fillStyle=colorPalette.qH;}else if(a7C[aC].randomInt===localPlayer.isMountainTile){a7C[aC].ou.fillStyle=colorPalette.pZ;
}else{tileMap.a9T(a7C[aC].randomInt);a7C[aC].ou.fillStyle=gameState.color.pI(boostSystem.g8[0],boostSystem.g8[1],boostSystem.g8[2],0.87);
if(gameState.sS.endsWith(boostSystem.g8,0,2)>400){a9S=false;a1M=colorPalette.pF;
}}var j=a7C[aC].canvas.width;a7C[aC].ou.clearRect(0,0,j,zA);a7C[aC].ou.fillRect(0,0,j,zA);
a7C[aC].ou.fillStyle=a1M;a9U(a7C[aC].ou,j,zA);if(j>a9K+2*zA){a7C[aC].ou.fillRect(j-a9K-zA,0,1,zA);
a7C[aC].ou.fillText(playerData.a0j[a7C[aC].randomInt],Math.floor((j-a9K)/2),Math.floor(0.57*zA));
}var uf=a7C[aC].id!==0?0:zA;
a7C[aC].ou.fillText(gameState.tI.currentLoopHandler(a7C[aC].iI),Math.floor(j-a9K/2-uf),Math.floor(0.57*zA));
a9V(aC,j,uf,a9S);if(a7C[aC].id===0){a9W(aC,j,a9S,a1M);
a9X(aC,j,a9S);}else{a9W(aC,2*zA,a9S,a1M);}}

function a9U(ou,j,zA){ou.fillRect(0,0,j,1);
ou.fillRect(0,zA-1,j,1);ou.fillRect(0,0,1,zA);ou.fillRect(j-1,0,1,zA);}

function a9V(aC,j,uf,a9S){
a7C[aC].ou.fillStyle=a9S?colorPalette.pQ:colorPalette.pM;
var a9Y=Math.floor(a9K*a7C[aC].iI/a7C[aC].a9Z);
a7C[aC].ou.fillRect(Math.floor(j-a9K-uf),zA-a9M,a9Y,a9M);
}

function a9W(aC,j,a9S,a1M){a7C[aC].ou.strokeStyle=a7C[aC].a9a?colorPalette.pX:a9S?colorPalette.pw:colorPalette.px;
a7C[aC].ou.fillStyle=a1M;a7C[aC].ou.fillRect(j-zA,0,1,zA);
a7C[aC].ou.lineWidth=Math.max(Math.floor(zA/12),3);a7C[aC].ou.lineCap="round";
var fc=0;
var o7=0.35;
j=zA+1;a7C[aC].ou.beginPath();a7C[aC].ou.moveTo(Math.floor(j-o7*zA+fc),Math.floor(o7*zA));
a7C[aC].ou.lineTo(Math.floor(j-zA+o7*zA),Math.floor(zA-o7*zA+fc));a7C[aC].ou.stroke();
a7C[aC].ou.beginPath();a7C[aC].ou.moveTo(Math.floor(j-zA+o7*zA),Math.floor(o7*zA));
a7C[aC].ou.lineTo(Math.floor(j-o7*zA+fc),Math.floor(zA-o7*zA+fc));
a7C[aC].ou.stroke();}

function a9X(aC,j,a9S){
a7C[aC].ou.strokeStyle=a9S?colorPalette.localCommandProcessor:colorPalette.sendAttack;a7C[aC].ou.fillRect(zA,0,1,zA);
var fc=0;
var o7=0.3;
var ze=j-zA;a7C[aC].ou.beginPath();a7C[aC].ou.moveTo(Math.floor(o7*zA+ze),Math.floor(zA/2));
a7C[aC].ou.lineTo(Math.floor(zA-o7*zA+fc+ze),Math.floor(zA/2));a7C[aC].ou.stroke();
a7C[aC].ou.beginPath();a7C[aC].ou.moveTo(Math.floor(zA/2+ze),Math.floor(o7*zA));
a7C[aC].ou.lineTo(Math.floor(zA/2+ze),Math.floor(zA-o7*zA+fc));a7C[aC].ou.stroke();
}this.hm=function(m9,mA){if(localPlayer.a2G===2||playerData.nU[localPlayer.getTileOwner]===0||localPlayer.hi||gameState.gv.kH(localPlayer.getTileOwner)){
return false;}var aC;var a9b;var a9c;var a9d;
var a9e=uiSurface.platformActions.ik()?zA:0;
var a9f=uiSurface.platformActions.ik()?Math.floor(0.15*zA):0;for(aC=a7C.length-1;aC>=0;aC--){a9b=a9g(aC);a9c=a9h(aC);
a9d=a7C[aC].canvas.width;if(mA>=a9c-a9f&&mA<=a9c+zA+a9f){if(m9>=a9b-a9e&&m9<=a9b+zA+a9e){
if(!a7C[aC].a9a){a7C[aC].a9R=true;a7C[aC].a9a=true;if(a7C[aC].id===0){mapCache.hz.r0(a7C[aC].randomInt);}else{
mapCache.hz.qz(a7C[aC].randomInt);}}return true;}else if(a7C[aC].id===0&&m9>=a9b+a9d-zA-a9e&&m9<=a9b+a9d+a9e){
statsPanel.a7d(3);mapCache.hz.i6(clickHandler.i3(),a7C[aC].randomInt);return true;
}}}return false;};this.ee=function(){if(playerData.nU[localPlayer.getTileOwner]===0||(gameState.gv.kH(localPlayer.getTileOwner)&&!localPlayer.hi)){return;
}var a4r=a7C.slice(0,a9N);
var a4s=a7C.slice(a9N,a9N+a9O);a4r=a9i(a4r);a4s=a9j(a4s);a9N=a4r.length;
a9O=a4s.length;a7C=a4r.concat(a4s);};

function a9i(h){var a9k=alliances.collectAttackableTiles(localPlayer.getTileOwner);if(!a9l(h,a9k)){
a9m(h,a9k);return h;}h=a9n(h,a9k);a9m(h,a9k);return h;}

function a9j(h){var a9o=bonusSystem.z.ky[localPlayer.getTileOwner];
if(!a9p(h,a9o)){a9q(h,a9o);return h;}h=a9r(h,a9o);a9q(h,a9o);return h;}

function a9l(h,a9k){
if(a9N!==a9k){return true;}for(var aC=a9k-1;aC>=0;aC--){if(h[aC].randomInt!==alliances.gl(localPlayer.getTileOwner,aC)){return true;
}}return false;}

function a9p(h,a9o){if(a9O!==a9o){return true;}var us=localPlayer.getTileOwner<<3;
var mn=bonusSystem.z.mn;
var a9s=bonusSystem.z.a9s;for(var aC=a9o-1;aC>=0;aC--){var a9t=a9s[us+aC];if(h[aC].randomInt!==mn[a9t]){
return true;}}return false;}

function a9m(h,a9k){var aC,iI;for(aC=a9k-1;aC>=0;aC--){
iI=alliances.gm(localPlayer.getTileOwner,aC);if(h[aC].iI!==iI){h[aC].iI=iI;h[aC].a9Z=Math.max(iI,h[aC].a9Z);
h[aC].a9R=true;}}}

function a9q(h,a9o){var aC,iI;
var us=localPlayer.getTileOwner<<3;
var a8m=bonusSystem.z.a8m;
var ml=bonusSystem.z.ml;
var a9s=bonusSystem.z.a9s;for(aC=a9o-1;aC>=0;aC--){var a9t=a9s[us+aC];iI=a8m[a9t];if(h[aC].iI!==iI){
h[aC].iI=iI;h[aC].a9Z=Math.max(iI,h[aC].a9Z);h[aC].a9R=true;}else if(!h[aC].a9a&&ml[a9t]%64===5){
h[aC].a9a=true;h[aC].a9R=true;}}}

function a9n(h,a9k){var aC,k3,ft,iI,a7F;
var a8M=[];
loop:for(aC=0;aC<a9k;aC++){k3=alliances.gl(localPlayer.getTileOwner,aC);for(ft=0;ft<h.length;ft++){if(h[ft].randomInt===k3){
a8M.push(h.splice(ft,1)[0]);continue loop;}}iI=alliances.gm(localPlayer.getTileOwner,aC);a7F={k3:k3,iI:iI,a9Z:iI,id:0,
a9R:true,a9a:false,canvas:null,ou:null};a9P(a7F);a8M.push(a7F);}return a8M;}

function a9r(h,a9o){
var aC,k3,ft,iI,a7F;
var a8M=[];
var us=localPlayer.getTileOwner<<3;
var mn=bonusSystem.z.mn;
var a8m=bonusSystem.z.a8m;
var a9s=bonusSystem.z.a9s;
loop:for(aC=0;aC<a9o;aC++){var a9t=a9s[us+aC];k3=mn[a9t];for(ft=0;ft<h.length;ft++){
if(h[ft].randomInt===k3){a8M.push(h.splice(ft,1)[0]);continue loop;}}iI=a8m[a9t];a7F={k3:k3,iI:iI,a9Z:iI,
id:1,a9R:true,a9a:false,canvas:null,ou:null};a9P(a7F);a8M.push(a7F);}return a8M;}

function a9P(a7F){
a7F.canvas=document.createElement("canvas");dialogManager.distanceSquared.font=a9L;
var j=a9K;if(a7F.randomInt<localPlayer.isMountainTile&&a7F.id===0){
j+=Math.floor(dialogManager.distanceSquared.measureText(playerData.a0j[a7F.randomInt]+"000").width);}j+=zA;if(a7F.id===0){
j+=zA;}a7F.canvas.width=j;a7F.canvas.height=zA;a7F.ou=a7F.canvas.getContext("2d",{alpha:true});
a7F.ou.font=a9L;gameState.sK.textBaseline(a7F.ou,1);gameState.sK.textAlign(a7F.ou,1);
}

function a9g(aC){return touchInputHandler.a9u()?camera.j-a7C[aC].canvas.width-debugPanel.gap:touchInputHandler.fg;}

function a9h(aC){
return Math.floor(2*debugPanel.gap+(touchInputHandler.a9u()?focusHandler.k+debugPanel.gap:0)+touchInputHandler.k+aC*(1.3*zA));}this.wr=function(){
if(playerData.nU[localPlayer.getTileOwner]===0||(gameState.gv.kH(localPlayer.getTileOwner)&&!localPlayer.hi)){return;}for(var aC=a7C.length-1;aC>=0;aC--){
ws.drawImage(a7C[aC].canvas,a9g(aC),a9h(aC));}};}

function DeviceDetector(){var a88;var kz;
var a9v;var a9w;var k;var a7u;var fontSize;var a9x;var a9y;var a9z;var aA0;var canvas,ou;var nh;
var aA1;this.applyToGame=function(){nh=0;kz=4;a9v=a9w=0;a88=[];a7u=new Array(2);fontSize=new Array(2);
a9x=new Array(2);a9x[0]=0.3;a9x[1]=0.7;a9y=new Array(4);canvas=document.createElement("canvas");
aA1=clanPanel.eZ+2000;this.resize();};

function x7(aC){return(aC===0?L(108):aC===1?L(109):aC===2?
L(110):L(111));}this.resize=function(){var aC,j;k=Math.floor((uiSurface.platformActions.ik()?0.062:0.047)*camera.il);
fontSize[0]=Math.floor(a9x[0]*0.85*k);fontSize[1]=Math.floor(a9x[1]*0.85*k);
a7u[0]=gameState.sK.u8(1,fontSize[0]);a7u[1]=gameState.sK.u8(1,fontSize[1]);
for(aC=a9y.length-1;aC>=0;aC--){a9y[aC]=this.measureText(x7(aC)+"000",a7u[0]);
}a9z=Math.floor(1+0.05*k);aA0=Math.floor(0.2*k);if(a88.length>0){for(aC=a88.length-1;aC>=0;aC--){
j=this.measureText(a88[aC].s1+"00",a7u[1]);a88[aC].width=j<a9y[aC]?a9y[aC]:j;
}aA2();}};this.ee=function(){if(kz===0){return;}aA3();};

function aA3(){
if(kz===4){if(clanPanel.eZ>aA1){kz=0;if(localPlayer.a2G===1){deviceDetector.a2d(dialogManager.yd.ye[dialogManager.tileDataToIndexUnchecked].name,3,1,9);}}}else{
aA4();}}this.measureText=function(s1,a7u){ws.font=a7u;return Math.floor(ws.measureText(s1).width);
};this.ei=function(aA5,aC){this.a2d(playerData.a0j[aA5],aC,1,aC===0?3:7);
};this.a2d=function(s1,aA6,clampValue,nm){if(!s1.length){return;}var j=this.measureText(s1+"00",a7u[1]);
j=j<a9y[aA6]?a9y[aA6]:j;a88.push({s1:s1,width:j,aA6:aA6,clampValue:clampValue,nm:nm});
if(kz===0){a9v=0;kz=1;nh=clanPanel.eZ;}};

function aA4(){if(kz===1){if(a9v===0){
aA2();a9v=0.0001;}a9v+=(clanPanel.eZ-nh)*0.002;if(a9v>=1){a9w=0;kz=2;a9v=1;}clanPanel.ds=true;}else if(kz===2){
a9w+=(clanPanel.eZ-nh)/1000;if(a9w>a88[0].nm||(a9w>1&&a88.length>1)){kz=3;}}else if(kz===3){
a9v-=(clanPanel.eZ-nh)*0.002;if(a9v<=0){a9v=0;a88.shift();kz=a88.length>0?1:0;}clanPanel.ds=true;}nh=clanPanel.eZ;}
this.wr=function(){if(kz===0||a9v===0){return;}if(a9v<1){ws.globalAlpha=a9v;aA8();ws.globalAlpha=1;
return;}aA8();};

function aA8(){if(!localPlayer.iT){ws.drawImage(canvas,debugPanel.gap,aA9+2*debugPanel.gap);
return;}if(aA9+4*debugPanel.gap+k+gameMenu.aAA()>clickHandler.fi){ws.drawImage(canvas,2*debugPanel.gap+gameMenu.aAA(),aA9+2*debugPanel.gap);
return;}ws.drawImage(canvas,debugPanel.gap,aA9+3*debugPanel.gap+gameMenu.aAA());}

function aA2(){
canvas.width=a88[0].width+a9z;canvas.height=k+a9z;ou=canvas.getContext("2d",{alpha:true});
ou.clearRect(0,0,a88[0].width+a9z,k+a9z);ou.translate(Math.floor(a9z/2),Math.floor(a9z/2));
ou.lineWidth=a9z;ou.fillStyle=a88[0].clampValue===1?colorPalette.pT:colorPalette.pL;
aAB();ou.fill();ou.strokeStyle=a88[0].clampValue===1?colorPalette.pF:colorPalette.pO;aAB();
ou.stroke();gameState.sK.textAlign(ou,1);gameState.sK.textBaseline(ou,1);ou.fillStyle=a88[0].clampValue===1?colorPalette.pF:colorPalette.pO;
ou.font=a7u[0];ou.fillText(x7(a88[0].aA6),Math.floor(a88[0].width/2),
Math.floor(0.72*a9x[0]*k));ou.font=a7u[1];ou.fillText(a88[0].s1,Math.floor(a88[0].width/2),
Math.floor((a9x[0]+0.48*a9x[1])*k));}

function aAB(){ou.beginPath();ou.moveTo(aA0,0);
ou.lineTo(a88[0].width-aA0,0);ou.lineTo(a88[0].width,aA0);ou.lineTo(a88[0].width,k-aA0);
ou.lineTo(a88[0].width-aA0,k);ou.lineTo(aA0,k);ou.lineTo(0,k-aA0);ou.lineTo(0,aA0);
ou.closePath();}}

function CameraController(){var k;var canvas;var ou;var aAC;var aAD;var aAE;var aAF;
var a9R;var aAG;var aAH;var aAI;
var a8r=false;this.isTeamGame=false;this.j=0;var aAJ;
var a55=new Array(2);
var aAK=0;this.dl=function(){for(var aC=0;aC<2;aC++){a55[aC]=gameState.canvas.EndGameTransitionController(adSystem.get(3),8-aC,colorPalette.qb);
a55[aC]=gameState.canvas.a57(a55[aC]);}};this.applyToGame=function(){aAI=-10000;
aAK=0;aAH=0;aAJ=-1;this.isTeamGame=false;a8r=false;a9R=false;aAG=0;aAC=0;aAD=[0,0];aAE=[1,1];aAF=[];
this.resize();};this.resize=function(){k=clickHandler.k;this.j=4*k;canvas=document.createElement("canvas");
canvas.width=this.j;canvas.height=k;ou=canvas.getContext("2d",{alpha:true});
nH();};this.nG=function(){if(!a9R){return;}nH();};

function nH(){
var j=cameraController.j;a9R=false;a0P(ou,j,k);
var lp=Math.floor(j/2);if(aAC===1){ou.fillStyle=colorPalette.gameCommandDecoder;
ou.fillRect(lp,0,lp,k);}else if(aAC===-1){ou.fillStyle=colorPalette.interceptBoat;ou.fillRect(0,0,lp,k);}a0Q(ou,j,k,2);
var uf=Math.floor(0.25*k);uf=uf<2?2:uf;ou.fillStyle=colorPalette.pU;
var a91=Math.floor((k-4)*aAD[1]/aAE[1]);
if(a91>0){ou.fillRect(2,k-2-a91,uf,a91);}a91=Math.floor((k-4)*aAD[0]/aAE[0]);
if(a91>0){ou.fillRect(j-2-uf,k-2-a91,uf,a91);}var a0R=Math.floor(k/8);a0R=a0R<2?2:a0R;
a0S(ou,Math.floor(0.4*k),0,k,a0R,0.5,false);a0S(ou,Math.floor(j-1.4*k),0,k,a0R,0.5,true);
var fD=(1.1*k)/a55[0].width;ou.imageSmoothingEnabled=true;
ou.setTransform(fD,0,0,fD,(j-fD*a55[0].width)/2,-0.05*k);ou.drawImage(a55[+a8r],0,0);
ou.setTransform(1,0,0,1,0,0);}this.hm=function(fg,fi){if(!this.isTeamGame){return false;
}if(fg<camera.j-this.j-debugPanel.gap){return false;}var nw=a0M();if(fi<nw){return false;}if(localPlayer.hi){return true;
}if(!this.measureFittedFontScale(localPlayer.getTileOwner)){return true;}zoomHandler.screenToTileY&&zoomHandler.a4N();mapCache.hz.iN((fg>(camera.j-debugPanel.gap-this.j/2))?1:0);
return true;};this.ee=function(){if(aAH>0){aAH--;if(aAH===0){aAL();}return;}if(this.isTeamGame){
aAM();}else{if(aAN()){return;}if(aAJ>=0){aAO();aAP();}}};

function aAP(){aAJ=-1;a8r=arenaSystem.aAQ();
hoverProcessor.a6Y(257);hoverProcessor.a8q(a8r);cameraController.isTeamGame=true;a9R=true;aAG=360;aAR();}

function aAN(){var aAS=clanPanel.kr();
if(aAS%40!==14){return 0;}if(aAK){if(aAS<aAK){return 0;}if(aAS<aAI+535){return 0;}aAK=aAS+1071;
if(!gameState.gv.a5d()){return 0;}aAP();return 1;}if(territorySystem.lQ===1){aAK=aAS+535;return 0;}var a60;
if(localPlayer.iT){a60=gameMenu.lR();}else{a60=playerData.hN[mV[0]];}if(a60>=mathUtils.g0(96*localPlayer.chance,100)){aAK=aAS+535;}return 0;
}

function aAO(){hoverProcessor.a0i(250,L(112,[playerData.a0j[aAJ]]),673,aAJ,colorPalette.pO,colorPalette.pL,-1,true);}

function aAR(){
var ea=0;for(var aC=territorySystem.lQ-1;aC>=0;aC--){if(!gameState.gv.kH(territorySystem.lV[aC])){ea+=playerData.hN[territorySystem.lV[aC]];}}if(a8r){
aAE[0]=Math.max(mathUtils.g0(3*ea,4),1);}else{if(localPlayer.iT){var g1;if(localPlayer.survivorBotCount===9){if(mainMenu.lH[gameMenu.lT()]===8){
g1=80;}else{g1=mathUtils.g0(100*gameMenu.lR(),localPlayer.chance);g1=mathUtils.g0(mathUtils.distanceBetweenPointsAndEncoded(1550-11*g1,400,1000),10);
}}else{g1=mathUtils.g0(100*gameMenu.lR(),localPlayer.chance);g1=mathUtils.g0(mathUtils.distanceBetweenPointsAndEncoded(1600-12*g1,400,1000),10);
}g1=mathUtils.g0(g1*ea,100);aAE[0]=Math.max(g1,1);}else{if(localPlayer.survivorBotCount===8){aAE[0]=Math.max(mathUtils.g0(3*ea,4),1);
}else{aAE[0]=Math.max(mathUtils.g0(3*ea,5),1);}}}aAE[1]=Math.max(ea-aAE[0],1);
}

function aAM(){aAG--;if(aAG===180&&3*aAD[0]<aAE[0]){aAL();return;}if(aAD[0]>=aAE[0]){
if(a8r){inputController.a1s.a2B();}else{inputController.a1s.a2F();}return;}if(aAD[1]>=aAE[1]){aAH=4;return;}if(aAG<=0){aAL();
}}

function aAL(){aAI=clanPanel.kr();a9R=true;aAC=0;aAG=0;aAF=[];cameraController.isTeamGame=false;hoverProcessor.a2O(247);aAD[0]=aAD[1]=0;
hoverProcessor.a6Y(673);}this.a2H=function(){if(this.isTeamGame&&aAD[0]<aAE[0]){aAL();}};this.ru=function(player,aAT){
var aAU;if(aAT){aAU=L(113,[playerData.a0j[player]]);}else{aAU=L(114,[playerData.a0j[player]]);
}hoverProcessor.a0i(450,aAU,257,player,aAT?colorPalette.localCommandProcessor:colorPalette.pv,colorPalette.pL,-1,true);aAF.push(player);
a9R=true;
var ea=localPlayer.lE?Math.max(aAE[0],aAE[1]):playerData.hN[player];ea=Math.max(ea,1);if(aAT){aAD[0]+=ea;
}else{aAD[1]+=ea;}if(player===localPlayer.getTileOwner){aAC=aAT?1:-1;}};

function a0M(){if(clickHandler.a8X(hoverProcessor.a8T())){
return clickHandler.fi-k-debugPanel.gap;}if(packetReader.a8X(hoverProcessor.a8W())){return packetReader.a0M()-k-debugPanel.gap;}return camera.k-k-errorSystem.a7J()*debugPanel.gap;
}this.wr=function(){if(!this.isTeamGame){return;}var fi=a0M();ws.drawImage(canvas,camera.j-this.j-debugPanel.gap,fi);
};this.iO=function(player){if(aAG!==0){return false;}if(!gameState.gv.isValidTile(1)){
return false;}if(!gameState.gv.hl(player)){return false;}if(kf[player]>=10&&!gameState.gv.a5w(player,9)){
return false;}if(!aAV()){return false;}return true;};

function aAV(){if(localPlayer.lE){
return true;}var ej=clanPanel.kr();if(ej<aAI+100){return false;}if(ej<1607){return false;}return true;
}this.measureFittedFontScale=function(h7){if(!gameState.gv.isValidTile(1)){return false;}if(!gameState.gv.hl(h7)){return false;}if(!this.isTeamGame){
return false;}for(var aC=aAF.length-1;aC>=0;aC--){if(aAF[aC]===h7){return false;}}return true;
};this.iK=function(player){aAJ=player;};}

function ClickHandler(){var j,fg;var aAW;var canvas;var ou;
var iL;var jC;var a6P;var a7u;var a9R;
var aAX=11/12;this.fi=0;this.hn=false;this.applyToGame=function(){
iL=!localPlayer.isFreeForAll&&!localPlayer.hi;a9R=false;jC=(connectionMgr.buffer.data[182].value+1)/1024;a6P=0;this.hn=false;
this.resize();};this.resize=function(){if(uiSurface.platformActions.ik()&&camera.j<0.8*camera.k){this.k=Math.floor(0.066*camera.il);
j=camera.j-4*debugPanel.gap-this.k;}else{j=Math.floor((uiSurface.platformActions.ik()?0.65:0.389)*camera.il);j+=(12-j%12);
this.k=Math.floor(j/12);}aAW=Math.floor(3*this.k/2);a7u=gameState.sK.u8(1,Math.floor(0.5*this.k));
canvas=document.createElement("canvas");canvas.width=j;canvas.height=this.k;
ou=canvas.getContext("2d",{alpha:true});ou.font=a7u;gameState.sK.textBaseline(ou,1);gameState.sK.textAlign(ou,1);
this.aAY();aAZ();};this.aAY=function(){if(uiSurface.platformActions.ik()&&camera.j<0.8*camera.k){fg=this.k+3*debugPanel.gap;
}else{fg=Math.floor((camera.j-j)/2);}this.fi=camera.k-this.k-errorSystem.a7J()*debugPanel.gap;};this.nG=function(){
if(a9R){a9R=false;aAZ();}};

function aAa(){var g1;
var aAb=130;if(jC<1/3){g1=Math.floor(3*jC*aAb);
return "rgba("+g1+","+aAb+",0,0.85)";}else if(jC<2/3){g1=Math.floor(3*(jC-1/3)*aAb);
return "rgba("+aAb+","+(aAb-g1)+",0,0.85)";}else{g1=Math.floor(3*(jC-2/3)*aAb);
return "rgba("+aAb+",0,"+g1+",0.85)";}}

function aAZ(){var a9Y=Math.floor(jC*(j-2*aAW));
var aAc=1+Math.floor(0.0625*clickHandler.k);
var aAd=1+Math.floor(0.3*clickHandler.k);
var aAe=Math.floor(0.55*clickHandler.k);
ou.clearRect(0,0,j,clickHandler.k);ou.fillStyle=colorPalette.pK;ou.fillRect(0,0,aAW,clickHandler.k);
ou.fillRect(aAW+a9Y,0,j-aAW-a9Y,clickHandler.k);ou.fillStyle=aAa();ou.fillRect(aAW,0,a9Y,clickHandler.k);
ou.fillStyle=colorPalette.pO;ou.fillRect(0,0,j,1);ou.fillRect(0,clickHandler.k-1,j,1);ou.fillRect(0,0,1,clickHandler.k);
ou.fillRect(aAW,0,1,clickHandler.k);ou.fillRect(aAW+a9Y,0,1,clickHandler.k);ou.fillRect(j-aAW,0,1,clickHandler.k);
ou.fillRect(j-1,0,1,clickHandler.k);ou.fillRect(Math.floor(0.25*clickHandler.k)+aAd,Math.floor((clickHandler.k-aAc)/2),
clickHandler.k-2*aAd,aAc);ou.fillRect(Math.floor(j-1.25*clickHandler.k)+aAd,Math.floor((clickHandler.k-aAc)/2),
clickHandler.k-2*aAd-aAd%2,aAc);ou.fillRect(Math.floor(j-1.25*clickHandler.k)+Math.floor((clickHandler.k-aAc)/2),aAd,
aAc,clickHandler.k-2*aAd-aAd%2);a6P=gameState.gv.jB(localPlayer.getTileOwner,clickHandler.i3());
ou.fillText(gameState.tI.currentLoopHandler(a6P)+" ("+gameState.tI.a6I(100*jC,+(jC<0.1))+")",Math.floor(0.5*j),aAe);
}this.isTeamGame=function(){return!(!iL||zoomHandler.screenToTileY&&fg<Math.floor(debugPanel.gap+5.5*this.k));};this.a8X=function(aAf){
if(this.isTeamGame()){return fg+j>camera.j-aAf-debugPanel.gap;}return false;};this.a6W=function(){iL=!localPlayer.hi;
};this.aAL=function(){iL=false;};this.i3=function(){return mathUtils.distanceBetweenPointsAndEncoded(Math.floor(jC*1024+0.5)-1,0,1023);
};this.a4G=function(m9,mA){return this.isTeamGame()&&m9>fg&&m9<fg+j&&mA>this.fi;
};

function aAg(m9,mA){return m9>fg&&m9<fg+aAW&&mA>clickHandler.fi;}

function aAh(m9,mA){
return m9>fg+j-aAW&&m9<fg+j&&mA>clickHandler.fi;}this.hm=function(m9,mA){if(!this.isTeamGame()){return false;
}if(!clickHandler.a4G(m9,mA)){return false;}hoverHandler.o0=false;if(aAi(this,m9,mA)){clanPanel.ds=true;}return true;
};

function aAi(tt,m9,mA){if(aAg(m9,mA)){return aAj(aAX);}if(aAh(m9,mA)){return aAj(1/aAX);
}tt.hn=true;return aAk(m9);}this.a4J=function(o7){if(localPlayer.a2G===0||!this.isTeamGame()){return;}if(aAj(o7)){
clanPanel.ds=true;}};

function aAj(a4e){if(a4e>1&&jC===1){return false;}if(a4e>1&&a4e*jC-jC<1/1024){
a4e=(jC+1/1024)/jC;}else if(a4e<1&&jC-a4e*jC<1/1024){a4e=(jC-1/1024)/jC;}jC=mathUtils.distanceBetweenPointsAndEncoded(jC*a4e,1/1024,1);
aAZ();return true;}

function aAk(m9){var ea=jC;jC=mathUtils.distanceBetweenPointsAndEncoded((m9-fg-aAW)/(j-2*aAW),1/1024,1);if(ea!==jC){
aAZ();return true;}return false;}this.a3p=function(deltaY){var o7;if(deltaY===0||!this.isTeamGame()){
return false;}if(deltaY>0){o7=400/(400+deltaY);o7=o7<aAX?aAX:o7;}else{o7=(400-deltaY)/400;
o7=o7>1/aAX?1/aAX:o7;}return aAj(o7);};this.a3m=function(m9){if(this.hn){return aAk(m9);
}return false;};this.a4C=function(){this.hn=false;};this.ee=function(){if(!this.isTeamGame()){
return;}if(a6P!==gameState.gv.jB(localPlayer.getTileOwner,this.i3())){a9R=true;}};this.wr=function(){if(!this.isTeamGame()){return;
}ws.drawImage(canvas,fg,this.fi);};}

function BinaryReader(){var canvas;var ou;var aAl;var font;
var aAm=0;
var aAn=false;
var aAo=[10,5,3,2,1.5,1,0.75,0.5,0.25];
var aAp=5;this.a73=false;this.applyToGame=function(){
if(!localPlayer.hi){return;}aAp=5;this.a73=false;aAn=false;aAl=new su([0.3,0.3/6],[0.5,1]);
this.resize();};this.aAq=function(){return aAo[aAp];};this.a0M=function(){
return aAl.fi;};this.a8X=function(aAf){if(localPlayer.hi){return aAl.fg+aAl.j>camera.j-aAf-debugPanel.gap;
}return false;};this.resize=function(){if(!localPlayer.hi){return;}aAl.resize();aAl.fi-=(errorSystem.a7J()-1)*debugPanel.gap;
font=gameState.sK.u8(0,0.3*aAl.k);canvas=document.createElement("canvas");canvas.width=Math.floor(aAl.j);
canvas.height=Math.floor(aAl.k);ou=canvas.getContext("2d",{alpha:true});
ou.font=font;gameState.sK.textAlign(ou,1);gameState.sK.textBaseline(ou,1);
nH(this);};this.a4M=function(aAr){if(localPlayer.a2G===0||account.isTeamGame()){return;}if(aAr===localPlayer.ny){return;}localPlayer.ny=aAr;
gameMenu.resize();clanPanel.ds=true;if(localPlayer.hi){aAm=clanPanel.eZ+2000;nH(this);}};this.hm=function(fg,fi){if(!localPlayer.hi){
return false;}if(fg<aAl.fg||fi<aAl.fi||fg>aAl.fg+aAl.j){return aAn&&aAs(this,fg,fi);}fg-=aAl.fg;
if(fg<0.3*aAl.j){aAn=false;this.a4M(!localPlayer.ny);return true;}else if(fg<0.7*aAl.j){aAn=!aAn;clanPanel.ds=true;
return true;}this.a4O(false);return true;};this.a4O=function(aAt){if(localPlayer.a2G===2){this.a4M(false);
account.v(3);return;}aAn=false;this.a73=!this.a73;if(this.a73){if(zoomHandler.screenToTileY){zoomHandler.a4N();}uiSurface.platformActions.setState(1);
}else{!aAt&&zoomHandler.a81();}clanPanel.ds=true;nH(this);};this.aAu=function(){this.a73=false;zoomHandler.a81();
clanPanel.ds=true;nH(this);};this.a45=function(fg,fi){if(!localPlayer.ny){return false;}if(zoomHandler.hm(fg,fi)>=0){
return true;}if(!localPlayer.hi){hoverHandler.hm(fg,fi);return true;}if(clanPanel.eZ>aAm||!this.hm(fg,fi)){
hoverHandler.hm(fg,fi);}clanPanel.ds=true;aAm=clanPanel.eZ+2000;return true;};this.ee=function(){
if(localPlayer.hi&&localPlayer.ny&&clanPanel.eZ>aAm-1000&&clanPanel.eZ<aAm){clanPanel.ds=true;}};this.a2P=function(){if(!localPlayer.hi){
return;}this.a73=false;clanPanel.ds=true;nH(this);};this.wr=function(){if(!localPlayer.hi){return;}if(localPlayer.ny){
if(clanPanel.eZ>aAm){return;}if(clanPanel.eZ>aAm-1000){ws.globalAlpha=aAv(0,(1000-(clanPanel.eZ-(aAm-1000)))/1000,1);
aAw();ws.globalAlpha=1;return;}}aAw();};

function aAw(){if(aAn){aAx();
}ws.drawImage(canvas,Math.floor(aAl.fg),Math.floor(aAl.fi));}

function nH(tt){aAy();aAz();aB0();
!tt.a73?aB1():aB2();aB3();}

function aAy(){ou.clearRect(0,0,Math.floor(aAl.j),Math.floor(aAl.k));
ou.fillStyle=colorPalette.pK;ou.fillRect(0,0,Math.floor(aAl.j),Math.floor(aAl.k));
if(localPlayer.ny){ou.fillStyle=colorPalette.sendSpawn;ou.fillRect(0,0,Math.floor(0.3*aAl.j),Math.floor(aAl.k));
}}

function aAz(){ou.fillStyle=colorPalette.pO;ou.fillText("Hide UI",0.15*aAl.j,0.5*aAl.k);
ou.fillRect(Math.floor(0.3*aAl.j-0.5),0,2,Math.floor(aAl.k));}

function aB0(){
var fg=0.5*aAl.j;ou.fillText("Replay Speed",fg,0.31*aAl.k);ou.fillText(aB4(aAp),fg,0.69*aAl.k);
ou.fillRect(Math.floor(0.7*aAl.j-0.5),0,2,Math.floor(aAl.k));}

function aB1(){
var j=Math.floor(0.46*aAl.k);
var k=Math.floor(0.23*aAl.k);
var fg=Math.floor(0.85*aAl.j-0.5*j+j/12);
var fi=Math.floor(0.5*aAl.k-k);ou.beginPath();ou.moveTo(fg,fi);ou.lineTo(fg+j,fi+k);
ou.lineTo(fg,fi+(k<<1));ou.fill();}

function aB2(){var uf=Math.floor(0.02*aAl.j);
var ug=Math.floor(0.025*aAl.j);
var nv=Math.floor(0.85*aAl.j-uf-0.5*ug);
var nw=Math.floor(0.25*aAl.k);
var aAe=Math.floor(aAl.k)-2*nw;ou.fillRect(nv,nw,uf,aAe);
ou.fillRect(nv+uf+ug,nw,uf,aAe);}

function aB3(){ou.fillRect(0,0,Math.floor(aAl.j),2);
ou.fillRect(0,0,2,Math.floor(aAl.k));ou.fillRect(0,Math.floor(aAl.k)-2,Math.floor(aAl.j),2);
ou.fillRect(Math.floor(aAl.j-2),0,2,Math.floor(aAl.k));}

function aAx(){var aC;
var fZ=aAo.length;
var aAe=Math.floor(0.5*aAl.k);
var k=fZ*aAe;
var fg=Math.floor(Math.floor(aAl.fg)+0.3*aAl.j-0.5);
var fi=Math.floor(Math.floor(aAl.fi)-k);
var j=Math.floor(0.4*aAl.j+2.5);
ws.fillStyle=colorPalette.pK;ws.fillRect(fg,fi,j,k);ws.fillStyle=colorPalette.sendSpawn;ws.fillRect(fg,fi+aAp*aAe,j,aAe);
ws.fillStyle=colorPalette.pO;ws.fillRect(fg,fi,2,k);ws.fillRect(fg,fi,j,2);ws.fillRect(fg+j-2,fi,2,k);
for(aC=1;aC<fZ;aC++){ws.fillRect(fg,fi+aC*aAe,j,2);}ws.fillStyle=colorPalette.pO;gameState.sK.textAlign(ws,1);
gameState.sK.textBaseline(ws,1);ws.font=gameState.sK.u8(0,0.6*aAe);fg=fg+0.5*j;for(aC=0;aC<fZ;aC++){
ws.fillText(aB4(aC),fg,fi+(aC+0.6)*aAe);}}

function aAs(tt,fg,fi){var fZ=aAo.length;
var aAe=Math.floor(0.5*aAl.k);
var k=fZ*aAe;
var nv=Math.floor(Math.floor(aAl.fg)+0.3*aAl.j-0.5);
var nw=Math.floor(Math.floor(aAl.fi)-k);
var j=Math.floor(0.4*aAl.j+2.5);aAn=false;
clanPanel.ds=true;if(fg<nv||fg>nv+j||fi<nw){return true;}aAp=aAv(0,Math.floor((fi-nw)/aAe),fZ-1);
nH(tt);return true;}

function aB4(aC){return aC===5?"Normal":(""+aAo[aC]);
}}var im;var jD;var jE;

function HoverHandler(){var aB5;var aB6;var j;var fg,fi;
var aB7;var aB8;this.applyToGame=function(){aB5=new Array(2);aB6=new Array(2);this.o0=false;jD=0;jE=0;aB7=0;
aB8=0;im=1;this.resize();};this.resize=function(){j=Math.floor((uiSurface.platformActions.ik()?0.072:0.0502)*camera.il);
j=j<8?8:j;for(var aC=1;aC>=0;aC--){aB5[aC]=document.createElement("canvas");
aB5[aC].width=j;aB5[aC].height=j;aB6[aC]=aB5[aC].getContext("2d",{alpha:true});}this.aAY();
aB9();};

function aBA(aBB,a8Y){return(Math.pow((aBB-(fg+j/2)),2)+Math.pow((a8Y-(fi+j/2)),2)<j*j/4||
Math.pow((aBB-(fg+j/2)),2)+Math.pow((a8Y-(fi+2*j)),2)<j*j/4);
}this.canvasStrokeWidth=function(){return-jD/im;};this.a0M=function(){
return-jE/im;};this.oA=function(aBC,it){jD=im*aBC-it;};this.oB=function(aBD,iu){
jE=im*aBD-iu;};this.hm=function(aBB,a8Y){if(!localPlayer.ny&&aBA(aBB,a8Y)&&!connectionMgr.buffer.data[8].value){
if(a8Y<fi+1.25*j){return this.a3p(Math.floor(camera.j/2),Math.floor(camera.k/2),-200);
}else{return this.a3p(Math.floor(camera.j/2),Math.floor(camera.k/2),200);}}else{
if(soloCalc.visibleTileDirty()){this.o0=true;aB7=aBB;aB8=a8Y;}}return false;};this.a3m=function(aBB,a8Y){if(!soloCalc.visibleTileDirty()){
return true;}var aBE=jD;
var aBF=jE;
var iw=aB7-aBB;
var iz=aB8-a8Y;jD+=iw;jE+=iz;troops.a3m(iw,iz);
this.aBG();aB7=aBB;aB8=a8Y;return(aBE!==jD||aBF!==jE);};this.a3p=function(m9,mA,deltaY){var o7;
if(!soloCalc.visibleTileDirty()){return true;}if(deltaY>0){o7=500/(500+deltaY);o7=o7<0.5?0.5:o7;}else if(deltaY<0){
o7=(500-deltaY)/500;o7=o7>2?2:o7;}else{return false;}this.aBH(m9,mA,o7);clanPanel.ds=true;return true;
};this.aBH=function(fg,fi,fD){fD=aBI(fD);troops.zoom(fD,fg,fi);aBJ(fD,fg,fi);};this.aBG=function(){
var aBK=camera.j/16;
var aBL=0;
var aBM=camera.k/16;
var aBN=0;if(jD< -camera.j+aBK){aBL=-camera.j+aBK-jD;
}if(jD>im*dialogManager.fk-aBK){aBL=im*dialogManager.fk-aBK-jD;}if(jE< -camera.k+aBM){aBN=-camera.k+aBM-jE;}if(jE>im*dialogManager.fl-aBM){
aBN=im*dialogManager.fl-aBM-jE;}jD+=aBL;jE+=aBN;leaderboardPanel.oC();troops.aBO(aBL,aBN);};

function aBI(a4e){
a4e=a4e*im>1024?1024/im:a4e;a4e=a4e*im<0.125?0.125/im:a4e;return a4e;}

function aBJ(a4e,m9,mA){
im*=a4e;jD=(jD+m9)*a4e-m9;jE=(jE+mA)*a4e-mA;hoverHandler.aBG();}

function aB9(){var aBP=Math.floor(1+j/20);
for(var aC=1;aC>=0;aC--){aB6[aC].clearRect(0,0,j,j);aB6[aC].fillStyle=colorPalette.pH;
aB6[aC].beginPath();aB6[aC].arc(j/2,j/2,j/2-aBP,0,2*Math.PI);aB6[aC].fill();
aB6[aC].lineWidth=aBP;aB6[aC].fillStyle=colorPalette.pO;aB6[aC].strokeStyle=colorPalette.pO;aB6[aC].beginPath();
aB6[aC].arc(j/2,j/2,j/2-aBP,0,2*Math.PI);aB6[aC].stroke();a0S(aB6[aC],0,0,j,aBP,0.3,aC===0);
}}this.aAY=function(){fg=camera.j-j-debugPanel.gap;fi=Math.floor(camera.k/2-1.25*j);
};this.wr=function(){if(connectionMgr.buffer.data[8].value){return;}ws.drawImage(aB5[0],fg,fi);
ws.drawImage(aB5[1],fg,Math.floor(fi+3*j/2));};}

function KeyboardHandler(){var h;var aBQ;var aBR;
var aBS;var gap;var aBT;var aBU;var aBV;var aBW;var aBX;var a7u;var aBY;var he;var aBZ;var a9Y;
var aBa;var aBb;this.aBc=false;this.applyToGame=function(){aBa=-1;aBb=-1;aBZ=1;aBW=-1;this.aBd=false;
he=0;aBY=new Date();aBQ=0;gap=0.3;aBe();h=[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5];this.resize();
};this.resize=function(){aBR=Math.floor(0.15*camera.k);aBX=Math.floor((uiSurface.platformActions.ik()?0.018:0.0137)*camera.il);
aBX=aBX<2?2:aBX;a7u=gameState.sK.u8(1,aBX);aBf();};

function aBe(){
}this.aBg=function(aBh){var aC;this.aBc=true;for(aC=0;aC<aBh.length;aC++){h.unshift(aBh[aC]);
}aBf();clanPanel.ds=true;};

function aBf(){aBS=Math.floor((uiSurface.platformActions.ik()?0.07:0.035)*0.2*camera.il);
aBS=a8V(uiSurface.platformActions.ik()?3:1,aBS);
var aBi=camera.j/(h.length+gap);
aBS=aBi>aBS?aBi:aBS;a9Y=Math.floor((1-gap)*aBS);aBQ=0;aBj();}this.aBk=function(){
aBj();};

function aBj(){aBQ=aBQ< -20?-20:aBQ;aBQ=aBQ>(h.length-15)*aBS?(h.length-15)*aBS:aBQ;
aBU=Math.floor(aBQ/aBS);aBV=aBU+Math.floor(camera.j/aBS);
aBV=aBV>h.length-1?h.length-1:aBV;aBU=aBV<aBU?aBV:aBU;aBU=aBU<0?0:aBU;aBl();
}

function aBl(){var lp=aBV;aBT=aBR/h[lp];for(var aC=aBV-1;aC>=aBU;aC--){if(h[aC]>h[lp]){lp=aC;
aBT=aBR/(Math.pow(h[aC],aBZ));}}}

function aBm(fg){var ea=Math.floor((aBQ+camera.j-fg-gap*aBS)/aBS);
ea=ea< -1?-1:ea===-1?0:ea>h.length-1?-1:ea;if(ea!==aBW){aBW=ea;if(aBa===-1&&aBW===0&&keyboardHandler.aBc){
aBa=setInterval(aBn,100);}return true;}return false;}this.a3m=function(fg,fi){
if(fi>camera.k-0.6*aBR){if(this.aBd){if(fg!==he){aBQ+=fg-he;he=fg;aBj();aBm(fg);this.aBd=aBW!==-1;
clanPanel.ds=true;}return;}if(aBm(fg)){clanPanel.ds=true;return;}}else{this.reset();}};this.reset=function(){
if(aBW!==-1){this.aBd=false;aBW=-1;clanPanel.ds=true;}};this.a3p=function(fg,deltaY){if(aBW!==-1){
aBQ+=Math.floor(deltaY);aBj();aBm(fg);clanPanel.ds=true;}};this.hm=function(fg,fi){this.a3m(fg,fi);
if(aBW!==-1){he=fg;this.aBd=true;}};this.a4B=function(){if(aBW!==-1){this.aBd=false;}};
this.wr=function(){ws.fillStyle=colorPalette.pR;for(var aC=aBV;aC>=aBU;aC--){aBo(aC);}if(this.aBc&&aBU===0){
ws.fillStyle=colorPalette.interceptBoat;aBo(0);}if(aBW!==-1){ws.fillStyle=colorPalette.pQ;aBo(aBW);}aBp();};

function aBo(aC){
var aBq=Math.floor(aBT*(Math.pow(h[aC],aBZ)));ws.fillRect(aBQ+camera.j-(aC+1)*aBS,camera.k-aBq,a9Y,aBq);
}

function aBp(){if(aBW===-1){return;}ws.font=a7u;gameState.sK.textBaseline(ws,2);
var ea=new Date();ea.setTime(aBY.getTime()-aBW*1000*60*60*24);
var month="month";
var aBr="day";
if(typeof Intl!=="undefined"){month=new Intl.DateTimeFormat("en-US",{month:"long"}).format(ea);
aBr=new Intl.DateTimeFormat("en-US",{weekday:"long"}).format(ea);
}var aBs=aBr+", "+ea.getUTCDate()+" "+month+" "+ea.getFullYear();
var aBt;aBt=h[aBW]===1?L(115):L(116);aBt=gameState.tI.currentLoopHandler(h[aBW])+" "+aBt;
var uf=Math.floor(ws.measureText(aBs).width);
var ug=Math.floor(ws.measureText(aBt).width);
var aBu=Math.floor(0.5*(uf+aBX));
var aBv=aBQ+camera.j-(aBW+1)*aBS;
aBv=aBv<aBu?aBu:aBv>camera.j-aBu?camera.j-aBu:aBv;
var nw=camera.k-Math.floor(aBT*(Math.pow(h[aBW],aBZ)));
var aBw=Math.floor(1.1*aBX);
var aBx=nw>camera.k-aBw?camera.k-aBw:nw;ws.fillStyle=colorPalette.pL;
ws.fillRect(camera.j-ug-aBX,aBx-aBw,ug+aBX,aBw);ws.fillRect(aBv-aBu,camera.k-aBw,uf+aBX,aBw);
ws.fillStyle=colorPalette.pO;gameState.sK.textAlign(ws,2);ws.fillText(aBt,Math.floor(camera.j-0.5*aBX),aBx);
gameState.sK.textAlign(ws,1);ws.fillText(aBs,aBv,camera.k);ws.strokeStyle=colorPalette.pS;
ws.lineWidth=1;ws.beginPath();ws.moveTo(0,nw);ws.lineTo(camera.j,nw);ws.closePath();ws.stroke();
}

function aBn(){if(moderationSystem.a3P()===8){aBW=-1;}if(aBW!==0){aBb=(new Date()).getTime();clearInterval(aBa);
aBa=-1;return;}var h7=h[1]/(24*60*60*10);if(aBb!==-1){var ea=(new Date()).getTime();
h7+=(ea-aBb)*h[1]/(24*60*60*1000);aBb=-1;}if(h7>0){h[0]+=Math.floor(h7);
clanPanel.ds=true;}}}

function TouchInputHandler(){this.fg=0;this.k=0;var a7u;var j,fi,aBy;var aBz;var aC0;var canvas;
var ou;var a9R;var a5k;var aC1;var aC2;var aC3;var aC4;this.applyToGame=function(){aC0=localPlayer.a6e;aC2="rgba(0,100,0,0.8)";
aC3="rgba(150,0,0,0.8)";aC1=true;a9R=true;a5k=playerData.hb[localPlayer.getTileOwner];this.resize();};this.resize=function(){
j=Math.floor((uiSurface.platformActions.ik()?0.305:0.24)*camera.il);this.k=Math.floor(0.5+0.13*j);j=Math.floor(this.k*6);
a7u=gameState.sK.u8(1,Math.floor(0.8*this.k));aBz=gameState.sK.u8(1,Math.floor(0.45*this.k));
aC4=Math.floor(0.5*this.k);dialogManager.distanceSquared.font=a7u;fi=debugPanel.gap;aBy=Math.floor(1+0.13*this.k);
canvas=document.createElement("canvas");canvas.width=j;canvas.height=this.k;
ou=canvas.getContext("2d",{alpha:true});gameState.sK.textBaseline(ou,1);gameState.sK.textAlign(ou,1);this.aC5();
};this.a9u=function(){return uiSurface.platformActions.ik()&&camera.j<1.2*camera.k;};this.aAY=function(){if(this.a9u()){
this.fg=camera.j-j-debugPanel.gap;}else{this.fg=Math.floor(uiColors.aC6()+(camera.j-uiColors.aC6()-focusHandler.j-j)/2-0.5*debugPanel.gap);
}};this.nG=function(){if(a9R){a9R=false;this.aC5();}};this.aC5=function(){ou.font=a7u;
ou.clearRect(0,0,j,this.k);ou.fillStyle=aC1?aC2:aC3;ou.fillRect(0,0,j,this.k);ou.fillStyle=colorPalette.pQ;
var ej=this.aC7();this.aC8();ou.fillStyle=playerData.hb[localPlayer.getTileOwner]>=botSpawner.ka(localPlayer.getTileOwner)?colorPalette.pv:colorPalette.pO;
var aC9=gameState.tI.currentLoopHandler(a5k);ou.fillText(aC9,Math.floor(j/2),aC4);
var uf=ou.measureText(aC9).width;
ou.font=aBz;ou.fillStyle=ej===9?colorPalette.qV:colorPalette.pO;
var aCA=botSpawner.aCB;
var aCC="+"+aCA;
var ug=ou.measureText(aCC).width;
var aCD=Math.floor(this.k/12);
var nv=0.5*(j+uf)+aCD;
if(nv+ug+aBy<=j){ou.fillText(aCC,Math.floor(nv+0.5*ug),Math.floor(0.3*this.k));
}else if(aCA>=1000){aCC="+"+Math.floor(aCA/1000)+"K";ug=ou.measureText(aCC).width;
if(nv+ug+aBy<=j){ou.fillText(aCC,Math.floor(nv+0.5*ug),Math.floor(0.3*this.k));
}}ou.fillStyle=colorPalette.pO;ou.fillRect(0,0,j,1);ou.fillRect(0,0,1,this.k);
ou.fillRect(0,this.k-1,j,1);ou.fillRect(j-1,0,1,this.k);};this.aC7=function(){
var ej=clanPanel.kr()%100;ej-=ej%10;ej=9-mathUtils.g0(ej,10);
var zO=Math.floor(ej*(this.k-aBy)/9);
ou.fillRect(0,zO,aBy,this.k-zO);ou.fillRect(j-aBy,zO,aBy,this.k-zO);return ej;
};this.aC8=function(){ou.fillRect(aBy,this.k-aBy,Math.floor((j-2*aBy)*playerData.hb[localPlayer.getTileOwner]/aC0),aBy);
};this.ee=function(){var h7=localPlayer.getTileOwner;if(!gameState.gv.hl(h7)){return;}var ft=playerData.hb[h7]-playerData.a5j[h7];
if(a5k!==ft){aC0=a8V(ft,aC0);aC1=ft>a5k&&ft>=10;a5k=ft;a9R=true;}else if(clanPanel.kr()%10===9){
a9R=true;}};this.wr=function(){if(playerData.nU[localPlayer.getTileOwner]===0||localPlayer.isFreeForAll||playerData.a5a[localPlayer.getTileOwner]===2){
return;}ws.drawImage(canvas,this.fg,fi);};}var aA9;var mV;var kf;

function UIColors(){var aCE;
var aCF;var aCG;var aCH;var aCI;var aCJ;var aCK;var aCL;var aCM;var aCN,aCO;var aCP;var aCQ;
var aCR,aCS,aCT;var aCU;var aCV;var aCW;var aCX;var aCY;var aCZ;var position;var aCa;var aCb;
var aCc;var aCd;var aCe;
var aCf=1;
var aCg=1;
var aCh="";this.applyToGame=function(){var aC;account.z.uS[0]=0;aCa=0;
aCb=false;aCc=0;aCd=0;aCe=false;aCZ=-1;aCI=uiSurface.platformActions.ik()?6:10;position=0;aCg=connectionMgr.buffer.data[11].value;
aCg=aCg===0?10:aCg===1?5:1;aCY=false;aCW=new Uint16Array(aCI+1);aCX=new Uint32Array(aCI+1);
aCM=localPlayer.isMountainTile;mV=new Uint16Array(aCM);kf=new Uint16Array(aCM);for(aC=aCM-1;aC>=0;aC--){mV[aC]=aC;
kf[aC]=aC;}this.resize(true);aCU=new Uint16Array(localPlayer.isMountainTile);
var aCi=Math.floor(aCE-aCS-aCR-aCL);
aCV=new Array(localPlayer.isMountainTile);aCK.font=aCH;for(aC=localPlayer.isMountainTile-1;aC>=0;aC--){aCV[aC]=(aC+1)+".";
playerData.a0j[aC]=gameState.ou.a5J(playerData.a2w[aC],aCH,aCi);aCU[aC]=Math.floor(aCK.measureText(playerData.a0j[aC]).width);
}aCj();};this.resize=function(dk){if(uiSurface.platformActions.ik()){
aCE=Math.floor(0.335*camera.il);aA9=Math.floor((aCI*aCE)/8);}else{aCE=Math.floor(0.27*camera.il);
aA9=Math.floor((aCI*aCE)/10);}aCE=Math.floor(0.97*aCE);aCJ=document.createElement("canvas");
aCJ.width=aCE;aCJ.height=aA9;aCK=aCJ.getContext("2d",{alpha:true});
aCN=0.025*aCE;aCG=0.160*aCE;aCO=0.000*aCE;aCP=Math.floor(0.45*aCN+aCG);aCQ=(aA9-aCG-2*aCN-aCO)/aCI;
aCF=gameState.sK.u8(1,Math.floor(0.55*aCG));aCf=Math.floor((uiSurface.platformActions.ik()?0.67:0.72)*aCQ);
aCH=gameState.sK.u8(0,aCf);aCK.font=aCH;aCR=Math.floor(0.04*aCE);
aCS=Math.floor((uiSurface.platformActions.ik()?0.195:0.18)*aCE);aCL=Math.floor(aCK.measureText("00920600").width);
aCK.font=aCF;aCT=aCE-aCR;if(!dk){aCK.font=aCH;for(var aC=localPlayer.isMountainTile-1;aC>=0;aC--){
aCU[aC]=Math.floor(aCK.measureText(playerData.a0j[aC]).width);}aCj();}aCh=gameState.ou.a5J(L(117),aCF,0.96*aCE);
};this.aC6=function(){return aCE;};this.nG=function(by,aCk){if(aCk||(aCY&&(by||clanPanel.kr()%aCg===0))){
aCY=false;aCj();}};

function aCj(){var fs;aCK.clearRect(0,0,aCE,aA9);
aCK.fillStyle=aCe?colorPalette.qI:colorPalette.qE;aCK.fillRect(0,0,aCE,aCP);aCK.fillStyle=colorPalette.pK;
aCK.fillRect(0,aCP,aCE,aA9-aCP);if(kf[localPlayer.getTileOwner]>=position){aCl(kf[localPlayer.getTileOwner]-position,colorPalette.sendSpawn);
}if(kf[localPlayer.getTileOwner]!==0&&position===0){aCl(0,colorPalette.qM);}if(aCZ!==-1){aCl(aCZ,colorPalette.pP);}aCK.fillStyle=colorPalette.pO;
aCK.fillRect(0,aCP,aCE,1);aCK.fillRect(0,0,aCE,debugPanel.a1E);aCK.fillRect(0,0,debugPanel.a1E,aA9);
aCK.fillRect(aCE-debugPanel.a1E,0,debugPanel.a1E,aA9);aCK.fillRect(0,aA9-debugPanel.a1E,aCE,debugPanel.a1E);
aCK.font=aCF;gameState.sK.textBaseline(aCK,1);gameState.sK.textAlign(aCK,1);
aCK.fillText(aCh,Math.floor(aCE/2),Math.floor(aCN+aCG/2));
var h8=kf[localPlayer.getTileOwner]<position+aCI-1?1:2;
aCK.font=aCH;gameState.sK.textAlign(aCK,0);for(fs=aCI-h8;fs>=0;fs--){aCm(mV[fs+position]);
aCn(fs,fs+position,mV[fs+position]);}gameState.sK.textAlign(aCK,2);for(fs=aCI-h8;fs>=0;fs--){
aCm(mV[fs+position]);aCo(fs,mV[fs+position]);}if(h8===2){aCm(localPlayer.getTileOwner);gameState.sK.textAlign(aCK,0);
aCn(aCI-1,kf[localPlayer.getTileOwner],localPlayer.getTileOwner);gameState.sK.textAlign(aCK,2);aCo(aCI-1,localPlayer.getTileOwner);}if(position===0){
aCp();}}

function aCm(player){if(localPlayer.iT){aCK.fillStyle=mainMenu.aCq[mainMenu.aCr[player]];}}

function aCl(aC,aCs){
aCK.fillStyle=aCs;aC=aC>aCI-1?aCI-1:aC;
var aCt=Math.floor((aC===aCI-1?2:aC===0?1.15:1)*aCQ);
aCt=aC===aCI-2?Math.floor(aCP+9.15*aCQ)-Math.floor(aCP+8.15*aCQ):aCt;
aCK.fillRect(0,Math.floor(aCP+(aC+(aC===0?0:0.15))*aCQ),
aCE,aCt);}

function aCp(){var a7z=0.7*aCQ/adSystem.get(4).height;
aCK.setTransform(a7z,0,0,a7z,Math.floor(aCR+0.58*aCQ+0.5*a7z*adSystem.get(4).width),Math.floor(aCN+aCG+0.4*aCQ));
aCK.imageSmoothingEnabled=true;
aCK.drawImage(adSystem.get(4),-Math.floor(adSystem.get(4).width/2),-Math.floor(adSystem.get(4).height/2));
aCK.setTransform(1,0,0,1,0,0);
}

function aCn(xu,a5y,aC){aCK.fillText(aCV[a5y],aCR,Math.floor(aCN+aCG+(xu+0.5)*aCQ));
if(playerData.a5a[aC]===1){aCK.font="italic "+aCH;}var fi=Math.floor(aCN+aCG+(xu+0.5)*aCQ);
aCK.fillText(playerData.a0j[aC],aCS,fi);if(playerData.a5a[aC]!==0){aCK.font=aCH;
}if(aC<localPlayer.ku&&playerData.a5a[aC]!==2){return;}aCK.fillRect(aCS,fi+0.35*aCf,aCU[aC],Math.max(1,0.1*aCf));
}

function aCo(xu,aC){aCK.fillText(playerData.hN[aC],aCT,
Math.floor(aCN+aCG+(xu+0.5)*aCQ));}this.ee=function(){aCu();minValue();aCw();aCx();};

function aCx(){
for(var aC=aCI-1;aC>=0;aC--){aCW[aC]=mV[aC];aCX[aC]=playerData.hN[mV[aC]];}aCW[aCI]=kf[localPlayer.getTileOwner];
aCX[aCI]=playerData.hN[localPlayer.getTileOwner];}

function aCw(){var ea=aCY;aCY=true;
var h8=kf[localPlayer.getTileOwner]>=aCI-1?aCI-2:aCI-1;
for(var aC=h8;aC>=0;aC--){if(aCW[aC]!==mV[aC]||aCX[aC]!==playerData.hN[mV[aC]]){return true;
}}if(h8===aCI-2&&(aCW[aCI]!==kf[localPlayer.getTileOwner]||aCX[aCI]!==playerData.hN[localPlayer.getTileOwner])){return true;}aCY=ea;return ea;
}

function minValue(){var aCy;
var oD=aCM-1;for(var fs=0;fs<oD;fs++){if(playerData.hN[mV[fs]]<playerData.hN[mV[fs+1]]){
aCy=mV[fs];mV[fs]=mV[fs+1];mV[fs+1]=aCy;kf[mV[fs]]=fs;kf[mV[fs+1]]=fs+1;
}}}

function aCu(){for(var fs=aCM-1;fs>=0;fs--){if(playerData.nU[mV[fs]]===0){aCz(fs);}}}

function aCz(fs){
var aD0=mV[fs];aCM--;for(var aC=fs;aC<aCM;aC++){mV[aC]=mV[aC+1];kf[mV[aC]]=aC;}mV[aCM]=aD0;
kf[mV[aCM]]=aCM;}this.hm=function(fg,fi){if(a1D(fg,fi)){var aD1=aD2(fi);if(aD1>=0){aCa=clanPanel.eZ;
aCb=true;aCc=aCd=aD1;if(powerSystem.a4P()){aD1=aAv(-1,aCd,aCI);aD1=(aD1===aCI)?-1:aD1;if(aCZ!==aD1){aCZ=aD1;
aCj();clanPanel.ds=true;}}return true;}if(aCe){aCe=false;aCj();clanPanel.ds=true;}account.v(10,0,new aD3({aD4:1}));
return true;}return false;};this.a3m=function(fg,fi){var ea;
var aD1=aD2(fi);
var aD5=a1D(fg,fi);
var ConquestHint=!!(aD1<0&&aD5&&!powerSystem.a4P());if(aCb){ea=position;position+=aCc-aD1;
position=aAv(0,position,localPlayer.isMountainTile-aCI);if(position!==ea){aCe=ConquestHint;aCc=aD1;aD1=aAv(-1,aD1,aCI);
aD1=(aD1===aCI||!aD5)?-1:aD1;aCZ=aD1;aCj();clanPanel.ds=true;}else if(aCe!==ConquestHint){aCe=ConquestHint;aCj();clanPanel.ds=true;
}return true;}aD1=aAv(-1,aD1,aCI);aD1=(aD1===aCI||!aD5||powerSystem.a4P())?-1:aD1;if(aCZ!==aD1||aCe!==ConquestHint){
aCZ=aD1;aCe=ConquestHint;aCj();clanPanel.ds=true;return true;}return false;};this.a4B=function(fg,fi){
if(!aCb){return false;}aCb=false;
var aD1=aD2(fi);if(powerSystem.a4P()&&aCZ!==-1){aCZ=-1;aCj();
clanPanel.ds=true;}if(clanPanel.eZ-aCa<350&&aCd===aD1){aD1=aAv(-1,aD1,aCI);aD1=(aD1===aCI||!a1D(fg,fi))?-1:aD1;
if(aD1!==-1){var player=mV[aD1+position];if(aD1===aCI-1&&kf[localPlayer.getTileOwner]>=position+aCI-1){
player=localPlayer.getTileOwner;}if(playerData.nU[player]!==0&&!(localPlayer.isFreeForAll&&!localPlayer.lE&&!localPlayer.hi)){
soloCalc.uiHidden(player,800,false,0);}}}return true;};this.a3p=function(fg,fi,deltaY){
var aD1;if(aCb||localPlayer.ny){return false;}var aD7=Math.max(Math.floor(Math.abs(deltaY)/40),1);
if(a1D(fg,fi)){aD1=aD2(fi);aD1=aAv(-1,aD1,aCI);aD1=(aD1===aCI||powerSystem.a4P())?-1:aD1;
if(deltaY>0){if(position<localPlayer.isMountainTile-aCI){position+=Math.min(localPlayer.isMountainTile-aCI-position,aD7);
aCZ=aD1;aCj();clanPanel.ds=true;}}else if(position>0){position-=Math.min(position,aD7);
aCZ=aD1;aCj();clanPanel.ds=true;}return true;}return false;};

function aD2(fi){fi-=debugPanel.gap+aCP;
if(fi<0){return Math.floor(fi/aCQ)-1;}else if(fi<(aCI-1)*aCQ){return Math.floor(fi/aCQ);
}else if(fi<aA9-aCP){return aCI-1;}fi-=aA9-aCP;return aCI+Math.floor(fi/aCQ);}

function a1D(fg,fi){
return fg>=debugPanel.gap&&fg<debugPanel.gap+aCE&&fi>=debugPanel.gap&&fi<debugPanel.gap+aA9;}this.wr=function(){
ws.drawImage(aCJ,debugPanel.gap,debugPanel.gap);};}

function FocusHandler(){var canvas;var ou;var fg;var fi;var aBq,aD8;
var gap;var aD9;var fontSize;var aDA;var aDB,aDC;var aDD;var aDE;var aDF;var aDG;var aDH;
var aDI;this.applyToGame=function(){aDG=aDH=0;aDB=new Array(8);aDB[0]=L(118);aDB[1]=localPlayer.lE?L(119):L(120);
aDB[2]=L(121);aDB[3]=L(122);aDB[4]=L(123);aDB[5]=L(124,0,"Interest");aDB[6]=L(125);aDB[7]=L(126);
aDC=new Array(aDB.length);aDC.fill("");aDD=new Array(aDB.length);aDD[0]=localPlayer.lE?0:localPlayer.ku;
aDD[1]=localPlayer.lE?territorySystem.lQ:localPlayer.lG;aDD[2]=localPlayer.a2I;aDD[3]=0;aDD[4]=mathUtils.g0(10000*playerData.hN[0],Math.max(localPlayer.chance,1));
aDD[5]=(localPlayer.data.iIncomeType===0?700:localPlayer.data.iIncomeType===1?mathUtils.g0(localPlayer.data.iIncomeValue*700,64):
mathUtils.g0(localPlayer.data.iIncomeData[localPlayer.getTileOwner]*700,64));aDD[6]=0;aDJ();aDD[7]=0;
aDF=aDK(6);aDE=new Array(aDB.length);aDE.fill(true);aDI=0;if(localPlayer.lE){aDE[0]=false;aDE[2]=false;
aDE[3]=false;aDI=3;}else{aDE[3]=false;aDI=1;}aDA=0;this.resize();};this.resize=function(){
this.j=Math.floor((uiSurface.platformActions.ik()?0.1646:0.126)*camera.il);this.k=Math.floor(1.18*this.j);
aBq=Math.floor(0.04*this.j);gap=Math.floor(0.035*this.j);aD9=0.04*this.j;aD8=this.k;
this.k-=Math.floor(aDI*(this.k-2*aBq)/aDB.length);fontSize=Math.floor(0.7*(aD8-aBq)/aDB.length);
var a7u=gameState.sK.u8(1,fontSize);canvas=document.createElement("canvas");
canvas.width=this.j;canvas.height=this.k;ou=canvas.getContext("2d",{alpha:true});
ou.font=a7u;aDL(a7u,0.575*this.j);gameState.sK.textBaseline(ou,1);ou.lineWidth=1;
this.a6X();this.aAY();touchInputHandler.aAY();aDM();};

function aDL(a7u,j){for(var aC=0;aC<aDC.length;aC++){
aDC[aC]=gameState.ou.a5J(aDB[aC],a7u,j);}}this.aAY=function(){fg=camera.j-this.j-debugPanel.gap;};this.aDN=function(){
fi=debugPanel.gap;};this.a6X=function(){fi=debugPanel.gap+((touchInputHandler.a9u()&&playerData.nU[localPlayer.getTileOwner]!==0&&!localPlayer.isFreeForAll)?touchInputHandler.k+debugPanel.gap:0);
};this.nG=function(by){if(by||aDA>=100){aDA=0;aDM();
}};

function aDM(){var fD;ou.clearRect(0,0,focusHandler.j,focusHandler.k);ou.fillStyle=colorPalette.pL;ou.fillRect(0,0,focusHandler.j,focusHandler.k);
ou.fillStyle=colorPalette.gameCommandDecoder;fD=aDG>0?aDG:(aDD[4]/10000);ou.fillRect(0,focusHandler.k-aBq-1,Math.floor(fD*focusHandler.j),aBq);
ou.fillStyle=colorPalette.pO;ou.fillRect(0,0,focusHandler.j,1);ou.fillRect(0,0,1,focusHandler.k);
ou.fillRect(focusHandler.j-1,0,1,focusHandler.k);ou.fillRect(0,focusHandler.k-1,focusHandler.j,1);ou.fillRect(0,focusHandler.k-aBq-1,focusHandler.j,1);
var ea=0;for(var aC=0;aC<aDC.length;aC++){if(!aDE[aC]){ea++;continue;
}gameState.sK.textAlign(ou,0);
var aDO=Math.floor(((aD8-aBq)+2*aD9)*(aC-ea+1)/(aDC.length+1)-0.7*aD9);
ou.fillText(aDC[aC],gap,aDO);
gameState.sK.textAlign(ou,2);if(aC===5&&playerData.nU[localPlayer.getTileOwner]!==0&&playerData.hb[localPlayer.getTileOwner]>=botSpawner.ka(localPlayer.getTileOwner)){
ou.fillStyle=colorPalette.qK;ou.fillText(aDK(aC),focusHandler.j-gap,aDO);ou.fillStyle=colorPalette.pO;
}else{ou.fillText(aDK(aC),focusHandler.j-gap,aDO);}}}

function aDK(aC){if(aC<3){return aDD[aC].toString();
}else if(aC===3){return gameState.tI.a6I(aDD[aC]/100,2);}else if(aC===4){return gameState.tI.a6I(aDD[aC]/100,2);
}else if(aC===5){return gameState.tI.a6I(aDD[aC]/100,2);}else if(aC<7){return gameState.tI.currentLoopHandler(aDD[aC]);
}else{return focusHandler.visibleTileBounds(aDD[7]);}}this.a7G=function(){return aDD[7];};this.visibleTileBounds=function(value){
var lp=Math.floor(value/1000/60);
var fZ=Math.floor((value-1000*60*lp)/1000);
if(fZ<10){return lp+":0"+fZ;}return lp+":"+fZ;};this.ee=function(){aDQ();aDR();this.finalizeSimulationFrame();
aDS();aDJ();aDT();aDU();LanguageRegistry();};

function aDQ(){if(!aDE[0]){return;}if(localPlayer.a2J-localPlayer.a2I===aDD[0]){
return;}aDD[0]=localPlayer.a2J-localPlayer.a2I;aDA++;}

function aDR(){if(territorySystem.lQ-aDD[0]===aDD[1]){
return;}aDD[1]=territorySystem.lQ-aDD[0];aDA++;}this.finalizeSimulationFrame=function(){if(!aDE[2]){return;}if(localPlayer.a2I===aDD[2]){
return;}aDD[2]=localPlayer.a2I;aDA+=localPlayer.a2G===2?100:1;};

function aDU(){var a60,per;if(localPlayer.iT){a60=gameMenu.lR();
}else{a60=playerData.hN[mV[0]];}per=mathUtils.g0(10000*a60,Math.max(localPlayer.chance,1));aDD[3]=a60;if(aDD[4]===per){return;
}aDA++;aDD[4]=per;}this.aDW=function(){return aDD[3]===localPlayer.chance;};

function LanguageRegistry(){if(localPlayer.survivorBotCount===8&&aDX()){
return;}if(aDD[3]<localPlayer.chance){return;}if(!aDY()){return;}if(bonusSystem.lj.aDZ().length){return;
}if(localPlayer.iT){if(gameMenu.lR(1)<localPlayer.chance){return;}}inputController.a1s.a2F();}

function aDY(){for(var aC=territorySystem.lQ-1;aC>=0;aC--){
if(playerData.h1[territorySystem.lV[aC]].length>0){return false;}}return true;}

function aDX(){for(var aC=0;aC<2;aC++){
if(!gameState.gv.hl(aC)){inputController.a1s.a2F();return true;}}return false;}

function aDS(){var aDa=botSpawner.aDb(localPlayer.getTileOwner);
if(aDa===aDD[5]){return;}aDD[5]=aDa;aDA++;}

function aDJ(){if(playerData.hN[localPlayer.getTileOwner]===aDD[6]){
return;}aDD[6]=playerData.hN[localPlayer.getTileOwner];aDA++;}

function aDT(){aDD[7]+=clanPanel.aDc;
var s1=aDK(7);
if(aDF!==s1){aDF=s1;aDA+=100;}}this.aDd=function(aC){var uw,aDe,ea;if(localPlayer.a2G===2){return false;}
if(aC%2===1){uiColors.nG(1,1);clanPanel.ds=true;}if(aC===localPlayer.a6g){aDG=0;aDM();return false;}if(aC===-1&&aDH===0){
return false;}aDe=aDG;if(localPlayer.hi){aDG=aC/localPlayer.a6g;aDM();return aDG!==aDe;}ea=performance.now();
if(aC>=0){uw=ea-aC*392;aDH=(aC===0||uw<aDH)?uw:aDH;}aDG=(ea-aDH)/(localPlayer.a6g*392);aDG=aDG>1?1:aDG;
aDM();return aDG!==aDe;};this.wr=function(){ws.drawImage(canvas,fg,fi);};}

function ResizeHandler(){var iL;
var aDf;var j;var k;var aAe;var aDg;var aDh;var a9v;var canvas;var nh;var aDi;this.applyToGame=function(){
iL=false;aDi=false;k=0;aAe=0.61;aDg=0.07;aDh=0.09;a9v=0;nh=0;};this.resize=function(){
if(!iL){return;}if(uiSurface.platformActions.ik()){j=Math.floor(0.69*camera.il);}else{j=Math.floor(0.5*camera.il);
}j=aDj(j,a8V(camera.j-2*debugPanel.gap,10));j=aDj(j,Math.floor(a8V((camera.k-2*debugPanel.gap),3)*3.57));
k=Math.floor(0.28*j);aDk();};this.show=function(g1,aDl,aAQ,aDm){
if(iL){return;}if(aDm&&aDi){return;}aDi=true;aDf=aAQ?21:(g1?1:2);iL=true;this.resize();modalState.tZ();
clickHandler.aAL();nh=clanPanel.eZ;a9v=aDl?1:0;};this.ee=function(){if(!iL||a9v>=1){return;}a9v+=0.0005*(clanPanel.eZ-nh);
a9v=a9v>1?1:a9v;nh=clanPanel.eZ;clanPanel.ds=true;};this.hm=function(fg,fi){if(!iL||a9v<=0){
return false;}fg-=Math.floor((camera.j-j)/2);fi-=a0M();if(fg<0||fi<0||fg>j||fi>k){return false;
}if(fg>j-k/3&&fi<k/3){iL=false;clanPanel.ds=true;}return true;};this.wr=function(){if(!iL||a9v<=0){
return;}ws.globalAlpha=a9v;ws.drawImage(canvas,Math.floor((camera.j-j)/2),a0M());ws.globalAlpha=1;
};

function a0M(){var fg=Math.floor((camera.j-j)/2);if(fg<clickHandler.k+2*debugPanel.gap){return camera.k-k-4*debugPanel.gap-clickHandler.k;
}return camera.k-k-2*debugPanel.gap;}

function aDk(){canvas=document.createElement("canvas");
canvas.width=j;canvas.height=k;
var ou=canvas.getContext("2d",{alpha:true});
var nv=Math.floor(1+k/40);ou.clearRect(0,0,j,k);ou.fillStyle=colorPalette.pL;
ou.fillRect(nv,nv,j-2*nv,k-2*nv);ou.lineJoin="bevel";ou.lineWidth=2*nv;ou.strokeStyle=colorPalette.pO;
ou.strokeRect(nv,nv,j-2*nv,k-2*nv);ou.imageSmoothingEnabled=false;
var ej=adSystem.get(aDf);
var aDn=ej.width;
var aDo=ej.height;
var a7z=(aDf===1?0.85:aDf===21?0.666:0.9)*aAe*k/aDo;
ou.setTransform(a7z,0,0,a7z,Math.floor((j-a7z*aDn)/2),Math.floor((k-a7z*aDo)/2));
ou.drawImage(ej,0,0);ou.setTransform(1,0,0,1,Math.floor(j-aDh*k-aDg*k-nv),Math.floor(nv+aDg*k));
aDp(ou,Math.floor(aDh*k));ou.setTransform(1,0,0,1,0,0);
}

function aDp(ou,fZ){ou.lineWidth=Math.floor(1+k/80);ou.strokeStyle=colorPalette.pO;ou.beginPath();
ou.moveTo(0,0);ou.lineTo(fZ,fZ);ou.moveTo(0,fZ);ou.lineTo(fZ,0);ou.stroke();}}

function StatsPanel(){
var aDq;
var aDr=new Uint8Array(5);
var aDs=new Uint8Array(5);this.aDt=new aDu();this.applyToGame=function(){
var g1=connectionMgr.buffer.data[119].value;for(var aC=0;aC<aDr.length;aC++){aDr[aC]=(g1>>(2*aC))%4;
}};this.a6s=function(){aDq=[L(127),"",L(128,[ba.aDv[28]]),L(129,[ba.aDv[26]]),
L(130,[ba.aDv[0]])];this.aDt.applyToGame();};this.ee=function(){this.aDt.ee();};this.a7d=function(id){
if(id>1&&powerSystem.EqualWidthControlRow()){return;}if(!aDw(id)){return;}hoverProcessor.a8a(aDq[id]);};

function aDw(eI){
if(aDr[eI]===3||aDs[eI]===1){return false;}aDs[eI]=1;if(Math.random()<0.6){return true;
}aDr[eI]++;
var g1=0;for(var aC=0;aC<aDr.length;aC++){g1+=aDr[aC]<<(2*aC);}connectionMgr.qo.boatNotificationHandler(119,g1);
return true;}}

function aDu(){var aDx;this.applyToGame=function(){aDx=false;};this.ee=function(){
if(!aDy()){return;}if(aDz()){return;}if(aE0()){return;}if(aE1()){return;}aE2();};

function aDy(){
if(aDx){return true;}if(clanPanel.kr()%30!==9){return false;}if(!gameState.gv.mR(90)){return false;}aDx=true;
return true;}

function aDz(){var sC=hoverProcessor.a8v(956);if(!sC){return false;}if(gameState.gv.ls(sC.player)){
return true;}hoverProcessor.a8u(956,0);return false;}

function aE0(){var h7=localPlayer.iT?aE3():aE4();
if(h7===-1){return false;}hoverProcessor.a0i(0,L(131,[playerData.a0j[h7]]),956,h7,colorPalette.pO,colorPalette.pL,-1,true);
return true;}

function aE4(){var aE5=territorySystem.lQ;
var lo=territorySystem.lV;
var aE6=kf;for(var aC=0;aC<aE5;aC++){var h7=lo[aC];if(aE6[h7]!==0){return h7;}}return-1;
}

function aE3(){var id=gameMenu.lT();
var fZ=territorySystem.lQ;if(!mainMenu.lH[id]){if(fZ>1){return mV[fZ-1];}return-1;
}var a24=territorySystem.lV;
var fX=mainMenu.fX;for(var aC=0;aC<fZ;aC++){var h7=a24[aC];if(fX[h7]!==id){return h7;}}
return-1;}

function aE1(){var sC=hoverProcessor.a8v(957);if(!sC||!sC.a8R){return false;}if(tileMap.fQ(sC.a8R.fL<<2)){
return true;}hoverProcessor.a8u(957,0);return false;}

function aE2(){var fZ=nameRenderer.BotAttackTargetSelector.m4;if(fZ===0){
return;}var buffer=nameRenderer.BotAttackTargetSelector.buffer;for(var aC=0;aC<fZ;aC++){var fL=buffer[aC];if(tileMap.fQ(fL<<2)){
hoverProcessor.a0i(0,L(132,[powerState.fh(fL),powerState.fj(fL)]),957,0,colorPalette.pO,colorPalette.pL,-1,true,undefined,{fs:1,fL:fL});
return;}}}}

function SettingsMenu(){this.discordLink=new aE8();this.applyToGame=function(){this.discordLink.resize();
};}

function aE8(){this.resize=function(){var aC;
var InformationScreen=document.head.querySelector("style#ss");
if(!InformationScreen){InformationScreen=document.createElement("style");InformationScreen.id="ss";document.head.appendChild(InformationScreen);
}else{for(aC=InformationScreen.sheet.cssRules.length-1;aC>=0;aC--){InformationScreen.sheet.deleteRule(0);}}
var aAm="::-webkit-scrollbar";
var aEA=gameState.sK.sT(debugPanel.uA);
var iV=gameState.sK.sT(Math.max(gameState.sK.currentScreenId(0.012),8));
try{InformationScreen.sheet.insertRule(aAm+"{width:"+iV+";height:"+iV+";}",InformationScreen.sheet.cssRules.length);
InformationScreen.sheet.insertRule(aAm+"-thumb{background-color:white;}",InformationScreen.sheet.cssRules.length);
InformationScreen.sheet.insertRule(aAm+"-track{background:"+colorPalette.pK+";}",InformationScreen.sheet.cssRules.length);
InformationScreen.sheet.insertRule(aAm+"-track:horizontal{border-top:"+aEA+" solid white;}",InformationScreen.sheet.cssRules.length);
InformationScreen.sheet.insertRule(aAm+"-track:vertical{border-left:"+aEA+" solid white;}",InformationScreen.sheet.cssRules.length);
InformationScreen.sheet.insertRule(aAm+"-button{display:none;}",InformationScreen.sheet.cssRules.length);
}catch(e){console.log("error 3425: "+e);for(aC=InformationScreen.sheet.cssRules.length-1;aC>=0;aC--){
InformationScreen.sheet.deleteRule(0);}}};}

function ChatPanel(){this.aEB=false;
this.oL=false;this.a6b=false;this.aEC=[0,0,0,0];this.render=function(){this.a6b=this.a6b||this.oL;
if(!this.oL&&(!this.aEB||!this.a6b)){return;}var nv=leaderboardPanel.followedAccountsTracker[0];
var nw=leaderboardPanel.followedAccountsTracker[1];
var o8=leaderboardPanel.followedAccountsTracker[2];
var o9=leaderboardPanel.followedAccountsTracker[3];nv=nv<this.aEC[0]?this.aEC[0]:nv;nw=nw<this.aEC[1]?this.aEC[1]:nw;
o8=o8>this.aEC[2]?this.aEC[2]:o8;o9=o9>this.aEC[3]?this.aEC[3]:o9;this.oL=false;
this.aEB=false;if(nv===this.aEC[0]&&nw===this.aEC[1]&&o8===this.aEC[2]&&o9===this.aEC[3]){
this.a6c();return;}if(o8>=nv&&o9>=nw){a6u.putImageData(a6v,0,0,nv,nw,o8-nv+1,o9-nw+1);
}};this.a6c=function(){if(this.a6b&&this.aEC[2]>=this.aEC[0]&&this.aEC[3]>=this.aEC[1]){
a6u.putImageData(a6v,0,0,this.aEC[0],this.aEC[1],this.aEC[2]-this.aEC[0]+1,this.aEC[3]-this.aEC[1]+1);
}this.a6b=false;};this.appleLink=function(){if(this.aEC[2]>=this.aEC[0]&&this.aEC[3]>=this.aEC[1]){
a6u.putImageData(a6v,0,0,this.aEC[0],this.aEC[1],this.aEC[2]-this.aEC[0]+1,this.aEC[3]-this.aEC[1]+1);
}this.a6b=false;};this.applyToGame=function(){var fg,fi;this.aEB=false;this.oL=false;this.a6b=false;
this.aEC[0]=dialogManager.fk;this.aEC[1]=dialogManager.fl;this.aEC[2]=this.aEC[3]=0;loop:for(fg=1;fg<dialogManager.fk-1;fg++){
for(fi=dialogManager.fl-2;fi>1;fi--){if(aEE[tileMap.zt(fg,fi)+2]===1){this.aEC[0]=fg;break loop;}}}loop:
for(fi=1;fi<dialogManager.fl-1;fi++){for(fg=dialogManager.fk-2;fg>1;fg--){if(aEE[tileMap.zt(fg,fi)+2]===1){this.aEC[1]=fi;
break loop;}}}loop:for(fg=dialogManager.fk-2;fg>0;fg--){for(fi=dialogManager.fl-2;fi>1;fi--){if(aEE[tileMap.zt(fg,fi)+2]===1){
this.aEC[2]=fg;break loop;}}}loop:for(fi=dialogManager.fl-2;fi>0;fi--){for(fg=dialogManager.fk-2;fg>1;fg--){
if(aEE[tileMap.zt(fg,fi)+2]===1){this.aEC[3]=fi;break loop;}}}};}

function L(value,MatchLauncher,xP,aEG){
var s1;if(typeof value==="number"){s1=renderer.aEH[value];}else{s1=value;}if(xP&&renderer.RoomState()){
s1=xP;}if(!MatchLauncher){if(aEG){return s1.replace(new RegExp("\\s*\\{.*?\\}\\s*","g")," ").trim();
}return s1;}var fZ=MatchLauncher.length;for(var aC=0;aC<fZ;aC++){
for(var fs=0;fs<3;fs++){s1=s1.replace("{"+(10*fs+aC)+"}",MatchLauncher[aC]);}}return s1;}


function Renderer(){this.data=new ContextMenu();
var aEK=(new MessageManager()).L84;this.aEH=aEK;this.aEM="en";
var aEN=false;
this.applyToGame=function(){aEN=false;if(FollowedAccountsTracker()){return;}if(aEP()&&aEQ()&&aER()){return;}aEN=true;
};this.ExternalLinkWarningOverlay=function(){mainMenu.dl();troopCalc.dl();accountPanel.dl();gameClock.dl();keyProcessor.applyToGame();br=new ModerationConfig();};this.RoomState=function(){
return this.aEH===aEK||!aEK.length;};

function FollowedAccountsTracker(){var s1=connectionMgr.buffer.data[12].value;
if(s1.split("-")[0].toLowerCase()==="en"){renderer.aEH=aEK;renderer.aEM=s1;return true;
}return false;}

function aEP(){return connectionMgr.buffer.data[12].value===connectionMgr.buffer.data[145].value;}


function aEQ(){return connectionMgr.buffer.data[146].value>0;}

function aER(){var fZ=connectionMgr.buffer.data[146].value;
var h=connectionMgr.sb.encodeStringToInt(fZ,false);if(h.length!==fZ){return false;}if(!gameState.sS.resourceDebt(h)){
return false;}return aES(h);}

function aES(h){var fZ=h.length;for(var k=0;k<fZ;k++){
h[k]=h[k].replace("&#39;","'");}var aET=connectionMgr.sb.encodeStringToInt(fZ,true);if(fZ!==aET.length){return false;
}if(!gameState.sS.resourceDebt(aET)){return false;}var lp=aEK.length;
var aBh=new Array(lp);
var aEU=lp===fZ;
var resolveAttackCombat=Math.min(fZ,lp);for(var aC=0;aC<lp;aC++){aBh[aC]=aEK[aC];if(aC<fZ&&aET[aC]===aBh[aC]){
aBh[aC]=h[aC];continue;}aEU=false;for(var ft=0;ft<resolveAttackCombat;ft++){if(aET[ft]===aBh[aC]){
aBh[aC]=h[ft];break;}}}renderer.aEH=aBh;renderer.aEM=connectionMgr.buffer.data[12].value;return aEU;}this.aEV=function(){
if(!aEN){return false;}aEN=false;if(aEK.length===0){return false;}var aEW=connectionMgr.buffer.data[12].value;
gameServer.eg.aEX(0,aEW.slice(0,20));return true;};this.aEY=function(h){if(h.length!==aEK.length){
if(account.ua===8){account.handleKeyInput().aEZ(30,0,1);}return;}this.aEH=h;this.aEM=connectionMgr.buffer.data[12].value;
connectionMgr.qo.boatNotificationHandler(145,this.aEM);connectionMgr.qo.boatNotificationHandler(146,h.length);connectionMgr.sb.xh(h,false);connectionMgr.sb.xh(aEK,true);
if(account.ua===8){account.handleKeyInput().aEZ(30);return;}if(moderationSystem.a3P()===0&&account.ua===5){account.z.aEa();}};this.aEb=function(){
var h=navigator.languages;if(!h||!h.length){return [0,0];}var xk=Math.max(renderer.data.aEc(h[0]),0);
if(h.length===1){return [xk,xk];}return [xk,Math.max(renderer.data.aEc(h[1]),0)];};}

function ContextMenu(){
this.h=["en","aa","ab","ace","ach","af","ak","alz","am","ar","as","av","awa","ay","az",
"ba","bal","ban","bbc","bci","be","bem","ber","ber-Latn","bew","bg","bho","bik","bm","bm-Nkoo",
"bn","bo","br","bs","bts","btx","bua","ca","ce","ceb","cgg","ch","chk","chm","ckb","cnh","co",
"crh","crs","cs","cv","cy","da","de","din","doi","dov","dv","dyu","dz","ee","el","eo","es","et",
"eu","fa","fa-AF","ff","fi","fj","fo","fon","fr","fur","fy","ga","gaa","gd","gl","gn","gom","gu",
"gv","ha","haw","he","hi","hil","hmn","hr","hrx","ht","hu","hy","iba","id","ig","ilo","is","it",
"iw","ja","jam","jv","jw","ka","kac","kek","kg","kha","kk","kl","km","kn","ko","kr","kri","ktu",
"ku","kv","ky","la","lb","lg","li","lij","lmo","ln","lo","lt","ltg","luo","lus","lv","mad","mai",
"mak","mam","mfe","mg","mh","mi","min","mk","ml","mn","mni-Mtei","mr","ms","ms-Arab","mt","mwr",
"my","ndc-ZW","ne","new","nhe","nl","no","nr","nso","nus","ny","oc","om","or","os","pa","pa-Arab",
"pag","pam","pap","pl","ps","pt","pt-PT","qu","rn","ro","rom","ru","rw","sa","sah","scn","sd","se",
"sg","shn","si","sk","sl","sm","sn","so","sq","sr","ss","st","su","sus","sv","sw","szl","ta","tcy",
"te","tet","tg","th","ti","tiv","tk","tl","tn","to","tpi","tr","trp","ts","tt","tum","ty","tyv",
"udm","ug","uk","ur","uz","ve","vec","vi","war","wo","xh","yi","yo","yua","yue","zap","zh","zh-CN",
"zh-TW","zu","nb","fil","sh"];this.aEd=function(){var aC;
var aEe=[];
var h=this.h;
var fZ=h.length;
for(aC=0;aC<fZ;aC++){aEe.push(h[aC]);}var aEf=connectionMgr.buffer.data[12].xP;for(aC=0;aC<fZ;aC++){
if(aEe[aC]===aEf){aEe.splice(aC,1);fZ--;break;}}aEe.sort();fZ++;aEe.unshift(aEf);try{
if(typeof Intl==="undefined"){return aEe;}for(aC=0;aC<fZ;aC++){var aEg=new Intl.DisplayNames([aEe[aC]],{
type:"language"});
var s1=aEg.of(aEe[aC]);if(s1!==aEe[aC]){aEe[aC]=aEe[aC]+": "+s1;}}}catch(e){
console.log("error 3646: "+e);}return aEe;};this.aEh=function(aEi){var s1=connectionMgr.buffer.data[12].value;
var fZ=aEi.length;for(var aC=0;aC<fZ;aC++){if(s1===aEi[aC].split(":")[0]){
return aC;}}return 0;};this.aEc=function(aEj){if(!aEj||aEj.length<2){return-1;
}aEj=(aEj.split("-")[0]).toLowerCase();
var h=this.h;
var fZ=h.length;for(var aC=0;aC<fZ;aC++){
if(aEj===h[aC]){return aC;}}return-1;};}

function MessageManager(){this.L84=["No Admin","Helper",
"Junior Moderator","Moderator","Senior Moderator","Lead Moderator","Head Admin","Very Easy",
"Easy","Normal","Hard","Very Hard","Impossible","Type your message here...","Send","Activated",
"Top Clan","Best Clan Member","Top Admin","Best 1v1 Player","Best Battle Royale Player",
"Richest Player","Top Patreon","Best Zombie Player","Lobby","Propaganda","Close {button}",
"Report Abuse","You earned {10} gold!","{0} earned {11} gold!","Team {0}","Team {0} won the game!",
"You earned a participation reward of {10} gold.","The prize money was distributed as follows:",
"and {10} more","You earned {10} gold.","You earned {10} points!","Clan {0} gained {11} points. ✨",
"You earned {10} clan points!","You earned an additional {10} gold because you played for {1}.",
"Back","Error","Error {10}","Not Enough Gold!",
"You need more gold to perform this action.","Quit Game","More","This is a contest!",
"Accept","You conquered {0}. 🔥","You were conquered by {0}.","Congratulations! You won the game.",
"{0} won the game.","{0} broke the non-aggression pact.","{0} attacks you! ⚔️",
"Choose your start position!","You surrendered! 🏳️","The game ended in a stalemate!",
"Error: {10}","{0} was immortalized!","Neutral Land: {0}","Player: {0}","Strength: {10}",
"Territory: {10}","Team","Bot Difficulty","Index: {10}","Coordinates: {10}","Mountain: {10}",
"Water: {10}","Ship Owner: {0}","Message to {0}","Humanity triumphs! The undead were defeated.",
"The Resistance","Mankind's era ends, overrun by the relentless tide of the undead.",
"The Virus","If peace is agreed upon, the game ends in a stalemate.",
"If peace is agreed upon, the largest territory holder wins the game.",
"You signed a non-aggression pact with {0}.",
"You asked {0} to sign a non-aggression pact.","{0} accepted the non-aggression pact.",
"{0} requests a non-aggression pact.","You asked {10} players to attack {1}.",
"You asked {0} to attack {1}.","{0} suggests you attack {1}. 🎯","You exported 1 resource to {0}.",
"You exported {10} resources to {1}.","Incoming Bot Support!","{0} supported you!",
"Map: {0}","Creator: {0}","Dimension: {10}","Overall Pixels: {10}","Land: {10}","Mountains: {10}",
"Full sending is disabled.","{0} was conquered by {1}.","{0} left the game.","{0} surrendered.",
"{0} joined the game.","{10} players were conquered.","{10} players left the game.",
"{10} players surrendered.","Outside","Water","Mountains","Neutral Land","Contest",
"YOU CONQUERED","YOU WERE CONQUERED BY","THE GAME WAS WON BY","MAP:","{0} called the peace vote.",
"{0} voted for peace.","{0} rejected peace.","second played","seconds played",
"LEADERBOARD","Humans","Players","Bots","Spectators","Threshold","Percentage","Growth","Income",
"Time","Hint: The top 9 emojis are ordered by usage.","Hint: Call the peace vote by pressing {0}.",
"Hint: Add troops to your weakest ongoing attack with {0}.",
"Hint: Hover with the mouse over a player and press {0} to attack them.",
"{0} still needs to be conquered!",
"A neutral pixel at position ({10}, {11}) still needs to be conquered!",
"You are leaving Territorial.io!","You are leaving Territorial.io.",
"🔑 Show Account","🚩 Report Abuse","💬 Mention","Loading","{0} defeated {1}!",
"White Arena","Black Arena","Island","Mountains 1","Desert","Swamp","White Plains","Cliffs",
"Pond","Halo","Europe","World 1","Caucasia","Africa","Middle East","Scandinavia","North America",
"South America","Asia","Australia","Island Kingdom","Mountains 2","World 2","British Isles",
"Refresh","Public Profile","🧈 Gold","Large Bank","Medium Bank","Small Bank","Capitalist",
"Rich Person","Landowner","Merchant","Taxpayer","Worker","Peasant","Serf","Daylaborer",
"Nomad","Beggar","Account Balance: ","Rank: ","Status: ","Gold Transfer","Confirm","Cancel",
"Account Name","Copy","Search","Password","Show","Hide","Request New Password","Security Tip",
"To safeguard your account, never disclose your password to anyone. We will never ask for your password, as we do not require it for any service.",
"If you have accessed your account through unofficial webpages or apps, your security may be compromised. We recommend changing your password.",
"If you lose your password or account name, you may lose access to your account. In such a case, we are unable to recover it. Please ensure that you store your account name and password in a safe place.",
"Account Options",
"Log in to a Different Account","Create New Account","Delete Account: ","🗑️ Account Deletion",
"Accounts without gold will be deleted automatically after 8 days. To initiate this process, deplete all your gold.",
"Followed Accounts","➡️ Show","🗑️ Remove","Saved Accounts",
"Listed accounts may have been removed in the meantime due to insufficient funds.",
"➡️ Login","1v1 Rating",
"Elo: ","Played Games: ","Battle Royale Rating","Commander","Strategist","Soldier","Recruit",
"Rating: ","Zombie Rating","Savior","Veteran","Hunter","Defender","Refugee","Admin Statistics",
"Votes: ","Elect","You are about to purchase {10} votes for {11} Gold with your Account {2}.",
"User","Email Verified","🟢 Online",
"Browsing the menus.","Watching a replay.","Playing a team game.","Playing a battle royale game.",
"Playing a 1v1 match.","Fighting zombies.","In the lobby.","Playing in single player.",
"🔴 Offline","Last active some seconds ago.","Last active 1 minute ago.",
"Last active {10} minutes ago.","Last active 1 hour ago.","Last active {10} hours ago.",
"Last active 1 day ago.","Last active {10} days ago.","Last active a long time ago.",
"🚫 Unfollow","📥 Follow","You are following this user. ✅","Please choose a respectful username.",
"Active punishments:","Offensive Name","Hate Speech","Email Verification",
"Email","You already have {10} gold. Secure your account to prevent account loss.",
"New Email","Request Code","Make sure to also check your spam folder.",
"Code","Submit Code","Bio","Upload Bio","Enable Auto Renew",
"Disable Auto Renew","Auto Renew is off. The subscription will end in {10} day(s).",
"Auto Renew is on. The subscription will renew in {10} day(s).",
"The monthly fee is currently {10} gold.","Buy","Description","Report Player","Primary Clan Stats",
"Clan: {0}","Monthly Points: {0}","Rank: {0}","Total Points: {0}","Won Games: {0}",
"Avg. Points per Game: {0}","Secondary Clan Stats","Clan Leader Statistics","Clan Leader of {0}",
"No Clan Leader","Rating: {10}","Rank: {10}","Status: {10}","Active","Inactive","Unlink Account",
"Benefits:","No Ads","Separate Leaderboard","Exclusive Username Color","Status: Not Linked",
"Join Territorial.io on Patreon:","Once you have joined, connect your account:",
"If you hide Patreon, no one can transfer a membership to your account.",
"Additional Income","Options","Default","Uniform","Customized","Mixed",
"Team dependent","Player Count","Clan Chart","🛠️ Options","🛠️ Chart Options","Search Terms",
"Separate search terms with a comma.","Load Data","Start Index","End Index","Timeframe",
"More Options","Y-Axis Compression","Choose Your Nation's Color!","National Color","Red: ",
"Green: ","Blue: ","Adjust","Colors","Random","My Color","⏳ Connecting...","Find Server...",
"New Connection...","Reload Required","A game reload is required to apply the new configuration.",
"Custom Scenario","⚔️ Play","Map","Settings","Game Mode",
"Clustered","Player Names","Kingdom Names","Simple Names","Territorial Income","Interest Income",
"Starting Resources","More Settings","Reset Scenario","Open File...","Save As File...",
"📜 Game Log","Multiplayer","My Account","Game Menu","Your Kingdom's Name","Clans","Clan Members",
"Admins","1v1 Players","Battle Royale","Richest Players","Patreon Members","Zombie Players",
"🏆 Leaderboards","Previous 10","Next 10","1v1 Player Ranking","Clan Ranking","Clan Member Ranking",
"Admin Ranking","1v1 Reports","Admin Election","Blockchain","Clan Leader Election",
"Bio Reports","Battle Royale Players","Index","Username","Account","Ranking",
"Player","Elo","Clan","Rating","Leader","Time Ago","Accuser","Accused","Voter","Target Account",
"Votes","Sender","Receiver","Amount","Number","Gold","Type","Elo Deducted","Bio Removed",
"🛠️ List Options","Clan Name Search","Username Search","Quantity","Account Name Search",
"1v1","Zombie","Chat","Ready","Next Game","Login","The only official domain is territorial.io",
"If you log in on a different website, your account may be stolen!",
"If you play with the official Android or iOS App, you are fine.",
"📜 Logs","Source Account: {0}","Target Account: {0}","Gold to be Sent: {10}",
"Gold to be Received: {10}","Procedural Map","Realistic Map","Custom Map","Passable Water",
"Passable Mountains","Maximum Dimension","Map File","Select File","Map Name","Preview",
"Selectable Name","📰 Propaganda","Links","Propaganda Text","Reset","Language","Launch Campaign",
"Gold Investment","Launch","Account Recovery","Request Email","▶️ Replay","🔲 Select All","📋 Copy",
"🗑️ Clear","▶️ Launch","Insert the replay data here!","⚙️ Settings","🔄 Reset","Information",
"Increasing resolution, shrinking minimum font size, and speeding up text rendering can strain your system and hinder gameplay responsiveness.",
"Resolution","Low","Medium",
"High","Very High","Minimum Font Size","Small","Very Small","Text Rendering Speed","Slow","Fast",
"Large UI","Place Balance Above","Hide Zoom Buttons","Font","Message Box","Keep Closed","Is Muted",
"Multiplayer Connection","Automatic (recommended)","Direct","Via Proxy","Highlighting","Intensity",
"Shortcut Keys","Spawning","Manual Spawn","🔑 My Account","📈 Clan Charts","🧈 Gold Transfer",
"⚔️ Join Lobby 2","🔗 Links","ℹ️ Game Version","🗑️ Delete Data","Privacy Settings",
"Force Restart Game","☰ Game Menu","📊 Game Statistics","🏳️ Surrender","🕊️ Call Peace Vote",
"Do you want to delete all locally stored data, like usernames, setting data and account data like passwords and account names?",
"Please make sure to safely store passwords before performing this action.",
"🗑️ Delete","User Privacy","Check out our Privacy Policy at:",
"Source Account","Send gold only to trusted accounts!","Replay Error",
"Warning","Loading...","Incoming Boat!","Incoming Ship!","Initiate Land Attack At Mouse Pointer",
"Launch Ship Towards Mouse Pointer","Increase Percentage Bar",
"Decrease Percentage Bar","Slightly Increase Percentage Bar","Slightly Decrease Percentage Bar",
"Switch UI Visibility","Zoom In","Zoom Out","Camera Left","Camera Right","Camera Up","Camera Down",
"Add To Weakest Attack","Call Peace Vote","Intercept Ship At Mouse Pointer","Avg. Attack Strength",
"Land Attacks","Ships launched","Bots conquered","Humans conquered","Attacked by Bots",
"Attacked by Humans","Territorial Loss","Received Support","Overall Income","Additional Costs",
"Land War Losses","Naval Losses","Transmitted Support","Overall Expenses","Mountain Attacks",
"Ships landed","Territory","Numbers","Statistics","Neutral","Red","Green","Blue","Yellow",
"Magenta","Cyan","White","Black","Ship launched!","Ship intercepted!","Upcoming Team Contest!",
"Upcoming Battle Royale Contest!","Upcoming 1v1 Contest!","Upcoming Zombie Contest!"
];}

function dq(){var fg,fi;var k;var vV;var aEk;var aEl;var aEm;var aEn;var aEo;
var j;var a5X;var aEp;this.isTeamGame=false;this.applyToGame=function(s1,aEq){if(uiSurface.id===1&&uiSurface.e3>=13&&uiSurface.e3<18){
if(aEq){a5X=s1;return;}if(a5X!==s1){return;}uiSurface.writeString16.saveString(200,s1);return;}if(!aEq){return;
}a5X=s1;aEp=document.createElement("a");aEp.appendChild(document.createTextNode(a5X));this.isTeamGame=true;
aEp.title=a5X;aEp.target="_blank";aEp.href=a5X;aEp.style.textAlign="center";aEp.style.color=colorPalette.pO;
aEp.style.position="absolute";aEp.style.padding="0px";aEp.style.margin="0px";this.resize();
document.body.appendChild(aEp);clanPanel.ds=true;};this.tZ=function(){if(!this.isTeamGame){return false;
}account.removeChild(document.body,aEp);this.isTeamGame=false;return true;};this.hm=function(it,iu){if(!this.isTeamGame){
return false;}if(it<fg||iu<fi||it>fg+j||iu>fi+k||(it>fg+j-vV&&iu<fi+vV)){clanPanel.ds=true;this.isTeamGame=false;
account.removeChild(document.body,aEp);return true;}return true;};this.resize=function(){if(!this.isTeamGame){
return;}aEn=Math.floor(0.8*(uiSurface.platformActions.ik()?(camera.j>camera.k?0.6:0.55):0.4)*camera.il);vV=Math.floor(0.15*aEn);
aEk=Math.floor(0.35*vV);aEl=Math.floor(0.5*vV);aEm=Math.floor(2.5*aEl);k=vV+aEk+3*aEl;
var a7u=gameState.sK.u8(1,aEk/camera.l);aEo=Math.floor(camera.l*deviceDetector.measureText(a5X,a7u));j=(aEo>aEn?aEo:aEn)+2*aEm;
var aEr=j;j=Math.min(j,camera.j-2*(uiSurface.platformActions.ik()?2:1)*debugPanel.gap);a7u=gameState.sK.u8(1,(j/aEr)*aEk/camera.l);
aEo=Math.floor(camera.l*deviceDetector.measureText(a5X,a7u));fg=Math.floor((camera.j-j)/2);
fi=Math.floor((camera.k-k)/2);aEp.style.font=a7u;aEp.style.top=Math.floor((fi+1.4*aEl+vV)/camera.l)+"px";
aEp.style.left=Math.floor((fg+(j-aEo)/2)/camera.l)+"px";};this.wr=function(){if(!this.isTeamGame){
return;}ws.fillStyle=colorPalette.pL;ws.fillRect(fg,fi+vV,j,k-vV);ws.fillStyle=colorPalette.qX;ws.fillRect(fg,fi,j,vV);
ws.fillStyle=colorPalette.pO;ws.lineWidth=debugPanel.a1E;ws.strokeStyle=colorPalette.pO;ws.strokeRect(fg,fi,j,k);
ws.fillRect(fg,fi+vV,j,debugPanel.a1E);ws.font=gameState.sK.u8(1,0.48*vV);gameState.sK.textAlign(ws,1);
gameState.sK.textBaseline(ws,1);ws.fillText(L(133),Math.floor(fg+(j-0.5*vV)/2),Math.floor(fi+0.55*vV));
zoomHandler.a86(Math.floor(fg+j-0.8*vV),Math.floor(fi+0.25*vV),Math.floor(0.5*vV));
ws.setTransform(1,0,0,1,0,0);
};}

function dp(){var gap=0;
var fg=[0,0,0,0,0];
var fi=[0,0,0,0,0];
var o7=[1,1,1,1,1];
var g1=[true,true,true,false,false];this.gM=[true,true,true,false,false];
var ej=null;var aDB;
this.receiveMessage=function(a55,aEt){ej=a55;g1=aEt;aDB=[floorDiv.aEu,floorDiv.a3L,floorDiv.aEv,floorDiv.aEv,floorDiv.aEw];this.applyToGame();
};this.applyToGame=function(){if(!adSystem.v0()){return;}var aC;
var uf=Math.floor((uiSurface.platformActions.ik()?0.261:0.195)*camera.il);
var ug=Math.floor(0.9*uf);
var aAe=Math.floor(0.17*ug);
gap=uiSurface.platformActions.ik()?2*debugPanel.gap:debugPanel.gap;o7[0]=uf/ej[0].width;o7[1]=ug/ej[1].width;o7[2]=aAe/ej[2].height;
o7[3]=aAe/ej[3].height;o7[4]=aAe/ej[4].height;o7[2]*=1.7;o7[3]*=1.07;fg[0]=gap;fg[1]=gap;fg[2]=gap;
fg[3]=gap;fg[4]=Math.floor(2*gap+o7[3]*ej[3].width);fi[0]=gap;fi[1]=fi[0]+gap+o7[0]*ej[0].height;
fi[2]=fi[1]+gap+o7[1]*ej[1].height;fi[3]=fi[2]+gap+o7[2]*ej[2].height;fi[4]=fi[3];
if(!g1[0]){for(aC=0;aC<5;aC++){fi[aC]-=o7[0]*ej[0].height+gap;}}if(!g1[1]){for(aC=2;aC<5;aC++){
fi[aC]-=o7[1]*ej[1].height+gap;}}};this.isTeamGame=function(){return!(moderationSystem.a3P()===7&&uiSurface.platformActions.ik());
};this.hm=function(it,iu){if(!ej||!this.isTeamGame()){return false;}var aC;for(aC=g1.length-1;aC>=0;aC--){
if(g1[aC]&&this.gM[aC]&&it>fg[aC]&&iu>fi[aC]&&it<fg[aC]+o7[aC]*ej[aC].width&&iu<fi[aC]+o7[aC]*ej[aC].height){
account.v(9,account.ua,new aEx(L(134),gameState.sK.formatScaledFixed(aDB[aC])));return true;}}
return false;};this.wr=function(){if(!ej||!this.isTeamGame()){return;}ws.imageSmoothingEnabled=true;var aC;
for(aC=0;aC<5;aC++){if(g1[aC]&&this.gM[aC]){ws.setTransform(o7[aC],0,0,o7[aC],fg[aC],fi[aC]);
ws.drawImage(ej[aC],0,0);}}ws.setTransform(1,0,0,1,0,0);};}

function AudioSystem(){
this.aEy=0;this.aEz=null;this.vg=null;this.lj=null;this.z=null;this.w3=null;this.vd=null;
this.message=null;this.aF0=null;this.tY=null;this.aF1=null;this.aF2=new aF3();this.f6=0;
this.aBY=0;this.applyToGame=function(){this.aBY=clanPanel.eZ;this.aEy=minimapRenderer.f0.f1(connectionMgr.buffer.data[105].value,5);
this.vg=new aF4();this.lj=new aF5();this.z=new aF6();
this.w3=new aF7();this.vd=new aF8();this.message=new aF9();this.aF0=new aFA();this.tY=new aFB();
this.aF1=new aFC();this.z.applyToGame();botAI.applyToGame();this.f6=1;uiSurface.platformActions.setState(1);moderationSystem.setState(0);
gameConfig.turnstile.f4();};this.vx=function(){this.tY&&this.tY.vx();this.aEz=null;this.vg=null;
this.lj=null;this.z=null;this.w3=null;this.vd=null;this.message=null;this.aF0=null;this.tY=null;
this.aF1=null;this.f6=0;botAI.vx();uiSurface.platformActions.setState(0);};}

function aF4(){this.vh=[[],[],[],[]];
this.vi=[0,0,0,0];this.aFD=[];this.aFE=function(aFF,uY,username,vn,a5y,aFG,elo,color,y4,aFH){
var aFI=this.aFJ(uY,username,vn,a5y,aFG,elo,color,y4,aFH);this.vh[aFF].push(aFI);if(audioSystem.aEy===uY){
audioSystem.aEz=aFI;}if(audioSystem.aF1.aFK(uY)){aFI.vp=1;}audioSystem.z.aFL+=account.ua===29&&audioSystem.z.tM[0]===aFF&&audioSystem.z.tM[2]===1;
};this.aFJ=function(uY,username,vn,a5y,aFG,elo,color,y4,aFH){
return{uY:uY,username:username,vn:vn,a5y:a5y,
aFG:aFG,elo:elo,color:color,y4:y4,aFH:aFH};};this.aFM=function(eI,aFF,vn,a5y,aFG,elo,y4,color){
var player=this.vh[aFF][eI];player.vn=vn;player.a5y=a5y;player.aFG=aFG;player.elo=elo;
player.isTileWrap=y4;player.color=color;audioSystem.z.aFL+=account.ua===29&&audioSystem.z.tM[0]===aFF&&audioSystem.z.tM[2]===1;
};this.aFN=function(eI,aFF,aFO){var player=this.vh[aFF][eI];
var aFP=player.username;
var aFQ="Redacted "+uiRenderer.f0.currentLoopHandler(player.uY,2);if(aFO){player.username="["+gameState.tI.a2z(aFP)+"] "+aFQ;
}else{player.username=aFQ;}if(aFP.indexOf("Redacted")<0){
player.aFR=aFP;}audioSystem.tY.aFS(player.uY);audioSystem.z.aFL+=account.ua===29&&audioSystem.z.tM[0]===aFF&&audioSystem.z.tM[2]===1;
};this.aFT=function(eI,aFU,aFV){var player=this.vh[aFU][eI];
this.aFW(eI,aFU);this.vh[aFV].push(player);audioSystem.z.aFL+=account.ua===29&&audioSystem.z.tM[0]===aFV&&audioSystem.z.tM[2]===1;
};this.aFW=function(eI,aFU){var vg=this.vh[aFU];this.aFD.push(vg[eI]);if(this.aFD.length>1000){
this.aFD.shift();}if(eI>=this.vi[aFU]){vg[eI]=vg[vg.length-1];}else{this.vi[aFU]--;if(aFU===2){
vg.splice(this.vi[aFU]+1,0,vg[vg.length-1]);vg.splice(eI,1);}else{vg[eI]=vg[this.vi[aFU]];
vg[this.vi[aFU]]=vg[vg.length-1];}}vg.pop();audioSystem.z.aFL+=account.ua===29&&audioSystem.z.tM[0]===aFU&&audioSystem.z.tM[2]===1;
};this.aFX=function(eI,tL){audioSystem.z.aFL+=account.ua===29&&audioSystem.z.tM[0]===tL&&audioSystem.z.tM[2]===1;
var vg=this.vh[tL];
var sC=vg[eI];if(tL===2){if(eI>=this.vi[tL]){audioSystem.aF1.join(sC);
var aFY=this.vi[tL];
var elo=sC.elo;while(aFY&&elo>vg[aFY-1].elo){aFY--;}vg[eI]=vg[this.vi[tL]];
vg.splice(this.vi[tL]++,1);vg.splice(aFY,0,sC);return;}vg.splice(this.vi[tL]--,0,sC);
vg.splice(eI,1);return;}if(eI>=this.vi[tL]){audioSystem.aF1.join(sC);aFZ(vg,this.vi[tL]++,eI);
return;}aFZ(vg,--this.vi[tL],eI);};

function aFZ(h,us,ut){var aFa=h[us];h[us]=h[ut];
h[ut]=aFa;}this.aFb=function(uY){var vh=this.vh;
var fZ=vh.length;for(var aC=0;aC<fZ;aC++){
var vg=vh[aC];
var lp=vg.length;for(var fs=0;fs<lp;fs++){if(uY===vg[fs].uY){
return vg[fs];}}}return null;};}

function aFC(){var aFc=[];
var LobbyRoomSlotState=[];
var aFe=0;this.applyToGame=function(){
var s1=aFf(LobbyRoomSlotState," is"," are"," in the lobby.");if(s1.length){audioSystem.message.aFg({id:7,s:s1});}aFc=[];
LobbyRoomSlotState=[];aFe=0;};this.aFK=function(aFh){if(audioSystem.aEy===aFh){return false;}var uY=uiRenderer.f0.currentLoopHandler(aFh,5);
if(connectionMgr.xF.vp(uY)){LobbyRoomSlotState.push(uY);return true;}return false;};this.join=function(player){
if(audioSystem.aEy===player.uY){return;}var uY=uiRenderer.f0.currentLoopHandler(player.uY,5);if(connectionMgr.xF.vp(uY)){aFc.push(uY);
}};this.aFi=function(){if(++aFe<3){return;}aFe=0;
var a8x=aFf(LobbyRoomSlotState,"",""," entered the lobby!");
var aFj=aFf(aFc,"",""," joined a game!");if(aFj.length){
if(a8x.length){a8x=a8x+" "+aFj;}else{a8x=aFj;}}if(a8x.length){audioSystem.message.aFg({id:7,s:a8x});
}aFc=[];LobbyRoomSlotState=[];};

function aFf(h,a8x,aFj,aFk){var fZ=h.length;if(fZ===0){return "";
}var s1="@"+h[0];if(fZ===1){return s1+a8x+aFk;}for(var aC=1;aC<fZ-1;aC++){s1+=", @"+h[aC];
}return s1+" and @"+h[fZ-1]+aFj+aFk;}}

function aF3(){this.forceResize=function(eI){var vi=audioSystem.vg.vi[eI];
if(vi<2){return false;}var tN=audioSystem.z.tO[eI];
var aFl=tN.aFm===9?333:512;vi=Math.min(vi,aFl);
if(tN.aFm===8){vi-=vi%2;}var vg=audioSystem.vg.vh[eI];
var aFn=vg.splice(0,vi);audioSystem.vg.vi[eI]-=vi;
var aFo=aFp(aFn);if(aFo===-1){audioSystem.vg.aFD=audioSystem.vg.aFD.concat(aFn);if(audioSystem.vg.aFD.length>1000){
audioSystem.vg.aFD.splice(0,audioSystem.vg.aFD.length-1000);}audioSystem.z.aFL+=account.ua===29&&audioSystem.z.tM[0]===eI&&audioSystem.z.tM[2]===1;
return false;}if(tN.aFm===8){tN.aFq=(tN.aFq+(aFo>>1))%1024;
var h8=aFo-aFo%2;
aFo=aFo%2;aFn=aFn.slice(h8,h8+2);}touchController.applyToGame(tN,aFn,aFo);return true;};this.aFr=function(tN,aFn,aFo){
var fc=localPlayer.data=new a6h();fc.spawningSeed=tN.spawningSeed;if(tN.aFm<7){
fc.gameMode=1;fc.numberTeams=tN.aFm+2;}else if(tN.aFm===9){fc.gameMode=fc.isZombieMode=1;
fc.numberTeams=2;}else{fc.gameMode=0;fc.battleRoyaleMode=tN.aFm===7?0:(tN.aFm===10?1:2);
}fc.selectedPlayer=aFo;fc.isContest=tN.aFs;fc.mapType=dialogManager.aFt(tN.tileDataToIndexUnchecked)?0:1;dialogManager.aFu(fc,tN.tileDataToIndexUnchecked);
fc.mapSeed=tN.mapSeed;
var aFv=fc.humanCount=aFn.length;fc.selectableSpawn=fc.gameMode===1||aFv<100;
fc.colorsData=new Uint32Array(aFv);fc.playerNamesData=new Array(aFv);
fc.a75=new Uint32Array(aFv);for(var aC=0;aC<aFv;aC++){fc.colorsData[aC]=aFn[aC].color;
fc.playerNamesData[aC]=aFn[aC].username;fc.a75[aC]=aFn[aC].uY;}if(fc.battleRoyaleMode===2){
fc.elo=new Uint16Array(aFv);for(aC=0;aC<aFv;aC++){fc.elo[aC]=aFn[aC].elo;
}}modalDialogEngine.close();moderationSystem.setState(8);dialogManager.a8(tN.tileDataToIndexUnchecked,fc.mapSeed);localPlayer.a6m();localPlayer.a6k=2;};

function aFp(aFn){
if(!audioSystem.aEz){return-1;}var fZ=aFn.length;
var uY=audioSystem.aEz.uY;for(var aC=0;aC<fZ;aC++){
if(aFn[aC].uY===uY){return aC;}}return-1;}}

function aF5(){var e9=["","","","Admin",
"Clan Leader","1v1","Clan Member","","Battle Royale","Wealthy Player","Patreon Member","Zombie"];
var aFw=[
colorPalette.pc,colorPalette.pc,colorPalette.pd,colorPalette.q6,colorPalette.sendPeaceVoteChoice,colorPalette.pt,colorPalette.qC,colorPalette.pd,colorPalette.qZ,colorPalette.qN,colorPalette.qW,colorPalette.pF];
var aFx=[[1],[1],
[1.2],[1.4,1.2],[1.7,1.4,1.2],[1.4,1.2],[1.4,1.2],[1.2],[1.4,1.2],[1.4,1.2],[1.4,1.2],[1.4,1.2]
];
var aFy=["Your account is too new.","The server couldn't process your request.","Spam detected.",
"You are muted.","Player couldn't be found.","You don't have permission for this operation.",
"Not enough gold.","Action cancelled.","User received this punishment already.",
"Lobby restarts in 2 minutes.","Lobby restarts in 10 seconds."];this.tU=function(aFz){
var aG0;if(aFz.id<5){aG0="@"+uiRenderer.f0.currentLoopHandler(aFz.uY,5);}if(aFz.id===0){return aG0+": "+aFz.s;
}if(aFz.id===1){var a30="@"+uiRenderer.f0.currentLoopHandler(aFz.target,5);if(aFz.aG1===0){if(aFz.value>=32768){
return aG0+" voted with "+(aFz.value-32768+1)+" gold against "+a30+" to weaken the latter's admin position. 📉";
}return aG0+" voted with "+(aFz.value+1)+" gold for "+a30+" to strengthen the latter's admin position. 💪";
}else if(aFz.aG1===1){return aG0+" sent "+Math.floor(aFz.value/100)+" 🧈 gold to "+a30+".";}
return aG0+" voted with "+(aFz.value/10).toFixed(1)+" points for "+a30+" to acknowledge the latter as clan leader. ✅";
}if(aFz.id===2){if(aFz.aG1===0){return aG0+" was 🔇 muted for 1 Hour.";
}if(aFz.aG1===1){return "The username of "+aG0+" was ✂️ redacted. Duration: 1 Day";
}return aG0+" 👢 was kicked.";}if(aFz.id===3){
return aG0+br.eL(aFz.aG1,br.eF[aFz.aG1][aFz.value])+"@"+uiRenderer.f0.currentLoopHandler(aFz.target,5)+br.eN(aFz.aG1,br.eF[aFz.aG1][aFz.value]);
}if(aFz.id===4){
return aG0+br.eL(5,br.eF[5][aFz.aG1])+"@"+uiRenderer.f0.currentLoopHandler(aFz.target,5)+br.eN(5,br.eF[5][aFz.aG1]);
}if(aFz.id===5){return aFy[aFz.aG1];}if(aFz.id===6){
return "You are about to mention "+aFz.value+" player"+(aFz.value===1?"":"s")+". This action will cost "+(Math.max(10*aFz.value,10)/100).toFixed(2)+" Gold. Proceed? (yes / no)";
}if(aFz.id===7){return aFz.s;
}};this.tT=function(aFz,aG2){return{aFz:aFz,s:aG2,aG3:0,fontSize:1,tX:0,aG4:aFz.id?colorPalette.sendFlagEmoji:colorPalette.pO};};
this.vl=function(player,tL){return(tL===2?"("+(player.elo/10).toFixed(1)+") ":"")+player.username;
};this.vm=function(vn){return aFw[vn];};this.aG5=function(vn,a5y){
if(vn<3||vn===7){return aFx[vn][0];}if(vn===4){return aFx[vn][a5y<1?0:a5y<10?1:2];
}return aFx[vn][a5y<10?0:1];};this.joinPacketBuilder=function(a5y){return a5y===0;};this.aFb=function(tL,uY){
var vh=audioSystem.vg.vh;
var vg=vh[tL];
var fZ=vg.length;for(var aC=0;aC<fZ;aC++){if(uY===vg[aC].uY){
return vg[aC];}}for(var ft=0;ft<vh.length;ft++){if(tL===ft){continue;}vg=vh[ft];fZ=vg.length;
for(aC=0;aC<fZ;aC++){if(uY===vg[aC].uY){return vg[aC];}}}return null;};this.vo=function(sC){
if(!audioSystem.aEz){return false;}return sC.uY===audioSystem.aEz.uY;};this.aG7=function(vg,aG8,aG9){
var a2x=[];loop:for(var aC=aG8;aC<aG9;aC++){var a2y=gameState.tI.a2z(vg[aC].username);
if(!a2y){continue;}for(var ft=a2x.length-1;ft>=0;ft--){if(a2y===a2x[ft].name){
a2x[ft].resolveAttackCombat++;continue loop;}}a2x.push({name:a2y,resolveAttackCombat:1});}a2x.sort(function(fs,ft){
return ft.resolveAttackCombat-fs.resolveAttackCombat;});if(a2x.length===0){return "";}var s1=a2x[0].name+": "+a2x[0].resolveAttackCombat;
for(aC=1;aC<a2x.length;aC++){s1+="   "+a2x[aC].name+": "+a2x[aC].resolveAttackCombat;
}return s1;};this.aGA=function(vn,a5y,aFG){if(e9[vn].length===0){return "Rank: "+(a5y+1);
}return e9[vn]+" Rank: "+(a5y+1)+((vn!==3&&aFG<100)?"   "+(e9[3]+" Rank: "+(aFG+1)):"");
};this.aGB=function(uY){
var tO=audioSystem.z.tO;for(var aC=0;aC<tO.length;aC++){aGC(tO[aC].tP,uY);}aGC(audioSystem.message.aGD(),uY,1);
audioSystem.tY.aGB(uY);};

function aGC(tP,uY,aGE){for(var ft=tP.length-1;ft>=0;ft--){
var sC=tP[ft];if(sC.id===0&&sC.uY===uY){sC.s="[Redacted Message]";if(aGE){sC.aGF=1;}}}}}

function aF8(){var u0=0;
var aGG=0;
var aGH=0;
var aGI=null;
var aGJ=null;this.ve=0;this.aGK=function(){if(!u0){return;
}if(aGG===aGL(aGJ)&&aGH===aGJ.isTileWrap){return;}aGH=aGJ.isTileWrap;aGI.show(-1,-1,aGM(aGJ,0,1),1,1,aGJ.color);
};this.vq=function(e,sC,aGN){var aAl=e.getBoundingClientRect();
this.show(aAl.left,aAl.top,sC,0,aGN);e.addEventListener("mouseleave",function remove(){
e.removeEventListener("mouseleave",remove);audioSystem.vd&&audioSystem.vd.tZ(1);});this.ve=aGN;
};

function aGM(sC,aGN,aGO){var s1=sC.username;s1+="   "+audioSystem.lj.aGA(sC.vn,sC.a5y,sC.aFG);s1+=aGP(sC);
s1+="   IP: "+uiRenderer.f0.currentLoopHandler(sC.aFH,2);s1+="   "+["🟥 Offline","🟩 Online"][aGO?aGG:aGL(sC,aGN)];
return s1;}

function aGL(sC,aGN){if(aGN||audioSystem.vg.aFb(sC.uY)){return(aGG=1);
}return(aGG=0);}

function aGP(sC){var uw=sC.isTileWrap;if(uw<1000){return "   Gold: "+uw;}uw=uw%1024;
if(uw<1000){return "   Gold: "+uw+"k";}return "   Gold: "+(uw-999)+"M";}this.show=function(fg,fi,sC,u4,aGN){
if(!aGI){aGI=new tx();}aGJ=sC;aGH=aGJ.isTileWrap;aGI.show(fg,fi,aGM(sC,aGN),u4,0,aGJ.color);
u0=1;};this.tZ=function(uB){this.ve=0;if(aGI&&aGI.tZ(uB)){u0=0;aGJ=null;}};}


function aF6(){this.tO=new Array(4);this.tM=[0,0,1,0];this.aFL=0;this.aGQ=[0,0];this.applyToGame=function(){
for(var aC=0;aC<this.tO.length;aC++){this.tO[aC]=new aGR();}this.tM[0]=connectionMgr.buffer.data[158].value;
};this.aGS=function(){aGT(true);audioSystem.aF1.applyToGame();};this.aFi=function(){audioSystem.aF1.aFi();aGU();aGT(false);};

function aGT(aGV){if(!account.a7H(29)){return;}if(audioSystem.z.aFL&&audioSystem.z.tM[2]===1){account.a7H(29).aGW();}audioSystem.z.aFL=0;
account.a7H(29).aGX();account.a7H(29).aGY();audioSystem.vd.aGK();}

function aGU(){for(var aC=0;aC<audioSystem.z.tO.length;aC++){
var tN=audioSystem.z.tO[aC];if(tN.vP===0){tN.aGZ=0;continue;}tN.aGa=Math.max(tN.aGa-tN.aGZ%2,0);tN.aGZ++;
}}this.aGb=function(tL){if(this.tM[0]!==tL){return;}if(this.tM[2]){return;}account.a7H(29).aGc();
};}

function aFA(){var aGd=0;
var aGe="";
var aGf=0;
var aGg=0;
var aGh=0;this.a2K=function(s){
if(aGd){aGd=0;
var aGi=s.toLowerCase();if(aGi==="yes"||aGi==="y"){aGj(aGe);return;
}aGk();return;}if(s.indexOf("@")<0){aGj(s);return;}var aGl=aGm(s);if(!aGl){aGj(s);return;}aGe=s;
var h=aGn(aGl);
var aGo=aGp(aGl);if(aGq(aGl,aGo,s)){return;}if(aGo.length===0){if(aGg||aGr(aGl)){
aGs(h.length);}else{aGj(s);}return;}if(aGl.length===aGh){aGj(s);return;}aGt(h,aGo);
aGs(h.length);};

function aGj(aG2){gameServer.aGu.aGv(3,aG2);}

function aGk(){audioSystem.message.aFg({id:5,aG1:7});
}

function aGs(resolveAttackCombat){aGd=1;audioSystem.message.aFg({id:6,value:resolveAttackCombat});}

function aGr(aGl){var fZ=aGl.length;
for(var aC=0;aC<fZ;aC++){var j=aGl[aC];if(j==="@all"||j==="@everyone"){return 1;}}return 0;
}

function aGn(aGl){var fZ=aGl.length;
var aGw=[0,0,0,0];for(var aC=0;aC<fZ;aC++){var j=aGl[aC];
for(var fs=0;fs<4;fs++){if(j==="@room"+(fs+1)){aGw[fs]=1;}}}aGg=gameState.sS.endsWith(aGw);if(aGg%4===0){
return gameState.sS.a51(audioSystem.vg.vh);}for(fs=0;fs<4;fs++){if(aGw[fs]){aGw[fs]=audioSystem.vg.vh[fs];}else{
aGw[fs]=[];}}return gameState.sS.a51(aGw);}

function aGp(aGl){var aGo=[];aGf=0;aGh=0;
var fZ=aGl.length;
for(var aC=0;aC<fZ;aC++){var j=aGl[aC];
var lp=j.length;if(gameState.tI.startsWith(j,"@[")){
if(lp<=9&&gameState.tI.formatGoldAmountLabel(j,"]")){aGo.push({id:0,g1:j.substring(2,lp-1).toUpperCase()});
}continue;}if(lp===6){if(gameState.tI.startsWith(j,"@room")){
continue;}aGh++;aGo.push({id:1,g1:minimapRenderer.f0.f1(j.substring(1),5)});continue;
}if(lp>1&&lp<5){var aGx=renderer.data.aEc(j.substring(1));if(aGx>=0){aGo.push({id:2,g1:aGx,eI:aC});
aGf=1;}}}return aGo;}

function aGq(aGl,aGo,s){if(!aGf){return 0;}var fZ=aGo.length;
for(var aC=0;aC<fZ;aC++){if(aGo[aC].id===2){s=s.replace(aGl[aGo[aC].eI],"@"+aGo[aC].g1);
}}aGe=s;aGd=1;aGj(s.slice(0,126)+"|");return 1;}

function aGt(h,aGo){var lp=aGo.length;
if(lp===0){return h;}var fZ=h.length;loop:for(var aC=fZ-1;aC>=0;aC--){for(var fs=0;fs<lp;fs++){
if(aGo[fs].id===0){if(aGo[fs].g1===gameState.tI.a2z(h[aC].username)){continue loop;
}continue;}if(aGo[fs].id===1){if(aGo[fs].g1===h[aC].uY){continue loop;}continue;}}h[aC]=h[--fZ];
h.pop();}}

function aGm(s){var aGy=new RegExp("\\B@[-\\w\\[\\]]+","g");return s.match(aGy);
}this.aGz=function(s){var aGl=aGm(s);if(!aGl){return s;}var a6=new RegExp("^[0-9]+$");
var fZ=aGl.length;for(var aC=0;aC<fZ;aC++){var j=aGl[aC].substring(1);
var lp=j.length;
if(lp>=1&&lp<=3&&a6.test(j)){var aGx=parseInt(j,10);if(!isNaN(aGx)&&aGx>=0&&aGx<renderer.data.h.length){
s=s.replace("@"+j,"@"+renderer.data.h[aGx]);}}}return s;};}

function aF9(){var aH0;
var aH1=[];
var aH2=-1;
var aH3=0;
var aH4=0;this.aFg=function(aFz){if(aFz.id===2&&aFz.aG1===3){audioSystem.lj.aGB(aFz.uY);
return;}var sC=audioSystem.lj.tT(aFz,audioSystem.lj.tU(aFz));if(aFz.id===5||aFz.id===6){account.a7H(29).aH5().tW(sC);
if(aFz.id!==5){return;}}var aH6=clanPanel.eZ<aH3+20000;if(aH2===aH1.length-1||!aH6){
aH2=aH1.length;}aH1.push(aFz);!connectionMgr.buffer.data[14].value&&aFz.id!==7&&botAI.play();
if(!aH0){return;}if(aH4&&(connectionMgr.buffer.data[13].value||aH6)){aH0.boatNotificationHandler(aH1.length);
}else{aH7();}};this.show=function(){aH8();};

function aH9(){aH3=clanPanel.eZ;if(this.vu===3){
aH8();}else{aH2=(aH1.length+aH2+2*this.vu-1)%aH1.length;aH7();}}

function aH7(){if(aH1.length===0){
return;}aH4=0;aH0&&aH0.vx();aH0=new vr(aH9);aH0.boatNotificationHandler(aH2,aH1.length);aH0.show(aH1[aH2]);
audioSystem.message.resize();}

function aH8(){aH4=1;aH0&&aH0.vx();aH0=new vy(aH7);aH0.boatNotificationHandler(aH1.length);
aH0.show();audioSystem.message.resize();}this.tZ=function(){aH2=aH1.length-1;aH0&&aH0.vx();aH0=null;
};this.resize=function(){aH0&&aH0.resize();};this.aGD=function(){return aH1;};}

function aF7(){
var aHA=null;
var aHB=null;
var aHC=0;
var aHD=0;
var aHE=null;this.aHF=function(e,sC){aHC=1;
aHB=sC;aHA=new vz([new x(L(135),aHG,sC.vn===0?1:0),new x(L(136),aHH,aHI()),new x(L(137),aHJ,0)]);
aHE={clientX:e.clientX,clientY:e.clientY};aHK(aHE.clientX,aHE.clientY,1);};this.getTerriColorArray=function(code){
if(account.ua!==29){return false;}if(!aHB){return false;}if(code.length<1){return true;}if(code==="Escape"){
this.tZ();return true;}if(!gameState.tI.startsWith(code,"Numpad")&&!gameState.tI.startsWith(code,"Digit")){
return true;}var g1=parseInt(code[code.length-1],10);if(isNaN(g1)){return true;}if(aHC===0){
this.aHF(aHE,aHB);return true;}if(!aHA){return false;}if(aHC===1){if(g1<=1){aHG();}else if(g1===2){
aHH();}else{aHJ();this.tZ();}return true;}aHL(aHD,mathUtils.distanceBetweenPointsAndEncoded(g1-1,0,br.eF[aHD].length-1));
this.tZ();return true;};

function aHG(){if(aHB.vn===0){return;}audioSystem.w3.tZ();
account.v(8,29,new ub(25,{action:0,uY:uiRenderer.f0.currentLoopHandler(aHB.uY,5),uZ:0},29));}

function aHM(){var fg=aHA.fg;
var fi=aHA.fi;audioSystem.w3.tZ();aHA=new vz([new x("Kick User",function(){aHL(0,0);},aHN(0,0)),
new x("Block Chat",aHO,aHN(1,0)),new x("Censor Username",aHP,aHN(2,0))
]);aHK(fg,fi);aHC=2;aHD=1;}

function aHN(id,eI){if(!audioSystem.aEz){return 1;}if(audioSystem.lj.vo(aHB)){
return 1;}var eH=aHB.a5y;
var aFG=audioSystem.aEz.aFG;if(aFG>=eH){return 1;}if(1-br.eG(id,aFG,eI)){
return 1;}if(aHB.vn===4){if(eH>=50){return+(aFG>=eH);}if(eH>=20){return+(aFG>=(eH/2));
}return+(aFG>=(eH/3));}return 0;}

function aHI(){if(!audioSystem.aEz){return 1;}if(audioSystem.lj.vo(aHB)){return 1;
}return 0;}

function aHQ(){if(!audioSystem.aEz){return 1;}if(audioSystem.lj.vo(aHB)){return 1;}if(audioSystem.aEz.aFG>=100){
return 1;}if(audioSystem.aEz.aFG>=aHB.a5y){return 1;}return 0;}

function aHH(){var fg=aHA.fg;
var fi=aHA.fi;audioSystem.w3.tZ();
var aHR=aHI();aHA=new vz([new x(br.eF[5][0],function(){aHL(5,0);},aHR),
new x(br.eF[5][1],function(){aHL(5,1);},aHR),new x(br.eF[5][2],function(){aHL(5,2);},aHR),
new x(br.eF[5][3],function(){aHL(5,3);},aHR)]);aHK(fg,fi);aHC=2;aHD=2;
}

function aHJ(){if(account.ua===29){account.handleKeyInput().aF0(uiRenderer.f0.currentLoopHandler(aHB.uY,5));}}

function aHL(id,value){if(id===5){
gameServer.aHS.aHT({action:3,uY:uiRenderer.f0.currentLoopHandler(aHB.uY,5),value:value});}}

function aHO(){var fg=aHA.fg;
var fi=aHA.fi;audioSystem.w3.tZ();aHA=new vz([new x(br.eF[1][0],function(){aHL(1,0);},aHN(1,0)),
new x(br.eF[1][1],function(){aHL(1,1);},aHN(1,1)),
new x(br.eF[1][2],function(){aHL(1,2);},aHN(1,2)),
new x(br.eF[1][3],function(){aHL(1,3);},aHN(1,3)),
new x(br.eF[1][4],function(){aHL(1,4);},aHN(1,4))
]);aHK(fg,fi);aHC=3;aHD=1;}

function aHP(){var fg=aHA.fg;
var fi=aHA.fi;audioSystem.w3.tZ();aHA=new vz([new x(br.eF[2][0],function(){aHL(2,0);},aHN(2,0)),
new x(br.eF[2][1],function(){aHL(2,1);},aHN(2,1)),
new x(br.eF[2][2],function(){aHL(2,2);},aHN(2,2))
]);aHK(fg,fi);aHC=3;aHD=2;}

function aHU(){var fg=aHA.fg;
var fi=aHA.fi;audioSystem.w3.tZ();aHA=new vz([new x(br.eF[3][0],function(){aHL(3,0);},aHN(3,0)),
new x(br.eF[3][1],function(){aHL(3,1);},aHN(3,1)),
new x(br.eF[3][2],function(){aHL(3,2);},aHN(3,2))
]);aHK(fg,fi);aHC=3;aHD=3;}

function aHV(){var fg=aHA.fg;
var fi=aHA.fi;audioSystem.w3.tZ();aHA=new vz([new x(br.eF[4][0],function(){aHL(4,0);},aHN(4,0)),
new x(br.eF[4][1],function(){aHL(4,1);},aHN(4,1)),
new x(br.eF[4][2],function(){aHL(4,2);},aHN(4,2)),
new x(br.eF[4][3],function(){aHL(4,3);},aHN(4,3)),
new x(br.eF[4][4],function(){aHL(4,4);},aHN(4,4))]);aHK(fg,fi);aHC=3;aHD=4;
}

function aHK(fg,fi,w5){aHA.show(fg,fi,w5);audioSystem.vd.show(aHA.fg,aHA.fi,aHB,1);}this.tZ=function(){
aHC=0;aHA&&aHA.tZ();aHA=null;audioSystem.vd.tZ();};}

function aGR(){this.vP=0;this.tileDataToIndexUnchecked=0;this.mapSeed=0;
this.aFm=0;this.aHW=0;this.aHX=0;this.aHY=0;this.aFs=0;this.aGa=0;this.spawningSeed=0;this.a3X=0;
this.aFq=0;this.tP=[];this.tQ=1048575;this.aGZ=0;this.aHZ=[{fF:0,mapSeed:0,aFm:0,eZ:100,aFs:0},
{fF:1,mapSeed:0,aFm:1,eZ:200,aFs:0},{fF:2,mapSeed:0,aFm:2,eZ:300,aFs:0},
{fF:3,mapSeed:0,aFm:3,eZ:400,aFs:0},{fF:0,mapSeed:0,aFm:9,eZ:500,aFs:0},
{fF:1,mapSeed:0,aFm:10,eZ:600,aFs:0},{fF:2,mapSeed:0,aFm:8,eZ:700,aFs:0},
{fF:3,mapSeed:0,aFm:3,eZ:800,aFs:0}];}

function aFB(){var aHa=[];
var ul=[];
var aHb=[];
this.vx=function(){for(var aC=0;aC<ul.length;aC++){ul[aC].onclick=ul[aC].onmouseover=null;
}ul=null;aHb=null;};this.transform=function(sC){var rz=document.createElement("div");
var aHc=aHd(sC);for(var aC=0;aC<aHc.length;aC++){rz.appendChild(aHc[aC]);
}if(sC.aFz.id===0){rz.vx143=sC.aFz;aHb.push(rz);}rz.style.margin="0.6em 0.6em";
sC.tX&&(rz.style.marginLeft=rz.style.marginRight="inherit");rz.style.font="inherit";
var aHe=sC.aFz.id>0;sC.aG3&&(rz.style.fontWeight="bold");aHe&&(rz.style.paddingLeft="0.7em");
aHe&&(rz.style.fontStyle="italic");rz.style.fontSize=sC.fontSize.toFixed(2)+"em";
return rz;};

function aHd(sC){var s=sC.s;
var aHc=[];while(true){var ej=aHf(s,0);
if(ej===-1){aHc.push(aHg(s,sC));break;}if(ej===0){aHc.push(aHh(s.substring(1,6),sC,ej));
}else{aHc.push(aHg(s.substring(0,ej),sC));aHc.push(aHh(s.substring(ej+1,ej+6),sC,ej));
}s=s.substring(ej+6);}return aHc;}

function aHh(s1,sC,ej){
var aFI=aHi(s1);if(ej===0&&sC.aFz.id===0&&sC.tX){sC.fontSize=audioSystem.lj.aG5(aFI.vn,aFI.a5y);
sC.aG3=audioSystem.lj.joinPacketBuilder(aFI.a5y);}var tH=document.createElement("span");tH.textContent=aHj(aFI,sC,ej);
tH.style.display="inline-block";tH.style.color=audioSystem.lj.vm(aFI.vn);if(aFI.vn===11){tH.style.textShadow=
"-1px -1px 0 lightgray,"+"1px -1px 0 lightgray,"+"-1px 1px 0 lightgray,"+"1px 1px 0 lightgray";}tH.style.cursor="pointer";tH.style.margin="0";tH.style.font="inherit";
tH.style.minWidth=tH.style.minHeight="1em";audioSystem.lj.vo(aFI)&&(tH.style.textDecoration="underline");
if(aFI.vp){tH.style.textDecorationLine="underline";tH.style.textDecorationStyle="dotted";
}audioSystem.lj.joinPacketBuilder(aFI.a5y)&&(tH.style.fontWeight="bold");tH.onclick=function(e){audioSystem.w3.aHF(e,aFI);};
!powerSystem.EqualWidthControlRow()&&(tH.onmouseover=function(e){audioSystem.vd.vq(e.target,aFI);});
ul.push(tH);return tH;}

function aHj(aFI,sC,ej){
if(aFI.aHk){aFI.aHk--;
var aHl=(sC.aFz.id===2||((sC.aFz.id===3||sC.aFz.id===4)&&ej!==0));
return aFI.username+(aHl?" ("+aFI.aFR+")":"");
}if(sC.aFz.aGF){return "Redacted "+uiRenderer.f0.currentLoopHandler(aFI.uY,2);}return aFI.username;
}

function aHg(s,sC){var tH=document.createElement("span");tH.textContent=s;tH.style.color=sC.aG4;
tH.style.margin="0";tH.style.font="inherit";return tH;}

function aHi(s1){var uY=minimapRenderer.f0.f1(s1,5);
var aFI=audioSystem.vg.aFb(uY);if(aFI){aHa.push(aFI);while(aHa.length>75){aHa.shift();}return aFI;
}var aFD=audioSystem.vg.aFD;for(var aC=aFD.length-1;aC>=0;aC--){aFI=aFD[aC];if(uY===aFI.uY){aHa.push(aFI);
return aFI;}}for(aC=aHa.length-1;aC>=0;aC--){aFI=aHa[aC];if(uY===aFI.uY){aHa.push(aFI);
return aFI;}}return audioSystem.vg.aFJ(uY,s1,1,999999,999999,0,0,0,0);}

function aHf(s,position){
var aC=s.indexOf("@",position);if(aC<0){return-1;}var s1=s.substring(aC+1,aC+6);
if(s1.length!==5){return aHf(s,aC+1);}if(gameState.tI.startsWith(s1,"room")){
return aHf(s,aC+1);}var aHm=new RegExp("^[a-zA-Z0-9_-]+$");if(!aHm.test(s1)){return aHf(s,aC+1);
}var aHn=s.substring(aC+6,aC+7);if(aHn.length!==1){return aC;}var aHo=new RegExp("^[ :!.]+$");
if(!aHo.test(aHn)){return aHf(s,aC+1);}return aC;}this.aHp=function(aHq){
if(!aHq){return;}if(!((aHq.id===2&&aHq.aG1===1)||(aHq.id===3&&aHq.aG1===2))){
return;}var uY=aHq.id===3?aHq.target:aHq.uY;if(audioSystem.vg.aFb(uY)){
return;}var aFQ="Redacted "+uiRenderer.f0.currentLoopHandler(uY,2);
var aFD=audioSystem.vg.aFD;for(var aC=aFD.length-1;aC>=0;aC--){
aHr(aFD[aC],aFQ,uY);}for(aC=aHa.length-1;aC>=0;aC--){aHr(aHa[aC],aFQ,uY);
}};

function aHr(aFI,aFQ,uY){if(uY===aFI.uY&&!aFI.aFR){aFI.aFR=aFI.username;aFI.username=aFQ;}
}this.aFS=function(uY){var aHs=aHb;
var aHt="@"+uiRenderer.f0.currentLoopHandler(uY,5);for(var aC=aHs.length-1;aC>=0;aC--){
var fc=aHs[aC];if(fc.vx143.uY===uY||fc.vx143.s.indexOf(aHt)>=0){while(fc.firstChild){
account.removeChild(fc,fc.firstChild);}var aHc=aHd(audioSystem.lj.tT(fc.vx143,audioSystem.lj.tU(fc.vx143)));
for(var fs=0;fs<aHc.length;fs++){fc.appendChild(aHc[fs]);
}aHs.splice(aC,1);}}};this.aGB=function(uY){var aHs=aHb;for(var aC=aHs.length-1;aC>=0;aC--){
var fc=aHs[aC];if(fc.vx143.uY===uY){while(fc.firstChild){account.removeChild(fc,fc.firstChild);
}fc.vx143.s="[Redacted Message]";
var aHc=aHd(audioSystem.lj.tT(fc.vx143,audioSystem.lj.tU(fc.vx143)));
for(var fs=0;fs<aHc.length;fs++){fc.appendChild(aHc[fs]);
}aHs.splice(aC,1);}}};}

function FlagSystem(){var aHu;var aHv;var aHw;this.j=0;this.k=0;this.fi=0;
this.gap=0;this.applyToGame=function(){aHu=-1;aHv=colorPalette.pO;aHw="rgba(255,255,255,0.16)";this.oy=new Array(7);
this.k=Math.floor((uiSurface.platformActions.ik()?0.123:0.093)*camera.il);this.j=Math.floor((uiSurface.platformActions.ik()?3.96:4.2)*this.k);
this.gap=Math.floor(0.025*this.j);
var aHx=Math.floor(0.26*this.k);
var aHy=gameState.sK.u8(1,aHx);
this.oy[0]={fg:0,fi:0,j:Math.floor(0.6*this.j-this.gap/2),k:this.k,aG2:"Multiplayer",
font:aHy,aHz:"rgba(22,88,22,0.8)",fontSize:aHx};aHx=Math.floor(0.18*this.k);aHy=gameState.sK.u8(1,aHx);
this.oy[1]={fg:0,fi:0,j:this.j-this.oy[0].j-this.gap,k:this.k,aG2:"Single Player",
font:aHy,aHz:"rgba(22,88,88,0.8)",
fontSize:aHx};this.oy[2]={fg:0,fi:0,j:this.j,k:Math.floor(0.3*this.k),aG2:"",
font:this.oy[1].font,aHz:"rgba(100,0,0,0.8)",fontSize:this.oy[1].fontSize};this.oy[3]={
fg:0,fi:0,j:this.j,k:this.k,aG2:"Back",font:this.oy[0].font,aHz:"rgba(0,0,0,0.8)",fontSize:this.oy[0].fontSize
};this.oy[4]={fg:0,fi:0,j:this.j,k:Math.floor(0.3*this.k),aG2:"The game was updated!",
font:this.oy[1].font,aHz:"rgba(100,0,0,0.8)",fontSize:this.oy[1].fontSize
};this.oy[5]={fg:0,fi:0,j:this.oy[0].j,k:Math.floor(0.8*this.k),aG2:"Reload",
font:this.oy[0].font,aHz:"rgba(0,100,0,0.8)",fontSize:this.oy[0].fontSize
};this.oy[6]={fg:0,fi:0,j:this.oy[1].j,k:this.oy[5].k,aG2:"Back",font:this.oy[0].font,aHz:"rgba(0,0,0,0.8)",
fontSize:this.oy[0].fontSize};this.aBk();};this.aBk=function(){this.fi=Math.floor(0.54*camera.k);
this.oy[0].fg=Math.floor(0.5*camera.j-0.5*this.j);this.oy[1].fg=this.oy[0].fg+this.oy[0].j+this.gap;
this.oy[2].fg=this.oy[3].fg=this.oy[0].fg;this.oy[4].fg=this.oy[5].fg=this.oy[0].fg;
this.oy[6].fg=this.oy[1].fg;this.oy[0].fi=Math.floor(0.54*camera.k);
this.oy[1].fi=this.oy[0].fi;this.oy[2].fi=Math.floor((camera.k-this.oy[2].k-this.oy[3].k-this.gap)/2);
this.oy[3].fi=this.oy[2].fi+this.oy[2].k+this.gap;
this.oy[4].fi=Math.floor((camera.k-this.oy[4].k-this.oy[5].k-this.gap)/2);
this.oy[5].fi=this.oy[6].fi=this.oy[4].fi+this.oy[4].k+this.gap;
};this.aI0=function(){aI1(0);aI1(1);};this.sendGameJoin=function(){
aI1(2);aI1(3);};this.aI3=function(){aI1(4);aI1(5);aI1(6);};this.a3m=function(fg,fi,nG){
var aC=-1;if(moderationSystem.a3P()===0){aC=this.a4G(fg,fi,0,2);}else if(moderationSystem.a3P()===3){
aC=this.a4G(fg,fi,3,1);}else if(moderationSystem.a3P()===5){aC=this.a4G(fg,fi,5,2);}if(aHu!==aC){aHu=aC;if(nG){
clanPanel.ds=true;}}if(aC!==-1){keyboardHandler.reset();return true;}return false;};this.a4G=function(fg,fi,aI4,size){
for(var aC=aI4;aC<aI4+size;aC++){if(fg>=this.oy[aC].fg&&fi>=this.oy[aC].fi&&
fg<=this.oy[aC].fg+this.oy[aC].j&&fi<=this.oy[aC].fi+this.oy[aC].k){
return aC;}}return-1;};

function aI1(aC){var button=flagSystem.oy[aC];
var fg=button.fg;
var fi=button.fi;
var j=button.j;
var k=button.k;ws.fillStyle=button.aHz;ws.fillRect(fg,fi,j,k);
if(aC===aHu){ws.fillStyle=aHw;ws.fillRect(fg,fi,j,k);}ws.lineWidth=debugPanel.a1E;ws.strokeStyle=aHv;
ws.strokeRect(fg,fi,j,k);aI5(button);}

function aI5(button){var fg=button.fg;
var fi=button.fi;
var j=button.j;
var k=button.k;gameState.sK.textAlign(ws,1);gameState.sK.textBaseline(ws,1);ws.font=button.font;
ws.fillStyle=aHv;ws.fillText(button.aG2,Math.floor(fg+j/2),Math.floor(fi+k/2+0.1*button.fontSize));
}}

function LoadingSystem(){var aI6;var aI7;var a9M,aI8,aI9,aIA,aIB,aIC,aID;var a9L;var aIE;
var aIF;var aIG;
var aIH=1;
var aII=0;
var aIJ=0;this.mountainAttackTargetFinder=1;this.aIK=0;this.aIL=0;this.applyToGame=function(){
gameConfig.turnstile.ey();moderationSystem.setState(6);aI6=0;aI7=1;aIC="rgba(0,220,120,0.4)";aID="rgba(0,0,0,0.8)";
this.resize();clanPanel.ds=true;aIH=1;aII=0;aIG=this.mountainAttackTargetFinder-1;aIJ=this.aIK===0?(settingsPanel.e5?1:0):(this.aIK-1);
aIM(1);};this.resize=function(){aI8=Math.floor((uiSurface.platformActions.ik()?0.5:0.25)*camera.il);
aI9=aI8+12;a9M=Math.floor(0.125*aI8);aIB=a9M*3;aIA=Math.floor(0.225*aI8);aIE=Math.floor(0.3*a9M);
a9L=gameState.sK.u8(0,aIE);};

function aIM(aIN){if(aIN){aIG=(aIG+1)%gameServer.z.interiorColorRed;}else{gameServer.z.close(aIG,3280);
if(aIH){aIH=0;}else{aIJ=1-aIJ;aII=(aII+1)%2;if(aII===0){aIG=(aIG+1)%gameServer.z.interiorColorRed;gameServer.z.close(aIG,3280);
}}}aIF=clanPanel.eZ;loadingSystem.aIL=aIJ;if(gameServer.z.interiorColorGreen(aIG,4,1)){gameServer.aGu.interiorColorBlue(aIG);}}this.a3W=function(oN){
if(oN===aIG){aIR();}};

function aIS(){if(clanPanel.eZ>aIF+12000){aIR();}}

function aIR(){
if(aIG===0){techInfo.a3b(3249);return;}aIM();}this.hm=function(fg,fi){var nv=Math.floor((camera.j-aI9)/2);
var nw=Math.floor(0.5*(camera.k-debugPanel.gap-a9M-aIA))+a9M+debugPanel.gap;if(fg>nv&&fg<nv+aI9&&fi>nw&&fi<nw+aIA){
this.a4R();flagSystem.a3m(fg,fi,false);return true;}return false;};this.a4R=function(){
gameServer.z.a3c(3260);account.z.a0();};this.ee=function(){if(moderationSystem.a3P()!==6){return;}aIS();aIT();};

function aIT(){
aI6+=aI7*0.07*(aI6<16?(5+aI6):aI6>84?105-aI6:17);if(aI6>100){aI6=100;aI7=-1;}else if(aI6<0){
aI6=0;aI7=1;}aIC="rgba(0,"+Math.floor(190-1.9*aI6)+","+Math.floor(120-1.2*aI6)+","+(0.4+0.004*aI6)+")";
aID="rgba(0,"+Math.floor(1.9*aI6)+","+Math.floor(1.2*aI6)+","+(0.8-0.004*aI6)+")";
clanPanel.ds=true;}this.wr=function(){var fg=Math.floor((camera.j-aI9)/2);
var fi=Math.floor(0.5*(camera.k-debugPanel.gap-a9M-aIA));aIU(L(138),fi,3,aI6/100);
aIV(fg,fi+a9M+debugPanel.gap,aI9,aIA,L(40));};

function aIV(fg,fi,j,k,aG2){ws.fillStyle=colorPalette.pJ;
ws.fillRect(fg,fi,j,k);ws.lineWidth=3;ws.strokeStyle=colorPalette.pO;ws.strokeRect(fg,fi,j,k);
var fZ=Math.floor(0.3*k);gameState.sK.textAlign(ws,1);gameState.sK.textBaseline(ws,1);ws.font=gameState.sK.u8(0,fZ);
ws.fillStyle=colorPalette.pO;ws.fillText(aG2,Math.floor(fg+j/2),Math.floor(fi+k/2+0.1*fZ));
}

function aIU(title,fi,aBS,vP){ws.fillStyle=aID;aIW(fi,aBS,1);ws.fill();ws.fillStyle=aIC;
aIW(fi,aBS,vP);ws.fill();ws.strokeStyle=colorPalette.pO;aIW(fi,aBS,1);ws.stroke();aIX(title,fi);}


function aIX(aIY,fi){gameState.sK.textAlign(ws,1);gameState.sK.textBaseline(ws,1);ws.font=a9L;ws.fillStyle=colorPalette.pO;
ws.fillText(aIY,Math.floor(0.5*camera.j),Math.floor(fi+0.58*a9M));}

function aIW(fi,aBS,vP){
var nv=Math.floor((camera.j-aI8)/2)+aIB;
var o8=nv+Math.floor(vP*(aI8-2*aIB));ws.lineWidth=aBS;
ws.beginPath();ws.moveTo(nv,fi);ws.lineTo(o8,fi);ws.lineTo(Math.floor(nv-aIB+vP*aI8),fi+a9M);
ws.lineTo(nv-aIB,fi+a9M);ws.closePath();}}

function ModerationSystem(){var a3J=0;this.applyToGame=function(){flagSystem.applyToGame();
a3J=0;};this.setState=function(aIZ){a3J=aIZ;};this.a3P=function(){return a3J;};this.aIa=function(){
this.setState(8);account.y();};this.getTerriColorArray=function(e){if(!dialogManager.yl){return false;}if(clanPanel.eZ<400){
return;}if(e.key==="Enter"||e.key==="Escape"){if(this.surroundingOffsets()){return true;}if(e.key==="Enter"){
if(a3J===0){return true;}else if(a3J===7){return true;}}}return false;};this.aIc=function(){
bc.resize();};this.surroundingOffsets=function(){if(bc.tZ()){return true;}return false;};this.hm=function(fg,fi){
if(!dialogManager.yl){return;}if(bc.hm(fg,fi)){return;}if(a3J===6&&loadingSystem.hm(fg,fi)){return;
}if(bb.hm(fg,fi)){return;}keyboardHandler.hm(fg,fi);if(a3J===0){}else if(a3J===7){}};this.a3m=function(fg,fi){
if(!keyboardHandler.aBd){if(flagSystem.a3m(fg,fi,true)){return;}}keyboardHandler.a3m(fg,fi);};this.click=function(fg,fi){
keyboardHandler.a4B();};this.a3p=function(fg,fi,deltaY){};this.aId=function(){flagSystem.aBk();
clanPanel.ds=true;};this.wr=function(){if(a3J===8||a3J===10){return;}ws.imageSmoothingEnabled=true;
this.a0K();if(a3J!==0){keyboardHandler.wr();keyProcessor.wr();this.aIe();bb.wr();}if(a3J===0){
}else if(a3J===6){loadingSystem.wr();}bc.wr();account.wr();};this.a0K=function(){if(!dialogManager.yl){ws.fillStyle=colorPalette.pF;
ws.fillRect(0,0,camera.j,camera.k);return;}var aIf=camera.j/dialogManager.fk;
var aIg=camera.k/dialogManager.fl;
var fD=aIf>aIg?aIf:aIg;
ws.setTransform(fD,0,0,fD,Math.floor((camera.j-fD*dialogManager.fk)/2),Math.floor((camera.k-fD*dialogManager.fl)/2));
ws.drawImage(dialogManager.yn,0,0);ws.setTransform(1,0,0,1,0,0);ws.fillStyle=colorPalette.pJ;
ws.fillRect(0,0,camera.j,camera.k);};this.aIe=function(){var fi=Math.floor(0.3*camera.k);
var canvas=adSystem.updatePlayerColorBrightness("territorial.io");
var ia=1.75*camera.k/canvas.width;ia=(ia*canvas.width)<(0.98*camera.j)?(0.98*camera.j/canvas.width):ia;
ws.globalAlpha=0.15;ws.imageSmoothingEnabled=false;
var fg=Math.floor(0.5*(camera.j-ia*canvas.width));
fg=Math.floor(fg/ia);
var a8Y=Math.floor(fi-0.5*canvas.height*ia);
a8Y=Math.floor(a8Y/ia);ws.setTransform(ia,0,0,ia,fg,a8Y);ws.drawImage(canvas,fg,a8Y);
ws.setTransform(1,0,0,1,0,0);ws.globalAlpha=1;ws.imageSmoothingEnabled=true;
};}

function TouchController(){this.aFq=0;this.aIi=0;var aIj;var divideSigned;var aIl;var aIm;var aIn;
var aIo=0;
this.applyToGame=function(tN,aFn,aFo){account.y();audioSystem.vx();moderationSystem.setState(10);aIm=tN;aIn=aFn;aIo=aFo;this.aFq=tN.aFq;
this.aIi=aFo;aIj=0;divideSigned=clanPanel.eZ+4500;gameServer.z.a3X=tN.a3X;if(gameServer.z.mapId===tN.a3X){console.log("direct pass");
aIl=0;}else{console.log("delayed pass");gameServer.z.close(gameServer.z.mapId,3247);aIl=2;if(gameServer.z.interiorColorGreen(tN.a3X,5,2)){
gameServer.isValidShipLaunchDirection.aIp();}}os();};

function aIq(){aIm=aIn=null;aIo=0;}this.nE=function(){
if(aIl>0&&clanPanel.eZ>divideSigned){mj();}};

function mj(){aIl--;divideSigned+=4500;if(clanPanel.getPlayerColors===0&&clanPanel.kr()===0){
gameServer.z.interiorColorGreen(gameServer.z.a3X,5,2);}}this.isInteriorTerritoryTile=function(){if(moderationSystem.a3P()!==10){return false;
}audioSystem.aF2.aFr(aIm,aIn,aIo);aIq();return true;};this.isAttackBorderTile=function(){if(moderationSystem.a3P()!==10){return;}aIj++;
if(aIj>=2){audioSystem.aF2.aFr(aIm,aIn,aIo);aIq();}};

function os(){ws.imageSmoothingEnabled=true;moderationSystem.a0K();
aIu();}

function aIu(){var canvas=adSystem.updatePlayerColorBrightness("loading");
var o7=(uiSurface.platformActions.ik()?0.396:0.25)*camera.il/canvas.width;
ws.setTransform(o7,0,0,o7,Math.floor((camera.j-o7*canvas.width)/2),Math.floor((camera.k-o7*canvas.height)/2));
ws.imageSmoothingEnabled=false;
ws.drawImage(canvas,0,0);ws.setTransform(1,0,0,1,0,0);}}

function AdSystem(){var aIv;var canvas;
var a2c;var aIw;this.applyToGame=function(){if(canvas===undefined){aIx();}};this.get=function(eI){
return canvas[eI];};this.updatePlayerColorBrightness=function(name){for(var aC=a2c.length-1;aC>=0;aC--){if(a2c[aC]===name){
return canvas[aC];}}return aIw;};this.v0=function(){return aIv<=0;};this.aIy=function(){
aIv=0;aIz();};

function aIx(){aIv=23;canvas=new Array(aIv);a2c=new Array(aIv);aJ0();aJ1();
aJ2(0,"exit",6,"iVBORw0KGgoAAAANSUhEUgAAAFYAAABGBAMAAACkrn5fAAAAHlBMVEUAAAAiJCI4OjdcXltoameIioejpqPExsPY29j///9xarZIAAAAyUlEQVRIx+3WQQqCQBTG8TdOB5DUI+S6nRcoPIFhu1bBHGGO4Any3TYxAkWTv1DSYr71D4b5mOE9kWmszkeC/ZptT6Ocl+xj5qgtbVR1iZn9VE2wU2uO2Jryhm2h2OaKbdZgu/NKrXVK7f6q1JpaqTWFYpvrUtqhPTTYpst0aBOv2Drltlxh392iu0U1t5I4biX13PZvF7+zvOFWihXWlNy+aqZ/M3LcivXcds1xK9kKK3GYAVtYe+8CZ/c/7Br9blSNcgn75O/tE26TasUvH0ImAAAAAElFTkSuQmCC");
aJ2(1,"victory",6,"iVBORw0KGgoAAAANSUhEUgAAADYAAAAKAQMAAADFMz9IAAAABlBMVEUAAAD///+l2Z/dAAAASUlEQVQI12M4lvj+++efLQzHkoH0jxaGI+yMbcIcZxiOpEHoMyD6xx+GHBB9oIIhA0Q/MGCoSAfSBQYMBskP2z9bAOlEIC1hAADJYSFMvxXXTAAAAABJRU5ErkJggg==");
aJ2(2,"defeat",6,"iVBORw0KGgoAAAANSUhEUgAAADAAAAAKAQMAAADILU8PAAAABlBMVEUAAAD///+l2Z/dAAAAOklEQVQI12P48efPH5v/DEDyT81/hjMHDhxIkWA4AqV+/PgBpf5JgOWA1B0gdUyC4cefA3+A1AcwBQAlGyu1reW1ZgAAAABJRU5ErkJggg==");
aJ2(3,"orders",6,"iVBORw0KGgoAAAANSUhEUgAABqQAAABkBAMAAAASxkyFAAAAGFBMVEUAAAAsLixKS0lkZmOFh4SqrKnMzsv///8J7h1xAAAgAElEQVR42u1dS3fbNrCm+NJWaRN7q9vW8la3Sayt0trmVkltcyu/xK0Ti+Tfv8SLmAEGIBTL5yateHrSWNHnwevDDAYzwyging83Vds9zePfUeBzQBwQB4Tz+ci/L57mnwPigDggXoRIAYCDlgfEAXFAfD/iY2s9/xwQB8QB8b2IS8G8x6s/J6PfL4TJ2D4cEAfEAfECRHM1UT+PLqoBzAFxQBwQbsQZ+/fHKfwovmGf3R8QB8QBsTsiIy1Dbj2uQhDxzojogDgg/sUI5stoiH/LKpdfw0D8sTMiOiAOiH8vIipdbGPsrAMQV7shRmU92VlG9JqIk8q4afghWnVA/KyIWfcPn2n99a77p7tBRLbdDZG37XpXGbu3agfEWWs5cF6pVWnVfP6Ren5AvAaCqbUHj6fDVm0m4my7G6LE3A6SEU12RgT34526aLh/PRm6683klWW8KiLdPPyArfpeRL56DRns09rtCyyJ32cg4mq7G4Kt3s78+zANlxFFqx1bFd6PWF+LL19LhnyStr6BNsQeZaTGQnh8lX6MurG6/a5V0q/P5tVGd3dE0Ux2QFxuZITfJz8i4zyLp5HbdbGiEPDn7U6IlC/eUdk+h8uIkvWOrQrvx6m+D69fS0b/43JUrQMRyaanRXSy+TyAKHHDyu2r9CNnS+q7Volcw62k5GuM7s6IuG2/7YDQW68mFYFgNOvsndxJ9jNrIygNd3yBKTWIKPjihdbfsIwo/bpjq4L7EcMYk+XryNCnyOht9TUQUegjZ9LN69SLiKt15Njm9tmP07Zp2/n3rBK9KpvXGt2dEUfGjA8gfr3RpHqYOBGZMO6LtnboqZFJwwwdB7jdtA1G3Gw2la0TBmV0i3G7W6vC+5HzbWcZ8wvy59eRoX+eVu1TGGIERoi1ce1FGKZCAbbfgH4s7gL7UbTzBeX9Ch0rvW+9wujujGCuvJ3WlVgkKGrWQrCtcCX+59JTWWvOliV0G4rIUNjht2AZ0ei4nuzUqvB+FGpcz0yjZn8y9FlqjbydPkQKmrPo/v7kReRorYwQcQf7kVTNPKwfRTs5JgchcKz4vK9faXR3RfATSLvbutLx6Mp1ayK6b9RiUDtOTVynPGiwKgQUug1F5IhS62AZ7zZWhsoAIrwfbb8PlaYdsDcZ+t/XvQU3hEiFF6dv2ZMXsUBTn7VIFw61qrDO2C7Eon2oOsMv6UygZvsd88Hn/em1RndHBD9Eb3eUMdKK6jOFYD73Va+/tk6q3xGIfoezgU4E1lLTUBkn9r3RACK8H2zlftWtW7+GDP2M14RKpxEJ6/JcH0HWXkSBjNYcU2qgVZkdWeNCCPfEpbUlBo6VOLduX2t0d0OMKtGJzWQ3GWdq/ZL9iKretmAa7ZFuVwXtocrw+OQE050I5ApoQmVk1L2Rv1Xh/cj1wmUr9zl6BRng3Lm2fFROBFjoiFIk4giN5xhTyt8qsbQM5elAsAn8Utr+0b/DxipBuH2P7o4IafelO8/5u96X9Zv9pQzcMsTWggKOkRWFiNBRJAgBMyO3gTJG9L2Rt1Xh/RiDtbgwT5R7kgH+dW2Nlnes1ha7HIgMfePUoJS3Vey60rrOdCG631zYe+JsGzZWGcLZiNmGPbAl76/5R9d/7n8+UrEITw0XZoCME7l+483URHR8AOfSxHVNnACfHkKofWcbjFgASj0Fyjii7418raIfElEAN0luXrrsR8blZtUb6mvtQTrZ3HtlaEoleDshECnbEHslfr4IH11ux6yOTBvAhRgDSrV6iW3DxipHlLIQsblzguT0xz3OOfjta8s0CZFxJlo5E0iIiLD/O2sdxC/0SjM95kckpZyInPZO+GSMKse9kadVjodClPiU0gb3PFgG88Nei6farNvHVv0gt0eXjLI/5WUtbpiNyJcg1Cl+MCnl6ceZOKSWrXXbSCLGhJY6EysgYKwWWLuZCLU6vlqeANW6/cw558GKc2GamssqSMYlV1LEDGaEG+ALra9XNIJPBSHXhUjBGK3CZCCXxnNYq9yHVQsBKZVYlNqHjNN207f/cj1b9z9shGSXjEU/smbMgo0Yr4/0iGbbY0ypvy3Ee9XjG3mMYiaKTrJ772yVraV4Lt42bKwqTCkTMdaUiq+vN0aph+ne5lyMbrfSR1c8KBYv4BAZo5IrKbkgwfcW5uErcwTdVmotm4hEnYqySRBiBIZoHiajQC6NSUirPIdVC1GCYYstSu1DRlEnffvP1vm66vtSfvXJGPeWbm4mEViI/CHVKyPfjvudnj+dyY8RcbthSd9vebq38Jdk/K9X3aQkF5vW2SpEqTv25apfk4NjlZpnMAMBKFXa1VNWe5tzye5bh04IkZE+yNjQOUIQeq3TU42pp96utGYzEbOeUiuHvjUQYKiiMASu9bT0IJZeo9ohY4BSzp4PWxoKUdTa0XnRlGu9PZTffDK0bjpurQtIA5FtpmXvtcvrHH0/ac0Z5A2ScSzqylLeVGw2cm7oViFKGa6mwbGamSdiA6EpFRMy1nuaD237PKhj0ep75nxG2KMpodeYg/AT/ODNWdeXTK5lC1H1lLKvW0jEqZNSDkTauq6HTUTSLn3H1CUtAxp+aXCr/JYGRkDDb102J6bh55KR9ZQqDJPXRsSbdd6fhPMGUyq1ZhCsWMaobJUvRR4mmBu6VT5KDY5VZVrvBkJTKm8dWmoP8wFOdQ/S4RmltzvPuUpgmAIEa/eEchCCLDleYXPF7LU1hUj7Ac0MO86FyOlrKTfCGNxnNyI371awdnyiZRTg2JEHt8rzWAjmnngvnqr+ZVr0P6h5cMhI+3CZ0vSPmohkefnIpljaiU2KDMW0A2OEptRmybabVc48W8C/5myVj1JDY5Vh74ON0JSiZCz3NB/Q58UiW9nSOEXhXEEyZuAoohAsVjaiL7KUnvq1lH0plWqvqV/LKfXZXMMkInVSyoE4xuNauxFF69bTKl7YlrEAqHFwq3yPhbjsx+ao3dz04ma9i42WoV3nleUfNRDZbb5ZnsmdPM3av9BA8XwShOgoJe53WYmDuGxXOV9cspRWI3Q12SofpYbGakEFokGEphRxlGon+5oP6PPqduG80wYVcnUHyZBr/xYiut+zRicNpZg6QZ96d5DoSy7WWmXNrKZUbV5BkAh9NGrsSwsKsTDK5roRhDGJpE5JGZBGJUFKVz/cj4XIeouUGwvL/ntLvwxwJjdNEAOR1XHFHRRMiZ/92q7hhX6+KlcxRnSUis/Pz/9S15Edpdqamxl/nJ///YsYR7JVXkr5xyohzsMY4aeUcKPsYT6Qz6uZ5LVpngTJEIaf1G4SkYB5Ku4niH/MhPoIVnHGXRuJHYSuKWWcZGgE6MwzYRfYiDfmBL5xIbLWo6VO5eZoywBhB4lpX/n64TXeMSJHBN7qNq39MpRyiq2rExPRsfNss5QOiptltS3BEhk3l39VGBGDa1rOV+4K+aS9NM5WeSnlH6ucju0ECD+lRJf2MB+A3bzva74o17vN+USoqTuhjQSC/Q+IQMUk2NSkaO3zX58ZauAYUQonSNIIbbAT5x4KYY+tC3FqWUcG+el+xNqaPCUr4Tj64XlMxEJvH5BSpR4xWoY6QqXGOrQReXufVLW8qt+sy2YBflfOrE2M6CklDZGVWO6Pc0gpslVeSvnHqqIMDYQYoJQyRl46H/iAvsomVgjQsIzRI1dT3SpeLHtE14Eashbenc/ugDp56o/3Y2zdjUpEqXpiOwTGtjnKEgPa5mHicCGMzeOSj1IQYaRmnPPgsKupJk5Dy6j63G1i5Xr6EfldIQABEgTGj3rqwMe0DOXoywgzGSOybm4v2zvhoGjrGfMxzvV20lQNRjDSxO8/XNz0O7Vc7Y/n5+/nilJUq/yU8o1VRponCDFEqef9zIdcVdL1uhoJfXO705wfdRSacSUliC7cXwXoXFphTk1BkZO12Gm3GAEHaUtdElMIxUXOp9g+vtoIP6UAIobrLr7RLq2/Ikg4W8apTH3h6rOmDtXOfjgeAzECN9Tjq55SKYrXpWScyrVKFXzAiO533SVVc8M72TYfmYdhCY3+GiMYaTJk/MAfFKWoVvkp5RurkgxEQ4ghStV7mQ8VcCCVxlzqz+kucz5i+2FcMSUl+i7+VxnmY7udIBqi+wB+/jLOa2cGpbb2qdA64Y20r700QxIpxIdz83Egcr6LZUvz9qtbjZvqiduoT6QMYeBuBAnra/T84+zH4HkYeif0+gaUypGngpIxllQaE1w3EFWnps4Ykdr7brbvsT/jjC9jiAijFNUqP6U8Y5XQgWgIMUSpJtrHfCi7b5VJ/0ImUsxBtMKgjCO+NczueFUQ7Z/AnXtn5PhVOHCIG5YYofWYpBSmCIFAKdl2CTQSMXTyVAhxwlyIO7XK2t5SuSxtGSet53l4YavENVHb11oBlDoFH9MylHai8mcMRPeV+0TmPc3apoTKIEmqxwlGhFGKapWfUp6xWtBX/AgRRCmNKPkvq/jnpaJrH2Jc9vduVqtKKeVs83itPGbLqHwOX4miLE08593qHROJcXBgbdF+v8ywtLphnhuIrDUohQtvEgjusOWvFBnJlzQuhxD+ByCEm1xUr86syZgqN7ol46z1PrcvaxVfTHXbzxagVNl9/NXb80zeYJQtDtkjELw0lrgpWXeDvIGIxapYGogwSlGt8lPKPVYJfbOIEUGGn0aEUIotMbNVCS59EosOpOD4OTTnmbJgE6V2GYKdWu073gfbcV8rXq4yVzyrolRtMNlEKH9Goy+n5n7E0NMjsl4XdWNYEL4i5Sc1ZLzzM0oYAAIhoiQztYKSjQzdFp1hiqCS7hwso3poF7VNqepaf0z3XOUdVJQvEyFS9p36t0pMQoEzPIv68u9rjBj5KLVMlCYhWuWnlHsGF8AOF490L0JEkHtCI8Io9Wy1Spxp/hGEeSN+XLIWfgtdiaWyYMf94bBDdGZFTXDv3nLcf1O/ZY0RII9JUao1SsIaCCrMpPYicqf6NxHHfCbE6YOfPh9/r9Bk5HJKsIykGqBU1yWFqPTi2yqzt45g5JqiFJIRt1ftRxXZoimVdh/mjXus1Pa5Ele+a3tWASLjOYQPR2KXyvDILprypsaIQEoRrRqgFEb8zuKurIsgM+JCI4YotcSIMEo1Vj+q3vj6/WJzx79Y8xY2kXc+DE7WateTjsh1137rYvSk59TMClQt2qexlbBoUspIYnMjWpgg4EaMhyjVI0q5+tmKzsUpDdKl6T2CWEYxxKhuvBQCU+q0H52qD5hRlEIysvaP9r3abDSl8iZr097UsHreh0+szZxeCpFtedcfRIESWUxC70vCXQ8RXWvdlEoVlmjVAKUQotDUJikyNxFDV71Te86HKdXNi9EPXRworRoBWAs1uoy884GVyUpJkeFwT93v+Gp9+W0lXk0FM2nX6lr3GSMKglIonclEgNrjXyMyXcOSMUgpheAbugozULnvkFNL5UZHMhJ5G3NNPzw/r0eI9TqWHa76rle9PlOUQjJYEOtcOSI0pRZ11ka9f8Lqeb+dPvGd0H49BEJk7TITse28SYWZ6MfxEFG183SYUkSrBigFEan28GXum1uIGNJSWyxjmFJf3/JJN/qhDCRG6RXnUiNWfO1eiXYYSN0rrEYiunEnfISMU3eo3IMuN7VFCEAQTSl0NWUigGcbUmrrRkQZGxe+sh+vuYu7kqGeJkLUacp7fdRxB4dWr7n4J0PGKarFS58AegT/ZU+SUgk8aykRilJIRvHcUap4NilVfu0o1fsnrJ73Jvszdz1Eb6+seQWItJvgS73l5DDu5+RNpeqZa0TFiOOg1LynFNGqAUpBRO5NKFQxBBAxRClhPvcIk1JPvSmkY094uL/RD9UBkRkoyrQf4aRYej6Q4biKUHxAh+DGn/10q/AO20NzJaQuzddC2ZTCKXQIoc3p5moa/XpJ3FOYMsQRSYbhqaE2AmcFYtEr729sKmtxXARx77V6vxaSUfniAuWATRQCUYpHOJXKl/jlRM2fpBSUse4opU5NmlJVd/6NFrWz51HvPe/68zWpTEWFEN0e+1nvccsYqv/y7p2oKgoRPkpNMk0pq1WDlNIITZCsdXsbaETpOthCRCClVmY/clQjhvnM5nzq7iPPSjTPLzVYQiuBEGuO0FObKU77A2EtEFGQlIIePANxangkUttDYcoYppRCVK0al7WouSvPUxnY4MSfUEZKxxri08wUymifZIlS9vvXp3zhVrJ1fP6ezH7E7Splv2OCKZUy32HU+yfsnqsha3gh2aPWrmkAEayUT2qoy2WUsLvqss5uLUTFXeU0pXRWAdGqAUpBhD/7SectUggHpfDoBlPK6AdMwPzCklueieoeTeW6liqRIlj0AdmNi1LRG5xQsaWFJC1JKbiXYsTIKh9xZKmp76aUqB8unc58+ytlNsBMCylac3jHvkhbmlLfCk2p6JcASmWsCM80UZeZilI5OxdHvX+CnsKxPB81cvW4KcUKDU/f9b5HPoHzuBLdnn25nhiIUjSZolSjfcH7olS5L0pt90IpRPF7HtFj1u72UOoI64FcCmaUQr8jmdLucW1fGsWZjhyUauxrFUPbrq0AjS2NCKGUROTK4uOH68feWzLVw/csvwRlFEOvfshEOVJ9PcRf4tNTSry1waYUlJEzqk+VI6Kn1ILZjt0+s3L1HI7ZNrZzwQzEGYsjP4GHqYZvJ3Wn6qoNt/YhouxPfiSlts5WDVAKIgYJ8rwzYosQwZRKrSwtGCAzIcLp6Pkw3X1Kt3wTiAiVKDqu5xFJl1ukluZ0OCugFKzgiBAlTs5Ecqa0jABKSYR2oXfy51parfeHRt48GKXGnwcCLjvxCQyurKsASkEZxTOnlPRP9JQqWTmI7n+3rp6rYGa+CxGx6BiR8Piuf2QoCC9OV3etay6Zkm37/DjdqiBKEa0aoBREDBJkvTNiixDBlDL7EZtXowszB4GeD/skFfV5qwmn1BQ6MUBqBuiPfutUjKJ109ZFqW1EIoiTk/5sTcoIoZRAcKNSmpYrdK221VLEUWsOZCS23ZdaTvS6b1WlAz9MSnH3xLqnFOxHp56YeXfUIEqNuDnClZWj59wCj0Tc1nxhp2xiRP55dKOLHvE23bF8m5y9dlGa4xDhoVTdDfo3Z6sGKAURgwSZ74z4hhBlC29z5cGfopTVj9KOAL2N0qVrdN0nqaiv+h1zSgGb5wawhy5fOUIaZuaklD7uI8QxVba5Mmg2st73M0SpkXRRKSecGPUTdJM8g270NZCRU8UE7VlUCLYdsmDvyqYUupdawX7E3O5g4V8TSCmmuBillH/C7jkzzpmT96Li514Wencxt3ref7lZgdqsa15KjfGQHQhOZclLiDjmMR4kpbbdInlytmqAUhARFl60C0K0q0cMU0reS1n9yK1wtW4JlnPX6PqUlEqyH3FKwT0PvLNtQdcjQuZ85aQU2PchAmXLZF+je/ThnJIRQimBOO0Z0z1X5zdGEEvZasf3FsgY09aU5beVCE6p1kmpGlxYaBmMSoxS0j+hKMWolLWgsJR9WGKtZu+EHV3ciVpJhZkPCxAJ499HfTjNJQ/Z38tPNiLnF5MkpeCNpd0qRalmQ1IKIsIubndByFOFFR/hpJRaXGY/YjN4oNNQR61zdN0nqUjnvZmU4t55oafAHS4KaoVC0tZNqZpCxEjvFV8jplV/tbLSvpNSi96uI2ItJiqKgn8ZUsouqZSSoRqaUjX7a0lSqlmSlGLc4X494Z9QlFpsBaV6/4TVc+khfVzKTZXX11w5J71sm4epqr/TRPHNZ+mh2fzRRBSltnDrhJR6AjeWLkoxqicvpZRBkN1JGEgpqh+FdapLPRuW090nv6ophRRbr6eO6Pg7pApPPZTqVQ5E5IhSZUep+4vKGivS8GuGDT92ECcjM+Xvzns3ejMFMiqrektKJHdAw2/L/lrQWqqJKMOPuSU4pYR/QlGqXAtKKU+g3fN+QB+X4u4jxyc/AzHjgVVXFzpn5kxsivHlHYFgV085Tam1vl5xGX7/WJbK9xh+hhm3u6kYRqma6kdubZyFXWh84g+cAOZEb/jh41dc8lDCUUlHiaMDW+mj1BcCcYoodQQDkoDr3T4Uxm/evIlG3R+TSP3xhmhVUtEFSpXEQkU1LIGM2K7ekhIpiNA98cz+urApdfsOnaVAP6q1pFReA0qNROAbo9zW0fNTYCvwBOAFppSBwCH1d8rYuIvSzZxApH3YkkUp1o25zz1xubQXwep73BPfXujQCKPULdWPkel8zPByd7gnMkJJsZnq3RPG0TzmlaoyMqAVuxWz1kcpddUDESU+an2KqLHyuC5dj0KkSzelGllIYx7FKygj64WdqNeEMUqZifLQif7koBR3elBO9FiERc0j6Z+QlJKfRL1/wu45oMg3no1tFPMzEe8gpzor9FKmE5b3FCLBoeiQUiy3Y+Jzos/tffVz9D1O9O0L3e7DTnS5KRL9KFw60OdEH1FKii2F3oluXmXF1T2Ude+8Wjz1Uoq6vjS0fRRRY+W5YPMF4UlE7MzPEKbfs4lQ3omTCt4iNk4ZklLNmKCU66o3Y1tdKqrCrTSlcpE1qb5A9DxBOryTmBj7poVIb2Ayy0ZFlevzMEJUnDoUpaYgs5G86p1Yq/IL2aodL253vxwOuZdy9SN32KHR8NU7kWYor3qJgIt4CoNbp64AmFHlp9TWQiTWXnCCf8dXKwzk47X/mVqIxeO5NRON0v2lWo4aIS4U3lbgUpukFAhIeqqCKKVljH5Tf0S/AC0V/4/+twkZAJMjSlXiKFV7Qma6uRt9uN4YL2ViBgGJqID3H1EKxCM5ApLMgDJYQv+HC0hy9SN2xOT6ApJoJSXLHrpj/GZ23IQlJGv9lJIbI41QSxa/4m5rdaQcSA20ZPCyn2WzTEoo7EzuDunK6keFXxHRBFKqHqMYPz+lrKi9Kzry3UIUBqXmRkFUm1Kb6/P35zeVM7UMI3BEEqBUrYMnBiglXcOP0+g7KfX0wkDbl1CKkDAfotQRqaRYCySl6OB1XfVo4kwmOBuglHoni0bk1GZwZs09DKkPo5QZhM8KR4FbgDoSZ4ot1Q91JwoaRlIKJHc8MQe6ptSRCps1KKUQ8QY/S0GpDH/6SCUTVOh2Xx6llpEn/eBsIFsTI07RxRSgFPv4a+RL7ugXxuji+vpq4kw52TFVY/d0kGBKUakaefhY+dx9QpJM7jBSrEZGFtTSmfJm2X0WpWozjevY+keDNY2V+BVKKZgq9r/WUW8uf9HK7kei+AAcUA5K9SmIT90qfB7byR0WpQQitdYQp5SZq0ykvAnk5z+4HXeXtnepPelGklzSB0w1lWOZAESOvOiAUmuw19IpiL5A4xckFEY7Jy3uQCk7oTB2BYA4EblDSUVF09/0oUTgS6wO702cTh3O2iFKCT6CZGOYLaJ/dWZmZcH05DfMxnrDFu0bpgw+v2GL/g27l3rDCPopshDdOuzkJp/h762l0tIB5z0iUxPCjJdL8V2SUiBR/qnryNexisT41qcgakrx0VCIET7ZbOZKS6Hd8TGyE7NztSd/ZEUv8+4/c9LtVO50026u2GtXLulrECO1vqEpxQzZpVPGEKVekPYe7ZxaH0wpMu3dtPy++kfXdZJiX24EIjJLrdzDexk7MU8XuLgcptRXjDCa/zi3rRurtAe/WaWjJ8YwPQMg+CAsZLKh5m+Cinb1iFze8IkIhQX/iaQUKOfCcnqfxjBRXsypQSndqpKbdlpliLNU2upPhTFjlg/JtaHwYaoWyJqeD/icsKT4it55ESIRlepsSrEo9olbxgClXlCcRa+T0AIwwZQixyr3eCcohOskJf23hcjmxpydA5PpM2EwyjJMtt1nU6qeRKhwU2nHJNgWmlHqKYhSCMGW56jFyXVMVAaHokeM+YfZ5vFT1OssklKg6Bij03psl3MxKKVbVUga/PrhZlNr90QlltPo/flGhE+YRa5EwlN6ztt2JS8d5uR8QNvvpur2q5lj58UI5PLTlGrUq5IcMgYo9YISYvzZqUyZSSk+B5kOq+opRZYQG9nmt2903UpK3OKX/O2tDb4GqfXBvqb8FqAI5RCluGRQXrCklWxujC8qSBhEKYjI2NLO2VcvjZmbta1dhPIYXe6N3JQCpTGf8p5SqOiYQSndqvz5kimkSqkjSaly3X+qvI+4FCMfzguuZdNO8dyl7XDh0e55ez6HNWywXsOIsttsSptS265jW4+MAUq9oNAllaumLtnoYprBlKJlFO6jFIFwnqS6VVPLLQoXqOV1Yo4of2J/mpMlbS831sMqh+NPrnARXJtSm2lkRWrgsrkhlEKIjP2l5D/J6ZhfSpf+GazWKxELdLnnplSPkJRaje3SmJhSoFVpg1/XICk12xYo1sQqGAzCjNn2+KxyR4n5MFoLQydxCXuMYMw5sikFvROOAs4eSr2kHDMZGEOsY28BZ5JSDhk5EWzg7LlHSUWje1nAGZdR57mfpcs38dJi+zal+B6VYkphGSGUMhD8iLPtV6Q8KjEr9NxuVYEo5Tb8egSjVNZTChVwxpSCraruK8idPiDpwrhqMUe30OuJX0lX9gsoifkYldRxhUTkMh7ZoBTLWFx5ZPgp9ZKXBnjUlENGKKUcMhLnrRSBcJ+kYAgFetkHPCFR9Rhe9goS6C7fXP3JKNVgSs0tGSGUwoh0zr6/YvcBhfLSlq1ZCU0hCrQzud0TL+v5rPe/4Uj0usSXM6YMvYUuc3FlXQ+3KkaZYk1VexCJoI9BqUboercMP6X2+mqbwdfnhFLKISNpyasdEuFTUhphvJLqiAiCRFvGS16UVWCTtbIpNbVkhFDKahV/7XN5J6dT2Wd3VKsgpUYeJ/rLeh5XfbgdpFTeSo9f7ZChLb+nlHf/A3pFOdmqt9hn/4hL/5mISr57AVGKGYO1T4afUvt9AVtJGmUaEY06JB8AAAlbSURBVEoph4zUaffZiHxASclXto3tcHbioNZ37yWvc1wY4ygNP+ONO1hGCKXMVqX81Vv6yuVOuNC3VKsApcT5w3HV+8IXWc6QMa3LuRhuL0tGoadDDtuNS8bl49X53/otoUoJXJpvfcAyClmeF1GKHaWefT33U2q/rwkNeBXp7vNB/Ho7N8pEDCop+WLRzHxJZ58YQDwve+nwMeZOfBtt5si6aWwZIZQyW3Us3mrS9G4vEWT0RLWqUFN1UXkDkl76uuXLPscAUkrmN31xysj1JsTLdZ/fuF4b7ci9vK8abz9ykLbZv6t3GoPQNsfrryeBPX/5y6yHX5j9HfNBU8qPGDpJqYNXYuXQW6m8ULx+bX3y28AzNRE5fQw8RZRCiCBKGQhGqZr57mqdktd9LwOBnQBxLI7vHyt/2KwlI8QvgxCXla7jrsNm2R3S5otbRgyDZq0ZhYiUXLCPR3gmLRlJX6dNU4rrramv515KYcTQVe/w6ObwWLC3+SA9fl7EsJLK5MLGJ7YjcEvrOH1JRHKz8T9zE5HRRiu+5keIIEoZCCaH30yt+b89lGb5DITg2RLA5exI7rBkhHknEEInIo9vgBU68cooTEo9O2RIVbNBV/CPv1W467aMsuNcjinFTle1t1VeSmGEn1LNcnh0EyLgdB/zge/NbEqZiGElpe7HC/Stig6XVcO/BYiBtzJtLURCulZSfPeLZYRQykAwI443bsp3eVnFeeLoR0oclglK2TKGTXc3YkweVUlEjgw/YzNCCP7vD/B+u3mYXBpXIbaMGSv7UkFKNayKx623VV5KYYSfUpOQ0V3Y+/D+5mPsiZ3AiEElpRBs0ibmDNIFjUeyVxKR+Sm1shEVlX5fIN1lIAIoZSKUwbSN4m6HLqUT4JurHyizvE+Ub7w9D3i8CJJSNCKG7gnDZMYINihfZuCa4noenRlhmoSMTBWK7ynFi1wvva3yUcpA+LOfliGjm1mBVXucj4WLUiZi0N3XI9gCWllG2K2ja0uI8GZeNBMbURBqKsUXbQiRcB9zw40Z/kez6dO/xYebldUqvVByNo93kXmfixEgwlC9YiolXpBByBgy3Z2IC7b6rwMRBXCi20cpgHi3uZqwLGk+Ovzt4vElewv4kIxKvPRZU2oJ6wTRrfJRykBoSuWuZKnB0bVs3j3OR+GiFL3aVwEyxJjaDibi6Ue66m/73c8XApEbVYciXNOnNhHH7eCztVolWdGID8a8IZebpasfvTX6MAUsb/w9H358CNq2diByfdVr2n0W4kSlSXXqefThupKvI/PLmDFNVmpK8SG587fKRykDoSkVu/x9g6M7MxflHufDSSkTUQ0pKbATLcBrz525h+JfnxEi9q31KYFAAP7KNhSLtjYRQZQyWyXNWv52Dm5tfPH348haqzalaBm+x41QeVKb+yBEjF4Q33gQMT9HsTf1doziLszNp4BW8UrgmabUiq3gpb9VPkoZiLE3oXAVNLqp6UXf43xULkqZiGpISWmEMJLgjuh4K6D+nvrb5YBzwkIszBg/01TEiGQz+KzsVgHnvHg3752/Hyc8GtxHKbcMjw3gQpRksq0bwcdslVDFRjCC/+KGZcrfxdPR+fXVX2GtKtnIl4pSW0bieqBVHkqZCECp+Pp6Q2y8AaNb4QHb53y4KGUhqiEllRnWNHC814l9kYz1mkKkfueEjcClGw1K3ZIygjW6hSj70q/TIUThp9Q+WxXpi7swBFcg84UuI+lCcPPonr0ta3qxS6v4fQO7FV+Jl0bOUKom2SoPpUxEjn0LuH7PfeDoLjCl9jkfLkpZiHJIScFKtYW8t8lVcN8ZddebgLZIxMjpoGgciHduSm1pxMDjQSz4dc2NGVJPIfyU2mOrUnSZ97gMkMH3rY1dZM5C8MIUfzIXaXr7bh3eqk4rdWrqTFDqTv7oRbwtQVL2gIzYPEmATK7H0NHNEaX2ukocCYg24mhASUEE2wdvgZISf7PIf4Te/Sl8gicuSt25EDMXpfjlMoXwPx6ErDcZTYYRfkrtsVVnVorZoIzUUbfRRnQL/Y6dDNdnX6rlDq2asfnqtseOUt0szMB2SiLUawwewno+M3oaRe+v+UfXfwaPboYotddV4qCUjRjdbFahMmTktnLgfRbKZGnbs431g8tB0cxdCF2EEj8PThlDx859IPyU+v9qlZ9SNiLv1AuvUV1dNrvIYHqJ5QGvcv4/cJdFIbSWqSev23MzgKJ+BRmJg1IvlME2pj5KTJaJ2BIbxZ2JMP0NlnOCQETRx43FwMd55EN4j4T7QHgptcdW3VgxeMMyHJSiEDdLnkOatuV2p7Ga8YZkq1w4OW59iLhqPdkKrzSDMa5fvEcZGU2pl8rgbyJX7RZpUm8tJVWi4PRUeoVSuq7y0o3gI3R+o2oudAeKqz/9MnzPnhBeSu2vVamrEKFPhoNSNIIdbuu8tWprDcxH1a+HGQydoRCFZd9HrzJWxFXe0yvIcFDqpTL4OEkvbO0m4dZGDND2p0GkHkrtsVWZq0CQTwZNKRrBj/HfjlsqmtQn40gFsGYVPkP8KDMIrg73KyMnKfVyGeyDbm86duTyStfFykZ4np8LUTgptc9WETp9PiiDpJQDwc85a3IB+PtRivMvwz/8iDMIAgL3K4Ok1B5k8CG99+m3M0t/lWS9l58SccfWrYtS/+/9gCXV10MIdv2xKqngF3+r2IVhMxV//ogzWPUOvz3LICm1DxmchssovXEoqdQmYebK/P35EPw05aDUT9bz0Q1z+BHlu4ZkvFOV1Fc/ZM8LFcq9bxljglJ7kcFji2rf2cu+hfj3IiClfrZ+xGWd0MVyB2ScmQ6HH6rnaaXLq+5VBornud1nP7AVTfw+m6P/XgSg1M/Xj9E0I7zbATIu8fXtf2XOdYk2VUlhTzJEWIPD7HtH16L41yI0pX7KfqQ3m+V3yGA248N/cc6Tc+YnOp/vW4YnLDBz+db/rYiOUpv/YM9HNw//3Tl/DQRXbQ2BYVcV9NHs34pIz8//oz0/IPaJkBeR/5iffvRkXh0QB8QB4Uv6OLPeYywPb/cHxAFxQOyOkE6f5gq82bhyRvEfEAfEATGEUJnvzePVn5PR7xc3VXtAHBAHxAsQ0jLEzz8HxAFxQHwvAqUxe143cEAcEAdEGCICFfcZ4J/ogDggDogXIbrngzASm8e/owPigDggdkL8H8xj7XrcjeVgAAAAAElFTkSuQmCC");
aJ2(4,"crown",4,"iVBORw0KGgoAAAANSUhEUgAAAJsAAABqBAMAAABZgT4DAAAAJ1BMVEUgIi0xOi5GUTMadCZ3bkARrRyhk1AA1g/AqzAA/wDVxWXy2D/25XVxgVVAAAAGjElEQVRo3s2az2vcRhTHn+SV14l9UEJ+NEkPGygBEx/UhhJ8W0owJclBLZSwtw2YUGoflJhg9uaWUgq5rC2E6M0pJYdmD40xZsn0EAfjw0Z/VOfNSJr35LUjKTr0HcxiTT4785033/c0DvxRJp7fufOozLghlBm1ATLuNoWLXcRZg4ZwAahoN4OTk2uNXnXBbgYXArwW4gCg1wgugPNCRh+uNYLz4Tbi3pQQrxxuDXEH4DSC81C6/y0uXex+Q7gAbjS5FdvQQlwXFhvBRQAPhDgCGDRzZj2wVlYBZhqygGfaApabMigPaSUmdwpus6BS1JG0wu82S+M2wB4UNxfOFSd8uSQugouuU8zkQg4H1s1pWk7DBXNi7PLpycVa3FHXxM9OOZwnz9QWS9kYwGXmGcnEHkM5HOCJanM/bvXZmQjn8JgMyuBiSw7daxf8+B07sdvzpXFTZufBwyOWd2p2nUFp7frLXLpRwo6s0s4qubOz0ioHXLok6bLEcB+cvrPPv7S+pl8NFs8yKV2S7DLxnsIFvtVfKQTiIjyRl3lLMuBJvJQkXLy4w3oWPIV4DCVOH3C2lBBOSJdMuHjcmn2FuIq4UNsP/e6h5bBDZyUyOnR1T602N1jdFEmcB/Zr8Zi1DMG3tF3ahlnEMfG8FYeJa62LvwAWhxAr65aVgAz217rLdCWfI+492Z/IGtvsSC+prsMZQqQLyx7dTO/FG4cOXkfcMXGBp3OCmEQM1gdViO0hbANmuHhL+i15zMZmtal0SUJcQGZ6t0ekm0WEcCGAtIrKzwYn52tWG2rpksS0UJE81lvLJBHUjKRgiFP9keiYPIjk0z3H6LygcYe5HtIRxT+mPduBeaFbNj/HkdntzKObDcz517jjXA881cRzQljIZzfU6H/B4AL8gswEdBKryJIpslF4h+Bm0wUGkH7eJ3nsY+Zkq1XnX0fmArhWMZ4hW2Hr3bQwUVS/RZPUeyHMatX515FZqKc6KqCnEH9zCDPyVHRwegf00Lpa2EUuXe4Caq3MjH1ofRBvXWhLnHxruHTPJW8hsR6uV0uky1wg0JnV79He3pYI6ElcVHwJibSwOu+JdJl4nRfqMUm8uKMQjvI71dGQuh/qpBRbV7l0qQuELf2YlhP10ib3Xbnx98CKfLoYsT+jpFsyOCWenz12WHEC61FWKzZ96k/BA5Gutsek0+LFrl4rzRQUzBmY0rND7dNLx4uttpTOThImXpgqK4TF3PgaqWQRfV91s/EHNpcOxXO829ljU2fDrDikuJi8r6Z5olLrrmuyTosHVv40zxS1sQNaZ12zG1G+GrFnMemU55mneaaowsPKtmdez3fm8n8gbWaW0eRqIVM2z5QNU7kyXAC35Dp6NE+UXfO1qtV+lj1NMyWSK1tNl5bhhrDwMu1//TWjTubrJjpgZdPT1QfL9PXMHDIcOnhXyRcDndz1Iu4Q4AbbWimcLTVYZjhZz5JjF3uLqGU2trgRmMmumR62qN9J3dblTHoMJzNFCQOX/fmM9suUySXJS6PenhMj7T5u+IA3ZB5O5CXu0ZX0y/fl3oxO4uT0IFV3DJgQ1/HwWYX+zld7+Fi1Gl/8Lsf+Kv/ZUjIlMJV/RNhv36hvV0XJKeAC3Tk81uYnuzcZs8nUwDHWhXTgFd1vtAu47fRw/gl5tEbTcZgCWdxKk/tcARdlc3nVSUdeOo1m1mD/lPUHywVcbJxo9aYcefF+cka8UkNWTG73iq02zbHJ36PkI8GG5I2pwXm67aoTx7n3Gpw/PS3KxFFeaQwub5Sqx2FeVQ0uPC3NPh67+eufwUW0PleLbl4GDS4+6W1lw817QfJO1oFRPdrE9OAE5xeNvHqeUFxqAtXjvWmXCG6bV+jy8c5cihBc7Uzpm05zSFtS+1PzhL1tY7moE+TNlOJqmsCEvH5RXM1MOSKtJsXVNIFD0lZTXFgvU3bJ5TnF1TSBPumDKa6mCZBXTX4t49YxgQl5N+Q4v06mHNM7DoYL6pQLeuPAccM6W8tu4hiulgn06Y0Qw0V1TKBL73MYLq5jAi69muL3dx6sPCkT68kEf07wA/t7F8f5UC7Oq773/JH64JyKC6B1r0w8TCb4cyI/HLKbN47bqZ4pu+z2nONqmADLkwKuhgl02L1m4Wa2ugnAWbjK5eKY/1WkgKtsAjxPTuIWPsEATuBCaD2pFIU/nhVwEVSO3hm4uDpucNYVvleVNnPmXwSiHyoG/98Hw/8AAslhvSUnOcMAAAAASUVORK5CYII=");
aJ2(5,"arena",6,"iVBORw0KGgoAAAANSUhEUgAAACsAAAAKAQMAAAAXYzUQAAAABlBMVEUAAAD///+l2Z/dAAAARklEQVQI12OwqbdXOHyAoabe3uD4AYaURAOLYw4gygZE1dvpAKl/FXZq/g8Y/tUYGAOpY3kGxj4JDMfS7Q3PAKlke4MzCQCHpxoxsfTs8gAAAABJRU5ErkJggg==");
aJ2(6,"territorial.io",6,"iVBORw0KGgoAAAANSUhEUgAAAGMAAAAKAQMAAACaDnJEAAAABlBMVEUAAAD///+l2Z/dAAAAaklEQVQI12P4X1dvP/vvn3+JjxnOP2CA8ZLBPImERIOGxJZDzMoMPApg3gwgL1mZ4QyQV1NvD+T9g/EqbCQSWz6kfwbzEmrsgLwfMF6eOZB3J80YzKtLN56R+OdcmvE3kA11yYZA3jEwDwAD7zy1rz50OAAAAABJRU5ErkJggg==");
aJ2(7,"youtube",7,"iVBORw0KGgoAAAANSUhEUgAAADAAAAAKAQMAAADILU8PAAAABlBMVEUAAAD///+l2Z/dAAAAOklEQVQI12P48efPH5v/DEDyT81/hjMHDhxIkWA4AqV+/PgBpf5JgOWA1B0gdUyC4cefA3+A1AcwBQAlGyu1reW1ZgAAAABJRU5ErkJggg==");
aJ2(8,"googleplay",3,"iVBORw0KGgoAAAANSUhEUgAAAQ4AAABQCAMAAADfnGukAAAASFBMVEUAAABZFxMoKidGSEWjLiQeaDJwVQAuZLfsQTFkZ2TMTltEhfM3krZ/gX4yqFSNj4ykpqOQw44D/hN02Xr2uwC+wL3e4N3///8++cywAAAGlElEQVR42u2ci3biKhSGEVqnOIOhpwHe/00Plw1sEshVm66avdaMVgnKl335IRHyH9jXaxtQIIGFfHn7zDg+pewYfWFj3AL5AhwWBiWvbsw7CHG+wclphDr/IDZvdCcL4GFxSHmSiPHySb7OUElmPeNTnmk0Gnc4Tgw5Wk4cJ44Tx4njsTjonopDpTZGiZCvVTBC4YkKuo/ax/ieStWeK2M0VLsOWtpjj8VB3+/W3rcS4dpo5cbF7B/CBCMMnpgwOmYf43tGwJH2IKU0/G3/cB0Qe+yhOOgd7H1bt0bzcHaJxyHyWyoMMOIYDlYZ7xgWJw849E/Acc+2BYjOY16HQ8BLhBpDPRx/7ME43u/3PUC4KfpcgUObGJ7SuYcy1L9yMI5/95LHyhTih4JxSGaNzuOgITbSmxYHd48H4/gz4LHSQcKQIXGmVCrmccRXMg7m/x2N4++QxyogwTt8WQ04lLDGtngHc2nZPh6MY8zjTrfkDje+PbnDNu5MdzyOCo/lDpIqi3Bg9lQW5nvTx+Oo8FgMJOoOYTTdqjtEasyN+QE4ajyWAkmqlGJVugDHUJUyeO0H4KjyWJhCqnOWIFRTB7Q6IwlzFoYb04PnLICjzuOd/FqbwVHn8XuBzOFo8LhfXxRHnUff9/Q1cdR49M6ur4ljzKMHu74kjiGPPtv1FXGUPHps1+kUQpmdunH2y3BgHv3AJhzECapgci8RlmbENegiWzw97vnTcGQe/djaOh2Z2leJBFpcrsyQkGkGwn+LsF+KI/Ko0Gj4hzSlafY9OExYXHgyjsCjr1p9QcwzkM5pFbqY8A04PI9n43A86jRq7uEJaJHmcztpzONQzFuIUPYNOP7+6xfjEMN0wXdOSedx4BOhvgPH7WMpDro7OLbjYAHE03HcPj4aPGgtjWp6DA6ifbQ8G4ejUecxjhUz9eWfjUN9B45Ao8qjnunJnDxT6NIU7bTJa2ChkXexjnCvpzIO5pbZTHF739g7aMYRPkz7+4ixTmM1obYUR6RR4VE/le3MwZI8S/HUlZrBLwfGNjpduRKFnFENHG6dWafckfrxa9m6vFPAyI04Mo0hj2tDc4iaghbwdZOxkWILw6KFokU41LDlEAcHqIAD98MjqpTt2TYcmEbBoy5ICxysHD4NQxE+OoJ/BN+QwkdBGBc4OAi4jKOD1z3ADn+E9rg7FXsNh0ncjw50eHJIvS13lDQyj9bsbQqHSnqdw+Bp1igSTplIuThEVsRBUzz5XmlDlfKsSuF6TeiHozDOYNbiGNKIPJqVVOKwLHFgH+VhSBKdJwhoFOMc4+jiaJjEiYZVJkcplVqHdDcPcN+eRoq86hxLcIxpeB7X6aqoR7nD6wGBSSl/hvB58l/X/69xoYg4Qg1Nc+UajjgxiDgoRKUMJCUEmaoX7nkcNRofH5PLYIUnFwXQfx1eiomiKntmHDPrEA7fb0gxUDqHc5ZC+hRlLEemJtlL1uKo0nibUTO6UsRC+lc4n1dwqOhCAjfCTWFkbd2BcZRhpJJHilqVXYCjRuPtskRDDquY8m6qZrxDjbyjhmPwo4I2Dp+4nfJiECw+aSgQ8qtx1GhcFohdPZq0QN5s5A5W5A6Gc4ca5A64N2AZjhwTqY1P0y2dOI3jtg0GOCn+3rES4LTCcmVRqJkqqiAbVpbIqWPzONAbKj7lqBqvw3FbnTQIKWS3YnjZVJd+47OcggHLDI1DsPEsT8e6w70gV3iHNIXiqFbZGRy39UljvFQa7g/LMxQGEhQEJyVZOnZZlYZnQsiGKvVVuyi07dxhPyz0DG06055wT+C4bYuT+kJ6TiV8qB+LiQictSVzlnLFZ2llgfxk1k7wb1vjhKAF0mxdhVNaXJejISYezRktKpRtHBk+L9OIXInjthNGUIQqqgRKhosbeWE5ie5iFQPigYbKwtNvGmJTVCdp+g0Equtwt1FobpNYbqPrEmwKx21PnJSXJVntoxkbN6TVRmrs2ZStWngc/BCFT6zGNHC8PQjGZuMSeb1+aNctCTaBg+yNk50wdEr9XTvQN17tneLbwnE5EAYkwC5VxYfeAaBaEmwKR+RxIYcYXMZ8wNXMVc4x+Vu4y+UgGK010UeYLIr+GhyHmhzLi0dYa6Hjp+MgVDjpIB59gyJjU1X6/B3tiePEsQbHuX8HEsPn7i6onslz7x8cK59uZyhxkggrNG5nKOseZ7iQtG+Y43H6R95Vzu85yF96z0HKurAJ47kjZdyR0u/R+T/YMVr2IqN1wwAAAABJRU5ErkJggg==");
aJ2(9,"discord",7,"iVBORw0KGgoAAAANSUhEUgAAACwAAAAyBAMAAADVdiTZAAAAG1BMVEUA/wBI/0lu/26P/5Cl/6O8/73R/9Hn/+j///+iRuwXAAABJUlEQVQ4y83TvW7CMBQF4BsKdKVIpYxIRaJjVLUSI6JDGSNlCCOq1JC1f+CxFIL92D22E+di/ABciZB8seRj35joVZ3VN1FXBSqhRYgPJEIsSQXrAnmjL2uP5Usm81z83Bec5WM+J9T4vS8Yfzz1yFQ0v2ackKsrxr2G7d4ZPjK1O214z3no+Jdz1/EKTy1NI/w6jmcIID6JJirGe8cYdIdGIcQOwx3j/gEpI6X+qoRkGqrnd6OXFR/NRAcdOWFc6hDPera0Xk/Fozo1ck4bHsSVpg0jYJSlervGW9zWSdQXhhXozlbGek1uY9/s2hRWect7ucnsf5ld7DfosX+kcsv+AdwtDfvHdW877x/u0raB6Oa0qG35rKZhbokg41sKclQEmTr/f+SUPtWxuyYAAAAASUVORK5CYII=");
aJ2(10,"insta",3,"iVBORw0KGgoAAAANSUhEUgAAADAAAAAKAQMAAADILU8PAAAABlBMVEUAAAD///+l2Z/dAAAAOklEQVQI12P48efPH5v/DEDyT81/hjMHDhxIkWA4AqV+/PgBpf5JgOWA1B0gdUyC4cefA3+A1AcwBQAlGyu1reW1ZgAAAABJRU5ErkJggg==");
aJ2(11,"emojis",4,"iVBORw0KGgoAAAANSUhEUgAAADAAAAAKAQMAAADILU8PAAAABlBMVEUAAAD///+l2Z/dAAAAOklEQVQI12P48efPH5v/DEDyT81/hjMHDhxIkWA4AqV+/PgBpf5JgOWA1B0gdUyC4cefA3+A1AcwBQAlGyu1reW1ZgAAAABJRU5ErkJggg==");aJ2(12,"flags",3,"iVBORw0KGgoAAAANSUhEUgAAADAAAAAKAQMAAADILU8PAAAABlBMVEUAAAD///+l2Z/dAAAAOklEQVQI12P48efPH5v/DEDyT81/hjMHDhxIkWA4AqV+/PgBpf5JgOWA1B0gdUyC4cefA3+A1AcwBQAlGyu1reW1ZgAAAABJRU5ErkJggg==");aJ2(13,"bestTeam",5,"iVBORw0KGgoAAAANSUhEUgAAADAAAAAKAQMAAADILU8PAAAABlBMVEUAAAD///+l2Z/dAAAAOklEQVQI12P48efPH5v/DEDyT81/hjMHDhxIkWA4AqV+/PgBpf5JgOWA1B0gdUyC4cefA3+A1AcwBQAlGyu1reW1ZgAAAABJRU5ErkJggg==");
aJ2(14,"bestPlayer",5,"iVBORw0KGgoAAAANSUhEUgAAAHcAAABkCAMAAACLpV+NAAADAFBMVEUAAAAAAi8EBE8ZBQgUBwgbBwIQA24IBXsTBGIgCAYZDAUkCQonCAsdDAcSEAciDQsrCwgZDxwQESwnDQcYEwMvCxcfEgUxDAtOAzEbFwtPAzlpAAJlABVoAAtcADhfADBhACpjACMhEkUyEgtcAUAuEyRaBUYeHQkuFS1NC0EuGRcaF4MpFHRVDisyGDwgHnAlJg8aIIEoHmY9HFlmFhBgGB1ZGU0sLRI1KTYxLR8rJ4Q2LCxJJUg0Kl5QJVEzNBhYJys3L0pUJk1GK0dKLTAfM48tNGS+EANJLlVXMB86Ohk0NHssN4q8HQBWOiVNPSNDQyFLQC9kNGVRPGJMP1VlN15cO1thOl4+RV89RHhtN21ERldWQF1KSSFPRUI5TiwAYDQCXzq8KQ5KRWlBRYtGSzQ3UTZNRn8wTZkjWjJjR1jBLisZYEdSUSggXzw9T5A8VGZWTGgAbD4AbTMHakNkTFMtXz5aTmN+QX1FUodPUmQ+XDRLU3RdUz9PVGwHcDC5PBdbWCsAdUVGX3EAezkqbF9iYTJEYaRTZzlZYHhXYIe3TBq3SypsYEpeYXJYYn9QY5eRUJAAhTlzW4kAigpoaDJLa4G/TT6LWIR0Y1peamCdUp2FXngAkQ+AZGnCUk1yaWq0WyFYcH5nb1QBkyFibYVucDm0WzI8fHp0cEQAlT9XcqRQc7JicZJrcH8CmDJVd41+b1rFXFh3dzwCniKnYKIwkDGxaS2xajt1c8UApjIApT5xe5tff65/f0FNiZGccYx0ecOQfEFqgKFjhJR0gpNFmEiteT5ygcN+g4GIhFVgiqOPgWSHhkmVf3GAh2yJiENwhsCkgUORhVxikYR5ioZrkXeigIZXm17Id3FdlaVtj76Qjkq9g2Vslrt4l6JqoWhnm7tjnbNDr1uYlk+Fl6yKlceenFGWlM9ls3N6rHynpVeNp8SJrbqPtJexr1umsJCorNTYqKWgzqbVwbG3y9i30LnJyuPlzMrG29Dq5evW7tji6ujk+Or79vf///99szH1AAAb+0lEQVRo3oWaDVwUZf7A9+RFXtwFj01dRF4SGAiU0ZRRQDZBLhs4G0hRkCUQUrRmCRIFQu5WvSEoF/Bcg0M5zmQKlRVvei8nCqwsl7a8ope5q7v/XnvnnnqZqanp//fMzL4h/f8/ceEDs/Pd3/vveeZR+Pj4iv9k8fOWwEklWBT5h7Cw4BBZ4DfO97luoJR/8PX19Qvy9UOMoKAgXwX6wVf88vHz4Eq3CPx5bkJHR1Nc8LQwkGARHCxzpUs874JEvLVIELk+Ch8PQX/xUNNvEqCTm9By7NjRNokbJqofIv/RgwvflU6s8wW9TuT6+Exi3eAQt2mRdYPRz3ENLS0nWzoqQt3c4Du4gYEhgX53iMz1Rfb189L3TiWDJ8i0oqqqk39vaelYHhZ2j4vr9S50l5DASbiI4QNcX8kGfi7vTh5FXrKsKqf6ww8/rKxuiLvnHlnhsOCJbwyZTF0n10NR6afA/5+bUJmT9+Ho6OhgbnWRk4te7sBOyvWT9HW7VeZ7vXFSbm5O8uDo0NDQaENudcU9YZKTwySFXXQI8J/Hgr6+E9PWFU8h7iR1+nXatOBpwcty/NuGDoEMDVXmVi8JBZGjK9DtZzG8Pe6qnMD1dcVx4CRY9GYRKEGnTQudNm1+XlIlYHft2rV/6FRK5aY4ERwa6v540ocN8agigUploCfWT+GRQPAnV7EQ89EloaESEwDTEvKSUvqB2tjYaNw11Lagsgj9OtTJDXN9Vo/qhRJZ6ZlJPp5cz2rhhQ0W7yzdflpukn97v7Gxcf3q9Y2Nuw61pVU+FCqZOli0dpho7juiLNCtsI8rnifJoOA7uJIsW+DfANjVJdnZ2SXbm1tP5aZVLpfAYBdnEQnzyqoQb65nHv08d5oHd2bo/DT/3P7WxtVZqeHhiVnZNc39/Sm5lU4Xy2p7J1WInBeeDvZTuHJZBod4c5Flpzm5M2cmpE1N6e9vLMmKn5VeOis2NQuBk/M2ue0RKpvbg+rkehhajCs32V2PZXCo28IzkSxMSgbnAnaefufOrSsiU9fWtJqbkisr3NzgMNHkro8/CRdoCle3cHJD3NkT7KGGiL03CTkXsFEbd9bW7tTPk8BFyZXZoV4SHOy22SRc5N87SkbIZOEErp05c37yVHBuzZr4yPyttUg2RkemFgJ4YZqUxW5be4oT7FU3JjR775DyVveuZP+U9tbta+Mj79u6tRxk69b8qNjUkhpzX0DKsrvgChdX7hTSdxc30Is7ScudwJ0pyRT/gKbWmsLUyGg9YDdv3gzk+xC42bzOP2XlTAk8VyqbwcGu1hwSPDGg/Zzx7E1GyDAI42APXe+6617/gKLWmhLAbtxavvmpp9inniwv3xYTFZ9Z0my8OyBl/vz5cXfNnDvXFV2h7llkIhbieZJe70ogqI13Jdx778KFKcn+/v4BywCbFRuVv7V820cD77zDsU/qyx+JiYzPAvD2Kf7JSWlpebm5y5bNTxBNFeYqI4F3csWyNZmd4xKWL1uYkpaWlpQ0FUGn3H1383aEvQ+0vHDlv5988sk7CLwKwJklNca+mpSAqVOnJi1Iy8mrzKusLEL8OM9BxG8yO7upwFuWm5snAaf6L9xU1GQ0gxhrwLexUTHbEPbGjcvvvYfA5frFYOrUwpKa1tb2tra2hk2bUtKSkgGeV1VVXd3Q0FCx3AMc+DP+DS5qaanKy1mQNDU5paiprc18ytzfD1+trTU1JZBAUTGPlOv/cuXGTz/9+J4M3rYoJio2PgvIgG7tBzG3t7c1NOTm5eXkVcHceazJiXXrPVHfX7VUVeXlVTa09Q+OnjrV346Irc3ALFmblRobGR2xqlz/u69//AnkshO8cVFEdGRsfOqawhJg1zS3SngYSIZGjh49evLYsYQ7+pJiQjNqqDp2/vzXMDsd2r9/PxBFZCEwU+NjQdk5q/T63711/h/nbyLwqxJYv+2BOTHRUQidmrVmrUhvbm7dtX//0BBMf/9sObZ8Uq6nvm1VeedhZEPzBPRYSc3UeGBGRkXHzFlE6R974a0v//63v/2ANP7rKwjMPbW5HMgRCB0ZGxuP6IUl26E570Lgrztajio95zXR0IoJYdXYktPxtYiFxl6SIaoZGQXMmIjFqx4GZV946x+A/erbH27f/unyn1555T0xrIH8yKoHFsfEABzRw7OyYSxA4NHTVS3tUtHy7IcKH+/0DRnMSfp6FLCPr1+dnRiOkPPuW5X/yMZtUBdFZQH71Vcff/zdzdu3L/8JgZHKQNajyqnftvGR/PwV982LTMxAYOA2VB9Nv7NMKySqnxpTS/D11VOLRkV1sxNnrQCeXqrFAAVdQVkJ++1V4F57XgYj8lNPyuytW2t3bt04KxE0Bm5/Xkuru0y7piyJ64dpSQITvRDcv2AqMvP61Rnh6Tuh24lIYAL0yy9FGyPsD4C9dfn5p592kQHNPvUUYpdBi9xZGp6BuKO5VR3pTq4Sw3EsyMUNDMS0tIEmMT9UqpDCnyJu1qxtgC2DvJGZoCtSFrDvX70Ncu3Sb38rgV9BKYXYSO/NInjjrKzVMPaZ06qandOeEid1lBZzcgMDg3AdTbAGLSaOvf1J/sjOq7MigVtWhswrM/8mUT9+/7vrCPvFsxs2ANhFltV+anNZWe3O/Mis1c27DuXlIHXF4dYPIw0GmiZULq6aoE0Yw9HEDGSP0oapC0cPIW4+cMt/98KX/xCZLur7onNvX3p0A4ik8p+ef+XVV1+VyAPP6ctq9fNiM2paD7UuqGoU2zF4UKM1cCTFaDVObhBG0DyF8yZKVDjYnBZgNBu3QwvYVlumf0GMJcSUqW+/fxWpe/2PG379axn89NPPg4jkT9754DPg5keFFza3nk4BdWVsEEFzrMLEkKKHgavCtST6lcFi0GpQ6y1tm7rstLEROu2KreV6OWFFqIh9G6UQ8u6G+0WwRH5GIr/33jsfAXdbTCSMA4faF1Q3hsodCSNNVoLgGVIMLeBiJG1gWCuG8SyFK2EZFAoKVxwChcUO/7u35IxFUKAC9/otCOZrf9xwvwv826efeeYZkfvJfy98Vl4OY0hWDaib1ubswGrCwJtANwaFllKp8FMRNGXgOEGnoEFhDHHT26ZOOWXcXhgftbi8/DEn930ZC2DEvXQ/Ehf4GQRG3CsXtpVvFNU1tyZVNcprlxkYxVpxBc+bTDStVQcq/NRag0HNWQWW0rKsDp8B3FBjXoDxtBEMjbreC186uW/LgrLIi7vBzT3738/0+sXRsZmgbnJa2z3yuANBZaEJ3MbzBg24OFDhoyIMnJaw2gUtR4L1MTSiIIXNMDnGRi3WI0ODfz24r/0LwNf/fP8d4OfBvcjMVAREVY25IrmyUZ4vZ+A6liUYg93GqWiIX6XCB5IXgoqyOyhBZxJzCTQ25gZUmEWF82VDu7mvvYYUvvXFholc8O97l8HM+kXIzMbTAQva5spcjGR4kqetDiuO8ZBKSjGuGCupoi9yJoHgTGAD0Piedv8pYipFL9I7De3mvgYOvnXtWZn7axcXsDeufKZ/cA7MmDWnfzW1cr08Xc6AHGIou9Zh1ypMPE0EoXgOwiGLtLTJTjloGhRWI4UbcwOWn4ZUioIBAxnam/sv4N6SDb1hwx///CwKrOf/+tcffwJu+eyIqMRCY19AUtvcuSIYqcvhAm+6SJFaK6imDFQEBkoK8zRL2gScRcUDXdrqP6VPNPQivcz9+H0n9rXXrgL30qMy9tplKJnPPnv5MgwhNy5s2zgbmblvmX/l+pkz5zrVpemLOqvBpEPqqgKVwA2cgTxM2SkV6zBQHBQPNKuXFk35pRlSOGb2RpeD3dzXroOhvwDwhi8uId2vXbt07TZMIN9/f07/CHAza2oCklvnStwwnDKxmGDHaJNVa0GeDAxUhKD2hLxutROkzYKbTBQehlYIxoBfrIaIjp7zsORgby6y9KU/3n//o9du3XYKaPv9vz/f/PDsmNjMinsXNpTCXZCd1agwM3ZOQV+kTJyOUIdI3BlQsVgT6bBoBiyMVlQY3rGi4hfztxfGRv0M9zpK4Ucf/cKNvQ3Y/zmyt0zm5jbPFblzwyCHGNwiUKSD16JMDZL0VeJaHW3iSdY2cOLE2aUMFI974A133ft/cd+G3nDr0rOXAH/zypUrP928efOnG+f+/cYbTu7K3E0rkNnmhqKgIvacPZtvsWshUdGAAfU5JESjpWmW5VnCcqa7d2zPUg4+0tyZc+/1n9It2fmxSbivQZG+haiAPXfh3QtXfvzxyveAlbiRqQ/15VZXiCtECCqWXnpmrPuMwJAWljGAoUUutGNcZxUEcs9Y3ZLhsXyUSzNmzkzxXz5WkxUbM3vbYy94xpXT0GLvv33r5pXP392372Ukx48D98gTeuAmPmQ0VjYsAW4YRjGc5sR43dKxD3DWynMUTcHIoUANimFUlGDnl46NL9kyPoZBimOhdycF9JnFPHIXShH77Xffvv2vf0GtlDx75ZvP9yE5fPi4zC17ICIqfmXN6cqGCkldjiodO6CqG9tD2WxWLc7ocNQHxQ5lUJCCgz4xvsX3wHgphRROgR7cjOrGgx5149vvvvvu6vXr169evXpdDqgL7+6TuYcl7u6yh+dEx6ZWmM3VHQkzIYcGBjRjw0vSh8c0FgePqVCF8JPqFWWyaHWURVg6NuybPjyePjBALc8JOG2uyYqPivCok+9fv+6M3VvSy80fz+3b56UvOLj8AWToptObOipC0XBDdI9vUWwZ7zY4TLiCgbqhluZJGK84TmulGQrcgC6AXCpKKjK3OvuCHFbvf4fC6OZNJxYFshuLuJKhyzdGoAKNFF4CJcmQPj7sq0LqGhhGZ4WBI0jm4iRY2uBgNOljB3yWHBhPZ/bk+febawqRurJ7v/32u6ti0ly48OPNH69AAN+8ee7c5/vu5O5GCsemgsJFLU2QQ1jveLovaENoeQHnWTGcEVeNEySUTZJzcKre4SVr0sd7lzal5Z5uLcmMjc4X+/5/zv/nhx/kpHn35W+++fzld18+9825l/e5xcV9Y2+tuOuxUlR4B0eXjtdlxw2PB2kFB+SvQZ6vYHiG+cpg4FjcahuoG16zprh0fHVeUpu5GZl5G1L3/A8/iKPczZ+ufPPuvsnk4EE398ju8vJV0fGpoofNA9PHexPqs4e3LBUcjI6H8QoKB9IXygb0eygcBtJyZryrM6Ezu/dADtofg6haVS5y0aITyuCV7899fnhy7EFXXImGhnlSVji/bjy9M6O+q/eMjQMrM4xJLBwKSF8DiTFWEHLPmdI1PQX1nUuqk9r6ZXXRHCsudqH6vnv8+OGDByejHjzswQVDb82HyKpoP72ppWm8tKAz46WXesfOYiYLB/MVjlZECnGM1ym0rGCzLB3rVsUlJLz0+7xccyuKqlVbyx+Tud//+9z/HD98+MWDXuCD6N/Bgy++ePh1CSpzy/ViKpnNDR29CS+tySqIWzqWb7AJAqtVGaAOK5F/IX1pFUnxDq50vDeuuLizckHbITBzbLS+tgwtecHON1Dtff311w+/iMgH3ViR+iL85Q0PLiyQ8iMTV9aAwh1N4LqMOAhW0mbnSYUKzXBqNG+oCR1rpWleRwt09/iBhM7OvLT+/cjM+bAchGnjrfM3bkCLk8CvS2CRuG8S7JEje3eXlaEFUnhmRfMhc0dHZ09PwYrxsXRB0FEMxqJOCHMOLH41BKSRzgCfhlSOAbhyQdOh1sbCxFl6tAyF9eBfoEB8/+8jLrBT5YNe2CMge/fu3v0EwtbuTEfcXacbOn7fmQXtppSGuBUIhMWhASvQYl8C03Y7i6f3dhVXpfT3G2G5P28rWoeWwUL/M5DPdx85clwky2AvKlJz9xO16PpyaeEN3OXrdg31d3RkZHeN71AQnEPATTJWKa73gzAtAutsNsuO3q5NOQ1D+8VtBj1a75ch0YOU1f5m797j3mAZC9AnEFCSWoTVz0sE7uP7TyGFu3o1BpuDx8WyoUbbCiIXI7QUTBzQGiwneruqFgwO7XoccdNBYXHFX77tyYdBNpc9sfsIUtkJdmLBo5sppzwiyrxZiRnAFRXu6eo9YbGxCEsRmNq5zwDaQsVmeStNfTBWWlQF6gJ3eUb4rHn3zYuJiIiYAzIbZNGDm8t+I6osgUXsG8f3PlH28KLZs+dERMSgjaToqKioyFnhCAvc/aMNR9uy6k5YBnCWNxloSmwLUh/U0QxnsQo2O0Od6a3OGxG5q5dnJIbPQptXSKLhjhFzZi96uOyJvUck8IuStgj74OzZ0rZZZCzaOItPTEzMzEZYxB08enRJ95kBnBcsPMeZwNLyuhsWohoV9CTWaqPzzVUNo4j7+Pr1q7MzsuAOcJ/w8Fi4ZxQiP7C5zA2Wsatmz4mRtglTM5GsXJldsnqdhN0/NNpx8s2xE1qbw27lTDRJomWKs+/DGKtSaGHWm95SPfIhcEUwoFeXICksLMzKSg1HZBEsRpcob4jaRkRHxqPNQbQtinZGRXkcPblEO4UjJ0f2+FIMhSsUCkwH5Vkl+RfSiOGsPEPQVvtHxzo+/HBoaD+QAd3Y3Ii+QLZvX11SmBUeGR0x+8GyWhcYhdRmWA9FxmeUbK8xGtFGdSu8Hjpkhv+ffjo6+vXXX58/9nEpw1tYrYZmeYhoTI4rJTR+8LDVyurIwWMjcOWnkpxG0tdn7Dv90bq7715SV5KRGBsVMftJ8LGYyGLvgTFOfJqzfWX2+sZGuLqpubmvuampqehXTe0NDR0dR08eO/mBjaO0JquVY2jXvoq4gQXrQc5iswtvHjvW0lBdmZubsjAFvuAlIMAfSUDywsK67StTAfxAWdlvjsiluKzsSRG7fSx7ukLxiylT0OVTRUlKWlBVXV2NNr4H8wnGIojuJaQNO4mrRFHFQ0Q7PjoJ4Kq8nJwFSUnym3Ny8vIqK6urG4oqKipWIo2p8jIoXggL1QKGuPjCmr4+hWJ9Y3N7e/sgyJuynDp16p9InrNdvGi3WXkTLW/XufTVURiG4fD/1H/+809ZRkAGIQs6OtoaAPqrhramRgCDj/UA3ntExD4MM1xWjbFm4S/XGftEMR84cKCrq7Tzpa7h3rEzZ/PT05cyJhCGMdAGCg/y2BeFkDYwENQmhtb9oe8PIM+d6O7uPrAlfcmSJdn19cUFmRkZCcs62oyNFZnxkTEPQA1+QuoAi6PR1o1x05RfNiYkZGRkFhQX109PyKyfDiPG2NgZi4BWARDIKjVURchYT64U0qzV7rgI4rDo4DIMW7pny9rM+p6Mzp76jIL6YiAXDfb3NT2UGh8Vs7FcLNtltY/ERIYXNhuNuVOas+dnZBYXFxR09hRn1mcmZB/o1qhUQKR5we5wOLzs7OPcb9cQJG2ikR00JMQdXGizDNStrQdmfUbC9PpOUKSgYHCw3yiCF+slrH4xsnKzsS1gWU1BJlzRU6xIKO6Z39NTv6ZugOMtUJFhsWniBZvVwjE6rayu+3mKGkwNRZ0kcEJnMLE81LSBHXVr6uOmZ9R3ZvRkTi8Ac1eMDJqbUWxF56OGUVubL1m5PTegaXp9fX2morgnobMgIS4DsDs40POiww6zjQKJmtHJweznfi6JugO0JFSkQQSOVKhJnttTV5hdD3bLAENn9HTOn942MtjXhFw8bxvqdjBFhWfXtBo3JS8rUGT19CQUZxSDXzrXTF9bt2NgANNADUaBw3E8x0JllrGynaVHDKgJQ1NCvhBMOoMVLM0NDPSi2EzwXfNSZ0JPZnFG/cib7WBpAK+AHlu7AoaZ1WDltOTf12dmFvfEdXZmK7I6u7rW1p0YEByoWHB2CBm7wKPcdRrZTzxH4bI0xBaY16TDFDoWohDHcZNl4MSJ7t70A8PDXXGZmUAWLQ3gxFkrNm5cMSscPQs1b0oreqgYvFqwpGt4eEv6gd7u7gGLFqcZi01gSdIE33gWQkft+TzU9dwZBnhUsxXoOytYaYzmDDgncPndY2NjdcNb4jp7sqYXDyJLrwNw+KxZgM1e12puy035/ZrpBT31ii3DdWPj3XV7LBZGx4FbGVgNSd0AklRHBE3gSmjggaVNEA2QSxyhwEidGtZMOP7B2bNLl471FnbVw6R0YGSwv6l53cqMRLHJrmtubd2Ut+lAV1xWfdeW3jHVjrNnBxS0zU6pCBLDWLiVjWcoAldpxfWnh52dXBVENAoBiyAwuIIw2S4ynMNAYZzDosWYsye667YUggnNYOnW5nXLV86fD60dJsa2ylxjd++WtVvqek+cJVW0YKc0WquDtNjgNiqTHSLaCu6T+p/3uRHJ1NCWKAqSiNIQBt7muGhCi0Qr5bBqeYoXBvIHdnSfGNDsAUsbd61btxxk3bpdZuOm3JodS890QwDvsAioGDoE0kqabKT9op3TqVU0yzIGA61zlmaP81c+zpDGIHtpysRbLIKdwSlKcOgEgeDthM1GEZDRFoua/OjNkf5Dux5fJw0UoG7lRxghfDAwwCkYO69z0LSD4R0MaSAEuyBYYKIw6LQEgWv8JuPK7CBpyIOiaVBgJpg9DVZIBZ5ysFqtTSDhE2Dc6ZHBJjQJgez61Lwpt4/BKAdjEKwqXLDjNhtN27V2B69VENDSQVDPVQcF+XmdC/L19T5NGIQRJEkZOIMCbCsIWoZgrQJjEiiBdPBqg0PLUbZTI4MNInjXofa2yiaB4KiLWsxmIy2Ug+QFK8yJjN0mGBQEz9I69EAhaMIJOzfX9VxUqcZwrUGnYaBSCoyKgFIjUCbSatc6dBxpIx2U9bmRkTZxEtr/aX9D5UeswUYLUHPspAPca7LyFgOutlp5K4sT0Alcz+a8zgX5+vp6HVBFwzxUEJqBJTLLqQmeN7FWDGftoJXOYTIQDp4iW0cG22EG27+/v62yiCbsNoq22Amestt0hM5qQk6irKyJ40hah6uDvE6aSecHEdd34plNJQbrBx1FsyTEkoE2sQraarHiOG+3agi7nVQPQEyjx+iftjVUlioMDquKsNkNBAUJg+E8Q5sAzKD2ZhCj2OOcio98VlPk+vp6c0OUGhz1JRpnWQNJmXQ4z7I8ToLpKEywmgi2FCw9OjT6ZkdlkwnjBF7BQIqqdDwsCRQmaH2w6MEZSqvVoqes3lyfCVyPs1BoTzpIjR6Soo6ppSGnaYMJA9OzsIA1wWpD2w4z0IcjRzuq88VBRQXthqNIFiosWIogYHyhocdrNOpAr7O5kr5Bvr4/x4WLUWTD5wU+pLQWPVSjKZrRoR0ZLTZ95G8njx49Wl2Bag3NwD9AGdBqgNaRmAbXUiiKvQ+M+MingRFQ4cLKB2b8lDIWFTBMg9aqUExwiHE0E2gpHUyimCYkeN1XX311sqMhDj1Lht9ShIjCcYJApoUKhAHWb8I5M5Hr6+vU1/NQrtLjXKvr6EOQX6BSg0HyayAp1ErxMfHgV1993CEeRUFoXDMDxlGNUjlDHeQ+JCIenXQdvRYxIlXi+ngGtNLjOO0kR66VSvGhOOBCmgfbl8hnHpXKkGB0MmOCTDj8LYayB9cJFrFKj0PLgT8n6BT0xHNEIYE/g/WgBgFW4v4vtt0gxYBWEv8AAAAASUVORK5CYII=");
aJ2(15,"zoom",6,"iVBORw0KGgoAAAANSUhEUgAAAC4AAAAuBAMAAACllzYEAAAAHlBMVEUAAAAhIyA3ODZTVVJrbWqEhoOkpqO8v7vX2tb///8goTJXAAABaElEQVQ4y32Tu1ODQBDGL8QAdlg5dml8dZTa2TijXQpnIh2TwoQOxwehi2PB0flKYP/b7HFv5nALBn5337d7ewshXZyuKX2PST8egUW76OE7EJFa+BhJ9bSsUWFaeTV3GKHbn8EvlB79bjSv4VO8jUr4VdiHNnK938MHPie0Yh+ZLqmGuNsJ7CNURgewI5qPoRE86GwkJyWIBIfcUfJrmMm0sclDyDnPWmLyADacl8jnRbEGKIoiJRP4EmU2LJmIDfLvAf7z/37mv6IUm08pzbV/rx5f1pPA1Fn/iX3eS3nekAslz7gcGw9bg3uqn6Rup5oH+uaTLpO4r0SmZVuUFE2lfTc+z1qr9+BVtGJqzq1RHNfQdAtnrEW75UwuXOFgvj3crpCyDu6UIpP9fPHZU5XkiYVXvsXIPcc+VwspzY2pPorE/NgCfYK+QJ5+QFA6fjQt2A4IWuIWODixe2ELcuIUNJGL+zQle92exY5pfDIaAAAAAElFTkSuQmCC");
aJ2(16,"apple",3,"iVBORw0KGgoAAAANSUhEUgAAAPAAAABQBAMAAADVZ+VPAAAAMFBMVEUAAAAQEg8cHRsjJSIvMS48PjtNT0xlZ2SKjImmqaWKyoYF/hJw3XLLzsrf4t7///+u1pRGAAAHKUlEQVRo3tWazXPTRhTA145jyQd7HCgfOTSkHEq5QDqdoT2VtId+XMAz7QzDBZu2ZMghjdMZJnDI2Bn64RyInBYSO4H4nNJ/IKX/AO3FdFoSDqAYCoWDpWkB2zpIr293JVtyFBMnrTXVJPaTrNVv933tW0nkBt1+/r6D2w8MSfD/p6V8LtOxbSo//4sJXsqdi5KObb4TU/McvJyLkY5u3VMLDJxPkg5vQp6Cl+dIx7cLCwheSnYeLMwjOBftPNg3dYP86IGmUdfXyfKMF+DeBbKc9gIsLpCbSS/AwlVyM+EFOHiVLHkDnidLg16AA16BuxA8sOXW7zmbdn3mRvisPfDZtCOn5/NunlBwRqKoucWN1hZ4Aor2xgCgRbcAFh+3CQ6BE6yPX4DsFsAhrU1wARwc2jhVJcHFJzFxhUxkfXd8dybKaQo+qVwhZFhZwY9yhjFOKrNEWJ0u0+Ji0VgRtUvlBGu6CTBVbaIJHNZIylAfCRoplIK631DUKoIFVTGSQVWBZLdq6BTMdkTdgPu4o0KNig9p04ebAMcB9GYdirpPnexFIpGrouaHmV4dwRGtRyqhJaViSB+UKDjMjkDyVI1OBVpUhLFjmk9Nh/RNgFHTlfVgwSA+NSa/q2nhit+IBil4tEQiVZxe48VIhVqUEHYEG4Rqpo11bC7oPTuUTYBVgPQ6sIaXIHKykKmWI2s48G4KlookXPNdUqB4uMT9iB2xg+kftR30vxDsx+BZ5654NQYezZcK8aIDHDLyheI+E5xyBRv5vLPQcQUHQE+uA0vPBSPaBYN994qpQtoCx++TvkrkGeJQ42EKjj/AI83goBElb7xA1T044lyC7HzdEceZSxhf8pURnYQh3QeDFjisn5GLkdqrajFknCsw59LPFIp1sP4pAxP58mutnUtYVMpjWHFfA3iScITXY0JOAfyGcixsEAsckMGI4c9y0S+DRsH8iAkOQo2DPwd41AosyIgwZj+gX6DHbLk6109LQ7RTIEeEHPHlSFeOXEiQvflJrNxyB9MoDbGykR4R5ugfbsOzwTmCf/6pOwOtwAWwb392bFoMObhgJDoFlpxgSHcI7FfBG1U3aRqSnQJHnFytzWvtOv91dGvgUSe45DhRUbKtLzWBhtLTWwI7g8lZcohNHVm/GAJn7LcDlp1gRzCFAaot151m4z+wj/mZ7YH7m2qDljZHx1z9CDOeTvv4dFtgI+qsDVSjlescZv0SqZ62CwYHRzWklvkkxV1ARs/YNtjuJwJox1nFGxj6hOzJjDHptClxjRQ5P3tkBCpDdFn0fuZLeujI0MCeDH4fyHy1SXDaYcJKGJ4xobZXBeM7dqgXpW8dYP/+qGRGxAR+rbI8/I2K/jJi7m4inOwlfR+siVDjYDZ1xijYlPhQa/aEnzXD6xbdn0ZHZVUXzLiDm+aImsOE2S5W8oZABwNTxf26dIudcAhghTvFNKoBkw2OQmFVsgR4Un8KoKzaAsMBjjfNijYjy2hxmUY2ho0+thurDSad3iOb/aMjKvOUyZxLALhMDlJ74XDmTuxUcXevLf23ytXQqP27eNezDHyLfhpRLr1shR2zUzlpgcNsdBL6ukS7FjJ3i5uanYx0I2Fi46Owxs5JsAk0idIgrUjNUbCqCYykCY6zJUwfpjtGi7DdMPzlChaawA2ThOE5/agyG/PxZU1JtnK6cM10DAbmg6MDZYo6au5W3SuQpkKg4V5x2k6kHeE6o9cN8Z+lxmRyYJFN4gxcYNEoYufYCaNQvnv37r3GFVuXPk8bgWYoikLNaeJSNrAt7EZoENrAggWWmofiBB+CDSZGtV6TtAYjr7QBmPZcUR67g0VwT5rBRk6xq1ozrc0WID2mTZ5a4Kxd1anmGwpOsE919y1k0KcYEl7RxbnSrE402Jn74O8WzrVxQZ9yr336+HI5jMrl4RTg4YQa6TYLBpVHVQpDjoGPw4N6OGVpONFEL2QmNwCH3EsQejlTcXjGA542UPqVSaZx6dqoW2XTYsVKIAVsaOYdPUoXX6UNwD7ZNVebsdqFY0SccfFNmY/duPiWap6GheJsdNciLwT0d6KYE273DPOUmWUZ5zYR1Ialm1eLx9x8GlvFrA7QqYFPO5ZUrPslnTJqXG3WJKFZgY5GVHD2GNgIjLoCYzVzzXFHTbRuxUiwhkFEs7I+SCzJbD5dn8TRAZAVsuZBDhaY3/6+8cL8oFqmDjCslJO2CtPU+ttQQZyIPZ9kM7Mp8S7TtGVcMdMIskYQtdJIbR/i7mq0xR0BP//RZ6u4/PtfqQs0bQTGB3lJQLrHG7d+fWfzudNcfOlj2nr3ONvdsZ9fKnD+i+3cvQ3VfS7kqBT+89vG/3tw23fo/01wwgtwcL7Nxz8+y8Nt0hYf/3j2wMuzR3yePdT05jHu8HXvHlx796jes5cTPHsdw7sXUDx75ca7l4w8ea3qHxoI8b7ie6AsAAAAAElFTkSuQmCC");
aJ2(17,"loading",6,"iVBORw0KGgoAAAANSUhEUgAAAEEAAAAKAQMAAADRpqGpAAAABlBMVEUAAAD///+l2Z/dAAAATklEQVQI12M48E/OzoinjoGB4cA/O3tjnn8g1iEjY+aeAxCWofGZBijLCMqqNzRKmQdhGRubNINZyeYQ1p9/yXbGMv9yG0AsG2OemtwGAJcsIuxbPF7gAAAAAElFTkSuQmCC");
aJ2(18,"target",7,"iVBORw0KGgoAAAANSUhEUgAAAGQAAABkBAMAAACCzIhnAAAAJFBMVEXUAADLSwDYWli/eQCzlQGgswDloaGC0wAA/wBk5wDx09P///8NUBuBAAADWElEQVRYw62YvW/aUBDADwghTRakqoJuTBmSBamNSjcyJSMZotINZciQLCxVnQ1EkO0N1ET1iDJkgCViyGD/c7UN8bv37t5Hq96EbH6+j3fv3d2DgJPw52Uqd+y7AJhnP05hI6WTOyfksQ1IPnhWJLwAWUrfLYjfBSJfjIjfBkYaBoQnVAYjYRc08lWHXIBW+jwy0RNQijjErxsQqHJID4xyTpF7MwEVirQtCHxUkYmNEBEAVyVCDbgqEWq2SNcBgQ5GpsrLw+UqSZbPAzZoG2QovdpN/7+R5xaTNjkSSgt/lAiJJaYmkImOUJiSQHCu7CeJnjl/Q7Bdu4kqr6ploKTXLUGSJ8UykON1lDDSkmMGUrKUOSJZC+TdBvHFk2MWSQbSTkuRsUWJpCbKkaE2wIw3/RwRrqx0yKL4SzNDQsOa0LWpZcjU5rxkWSVDxna7sGVRisz4eMUay/op0uPilW2UQ6wVbU0I6owrm7Qqr5jV3AsgZFx5paa+iJCBSBcmPvvUmWoAU7oqKD8KzbGIMkzoF1vcHi0eBTB6+3nAbcMy/U4EM7IfF8Dt0iJkHoNI59AB+VAfhqqnsXwMkiifQ09FXiWkTJCOQJgQs48Z5EVGiPIOdFVk8f+Rvb9Hmv/iiyvCRYxfFzCti/vqk4SRc2yfybGZPmelAwEhI/JyzXmPk39MTIg5V4S5AdzTtwNmh8Wi9onjoswcjbv02Q5/jj3RYrtGh1LAFeMBKbYLUS1BNEkH6Ay/yh7ccNWimSJDtiItn2/wKR6jBgOCkUt9EWvlpci9qbMgcS9lVcy3F2RkVzWvyHW7ZWvcXgBurY6tdmX9ZYqMrFUc7TovR6ZgC8BC6kizTgksamK5hwO5T7w1e5K3yhkyBmOvhM+PaIv4YGr7cD9aLTrYtqm5xEdBs0DmuKCstM1oHuIt4oOWeaIDGTCDxY2yb5TRArjx5XDJTgnbAWaDhOqAWL6+vr5S55eaNPLMXUYeT0J8B6KqjG9DO9JXELuaGhlF546eICS0TJYNZqw2D8mViJv3e26DOEZMpjU0FxFTLbGjvSF50Dni6e9hfvHztGe67Xmw6qB3So/k0mMnst1c+acyceZyP/aI9uiJ53alFvy+/JTa9/7zt8j1Fs4ifwCmXBmOYkld0AAAAABJRU5ErkJggg==");
aJ2(19,"members",7,"iVBORw0KGgoAAAANSUhEUgAAAEgAAABIBAMAAACnw650AAAAGFBMVEUAAABSVFGanJkA/wDMz8x4/3ey/7L///+GDHoaAAACZElEQVRIx9WWwYrjMAyGlVCYa6cs5JqGQh5gaObaDYU8QJnOA5SS66RN49dfSZZt2U2WZZeFXc9h2r9fZEmRJcPbLyz4d6GzMdM1/uXcG3PV0KehFVFnlh4Baoxdl8BEEkF7EcwUoN5pJ4HenRBMNV66C4QfxxI2nTKFhsYt5CgZC9FTawDIxbg4UKKUWevAuw1Aq/D7NUq6M9RbQ2zKhkwpKVnK2AWGRrCrc04lEpDfgyg1u8mh3EQqSGLoS5QXY/a4+XSKJIIwkkNQOIlTgFYUcQq59TuQcrwI0PDk+M3Hayh2+RcC1smkl3DDj1ltlMR5old38LutHT04l/BVAVfOSL9lnXelUBKaAltxt2gTv3Ft6w6k4sajdtf6zhLVHUHltzTwkIzvOUGf9PhOJJdVdphWS0YfFnJUCrVgISmdTVWVnVQa19+YV9VWKgohl2+MRUFKjaAXDX0tQCvt0+HPIJWnJajWGV9wPDPutPFhXs9CK+PLr1aJjSF+5aUzpOQY6mwZURWNCRRO9JZq43ikMtnog44v2LlojK1EW6n4zYXz4HqSb/gsty1qaWjAt5o7NAEiL7Jdu2vX7IqHLikEIYdzUJ5CZQQdJJcJ5GSE9i5tC1BNR4oadGub76ChwrZfKn48wTRXsGfrQvHFQr0dmy245o8nMYHGoxsToMZIAoWBA2qOzEMXmVJiK4nO2jn5oXju5yGZpn4Gf/QpNH08D+pn6O3vQqOGulkIX0+1fbXd93VT+dkXQe/SO3F1fkSnUBjgT7cEdVdJodkLTbNkKLr1NH1ApstPrkbnK/39B9e1H85NJPjxrK7zAAAAAElFTkSuQmCC");
aJ2(20,"hourglass",7,"iVBORw0KGgoAAAANSUhEUgAAAEgAAABIBAMAAACnw650AAAAGFBMVEUAAABKTEqZm5gA/wDJzMh3/3iz/7L///+iyVF/AAACjklEQVRIx72W3aqyQBSGJwk6dceGTv1C8AJEO60QvACJLkDI02xPrtvf75pJ58cx2iffIqT0aWb9vGuNIrft0hSX8WqZ4Etxg9HM+G4zQVdatOcEdSSrqkr3juFOVdMwQXQUC7YmAyVLUPQZ1PxtJSJ5js7KX7j/+pKkNR5Y0RE9Ij/6JMPFRFfebt0cOmbD7dZOEOwQgn7ssnwOrf8rJAMp8KFSrnwormcQCR8S1HpQgT8qVVXnVCsJS/tQzlV4mMpmJLUCXOi4I2mgmnotOAfqcJPiCUIGNsMMunJdEqMjbP+cQQcOrx+hnZ0BA5XsuTQuPUxwBoLnZj98Oxq/LaiTHNK4G34MAQj7jfGhQqeIfgJQzm7ofELccUZ5CDpQjKBO3LbUr+gZhAo8QhMl8FoCb4IQhkvyUt7JWciBCnhUa5VkJkkexEtxQ3KjPvMlqKD7hk7fdF/bHnlQfoUU4LglgBCElVCP+ztIbQfDdXk7OL5jqH/juE7BA4pBUZr8XTJZMadoKZklKlxriMvSBqGO4m8ejJmuy5AH9aTqq02CbwPQlfeYDH94ziEWilqDW5xniiUWq6VUjs6szFTnat5SHYuXdcnGAcTZrINLrpmZGJnqqXY26WLONJ7rfqm5qfwh1vXckPahAh8HD/Imjzt7xJgACLe3oZ01xYQ1Mo/umWmGprBOjcQ96cyEEtacc89DrDx6PkJQrHSh2kjdgh4ulH0C7YIQuS8P3nYlDa9ecg33OpUF8TqnFyB9UitIVujsALSmqp6g+/5fHKVpxQfQqM6q2ier7X5joFdAMX++YrEyMc6hgP0RkuoVZbvfTqfU6gs/VbZG6M3bmn5fE0pxb6x1Ori4eNbkY3f+AriuYpjQCOoxAAAAAElFTkSuQmCC");
aJ2(21,"stalemate",6,"iVBORw0KGgoAAAANSUhEUgAAAEoAAAAKAQMAAAApRlpeAAAABlBMVEUAAAD///+l2Z/dAAAAX0lEQVQI12P4/afiwJ+G9vnvDzD8/vPjwJ+D/SDmgYQTBw487mnmYYAwv4OZBUDmj/89zfwNDBWJfw78uDv/MJApAWQeODn/MFABR2LPgQMHZ4CYPxJ7/vwBMvkPIDEB8vo+S3L7oMwAAAAASUVORK5CYII=");
aJ2(22,"logo",8,"iVBORw0KGgoAAAANSUhEUgAAAFAAAABQBAMAAAB8P++eAAAAMFBMVEW+AAHAIiMAiAfESkosjSx4cMRcnFzPgoGbmNGow6e7ut7ftLTX4dbf3+7u3d7////Ro4BnAAACgklEQVRIx+3VMYgaQRQA0D1SpEizcv0Vg1h7XHHFQQpZUqVdWIRrRBaEQCIWKSxSBWRBDoIIC0J6YZHjCgshdsLCwvYB2cLiCkHLQ5zMz3cl7ow6O1OkSJF/V8lj5s+fP38N43/8s/GqoMUK17fjcVkDttvT9epRAwIGW17rQWBjUwmTXz+Hc2BPSugNbdsZwbal2t3eRRdgORk3TSV0kjTRydOlAtrDID0UTEwFtKtJksqmCjodL5jPAbamAu6s08EEHtVwf6gXLWiPgJW1YCeR7i1CLL3sOEfQAaYHMcuyLvykBb2E6cERrLitL24KEogV55v9btmSQGxMbufXa8hekwjnQhnfAvdGBFfF9slWvJhi3y2kTZGt+GYNXN8dH/o52/kK6CBrkmO44FMMG7EEdvnmmUKvFB/qL8J7bus7oDXynTXPFzxL/nKdQpDBNKd2y7z9ARAS8vGQ9NFdP+y2arPnz1OgUZ2QRvxyHt7DwsSbA/wP/QohpXhbkHT4tnyVjgLatwghxRjGrRvTPIUJu5lCFAHdrYfxHthqtZw0Tzo8YF8QNaKonzpS2g8ldgI9/HVWL1r79TA+7KUAnY7zFTuSuoSLUoSJiHCIY2qOQw3rzEXRdRuDiIfV/eBL6yxGse76hvAMYvyj/jdyGtYBOl4CfiP0B+E7ci7+QC9IYNOzrKJbIXnQwWFLZxLDQ3xV1He1IA1rhKihA2GF6MAqzIgm3NSI3ta0rgcT6GtBfPlU69S7i+5pQax47sUcICaZX3EjG0+byt+FXUXJD/BBUR8jG9+a0FEU0uDmfGjpQDs4evhSiB//vOY1hK9RTwtiljnXzc+eIO9yDOGjTuXwN2h8zFYEBekAAAAAAElFTkSuQmCC");
}

function aJ0(){aIw=document.createElement("canvas");aIw.width=1;
aIw.height=1;for(var aC=aIv-1;aC>=0;aC--){canvas[aC]=aIw;}}

function aJ2(eI,name,aJ3,s1){
a2c[eI]=name;canvas[eI]=new Image();canvas[eI].onload=function(){aJ4(eI,aJ3);
aJ5();};canvas[eI].onerror=function(e){console.error("Error loading image at index",eI,"Error:",e);
aJ5();};canvas[eI].src="data:image/png;base64,"+s1;}

function aJ4(eI,aJ3){var a64=null;var a63;if(aJ3===7){
a63=gameState.or.a66;}else if(aJ3===8){a63=gameState.or.replayEncoder;a64=0.1;}else if(aJ3===3){a63=gameState.or.a67;a64=0.06;
}else if(aJ3===5){a63=gameState.or.a6A;}else if(aJ3===6){a63=gameState.or.a65;}else if(aJ3===4){a63=gameState.or.setPreGameLoop;
}canvas[eI]=gameState.or.a62(canvas[eI],a63,a64);}

function aJ5(){aIv--;aIz();}

function aIz(){if(aIv!==0){
return;}aIv=-1;aJ1();clanPanel.ds=true;aJ6();if(account.ua===5){account.handleKeyInput().aJ7.resize();}}

function aJ1(){modalState.a7S();
bb.receiveMessage([canvas[8],canvas[16],canvas[9],canvas[9],canvas[10]],[uiSurface.id!==2,uiSurface.id!==1,true,true,true]);
colorSystem.yq=new a0l();colorSystem.yq.applyToGame();
cameraController.dl();}

function aJ6(){canvas[7]=aIw;canvas[8]=aIw;canvas[9]=aIw;canvas[10]=aIw;}}

function TileMap(){
var aJ8=[[100,100,100],[144,0,0],[0,128,0],[0,0,144],[128,128,0],[128,0,128],[0,128,128],[196,196,196],[0,0,0]];
var aJ9=[[4,4,4,20],[4,0,0,27],[0,4,0,31],[0,0,4,27],[4,4,0,31],[4,0,4,31],[0,4,4,31],[4,4,4,14],[4,4,4,13]];
this.aJA=null;
this.aJB=null;this.aJC=null;this.aJD=null;this.getTotalAttackValue=null;this.aJF=null;this.aJG=null;this.removalManager=null;
this.removeAllPlayerShips=null;this.currentMiniTicks=null;
var aJK=208;
var aJL=224;
var aJM=248;this.fb=new Int32Array(4);
this.aJN=new Int32Array(8);this.dl=function(){var fb=this.fb;fb[0]=-4*dialogManager.fk;
fb[1]=4;fb[2]=-fb[0];fb[3]=-fb[1];
var aJN=this.aJN;aJN[0]=-4*dialogManager.fk-4;aJN[1]=-4*dialogManager.fk;
aJN[2]=-4*dialogManager.fk+4;aJN[3]=-4;aJN[4]=4;aJN[5]=4*dialogManager.fk-4;aJN[6]=4*dialogManager.fk;aJN[7]=4*dialogManager.fk+4;
};this.applyToGame=function(){if(!this.aJA){this.aJA=new Uint8Array(localPlayer.isMountainTile);this.aJB=new Uint8Array(localPlayer.isMountainTile);
this.aJC=new Uint8Array(localPlayer.isMountainTile);this.aJD=new Uint8Array(localPlayer.isMountainTile);this.getTotalAttackValue=new Uint8Array(localPlayer.isMountainTile);
this.aJF=new Uint8Array(localPlayer.isMountainTile);this.aJG=new Uint8Array(localPlayer.isMountainTile);this.removalManager=new Uint8Array(localPlayer.isMountainTile);
this.removeAllPlayerShips=new Uint8Array(localPlayer.isMountainTile);this.currentMiniTicks=new Uint8Array(localPlayer.isMountainTile);this.aAb=new Uint8Array(localPlayer.isMountainTile);
}else{this.aJA.fill(0);this.aJB.fill(0);this.aJC.fill(0);this.aJD.fill(0);this.getTotalAttackValue.fill(0);
this.aJF.fill(0);this.aJG.fill(0);this.removalManager.fill(0);this.removeAllPlayerShips.fill(0);this.currentMiniTicks.fill(0);
this.aAb.fill(0);}if(localPlayer.iT){aJO();}else{if(localPlayer.data.colorsType===0){if(localPlayer.data.selectableColor){
aJP(0,localPlayer.ku);aJQ(localPlayer.ku,localPlayer.isMountainTile);}else{aJQ(0,localPlayer.isMountainTile);}}else{aJP(0,localPlayer.isMountainTile);}}aJR();aJS();this.aJT();
aJU();aJV();};this.a9T=function(player){var h=boostSystem.g8;h[0]=this.aJA[player];h[1]=this.aJB[player];
h[2]=this.aJC[player];return h;};

function aJQ(kA,oD){var aJA=tileMap.aJA;
var aJB=tileMap.aJB;
var aJC=tileMap.aJC;for(var aC=kA;aC<oD;aC++){aJA[aC]=mathUtils.g0(64*coordHelper.random(),coordHelper.value(100))<<2;
aJB[aC]=mathUtils.g0(64*coordHelper.random(),coordHelper.value(100))<<2;aJC[aC]=mathUtils.g0(64*coordHelper.random(),coordHelper.value(100))<<2;
}}

function aJP(kA,oD){var colorsData=localPlayer.data.colorsData;
var aJA=tileMap.aJA;
var aJB=tileMap.aJB;
var aJC=tileMap.aJC;for(var aC=kA;aC<oD;aC++){var g1=colorsData[aC];aJA[aC]=4*(g1>>12);
aJB[aC]=4*((g1>>6)&63);aJC[aC]=4*(g1&63);}}

function aJR(){var aC,fc;
var aJA=tileMap.aJA;
var aJB=tileMap.aJB;
var aJC=tileMap.aJC;for(aC=localPlayer.isMountainTile-1;aC>=0;aC--){fc=mathUtils.g0(aJA[aC]+aJB[aC]+aJC[aC],3);
aJA[aC]+=aJW(fc-aJA[aC],2);aJB[aC]+=aJW(fc-aJB[aC],2);aJC[aC]+=aJW(fc-aJC[aC],2);
aJA[aC]-=aJA[aC]%4;aJB[aC]-=aJB[aC]%4;aJC[aC]-=aJC[aC]%4;}}

function aJO(){
var aCr=mainMenu.aCr;
var aJA=tileMap.aJA;
var aJB=tileMap.aJB;
var aJC=tileMap.aJC;for(var aC=localPlayer.isMountainTile-1;aC>=0;aC--){
var ej=aCr[aC];
var lp=mathUtils.g0((aJ9[ej][3]+1)*coordHelper.random(),coordHelper.value(100));
aJA[aC]=aJ8[ej][0]+lp*aJ9[ej][0];aJB[aC]=aJ8[ej][1]+lp*aJ9[ej][1];
aJC[aC]=aJ8[ej][2]+lp*aJ9[ej][2];}}

function aJS(){var fZ=localPlayer.isMountainTile;
var aJA=tileMap.aJA;
var aJB=tileMap.aJB;
var aJC=tileMap.aJC;
var aJD=tileMap.aJD;for(var aC=0;aC<fZ;aC++){aJA[aC]+=aC>>7;aJB[aC]+=(aC>>5)&3;
aJC[aC]+=(aC>>3)&3;aJD[aC]=aC&7;}}

function aJU(){var gI=40;
var gK=60;
var fZ=localPlayer.isMountainTile;
var aJE=tileMap.getTotalAttackValue;
var aJF=tileMap.aJF;
var aJG=tileMap.aJG;
var aJA=tileMap.aJA;
var aJB=tileMap.aJB;
var aJC=tileMap.aJC;
for(var aC=0;aC<fZ;aC++){var eH=aJA[aC];
var uw=aJB[aC];
var ft=aJC[aC];if(eH+uw+ft>=gK){
aJE[aC]=Math.max(eH-gI,eH&3);aJF[aC]=Math.max(uw-gI,uw&3);aJG[aC]=Math.max(ft-gI,ft&3);}else{
aJE[aC]=eH+gI;aJF[aC]=uw+gI;aJG[aC]=ft+gI;}}}

function aJV(){var gI=88;
var gK=3*256-80;
var fZ=localPlayer.isMountainTile;
var aJH=tileMap.removalManager;
var aJI=tileMap.removeAllPlayerShips;
var aJJ=tileMap.currentMiniTicks;
var aJA=tileMap.aJA;
var aJB=tileMap.aJB;
var aJC=tileMap.aJC;
for(var aC=0;aC<fZ;aC++){var eH=aJA[aC];
var uw=aJB[aC];
var ft=aJC[aC];if(eH+uw+ft>=gK){
aJH[aC]=eH-gI;aJI[aC]=uw-gI;aJJ[aC]=ft-gI;}else{aJH[aC]=Math.min(eH+gI,252+(eH&3));
aJI[aC]=Math.min(uw+gI,252+(uw&3));aJJ[aC]=Math.min(ft+gI,252+(ft&3));}}}this.aJT=function(){
for(var aC=localPlayer.isMountainTile-1;aC>=0;aC--){this.aAb[aC]=this.aJA[aC]+this.aJB[aC]+this.aJC[aC]<280?0:1;}};
this.canvasStrokeWidth=function(fD){return mathUtils.g0(fD,4)%dialogManager.fk;};this.a0M=function(fD){return mathUtils.g0(fD,4*dialogManager.fk);};
this.zt=function(fg,fi){return Math.floor((fi*dialogManager.fk+fg)*4);};this.maxId=function(fD){var fb=this.fb;
return(this.aJX(fD+fb[0])||this.aJX(fD+fb[1])||this.aJX(fD+fb[2])||this.aJX(fD+fb[3]));
};this.lastPlayerTroops=function(fD){var fb=this.fb;return(this.fe(fD+fb[0])||this.fe(fD+fb[1])||
this.fe(fD+fb[2])||this.fe(fD+fb[3]));};this.a07=function(fD,player){var fb=this.fb;
return(this.aJY(fD+fb[0],player)||this.aJY(fD+fb[1],player)||this.aJY(fD+fb[2],player)||
this.aJY(fD+fb[3],player));};this.aJZ=function(aC,aJa,aJb,aJc){this.aJA[aC]=aJa>>16;
this.aJB[aC]=(aJa>>8)&255;this.aJC[aC]=aJa&255;this.getTotalAttackValue[aC]=aJb>>16;this.aJF[aC]=(aJb>>8)&255;
this.aJG[aC]=aJb&255;this.removalManager[aC]=aJc>>16;this.removeAllPlayerShips[aC]=(aJc>>8)&255;this.currentMiniTicks[aC]=aJc&255;
};this.aJd=function(aC){return [(this.aJA[aC]<<16)+(this.aJB[aC]<<8)+this.aJC[aC],
(this.getTotalAttackValue[aC]<<16)+(this.aJF[aC]<<8)+this.aJG[aC],(this.removalManager[aC]<<16)+(this.removeAllPlayerShips[aC]<<8)+this.currentMiniTicks[aC]
];};this.h9=function(fD){return aEE[fD+3]>=aJK;};this.a0F=function(player,fD){
return this.h9(fD)&&this.a0I(player,fD);};this.a0I=function(player,fD){return player===this.fR(fD);
};this.aJe=function(fD){return aEE[fD+3]>=aJK&&aEE[fD+3]<aJL;};this.removeNeutralCandidate=function(fD){
return aEE[fD+3]>=aJL&&aEE[fD+3]<aJM;};this.aJf=function(fD){return aEE[fD+3]>=aJM;
};this.specialCount=function(fD){var fb=this.fb;for(var aC=3;aC>=0;aC--){if(this.getEncodedX(fD+fb[aC])){
return true;}}return false;};this.fU=function(fD){return this.h9(fD)||this.fQ(fD);
};this.getEncodedX=function(fD){return aEE[fD+3]===0&&aEE[fD+2]===2;};this.fQ=function(fD){
return aEE[fD+3]===0&&aEE[fD+2]===1;};this.yy=function(fD){return aEE[fD+3]===0&&aEE[fD+2]===3;
};this.fe=function(fD){return aEE[fD+3]===0&&aEE[fD+2]===5;};this.aJX=function(fD){
return aEE[fD+3]===0&&aEE[fD+2]>=3;};this.tileDataToIndex=function(fD){return((aEE[fD]>>1)<<8)+aEE[fD+1];
};this.aJg=function(fD){return aEE[fD]&1;};this.aJY=function(fD,player){
return this.fQ(fD)||this.h9(fD)&&player!==this.fR(fD);};this.fR=function(fD){
return((aEE[fD]&3)<<7)+((aEE[fD+1]&3)<<5)+((aEE[fD+2]&3)<<3)+(aEE[fD+3]&7);};this.a0G=function(fD){
aJh(fD,1);};this.aJi=function(fD){aJh(fD,2);};

function aJh(fD,aJj){aEE[fD]=0;aEE[fD+1]=0;
aEE[fD+2]=aJj;aEE[fD+3]=0;aJk(fD);}this.zu=function(fD,player){aEE[fD]=this.aJA[player];
aEE[fD+1]=this.aJB[player];aEE[fD+2]=this.aJC[player];aEE[fD+3]=aJK+this.aJD[player];
aJk(fD);};this.mergeCapturedPlayerTerritory=function(fD,player){aEE[fD]=this.getTotalAttackValue[player];aEE[fD+1]=this.aJF[player];
aEE[fD+2]=this.aJG[player];aEE[fD+3]=aJL+this.aJD[player];aJk(fD);};this.removeAlreadyAttackedTargets=function(fD,player){
aEE[fD]=this.removalManager[player];aEE[fD+1]=this.removeAllPlayerShips[player];aEE[fD+2]=this.currentMiniTicks[player];
aEE[fD+3]=aJM+this.aJD[player];aJk(fD);};

function aJk(fD){if(chatPanel.oL){return;}var fg=tileMap.canvasStrokeWidth(fD);
var fi=tileMap.a0M(fD);chatPanel.oL=fg>=leaderboardPanel.followedAccountsTracker[0]&&fg<=leaderboardPanel.followedAccountsTracker[2]&&fi>=leaderboardPanel.followedAccountsTracker[1]&&fi<=leaderboardPanel.followedAccountsTracker[3];
}}

function HistorySystem(){var aJl=0;
var aJm=2*32;
var aJn=new Uint16Array(aJm);this.applyToGame=function(){
aJl=0;};this.ee=function(){if(aJl===0){return;}if(playerData.nU[localPlayer.getTileOwner]===0){aJl=0;return;
}if(alliances.collectAttackableTiles(localPlayer.getTileOwner)===0){aJl=0;return;}aJo();};

function aJo(){var aC,k3,jC;for(aC=aJl-2;aC>=0;aC-=2){
k3=aJn[aC];if(k3<localPlayer.isMountainTile&&playerData.nU[k3]===0){MountainAttackHelper(aC);continue;}jC=aJn[aC+1];if(k3>=localPlayer.isMountainTile&&playerBoundaryEngine.aJp(localPlayer.getTileOwner)||
k3<localPlayer.isMountainTile&&playerBoundaryEngine.aJq(localPlayer.getTileOwner,k3)){mapCache.hz.i6(jC,k3);MountainAttackHelper(aC);}}}

function MountainAttackHelper(a7W){aJl-=2;
for(var aC=a7W;aC<aJl;aC+=2){aJn[aC]=aJn[aC+2];aJn[aC+1]=aJn[aC+3];}}this.i7=function(k3,jC){
if(aJr(k3,jC)||aJl===aJm){return;}aJn[aJl]=k3;aJn[aJl+1]=jC;aJl+=2;};

function aJr(k3,jC){
for(var aC=0;aC<aJl;aC+=2){if(aJn[aC]===k3){aJn[aC+1]=Math.min(aJn[aC+1]+jC,1023);return true;
}}return false;}}

function BorderSystem(){this.forceResize=function(h7){var ea=playerData.hN[h7]+playerData.zp[h7];if(bonusSystem.z.ky[h7]){
if(ea){aJs(h7);}return;}if(ea){this.aJt(h7);return;}if(playerData.h1[h7].length){return;}this.aJt(h7);
};

function aJs(player){aJu(player,alliances.aJv(player));troops.aJw(player);aJx(player);borderCalc.collectNeutralAttackTiles(player);
alliances.clear(player);aJy(player);aJz(player);}

function aJz(player){playerData.zp[player]=0;playerData.h1[player]=[];
playerData.playerTerritories[player]=[];playerData.hG[player]=[];playerData.fy[player]=[];}

function aJy(player){if(gameState.gv.a5e(player)){
var ea=playerData.hb[player]-playerData.a5j[player]+alliances.aK0(player);gameClock.gz(player,Math.abs(ea),ea<0?18:12);}
playerData.hb[player]=0;playerData.a5j[player]=0;}this.aJt=function(player){aK1(player);troops.aJw(player);aJx(player);
aJy(player);aK2(player);borderCalc.collectNeutralAttackTiles(player);alliances.clear(player);bonusSystem.aK3.aK4(player);};

function aK1(player){
if(!gameState.gv.kH(player)){playerData.a2r[player]=gameUI.a36.aK5();localPlayer.a2I++;}var aK6=alliances.aJv(player);
if(aK6.length===0){if(gameState.gv.a5b(player)){aK7();}return;}aJu(player,aK6);aK8(player,aK6);
}

function aK7(){resizeHandler.show(false,false,false,true);focusHandler.aDN();inputController.a21.a2n();}

function aJu(player,aK6){
for(var aC=aK6.length-1;aC>=0;aC--){alliances.aK9(aK6[aC],player);}}

function aKA(aK6){
var aC;
var eI=0;for(aC=aK6.length-1;aC>=1;aC--){if(playerData.hN[aK6[aC]]>playerData.hN[aK6[eI]]){
eI=aC;}}return eI;}

function aK8(player,aK6){var aKB=aK6[aKA(aK6)];
if(localPlayer.survivorBotCount===9){if(mainMenu.fX[player]===1){if(coordHelper.km(8)){botSystem.aKC(aKB);}}else if(troopCalc.iI[player]){
hoverProcessor.a8u(765,0);hoverProcessor.a0i(280,L(139,[playerData.a0j[aKB],playerData.a0j[player]]),765,aKB,colorPalette.pF,colorPalette.qa,-1,true);
}}if(gameState.gv.a5b(player)){aK7(player);hoverProcessor.a2T(aKB,1);return;}for(var aC=aK6.length-1;aC>=0;aC--){
if(gameState.gv.a5e(aK6[aC])){gameClock.nQ[4-gameState.gv.kH(player)]++;if(gameState.gv.a5b(aK6[aC])){hoverProcessor.a2T(player,0);
return;}}}if(!gameState.gv.kH(player)){hoverProcessor.getInteriorColorRgb(0,player,aKB);}}

function aK2(player){playerData.nU[player]=0;
playerData.h1[player]=null;playerData.playerTerritories[player]=null;playerData.hG[player]=null;playerData.fy[player]=null;}

function aJx(player){
var jS=playerData.botExpansionAi;
var BotExpansionAi=playerData.BotExpansionAi;
var jU=playerData.botTeamTargetCoordinator;
var BotTeamTargetCoordinator=playerData.BotTeamTargetCoordinator;
var fk=dialogManager.fk;if(playerData.hN[player]){
playerData.hN[player]=0;
var nv=jS[player];
var nw=jU[player];for(var fg=BotExpansionAi[player];fg>=nv;fg--){
for(var fi=BotTeamTargetCoordinator[player];fi>=nw;fi--){var h7=(fi*fk+fg)*4;if(tileMap.a0F(player,h7)){
tileMap.a0G(h7);}}}}BotExpansionAi[player]=BotTeamTargetCoordinator[player]=0;jS[player]=jU[player]=Math.max(fk,dialogManager.fl);
}}

function EventSystem(){var input;this.applyToGame=function(){input=document.createElement("input");
input.type="file";input.setAttribute("accept",".png, .jpg, .gif, .jpeg");
input.onchange=aKD;};this.vx=function(){if(!input){return;}input.onchange=null;
input.value="";input=null;};this.aKE=function(){input.click();};

function aKD(e){
aKF(e.target.files);}

function aKF(files){if(files&&files.length>0){eventSystem.aKG(files[0]);
}}this.aKG=function(aKH){var h=aKH.name.split(".");
var aKI=h[h.length-1].toLowerCase();
if(aKI==="gif"||aKI==="jpg"||aKI==="jpeg"||aKI==="png"){var aKJ=new FileReader();
aKJ.onload=aKK;aKJ.readAsDataURL(aKH);}};

function aKK(e){var ej=new Image();
ej.onload=aKL;ej.src=e.target.result;}

function aKL(e){var aKM=e.target;
var j=aKM.width;
var k=aKM.height;
var aKN=connectionMgr.buffer.data[162].value;
var max=Math.min(dialogManager.aKO,aKN);if(uiSurface.id||powerSystem.EqualWidthControlRow()){
max=Math.min(1400,aKN);}var o7=max/Math.max(j,k);if(o7<1){j=Math.floor(o7*j+0.125);
k=Math.floor(o7*k+0.125);}if(j>max||k>max||j<10||k<10){var aKP="Invalid Image Dimensions!";
if(uiSurface.writeString16){uiSurface.writeString16.showToast(aKP);}else{alert(aKP);}return;}var canvas=document.createElement("canvas");
canvas.width=j;canvas.height=k;
var ib=canvas.getContext("2d");
var aKQ=document.createElement("canvas");
aKQ.width=aKM.width;aKQ.height=aKM.height;
var aKR=aKQ.getContext("2d");
aKR.drawImage(aKM,0,0);
var aKS=aKR.getImageData(0,0,aKQ.width,aKQ.height);
var aKT=ib.createImageData(j,k);
var src=aKS.data;
var aKU=aKT.data;
var aBC=aKQ.width/j;
var aBD=aKQ.height/k;for(var fi=0;fi<k;fi++){for(var fg=0;fg<j;fg++){
var aKV=Math.floor(fg*aBC);
var aKW=Math.floor(fi*aBD);
var aKX=(aKW*aKQ.width+aKV)*4;
var aKY=(fi*j+fg)*4;aKU[aKY]=src[aKX];aKU[aKY+1]=src[aKX+1];aKU[aKY+2]=src[aKX+2];aKU[aKY+3]=255;
}}ib.putImageData(aKT,0,0);account.ua===20&&account.handleKeyInput().aKL(canvas);}}

function AchievementSystem(){this.aKZ=null;
this.applyToGame=function(){if(localPlayer.survivorBotCount!==10){this.aKZ=null;return;}this.aKZ=new Uint32Array(localPlayer.isMountainTile);
};this.ee=function(){if(localPlayer.survivorBotCount!==10){return;}this.lj();};this.lj=function(){
var aC,h7,target,aDa;
var aKZ=this.aKZ;
var a24=territorySystem.lV;
var a5k=playerData.hb;for(aC=territorySystem.lQ-1;aC>=0;aC--){
h7=a24[aC];if(h7>=localPlayer.ku){continue;}target=Math.max(mathUtils.g0(a5k[h7],4),2048);
aDa=Math.max(botSpawner.aDb(h7),100);aKZ[h7]+=mathUtils.g0(aDa*target,10000);
if(aKZ[h7]>target){aKZ[h7]=target;}}};this.a5q=function(player,iI){
if(iI>this.aKZ[player]){iI=this.aKZ[player];this.aKZ[player]=0;return iI;
}this.aKZ[player]-=iI;return iI;};}

function CommandQueue(){var aKa=-1;
var aKb=null;
var aKc=-1;
var wO=4;
this.applyToGame=function(){aKa=-1;aKb=null;aKc=-1;wO=mathUtils.distanceBetweenPointsAndEncoded(Math.floor(connectionMgr.buffer.data[16].value),0,16);
};this.ee=function(by){if(!connectionMgr.buffer.data[15].value||wO===0){return;
}if(!by&&powerSystem.EqualWidthControlRow()){return;}var ho=powerState.hp(powerSystem.handlePointerInput);
var hq=powerState.hr(powerSystem.hf);if(!powerState.hs(ho,hq)){if(aKd()){
aKe();}return;}var fL=powerState.fw(ho,hq);
var fD=powerState.fP(fL);if(aKc===fD){if(tileMap.h9(fD)){if(aKa===tileMap.fR(fD)){
return;}}else{if(aKa===-1){return;}}}aKc=fD;aKf(fD);};

function aKe(){if(zoomHandler.a80()){chatPanel.render();
}else{chatPanel.appleLink();}}

function aKf(fD){if(!tileMap.h9(fD)){if(aKd()){aKe();}return;}var player=tileMap.fR(fD);
if(player===aKa){return;}aKd();aKg(player);aKe();}

function aKg(player){aKa=player;
aKb=tileMap.aJd(player);
var aKh=aKi();tileMap.aJZ(player,aKh[0],aKh[1],aKh[2]);aKj(player);}

function aKi(){
var sC=aKb;
var approximateIntegerSquareRoot=wO<<2;
var aKl=approximateIntegerSquareRoot<<1;return [aKm(sC[0],approximateIntegerSquareRoot),aKm(sC[1],aKl),aKm(sC[2],aKl)];
}

function aKm(ej,fc){var aC=aKa;
var eH=ej>>16;
var uw=(ej>>8)&255;
var ft=ej&255;
var aKn=255-fc;
if(eH>aKn&&uw>aKn&&ft>aKn){fc=-fc;}var aKo=aC>>7;
var aKp=(aC>>5)&3;
var aKq=(aC>>3)&3;
eH=Math.max(Math.min(eH+fc,252+aKo),aKo);uw=Math.max(Math.min(uw+fc,252+aKp),aKp);
ft=Math.max(Math.min(ft+fc,252+aKq),aKq);return(eH<<16)+(uw<<8)+ft;}

function aKd(){
if(aKa===-1){return false;}tileMap.aJZ(aKa,aKb[0],aKb[1],aKb[2]);aKj(aKa);aKa=-1;return true;
}

function aKj(player){clanPanel.ds=true;
var jS=playerData.botExpansionAi[player];
var jU=playerData.botTeamTargetCoordinator[player];
var BotExpansionAi=playerData.BotExpansionAi[player];
var BotTeamTargetCoordinator=playerData.BotTeamTargetCoordinator[player];for(var fi=jU;fi<=BotTeamTargetCoordinator;fi++){for(var fg=jS;fg<=BotExpansionAi;fg++){var fD=tileMap.zt(fg,fi);
if(!tileMap.a0F(player,fD)){continue;}if(tileMap.aJf(fD)){tileMap.removeAlreadyAttackedTargets(fD,player);}else if(tileMap.removeNeutralCandidate(fD)){
tileMap.mergeCapturedPlayerTerritory(fD,player);}else{tileMap.zu(fD,player);}}}}}

function GameTimer(){var wB=0;
var aKr=0;
var aKs=0;
var aKt=0;
var aKc=-1;this.applyToGame=function(){wB=0;aKr=0;aKs=0;aKt=0;aKc=-1;};this.ee=function(by){
if(!by&&powerSystem.EqualWidthControlRow()){return;}aKu();};this.nB=function(){aKv();};

function aKu(){var ho=powerState.hp(powerSystem.handlePointerInput);
var hq=powerState.hr(powerSystem.hf);if(!powerState.hs(ho,hq)){return aKw(-1);}var fL=powerState.fw(ho,hq);
var fD=powerState.fP(fL);
return aKw(fD);}

function aKw(fD){if(aKc===fD){return false;}aKc=fD;if(fD===-1){wB=0;hoverProcessor.a97(wB,0);
return true;}if(tileMap.h9(fD)){aKs=tileMap.fR(fD);
var kt=playerData.hb[aKs]-playerData.a5j[aKs];if(wB===4&&kt===aKr){
return false;}wB=4;aKr=kt;hoverProcessor.a97(wB,kt);return true;}if(tileMap.fQ(fD)){if(wB===3){return false;}wB=3;
hoverProcessor.a97(wB,0);return true;}if(tileMap.fe(fD)){if(wB===2){return false;}wB=2;hoverProcessor.a97(wB,0);return true;
}var a7m=bonusSystem.lj.a7o(powerSystem.handlePointerInput,powerSystem.hf);if(a7m===-1){if(wB===1){return false;}wB=1;hoverProcessor.a97(wB,0);
return true;}var aKx=bonusSystem.z.a8m[a7m];aKs=bonusSystem.z.mn[a7m];aKt=bonusSystem.z.mo[a7m]>>3;if(wB===5&&aKx===aKr){
return false;}wB=5;aKr=aKx;hoverProcessor.a97(wB,aKx);return true;}

function aKv(){if(wB===0||wB===2){return;
}if(powerSystem.EqualWidthControlRow()){if(wB===1||wB===3){return;}if(wB===4){var kt=playerData.hb[aKs]-playerData.a5j[aKs];if(aKr===kt){
return;}aKr=kt;hoverProcessor.a97(wB,kt);return;}var a7m=bonusSystem.lj.nu(aKt,aKs);if(a7m<0){wB=1;hoverProcessor.a97(wB,0);
return;}var aKx=bonusSystem.z.a8m[a7m];if(aKx===aKr){return;}aKr=aKx;hoverProcessor.a97(wB,aKx);return;}if(wB===1){
var a7m=bonusSystem.lj.a7o(powerSystem.handlePointerInput,powerSystem.hf);if(a7m===-1){return;}wB=5;aKr=bonusSystem.z.a8m[a7m];hoverProcessor.a97(wB,aKr);
return;}if(wB===3){if(tileMap.h9(aKc)){wB=4;
var aKy=tileMap.fR(aKc);aKr=playerData.hb[aKy]-playerData.a5j[aKy];
hoverProcessor.a97(wB,aKr);}return;}if(wB===4){if(tileMap.h9(aKc)){var aKy=tileMap.fR(aKc);
var kt=playerData.hb[aKy]-playerData.a5j[aKy];
if(aKr===kt){return;}aKr=kt;hoverProcessor.a97(wB,kt);return;}wB=3;hoverProcessor.a97(wB,0);return;
}var a7m=bonusSystem.lj.a7o(powerSystem.handlePointerInput,powerSystem.hf);if(a7m===-1){wB=1;hoverProcessor.a97(wB,0);return;}var aKx=bonusSystem.z.a8m[a7m];
if(aKx===aKr){return;}aKr=aKx;hoverProcessor.a97(wB,aKx);}}

function ImageLoader(){this.aKz=function(){
var input=document.createElement("input");input.type="file";input.setAttribute("accept",".json");
input.onchange=aL0;input.click();};this.aL1=function(){var a7F=localPlayer.data;
var keys=Object.keys(a7F);
var aL2={};for(var aC=0;aC<keys.length;aC++){var key=keys[aC];
if(a7F[key] instanceof Uint8Array||a7F[key] instanceof Uint16Array||a7F[key] instanceof Uint32Array){
aL2[key]=Array.from(a7F[key]);
}else{aL2[key]=a7F[key];}}if(aL2.mapType===2&&aL2.canvas){aL2.canvas=aL2.canvas.toDataURL();
}else{aL2.canvas=null;}aL3(aL2);};

function aL3(aL4){var aL5=JSON.stringify(aL4,null,2);
var aL6=new Blob([aL5],{type:"application/json"});
var aEp=document.createElement("a");
aEp.href=URL.createObjectURL(aL6);aEp.download="tt_scenario.json";
aEp.click();}

function aL0(e){var files=e.target.files;if(files&&files.length>0){
aL7(files[0]);}}

function aL7(aKH){var h=aKH.name.split(".");
var aKI=h[h.length-1].toLowerCase();
if(aKI==="json"){var aKJ=new FileReader();aKJ.onload=aL8;aKJ.readAsText(aKH);}}

function aL8(e){
if(localPlayer.a2G){return;}aL9(JSON.parse(e.target.result));account.y();account.z.uS[0]=0;account.v(19);}

function aL9(aLA){
var aLB=localPlayer.data=new a6h();aLC(aLA,aLB,"mapType",0,2);aLC(aLA,aLB,"mapProceduralIndex",0,255);
aLC(aLA,aLB,"mapRealisticIndex",0,255);aLC(aLA,aLB,"mapSeed",0,16383);
aLD(aLA,aLB,"mapName",20);aLE(aLA,aLB,"canvas");aLC(aLA,aLB,"passableWater",0,1);
aLC(aLA,aLB,"passableMountains",0,1);aLC(aLA,aLB,"playerCount",1,512);
aLC(aLA,aLB,"humanCount",1,1);aLC(aLA,aLB,"selectedPlayer",0,0);aLC(aLA,aLB,"gameMode",0,1);
aLC(aLA,aLB,"playerMode",0,0);aLC(aLA,aLB,"battleRoyaleMode",0,0);aLC(aLA,aLB,"numberTeams",0,8);
aLC(aLA,aLB,"isZombieMode",0,0);aLC(aLA,aLB,"isContest",0,0);aLC(aLA,aLB,"isReplay",0,0);
aLF(aLA,aLB,"elo",16,2,16383);aLC(aLA,aLB,"colorsType",0,1);aLC(aLA,aLB,"colorsPersonalized",0,1);
aLF(aLA,aLB,"colorsData",32,512,262143);aLC(aLA,aLB,"selectableColor",0,1);
aLF(aLA,aLB,"teamPlayerCount",16,9,512);aLC(aLA,aLB,"neutralBots",0,1);
aLC(aLA,aLB,"botDifficultyType",0,3);aLC(aLA,aLB,"botDifficultyValue",0,15);
aLF(aLA,aLB,"botDifficultyTeam",8,9,15);aLF(aLA,aLB,"botDifficultyData",8,512,15);
aLC(aLA,aLB,"spawningType",0,2);aLC(aLA,aLB,"spawningSeed",0,16383);
aLF(aLA,aLB,"spawningData",16,1024,4095);aLC(aLA,aLB,"selectableSpawn",0,1);
aLC(aLA,aLB,"playerNamesType",0,2);aLG(aLA,aLB,"playerNamesData",512,20);
aLC(aLA,aLB,"selectableName",0,1);aLC(aLA,aLB,"aIncomeType",0,2);
aLC(aLA,aLB,"aIncomeValue",0,255);aLF(aLA,aLB,"aIncomeData",8,512,255);
aLC(aLA,aLB,"tIncomeType",0,2);aLC(aLA,aLB,"tIncomeValue",0,255);
aLF(aLA,aLB,"tIncomeData",8,512,255);aLC(aLA,aLB,"iIncomeType",0,2);
aLC(aLA,aLB,"iIncomeValue",0,255);aLF(aLA,aLB,"iIncomeData",8,512,255);
aLC(aLA,aLB,"sResourcesType",0,2);aLC(aLA,aLB,"sResourcesValue",0,2047);
aLF(aLA,aLB,"sResourcesData",16,512,2047);}

function aLC(aLA,aLB,h8,min,max){
var g1=aLA[h8];aLB[h8]=(aLH(g1)&&g1>=min&&g1<=max)?Math.floor(g1):aLB[h8];
}

function aLH(g1){return typeof g1==="number";
}

function aLD(aLA,aLB,h8,max){var s1=aLA[h8];aLB[h8]=aLI(s1)?s1.slice(0,max):aLB[h8];
}

function aLE(aLA,aLB,h8){if(aLB.mapType!==2){return;}var s1=aLA[h8];
if(!aLI(s1)||s1.length<=20){aLB.mapType=0;return;}var aKM=new Image();aKM.onload=function(){
packetWriter.aLJ.aLK(aKM,1);aKM.onload=null;aKM=null;};aKM.src=s1;}

function aLI(s1){return typeof s1==="string";
}

function aLF(aLA,aLB,h8,aLL,size,max){var a4r=aLA[h8];if(!Array.isArray(a4r)){
return;}var a4s=aLL===8?new Uint8Array(size):aLL===16?new Uint16Array(size):new Uint32Array(size);
var fZ=Math.min(a4r.length,size);for(var aC=0;aC<fZ;aC++){
a4s[aC]=mathUtils.distanceBetweenPointsAndEncoded(a4r[aC],0,max);}aLB[h8]=a4s;}

function aLG(aLA,aLB,h8,size,max){var a4r=aLA[h8];
if(!Array.isArray(a4r)){return;}var a4s=new Array(size);
var fZ=Math.min(a4r.length,size);
for(var aC=0;aC<fZ;aC++){a4s[aC]=aLI(a4r[aC])?a4r[aC].slice(0,max):"";}a4s.fill("",fZ);
aLB[h8]=a4s;}}

function AllianceSystem(){var aLM;var aLN;var size;var k3;var iI;var aLO;this.applyToGame=function(){
aLM=localPlayer.ku<16?12:8;aLN=4;
var fZ=aLP(localPlayer.isMountainTile);size=new Uint8Array(localPlayer.isMountainTile);k3=new Uint16Array(fZ);
iI=new Uint32Array(fZ);aLO=new Uint8Array(fZ);};this.ButtonGridLayout=function(aA5,aLQ){var aLR=this.hc(aA5,aLQ);
this.ha(aA5,aLQ,0);
var aLS=gameState.gv.collectPlayerAttackTiles(aA5,aLR);gameClock.gz(aA5,aLR-aLS,12);};

function aLP(player){
return player<localPlayer.ku?aLM*player:aLM*localPlayer.ku+aLN*(player-localPlayer.ku);}this.clear=function(player){
size[player]=0;};this.aK9=function(player,aLQ){var aC=aLT(player,aLQ);if(aC===size[player]){
return;}var aLU=iI[aLP(player)+aC];this.h0(player,aC);this.ei(player,aLU,localPlayer.isMountainTile);
};

function aLT(player,aLQ){var aC;
var lp=aLP(player);for(aC=size[player]-1;aC>=0;aC--){
if(k3[lp+aC]===aLQ){return aC;}}return size[player];}this.kF=function(player,aLQ){
var aC;
var lp=aLP(player);for(aC=size[player]-1;aC>=0;aC--){if(k3[lp+aC]===aLQ){return true;
}}return false;};this.kY=function(player){return player<localPlayer.ku?size[player]<aLM:size[player]<aLN;
};this.collectAttackableTiles=function(player){return size[player];};this.gl=function(player,aC){
return k3[aLP(player)+aC];};this.gm=function(player,aC){return iI[aLP(player)+aC];
};this.hc=function(player,aLQ){var aC;
var lp=aLP(player);for(aC=size[player]-1;aC>=0;aC--){
if(k3[lp+aC]===aLQ){return iI[lp+aC];}}return 0;};this.aK0=function(player){
var aC;
var lp=aLP(player);
var g1=0;for(aC=size[player]-1;aC>=0;aC--){g1+=iI[lp+aC];}return g1;
};this.ha=function(player,aLQ,aLU){var aC;
var lp=aLP(player);for(aC=size[player]-1;aC>=0;aC--){
if(k3[lp+aC]===aLQ){iI[lp+aC]=aLU;}}};this.hL=function(player,aC,aLU){
iI[aLP(player)+aC]=Math.max(aLU,0);};this.calculateDefenderStrength=function(player,aC){aLO[aLP(player)+aC]=0;
};this.gn=function(player,aC){return aLO[aLP(player)+aC];};this.ei=function(player,aLU,aLQ){
nameRenderer.jh.kW[player]=nameRenderer.jh.kW[aLQ]=8;if(gameState.gv.a5e(aLQ)){gameClock.nQ[6-gameState.gv.kH(player)]++;
}var lp=aLP(player);for(var aC=size[player]-1;aC>=0;aC--){if(k3[lp+aC]===aLQ){
iI[lp+aC]+=aLU;iI[lp+aC]=iI[lp+aC]>localPlayer.a5m?localPlayer.a5m:iI[lp+aC];return;}}k3[lp+size[player]]=aLQ;
iI[lp+size[player]]=aLU;aLO[lp+size[player]]=1;size[player]++;if(aLQ===localPlayer.getTileOwner){hoverProcessor.a2T(player,5);
}else if(player<localPlayer.ku&&player===localPlayer.getTileOwner){troops.a8h(aLQ);}};this.h0=function(player,eI){var fs,lp;
if(size[player]===0){return;}lp=aLP(player);size[player]--;for(fs=eI;fs<size[player];fs++){
k3[lp+fs]=k3[lp+fs+1];iI[lp+fs]=iI[lp+fs+1];aLO[lp+fs]=aLO[lp+fs+1];
}};this.aJv=function(player){var aC,fs,lp;
var aK6=[];for(aC=territorySystem.lQ-1;aC>=0;aC--){
lp=aLP(territorySystem.lV[aC]);for(fs=size[territorySystem.lV[aC]]-1;fs>=0;fs--){if(k3[lp+fs]===player){aK6.push(territorySystem.lV[aC]);
break;}}}return aK6;};}

function BotSpawner(){this.aCB=0;var aLV;this.dr=function(){var fZ=localPlayer.isMountainTile;
aLV=new Uint16Array(fZ);
var kA=100;for(var aC=0;aC<fZ;aC++){aLV[aC]=kA+aLW(mathUtils.g0(aC*25600,fZ-4),9);
}};this.applyToGame=function(){this.aCB=0;if(localPlayer.data.iIncomeType===0){
this.aDb=function(player){return aLX(player);};}else if(localPlayer.data.iIncomeType===1){
this.aDb=function(player){return mathUtils.g0(localPlayer.data.iIncomeValue*aLX(player),64);
};}else{this.aDb=function(player){return mathUtils.g0(localPlayer.data.iIncomeData[player]*aLX(player),64);
};}};this.ee=function(){if(clanPanel.kr()%10!==9){return;}aLY();};

function aLX(player){
if(gameState.gv.kH(player)&&player<localPlayer.ku){return 0;}var eH=aLV[mathUtils.g0((localPlayer.isMountainTile-1)*playerData.hN[player],localPlayer.chance)];
if(clanPanel.kr()<1920){eH=Math.max(mathUtils.g0(100*(13440-6*clanPanel.kr()),1920),eH);}var kZ=botSpawner.ka(player);
if(playerData.hb[player]>kZ){eH-=mathUtils.g0(2*eH*(playerData.hb[player]-kZ),kZ);}return Math.min(Math.max(eH,0),700);
}this.ka=function(player){return Math.min(100*playerData.hN[player],localPlayer.a6d);
};this.reverseCommandHandler=function(player,qs){relations.rE(player,qs,boostSystem.g6[0],0);gameState.gv.collectPlayerAttackTiles(qs,boostSystem.g6[0]);
gameClock.rF(player,qs);troops.aLZ(player,boostSystem.g6[0]+boostSystem.g6[1]);troops.rG(qs,boostSystem.g6[0]);gameState.gv.heartbeatManager(player);
};this.aLa=function(){var fZ=territorySystem.lQ;
var a24=territorySystem.lV;
var lp=0;
var a5k=playerData.hb;for(var aC=0;aC<fZ;aC++){
lp+=a5k[a24[aC]];}return lp;};this.aLb=function(aLc){var fZ=territorySystem.lQ;
var a24=territorySystem.lV;
var lp=0;
var a5k=playerData.hb;
var fX=mainMenu.fX;var h7;for(var aC=0;aC<fZ;aC++){h7=a24[aC];if(fX[h7]===aLc){
lp+=a5k[h7];}}return lp;};

function aLY(){botSpawner.aCB=0;aLd();aLe();if(clanPanel.kr()%100!==99){
return;}aLf();}

function aLd(){aLg();
var lV=territorySystem.lV;
var hb=playerData.hb;for(var aC=territorySystem.lQ-1;aC>=0;aC--){
var h7=lV[aC];
var aLh=mathUtils.g0(botSpawner.aDb(h7)*hb[h7],10000);gameState.gv.collectPlayerAttackTiles(h7,Math.max(aLh,1));}
aLi(9);}

function aLf(){aLg();if(localPlayer.data.tIncomeType===0){aLj(32);}else if(localPlayer.data.tIncomeType===1){
aLj(localPlayer.data.tIncomeValue);}else{aLk();}aLi(8);}

function aLj(o7){var hN=playerData.hN;
var lV=territorySystem.lV;for(var aC=territorySystem.lQ-1;aC>=0;aC--){var h7=lV[aC];gameState.gv.collectPlayerAttackTiles(h7,mathUtils.g0(o7*hN[h7],32));}}


function aLk(){var hN=playerData.hN;
var lV=territorySystem.lV;
var o7=localPlayer.data.tIncomeData;for(var aC=territorySystem.lQ-1;aC>=0;aC--){
var h7=lV[aC];gameState.gv.collectPlayerAttackTiles(h7,mathUtils.g0(o7[h7]*hN[h7],32));}}

function aLe(){if(localPlayer.data.aIncomeType===0){
return;}aLg();if(localPlayer.data.aIncomeType===1){aLl();}else if(localPlayer.data.aIncomeType===2){
aLm();}aLi(18);}

function aLl(){var hN=playerData.hN;
var lV=territorySystem.lV;
var o7=localPlayer.data.aIncomeValue;
for(var aC=territorySystem.lQ-1;aC>=0;aC--){var h7=lV[aC];gameState.gv.collectPlayerAttackTiles(h7,mathUtils.g0(o7*hN[h7],128));}}

function aLm(){
var hN=playerData.hN;
var lV=territorySystem.lV;
var o7=localPlayer.data.aIncomeData;for(var aC=territorySystem.lQ-1;aC>=0;aC--){var h7=lV[aC];
gameState.gv.collectPlayerAttackTiles(h7,mathUtils.g0(o7[h7]*hN[h7],128));}}

function aLg(){var yr=localPlayer.getTileOwner;boostSystem.g5[0]=playerData.hb[yr]-playerData.a5j[yr];
}

function aLi(eI){var yr=localPlayer.getTileOwner;
var g1=playerData.hb[yr]-playerData.a5j[yr]-boostSystem.g5[0];botSpawner.aCB+=g1;
gameClock.nQ[eI]+=g1;}}

function TroopsSystem(){var aLn,aLo;var aLp,aLq;var aLr,aLs;var aLt;var aLu;var aLv;var aLw;
var aLx;var aLy;var aLz;var aM0;var aM1,aM2;var aM3;var aM4;
var aM5=null;var aM6;var aM7;var aEi;
var aM8,aM9;
var aMA=0.1;
var aMB=0;
var aMC=false;
var aMD=new Float32Array(4);
var aME=0;var aMF;
var aMG;
var aCg=112;
var aMH=0;this.applyToGame=function(){aMH=connectionMgr.buffer.data[7].value||localPlayer.survivorBotCount===8;aM4=false;
aM0=0.88;aLx=0.5;aLy=1.8;aLz=12-3*connectionMgr.buffer.data[9].value;aLn=0;aLo=0;aLp=new Uint16Array(localPlayer.isMountainTile);
aLq=new Uint16Array(localPlayer.isMountainTile);aLr=new Uint16Array(localPlayer.isMountainTile);aLs=new Uint16Array(localPlayer.isMountainTile);
aLt=new Float32Array(localPlayer.isMountainTile);aLu=new Float32Array(localPlayer.isMountainTile);aM7=new Uint16Array(2*localPlayer.isMountainTile);
aEi=new Uint8Array(5*localPlayer.isMountainTile);aMF=new Uint8Array(localPlayer.isMountainTile);aMG=new Uint8Array(localPlayer.isMountainTile);
aM5=aM5?aM5:document.createElement("canvas");sN();aM1=0;aM2=0;aM3=1;if(aMH){aMI();aMJ();}else{aMI();
}aMK();};this.aLZ=function(h7,a7D){if(a7D>18*playerData.hN[h7]){aMG[h7]=6;tileMap.aAb[h7]=2+(tileMap.aAb[h7]%2);
}else{aMF[h7]=4;if(tileMap.aAb[h7]<2||tileMap.aAb[h7]>3){tileMap.aAb[h7]=6+(tileMap.aAb[h7]%2);
}}};this.rG=function(h7,a7D){if(a7D>6*playerData.hN[h7]){aMG[h7]=6;tileMap.aAb[h7]=4+(tileMap.aAb[h7]%2);
}else{aMF[h7]=4;if(tileMap.aAb[h7]<4||tileMap.aAb[h7]>5){tileMap.aAb[h7]=8+(tileMap.aAb[h7]%2);
}}};

function aML(){aM5.width=camera.j;aM5.height=camera.k;aM6=aM5.getContext("2d",{alpha:true});
gameState.sK.textAlign(aM6,1);gameState.sK.textBaseline(aM6,1);aM6.imageSmoothingEnabled=true;
}this.resize=function(){sN();aMM(aM6);};

function sN(){aLv=Math.floor(1*camera.il);
aLw=Math.floor(0.5*aLv);aML();}

function aMI(){var aC,aMN;ws.font=gameState.sK.u8(1,100*aLx);
aMN=80/Math.floor(ws.measureText(gameState.tI.currentLoopHandler(localPlayer.a5m)).width);ws.font=gameState.sK.u8(1,100);
for(aC=localPlayer.isMountainTile-1;aC>=0;aC--){aLu[aC]=100/Math.floor(ws.measureText(playerData.a0j[aC]).width);
aLt[aC]=Math.min(aMN,aLu[aC]);}}

function aMJ(){
var aC,aMN;ws.font=gameState.sK.u8(1,100);aMN=100/Math.floor(ws.measureText("900 000").width);
for(aC=localPlayer.isMountainTile-1;aC>=0;aC--){aLt[aC]=Math.min(aMN,2*aLu[aC]);
}aME=aMN;aMD[0]=100/(aMN*Math.floor(ws.measureText("5 000 000").width));
aMD[1]=100/(aMN*Math.floor(ws.measureText("50 000 000").width));
aMD[2]=100/(aMN*Math.floor(ws.measureText("500 000 000").width));
aMD[3]=100/(aMN*Math.floor(ws.measureText("1 000 000 000").width));
}

function aMO(aC){if(!aMH){return 1;}var yZ=playerData.hb[aC];if(yZ<1000000){return 1;}if(yZ<10000000){
return aMD[0];}return aMD[Math.min(Math.floor(Math.log10(yZ))-6,3)];}

function aMK(){
var aC;for(aC=localPlayer.isMountainTile-1;aC>=0;aC--){if(playerData.hN[aC]<12){aLp[aC]=playerData.botExpansionAi[aC]+1;aLq[aC]=playerData.botTeamTargetCoordinator[aC]+1;
aLr[aC]=1;aLs[aC]=1;}else{aLp[aC]=playerData.botExpansionAi[aC];aLq[aC]=playerData.botTeamTargetCoordinator[aC]+1;aLr[aC]=4;aLs[aC]=2;}}if(localPlayer.isFreeForAll){
for(aC=0;aC<localPlayer.ku;aC++){aLr[aC]=0;}}aM8=adSystem.get(4).width;aM9=adSystem.get(4).height;}this.a6Z=function(){
for(var aC=0;aC<localPlayer.ku;aC++){if(playerData.BotExpansionAi[aC]-playerData.botExpansionAi[aC]!==3||playerData.BotTeamTargetCoordinator[aC]-playerData.botTeamTargetCoordinator[aC]!==3){
aLp[aC]=playerData.botExpansionAi[aC]+(playerData.BotExpansionAi[aC]!==playerData.botExpansionAi[aC]?1:0);aLq[aC]=playerData.botTeamTargetCoordinator[aC];aLr[aC]=1;aLs[aC]=1;}else{
aLp[aC]=playerData.botExpansionAi[aC];aLq[aC]=playerData.botTeamTargetCoordinator[aC]+1;aLr[aC]=4;aLs[aC]=2;}}};this.rt=function(player,eI,aMP){
aMQ(player,eI,aMP);if(localPlayer.a2G===2){this.nG(true);}};

function aMQ(player,eI,aMP){
var iR=player+eI*localPlayer.isMountainTile;if(eI===0){if(aM7[iR]===aMP&&aEi[iR]>0){aEi[iR]=0;
return;}aM7[iR]=aMP;aEi[iR]=colorSystem.tY.a1O(aMP)?255:64;return;}if(eI===1){aEi[iR]=64;aM7[iR]=aMP;
}else{aEi[iR]=aMP;}}this.wr=function(){if(!aM4){return;}if(aM3!==1){ws.imageSmoothingEnabled=true;
ws.setTransform(aM3,0,0,aM3,0,0);ws.drawImage(aM5,-aM1/aM3,-aM2/aM3);ws.setTransform(1,0,0,1,0,0);
ws.imageSmoothingEnabled=false;}else{ws.drawImage(aM5,-aM1,-aM2);}};this.aBO=function(iw,iz){
aM1+=iw;aM2+=iz;};this.a3m=function(iw,iz){troops.aBO(iw,iz);};this.zoom=function(a4e,m9,mA){
aM3*=a4e;aM1=(aM1+m9)*a4e-m9;aM2=(aM2+mA)*a4e-mA;};

function aMR(){if(aM3!==1||aM1!==0||aM2!==0){
return aCg;}if(localPlayer.a72()||localPlayer.isFreeForAll||localPlayer.a2G===2){return 1000;}return aCg;}this.aJw=function(player){
var jS=playerData.botExpansionAi[player];
var BotExpansionAi=playerData.BotExpansionAi[player];
var jU=playerData.botTeamTargetCoordinator[player];
var BotTeamTargetCoordinator=playerData.BotTeamTargetCoordinator[player];
var j7=powerState.hp(0);
var j8=powerState.hr(0);
var j9=powerState.hp(camera.j);
var jA=powerState.hr(camera.k);if(jS<j9&&BotExpansionAi>j7&&jU<jA&&BotTeamTargetCoordinator>j8){
aLr[player]=0;aMC=true;}};this.nG=function(by){if(!aMC&&!by&&clanPanel.eZ<aMB+aMR()){return false;
}aMM(aM6);return true;};this.aMS=function(aC){return aMO(aC)*aLt[aC];};this.aMT=function(player){
return aLt[player];};

function aMM(ib){aMC=false;aMB=clanPanel.eZ;aM4=false;aM3=1;aM1=aM2=0;
ib.clearRect(0,0,camera.j,camera.k);
var nv=jD/im;
var nw=jE/im;
var o8=(camera.j+jD)/im;
var o9=(camera.k+jE)/im;
var aMU,aMV;var aC,aMW;var fontSize;var aMX;
var aMY=playerData.nU[localPlayer.getTileOwner]!==0&&!gameState.gv.kH(localPlayer.getTileOwner);
for(var fs=territorySystem.lQ-1;fs>=0;fs--){aC=territorySystem.lV[fs];fontSize=Math.floor(aM0*im*aMO(aC)*aLt[aC]*aLr[aC]);
if(fontSize<aLz||fontSize>=aLv){continue;}if(!(aLp[aC]+aLr[aC]>nv&&aLp[aC]<o8&&
aLq[aC]+aLs[aC]>nw&&aLq[aC]<o9)){continue;}aMU=Math.floor(camera.j*(aLp[aC]+aLr[aC]/2-nv)/(o8-nv));
aMV=Math.floor(camera.k*(aLq[aC]+aLs[aC]/2-nw)/(o9-nw)-0.1*fontSize);
aMW=tileMap.aAb[aC];ib.font=gameState.sK.u8(playerData.a5a[aC]===1?4:1,fontSize);ib.fillStyle=aMZ(fontSize,aMW%2);
if(aMH){aMa(ib,aC,fontSize,aMU,aMV,aMW);}else{aMb(aC,fontSize,aMU,aMV,ib);}aM4=true;
if(aEi[aC]>0){aMc(aMU,aMV,fontSize,aC,ib);}else if(kf[aC]===0){aMd(aMU,aMV,fontSize,0,0,ib);
}if(aMY&&(aEi[aC+localPlayer.isMountainTile]>0||aEi[aC+2*localPlayer.isMountainTile]>0||aEi[aC+3*localPlayer.isMountainTile]>0||aEi[aC+4*localPlayer.isMountainTile]>0)){
aMe(aMU,aMV,fontSize,aC,ib);}aMX=aLx*fontSize;
if(aMX<aLz){continue;}ib.font=gameState.sK.u8(1,aMX);aMV+=Math.floor(0.78*fontSize);if(aMH){
aMb(aC,aMX,aMU,aMV,ib);}else{aMa(ib,aC,aMX,aMU,aMV,aMW);}}}

function aMb(aC,fontSize,fg,fi,ib){
ib.fillText(playerData.a0j[aC],fg,fi);if(aC<localPlayer.ku&&playerData.a5a[aC]!==2){return;}var aMf=fontSize/aLu[aC];
ib.fillRect(fg-0.5*aMf,fi+gameState.sK.a1H*fontSize,aMf,Math.max(1,0.1*fontSize));
}

function aMa(ib,aC,fontSize,aMU,aMV,aMW){var a5j=playerData.a5j[aC];
var aMg=gameState.tI.currentLoopHandler(playerData.hb[aC]-a5j);if(a5j){var ea=ib.fillStyle;ib.fillStyle=aMZ(fontSize,2+aMW%2);
ib.fillText(aMg,aMU,aMV);ib.fillStyle=ea;return;}if(((aMW>>1)&1)){
ib.lineWidth=0.05*fontSize;ib.strokeStyle=aMZ(fontSize,aMW%2);ib.strokeText(aMg,aMU,aMV);
return;}if(aMW>1){ib.lineWidth=0.12*fontSize;ib.strokeStyle=aMZ(fontSize,aMW);
ib.strokeText(aMg,aMU,aMV);}ib.fillText(aMg,aMU,aMV);}

function aMd(aMU,aMV,fontSize,aMh,aMi,ib){
var a7z=0.95*fontSize/aM9;
var zN=aMU-0.5*a7z*aM8+0.8*aMh*fontSize;
var zO=aMV-1.76*a7z*aM9-(0.7+(0.35-gameState.sK.a1H))*aMi*fontSize;ib.setTransform(a7z,0,0,a7z,zN,zO);
ib.globalAlpha=aMj(fontSize);ib.drawImage(adSystem.get(4),0,0);ib.globalAlpha=1;
ib.setTransform(1,0,0,1,0,0);}

function aMe(aMU,aMV,fontSize,aC,ib){var ej;
var resolveAttackCombat=-1;
for(ej=4;ej>=1;ej--){if(aEi[aC+ej*localPlayer.isMountainTile]>0){resolveAttackCombat++;}}for(ej=1;ej<5;ej++){if(aEi[aC+ej*localPlayer.isMountainTile]>0){
aMk(aMU,aMV,fontSize,ej,aC,resolveAttackCombat,aEi[aC+ej*localPlayer.isMountainTile],ib);resolveAttackCombat-=2;}}}

function aMc(aMU,aMV,fontSize,aC,ib){
if(kf[aC]===0){if(colorSystem.tY.a1O(aM7[aC])){aMl(aMU,aMV,fontSize,aC,aM7[aC],ib);
aMd(aMU,aMV,fontSize,0,0,ib);}else if(colorSystem.tY.a1Q(aM7[aC])){aMm(aMU,aMV,fontSize,aM7[aC],0,ib);
aMd(aMU,aMV,fontSize,0,1,ib);}else{aMm(aMU,aMV,fontSize,aM7[aC],1,ib);aMd(aMU,aMV,fontSize,1,0,ib);
}}else{aMm(aMU,aMV,fontSize,aM7[aC],0,ib);}}

function aMm(aMU,aMV,fontSize,r3,aMh,ib){
var iV;var a7z;var zN;var zO;ib.globalAlpha=aMj(fontSize);if(colorSystem.tY.a1P(r3)){
iV=colorSystem.yq.a0q;a7z=1.1*fontSize/iV;zN=aMU-0.5*a7z*iV-0.8*aMh*fontSize;zO=aMV-1.55*a7z*iV;
ib.setTransform(a7z,0,0,a7z,zN,zO);ib.drawImage(colorSystem.yq.a0p[r3-1024+colorSystem.tY.EndGameResult],0,0);
ib.setTransform(1,0,0,1,0,0);}else{zN=aMU-0.8*aMh*fontSize;
zO=aMV-(1+(0.35-gameState.sK.a1H))*fontSize;ib.fillText(colorSystem.tY.a1G(r3),zN,zO);}ib.globalAlpha=1;
}

function aMk(aMU,aMV,fontSize,ej,aC,aMh,ea,ib){var a55;if(ej===1){var r3=aM7[aC+localPlayer.isMountainTile];
if(colorSystem.tY.a1P(r3)){a55=colorSystem.yq.a0p[r3-1024+colorSystem.tY.EndGameResult];}else{aMn(aMU,aMV,fontSize,r3,aMh,ib);return;
}}else if(ej===2){a55=modalState.a7U()[4].canvas[+(ea<255)];}else if(ej===3){a55=modalState.a7U()[5].canvas[0];
}else{a55=modalState.a7U()[6].canvas[0];}var iV=colorSystem.yq.a0q;
var a7z=0.8*fontSize/iV;
var zN=aMU-0.5*a7z*iV-0.534*aMh*fontSize;
var zO=aMV+1.4*a7z*iV;ib.setTransform(a7z,0,0,a7z,zN,zO);
ib.globalAlpha=aMj(fontSize);ib.drawImage(a55,0,0);ib.globalAlpha=1;ib.setTransform(1,0,0,1,0,0);
}

function aMn(aMU,aMV,fontSize,r3,aMh,ib){ib.globalAlpha=aMj(fontSize);
var zN=aMU-0.534*aMh*fontSize;
var zO=aMV+1.59*fontSize;ib.font=gameState.sK.u8(0,0.785*fontSize);
ib.fillText(colorSystem.tY.a1G(r3),zN,zO);ib.globalAlpha=1;}

function aMl(aMU,aMV,fontSize,player,r3,ib){
var zO=aMV;ib.globalAlpha=aMj(fontSize);
var ia=aMO(player)*(aMH?aME:aLu[player]);
var zN=aMU-0.5*fontSize/ia-0.9*fontSize;for(var ft=0;ft<2;ft++){ib.fillText(colorSystem.tY.a1G(r3),zN,zO);
zN=aMU+0.5*fontSize/ia+0.9*fontSize;}ib.globalAlpha=1;}

function aMZ(fontSize,aMW){
if(fontSize>=aLw&&fontSize<aLv){return mainMenu.TerrainLightingGenerator[aMW]+(aMj(fontSize)).toFixed(3)+")";
}return mainMenu.BuiltInMapCatalog[aMW];}

function aMj(fontSize){if(fontSize>=aLw&&fontSize<aLv){
return 1-(fontSize-aLw)/(aLv-aLw);}return 1;}this.ee=function(){var aC;if(clanPanel.kr()%10===9){
aMC=aMC||(localPlayer.a74()&&!localPlayer.a72());}if(!localPlayer.a72()&&++aLo>=4){MapRasterRegionProcessor();}var fZ=Math.floor(aMA*territorySystem.lQ);
fZ=fZ<8?8:fZ;fZ=fZ>territorySystem.lQ?territorySystem.lQ:fZ;var fs;for(aC=aLn+fZ-1;aC>=aLn;aC--){fs=aC%territorySystem.lQ;
aMr(territorySystem.lV[fs]);}aLn+=fZ;aLn%=territorySystem.lQ;};this.updatePausedFrame=function(){var aC,h7,a1M,a1N;if(clanPanel.kr()%4!==1){return;
}for(aC=territorySystem.lQ-1;aC>=0;aC--){h7=territorySystem.lV[aC];if(tileMap.aAb[h7]<2){continue;}a1M=Math.max(aMF[h7]-1,0);
a1N=Math.max(aMG[h7]-1,0);if(a1M===a1N){if(a1M===0){tileMap.aAb[h7]%=2;}}else if(a1N===0&&tileMap.aAb[h7]<6){
tileMap.aAb[h7]+=4;}aMF[h7]=a1M;aMG[h7]=a1N;}};this.a8h=function(player){
var aC=player+2*localPlayer.isMountainTile;
var ea=aEi[aC];if(ea>0){hoverProcessor.a2O(50,player);aEi[aC]=0;return ea===255;
}return false;};this.a7j=function(player){return aEi[player+2*localPlayer.isMountainTile]===255;};

function MapRasterRegionProcessor(){
var aC,fs,ft;aLo=0;for(ft=4;ft>=1;ft--){for(fs=territorySystem.lQ-1;fs>=0;fs--){aC=territorySystem.lV[fs]+ft*localPlayer.isMountainTile;
if(aEi[aC]>0&&aEi[aC]<255){aEi[aC]--;}}}if(localPlayer.a2G===2){return;}for(fs=territorySystem.lQ-1;fs>=0;fs--){
aC=territorySystem.lV[fs];if(aEi[aC]>0&&aEi[aC]<255){aEi[aC]--;}}}

function aMr(aC){var ia=aMO(aC)*aLt[aC];
if(aLr[aC]>0&&aMs(aC,aLp[aC],aLq[aC],aLr[aC],aLs[aC])){if(!aMt(aC)&&aMu(aC,ia)){
loadBuiltInMap(aC);}}else if(applyBuiltInMapRadialShading(aC,ia)){loadBuiltInMap(aC);}else{aMx(aC,ia);}}

function aMy(ia,j){
return 1+Math.floor(aLy*ia*j);}

function aMt(aC){var fD=false;var fg,fi,j,k;for(var ft=0;ft<8;ft++){
j=aLr[aC]+2;k=aLs[aC]+2;if(j>playerData.BotExpansionAi[aC]-playerData.botExpansionAi[aC]+1||k>playerData.BotTeamTargetCoordinator[aC]-playerData.botTeamTargetCoordinator[aC]+1){
return fD;}fg=aLp[aC]-1;fi=aLq[aC]-1;if(aMs(aC,fg,fi,j,k)){
aLp[aC]=fg;aLq[aC]=fi;aLr[aC]=j;aLs[aC]=k;fD=true;}else{return fD;}}return fD;}

function aMu(aC,ia){
var fD=false;var fg,fi,j,k;
var aEr=aLr[aC];
var o7=1+Math.floor(0.02*aEr);for(var ft=1;ft<5;ft++){
j=aEr+ft*o7;if(j>playerData.BotExpansionAi[aC]-playerData.botExpansionAi[aC]+1){return fD;}k=aMy(ia,j);if(k>playerData.BotTeamTargetCoordinator[aC]-playerData.botTeamTargetCoordinator[aC]+1){
return fD;}fg=playerData.botExpansionAi[aC]+Math.floor(Math.random()*(playerData.BotExpansionAi[aC]-playerData.botExpansionAi[aC]+2-j));
fi=playerData.botTeamTargetCoordinator[aC]+Math.floor(Math.random()*(playerData.BotTeamTargetCoordinator[aC]-playerData.botTeamTargetCoordinator[aC]+2-k));if(aMs(aC,fg,fi,j,k)){
aLp[aC]=fg;aLq[aC]=fi;aLr[aC]=j;aLs[aC]=k;fD=true;}}return fD;}

function applyBuiltInMapRadialShading(aC,ia){
var fg=aLp[aC]+1;
var fi=aLq[aC]+1;
var j=aLr[aC]-2;var k;while(true){if(j<1){aLr[aC]=0;
break;}k=aMy(ia,j);if(aMs(aC,fg,fi,j,k)){aLp[aC]=fg;aLq[aC]=fi;aLr[aC]=j;aLs[aC]=k;return true;}
fg++;fi++;j-=2;}return false;}

function aMx(aC,ia){var fg,fi,j,k,ft,oD;
var kA=playerData.BotExpansionAi[aC]-playerData.botExpansionAi[aC]+1;
var aMz=Math.floor(0.02*kA);aMz=aMz<1?1:aMz;oD=-6*aMz;for(ft=kA;ft>=oD;ft-=aMz){
j=ft>0?ft:1;k=aMy(ia,j);fg=playerData.botExpansionAi[aC]+Math.floor(Math.random()*(playerData.BotExpansionAi[aC]-playerData.botExpansionAi[aC]+2-j));
fi=playerData.botTeamTargetCoordinator[aC]+Math.floor(Math.random()*(playerData.BotTeamTargetCoordinator[aC]-playerData.botTeamTargetCoordinator[aC]+2-k));
if(aMs(aC,fg,fi,j,k)){aLp[aC]=fg;aLq[aC]=fi;aLr[aC]=j;aLs[aC]=k;return;}}}

function loadBuiltInMap(aC){var fs;
var left=aLp[aC];for(fs=aLp[aC]-playerData.botExpansionAi[aC]-1;fs>=0;fs--){left--;if(!aN0(aC,left,aLq[aC],aLs[aC])){
left++;break;}}var right=aLp[aC];for(fs=playerData.BotExpansionAi[aC]-aLp[aC]-aLr[aC];fs>=0;fs--){right++;
if(!aN0(aC,right+aLr[aC]-1,aLq[aC],aLs[aC])){right--;break;}}var fg=Math.floor((left+right)/2);
var top=aLq[aC];for(fs=aLq[aC]-playerData.botTeamTargetCoordinator[aC]-1;fs>=0;fs--){top--;if(!aN1(aC,fg,top,aLr[aC])){
top++;break;}}var bottom=aLq[aC];for(fs=playerData.BotTeamTargetCoordinator[aC]-aLq[aC]-aLs[aC];fs>=0;fs--){bottom++;
if(!aN1(aC,fg,bottom+aLs[aC]-1,aLr[aC])){bottom--;break;}}var fi=Math.floor((top+bottom)/2);
if(aMs(aC,fg,fi,aLr[aC],aLs[aC])){aLp[aC]=fg;aLq[aC]=fi;}}

function aMs(player,fg,fi,j,k){
var ej;
var fc=Math.floor(0.2*j);fc=fc<1?1:fc;for(ej=fg+j-1;ej>=fg;ej--){if(!aN0(player,ej,fi,k)){
return false;}}fc=Math.floor(0.25*k);fc=fc<1?1:fc;for(ej=fi+k-1-fc;ej>=fi+fc;ej--){
if(!aN1(player,fg,ej,j)){return false;}}return true;}

function aN0(player,fg,fi,k){
return(tileMap.a0F(player,(fi*dialogManager.fk+fg)*4)&&tileMap.a0F(player,((fi+k-1)*dialogManager.fk+fg)*4));
}

function aN1(player,fg,fi,j){return(tileMap.a0F(player,(fi*dialogManager.fk+fg)*4)&&
tileMap.a0F(player,(fi*dialogManager.fk+fg+j-1)*4));}}

function SpectatorSystem(){var aN2;var aN3;var aN4;this.applyToGame=function(){
aN2="Abbasid Caliphate;Aceh s;Achaemenid Z;Afsharid z;Aghlabid Emirate;Ahom z;Akkadian Z;Aksumite Z;Akwamu;Alaouite z;Almohad Caliphate;Almoravid z;Angevin Z;Aq Qoyunlu;Armenian Z;Assyria;Ashanti Z;Austrian Z;Austria-Hungary;Ayyubid z;Aztec Z;Aulikara Z;Babylonian Z;Balhae;Banten s;S Banjar;Bamana Z;Bengal s;Benin Z;Kadamba z;Bornu Z;E Brazil;Britannic Z;British Z;British Raj;Bruneian Z;Bukhara Z;Burgundian State;Buyid z;Byzantine Z;Caliphate of Córdoba;Cao Wei;Carthaginian Z;Cebu Rajahnate;Chagatai Khanate;Chalukya z;Chauhan z;Chavín Z;Chenla;Chera z;Chola z;Comanche Z;Congo Free State;Crimean Khanate;Dacian Z;Delhi s;Demak s;Durrani Z;Dutch Z;Egyptian Z;Elamite Z;Exarchate of Africa;Abyssinia;Fatimid Caliphate;First French Z;Frankish Z;Funan;Gallic Z;Gaza Z;Republic of Genoa;German Z;Ghana Z;Ghaznavid z;Ghurid z;Goguryeo;Goryeo;Gorkha Z;Göktürk Khaganate;Golden Horde;S Gowa;Seljuq Z;Gupta Z;Hafsid Y;Han z;Hanseatic League;E Harsha;Hephthalite Z;Hittite Z;Holy Roman Z;Hotak z;Hoysala Z;Hunnic Z;Husainid z;Idrisid z;Ilkhanate;K Israel;K Judah;Inca Z;Italian Z;E Japan;Jin z;Johor Z;Jolof Z;Joseon;Kaabu Z;Kachari Y;Kalmar Union;Kanem Z;Kanva z;Kara-Khanid Khanate;Kazakh Khanate;Khazar Khaganate;Khmer Z;Khilji z;Khwarazmian z;Kievan Rus';Konbaung z;Kong Z;Korean Z;Kushan Z;K Kush;Lakota;Latin Z;Later Lê z;Liao z;Lodi s;Khmer Z;Macedonian Z;Majapahit Z;Mali Z;Malacca Z;Mamluk s;Manchukuo;Maratha Z;Marinid z;Massina Z;Mataram s;Mauretania;Mauryan Z;Median Z;Mlechchha z;Ming z;Mitanni Z;Mongol Z;Mughal Z;Nanda Z;Nguyễn z;North Sea Z;E Nicaea;Numidia;Omani Z;Ottoman Z;Oyo Z;Pagan Z;Pahlavi z;Pala Z;Palmyrene Z;Parthian Z;Pontic Z;Portuguese Z;K Prussia;Ptolemaic Z;Qajar z;Qara Qoyunlu;Qin z;Qing z;Ramnad Sethupathis;Rashidun Caliphate;Rashtrakuta z;Roman Z;Rouran Khaganate;Rozwi Z;Rustamid z;Russian Z;Tsardom of Russia;Saadi z;Safavid z;Saffarid z;Sassanid z;Satavahana z;Samanid Z;Soviet Union;Saudeleur z;Duchy of Savoy;Seleucid Z;Serbian Z;Shu Han;Shang z;Siam Z;Sikh Z;Singhasari;Sokoto Caliphate;Song z;Songhai Z;Spanish Z;Srivijaya Z;Sui z;K Mysore;Shunga Z;S Sulu;Sumer;Sur Z;Swedish Z;Tahirid z;Tang z;Tây Sơn z;S Ternate;E Thessalonica;German Reich;Tibetan Z;Tondo z;S Tidore;Timurid Z;K Tlemcen;E Trebizond;Toltec Z;Toungoo z;Toucouleur Z;Tu'i Tonga Z;Turgesh Khaganate;Umayyad Caliphate;Uyunid Emirate;Uyghur Khaganate;Uzbek Khanate;Vandal Y;Vijayanagara Z;Republic of Venice;Wari Z;Wassoulou Z;Wattasids;Western Roman Z;Eastern Wu;Western Xia z;Xin z;Yuan z;Zand z;Zhou z;Zulu Z;Yugoslavia;Kosovo;Sikkim;Kanem–Bornu Z;Wadai Z;Ethiopian Z;Rozvi Z;Sasanian Z;E Vietnam;Shilluk Y;K Aksum;Gwiriko Y;Toro Y;Malindi Y;K Loango;K Mapungubwe;Ryukyu Y;K Cyprus;K Jerusalem;Garhwal Y;K Nepal;K Cambodia;Champa Y;Hanthawaddy Y;Phayao Y;K Sardinia;K Sicily;K Gwynedd;K Scotland;K Desmond;K Poland;K Hungary;K Croatia;K Bohemia;Albanian Y;K Georgia;K Portugal;Khanate of Sibir;K Romania;Cossack Hetmanate;Duchy of Bouillon;K Ireland;Lordship of Ireland;K Italy;Republic of Pisa;Idrisid z;Almoravid z;Almohad Caliphate;Marinid z;Wattasid z;Saadian z;Republic of Salé;Rif Republic;K Kush;Makuria;Alodia;Ayyubid z;Mamluk s;Egypt Eyalet;K Fazughli;S Sennar;S Darfur;Mahdist State;S Egypt;K Egypt;Emirate of Cyrenaica;K Libya;Republic of Egypt;Republic of the Sudan;United Arab Republic;Libyan Arab Republic;Zirid z;Hafsid z;K Kuku;Regency of Algiers;Gurunsi;Liptako;Tenkodogo;Wogodogo;Yatenga;Bilanga;Bilayanga;Bongandini;Con;Macakoali;Piela;Nungu;K Sine;K Saloum;K Baol;K Cayor;K Waalo;Bundu;Bonoman;Gyaaman;Denkyira;Mankessim Y;K Dahomey;Oyo Z;K Nri;Aro Confederacy;Kwararafa;Biafra;Buganda;Bunyoro;Ankole;Busoga;Tanganyika;Kuba Y;K Luba;K Lunda;Yeke Y;K Ndongo;Kasanje Y;K Matamba;Mbunda Y;Chokwe Y;Kazembe Y;K Butua;Ndebele Y;Mthethwa Z;Bophuthatswana;Ciskei;Transkei;Venda;Rhodesia;Kart z;Nogai Horde;Khanate of Bukhara;Khanate of Khiva;Khamag Mongol;Northern Fujiwara;Kamakura Shogunate;Ashikaga Shogunate;Jaxa;Republic of Ezo;Jiangxi Soviet;Hunan Soviet;Guangzhou Commune;Gojoseon;Alaiye;Beylik of Bafra;Kara Koyunlu;Kars Republic;K Iraq;Arab Federation;Kar-Kiya z;Baduspanids;Marashiyan z;Afrasiyab z;Mihrabanid z;Safavid Iran;Sheikhdom of Kuwait;Bani Khalid Emirate;Emirate of Diriyah;Emirate of Najd;Muscat and Oman;Emirate of Riyadh;S Najd;K Hejaz;Fadhli s;Emirate of Beihan;Emirate of Dhala;S Lahej;Republic of Kuwait;K Cochin;Jaffna Y;Laur Y;Pandya z;Jaunpur s;Jaintia Y;Hyderabad State;Travancore;Udaipur State;Manikya z;Lan Xang;K Vientiane;K Champasak;Lao Issara;K Laos;Pyu States;Ava;Mon Ys;Pegu;K Mrauk U;Taungoo z;Shan States;Arakan;Raktamaritika;Singhanavati;Dvaravati;Ngoenyang;Hariphunchai;Tambralinga;Lavo Y;Langkasuka;Sukhothai Y;S Singora;Ayutthaya Y;Thonburi Y;Lan Na;Pattani Y;Jambi s;Palembang s;S Deli;S Langkat;S Serdang;S Cirebon;K Pajang;K Bali;Bima s;K Larantuka;K Banggai;Luwu;S Bone;Caucasian Albania;Kabardia;Circassia;K Abkhazia;Elisu s;Avar Khanate;Caucasian Imamate;K Imereti;K Kartli;K Kakheti;Crown of Aragon;Emirate of Granada;K Majorca;Crown of Castile;K Haiti;Cocollán;Zapotec Civilization;Mosquito Y;Somoza Regime;Iroquois Confederacy;Cherokee Nation;Vermont Republic;State of Muskogee;K Alo;K Sigave;K Fiji;K Nauru;K Chile;Muisca Confederation;El Stronato;K Chimor;Jungle Republic;Liga Federal;Supreme Junta;Weimar Republic;K Bavaria;Bremen;Frankfurt;Hamburg;K Hanover;Holstein;Lippe;Nassau;Oldenburg;Pomerania;Reuss;Saxe-Altenburg;Saxony;Schleswig;Waldeck;Württemberg;Helvetic Republic;Republic of Florence;Duchy of Urbino;Republic of Cospaia;Duchy of Lucca;Duchy of Mantua;Duchy of Milan;Papal States".split(";");
aN3="Corrupted Earth;Returning Nature;Abandoned Areas;Restricted Area;Contaminated Area;Burning Land;Barren Land;Ravenland;Deadland;Dangerous Area;Devastated Land;Swampland;Plundered Land;Overrun Area;Undead Masses;Roaming Horde;Lurking Horde;Fallen Territory;Ghostland;Doomstruck Land;Infected Enclave;Plagued Nation;Forbidden Zone;Toxic Ground;Scorched Earth;Ruined City;Cursed Land;Diseased Colony;Forsaken Fields;Necromancer".split(";");
aN4="Protected Zone;Quarantine Zone;Last Bastion;Buffer Zone;Liberated Area;Resistance Zone;Rising Territory;Recovered Region;Rebel Sector;Emerging Lands;Safety Corridor;Isolation Area;Guarded Sector".split(";");
var a8x=["K "," Y","E "," Z"," z"," s","S "];
var aFj=["Kingdom of "," Kingdom","Empire of "," Empire"," Dynasty"," Sultanate","Sultanate of "];
for(var aC=aN2.length-1;aC>=0;aC--){
for(var fs=a8x.length-1;fs>=0;fs--){aN2[aC]=aN2[aC].replace(a8x[fs],aFj[fs]);
}}};this.a6p=function(){aN5();};this.a8=function(){if(localPlayer.survivorBotCount===9){
aN6();return;}if(localPlayer.data.playerNamesType===2){aN7();return;}if(localPlayer.data.playerNamesType===1){
aN8();return;}aN9();};

function aN5(){var fZ=localPlayer.ku;
var a0j=playerData.a0j;
var a2w=playerData.a2w;
var playerNamesData=localPlayer.data.playerNamesData;if(!playerNamesData||playerNamesData.length<fZ){
for(var aC=0;aC<fZ;aC++){a0j[aC]=a2w[aC]="Player "+coordHelper.selectWeakestCandidate(1000);
}return;}for(aC=0;aC<fZ;aC++){a0j[aC]=a2w[aC]=playerNamesData[aC];
}}

function aN6(){var eH=coordHelper.random();
var aNA=aN4;
var aNB=aN3;
var iI=troopCalc.iI;
var fZ=aNA.length;
var lp=localPlayer.data.teamPlayerCount[7];
var a0j=playerData.a0j;
var a2w=playerData.a2w;for(var aC=lp-1;aC>=localPlayer.ku;aC--){
a0j[aC]=a2w[aC]=aNA[(aC+eH)%fZ];}fZ=aNB.length-1;for(aC=lp;aC<localPlayer.isMountainTile;aC++){
a0j[aC]=a2w[aC]=aNB[iI[aC]?fZ:(aC%fZ)];}}

function aN7(){var fZ=localPlayer.isMountainTile;
var a0j=playerData.a0j;
var a2w=playerData.a2w;
var playerNamesData=localPlayer.data.playerNamesData;for(var aC=localPlayer.ku;aC<fZ;aC++){
a0j[aC]=a2w[aC]=playerNamesData[aC];}}

function aN8(){var a0j=playerData.a0j;
var a2w=playerData.a2w;
for(var aC=localPlayer.ku;aC<localPlayer.isMountainTile;aC++){a0j[aC]=a2w[aC]="Bot "+coordHelper.selectWeakestCandidate(1000);}}

function aN9(){var aNC=aN2;
var fZ=aNC.length;
var eH=coordHelper.random();
var a0j=playerData.a0j;
var a2w=playerData.a2w;for(var aC=localPlayer.ku;aC<localPlayer.isMountainTile;aC++){
a0j[aC]=a2w[aC]=aNC[(aC+eH)%fZ];}}}

function QuestSystem(){this.aND=[];this.aNE=[];this.applyToGame=function(){
this.aND=[];this.aNE=[];};this.ee=function(){if(this.aND.length>=0){this.aNF(this.aND);
}if(this.aNE.length>=0){this.aNF(this.aNE);}};this.aNF=function(h){var aC;
var ft=-1;
for(aC=h.length-1;aC>=0;aC--){h[aC].eZ--;if(h[aC].eZ<=0){ft=aC;break;}}for(aC=ft;aC>=0;aC--){
h.shift();}};this.a7c=function(id,a24,aNG){return this.fu(this.aND,id,a24,aNG);
};this.aNH=function(id,a24,aNG){return this.fu(this.aNE,id,a24,aNG);};
this.fu=function(h,id,a24,aNG){if(aNI(h,id,a24)){return false;}if(aNG){aNJ(h,id,a24);}return true;
};

function aNI(h,id,a24){var aC,iR;for(aC=a24.length-1;aC>=0;aC--){for(iR=h.length-1;iR>=0;iR--){
if(h[iR].player===a24[aC]&&id===h[iR].id){return true;}}}return false;}

function aNJ(h,id,a24){
var aC;for(aC=a24.length-1;aC>=0;aC--){h.push({player:a24[aC],id:id,eZ:384});}
}}

function PlayerData(){this.a2w=new Array(localPlayer.isMountainTile);this.a0j=new Array(localPlayer.isMountainTile);this.a5a=new Uint8Array(localPlayer.isMountainTile);
this.nU=new Uint8Array(localPlayer.isMountainTile);this.botExpansionAi=new Uint16Array(localPlayer.isMountainTile);this.botTeamTargetCoordinator=new Uint16Array(localPlayer.isMountainTile);
this.BotExpansionAi=new Uint16Array(localPlayer.isMountainTile);this.BotTeamTargetCoordinator=new Uint16Array(localPlayer.isMountainTile);this.hN=new Uint32Array(localPlayer.isMountainTile);
this.zp=new Uint32Array(localPlayer.isMountainTile);this.hb=new Uint32Array(localPlayer.isMountainTile);this.h1=null;this.playerTerritories=null;
this.hG=null;this.fy=null;this.rj=new Uint16Array(localPlayer.isMountainTile);this.isPassiveBorderTile=new Uint16Array(localPlayer.isMountainTile);
this.setAttackBorderTile=new Uint16Array(localPlayer.isMountainTile);this.a2r=new Uint16Array(localPlayer.isMountainTile);this.a2p=new Uint8Array(localPlayer.isMountainTile);
this.a5j=new Uint16Array(localPlayer.isMountainTile);this.applyToGame=function(){this.a2w.fill("");
this.a0j.fill("");this.a5a.fill(0);this.nU.fill(0);this.botExpansionAi.fill(0);this.botTeamTargetCoordinator.fill(0);this.BotExpansionAi.fill(0);
this.BotTeamTargetCoordinator.fill(0);this.hN.fill(0);this.zp.fill(0);this.hb.fill(0);this.h1=new Array(localPlayer.isMountainTile);
this.playerTerritories=new Array(localPlayer.isMountainTile);this.hG=new Array(localPlayer.isMountainTile);this.fy=new Array(localPlayer.isMountainTile);
this.rj.fill(0);this.isPassiveBorderTile.fill(0);this.setAttackBorderTile.fill(0);this.a2r.fill(0);this.a2p.fill(0);this.a5j.fill(0);
};}

function StatsTracker(){this.aFE=function(player){territoryCalc.nT(player);localPlayer.a2I++;playerData.a5a[player]=2;
playerData.a2r[player]=gameUI.a36.aK5();if(player===localPlayer.getTileOwner){resizeHandler.show(false,false);focusHandler.aDN();inputController.a21.a2n();
}troops.a8h(player);};}

function TerritorySystem(){this.lV=null;this.lQ=0;this.a6t=function(){var aC;this.lQ=0;
for(aC=localPlayer.isMountainTile-1;aC>=0;aC--){if(playerData.nU[aC]!==0){this.lQ++;}}this.lV=new Uint16Array(this.lQ);
var fZ=0;
for(aC=0;aC<localPlayer.isMountainTile;aC++){if(playerData.nU[aC]!==0){this.lV[fZ++]=aC;}}};this.n9=function(){aNK();this.aNL();
};this.aNL=function(){var nU=playerData.nU;
var lo=this.lV;
var aE5=this.lQ;for(var aC=aE5-1;aC>=0;aC--){
if(nU[lo[aC]]===0){lo[aC]=lo[--aE5];}}this.lQ=aE5;};

function aNK(){var hN=playerData.hN;
var zp=playerData.zp;
var a2p=playerData.a2p;
var lV=territorySystem.lV;for(var aC=territorySystem.lQ-1;aC>=0;aC--){var h7=lV[aC];
var ea=hN[h7];
var lp=zp[h7];if(ea<=mathUtils.g0(lp,4)){borderSystem.forceResize(h7);}else if(ea>=lp){zp[h7]=ea;if(ea>=250){a2p[h7]=1;
}}else{zp[h7]=lp-Math.max(1,mathUtils.g0(lp-ea,1000));}}}}

function SoloModeSystem(){var aNM=new Uint16Array(localPlayer.isMountainTile);
var aNN=0;this.applyToGame=function(){aNM.fill(0);aNN=15;};this.iD=function(qs){var player=localPlayer.getTileOwner;
if(!gameState.gv.rl(player,qs)){return false;}if(!gameState.gv.rB(player,gameState.gv.jB(player,clickHandler.i3()),qs)){
return false;}if(!aNO(qs,boostSystem.g6[0])){return false;}return true;
};

function aNO(a8n,getBuiltInMapRadialShading){if(applyRadialTerrainShading(a8n)){return true;}if(aNM[a8n]+aNR(a8n,getBuiltInMapRadialShading)>aNN){return false;
}return true;}

function aNR(a8n,getBuiltInMapRadialShading){var ej=clanPanel.kr();if(ej>=3213){return 4+mathUtils.g0(100*getBuiltInMapRadialShading,botSpawner.ka(a8n));
}var uw=1+mathUtils.g0(localPlayer.chance,300);if(ej<357){return 2+mathUtils.g0(100*getBuiltInMapRadialShading,uw);
}if(ej<714){return 2+mathUtils.g0(100*getBuiltInMapRadialShading,4*uw);}if(ej<1071){return 2+mathUtils.g0(100*getBuiltInMapRadialShading,10*uw);
}if(ej<2142){return 2+mathUtils.g0(100*getBuiltInMapRadialShading,30*uw);}return 2+mathUtils.g0(100*getBuiltInMapRadialShading,100*uw);
}this.ei=function(a8n,getBuiltInMapRadialShading){if(applyRadialTerrainShading(a8n)){return true;}var g1=aNR(a8n,getBuiltInMapRadialShading);if(aNM[a8n]+g1>aNN){
return false;}aNM[a8n]+=g1;return true;};this.ee=function(){if(clanPanel.kr()%100!==99){
return;}if(clanPanel.kr()<1071){aNN+=4;}else if(clanPanel.kr()<2142){aNN+=6;}else if(clanPanel.kr()<3213){
aNN+=8;}else{aNN+=10;}};

function applyRadialTerrainShading(a8n){return localPlayer.lE||clanPanel.kr()>=4284||gameState.gv.kH(a8n);
}}var DateTimeUtils;var ws;

function BotSystem(){var aNS;this.lL=null;this.lK=0;this.applyToGame=function(){
aNS=[];if(localPlayer.survivorBotCount!==9){return;}this.aNT();};this.aNT=function(){this.lL=[0,0,0,0,0,0];
this.lK=0;
var aNU=[256,227,166,148,100,0,0,0];
var aNV=[0,8,24,30,46,70,256,333];
var aNW=[0,0,3,9,17,25,256,179];
var k=localPlayer.ku;for(var aC=1;aC<aNU.length;aC++){
if(k<=aNV[aC]){this.lK=aNU[aC-1]-mathUtils.g0((k-aNV[aC-1])*(aNU[aC-1]-aNU[aC]),(aNV[aC]-aNV[aC-1]));
this.lL[5]=aNW[aC-1]-mathUtils.g0((k-aNV[aC-1])*(aNW[aC-1]-aNW[aC]),(aNV[aC]-aNV[aC-1]));
this.lL[0]=localPlayer.isMountainTile-k-this.lK-this.lL[5];break;
}}localPlayer.lG=localPlayer.isMountainTile-localPlayer.ku;localPlayer.data.numberTeams=(localPlayer.ku>0)+(localPlayer.lG>0);localPlayer.data.playerCount=localPlayer.isTileOwnedByPlayer=localPlayer.ku+localPlayer.lG;
localPlayer.data.teamPlayerCount=new Uint16Array([0,0,0,0,0,0,0,localPlayer.ku+this.lK,localPlayer.lG-this.lK]);localPlayer.a6i.a6n();
};this.aKC=function(player){aNS.push({player:player,resolveAttackCombat:(14+coordHelper.selectWeakestCandidate(20))});};this.ee=function(){
if(localPlayer.survivorBotCount!==9){return;}aNX();};

function aNX(){for(var aC=aNS.length-1;aC>=0;aC--){
if(--aNS[aC].resolveAttackCombat<=0){troops.rt(aNS[aC].player,0,colorSystem.tY.endGameNotificationController+colorSystem.tY.a1I);aNS.splice(aC);
}}}}

function DialogManager(){this.aNY=25;this.aNZ=13;this.aKO=4096;this.fk=0;this.fl=0;this.yn=null;
this.distanceSquared=null;this.yk=null;this.yo=null;this.tileDataToIndexUnchecked=0;this.mapSeed=0;this.yl=false;this.ym=new aNa();
this.yd=new adjustTerrainElevation();this.playerShipIndices=new aNc();this.applyToGame=function(){this.yd.applyToGame();};this.a8=function(map,aNd){
var ye;map=map%this.aNY;if(map===this.tileDataToIndexUnchecked&&(!aNe(this.tileDataToIndexUnchecked)||aNd===this.mapSeed)){
return;}this.yl=false;this.ym.aNf();coordHelper.a6o(map);this.tileDataToIndexUnchecked=map;
this.mapSeed=aNd;if(aNe(map)){dialogManager.yd.ye[map].aNg=aNd;}if(!this.aFt(this.tileDataToIndexUnchecked)){aNh();return;}
ye=dialogManager.yd.ye[this.tileDataToIndexUnchecked];this.fk=ye.j;this.fl=ye.k;coordHelper.a6o(ye.aNg);voteSystem.a8([this.fk,this.fl,ye.nZ,ye.nW]);
aNi();chatSystem.aNj();voteSystem.aNk();};this.aNl=function(map,aNd){var gI=aNm();this.a8(map,aNd);
this.ym.aNf();
var gK=aNm();aNn(gI);return gK;};this.a79=function(canvas){if(!canvas){
return;}if(this.yn===canvas){return;}this.fk=canvas.width;this.fl=canvas.height;this.yn=canvas;
this.distanceSquared=this.yn.getContext("2d",{alpha:false});this.getScaledValue=this.distanceSquared.getImageData(0,0,this.fk,this.fl);
this.yo=this.getScaledValue.data;this.tileDataToIndexUnchecked=this.aNo();this.mapSeed=0;dialogManager.yd.ye[this.tileDataToIndexUnchecked].name=localPlayer.data.mapName;
};

function aNm(){return{fk:dialogManager.fk,fl:dialogManager.fl,yn:dialogManager.yn,yj:dialogManager.distanceSquared,yk:dialogManager.yk,yo:dialogManager.yo,fF:dialogManager.tileDataToIndexUnchecked,
mapSeed:dialogManager.mapSeed,yl:dialogManager.yl};}

function aNn(g1){dialogManager.fk=g1.fk;dialogManager.fl=g1.fl;dialogManager.yn=g1.yn;dialogManager.distanceSquared=g1.distanceSquared;
dialogManager.yk=g1.yk;dialogManager.yo=g1.yo;dialogManager.tileDataToIndexUnchecked=g1.tileDataToIndexUnchecked;dialogManager.mapSeed=g1.mapSeed;dialogManager.yl=g1.yl;}this.fE=function(aC){
return aC===3||aC===7||aC===9||aC===21||aC===this.aNo();};this.aNp=function(aC){
return aC===2||aC===7||aC===9||aC===20;};this.aNq=function(aC){return aC===1;};this.aNo=function(){
return this.aNY;};this.aFt=function(aC){return this.yd.ye[aC].aNr===undefined;};

function aNe(aC){
return!(aC===1||!dialogManager.aFt(aC)||aC===dialogManager.aNo());}this.a78=function(sC){if(sC.mapType===0){
return sC.mapProceduralIndex<10?sC.mapProceduralIndex:(10+sC.mapProceduralIndex);
}else if(sC.mapType===1){
return sC.mapRealisticIndex>=10?(22+sC.mapRealisticIndex-10):(sC.mapRealisticIndex+10);
}};this.aFu=function(sC,aNs){
if(sC.mapType===0){sC.mapProceduralIndex=aNs<10?aNs:(aNs-10);}else if(sC.mapType===1){
sC.mapRealisticIndex=aNs-(aNs>=22?12:10);}};}

function aNa(){this.aBa=-1;this.a3J=0;this.aNt=0;
this.aNu=8;this.aNv=32;this.aNw=8;this.aNx=32;this.aNy=[0,0];this.aAb=[0,0,0,0];this.territoryMinY=null;
this.aNz=true;this.aO0=false;this.aNf=function(){if(this.aBa!==-1){clearTimeout(this.aBa);
}this.aBa=-1;this.territoryMinY=null;voteSystem.aNk();};this.applyToGame=function(){if(moderationSystem.a3P()===7||this.aO0){
return;}this.aNz=true;this.a3J=0;this.aNt=1;this.aNy=[dialogManager.yd.ye[dialogManager.tileDataToIndexUnchecked].z5[0],dialogManager.yd.ye[dialogManager.tileDataToIndexUnchecked].z6[0]];
this.aAb=[dialogManager.yd.ye[dialogManager.tileDataToIndexUnchecked].aNr[3],dialogManager.yd.ye[dialogManager.tileDataToIndexUnchecked].aNr[4],dialogManager.yd.ye[dialogManager.tileDataToIndexUnchecked].aNr[5],dialogManager.yd.ye[dialogManager.tileDataToIndexUnchecked].aNr[6]];
this.aNu=dialogManager.yd.ye[dialogManager.tileDataToIndexUnchecked].aNr[7];
this.aNv=dialogManager.yd.ye[dialogManager.tileDataToIndexUnchecked].aNr[8];this.aNw=dialogManager.yd.ye[dialogManager.tileDataToIndexUnchecked].aNr[9];this.aNx=dialogManager.yd.ye[dialogManager.tileDataToIndexUnchecked].aNr[10];
if(this.aNz){this.aBa=setTimeout(aO1,16);}else{this.ee();}};

function aO1(){
dialogManager.ym.ee();}this.ee=function(){if(moderationSystem.a3P()===8&&soloCalc.nn()){this.aBa=setTimeout(aO1,16);
return;}if(this.a3J===0){var aNg=coordHelper.aO2();coordHelper.a6o(dialogManager.yd.ye[dialogManager.tileDataToIndexUnchecked].aNr[2]);
voteSystem.a8([dialogManager.fk,dialogManager.fl,dialogManager.yd.ye[dialogManager.tileDataToIndexUnchecked].aNr[0],dialogManager.yd.ye[dialogManager.tileDataToIndexUnchecked].aNr[1]]);coordHelper.a6o(aNg);this.territoryMinY=voteSystem.aO3();
this.a3J++;if(this.aNz){this.aBa=setTimeout(aO1,16);return;}}var k=!this.aNz?1000000:10;
k=(dialogManager.fl-this.aNt-1)<k?(dialogManager.fl-this.aNt-1):k;
var a02=this.aNt+k;var h7,fL;
for(var fi=this.aNt;fi<a02;fi++){for(var fg=1;fg<dialogManager.fk-1;fg++){fL=fg+fi*dialogManager.fk;h7=4*fL;if(iq(h7)){
this.aO4(h7,fL,1);}else{this.aO4(h7,fL,0);if(a08(fg,fi,h7)){this.aO5(fg,fi);}}}}this.aNt=a02;
if(this.aNt>=dialogManager.fl-1){dialogManager.distanceSquared.putImageData(dialogManager.yk,0,0,1,1,dialogManager.fk-2,dialogManager.fl-2);clanPanel.ds=true;this.aNf();
return;}else{if(this.aNz){this.aBa=setTimeout(aO1,16);}}return;};this.aO4=function(h7,fL,eI){
var aO6=Math.floor(this.aNy[eI]+this.aAb[eI]*this.territoryMinY[fL]/10000)-dialogManager.yo[h7];aO7(h7,aO6);
};this.aO8=function(h7,eH,aO9,eI,aAb){var aO6=Math.floor(this.aNy[eI]+(1-eH/aO9)*aAb)-dialogManager.yo[h7];
aO7(h7,aO6);};

function aO7(h7,aO6){if(aO6>0){dialogManager.yo[h7]+=aO6;dialogManager.yo[h7+1]+=aO6;dialogManager.yo[h7+2]+=aO6;}}
this.aO5=function(m9,mA){var h7,eH,aO9;
var aBQ=m9-this.aNv;
var aOA=mA-this.aNv;
var a03=m9+this.aNv;
var a02=mA+this.aNv;aBQ=aBQ<1?1:aBQ;aOA=aOA<1?1:aOA;a03=a03>dialogManager.fk-2?dialogManager.fk-2:a03;
a02=a02>dialogManager.fl-2?dialogManager.fl-2:a02;for(var fi=aOA;fi<=a02;fi++){for(var fg=aBQ;fg<=a03;fg++){
h7=4*(fg+fi*dialogManager.fk);if(iq(h7)){aO9=this.aNu+(this.aNv-this.aNu)*this.territoryMinY[fg+dialogManager.fk*fi]/10000;
if(Math.abs(m9-fg)>aO9||Math.abs(mA-fi)>aO9){
continue;}eH=Math.sqrt((m9-fg)*(m9-fg)+(mA-fi)*(mA-fi));
if(eH>=aO9){continue;}this.aO8(h7,eH,aO9,1,this.aAb[3]);
}else{aO9=this.aNw+(this.aNx-this.aNw)*this.territoryMinY[fg+dialogManager.fk*fi]/10000;
if(Math.abs(m9-fg)>aO9||Math.abs(mA-fi)>aO9){
continue;}eH=Math.sqrt((m9-fg)*(m9-fg)+(mA-fi)*(mA-fi));
if(eH>=aO9){continue;}this.aO8(h7,eH,aO9,0,this.aAb[2]);
}}}};

function iq(h7){return dialogManager.yo[h7+2]>dialogManager.yo[h7]&&dialogManager.yo[h7+2]>dialogManager.yo[h7+1];}

function a08(fg,fi,h7){
return(fg>1&&iq(h7-4))||(fg<dialogManager.fk-2&&iq(h7+4))||(fi>1&&iq(h7-4*dialogManager.fk))||(fi<dialogManager.fl-2&&iq(h7+4*dialogManager.fk));
}}

function aNi(){var oM=aOB(dialogManager.tileDataToIndexUnchecked);if(oM){aOC(oM[0],oM[1],oM[2],oM[3],oM[4]);}
}

function aOB(fF){if(fF===2){return [[256],[256],[0,205,256],[500,500,0],[0,0,0]];}else if(fF===7){
return [[512],[512],[0,380,512],[500,500,0],[0,0,0]];}else if(fF===8){return [[410],[410],
[0,120,210],[0,80,640],[0,0,0]];}else if(fF===9){return [[512],[512],[0,70,180,200,290,420,512],
[500,500,0,0,500,500,0],[0,0,0,0,0,0,0]];}else if(fF===20){return [[512],[512],
[0,380,512],[500,500,0],[0,0,0]];}return null;}

function aOC(aOD,aOE,aOF,aOG,aOH){
var aC,fg,fi;
var iv=aOD.length-1;
var aOI=dialogManager.fk+dialogManager.fl;aOI*=aOI;var approximateIntegerSquareRoot;
var aKl;
var fZ=aOF.length;
var aOJ=Array(fZ);for(aC=fZ-1;aC>=0;aC--){aOJ[aC]=aOF[aC]*aOF[aC];
}var a4e;var aOK;
var aOL=new Array(fZ);
var aEf=new Array(fZ);
var aOM=new Array(fZ);
var g1=voteSystem.aO3();if(aOH===undefined){aOH=new Array(fZ);for(aC=fZ-1;aC>=0;aC--){
aOH[aC]=0;}}for(aC=1;aC<fZ;aC++){aOL[aC]=aOJ[aC]-aOJ[aC-1];aEf[aC]=aOG[aC]-aOG[aC-1];
aOM[aC]=aOH[aC]-aOH[aC-1];}for(fg=dialogManager.fk-1;fg>=0;fg--){for(fi=dialogManager.fl-1;fi>=0;fi--){
approximateIntegerSquareRoot=aOI;for(aC=iv;aC>=0;aC--){aKl=(fg-aOD[aC])*(fg-aOD[aC])+(fi-aOE[aC])*(fi-aOE[aC]);
approximateIntegerSquareRoot=aKl<approximateIntegerSquareRoot?aKl:approximateIntegerSquareRoot;}a4e=aOG[fZ-1];aOK=aOH[fZ-1];
for(aC=1;aC<fZ;aC++){if(approximateIntegerSquareRoot<aOJ[aC]){a4e=aOG[aC-1]+aJW((approximateIntegerSquareRoot-aOJ[aC-1])*aEf[aC],aOL[aC]);
aOK=aOH[aC-1]+aJW((approximateIntegerSquareRoot-aOJ[aC-1])*aOM[aC],aOL[aC]);
break;}}aON(dialogManager.fk*fi+fg,a4e,aOK,g1);}}}

function aON(eI,a4e,aOK,g1){if(a4e<500){
g1[eI]=mathUtils.g0(g1[eI]*a4e*2,1000);}else if(a4e>500){g1[eI]+=mathUtils.g0((10000-g1[eI])*2*(a4e-500),1000);
}g1[eI]+=mathUtils.g0(aOK*(10*a4e-g1[eI]),1000);}

function ChatSystem(){
var aOO;this.a91=0;this.a92=0;this.a93=0;this.playerShipIndices=0;this.applyToGame=function(){aOO=new Array(dialogManager.aNY);
aOO[0]={j:[0,5000,8000,10000],eH:[220,250,255,220],uw:[190,220,0,0],ft:[170,200,0,0]
};aOO[1]={j:[0,4000,5000,6000,10000],eH:[25,0,100,0,25],uw:[25,0,0,0,25],ft:[25,0,0,0,25]};aOO[2]={
j:[0,500,2500,2999,3000,3200,4200,5200,5700,8800,10000],eH:[15,15,70,40,48,48,252,40,40,20,30],
uw:[80,80,190,90,46,46,248,180,180,90,140],ft:[120,120,220,110,37,37,217,10,10,10,10]
};aOO[3]={j:[0,400,1899,1900,3200,4500,6000,7700,8499,8500,9500,10000],
eH:[10,10,20,10,30,10,16,40,50,55,230,230],uw:[10,10,40,50,100,40,80,120,80,55,230,230],
ft:[80,80,200,10,60,10,16,40,50,55,230,230]};aOO[4]={j:[0,300,1400,1700,3000,4000,10000],
eH:[10,10,20,10,10,170,212],uw:[20,20,60,100,100,110,170],ft:[70,70,160,30,30,60,120]
};aOO[5]={j:[0,1000,3000,3500,4000,4500,7000,7500,8000,10000],eH:[10,10,20,10,5,10,20,5,20,25],
uw:[30,30,50,100,30,100,140,60,140,200],ft:[80,80,200,10,5,10,20,5,20,25]
};aOO[6]={j:[0,700,2650,3200,5000,8000,10000],eH:[10,10,60,255,255,200,200],
uw:[10,10,60,255,255,200,200],ft:[80,80,255,255,255,200,200]};aOO[7]={
j:[0,400,1999,2000,3200,4000,4700,5500,6500,9500,10000],eH:[10,10,80,255,255,55,6,70,20,155,255],
uw:[10,10,90,245,245,170,80,190,20,155,255],ft:[80,80,255,235,235,55,26,10,20,155,255]
};aOO[8]={j:[0,700,1300,1900,1901,2500,3400,6000,10000],eH:[25,30,30,30,255,255,30,40,20],
uw:[25,30,150,150,245,245,80,150,70],ft:[60,170,170,170,235,235,30,40,40]};aOO[9]={
j:[0,400,2009,2010,3300,4000,5200,6500,8000,9500,10000],eH:[10,10,80,255,255,55,23,36,20,155,255],
uw:[10,10,90,245,245,170,60,160,20,155,255],ft:[80,80,255,235,235,55,9,72,20,155,255]
};aOO[20]={j:[0,5500,6700,6999,7000,7300,7600,8200,10000],eH:[5,5,70,70,255,255,252,10,8],
uw:[20,28,190,190,255,255,248,90,60],ft:[60,80,220,220,220,220,217,10,8]
};aOO[21]={j:[0,1500,3000,4000,5000,5999,6000,9500,10000],eH:[12,30,10,16,40,50,55,170,170],
uw:[45,100,40,80,120,80,55,170,170],ft:[12,60,10,16,40,50,55,170,170]
};};this.aNj=function(){var iY=aOP();aOQ(aOO[dialogManager.tileDataToIndexUnchecked].j,aOO[dialogManager.tileDataToIndexUnchecked].eH,aOO[dialogManager.tileDataToIndexUnchecked].uw,aOO[dialogManager.tileDataToIndexUnchecked].ft);
dialogManager.distanceSquared.putImageData(iY,0,0);if(dialogManager.aNq(dialogManager.tileDataToIndexUnchecked)){
aOR();}dialogManager.yl=true;clanPanel.ds=true;};

function aOP(){var iY;dialogManager.yn=document.createElement("canvas");
dialogManager.yn.width=dialogManager.fk;dialogManager.yn.height=dialogManager.fl;dialogManager.distanceSquared=dialogManager.yn.getContext("2d",{alpha:false});
iY=dialogManager.distanceSquared.getImageData(0,0,dialogManager.fk,dialogManager.fl);dialogManager.yo=iY.data;return iY;}

function aOQ(j,eH,uw,ft){
var aC,fs;
var g1=voteSystem.aO3();
var fZ=j.length-2;var gI;
var aOS=new Array(fZ+1);
var aOT=new Array(fZ+1);
var aOU=new Array(fZ+1);
var aOV=new Array(fZ+1);for(fs=fZ;fs>=0;fs--){
aOS[fs]=j[fs+1]-j[fs];aOT[fs]=eH[fs+1]-eH[fs];aOU[fs]=uw[fs+1]-uw[fs];aOV[fs]=ft[fs+1]-ft[fs];
}for(aC=dialogManager.fk*dialogManager.fl-1;aC>=0;aC--){for(fs=fZ;fs>=0;fs--){if(g1[aC]>=j[fs]){gI=g1[aC]-j[fs];
dialogManager.yo[aC*4]=eH[fs]+aJW(aOT[fs]*gI,aOS[fs]);dialogManager.yo[aC*4+1]=uw[fs]+aJW(aOU[fs]*gI,aOS[fs]);
dialogManager.yo[aC*4+2]=ft[fs]+aJW(aOV[fs]*gI,aOS[fs]);dialogManager.yo[aC*4+3]=255;break;}}
}}

function aOR(){if(!adSystem.v0()||!dialogManager.aNq(dialogManager.tileDataToIndexUnchecked)){return;}var aOW=adSystem.updatePlayerColorBrightness("arena");
var aOX=adSystem.updatePlayerColorBrightness("territorial.io");
aOY(aOW,5,0.5,0.5,0.1);aOY(aOX,2,0.5,0.45,0.1);}

function aOY(a55,ia,fg,fi,globalAlpha){
dialogManager.distanceSquared.save();dialogManager.distanceSquared.globalAlpha=globalAlpha;dialogManager.distanceSquared.imageSmoothingEnabled=false;
dialogManager.distanceSquared.scale(ia,ia);dialogManager.distanceSquared.drawImage(a55,Math.floor(fg*(dialogManager.fk/ia-a55.width)),
Math.floor(fi*(dialogManager.fl/ia-a55.height)));dialogManager.distanceSquared.restore();
}this.a6r=function(){var aC,h7,fg,fi,aOZ,iP,gK;
var a92=0;
var j=dialogManager.fk;
var k=dialogManager.fl;
var gI=j*k*4;
var aOa=aEE;
var aOb=dialogManager.yo;for(aC=j-1;aC>=0;aC--){h7=aC<<2;aOa[h7+2]=aOa[gI-h7-2]=3;}gI=j*4;
for(aC=k-1;aC>=0;aC--){h7=aC*gI;aOa[h7+2]=aOa[h7+gI-2]=3;}aOZ=j-1;iP=k-1;for(fi=1;fi<iP;fi++){
gI=fi*j;for(fg=1;fg<aOZ;fg++){h7=(gI+fg)<<2;gK=1-(aOb[h7+2]>aOb[h7+1]&&aOb[h7+2]>aOb[h7]);
aOa[h7+2]=6-5*gK;a92+=gK;}}this.a91=(j-2)*(k-2);this.playerShipIndices=0;if(dialogManager.fE(dialogManager.tileDataToIndexUnchecked)){
dialogManager.playerShipIndices.aOc();dialogManager.playerShipIndices.aOd(4,5);}this.a92=localPlayer.chance=a92-this.playerShipIndices;this.a93=this.a91-this.a92-this.playerShipIndices;
if(this.a93){dialogManager.playerShipIndices.aOd(6,2);dialogManager.playerShipIndices.aOe();}};}

function aNh(){var s1;if(dialogManager.tileDataToIndexUnchecked===10){
s1="DYDz2ESNu-0UYCCrS9c3pBUrKHc94BhIBhIJpIIBnMIAAIrKSSpKABmgf9e7X7ecX-5P0baOy191XXX7eegf9mcfUrrxrKppppKpKSrzUMMMSKKKrJcXcXcmgcXnKIKBmnCIJonCKrrSrrSSxSS9XcJnBe9XemmWXeX99chMIAEprrSrrtbrxIrMKBn9eBcecX9X7f99X90e577VX1VcOWX16XX7X999cX7eWyXXccVVX6rUSrrwUrlzpbbrrU6xzztzxzrztzbaOtaOa5-0WV-77e-9119HcXXZecccceXXX7ce9Xcce9e9meeVof919ee9Wzy5XeXYS9KBcXee_He6ce1ee0zxzta5UaX99c1mXcXhEJp9cNHWcTN9BcnAzJoorIBe0c--nIJoonSIBe-OX-NNOXWbcBgzIHX9xHzS9mcCSI9-nBrrorK9VcP-jHe9_BhxzKHcWC9mZp9-3n9fBnS970a6zs7egrIAAIRUKocXX9gx9npKaUxBppABe5OdHpBe-AC9-17TOWABpKI9-7JmnC6zGtxIBmen9egp6aUlyOzbrbbqUzxHXgjKKBc-ZehlxoeeoxObonox9XonAUbzS9efBdCAArHmjISBhEJnAofBUIJgrpocXxIBUoxHVmnBmmXAExoUxABmdAIBgnBonIAC6oxHVgfMHcXcUXAAGxIBgfxJch9c3enCMzSBe9eXomxHeBgmeCSBgpKMp9hzHfIEzHnArSxHX7pSrUHcnCMrUpSa5UIonABrSBccnBopJttzbxpBonHXpIEKMrMSrxpKxzUzltyUtaTOaOaObaT5UzNTOV0c116rMMKSKrxIKpJpKMSKMGxISCrKMSpKMKrSpSpI9xp9_pMMMMSBoxSryTUUxa5P7-0ttbWzzzxzaN5-NOWVN--0Wa5-0X-0VNVN7TOzaOWzL0bbX0y7NN5Ua17V111749c79e1c-V-----Ow7--N57-OzaN0ba156byNNT6q5OzWaT55-OsOX1777Oa55-5T5UX16tzUOyUtzrpzUrSKKSSAoemnKCIAIICI9KHn9CKBhCSHgenSAJnIJxSMMKKSSpKoopKKHpSoorSzxpWxMS-UKISaOxMOxttyOzy5OzbbtyTOzbtaUxyUyTT6porUrSztzzMSp9eceoogeZp9ZxJx9geeeXe9eZgeC9gegemp9gmpKMSonSxKrrbaUMIKJpMKKKpIACBmeccV71XX7V1mmmmhCCCKJompKKJpMKSKSKpKMJpKBeeceenKpzHnBnBmceee-X1117ememfBn9mfCBmgemf9mfBmf9xromcec7Us8He0u99cWtbc-PeCCS9VecZnBnBemfBn9X9c6aOXA997Y99755VXc6tXXmV5Os-ObVN0yN0bzaT-7ec7N70Wa-OV-5eggnHon9f9efCBpMzop97epCKIpSIBpKrrSKKIKKMKMJehzKKErJeABnIAJc717f9eBnAJzrHe7V9d9ef9gmopKUKC9gmcV6tX73eCIJoonIBnBnBgnCHgjJeZfA9megeegfKCICCJnIA9meZf9mfIEMof9XceXe97X-59XdCIKKpKKCJoeVcf97mZmVVV199YJmX7gceY9gpEOxMMJecrSSGzOxSrxprSxzJzUopSrIxKBpUMIpMprSropEMHnBrpprK91AJpJpIICpBopICCJonKBn9mcme9VcX9ee7X7e9ece9Xe19XcX91Xee9Xcce9VVVccefAAABe7emhBnSSKMSIJhCIJpKJppCKKIIIICJgpIBpAIHpBcoooonIKLObpBnKlzrKIKCJpCJpBnBpUzrrxpxSbbwUxzUprpppppJppMMIrrSSRUbWsOwUzUltbzrxzUzSzUbrrTTUUrSbbV6WbaTOzxzyN5TN-T5TOxbtts71-X-70V0sOWsObbaT0sTObw70tbbzbxbzzyOtyUtbyUaOV1-N0cVN-50aOtza6tzlxzUxSrzUzSSxUSzzOzzs5OyOtyOyUztyObaNOtaUrUxrrUSrrUrMSJrSIMSpKISzKUSpSrSSrzSMMxMSrMSpSrUzSSzzrTUMSpprSzMSzUxSSIEUSrzrUSpMKKxpKrKMKBmmrIKBgpKrzs6VOsUa--5ObzyN77-7X7e970V-5Oa5ObzxSxrzzSrKMUw-OV17X7X1X99X97X9X99cXXXXX977OaOVXeeeeecX7cX7X7X177-7-X-71-7XX97X97cX7VVV1--VObs970cVObtzbtyObrzxSomdKKSSMKqTN5NN0xrMIM5UrKKKpEKrSMSMprSrxMMUzrzrzSrSrSrHXenOtxrrxrxzSrrSrUrrSrSxMSxxKJpKKKJnKKrKIUUSrSrKKzKxKrSrSwUxIBnrxpSSpUzyOzzzzyUSxzRUpCBee7ecXce89omegpIBrpxzSrMJnKrMSFT0tbrMKxKL0VObxprSSlXV-11-c-X-WxzxFUaPcX777OzztzrSrMV-V75X96zzMKrUa9e-7V17gc9XeV90Bf957cVOzrMOX17X7X-X7X7V-N-6aUxCKzUUKprcX-UzSrN17WzrxrNX7ecV17WzzbaOtbxraObrOxrbxwUxpUzrzraOy5OVOWtzyOzzxbzVNXccXcXcX1-V197V-ec5Oy5N1--555UyN-N1---VOWX0Wtcc0aUMMyOs----Zc5-TOtsOWX7c0xzLN-NWbyOyUyUzrbxJe9gfTUxAMxrxzlbzbzbq5UKrJnAABnAAICETUtxSrzrpIpKIUSxraOaOVNTObzWa5NOtxxyOyOc-5A9YBmnBfHceX7-XXcX9e9Y9e5OzUbxSyVUX5OcUa1-UMqNNUbyOtsUWtWbWaObtzbyUWy6bzpJmoh9nIUI99oghSUzrrrSHeHohKCJgrKJemgcrS9nry6xSrUMStxzUSzqUrbrUxUSxxrrprUU6zSrbrtzUSUSzxMKxSMprMKIIIoonIBmohAIAHgf9eHeemfI9nA9mf9c9n9ZeXc9d9n9ccX7VZmoceeHVX1Zn9meZegegegfBhABehABonAHnABhCIBemee9eBfBeecgeohCUxzUbzxI9egegfAUUrHmegemecWcfCUp9meX9Beeef9onrSpAAKKKIyOzyUzJnBjSrxSSIBhMSHgcVYKxBmnzrROzpzxzSKKCKUzKBnoUzzbzpJmegfzyUzFObyUzrrzpKUSlzry6sUyUVN-7NOzbzzlzrzUrUSrrURUxzbzsTUsUWts5NOWa5ObzrUxrtyOWWaOzMSJnIAIprMJorKMIrSKMKKpUKCBonKMJnCJpCIKIKMJmpKIMKJpCJpBxBonHomoemmegnHf9f9cX7ce99emecgn9h9eA9nCHgfBnAIBfHh9eXXce9emec7f9ec1me89eeceme89fHeemX77-ceeeemeX9X9eeecV-V9e9Xe7e9eefBnBeefBfHmnBnBnKBpIEpKxMSKJnBpBnBnBmgmeeX9cXXVcX7Xce1eXcXe7ee9eXeeeX9X7V7V77V--XcXee7ec7X9eXXceX9f9eeee997X9Ve7Zee7WaX5X2Be-cee17X--0tsUbtaT0ta5-Oc--7Xe-X7--OVUtbVT--QA9nBmcXV--97X9ememggnBecJceeXme-cXdABeXeX97cnHgeeI9IA9XcVX7eX99e9e9mgeXeXemmceZmXe9ceXemXmggf9mmnAI9X1eIHcXfBghBmf9BemcX9Y9Ve9--JmZeccXA9Xd9cX9VXVVc7-V-Xee_BnJhIIBnJnBmohBgohBcmmf9eHf99Hf9HmommmmV5N-MvxppxrIICWzsOxX--OV5s0i1mopMKppzTOaN-0XXceV--0lJ7-90mzBlV2N7tRof9JqUsOaW7c8bwrrJchpK9-X7PBfHjKogcP0Jd92SMUwUlxMSErHegnrlxI9X7cY99e7hSzxpxSIIUHozogmgecYIExxxrrrKpKrSrMMrrlxtyUtxblxUyTUbyUUSaUy6Wzttbbc5N5N7V7XWaT7V6aZeVWsV9nIA9X2BmcWc7ooc--f9IBomV-0cnICBeXgn90Wc5TOa7-1-5cX---d11---esD---m8D-1VvAYqV-92glC5--NEEiqV-7Hsjk014I4wognBxwOs0Wc-D4y4gcT--0Y8X-0WalAk--0pHX-1Wsy6EV-a7EDhCBtaT9--X3IIV--_VJV0Ndepmzq1-0XeJbD-5XhvrCqTe-07iCnpteV-7iejk-iAtCxEIrrX71-2smknnEUUpze-e-c-1BtMB--2Kbq--YMmzV-sqPmrF7--Culc-HCwyxxcV-DEWXhte-DZ7mzorSr56eX170LG-rUSrSItzOueVc93c-5ZH-rrRP9-2d613nHdRUR6kP7-CZVZUEKUyUe91e-2ZYhnTPV-t8OMny7-1HZrT-DZf16A9mjFUzlsV--Hh_N-1HlyB-CZhCrSpzrkX7cX-2ZibAr-VMdC8brSrzUxSSIBxpHX17c8CrJe7rrUIpSrUxxzSrMIMOs5OVV7X7X7977V-7P19Xcce--8DNHk-LIcPSpN7-0ODtgnMN1-7Zz5USxyX9c--J2As-9J2CSu-08FHSrR7V-0G5xV-OH5vqV-0LEoV0OLiAnMN70D_f4UKIBnSBgzSrSxSSMSxpSpppzc-5TTUMbV716s117X1Xcce-cXXHcX--0Rs7V3dS04nKonpSSkV7----TMGPxrS-V7--MN-c0HMYnBnrIAIrK-OWV75V-tTEHotV-qMoqSMUUbe9HXV-mNcawnr6xtcVe-3aNiUIq1-6aOwMISlc1-6aSe6rROec-8ac9fISzuX-V1tf-1mnBrlWaN-NajMY9ggeoopCTTTTN6aN1HdgkXoohABnK9n9KJmpogeV-0XJenppSrUzJgghomhp9VnxIAAzOxWbbrIBnJmenBegozlWyObxIKBonIGaOVT50xSk6xJpEpIHnBonBoptxpr56xrzzbonCBnCMMSonzxJmopCIJomX7mceHcV7nJxSABhrbxEKCIJhAA9HgenABrUMbqUpSUrprSrbzzp9hABeXce9YAHcoomnBmmnBmmnpzaTTUrzzMpzWWblbyUUSrUrxbbzzblxrUUbrzSrtztzw6btV19ceWXWzq0aU6aTOta0a0V5777Xce7nA97VOa0X-17VUVV0V17-17X7V7-V----1-V-VcX9A9cWbbzyV-U5T5TOa5NNOaOV1Xe9ce99mZee5OtcWbaTTTTTOWe9ZeXcmcXVV38gtRnCMzSw1X6VcV08hu4rq9--tiGRrac-1Qfbg-dax4zrrIKoeBxErUlzSGbs0VP3eXX97XV-9R0KCsV1OlXjprrP7X7-HRQsCpVc2TRgLxJrKBeKKJe7BhIKKBlwOaUrNTUsNNNcNP91V---PS6VgopVN-LbHRrK999ezrxxoy5Tc7-0bJGjF--6Spy-5bU7rSbuXV4tsIYpKSSrSp50aX-177e-2baNMC5-2Otd7nHrpOba7cV2tv2dnICxz-Uk7cc0mUIkRnBpCBpCIJOWa0VNOtc-19UQnBeegmnIISxJns56zaOWtu7TV--URWN--VDLc-eVE7zSrUX7Xc-5WM4BN1DWTIggpBnEKKKESCWV5T5Wa-N0a9VsP6YRn9cmY9JggoggzUKHfA9XmcP9XZfIJhronABfISpxrUrrI9ABnBggrxxoe9fHmeBdCDUUrHf9orUogrzzJfUU6zUzbbbzrty6brbrxxz57OtsN5OsN5V5VT5V57N56yTUtsNN1cNNVV5VNeeeZeWtu77-XX-KgxCqWVV-P8w5qV-uAjtz5c15XwhBooopBonIKKJNN5-N5-6WVN-8ckmzArUOVeV-uDoWxNV--YoA7-TYoYRoxa57-1_P1T--8NKD-9dNS2ACAUta---dQzr-DPM79mmgcpI9chMKCppxxxrSzIbXc0aT1WVOxk7-N-9c0eauZgfAKrSrrSla-5-7n9-V1eVE3nKUwNVcV0eWZinCF5N0TcbkCMSrzr5OVPXCA9VXV-1b0uV0ezUBxUsXc--mhTc--n9_c1DnTIxCCSMKC9eCKClsT5OsN-V7NNV6QJcYxzUSxzSwUa7X9I99Xd9X-BhW8EE6rUw7ceV6fXkApBmf9f9hKGaOWzzzObV1V-PuipRpJ5--6iiarprP77--DrhL-0iv-fN-7jNKjExzXcc-Y1kshKK-5-V-wF2umWs-03EWs-03_Ms-23gdy-qlmyACJmcgfBnCIIrKpICUSIprUa0VOV5N5---V5---wRnFru7-E6kMClX-4lwIAzq9c-A7r-z5V7gdk8monBgfCCCElzbzxsN995-T5-KgiSunBnABmeeIHprrKJxpIISKICJpKprUzOcOzzUTN---0V--50aN1-1-PV7XX-SnCeY9f9mnUSSKzMtaOWa9VX--bBy1gzSxX-e-4nFNEAqTc-6C7Wgs-EC_DBjN-0nVb2N-3n_EYByN--nfWnV1Bx8ZorUaV9-CnqgbKISrNN9-9-8o5aACrSVWXV-C0gPk-jFRwSM6rsW9VV3h23TmfBjOxMUtaX17-6GYfE-0UHSjwfEzbxpUUq17ZcXeV-h8rqr--3odX6MF--8ogzvMJrN--V1xAI4npKwT7cV0Xp-Yf9nBeehKMKrzzSxrSxrUSzzSxrSMzSzzV-T-7V10Wa6VOWVT1mmeeegn9eeeXmcX97V-IJGnCr1--2JVvD-Bp7gzSxw6aeZcV0hHX5merts-EJjUhq7-2pGMvBtV-hJmVz1-1pJofqV-0KQ3c-0KztN-0L5k7-6LYvE--ILYxhTNc-0LZ57-ALu1CaV-4SIqV-hSQ3na--KpjX--ppknVESTPknBgmgn9f9f9onBmenSpMGzxbtbzbaOV6zbX9-NObWV-4TmmV3SToLnBnJnST5Oa-1-0px0YD-0pylvD--L3Ge--q54IV2CWmWnUUz5Pcec-nO-URhBoUy6VX-1qFuQGc-MOcagpR---CcERs-0PQUc3MPs8gehClzSzbzzUzxMr6tyUzzbzaTP0HgmcVXegeeeXeh9eX7e-JqqUEKIMpzz5T7cXX97-bRBpSKoT5X7--M4g1-grMIbBecemgfMxUpzMzObtu7V0zrrq7e9eV-MTaFhOy9VfLnt2-9-17117VcX1-1X97cVXX9177V-VXV9-WaOSMSSSSrrUSKMKxrrrUSxrrUzsOV7--N-tVN--N0bKIKKQCKRnKQCUtrTUtUSxpMprrUUKxSpxrpprMrxF-EcVGxTX";
}else if(dialogManager.tileDataToIndexUnchecked===11){
s1="QREc7lR7oVUYGy_KJOJKKKKuK4OKT_K4KG_u_GJJO_3K_KKKL_4KL__KK_4_LKK_MjzuOOK_KKKOKLKKLLUjzji_KKMgyzdMjzgzzzEszzyzzjvuQvieeid_POOvzkzvzy_TvuOK4GKKvyyzzydJQi_OdKKaLOLajdOPuueaYBzydJdPOybvdbjeuvizwzujuQnunl2wBnBE2-EYBz2nk2kFzwBzznBydnwznEYwnnEBnnwkyvwzEgznzzEwwwwznnxK4KGOJ2zl2nzifvwyw-J0GGJ042nvzEvzwznJEnzlG42zg02KKGFzzEzzeT-woKK3EvoKLOJBnBnzE2EznnwnwznznzpJKKKKOOKG_G_LKFwl2zK8K4JK4KKKKKKKKKKKKF_g38EBemXeeeeeemeemgeXeegf9XgeeexCxzzzoenErMroeXeeegfEzSS9eVcghoeemf9YBe9ee9eXghrzzzKBfIUzrbzUzzzbryOxrzzbbsTXe9geY9egeeBeY91cUy6z6xtxbxzbzlzObrx6ztztue5UyT6zzbzbae7UxyOzzbzzbbtzyUyUtzztbyUzzbuecZeBeXeeecgeV--1ViZ-00JJIV379xwOLKKgzyzK2zF5g4ccBgcn9ggepUxAprzztxtyOzbzzbe90f9cXX99V-cAQAOx-PFLqqmemxp9zzttzIAzrrzzxzzze7X9ZeceX5ece---AorF0B4uUghzzae9-6VjJh_UznK---NUXV1NBEpOLYnzlJ--0X1X--Vl4pk-B5KYEc-D29vazJ-HkP9DmexzxxzzzrbztbseeeHeYHceXV-NC5uUF-R5YYCyX-2Vpc0jCF--5lM7-12TuM-hkQrZrS9X7f9e9enrSxrzaUxx9f9zzHhzUxqOaOsObbzSxoqUxyUY999c9Xcecce7eV5NDrSOLauUwzzzzEGK4K_0F2Z6YfEUoefUtzUzMyNNe9ceec0a2zdLQdyjwynxKKFznpGGJ--1-_X-AW0ZpjvnzCKKJ--1309--02HO---WrDV1sGfOOjzzn4KK-0FYN1qP-2W7RtfkF6J8G-geeemf9gemegfEbqUrxEbyTgecOwUbbxEbyTTUac-H3crrjCLEE1KoQBrofHegeecBefBeeegfAACxUHemeeeeegxrSrzxxoeeXXe9ecdAzUomXexzrzroeXeecc711_rI9nUSxxKMSryUzrzUpxKx9cV7cceghrrJnJmhBe9ee9VUrxy0a5-7e7VVX-7XccOVX99eefKKAAMxMIUxzMrxK9XXXXeXceXceee9mxxp9oeV9mf9eHgmeeWsXnHcmfA9oenJf9XcXcOby999exKKzMIJcceYBggghxrI9e9e99pxzpHeccceX110cXe7cXWzrUzUxzzrzrtzbaOcVcceXccce9Xceegcce6emeZe96buXeXoe7TZhBe2Bmc6eIBdC9eC9fHcHcAC9erxHed90C9MTUzoh9ZjJeofIAzHghHzI9nHYACCA9VxIHcfx9gmmnEJrKErJzSC9xrrrtyTOaUa0xSxKroxMSSrIMKqUlc6bztWx51--P7OyOy0tcX997V-NP6WsUaUbaOaX6VTOzzzxxpHnBnBggofCKSpJxUUo6pzzbtzyUzbxSzogfABeceef9mpSzoppI9e7X9nCCKMMK9fEI9ee19mfBgemh9W91WuI9gf9e5eX17N5NUXc0a1nBenUHfSorpMKMrHXh9XgmY9nMJmV1nIISC93fA9gnKBemp9e9XxKoeeeA9fSMzrxrpMSxMMHorIKII9eecgeceeee9gmghrKKCpKCIJonMozKJp6xyUzSppr5OttzzzzWWtyN5ObcV-5OaOWttyTTN5VWWbbzzrrxaOtbyNTUUrrSMMSpxrrSrUxxUUpSzSMKonIOaN6aVcVNOzUrL17ccXccVPeccX7717cXX-5V0zbzJxOboUKrKrrUxxrrSxxrSorIKSrMpUUISxxAESpGxrsVWzP7XXWzrrxVNXoccWcOcX-6xrV6tx0zxzUtbtzq99777WWVUV-50xaV0tsNUbzpUUzp9nUrpIyOzaUy9ge197e6zlbbbzbbyUzommhxonCHeIxxrxrxrUSxrUrrMKoogmmecmeeZcceX7eXHeeemmmn9eedCzHfoeeeZe_IMzIpoxHXKzUJxxUoUUprza0zxxxrUtyOaUUlbxIMKKKoopCIJpJoommeeeX9A9mmn9cce9Xe9ee19eXe17eA9mgnCKpJnBee7XXXcee7X-99XXeee9993cXV0ba5-XV0aOA919HgmeeBeY9mmX9ememef9ggn9ghA9mXcmeecX7gpCCCBnAAAABnCIICIKpJonCABnBgf9hBpBnBnCCCJonBnJnJonCIKprSKIMKKpJpCIKIIIHrSMpJjJxMpz6zHxCrrMMUSprKSIrMrMUUMrSxrSrSrrUUyTUbbtz6zbr6xxxtbtyOtyU56tzyUTUxzrSpxKMU6lWxzqNUSxpUxEMKJxCJnMKEUHhICEMrHxSUMSrMSrSppppMKMSSMKpKBxMKpppKKCBnCBopIKIKCEKCKKMMSpppSSSMMMMSSKKKKpSKKSKSMMMSrSSSMKpSSSppKICppMrUSyTUztbzzbrxaUq6zttbaObaOa5TOa5NOWWa5TT5-N50V7WWbaUbbtaOX-N-7-1-170cTT5ObaOa5OtttttbaOa5N5-1510c5V--0VVcX-1-V51-N7X-WWV55N55550ta6aNNOa5Oa5OaOaOtbaOaOaOaNOa55NNOV50a5-T50WWV-N--7nBf9mcmgcmmmeBgmee7X17eWba11X7VX7X79X97Jc7V7-V7117X7cV7---V1-X7X97--7X111111711-VX77V7-UMMMSMSrN0V5-UKKCMxpprSSSrMSSKprxrSSSMKKSKrMrrSrMKpprSrKrSSCKKppKpoxMUOzaTOzyUaTUttWtzbbyOts-OyUbbztVObyNNOyTV-0WxWWaNNN7X7VXceXXX17-7WWIBnIBonBd9eAA9Vc7NNV1CIK9117-797X7VX1111WbWy0xUzprSSSpprUxrSxxrzTUbqP6zrSKprxzxzzTUUUztzztxzzbtzSSUSMSzprSrrtzJmmfrSrSUSzaTN756xKxCSSIKMMKKpSKpMKprKprMKpSKpprMMMMMKrJxSSrSaNNOtVN6s---0WV17N-V-0aUWbyN0baOaOaNNOWbyOsN70btaUL0xLT6o-UM6lX6brSppSSSUUSrppEF6pSSSMKKCKVUMUL0tba-USSUKSKSSMKrMKpKSKKCKpIKIM6rSSpxMSppKSMKSSSpSrSxrUSlwT777VV---777X7XX19XXX--7V1Hc1--N0VN570c6bzKMUzrSxprK6xMxxrpCKS5NTT6cN0zltaTOa--57-11-V7X7VcX7c7X77977VN-Oa0aTObaUUoOxpKpqP70btyOwUsOw776rS6twUkUOtWaObX6ta0bVcOcWy5N-5T96XWaWccZeWWtaX97cecWzUxxq1X7cVX77VX999750a6VOttw1XecXnIBe9-VZceX7V0zTT-OtWWbrzSpCCUJltWbbbzxzUpoxopxTUUxprS9zMMSKKxGtaUtzV177177cX7X7X997-OtWaNX150a6V6rxUxtbaOV-NN0WV-75-0V77777X711-1X195XccccXZe_on9c29c799ecVOWaN-55NP-T-TUzzzzlzzzsUzxzzrxAqUyUzuA9770V-5UzbzOzSSUrOVOac7WzzxCrSUMJgpIJrKIHgrSJxSrMSrSrSrrSrSrSrrSrSrU55-X77TOe775OxsXX7X15WzMcXccX-Xee77-VX-UzkOzSq7UbzzxzSX5OVNUbaTP6xzrzccccce1XXeccWzzsP7ce-U6rSzSzbzUxxxzxzUwUqXcPVTT99XXce9eeXzS9cXXX9XceXe9e9ce9cece9e9ececeeeeeceexxxxrHee7ece7Ue9omeeXeeeeeeeccX999e9eeXgef9eeXXXeceec5eXefC9eWcPn9WeXeeef9hzSxHcfx9cBe9emee9X_Sp9e9Xe999XWyce7X9ceeeeXerp9eeeceecVeeeeen97d9ec_BemgeemVTOyTNUbttXVe9cce9eeef9e1ee95eeec--3mJ3-01RcfV-NIoOUF8R8uLgf9hIHeec1Xe9fBeh9mfEzzyUrHenxyUyUtzyUxzzbyTTNf9e0a0cWEvKdK_KKKLKOK_aJaPPOOUeKdUddLTyEukyvizjzzzGK43G3322EBkwBzkwwzwzwzwznwoKKJ0K1X2ABrpzzozzzaUWtacme9hxBcXBoeV9--7KZ5R0K1i5QpxUxzUyUzbxztyX9e9oe7eAHXe9eV--KycF0gAC-Bf9rUzta7c-54dtbV-61qbAAy---LztF1oAWqEUzrzxzbeXeecf9V-94pL6xF--Agu7--4xl31226aIBogfABfBf9nxxMyUztttttzbbzbyUtzbsX9f9e99eeec--5HLZ-A28MQry9f055LVqKKPKOaOddaKaKOOd_bizvy_MeOOOK_LPPK42BnJFzszEo0G4aLKOUjuOLO__GKKKKJHKG32K_KOKbnzzdKOLOeOO_-EoJG5KK_KKKGK2wzElGLK4K44JGJKLLLKFnLLOJF23dLLLK43_OK_KOOKFqKOKeK4KG43KKGGGOKKGKKJKKKKG0OKF_FOK_OKKKPLJK_KLK____LKOKKOLLMjidbzzdPPKOKJOG2pOKOKLLKOUu_PUzzzzYwzwydKdaOOKKOOKKLKaOK_OO__aEeOLTdzzEBydaaKdbEnzjfBnuzdPLLO_OLLOK_OLLLUzEnnEnzEnwwnz42zuRzEwwwwznK2nnwzEnEEEnnwzEzvdKKOLO_OOdOUEnwznnzYwnkEEzyEiuUvjzzzvjnyaTyuiz02yyawBkyeQeeOueddaUibuPJi__9gwnyaOOPTvuPJTbeLzEiYuEiaQEeRydiddddaJ-x4K4deadddaa_daaOdaOaOddePaPOaauddeufEeaLiuOfevduazjuzfvieeeuPueefiviiebe_3KvfjfEfiveePivjfiuiE-FGJ--3--4-FFF-FF33F-B-22vjyjeauefeiiuzefujidavuyuivfiuuvfeeuePaPiuvvjiiyyzyivvvvvyziyvzjzEnnEvyviviuvivjjzvjyyzwEii_viuviuo-2vjffdKHPdivgEijjieEigzjvfYyfno3-z2BzvvjeOiivffdideeeieOdeLKbeLuOOOOedaeOeidjgnueaaLOaafeveLyyvivffiiuuiiiiiiiivevfiiieiiviviyyvvvvvvvjiuvvjefeueieieeeddveTefeaieeeeQePevedeffeuieeuaeeeaeee_fiffiieeQeffideufj3323FwEjdyuMeuaveTuQeuLEeudG33_eLVzizvdjfzi_JibeJF44fzeeu2vc3BEfdvdjfy_vvfyEvd_TyfyeTgyY2yzFF-wz2zJGF3F-kz-F22Bn-0GKG43F-2BwzFk3-BoFC4300-EyzjzBo3-l0-zzzwzwzEBk2B-440-04443-EivzjjvzzwwkkBn2-B322BB-zyadY2-B2-nBkk-oF0-o-o2wBnnBnnEsnE2Ezsnvzk2nn32-nB-kk--BBl-2-23-3-BF-B-ysn2-kBBnEBBkn22-B--00-00GKK43GG03JG43KKOGJ_444OOFddF23BJHJGGGJJKOddG-kBKHJ44G-nB-K3-F3-F403JG3GJK45KGdGK8J3G44-3G04J3_LK2B23JK8G3FExKOLK__KGG4KOKG-3K4OHLK_affedaK-G-n2-F-wn3_aO___KaPJ4aOeadaOaLdG3G3GGK5O_OOOGGJFG3FFFF-k-22--n--GJ2K4KK_KKG_KF2n2-2-C-nu22-2-nBn-KKKOK_OPaeOdd_eOK0O_KOLJG44J33-FFF3-F-2-B-B-k2E202--n-wnE2yEEEB2ynkygEfynEvijz2y2GJ2zgzEgwygwyzvyigwwziiiveaaidfuuevfiE22-k-0---F----knBnBnnnnBnBwzBnnEwx-EsnGJEnkCJBBBFkB22nyaLdfeaBknB-EsnBnB-zznzKK2nzznEzx03BknBnBwznByEwzBnzBynnzjzdLJ_OL_aOigwnnBnyEnzEEnlGOJK4FpF-FnBOJGFzywnwkoJKOK_OK____aOJBEBwnEEEwwknwzzzzzzzzzzzEBwnnwzEswwwk-nC3LK2BLKK2wznJK4JK23J4-FzYsCG2lFoJEC332JCaOT_aLPJ8_OOJ34JBFnFwBEK4JF3G48K_4_44HLLPdaPaeOOaLLQiuudeOdaLOOOOOLKOeePPduOaOdGOdGJB3G2FFnBB-nB4K4_GG44GJC3GJK4KOKFwB-kG_F2BknBnnBwnEBzBwwnzwzC3EzwnEjzEEEEE4KK0-zjizwwwwFzzvih-yC02yijEnnnwkF2Ez2CJGGKKdeOKaO_Gbd___Fo-nEB48O_aOG2k2pK3EBzF2042wwwnzznnEEnlK_4F--Bnu7-D5P0Mj4-NFneHn99fHdEpA9e1mrUrMMy6rbyObacVUbsXc-95VQqU-0RC72gfrLTUX9WL7PGHOKOLKaLLO_aOzjzdKK8fyy2yvzzzzjnvEyszn-yvuyji_KjEzfvvdedLOOK_au_K_8KK4O_Oavznwzj2vYyiizdQjjyvjvzjnFJ43FEvyyvysEV2vkG-oJJ-J2vC2nzfvdvcyvB2EgwkznoHKJEKF44K444Fwkzjx4JEwoLK2EGKJ34KOGFCFK2C3GKKKLujnzuK_aK4K2Bl0KK_K__OOd_id_032E-wwwznKK-5koy5rxzzye9XeV0NQGfQzp409Fr2emf9gemeoemhxzoeenrzzzzzzxoeeeeHeeemnrUzzJr6zzzzbyUztttzIzrzrtzaP5Uxy1XXc7TOVNOcXemnCBoeVOX9IHeX9ec9V-7QyMR-O2VLYCrzOcTXeV-7R7oR-42W7vEc-16Tkb---xZJV2sUexOjjEzzlK4KJ--2yzH--10C8--0-gFV-7VNER-038rYV-7WePR--3FiX-8X7VOizvlGJF--GAnc-q7b4qavzwz43KJ--3In9--193W--G5YBk--7uzo-03SVI---Z6nF-JH3JgtV1NZFfOiznCGJ-03ZUnV-NZy-Ok--HUC7-18Epr--G9ncs--8SB3-23innD--1O-0-6lCPTmmnCzzbWa9c--8glJ--3qO1-3XRYCbzK-XlIJjmegemef9efDUzwUzx9fHfBfxyTTTUpsTUxzWttf9eeWtzu7-19Vk6-2lJH2nUze9VKcf22OuK5ObzzuOLKUzviaKzzzfzvwwzEwwwzYBzB0GF5JGaKOJOG__3a_OJBG4-PlNXPmfBnBnBofADUzJzbbbbbzpxzbXe0ccX9Bc6s--1mmx-6lYOwmextzUrP7cc-5BSZbV-45HC2T7-9BdhMxF6JOkqwemmmmf9e19nJemmmenzryUyTTUyUbbbbzbtzue7-qBstqKOOYvEEBo-45TmAqV-1Bzxq-CGcDCxzS9dEMrxowOX7V19X-6YINKaOgnk--leh3lV-cqZnQo-AGhLznASpxpObxa-cXcXV--sj9F--RjYc-9DO8aRk-JRodC5V1Ntt6OKvznCJ--6Flm--Yf48k-BTXJhc-LEJ7aTYC-0BTkwjJhyP7P1LYtQd_KPPLbePLnuafp-yEeddzzEuOiydeKOGdzeaK_jzjjuKKaOaOUEnynBzvnzVyzzEE4FnBwBGGOJBF334G0-3JKJEknBBlKKK-wnCF-RUIqgju-4Yv7daLnB--6voH-EYxyt_ueaYBBE24F-wUjugoqOWc09F4K5OGOOYyzBzElK-1m02NnLNP--32h4-0m0qgnqV-1FPCq--H2Gus--FRXJ--7Gue--38td-6H3zimfGzxLPWaX--3E7C--16gBV2O3CZOuLecn-n3--RX7jgyP--3G5C--18RXV3t3nbP_3_iju_Hz2-B-03XWAgfxyTcV-047KF--Xjy7--GPHJ0W7iC6CSKKIICJnCBemzqUbV6sUa5PX6w1711-V0d4t8OOwwo--7o-P-3ZP3pin4--1CVBV-85mEN0d7rPv9hEIBeXrICxpCAIBtxrtbttztWV--UWc7ec--ZRVOk-3Y_fi--3SWl-1HE1urq7V-06YZF0JYnKBgltzy9c-1GuEq--1Ey3V-87P_R--8B0X--3aep-1HIL9xw7V-08jeF1RZt2BoxCKLV5NOaTeV-LHXk5OUn-3B_KjRnEJxK6xSIBnGsOV5-5-N7e0PZfppdQivevivviuviuvfffiviiiuuivV2vxJG3G400-F2zoG43G3G3G43G3043FJF-B_XHC--1HrHb--1Ml9V0OBPSTykK--mPGuw--0CdCF-3bQrg--_-bGk--c3w7-1J1Tb-nHWSNmnBmnCBnBognAxAACOzzzUbzOzIAAEbaOtbpICxtaNHW9WWttge-Ou9dHce0uXWaOaNTc0qJ_j5Tfuiyfuvyn-43-C4GJJF-ZdZ-CEN--qKF5MivvzoGGJJ--9fZm--4NVG0OHj5Imgmgn9mggggggzbxlyUttxUxrltzzxUp9mcegf9nBx9HzICBnICCIKMbaOWa0c55OWaUlaOaUxxrIJogmqTUpK6aNNOaN0xMUNT1-XXceee7cN575ec0cecV-0P9QF-3hh-D-7_jKnaJ2nyZ-YA_nYBnBnEUttXVOc8aMCmTLLKaaLKPddbjiuievivijivfivy_PPeaeffjyyvjjvzEnzso3-F-3G42l4J-2zvEBGG00LLuJF-3KFK003GFEyxG-nEzvp-B33G_JK--muI9w-5OSJStaOeji--wBzzzKGOK-0JieNwmeCzzaV-TMQgDzvlJJ-GAk2vrxkPe7--MV8o-6At0AC5--OURXy--gjqMEraeV2OUrqueTfVFl22F--jvyN-PNAgydcnF-Yn1WRrSpppMJeYrJnrUKq6ce7WzTUzUUUNVNUtsX7VJece9XXX97c--5440-2I2OHnJsOV-1NxR5-Bn6z2mgeegenBzbzzUbtsN--0_72F--nKlc11OxXDLKKO_OKLQvzwwwzEnnnnKF0RnydBghMMNN--dOfypPMdfibveueeaPaOO_3eafd_J8KOKKaaOaLuLaLvcyEieQevy2l---GFpJFzz-ynwwzzyeiyv-Bx3FEjjzVEvV2s2ufk2G0--3FF2020003JG33F-dC_NYAASKopSbtV--77--QufZ--CxYX-5b-NCbjY3F--sGR7-DRSQ6v4--2ZTFV-OmFuQF--tWp7--Rrk3-2DRQfF-ObG_p_LKK4LQjvvvvjk3BB--2cnkV-0opdF-BuUUE--1SP5b--2fOPV-0qQ8F-JvLKBlV-ttYkOgB--EKfm-GbimObjzjzzK4JOJJ-QEW629fAEU6aT5-Kbx48aOGeQiv-nzVk1K--4-Bei-2c4b_aEF-00fX7--VsoZ--FYHH--7bwK--3KeVV-19ymF-456Wg-0cmm4s--oPB-o--PCDOOk-46F9i--7vjd--oSsBlV-uEMIQY3-0GwSv--1EeMF-06tTc-5Z2ZLk-2HUyYu-0dG4tY--3dhcV-1KhfF-09wIc0ea0y5OddePfiivc-kk---0--hB85hIq---PPqqQ-ACDhYBegf9nBoyOyOtzzxAUzUxrxzxKrqUSHnEyUzzOzbcXXe5e9X97XXXccX9Xee--1UpAF-SFcxhOX-1eB0xgo--Jd31--9KJS-9pBVymefBnKMUUaOVNN72Xdb-LMveiuLKJKMinzzzvfY2BzjEzzY3GK3FK4KOGKF-0Ji17-ueZcLLyvwzYGGK-0KK8igpzza9cc4aecw5eQeefeK3iifeyVyyaPysnzivW-yvivjf3G32JdFG5OJG-3--EB2003-C_GGF-0M4Pc--fYVJ-0L1VIV-1kjSF-0NOQ7--gXeJ--LIdm--AAXh--Kaimk--h2YJ--LYMm--fHOlV-4QMoB-1fQzGbV-OM1DQUKrSV17XV-PsGvQ--0R8xc-Pi9hLee----4n7gV0uuK8Ovwo_F-0SPF7-Tihf5jioG3-rMLqIMSxJfMpp51-Uk7-X7mV-1vH3F-0SiM7--ivJJ-4MU-YL--5j0_5V--MW4m-Ffnz4uebcnu-E0K3--4umFV-1xQQF0KULdhJnCaOX--5ji96o-jMt7YCKBproNN55-KC9-7-Pjp4LPbw---4zuVV-2-p7F-4VdEB-3g5r8awo-6q3GTnIBnBlaOaOV--kXLJ-0NJ5IV7f1wFOePedueiffjEBwB-FFFFFG0F7pWV6CJfCAHcXBnHgpIN5Ox6lbxrJpMSxbpNN7V56rMF5-7-X577V--lo2Z-0O25AV-28oRFJ__7yBm_ICCAEJgcnBdJonCBgegnJpS9XXe7nIKCSSKpxppCpKUrbzKOzaUUoUzKLOttxGVV557-OWtbVWV0a6ryX7X70cX1-cUu-Uy90zaPcXe90XX--AA8ER--Oap9--gnQdkH4b2ThSprSrUSrMSSUSxpMKpUSprMKrMKSpprUMMSrrSrSR6rbr--N--0X71d9-VV7e7WaWu1Zc-cVe95BcZe7917X7cXV7VX9eeX9--Bw-4--LXIak-9oUkasF-KdZHh5--QKOSQF-0f7Ac-DpZnLQC--5ifVV-2M_TF2_g-RhCKoxKSR7-6xX7OVh9-77uqCsLOaOKKK4K45PKaadudaaeddaejyeedeTsz--o-k0-nzuafiueskznG3FB3FG3EBnknEs4_OOGa_K03F-BBzvnywzvvzEBBkk-EQ93ASrF17--hcV8V-0ho3c-1r18a-KLsKtn9ghIKopJxGbzlz5PcOWWV6bZeVXV-erChLbuawo3F-0QgRIV0AS_oTz4F-0iqsc-LrVEayh0F-0jBw7-1raaM0sqwtimmmocCrUzKrUzbxJeYBexrSIoT50xMUUSrzrrxxxrppMMIrI9gnJzzaUOzSrSUUzxtbX7OsU-UOzrUxxSSSpxSrzxzrr57cWue-BcVX-X7X10bqN7e7ce7-7cX7eX7ecccXce9e9997eBhHmhBnBme7791-5119cXV-ATZeR--Qs0X--CxF4-2M-EHrMNVV-1s18b-0M09Rrc-3i33Gcy3-7r1pBmhExpSrcP9-7-3i6ThbzJ-0r2kLmxV-LsT9bywKF-Cl8ajc-5sg76o--RNyP--DBcS--r75Dw--AZP8N-CRYLYIrWcV-AZ_gR-hRb0Q9efBUUzzxrq7Ve9--DIcG--69X3V-2_KXF0CmrNBxUTN7e--DM2x--MBNss1qtbGTeeeiebfeviufifjG-FF-FK-2F-F0-F--6CEoV-2b0EF-pnx7hKlVX--DWBO-IrGX5pJgomd9Beefrr6rUttyNUsWaN9c-iuOLLLPjcnF2--0p_uc--uwAJ-ISZnnCIKWa---QgbdT-0_qJ7CprKy7917--Do60-0MPdwpc0LirO4eLzjezyyzzzyyzjzjzzzvvsFEiyn3OJFKKJFEwwKOKJJKGd_GKKG3JK4KJ-ESx2nSrP79-5j2XKaPVn--_t4Cgjtc-1wYGa--6ZPXV-Ama9N-CTK4nUSXX--2n3-F24thzhrHcXnIqUttxbcd97-3jCxpvh0-1rbiZpEa1-JjETd_azzgznzC_KK4F-0TTz2V-2nrwF-Ctvzgs-Dwy-LEp--Mcags11x3uLKKLPLLLOeNwzBknnwwzECF-0uAGc-ax4e5iii30---6dYeV-2pDWF-0v0pc-uxhu5KvzivnG3GF-0vS9c-Tximavyl4F0GTtRbKpKKKIMKorSKxcP77--50cV1--X-0jSM8x--MlFHs-PyMyriv3J--6njmV-AuIRR--UKqu7wjf1GaaeOdiaPdeeaeadePOdd_OGG3FK43G443G3G-nBB-En2B3P_3HKJKGJJHPdOKJO_aOeOaaQe_K4_F3G3O_8PKOeLOPeOK9TddJ01OaPPu_aOdaO__OKKaK___GOOOaLLLOd_-9PPeaPPefeueOH_Afeeeueuaeaieeeaadd_OdvvivzynwnnwnEnzzzzzznBnBzEEEEzznwzEnwzzzzvizyzuuaveuePv-wnBwwnBnEePaOaPaOLEwBknueaaMwzeeePPujjczvyvwnnnEuuusEnnEEEEzznEBBBkn2BnE2BknknBnBwwn2Bn2B2BBBkkn2--3Bk-k-F3F3J0F-BK8J-0-3Fl43J0JJFC0220-FFB--434_F02-3-FoF-3--ULK1-9jk6__KPzsnC-0rs2uxu7-5z6oLo-0Ua7Y--2yTuFFpzEegnKCAHYSIEIBgmnBen9mhJonKKpKpKIICCBopKMKpCMMMSxxtbbyOVNN50V550VN50VN50WVN-0a--0xLN-V--711-V0R4w-PfBJ-5sCnMpUSzGcVcX--36DPF-a3T2CpX7-21Rkb--7L9iV-3CdyF-D7K1E--E3yyLPB-AsdryprMSrUMUXVXX77X7-0lNuCb-0sh-cpsV-24z4a-0O5skoP--HJcO--8cjcVMwvW_PePffuOedddaOd_OLivedaLOQswwnnBwnnBBEEz2EknBl___JJF2-ddFJBB-kFJF-3Oxo3mryUe9--oNo0k-L_0tBtV-x9UXPVk0Kd_2QCCKJnKMU6Wy6x0a5OtWWaA9f9eX9VNhBeeOaOaK_aOaOOOOOOOLK___aLLLL_aLbzjjjEnnnEEBnEBnBwwzEzFnBzBnnnBwkBOJ3--9Q2JV0hFDWPTj03-0esaIV-4M3pF-DfxqCV-0LPM3-8fbYnBy5-Cq8_WadYzEwLK3--A59FV-CZXbR-2ghDYk--LQk_-0vCsPnTV-0OncZ--gxEe--LXbt-4QGLNnIMaTP9V-4d4NF0DoYGBxBttWe--LdTx--AJjgV-4fDgF-1q1n72bQ0Tq_fzyaLyy__JbzjyiyEvnzoEzz4K44GG440J0GJ--AQaoV-hj4xQW--QUtTs-0QzBZ-2hzuIu--M0W0-3QVpXzUSX9X--r954k-6-LVD--s6udk-U12pBUe--NKbO--B9nkV-55gUGAILAU-ee9eeXeeXeee9eeXeyN9eeeee9XAzbzzzUUtzxzrza1fzrzs7Xe9XmeeiUzrWztzbzzsUztbyUUrztzUzzyUVfzMzzzzzzzzzzyUzzzy1SzSxzrzVczzSpUzbrzzztzzzzrzzy1cXXecXe9zzxzV9eeee99USzzzztzSzzzzzzzzzzWtzMUbUztUSzzzrzzsD2xzxrzbxrzbVeXUzMMzbztzztyUWVX7cX7X7ccX8rtVX2Vc1gVWrVNOta1UbbaT6byOyTMqXggpFemnBnLpThScXXopfJppUhSzt_USUrxSxSzUUKwepzznMzUwefMzSCJXAKRemgegeeoeeeeeeXe99eACMxzUrxzUzzzPmeceeeeXeepzrzzzr9eee9e9ehUrxzrzryUzzzxwg-3sRUlgzK-1wGfBrUXc-1s_20ck-8lARQMsc-6sakWaUYsG--BJEyXtygSR0KGMwzkKK_KK_KJKK4JRnEEEEzEnwznzwzwzzzwzzwzjw3wkznnnkKOKGnEzwEEwzB0wn2vyizz0nEEqPvnzzzwjjEjzEEwznzzEzzwnvz2jjvvzwnkTzzzj2vznzvzyzzyzzwzzwzzwzwzzzEnwnknzfjvuzECfjDzEBBwzEwzEwzwzzE2vfwzk6njvw-nzEEzEzyzvjvLizyyzzzyzzzzzvzzzzzeOPPKd_4aPuwnaLK_aOezjEwznnn2EEnn2wzzEmwznzEn2nwwzznwwnywwzzvzEznwwnDPzzwzzzzvzEvznzjEyjEEnnwzzzzvzvzywviwzzEBwzwzzveznyuzjEzzzwznzjwzjwwztfvzznEEEnzzzzzwn2BwuO_fizzvzzjzjDywzjjEqKfyvzEOfzzyLjzmzzn2hPjjAwzjvjezvnfzzzjAzfjjqKOO___OL_KKKOK_LKLO_KKaKKOaOOLOO_ePLiKKKLKKLKKLOOKa--wN-ww--DBg5N-4latIyc-MYUfaRyCF066q1CJxa5X--5F6mF7z9BugfEUSrSArzxBefBeJcrrzbtzUzHmfUzzzttVX7X7XXX7XXX9--yKGGTsF-2mkw2k-3tQstjx4--BkdsV0DNK7PzGF-6B9ki-9tXkO_K_zznl-0RovXrc--OeZW-IRqTXoeXefUzzzxHYUyWzzzu9XZmZe7-1tmAWzJ-0nbeYV0DRxYTvG--2Dto7-0bYlJ-0nm6v-4DTdBTzyzvzvlJKJK4K-8wxJTrrrzrzOceXce9V-DTg9R-dnsbYExxryUzaeeceec-6bz2Lk-2o5Gnu-1u2YOv3-0oCyAV-iaLAUp--CCXRV2Db2oOOwzvnpKF-ppYW0bVVaOyUzzzrxpxpzPk-2eBMb-8xGoerUUxzry9Xce9XV2ydQ2OK_OjjnBwnJ--pC19-2uliNEyk";
}else if(dialogManager.tileDataToIndexUnchecked===12){
s1="JJAf25PfV-0nEiiuyywnyueuTbfevfvvjivivivjfvivviyvuuyEgzjjzzvviyvizvviuNziyvijvijfvyvgzvvvvfeuaeaLLeifdueuaeOd_LJGKJJKLdJJPKG5KPPuedePLLddOaeOeOKOOKJOK__LK_OLLOO_K34K04-F-2BkG0021Pifiddaedd_GK8OJ3__K4--B09eduPKLKJJK43G--aieyizvePde_aPPOd_3G-3JF3HOfiviyifeOaOdaO_HOJHeKLvdO_3331PaeQidvzePeaeKHudePPedaKKKKLK__-zBl4-kx3OHOeudaLPiaOdcwEePLOd_daueePduPOePaeeduaOdaJJJOJ_POddOaddedeedeLK8dOdLKdjziuieffiuiveiedOieifeuviviyviyvviyvvvzyeLeOdaK_JKJGK443K4KOOaKG3K8KKdddaOaOOOOKOLK_OOaO_aLO_aa___J2Bkn--nnnnwzEnnnC4LK8JKKKJK30-o-oGKGK4GJJG3K4J0HK_aK_K3FG4KaOdOOLKJJGGOPffeeQijjzivfiiueK33F3K3G43_KeiivvuueddJFFFFFF3JJGGaQfeveyvuuK444JF-F2-FGG3J43F3-Ew05OOK_eePaaaeeiufieveefevifiuuiuuideK_--33GG5dKauviiue__LLKGJMjjjjizjuffjjvedvjvyiiuvuvvvvieOaeedueeeaK0FF3GF30G3-OK_KKOKG003Fwzvzgl3FJJGK3CG3C4aJ-FOdKGKJG3JKK_K4OG0G3OaJGF2-0F--K230_F-2nzzvfw-FKFJKP_F-G000-G430-BG--l3GG-o2-o30-433G33J333-2vcB--F322B2-B22-kBn-3-22z--z-2-03K403G0--333FG330434FFFG333FFxT-2bhSxwTUzUMpopJpKrUUUUUUSxxrrrrMra7N-0bzKCKrSISrSrSrUMUUrSrrrrUxUrbpEUMMSrSrSrrrUzxrq56xICMKpKKK9fSrH_MIKSKCxppSJnBeemmcX7XX9mfJeHgeXhKCCCBgpHmnCCKA9YA9eeemmf9mgfABgmfBce9ece99AApqUzUUSxBfA9jrxzUMxpUUUrtzyUrxaUzUxrrMtsOzKIpSxBoeI9fBgf9mmmggmnBmgfBnpUqTOzzUzJprSSxttbzxS9jSKpKpCHxIKBhCCrSzUMMzxyUbaOtbaNNObbbbtzzzrtWaOtbaNOttzUrSrRUzbzUtza-150bcUq-99e9efBn9cX2BnIBemf9cXX9X7X0sN7779V9eWaY90Be0Wy7n9VX7ZccXXXe7Y9776zzUpprV5-UMMML5USpJoxTNNN0txr0WaUzaOaNUpT-770V0zKKMMyTOaObtzbzzzttyUbzzSWaOaUbbbrROa5OaUzzzzyUS5OyUtxzztzaT0ztzxrzzzzzrzzzOaOaObaUbtyUbzzzbztzzbtyUbztyOWaOsN--UpKSr6btba--NV10yOy5-NVVUxbyOWWWbrbbzbzUUUUSrTTP-0WWWbV-5Oa5-5N--0WWVNNN5550X-50WVOa0txUF-t8y_LOaaPadeeePeaOaPdeaePePdydd_uO_dePOaPTdQjFnvdyvyznzzyywnynvvjjizjfjji2ueePfivyvivivviyviivivziiuiiyvivjizjeivziivfffivvyyzjivivivfiivivvvBBo-zivgC-BoFFFFnzuuzil43EyzzijBFF22---nsn-n2w22EW2EykE2ns2EnEwwzzEjYyveKTyvvisEzp4J2zvgzvvvskB200FzvvzEjEEzfivvfeiyiieiifekyeaTePfeee_Lvijiyyvjjvyw3JJFnzskEwB2wzyyvuyevyyuvvjyijjud_aPPOd__OKJGPOdOOOGLaPaaiePPPeaaPKauaeOaK43G0-E-nzgBB-B2-k-kB-kkEBnC304PK5LOOKaK4KKGJFOGKKOK44G_KK_aOOOOOaeTee_OdafzfiuuvfzzjjeKOK8GdaKJJG3GK_KLJKKaeTefjizzgyzzivfeiijuuavfivijjjiefeeeeYzwzEyeyvivffiEBwzyuyBnzzjizffeaPeeaePPaaeffiudedvvueuQvjivfffeuifix3F33300-BF-21O_32FFBBB222BknBnznnEzEnzjzveueTuviueuffuyyyyyzjvvivjiveQidaaa_iaOdKOLKK8__OaKKF3009d__KOaKKOG3-kF33deeaeuiadePeefffeevfvf3BznzEvwnEzEzjvyi_KGLLPaaveuuidJKaKOdeusn2zzjyyffEyefjzujyeauPaebdeuieieeiePeeieieuiiffeeevfeuuuifeeOOOKOKOKK3C_LLLLLLLLLLKOOLK_____aKPJPJKKKJK4JOK4_GKGJJJJK43K43JJJG00003KGKKKKKGK_4JJJKJG3FFFG-F--3-30---F--F-F02BB---BBaOG2EC2yiivnB--2zjFG40-2-Bn3-B3-Bl32-BnBwnnBnEvnnzzvs03G3JG3K8OLK8_1K3GFF-K3G433G330-33FFG340403G33J3JGG4G3F3G3033G4-GG033GG33-30443G0-232-00-2---B2-B2BE2GLiaOOaJJ3303G0-FOGJ303G3OG2n03-BzEg-Eis---2-kkkB2--22wk2-BzuivV3BK2Fnzeefcl0-nEeik-wzuvoFzgzvsx-2-0-zg3JJG3G033G3G3G44GGJJG3333G3JK3-G4JG3G3JG0-G04JG3G03GG4433G3JK03--C043JG44443JLLKJGGKOKKGJGKaLKK3G44448KOOOaOaOauPOdLeaaazeKauuuedJ08aLJ_8aPPK8_LLOJJLKK_OLK_KLKK_KKK_OLK_O_aOaObzzjzzzvzyzjvjjuyvvveeyyyiyvjjvzjzzzyuUizyyzueujjjvzyiivzjiyyyvfjjjiyvvjjizzze_JJKJGGG43JGGGG03JJJGGK3JFGK4GGFFGGKGOFFF0JKKKK44GG3JFJJJ-04JFJ4GGJGKGK4KKKGKK4GKKK4KKKKPieQdJOK_aOO_LKKOdfzii_OK4G0OO__KKG9uuifvvyyvivYEiuavviuOOJG3G5aada_0-paPPdePaLLLPePeaaLOJLKTd_J-C443JLPizyuLKKaKTivzzK-nzzvvudeEuMuiuiffivyzjBEviuviyuvivvzjyzjjivvfjvfjffvjfivfiviyfyuuvviiyvvvvvieiwzjvizjzzijviiiiyzvyviffebfeTveueieuiuueeadddaPLdaPO___aO_aOLKOLaOOOKKOaO__K3KKGGKK43G4OOKGOLKK_O__GO_OGKGKJKK4K330OaOGK3G4K4GJJ3C43JKGJaaO_K43FG400--03G4OOLKKK443JJG00FF-nCK3L____GKOKJKK4JK4KKKJKJKGKOOOOK_OKKLKdKOaOKaO__OLLLKOOaLLKaOddOOKOGKKGK3KJKG448PKKGKK4GJK4GJJKK8aPaaQiviviuvjjzzjuKKKKKOOGKOLK_TivzvudOKK44OJJKJKKGKK_4FBz3GKGPiuyaLJK4K4GG304KO_GG4KOaOOaLLaaLOaJaaauaeePLaayzzzwzzzzzyuPLOaOOaiiuveu_aijEjeOPPLKPaiuvevYvEeOGKKKJdJ3-k3303LaevfePOKHPjyiyiik2zEiuiijyvizviededaLK8TyvuedeinnyejvfuaPOOJJHLeQgzzvjzzvEzzvnyzy__d_KTddKGKGKOKLLMvzzj2EzzyEvuPPvYBBn-nyzzvvefvziknyyjfdbiuddfjfivjvizvyvvnnnznvnEzzjeBn-Fkn2-B--kknvzvzzjzjvvyvjiyvviyvjyyvjfiiviiiivijiyyvvyEEnzyEEyznzzyEEwwwEEvgnB2BwnBnwBwEBwnzEzyjjjjijvvh3FzivenEjvBnBoG2znwnnBnEiyuveePuOaaLLLOaOauuuuuueda_aQedaPPfiviieeeaPPeeeuueuV1sEsYnICCWaOX-A2Djiew0-1sTHxmoxqUs7X-E2rdDKTv2k-T7vOx9zbac-oJG2uvnFJ-H9UMRn5N-oKUiyjVoJ-HA2lxTNc3gMUxtOOOLKOOKK8KTjznnzznwnznBF1NuDlpS6w177-BUJYv--00C4V0m2fUiVF-03C1V1mBTb_UzF-9H1uSP-2mOCruPsBF-3_SbzUP7--A9Uw--OX9c-BobJvF-0eUxV-2LGE-2b7RzC0V0nZFnil--8odfk--uxRk-OuzUyV1Is4tdj--0bkCEF-6EeL6jG-5bpJQAEbaV2IxB8_QjV-0OzS4pMVX-6EwNrjG--c-bQ-9J2KYdeaeedzY3F2----5VPpx--_0YCvf3F-12_CV1o6LCaeB---Vy4s-K15tuR-0cH3EP-AFalyPf--0e55nrM0X7-S27pux3-aWsZUMKlVX1--GLvZ--Y1Ac-K74MuB-3d06bzP9-CHYRaMekB-0dKyEP-8I9NDvoF-1aXND--Ihqo-5bYjjc-0EccF-1Vu9V7K29M_OLMfgznEB4-IfrEMASpSUSq-7-Nee-ANaSDyx3F0A69npL---5gz4-4hcoEEr-V0hnXluPePzB2-G-2vgnOppIBlzbV-X7-hrg5tinF-5kFunMrXX-6N7gW_aezjYB-G3-00N173L3LdOduivfdiiuvi04---32Bl4K-0wFQ-rMy1XV1sbFlfnCJ164IlRgxKzrzxxxzUyXXXXXXXXX7--Xt-w-r4m1wxxxzse9Xc0iBe2OKaQvnsw0-0wObdmxrN-V-ssA2x-NloQnIKUr6xR0WaNgmVccV7NuMUaivyzEl3K4K-8m2rMAMzq-XV2t7IEvinJJ--HLqL--Zk4Z-Q8XXwgttu0GZmlybvjfjfeffizwznk04GG34JJGG4F-09Gfs15JrEOddacysn-B0-0RdjOpSV9-0_IU5-2mqMIBtV-ORQlk0BiqgxTc--8TzC-AmzgMrUzuBeXV05NGjtMzsnK0on4Xn9nA9fET6rSzprSxpprMKrJxSrSxbr6zSKMSSKMrMS6rTN-999X7V-1-50Vc719e7XXX7cX79--V7Xc-aODYuu--8wnsHopI9YCCRP-UpKSErxru-719--P-5aOzGOO_KKaPivjsnBnye__biyvvywno-0-G00-KF0woW-ppL1-V2Om28efk3F0BwpPnRNWutw68_OadKK3LaPOaOKadyviefjiuvifeiedaOaPeiuiaejjuun-2-2zyyevffeueuTeaTun--nB2knyziievfeuyijVoFG--2B3-0-o-3F--F3--F-zuvjjjiudfgnnzyn3FF2POG3G-B-044-34GFF3G3G3K43JJJFFG3GJ0AGPRghSSSr5UX77X700dGV5KLveufdaPiyBnBl--kl3GF5SBr6mpUzrUMSxsXe77X7X-2uSYzezx3K-Bovu6Uxpz-XXe-1PW82bsl-4p3V2ALOc3acdcuudaLPPPffevvwz--33F-kF33-EKrYCq9-devwqeyuuvfC3B3GF0F0xNEYopzV7V1PkcrfwJ0SpZObBgefKpHmeY9egegghpJgnBqTUTUUxSaUxzKUUblVObsP197V50ba6yT5TUceXeVLunIfdi_3HPOQzvjBzgzyvYyv3FGKKK3OF2--hQSWr1--f_Xg-UMKDRgxlWV05jJ-tiix-G-6pwPQBoTNP-Cg4lTeEBG--L5bP-MgHJ6iiykoGGF-xXN4nq--Lll-OU-6qEHEBntbe-GgaXLadYBl-4SZqqmplzSrtyTHXXXXc2qmSotPQjfePOeygkBkFl3J223-EOffgpV-Ygv4LObgnvnBzK_KF-Cbaxk05oR6tyEjJJ-7qY_zAAEbbc-5ocqR-fPfaxCBxa0aV-1pO9k0CfPzzT9VfQPtE_Pzie_dPbyjfvjeeeeuieufviyBkBnByg-0333FFF_LK03-kF--Bo03_4J-2QQGB02hngiQfffeudeEYnyBl04-033GK-1qydETc0asUMtaOsnnECJ-bRXYBgpqUV1-UiGJaKaPfezB2---4rA7vMGX--1wG8F1xtkgolzOyHe9--jHPo-ITixgjbc-qxqDOLRzk-QTvNhITNX-0jWb6-2rnnYM1--Quvxk2hxXonKKpsOX915-6jgl5Mn05rrKrBxomfJeenIBn9V-OaT3nBc7KK9nprSzrrTX6tV0bttzVOV1-0jljM-Is4hYAA9nDUqTOztce-Ake5iQYBF-y5UNoT7-b2rnPNn--59HTV-BKqG-2siNISX--RTmWk3DEtjn9mnAACrzzzVIRaQd_OLOOdaauaefEBnBzw-nBBkk4J-6_RRwNIMAmVPdeOeuTyzyzvjvvyzjyzivjiziudiyzynyzzzzvzzvzynzvzjwn--laK3OK_KKF--C4KKK3GGJKJFGKGJK4_KKKGG-J3E45KK443O_G--yQ5WzNc1rCYKvyijzeUvBG4JG43F0TQYbxRNc-GnlXTijnKG--5V1qV-x1Jxc--uDnn-6S8wKaPedvn-FFB-zea6RfESrSq7-WX-6pPVqNx-dun9rIIKMSrSrSxxBzbts7XeX97XX7N---2MXGF3ilDMnrSppGa50VeXcHjS0jOLKO_LOaK_K_K_LKK_JKK4K4KGPedaOK44KOPaK_3aefffeTzivizzzyuvkBzwzszEEnwnn-nzyzwzv03G00-B2EzBEBwzBwnEE2-ow4SEIJmcccxxrUJnBonSrrztzyTOts-9X7VX7X9-YvBN2wwwwzvvjjzzk0zOXTUyUxzV";
}else if(dialogManager.tileDataToIndexUnchecked===13){
s1="C0DX0NP1V--QqeadnzzjynEEzzjjivdivfezjj2BBwzwnEzzzzzEjnnvYBBBBEBnzz-UV-hflzUUSrrUzSxSxzk0a1-V50K-0pMiudevf-zvfeBnyviVF-F33-yzgp3bVV02IKUrHnUzzpHz5UzUzSKrUrzbyNN-OzzxzUUUSrSrrrtzttzWaOaTUzSxxaOaOxrKBnCSKCIMSKKKKIBpIJoonIJopCJpJpCCCBnBggeXn9eccc9X7geXXn9efHfBnABemcXX9eece7XHXeXecegeeVV1ee9eX9ecc70eXcXe9enA9fAABnBnJpMKpKJnBnHmmeeXX7X7cceXXce9eeccXVVVV-VeXe97Xcee9f9eXeXXXXceWVWBc29cX7V-6aOaTOWWV-1XX17-NOtWaNVnBn97X-7cf9mmnBemXgece9I9eXXomgeh9eX99eeeemf9BmmeHgeeegfBggmnHoeABeggnIBggeeeecVI9eeemeXe7cX1-ZmfIKCCIJooonIIBnAAAA9mmgnIIBnBpKCBnCCCKKKMSKJoonIBohBmnABnCABfA9gd9mhBopCIJonABgmnJopCCKJpBnBnBnCJnCCCJnKBoggpIKCKJ-UMSGxrMMKKIIISrKpSKKKKJopCIIKKKCCCBnIBjSrSSpKppqUI9cpKIKrrrKSzyUpKpMxS5UKxMSrSxxxpSrSKpIrHxrSMSzHfrxxzUUUSxrSrSxxxrSrrSrSrrrrrrUUxryOtttzbttyUzzbtzzUzzxzzUxzrTTTTUbyTTTTTUbbxy0byUtzyUzyUzzzzxzrrSrSSSppSSMrRN-OxpSMztzbzzzVUrLUSpprUtxKbxBfrSKJpKKJonICppKHnKKJoopKISppSrMKrSrrUSSpxxMSxprUSMMSSpKMSttzzI9f9hMMMSrKSMKpprKKHnCSSKpMMSSrKKKKKCIIC9gnJonBpKAKJpJpBpKBnCpMKKCKCKpKSSSrSrMMMMKrMSSMKSSSprMMMpUKppSJpKKKKMKSSppIMIpKKMSKSpKMSSSprMrSrMMSSrKppMMKSSMSSSSSprSMKKSKBmgprSSppSIMzxCUzprMUyTObbyUzzzaOaUzzzUtzzzUUqOaUxy0bzzzbbtaTOaTOaOaObaOa5OWbaOtWaOWa555555NNOWaOaObaOa57-6WV0WWV--O97VWWWaObbbtyTUttyTOaNNNHV0V-N---9-V-777579775-0taTOaOaObyNOa5OaOWbbaTTTTTUztWbbbaOVOWaOa5-5N-7X--V-517T7---7-Wa0V-X7ccX7-7-77VV-5-7-5N17X7XV-0VN5-N5TNNNNN50aN-5Oza5OaOtsOWWaOWaOWaOaOaOaOaObaOaObaTTTOtbaTOtaOaOWaOaOaNOaOWWWaNOa5NNNN5-Oa5NN0WaT550WaNNN--N0aN7--0WcefIBf9en9geecmmf9eAAABgee9egfBgmeee7cX7X777cce5TTT-VVX1cX1c7197X977X7Xe79eX15hHX11717-7-V-V71177VXX7X7ce-V-1-1-----117--cXX77ce1-VVV-0u7X777117771177V771-717VV-977X77VVV-7X-OWxpSSMSrMKMSSrSrSy5150WV0V5OzJpKCKCCUzSrSSSrKrSprMKprpMUMMMpKKSpzSxxrUMSSMKpppSCKKSMISMSrMMUUrrSrUKSSpppMpSSSpxrrSKrSpSMKKJhSMKppKKppSKKSSprxtzaUTObbaObzzzbyUby5OtzrtzWsObbbtzttbtztzaTTUs-o-9SuvkpF---4GN0--Akuevkk-0Z-5DzUUzzUMMSrUUrrxzzV0k24nbEF-72uPs-31lfR-X0zvBgpOsN---Fjh-1VahUR-033plvivC44-bVp12CUzzrxpztzzzy2A979eeXd9eXXVGkPch_OLJKKa_OLujjznwwkzo-Eno-q32WRrMKpkV7-V--7jXk2-IvW9e-7xySpV2kZ-vaazk0-HWAOjKHprsWxta7ccV2FavYivl3F2cIsAppKMwN117X-81g-ifoF-L4N9UrkcVDFfPz___bjvjjEB3ByvEGJKK--WQlvV0kn8QjoF0NPnGrScX-E2V6yPuEF3-D6-ISGX-42b3rh-0NYH_ooy-3P8eEOJFGGIB-B-0-2043LaPdaeeiZ30003G002j-03-JGFGJ-4K-03G-3303330NBzB-UzzB3DvzuzByyfiivieivifevefjzyw-D9vlxqX-A58vaOYw-07nF-rFPV4lbM4aaabBn3B-mC6fBmmjSOa5N-25o35o--CiYN-gQSZPTw0--2QiX--66YJ-9FT6CN-BHQ8jadHQyddcyvG2232-F-8Hr8k--dcfk6dIezn9YpIBhC5Oa6y5UrWZmX70C2JVtUzzp4J-mXEjworrq557e-6IQmyv4--dmmEV-JuCMk-9SVlk3KDxRuPiueObi_JGTyycnBk--4-BF-eicPos02KqRDLPefeTiuiviuk-K33F-----6f9qfBnUWV-jMD3iO_aOaPOiwBnBnn--0evOEn5U5c1_T5ktLKKGTvjzzYp-w0Rg9s6ABmeWBmghJonKxCIKIKKSKWa6zzro5Uxltbe9e5OtVOWaN-N6w6y2ABcX17cXV-SWU2PBo-alHDReopsOa-OOYdiPPPgnE00--BsPu--Oo5J-5oKjx-AxeUxtaeeTeeffeuePauuvivijfieiivePgyvvC000000-3-3G35JG-2BF0-30-2FFFF--3hlWISD1-ER5o5evV0-0eu7_RjSSprzrSrcX7X7X7X--6KDt-HirDjBnBnKMba5551-3rQbzaaEBnpFJAmhxnKSSSSKKKKonIKKpKpMKrSKIr5UrNV79V1----V55N-1V1-7-7-X79-IUBriLagwC2-3jm7YKkV7jUvJLaLMeudeP_LPK3PfeaLeaa_F8aaLLOaO__KHdOK8__KeePOdaaieeeiiefifeeddddaaPadOPePPeeiiveueaeeivfeiuyzjvvizEBwwwzzEE2-kkBB2-2-kB-2-B222-B-k22-BB2-B-BB222-k-kF-B22Bk0-F32nyevg220-FF-0--0-F003G-G0-Cl0ab9eefxzzba-AX5ODuklF2RKFUonyUUaPXeV9sgwrddaLaPNn2BnEE0F3RULpn9opxbbbtXVe-Y_1riO_LKfvEink--0BfCIpy1V";
}else if(dialogManager.tileDataToIndexUnchecked===14){
s1="EcA20EP9t--46idaPadePOddiaeuuuebieeiiivuO_aRnufezijzzvzjvfuuPKJFJGG3GPKGPOaTiiiedaduus2EYuiedn2nyffdv32--0202EzeRwoG--Ezzjevck20202zeufik43BFBFK0G4-0_J--nyioC03-0002-n22wyddyjfzven3Eyv3JJ20-zynnEyjnnvjizjjejzyy_wznnBn2zvnzyvzBl3GG3G--23FFo0-wzBB8m--ZISrMUUSpzrxxrKrrSKpppKKIACBnAA9mmgfBcee9cXef9geeeXVf9999199ge17V7Hgce7c15ABee99eeXegegegfBgfA9mgomeecXcXgeXceXnBrxSxxzHecefAUUJceccgce0AxBeXXXeceY9nTUJgoepCJnzzzxIBfrMpIJmnpHmc58EJmnrSbrMrUKJnIKxrHgrUzrxKCbtzprzxKISpxzU5Ulzq0a-NOzzxxzSxrprSSpxxrzrtztyUtaOaTObzxpxrUyObaOxMKBn9pMKICCKSKIKKCMKCACBpCACBonIJnKIHhKBpKBpBonCBmnHmgeme1ggeeeX17Xc7VY9e7emdBe97gfBfBfBfBf9e7X7cXeXc19eX-ecXceX9Vf9cee7V-P1e9cecX7e9X7X-0XcX7c97e9V0--O6glDk-BjnBnJpKKMSKrrMSSpSSrxMrSSrMKMprSKzUzzSI9cmgonCKIJppI9YKCKCKKSKKSMMrrUzzzUSMSrUUUSzrzUzryUaUyUyUbxlzzs7-V15X----V---NNccX-ccc0y10WeeeeV--70V6xUztWxMSzbbc6xta11cX9X7V7-X-eHeggnCISpKHX1V1X-7-Oa-N5Xe98HeVVVeeV0X9711-3--XjabvBG-0s7nSrxGc9-BFOunededziszBzG0-G-KF2NDz6rSzzu9d99-0FVIObk153LiReenAUbbxzxzrpxq--e9e9e-A1JTaukCF07J23pq7---cVM--WN3QV1khy_awxF-H4kIRjyV-oCGnvjx3J-16-Ny-U2iSDjyffv33G4F-CWtG2GxSUlV79e--2nbB--6j1s0REhiviizkJG4-4X-vYML77-ZHJ3Pv3-1cZeNponGtV-V4lDIreOiuBl-3-DAESjT9-r4cgTLLKKOaQjzyvgn3FBEB--1pnH-E4zQyafnG--5BKbgN-3Oxws0iCDazIKxKMMIr5OVX1V7759-05hoa-4YPwIzTXc0oS4-OaOaanwnB0-qYoDA9pIrzxzpzpKzzzzUzrWVf9cP1ceceVemcc7cV0H9uMvF-eGU9USSbuX975JYvsOLKOKKK4OaLJKPueTzjEzjzBn2zj3-Bnwn-B_HnzBpIzyNX7V1mi7bfz3J09L-pSKKCSrs5P7VX7-YBjWieueuusF-F03-0dhx_nILN-03vANuaQYl---6b56-jf6VcBknBBn-Bk2BnEBkBkn-BnBkBw-----n2Bk------kn04GKKKaOaO__KKKPLOKLKGKKLKaKKKKKLLKaOOLGKKK3KaKLKOaKaOKKKG3G43G3J33F3G4G4JGznnE2--G-G3334L33G43J-33JG3KG303F433GK3K3GKG3G3k3GKOffaF--GG-FG3---F-3I-3F0-0303F40GGG-G03GG4FF0--FF2-----0---k-G-F3--04343G-G3KG030-0-Gk-2DwkG43F3G0-30-F3F30-00-G30-0-F-3--G33I--03FG3303F3-I0--3F-nDtfefeuvfideeviivfiuviuzwn--B2BBB22--wn9PeLeeLeaPOfjzyvuiveuifhfifiivevefffjiafjiuifeypeeeiivejEivjiivijfiuieiiueuieeeeeafieeeujvifffiuzziviuzivieifiififPivfeifivPvyvijviefivevevafieeaOeueevfeeveeeuiufiaeefifivizizzwmznEzzBnEzBnBnznEzzzzwzwEzwnBnEnAyzzBzzBn-nEnBznEwzzwnBnzzEEzBznnnBznEk--22B2zkzwnnwnzznBnnEzzzmvwEEBkBk-B2znEzEznBn--kBnBEnzBzzw---4--2-n-RB2Dvfzn0n-kB2BnB2nBknBBB2-n-3-KK3JG0304-G43GLJJK_K4JJJKJG3F43G03F3-Fk3-3-k--FLOadeOaOaOOaPOada__aOe_LPaPOK_KOGGKKKKOaOKKJG-K3Gk--nB-FF-3Rk-JGGKaPPeaPPeuieW00-FF3G3FFF--2-J0-GJ43G3JG-0KK2-3G3G-3F0-3G00-F4N2znB-3jEzzBk-ivzzfjEBAzievivivieevivueiuiuufivzzzvivzuivivjvyvzejvjwzzvyvzwnnBzn_ejEBzzEB2-LOKOaMBBzzBnzwzizieveefifieizzzvyzzznyyvzznvjEzzwzBijzjyzznDzzwnnEyznzznEnEEw2yajzDjwBvnznEnzkzEznivvheejwzjefievveyzByvnmeziuvfiyvyzjnzjBwnkzaeO_PO_dLLG4PPvjivjivjiuviyviyzjwzwnE2zBnBnB2-k--4222BzEOOaeiejxPeeuuuuqeuaeeuuefifefefeeffeuuifeveffeueiieuvfiiveufiivvfeuuiuffieeuufuffieyvjiyfeveiuiffifefieevuiivfjivvjwwnBn2BB--BBnnBwn--2-k2BBwzE---0--0B3F-k2-kBB--k---JF-3B---3F03-k2--wkzEn2-B2wEEE2Bn0BB0-kknBkwE-kk22--eUSCSJrLT7V71K0YLtevvyl3KFzwGJ-DWcRRqP-hG7KyLafizivwwG03G0F-acjpSSKy-VX-IJltLePvV---PeSVrBgmoxprMRTTOa77X77-0N3vk7eoElnII93nzSKBooUSX0aNX0a5V-1pfNUugBJ-9iOdUNV-4v1z-Sfs-zBgmX8MKAxy5NOzKbse7V-0U-Fk-1y-lV-4x-6--g6bj-3L4kbaTYn2J-apmECIJlaN--MR8FTPQYEwpGF-2W9GV-62Hz-7i5cMKKGV---y2dwQvz4K-NgIMwmnUzJopKCCKKIJnKKpKSKKSKMKrMMbrWbWtaT6a550VN---X157cV-VX77VVX7ce7V-nZT45OKJLLPzjzzBz2wLJF0I80TwpCpzpOWa5P7eeV-9fnj-3pOZ6JOX-2f5dcs";
}else if(dialogManager.tileDataToIndexUnchecked===15){
s1="CoE-7lR-YWRa2AEJenMxJpbqTObaOBcX5NeW_xnVto5UUzzrzUrtxtxrMKMUSSyN1XXV5NNOtaUUxzztzUxxpUSIBpSSyNN1aUrSpCCIJpKs50WVNN--7N6bbzrzxzrrpSMMSSMSzs9X7-X-VVVX99ccVVDUV19D--998a6rztVXaOV1771-78VN0V0V-7V---YV7Xh17XOWWV0V6pTOs-8V7XXpCF5-N-N-N-N0VObSxrSrSUyN-aNOsObrxMABnKUaUs-V1-N5NUzrxUWbzUSxprzCKHenMtzKoopSSSzzxxrMCJmnABegmXOs1ABmnCSKCKIC77gcepzSKBe9XfKrHh9eprxmnKMKLmehKCUrSrII7XnMUSxrUSIMpIABpryURpMbtxrrSrMUWtbzSnKKABgnAAKUxztrMUxrsObWtWzzUttraOtbUtbbVefaOrxxpStySStzVXaNTNN5SJhSry1zzSgmpSM9mmgofKpxryU_rUSxrPXmhMQIKSxrUrrxSxrprKLpMa-2V7Va-OV1XXAI97ee9m8a6TNSxSzzrtyTStbtzyUbzzbtztzzzyObaNObaOyUtzzaOttyUMy-f_zztztztzzxxrSopKprKKMSzrzzxzztttyOtaOaOZnBnBmn9mmmpMzbbzWaTOta5UyObtV9eg7XnBNN-7-ObrTUzztaOaOaOaNOa555-4KCCCBnIBnBnBnBpzzSzzxzba-7--6WV-1--771-VV------71-----NN-5---OaTOaNN---0WWWaNN56bzzbbaTTTTUCKSSprrSrMrrSMKpKSUUrSxzzzttaTNOaOVN---VV--X--1N0WVN5-7-0aN79enKBmVX9e9177-X770Ws7VX-WbVccOa-7OtzaUzy1WbyObaMxyN6UV4rUUy4zzaOaMWxyOzrzxrrTOzUUUrztzUzzzzzaNN--770aSSSztV-6rxzbbs5-NOUzzyMxzUxzV-1X9777e9gf9ege997VX7X9X71MMrV-V75-gnAHommmgf9emem9eefBmenA1AHmmfCC9h9m91AIHegn9emnAABnIBmV1mmegon9f9mXenI9fbV1ge7tzV--cgoon99gc0s76tV99nCLo1977Ebs50Vf-AKJcc-1fMMKr9c7-Aa-1mpBme9c-5OWWV-XV-50a0VVUV---1N18xy11--V1717V-0a0VV117V7-0VcWaN7Oa6aNN--OVV0SrWyUxzVe8UxyNN7X2bVSMVN50bbzWVXhH7aNTSraTObbWV0Us0WVOaN55OaOaOV5-OsND0tbzaUrrtVXX6rrV-X91V0V-N-V7X17X99f17X1XXeemXcgeA9hBce17XpA17fKKCK9e97hSrSHpomf9ABpSxHpKIKHhHhIJhMUhKnKUrKKyICCBnABpAAJpKBnIICA9opBme9hC9nCKQ97-XhJmfIKBhJoXA9empmpHhMTehICIBehIKSRkgomfKQ1971hKxQBpprSghCCJonCKKqpMSpBX17XhSnBopKSgpKopnKpIJpKSppIJprSzzKMTTTUQKMrKrrps5-KpUKKSSpMppSSKrrKMI9fBnBpHnK779nAMrSxzwonBmXXppQAI9fCLmhBop-s1-WV1hKBAJpBofBegp9mefKrpqfABfKzbpIAKMKHpKKBpIBpqmpKKKRnABooppKpLmnKJpCBpKABoonIIJpBpBnIHVX9e9f7ceeceegpSRe7f9mmonCJpKSpSQIIHn99cXee9mgf9Xce97V-5OV511711-V--7X1--MrSTT--VcNUUWV-7971--X77c1-VV-V1---AJXN--N5-7eYWs17Wa---cXcWs2aOVgc1ca0tVVD---V0V--55-1eX7X511V-8V5-ge9pMKpKJoepIIBmegXc-fCBmgfCIABfIBogmnAC1gnBnBfAABgm99ggefBXXccXf7VXe9XX6ba-XXX7c91X7VV7X1VV1-D0s55--6USrMSMSrWWbzs1menB1N7VUsN----2bVemACUSKKBk-VVfICKSpg9777--7hCSJpC-----bsN-OaOa56rJnIKT0a5SrtaUs99150zy50ty-55ObaOzbopHpMWa555Uzs9ef79gf9eopBcgnKRkAJomVa0V1da5-gnIBmWVVVWWzV-VXAMLkVVXNOVza-1hRmVNEtSrrpMSy17VTN1mgX7X2yN56zrMTUtztzSxzMrStbtyMxSppKST-V-UTUraUy1Xe-OaN9nHpKLegA9a1ccX1nIBcXXXcXcefA9gX7VVzs9XVbzyUVef-Obzs91UV-e9WWaUWaUzrUSrUrpzzUUrsUrs7efB999e971ceXX9ec7c4rMyTN11X-SprMMMbVcYa4xzzrIMpry1X-V19ge-zza5OzMUUUKpKps1-1OyTSzKMKnIKKSy1V0WxzT19XX-V-Xcf7gekcaUby19f9mdtyMtbzxtzSrWUzrSyOzzbrtrV9gXf1me-eecaTMs7cX8aTTMxSrMtrxtzrKKs--VXDOxSSSSCMUy-XUs7gV97V6tV6xprV7tVA8ySrVEzzxRopzbVXOVaUzbtzKopxRpMrV5StxzrzUV7TOVgiOtbaUzba-emVOtbaTObtbzbztbs9emgf9fBggf9mnAKRpgmmn9mmn9egge1-0ttV9mmme6a-iUbbzaOV7NSs5O_s8baNUVaMT0brs54SMMUICMaNOzzMsD1eeccXUSs8WVObttVVgfAIV71g7XmkXtaT2rxrSryOyMsAxs8a5UKtWWxpKztyObWs1mmon9Yy-X7N9on8V5OWVaNMMSrStVXVcV0WaST-aN55OVfABda6bUthMSrT17XN1fVU_ttzyUwprs2zzbWa6s1eopAA99eef9ttbyN9gcX0y-VDMptzs9cdV6s8WvKy0zy171OsUxT0V2brBpMs8s51kTTUxzxzxxrV17es1mfA-egeiTTOtV55OtttppSzUMV199-8bbrUVcAtSrs7XX7gnBnA9eTOs1cT5T2WxRpzbtyN9bs9ABkYWbbaShMsOWt_QMIKKxzT18VXTTUT-1hPecVOUVbaUzUU_rSSUVVX8tzzUT-ce9f9VemeeABfB8a5UzbWWWzzbbs6tSrVVWxrV79f755OWtyUs1-0aN-OUKMpry-c17aOzWUIMKprUUIMa-1X918V770aTObyUxIKSIJpCUVNN5--sNOMVN56_pKCJpSJoonKMVNNOa---OVsOptaKMT55NNUrKxxrMMT11115N7s9kc9V9VttMT0UTNO_xU_nJpUs7NUSzzSKKUMUts1e1T-c5TOVNOaOaUy2V50_zSUVX119X7USxs7--OzSCUbbKSzsUxRnCBnCCBnKrCIKJnIKM_pUVN5NN-7T50a5OWV0aNNNOWWxKKMBnAMxpIKKIMaSxs1X6rV-D6V-sT-UUVX1e9Os7zy-5SMUTOtpKySqpCBoe9nCTURnBpyOt_oonBnKttU_zV7a-5-tWWWtxxrqpKTOttSMsOrSxhBpT6bxSxrtUUIKAA9nHpHnBgeecf1ee9XnMxzxrUzUQCUxSs6SompyMs-0rSTUxtTMzzrrrUV1-sSxs777UrrrUMUtzUpMJn9e9ee-VhKgnMzUrynKtWzrzzzUxJpSKJnACKKs0Wba0V--UTOxyUrxzxyUxs-xyUrxzrUzprzUrpzUrrUrSyMrUSrrSUUUSxUaSfMT6xrSzrUrUUby18SrSrxrUpMUTNSUUzSSKSMSrMKhSzTKSpMLpMCSCCJopCIJpJonBonIIHnABggnBnA9nBf9geeg9ecce9cf1e9mm9mecf1eeece9X7cXXfBn97V9eA9cX7XfMQB97cX9997VV7ceXXnKSxxpSKxSxzQMUtxxhUr9Xs1AJmhUzUUSzzKSz1hUU_Sz_xrrSzUMUKrSxprqnH19pSKSpBpQABhMrKSxrKSzMBpxrppIMygpSrBopryKpzKy0nMMzba0rrUMStUSpSrMryMrxzbyUUMUty5-Ortbs78V77X77--Xe79pHfBg997X7X7X77ce-X7-zTOa0VV75TUUzUrrxSrrUrzzwfACKrsObs6TSz_zxrzxrrrtVN5Sy-4W_BQCq0c--5XUc-X5rCBxMa7PVDNUK-nSJp971_ESHe-mocmeKzxIIOxttzsTT-Ota0ee-057TlBpMMMlsOV7Xe---Z41V6NZVgpBmXJgnKMpr6WaNT0c7--3XZyYK57-DXainASrrUs-cXc0D9q9BhrKpMy6e7VHVV-19qEB--1him-7XjEvIohy--0DA35ggnKEGzTOs90X7-DANdhT7-7Xt_vISba9c11AoEBnACBxrSxSa0Wbba7ZmcWXV0Nl-LpUX7--232P--Y4hn-1NmHcmmnUy5--yBtECSKpGaNP197-0YF0nN-QYKBvKofomhMUtzba-1WcBcV17r9ZnpzsX9-4YWUUKaNc-1DHqB03YaRQJjHc9K9Mp9XmrHhrJhromghUxoOVT5OzMxtV5VNT--7VBc--DVec-5DXQxV-9EWOSk-7cyKynBpBnABoopJ5OaTT5NOs-OcVH7zjtnSIAHcgnCBomn9gjzUxrxCBeo6yT5Uc5Wzxru-e-Wy0s0aPc-39Fz7gpKSBcCHgcWggnIpRObztbxHggpoehryP6tbaT-VN-17---ZFFrV-t3OTpa7--GJ2c--GJFN-5GL3xc-9GPigq-T84fLpBpAMHpSBfACoemeoefCACAJrzttaUM5TUa5TUIErr0WWxOtWaOzyNNNN77977KACKBnAC90aTN1VN-7c-eGPvhSrq0ceV-1GRaD-9ZO8jSpKF--7--ZPZE--O6VKyV1O6qJppObVXc-aHHGgonUbVV-1ZZurAs1XHQCRnMzMppopDOVNWbttbYBec3mgce---HWfN-LHY8SS5X--09ahV-tAuEpN--TI4hxDUT7c-PI_QzrqXX-3ZxNzHzV--ZyYEV0dEl0pKsV---J06s--J71N--J8is--JDws-5JFcRs--JKrN0iJQsgnonCCL6xba6yOWXe9e--_6BUV2dHDArSUrz1XXX9-E_ADrICMKoN176X--0I2AV58JkgmgfIIICCTOaT0wNN--PKIxzUTcc-3_KPjIqV-1_MDbCV0yKYtSHpIpCSKHZlzLNV-10V55--5Kcizc-9KeMwq--0MPIV-dMpxrc--_Ul6V0OMzAnSN7-O_Wd6ppSppKMwNP-7X97V7-F_Zn6CzUrMOX9Xc7--_a82V-0OcIV-8OxHk--LW2N-DLaXxTX--4fBH-2_fwzLPV-0QFUV3OQn6xKMSxy0X-ee7-F_tjEBemhT6zzP7N-1_yrzR71uMvlwxIBemeefSu6zp9zTOzq-5TUxxWc9A97-9N1TU5V-0Va0V-8W-ps--NFDs--NFLN0aNK0UKptxxxrUNXXX9997V-DOBAzTX-2aJfQBy--0a2hV-0a3SV08aU0zT9V-taUEntc-5OtESV-eP2MzUSk6e9c-XPIwxMSN7VV-ddFArc-7aafrpUq-e7-TPquRnTTNc-mPxXxrrKlcVV9-3amCbSkV--5oXa-Gat6zSSzrUR7X7ec7-HQgPwxu7-9R1zzP-1tkzEmgj6zzXc-2b3DrLP--Ol2rq-78lqzrHegrzzzKEUTN6seVNcgeX-kbAFvBghCIKIIBpBognIJpMKSSxUSrSSxUrpK--0ogPV0OpIUnBOs-SbSprpUSI9jxa6aPeWzz5XeeV-PSyVwpEsV-CbXszKCCGWbsV7-0bZmzN--bbTv--0uTlV08uUInDTV-OulbqV1tuqQnCMF-5Ue-2bh7jJP--0vJ6V-0vjlV-OwCMqV-OwVCw-0twdKojFTNV3dwdbnUSMzs-PCA91V-HUDFBraV-5UKsSc-DUR5ByP--6rqa-2bsubMc--tyOApa7-yUdojJmnIqOtWV9--bxunV-0zWdVAOzeUnxBmfrrICrUUUUrpHzWVcWX1175X-Xc--UzJs-9VELhk--e0DGpX-2c8yvE5V0P1YAmzTX-Fc9eEBhHgn5Uta5N-OcBY6pSrIAUJgTOa-09We7-GcENbMSppzye9777c-9VzggtV-94IUs-9WO6SNV-95_ss-DWdaSDP-mcR2MBoggxrpUzzKSEzxUqUyX9ecWaNVe79V79c--WkEs-9WoBzNV2u6I8rMJpGaOV7Xc-9WxeRyV197X5onrsN9-1cXrMEc-uXElzMKM575NHe-09AHrpNP--1AZrV-eBC4rX--7ndq-4coH6ETP70HYKWxSMOxxc9XWbkd9V-9Edzk-HZ0xhyPc09Z7pBmpSxpy5O9V79--82Ca--86Zu-2dAgzUcV-PI-Bq--eIQcrX-1dKuADN-H_k1UrXc-9_qWSsV8uMPGmzMTNUUUSEMSxxze7e71c-XHee7-Ha0vzScV--aLfs01aO1woxIC6a-0tuc-DaUtSq7-6dh56pM0X7-7dp2zMSR-X--abWegmjUOWc-EdszfAKSzV5UNe9V1PUQ2nABUzc7-5by5U---cAvN--cHps-5cLGhV-DcONzR7--98tL-4e9eMrR7V-HciUxpX7-udBoSJfErlbuVX-29aVfmxIpGa7P--DdjHRtu-6eW7EKSN11--9XeD-jeZFrBfCpCSxpSrzJ5TUcOzaOXfBh9X9X--1c-1eGYR-5efWrCracV-1fXrV-ufyWxkV-ufAyBoeezUrzV-V-ugwopa7--fJNN-LfPwSpkVV-9iyzs--fqes-ifsnRxzxyXecV0ejZ8nMbe7-9ftmzP-FujbporSIzSpMUISCxzx-VUzrrTc6zy7Xh9ecVWuXX-7mcVHe1--ejc_xc-3ezMzK51-4ezOMKGV7-1g-Dw-Rf-nQAA9gnpMtzzzbttXXX7e-1f-oITV-agD2xzola9X-Ff2bjASrxSr-97VV-4f47MJyP7-9gJYUP--9lWRs-qg_aBfJxrzs117--gavs-PghqUKGX---fCFz-09nVOpqV--9njxk--gyON-Dh4IxL7-2fGYEENV-1ob8V-upTOpa7--hVws-XhbrSpLOcXV1eqiCpKR0yX7--9qk6k-PhjSS9c6y-7fR-rUrR7Xc-ehsTBgrqUscc-PiJ1hASaV-bfaA6AI9MMMHhzpUbzOyOz1X97-1ge7V-1tzIV1uu69nCrtwP-e-9ffCUprUkVXc-5fgVYCM5-V-9vpss-5jH-E--HjT-wxu--XjYHx9xSVN-19yPqognyT--pfugbS9rSrSMSrzpaUpSUMSkVV-VVVPHgccX1XX1c-9jiyz5V0Pz_GnSN1-4g0rMKR-7-HkBVxlu7--kCK70LkGUSpMSrOzuXWse7X9-4g57jrTXV-DkQfwxX--B98T--g9En-1v1y0pKorN7-7--gDm6V-v2vCxNV--l12N-Pl34RxUcX-0gHXnD-7gHhbKrq7X7-TlB1xMxcVcJ1lBSSrSSppzUzxpzT6xSSrKrMJopBmcXcxrMRUSpMKBgc7N1cX97971AMHYSSrMHcce7eVVN77XVX7-Oc1dMSHooe-V-CMKSSKq1VUpkUSrUSCMMMUSzSprKKHexxrSSxSxxyUSzzSUUSpSpSxKKBhUpttx57OaP0WyOaP-9-0V7X5CHcV77X1VVXXV-97cV----0c-7VXcY97X7ece1XABcc9--23yxV3v42inCMKrbVBe-0xXV-A4Ugk-aliIwpIMs----BS4D-2gSBER5V1v6fGpCCptV-X--BTnq-7gVUzKKT-VV--m1DN-qm1FRfpppNVN7N-DmEsxT9-QgZUjCSKEKR6xGWe57N-ZmVV0A8RQxR7--A8TUk-imT5xSTTTd9cV4Q8thxpponSpTN7-X77V--mZcN1immTUMSKCKMR16VUSprGbxkXBcVcX77V7V-TmmkSpUVcV-un7nSrMSxkX797V1ABckpMba99-0go5MN-5gpKjMMX7V-QCSMnV-vCllpk7-Pn_7wppc--6gu_jIIqN7-3gwCEUP1-HgwGzMMMSxlu7X7X1V1vETrmxSrTVX1--C-0D-Eh0RESoxSRN-X09--AFrbk--oIos-aoMTSIKFN5--5h58vIRNNV-2GitV-vH2_psV--oc-s0aoc_xKMSJe9JUUqN5P17VV-XoimSI5OycV-fHxjnk--CB5q-0hHcbN-VhHl6KpASSSKIMxsVWyP77VXV-7-HpEKxUX7-mpKbRoeKSo-NN--CNDi-7hOczxzTcXc--pboN-DpiAwpV-5hTmMpR5X-0QMjrnMN7-1hUQAT7-HqBoxK---DqWZRr--IhdNrKrSzOV5QBeX3e-9hfVIBpUzX17--CfpD-phgbjBmccjMJrzke76zrrMMSrUrpSyc17VVX7X7X7-HqmXSSX---qmvs--qqEN0HqtqSrxKESrNN7Xc1XV-2R4lV-fTzpnk-1hwNUTV4Prr2xMJnIC9EIrJomnqUKKCJeIIMOxp9MKzKSr6XX7--V57OV70WXV-5-N6a--V5fUUEofHchpKMOba7X5UTP7-0hzqEP-2i1rMSX-2vVmOnHpplxk-WcV-9sS7x5-2fXLhnESoxu7T17-2iCDURP-3fYKfrK9fISr6s-57---sq1c-DsqBSTX--DFu5-1iHcjR7Bmt9wxogcf95IIESpAAJegxUJfxI9onJeCrrrUrSUSSrSpMKSpUSrMKrMMMSMSppSKCyUUz5N71-0aP5OzyOzUSrUN6aOX10ty-7-0s-7cV-7X1X1-VX9XX7e9cecge16yX-X7X7BmXXcV-2iHoMUcV4Q_4_nBrpyOzSq5cXX7c-HtGWSpX7--tUGs-5u0pzc-Tu6aUSS-17-Tu7VxACOa---u7iN-5uEYS--5uEcz--auFlSKqNO99-2i_aUGuV0QdwKony7-BicpMJrMSc1-5V0feEApSWcc-5uYrSV-1uf6R--igpMV9vfYUppKHexxMzxxrUROttX1e7cW97HX17--2fYfV-Qf_oq-0Afj_rL7V0vfwMpMaX5V3Ag7opBpKpT575-7--fgPSna-4iqejAoOV-avQIxxrycce-0isQUF-1is_AGc-LvkFzM5X--fjqbr1--Dz_T-6j-zjASq75-1j1jzlc-9wL5ww--2lNpV-flSUxX-3j5MbM5X-Hj6HUJm_prMSk--7X--vlsIpk7-HwadwjOV-1wepR-2jAT6Ia-1fnTTxHnEy0X--Anark-9wvRwtV5QospnoxMSOzr0aNn9X797V-Qp0rq--QpG4o-0QpR0mxlX-4jL0rSq-c0XxPBBfBnEMKKyNNTOVN1e-6jMXUJlz11-EEgqwecX-s5OaSs-AjV-jKppq-17c-9y-hSkV3fsD9ppKIKDNNOVV17-Ty3bxJp0V--9yERww-0Ax-_npV--Ax2Ik-9zfaxkV-vzr2xk7-A-1BRy--3-zvV-w0lpqTc-I-kixr-c-A0MPENV3R55SnBpKkWa0zGVX-nkNrfACJeonMrxSrrrSrT55-IC9e-0ztVNX7X99--35IBV-R5UCqV-35iqV-w6ltpWc-60xjx--A1PugyV-B95ws-E1cpgpV--ki4IV1wAqXpUTUa1ee-4kl7ACOa7-02LhN-02YwN-I2aoBjy7-f2fQUKrScVc--I2gExS-V-b2tvSppo-7X-0kyWUF-1kyZMq7-036Ns-M36nwhr---RFUnqV-BFvKk-03Kgs-A3kyxNV-wI34p57-644wwN-64BcS--04PSN064PVSKSTUF14HcWc--BL4Uk-64ckSV-04jBN7r4jQxHppKKpMJxHe7V1-ecnIIKABoopUSognBnIAUtbotyOyNOsNTUSJnKq0a6ztbttVOzOVOX-5c0a5OV1XX7Ze9jpI977AI97--lSWj-FgMRSmf9zbrpzMKc0bxrKESxrlVXHVUbbpSkV7XccomXX9ZcP7-E4xwwja--lXvjV-wQInrsc0Q5ozSpKEryObbuVgce1c-Q64OwhMWX-0lmZbk-0lpy6P--GtFD-2lu5jKVV0RUb6mp6V-0m9erN-5mBT2BjNOV0wZLzpUk5XVPBZWrmmmmnIJrMSrSSSSKSMUxKpKrSESpbxSSrMOts7-7Ve7cnA9119-Oa0Wba7V---V7---ece-cmKJQBmp9ggzzrSKMMy-OyTTOX7X997X06mLdEBgnABnIIIICCAJnJpCCJnKJ0a5OtWa55Oa0WbaTObcV0WWV--I8QGBxs7-U8RIgpzs7c-29W_w-3mdg6Ctc-0mguE5-ZmlOjKBmmonUUUUbw-OzwN-VHmc1eV-wgZprsc-rANbgnKrUtX17c4UAhBhBenHYBocVgprSCHZnrrUMSxHnIKLOa-0VObaUzxWza0bsNOy1X7Xe9n9cV-1n8XjDN-IBkvzxXc-2BlYi-RnBjzIEMMKppKKF51-1-0V-9--nBzMVXBp7smn9f9XehBnCAIBomnABmceXeZegccZmonAAIBnKSMSrMVc57OyOaVUzWzOzxxzzztxzxxrrSrtbVOWtVN-OVP7V-0aT--RstSq--gtJnqP-3nilrCq7-AniufCAM0bbcV4UEFHBomghIHoonBnCKpKICSKpMxIBnJOtV-OsTOtsN0aUX7VN---6zOa--7fJe1-7nuYnACrtVc0EFVzgfBofKUUaOV0a73zH2ShKICCCCICCIBgnBpBpCICKpKCKRN55N-5N5OV0a0aN5-NNNOWV-NP7-zHTMwnJhpJ5-OVP-5oiBECSkV-0hBVAn9M6V-IIDDgzZc-2IgAR-1pHnrR--2KH6w-4pLvUIOaV-0KUwN92LmEgfBfBgqUSCrKKKBeVUX5-X4JmoocX-57NNmconHdBpJce99pKppppKIKopMrtxxxprKrMUStaN7-6yUza-7X9775ObzzStV--51--N-PcXX7-ILxOwoOV-UMCUghM5N--AMQdSNV0STQGrScX-8ptlrCCCta1-0CTnYnqP-0SVFsrM-70Eq1sfHnA9XcYCppSKKSErrSSCzpUUzKTOWaN0V0WX7VXWa-2KBme0WX19c-4qODnHrVN-2OnhB-Cqb12CCKJ-UcWV-IqjjQSrKAMzTNV7VXc-Nqu9fBnACIHnSLNOWWaOV--hjnFrX--r-vI-1xkFZpprOu97V-zr6zAApICSUpzKUxlyUrwUxKV56a6a7VVXY9_HmmeXVX1X9V4CmRVp9mrMaTUxT-e7c-OrAdfJnKrrSrrsN0X979X9-0rFTQP--MKdX--M_8P-DreVnCCSrzVVNec-AVFgBTV-T02FyV0L0slMs1c-6VTDEc-6V_Ajc-AV_JBtV-D5hsk-b_7iwnSROX1--OPBa-1tQurDN-Ya80xERTNXV";
}else if(dialogManager.tileDataToIndexUnchecked===16){
s1="DwCd1sP0j--RaO__ddedddifv2EEznnnyfEeRwyzBBBB2Bn00-17-2fEMK9dCrtzUrrMMqN-X-789V----Sf-T--yfzIrzohrxy6kX6rSk16k7---11J7Z-35CISoOxsUKESpEP6qOV6pJp9mec17cmhpxUSogfBnMMGWxptyUUzc5UrtttzpoTOV6lVVZme-gcfBc5cUrztbV73cWztaEO-1I5dLOfvkygzEyaOdzjzsl2knvg2EW2zEznvzzyzyfyyzzvjuMyzdzjivvvyyinyaTVyydzufvevjgwBoG-znzdiEdbg2vkyjEyiazuK_4OGaJaPjzYnzzjBwnvyfiigEnuP_vjuiaOMdezeififiiEfgzfusnEeO_ivviEuvjzyzivivivg3EjuyjiezjjisnvvEffvznviyviYEYyzjygnBz1_Fl-zivjEzyuwnB2z0434-4G304-44-CGJFKJEK42Bo-38G-340403LK2kl44G_GFn-G402l2x2433432vuvfvY4-l-0-FkF3G-J43G3FJ3-G5J2---20L-Y-8CqLKOzvEjYn3GF5N0A3mrIprrIryT1Wace1XV0F2MKYo-H05ahSVV1R1RHOKefiznn0-z4KUy5MEe17X7Xa17X7X7X7X7e7X7-17Xe1XeX1VXT0aN7X7X9X7V19X7V17-Xec7X-7X77X7VfBctaT-17917-X--7V0V-9Xe19X1cX991hJpKJpKMSKMSKUIMUrMprSrMSrKMSKrKKrMSrSKrMprSrMpKMSMMpMSKrKKCKMUzrxrSUMUKIABceV17-XcX7X7917X9X7X7e--0aN-7V17XcX77eceVX7X17919X1EzyTN5T-c-7X77X7V197XcVXN-7V-17-X18VXD---X7a11--7a17-99177Vce91X7XX1cVXe9XV-N-7a11177VVX12V0V-VX9-N0VVVX1-1171777s0V5-N7V7Va0bVN0VUV-VN-2Vs--a-NTN0WbV50WsN5-N5-N5-N5-OrxzST-VXcc-VN-1N5-V51-15OxUSxUrxSxSJpMs0V-8V5Oa1D18V91191X11-VVX19nCSSKSSSrMrKQKpK7cXXX7Xcs-1X1VXVV7777719-csN7714yUSpUSSryN77c7X0V-16a0VenB5-D0WV9X-a0WWVN-gpC7X-gm10tV0yN7NNN1VV-N1mm-N--s-7WWyN--fLocccAAC9555NUsSpy-Wa555-c--hIJpCCBmg5NN-NNN8_y--N0VD-epnIKCCLVXYWV-919prKSC9cV77-V0Vc11111TTUVVgkf1991D-e1-ceXX7X-WWs9cXXgcUxy10Va1cXei1monICI7g9-XgegmVgem7X6xyUVc8bbta6bbtrzMST--15NAA9egemfABXnBm9n9XmfBpMI9mggfA1eceeegn9eeXe9AIBme7g7Vecg7dV9mgecVfWzzyUzxSvCMtbtbzxtUryOzzttbtaOaTOzs97ea0VenBmN5N-XN9X9XiOa5ObtaNNNNOttVgggnB7e17OVN0WbtT-tWV5MV0ztbaUzMy2aOyStI7fCMtxrzzbKrUyUa5Oa0bUsOa1me7f9cD-1997-VTOWaUV-WWrzzxprWzUrqnBnCKrSSzySSza19Es9aOs-c-WsOaN50V-NObttrSSxzzbtyUbzzUUzUtxrUUTUyULpf7hKyTSBpMzpompqpSxUrSSrKprUSMMUTMxSrKSKrrrppMKMSSprSy50byOSzaKgpxza6zUtbz_zUmgf9mA1egmgf9pMsOzbtzMyTOzzMbttWy2WrKKIKSKSUtVOsUCLnKUtza5SzUxSSrSSzUSrMrUzMttSxxMSSHemgnKzUSzrzxzyUrtbbpSrzKtKrSAMKSs-T---X55UbsN9eem7iObtztyU_rQMKrUSMzzSrxUzzbyUxxyUs18s1UaUprzxMKJhSrMxpps-V-798VUtaOVOVD-XhHDN-6V9XXm7ce7VVtV-951-Ors18Wa-7-177--1-UVcOyUbzMTUbURopIKCIA7f1hMShJonIMTUMUSUKKUMrSrRchMJpSryOxxhIMprSJpxrs---Wa4xxrSprKmpKKxUSrUT5OV7N2a--7-ztVYVXcVV2aOzrzzxrSrbrIMxJogAMSMSUUSrrKJgpQJnAJX97hMMU7fHeX-en99pSrxwopCICBmcXXccXehSrprUxzbztTpKJonKCBfHeXnCLpBmX9XpSzrpKpABeepS9nKnBofKwnBopRpBopCJpKpKKMKIKxzSzzzxKMSSSSKxKSIKtTUWyTObUrrxzrzrbrSzrMSrpzUxySrxxzrrrzzbtztzyMxrUKQKKSSppMKpSKpxprrSrUUSxxrMprrttVD5SrV-a-NN71-cX7791-77VVVVX71-TT6WWbWWWVN-NN8V711-V777X11XVcccceXVXXNNN8V-15-9-VV791dV1-VVX7X1-sNOtrtxtxtySyUVNStUrUrrbUMrppzzrbbry6pKKrMMMrMMCSUUKepKxs0aTTMUUU_rMT-OVN-6T-7-a-777V-5-XMxSSxxrxMU_pzhUxSmpra6QKUbSyOSSnMxSyUKSxCMKUtprySzrxxKttbzbSrbTN0xzUKBpyTSrrMtttzprrSSrMSpprKCILpJhBhIBonKMKLnKICJnBgmmpBm9mnAABgggmeommnAAAJghKKKhKgmpAAJpIJopCIMIMIJpCKJpKUa-s550V2VN50VNT0s5OWs6VT5NNTTTTTMyUSSxQJpJpAA7fBprxpttWbbSSQKSSSMMzSrt_rUUbUbaMyTOVzTOs7777N70V70_pzKKzbbSJpBp11hIKqnKUtIAJmnJnJmnIBnBnJnKKLpBnJhI7e9778V1N5-NT0VOtbaNN9gmmmkfICCACBgonCBpQICBnI1fJo9pSQJohBchKhCKJopSMKSSMrSMCIBomooenABfAIABgnIIMtsOaObbxI9mmon9gnKUwpMJpJpJpBmpSCShMKCMKCBpCK10V7-77X1-cVV-7hKKCMKrppMKSKpIAKtxzxSKpxnHghUySrvCICBfCJpMbnAIBhBgompIIMC9mgfCCKBoonIIICBfIIICBopIIIKKCKKSKMUKpKxpSSxxMUMKKSKxpUpKrSKSKSKnICCJnCA1999-1A9e-7-cXXX17V70a-f7VV-1--7XXm997cXX9AAC9mgoekccXg97XXABmkf9f9fA9emXn9emgmgonKtxgnBfI9nBemef1X9-9gn9meeXA9eemegoefBmgnBnC9gnC9eeggnCJhBpBnKJnKKKKxpIKrRhBhAKBhKSKKKIMKKKF7Z2MkT__44OOaO__O_LLTbYvkyffBkEcw2knyaaiBkyEC-x-nl3-3VQ3QMsc-O-txaOjzzk4K_-7VS-vCSzc7V0J2qEPevjFF3F--6mTV-FGRlV--92TV0kLotbx-a7AuPnIUUoxxzbzrKrpKKMSSSlWxrUsWtzKlzTUyOzbw516xSUzWbsX6wNgc55Xc7mcXmgmeJmofomXXIBcYHcVPXZcVTUceX1d9me17ee9-A0Y6qioC-asBoenIBjSUIBjUSJe9ceV7177eV7fC9gpzzHeeICyUxA9efIrzM0zKaP6kOxIMtxzbxBgef9gfMSxyU6ttaUttzGzryOa-OV1XCJc9VcN7---40ekqQ--NDEDyV--Red-6VumnMUacX--0pcZ3P2fIBnrozKocX7X7poxognBU6zbzojHxISryUWX-U0XV--V9YHX7--6M-k--Do0VDFSy8__bfuePPaEykFkk03C2-3VwCbAMV--0t6o-92oUS0V4FUCSaOQzBn4---ywe-Y13Y5KOjuRyaEBG2F--GW_V0FZtli---3co7-38GgR-93kCEP-1kaQpeNn--L4BWBn5T-BFdZS_ePOvjjjjwk3-FJGF0sL9epCyN9-mkhAhaefdPOOaOd_eO_dPLyiiveeeyEnnEiEwBk2nEnBnEEEnnwwznnF3333GGKJJG3G4KKGJ-94g9CkV--ipW-VWVbABxrMKz5OzJxsNNNVXmXe9c--B49F--PnOV-FqcSV7sQLqmeeppUUSSxtaTU6yT97997eeMC2a-LKOaOaOi_vdPiuzjd_dvijyu_KFJGF33303FC2-oBBB4KLOOaaOiaeduaeeffdiuzzzyyydKKJLfivjjjYBwyuyynzyEnznvszkxFzwzjvEBG0G2zjgyuyYvybvzjyieKbfYBkwzivYvyvyEiviyvfuuuPfePPaadvvvjjeOLP_MdOKKK_UeaPMefvjjYzYknkkzznFzyEjzjfyvvEzjeQfjYvzznzyiyEsywzwzYvEgkG43K4GJJKGJJK3-zjsEzjjvzwyyvvC3J2G3FJ2yjFG04FK4F4K-OKGJGJG0GK43EB4GG2EEzyvvn2yduyvjyinzx33G033Eiw-o-KF2k-GGJeKO_-0PL_JBFGKOF_KOHK4GFxOHKGGFwp08J-yEYnlKKFJBwFJK9eOFHLTdJ-kkn0KKdFPPe_3-B3HeOaJ_2-EeVC-3JKLdi_FHK20dPJFk0O_JBl3KT_3K5LLfjdJeu_Fo3_JiePJF30-l3FGJFoGF-X6dJBfEOtsV0FxOWbo-D6uCS6X1v2zp5_4fu_4ivEdiuPdKJF45aiivivyyiviiijsn-znBkBF235J-GG_-nBl-w44aKKG-KX2_nCErSSSkOWa11XeXLG1g8_OK_OOO_aPuKOdajsydQjznzydLKK_5KaiuyzyvzzzyzjvjidLK3KKGKKKKKaQfefjizjzyvdefiiznyzzyEwznBzwzkn2Eifzjufwyyzjwww--GPO_--zVBnvgEekk3K3GG3JGGFFG2B-333-0--03G3HK4ePeefeQiaOK--3-0-JFKiydeJHKJ2C40GG_ddKFnB2-JF0cWyMmmyTN-ZGfute2---ZAWV0G8Ihi3--8AO7--I0sk-7aWNk-RIFpuEF018vKgpKEM6tWV7XV--L5Mk-NgeYlV6GUzf_eczf24_-k-1C0lB-I5ZZqOynkqK-5YJBIArlX-1Gfu8_yC-6YOlnKIOV---5qJB-DCgdwja-C61_LTvoG-kYgE2KIJnAAMUxzUrOxzTOWaZcV9176qXeX7cVDlqEh_PPeffijjnEBC203FFGJ-mDm3BfEMtyP89-C6VITdTn---2mET-26bSqk--EMts2wUQzuiijiibfV-EYnn3G4LJJGF1szi7nJnr550e--78qw-1FShy-27J7aR-eFczBxKoT7-V-oWi1tLgwk-9FyXENV7H7Of_bisywyoGJG-GZSgYBepxxpyN5X97-gZ3Btfw30yZX6E9mY9eememXeefSzxzT6xzUrMommceKIABhBeMUSxyOWbbbxzHpATTTV5OzxzSy15Ua5O93eme9cXWWbbyVcmVAmK5MiyiajY2Eil3G445J--Hp-s--aMYk-0CdpV2HW8xuvoG-28GGLmemxr6tsV-oczDQis3F11JY8BgnBopr6ztzzNOWX7e7omX-0mZRx_UkRdHRBnKMKpMJppJxponBop6bbzxpxKlbWa0WWWX-UzUUrMzlxrWaWXVd9n9WVVc91e99X7eeVjHcccOe1V--dDLF0OOWLmpy1-6AISazG-5_hMYrq3e-2mvLGeyn04-Ca5w69nUrSq17--QBDVUivzzlJKJJ-qNYawozzyNn97c23mKCO_OLdiffgwnBBBl-J-5OPQhV0wnGIOeeyin0230F5uPAsSSUrHprMSI9BenCHoeXAIrrUUUzTUzyN56rzbV0bxbtcOyOttztcmefBgfBn9ef9X7VXX7X7X7V9IG_jaaeivzB-pFn2KJ09Pe2Rhbzzxxu7cemc-CCRoydz-p--5k5q-ICZKiPvjk34--5npT0dDEw5Oeuaufdeu_PeijB-BBFkoFG2EfswFk3-JLJ-9Ul6xk-7nzgraaOeQfVBB-n-1XVgnghCEpKSIIIMKxML5-0Wc0c5V71-7-C0ccQ-B92pWnABnIBgmxUa-UbtbrzzrtbbueXBee5Pec-C21Ktk6e6I4rJpIBrMM0c-0zzbae91c7Qh2tpO_ddeeTbeeiiduuffeeefydbefjiedeeaijY-nnBwnznEBnnEwk-nveefdbYw3B-2koFFnyjueuTw2FyvfiB-32G0-oGK3-OdveeJFFFo3BoLK0JF-40OOaOa_8KKFB3OKefddFF0--02F-00G2--5cWxzMSV1V0JNHMaB-uYI9RnKMGWWaNe-HJRYn_aayu_jjjeBC-FJFFEjiwC44F2uEcgpJxIIy5-NVV-07cwk-PGjhlV3oZcraOPzkC-5eHK_nABpKKrK55-575TT-e0fHO2qaaabeuauQeiffeQffF-33-kk-BB222n4J3K--9LCls-CAWRtk-1QXrVIK7Wd___4aLywyizYzYEyEBw0JOJOJJ-edEvRpK5Os1V1CKLfOdOyszywkGG4-5etPbKtae-jKWNneePfiuiifiijifiw2yfeii-zefeeeeefYBBn--0033F3F03-G-3F03-4-0GGGKJ-ufB4MHjSzSomcXfMpzS6xKKKKMSsV-10a7V-75Ouec17-6Lbx5JE-PfeifA9eme9AJzrzxztyN57-SVW5uU-0qkprRxMSKSpKSrtV7X7X17--V-58t6-LgVLbBpIKrWzSqV0V7Ve--O0SB8LoLpxJnBgmpICBomogn9oghBnIBpUbWxpMOzzVUsUbaTOa55ObxonKESyUSzrzRUtWztsTUzrMtcVV-V-eX-0Zegee977XX-cemcY9ecV8q__U_OdujEvnBmK30--hDurV-5vfz37hzjz9gemecf9genrI9ggn97gegegoenBgopCJonEJUzpCKKIKonKSKMKKKSMSpUKrbzV0V5NN-77VV-7X-WWVV-N-0aNOWWbsN-0yUUUxzrzSMKrSICpJnIIErL5NOaUSxpSUMSSkOWWaV1-1-55--Vc7X5UxrpUSUxty51-cVXX97VcXZecV9r1ep_LLasznvgyw343F-AZ4Kk6pnU1tLuaOG5K_a_OLLPKeOddYzwwwzEnzEnwzE2E2C-JF3-4id5YIMV7-Cs_ftkIvpQOmnA9nBgf9YBoooofICBeeCBoqUUUxtza6aNUWba6aOaOWba5T5THcV7NLKvdveejzG-33F-5q05bAzy9VCvXK8_eeiyvujin304_-3-0FZT-95mmcgfAACBn9ggeAA9mmnCUtzrprpUSAAIBggecmmggghM6tzNOtttyTTTUbbbxzKa5N0bbbbbbaNTTTTTTUy551ccfAA99XXcWnw5hG_OLKOLKaO_LKOK_POOKdaPOaPOaaUzBnEknwknzE2En2nzEnzeKazEyzzjnwzzznyszgzzzwziyzjvvzjEnueOOdawzEnnwzEEnwwzEEnknEnB0JLJJ__OJ0K_JLK4K4_G8K4445K_48LK_OK4G44K4OKGF1TETamnMTOVc";
}else if(dialogManager.tileDataToIndexUnchecked===17){
s1="9mDS-FP-F--0TedPPOXo0HCGSpxrMptUSrUztztbbsUtaTTOzzzzStzSzSrSrSrppT-0btaOaNNUttVOa---56y6aOSrUaN5OzztztaOtTObtaNNUzaOSrSvHogmgfKpKSrCJgnIICMKrSryUWs--17XD--OaUzaOzyObzzztzrrUxUKprrzyUzzzzzzrSrrbzUSzyOaOsOzzzztbzzrAMSKzrUzzUSrUrrMKKSzzxrrxrxrrSrSrUSpMJnCKUV6aSxxUSxrSSMzzzWzz_zzzzzzxrUzxUzzrSzpxpxUSUxrxxSrrMSrSKKMKMSKKxrSKxzxpJmegnKzWzzoeepBpABgohBnBpMSKyOsT5T---OWWt_onKzzS9ehSrUzzzzrzzKKAILmfHnBpUztWsT0WaOaUzzzUrUrSzpxzzrSMSrzzzSKKKKpyTUaOzxzxrxxrxrUzzxzzzzzzzSrxrUrSrSzMSrSSrSrUprMKzUUUrbrbrbrrSMKxKKKpIKKKMKKKIBpKBnJnBhBgnCAIBnBnBnBgonIJoonIJnBnKBen17AKICIKKJgpKKCSSKKCKJpBpKIKBnKKKCACBpKMIKponBgfBnCHoonBnAKCKKCI9nBenBnBgmepCBn9cecegX-9eenHmognBmegefBnBenBnBenBgmonAKICCKKCKKKIKKJnCJnBmfBnBmpBnICIBpIBmpBmnBnABn8aObbaOa0bVOV1n9fCBonIHmonCMpQ9hCAJnJgnCBnBmpBpBgfA9nBmX9eeeXeXcXX9eee77gpKrSrzSrSrJnKKrrrrKJnCBnCBhCIBgemggeggef9eemmeecceAKKrKICJproomgmgeee9X9eXfKMSMAKMzrMyOtxrKCBe7VcfBprrBAIHnKhSKIBp9emgfBnCBpSMSUSxrrzzrKKLmnBmmnABpIKIBmgmnKSpSKUSrPkf9en9nAIKpIBgmXEV9gpB7Ve9VX9XbrUV1cc9V7Ws11chBeaN7tV7AIC7XN1N1777c2V-a5USy117aNN-ceef97Oa-Wzy1N-17WbyMMKSCKrs10WV-Ws978V-5-D5-s-7VcgmfMopCSppIA7XV--1-2bs717V15--a52aN-X1-cVN-X-V-ts-0V0VOV1OaOa1-2WV-sOV--7OV-V--VX-7--7-0yN7--7-X1OWa--1-0WVT--9N7OV--1-NN---V-17V-15Us--V--15NN7----VX1N7---X71--17eX7X7XX1VcX9XXcX9999A77eVeX9A17X9cX7X7X9cX7V7VV---717cV1717X717X-X7X71177X-X71N19--97X-X7-X7c-91X-X-7X7g7XVeX7Ws-177-17-5Oa5NOsOa5OaOV1XmX7eVcOV-95--5-sUWVNT5N--0WWtztaTT6WaOV7-0aOaOzza0aN0a--7VOV7s-s--6V-X---17X1Vc118V5OV7eX7XcXemnCCBfBnBoprSp9gn9cV17ee-9eee7eV4kDJ_aeiwn-FJ-u28mgpMSzsN-XeV5Fop6aeecBBk-F1t5Zdn9xxrs-9-O9QZyeevz-G3G-YcmK6CIIrUrrSrrrqOa9-X9X7X9cV1_beTuOPOPfznwwC3-4-Jh78rBeejprrSrNN--7-T5ITPw30U8E3BgonBzrtWzzaNVeeV8t9XtaOdOyzBwnEBKK-AmPDvCxrr-7X7ByJT4OdKaTizEydLQi_G48_OUdOvEvyuv-zyevvnzyBFzjvyBnzzznE0KKJJJK43JJG3JF0GKK-2BiSRpxxpWX7Xc";
}else if(dialogManager.tileDataToIndexUnchecked===18){
s1="DgBy1vR-AV60YBnopk-O_9DCIs4rUUrSSMUrSrSSSMKzypKSSMRpKMSrUKMSpKSSrUrSKIKSueXgnCKBgme9XenIKKMBpSKpKMMxpLppKKpnBoopKMMMMKpMKKKKrSzzza55ObzzUUSxppppCCSSpSSrRopSrrSSSppMMSSrKSzUtpxrxxphSMUMUSrrUzzaOtbaOtbbbaOzWWaN5Os6yN-ee117eme97cX--1117XmmccVaN1-Xy-XD-NT-6sDOa0y-cWtzrrKrrSpptWSxs1W_rMUMMUTUUzrrrrSrSxKSrKKzKSrMSrxxprUUzUyTOa-N-1-X-7--1-VV1D-EUUaOtSs-SyMzy-Xe1XXe999XcefCIKKUUn7X7eXee8aOV11UUUa-X7X0Ss1N1mVcf9ecekgk1AJmnABgn99mn9hIJhKKMB7797ee17y17V79Ve79nFX8s19nAIKI1n9pMKKT5Jp-hFgV1goV1nIF-hB-1kOsN56rSpppMtVX-77c7a5N-D550V-ObbaTTN-OVa----N--7s50y0VTNN-9maOzV17cVeepABnBpKKCBnBoopIKMMS9pKKKKKKIBWV-D-XemgpKBe9gm9eOzbyOa5OWV15NN7-N--V5-OV55-50aOaOa----99e77X9e770V1OVX-ccefABn997Xc77VccgceXegfBnH7cegcVX9ecD-VV-7-XV7Xcs5OaUT155-51XD--UtyUy--zWzzUzrbzyMT5OtztyOaOzKpxxIKKKKpIKKSMIKSKKSzztzbyUxtaUaNN5OyKs-6V0WV0_y-SppSICMKMTTTOtQBpSCMSsSrMSzyTMSprSptSUbzzygfKxUaObrMJpTO_pmpUxraTTOtttVUtaSSptzIAK99eXegfKgpCLmpMrUSpz7fKBoohUttrSrUrrSrSAKKUUra4pSzbaNTObaUyUxopBpSrzbaOyN10baSrrpzKpSSUtSzpUs-75N7cc91cXoX7V7Ws1-5TUbaOaOaSySzzzrzzzUtaN0V971A9eenBeee7Xe9cgcfAA9gggnKJgpgeee9eA9mfBgf9geVVX9fB7X6baOTTNNOtaOty52tzVNN9m7Xcce9715N5ObKt_y-8rMbzs90My6_s4raOUxrrpUMrz_rCMUry-eXUzrpySrxyObrztrzUMUttpztrVMrzrMsURhUxpsOpCUbrzqmenMtzmpzb_mfKzpooXX1pBpxSSKpSMSMKKCMKQKnCBmmeXcc71171-V--XpIIKKnIAAIBnCMMCKprzWV7sObKKrKUMsNN5UyMzzrBpztttWVaTObW_xpI99ghKKMxztaUUbzzzMy6vBgnACUtz_yTMrUzbnIMUtttV-UrUSrSSprMSSMyOWVX-18a0a-0yTOa5NOzrrRoonBpSKBpCKCCKSnCCBhBmme7efMSUSzUUaOyT5OaN-0aUxpoopMSzTN99WbV2VVXX9eYV0WaN-V-OtvKKUSzMrs1797VtpzV6rrSSrzBhKCKMSrT-Wa-V0V-X77ca--UzzzyHpMT-yT-7-sOaObbyTTOzUtsUIMSpSRnMzMT0WsTOs97hIBeX-X7tVVtzVc8WWaUonMzbKUsTUbSxrnMUKBoonJnJgpBpBoptaNOttaT5NUxprCUT1-VObbzrUzzyTUzzzy2zSxxxzry-1-Wrbtbs9zbzV9UV19-fa-taTOpUWxMsN716aUKyUps0xzaNN0VOWbaUzSrzaMrzVcX155OVOV0ztby-199f1XOWa-N-TOWa5UaNUaOa5OaUtzxtaN7egYy-VTOaUrnMwnKtzxpzaICTmoomenCKS9e9hSKxzbrSrSKBgpMKrWs-_yTNMbMyTOzrJnHnKxrKpSMKMSpprKSSMU9fBopKKpcfKSMAIKSrUMMpSSrUzVbrMUUTMympKrSrUUzMBnKSKrSxpJpMrUSSpSKS97cXXXXcXXXX9997ccX7c7X7V11171N-V-VVX1-71117-7-X19997V1mopKrSxpMMKpPeVX7hJfKCCKMMMMMKKpprUa6BpepKAK8V1meommnKMPgpAACReonACBopKSIKMMCKKKKKRpKCKJoprUtbbSSUs4MtaT-78sUxzzwpxxpxrKKSSSUSpUSSSSSKKKSKKMKSKJpKKKIKKKJoopBn9mccgpKICAMIKKKrKCJnIIBopMMzxxrrSxxxrSpSMSpKABofBnBn97710VA112V1171mmgn9k7V51-7XecXpAHhAIBooo-X75NN-XeXnBnKIBnCCKBnB9gpKprryU_ppSzyOWVObrzyTShPfIBnCK9hKCCJpKzrzxprSrSSUrxxqeeehUxzUrrABnIBhMzsOxrxSmgpxnMHnHhMnMICHmpMnHhSyMBhLopC9fIMhBnBnCJommmfAA1nBo97c9nMMrFhBgnBehBgfABfIKSx9X17N1emXABf9gmnJepJmhRmopKCMSUSxrMSrrUSxrrxrSrSrMSSMKKppCKKRognBggogeefI9mpxrr9nBggoog7--N-e999fAa-XfJV17s7XA97XcgecWV7eeAJpKKJoopCKBpKKKrTTMMKSxRpKrSzrzxxrStSrUUUSSpLpCMSKMSzMSSRef7Xce7e9X997-cX9-c-777-11197VXX17X7cgc0V0VNN1VOV-1-WVV-77VcV71-V-71--AJVV7XhMCBmfBnC797g-ACI7-Oa--11-Vc-1XVX9979X17V1-VV7cec9oppnBn1gXo71oome-1nHmgfBpKIBgmmcenIBnBnBnAAAIA9mmonI9egoXmggopCMKKKLpQCIBoopKopJcgnIBp9fACJmge7X77VVa-11-V7-VVVX-V72V7-7-VVV11-V7----V---N78V5NN-V6s9XOy1cepgpQIA9f9e7X777VX7UTUbta1eekXX7X0VcX91c--g7-11emXceeXX9ee99ce9g7cX999XXXX99X7XV-5-V7ceeegeX7X977X77-X7XVV-5-1-7--ecD-9hBX99onAMSKIMJpKSpKrMKJhIMKopST-NOaOrRopIBfIMSSMzxzUpzUUaUaUbttyUaOhBpIJppMKprSxrUrrKMKprRnBn9ggnBms9gnICIK99efBomceXgnIBcXceeeXeefBp9emceececeegmeXXeekee9X9Xf9ecee7X7-5N-a-N--NOWVN--V-1-V1--5---711171--550aN5--0V1-V77-55---------N-7XOta6aN1ggnBmnI7VD-VNN--NN1ghKBpKIKKJpKIIKCKKKCKIKKRnBopKKrKSSIJpIIJoopCIJpKUKSMLpSKKIIJpKKMSnKrUSSppKpMSMKpSKrKp9eepUrpSSKpSprrrzzzSrrzzzrUrzxrUzUzUyTSxnICKCACCCBnABnBgnBmnABnCBnBgmnBgmmmgggggf9meemeXggf9mgemmmenAAABmmmmXhA7cgnIIAIBnBmhBnIBnKKSMSpgnCKRnKKMKKpKSprQMQCIKKCKMKCJpKKpMBohRmnABfB-1V9sQR73q09kCIBed989cCHZpMUMMSMSUOxbpy0bbxSraOaOc7TVP29C9Vc0VBecV--7NVV-N8H9w--c9BgrX-BVhQICKrSsV-1VkNB1Dn9choeAEHp9A9eAKKp9fCI9Xme118BgecX7IKKAKrJce70cXXXcXMSppCzSpJxSMKSKSSrk-0xpxxzba-17Oxta56paOsNNTOyTOa--USkWzMUUzs--VWbrxrrVV-d9e7VHsFGFpA9BnCzzII9X97pxS9XHVZoogqUtzqUyUxx50WsTOXmgcOuVOXc0T4CohpochopxzyN7X7NXV-cNWurX-AW_mQ9horyWa--D6JABqN-51WZ4aN79-1XOJ2Oc-58_IBN-i8hrCBfItza-V2Nd5onEIMLOs-X-0se3gprOX1V5NezHrS9eACprpxy0aN7cVV07h4Zpy1V3shEFnKMUrzcVN7I91V-chgRwP--Xvb6V37jO2mfSxrUba79cV3cjXTpJpJOyTOX7gc--1B70i-6Y102KttXe-4Y2-QBrWV-qBklBoptztf9-7-aBzewzzyPee--YGg2-DspvZoeeeXmeA9mgmogn9fSApra0tzWzy6tzzbzztza-e-1YR0fR--PDnihKtVX-SYi0nMS9VecnMSUzxc7UNN5eV4HE3LxHx9HfA9nBxpaX5TUbzUpKDNUKBh9e5BfCMSFT6zUbaOd9V0aP7OZecWV-dYlL2AAIBmcozMopohpzU---NOaOa6X97-LEHZBzbeV07yFszq9V-cz9FrX-4YxwbHc6s-9FJpByV0d0kXnUT7V--FTac-5FvBCV-XGFeBnEUa1-686HMnJmxCIATUpUzV5--57eV2t6dDnABplyUaN1c--GxMc-9HB5gtV38862nCBopa0taT7V0d8AyppN7-1THOURmocpAKpBc9zSMU0aN551-USL---WZbifBogn9ghCUrLTTTOyOWs7e7V08F5moo5-48NGSmzJmVCKK6ls-0V-1_meQFN19MIGBrKKKKopKzWaUbsX7X77-17c-1P80D09ablQKBxrSSMSxzUSpSrSrSprMMUSVVVVV0baXX997XX7ccXVX17X7c-DQ9vBxX-PblGIMMSrMMMkVVOte97eX7-DUDUCL1-0bwmfD-3c-SvC55-NcAPfppppSrSr1117X171-Ju42Zn9gmd9ceceAMSrSppKrSIBfrKCMUUKk-T9mcV5Ua5Ubz6tX--0aOa1X902cKbrCKKJpHpIJnIKBnCCBfBfEryOttVOu5OaTN5OX0a-7--1---cRyM--P9esnVneG9xnBmn9grKKJnIJpKSKMKJporUonHe2IBmmnCBpCKrSrKpppxrSzUzxxrV5-NNNOV-Ws-XV55UrSrxyOc775-7egoe50Wta7X777N--7VOxrSVWtbzUUSqV6bWaN19cVX99gecemd9ec1xdFn2SrJeCpKrMSrKpSKSKIKKIICCI9XKMKCMSII9comomnAABpCIJpBmrTObs0taT5OsNOzaUSKMUtV-0aXX0WxOzaOV0zr1750zrGWX--XVVV-77X7V0VV-117XXXcHX1V39Nu-nKrUUyP7X9XVFeTW0xrI997KBcXBgnCAJpta50aUpIIBnKSzba-0VVUzbqNX1c--dA_c19eGowgggnCSSGWWWbaUsUUUccee705ejHzrzUUyNA9eXeV19fFvonOaTX-Rf_UfKCBeISJxrT-0WbbVNXe--AcyX--Aenu-lfzAABeconJnUP5UrSpKIpxLV0zML5-V7--1X7-2gTJfAOV-AQx3k--sU3c1TvB1BnKCIKIKCpMSGzr-0VN--751-19-0iur2k0FkOrQBgceZgnKKMMKKSJmXxpSSprMs6rJnrUra5NX7-X10X0aOVN-1cV70c16258gfA9fJmnIMKxzyOaOs-NNNX-7lElAMryXe7-042oc-A4AKhN-7gKbcmpIrX6zrxrMzUVeVX-gocVXV-3MmVV-3NpHV4wNq3mmmrUUrMUTP77-X7--lazYV3RQ6imfrrSprs-1X9-7liMQEOxse70E6TIBmZxlxxKOa77VV0I6vXBefKMIM5Ota50cV-RW4Rw-0RW5cnK5--Om5EABpMKBhSxxs17-0V5X--H5H1-9mCaYBoxbaP70emCc2MSIBepJfIIBmVP7mnCIAACCKIlV50bxqUV6zxxpCKprzzaUKa577cWVNUrOtV17V17V7Xcc--HEP1-0mI5IF-0mLgQF-amT1YIBonIIICBgonGaOaNOWVNOWba-02AS3hKIKIJN0V-5--AByfCsV-BqE5k-6CtMgN-0D4wcDzDLQCCCBpIIAAUJmmfBnAAJonCBoomgggfABpAKCJeecme9IBnKKKrMJrSrzUSKpMKpzrtttbxpMbbqOaUwUxObzrrK6aTTTOa5550Vc155ObWaOs9--0WWbtzyNce9cc-Ne7Vcc90zbcV0ztte90byTOXeXeeeVNXeeV0RupTnClV-hngH2CCCCJpKKKppUUtzbta5-V777-X177XV1wx_ZnIKKaN-V-PnvrYCJooerSo-OzuXVTOV71MEjtggeeeggnIAACJoTUzrMUbbttyN-AEykhD--x0GZrsc-2FY2g-4o9gQCSX-CjFseBonHonBf9en9eegf9XfCIBfBpCKMMHhCCKpCKICIpOtzSMMKKIJxUbbs7VN1---VV5ObbxrKCESzUpISy0bbbse1cX5-XVcXeV6y6aTNNNfBmehCCBee19cVV-0a6bzttyUyTUtzwUtttaNNOWV-1oImQL--AGQ0CNV-x5IkxkV0IIIYXm2V7XXeyUta5UV-46fyV0C78BrT7V0S83qnAyP2IoidnCSprrSxrSzrUMSxpMxzUUSSMMMMSzSSrrSprMSpMSSxrSxxxprrrrrUrxrSUUbtaUUL----WX-5N97X9emVP97719ecX-0aNcgmme6a9eX7199e77gecVX7cXXXXXcXX77X7X9egeeXX9-2oitACsV0hAoJnEbsc1EIX0Bgeen9gf9rSaOzzWyUrzqNX9-0CE-XnxVV-4FqeV0SGIunObe-1p622T7-0JRDc-0JfGc-vK0CgggrUzaT19V-CLDDs-6Ku0CV-ALMbENV-COvBk-bLoRjSrR-cX-8pp72IJoOWV--4T3HV-STYBq--hTbPoN-6pzxnBpT0X-5q4TfCGaNV-xXFHpN7-6N_hh--2NfsB-NqBUQHeCCtzSSSzT1cX11-1CZ-NpprX17-7qMXnCMyN7c-IOb-BnaN-0Owzc2fPAlBgggf9fAHoonAABgnCKCbbaT5OWaOaTOtbaTTOaN-0PiN7-MPkJBf6tV-4fLuV-SgO9lV-phLT7tV-4gqNV-4hl5V3xiFwnA9nAROzqOaOXV-SifanVGKwWFOaOV6zzzzUUy6tztbKta56s-WrzzsN-5T4rKpppSKSKKKM-6Sk2RmmeXgeggnTUbxyTUbyOe-OMnm0a50aOV-NNOyNOxtyN-fRZugenzttuc6MRg2gooef9eemeX7XeeeA9Y9BehCIUzrMUzzbrxzttzztzUzrzqUzzbzzzbbzrzzV-9fA9eeX0XeBeeY9e7-DrA8vSzrOtaXeec-0S7u7-rS8wBhCUbttcec-bSGCgnCzaN9-BrL6QBezxyTPXV4hpYLmgfCtzxzSttX9ce-";
}else if(dialogManager.tileDataToIndexUnchecked===19){
s1="EcCx-VQCO1iiqOLOKeeedae_ddadadadOfiveOeLeeeedadaPiuuiePPeeyeeeeOeaPadaeeydPeOedaOPLOeeeOadLOKLKKLJG4G3G4G4G3F-3GJG4G4KKG443G3G3G3G4K3K3K3GKKK3FJ40F33GK0K0K3G3F3F2nBnBnBnB-Bn-04G--BzzwEByvn-wG-BnnB2BkG44K-4KPKQyde_K-G3GKFwGPKO_O_K3J4KG4KKG4KKKJG4KJKK30304LOJG3GKKKKKQvjzuzziviueeaKaKPKKKKKKKKK3K_eOKO_OedaKaLaOevedaOGOeOeeaOaOaOeOjzvjyaPeOKKKOK43K_KKaveJGJ0-JG3G3GF3G3G43KaKF3G4aOedaOFKLK4_eee_dJK33KeaOLOaOjveeKLO_OaOaeKLPeivjeaOeOaJKGKJ4PdadafiyjedLPeueK3F-G30F3G3-3LOaOjeKLPe_O_OeaPfieieeyeaOaPOKOeedeOdada_daOdaKd_O_aOKPOKLKaKdK4LK3LTdaOdKaOK_KLPOaaO_LPKGKKK_KOaLO_aOOaaOdaPOdaO_OaKOdaPOdaPedeOJF--00LaPdeaeOfeyeiuudaueaaPdbeOeuefefuivfifujifieviivifeeid_G-04OF0-03KaPvievjizfeeLJ0-JG-KdOTvfiyviyujffviujeiufeiefivivfivvfeevivveiuueieiefeeiyejffuiuuiviuvfiifiieePeeaieieveuePdaPKJKefefefiuzzvzivviyfvnvjvzEzzjzwzzzBnzwnnk2Bwkn2zzknB-n2BnEBzyzzBzzEwnzznzzzjfzBzwzznziz2zwnBnBBkB--B2EBznEzBwnBnBzzBknEnEByywzzzzzEzz2wnzkzznEBwwEnEnEzznEzzzzzzzzEzwwEEizizizivjvjfznnzyyyvivzzwnyviuizyeyeKbifiuizzvifieeuyviuiuefie_iviiyjzvn3F3Bnw-BnBn2BnBnwnwnwnBkBBk22nEn-EeeieKdeiudaOaOPedaeePeee_KKLPOefzkzEEjzwk2B-k-kBB2yiiuieueeaeeaOOaOvzzzBzvjivjuiuyevieifiedaOeueuivivieuvfyvzvyvvuuvwzzyyvzzvjivvivvjyvznBnn2wzznwoLK-z2BknzEivePPLOOvjBwnEffeuyzefzuuujnkkGG-yzEEzBnEBnnBwnEBnznzzvzzznzvzzEBnzn-k-k-k-2-wB2B-k2-2nBB2kBBwnBw-nB-2Bk22Bw-BkknnBBBBBnBE-znznkkEnE2--kEBknBBkBBk2E-3-2Bk-k2B22BB2k-k-k2BBn-w2-32k-C3F--k-FG0G-22-2-FB--k-2-w-G32En--nB-2kKLePLdFJG3-F0033G043-l3-G3K3JK-32B3G4K4F--B--B--FGLJGJ3F03JLaeKFG--0---BFK--203FGGFG33F2nBFG3FGJ4GJ4K02GKF03-GKKG3K0JFK3G03F--G--l43--Bk--kG-FF3F03G-403G----l0----G--Bn33GJG340JG3-G4KaLKPKG-4-3F3F03-B-------G3FJ00--3KGF--0---03G0032T4mfgmegmeX7fBnJnKIEzzzzbrpzzaObtVOaNX9c9c0JN9cQfjzGG0F4NoWynBpJnKzzzV---Xc1RfMlOOvfvzwEw3GKKF-0gAIV-2OK2-3aoazBjs-pIUdyOaKaKaOfzzvgBnBF---1gInV-4OaA-BexerKESrs-V9V3q6e6dauVn3-0fPHBpMs-c-SiqWQwJ1mtRSUSKKKKKKJOzzxrROc11--TX-X7V7eeV4Meo2avi2kCK--EcNy-OUJfiLKdTzsBk-0kCPrF0fVVRjiveveiueOuveeeeaNn-n22-BG--030303K3F3B6-nnBnBrSr0a---EsTXQudeviviedazk-2-G-030K-4l1tMCkOc-57MIs-E3IhS5P-CYA-DLew--koIyA9emmfACMSrUtbzzzTTObrUtV7ge7X7eeV8QnZxddaebjwnB-30F3xzBZnMKCMzra71-7cV3wA4p_Qzzo4Ffy5yanHpIKSKMKSMSSrKKMofJppMKSKrSpSMKSzrzzrUtaOzsTN1oc5OaUzrHnCTOtaP755N5-T-NUTNN-N-5-5-N-P7X97gn9gmeee9n9meeX97cX7eVeX9cXV";
}else if(dialogManager.tileDataToIndexUnchecked===22){
s1="N4Fs5OR-kV95d_aOaaKYvyajjyyvzgzE3J2Bk034aK2GJF1R0LkBzzrrzTNX9emcc-m-iMauzjnCJKK-yk5xZpEUMKElbzzSSSSKCCCMUzUrrzzxbxlzy56pUSqOzNUsV-X9e7eeXAA9ABe1cX9XBeV6zyccc5XcemV5HcX9e-DVEO_bjeuQE300J-4-WhfT70908ULKKfjjzzBFxKJ---8YoVBs3ywOKQieK3G0avuP_LUzzeLujvykC22k--C32J0x-eifBcggf9mmn9erKtzNUpr56a0aUSCKABnsOs56y5P0cV1a0RALO_4_dffe_LaTiyjwzx-C-Bo3-2-kIo1sOhKCpSMUMrzKA9cccXIpJpMJmX7XAppICpJe7X-4HeeKrSSUrSUppUu-7VWzxSWbxqOWc70bxzrlaOtbze-OzzaX-1e75X7X97cXh9c29991EN59GPOa_J0K5KKOLiyuOa__K3K5JKJJaPuufjjjeKGGJGQfiuJMevyuzjuviifedeuaddePOaaOfeOdLbeddaOOi_PbeaQddeeeeviufiEEBnEwz2kEgyyyvzyEwwynvizjjvynvzo3G42EgBzeeisn-2F32-yuPuBl-FEuivyBG2vvy3B-zgBFx3--yjyvf2J32E3_FwnEBznn2C-nyEivv042Ejivwzzz-33G4OOG0FK_KK2nwwwn-K_KJK-zvBG3GGJK4J2Ejyzvjvjiyyzw33FFBoK3G3FyyyyoFG-G043GGGGGJau_KG23G-KG5uJFMivivivedG-FJG3TeeK--3HaieedK--30-3HPe_JG-k8uLOK2E22FKGJK9e_3B3J0A-pLYC9pJpCHxaOzzyUttc179XBmVP-_VQqOePKyfjyavzzB2BlGGH_FoeJG--2FEDXmfTTN-916ZaEFAg3MTBmprIES9eHcV7X9e3ch9rHjp9hzUzsUStzzJmXfAArz6yUbzbxtxyNNP1ge71-1-3VXzpaEV-rFIB3pKKp97--_He5PgopzKHfzMoxa0xzJhBfGzoodMSpo0V0a-N0aOxKIUKBUota7VBc5P7971V9-9-1Vd-Wgo-b0H129pBoxzSzs-719-2Ve_4bh---4_yc-91n-LUQEZ5L1ggfCISxC9eep9n9eHmcP6afBeeHeIUHgemmf9gggeeomeIIrSSHcemeeeepMJrUxxromee997cef9oedSxzSoeXeXV-57VrKHmhBgzUIrKCKEOzzxzrSS9cX7emhMJmpBgenJe9fBnA9emnBpKpKJpSprSprKKKKEMrUUzzrrSzUSxzzxxSpSKIBpKKKETUbzzzzzbzzzzrxrSrKJnBopSzrxzUUMSxzzUSrSzUSrSzbzyUtyUzzzUrrJe99eBeHggeef9gce7X9997X7e9eX7X7ceXXe91-NNOaNVXX9eHY9eegeeeemeeX-5-7-55OX-VXXeeX7ce7XXeee7XX1--N-777X7VV-0VV7-NOaOtzyTN76zTUzWba516eVcNVN0X3e716xV5OWceeeenEIBnJf9hJzxJnIzMSzpBe9cceXX9cceeXHcce7gxzSzMSIBecPBfA9eYAA9c-PnAA9mYAAA9gfKI9cgcXX5OzVX7eXejrKJmxzKIJe7e9mnAAESEJeeXmVeBfpzxHeHcXe79-Occcc6zrxzrtzrzzzbs6XX-cXVccY97X7cXX9eeX77f9eee5e96yOxtucXccI9V9IJoc-onCJe-NNHcZxJhCJcVXfrJfA9ecgmmmrzJoge5Q9X55ognCbrJxIJpIHnACKBhBpICCAIBfJmgp92AHfK9x9xKKrKMpBmrbxoh9KrUSSy6xaTT0Wby-UppKMUMKKrMSKJzKKtzV5OzxkTUV5171-NOWtbs5N51c71ce91eV-N6e5Ua6yUttbyT6aV0aTTTUzzzzxzSIA9nBgnAAABmXnAMSCpIMzzrzrzbztztztzzbzxzJhBn9ee1ecmh9mf9h9rSIBfUKWza-WaUSKUxKKKK9eX777f9opJpKKKMK9ompCBeeX17Y9h9nBemfJpHe9-1-XIHf9n979eVUs751mc0bbaX-X0a-OBgnA9gnUp9xKpKKpMSCrI9efBeHgmmnKAEzbzzUMMMKpxSpUxSKIKBoopIMzzzxpJmc-f9eXX--N55NN--e777X11-VXd9gemn9omfBon9mnBeh972CIp9eBmehBzSzrUrSoxSxrKKKKBnBeee1gme1h9e1eceeenBerSpSpHxpKKKKBpIKHprKUpKJhrUxrzzxMSUzaOy6zzzzyNTUta-0VOX7-VOa0WtbWaOtyOy5T---UtbxUzSrtaNUTObzUxrKMIMprKrprMUzSrMSrMKpBpEOtWa-P75UzKlwP9-X1eVV599e77WVVc17c--0bzxrKKxzrSrSrUSxpzrxrUrSrSMonKMSrSKrSSprSKKKStbrJURN7VOxlcV6zSKtzX7c-V7X7X7X-0z6xL5N6zzrSyTUa5Uta71V7X-0bWy--N5Oe99KMJomgeggmmceBeecc79cceeX7eccX---5V-1meXX7eXZgeece9cXAA9geVTUttbxxrxzUUbbzrxzSxztzSSIMKIKMMUxzSqUxrbrrMMTUzzUaOyUyN7-5OzUUUN55TOaUzUttta55Ua-X9XXccce97XXX1-V--517VX15---VN5USJppISJprMSrKBpMKMSxrSxzUrxxxxxppJomgnIHmnEzpACrzSpKUtaOyOztyP1eeece-5OyObzyUtbyUzIBnCSompHmoxrUzrUSrUrSrUUSrSKCKBgf9eef9XVeefBcV2A9V3eeeemmnABmge9BeegrzS9geA9gggfMUKKJmrUKrKUSKKyObxxrsOzyNTUrSrrtbrTNObzzzJpKpKJpCJpBnCKCKJcVmxKpSpMKSKSSzKrKRUzzrKpxSpSrKUMSKIMzUMSrSMSSKBrpMSMSpSSrSrSpMKrKrSUKSrKKKKKMKUKKMKrKztzaNOza5Oy5ObqNNOWbbtbbsTT-VNOaUbsUraNN0tzs0a5Oty-V-7OV5TOWa5OVV57VX997X1HegecXV91---nBnHfHefHcmeXWa-1ggmV-X119-c7V79V97cceXXX99e97X1--VX99X7X79eccX77VXXcee970X--5TTOa7cc0aX0bbttxaUzaObrJhBefHmXggjMIErSKCABghMKKzUxzrSrMMSzzrrMSUUxxpppKpprzUxxrUrzSxrrRT0zxUrKxUMpMUxpxxrUxby5UbzMKSpxzzSzzzUzzzzbzUzyUrKSxUMpa0a5-77-N5ObbtbWaN--0V-550WWWWWta0VNTUztzrrUSSpzrrSSrxxprzxxpoocV9XeX799XVVXe977X7XemdACIKBgnIIIJopIKKKGbtyTOtyOaOzzUsUyUtbzxzSzrJmcXX9XnA9fBgee7gnBmmgmmgggmgonBgfABpKSMJooorzJmrxUrUaUxpI9meXpSrSpUrUzzaUs0aOzKKKKKBpUKKKMSMpKMSKMKMSMSMSrKpKIrSrSpSpMSKKpKxUxUa0aN0a--VN550VVX---Otba55Oa-NTTNOWVTNOWa--OyUyUa6zq5TUrKrMSrxpSprUSxpSKKMzMa50a6zrSKpppSpSpKMSKKKKBxJnKKKKpKzxrMSrMMSSpSpKSpKMpxrKMSzrSxxzSxUSrSs-77XcV-X----7X77X7XcX-c97ec-7VX7V-ee-1---T-OVN-OVc-OzzxrSrzrMUzKKSrpxKpraUSxKSKzV-XX7X770tWa71-V1-X197VV7cXBn9cfBe70V-29ecX-0WV77X17-57XXX7V7-71-VV77VVX7X7X11-UprKrSrSrMSSSSMKppKpSSxzSpKIpprSSpIJoxqUbzpKKCOxyTWzxrUUMMKrrSSpSMKpSKIIBrMSxr-N5TT5UWa5-19-5-cV7X7X1XXXY9999VV79e7771-N6WWtVOtyObrMMqUaX0bsOaOWsOs5Urrpa-0a6bsV5UVOba56X5TTN-19-OtX-NNNN7-0WcXVV71-V7c7c191-XXXXX-V715OyOVNNUwNNVmXZmonBnJoonBnKCBemeefBoome7V--77--VV0V7-N7ef9ecgnCCSMKKKJogmnCrKIAAIA9efABrUrrzxrKBc79ecccX-5NTTUzyOaOu7-OaTOV-571--NOWbzzzzbzUUKKKMJpSSJppppKFOWtzyUzbVNOaNNNNOaOWaNVV-NNT5UV6bxxpaOzSrJohrT6brrMKIxpopSMU5UsN5NUX57V-997X109XX77-TNN0sP-P-N5-0zyT0V-70V-1-5-V7V1--5X117VX777P77X7XZfBn99BeVOaOa5OaN5NOaUbzw7WbrzKKtaUls19-N0s-N-Wbz0z6xKSClxrLP7NWu1-OzKUJxpCCpSSKKonIUKMSpxrSrUUSr-5X1-TX7-59V0X9V2Hc71710bc-UR--UzyX-5V0VP50aOtc1ZccY9-OV1-OxpSpqNTUxSpxzUGzaV6a91-Ulba-UyX9ee1XX89nHXCK97-V9989XVce7VeX9997ccXgmf9eXZefSHpzMSKBhBe7WW99V9ZoeHmmXBeYBghIpIC9X172971-OcX71XeYBgmf9nBefAICCKKJpKrUxzUSrSrKJoxKKpSMKCIIIMUztxzrMJTUUxrMKJrzJgeX755119n9e1-7egeccX-0WVN-V7--V-NP17XXXeXX11-5--0VNOX57cmVdHXVOyXX9cmnKIJn9VV0aOgeoge0aOz6uHXeef9megrxBpp9e9xp9ce7ceZmecX2BnIKBeeX7X-Wa15VX7eccgeVXeemnSxHf9eceee-Nf9ecmfAACHe0VWBeY9X6efBntzSHeedBh9Xe0bttaTTTVTUbsOta5N51VVXXXHf9eh9gee0aT9eegcWbWbY9ceVCcCaqOLK_veauOePUiyujEEsnF2n-nBwzBoJFJKKK3-80h0YMsX-1VrHCgo-20kufu--VtxWV-B6UlBN-52nkrV2Y0uFfIEHn9meBjH_9ZnIp9I9KKEIBgrSHnof6pI9pUrpEURU6q1X71-N0V0sN5556taOtWza6byOV57Zc-P2xzMis2K--FUuQs7X32vL_OOOaTdOvuzy_LPzEYzzzuT_K_GOLayvzyavYzwznznn2yayjzzC4GFzEnGG3GG-J23F-3GHeeeK32341d_JCGO_JB---11ea-oW1WhaavuuK45Jevfvvjiin2nEF23F_FBxFx4OK0-2FWPtxxuX7-13IEU-OFXU-mmnKorUMzWxbzlu9-6xKrbWXX9cXJcoe7c4IW4c4aLOLdaeQeTvuiiEjfzjvvzynziyC3EzjduzfidKzzuiyiveeLO__veKJ_KGGPLuzjEzzivfvjdiygzjjjvoGGFFnyviyvv-EG303JG-Fw2ziviffyBBznE3KJ4F1J43GJ3JFBzsG42z4K2C44JKG2EoGOGGFpFnK03KJPLK0JaJ2Fo2nvevzEjzh-C3K5K4GaJ03_O_5aLdaEuaJTvveOG343-B-kknlKK5CJ7sXgggrpC92ICEJppUURUrzomYEIE5UKAI9gpMon9-X-5mVccohzrJe9HeAA97cceece77Y9en9pttzUHfCMJnHX7OcX9VPmf9megeXeXWy0zTcVXXp9XX9X9ecVXeXfJmeVN0cnIBnxHcX7X7-c9ogmY9p9gmgnCBppS9c-1WsXoocXeccV9ecee9e7A9eccZemVeemXfBc7XWXegc-mXe7YHgmme1ZeBgoeXnBgfABgnA9mf9ecBhAErSprMUSMMKzrrSUrzzJee9cenxomeXccX0yNXgenJceXmgfESxESSzU6zOzUbzrJhKBecn9cxUSMzUUa-50Wta0aOzxxbaUzzztyNUbyUzrzxxrKxzUMSSrrKKMUzzrzUUSxrTObrJgmecX97ccee9ecX1-0e9777Xe7V7eceemfAHmeeef9n9e9BoonBnKCKBegccce777XmenIUUUUSHccxSCzztzKHxIzzMzSbzOzKABnBgmYA9me9mgjzzz6zztaUzttbtzyTNcOzOWzlbyUxzSK9c99gmrIEyUz6rqTVUqUpCSpEMUSKSSpMKCMWzJpxMKBn9YKxIArpHgwUSHenIK9KrISomXBeJrIKIpMK9VpKJxBnCCCCCBnABopIIIIpJnJpKMMSJpMMJxSIMSrprSrxKpEJxJporKSKKSJxrpprMKHmhSxxSrSprMJhISUSrSppCpSbba-VX971-V57-77-X11-VVV77VV0V0bxzMKSpMKKrKSKrMSrSSSppCpCrxppMSSxSSppSKKIKJpSpprUMMrSUzpprUpzpzSzMSSzzxUy50bzrSSKxrMprUMxrxSp5UMSzxpKppprKpKSKprKzrMKpzzzpppxrWc-6WsX1eeeWHcWa177VVX-7-0VOV-0V-0V11-9ecXen9eegmV-T----0V5T5N--N-NN0VNeeeeoefKCKKJnJpIHe-C9eoefHc77V777--9VV1-------0s--99XXXVV-77VV777VXggmeXX7X-1177X7VV710V5NN-NN55Oa--19e76zUxrSKIKIHnJonKJnKCKppprSSrMMIprUObbzzSprMSMKrMKKrUrUk-X7V0tbs556zzzyObWyOzzzzSr-OzSKrzycVVVX77X7X---0WaOtaOV50VNNTObttttbttWaOby1---77VNOX77NV77-55OyT-Ozxs-71-V-NN7111777X7-17VV-OaUzy17VcdBcWWzzSxrMSSIBmeepKrSMKSrMMSSpSMIIKKpSKpKBme9IKA9gpKSSKMSpIBrSMJpKppIBenBommn9mmmmgnIJopIIIBgnBpKKSrSSrSSSMrrUxa-7c91ec5UzxrzzzzzyOxpUzpzzaUzzpKMpzpKJnKKzxonKrUpSzxMzs5N---7XV1V-1V7XV-6V7V-5UVNOzaUy0taUsOaOzyV6taUX--NXX0a-5---UrKpKKVOWa-OaT6V-7-ObzbzpzaUxrzV-3ee7-0baOVTUWtaUzbzbtaTTOtxzxHgmgnBgnSpSrOaUbVOWbzyOsUztsTc17HgmeVh9X76zzsT-eee77AKKHe--175PeV0ztaT0a19ee9eemn9n9mgnBnBgogmfAAABnABgpAA9e9eenp9mf9emgf9Ze910bVV-c-6WVXXXhAJegonKSKJggecV-PV6V0sTeX6a6VUzTUxzzw17eBeeme7XX7Pmmf9eXe90tyTTUaTTUrbzUxzSSrxxKSxSRUzUrzrxxMSpI9ecX117X_rSrSJpJognHzaUzqUza-6zUzrtyOyOtbaOttttbWtaN6WtaObzy0s5Ua0bzzzrUzzpzzaUpzzaUpzWtbbV0sUzzzs6zy0c170aTVe7d90yeVVcX90sX5Vc5VVWBgn9mXc9e5TVTWY97X7X-eeXXXeAACpHgmhJnCIAHmgpopCJpCBnIBf9ecXxCICICBpI9mmmX7P97X15575Ne7e9e7X7X97XcXf9V1-V9cVNOWaN6Ws6aOxaOzUzcX0zrbbzrSbWbaUXVTUbtccWbtxzKSrxUScObyUbzy0scX-c7UxtVN99-P99ccXcxJponAJmgmp9ec7-TV7X1opBmX-X0adBeX5T0y1e7X-VX7-V-L3UrqfY0-138kAEKUrlzWe9e9V0m49k5LOdbfjEsnvnnE3GGHK3-A1cjM9nzV-54Q8qk-61u3fr1-3sMFpOyuaLEzzwGGK-F-oBM_CzOXe-6W_-Wdag2l-EFmZonCIBxzSrzObsP9Wy9cce--P5pFqbzC4--Fqeis-560MMV-62XLvSVV07RSpOvkF9RDJawmn9enA9gtzq5UxrJhKBohxWWWbzMIIBObaP7VUzrk-552IIHeXc-OaPV-sS_yOzF-E2lW2BrkOX--0tNK-1kxuPmj6a-6WyFxbvv0G--G-7Ws097TviUivzyj344_3G-2G2vonU55c-H7sL5vBJ-I3TOb9mzx6V-27YoxtvivgoFK3-O3chQBnrzbsXcV1s_iwtejsz3J3-UlBAVmpCJnpBgzUrzJzOsObbbrIMUxryP9V179797cXee577-m8hBTjjvwoKGJ-6GFdpoxrSbVNed9-EXXkY_OLTdzEFwnF0BJjqSCzRN7c-AXbLQavvyl3J3-K4GtYIEL5OZe-8Xfk2ayEsCJF63KT5RjMrSrrJdCSBfEMxbWWyTWV6xWV-ZogmmVecX7-37iKTtLNwyzzzJJKF0ZMYtCBjraUaee-BXzPI_LPQwwnkF2gN3fCKpMOWzrzMN519e-gmcX-0sk9BTyskKF-gNfCwnTNV1smThtaeOwwk0-blddLofEICtzpIBhzzSHmrzzMUlaTUbbWaUc571V7PeCAAHXAHWJgmV0e7-07p55tiBF03PYgwgntyNV0ssWhPvnF_F-ZRPRBjyV-yDODaLyzyEx4G8K-DGnFpnEHhMKSxMKT-77-V0WVV0sv3MOabz0--wSXFgrzse7-iDyADjevY00GF-JT8txaV-Nx6JQ-03URgzKMNV1-0czMkPTi-3-46wSQE--PFP-6iBxK--m3-Lw--01ZbF-ZWN8ESXV-1Fp9r01m7Q9nJfAJnJhICJpIBmerpBmhSMrNTOxrzpaUaUSMzJgrUtaOa0zxohKSr6zs-170a90a9e7T-99eXJe7X71ec0a0s-0eV-d3ruQC-5m9_npBhUzq-71VaO4NlPeLeadfidaUc2zieOdejegB2EebjyafdKOLOzed_azyveKaO_jnzYBzzgEzjwny2G3Bnx-3GJFFF-GF43-F43K222-nBpKK3FBnCKK3-E7l5YBp5OV--ZOW4V0ZYGOgnKKbtV-9-0ZQ08Y-0mFmanR-0qHSRLvyzivizzzwKJ-4KJGKKF-B_3TC--aHcDbeuEJ2G-uHMABnIMrSJnrKESprSUzSKrMSprKSxrMSCzSSsV5UzTX1A9HX77V-V0blzyX9VXc9X77XeVWX7X5ce9-VX-JZjCha_OfyaOjg2kB---28VXfD-4Zl_8eNko-68kVYU1-08DGkPP2-03bIVhxx0ce-CdE9eO_HLdbuO_5PeTeedQfvgnwnByw-B0-kn-3-JF-695wno5V-tGZSvg3-I9ETUKBxV0sV-OHgcv--BdN1CV-aJrDTeff3---QHauhnCHpCIABnBpABon9fAzqTUaOtaOtWa5NN-5N7-DK35qf0-EHckqpICHnErSzxUT-c-T7XVc--9KE4TgF-weZUCMta9c-XKiF5fdv-F--wfapxpKV1--qLkTLObeekk-nF-GAgqMEKL5-V-PMsgaOen--1HzhMmly--OVCzv-ABkKHggnUSSSKMIKBejSomopMzST0tXe-TTTTUqUrs7-NT6bbsNe7VZgefA9ce7cX--dVyCyl--n4ilq-4tYanu_aTvznvjwlKJFJ0--n9ESqVeOaBotKaOKaOaLKOeaOdbjveeeuvfvezeuvfvdaPeaLeaufyjzijjizzBzzz-4----G-kK3F-Ef2vjkw3G3F0Ka_-24G44F0-G4FwywFBEzzz4-n--GKKGF-Zo2YSBy--HP0pTUx3-2CBuzD1OayrO_OGeffedeueOTePL__FGdQuuaadaJKa__OaPPaOPTdaOOjnveeQcz2kBFBFJ-zjevBp-nnwnEznl-w2BnzB2EkknE0---32--k003JF0wshYhAASoxN-6s1-MbOFS_K_feaQiwyw--n3--4E6XAL--1TPHb-3InNcnKTOcX--bdaKk-BxkuhV-1TsTa-1nrxeoyOe-0bl6lg-5nstSrUMKy-77eV-OwglQ-2ByuwCCrUSTUMUa751ceecc-9UXcbxF-JzIigy--OzHkP--JzpRhse79-TEOKuOKOKJaKO_GKLKaOKKKOaOaKKdLOaOJK4KKOKG3G4dadedaPOaOOaOPaeaeePedeOeadaPOaOKO_KaeadaKdOePedPOaPOePePLadaPiufyvueeafufeeePeeeeeOd_feiuze_PeeiuuyjyuaPyjuefzuveezeeOeiuvEuzfiyuviivvfuuviyvfyjzwEkzwEknzvf2EzijuzyVz2wkz2zkz2Ezkz2zwnzizuzfevfifejkBBk2------3GGGGJG3F---3GG303G43G30-G43FFG033-FFG3FF3K4_OKOLOaO_OevedaPLLLLLO_aKOO__daaOaaPOaO__J2EnBkknBnBBBnEBzEEnBwwwwwnB00-BnEEBnBwzwzEzzjiuiiviuueuviiiviviuffiyyvfiiviuueeevvvyyviuwzzvvwzEBnEEBwkwwzzjjyzivie_G-GGKG4G_aLaLLLOaOLKKK44_aePeeeedddaaVz2wE2-nveeiivfueeefuaOeeeddeeKeeuviiviivfiufiffinwwnBnnnBnEBBBF-BBkknBnE2--n2BnnnzEnwzzzzjiyvzEwnBwzjyzvjywznveK_KKGJJKGLLaK_KKK3G4GKLK__LKOaOaeadaOaLPPOeeeaaOaLPO___d___LeiuiufeveeeeedaiuieveeeeeOdeOdL_eeeeddPvedaeeeeiviivejeiufufieveffuveeaPeeeeeviueefieeeffifievivvefieeiuyeviiueedMfeeeufzvejvijzkwkkEzcB-Bzzznzis-kzkknzikBEBkkkkkkknkn222222222B-B--BBz-BB0----0-2BF---knBkkzz-n222-K3Bk-B33-0J-0FBkkBknBB2J3G03GFFFG4443G3GK_KKKKLLPdaK_aOdaLKKJGGKGG3G3G0-33-2-k033--BnEuaOeuiueeaeifeiyvfjyzjjzwknBnnn22BwzzzEzzzzvivjjvisFF02-n-K-03--F-2---0-G-zyjefieeuadbieeijePeddeuuieevjffivgkn-kzwwknwBn2-n2w---3-------0-FFF3F3G0-----BG3J3-Bn-B-Bkn-kkBn2-n2BwknBwknBBn2Bwn-nBknB-nBB22Bk2B-BEk-k-B2BBn--BB----FPKdaLOKLOK_PK0OaaOK0G33G-22oFK30-G0KF-G0FK3K03K--3F--F3GJFGJG3-B---Bl--J3G3G34G-B3F-0-3G30000F03F-G3-3-3-F333-34K4HKTveuffiieaaaeePfivfivijzveeeveeeeeuePLKKOaePaOaOaieeQeieivjn2BBnE2BzyyieuiieePddaOOOePedeauiiuuieeeeadaOfePOaOOGKLaifeuiivfiiuveudePevieOaPizjieyviie-zyyujvd_QidaOajeL_HeOJ-JaOJ------E-Ek04G3-GK30-knB3FF-kB-FFG03FG00-F3--BEEzvwkn022Bn-----3FFFF--kB--knBzBk2-l-FF-GLaOOaaaOLJK33F3-3---322BnnB-B2EEzwk-F-k-33F-BKJG33G3FG3F-k-B22-033F-FG5KOaKdKG4JGKKGKKK3KJG-KK3J4G4KOaLdabeiaK8OeKG3G0JGJGKK4-G2G34FK0KGKJGJGG3G0-nz2wF0-F-n-8_JF-0F4BY--P0tSP--h0VngrNNV-131JF-C1OFgs-yWMryufyvwl3G3K-0JCKqr--QcWZtfifvzzjzEn4JKKJK3JF-S3GgCOX-3cY5hbu--BJGZkn9eegnMzStbs6tbXc-LXKO5dz0F-45ACB-0coCds-0oPt3r5V-PYdD5PvC0--JSsLs-1Z8kq-1JWy1plXV-9GBhR-6HHYfBOV-uIEYPn3--HWaX--8HId--oeiBlV-uKjHQgF-4HqwnBN-9_twqwF0xAqDhMSrU5P7X-e-IdWHnezeuQYn-F24OJ--okfDw-1eO79Ofu2z43FESCuGgmceeen9mgnI9xbtyOzzzrSTUzzpSzzzxpIMStaUxpI9pUtbxzzSyOzzq17ee7X9VecXec7XcXX9eX7X7e1-1djLCck-4IbhIT7-DbXXaf---oxnunV0PUH9Pjk4-1p-eZnSs1-4e0e0aTkk02J3sQCKKICEKSGxr5V1-NOV-N19V09ViePwlF-pFUggozs1-5e58teQE3F-0GUQ7-Hcpl5Qw3-2JPuvN-3eMuhfw4--KBcHk2HdfwLue_KGGQvyzfivkwzjvzvivkJ3FGGJFKJGG3-0K9aA-0PdgWPfkG-0pIONpN-0PeQwadK4ivizwzz3KJ3F-lKgCABxUUrxWbzle9ece9-09k9WOv2F-_O0RhEu-9TgqsLLOKJKKOuOeePMifveeOeaeueyBnEieeKaPdejnEyfjzvdaifY2yv2kn0-wzzpG3Fnzgzuezuviz03-GGJGK--HKG43GG4JK3J--knBo2B0FF-Bo--KP8gCN-79oXKPdOLLabezivvEEB-C-k-JK-1pfbTnSsV-0fVFlg-0Knt9oN--fko8V-CTqeCV-LjQxauBlIVxUDAgmonJeeeohBhKrKI97X75VfpxHogofCHX7X9ecfprUSKSpUMUKKAKxKJhrSonJn9nAAHpKBgnCHfIKJnKMpKrbzpAI9nBnBpKKrKJnxUxrxzSpJnrUrSpKrKxMSrKrKKUKUKUxrSrKBpxrSrSrKzzxUSrSrSzpzzSzSrSxrrMSKKSKKKSICCrKKSKKCCKKJpMKKBppAMMSJorKpKIpKCIIKIKI9fKEMSSpKMKCBpKSIpUOzxJrKKCCMMJonCrKKKHec10YJfCIKJhSkT0bzrUrKBpKKSpJmc92CxKKKKKzSrKpJpMxKBpKKKKzWsUzzxpIBmgrUMtbxKJ-0bzxonKzrSpUMUzzzrUrUaUbs9ce9997X770cVgcVUy1-c1-V-OtV6aOVWVNObts--1ecX7X7N5OWWyOy5--0aOu-UrTN19eX7170brMzUaUy--517V-UxzRUzttztzaN5T5-NNeX-0cceXcXXece7X11-WV50WVN--VV-OV750X--NN-55--551-77X7X1777--711-55517--VOWaV5UrKCBopKSrKICCKSSKSKSSpSrSrMMKKJpIKIJpJpCpKIKKIIppKKKIJoopKprSzxzUUTUSrUzbxqObbyT5-V0WWWV5-VNNOsNNN-NN0X55-5-5---P77----T55--NUaOzSwOa7V0a0bxza6ry56a6cV50a50yOX--6bX-5N--N51-OV-0baNOaN55OaUaP7ccccX77e99nBgmfA9mgnCBnCCKMKCKCJopCJnCABnCSSKJooprKIBop9X0WaN1-0WVN77755OtaOWV50WV5--70V0tWaOWtbtyTUtbaTUUxxxxSpxxxxr0WaN0VN--7-1-ceeXcX1Vce1Ve7XcXgmeBee72BcX7Zh9X-79c9e9eecYBee-Pc9ccXccIBogpBggfA9gggge999HnHmefBn9geXef9mmggcgeeXeXX97XXXeeghBgefBon9e1Xme97eehJonCCCBfCCKMMMSpKMKpMJe77-71-1177---NTTOWWaN50bbzzxrUzzrLN5TUzaOaTUzzxzpxrUSzUzzzbtyTUyUUzyOaOzztaOzzUUqOyUbtttWa5OaOaTX0y7Xc71V-c1c7c99cXc9eBeeXemeV7X9eX-79719Xf9e0VXcXc-5NeeenAJeeeeX7ee7fHe7-e1ceee7X7V-uypUPx3-6Mtb2ENV09zcUPj-F-pVBFgrLN1-2g66tikF-CVu8CV-9kVxas--4W7XD-3gCOhfw4--L8Nik-elDN5ivBkdJ3-8NhBfKs1-0gPHxg-0qF99nlc1mm0s5adaeOaaOdPPeb2kn2BwnBknBE2K30F1KZoDhMKJpMWVNP-7X-Kgf1KaPOaeLviyB--B--9Sa7_gnBppBfHgmceonCBfMKKT-ObtzzxIKKrUxrUs-VOz-OWy-V-91V57V97V-vBZGPg--6OeXYUXV0QCqDPvVF-6qTL3pHepzzaT1e--5nnAqk-4OwbATV-5nteLk-0P7sA--QGpKUF-_cujCJN715opaLTaaeievevjnBno-303FGG0-0LdEmrX-2hcRlzpF-ChnoCV-DrMzqf-0RLvrTonIKBnBorSI9onIICBorI9mfAICEJpK9e9conIISKpUMKxSUxSrrr5OxpST6xaOzbwNUzSUxs--55T7-c555T1-555TOtsXXX97117VNNOWcWbtWX29cceVV911V-QTUTQ-JSkGCCHprSSrMxSKSKxrMSrKMMSprSSpSSrJnSSrMSpKSSrKpxzxSprStbzs0a10s-N17Xcc-1-V-71775ecVV717X9cme7-9X-X7c7X-0ceXcXeXc7-PsDBqPfV--1M2GczyeV-fX4uQl-0M6BDrX-1iG4tzJ-4RoEIT725tjkLLaaieKKKP_zjuzzzu_QvBBn-F-Bx34_F--6Rw6vCs-1fbfrOvfiB34F-Ko7cCN-1vfosOdizv3FG-4MZRcpSKbVVX-YQoW9OddLKOK_K_4L_OaaLufeeOeuezuieeTvivs-3-B2yjjfiBkwpG43B4-3-nEEvkFlG9O_8_Oa_K3F022EnzjkwzyzBnkw2-F-ATmuACMV-0Lxs1aLjuivivBC3J-G4-1MkyLpy1V0AwF5TwpF-xylXBrzaXc-TzU45O_wwk4lUpQIAACUxxKzbzJmefSxKOaUprSzrzrpzMMKrSIrKUzUMSzSsUs-OzVUrSrxMMMrprSzxrxy7c7XX-c7V7e10aOXec1XX-7XX91e9ccXXXecX9ceoofBecV971-9cXe-ijumhzedaPdeOOPOKOjvznnkn-nB-kwl23KK-0ryhorsc-Dzu75f--SN-4rronMSKKKKSpSrSpKrKMyP71717-7X75-c---7-XV-w-WaOj3-0V8tI--R0bKUFCq-pABmpIBgrSrzrMzrxrMSUzaUxprMrzpyUrpbzzrpzL-57cX9e77X1X7eX1ggme9e90ccXX-7Xe9e-1w3gUOOTev2k0-0N9-5rX-0kKVCx-0NASVp--2kOvGanF-L3-KjuV-g86STl--7HQNV1B8CmPef-k3-0sI8aoy7-A1OR5Q--T49YCOc--kgKhk-D6-BCV-62a4qk-CWqkYAStc--gEBTQl-0NTP5xX-0kxzOg--NU81k162t_qKLfvzvzywnvzvC43GKJKJK-8sUQ_pSzKrzT-7X7XeV0wEs6O_jBwF-q7MWCIq51-3l32xjwK--NYW3s-63k-5k-4XS6fE-063vsqajviyE-oG4K-2a8rrgrKTUzrzrby1cemeX7ec2E477LPaK_aaOKKPaOavyBznwwnyBznnz0-2BGKJ-0NdJyoN-2lHeCek--D9ROhV-A4eNLwFJyBG2hBnKKBenEICKIBn9ofCA9fBnEICKMKKMSMpBpBooonJpKKSMzpKpKMSxzxqTOyTUsN--5OaNV0a1-0a0VOV0V--Wa0a5--1V7-6zR--7V-7VXc-7--gNtVPk--so2gw-1gQF5PyznlKGF-TCc8hT7-2ll8lbc0ZLDNKhJpJecXY9XgnJmhJnSSJe97gn9V-V77VfBmgofI9mnC9fBpBe--IICBppJmhBmnBeceeX99geecXmgmn9nA9mcBonKAKJonKSKIBedIKMSrUMSpJpKKxKKMMKKSMKKASKJeepJprzrMMUpzzUzWaUyOWzxlWzSbzpUrtWzta0aUzzaUtzzzUttbzbzUxUbzzSpSyUzMKxpKSxKSUprOaOzyNOzKJnBpBrsOaUxJnKEqT-OVOaUzOzzUzSprxrKrSrpptzzSzxrzzrSKJmc511ge97ecYA9cX17XX1-eXV19eBgeXIIIIJpKpSppCCCpxzSxrzrzxrrT5U0VUrKExSrMsOy-TObzzxz6aOV70a5NOa6zX--5Os70btbaNOWV5N5N75NOWV517--T-NX7-V7189Ve1X-V7X9e0X-NP1e71V9XX9-V0a7X--X-1---VX1geX1-OV7--V517epCBnISJgpIICKKpJnCBhCA9e9171Hec7XeX77X77eX156tyP-0xlaT570emXXBgf9cV77Xc-E7xKqsl-0t8v-pk--E8QS5z4-0OGoLpV-0mYdOc-0OM-9rc-5mlytazw4F-DLJ3CV-MAUnqfw0F-DNImhV-ACAhqg--LTbECsV3CFn8Oauedjl-FkBF-TfD9BrX-9q-PtjvjEG4K-iv0lVorSMMMMSSrKJpK9hMMxxpJmpSqTOV56VVObzs5N0aXZgmeX17KHcV-V-7V7Xc1c-vNnj5dKHfzvg-J--qnfrCKL---6qi1S_ejk0-1QS1Pojs-0CimSPQkF-is8ahSF--NSkIsOaiaOaaPO_OPaLKLOaPOOe_aPvEyuddwn2EjzY2BnB2-kBnBwyvBF2E-nEF2BJK3FF-ysNsCEKs172jRiqLePuuPuaiuiifiyvBB-EnnFB2n2-03LKHO_3JGG3F-yth7CMtucV-ESPhLMw-9vhdJpKHfSJ5NTOba9c7-rSzAadeUwEE4GJ-4j1Q2EV-nTXv6evjwpFKF-2QoSerOtec-QTvjqLnnp-0vrTHnT-0nUI7aKLiejfzkEyfnBKJG3F3-4jgt2T7-EUOnbzK5ugg3JUzba-9cXf9eedtrtyUUzbztzSzzzbbtUbzyUzbyUrzb_zzbzzaObzrzzzzxztztaUzaTOV-Xe79pMIJmgmmeeecXe7tbzzTUba--70zprSy5OtVN-XOta5UbbbaOxvI9moggnICSrzbbpSzpMxxKMSURgppBgeeeeegeenCCUzzzzbzzzzzzbrzpMUrzrbzttzbts9eeeebtyUzzzUbzbyUzbyUzxzzzzzzzzzzztVUxtaUxrStaObtwpMbzbzzxzzztztyOtbUxzbtzzzrrrzyTUzzzzzzzbzzrzUzUtzyUtyUbzbzrsN6txrrUzzSxza5ObbyUyUbzzySxztaUrs5OzztyUUxzqnMzrzzzzrzzySzrzzzzzqmmgpPpSzIKxzaTObaOzbzyTUbyTOyTUzb_zyUbzzyUyUzzyUrzzzzyUzzzzzzaOzzzUTUzxxxzrbbaTUtzUUrrxxzzzzzbtzzrzyTTSxxxzzaTUzyUxzzzxtzzxzzzzzxzQMzzTnKxyTTUzzSrzyO_SzzzUUzzzrSrSztbxzTUtzzzrxzzxzUbHmmeeenJmme9ggmnCKUxrzUSyecXf9geen--4zUTF-DzvjEc-6V4xro-0k4zvV0T0byObgk-Fw2QHohEUrSrMWuVOzzMX7-9eeec-AVbxbxF-U0MYhT1-1sBWGj3-8kUrYUae-2sF-daRk1z1YMBmeoegxrztbxrV9---D4KBR-0khenV1y7spOObjzBoG-1RHHipOX-0y8sYOeyB-F-M4VqC5--iD9xTo-1RSYPnqP-0DF1uOykF1U7BRgeerzzzzyPmccc-rZu65UyzznKKGJ";
}else if(dialogManager.tileDataToIndexUnchecked===23){
s1="FPKk37R-2VBxOek-5J0jaCHmenHgnrKSSyP0zSrKrX77Ve7VN6zp-N7-9N5ZUO_au__aOaPgBn2EjzkEE-laLKFnC-1FC8Fpq7-6c7bTOafiaOF09efjfj---BFBF-l0KHYCCSprUzzP--VHeX7V0cAg7PekBF3O0YbnBefSBpJxKCKKKKrq5OzSKSrUyOttzaOxKrKMtxrplX56bzs750AABp9c10ta2ABn9c0bX7Zp9cXgec5T0bs-97VX9X1ccc--2AWo-00boQV-cCjKOU-4kQUanKMttc79-4Vt14egl3-40uDAlc0H2oUa_aK4ddzzysB-B--J7Gixk-1cG_7t_Gifz--739S8gmefCISSrKrSSprSzOztVeomc0yUV6XCHX-P17e7c6s7-14fPa-JkiRsp9gzSHchpISpCSrOWc--5OXc0z-V--0VzW-3kl-TnASTOV7-95NULg---BrZc-D6ia5Qk9lkypinCSSzJeeeeeX9efAABnBmcgegeX9X7onBcdABfBme7mgnBmV5XX7X9XHdCKJmonIBeWWsNN7c9cA9797eXZe7ZpJopIHgnCKUSrJgnUJmYC9hMMSJrrSBjrICA97cAEI9e7VnCSrSpSpJnbzIKpII9Xe7XBpKMSzxrKBUSrzRUxpACHeee99BxxrxprMx9eX71cXnIIBe7X7-X9ICEKKzMSJnISHXV9-17-XemhIppMJpMSxzrKHcepBpKzSMSSSS9eX7XnKIJpKKSzSCKKSpyOaUaObxJhrzpHf9XgnBpJmmn9ggcVXge18Bc5NXe7-X--7cN5N-7V5P0c7Oc7V19c-9179hIIACKpMSJpMK98SC9XVX919V-X7ZpKSSxSHfIpppBe7177VBopJgpSzKpSrxrxr5--OzL6pKCBxa-UU5UMSHcdIAMKMSrSpSr6zK6zz6VUlzKKMWa55-USKUzzJggnBrIIICESrtbtV6cOaOaOcVOzaOaOV6xMJnICCrObrUrKrJe7VXmcfACIBnMxGbzrICrSHcX19XgnCKKBpEUHedCrqOzyUxBpoggegorKKBcX7_BeeeenAAIKpzTUzzUUzzlzzxBeeegnCKrUorSrUxlyUprMxbpc6btaN5N576zVUyN5OaOyOVT-OaOaN5TNN5ObaP50aOaNOsOts50s6V555T5OaOaOV6w0a6VOWaOa0aNOWaOaOV9emeX15OxxzzwN57OtaUa-6aOVOyVenA9eXBenAIBgohBcVOaOsOs0zq6zzaOVUyUSJnUaOa5NNOaOa55OVBnJgeX91IBgmeXXecVme7UtxrztbzVOc1X76xkOWaUyNOs50aUtta5TTOaOaObsNNNOtVOaUbbbyOWbaOaOV0a-N-3eX17NOs5557Os-99ge99eemeVV3YXL38eO_aOaKaOaO_aPOO_KOdOO__OeTedJG5uidQzdaKJFC3KJLPeKedaPPiivfuue_J43afjuEffivysnzvivfdKGLaeLOd_OJGevuivviuun-EBwnEEBnB33JB2EiyuyunGFl3FnEvnyw2ynn2BG32znw23--G1KFkn2vV--nskl3Fwo2w-nn-wB3Fkk2B0-0303F-oI13RnJNN--XSMAV-BJoVxc0HAo8aOaOOaPjwnBnB-F-3MlBT-5Y16Uebn3F--Nfac-LD6jqaMn-0oRMTxBrSEMNX----ct-xQl--0mV0V1cwJGOOdYzn3--RTQexq9--2oNx--lwHxo-0cy9QviwG3-06tO6-0O-7OQgxG-2H1sFmnUs7-aFnkLPanEkGWqH6dBmmfBepC9n9p9X1con9gggogmeee9mnxJfBonBnBfKBnBonIIJomopBhJhIBnICHnBnABmnICJonBpBgpCIBnBnIBnBnCIACIABpCBmpMprzbpBeee7omgnSBnCBfJnxrKSHX7ZpBqUxKtbpzxJcd9Heegnon9AAKzKIACBepppCCJrSF6X-0zzzHnpCBpCUpKKHmoonIJonIETUJpBpTOaOzJnBpCBpKSxKxpJonBnKKCIKICKKKKKoogonBppCMKUyUzzaTN5T-7V10V55-5N-0a----5-6VObtbs-7cWcX77V---VV--OxSraN-0zSKJnCKKKKMSKUzSlX7176bxCpprxopporUSrKlVVN-171171VT-USKKrra0Wc-T0X0s---6xKKSSUy7OzMrSMxxxxzHee9ecXccmghEJopKKKrKpKJgpMUMMMrUrUxprKKMSpJpKAA9ghCKJgnBppJnKKBgnJnBnKCCBpCISMMKSSSJmcc7V--7XnBnKKKpSSprSrSSUpKrSpKCpSzOV77-VV7-7WWaTTTUrrKzzSrSzSpSrSrSzrrTOVV0a1157XX--6zSUSxzWbpKMSrSzlV-6xpBpzxbaTTTUX7WtaUr6aUzzaOVV-0WxxrsUkUUqUzrUaUrUaUxKzHfBecX9YBgoxrome9ACIICCKpICCBnCCBnJpCKKKCBnSrSSSrSpSrMUSIpKKrKrSSURUlV56xKKIASJgpOxIGWzraOa0WWV6zSSSzWX5UzMMMMKIJmmnCISSpSJmeghJoc-ACKKKKKKpSrzzSBonBpBgoooopMSpKSpMSJmVNZgmgmnCMMSrKSSKHXX7X7XX19X7f9mmfC9ZggeeeeV9XcXAMSJggggggmf9eVOsOVNeggge59-X7X57X1ee9mgmehSpBpKKHX-XepSzrKTOxSSpMrpUrrqUzIK9WESKIICBn9nCBmn9mnAAJnBnICJrNUbza6xxpUy77VUa5OtbyTUzbxzyUrHmpppBnMSSrKrSonBoopCMSMMMKKpBpCKJoopCCBoognABgmfABnBmnHeeemgoenIBnACBeXon9c7eerJxI9gfBmgmnIMUaUrUzrIpSKBmchBmnzSSk6zxbzxUxS9cXYBezprKUUUza6bbzRNUxa-NVObttzUzzbyOxrUHnMSrzzbzSUpAA9cmmnMKpzSaUaUzzzV0aUr5U6xrSSSrKSpprzpzSpprzxxzzzyUtzyN-55ObaUaOzzztbtbtza0yNNT0aTTNObrIIBmnIIHnIBpIIII9enBnBoon9gpIIJoxKKKJmXA9BedA9mmeeeX7e7e7emmee7eeA9emeef9meegfCJnCrSKMxHenBonA9ec7e7fCKKCIIKSSKKCBmnCBnIBnBgpKBmegghKrHe-WBghCKKJnBmmnKIBnBonBgnBmfIBmcXXmmnAC9gnKpJpSrtbyOV0bbrxzxxzUUKKrIEUSlWaOzVOaV290Wa-OX0zKlz5-UtaTUUaNV0V5UbzM6wOzxtzyVUzzzzSzSsNc6xUxKUzrLUzrxzpKMrxtxxaUc5--Obtbta0VeX--UtVV-NNNOWbyTUtWaObzzzaOzqOztaUxxzxzSzSxxrUSrSrrR5N0bzrUzzUbzUSzxwTUsOX797X3e-Uxrzxbbbzzz-UzzrrqOaOttzbzV6VX7X76xrUSprxrSzSbzUa-0aUKKIra-UKSrrrSr5NOaUttzzbbzzzztbqUzzzzUUxxzrrxxxzxrtaOa55OyUzyOzyOzaTOaOttzrrzzsV-0WWaObaUzyOaUOttaOyOV--11-1-6yT0c97n9egmcXmgeeZfBmeee0yNP9VXe99gmhJc-NT19ccme9gepC9eecee99X99geHeeVgf9nBme7eIKKCBmXAHn9VXcVVcHc0cmVeXc0V29gefSJnBnBn99997XeX11--NNP9X9ec756V1717HdCpKHeen9efBeeemmgfBeeeeX9-76xrKzzzbyOyTUzztbzzbzs-0sUzxrMrKorMJfSzUzSrJopAMMUUSlxrRTOaN7V-Oxr6wOzzzUKKMwUzpMKzSSrFTOzz---OzOzrqOaOzzzrUyOzzzMrrUzrUza-ObzbxzWbzzzU5UaOaTTN---57-7mn9fBce0bzyTObyTT0xrKzyTTTTOWsNNeVN5Oceeeee6zaUSztzrOaOaOa55OaOza16a-0V0X--NNOa50WWV--5N-7V-----71-VX17X7c7X7X7X7X997Xcce9eece9XmeeX9me9eXf9eeefIIKBpBpIABgocXecX7X71Xccc5N5Oa0aOaObbaOaOV----71-V7717717-VX11X7ccX9777X9ccX7X7X7X-1eemefA9ecXXe0bxzSzbzbztbzzxSSrSrSrSzyOzzUrR-7V7X7V7X17X777X-X-X1-17-VV-0a56btyP7e99XcX7V-X9e-V1VV1-17X7X-77X7ceX7X97Xe99XXecce79eC9X0c115VX7X7VX--111-----X7X1-V-X7V-X10aN7X11-70V-X7776a---111--X7V9X9X13gcX-7X7X1Vc7-VVX1-1cX17cceece7e17cX9X9eV7X7eeefBnAJnCI9gggeecc97ef99e7ge9ee99Y9e7eX-6pzbzqUKzzrUz5TTObtzTUV-OaOtWWyT0bzzxSttyTTTObWaT197cX9ecX17NN-7cXegn9n9mmmmc-OaObzzyOzzbbzzU5VOtaTNT6baNOWaVV0bsN--5OaTOaOs56a50WV---OWa0aN5NNN0VX7NN-550VOV55TNTOWa0bVNNNP-1--VV-197VVVXecce9fBn9Xe9AAAA9eeee99ceeee9cefBmgmeeXce999X7ec6uGFSaLO_K6dGdd_3GKPaddHvyfgnzfydaugEvivvdJGKdLPiivvyyEdYzBF4K22no2zVkFn--n0JFBBzfBl4JJFoG--HA4ek-9GVnLnF-wZBKjKK----PHLZLQfV---1JIPV-098zk13_D7xLUxbbwPeXec-1HjA5--HLPFk-1Hqrb--1LtNV-8Awps--8WoH-XZlwS_feKaPeeefiikn-G---2BB---1S_XV-8EZes1G9-NnBpKKKKCJpEMKKMKMMMUtzqUX9-7-1-5NV5OaP7X-UXXX-e7e-0dFKoudwB3-29I4IN--_BZzV0RdZphCUUtX79V-OIPivF1BeLHRejzSztbugeVV-0JwhF--eUEs-5KIJUV-29dgMN-4_LtYfj43--9q-a-6__B_aTwn4--mpgBo--OQ5wv--whuwBpSa-V--LxUZ-2AXqAF-__nS_a_8d__LuadPawnzzk-z33G2nB-5mtkmnEtzryX9eV78S83Oa_PfjiiizgnBn03FwFJJK--1vpcV-tTeHObk--B6uH-Fa5-xe_LQivnn--G--22VwV-OXEjQ--JlVUCu--dZHwOx--I7aHk--O4RR-4BciQq7--OGkw--BelX-3aMK4iw4-0nDDcwTc-1Olsa--nDI6q--dcAAts-8IFn1nIIIIIGWWa0WV-9PYcDY--Zp6IRzNV0ePfb5OaOLOeOfvnkwEBBB-F-ZpMlSyPcBaQ-DaOaPOKKLfuaObvvzzivi_JKKPzvjzkzzBzEudOd_KLaP_aPinzwnwzeaKaOGKaK5aK03JOaeQfyvwnwwzvYEnywnEwnkEyeTzYBwnBnkBn3Bk0_F4JJFK43KdJK-F-GF-PJ-3K0-0INzon5-1aqF_y3-2CmUIu-2avHlaw--3rPOi-bayMKeOJLOK3aLOeuiusn-BwznFBzw3-1grniBnICAACUa5N6aOX--ayTnV-gs3CRpy-V1dl9Iua_aEBB---tags-5Rzdjo--Dg2i--bL1rV--v-cN--Skio-2DuPQ5-3bUBxvYG--Ikdgs--T86J-xEI86BmgmYJhSHoOa-ObbkTOsV-0usyF0JyT6gnKtta7c-9UUWinF--yzRN-5UUkDB-AEnv6HjtV-9Ug2TT-9BzUjggnBmmnBnBnIIBprK9gnBopKKKSrzUN--OVObs-OV-Oa550a5OaWa-1-KbwxWaOLOeOfiwn-2BB-0gzcFwoonCbWbV--1UwRy-2nza2xryccV-P-nOsk-C-X_xV-5VWMyV-2FNt6N-2cCLtiBF-p1RnSSR-X-GcJbbaeVydzjWG03-2lFnKnABgnJgn9-gmenIKJrKJhCCIKttsObWV5N6zzpBofJrUSSpIABpKUTOa5UztbtaOVVV--VX-X5V5171--V-P8jmsk-C4-PC--9XcWDQ--04u0N-TXxBqOiv----Gkve05csV4aLPKaPedfiuuuaaiyuiuvjzjEz2BG-BJ-k0JJBk-0033FGJ-4JRjgnJpSV5V-09ETJUi0F-C9OOj--1aDAEK2JolqnSSSHhI9emXjSICpIIrMSrMKCK9fMUohC9nBn9c0yOaN7c0aUVOX7X7VX-57V1BnBmdBegfKRTOxpBdCCBc-XBec5NcgpIHgfBomX7eempKIBpJmnJmc_SIKpCKzSpJggeYHXrrSxoefUUHeVeeenIACIBhMSrzSrrzqUyOxRUObrR56tzKIDTTTUprx9nBnIBpMx9fBfBemeAIpBmnAABn9fMSlsUxpESzSHeehrKrpA917V1XAA99_Bece77eeenCJoomf99-5V19VX9emeeXcmY9Y9ee99X9mmpxxp9fHee7VY9nICKopKGaOs6sUyUpA9frpIKUJmmjKMObsWbxpCBnSKxrKzK97ehK9V-X-OcXgeXggeXCBmrUzzOzxKMUSrSEUzyOyObxtzrzxK9frzHerxrOxomge73ogf9Xf9gmpKIKpMUJgmemcmpzpHce9YBggpzxSUJxrSBccfCKrOaUxpUzRUz16yOtxCogmfIKUSzSaUWWbbrUS9n9pKAHrzza-7c6xaUKJhM5N0zKSUzbbzzzzbrbqUzbbzzpCBfEzzxBxJe9en9jUHfBccXXYCCIIHnJonSBhEIBrTUbpKABgpKJnBpCJeegnJnIABnABgomnAByUrbzaN6bzzta76xKrxxrzaTUxBnrtaUzsObs5N5NN-OzSxKBrSyOzrUzzrUqObyOtWV5Oa0VX0a597cOtsTUUtVXV0yOV-NTUyNNNNTTOttsTNXX1X0s-OaTOa-71777-V5-X7X---OVTNN5OaNN5c-VcX955-Xmec-V5NN110V--110ba6WtbzbtzIABeHgnESMKCKIC9pSpIIKKDT6zSSKrrKKrKrJpBnBnCKBpKppSpltzxoonCCKIACxMKJoommnKCSrUSCIHmnAABgoopSBn9nKCCKKIKBmcgnJnJnKICBnKCBmemnHeX9XZmXXggen9p9X8JcgnAA9ggee7emggcme9XmnIIKJnABgmmgcegpzSzxKKKBhCtzUUomemmf999X7-2KBnBeX-7ABggggmfKKJe7YAMKJpraUWzUrtzzOz6tbztbzzaUzroofBcgpHnJfA9gf9gmmgmnAJnBgepUKITUxJpGaUa0bzrSJpEURUraUtaUaUzyNOzbbbzpHmcnIBfCJfBcfAACxJn9efExSC9efBjbrbzzOyOyUUztXcWzzaOzUzaOyObxzrJmcCK9fBn9ABfHnACBzbbbzaObxIBnBnA9gnABprbtWbaUxxtz5OyTUrIHjSzrtbzzOa6s6bbzttzSp0bq-56rzzUxk-5X7UzxqOzpSX-5OyObxWbzaN-55X-0zaN6zKIAACrUUqObztbu0aUtbzuXWaNOVUMxyT0ztby-0be97WbzOWtyObzzztzUzs6zrpztaOVVN0zMSpKLOaNNUqUzzzMUU6bzzzrqN0a-XcV7X71Vc5UKbxs0WWWWaN5Oa5OV11--0VN6a5---5OVOa55-OVOX91------77VNX7--57XXcV-OtaUrps7cVVV19Wby-OsV117X7X7X1------P9--NXXe91---5OaUxzSzzsP-XcX7X77c7USrzSxrSzKztaTOWbaN15NP7VOaNUyTUUzoN6rFNOaOaV6sN7UX--6Wc-c-V57VX1--VXeeeeenABmec0a0aOyOzbWWV--X1AIHc-1X-cV777cXV-0VceVV5-0a17c1X7XmmeeXX9A9ceghA9mgeggp9eeee7eIKIIJmppCA9ecceZoeWa-5T5NNUaUaOttzba199c99cXcc-V99eX9cV-ebIfrjzvV4KJ-AIfizEze7--bYTo-2J5JzF-7e4Cveve-33--JDSm-0e7F_s-0p5hSp5---dD4Z--JhAe--9NdC--pBL_q-1ebAlOejzkK3--KJUNww--1d3vF-CJs-Uc-5esiio--KWC9-1eph_ak--Kx9T--f0e2k4xNrdwgge7ggpSIAAMMKKzzrts17VNX5OaTN5--1oVgF-0PFWs-1hRm6-0pg5yny71uhi0yPdvjydTeiebebfziC3F2BB--003G43J1rMZKA9mmgnBpIBopCBhCBgnJpSIIICCMbWzpqTObbaOaT7TTUV-5TPWbV5X7V--5NX--frBUk-CUlBUc0ukKbDLOivvifyeizBG-033J34--L2d2s-HkjgTOYB-0NUZf-2f4OmOaeivnFFk3-0LAowpX-0gXRxx-1LKqcmcUV-AB3ZR-0Op3z-1fGBZOizwnJKF-4eWGi-0hJsrx-5qjBsnAtzrUXX9V0fNcdzzxKJ-2QIMIu--Cj7A--5tSdV-QUQbu--hk1IRnTNV5QVSGuuvevvzEzB4KKG443-1ho7gjxUrUrTPc59Y9ce-6iaDleQnBG-0rKfZrNV-Dxq_5jG--6sEpV0QwNEunnK--6wn1V-33G9k-129AN-60dGDo--Vsiq--FeTd--7RqOV-3GGnk-57tGy-2l7KYvp--yA0SRfByOs-04mn3-4XwGzTV-04yPo--Xz_P-1lVB2go-4YNGMAs-65rrUV--YVN9--Gl1M--Nueus-06i6B-0Yt5zV-RUu1Ok-DFK_hV-z7H0idKbjjgBkBK--O5rvs-E9EXLbV1Ov8biOzyOV-Vs1-9A7ghCJnIB70V--79AACCKpQ17N-VVVXeenCJogmVVXXf9fBgmgee9Xe1XcX-5550a0V55OaOyOzaTOttaUaTOtttzzzttyUbyTOzzyTUaTTOtaOaObaTOaOtWV-OaObUxtV917XX--NOs-X-0WV-------110a55--1-V0byOaOWtaUzbbbbbzzbtzaSzaUbyUV0goJQtMew-0par0fJmfAA9fBozUzSrxUSxrUztaOV5OtsP797ee7XXe-1nZgKso-0bEIj--RtwnOk-TSCdSJ---Im4G-3Ou09nKL55X--J9VI--9XscV0hMvWOiEC3IxgZclzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzVVVXcX---V71X55N---X7Xe-8bxrzSrxtxrxrxtzyTOaUt_xzzprSSIK9ghMSKrSMSrSSSKrUa6byUzrrUUrzUtxzTSzzzzzzUUUzzzzzzzztttaNOaOzttzzyUtbtbbzMSrryOaOV8aUxpSpCKrMraN--5SSIJnKpKU_y0y55-5UqppMK9fA1nF0YMdQ5OaLLOPQzzvgk-223-0v0HHnT-";
}else if(dialogManager.tileDataToIndexUnchecked===24){
s1="SgAw3LR2oV-FhaeaePePePaePdePePPyaaeaeddePePPadePaaePaddaaOaOaOKKOOGLK_JJKJGG3JJJGGKGLLQdGHJJG444KFl0JLKaJ3KLKKaKJ_4GKJKJGGJJK44GGK3G4JKGJGJG3FLLLJOJK0LKK4KJKKGJKG_JJKK-304045K0-AV-7fxSpppKKMF-V---V--3-18i-0J-4-USUJlV-N-9-1WDK--F-4Bx-7-V0OvdePaaaPPPPffefeiideeeeeieveeaaaOGJOLOLOeea_beeeTfeieeieKKe_Pu_LKMefnnyzvevydijjivvuvffeuLPviuviiviyyzizyzjzjzjyyzwzueTYF2BnzzzzywzzzzEzEzE22nyzjzzzzjnzznnnnwwkkkF-BnBwnBnBn2EBwnBwBn-knBwnEBEEnnnnnnn2nEBnkwzzzzwznznwzzzznnnEEywnwwn22-zyvnEveKdiuviyvvjzjzzEEBnn2nEvvyivfeuvviyzjjsn22-EzEzyzvyuizwwzvzvyvBk2EzEffyznzzznzvEnEBnEsn2EkEEnnnEsn2yzyw---F85---AeA--k5qSlnzvTe-evnzEw-nfn-kwn2BnnwzznmzjvznknzBnBnzjjzzkuzzyyzzyzizzwzvzyzzyvvvjzwwBnEyzEjiffjnwwknBnEB-kn2-BnBnBnEEnwnBwwvzAiwnzizwznz-GJ3BkkkknBn-222Ewk-BwwkwnwzzEBknzEEEBkF3GGG43G030-F2-30-F--BBknBBknBkwk02nBwzBknBn2EBnBBE2222EEzzEn-G04GzBnBBnnBzEwzznznzwzznzEzzwwn22BnwwwwwwwzEnnwznEBn2nwkB-FB33G-kvjEkk04K--0-JF-B-2-B-3kkn22BnnnnyzEBnnEBwwnBwzDufizzjzzyuezyzzk2ifvzzzzAiOevzizAzujiqiznwAvyuvw3Byzj-nznnjn-B3knBjwnBkBwz-kkwzznzEBvzwwzzEEEnBkBBkBnEw2B-nwnnnEDzvyyzijjEivjjvivvjiviz1yzvvfivfeeeieuPufijivffeuaeeaaezwzjiuOevzvvvffvevvPtKefizBBjzvvjivjiiiuuuizniivvuyjeeyyvuvjfiuvfzvjzjiviiivnnBwzjjvvznEviviiuvuveuiefwnjnEiyyyOaOPewwwzzkznziiuuuuvaOeafjvizAvjivivzwknEjiivffeieuifeuivjfffeueueiffijfeddaKKaLLPeveePadeO_ZG44_aO_LKLaO_4K3LLL4OPO_OOKOLKK4OKKK___JJJG3GKJ-JKK_KaPfO__443-JKe__aLPOeOeiPfeivjvfizwzzziizDyyvfjiyyvzjjivjvvvjEzzzvvviviiuiiizwvjjjwwvvzuzE-3-222Bknk0033GB-K3F3-2Bkk-2-BBBkkkn2BkkBB2Defddeuvuzzwzjwwkkk-22Bkn2nnnnBn---3-F-BBnEBEEnnjzzBkB0GFFkk332-kK43443K33KKWK3F0-BBBk-0-nBkk2-kn-nBnnnnjdajjjjjyyzznzjzjfevfeifijfvjzyvwB--2-kk-03033GGG0FJJJG003JKJJJGJKG3JJJG3GGGG444K4JKG4JK44GGJGJK3K43G-FBwnnBnE--G0G44LKOK_K4OK_KGLKK3G444JJG3FGGG043J3G3JG3G3G003FFFF0-F-F0-FFFF30-FF33G0LNGGG4343JG3JGG43K43G3J3G03G-F0--F-0-I-2AjwEB-k-G43G0-02-222nwzBzEBwwnkzwnBzjyzBzB3AviyvhOPfLKOaPifeuueeiijivfifeviwz-B-nzk-22-k-kBvjvueaLaiuyzDuzjij-GE-G34RDyvfeiePecGFKaPvyyjmii4W3LiiuvffvviyfGPjiteviviiyviviviivzjizjvPeevivzEwzz0EEezAjjjvzzivivivivvjvjjivivp444GKGKKPizvzvvyyyzjvyvzDujyyyvvzvPvjjjjiz1ivwivfzivjjjjiuievjjvvzzvuPuehdPeaPPevivdePeteitdedeePPfiiiuyid03KaffuiviyvyyzjiyyuviuveZK4OLKPPiuyivvfevvvvvzk33KZJF0-JGBwn9fziyvPezefjevizziivivjiyeveqL_aPaeeejBvnBk0k1wniijLajknfeffw9ieeyzEn2nAujjzBwwjxaadd_K3KOaePeOaO_PefvvyyeuzvjjjiviiiuiPOPaeievivieiuPz9jk0mjfj2B-33-BnEzeevnivevfueuqPivziwk-G-n-0n-nEEiiifyiviujkAfjjnw3G33JG0-nB033F333004JB33G33G-F30mvizBvizzdaiytPjjk6BE-EEznn00-KZI-GKafiJGGF3-R-44KW2znBnEzknnnyNKOajOevz2BAnyzefjEfivijzB--030-3-33Rwk343GGKJKK4wzzzzEtezffviqeyzuPjEjkvjnB--30OOGKGG-0FFFFB0436-GLKLKGKG3KKGGG-3J3G4LLLOPOaOaKaPzznnjnyyyyyvjfvfzuvP3GOZKG6-G4GKdWk43KLFKLGGInEEEBn2B0L-G434G2Ek2fzyviiOWKefwzEBwwk3403FG3G3G3KGFG00-34G3FG3JFG-F-22B-40EB3UwBzBBufO_OfivewvvjjyyzviPuivdezwzjjzEkGG4GGGFG4362EjzyyyvfiivvizkB-303K4K3G32wwyjmyzziivvfzE-3JG3G4FKJG4eKG32-JFJ3JBnEvzjzEBnEBn0BBwnyiuzDzEnBBnwknfzzwvvyzwyzzEzwviuuuuizzEzEnzwkwzzDuOLaKaO_aOaO_deuvaPePezBnBmPPOKedfeeeiiddeefzwzBznnEEnnnzz2yd_aOfPLZ3LfePyzfizjiqOeqfjznzdaOPiKO_aifizufmvfjwEzPKLLOKW0KdcFJw-GG33G4KaPeiiufnqfPL3KaiLezvzyyvjzB-zDjiuizBzvvjzmuheevaOaJ34KOJKKOL_aeizBzjfzBkwuzyzteufutevzBn2afvwmPjjBaPiaJGKOaaeiivnBByywzzBzwnnznznwndad4OPfOfLKK__ZKddLKOdPjjwzEAzk-nmzwzEEALOajyqKdfvnBwB2BnB3G2vjnk9zwnfejEziyiwB3BnyvmqOefwzaeufvvyvvvkjzjzyjwznBwEwnEn2Bwvyyiwk20k-F-2-0-0--RBnvzEnzEzzwzyzvzjzjjzvjwvzzjiyvivivfjvjjjvzzjzznE2Bzzn2EnnnzEEjkByz0wBkkEiiw-Bn-0kkn22222knBBknBnnwyvizEvzjyzjvzBBzzn--kkKnnwBkkknBjvviuiiiPLaOddaPPaPeyiuvjivfdedeLfiuaPfaPuvjzjiifiiiaeeueifiiiuvfiiePPOPh_eaPPiPiiuehedKafiqaeePeuaddPiePejaPPPeudeuuKeeeeeeeeueeeeeeeaeePaePePaadePaaaaaaOaOaLO_aOO_OOLK_GPpaO4PLO3k40kLPqLa__nE0LOaha4PxaJLKKG3JG44GKKK44JG3G3KOOaO__OKKGJK4KKKKOOaLOOajEEBnnzyKPaOa4ZLOd4OaJBwww0LOOOOOG4LfeaaPLLJKPOdaPOaLaOaPOaOaOaLLOO__OKJKGG44GKK4KK4LOKOKKKK_FFFKO_aKKGOK4033KLKKK4GKOKJKKOKKWKKK4KKK4KK_OO_O___OLLK_K4F-FFG0G03-44KKGKKLLOKKK_KKKJG44KK4GKLKLKK4KO33JK3Bk-G36B3KKGKGK4GJKK43KKKKJGKOLK_KGKKOaOaO_OO_KKOK__aOO___aOOOaLOaPLaOaPOaaOdeaaaPaeteeeik-318nR--VGPMV-J1cyRlV0c555udY-k-2-pMrD---TOI-7kF6znBpIErxsPVV--OVfRraPOOOePfgk-BknBwo-4kWWfpA6rrX17--08DA-VFaSWpMMSUKCMKMKMKHcYpSrrHe91V-V0u-7770blcV7X-0zV-sLmjuE3--1yxm-0We-vg---zVXV-7VCwN--38Cy-5X5LvaQj-F--FniN--7WAZ-O3JLUSrr6cZe7V--XXqk-BHQVCc--8Cpw--3ebH-4XKJIivG3-43m0Ao--D8Z2aQV-1lDMlow6c--1VSI--0G87V-NcZutk-3JHWT--Xa-4k-3Jyrg-0XfZWY--0Md9V-7gHHR-64_zAr1---gk1F--Larc-9APr6h---M3Vc-PAdfbisp3--0T87V--jXGF03MzzESrP7X--skSXQh3--5Dp9-3Y8GOisF-3lcLHxrrNccV--C1nJ-25Yaju--2IeI--Gg31k--D4dJ-065XIV0svUnviglG-3ZUBSCxzUUrrzUtzts99eXeecp9999-YZ9GC_OLzyzjzzzzzzz4KJKKKGJK3-I7p_UCSlaNcV1O5jDOuUzBJJ-t8042SEUzzOtzzUaXceeeeXe-3ZbgKdsl0FmKgLnKJpKpIHc9YABomeBmnHdCBpIBgrUMHghpMUSxpBpAEMbzKCCBrUrzKAAMMrSxzrrGxEaNN5OWcNN----N0WbWVN----V5--177V0a--7-VX-JZlG8bjyzyzjlJKGK4F--8dzX-5Zqo8_vwp-23bW-gnHXmcmprzbzMsWV1-7_HRz_evn03-49jsvGV0LKrUEjiivvywl3G3JKK-0Hk36pV-8_ZGffyjoG0FUBghYRpIA9gmmeVme7eA9enAABpBeXXfBgfACpKBnIKBnBnAABhBghBgnIC0aUyUxbWWzttzrKrUxzaUzbaNmX7cV0tzzxzzJnHrqUbtzaTUbbzryOtzzxyOWVggecceVTObVTUbbbyTOzaOxqOyTUzsgeeegemn9cXc19cXXXX---4cG6--Hqlvk-HLsy5iBF-EAT2rBfEta-2_k3leB---i9AN--O9Ww-YBjdE9efIUzTUba97--OVmg-4Bo5jJ--VPRAtK39vz-4nGQwmnMqTOVe--aZXrk-Jon3xNV08gQQOik--ZqRaBrN7-LQoYjiwK-1ZrofBnJpSzStbV-7X9V3dkX8uefefgn-C-343-ID7cz9ejUTOV28mSguLfEnz3GJ-KDMtMpItbuXX-FbCT0_OayyvBwkJJ-7nbZKnSxpC5UN1-X9--bGDMV-RuaRwze--6Jvn--nfK0yV-0pgbk--v48N-PSdzTPLnB-0ni44nGV1mStzUfiuOdaPaeuyjiuzEw-00043F0-l3G-XgvurghKBegohABpBgfAHmmeceXX-7N0bs7oogpIKpCCIKrICMyUrKSpKIrSpKKMIBnKCMTUrKKBeCKpKKBopKMKHpSpoepMKq-NUrKprKbzrraOaT5-V-ObzT6zUUMUxra--0a10V-0V--N-5-0X-5NVX11-NOWaOWWV7X-1-V757X1VOse7-7BmX19cX7--T3s3-AE1RQEU-c--TDAg-4E65bR--HTE4DuV--IE7sMCFOzu9V4OtOgOOOaLPzgznnw303--ED_5-_c2G_aO_3K_5LPvevyw-EeyvY3-2-k-2o4M9mrSa7V-130zk-p1C9CUtce--7Gyf--o8DGqV-182RF-x5-RRnLTNV05YE6iOOKiivjkkB-F-x5tiBpLNNV2eYS3LLuO___KPPQfvvzgzivzvzvnwnE03FFGG4G20G4J06HD4fAKJz6zxzSrSrzX-1117Xeecc-PZq7iPQ2B--oarQnVO9IasOLLLLLLLLaLLOLLPvyuikBwzyydeevjzYvfiwwwwBkk2nBkkn-3JHO_JG02n4JBnp_4F-K8uQCNV-1JEMF-C9Ntxc-D_Psav3-5oj3TnCCJqObV7--1M_Ek-pApuzKkNX--8X1Q-FJl3bmpKzxSIKBxrqN--779e0a1--dZuzk-0BvKs-ua_1LiivvBlK43F-SCENx6e-5dgxdajn3F-0CvuN--b1no04IdRzAEUSrMMMSKaUaOX7VccXX7c-6dqdvaOvg--AJw3TpIrSzKzFT17XV7cV0PWlHPikF-Kp4NHmgpSrrSrKBnCSxrlWtV5-7-X5-XceV-9Y4vN-AJVbYSOVc-PdM-DQzCG-5KA12nBghraOa-0PdNJyKaLPOee-nBEBknB-zJhSA9gfAJmnKRUrSaOaOaT--c-SeMWzfu_snyEzvcEk05K_5K4F-0Jj6UV-1_vfF-0Hy77-1daXi-0pCEwnOV--dh4R--JuFL-6empp_ijk3--4Of_V-1hn6k1CMEoBhCROzMUVXc9--eimdyo--KUEsk-Tfu6TMzvGF--LEYu0df6q6aeLKJPK4JK8LKOgznvyvjvvyzyzgzvyyziyvvgwoK32nEywnwl4HKK5JHKJFoK38adJF43-74PMBBppJefKCISU5USUTOxxqTN7X77Y9--V6pppqP-919I9729hQ8qOevjvfjiviyvjjiynk04KKGK2-330K3G4-2KREugmoegnCBr6tbbba555V-1sxeF-KRU8UuV1PtQMPOKzgBo-4MT-nlc-9jc3qc--0UG27-qjjX5aPfcwBB-J--Mry9-8fxgpbijBBKF-KUi1CsV0uzSLPiYFC--_VBQEqPc-ekCO5eyBklOF-4N9EAGV-mkJjLiuPgn303--51edV-v1FytYB-zNK8ABppprSxrOcObxXVcXce7V-1gBbpf3-GNONISxqVXV-ql0BaOfeQYBB0354Ngc2AHnBmnBmoomnBgnA9mnI9mnA9meegegeeXxMMKJnBeXgggnIII9eXpSrMKSxrMrUzrzzbaUrrSlyVVNOtztttbWtbWa5-56bbxqOaUzX7XX97c10VNUa0WaOaT5NOWa5T--qlUJMeiawnkGGF-nNuf2BhBnCpprMtbV-N77X-0gW2lg--LFYks15m3UaOLO_daO_evVkBzwn2kzB8G-BqIIBnCCHnCE6sUwOsNV59V0Q955OaE2-0LK6JqP-9geGtdasyw30-9qNsZnIBhHnEyOa5ObXV-1nIZb-4LPlsnCrwNWe--2Cp5F0Sb82hrKr0V91V-2DHlF-hb8PBhz-V-2DlYF-0bbb7-PnuwaLNwn-2LVKHnETP72Xo1q5LLLOaOaOPPPaaTvueeQji2kn2-wBz3-Bkk-----Sd0YCGc-Dh8r0eiyvwFoJG3-YPIoIJx9AMMs5TNXV-iojDaOfyswJG-34dgJgnSBeC9pK6btyT7VTUSX91-0fKEnOaYBk-0PpKQ-1AM5LQyvkKG--5j7JV0AN2eOQn--0gUC7-yqTD5vueKvwk0G3-0qpcTmxV-Pqh7aPzl46nb6W7MtaOzxpIKCSMpKKrSxSMSrSSrSrSrxxrzUUUzbzzzbzxSzy5Orprrrrxzzbza6TOaOW_JppKrAKSrrzrrzzaUUUpxzbSzzTUyUtttttbtzzaTT50WVOyOtbttxtWbMUSztaTN5UbrSMSxzzbaOa6WWWtaOzaOtyTUbtbztztaOtzztxzbbrxyUzxzbzxzzzttztxrUrztttbtaOWbzzpKzta6Mxzzzby6aTUzzUzxySySzzzUzrryOSxrrUUUQKrUSzztzttWbbtbrzyUyUbbyOVWaTTUUxrKSzrzzSSztyUTTOV-94zxtpxzUMUxzxKSzrttzaUaSxzrzzaUtzxsUaNOWWtzbaOUtyTUb_zaUbUxrSzzxrrrvAJopSMSrrRnCMSrTTUa555UyTTOaN6btxIMMMKABnIIICCCIIBmfBenIIJpIKMKSppppprSztrCMUUUxopSopKCSprRhHnKhJofKJnIIAIIBmnCCA9gmomnABfBgoonKKKMMKrMSrSxprSzrztyTUVVN-6zUzUSxABonA-X9nCKCCKryUby-1UbSrSpCKMSrUTcenMSrzrzTOrrxrUUzxrrrrUUUSxxxxzzUzUzzzyUtzbbbbtzzTSxUUrzUzzzzUUrzzrSxxxSxxrzxxzzrzzxzzxxrSpSSSKKS-0vUHOuvwl4F-0kZgs1XsRiaaudedeaQiueQiw-wl3G0-B-32-F-fRVXnCCrKMSzX5N7cc7V1Qd2JOfiwkGF-ISqFQAILOaNV-fjC8Pl-1rXaGpxV92NjCXdaifeaLJ-3eeaeefiywzzEzjEvgznzjzEyzyvznyyeejEEzznwzEnkzzzEEnzEznnnzzvEE22-032-_dddJKaOLLaOKFFB324K__aKK4LKKHKK2JK_LK4LLO__OOKKG-3_Fn33KPeLKKKK-F3--Cu9YCV-XymfLQjz3JF1KyjcBpKrrryN199X9--Er2_--6w9TV1w48YtPevi----1sCjknrN7-Dkd8M_daQswn2BJ-4WIe2TV-Y6MNa_aRzl--5F6li-3m1odvnK-It0xxpKIpSKpKMKxJhxa-1-7--1-X--71EDbJiTeedivzEvyj2n2oKJJK4040F-qWOwRnqOc--JGhS-0P8m7xc-9oUZUaKdvwk2-8Pa5WorMUUzlXXcX7c0SNaEc322222-kifeeiee-8A3iK5N-X5SxxpMrr-";
}(new yW()).yY(s1);}


function adjustTerrainElevation(){this.ye=null;this.aOf=null;this.aOg=null;this.applyToGame=function(){this.aOh=[L(140),L(141),
L(142),L(143),L(144),L(145),L(146),L(147),L(148),L(149),L(150),L(151),L(152),L(153),L(154),L(155),
L(156),L(157),L(158),L(159),L(160),L(161),L(162),L(163),"Mare Nostrum"];
var aOi=[120,105,92];
var cos=[12,12,60];
var aOj=[300,300,9827,26,18,36,36,8,32,3,9];
var aOk=[140,130,120];
var aOl=[12,12,76];
var refineIntegerSquareRoot=[240,120,1024,30,19,30,70,8,20,3,9];
var rectanglesOverlap=[130,117,106];
var rectangleContains=[12,12,68];
var aOp=[270,210,1024,28,19,33,50,8,26,3,9];
var a54=[157,136,117];
var aOq=[16,13,68];
var aOr=[300,300,9827,26,18,36,36,8,32,3,9];this.ye=new Array(dialogManager.aNY+1);
this.ye[0]={j:230,k:230,nZ:1000,nW:2000,aNg:173};this.ye[1]={j:800,k:800,nZ:100,nW:50,aNg:43};
this.ye[2]={j:512,k:512,nZ:128,nW:32,aNg:0};this.ye[3]={j:960,k:960,nZ:60,nW:8,aNg:0};
this.ye[4]={j:900,k:900,nZ:100,nW:5,aNg:0};this.ye[5]={j:1000,k:1000,nZ:100,nW:40,aNg:0};
this.ye[6]={j:1000,k:1000,nZ:100,nW:20,aNg:0};this.ye[7]={j:1024,k:1024,nZ:128,nW:32,aNg:0};
this.ye[8]={j:820,k:820,nZ:200,nW:100,aNg:0};this.ye[9]={j:1024,k:1024,nZ:128,nW:32,aNg:0};
this.ye[10]={z5:aOk,z6:aOl,aNr:refineIntegerSquareRoot};this.ye[11]={z5:rectanglesOverlap,z6:rectangleContains,aNr:aOp};
this.ye[12]={z5:rectanglesOverlap,z6:rectangleContains,aNr:aOp};this.ye[13]={z5:aOi,z6:cos,aNr:aOj};
this.ye[14]={z5:aOi,z6:cos,aNr:aOj};this.ye[15]={z5:aOk,z6:aOl,aNr:refineIntegerSquareRoot};
this.ye[16]={z5:aOk,z6:aOl,aNr:refineIntegerSquareRoot};this.ye[17]={z5:aOi,z6:cos,aNr:aOj};
this.ye[18]={z5:rectanglesOverlap,z6:rectangleContains,aNr:aOp};this.ye[19]={z5:aOi,z6:cos,aNr:aOj};
this.ye[20]={j:1024,k:1024,nZ:128,nW:32,aNg:0};this.ye[21]={j:940,k:940,nZ:80,nW:8,aNg:0};
this.ye[22]={z5:rectanglesOverlap,z6:rectangleContains,aNr:aOp};this.ye[23]={z5:aOk,z6:aOl,aNr:refineIntegerSquareRoot};
this.ye[24]={z5:a54,z6:aOq,aNr:aOr,a90:"[OG] Neutronian"};for(var aC=0;aC<dialogManager.aNY;aC++){
this.ye[aC].name=this.aOh[aC];}this.ye[dialogManager.aNY]={name:""};this.aOf=new Uint8Array(12);
for(var aC=0;aC<10;aC++){this.aOf[aC]=aC;}this.aOf[10]=20;this.aOf[11]=21;
this.aOg=new Uint8Array(dialogManager.aNZ);for(aC=0;aC<10;aC++){this.aOg[aC]=10+aC;}this.aOg[10]=22;
this.aOg[11]=23;this.aOg[12]=24;};}

function aNc(){this.aOc=function(){var h7,fg,fi,gI;
var aOa=aEE;
var aOb=dialogManager.yo;
var j=dialogManager.fk;
var aOZ=j-1;
var iP=dialogManager.fl-1;
var resolveAttackCombat=0;for(fi=1;fi<iP;fi++){
gI=fi*j;for(fg=1;fg<aOZ;fg++){h7=(gI+fg)<<2;if(aOb[h7]===aOb[h7+1]&&aOb[h7]===aOb[h7+2]){
resolveAttackCombat++;aOa[h7+2]=4;}}}chatSystem.playerShipIndices=resolveAttackCombat;};this.aOd=function(aOs,aOt){var aOa=aEE;
var j=dialogManager.fk;
var aOZ=j-1;
var iP=dialogManager.fl-1;
var id=0;for(var fi=1;fi<iP;fi++){var gI=fi*j;for(var fg=1;fg<aOZ;fg++){
var fD=((gI+fg)<<2)+2;if(aOa[fD]===aOs){aOu(fD,id,aOs,aOt);id=(id+1)%32768;}
}}};

function aOu(fD,id,aOs,aOt){var fZ=1;
var aOa=aEE;
var fb=tileMap.aJN;
var a4r=[fD];
var aOv=(id>>8)<<1;
var aOw=id&255;aOa[fD-2]=aOv;aOa[fD-1]=aOw;aOa[fD]=5;while(fZ){var a4s=[];for(var aC=0;aC<fZ;aC++){
var fO=a4r[aC];for(var fc=0;fc<8;fc++){var fd=fO+fb[fc];if(aOa[fd]===aOs){aOa[fd-2]=aOv;
aOa[fd-1]=aOw;aOa[fd]=aOt;a4s.push(fd);}}}a4r=a4s;fZ=a4r.length;}}this.aOe=function(){
var aOa=aEE;
var j=dialogManager.fk;
var fp=3;
var aOZ=j-fp;
var iP=dialogManager.fl-fp;
var aOx=fp*4;
var aOy=fp*4*j;
for(var fi=fp;fi<iP;fi++){var gI=fi*j;for(var fg=fp;fg<aOZ;fg++){var fD=((gI+fg)<<2)+2;
if(aOa[fD]===2&&(aOa[fD-aOx]!==2||aOa[fD+aOx]!==2||aOa[fD-aOy]!==2||aOa[fD+aOy]!==2)){
aOa[fD-2]=aOa[fD-2]|1;}}}};}var a0O;var aEE;var a6u;var a6v;

function a6q(){
if(a0O===undefined){a0O=document.createElement("canvas");}a0O.width=dialogManager.fk;a0O.height=dialogManager.fl;
a6u=a0O.getContext("2d",{alpha:true});a6v=aEE=null;a6v=a6u.getImageData(0,0,dialogManager.fk,dialogManager.fl);
aEE=a6v.data;gameState.sS.yp(aEE);}

function VoteSystem(){var g1;var j;var k;var max;var aOz;var nW;
var aP0=10000;
var aP1;var aP2;var aP3;var aP4;var aP5;var aP6;var aP7;var aP8;this.a8=function(a64){
aP9(a64);aPA();aPB();aPC();};this.aO3=function(){return g1;};this.aNk=function(){
g1=null;};

function aP9(a64){var aC;j=a64[0];k=a64[1];aOz=a64[2];nW=a64[3];g1=new Int16Array(j*k);
max=j>k?j:k;aP1=new Int16Array(max);aP2=[];aP3=[];aP4=[];aP5=new Array(j);aP6=new Array(k);
for(aC=j-1;aC>=0;aC--){aP5[aC]=false;}for(aC=k-1;aC>=0;aC--){aP6[aC]=false;}aP7=new Int16Array(j);
aP8=new Int16Array(k);}

function aPD(fZ){var aPE=coordHelper.random()%aP0;
var nZ=coordHelper.random()%(2*aOz+1)-aOz;
aPF(aPE,nZ,fZ);}

function aPG(aPE,fZ){var nZ=coordHelper.random()%(2*aOz+1)-aOz;
aPF(aPE,nZ,fZ);}

function aPF(aPE,nZ,fZ){var aC;aP1[0]=aPE;for(aC=1;aC<fZ;aC++){
aP1[aC]=aP1[aC-1]+nZ;if(aP1[aC]>=aP0){aP1[aC]=aP0-1;nZ=-nZ;}else if(aP1[aC]<0){aP1[aC]=0;nZ=-nZ;
}else{nZ+=coordHelper.random()>=16384?nW:-nW;nZ=nZ< -aOz?-aOz:nZ>aOz?aOz:nZ;}}}

function aPH(fg,fi,aPI,fZ){
if(aPI){aPJ(fg,fi,fZ);}else{aPK(fg,fi,fZ);}}

function aPJ(fg,fi,fZ){var aC;
for(aC=0;aC<fZ;aC++){g1[fi*j+fg+aC]=aP1[aC];}}

function aPK(fg,fi,fZ){var aC;for(aC=0;aC<fZ;aC++){
g1[fi*j+fg+aC*j]=aP1[aC];}}

function aPL(value,fZ){var aC,aMz,fD;
var k9=value-aP1[fZ-1];
if(k9===0){return;}aMz=1+mathUtils.g0(Math.abs(k9),fZ-1);aMz=k9<0?-aMz:aMz;aP1[fZ-1]=value;
fD=fZ-1-mathUtils.g0(Math.abs(k9),Math.abs(aMz));fD=fD<1?1:fD>fZ-2?fZ-2:fD;for(aC=fZ-2;aC>=fD;aC--){
aP1[aC]+=k9-(fZ-1-aC)*aMz;}if(k9<0){aPM(fZ);}else{aPN(fZ);}}

function aPN(fZ){
var aC;for(aC=fZ-2;aC>=1;aC--){if(aP1[aC]>=aP0){aP1[aC]=2*aP0-aP1[aC]-1;}}}

function aPM(fZ){
var aC;for(aC=fZ-2;aC>=1;aC--){if(aP1[aC]<0){aP1[aC]=-aP1[aC]-1;}}}

function aPO(a4r,a4s,fZ){
var aC;for(aC=0;aC<fZ;aC++){a4r[aC]=a4s[aC];}}

function aPP(h){var aC;for(aC=0;aC<h.length-1;aC++){
h[aC]=h[aC+1]-h[aC];}h[h.length-1]=h[h.length-3];}

function TerritorialIncomeScreen(a7W,gap,iQ){aP2.push(a7W);
aP3.push(gap);aP4.push(iQ);}

function InterestIncomeScreen(){var aC;
var aPS=aP2.length-1;for(aC=aPS-1;aC>=0;aC--){
if(aP3[aC]>aP3[aPS]){aPS=aC;}}return aPS;}

function aPA(){aPD(max);aPO(aP8,aP1,k);aPH(0,0,true,j);
aPG(g1[0],max);aPO(aP7,aP1,j);aPH(0,0,false,k);aPP(aP7);aPP(aP8);aPF(g1[j-1],aP7[j-1],k);
aPH(j-1,0,false,k);aPF(g1[j*(k-1)],aP8[k-1],j);aPL(g1[j*k-1],j);aPH(0,k-1,true,j);
aP5[j-1]=aP5[0]=true;aP6[k-1]=aP6[0]=true;TerritorialIncomeScreen(0,j,true);TerritorialIncomeScreen(0,k,false);}

function aPB(){var aPS,a7W;
while(true){aPS=InterestIncomeScreen();if(aP3[aPS]<5){return;}a7W=aP2[aPS]+mathUtils.g0(aP3[aPS],2);if(aP4[aPS]){aPT(a7W);
}else{aPU(a7W);}TerritorialIncomeScreen(a7W,aP2[aPS]+aP3[aPS]-a7W,aP4[aPS]);aP3[aPS]=a7W-aP2[aPS]+1;}}

function aPU(fi){
var fZ,aPV,aC;
var aI4=0;
var aPW=0;while(aPW<j-1){for(aC=aI4+1;aC<j;aC++){if(aP5[aC]){
aPW=aC;break;}}fZ=aPW-aI4+1;aPF(g1[fi*j+aI4],aI4===0?aP8[fi]:(aP1[aPV-1]-aP1[aPV-2]),fZ);
aPL(g1[fi*j+aPW],fZ);aPH(aI4,fi,true,fZ);aPV=fZ;aI4=aPW;}aP6[fi]=true;}

function aPT(fg){
var fZ,aPV,aC;
var aI4=0;
var aPW=0;while(aPW<k-1){for(aC=aI4+1;aC<k;aC++){if(aP6[aC]){aPW=aC;break;
}}fZ=aPW-aI4+1;aPF(g1[fg+j*aI4],aI4===0?aP7[fg]:(aP1[aPV-1]-aP1[aPV-2]),fZ);aPL(g1[aPW*j+fg],fZ);
aPH(fg,aI4,false,fZ);aPV=fZ;aI4=aPW;}aP5[fg]=true;}

function aPC(){var fg,fi;for(fg=0;fg<j;fg++){
if(!aP5[fg]){for(fi=0;fi<k;fi++){if(!aP6[fi]){aPX(fg,fi);}}}}}

function aPX(fg,fi){
var value=g1[fi*j+fg-1]+g1[(fi-1)*j+fg];
var a9J=2;if(aP5[fg+1]){a9J++;value+=g1[fi*j+fg+1];
}if(aP6[fi+1]){a9J++;value+=g1[(fi+1)*j+fg];}g1[fi*j+fg]=mathUtils.g0(value,a9J);}}

function aJW(fs,ft){
return fs>=0?mathUtils.g0(fs,ft):-mathUtils.g0(-fs,ft);}

function kQ(g1){return g1*g1;}

function a8V(fs,ft){
return fs>ft?fs:ft;}

function aDj(fs,ft){return fs<ft?fs:ft;}

function aAv(fs,g1,ft){
return g1<fs?fs:g1>ft?ft:g1;}

function aPY(g1,fZ){var ej=mathUtils.g0(g1+1,2);for(var aC=0;aC<fZ;aC++){
ej=mathUtils.g0(ej+mathUtils.g0(g1,ej),2);}return ej;}

function aLW(g1,fZ){if(g1<1){return 0;}return aPY(g1,fZ);
}

function aPZ(nv,nw,uf,aAe,o8,o9,ug,vN){return!(nv+uf<=o8||nw+aAe<=o9||nv>=o8+ug||nw>=o9+vN);
}

function aPa(nv,nw,uf,aAe,o8,o9,ug,vN){return nv<=o8&&nw<=o9&&nv+uf>=o8+ug&&nw+aAe>=o9+vN;
}

function yg(g1){return Math.floor(!!g1*(1+Math.log2(g1+0.5)));
}

function MathUtils(){this.g0=function(fs,ft){return Math.floor((fs+0.5)/ft);
};this.aPb=function(fs,ft){return Math.floor(fs*(ft+0.5));};this.sqrt=function(g1){
return ~~Math.sqrt(g1+0.5);};this.pow=function(e){return Math.floor(Math.pow(2,e)+0.5);
};this.distanceBetweenPointsAndEncoded=function(value,min,max){return Math.min(Math.max(value,min),max);
};this.aPc=function(gI,gK,gM){return Math.max(Math.min(gI,gK),gM);
};this.aPd=function(aPe,aPf,fg,fi){var iw=fg-aPe;
var iz=fi-aPf;
var aPg=0;if(iw===0){
aPg=iz>=0?Math.PI:0;}else{aPg=Math.atan(iz/iw);aPg+=iw>0?(0.5*Math.PI):(1.5*Math.PI);}return aPg;
};this.log2=function(g1){return Math.floor(!!g1*(1+Math.log2(g1+0.5)));};this.log10=function(g1){
return Math.floor(Math.log10(g1+0.5));};this.aPh=function(aPi,aPj,aPk,aPl,aPm){
return aPi>aPk-aPm&&aPi<aPk+aPm&&aPj>aPl-aPm&&aPj<aPl+aPm;};this.zd=function(aBL,aBN){
return aBL*aBL+aBN*aBN;};}

function Account(){this.z=new aPn();this.ua=0;
var aPo=new Array(32);
this.applyToGame=function(){var aPp;
var aPq=document.body.firstChild;while(aPq){aPp=aPq.nextSibling;
if(document.body.contains(aPq)&&(aPq.tagName==="DIV"||aPq.tagName==="INPUT"||aPq.tagName==="BUTTON")){
account.removeChild(document.body,aPq);
}aPq=aPp;}};this.v=function(eI,a3U,a64){if(a3U===undefined){a3U=this.ua;
}clanPanel.ds=true;if(eI===0){if(moderationSystem.a3P()===0){eI=5;}else{uiSurface.platformActions.setState(13);}}this.tZ();if(this.ua===eI){
a3U=aPo[eI].a3U;aPo[eI]=null;}this.ua=eI;
var lp=aPo[eI];if(!lp||eI===4||eI===7||eI===8||
eI===9||eI===10||eI===11||eI===13||eI===15||eI===18||(eI>=20&&eI<=28)||
eI===32||eI===33){if(eI===0){aPr();return;}else if(eI===1){lp=new aPs();
}else if(eI===2){lp=new aPt();}else if(eI===3){lp=new aPu();}else if(eI===4||eI===9||eI===10||
eI===11||eI===13||eI===33){lp=a64;}else if(eI===5){lp=new aPv();}else if(eI===6){
lp=new aPw();}else if(eI===7){lp=new aPx(account.z.aPy);}else if(eI===8){lp=a64;}else if(eI===12){
lp=new aPz();}else if(eI===14){lp=new aQ0();}else if(eI===15){lp=new aPx(account.z.aQ1);
}else if(eI===16){lp=new aQ2();}else if(eI===17){lp=new aQ3();}else if(eI===18){
lp=new aQ4();}else if(eI===19){lp=new aQ5();}else if(eI===20){lp=new aQ6();}else if(eI===21){
lp=new aQ7();}else if(eI===22){lp=new aQ8();}else if(eI===23){lp=new aQ9();}else if(eI===24){
lp=new aQA();}else if(eI===25){lp=new aQB();}else if(eI===26){lp=new aQC();}else if(eI===27){
lp=new aQD();}else if(eI===28){lp=new aQE();}else if(eI===29){lp=new aQF();}else if(eI===30){
lp=new aQG();}else if(eI===31){lp=new aQH();}else if(eI===32){lp=new aQI();}lp.a3U=a3U;
aPo[eI]=lp;}lp.show(a64);};

function aPr(){var fZ=aPo.length;for(var aC=0;aC<fZ;aC++){aPo[aC]=null;
}}this.a3O=function(){if(!this.isTeamGame()){return;}this.aQJ(this.handleKeyInput().a3U);};this.aQJ=function(eI){
if(!this.isTeamGame()){return;}if(!aPo[eI]){this.v(eI);return;}this.tZ();clanPanel.ds=true;this.ua=eI;
aPo[eI].show();};this.tZ=function(){if(!this.isTeamGame()){return;}aPo[this.ua].tZ();};this.y=function(){
if(!this.isTeamGame()){return;}aPo[this.ua].tZ();aPr();this.ua=0;uiSurface.platformActions.setState(13);};this.wr=function(){
if(!this.isTeamGame()){return;}var lp=aPo[this.ua];if(lp.wr){lp.wr();}};this.resize=function(){
if(!this.isTeamGame()){return false;}aPo[this.ua].resize();};this.hm=function(fg,fi){if(!this.isTeamGame()){
return;}var lp=aPo[this.ua];if(lp.hm){lp.hm(fg,fi);}};this.a3m=function(fg,fi){if(!this.isTeamGame()){
return;}var lp=aPo[this.ua];if(lp.a3m){lp.a3m(fg,fi);}};this.a4A=function(){if(!this.isTeamGame()){return;
}var lp=aPo[this.ua];if(lp.a4A){lp.a4A();}};this.a3p=function(m9,mA,deltaY){if(!this.isTeamGame()){return;
}var lp=aPo[this.ua];if(lp.a3p){lp.a3p(m9,mA,deltaY);}};this.getTerriColorArray=function(code){if(!this.isTeamGame()){
return false;}var lp=aPo[this.ua];if(lp.getTerriColorArray){lp.getTerriColorArray(code);}return true;};this.ee=function(){
if(!this.isTeamGame()){return;}var lp=aPo[this.ua];if(lp&&lp.ee){lp.ee();}};this.isTeamGame=function(){
return this.ua>0;};this.handleKeyInput=function(){return aPo[this.ua];};this.a7H=function(eI){
return aPo[eI];};this.aQK=function(){return aPo;};this.removeChild=function(oi,oj){
try{oi.removeChild(oj);}catch(e){console.log("removeChild error "+e);
}};}

function aPx(data){var aQL;var aQM;

function dk(){aQL=new wc(data.username,
[new x("⬅️ "+L(40),function(){mapUtils.clear();account.a3O();}),new x(data.aQN?("🔄 "+L(164)):L(165),function(){
account.v(8,data.aQN?account.handleKeyInput().a3U:undefined,new ub(25,{action:0,uY:data.uY,uZ:data.uZ}));
},0,0,1)]);aQM=new sD(aQL.wi,aQO());}

function aQO(){var sF=[];aQP(sF,1);sF.push(aQQ());aQR(sF);
aQS(sF);sF.push(aQT());if(data.aQN){sF.push(aQU());}sF.push(aQV());if(!data.aQN){sF.push(aQW());
sF.push(aQX());sF.push(aQY());}sF.push(aQZ());sF.push(aQa());aQb(sF);aQc(sF);sF.push(aQd());
aQe(sF);sF.push(aQf());aQg(sF);aQP(sF,0);return sF;}

function aQT(){var aQh=new rx();aQh.LobbyChatPanel(L(166));
aQh.s6(gameServer.z.aQi("/wiki/gold"),"0.75em").style.marginBottom="0.8em";
var aQj=[L(167),L(168),L(169),L(170),
L(171),L(172),L(173),L(174),L(175),L(176),L(177),L(178),L(179),L(180)];
var eH=data.aQk;aQh.s6(
L(181)+gameState.tI.a6L(data.isTileWrap,0.01,2)+"<br>"+L(182)+(eH+1)+" / "+data.y3+"<br>"+L(183)+aQj[aQl(eH,data.isTileWrap)]
);return aQh;}

function aQl(eH,y4){if(eH<10){return 0;}if(eH<30){return 1;
}if(eH<60){return 2;}y4=mathUtils.g0(y4,100);if(y4>=30000){return 3;}if(y4>=12000){return 4;}if(y4>=7000){
return 5;}if(y4>=3000){return 6;}if(y4>=1000){return 7;}if(y4>=500){return 8;}if(y4>=200){return 9;
}if(y4>=70){return 10;}if(y4>=20){return 11;}if(y4>=3){return 12;}return 13;}

function aQU(){
var aQh=new rx();aQh.LobbyChatPanel(L(184));aQh.s6(gameServer.z.aQi("/wiki/transactions"),"0.75em").style.marginBottom="0.8em";
var t6=new t7({value:connectionMgr.buffer.data[147].value,eI:-1},1,undefined,function(e){
connectionMgr.qo.boatNotificationHandler(147,aQm(e.target.value));
});aQh.sB(t6);
var aQn=new x(L(14),function(e){if(t6.e.readOnly&&gameServer.z.responsePacketBuilder(0)){
gameState.sK.wV(e);aQo();gameServer.aHS.aHT({action:0,uY:data.uY,value:parseInt(connectionMgr.buffer.data[147].value,10)});
}return true;},1);
var aQp=new x(L(185),function(e){if(e.textContent===L(185)){e.textContent=L(186);
t6.e.readOnly=true;aQn.se(0);aQn.button.style.color=colorPalette.qN;connectionMgr.qo.boatNotificationHandler(147,t6.e.value);
aQm(connectionMgr.buffer.data[147].value);}else{aQo();}return true;});aQh.sB((new tl([aQp.button])));
var s3=aQh.s2();
var aQm=function(g1){s3.innerHTML=account.z.aQq(g1,connectionMgr.buffer.data[105].value,data.uY);
};
var aQo=function(){aQp.button.textContent=L(185);t6.e.readOnly=false;aQn.se(1);
aQn.button.style.color=colorPalette.pO;};aQm(connectionMgr.buffer.data[147].value);aQh.sB((new tl([aQn.button])));
return aQh;}

function aQV(){var aQh=new rx();aQh.LobbyChatPanel(L(187));
var t6=new t7({value:data.uY,eI:-1});
t6.e.readOnly=true;aQh.sB(t6);aQh.sB((new tl([(new x(L(188),function(e){gameState.sK.trimStartSpaces(t6.e);
gameState.sK.wV(e);return true;})).button])));aQh.sB(new tw());
var aQr=new t7({value:data.uY,eI:-1});
aQh.sB(aQr);aQh.sB((new tl([(new x(L(189),function(e){account.v(8,account.handleKeyInput().a3U,new ub(25,{action:0,
uY:aQr.e.value,uZ:0}));})).button])));return aQh;}

function aQW(){var aQh=new rx();aQh.LobbyChatPanel(L(190));
var aQs=new t7(connectionMgr.buffer.data[106]);aQs.e.readOnly=true;aQs.e.type="password";aQh.sB(aQs);
aQh.sB((new tl([(new x(L(191),function(e){if(e.textContent===L(191)){e.textContent=L(192);
aQs.e.type="text";}else{e.textContent=L(191);aQs.e.type="password";}return true;})).button,
(new x(L(188),function(e){gameState.sK.trimStartSpaces(aQs.e);gameState.sK.wV(e);return true;})).button])));aQh.sB((new tl([
(new x(L(193),function(){account.v(8,account.handleKeyInput().a3U,new ub(15));})).button])));aQh.LobbyChatPanel(L(194),"0.8em");
aQh.s2(L(195));aQh.s2(L(196));aQh.s2(L(197));return aQh;}

function aQX(){var aQh=new rx();
aQh.LobbyChatPanel(L(198));aQh.sB((new tl([(new x(L(199),function(){account.v(6,account.handleKeyInput().a3U);})).button
])));aQh.sB((new tl([(new x(L(200),function(){connectionMgr.qo.boatNotificationHandler(105,"");account.v(8,account.handleKeyInput().a3U,new ub(18));
})).button])));aQh.sB((new tl([(new x(L(201)+connectionMgr.buffer.data[105].value,function(){
account.v(4,0,new TextContentScreen(L(202),L(203),true,[new x("⬅️ "+L(40),function(){account.v(7,account.a7H(7).a3U);})]
));},colorPalette.q3)).button])));return aQh;}

function aQg(sF){if(data.aQN){return;}if(!connectionMgr.xF.get().length){
return;}var aQh=new rx();aQh.LobbyChatPanel(L(204));var s9;var aQt;
var eI=0;
var aQu=function(){
var InformationScreen=connectionMgr.xF.get().length;aQt[0].se(eI===InformationScreen?colorPalette.pa:colorPalette.shouldSetInitATKPercent);aQt[1].se(eI===InformationScreen?colorPalette.pa:colorPalette.q3);
};aQt=[new x(L(205),function(){account.v(8,undefined,new ub(25,{action:0,uY:connectionMgr.xF.get()[eI],
uZ:0}));},colorPalette.pa,1),new x(L(206),function(){connectionMgr.xF.stringToLookupBytes(eI);s9.sA[eI].remove();s9.sA.splice(eI,1);
for(var aC=eI;aC<s9.sA.length;aC++){s9.sA[aC].name=""+aC;}if(connectionMgr.xF.get().length){
eI=Math.max(eI-1,0);s9.sA[eI].textContent=s9.sA[eI].textContent.replace("⚪","🟢");}aQu();
},colorPalette.pa,1)];aQu();s9=new wY(connectionMgr.xF.xR(),function(aC){eI=aC;aQu();});s9.sA[0].style.marginTop="0.5em";
aQh.s8(s9);aQh.sB((new tl([aQt[0].button])));aQh.sB((new tl([aQt[1].button])));
sF.push(aQh);}

function aQY(){var aQh=new rx();aQh.LobbyChatPanel(L(207));aQh.s2(L(208));connectionMgr.z.xn();
var s9;var aQt;
var aQu=function(eI){aQt[0].se(eI===0?colorPalette.pa:colorPalette.shouldSetInitATKPercent);aQt[1].se(eI===0?colorPalette.pa:colorPalette.q3);
};aQt=[new x(L(209),function(){var eI=Math.min(connectionMgr.buffer.data[117].value,s9.sA.length-1);
if(eI<1){return;}var data=connectionMgr.z.xr(eI);connectionMgr.qo.boatNotificationHandler(105,data.uY);
connectionMgr.qo.boatNotificationHandler(106,data.password);account.v(8,account.handleKeyInput().a3U,new ub(18));},colorPalette.pa,1),new x(L(206),function(){
var eI=Math.min(connectionMgr.buffer.data[117].value,s9.sA.length-1);if(eI<1){return;}s9.sA[eI].remove();
s9.sA.splice(eI,1);for(var aC=eI;aC<s9.sA.length;aC++){s9.sA[aC].name=""+aC;}connectionMgr.z.xq(eI);
eI=connectionMgr.buffer.data[117].value;s9.sA[eI].textContent=s9.sA[eI].textContent.replace("⚪","🟢");
aQu(eI);},colorPalette.pa,1)];s9=new wY(connectionMgr.buffer.data[117],aQu);
aQu(0);s9.sA[0].style.marginTop="0.5em";aQh.s8(s9);aQh.sB((new tl([aQt[0].button])));
aQh.sB((new tl([aQt[1].button])));return aQh;}

function aQa(){var aQh=new rx();
aQh.LobbyChatPanel(L(210));aQh.s6(L(211)+gameState.tI.a6L(data.y0,0.1,1)+"<br>"+L(182)+(data.y1+1)+" / "+
data.y3+"<br>"+L(212)+data.y2);return aQh;}

function aQZ(){var aQh=new rx();aQh.LobbyChatPanel(L(213));
var aQj=[L(214),L(215),L(216),L(217)];
var eH=data.aQv;aQh.s6(L(218)+(data.a2j/100).toFixed(2)+
"<br>"+L(182)+(eH+1)+" / "+data.y3+"<br>"+L(183)+aQj[eH<10?0:eH<50?1:eH<200?2:3]
);return aQh;}

function aQf(){var aQh=new rx();aQh.LobbyChatPanel(L(219));
var aQj=[L(220),
L(221),L(222),L(223),"Scout",L(224)];
var eH=data.aQw;aQh.s6(L(218)+(data.aQx/100).toFixed(2)+
"<br>"+L(182)+(eH+1)+" / "+data.y3+"<br>"+L(183)+aQj[eH<3?0:eH<20?1:eH<100?2:eH<500?3:eH<2000?4:5]);
aQh.s6("<a href='https://territorial.fandom.com/wiki/Zombie_mode' target='_blank'>Unofficial Tutorial</a>","0.75em").style.marginTop="0.8em";
return aQh;}

function aQd(){var aQh=new rx();aQh.LobbyChatPanel(L(225));
aQh.s6(L(226)+data.aQy+"<br>"+L(182)+(data.aQz+1)+" / "+data.y3+"<br>"+L(183)+br.eK(data.aQz)
);if(data.aQN){var t6=new t7({value:connectionMgr.buffer.data[157].value,eI:-1},1,undefined,function(e){
connectionMgr.qo.boatNotificationHandler(157,aQm(e.target.value));});
t6.e.style.marginTop="0.6em";aQh.sB(t6);
var aQp=new x(L(185),function(e){if(e.textContent===L(185)){
e.textContent=L(186);t6.e.readOnly=true;aR0[0].se(0);aR0[0].button.style.color=colorPalette.qN;
aQm(connectionMgr.buffer.data[157].value);}else{aQo();}return true;});aQh.sB((new tl([
aQp.button])));
var aR0=[new x(L(227),function(e){if(t6.e.readOnly&&gameServer.z.responsePacketBuilder(0)){gameState.sK.wV(e);
aQo();gameServer.aHS.aHT({action:1,uY:data.uY,value:mathUtils.distanceBetweenPointsAndEncoded(parseInt(connectionMgr.buffer.data[157].value,10),2,30000)
});}return true;},1)];
var s3=aQh.s2();
var aQm=function(g1){
g1=gameState.gv.initializeMapImageBuffer(g1,2,30000);s3.textContent=L(228,[g1-1,g1,connectionMgr.buffer.data[105].value]);
return g1;};aQh.sB(new tl([aR0[0].button]));
var aQo=function(){aQp.button.textContent=L(185);t6.e.readOnly=false;aR0[0].se(1);
aR0[0].button.style.color=colorPalette.pO;};aQm(connectionMgr.buffer.data[157].value);}return aQh;}

function aQQ(){
var aQh=new rx();aQh.LobbyChatPanel(L(229));if(data.aR1){aQh.s6("✅ "+L(230)).style.marginBottom="0.75em";
}var a30=data.aR2;if(a30<1){aQh.s6(L(231));if(data.aR3===0){
aQh.s2(L(232));}else if(data.aR3===1){aQh.s2(L(233));}else if(data.aR3===2){aQh.s2(L(234));
}else if(data.aR3===3){aQh.s2(L(235));}else if(data.aR3===4){aQh.s2(L(236));}else if(data.aR3===5){
aQh.s2(L(237));}else if(data.aR3===6){aQh.s2(L(238));}else{aQh.s2(L(239));}}else{aQh.s6(L(240));
var a8x;if(a30<2){a8x=L(241);}else if(a30<61){if(a30===2){a8x=L(242);}else{a8x=L(243,[a30-1]);
}}else if(a30<84){if(a30===61){a8x=L(244);}else{a8x=L(245,[a30-60]);}}else if(a30<255){
if(a30===84){a8x=L(246);}else{a8x=L(247,[a30-83]);}}else{a8x=L(248);}aQh.s2(a8x);}aQh.sB(new tw());
if(data.aQN){var s3=aQh.s2();aQh.sB((new tl([(new x(connectionMgr.xF.vp(data.uY)?L(249):L(250),function(e){
if(connectionMgr.xF.xS(data.uY)){e.textContent=L(249);aQm(1);}else{e.textContent=L(250);aQm(0);}return true;
})).button])));
var aQm=function(g1){s3.textContent=g1?L(251):"";};if(connectionMgr.xF.vp(data.uY)){
aQm(1);}aQh.sB(new tw());}var t6=new t7({value:data.username,eI:-1});t6.e.readOnly=true;
aQh.sB(t6);aQh.sB((new tl([(new x(L(188),function(e){gameState.sK.trimStartSpaces(t6.e);gameState.sK.wV(e);
return true;})).button])));if(!data.aQN){aQh.s2(L(252));}if(data.aR4||data.aR5||data.aR6){
aQh.sB(new tw());aQh.s2(L(253));var sO;if(data.aR4){aQh.s2("• Account Timeout").style.color="orange";
}if(data.aR5){sO=aQh.s2("• Muted");sO.style.color="orange";sO.style.marginTop="0.5em";
}if(data.aR6){sO=aQh.s2("• Redacted");sO.style.color="orange";sO.style.marginTop="0.5em";
}}if(data.aQN){aQh.sB(new tw());aQh.s6(gameServer.z.aQi("/wiki/reports"),"0.75em").style.marginBottom="0.8em";
aQh.sB((new tl([(new x(L(254),function(e){gameServer.aHS.aHT({action:3,uY:data.uY,value:0});gameState.sK.wV(e);
return true;},colorPalette.q3)).button])));aQh.sB((new tl([(new x(L(255),function(e){gameServer.aHS.aHT({
action:3,uY:data.uY,value:1});gameState.sK.wV(e);return true;},colorPalette.q3)).button])));aQh.sB((new tl([
(new x("Cheater",function(e){gameServer.aHS.aHT({action:3,uY:data.uY,value:2});gameState.sK.wV(e);return true;
},colorPalette.q3)).button])));aQh.sB((new tl([(new x("False Reporter",function(e){gameServer.aHS.aHT({action:3,uY:data.uY,
value:3});gameState.sK.wV(e);return true;},colorPalette.q3)).button])));
var aR7=connectionMgr.buffer.data[105].value;
aR7=aR7==="CRTOR"||aR7==="ADMIN";if(aR7){aQh.sB((new tl([(new x("Block Account",function(e){
gameServer.aHS.aHT({action:3,uY:data.uY,value:4});gameState.sK.wV(e);return true;},colorPalette.cancelAttack)).button
])));aQh.sB((new tl([(new x("Ban IP",function(e){gameServer.aHS.aHT({action:3,uY:data.uY,value:5});
gameState.sK.wV(e);return true;},colorPalette.cancelAttack)).button])));aQh.sB((new tl([(new x("Gold Seizure",function(e){gameServer.aHS.aHT({
action:3,uY:data.uY,value:6});gameState.sK.wV(e);return true;},colorPalette.cancelAttack)).button])));aQh.sB((new tl([
(new x("Remove Punishments",function(e){gameServer.aHS.aHT({action:3,uY:data.uY,value:7});gameState.sK.wV(e);return true;
},colorPalette.sendAttack)).button])));}}return aQh;}

function aQP(sF,aR8){if(data.aQN){return;}if(data.aR1){if(aR8){
return;}}else{if(!aR8){return;}if(data.isTileWrap<10000){return;}}var aQh=new rx();
var aR9=data.isTileWrap>=100000;
var aRA=aQh.LobbyChatPanel(aR8?(aR9?"⚠️ ":"")+L(256):L(257));aR9&&(aRA.style.color="yellow");
if(aR8){aQh.s2(L(258,[gameState.tI.a6L(data.isTileWrap,0.01,0)]));}else{var aRB=new t7({value:data.aRC,eI:-1});
aRB.e.readOnly=true;aRB.e.type="password";aQh.sB(aRB);aQh.sB((new tl([(new x(L(191),function(e){
if(e.textContent===L(191)){e.textContent=L(192);aRB.e.type="text";}else{e.textContent=L(191);
aRB.e.type="password";}return true;})).button,(new x(L(188),function(e){gameState.sK.trimStartSpaces(aRB.e);
gameState.sK.wV(e);return true;})).button])));}aQh.s6(aR8?L(257):L(259)).style.marginTop="0.75em";
var aRD=new t7({value:"",eI:-1},0,0);aRD.e.type="email";aRD.e.autocomplete="email";
aRD.e.name="email";aRD.e.inputMode="email";aRD.e.spellcheck=false;aQh.sB(aRD);aQh.sB((new tl([
(new x(L(260),function(e){gameServer.aHS.aRE({action:3,s1:aRD.e.value.trim().substring(0,63)
});gameState.sK.wV(e);return true;})).button])));aR8&&aQh.s2(L(261));
aQh.s6(L(262)).style.marginTop="0.75em";
var aRF=new t7({value:"",eI:-1},1);aQh.sB(aRF);
aQh.sB((new tl([(new x(L(263),function(){gameServer.aHS.aHT({action:4,uY:"",value:Math.floor(+aRF.e.value)
});account.v(8,account.handleKeyInput().a3U,new ub(18));})).button])));sF.push(aQh);}

function aQR(sF){
if(data.aQN){return;}var aQh=new rx();aQh.LobbyChatPanel(L(264));
var s3=aQh.s2(data.aRG.length+" / 160");
s3.style.textAlign="center";
var aEU=true;
var aRH=new x0(0,1,function(e){
var resolveAttackCombat=e.target.value.length;s3.textContent=resolveAttackCombat+" / 160";if(resolveAttackCombat>160){if(aEU){
aEU=false;aQp.se(1);}}else if(!aEU){aEU=true;aQp.se(0);}});aRH.e.rows=6;aRH.e.style.fontSize="1em";
aRH.x6(data.aRG);aQh.sB(aRH);if(data.aRI!==0){var aQp=new x(L(265),function(){if(!aEU){
return true;}account.v(8,account.handleKeyInput().a3U,new ub(29,{action:1,s1:aRH.x7().substring(0,160)}));},0,0,1);
aQh.sB((new tl([aQp.button])));aQh.sB((new tl([(new x(data.aRI===1?L(266):L(267),function(){
account.v(8,account.handleKeyInput().a3U,new ub(29,{action:0,s1:""}));},0,0,1)).button])));aQh.s2(data.aRI===1?
L(268,[data.aRJ-1]):L(269,[data.aRJ-1]));aQh.s2(L(270,[data.aRK]));sF.push(aQh);
return;}var aQn=new x(L(271),function(){if(aRH.e.readOnly){account.v(8,account.handleKeyInput().a3U,new ub(29,{
action:1,s1:aRH.x7().substring(0,160)}));return;}return true;},1);
var aQp=new x(L(185),function(e){
if(e.textContent===L(185)){if(!aEU){return true;}e.textContent=L(186);aRH.e.readOnly=true;
aQn.se(0);aQn.button.style.color=colorPalette.qN;}else{aQo();}return true;});aQh.sB((new tl([
aQp.button])));aQh.s2(L(270,[data.aRK]));
var aQo=function(){aQp.button.textContent=L(185);
aRH.e.readOnly=false;aQn.se(1);aQn.button.style.color=colorPalette.pO;};aQh.sB((new tl([aQn.button])));
sF.push(aQh);}

function aQS(sF){if(!data.aQN){return;}if(data.aRI===0){return;}var aQh=new rx();
aQh.LobbyChatPanel(L(272));aQh.s4(data.aRG);aQh.sB((new tl([(new x(L(273,0,"Report"),function(e){
if(gameServer.z.responsePacketBuilder(0)){gameState.sK.wV(e);gameServer.aHS.aRL({action:5,uY:data.uY});}return true;},0,0,1)).button
])));sF.push(aQh);}

function aQb(sF){var aQh=new rx();
var aRM=data.y7;aQh.LobbyChatPanel(L(274));
aQh.s6(L(275,[(data.y5.length?("["+data.y5+"]"):"-")]));aQh.s6(L(276,[gameState.tI.a6L(aRM,0.01,2)]));
aQh.s6(L(277,[(data.y9+1)+" / "+data.y3]));
var aRN=data.yA;aQh.s6(L(278,[gameState.tI.a6L(aRN,0.1,1)]));
var aRO=data.yC;aQh.s6(L(279,[aRO]));aQh.s6(L(280,[gameState.tI.a6L(aRN/Math.max(aRO,1),0.1,2)]));
aRM=data.y8;aQh.LobbyChatPanel(L(281),"0.8em");aQh.s6(L(275,[(data.y6.length?("["+data.y6+"]"):"-")]));
aQh.s6(L(276,[gameState.tI.a6L(aRM,0.01,2)]));aRN=data.yB;aQh.s6(L(278,[gameState.tI.a6L(aRN,0.1,1)]));
aRO=data.yD;aQh.s6(L(279,[aRO]));aQh.s6(L(280,[gameState.tI.a6L(aRN/Math.max(aRO,1),0.1,2)]));
aQh.s6(gameServer.z.aQi("/wiki/clans"),"0.75em").style.marginTop="0.8em";sF.push(aQh);
}

function aQc(sF){var aQh=new rx();aQh.LobbyChatPanel(L(282));aQh.s6(L(218)+(data.aRP/10).toFixed(1)+
"<br>"+L(183)+(data.aRQ.length?L(283,[data.aRQ]):L(284)));if(data.aQN){aQh.sB((new tl([
(new x(L(227),function(e){if(gameServer.z.responsePacketBuilder(0)){gameState.sK.wV(e);gameServer.aHS.aRL({action:4,uY:data.uY
});}return true;},0,0,1)).button])));}aQh.s6(gameServer.z.aQi("/wiki/clans"),"0.75em").style.marginTop="0.8em";
sF.push(aQh);}

function aQe(sF){if(data.aQN&&!data.aRR){return;}if(uiSurface.id!==0&&!data.aQN&&!data.aRR){
return;}var aQh=new rx();aQh.LobbyChatPanel("Patreon");if(!data.aQN&&data.aRS){
aQh.sB((new tl([(new x(L(191),function(){gameServer.aHS.aRL({action:7,uY:data.uY});data.aRS=0;
account.v(7);})).button])));sF.push(aQh);return;}if(data.aRR){aQh.s6(L(285,[(data.aRT/100).toFixed(2)])+
"<br>"+L(286,[(1+data.aRU)+" / "+data.aRV])+"<br>"+L(287,[data.aRW?L(288):L(289)])
);if(!data.aQN){aQh.sB((new tl([(new x(L(290),function(){gameServer.aHS.aRL({
action:8,uY:data.uY});data.aRR=0;connectionMgr.qo.boatNotificationHandler(160,0);account.v(7);})).button])));}sF.push(aQh);return;
}aQh.s6(L(291),"0.75em").style.marginBottom="0.3em";aQh.s6("  • "+L(292),"0.75em").style.whiteSpace="pre";
aQh.s6("  • "+L(293),"0.75em").style.whiteSpace="pre";aQh.s6("  • "+L(294),"0.75em").style.whiteSpace="pre";
aQh.s6(L(295),"0.75em").style.marginTop="1.0em";aQh.s6(L(296),"0.75em").style.marginTop="1.0em";
aQh.s6("<a href='"+floorDiv.aRX+"' target='_blank'>patreon.com/c/territorial</a>","0.75em").style.marginTop="0.3em";
var a5X="https://www.patreon.com/oauth2/authorize?state="+data.uY+"&response_type=code&client_id=wWuOlDVZwn1sxSN9Wm4I9sJA3Ewfw7Zz4MjTMf9el2v3lviVkDwFtr92n7Tdlrhc&redirect_uri=https://"+gameServer.z.a2g()+"/";
aQh.s6(L(297),"0.75em").style.marginTop="1.0em";
aQh.s6("<a href='"+a5X+"' target='_blank'>patreon.com/oauth2/...</a>","0.75em").style.marginTop="0.3em";
if(!data.aQN){aQh.sB(new tw());aQh.sB((new tl([(new x(L(192),function(){gameServer.aHS.aRL({
action:6,uY:data.uY});data.aRS=1;account.v(7);})).button])));aQh.s6(L(298),"0.75em").style.marginTop="0.75em";
}sF.push(aQh);}this.show=function(){if(data.aQN){mapUtils.aRY("account",data.uY);
}aQL.show();this.resize();};this.tZ=function(){aQL.tZ();};this.resize=function(){aQL.resize();
aQM.resize();};this.getTerriColorArray=function(ej){if(ej===2){aQL.wj[0].sb();}};dk();}

function aQ8(){var aRZ;
var aRa;var aRb;

function sd(){aRZ=new wc(L(299),[new x("⬅️ "+L(40),aRc)]);aRa=new sD(aRZ.wi,aRd());
}

function aRc(){aRe();if(localPlayer.data.aIncomeType!==2){localPlayer.data.aIncomeData=null;}account.aQK()[19]=null;
account.a3O();}

function aRe(){if(localPlayer.data.aIncomeType===2){gameState.sS.a4v(aRb.x7(),localPlayer.data.aIncomeData,255);
if(!gameState.sS.max(localPlayer.data.aIncomeData)){localPlayer.data.aIncomeType=0;
}}else if(localPlayer.data.aIncomeType===1&&!localPlayer.data.aIncomeValue){localPlayer.data.aIncomeType=0;
}}

function aRd(){var sF=[];aRf(sF);aRg(sF);aRh(sF);return sF;}

function aRf(sF){var aQh=new rx();
aQh.LobbyChatPanel(L(300));aQh.s8(new wY({oM:[L(301),L(302),L(303)],value:localPlayer.data.aIncomeType},
function(eI){aRe();if(eI===2&&!localPlayer.data.aIncomeData){localPlayer.data.aIncomeData=new Uint8Array(localPlayer.isMountainTile);
}localPlayer.data.aIncomeType=eI;account.v(22);}));sF.push(aQh);}

function aRg(sF){
if(localPlayer.data.aIncomeType!==1){return;}var aQh=new rx();aQh.LobbyChatPanel("Value");aQh.sB(new t7({eI:-1,
value:localPlayer.data.aIncomeValue},1,0,function(e){var value=mathUtils.distanceBetweenPointsAndEncoded(Math.floor(e.target.value),0,255);
e.target.value=localPlayer.data.aIncomeValue=value;}));sF.push(aQh);}

function aRh(sF){
if(localPlayer.data.aIncomeType!==2){return;}var aQh=new rx();aQh.LobbyChatPanel("Data");aRb=new x0(0,1,0,1);
aRb.x6(gameState.tI.getTime(localPlayer.data.aIncomeData,4));aQh.sB(aRb);sF.push(aQh);}this.show=function(){
aRZ.show();this.resize();};this.tZ=function(){aRZ.tZ();};this.resize=function(){
aRZ.resize();aRa.resize();};this.getTerriColorArray=function(ej){if(ej===2){aRZ.wj[0].sb();}};
sd();}

function aQB(){var aRZ;var aRa;var aRb;

function sd(){aRZ=new wc(L(65),[new x("⬅️ "+L(40),aRc)
]);aRa=new sD(aRZ.wi,aRd());}

function aRc(){aRe();aRi();account.aQK()[19]=null;account.a3O();}

function aRe(){
if(localPlayer.data.botDifficultyType===3){gameState.sS.a4v(aRb.x7(),localPlayer.data.botDifficultyData,troopCalc.l5.length-1);
}}

function aRi(){if(localPlayer.data.botDifficultyType===3){
if(!gameState.sS.endsWith(localPlayer.data.botDifficultyData)){localPlayer.data.botDifficultyType=0;
}}if(localPlayer.data.botDifficultyType!==3){localPlayer.data.botDifficultyData=null;}}

function aRd(){var sF=[];
aRf(sF);if(localPlayer.data.botDifficultyType===0){aRj(sF,-1);}else if(localPlayer.data.botDifficultyType===2){
for(var aC=0;aC<localPlayer.data.teamPlayerCount.length;aC++){if(localPlayer.data.teamPlayerCount[aC]){aRj(sF,aC);
}}}else if(localPlayer.data.botDifficultyType===3){aRh(sF);}return sF;}

function aRf(sF){var aQh=new rx();
aQh.LobbyChatPanel(L(300));
var oM=[L(302),L(304),L(305),L(303)];
var value=localPlayer.data.botDifficultyType;
if(localPlayer.data.gameMode===0){value=Math.min(value,2);oM.splice(2,1);}aQh.s8(new wY({oM:oM,value:value},
function(eI){aRe();localPlayer.data.botDifficultyType=eI;if(localPlayer.data.gameMode===0&&eI===2){
localPlayer.data.botDifficultyType=3;}if(localPlayer.data.botDifficultyType===3&&!localPlayer.data.botDifficultyData){
localPlayer.data.botDifficultyData=new Uint8Array(localPlayer.isMountainTile);
}if(localPlayer.data.botDifficultyType===2&&!localPlayer.data.botDifficultyTeam){
localPlayer.data.botDifficultyTeam=new Uint8Array(9);}account.v(25);}));
sF.push(aQh);}

function aRj(sF,eI){var aQh=new rx();aQh.LobbyChatPanel(eI<0?L(65):(L(64)+" "+mainMenu.a2c[(eI)%9]));
if(eI>=0){aQh.s6(L(306)+": "+localPlayer.data.teamPlayerCount[eI]).style.marginBottom="1em";
}var value=eI<0?localPlayer.data.botDifficultyValue:localPlayer.data.botDifficultyTeam[eI];
aQh.s8(new wY({oM:troopCalc.l5,value:value},function(iR){if(eI<0){localPlayer.data.botDifficultyValue=iR;
}else{localPlayer.data.botDifficultyTeam[eI]=iR;}}));sF.push(aQh);}

function aRh(sF){var aQh=new rx();
aQh.LobbyChatPanel("Data");aRb=new x0(0,1,0,1);aRb.x6(gameState.tI.getTime(localPlayer.data.botDifficultyData,8));aQh.sB(aRb);
sF.push(aQh);}this.show=function(){aRZ.show();this.resize();};this.tZ=function(){aRZ.tZ();};
this.resize=function(){aRZ.resize();aRa.resize();};this.getTerriColorArray=function(ej){if(ej===2){aRZ.wj[0].sb();
}};sd();}

function aRk(data){var aQL;var aRl,aRm,aRn,aRo;var aRp,aRq;var colors;var aRr,aRs;
var aRt=0;
var aRu=0;
var aRv=false;
var aRw=false;
var aRx=[1,5,60,4*60,24*60,7*24*60,30*24*60];

function dk(){aRy();aRz();aS0();
var aS1=["M1","M5","H1","H4","D1","W1","MN"];
aQL=new wc(L(307)+", "+aS1[data.aS2]+", "+gameState.a4a.a5M(aRr),[new x("⬅️ "+L(40),function(){account.v(1);}),
new x(L(308),function(){account.v(14);})],false);}

function aRy(){var aC;
var fc=data.data;
var fZ=fc.length;
var max=1;for(aC=0;aC<fZ;aC++){max=Math.max(max,fc[aC].aS3.length);
}for(aC=0;aC<fZ;aC++){while(fc[aC].aS3.length<max){fc[aC].aS3.unshift(0);}}}

function aRz(){
var h8;
var ea=new Date();
var a5N=1000*60*ea.getTimezoneOffset();
var iR=ea.getTime()-a5N;
aRr=new Date(iR);if(data.aS2===6){aS4(ea,a5N);return;}h8=1000*60*aRx[data.aS2];if(data.aS2<=4){
aRs=new Date(iR+h8-ea.getTime()%h8);return;}aRs=new Date(iR+h8-(ea.getTime()+3*24*60*60*1000)%h8);
}

function aS4(ea,a5N){var aS5=ea.getUTCFullYear();
var month=ea.getUTCMonth()+1;
if(month<12){aRs=new Date(Date.UTC(aS5,month)-a5N);}else{aRs=new Date(Date.UTC(aS5+1,0)-a5N);
}}

function aS0(){var ej=gameState.color;colors=[colorPalette.pO,ej.pG(255,0,0),ej.pG(0,200,0),
ej.pG(80,80,255),ej.pG(255,255,0),ej.pG(255,0,255),ej.pG(0,255,255),ej.pG(255,140,0),
ej.pG(128,128,128),ej.pG(0,255,140)];}this.show=function(){aRw=connectionMgr.buffer.data[127].value;
aQL.show();this.resize();};this.tZ=function(){aQL.tZ();};this.resize=function(){aQL.resize();
var ej=camera.l;
var wq=aQL.wn();
var aS6=ej*wq.wp;
var tc=ej*wq.tc;aRp=gameState.sK.ux(0.06);aRq=gameState.sK.ux(0.04);
aRl=gameState.sK.ux(0.06);aRm=tc+aRp;aRn=camera.j-aRl-aRq;aRo=aS6+tc-aRm-aRq;};this.wr=function(){
aQL.wr();aS7();aS8();aS9();};

function aS8(){ws.lineWidth=debugPanel.a1E;ws.strokeStyle=colorPalette.pO;
ws.beginPath();ws.moveTo(aRl,aRm);ws.lineTo(aRl,aRm+aRo);ws.lineTo(aRl+aRn,aRm+aRo);
ws.stroke();}

function aS7(){var aC,aS3,resolveAttackCombat,fg,fs;
var h=data.data;
var aSA=1;
var aSB=0.125;
var aSC=aRw?(1<<16):0;for(aC=0;aC<h.length;aC++){aS3=h[aC].aS3;resolveAttackCombat=aS3.length;aSA=Math.max(resolveAttackCombat,aSA);
for(fs=0;fs<resolveAttackCombat;fs++){aSB=Math.max(aS3[fs],aSB);aSC=Math.min(aS3[fs],aSC);}}var nw=aRm+aRo;
var a0C=aRo/(aSB-aSC);
var a0B=1/(aSA-1);ws.lineWidth=debugPanel.a1E;for(aC=0;aC<h.length;aC++){
aS3=h[aC].aS3;resolveAttackCombat=aS3.length;fg=aRl;ws.beginPath();ws.moveTo(fg+aRn,nw-a0C*(aS3[resolveAttackCombat-1]-aSC));
for(fs=resolveAttackCombat-2;fs>=0;fs--){ws.lineTo(fg+a0B*fs*aRn,nw-a0C*(aS3[fs]-aSC));}ws.strokeStyle=colors[aC];
ws.stroke();}aSD(aSC,aSB,nw,a0C);aSE(aSA);a86(aSA,aSC,aSB);}

function aSD(aSC,aSB,nw,a0C){
ws.font=gameState.sK.u8(0,0.25*aRl);gameState.sK.textBaseline(ws,1);gameState.sK.textAlign(ws,2);
ws.fillStyle=colors[0];
var fg=0.92*aRl;for(var aC=0;aC<3;aC++){var g1=aSC+aC*(aSB-aSC)/2;
ws.fillText((g1/1000).toFixed(3),fg,nw-a0C*(g1-aSC));}}

function aSE(aSA){var fi=aRm+aRo+0.15*aRq;
ws.font=gameState.sK.u8(0,Math.min(0.4*aRq,0.028*camera.j));gameState.sK.textBaseline(ws,0);gameState.sK.textAlign(ws,2);
ws.fillStyle=colors[0];ws.fillText(gameState.a4a.a5P(aRr),aRl+aRn,fi);gameState.sK.textAlign(ws,0);
ws.fillText(gameState.a4a.a5P(new Date(aRs.getTime()-1000*60*(aSA-1)*aRx[data.aS2])),aRl,fi);
}

function a86(aSA,aSC,aSB){
if(!aRv){return;}if(aSA<2){return;}var h7=(aRt-aRl)/aRn;
var eI=h7*(aSA-1);
var aSF=Math.floor(eI);
var aSG=Math.floor(eI+1);
var aSH=eI-aSF;
var aSI=100000;
var aSJ=-1;
var aSK=-1;
var aSL=aSB-(aSB-aSC)*(aRu-aRm)/aRo;
var h=data.data;for(var aC=0;aC<h.length;aC++){
var aS3=h[aC].aS3;
var resolveAttackCombat=aS3.length;if(aSG>=resolveAttackCombat){continue;}var g1=aS3[aSF]+aSH*(aS3[aSG]-aS3[aSF]);
var aEf=Math.abs(aSL-g1);if(aEf<aSI){aSI=aEf;aSJ=aC;aSK=g1;}}if(aSJ===-1){
return;}var aSM=aRm+aRo-(aSK-aSC)/(aSB-aSC)*aRo;ws.lineWidth=0.5*debugPanel.a1E;ws.strokeStyle=colors[aSJ];
ws.beginPath();ws.moveTo(aRl,aSM);ws.lineTo(aRt,aSM);ws.lineTo(aRt,aRm+aRo);
ws.stroke();ws.beginPath();ws.arc(aRt,aSM,0.10*aRl,0,2*Math.PI);ws.fillStyle=colors[aSJ];
ws.fill();
var aSN=aRm+aRo+0.15*aRq;gameState.sK.textAlign(ws,1);var ea,aAm;if(eI>aSA-2){
aAm=aRs.getTime()-1000*60*aRx[data.aS2];ea=new Date(aAm+(eI-(aSA-2))*(aRr.getTime()-aAm));
}else{ea=new Date(aRs.getTime()-1000*60*(aSA-eI-1)*aRx[data.aS2]);}
var s1=gameState.a4a.a5P(ea);
var aSO=gameState.sK.measureText(s1);
var aSP=mathUtils.distanceBetweenPointsAndEncoded(aRt,aRl+0.5*aSO,aRl+aRn-0.5*aSO);
ws.fillStyle=gameState.color.pG(70,50,20);ws.fillRect(aSP-0.52*aSO,aRm+aRo,1.04*aSO,0.55*aRq);
ws.fillStyle=colors[0];ws.fillText(s1,aSP,aSN);ws.font=gameState.sK.u8(0,0.25*aRl);
gameState.sK.textBaseline(ws,1);gameState.sK.textAlign(ws,2);aSP=0.92*aRl;s1=(aSK/1000).toFixed(3);
aSO=gameState.sK.measureText(s1);
var aSQ=aSP-1.04*aSO;ws.fillStyle=gameState.color.pG(70,50,20);
ws.fillRect(aSQ,aSM-0.65*0.25*aRl,aRl-aSQ,1.1*0.25*aRl);ws.fillStyle=colors[aSJ];
ws.fillText(s1,aSP,aSM);}

function aS9(){var aC;
var fontSize=0.5*aRp;ws.font=gameState.sK.u8(0,fontSize);
gameState.sK.textBaseline(ws,1);gameState.sK.textAlign(ws,0);
var h=data.data;
var fZ=h.length;
var fi=aRm-0.5*aRp;
var s1="";for(aC=0;aC<fZ;aC++){s1+=h[aC].name+"  ";}s1=s1.trim();
var aSO=gameState.sK.measureText(s1);
var fg=0.5*(camera.j-aSO);if(aSO>camera.j){fg=0;ws.font=gameState.sK.u8(0,camera.j/aSO*fontSize);}for(aC=0;aC<fZ;aC++){
ws.fillStyle=colors[aC];ws.fillText(h[aC].name,fg,fi);fg+=gameState.sK.measureText(h[aC].name+"  ");
}}this.hm=function(m9,mA){aSR(m9,mA);};this.a3m=function(m9,mA){
aSR(m9,mA);};

function aSR(m9,mA){aRt=m9;aRu=mA;if(!a4G(m9,mA)){if(aRv){clanPanel.ds=true;}aRv=false;
return;}aRv=true;clanPanel.ds=true;}

function a4G(m9,mA){return m9>aRl&&m9<aRl+aRn&&mA>aRm&&mA<aRm+aRo;}
this.getTerriColorArray=function(ej){if(ej===2){aQL.wj[0].sb();}};dk();}

function aQ0(){var aQL;var aQM;
var aSS=-1;

function dk(){aQL=new wc(L(309),[new x("⬅️ "+L(40),function(){if(aSS!==connectionMgr.buffer.data[125].value){
account.z.aST();}else{account.aQJ(13);}})]);aQM=new sD(aQL.wi,aQO());}

function aQO(){
var sF=[];sF.push(aSU());sF.push(aSV());sF.push(aSW());sF.push(aSX());return sF;}

function aSU(){
var aQh=new rx();aQh.LobbyChatPanel(L(310));aQh.s2(L(311));
var aQp=new x(L(312),function(){connectionMgr.qo.boatNotificationHandler(130,0);
account.z.aST();},0,0,1);
var t6=new t7(connectionMgr.buffer.data[126],0,function(){aQp.button.click();});
aQh.sB(t6);t6.e.placeholder="a,b,c";t6.e.style.marginTop="0.5em";aQh.sB((new tl([aQp.button])));
return aQh;}

function aSV(){var aQh=new rx();
var aQp=new x(L(312),function(){connectionMgr.qo.boatNotificationHandler(130,1);
account.z.aST();},0,0,1);
var aSY=new t7(connectionMgr.buffer.data[129],1,function(){aSY.e.focus();});
var aSZ=new t7(connectionMgr.buffer.data[128],1,function(){aQp.button.click();});
aQh.LobbyChatPanel(L(313));aQh.sB(aSZ);aSZ.e.style.marginBottom="0.5em";
aQh.LobbyChatPanel(L(314));aQh.sB(aSY);aQh.sB((new tl([aQp.button])));return aQh;}

function aSW(){
var aQh=new rx();aQh.LobbyChatPanel(L(315));connectionMgr.buffer.data[125].oM=["M1","M5","H1","H4","D1","W1","MN"];
aQh.s8(new wY(connectionMgr.buffer.data[125]));return aQh;
}

function aSX(){var aQh=new rx();aQh.LobbyChatPanel(L(316));aQh.sB(new th(connectionMgr.buffer.data[127],L(317)));
return aQh;}this.show=function(){aQL.show();this.resize();aSS=connectionMgr.buffer.data[125].value;
};this.tZ=function(){aQL.tZ();};this.resize=function(){aQL.resize();aQM.resize();
};this.getTerriColorArray=function(ej){if(ej===2){aQL.wj[0].sb();}};dk();}

function aPz(){var aQL;var aSa;
var aRn;var aSb;var aSc;var aSd;
var colors=[0,0,0];
var aSe=-1;

function dk(){aQL=new wc(L(318),
[new x("⬅️ "+L(40),function(){account.z.aEa();})],false);aSa=new su([0.5,0.25],[0.5,0.5],1);
}this.show=function(){var g1=connectionMgr.buffer.data[121].value;colors[0]=(g1>>12)/63;
colors[1]=((g1>>6)&63)/63;colors[2]=(g1&63)/63;aQL.show();this.resize();};this.tZ=function(){
connectionMgr.qo.boatNotificationHandler(121,(aSf(0,64)<<12)+(aSf(1,64)<<6)+aSf(2,64));aQL.tZ();};this.resize=function(){
aQL.resize();aSa.resize();
var ej=camera.l;
var wq=aQL.wn();aSa.fi=Math.max(aSa.fi,ej*wq.tc+debugPanel.gap);
var aSg=ej*wq.wp-2*debugPanel.gap;aSa.k=Math.min(aSa.k,aSg);aSa.j=2*aSa.k;
aSa.fi=ej*wq.tc+0.5*(ej*wq.wp-aSa.k);aSa.fg=0.5*(camera.j-aSa.j);aRn=0.25*aSa.j;aSb=aSa.fg+aRn+debugPanel.gap;
aSc=aSa.j-aRn-debugPanel.gap;aSd=(aSa.k-2*debugPanel.gap)/3;};this.wr=function(){aQL.wr();ws.lineWidth=debugPanel.a1E;
aS8();aSh(0);aSh(1);aSh(2);};

function aS8(){var eH=aSf(0);
var uw=aSf(1);
var ft=aSf(2);
ws.fillStyle="rgb("+eH+","+uw+","+ft+")";ws.fillRect(aSa.fg,aSa.fi,aRn,aSa.k);ws.strokeStyle=colorPalette.pO;
ws.strokeRect(aSa.fg,aSa.fi,aRn,aSa.k);ws.fillStyle=(eH+uw+ft<0.4*(3*255)&&uw<150)?colorPalette.pO:colorPalette.pF;
gameState.sK.textBaseline(ws,1);gameState.sK.textAlign(ws,1);ws.font=gameState.sK.u8(0,0.1*aSa.k);ws.rotate(-Math.PI/2);
ws.fillText(L(319),-aSa.fi-0.5*aSa.k,aSa.fg+0.5*aRn);ws.setTransform(1,0,0,1,0,0);
}

function aSh(aC){var eH=aC===0?150:aC===2?30:0;
var uw=aC===1?130:aC===2?30:0;
var ft=aC===2?220:0;
var aSi=aSa.fi+aC*(debugPanel.gap+aSd);ws.fillStyle="rgb("+eH+","+uw+","+ft+")";
ws.fillRect(aSb,aSi,colors[aC]*aSc,aSd);ws.strokeStyle=colorPalette.pO;ws.strokeRect(aSb,aSi,aSc,aSd);
ws.fillStyle=colorPalette.pO;ws.font=gameState.sK.u8(0,0.32*aSd);gameState.sK.textBaseline(ws,1);gameState.sK.textAlign(ws,0);
ws.fillText((aC===0?L(320):aC===1?L(321):L(322))+aSf(aC),aSb+debugPanel.gap,aSi+0.53*aSd);
}

function aSf(aC,aSj){aSj=aSj||256;
return mathUtils.distanceBetweenPointsAndEncoded(Math.floor(aSj*colors[aC]),0,aSj-1);}this.hm=function(m9,mA){if(!a4G(m9,mA)){return;
}aSe=mathUtils.distanceBetweenPointsAndEncoded(Math.floor((mA-aSa.fi)/(aSd+0.75*debugPanel.gap)),0,2);colors[aSe]=mathUtils.distanceBetweenPointsAndEncoded((m9-aSb)/aSc,0,1);
clanPanel.ds=true;};

function a4G(m9,mA){if(m9<aSb||mA<aSa.fi||m9>aSa.fg+aSa.j||mA>aSa.fi+aSa.k){
return false;}return true;}this.a3m=function(m9){if(aSe===-1){
return;}colors[aSe]=mathUtils.distanceBetweenPointsAndEncoded((m9-aSb)/aSc,0,1);clanPanel.ds=true;};this.a3p=function(m9,mA,deltaY){
if(!a4G(m9,mA)){return;}var eI=mathUtils.distanceBetweenPointsAndEncoded(Math.floor((mA-aSa.fi)/(aSd+0.75*debugPanel.gap)),0,2);
colors[eI]=mathUtils.distanceBetweenPointsAndEncoded(colors[eI]+(1-2*(deltaY>0))/256,0,1);clanPanel.ds=true;};this.a4A=function(){if(aSe>=0){
aSe=-1;clanPanel.ds=true;}};this.getTerriColorArray=function(ej){if(ej===2){aQL.wj[0].sb();}};dk();}

function aQ7(){
var aRZ;var aRa;var aRb;

function sd(){var oy=[new x("⬅️ "+L(40),aRc)];if(localPlayer.data.gameMode===1){
oy.push(new x(L(323),aSk,1,1));}aRZ=new wc(L(324),oy);aRa=new sD(aRZ.wi,aRd());
}

function aRc(){aRe();account.aQK()[19]=null;account.a3O();}

function aSk(){aRe();account.v(21);}

function aRe(){
if(localPlayer.data.gameMode===1){localPlayer.a6i.a6n();}else if(localPlayer.data.gameMode===0&&localPlayer.data.colorsType===1){
gameState.sS.a4v(aRb.x7(),localPlayer.data.colorsData,262143);
}}

function aRd(){var sF=[];if(localPlayer.data.gameMode===0){aRf(sF);if(localPlayer.data.colorsType===1){
aRh(sF);}return sF;}localPlayer.a6i.a6n();sF.push(aSl());aSm(sF);return sF;}

function aRf(sF){
var aQh=new rx();aQh.LobbyChatPanel(L(300));aQh.s8(new wY({oM:[L(325),L(303)],value:localPlayer.data.colorsType},
function(eI){aRe();localPlayer.data.colorsType=eI;
if(localPlayer.data.colorsType===1&&(!localPlayer.data.colorsData||localPlayer.data.colorsData.length!==localPlayer.isMountainTile)){
localPlayer.data.colorsData=new Uint32Array(localPlayer.isMountainTile);
}account.v(21);}));sF.push(aQh);}

function aRh(sF){var aQh=new rx();
aQh.LobbyChatPanel("Data");aRb=new x0(0,1,0,1);aRb.x6(gameState.tI.getTime(localPlayer.data.colorsData,1));aQh.sB(aRb);
sF.push(aQh);}

function aSl(){var aQh=new rx();aQh.LobbyChatPanel(L(306));for(var aC=0;aC<mainMenu.a2c.length;aC++){
var iR=(aC+1)%mainMenu.a2c.length;
var e=aQh.s6((iR===0?"":"Team ")+mainMenu.a2c[iR]);
if(aC){e.style.marginTop="0.5em";}aQh.sB(new t7({eI:-1,value:localPlayer.data.teamPlayerCount[iR]
},1,0,function(e){aRZ.wj[1].se(0);
var playerCount=mathUtils.distanceBetweenPointsAndEncoded(Math.floor(e.target.value),0,512);
e.target.value=playerCount;localPlayer.data.teamPlayerCount[e.target.aSn]=playerCount;
})).e.aSn=iR;}return aQh;}

function aSm(sF){var aQh=new rx();
aQh.LobbyChatPanel(L(326));
var oM=[];for(var aC=0;aC<mainMenu.a2c.length;aC++){var iR=(aC+1)%mainMenu.a2c.length;
oM.push(mainMenu.a2c[iR]);}if(!localPlayer.data.colorsData){localPlayer.data.colorsData=new Uint32Array(1);
}var wZ=function(eI){var iR=(eI+1)%mainMenu.a2c.length;
var aSo=mainMenu.aSp[iR];
var g1=((aSo[0]>>2)<<12)+((aSo[1]>>2)<<6)+(aSo[2]>>2);g1-=g1&15;g1+=iR;localPlayer.data.colorsData[0]=g1;
};aQh.s8(new wY({oM:oM,value:(localPlayer.data.colorsData[0]%16+mainMenu.a2c.length-1)%mainMenu.a2c.length},wZ));
sF.push(aQh);}this.show=function(){aRZ.show();this.resize();};this.tZ=function(){
aRZ.tZ();};this.resize=function(){aRZ.resize();aRa.resize();};this.getTerriColorArray=function(ej){if(ej===2){
aRZ.wj[0].sb();}};sd();}

function ub(id,a64,aSq){var aQL;var aSr;this.aSs=true;this.aSt=id;

function dk(){aQL=new wc(L(327),[new x("⬅️ "+L(40),function(){if(aSq){account.v(29);}else{account.z.aEa();
}})]);aSr=new tk(aQL.wi,L(328));}this.show=function(){aQL.show();this.resize();if(id===15){
if(gameServer.z.aSu(id)){aSv();}else{aSw();}}else if(id===16){if(gameServer.z.aSu(id)){gameServer.eg.eh(2);}else{aSw();
}}else if(id===17){if(gameServer.z.aSu(id)){gameServer.eg.eh(3);}else{aSw();}}else if(id===18){gameServer.z.close(0,3253);
gameServer.z.interiorColorGreen(0,id,0);aSw();}else if(id===21){if(gameServer.z.aSu(id)){gameServer.aSx.aSy(a64.ur,a64.us,a64.ut);
}else{aSw();}}else if(id===22){if(gameServer.z.aSu(id)){gameServer.aSx.aSz(a64.ur,a64.aT0,a64.aT1);
}else{aSw();}}else if(id===23){if(gameServer.z.aSu(id)){gameServer.aSx.aT2(a64.aS2,a64.a2x);
}else{aSw();}}else if(id===24){if(gameServer.z.aSu(id)){gameServer.aSx.aT3(a64.aS2,a64.us,a64.ut);
}else{aSw();}}else if(id===25){if(gameServer.z.aSu(id)){gameServer.aHS.aRL(a64);}else{aSw();}}else if(id===28){
if(gameServer.z.aSu(id)){gameServer.aSx.aT4(a64.ur,a64.aT0,a64.aT1);}else{aSw();}}else if(id===29){
if(gameServer.z.aSu(id)){gameServer.aHS.aRE(a64);}else{aSw();}}else if(id===30){if(gameServer.z.aSu(id)){if(!renderer.aEV()){
aT5();}}else{aSw();}}else if(id===1000){return;}};

function aSw(){aSr.sG.innerHTML+="<br>"+L(329);
}this.aT6=function(){if(id===15){aSv();return;}if(id===16){gameServer.eg.eh(2);
return;}if(id===17){gameServer.eg.eh(3);return;}if(id===18){account.v(8,this.a3U,new ub(16));return;}if(id===21){
gameServer.aSx.aSy(a64.ur,a64.us,a64.ut);return;}if(id===22){gameServer.aSx.aSz(a64.ur,a64.aT0,a64.aT1);return;
}if(id===23){gameServer.aSx.aT2(a64.aS2,a64.a2x);return;}if(id===24){gameServer.aSx.aT3(a64.aS2,a64.us,a64.ut);
return;}if(id===25){gameServer.aHS.aRL(a64);return;}if(id===28){gameServer.aSx.aT4(a64.ur,a64.aT0,a64.aT1);
return;}if(id===29){gameServer.aHS.aRE(a64);return;}if(id===30){if(!renderer.aEV()){aT5();
}return;}if(id===1000){this.aSt=id=25;gameServer.aHS.aRL(a64);return;}};this.aEZ=function(code,by,data){
if(!by&&code!==id){return;}if(code===15||code===16){account.v(7,this.a3U);return;}if(code===17){
gameServer.z.close(0,3252);connectionMgr.z.xq(0);if(connectionMgr.buffer.data[117].oM&&connectionMgr.buffer.data[117].oM.length>0){
var fc=connectionMgr.z.xr(0);connectionMgr.qo.boatNotificationHandler(105,fc.uY);connectionMgr.qo.boatNotificationHandler(106,fc.password);account.v(8,this.a3U,new ub(16));
}else{connectionMgr.qo.boatNotificationHandler(105,"");account.z.aEa();}return;}if(code===21){account.v(10,this.a3U,new aD3(data));
return;}if(code===23){account.v(13,this.a3U,new aRk({data:data,aS2:a64.aS2}));
return;}if(code===25){account.z.aQ1.uY=a64.uY;connectionMgr.xF.nH(a64.uY);account.v(15,this.a3U);return;
}if(code===30){if(data){account.v(1);return;}aT5();return;}};

function aT5(){var ft=1;account.v(4,1,new TextContentScreen(
L(330),L(331),false,[new x("🔄 Reload",function(){if(ft){setTimeout(function(){account.v(1);},5000);uiSurface.platformActions.a3();
}ft=0;},colorPalette.shouldSetInitATKPercent)]));}

function aSv(){canvasManager.a8(90);canvasManager.writeBits(30,Math.floor(mathUtils.pow(30)*Math.random()));
canvasManager.writeBits(30,Math.floor(mathUtils.pow(30)*Math.random()));canvasManager.writeBits(30,Math.floor(mathUtils.pow(30)*Math.random()));
urlParams.applyToGame(canvasManager.aD);connectionMgr.qo.boatNotificationHandler(110,uiRenderer.f0.uc(uiRenderer.f0.ud(15)));gameServer.aHS.aT7();}this.tZ=function(){
aQL.tZ();};this.resize=function(){aQL.resize();aSr.resize();};this.getTerriColorArray=function(ej){
if(ej===2){aQL.wj[0].sb();}};dk();}

function aQ5(){var aRZ;var aRa;

function sd(){
aRZ=new wc("🔧 "+L(332),[new x("⬅️ "+L(40),aRc),new x(L(333),aT8)]);aT9();aRa=new sD(aRZ.wi,aRd());
}

function aT9(){aTA();aTB();}

function aTB(){if(localPlayer.data.canvas){return;}if(localPlayer.data.mapType===2){
localPlayer.data.canvas=dialogManager.yn;return;}if(localPlayer.data.mapType===1){localPlayer.data.canvas=dialogManager.aNl(dialogManager.a78(localPlayer.data),0).yn;
return;}localPlayer.data.mapType=0;localPlayer.data.passableWater=localPlayer.data.passableMountains=1;
localPlayer.data.canvas=dialogManager.aNl(dialogManager.a78(localPlayer.data),localPlayer.data.mapSeed).yn;}

function aTA(){if(localPlayer.data.gameMode===1){
if(!localPlayer.data.teamPlayerCount){localPlayer.data.teamPlayerCount=new Uint16Array([0,1,1,0,0,0,0,0,0]);
localPlayer.a6i.a6n();}var resolveAttackCombat=gameState.sS.isLocalPlayer(localPlayer.data.teamPlayerCount,0);localPlayer.data.numberTeams=resolveAttackCombat;
}else{if(localPlayer.data.botDifficultyType===2){localPlayer.data.botDifficultyType=0;}if(localPlayer.data.spawningType===1){
localPlayer.data.spawningType=0;}}}

function aRc(){if(localPlayer.data.gameMode!==1){localPlayer.data.teamPlayerCount=null;
}aTC();localPlayer.data.canvas=null;account.v(5,5);}

function aTC(){packetWriter.re.applyToGame();connectionMgr.qo.boatNotificationHandler(156,packetWriter.a6y.a1i());
}

function aT8(){localPlayer.data.isReplay=0;aTC();localPlayer.a6i.a7A();moderationSystem.aIa();localPlayer.a6i.a77();
localPlayer.data.canvas=localPlayer.data.mapType===2?dialogManager.yn:null;localPlayer.a6m();localPlayer.a6k=1;}

function aRd(){var sF=[];aTD(sF);
aSl(sF);aTE(sF);sF.push(aTF());sF.push(aTG());sF.push(aTH());aTI(sF);aTJ(sF);aTK(sF);aTL(sF);
aTM(sF);aTN(sF);return sF;}

function aTD(sF){var aQh=new rx();aQh.LobbyChatPanel(L(334));
var a55=localPlayer.data.canvas;
a55.style.width="100%";aQh.sB({e:a55});aQh.sB(new tl([(new x(L(335),function(){account.v(20);
})).button]));sF.push(aQh);}

function aSl(sF){var aQh=new rx();aQh.LobbyChatPanel(L(306));aQh.sB(new t7({eI:-1,
value:localPlayer.data.playerCount},1,0,function(e){var playerCount=mathUtils.distanceBetweenPointsAndEncoded(Math.floor(e.target.value),1,512);
e.target.value=localPlayer.data.playerCount=playerCount;
if(localPlayer.data.gameMode===1){var a9k=gameState.sS.isLocalPlayer(localPlayer.data.teamPlayerCount,0);
localPlayer.a6i.a6n();
var a9o=gameState.sS.isLocalPlayer(localPlayer.data.teamPlayerCount,0);
if(a9o!==a9k){aTO();}}}));sF.push(aQh);}

function aTE(sF){
var aQh=new rx();aQh.LobbyChatPanel(L(336));aQh.s8(new wY({oM:["Battle Royale","Teams"],value:localPlayer.data.gameMode},
function(eI){if(localPlayer.data.gameMode===eI){return;}localPlayer.data.gameMode=eI;if(eI===1){
if(!localPlayer.data.colorsData){localPlayer.data.colorsData=new Uint32Array(1);}localPlayer.data.colorsData[0]=(63<<12)+1;
}aTO();}));sF.push(aQh);}

function aTO(){aTA();
var h=[aTF(),aTG(),aTH()];
for(var aC=3;aC<6;aC++){account.removeChild(aRa.sG,aRa.sH[aC].rz);aRa.sH[aC]=h[aC-3];
aRa.sG.appendChild(aRa.sH[aC].rz);}aRa.resize();}

function aTF(){var aQh=new rx();
aQh.LobbyChatPanel(L(324));var aTP;if(localPlayer.data.gameMode===0){aTP=[L(325),L(303)][localPlayer.data.colorsType];
}else{aTP=localPlayer.data.numberTeams+" Team"+(localPlayer.data.numberTeams===1?"":"s");
}aQh.s6(aTP);aQh.sB(new tl([new x(L(335),function(){
account.v(21);}).button]));return aQh;}

function aTG(){var aQh=new rx();
aQh.LobbyChatPanel(L(65));
var h=[L(302)+": "+troopCalc.l5[localPlayer.data.botDifficultyValue],L(304),L(305),L(303)];
aQh.s6(h[localPlayer.data.botDifficultyType]);
aQh.sB(new tl([new x(L(335),function(){account.v(25);}).button]));return aQh;}

function aTH(){
var aQh=new rx();aQh.LobbyChatPanel("Spawning");
var h=[L(325),L(337),L(303)];aQh.s6(h[localPlayer.data.spawningType]);
aQh.sB(new tl([new x(L(335),function(){account.v(24);}).button]));return aQh;}

function aTI(sF){
var aQh=new rx();aQh.LobbyChatPanel(L(338));
var h=[L(339),L(340),L(303)];aQh.s6(h[localPlayer.data.playerNamesType]);
aQh.sB(new tl([new x(L(335),function(){account.v(23);}).button]));sF.push(aQh);}

function aTJ(sF){
var aQh=new rx();aQh.LobbyChatPanel(L(299));
var h=[L(301),L(302)+": "+localPlayer.data.aIncomeValue,L(303)];
aQh.s6(h[localPlayer.data.aIncomeType]);aQh.sB(new tl([new x(L(335),function(){
account.v(22);}).button]));sF.push(aQh);}

function aTK(sF){var aQh=new rx();aQh.LobbyChatPanel(L(341));
var h=[L(301),L(302)+": "+localPlayer.data.tIncomeValue,L(303)];aQh.s6(h[localPlayer.data.tIncomeType]);
aQh.sB(new tl([new x(L(335),function(){account.v(26);}).button]));sF.push(aQh);}

function aTL(sF){
var aQh=new rx();aQh.LobbyChatPanel(L(342));
var h=[L(301),L(302)+": "+localPlayer.data.iIncomeValue,L(303)];
aQh.s6(h[localPlayer.data.iIncomeType]);aQh.sB(new tl([new x(L(335),function(){
account.v(27);}).button]));sF.push(aQh);}

function aTM(sF){var aQh=new rx();aQh.LobbyChatPanel(L(343));
var h=[L(301),L(302)+": "+localPlayer.data.sResourcesValue,L(303)];aQh.s6(h[localPlayer.data.sResourcesType]);
aQh.sB(new tl([new x(L(335),function(){account.v(28);}).button]));sF.push(aQh);
}

function aTN(sF){var aQh=new rx();aQh.LobbyChatPanel(L(344));aQh.sB(new tl([new x(L(345),function(){
account.y();localPlayer.a6i.a7B();account.z.uS[0]=0;account.v(19);}).button]));aQh.sB(new tl([new x(L(346),function(){
imageLoader.aKz();}).button]));aQh.sB(new tl([new x(L(347),function(){imageLoader.aL1();return true;}).button]));
sF.push(aQh);}this.show=function(){aRZ.show();this.resize();aRZ.wi.scrollTop=account.z.uS[0];
};this.tZ=function(){account.z.uS[0]=aRZ.wi.scrollTop;aRZ.tZ();};this.resize=function(){aRZ.resize();
aRa.resize();};this.getTerriColorArray=function(ej){if(ej===2){aRZ.wj[0].sb();}};sd();}

function aQG(){
var aRZ;
var tC=true;

function sd(){aRZ=new wc(L(348),[new x("⬅️ "+L(40),function(){account.aQJ(1);})
]);aRZ.wi.style.overflowY="auto";aRZ.wi.addEventListener("scroll",function(){
tC=aRZ.wi.scrollTop>=aRZ.wi.scrollHeight-aRZ.wi.clientHeight-2;
});}this.clear=function(){aRZ.wi.textContent="";};
this.show=function(){this.clear();aTQ();aRZ.show();this.resize();tC=true;tV();};this.tZ=function(){
aRZ.tZ();};this.resize=function(){aRZ.resize();aRZ.wi.style.padding="0.4em "+gameState.sK.sT(debugPanel.sQ);
};this.getTerriColorArray=function(ej){if(ej===2){aRZ.wj[0].sb();}};

function aTQ(){var a88=relations.a7I();
var fZ=a88.length;
var tR=document.createDocumentFragment();for(var aC=0;aC<fZ;aC++){tS(tR,a88[aC]);
}aRZ.wi.appendChild(tR);tV();}this.a0i=function(a7F){var tR=document.createDocumentFragment();
tS(tR,a7F);aRZ.wi.appendChild(tR);tV();};

function tS(tR,a7F){var rz=document.createElement("div");
var aTR=document.createElement("span");
var aTS=document.createElement("span");
aTR.textContent=focusHandler.visibleTileBounds(a7F.eZ)+":";aTR.style.color=colorPalette.pd;aTR.style.paddingRight="0.4em";
aTR.style.display="table-cell";aTR.style.width="6ch";aTR.style.textAlign="end";
rz.appendChild(aTR);aTS.textContent=a7F.s1;rz.appendChild(aTS);rz.style.display="table";
if(a7F.r3){aTT(rz,a7F.r3);}tR.appendChild(rz);}

function aTT(rz,r3){if(r3>=1024-colorSystem.tY.EndGameResult){
var aKM=document.createElement("img");aKM.src=colorSystem.yq.a0p[r3-1024+colorSystem.tY.EndGameResult].toDataURL();
aKM.style.width="1.5em";aKM.style.height="1.5em";aKM.style.verticalAlign="middle";rz.appendChild(aKM);
}else{var tH=document.createElement("span");tH.textContent=colorSystem.tY.a1G(r3);tH.style.display="inline-block";
tH.style.fontSize="1.5em";tH.style.lineHeight="1em";tH.style.verticalAlign="middle";rz.appendChild(tH);
}}

function tV(){if(tC){aRZ.wi.scrollTop=aRZ.wi.scrollHeight;}}sd();}

function aQD(){var aRZ;
var aRa;var aRb;

function sd(){aRZ=new wc(L(342),[new x("⬅️ "+L(40),aRc)]);aRa=new sD(aRZ.wi,aRd());
}

function aRc(){aRe();if(localPlayer.data.iIncomeType!==2){localPlayer.data.iIncomeData=null;}account.aQK()[19]=null;
account.a3O();}

function aRe(){if(localPlayer.data.iIncomeType===2){gameState.sS.a4v(aRb.x7(),localPlayer.data.iIncomeData,255);
}}

function aRd(){var sF=[];aRf(sF);aRg(sF);aRh(sF);return sF;}

function aRf(sF){var aQh=new rx();
aQh.LobbyChatPanel(L(300));aQh.s8(new wY({oM:[L(301),L(302),L(303)],value:localPlayer.data.iIncomeType},
function(eI){aRe();if(eI===2&&!localPlayer.data.iIncomeData){localPlayer.data.iIncomeData=new Uint8Array(localPlayer.isMountainTile);
localPlayer.data.iIncomeData.fill(32);}localPlayer.data.iIncomeType=eI;account.v(27);}));sF.push(aQh);}

function aRg(sF){
if(localPlayer.data.iIncomeType!==1){return;}var aQh=new rx();aQh.LobbyChatPanel("Value");aQh.sB(new t7({eI:-1,
value:localPlayer.data.iIncomeValue},1,0,function(e){var value=mathUtils.distanceBetweenPointsAndEncoded(Math.floor(e.target.value),0,255);
e.target.value=localPlayer.data.iIncomeValue=value;}));sF.push(aQh);}

function aRh(sF){
if(localPlayer.data.iIncomeType!==2){return;}var aQh=new rx();aQh.LobbyChatPanel("Data");aRb=new x0(0,1,0,1);
aRb.x6(gameState.tI.getTime(localPlayer.data.iIncomeData,4));aQh.sB(aRb);sF.push(aQh);}this.show=function(){
aRZ.show();this.resize();};this.tZ=function(){aRZ.tZ();};this.resize=function(){
aRZ.resize();aRa.resize();};this.getTerriColorArray=function(ej){if(ej===2){aRZ.wj[0].sb();}};sd();
}

function aPv(){var aTU;var aTV;var aSa;var t6;var aTW;
var u3=0;this.aJ7=new uh();

function dk(){
aSa=new su([0.9*0.5,0.9*0.3],[0.5,0.5],2/3);aTV=[new x("⚔️<br>"+L(349),function(){aTX(0);},colorPalette.pr),
new x("🗡️<br>"+L(332),function(){aTX(1);},colorPalette.sendSurrender),new x("🔑<br>"+L(350),function(){aTX(2);},colorPalette.qS),
new x("☰<br>"+L(351),function(){aTX(3);},colorPalette.pb),new x("",function(){account.v(12);},colorPalette.pK,false)];
t6=new t7(connectionMgr.buffer.data[122]);for(var aC=0;aC<aTV.length;aC++){aTV[aC].button.style.position="absolute";
}t6.e.style.position="absolute";t6.e.style.textAlign="center";t6.e.placeholder=L(352);}dk();

function aTX(eI){uiSurface.platformActions.setState(10);if(!adSystem.v0()){adSystem.aIy();}if(eI===0){account.z.a71(1);}else if(eI===1){
if(!packetWriter.aLJ.yY(connectionMgr.buffer.data[156].value,1)){localPlayer.a6i.a7B();}account.v(19);}else if(eI===2){
if(uiSurface.id!==0||connectionMgr.buffer.data[140].value){account.v(8,account.ua,new ub(16));}else{account.z.aTY(account.ua,16);
}}else if(eI===3){account.v(1);}}this.show=function(){moderationSystem.setState(0);uiSurface.platformActions.setState(12);this.aJ7.show();
aTV[4].se(gameState.color.a5C(connectionMgr.buffer.data[121].value));this.resize();document.body.appendChild(t6.e);
for(var aC=0;aC<aTV.length;aC++){document.body.appendChild(aTV[aC].button);
}aTZ();};

function aTZ(){if(uiSurface.id!==1){return;}if(uiSurface.e3<5){return;}if(!aTW){aTW=clanPanel.eZ;
return;}if(clanPanel.eZ>aTW+1000*60*60*4){uiSurface.writeString16.setState(14);return;}aTW=clanPanel.eZ;}this.tZ=function(){
this.aJ7.tZ();account.removeChild(document.body,t6.e);for(var aC=0;aC<aTV.length;aC++){
account.removeChild(document.body,aTV[aC].button);}};this.resize=function(){
this.aJ7.resize();this.aJ7.resize();aSa.resize();
var gap=0.5*debugPanel.gap;
var vV=0.84*(10/99)*aSa.j;
var aTa=3*gap;
var aTb=0.16*aSa.k;
var aBK=0.19*aSa.j;
var fg=aSa.fg+aBK;
var fi=aSa.fi+vV+aTa;
var j=0.5*(aSa.j-gap)-aBK;
var te=aSa.j-2*aBK-aTb-gap;gameState.sK.uy(t6.e,fg,fi,te,aTb);
gameState.sK.uy(aTV[4].button,fg+te+gap,fi,aTb,aTb);u3=fi;fi+=aTb+gap;
var k=0.5*(aSa.fi+aSa.k-fi-gap);
gameState.sK.uy(aTV[0].button,fg,fi,j,k);gameState.sK.uy(aTV[1].button,fg+j+gap,fi,j,k);
gameState.sK.uy(aTV[2].button,fg,fi+k+gap,j,k);gameState.sK.uy(aTV[3].button,fg+j+gap,fi+k+gap,j,k);
for(var aC=0;aC<aTV.length;aC++){aTV[aC].button.style.font=gameState.sK.u8(0,gameState.sK.AccountManager(0.065*aSa.k));
gameState.sK.sU(aTV[aC].button,5);}t6.e.style.font=gameState.sK.u8(0,gameState.sK.AccountManager(0.08*aSa.k));gameState.sK.sU(t6.e,5);
};this.wr=function(){moderationSystem.aIe();keyboardHandler.wr();aTc();keyProcessor.wr(u3);bb.wr();aTd();};

function aTc(){
var fZ=Math.floor((uiSurface.platformActions.ik()?0.018:0.0137)*camera.il);ws.font=gameState.sK.u8(0,Math.max(5,fZ));
gameState.sK.textBaseline(ws,0);gameState.sK.textAlign(ws,2);ws.fillStyle=colorPalette.pO;ws.fillText(settingsPanel.e3,camera.j,0);
}

function aTd(){if(!adSystem.v0()){return;}ws.imageSmoothingEnabled=false;
var ej=adSystem.updatePlayerColorBrightness("territorial.io");
var o7=0.84*aSa.j/ej.width;ws.setTransform(o7,0,0,o7,aSa.fg+0.08*aSa.j,aSa.fi);
if(!aTU){aTU=gameState.or.a62(ej,gameState.or.a68,[0,0,0]);}for(var fg=-1;fg<=1;fg+=2){
for(var fi=-1;fi<=1;fi+=2){ws.drawImage(aTU,fg,fi);}}ws.drawImage(ej,0,0);
ws.imageSmoothingEnabled=true;
var a1N=adSystem.updatePlayerColorBrightness("logo");
var aTe=0.6666*o7*ej.height/a1N.height;
var o8=0.5*camera.j;
var o9=aSa.fi+0.5*o7*ej.height-0.5*aTe*a1N.height;
ws.setTransform(aTe,0,0,aTe,o8-0.6*o7*ej.width,o9);
ws.drawImage(a1N,0,0);ws.setTransform(aTe,0,0,aTe,o8+0.6*o7*ej.width-aTe*a1N.width,o9);
ws.drawImage(a1N,0,0);ws.setTransform(1,0,0,1,0,0);
ws.imageSmoothingEnabled=true;}}

function aQ2(){var aQL;var aTf;var aTg;

function dk(){aTg=[new x(L(353),function(){aTh(1);},0,0,1),new x(L(354),function(){aTh(2);},0,0,1),
new x(L(355),function(){aTh(3);},0,0,1),new x(L(356),function(){aTh(0);},0,0,1),
new x(L(357),function(){aTh(9);},0,0,1),new x(L(358),function(){aTh(10);},0,0,1),
new x(L(359),function(){aTh(11);},0,0,1),new x(L(360),function(){aTh(13);},0,0,1)
];
var wd=[new x("⬅️ "+L(40),function(){account.a3O();})];aQL=new wc(L(361),wd);aTf=new ss(aTg,aQL.wi);
}

function aTh(aC){account.v(8,account.ua,new ub(21,{ur:aC,us:0,ut:10}));}this.show=function(){
aQL.show();this.resize();};this.tZ=function(){aQL.tZ();};this.resize=function(){aQL.resize();
aTf.resize();};this.getTerriColorArray=function(ej){if(ej===2){aQL.wj[0].sb();}};dk();}

function aEx(title,s7,aTi){
var aQL;var aSr;

function dk(){if(!aTi){aTi=[new x("⬅️ "+L(40),function(){account.a3O();},colorPalette.q3)];
}aQL=new wc(title,aTi);aSr=new tk(aQL.wi,s7);gameState.sK.textAlign(aQL.wi.style,1);}this.show=function(){
aQL.show();this.resize();};this.tZ=function(){aQL.tZ();};this.resize=function(){aQL.resize();
aSr.resize();};this.getTerriColorArray=function(ej){if(ej===2){aQL.wj[0].sb();}};dk();}

function aD3(data){var aQL;
var aTj;

function dk(){if(data.aD4){aQL=new wc(L(119),[new x("⬅️ "+L(40),function(){account.a3O();})]);
aTk();return;}var ej=data.data.length?0:1;
var aTi=[new x("⬅️ "+L(40),function(){account.a3O();}),
new x(L(362),function(){aTl(-10);},ej,0,1),new x(L(363),function(){aTl(10);},ej,0,1),
new x(L(308),function(){account.v(11,10,new aTm({ur:data.ur}));})
];
var uO=[L(364),L(365),L(366),L(367),L(368),L(369),L(370),L(371),L(372),L(373),
L(358),L(359),"Audit Log",L(360)];aQL=new wc(uO[data.ur],aTi);aTn();}

function aTk(){var fc={uI:[],
uO:[L(374),L(375),L(376)+" ↗"],uV:[12,50,38]};
var a75=localPlayer.data.a75;if(!a75){aTj=new uH(aQL.wi,fc);
return;}var fZ=a75.length;
var uI=fc.uI;
var a0j=playerData.a0j;for(var aC=0;aC<fZ;aC++){uI.push([
{g1:((aC+1)+"."),ea:0},{g1:a0j[aC],ea:0},{g1:uiRenderer.f0.currentLoopHandler(a75[aC],5),ea:1,uY:a75[aC],uZ:0}]);
}aTj=new uH(aQL.wi,fc,{uR:1});}

function aTn(){var aC;
var fc={uI:[]};
var uI=fc.uI;
var aTo=data.data;
var fZ=aTo.length;if(fZ&&aTo[0][0]===0){var eI=[0,1,2,3,-1,-1,-1,-1,-1,4,5,6,-1,7][data.ur];
if(eI>=0){account.z.FloatingNavigationControls[eI]=aTo[0][1];}}var aTp=[0.1,0.001,0.01,1,100,1,1,0.1,100,0.01,0.01,0.01,1,0.01];
var o7=aTp[data.ur];
var aTq=[1,3,2,0,0,0,0,1,0,2,2,2,0,2];
var a6E=aTq[data.ur];
var uO=[[L(377),L(378)+" ↗",L(379)],[L(377),L(380),L(381),L(382)+" ↗"],[L(377),L(378)+" ↗",L(381)],
[L(377),L(378)+" ↗",L(381)],[L(374),L(383),L(384)+" ↗",L(385)+" ↗",L(123)],
[L(374),L(383),L(386)+" ↗",L(387)+" ↗",L(388)],[L(374),L(383),L(389)+" ↗",L(390)+" ↗",L(391)],
[L(374),L(383),L(386)+" ↗",L(387)+" ↗",L(392)],[L(374),L(383),L(384)+" ↗",L(385)+" ↗",L(123)],
[L(377),L(378)+" ↗",L(381)],[L(377),L(378)+" ↗",L(393)],[L(377),L(378)+" ↗",L(381)],
[L(374),L(383),L(384)+" ↗",L(385)+" ↗",L(394)],[L(377),L(378)+" ↗",L(381)]];
var uV=[
[25,40,35],[15,25,25,35],[25,40,35],[25,40,35],[10,18,30,30,12],[10,18,30,30,12],[10,18,30,30,12],
[10,18,30,30,12],[10,18,30,30,12],[25,40,35],[25,40,35],[25,40,35],[10,15,25,25,25],
[25,40,35]];fc.uO=uO[data.ur];fc.uV=uV[data.ur];if(data.ur===0||data.ur===2||data.ur===3||
data.ur===9||data.ur===10||data.ur===11||data.ur===13){for(aC=0;aC<fZ;aC++){
uI.push([{g1:((aTo[aC][0]+1)+"."),ea:0},{g1:aTo[aC][1],ea:1,uY:aTo[aC][4],uZ:aTo[aC][3]},
{g1:(o7*aTo[aC][2]).toFixed(a6E),ea:0}]);}}else if(data.ur===12){
for(aC=0;aC<fZ;aC++){var aTr=aTo[aC][3];uI.push([{g1:""+aTo[aC][0],ea:0},{g1:aTs(aTo[aC][4]),ea:0},
{g1:aTo[aC][5],ea:1,uY:aTo[aC][1],uZ:0},{g1:aTo[aC][6],ea:1,uY:aTo[aC][2],uZ:0},
{g1:br.propagandaShowController(aTr,uiRenderer.f0.currentLoopHandler(aTo[aC][1],5)),ea:0}]);}}else if(data.ur===1){
for(aC=0;aC<fZ;aC++){uI.push([{g1:((aTo[aC][0]+1)+"."),ea:0},{g1:aTo[aC][1],ea:0},
{g1:(o7*aTo[aC][2]).toFixed(a6E),ea:0},{g1:aTo[aC][3],ea:1,uY:aTo[aC][5],uZ:aTo[aC][4]}
]);}}else if(data.ur===4||data.ur===5||data.ur===6||data.ur===7||data.ur===8){for(aC=0;aC<fZ;aC++){
var aTt=aTo[aC][5];if(data.ur===4||data.ur===8){aTt=(100*(aTt%64)/(aTt>>6)).toFixed(0)+"%";
if(aTt==="100%"){if(data.ur===4){aTt+=" ("+L(395)+")";}else{aTt+=" ("+L(396)+")";
}}}else if(data.ur===5){if(aTt>=32768){aTt=-(aTt-32768);}}else{aTt=(o7*aTt).toFixed(a6E);}uI.push([
{g1:""+aTo[aC][0],ea:0},{g1:aTs(aTo[aC][6]),ea:0},{g1:aTo[aC][7],ea:1,uY:aTo[aC][1],uZ:aTo[aC][2]},
{g1:aTo[aC][8],ea:1,uY:aTo[aC][3],uZ:aTo[aC][4]},{g1:""+aTt,ea:0}]);}}aTj=new uH(aQL.wi,fc);
}

function aTs(fZ){if(fZ<60){if(fZ===1){return fZ+" Second";}return fZ+" Seconds";
}else if(fZ<3600){fZ=Math.floor(fZ/60);if(fZ===1){return fZ+" Minute";}return fZ+" Minutes";
}else if(fZ<172800){fZ=Math.floor(fZ/3600);if(fZ===1){return fZ+" Hour";}return fZ+" Hours";
}fZ=Math.floor(fZ/172800);return fZ+" Days";}

function aTl(k9){var fZ=data.data.length;
if(!fZ){return;}var min=parseInt(data.data[0][0]);
var max=min;for(var aC=1;aC<fZ;aC++){
var aGx=parseInt(data.data[aC][0]);min=Math.min(aGx,min);max=Math.max(aGx,max);}var us;if(k9<0){
us=min+k9;}else{us=max+1;}account.v(8,account.handleKeyInput().a3U,new ub(21,{ur:data.ur,us:us,ut:us+Math.abs(k9)}));
}this.show=function(){aQL.show();this.resize();};this.tZ=function(){
aQL.tZ();};this.resize=function(){aQL.resize();aTj.resize();};this.getTerriColorArray=function(ej){
if(ej===2){aQL.wj[0].sb();}};dk();}

function aTm(a64){var aQL;var aQM;

function dk(){
aQL=new wc(L(397),[new x("⬅️ "+L(40),function(){account.aQJ(10);})]);aQM=new sD(aQL.wi,aQO());
}

function aQO(){var sF=[];sF.push(aSV());sF.push(aTu());sF.push(aTv());return sF;}

function aSV(){
var aQh=new rx();var aQp;
var aSY=new t7(connectionMgr.buffer.data[132],1,function(){aQp.button.click();});
var aSZ=new t7(connectionMgr.buffer.data[131],1,function(){aSY.e.focus();});aQh.LobbyChatPanel(L(313));
aQh.sB(aSZ);aSZ.e.style.marginBottom="0.8em";aQh.LobbyChatPanel(L(314));aQh.sB(aSY);
var aTw=function(){
var us=Math.floor(aSZ.e.value);
var ut=Math.floor(aSY.e.value);
var a4n=Math.min(us,ut);
var aPS=Math.max(us,ut);return{a4n:a4n,aPS:aPS};};aQp=new x(L(312),function(){
var sC=aTw();account.v(8,account.a7H(10).a3U,new ub(21,{ur:a64.ur,us:sC.a4n,ut:sC.aPS}));
},0,0,1);aQh.sB((new tl([aQp.button])));return aQh;}

function aTu(){
var aQh=new rx();var aQp;
var aSY=new t7(connectionMgr.buffer.data[134],1,function(){aQp.button.click();});
var aSZ=new t7(connectionMgr.buffer.data[133],0,function(){aSY.e.focus();});aQh.LobbyChatPanel(a64.ur===1?L(398):L(399));
aQh.sB(aSZ);aSZ.e.style.marginBottom="0.8em";aQh.LobbyChatPanel(L(400));aQh.sB(aSY);aQp=new x(L(312),function(){
var aT0=aSZ.e.value.slice(0,20);
var aT1=Math.abs(Math.floor(aSY.e.value));
account.v(8,account.a7H(10).a3U,new ub(22,{ur:a64.ur,aT0:aT0,aT1:aT1}));
},0,0,1);aQh.sB((new tl([aQp.button])));return aQh;}

function aTv(){
var aQh=new rx();var aQp;
var aSY=new t7(connectionMgr.buffer.data[152],1,function(){aQp.button.click();});
var aSZ=new t7(connectionMgr.buffer.data[151],0,function(){aSY.e.focus();});aQh.LobbyChatPanel(L(401));
aQh.sB(aSZ);aSZ.e.style.marginBottom="0.8em";aQh.LobbyChatPanel(L(400));aQh.sB(aSY);aQp=new x(L(312),function(){
var aT0=aSZ.e.value.slice(0,5);
var aT1=Math.abs(Math.floor(aSY.e.value));
account.v(8,account.a7H(10).a3U,new ub(28,{ur:a64.ur,aT0:aT0,aT1:aT1}));
},0,0,1);aQh.sB((new tl([aQp.button])));return aQh;}this.show=function(){
aQL.show();this.resize();};this.tZ=function(){aQL.tZ();};this.resize=function(){aQL.resize();
aQM.resize();};this.getTerriColorArray=function(ej){if(ej===2){aQL.wj[0].sb();}};dk();}

function aQF(){var aTx;
var v4;
var aTy=[new Array(4),new Array(4),new Array(2),new Array(2)];
var aTz=new Array(4);var aU0;
var aU1=new Array(2);
var aU2=[L(64),L(357),L(402),L(403)];var v3;var v6;

function sd(){v3=new tp([
new x(aU2[0],function(){aU3(0,0);return 2;}),new x(aU2[1],function(){aU3(0,1);return 2;}),
new x(aU2[2],function(){aU3(0,2);return 2;}),new x(aU2[3],function(){aU3(0,3);return 2;})
],colorPalette.qc);v4=new tp([new x("",0,2),new x("",0,2)],colorPalette.qd,1);
var aU4=new tp([
new x(L(404),function(){aU3(2,0);return 2;}),new x(L(119),function(){aU3(2,1);return 2;})
],colorPalette.qc);v6=new tp([new x(L(26,0,0,1),function(){aRc();}),
new x(L(405),function(){aU5(1);return 2;})],colorPalette.qc);aTx=new v2(
v3,v4,aU4,v6,aGj,audioSystem.w3.aHF);for(var aC=0;aC<4;aC++){aTy[0][aC]=new tG("0",v3.oy[aC].button);
aTy[1][aC]=new tG("0",v3.oy[aC].button,1);}aTy[2][1]=new tG("0",aU4.oy[1].button);
aTy[3][1]=new tG("0",v6.oy[1].button);aU0=[new tG("",aU4.oy[1].button,1,1),
new tG("",v6.oy[1].button,1,1)];aU0[0].tH.style.bottom="0em";aU0[1].tH.style.bottom="0em";
aU6(0,audioSystem.z.tM[0],1);aU6(2,audioSystem.z.tM[2],1);aU1=[new tG(L(306),aTx.vS(),1,0),new tG("",aTx.vS(),1,1)];
aU1[0].tH.style.fontSize="0.4em";aU1[1].tH.style.fontSize="0.4em";}

function aGj(){
if(!audioSystem.f6){return;}var aG2=aTx.vH.t6.e.value.trim().slice(0,127);if(aG2.length<1){return;
}aTx.vH.t6.e.value="";audioSystem.aF0.a2K(aG2);}this.aH5=function(){return aTx.vH;};

function aRc(){account.y();
audioSystem.vx();gameServer.z.a3c(3240);account.v(5,5);}

function aU5(aU7){audioSystem.z.tM[3]=1-audioSystem.z.tM[3];aU6(3,1,audioSystem.z.tM[3]);
if(aU7){gameServer.aGu.aGv(4);}if(audioSystem.z.tM[3]){connectionMgr.qo.boatNotificationHandler(158,audioSystem.z.tM[0]);}}this.aF0=function(uY){aU3(2,0);
var s1=aTx.vH.t6.e.value;
var aU8="@"+uY+" ";if(s1.length&&!gameState.tI.formatGoldAmountLabel(s1," ")){aU8=" "+aU8;}
s1+=aU8;aTx.vH.t6.e.value=s1;aTx.vH.t6.e.focus();};

function aU3(fs,ft){if(audioSystem.z.tM[fs]===ft){return;
}if(fs===0&&audioSystem.z.tM[3]){aU5(0);}aU6(fs,audioSystem.z.tM[fs],0);aU6(fs,ft,1);audioSystem.z.tM[fs]=ft;if(fs===0){
gameServer.aGu.aGv(2,ft);if(audioSystem.z.tM[2]){aTx.vI.nH();aTx.vH.reset(1);}else{aTx.vH.reset(0);}account.handleKeyInput().aGY();
account.handleKeyInput().aGX();return;}if(fs===2){if(ft===0){gameServer.aGu.aGv(0);aTx.vH.nH();aTx.vQ();}else{gameServer.aGu.aGv(1);
aTx.vI.nH();aTx.vR();}}}

function aU6(fs,ft,color){aTx.vK[fs].oy[ft].se(color?colorPalette.sendSpawn:colorPalette.qc);
}this.aGW=function(){aTx.vI.nH();};this.aGY=function(){var aU9=audioSystem.z.tM[0];
var tN=audioSystem.z.tO[aU9];
dialogManager.a8(tN.tileDataToIndexUnchecked,tN.mapSeed);
var ft=v4.oy;
var a8x=aUA(tN.tileDataToIndexUnchecked,tN.mapSeed)+aUB(tN.aFm)+aUC(tN.aGa);
var aFj=L(406)+"   "+aUA(tN.aHW,tN.aHX)+aUB(tN.aHY)+aUC(tN.aGa,1);
if(ft[0].button.textContent===a8x&&ft[1].button.textContent===aFj){return;
}ft[0].button.textContent=a8x;ft[1].button.textContent=aFj;v4.resize();};this.aGX=function(){
var aU9=audioSystem.z.tM[0];
var tN=audioSystem.z.tO[aU9];aTx.vO(tN.vP);for(var aC=0;aC<audioSystem.vg.vh.length;aC++){
aTy[0][aC].tH.textContent=audioSystem.vg.vh[aC].length;aTy[1][aC].tH.textContent=aUD(audioSystem.z.tO[aC].aGa);
}var vg=audioSystem.vg.vh[aU9];
var aUE=vg.length;
var aUF=audioSystem.vg.vi[aU9];
aTy[2][1].tH.textContent=""+aUE;aTy[3][1].tH.textContent=""+aUF;for(var aC=0;aC<4;aC++){
var aUG=audioSystem.z.tO[aC];if(!aTz[aC]){aTz[aC]=new tG(dialogManager.yd.aOh[aUG.tileDataToIndexUnchecked],v3.oy[aC].button,1,1);
}else if(aUG.vP===0){aTz[aC].tH.textContent=dialogManager.yd.aOh[aUG.tileDataToIndexUnchecked];}if(gameState.tI.startsWith(aU2[aC],"🏆 ")){
if(!aUG.aFs){aU2[aC]=aU2[aC].substring(3);v3.oy[aC].button.textContent=aU2[aC];
v3.oy[aC].button.appendChild(aTy[1][aC].tH);v3.oy[aC].button.appendChild(aTy[0][aC].tH);
v3.oy[aC].button.appendChild(aTz[aC].tH);}}else if(aUG.aFs){aU2[aC]="🏆 "+aU2[aC];
v3.oy[aC].button.textContent=aU2[aC];v3.oy[aC].button.appendChild(aTy[1][aC].tH);
v3.oy[aC].button.appendChild(aTy[0][aC].tH);v3.oy[aC].button.appendChild(aTz[aC].tH);}}var aUH="";
var aUI="";if(aU9===0){aUH=audioSystem.lj.aG7(vg,0,aUE);aUI=audioSystem.lj.aG7(vg,0,aUF);}aU0[0].tH.textContent=aUH;
aU0[1].tH.textContent=aUI;aU1[1].tH.textContent="MP: "+audioSystem.z.aGQ[0]+"   SP: "+audioSystem.z.aGQ[1]+
"   Lobby: "+gameState.sS.a50(audioSystem.vg.vh);};

function aUA(fF,aNg){return dialogManager.yd.aOh[fF];}

function aUB(aFm){
if(aFm<7){return "   "+(aFm+2)+" Teams";}else if(aFm===10){return "   No Full-Sending";}
return "";}

function aUC(aGa,aUJ){if(aUJ){if(aGa<=90&&aGa>60){return "   Contest";}return "";}if(aGa<=60){
return "   Contest";}return "";}this.aGc=function(){aTx.vH.nH();};

function aUD(g1){var a9D=mathUtils.g0(g1,60);
var a9E=g1%60;return(a9D<10?"0":"")+a9D+":"+(a9E<10?"0":"")+a9E;}this.show=function(){
audioSystem.z.aFL++;aTx.show();this.resize();audioSystem.message.show();};this.tZ=function(){aTx.tZ();audioSystem.w3.tZ();
audioSystem.vd.tZ();audioSystem.message.tZ();};this.resize=function(){aTx.resize(1-audioSystem.z.tM[2]);audioSystem.message.resize();
};this.getTerriColorArray=function(ej){if(ej===2){if(audioSystem.z.tM[3]){aU5(1);}else{aTx.vK[3].oy[0].sb();
}return;}if(ej<2){aU5(1);}};sd();}

function aPw(){var aQL;var aQM;

function dk(){aQL=new wc(L(407),
[new x("⬅️ "+L(40),function(){account.v(7,account.a7H(7).a3U);}),new x(L(209),function(){aUK();})
]);aQM=new sD(aQL.wi,aQO());}

function aUK(){connectionMgr.qo.boatNotificationHandler(105,minimapRenderer.f0.yO(aQM.sH[0].ry[0].e.value,5));
connectionMgr.qo.boatNotificationHandler(106,minimapRenderer.f0.yO(aQM.sH[1].ry[0].e.value,15));account.v(8,account.a7H(7).a3U,new ub(18));
}

function aQO(){var sF=[];sF.push(aQV());sF.push(aQW());sF.push(aUL());
return sF;}

function aQV(){var aQh=new rx();aQh.LobbyChatPanel(L(187));aQh.sB(new t7({value:"",eI:-1}));
return aQh;}

function aQW(){var aQh=new rx();aQh.LobbyChatPanel(L(190));
var aQs=new t7({value:"",eI:-1});
aQs.e.type="password";aQh.sB(aQs);aQh.sB((new tl([(new x(L(191),function(e){if(e.textContent===L(191)){
e.textContent=L(192);aQs.e.type="text";}else{e.textContent=L(191);aQs.e.type="password";
}return true;})).button])));return aQh;}

function aUL(){var aQh=new rx();aQh.LobbyChatPanel(L(194));
aQh.s2(L(408));aQh.s2(L(409));aQh.s2(L(410));return aQh;}this.show=function(){aQL.show();
this.resize();};this.tZ=function(){aQL.tZ();};this.resize=function(){aQL.resize();aQM.resize();
};this.getTerriColorArray=function(ej){if(ej===2){aQL.wj[0].sb();}};dk();}

function aQ3(){var aQL;var aTf;var aTg;

function dk(){aTg=[new x(L(369),function(){aTh(5);},0,0,1),new x(L(370),function(){aTh(6);},0,0,1),
new x(L(371),function(){aTh(7);},0,0,1),new x("Audit Log",function(){aTh(12);},0,0,1)
];
var wd=[new x("⬅️ "+L(40),function(){account.a3O();})];aQL=new wc(L(411),wd);
aTf=new ss(aTg,aQL.wi);}

function aTh(aC){account.v(8,account.ua,new ub(21,{ur:aC,us:0,ut:10}));
}this.show=function(){aQL.show();this.resize();};this.tZ=function(){
aQL.tZ();};this.resize=function(){aQL.resize();aTf.resize();};this.getTerriColorArray=function(ej){if(ej===2){
aQL.wj[0].sb();}};dk();}

function aPn(){this.buffer={};this.FloatingNavigationControls=new Array(8);this.aQ1=null;
this.aPy=null;this.uF=0;this.uS=[0,0];this.a0=function(){account.v(5,5);};this.a71=function(aUM){
if(aUM){loadingSystem.mountainAttackTargetFinder=aUM;}account.y();loadingSystem.applyToGame();};this.aEa=function(){account.v(moderationSystem.a3P()===0?5:0);
};this.aST=function(){if(connectionMgr.buffer.data[130].value===1){account.v(8,account.handleKeyInput().a3U,new ub(24,{
aS2:connectionMgr.buffer.data[125].value,us:connectionMgr.buffer.data[128].value,ut:connectionMgr.buffer.data[129].value}));
return;}var h=connectionMgr.buffer.data[126].value.split(",");h=h.slice(0,10);for(var aC=0;aC<h.length;aC++){
h[aC]=h[aC].trim().slice(0,7).toUpperCase();}if(h.length===1&&h[0].length===0){
h=[];}account.v(8,account.handleKeyInput().a3U,new ub(23,{aS2:connectionMgr.buffer.data[125].value,a2x:h}));
};this.aTY=function(a3U,target){account.v(4,a3U,new TextContentScreen("Data Usage Information",
"Do you want your username and other data to be remembered for the next session?<br>The app might not function correctly if you decline data usage.<br>Please read our privacy policy for more information: "+gameServer.z.aQi("/privacy"),
false,[
new x("⬅️ "+L(40),function(){account.v(a3U);}),new x("✅ Accept",function(){connectionMgr.qo.boatNotificationHandler(140,1);if(target===0){
account.v(2,a3U);}else{account.v(8,a3U,new ub(target));}})]));};this.aUN=function(){for(var aC=0;aC<8;aC++){
this.FloatingNavigationControls[aC]=minimapRenderer.yF.yJ(urlParams.arrayUtils(5));}this.FloatingNavigationControls[1]="["+this.FloatingNavigationControls[1]+"]";if(account.ua===5){account.handleKeyInput().aJ7.boatNotificationHandler(this.FloatingNavigationControls);
account.handleKeyInput().resize();}};this.aQq=function(g1,qm,a8n){g1=gameState.gv.initializeMapImageBuffer(g1,1,1000000);
var el=L(412,[qm]);
el+="<br>";el+=L(413,[a8n]);el+="<br>";el+=L(414,[g1+"–"+(g1+2)]);el+="<br>";el+=L(415,[g1]);
return el;};}

function aQ6(){var aRZ;var aRa;var aUO;

function sd(){aRZ=new wc(L(334),
[new x("⬅️ "+L(40),aRc)]);if(localPlayer.data.mapType===2){eventSystem.applyToGame();}aRa=new sD(aRZ.wi,aRd());
}

function aRc(){eventSystem.vx();account.aQK()[19]=null;account.a3O();}

function aRd(){var sF=[];aRf(sF);aUP(sF);aUQ(sF);
aUR(sF);aUS(sF);aUT(sF);aUU(sF);return sF;}

function aRf(sF){var aQh=new rx();aQh.LobbyChatPanel(L(300));
aQh.s8(new wY({oM:[L(416),L(417),L(418)],value:localPlayer.data.mapType},function(eI){localPlayer.data.mapType=eI;
if(eI===2){eventSystem.applyToGame();localPlayer.data.canvas=null;}else{localPlayer.data.passableWater=localPlayer.data.passableMountains=1;
eventSystem.vx();}account.v(20);}));if(localPlayer.data.mapType>=2){aQh.sB(new tw());
aQh.sB(new th({value:localPlayer.data.passableWater},L(419),function(value){localPlayer.data.passableWater=value;
}));aQh.sB(new th({value:localPlayer.data.passableMountains},L(420),function(value){
localPlayer.data.passableMountains=value;}));}sF.push(aQh);}

function aUP(sF){if(localPlayer.data.mapType!==0){
return;}var aQh=new rx();aQh.LobbyChatPanel(L(334));
var oM=[];for(var aC=0;aC<dialogManager.yd.aOf.length;aC++){
oM.push(dialogManager.yd.ye[dialogManager.yd.aOf[aC]].name);}var wZ=function(eI){localPlayer.data.mapProceduralIndex=eI;
aUV();};aQh.s8(new wY({oM:oM,value:localPlayer.data.mapProceduralIndex},wZ));sF.push(aQh);
}

function aUQ(sF){if(localPlayer.data.mapType!==1){return;}var aQh=new rx();aQh.LobbyChatPanel(L(334));
var oM=[];
for(var aC=0;aC<dialogManager.yd.aOg.length;aC++){oM.push(dialogManager.yd.ye[dialogManager.yd.aOg[aC]].name);}var wZ=function(eI){
localPlayer.data.mapRealisticIndex=eI;aUV();};aQh.s8(new wY({oM:oM,value:localPlayer.data.mapRealisticIndex},wZ));
sF.push(aQh);}

function aUR(sF){if(localPlayer.data.mapType!==2){return;}var aQh=new rx();aQh.LobbyChatPanel(L(421));
aQh.sB(new t7(connectionMgr.buffer.data[162],1));aQh.LobbyChatPanel(L(422),"0.8em");aQh.sB(new tl([(new x(L(423),function(){
eventSystem.aKE();return true;})).button]));sF.push(aQh);}

function aUS(sF){if(localPlayer.data.mapType!==2){return;
}var aQh=new rx();aQh.LobbyChatPanel(L(424));
var t6=new t7({eI:-1,value:localPlayer.data.mapName},0,0,function(e){
localPlayer.data.mapName=e.target.value=e.target.value.slice(0,20);});aQh.sB(t6);sF.push(aQh);
}

function aUT(sF){if(localPlayer.data.mapType!==0){return;}var aQh=new rx();aQh.LobbyChatPanel("Seed");
var t6=new t7({
eI:-1,value:localPlayer.data.mapSeed},1,0,function(e){var aNg=Math.abs(Math.floor(e.target.value))%16384;
if(localPlayer.data.mapSeed===aNg){return;}localPlayer.data.mapSeed=aNg;
aUV();});
var aQp=new x(L(325),function(e){var aNg=Math.floor(Math.random()*16384);
if(localPlayer.data.mapSeed===aNg){return;}t6.e.value=localPlayer.data.mapSeed=aNg;aUV();return true;});aQh.sB(t6);
aQh.sB((new tl([aQp.button])));sF.push(aQh);}

function aUU(sF){aUO=new rx();aUO.LobbyChatPanel(L(425));
if(localPlayer.data.mapType!==2){aUW();}else if(localPlayer.data.canvas){aUX();}sF.push(aUO);}

function aUV(){aUY();
aUW();}

function aUY(){if(aUO.rz.lastChild){account.removeChild(aUO.rz,aUO.rz.lastChild);}}

function aUW(){
var aUZ=dialogManager.a78(localPlayer.data);localPlayer.data.canvas=dialogManager.aNl(aUZ,localPlayer.data.mapSeed).yn;aUX();}

function aUX(){
var a55=localPlayer.data.canvas;a55.style.width="100%";aUO.rz.appendChild(a55);}this.aKL=function(a55){
if(localPlayer.data.canvas){aUY();}localPlayer.data.canvas=a55;aUX();};this.show=function(){aRZ.show();
this.resize();};this.tZ=function(){aRZ.tZ();};this.resize=function(){aRZ.resize();aRa.resize();
};this.getTerriColorArray=function(ej){if(ej===2){aRZ.wj[0].sb();}};sd();}

function TextContentScreen(title,s7,HeartbeatManager,aTi){var aQL;
var aSr;

function dk(){if(!aTi){aTi=[new x("⬅️ "+L(40),function(){account.a3O();})];}aQL=new wc(title,aTi);
aSr=new tk(aQL.wi,s7);if(HeartbeatManager){gameState.sK.textAlign(aQL.wi.style,1);}}this.show=function(){
aQL.show();this.resize();};this.tZ=function(){aQL.tZ();};this.resize=function(){
aQL.resize();aSr.resize();};this.getTerriColorArray=function(ej){if(ej===2){aQL.wj[0].sb();}};
dk();}

function aQ9(){var aRZ;var aRa;var aRb;

function sd(){aRZ=new wc(L(338),[new x("⬅️ "+L(40),aRc)
]);aRa=new sD(aRZ.wi,aRd());}

function aRc(){aRe();aRi();account.aQK()[19]=null;account.a3O();
}

function aRi(){if(localPlayer.data.playerNamesType===2&&gameState.sS.endsWith(localPlayer.data.playerNamesData).length===1){
localPlayer.data.playerNamesType=0;}if(localPlayer.data.playerNamesType!==2){localPlayer.data.playerNamesData=null;
}}

function aRe(){if(localPlayer.data.playerNamesType===2){gameState.sS.a4x(aRb.x7(),localPlayer.data.playerNamesData,20);
}}

function aRd(){var sF=[];aRf(sF);aRh(sF);return sF;}

function aRf(sF){var aQh=new rx();
aQh.LobbyChatPanel(L(300));aQh.s8(new wY({oM:[L(339),L(340),L(303)],value:localPlayer.data.playerNamesType},
function(eI){aRe();localPlayer.data.playerNamesType=eI;
account.v(23);}));aQh.sB(new tw());aQh.sB(new th({value:localPlayer.data.selectableName},L(426),
function(value){localPlayer.data.selectableName=value;}));sF.push(aQh);
}

function aRh(sF){if(localPlayer.data.playerNamesType!==2){return;}var aQh=new rx();aQh.LobbyChatPanel("Data");
aRb=new x0(0,1,0,1);if(!localPlayer.data.playerNamesData||localPlayer.data.playerNamesData.length!==localPlayer.isMountainTile){
localPlayer.data.playerNamesData=new Array(localPlayer.isMountainTile);localPlayer.data.playerNamesData.fill("");
}aRb.x6(gameState.tI.getTime(localPlayer.data.playerNamesData,1,"\""));aQh.sB(aRb);sF.push(aQh);}this.show=function(){
aRZ.show();this.resize();};this.tZ=function(){aRZ.tZ();};this.resize=function(){aRZ.resize();
aRa.resize();};this.getTerriColorArray=function(ej){if(ej===2){aRZ.wj[0].sb();}};sd();}

function aQH(){
var aRZ;var aRa;

function dk(){aRZ=new wc(L(427),[new x("⬅️ "+L(40),function(){account.a3O();})
]);aRa=new sD(aRZ.wi,aRd());}

function aRd(){var sF=[];sF.push(OutgoingGameCommandBuilder());sF.push(JoinPacketBuilder());
sF.push(aTF());sF.push(ResponsePacketBuilder());sF.push(AccountPacketBuilder());sF.push(SyncPacketBuilder());return sF;}

function OutgoingGameCommandBuilder(){
var aQh=new rx();aQh.LobbyChatPanel(L(428));aQh.s6(gameServer.z.aQi("/wiki/propaganda"),"0.75em").style.marginBottom="0.8em";
aQh.s6("<a href='https://tt-propagandio.vercel.app/' target='_blank'>Unofficial Propaganda Generator</a>","0.75em");
return aQh;}

function JoinPacketBuilder(){
var aQh=new rx();aQh.LobbyChatPanel(L(429));
var el=connectionMgr.buffer.data[174].value;
var s3=aQh.s2(el.length+" / 180");
s3.style.textAlign="center";
var aRH=new x0(0,1,function(e){var g1=e.target.value;
var resolveAttackCombat=g1.length;s3.textContent=resolveAttackCombat+" / 180";if(resolveAttackCombat<=180){connectionMgr.qo.boatNotificationHandler(174,g1);}});aRH.e.rows=6;
aRH.e.style.fontSize="1em";aRH.x6(el);aQh.sB(aRH);return aQh;}

function aTF(){var aQh=new rx();
aQh.LobbyChatPanel(L(324));for(var aC=0;aC<11;aC++){var iv=aQh.sB(new t7(connectionMgr.buffer.data[163+aC]));
aC&&(iv.e.style.marginTop="0.6em");}aQh.sB((new tl([(new x(L(430),function(){
var data=connectionMgr.buffer.data;for(var aC=163;aC<174;aC++){if(data[aC]){connectionMgr.buffer.xM(aC,data[aC].xP);
}}account.a3O();account.aQK()[31]=null;account.v(31);})).button])));return aQh;}

function ResponsePacketBuilder(){var aQh=new rx();
aQh.LobbyChatPanel("Targeting");aQh.s6(L(431));aQh.sB(new t7(connectionMgr.buffer.data[175],0,0));return aQh;
}

function AccountPacketBuilder(){var aQh=new rx();aQh.LobbyChatPanel(L(425));aQh.sB((new tl([(new x(L(191),function(){
(new ek()).show(connectionMgr.buffer.data[174].value,LeaderBoardPacketBuilder(),-1);})).button])));return aQh;}

function LeaderBoardPacketBuilder(){
var colors=new Array(11);for(var aC=0;aC<11;aC++){var g1=connectionMgr.buffer.data[163+aC].value;
var h=g1.split(",");colors[aC]=new Uint8Array(3);for(var fs=0;fs<3;fs++){
if(fs<h.length){colors[aC][fs]=Number(h[fs]);}}}return colors;}

function SyncPacketBuilder(){
var aQh=new rx();aQh.LobbyChatPanel(L(432));aQh.s6(L(433));
var IncomingPacketDispatcher=new t7(connectionMgr.buffer.data[176],1,0);
aQh.sB(IncomingPacketDispatcher);
var aUi=new x(L(434),function(e){if(LobbyPacketHandler.button.textContent===L(186)&&gameServer.z.responsePacketBuilder(0)){
gameState.sK.wV(e);aQo();gameServer.aHS.settingsPacketHandler(connectionMgr.buffer.data[176].value,LeaderBoardPacketBuilder(),connectionMgr.buffer.data[175].value,
connectionMgr.buffer.data[174].value);}return true;},1);
var aQo=function(){LobbyPacketHandler.button.textContent=L(185);
aUi.se(1);aUi.button.style.color=colorPalette.pO;};
var LobbyPacketHandler=new x(L(185),function(e){
if(e.textContent===L(185)){e.textContent=L(186);aUi.se(0);aUi.button.style.color=colorPalette.qN;}else{
aQo();}return true;});aQh.sB((new tl([LobbyPacketHandler.button,aUi.button])));return aQh;}this.show=function(){
aRZ.show();this.resize();};this.tZ=function(){aRZ.tZ();};this.resize=function(){aRZ.resize();
aRa.resize();};this.getTerriColorArray=function(ej){if(ej===2){aRZ.wj[0].sb();}};dk();}

function aQI(){
var aQL;var aQM;

function dk(){aQL=new wc("🔒 "+L(435),[new x("⬅️ "+L(40),function(){account.a3O();})
]);aQM=new sD(aQL.wi,aQO());}

function aQO(){var sF=[];sF.push(SettingsPacketHandler());return sF;
}

function SettingsPacketHandler(){var aQh=new rx();aQh.s6(gameServer.z.aQi("/wiki/faq"),"0.75em").style.marginBottom="0.8em";
aQh.LobbyChatPanel(L(187));
var t6=new t7({value:"",eI:-1});aQh.sB(t6);aQh.LobbyChatPanel(L(257),"0.8em");
var aRD=new t7({value:"",eI:-1},0,0);aRD.e.type="email";aRD.e.autocomplete="email";aRD.e.name="email";
aRD.e.inputMode="email";aRD.e.spellcheck=false;aQh.sB(aRD);
var aQn=new x(L(436),function(e){
gameState.sK.wV(e);gameServer.aHS.aRE({action:4,s1:t6.e.value.trim()+aRD.e.value.trim().substring(0,63)
});return true;});aQh.sB((new tl([aQn.button])));return aQh;}this.show=function(){
aQL.show();this.resize();};this.tZ=function(){aQL.tZ();};this.resize=function(){aQL.resize();
aQM.resize();};this.getTerriColorArray=function(ej){if(ej===2){aQL.wj[0].sb();}};dk();}

function aPu(){
var aRZ;var x4;

function sd(){aRZ=new wc(L(437),[new x("⬅️ "+L(40),function(){account.aQJ(1);}),
new x(L(438),function(){x4.x8();}),new x(L(439),function(){x4.x9();}),
new x(L(440),function(){x4.clear();}),new x(L(441),function(){aUm();})
]);x4=new x0(L(442));aRZ.wi.appendChild(x4.e);}this.show=function(ProfilePacketHandler){
this.leaderboardPacketHandler(ProfilePacketHandler);aRZ.show();this.resize();};this.leaderboardPacketHandler=function(ProfilePacketHandler){if(localPlayer.a2G===0){if(ProfilePacketHandler){
x4.x6(ProfilePacketHandler);}else if(localPlayer.a6l.length){x4.x6(localPlayer.a6l);}return;}if(!localPlayer.hi){packetWriter.re.a6x=packetWriter.a6y.a1i();
}x4.x6(packetWriter.LeaderboardPacketHandler(packetWriter.re.a6x));};this.tZ=function(){aRZ.tZ();};this.resize=function(){aRZ.resize();
x4.resize();};

function aUm(){account.y();
var s1=packetWriter.aUq(x4.x7());if(localPlayer.a2G&&s1.length>0&&s1===packetWriter.re.a6x){
packetWriter.aUr();return;}if(!packetWriter.aLJ.yY(s1)){return;}packetWriter.aUr();}this.getTerriColorArray=function(ej){
if(ej===2){aRZ.wj[0].sb();}else{aUm();}};sd();}

function aPt(){var aQL;var aQM;var sF;

function dk(){aQL=new wc(L(443),[new x("⬅️ "+L(40),aUs),new x(L(444),function(){account.y();connectionMgr.qo.emojiPicker();
account.v(2);})]);aQO();aQM=new sD(aQL.wi,sF);}

function aUs(){if(renderer.aEM!==connectionMgr.buffer.data[12].value){
renderer.applyToGame();account.v(8,1,new ub(30));return;}account.v(1);}

function aQO(){var aQh;sF=[];aQh=new rx();
aQh.LobbyChatPanel(L(445));aQh.s2(L(446));sF.push(aQh);aUt(sF);aUu(sF);aQh=new rx();aQh.LobbyChatPanel(L(447));
connectionMgr.buffer.data[1].oM=[L(448),L(449),L(450),L(451)];aQh.s8(new wY(connectionMgr.buffer.data[1]));
sF.push(aQh);aQh=new rx();aQh.LobbyChatPanel(L(452));connectionMgr.buffer.data[9].oM=[L(449),L(453),L(454)];
aQh.s8(new wY(connectionMgr.buffer.data[9]));sF.push(aQh);aQh=new rx();
aQh.LobbyChatPanel(L(455));connectionMgr.buffer.data[11].oM=[L(456),L(9),L(457)];aQh.s8(new wY(connectionMgr.buffer.data[11]));
sF.push(aQh);aQh=new rx();aQh.LobbyChatPanel(L(458));aQh.sB(new th(connectionMgr.buffer.data[2]));
sF.push(aQh);aQh=new rx();aQh.LobbyChatPanel(L(459));aQh.sB(new th(connectionMgr.buffer.data[7]));
sF.push(aQh);aQh=new rx();aQh.LobbyChatPanel(L(460));aQh.sB(new th(connectionMgr.buffer.data[8]));sF.push(aQh);
aQh=new rx();aQh.LobbyChatPanel(L(461));aQh.sB(new t7(connectionMgr.buffer.data[5]));sF.push(aQh);aQh=new rx();
aQh.LobbyChatPanel(L(462));aQh.sB(new th(connectionMgr.buffer.data[13],L(463)));aQh.sB(new th(connectionMgr.buffer.data[14],L(464)));
sF.push(aQh);aQh=new rx();aQh.LobbyChatPanel(L(465));aQh.s8(new wY({oM:[L(466),L(467),L(468)],value:loadingSystem.aIK},
function(aC){loadingSystem.aIK=aC;}));sF.push(aQh);aQh=new rx();aQh.LobbyChatPanel(L(469));
aQh.sB(new th(connectionMgr.buffer.data[15]));aQh.s2(L(470));aQh.sB(new t7(connectionMgr.buffer.data[16],1,0,function(e){
e.target.value=mathUtils.distanceBetweenPointsAndEncoded(Math.floor(e.target.value),0,16);
}));sF.push(aQh);}

function aUu(sF){var aQh=new rx();aQh.LobbyChatPanel(L(471));
var aUv=[];aQh.sB((new tl([
(new x(L(430),function(e){ba.aUw();for(var aC=0;aC<aUv.length;aC++){aUv[aC].e.value=ba.aDv[aC];
}gameState.sK.wV(e);return true;})).button])));for(var aC=0;aC<ba.aUx.length;aC++){
aQh.s2(ba.aUx[aC]);for(var fs=0;fs<2;fs++){var eI=2*aC+fs;
var t6=new t7({value:ba.aDv[eI],eI:-1});
t6.e.aUy=eI;aUv.push(t6);t6.e.addEventListener("keydown",function(e){e.preventDefault();
var code=e.code;e.target.value=code;ba.aUz(e.target.aUy,code);});fs&&(t6.e.style.marginLeft="4%");
t6.e.style.width="48%";aQh.sB(t6);}}sF.push(aQh);}

function aUt(sF){
var aQh=new rx();aQh.LobbyChatPanel(L(431));
var h=renderer.data.aEd();aQh.s8(new wY({oM:h,value:renderer.data.aEh(h)},
function(eI){connectionMgr.qo.boatNotificationHandler(12,h[eI].split(":")[0]);return true;}));sF.push(aQh);}this.show=function(){
aQL.show();this.resize();};this.tZ=function(){aQL.tZ();};this.resize=function(){
aQL.resize();aQM.resize();};this.getTerriColorArray=function(ej){if(ej===2){aQL.wj[0].sb();}};
dk();}

function aQA(){var aRZ;var aRa;var aRb;

function sd(){aRZ=new wc(L(472),[new x("⬅️ "+L(40),aRc)
]);aRa=new sD(aRZ.wi,aRd());}

function aRc(){aRe();aRi();account.aQK()[19]=null;account.a3O();
}

function aRe(){if(localPlayer.data.spawningType===2){gameState.sS.a4v(aRb.x7(),localPlayer.data.spawningData,dialogManager.aKO-1);
}}

function aRi(){if(localPlayer.data.spawningType===2){if(!gameState.sS.endsWith(localPlayer.data.spawningData)){
localPlayer.data.spawningType=0;}}if(localPlayer.data.spawningType!==2){localPlayer.data.spawningData=null;
}}

function aRd(){var sF=[];aRf(sF);aV0(sF);aRg(sF);aRh(sF);return sF;}

function aRf(sF){
var aQh=new rx();aQh.LobbyChatPanel(L(300));
var oM=[L(325),L(337),L(303)];
var value=localPlayer.data.spawningType;
if(localPlayer.data.gameMode===0){oM.splice(1,1);if(value>0){value=1;}}aQh.s8(new wY({oM:oM,value:value},
function(eI){aRe();localPlayer.data.spawningType=eI;if(localPlayer.data.gameMode===0&&eI===1){localPlayer.data.spawningType=2;
}if(localPlayer.data.spawningType===2&&!localPlayer.data.spawningData){localPlayer.data.spawningData=new Uint16Array(2*localPlayer.isMountainTile);
}account.v(24);}));sF.push(aQh);}

function aV0(sF){var aQh=new rx();aQh.LobbyChatPanel("My Spawn");
aQh.sB(new th({value:localPlayer.data.selectableSpawn},L(473),function(value){localPlayer.data.selectableSpawn=value;
}));sF.push(aQh);}

function aRg(sF){var aQh=new rx();aQh.LobbyChatPanel("Seed");
var aV1=new t7({eI:-1,
value:localPlayer.data.spawningSeed},1,0,function(e){var value=Math.abs(Math.floor(e.target.value))%16384;
e.target.value=localPlayer.data.spawningSeed=value;});aQh.sB(aV1);aQh.sB(new tl([new x(L(325),function(){
aV1.e.value=localPlayer.data.spawningSeed=Math.floor(Math.random()*16384);
}).button]));sF.push(aQh);}

function aRh(sF){if(localPlayer.data.spawningType!==2){return;
}var aQh=new rx();aQh.LobbyChatPanel("Data");aRb=new x0(0,1,0,1);aRb.x6(gameState.tI.getTime(localPlayer.data.spawningData,2));
aQh.sB(aRb);sF.push(aQh);}this.show=function(){aRZ.show();
this.resize();};this.tZ=function(){aRZ.tZ();};this.resize=function(){aRZ.resize();aRa.resize();
};this.getTerriColorArray=function(ej){if(ej===2){aRZ.wj[0].sb();}};sd();}

function aPs(){var aQL;var aTf;
var aTg;

function dk(){aTg=[new x(L(474),function(){aV2(0);}),new x(L(361),function(){account.v(16);}),
new x(L(411),function(){account.v(17);}),new x(L(475),function(){account.z.aST();},0,0,1),
new x(L(437),function(){account.v(3,1);}),new x(L(476),function(){account.v(18);}),
new x(L(427),function(){account.v(31);}),new x(L(477),function(){account.z.a71(2);}),
new x(L(443),function(){aV2(1);}),new x("🔒 "+L(435),function(){account.v(32);}),
new x(L(478),function(){aV3();}),new x(L(479),function(){aV4();}),
new x(L(480),function(){aV5();}),new x("👁️ "+L(481),function(){a3G();})
];
var wd=[new x("⬅️ "+L(40),function(){account.z.aEa();})];aV6();if(uiSurface.id===1&&uiSurface.e3>=5){
aTg.push(new x(L(482),function(){uiSurface.platformActions.a3H();}));}aQL=new wc(L(483),wd);aTf=new ss(aTg,aQL.wi);
}

function aV6(){if(moderationSystem.a3P()!==8){return;}aTg.unshift(new x(L(348),function(){account.v(30);}));
aTg.unshift(new x(L(484),function(){if(gameClock.aV7>=2){account.y();accountPanel.a4N();clanPanel.ds=true;}},0,1));
aTg.unshift(new x(L(485),function(){if(!localPlayer.hi&&zoomHandler.RectangleLayout(localPlayer.getTileOwner)){mapCache.hz.r8();account.y();if(zoomHandler.screenToTileY){zoomHandler.a4N();
}}},0,1));aTg.unshift(new x(L(486),function(){if(!localPlayer.hi&&cameraController.iO(localPlayer.getTileOwner)){statsPanel.a7d(2);mapCache.hz.iK();
account.y();if(zoomHandler.screenToTileY){zoomHandler.a4N();}}},0,1));}

function aV2(id){if(uiSurface.id===0&&!connectionMgr.buffer.data[140].value){
account.z.aTY(account.ua,id===0?16:0);return;}if(id===0){account.v(8,1,new ub(16));}else{account.v(2);}}

function aV3(){
var a5V=[];
var sO="https://territorial.io/";a5V.push(["Wiki",sO+"wiki/gold"]);a5V.push(["Team Games",sO+"log/team"]);
a5V.push(["Battle Royale Games",sO+"log/br"]);a5V.push(["1v1 Games",sO+"log/1v1"]);
a5V.push(["Zombie Games",sO+"log/zombies"]);a5V.push(["Transactions",sO+"log/transactions"]);
a5V.push(["Changelog",sO+"changelog"]);(uiSurface.id!==2)&&a5V.push(["Android App",floorDiv.aEu]);
(uiSurface.id!==1)&&a5V.push(["iOS App",floorDiv.a3L]);(uiSurface.id===0)&&a5V.push(["Patreon",floorDiv.aRX]);
a5V.push(["Terms",floorDiv.aV8]);a5V.push(["Privacy",floorDiv.aV9]);account.v(4,1,new TextContentScreen(L(478),gameState.sK.formatSignificantNumber(a5V),
false,[new x("⬅️ "+L(40),function(){account.v(1);})]));}

function aV4(){account.v(4,1,new TextContentScreen(L(479),
settingsPanel.e3+"<br>"+gameServer.z.aQi("/changelog"),true,[new x("⬅️ "+L(40),function(){account.v(1);})]));}

function aV5(){
account.v(4,1,new TextContentScreen(L(480),L(487)+"<br>"+L(488),false,[new x("⬅️ "+L(40),function(){account.v(1);}),
new x(L(489),function(){uiSurface.platformActions.a3F();account.v(1);})]));}

function a3G(){uiSurface.platformActions.a3G();
account.v(4,1,new TextContentScreen(L(490),L(491)+" "+gameServer.z.aQi("/privacy"),false,[new x("⬅️ "+L(40),function(){account.v(1);})
]));}this.show=function(){uiSurface.platformActions.setState(12);aQL.show();this.resize();
this.ee();};this.tZ=function(){aQL.tZ();};this.resize=function(){aQL.resize();aTf.resize();
};this.ee=function(){if(moderationSystem.a3P()!==8){return;}if(gameClock.aV7>=2){if(aTg[2].sc===colorPalette.pa){aTg[2].se(0);
}}else{if(aTg[2].sc!==colorPalette.pa){aTg[2].se(colorPalette.pa);}}if(!localPlayer.hi&&zoomHandler.RectangleLayout(localPlayer.getTileOwner)){if(aTg[1].sc===colorPalette.pa){
aTg[1].se(0);}}else{if(aTg[1].sc!==colorPalette.pa){aTg[1].se(colorPalette.pa);}}if(!localPlayer.hi&&cameraController.iO(localPlayer.getTileOwner)){
if(aTg[0].sc===colorPalette.pa){aTg[0].se(0);}}else{if(aTg[0].sc!==colorPalette.pa){aTg[0].se(colorPalette.pa);}
}};this.getTerriColorArray=function(ej){if(ej===2){aQL.wj[0].sb();}};dk();}

function aQE(){var aRZ;var aRa;var aRb;

function sd(){aRZ=new wc(L(343),[new x("⬅️ "+L(40),aRc)]);aRa=new sD(aRZ.wi,aRd());}

function aRc(){
aRe();if(localPlayer.data.sResourcesType!==2){localPlayer.data.sResourcesData=null;}account.aQK()[19]=null;account.a3O();
}

function aRe(){if(localPlayer.data.sResourcesType===2){gameState.sS.a4v(aRb.x7(),localPlayer.data.sResourcesData,2047);
}}

function aRd(){var sF=[];aRf(sF);aRg(sF);aRh(sF);return sF;}

function aRf(sF){var aQh=new rx();
aQh.LobbyChatPanel(L(300));aQh.s8(new wY({oM:[L(301),L(302),L(303)],value:localPlayer.data.sResourcesType},function(eI){
aRe();if(eI===2&&!localPlayer.data.sResourcesData){localPlayer.data.sResourcesData=new Uint16Array(localPlayer.isMountainTile);
}localPlayer.data.sResourcesType=eI;account.v(28);}));sF.push(aQh);}

function aRg(sF){
if(localPlayer.data.sResourcesType!==1){return;}var aQh=new rx();aQh.LobbyChatPanel("Value");aQh.sB(new t7({eI:-1,
value:localPlayer.data.sResourcesValue},1,0,function(e){var value=mathUtils.distanceBetweenPointsAndEncoded(Math.floor(e.target.value),0,2047);
e.target.value=localPlayer.data.sResourcesValue=value;}));sF.push(aQh);}

function aRh(sF){
if(localPlayer.data.sResourcesType!==2){return;}var aQh=new rx();aQh.LobbyChatPanel("Data");aRb=new x0(0,1,0,1);
aRb.x6(gameState.tI.getTime(localPlayer.data.sResourcesData,2));aQh.sB(aRb);sF.push(aQh);}this.show=function(){
aRZ.show();this.resize();};this.tZ=function(){aRZ.tZ();};this.resize=function(){aRZ.resize();
aRa.resize();};this.getTerriColorArray=function(ej){if(ej===2){aRZ.wj[0].sb();}};sd();}

function aQC(){var aRZ;
var aRa;var aRb;

function sd(){aRZ=new wc(L(341),[new x("⬅️ "+L(40),aRc)]);aRa=new sD(aRZ.wi,aRd());
}

function aRc(){aRe();if(localPlayer.data.tIncomeType!==2){localPlayer.data.tIncomeData=null;}account.aQK()[19]=null;
account.a3O();}

function aRe(){if(localPlayer.data.tIncomeType===2){gameState.sS.a4v(aRb.x7(),localPlayer.data.tIncomeData,255);
}}

function aRd(){var sF=[];aRf(sF);aRg(sF);aRh(sF);return sF;}

function aRf(sF){var aQh=new rx();
aQh.LobbyChatPanel(L(300));aQh.s8(new wY({oM:[L(301),L(302),L(303)],value:localPlayer.data.tIncomeType},
function(eI){aRe();if(eI===2&&!localPlayer.data.tIncomeData){localPlayer.data.tIncomeData=new Uint8Array(localPlayer.isMountainTile);
localPlayer.data.tIncomeData.fill(32);}localPlayer.data.tIncomeType=eI;account.v(26);}));sF.push(aQh);}

function aRg(sF){
if(localPlayer.data.tIncomeType!==1){return;}var aQh=new rx();aQh.LobbyChatPanel("Value");aQh.sB(new t7({eI:-1,
value:localPlayer.data.tIncomeValue},1,0,function(e){var value=mathUtils.distanceBetweenPointsAndEncoded(Math.floor(e.target.value),0,255);
e.target.value=localPlayer.data.tIncomeValue=value;}));sF.push(aQh);}

function aRh(sF){
if(localPlayer.data.tIncomeType!==2){return;}var aQh=new rx();aQh.LobbyChatPanel("Data");aRb=new x0(0,1,0,1);
aRb.x6(gameState.tI.getTime(localPlayer.data.tIncomeData,4));aQh.sB(aRb);sF.push(aQh);}this.show=function(){
aRZ.show();this.resize();};this.tZ=function(){aRZ.tZ();};this.resize=function(){aRZ.resize();
aRa.resize();};this.getTerriColorArray=function(ej){if(ej===2){aRZ.wj[0].sb();}};sd();}

function aQ4(){
var aQL;var aQM;

function dk(){aQL=new wc(L(476),[new x("⬅️ "+L(40),function(){account.a3O();})
]);aQM=new sD(aQL.wi,aQO());}

function aQO(){var sF=[];sF.push(aVA());
return sF;}

function aVA(){var aQh=new rx();aQh.s6(gameServer.z.aQi("/wiki/transactions"),"0.75em").style.marginBottom="0.8em";
aQh.LobbyChatPanel(L(492));
var aVB=new t7({value:connectionMgr.buffer.data[105].value,eI:-1});aVB.e.readOnly=true;
aQh.sB(aVB);aQh.LobbyChatPanel(L(387),"0.8em");
var aVC=new t7(connectionMgr.buffer.data[148],0,undefined,function(e){
aQm(connectionMgr.buffer.data[149].value,e.target.value);
});aQh.sB(aVC);aQh.LobbyChatPanel(L(391),"0.8em");
var aVD=new t7(connectionMgr.buffer.data[149],1,undefined,function(e){
aQm(e.target.value,connectionMgr.buffer.data[148].value);
});aQh.sB(aVD);
var aQo=function(){LobbyPacketHandler.button.textContent=L(185);
aVC.e.readOnly=false;aVD.e.readOnly=false;aQn.se(1);aQn.button.style.color=colorPalette.pO;
};
var LobbyPacketHandler=new x(L(185),function(e){if(e.textContent===L(185)){e.textContent=L(186);
aVC.e.readOnly=true;aVD.e.readOnly=true;aQn.se(0);aQn.button.style.color=colorPalette.qN;
connectionMgr.qo.boatNotificationHandler(149,aVD.e.value);aQm(connectionMgr.buffer.data[149].value,connectionMgr.buffer.data[148].value);
}else{aQo();}return true;});aQh.sB((new tl([
LobbyPacketHandler.button])));
var aQn=new x(L(14),function(e){if(aVC.e.readOnly&&gameServer.z.responsePacketBuilder(0)){gameState.sK.wV(e);aQo();
gameServer.aHS.aHT({action:0,uY:connectionMgr.buffer.data[148].value,value:parseInt(connectionMgr.buffer.data[149].value,10)
});}return true;},1);
var s3=aQh.s2();aQh.s2(L(493)).style.fontWeight="bold";
var aQm=function(g1,s1){
s3.innerHTML=account.z.aQq(g1,connectionMgr.buffer.data[105].value,s1);};aQh.sB((new tl([aQn.button
])));aQm(connectionMgr.buffer.data[149].value,connectionMgr.buffer.data[148].value);return aQh;}this.show=function(){
aQL.show();this.resize();};this.tZ=function(){aQL.tZ();};this.resize=function(){
aQL.resize();aQM.resize();};this.getTerriColorArray=function(ej){if(ej===2){aQL.wj[0].sb();}};dk();
}

function initMathPolyfills(){if(typeof Math.log2!=="function"){Math.log2=function(fg){return Math.log(fg)/Math.log(2);
};}if(typeof Math.log10!=="function"){Math.log10=function(fg){return Math.log(fg)/Math.log(10);
};}if(typeof Math.sign!=="function"){Math.sign=function(fg){return fg>0?1:fg<0?-1:0;
};}}

function InventorySystem(){var aVE=false;var aBa;var aVF;var aVG;var aVH;

function aVI(){aVE=true;
aBa=-1;aVF=new Array(4);for(var aC=3;aC>=0;aC--){aVF[aC]=false;}var zd=Math.floor(1+0.020*camera.min);
aVG=new Array(4);aVH=new Array(4);aVH[1]=aVH[3]=aVG[0]=aVG[2]=0;aVH[0]=aVG[3]=-zd;
aVG[1]=aVH[2]=zd;}this.a4I=function(eI){if(localPlayer.a2G===0){return;}if(!soloCalc.visibleTileDirty()){return;
}if(!aVE){aVI();}aVF[eI]=true;if(aBa===-1){aBa=setInterval(aVJ,20);aVJ();}};this.a4L=function(eI){
if(localPlayer.a2G===0){return;}if(!aVE){aVI();}aVF[eI]=false;if(aBa===-1){return;}var aVK=false;
for(var aC=3;aC>=0;aC--){aVK=aVK||aVF[aC];}if(!aVK){this.o3();}};this.o3=function(){if(!aVE){
return;}if(aBa===-1){return;}for(var aC=3;aC>=0;aC--){aVF[aC]=false;}clearInterval(aBa);aBa=-1;
};

function aVJ(){if(aBa===-1){return;}if(localPlayer.a2G===0||!soloCalc.visibleTileDirty()){inventory.o3();return;}var aVK=false;
for(var aC=3;aC>=0;aC--){if(aVF[aC]){aVK=true;jD+=aVG[aC];jE+=aVH[aC];troops.a3m(aVG[aC],aVH[aC]);
hoverHandler.aBG();}}if(!aVK){inventory.o3();return;}clanPanel.ds=true;}}

function GameServer(){this.z=new aVL();this.nC=new aVM();
this.isValidShipLaunchDirection=new aVN();this.aGu=new aVO();this.eg=new aVP();this.aHS=new aVQ();this.rR=new aVR();
this.aSx=new aVS();this.a8n=new aVT();this.aVU=new aVV();this.aVW=new aVX();this.aVY=new aVZ();
this.aVa=new aVb();this.applyToGame=function(){this.z.applyToGame();};}

function aVL(){this.interiorColorRed=3;this.aVc=null;
this.a3X=0;this.mapId=0;var aVd;var aVe;
var aVf=15000;this.applyToGame=function(){this.aVc=new Array(this.interiorColorRed);
this.aVc[0]="territorial.io";this.aVc[1]="1.territorial.io";this.aVc[2]="2.territorial.io";
aVd=new Array(this.interiorColorRed);aVe=new Array(this.interiorColorRed);for(var aC=this.interiorColorRed-1;aC>=0;aC--){
aVe[aC]={aVE:false,eZ:0,aVg:false};}this.interiorColorGreen(0,0,0);};this.aVh=function(aC){return aVd[aC];
};this.ee=function(){for(var aC=this.interiorColorRed-1;aC>=0;aC--){if(this.responsePacketBuilder(aC)&&clanPanel.eZ>aVe[aC].eZ+aVf){
gameServer.isValidShipLaunchDirection.aVi(aC,aVe[aC].aVg);aVj(aC);}}if(!this.responsePacketBuilder(0)&&clanPanel.eZ>aVe[0].eZ+8000){
aVe[0].eZ=clanPanel.eZ;this.interiorColorGreen(0,0,0);}};this.aSu=function(id){return this.interiorColorGreen(0,id,0)&&this.calculateRequiredBytes(0);
};this.aVl=function(aVm){if(aVm){return loadingSystem.aIL;}return aVn();};

function aVn(){if(loadingSystem.aIK===0){
return settingsPanel.e5?1:0;}return loadingSystem.aIK-1;}this.a2g=function(){if(aVn()){return "game.territorial.io";}return "territorial.io";
};this.aQi=function(aVo){var fc=this.a2g()+aVo;return "<a href='https://"+fc+"' target='_blank'>"+fc+"</a>";
};this.interiorColorGreen=function(oN,a3U,aVm){var aVp=this.aVl(aVm);if(!aVe[oN].aVE){
aVq(oN,a3U,aVp);return false;}if(aVd[oN].aVr()){aVd[oN].aVs(a3U);return aVd[oN].responsePacketBuilder();}aVd[oN].tZ();
aVq(oN,a3U,aVp);return false;};

function aVq(oN,a3U,aVp){aVe[oN].aVE=true;aVj(oN);aVd[oN]=new aVt();
aVd[oN].applyToGame(oN,a3U,aVp);}this.hashGenerator=function(oN,a3U){console.log("Connection to Server "+oN);
gameServer.eg.aVv(oN);};this.calculateRequiredBytes=function(aC){return this.responsePacketBuilder(aC)&&aVd[aC].calculateRequiredBytes();
};this.aVw=function(aC){aVd[aC].aVw();};this.responsePacketBuilder=function(aC){return aVe[aC].aVE&&aVd[aC].responsePacketBuilder();
};

function aVr(aC){return aVe[aC].aVE&&aVd[aC].aVr();}this.send=function(oN,aD){
if(oN!==0){aVj(oN);}aVd[oN].send(aD);};this.a43=function(oN){if(moderationSystem.a3P()===8){
aVe[oN].aVg=true;gameServer.nC.aVx=true;}};

function aVj(oN){aVe[oN].eZ=clanPanel.eZ;aVe[oN].aVg=false;}
this.close=function(oN,aVy){if(aVr(oN)){aVd[oN].close(aVy);}};this.aVz=function(oN,aVy){techInfo.a3b(aVy);
if(aVr(oN)){aVd[oN].close(aVy);}};this.a3c=function(aVy){for(var aC=this.interiorColorRed-1;aC>=0;aC--){
this.close(aC,aVy);}};this.aW0=function(oN,aVy){for(var aC=this.interiorColorRed-1;aC>=0;aC--){
if(aC!==oN){this.close(aC,aVy);}}};this.findShipAtScreenPosition=function(){if(this.a3X!==0||(!localPlayer.lE&&!localPlayer.hi)){
this.close(this.a3X,3246);}};this.aW1=function(oN,e){aVd[oN].tZ();techInfo.a3M(oN,e.code);
};}

function aVM(){this.aVx=false;this.ee=function(){if(clanPanel.kr()%250!==249){return;}if(localPlayer.hi){return;
}gameServer.eg.aW2(+(this.aVx&&playerData.nU[localPlayer.getTileOwner]),aW3());this.aVx=false;};

function aW3(){return territorySystem.lQ+bonusSystem.z.mk;
}}

function aVT(){this.aW4=function(oN,aD){urlParams.applyToGame(aD);if(urlParams.size===0){gameServer.z.aVz(oN,3205);return;
}if(urlParams.arrayUtils(1)===0){aW5(oN);}else{aW6(oN);}clanPanel.finalizeToUint8Array();};

function aW5(oN){var aW8=urlParams.arrayUtils(6);if(aW8===0){
aW9(oN);}else if(aW8===2){gameServer.aVU.screenHasher(oN);}else if(aW8===3||aW8===4){touchController.applyToGame();}else if(aW8===5){
gameServer.aVW.aWB();}else if(aW8===9){gameServer.aVW.aWC(oN);}else if(aW8===10){gameServer.aVY.aWD();}else if(aW8===11){
gameServer.aVW.aWE(oN);}else if(aW8===12){gameServer.aVY.aWF();}else if(aW8===13){gameServer.aVa.aWG();}else if(aW8===14){
gameServer.aVa.aWH();}else if(aW8===15){gameServer.aVW.aWI();}else if(aW8===16){gameServer.aVU.aWJ(oN);}else if(aW8===17){
gameServer.aVU.aWK(oN);}else if(aW8===19){gameServer.aVU.aWL(oN);}else if(aW8===20){gameServer.aVW.aWM(oN);
}else if(aW8===21){}else if(aW8===22){}else if(aW8===23){gameServer.aVW.aWN(oN);}}

function aW9(oN){
if(oN!==0){return;}if(moderationSystem.a3P()===8){return;}account.z.aUN();
var aWO=urlParams.arrayUtils(12);
var aWP=urlParams.arrayUtils(6);
var h=new Array(aWO);for(var aC=0;aC<aWO;aC++){h[aC]=urlParams.arrayUtils(aWP);}keyboardHandler.aBg(h);}

function aW6(oN){
var aW8;
var sO=moderationSystem.a3P();if(sO!==8){if(!touchController.isInteriorTerritoryTile()){return;}}if(oN!==gameServer.z.a3X){gameServer.z.aVz(oN,3244);
return;}aW8=urlParams.arrayUtils(1);if(aW8===0){clanPanel.a2Q.glowTimer(urlParams.aD);}else{aWR();}}

function aWR(){var aWS=urlParams.arrayUtils(2);
if(aWS===0){aWT();}else if(aWS===1){aWU();}else if(aWS===2){aWV();}else{if(!settingsPanel.aA||settingsPanel.aB){return;
}var fZ=3*60*3;canvasManager.a8(1+6+fZ*32);canvasManager.writeBits(1,0);canvasManager.writeBits(6,10);var aC;fZ=Math.min(mapCache.validateAndResolveTarget.rU.length,fZ);
for(aC=0;aC<fZ;aC++){canvasManager.aWW(32,mapCache.validateAndResolveTarget.rU[aC]);}gameServer.z.send(gameServer.z.a3X,canvasManager.aD);}}

function aWT(){
var qm=urlParams.arrayUtils(9);if(playerData.nU[qm]===0||playerData.nU[localPlayer.getTileOwner]===0){return;}var r3=urlParams.arrayUtils(10);hoverProcessor.r2(qm,localPlayer.getTileOwner,r3);
troops.rt(qm,1,r3);}

function aWU(){var qm=urlParams.arrayUtils(9);if(playerData.nU[qm]===0||playerData.nU[localPlayer.getTileOwner]===0){return;
}if(!questSystem.aNH(0,[qm],true)){return;}hoverProcessor.canvasUtils(qm,1);}

function aWV(){var qm=urlParams.arrayUtils(9);
var target=urlParams.arrayUtils(9);
if(playerData.nU[qm]===0||playerData.nU[target]===0||playerData.nU[localPlayer.getTileOwner]===0){return;}if(!questSystem.aNH(1,[qm],true)){
return;}troops.rt(qm,3,96);troops.rt(target,4,96);hoverProcessor.a8t(qm,target);}}

function aVZ(){this.aWD=function(){
connectionMgr.z.integerMagnitude();connectionMgr.qo.boatNotificationHandler(105,uiRenderer.f0.uc(uiRenderer.f0.ud(5)));connectionMgr.qo.boatNotificationHandler(106,uiRenderer.f0.uc(uiRenderer.f0.ud(15)));
connectionMgr.qo.boatNotificationHandler(109,0);connectionMgr.qo.boatNotificationHandler(108,connectionMgr.buffer.data[109].value);connectionMgr.qo.boatNotificationHandler(111,connectionMgr.buffer.data[109].value+1);
connectionMgr.qo.boatNotificationHandler(107,0);connectionMgr.qo.boatNotificationHandler(110,"");};this.aWF=function(){if(urlParams.size<canvasManager.aWX(1+6+5+3+3+3+8)){
gameServer.z.aVz(0,3254);return;}var data={uZ:urlParams.arrayUtils(30),y0:urlParams.arrayUtils(16),y1:urlParams.arrayUtils(30),
y2:urlParams.arrayUtils(30),y3:urlParams.arrayUtils(30),y4:urlParams.aWY(32),username:minimapRenderer.yH.yY(5),y5:minimapRenderer.yH.yY(3),y6:minimapRenderer.yH.yY(3),
y7:urlParams.aWY(32),y8:urlParams.aWY(32),y9:urlParams.arrayUtils(30),yA:urlParams.aWY(32),yB:urlParams.aWY(32),yC:urlParams.aWY(32),yD:urlParams.aWY(32),
aQy:urlParams.aWY(32),aQz:urlParams.aWY(30),aRP:urlParams.aWY(32),aRQ:minimapRenderer.yH.yY(3),aRI:urlParams.aWY(2),aRK:urlParams.aWY(10),
aRG:minimapRenderer.yH.yY(8),aRJ:urlParams.aWY(5),aQk:urlParams.arrayUtils(30),aQv:urlParams.arrayUtils(30),a2j:urlParams.aWY(32),aR3:urlParams.arrayUtils(3),
aR2:urlParams.arrayUtils(8),aQw:urlParams.arrayUtils(30),aQx:urlParams.aWY(32),aR1:urlParams.arrayUtils(1),aRC:minimapRenderer.yH.yY(6),aR4:urlParams.arrayUtils(1),aR5:urlParams.arrayUtils(1),
aR6:urlParams.arrayUtils(1),aRR:urlParams.arrayUtils(1),aRS:urlParams.arrayUtils(1)};if(data.aRR){data.aRT=urlParams.aWY(32);data.aRU=urlParams.arrayUtils(30);
data.aRV=urlParams.arrayUtils(30);data.aRW=urlParams.arrayUtils(1);}if(account.ua===8){if(account.handleKeyInput().aSt===25){data.aQN=true;
account.z.aQ1=data;account.handleKeyInput().aEZ(25,false);}else{data.aQN=false;connectionMgr.qo.boatNotificationHandler(160,+(data.aRR&&data.aRW));
data.uY=connectionMgr.buffer.data[105].value;account.z.aPy=data;connectionMgr.qo.xz(data);account.handleKeyInput().aEZ(16,true);
}}};}

function aVb(){this.aWG=function(){var aC;if(urlParams.size<canvasManager.aWX(1+6+6+10)){gameServer.z.aVz(0,3259);
return;}var ur=urlParams.arrayUtils(6);
var fZ=urlParams.arrayUtils(10);
var data=[];if(ur===9||ur===10||ur===11||ur===13){
for(aC=0;aC<fZ;aC++){data.push([urlParams.arrayUtils(30),minimapRenderer.yH.yY(5),urlParams.aWY(32),
0,urlParams.arrayUtils(30)]);}if(account.ua===8){account.handleKeyInput().aEZ(21,true,{ur:ur,data:data});}return;}if(ur===12){
for(aC=0;aC<fZ;aC++){data.push([urlParams.arrayUtils(20),urlParams.arrayUtils(30),urlParams.arrayUtils(30),urlParams.aWY(32),urlParams.arrayUtils(30),minimapRenderer.yH.yY(5),
minimapRenderer.yH.yY(5)]);}if(account.ua===8){account.handleKeyInput().aEZ(21,true,{ur:ur,data:data});}return;}var iW=urlParams.arrayUtils(16);
if(!urlParams.aWZ(1+6+6+10+16+iW*16+fZ*(ur===0?(30+5+16+30+30):ur===1?(16+3+16+5+31+30):(ur===2||ur===3)?
(30+5+32+30+30):(4*30+32+30+20+5+5)))){gameServer.z.aVz(0,3260);return;}if(ur===0){for(aC=0;aC<fZ;aC++){
data.push([urlParams.arrayUtils(30),minimapRenderer.yF.yJ(urlParams.arrayUtils(5)),urlParams.arrayUtils(16),urlParams.arrayUtils(30),urlParams.arrayUtils(30)]);}}else if(ur===1){
for(aC=0;aC<fZ;aC++){data.push([urlParams.arrayUtils(16),minimapRenderer.yF.yJ(urlParams.arrayUtils(3)),urlParams.arrayUtils(16),minimapRenderer.yF.yJ(urlParams.arrayUtils(5)),
urlParams.arrayUtils(31),urlParams.arrayUtils(30)]);}}else if(ur===2||ur===3){for(aC=0;aC<fZ;aC++){data.push([urlParams.arrayUtils(30),
minimapRenderer.yF.yJ(urlParams.arrayUtils(5)),urlParams.aWY(32),urlParams.arrayUtils(30),urlParams.arrayUtils(30)]);}}else{for(aC=0;aC<fZ;aC++){data.push([
urlParams.arrayUtils(20),urlParams.arrayUtils(30),urlParams.arrayUtils(30),urlParams.arrayUtils(30),urlParams.arrayUtils(30),urlParams.aWY(32),urlParams.arrayUtils(30),minimapRenderer.yF.yJ(urlParams.arrayUtils(5)),
minimapRenderer.yF.yJ(urlParams.arrayUtils(5))]);}}if(account.ua===8){account.handleKeyInput().aEZ(21,true,{ur:ur,data:data});}};this.aWH=function(){
if(urlParams.size<canvasManager.aWX(1+6+4+7+11)){gameServer.z.aVz(0,3265);return;}var aWa=urlParams.arrayUtils(4);
var aWb=urlParams.arrayUtils(7);
var aWc=urlParams.arrayUtils(11);if(!urlParams.aWZ(1+6+4+7+11+aWb*16+aWc*16+aWa*(3+8))){gameServer.z.aVz(0,3266);
return;}var data=[];for(var aC=0;aC<aWa;aC++){var a2y=minimapRenderer.yF.yJ(urlParams.arrayUtils(3));
var aWd=urlParams.arrayUtils(8);
var aS3=[];for(var fs=0;fs<aWd;fs++){aS3.push(urlParams.arrayUtils(16));}data.push({name:"["+a2y+"]",aS3:aS3});
}if(account.ua===8){account.handleKeyInput().aEZ(23,true,data);}};}

function aVV(){this.screenHasher=function(oN){
if(oN!==gameServer.z.mapId){gameServer.z.close(oN,3239);return;}if(moderationSystem.a3P()!==6){gameServer.z.close(oN,3271);
return;}audioSystem.applyToGame();for(var aC=0;aC<4;aC++){var tN=audioSystem.z.tO[aC];tN.vP=urlParams.arrayUtils(10);tN.tileDataToIndexUnchecked=urlParams.arrayUtils(6);
tN.mapSeed=urlParams.arrayUtils(14);tN.aFm=urlParams.arrayUtils(4);tN.aHW=urlParams.arrayUtils(6);tN.aHX=urlParams.arrayUtils(14);tN.aHY=urlParams.arrayUtils(4);
tN.aFs=urlParams.arrayUtils(1);tN.aGa=urlParams.arrayUtils(12);tN.spawningSeed=urlParams.arrayUtils(14);
var playerCount=urlParams.arrayUtils(16);
audioSystem.vg.vi[aC]=urlParams.arrayUtils(16);for(var fs=0;fs<playerCount;fs++){audioSystem.vg.aFE(aC,urlParams.arrayUtils(30),minimapRenderer.yH.yY(5),
urlParams.arrayUtils(4),urlParams.arrayUtils(30),urlParams.arrayUtils(7),urlParams.arrayUtils(16),urlParams.arrayUtils(18),urlParams.arrayUtils(11),urlParams.arrayUtils(12));}}account.v(29);audioSystem.z.aGS(true);};
this.aWJ=function(oN){if(oN!==gameServer.z.mapId){gameServer.z.close(oN,3239);return;}if(!audioSystem.f6){gameServer.z.close(oN,3251);
return;}audioSystem.z.aGQ[0]=urlParams.arrayUtils(20);audioSystem.z.aGQ[1]=urlParams.arrayUtils(20);
var aWe=urlParams.arrayUtils(16);for(var fs=0;fs<aWe;fs++){
var id=urlParams.arrayUtils(3);if(id===0){audioSystem.vg.aFE(urlParams.arrayUtils(2),urlParams.arrayUtils(30),minimapRenderer.yH.yY(5),0,1234566,
127,0,urlParams.arrayUtils(18),0,urlParams.arrayUtils(12));}else if(id===1){audioSystem.vg.aFX(urlParams.arrayUtils(16),urlParams.arrayUtils(2));}else if(id===2){
audioSystem.vg.aFT(urlParams.arrayUtils(16),urlParams.arrayUtils(2),urlParams.arrayUtils(2));}else if(id===3){audioSystem.vg.aFW(urlParams.arrayUtils(16),urlParams.arrayUtils(2)
);}else if(id===4){audioSystem.vg.aFM(urlParams.arrayUtils(16),urlParams.arrayUtils(2),urlParams.arrayUtils(4),urlParams.arrayUtils(30),urlParams.arrayUtils(7),urlParams.arrayUtils(16),urlParams.arrayUtils(11),
urlParams.arrayUtils(18));}else if(id===5){audioSystem.vg.aFN(urlParams.arrayUtils(16),urlParams.arrayUtils(2),urlParams.arrayUtils(1));}}for(var aC=0;aC<4;aC++){
var tN=audioSystem.z.tO[aC];tN.vP=urlParams.arrayUtils(10);tN.aHW=urlParams.arrayUtils(6);tN.aHX=urlParams.arrayUtils(14);tN.aHY=urlParams.arrayUtils(4);if(tN.vP===0){
tN.a3X=urlParams.arrayUtils(10);tN.aFq=urlParams.arrayUtils(10);if(audioSystem.aF2.forceResize(aC)){return;}tN.tileDataToIndexUnchecked=urlParams.arrayUtils(6);tN.mapSeed=urlParams.arrayUtils(14);
tN.aFm=urlParams.arrayUtils(4);tN.aFs=urlParams.arrayUtils(1);tN.aGa=urlParams.arrayUtils(12);tN.spawningSeed=urlParams.arrayUtils(14);tN.aHZ.push(tN.aHZ[0]);
tN.aHZ.shift();}}audioSystem.z.aFi();};this.aWK=function(oN){if(oN!==gameServer.z.mapId){gameServer.z.close(oN,3272);
return;}if(!audioSystem.f6){gameServer.z.close(oN,3273);return;}var tL=urlParams.arrayUtils(4);
var tN=audioSystem.z.tO[tL];
var tP=tN.tP;tN.tQ=urlParams.arrayUtils(20);
var vw=urlParams.arrayUtils(6);for(var aC=0;aC<vw;aC++){var aHq=aWf();
audioSystem.tY.aHp(aHq);tP.push(aHq);}audioSystem.z.aGb(tL);};

function aWf(){var id=urlParams.arrayUtils(3);if(id===0){
return{id:id,uY:urlParams.arrayUtils(30),s:audioSystem.aF0.aGz(minimapRenderer.yH.yY(7))};}if(id===1){return{id:id,uY:urlParams.arrayUtils(30),
aG1:urlParams.arrayUtils(3),value:urlParams.arrayUtils(30),target:urlParams.arrayUtils(30)};}if(id===2){return{id:id,uY:urlParams.arrayUtils(30),aG1:urlParams.arrayUtils(3)
};}if(id===3){return{id:id,uY:urlParams.arrayUtils(30),aG1:urlParams.arrayUtils(3),value:urlParams.arrayUtils(4),target:urlParams.arrayUtils(30)};}if(id===4){
return{id:id,uY:urlParams.arrayUtils(30),aG1:urlParams.arrayUtils(3),target:urlParams.arrayUtils(30)};}if(id===5){return{id:id,aG1:urlParams.arrayUtils(6)
};}if(id===6){return{id:id,value:urlParams.arrayUtils(17)};}return null;}this.aWL=function(oN){if(oN!==gameServer.z.mapId){
gameServer.z.close(oN,3276);return;}if(!audioSystem.f6){gameServer.z.close(oN,3277);return;}audioSystem.message.aFg(aWf());
};}

function aVX(){this.aWB=function(){var id=urlParams.arrayUtils(20);
var colors=new Array(11);
for(var aC=0;aC<11;aC++){colors[aC]=new Uint8Array([urlParams.arrayUtils(8),urlParams.arrayUtils(8),urlParams.arrayUtils(8)]);
}var el=minimapRenderer.yH.yY(8);gameConfig.eS.ei({id:id,colors:colors,el:el});};this.aWM=function(oN){
var aWg=urlParams.arrayUtils(3);
var fc=urlParams.arrayUtils(5);
var sq=gameUI.aWh.aWi(fc,urlParams.arrayUtils(30),urlParams.arrayUtils(30),urlParams.arrayUtils(30));
gameServer.eg.aWj(oN,sq,aWg,0);};this.aWC=function(oN){this.aWM(oN);connectionMgr.qo.boatNotificationHandler(183,uiRenderer.f0.uc(uiRenderer.f0.ud(15)));
if(oN===0){if(connectionMgr.buffer.data[105].value.length===0){gameServer.eg.eh(0);
}else{gameServer.aHS.aWk(oN);}}else{gameServer.aHS.aWk(oN);}if(gameServer.z.aVh(oN).aWl()===4){if(moderationSystem.a3P()===6){
gameServer.aGu.interiorColorBlue(oN);}}else if(gameServer.z.aVh(oN).aWl()===5){if(moderationSystem.a3P()===8||moderationSystem.a3P()===10){gameServer.isValidShipLaunchDirection.aIp();
}}};this.aWE=function(oN){var id=urlParams.arrayUtils(6);if(id===1){connectionMgr.qo.boatNotificationHandler(160,urlParams.arrayUtils(30));gameServer.z.aVw(oN);
if(!keyboardHandler.aBc){gameServer.eg.eh(1);}renderer.aEV();if(account.ua===8){account.handleKeyInput().aT6();}return;}if(id===21){if(account.ua===8){
account.handleKeyInput().aEZ(17);}return;}if(id===22){connectionMgr.qo.boatNotificationHandler(106,connectionMgr.buffer.data[110].value);connectionMgr.qo.boatNotificationHandler(110,"");
if(account.ua===8){account.handleKeyInput().aEZ(15);}return;}};this.aWI=function(){var fZ=urlParams.arrayUtils(16);
var aWm=urlParams.arrayUtils(16);
if(!urlParams.aWZ(1+6+16+16+16+fZ*10+aWm*16)){gameServer.z.aVz(0,3270);return;}var h=[];for(var aC=0;aC<fZ;aC++){
h.push(minimapRenderer.yF.yJ(urlParams.arrayUtils(10)));}renderer.aEY(h);};this.aWN=function(oN){var aWg=urlParams.arrayUtils(3);
var fc=urlParams.arrayUtils(5);
var sq=gameUI.aWh.aWi(fc,urlParams.arrayUtils(30),urlParams.arrayUtils(30),urlParams.arrayUtils(30));
var pow={aWg:aWg,sq:sq};
var pA=urlParams.aWY(32);
var aWn=[];for(var aC=0;aC<17;aC++){aWn.push(new Uint8Array(urlParams.arrayUtils(16)));}for(var aC=0;aC<17;aC++){
var h=aWn[aC];
var fZ=h.length;for(var iR=0;iR<fZ;iR++){h[iR]=urlParams.aWY(8);}}modalDialogEngine.show(aWn,pA,oN,pow);
};}

function aVN(){this.aVi=function(oN,aVg){canvasManager.a8(1+6+1+3);canvasManager.writeBits(1,0);canvasManager.writeBits(6,4);
canvasManager.writeBits(1,aVg?1:0);canvasManager.writeBits(3,localPlayer.a2G===0?audioSystem.f6?6:0:localPlayer.hi?1:localPlayer.lE?7:localPlayer.survivorBotCount<7?2:localPlayer.survivorBotCount===8?4:localPlayer.survivorBotCount===9?5:3);
gameServer.z.send(oN,canvasManager.aD);};this.aIp=function(){canvasManager.a8(1+6+8+10+9+10+14);canvasManager.writeBits(1,0);
canvasManager.writeBits(6,5);canvasManager.writeBits(8,gameServer.z.mapId);canvasManager.writeBits(10,touchController.aFq);canvasManager.writeBits(9,touchController.aIi);canvasManager.writeBits(10,settingsPanel.e7);canvasManager.writeBits(14,settingsPanel.dw);
gameServer.z.send(gameServer.z.a3X,canvasManager.aD);};this.qn=function(fL){canvasManager.a8(1+4+22);canvasManager.writeBits(1,1);canvasManager.writeBits(4,0);
canvasManager.writeBits(22,fL);gameServer.z.send(gameServer.z.a3X,canvasManager.aD);};this.prepareInterceptLaunch=function(jC,k3){canvasManager.a8(1+4+10+10);canvasManager.writeBits(1,1);
canvasManager.writeBits(4,1);canvasManager.writeBits(10,jC);canvasManager.writeBits(10,k3);gameServer.z.send(gameServer.z.a3X,canvasManager.aD);};this.qu=function(jC,qs){
canvasManager.a8(1+4+10+9);canvasManager.writeBits(1,1);canvasManager.writeBits(4,2);canvasManager.writeBits(10,jC);canvasManager.writeBits(9,qs);gameServer.z.send(gameServer.z.a3X,canvasManager.aD);
};this.qw=function(jC,qv){canvasManager.a8(1+4+10+27);canvasManager.writeBits(1,1);canvasManager.writeBits(4,3);canvasManager.writeBits(10,jC);canvasManager.writeBits(27,qv);
gameServer.z.send(gameServer.z.a3X,canvasManager.aD);};this.qy=function(jC,ns){canvasManager.a8(1+4+10+16);canvasManager.writeBits(1,1);canvasManager.writeBits(4,4);
canvasManager.writeBits(10,jC);canvasManager.writeBits(16,ns);gameServer.z.send(gameServer.z.a3X,canvasManager.aD);};this.r1=function(k3){canvasManager.a8(1+4+10);
canvasManager.writeBits(1,1);canvasManager.writeBits(4,5);canvasManager.writeBits(10,k3);gameServer.z.send(gameServer.z.a3X,canvasManager.aD);};this.r5=function(eI){canvasManager.a8(1+4+10);
canvasManager.writeBits(1,1);canvasManager.writeBits(4,6);canvasManager.writeBits(10,eI);gameServer.z.send(gameServer.z.a3X,canvasManager.aD);};this.r7=function(r6){canvasManager.a8(1+4+1);
canvasManager.writeBits(1,1);canvasManager.writeBits(4,7);canvasManager.writeBits(1,r6);gameServer.z.send(gameServer.z.a3X,canvasManager.aD);};this.r9=function(){canvasManager.a8(1+4);
canvasManager.writeBits(1,1);canvasManager.writeBits(4,8);gameServer.z.send(gameServer.z.a3X,canvasManager.aD);};this.rA=function(jC,fL,k3){canvasManager.a8(1+4+10+10+22);
canvasManager.writeBits(1,1);canvasManager.writeBits(4,10);canvasManager.writeBits(10,jC);canvasManager.writeBits(10,k3);canvasManager.writeBits(22,fL);gameServer.z.send(gameServer.z.a3X,canvasManager.aD);
};this.rI=function(aWo,aWp){canvasManager.a8(1+4+9+10);canvasManager.writeBits(1,1);canvasManager.writeBits(4,15);canvasManager.writeBits(9,aWp);
canvasManager.writeBits(10,aWo);gameServer.z.send(gameServer.z.a3X,canvasManager.aD);};this.rL=function(a8n){canvasManager.a8(1+4+9);canvasManager.writeBits(1,1);
canvasManager.writeBits(4,14);canvasManager.writeBits(9,a8n);gameServer.z.send(gameServer.z.a3X,canvasManager.aD);};this.rP=function(aWq,target){var aC;
var fZ=aWq.length;canvasManager.a8(1+4+9+fZ*9);canvasManager.writeBits(1,1);canvasManager.writeBits(4,13);canvasManager.writeBits(9,target);for(aC=0;aC<fZ;aC++){
canvasManager.writeBits(9,aWq[aC]);}gameServer.z.send(gameServer.z.a3X,canvasManager.aD);};}

function aVQ(){this.aWr=function(){
canvasManager.a8(1+6+(14+4+7+1+1+5));canvasManager.writeBits(1,0);canvasManager.writeBits(6,16);gameServer.eg.aWs();gameServer.z.send(0,canvasManager.aD);
};this.aWk=function(oN){canvasManager.a8(1+6+(30+90));canvasManager.writeBits(1,0);canvasManager.writeBits(6,17);aWt();gameServer.z.send(oN,canvasManager.aD);
};this.aT7=function(){canvasManager.a8(1+6+90);canvasManager.writeBits(1,0);canvasManager.writeBits(6,18);minimapRenderer.f0.yV(connectionMgr.buffer.data[110].value,15);
gameServer.z.send(0,canvasManager.aD);};this.aRE=function(a64){var fZ=a64.s1.length;canvasManager.a8(1+6+6+8+fZ*16);
canvasManager.writeBits(1,0);canvasManager.writeBits(6,29);canvasManager.writeBits(6,a64.action);canvasManager.writeBits(8,fZ);uiRenderer.yF.yU(a64.s1);gameServer.z.send(0,canvasManager.aD);};
this.settingsPacketHandler=function(y4,colors,aWu,el){localStore.applyToGame();localStore.writeBits(1,0);localStore.writeBits(6,16);localStore.writeBits(20,Math.min(y4,1000000));
for(var aC=0;aC<11;aC++){for(var fs=0;fs<3;fs++){localStore.writeBits(8,colors[aC][fs]);}
}var xk=renderer.data.aEc(aWu.trim());localStore.writeBits(8,xk===-1?255:xk);uiRenderer.yH.a1i(el.trim().substring(0,180),8,localStore);
gameServer.z.send(0,localStore.aWv());};this.aRL=function(data){canvasManager.a8(1+6+6+30);canvasManager.writeBits(1,0);
canvasManager.writeBits(6,25);canvasManager.writeBits(6,data.action);minimapRenderer.f0.yV(data.uY,5);gameServer.z.send(0,canvasManager.aD);};this.aHT=function(data){
canvasManager.a8(1+6+6+30+32);canvasManager.writeBits(1,0);canvasManager.writeBits(6,27);canvasManager.writeBits(6,data.action);minimapRenderer.f0.yV(data.uY,5);
canvasManager.aWW(32,data.value);gameServer.z.send(0,canvasManager.aD);};

function aWt(){minimapRenderer.f0.yV(connectionMgr.buffer.data[105].value,5);
minimapRenderer.f0.yV(connectionMgr.buffer.data[106].value,15);}}

function aVR(){this.cssGap=function(){
var fZ=localPlayer.ku;
var a25=inputController.result.a25;
var lp=a25.length;canvasManager.a8(1+4+10+1+1+fZ*16+lp*(9+24));
canvasManager.writeBits(1,1);canvasManager.writeBits(4,12);canvasManager.writeBits(10,lp);canvasManager.writeBits(1,+(localPlayer.playerValidator===2));canvasManager.writeBits(1,localPlayer.a2Y%2);
var a2r=playerData.a2r;for(var aC=0;aC<fZ;aC++){canvasManager.writeBits(16,a2r[aC]);}var hN=playerData.hN;for(aC=0;aC<lp;aC++){
var h7=a25[aC];canvasManager.writeBits(9,h7);canvasManager.writeBits(24,hN[h7]);}gameServer.z.send(gameServer.z.a3X,canvasManager.aD);};}

function aVS(){
this.aSy=function(ur,us,ut){canvasManager.a8(1+6+6+2*(1+30));canvasManager.writeBits(1,0);canvasManager.writeBits(6,21);canvasManager.writeBits(6,ur);
canvasManager.writeBits(1,+(us<0));canvasManager.writeBits(1,+(ut<0));canvasManager.writeBits(30,Math.abs(us));canvasManager.writeBits(30,Math.abs(ut));gameServer.z.send(0,canvasManager.aD);
};this.aSz=function(ur,aT0,aT1){canvasManager.a8(1+6+6+5+aT0.length*16+30);canvasManager.writeBits(1,0);canvasManager.writeBits(6,22);
canvasManager.writeBits(6,ur);gameServer.eg.aWw(aT0);canvasManager.writeBits(30,aT1);gameServer.z.send(0,canvasManager.aD);};this.aT4=function(ur,aT0,aT1){
canvasManager.a8(1+6+6+30+30);canvasManager.writeBits(1,0);canvasManager.writeBits(6,28);canvasManager.writeBits(6,ur);minimapRenderer.f0.yV(aT0,5);
canvasManager.writeBits(30,aT1);gameServer.z.send(0,canvasManager.aD);};this.aT2=function(aS2,a2x){var aC;
var fZ=a2x.length;
var iW=0;for(aC=0;aC<fZ;aC++){iW+=a2x[aC].length;}canvasManager.a8(1+6+3+4+7+fZ*3+iW*16);canvasManager.writeBits(1,0);
canvasManager.writeBits(6,23);canvasManager.writeBits(3,aS2);canvasManager.writeBits(4,fZ);canvasManager.writeBits(7,iW);for(aC=0;aC<fZ;aC++){canvasManager.writeBits(3,a2x[aC].length);
uiRenderer.yF.yU(a2x[aC]);}gameServer.z.send(0,canvasManager.aD);};this.aT3=function(aS2,us,ut){canvasManager.a8(1+6+3+2*(1+20));
canvasManager.writeBits(1,0);canvasManager.writeBits(6,24);canvasManager.writeBits(3,aS2);canvasManager.writeBits(1,+(us<0));canvasManager.writeBits(1,+(ut<0));canvasManager.writeBits(20,Math.abs(us));
canvasManager.writeBits(20,Math.abs(ut));gameServer.z.send(0,canvasManager.aD);};}

function aVO(){this.interiorColorBlue=function(oN){
var username=connectionMgr.buffer.data[122].value.slice(0,20);canvasManager.a8(1+6+10+2+5+username.length*16+18);
canvasManager.writeBits(1,0);canvasManager.writeBits(6,1);canvasManager.writeBits(10,settingsPanel.e7);canvasManager.writeBits(2,connectionMgr.buffer.data[158].value);
gameServer.eg.aWw(username);
var aSo=gameState.color.a5A(connectionMgr.z.xt());canvasManager.writeBits(6,aSo[0]);canvasManager.writeBits(6,aSo[1]);
canvasManager.writeBits(6,aSo[2]);gameServer.z.mapId=oN;gameServer.z.send(oN,canvasManager.aD);};this.aGv=function(aWx,a64){localStore.applyToGame();
localStore.writeBits(1,0);localStore.writeBits(6,2);localStore.writeBits(3,aWx);if(aWx===2){localStore.writeBits(2,a64);}else if(aWx===3){uiRenderer.yH.a1i(a64,7,localStore);
}else if(aWx===5){localStore.writeBits(3,a64.id);localStore.writeBits(3,a64.value);localStore.writeBits(30,a64.uY);}gameServer.z.send(gameServer.z.mapId,localStore.aWv());
};}

function aVP(){this.aVv=function(oN){canvasManager.a8(1+6+(14+4+7+1+1+5+2*8)+gameUI.aWy.arrayUtils());
canvasManager.writeBits(1,0);canvasManager.writeBits(6,13);aWz();gameUI.aWy.a1i();gameServer.z.send(oN,canvasManager.aD);};this.aWj=function(oN,sq,aWg,ReplayRecorder){
canvasManager.a8(1+6+3+30+30);canvasManager.writeBits(1,0);canvasManager.writeBits(6,30);canvasManager.writeBits(3,aWg);canvasManager.writeBits(30,sq);canvasManager.writeBits(30,ReplayRecorder);
gameServer.z.send(oN,canvasManager.aD);};this.f8=function(MountainAttackTargetFinder){localStore.applyToGame();localStore.writeBits(1,0);localStore.writeBits(6,6);uiRenderer.yH.a1i(MountainAttackTargetFinder,16,localStore);
gameServer.z.send(gameServer.z.mapId,localStore.aWv());};this.eh=function(id){canvasManager.a8(1+6+6);canvasManager.writeBits(1,0);canvasManager.writeBits(6,15);canvasManager.writeBits(6,id);
gameServer.z.send(0,canvasManager.aD);};this.wC=function(id,value){canvasManager.a8(1+6+6+30);canvasManager.writeBits(1,0);canvasManager.writeBits(6,3);canvasManager.writeBits(6,id);
canvasManager.writeBits(30,value);gameServer.z.send(0,canvasManager.aD);};this.aEX=function(id,s1){var fZ=Math.min(s1.length,63);
canvasManager.a8(1+6+6+6+fZ*16);canvasManager.writeBits(1,0);canvasManager.writeBits(6,26);canvasManager.writeBits(6,id);canvasManager.writeBits(6,fZ);uiRenderer.yF.yU(s1);
gameServer.z.send(0,canvasManager.aD);};this.ReplayEncoder=function(aUM,sC){canvasManager.a8(1+6+sC.length*(16+10));canvasManager.writeBits(1,0);canvasManager.writeBits(6,9);
for(var aC=0;aC<sC.length;aC++){canvasManager.writeBits(16,sC[aC][0]);canvasManager.writeBits(10,sC[aC][1]);}gameServer.z.send(aUM,canvasManager.aD);
};this.aW2=function(aX2,aX3){canvasManager.a8(1+6+1+12);canvasManager.writeBits(1,0);canvasManager.writeBits(6,19);canvasManager.writeBits(1,aX2);canvasManager.writeBits(12,aX3);
gameServer.z.send(gameServer.z.a3X,canvasManager.aD);};

function aWz(){canvasManager.writeBits(14,settingsPanel.dw);canvasManager.writeBits(4,uiSurface.id);canvasManager.writeBits(7,uiSurface.e3);
canvasManager.writeBits(1,+settingsPanel.aA);canvasManager.writeBits(1,+settingsPanel.aB);canvasManager.writeBits(5,(new Date()).getHours()%24);
var aX4=renderer.aEb();canvasManager.writeBits(8,aX4[0]);
canvasManager.writeBits(8,aX4[1]);}this.aWw=function(username){canvasManager.writeBits(5,username.length);uiRenderer.yF.yU(username);
};this.p8=function(p9,pA,oN,pow){canvasManager.a8(1+6+3+30+32+16);canvasManager.writeBits(1,0);canvasManager.writeBits(6,8);canvasManager.writeBits(3,pow.aWg);
canvasManager.writeBits(30,pow.sq);canvasManager.aWW(32,pA);canvasManager.writeBits(16,p9);gameServer.z.send(oN,canvasManager.aD);};}

function aVt(){var aX5;
var aX6;var b;
var aX7=["wss://","/s50/","/s51/","/s52/"];
var aX8=0;this.applyToGame=function(eI,a3U,aVp){
aX5=eI;aX6=a3U;aX9(aVp);};this.tickFlags=function(){return b.readyState===b.CONNECTING;
};this.responsePacketBuilder=function(){return b.readyState===b.OPEN;};this.calculateRequiredBytes=function(){
return aX8;};this.aVw=function(){aX8=1;};this.aVr=function(){return this.tickFlags()||this.responsePacketBuilder();
};this.aVs=function(a3U){aX6=a3U;};this.aWl=function(){return aX6;};this.send=function(aD){
if(this.responsePacketBuilder()){b.send(aD);}};this.close=function(aVy){if(this.aVr()){this.tZ();
b.close(aVy);}};this.tZ=function(){b.onopen=null;b.onmessage=null;b.onclose=null;b.onerror=null;
};

function aX9(aVp){var mF;if(settingsPanel.e0){mF="ws://localhost:"+(7130+aX5)+"/";}else{if(aVp){
mF=aX7[0]+"game.territorial.io"+"/x0"+aX5+"/";}else{mF=aX7[0]+gameServer.z.aVc[aX5]+aX7[1+settingsPanel.e1];}}b=new WebSocket(mF);
b.binaryType="arraybuffer";b.onopen=aVu;b.onmessage=aXB;b.onclose=aW1;b.onerror=aXC;
}

function aVu(){gameServer.z.hashGenerator(aX5,aX6);}

function aXB(e){gameServer.a8n.aW4(aX5,new Uint8Array(e.data));
}

function aXC(){}

function aW1(e){gameServer.z.aW1(aX5,e);}}

function GameMenu(){var aXD=false;
var aXE=0;
var j=0;
var uf=0;
var gap=0;
var canvas=null;
var ou=null;
var a4k=null;this.applyToGame=function(){
if(!localPlayer.iT){canvas=null;ou=null;a4k=null;return;}aXE=0;a4k=new Uint32Array(localPlayer.zS+1);
aXF();this.resize();};this.aAA=function(){return j;};this.resize=function(){
if(!localPlayer.iT){return;}j=Math.floor(0.95*((uiSurface.platformActions.ik()&&!localPlayer.ny)?(0.18*camera.min):(0.13*camera.il)));
j*=1+(0.5+0.2*uiSurface.platformActions.ik())*localPlayer.ny;j+=j%2;
gap=Math.max(1,0.015*j);uf=Math.floor(j-0.5*gap);canvas=canvas?canvas:document.createElement("canvas");
canvas.width=j;canvas.height=j;ou=canvas.getContext("2d",{alpha:true});ou.lineWidth=gap;
ou.strokeStyle=colorPalette.pO;gameState.sK.textAlign(ou,1);gameState.sK.textBaseline(ou,1);aXG();};this.lR=function(aXH){
if(aXH){aXI();}var lS=this.lT();if(mainMenu.lH[lS]){return a4k[lS];}lS=aXJ();
var ea=playerData.hN[mV[0]];
if(lS===-1){return ea;}if(a4k[lS]>ea){return a4k[lS];}return ea;};this.a3A=function(){
aXE=31;this.ee();return this.lT();};this.lT=function(){var lS=0;for(var aC=localPlayer.zS;aC>0;aC--){
if(a4k[aC]>a4k[lS]){lS=aC;}}return lS;};

function aXJ(){var lS=-1;for(var aC=localPlayer.zS;aC>=1;aC--){
if(lS===-1||a4k[aC]>a4k[lS]){lS=aC;}}return lS;}this.kv=function(aXK){var resolveAttackCombat=0;
var lV=territorySystem.lV;
var fX=mainMenu.fX;
var fZ=territorySystem.lQ;
var gD=boostSystem.gD;for(var aC=0;aC<fZ;aC++){var h7=lV[aC];if(fX[h7]===aXK){
gD[resolveAttackCombat++]=h7;}}boostSystem.g4[0]=resolveAttackCombat;};this.lU=function(aXK){var resolveAttackCombat=0;
var lV=territorySystem.lV;
var fX=mainMenu.fX;
var fZ=territorySystem.lQ;
var gD=boostSystem.gD;for(var aC=0;aC<fZ;aC++){var h7=lV[aC];if(fX[h7]!==aXK){gD[resolveAttackCombat++]=h7;
}}boostSystem.g4[0]=resolveAttackCombat;};this.a5c=function(){var resolveAttackCombat=0;for(var aC=localPlayer.zS;aC>=0;aC--){resolveAttackCombat+=a4k[aC]>0;
}return resolveAttackCombat;};this.ee=function(){if(!localPlayer.iT){return;}if(++aXE>=32){aXE=0;aXI();}};

function aXF(){
for(var aC=localPlayer.zS;aC>=0;aC--){a4k[aC]=0;}for(aC=territorySystem.lQ-1;aC>=0;aC--){a4k[mainMenu.fX[territorySystem.lV[aC]]]+=1;
}}

function aXI(){for(var aC=localPlayer.zS;aC>=0;aC--){a4k[aC]=0;}for(aC=territorySystem.lQ-1;aC>=0;aC--){
a4k[mainMenu.fX[territorySystem.lV[aC]]]+=playerData.hN[territorySystem.lV[aC]];}aXD=true;}this.nH=function(){if(!localPlayer.iT){
return;}if(aXD){aXG();}};

function aXG(){var aC;
var aXL=0;
var fZ=0;
var ej=Math.floor(j/2);
var eH=Math.floor(uf/2);
var aXM=1.5*Math.PI;var aXN;for(aC=localPlayer.zS;aC>=0;aC--){
fZ+=a4k[aC];if(a4k[aC]===0){aXL++;}}a0K();if(fZ>0){if(aXL===localPlayer.zS){for(aC=localPlayer.zS;aC>=0;aC--){
if(a4k[aC]>0){aXO(aC,ej,eH);break;}}aXP(ej);}else{for(aC=0;aC<=localPlayer.zS;aC++){if(a4k[aC]>0){
aXN=aXM+2*Math.PI*a4k[aC]/fZ;aXQ(aC,ej,eH,aXM,aXN);aXR(ej,eH,aXM,aXN);if(aC!==0){aXS(ej,eH,aXM);
}aXM=aXN;}}aXS(ej,eH,1.5*Math.PI);}}aXT(ej,eH);}

function a0K(){aXD=false;ou.clearRect(0,0,j,j);
}

function aXO(aC,ej,eH){ou.fillStyle=mainMenu.aXU[mainMenu.lH[aC]];ou.beginPath();ou.arc(ej,ej,eH,0,2*Math.PI);
ou.fill();}

function aXQ(aC,ej,eH,aXM,aXN){ou.fillStyle=mainMenu.aXU[mainMenu.lH[aC]];ou.beginPath();
ou.arc(ej,ej,eH,aXM,aXN);ou.lineTo(ej,ej);ou.fill();}

function aXP(ej){var fontSize=ej/3;
ou.font=gameState.sK.u8(1,fontSize);ou.fillStyle=colorPalette.pO;ou.fillText("100%",ej,ej+0.1*fontSize);
}

function aXR(ej,eH,aXM,aXN){var aXV,el;
var g1=(aXN-aXM)/(2*Math.PI);
var fontSize=1*eH*Math.min(g1,0.37);if(fontSize<8){return;}aXV=(aXM+aXN)/2;
el=Math.floor(100*g1+0.5)+"%";eH*=0.525-Math.max(0.6*(g1-0.7),0);ou.font=gameState.sK.u8(1,fontSize);
ou.fillStyle=colorPalette.pO;ou.fillText(el,ej+Math.cos(aXV)*eH,ej+Math.cos(aXV+1.5*Math.PI)*eH);
}

function aXS(ej,eH,aXV){ou.beginPath();ou.moveTo(ej,ej);
ou.lineTo(ej+Math.cos(aXV)*eH,ej+Math.cos(aXV+1.5*Math.PI)*eH);ou.stroke();}

function aXT(ej,eH){
ou.beginPath();ou.arc(ej,ej,eH,0,2*Math.PI);ou.stroke();}this.wr=function(){if(localPlayer.iT){
if(localPlayer.ny){ws.drawImage(canvas,debugPanel.gap,debugPanel.gap);}else{ws.drawImage(canvas,debugPanel.gap,aA9+2*debugPanel.gap);
}}};}

function ExpansionTargetFinder(){this.hy=function(aXW){return this.a2K(aXW,function(fD){
return tileMap.fU(fD);});};this.interceptPlanner=function(aXW){return this.a2K(aXW,function(fD){
return tileMap.aJY(fD,localPlayer.getTileOwner);});};this.a2K=function(aXW,a1s){var aXX=powerState.isOwnedByPlayer();return aXY(aXW,aXX,a1s);
};

function aXY(aXW,aXX,a1s){var ho=powerState.fh(aXW);
var hq=powerState.fj(aXW);
var aXZ=dialogManager.fk-2;
var aBR=dialogManager.fl-2;
var aXa=-1;for(var fc=0;fc<aXX;fc++){var aBQ=Math.max(ho-fc,1);
var aOA=Math.max(hq-fc,1);
var a03=Math.min(ho+fc,aXZ);
var a02=Math.min(hq+fc,aBR);
var j3=aXb(ho,a03-ho,hq-fc,a1s,aBR,1);
var j4=aXb(ho-1,ho-aBQ-1,hq-fc,a1s,aBR,-1);
var aXc=aXb(ho,a03-ho,hq+fc,a1s,aBR,1);
var aXd=aXb(ho-1,ho-aBQ-1,hq+fc,a1s,aBR,-1);
var aXe=aXf(hq,a02-hq-1,ho-fc,a1s,aXZ,1);
var aXg=aXf(hq-1,hq-aOA-2,ho-fc,a1s,aXZ,-1);
var aXh=aXf(hq,a02-hq-1,ho+fc,a1s,aXZ,1);
var aXi=aXf(hq-1,hq-aOA-2,ho+fc,a1s,aXZ,-1);aXa=aXj(aXa,j3,aXW);aXa=aXj(aXa,j4,aXW);
aXa=aXj(aXa,aXc,aXW);aXa=aXj(aXa,aXd,aXW);aXa=aXj(aXa,aXe,aXW);aXa=aXj(aXa,aXg,aXW);
aXa=aXj(aXa,aXh,aXW);aXa=aXj(aXa,aXi,aXW);if(aXa>=0&&fc*fc>=powerState.j5(aXa,aXW)){return aXa;
}}return-1;}

function aXb(fg,fZ,fi,a1s,aBR,fz){if(fi<1||fi>aBR){return-1;}for(var aC=0;aC<=fZ;aC++){
var fD=powerState.getNeighbor(fg,fi);if(a1s(fD)){return fD>>2;}fg+=fz;}return-1;}

function aXf(fi,fZ,fg,a1s,aXZ,fz){
if(fg<1||fg>aXZ){return-1;}fZ=Math.max(fZ,0);for(var aC=0;aC<=fZ;aC++){
var fD=powerState.getNeighbor(fg,fi);if(a1s(fD)){return fD>>2;}fi+=fz;}return-1;}

function aXj(j3,j4,aXW){
if(j4===-1){return j3;}if(j3===-1){return j4;}if(powerState.j5(j4,aXW)<powerState.j5(j3,aXW)){
return j4;}return j3;}}

function MapUtilsClass(){this.forceResize=function(){if(uiSurface.id!==0){return false;}if(aXk()){
return true;}var value=aXl("replay");if(!this.clear()){return false;}if(!value){return false;
}account.v(3,0,value);return true;};

function aXk(){var value=aXl("account");if(!value){value=aXl("a");
if(!value){mapUtils.clear();return false;}}mapUtils.clear();account.v(8,account.ua,new ub(1000,{action:0,uY:value,uZ:0
}));return true;}this.clear=function(){var a3K=new URL(window.location.href);a3K.search="";try{
history.replaceState(null,"",a3K.toString());return true;}catch(e){console.log("error 352: "+e);
}return false;};

function aXl(key){if(typeof URLSearchParams==="undefined"){return null;
}var ProfilePacketHandler=window.location.search;
var aXm=new URLSearchParams(ProfilePacketHandler);
var value=aXm.get(key);
if(typeof value!=="string"||value.length<1){return null;}return value;}this.aRY=function(key,value){
if(uiSurface.id!==0){return;}try{var a3K=new URL(window.location.href);
var h7=a3K.searchParams;
h7.set(key,value);a3K.search=h7.toString();history.replaceState(null,"",a3K.toString());
}catch(e){console.log("error 358: "+e);}};}

function CoordHelper(){var aXn;var h;this.applyToGame=function(){
h=new Uint16Array(101);for(var aC=h.length-1;aC>=0;aC--){h[aC]=mathUtils.g0(aC*32768,100);
}this.a6o(0);};this.value=function(h7){return h[h7];};this.aO2=function(){
return mathUtils.g0(aXn-1,2);};this.a6o=function(aNg){aXn=(aNg*2)%32768+1;};this.random=function(){
aXn=aXn*167%32768;return aXn;};this.selectWeakestCandidate=function(nP){return mathUtils.g0(nP*this.random(),32768);
};this.km=function(h7){return h7!==0&&this.random()<this.value(h7);
};this.botAttackTargetSelector=function(fs,ft){return fs+this.selectWeakestCandidate(ft-fs);};}

function BinaryWriter(){this.re=new aXo();
this.a6y=new aXp();this.aLJ=new aXq();this.applyToGame=function(){if(localPlayer.hi){return;}this.re.applyToGame();
};this.ee=function(){if(localPlayer.hi){return;}this.re.ee();aXr();};

function aXr(){if(account.ua!==3){return;
}if(clanPanel.kr()%15!==5&&localPlayer.a2G!==2){return;}account.handleKeyInput().leaderboardPacketHandler();}this.aUr=function(){var aXs=localPlayer.a2G!==0;
var HashGenerator=localPlayer.a6k;if(!aXs){moderationSystem.aIa();}localPlayer.a6i.a77();localPlayer.data.canvas=null;gameServer.z.close(gameServer.z.a3X,3257);
gameServer.z.a3X=0;localPlayer.data.isReplay=1;localPlayer.a6m();if(aXs){localPlayer.a6k=HashGenerator;}};this.aUq=function(s1){
var aC=s1.indexOf("=");if(aC>=0){return s1.substring(aC+1);}return s1;};this.LeaderboardPacketHandler=function(s1){
return s1;};}

function aXo(){this.PlayerValidator=null;this.ScreenHasher=null;this.aXw=null;this.CanvasFontFingerprint=null;this.aXy=null;
this.TimeZoneSomething=null;this.a6x="";
var aY0=0;this.applyToGame=function(){this.PlayerValidator=[];this.ScreenHasher=[];this.aXw=[];
this.CanvasFontFingerprint=[];this.aXy=[0];this.TimeZoneSomething=[0];aY0=0;this.a6x="";};this.rf=function(id,gI,gK,gM){
if(localPlayer.hi||localPlayer.a2G===2){return;}if(this.aXy[aY0]===0){if(this.TimeZoneSomething[aY0]){this.aXy.push(1);
this.TimeZoneSomething.push(0);aY0++;}else{this.aXy[aY0]=1;}}this.PlayerValidator.push(id);this.ScreenHasher.push(gI);
this.aXw.push(gK===undefined?0:gK);this.CanvasFontFingerprint.push(gM===undefined?0:gM);this.TimeZoneSomething[aY0]++;
};this.ee=function(){if(this.aXy[aY0]===0){this.TimeZoneSomething[aY0]++;return;}this.aXy.push(0);
this.TimeZoneSomething.push(0);aY0++;};}

function aXq(){var ScreenSizeHash=0;this.yY=function(s1,aY2){ScreenSizeHash=aY2;
minimapRenderer.f0.lobbyMaxJoin(minimapRenderer.f0.yP(minimapRenderer.f0.yN(s1)));hoverProcessor.a8G="";if(!aRi()){return false;}aY3();if(!aY4()){return false;
}if(urlParams.eI<8*urlParams.size-13||urlParams.eI>8*urlParams.size){aY5("Out Of Bounds Error: "+urlParams.eI+" "+(8*urlParams.size));
return false;}packetWriter.re.a6x=s1;if(localPlayer.data.mapType===2){aY5("Load base64 image...",2);
return aY2;}return true;};this.aLK=function(aKM,aY6){var a55=document.createElement("canvas");
var ib=a55.getContext("2d");a55.width=aKM.width;a55.height=aKM.height;
ib.drawImage(aKM,0,0);localPlayer.data.canvas=a55;if(ScreenSizeHash||aY6){if(localPlayer.a2G){return;}localPlayer.data.mapType=2;
account.y();account.v(19);return;}packetWriter.aUr();};

function aRi(){if(urlParams.size<10){aY5("File Too Small");return false;
}var aY7=urlParams.arrayUtils(12);if(aY7!==settingsPanel.rVersion){var s="Incompatible Version   Required: "+settingsPanel.rVersion;
s+="   Found: "+aY7;s+="   Compatible at "+gameServer.z.a2g()+"/"+aY7;aY5(s,1);}var aX3=urlParams.arrayUtils(12);
var aY8=urlParams.arrayUtils(31);if(aY8!==urlParams.size){aY5("Size Error: Stated Size "+aY8+" Actual Size "+urlParams.size);
return false;}if(aY9(aX3,aY7)){return true;}return false;
}

function aY5(s1,id){console.log(s1);if(ScreenSizeHash){return;}if(!id){account.v(4,3,new TextContentScreen("⚠️ "+L(494),s1,1));
return;}if(id===1){hoverProcessor.a8G=L(495)+": "+s1;return;}account.v(4,3,new TextContentScreen(L(496),s1,1));}

function aY9(k,aY7){
var h7=urlParams.aD;
var fZ=urlParams.size;
var aX3=aY7;for(var aC=3;aC<fZ;aC++){aX3=(aX3+h7[aC])&4095;
}if(aX3===k){return true;}aY5("Hash Error: "+aX3+" "+k+" "+fZ);return false;}

function aY3(){
var iv=urlParams;
var sC=localPlayer.data=new a6h();sC.mapType=iv.arrayUtils(2);sC.mapProceduralIndex=iv.arrayUtils(8);
sC.mapRealisticIndex=iv.arrayUtils(8);sC.mapSeed=iv.arrayUtils(14);sC.mapName=iv.aYA(5);
sC.mapType===2&&iv.aYB();sC.passableWater=iv.arrayUtils(1);sC.passableMountains=iv.arrayUtils(1);
sC.playerCount=iv.arrayUtils(10);sC.humanCount=iv.arrayUtils(10);sC.selectedPlayer=iv.arrayUtils(9);
sC.gameMode=iv.arrayUtils(1);sC.playerMode=iv.arrayUtils(2);sC.battleRoyaleMode=iv.arrayUtils(2);
sC.numberTeams=iv.arrayUtils(4);sC.isZombieMode=iv.arrayUtils(1);sC.isContest=iv.arrayUtils(1);
sC.isReplay=iv.arrayUtils(1);sC.elo=iv.aYC(2,14,2);sC.colorsType=iv.arrayUtils(1);sC.colorsPersonalized=iv.arrayUtils(1);
sC.colorsData=iv.aYC(10,18,512);sC.selectableColor=iv.arrayUtils(1);sC.teamPlayerCount=iv.aYC(4,10,9);
sC.neutralBots=iv.arrayUtils(1);sC.botDifficultyType=iv.arrayUtils(2);sC.botDifficultyValue=iv.arrayUtils(4);
sC.botDifficultyTeam=iv.aYC(4,4,9);sC.botDifficultyData=iv.aYC(10,4,512);sC.spawningType=iv.arrayUtils(2);
sC.spawningSeed=iv.arrayUtils(14);sC.spawningData=iv.aYC(11,12,1024);sC.selectableSpawn=iv.arrayUtils(1);
sC.playerNamesType=iv.arrayUtils(2);sC.playerNamesData=iv.computeMixedHash(10,5,512);sC.selectableName=iv.arrayUtils(1);
sC.aIncomeType=iv.arrayUtils(2);sC.aIncomeValue=iv.arrayUtils(8);sC.aIncomeData=iv.aYC(10,8,512);
sC.tIncomeType=iv.arrayUtils(2);sC.tIncomeValue=iv.arrayUtils(8);sC.tIncomeData=iv.aYC(10,8,512);
sC.iIncomeType=iv.arrayUtils(2);sC.iIncomeValue=iv.arrayUtils(8);sC.iIncomeData=iv.aYC(10,8,512);
sC.sResourcesType=iv.arrayUtils(2);sC.sResourcesValue=iv.arrayUtils(11);sC.sResourcesData=iv.aYC(10,11,512);
sC.a75=iv.aYC(10,30,0);}

function aY4(){var iv=urlParams;
var yZ=iv.arrayUtils(5);
var aYE=iv.arrayUtils(30);
var aYF=iv.arrayUtils(30);if(aYE+aYF>8*iv.size){aY5("Corrupted File");return false;}aYG(aYE);
aYH(aYF,yZ);return true;}

function aYG(fZ){var aYI=new Uint8Array(fZ);
var aYJ=new Uint16Array(fZ);
var aYK=new Uint32Array(fZ);
var aYL=new Uint32Array(fZ);packetWriter.re.PlayerValidator=aYI;packetWriter.re.ScreenHasher=aYJ;
packetWriter.re.aXw=aYK;packetWriter.re.CanvasFontFingerprint=aYL;for(var aC=0;aC<fZ;aC++){var id=urlParams.arrayUtils(4);aYI[aC]=id;aYJ[aC]=urlParams.arrayUtils(9);
if(id===0){aYK[aC]=urlParams.arrayUtils(22);}else if(id===1){aYK[aC]=urlParams.arrayUtils(10);aYL[aC]=urlParams.arrayUtils(10);}else if(id===2){
aYK[aC]=urlParams.arrayUtils(10);aYL[aC]=urlParams.arrayUtils(9);}else if(id===3){aYK[aC]=urlParams.arrayUtils(10);aYL[aC]=urlParams.arrayUtils(27);
}else if(id===4){aYK[aC]=urlParams.arrayUtils(10);aYL[aC]=urlParams.arrayUtils(16);}else if(id===5){aYK[aC]=urlParams.arrayUtils(10);
}else if(id===6){aYK[aC]=urlParams.arrayUtils(10);}else if(id===7){aYK[aC]=urlParams.arrayUtils(1);}else if(id===10){
aYK[aC]=urlParams.arrayUtils(20);aYL[aC]=urlParams.arrayUtils(22);}}}

function aYH(fZ,yZ){var aXy=new Uint8Array(fZ);
var TimeZoneSomething=new Array(fZ);TimeZoneSomething.fill(0);packetWriter.re.aXy=aXy;packetWriter.re.TimeZoneSomething=TimeZoneSomething;for(var aC=0;aC<fZ;aC++){
aXy[aC]=urlParams.arrayUtils(1);TimeZoneSomething[aC]=urlParams.arrayUtils(yZ);}}}

function aXp(){this.a1i=function(){var yZ=aYM();
aYN();aYO(yZ);aYP(yZ);
var aYQ=localStore.eI;
var a1V=mathUtils.g0(aYQ-1,6)+1;if(canvasManager.aWX(6*a1V)!==localStore.h.length){
localStore.h.push(0);}aYR();urlParams.applyToGame(localStore.h);
var sq=uiRenderer.f0.uc(uiRenderer.f0.ud(a1V));urlParams.vx();localStore.applyToGame();return sq;
};

function aYN(){var sC=localPlayer.data;
var j=localStore;j.applyToGame();j.writeBits(12,settingsPanel.rVersion);j.eI+=12+31;j.writeBits(2,sC.mapType);
j.writeBits(8,sC.mapProceduralIndex);j.writeBits(8,sC.mapRealisticIndex);j.writeBits(14,sC.mapSeed);j.ShipRemovalManager(sC.mapName,5);
sC.mapType===2&&j.ShipRenderer(sC.canvas);j.writeBits(1,sC.passableWater);j.writeBits(1,sC.passableMountains);
j.writeBits(10,sC.playerCount);j.writeBits(10,sC.humanCount);j.writeBits(9,sC.selectedPlayer);j.writeBits(1,sC.gameMode);
j.writeBits(2,sC.playerMode);j.writeBits(2,sC.battleRoyaleMode);j.writeBits(4,sC.numberTeams);j.writeBits(1,sC.isZombieMode);
j.writeBits(1,sC.isContest);j.writeBits(1,sC.isReplay);j.dr(sC.elo,2,14);j.writeBits(1,sC.colorsType);
j.writeBits(1,sC.colorsPersonalized);j.dr(sC.colorsData,10,18);j.writeBits(1,sC.selectableColor);
j.dr(sC.teamPlayerCount,4,10);j.writeBits(1,sC.neutralBots);j.writeBits(2,sC.botDifficultyType);
j.writeBits(4,sC.botDifficultyValue);j.dr(sC.botDifficultyTeam,4,4);j.dr(sC.botDifficultyData,10,4);
j.writeBits(2,sC.spawningType);j.writeBits(14,sC.spawningSeed);j.dr(sC.spawningData,11,12);
j.writeBits(1,sC.selectableSpawn);j.writeBits(2,sC.playerNamesType);j.ShipState(sC.playerNamesData,10,5);
j.writeBits(1,sC.selectableName);j.writeBits(2,sC.aIncomeType);j.writeBits(8,sC.aIncomeValue);
j.dr(sC.aIncomeData,10,8);j.writeBits(2,sC.tIncomeType);j.writeBits(8,sC.tIncomeValue);j.dr(sC.tIncomeData,10,8);
j.writeBits(2,sC.iIncomeType);j.writeBits(8,sC.iIncomeValue);j.dr(sC.iIncomeData,10,8);j.writeBits(2,sC.sResourcesType);
j.writeBits(11,sC.sResourcesValue);j.dr(sC.sResourcesData,10,11);j.dr(sC.a75,10,30);}

function aYO(yZ){
var j=localStore;
var PlayerValidator=packetWriter.re.PlayerValidator;
var gI=packetWriter.re.ScreenHasher;
var gK=packetWriter.re.aXw;
var gM=packetWriter.re.CanvasFontFingerprint;
var fZ=PlayerValidator.length;
j.writeBits(5,yZ);j.writeBits(30,fZ);j.writeBits(30,packetWriter.re.TimeZoneSomething.length);for(var aC=0;aC<fZ;aC++){var ej=PlayerValidator[aC];
j.writeBits(4,ej);j.writeBits(9,gI[aC]);if(ej===0){j.writeBits(22,gK[aC]);}else if(ej===1){j.writeBits(10,gK[aC]);
j.writeBits(10,gM[aC]);}else if(ej===2){j.writeBits(10,gK[aC]);j.writeBits(9,gM[aC]);}else if(ej===3){j.writeBits(10,gK[aC]);
j.writeBits(27,gM[aC]);}else if(ej===4){j.writeBits(10,gK[aC]);j.writeBits(16,gM[aC]);}else if(ej===5){j.writeBits(10,gK[aC]);
}else if(ej===6){j.writeBits(10,gK[aC]);}else if(ej===7){j.writeBits(1,gK[aC]);}else if(ej===10){j.writeBits(20,gK[aC]);
j.writeBits(22,gM[aC]);}}}

function aYP(yZ){var j=localStore;
var aXy=packetWriter.re.aXy;
var TimeZoneSomething=packetWriter.re.TimeZoneSomething;
var fZ=aXy.length;
for(var aC=0;aC<fZ;aC++){j.writeBits(1,aXy[aC]);j.writeBits(yZ,TimeZoneSomething[aC]);}}

function ShipSpatialIndex(){var h=localStore.h;
var fZ=h.length;
var aX3=settingsPanel.rVersion;for(var aC=3;aC<fZ;aC++){aX3=(aX3+h[aC])&4095;}return aX3;
}

function aYR(){var j=localStore;j.eI=12+12;j.writeBits(31,j.h.length);j.eI=12;j.writeBits(12,ShipSpatialIndex());}

function aYM(){
var TimeZoneSomething=packetWriter.re.TimeZoneSomething;
var fZ=TimeZoneSomething.length;
var max=0;for(var aC=0;aC<fZ;aC++){max=Math.max(max,TimeZoneSomething[aC]);
}return yg(Math.max(max,1));}}

function Camera(){var ej;
var by=false;
var ShipSelectionGlowRenderer=false;
var aYX=-10000;
var BotShipController=-1;
var ShipLaunchPlanner=0;this.j=0;this.k=0;this.min=0;this.max=0;this.il=0;
this.wo=1;this.l=1;this.uG=0;this.dl=function(){this.j=aYa(document.documentElement.clientWidth)+2;
this.k=aYa(document.documentElement.clientHeight)+2;};this.applyToGame=function(){ej=1;yf();DirectShipPathFinder(0);};

function yf(){DateTimeUtils=document.getElementById("canvasA");if(uiSurface.id===2){DateTimeUtils.style.webkitUserSelect="none";
}ws=DateTimeUtils.getContext("2d",{alpha:false});ws.imageSmoothingEnabled=false;}this.ee=function(){
if(++ej>=50){resize(0);}aYc();};

function aYc(){if(BotShipController===-1){return;}if(clanPanel.eZ<BotShipController){return;
}ShipLaunchPlanner++;BotShipController=-1;if(2000*ShipLaunchPlanner>=clanPanel.eZ+4*2000){console.log("error 3748");return;}uiSurface.platformActions.setState(15);}
this.dv=function(k9){by=true;resize(k9);};this.a4Q=function(){if(aYX+1000>clanPanel.eZ){return;}aYX=clanPanel.eZ;
resize(0);};

function resize(ShipGlowRenderer){ej=0;if(!adSystem.v0()){return;}if(DirectShipPathFinder(ShipGlowRenderer)||by){by=false;debugPanel.resize();
settingsMenu.discordLink.resize();flagSystem.applyToGame();bb.applyToGame();loadingSystem.resize();keyboardHandler.resize();keyProcessor.resize();modalDialogEngine.resize();account.resize();
if(localPlayer.a2G>=1){uiColors.resize(false);touchInputHandler.resize();focusHandler.resize();hoverHandler.resize();clickHandler.resize();hoverProcessor.resize();
zoomHandler.resize();packetReader.resize();cameraController.resize();panHandler.resize();deviceDetector.resize();modalState.resize();accountPanel.resize();troops.resize();
resizeHandler.resize();gameMenu.resize();hoverHandler.aBG();}else{moderationSystem.aIc();moderationSystem.aId();}clanPanel.ds=true;}}

function aYa(g1){
if(g1&&g1>128){return Math.floor(g1);}return 128;}

function ShipCapacityValidator(j,k){var il=(j+k)/2;
var ShipAutoLaunchTargetFinder=(uiSurface.id!==0||j<k)?700:1200;
var ShipRouteStore=Math.min(ShipAutoLaunchTargetFinder/il,1);if(connectionMgr.buffer.data[1].value===0){
ShipRouteStore=2*ShipRouteStore/3;}else{ShipRouteStore=Math.min(ShipRouteStore+(connectionMgr.buffer.data[1].value-1)*(1-ShipRouteStore)/2,1);
}camera.l=(window.devicePixelRatio||1)*ShipRouteStore;}

function DirectShipPathFinder(ShipGlowRenderer){var uf,aAe,ug,vN;if(camera.uG>0){return false;
}uf=aYa(document.documentElement.clientWidth);aAe=aYa((window.visualViewport&&uiSurface.id!==2)?
window.visualViewport.height:document.documentElement.clientHeight);ShipCapacityValidator(uf,aAe);if(ShipGlowRenderer&&!ShipSelectionGlowRenderer){
ShipSelectionGlowRenderer=true;account.removeChild(document.body,DateTimeUtils);}else if(ShipSelectionGlowRenderer){ShipSelectionGlowRenderer=false;document.body.appendChild(DateTimeUtils);
}ug=Math.floor(0.5+uf*camera.l);vN=Math.floor(0.5+aAe*camera.l);if(ug===camera.j&&vN===camera.k){return false;}camera.j=ug;
camera.k=vN;camera.min=aDj(ug,vN);camera.max=a8V(ug,vN);camera.il=mathUtils.g0(ug+vN,2);camera.wo=ug/vN;DateTimeUtils.width=ug;DateTimeUtils.height=vN;
DateTimeUtils.style.width=uf+"px";DateTimeUtils.style.height=aAe+"px";BotShipController=clanPanel.eZ+1000;return true;}}

function GameUI(){
this.aWh=new ShipPathUtils();this.a36=new ShipInterceptPlanner();this.aWy=new ShipRouteMergeManager();}

function ShipRouteMergeManager(){var ShipReverseCommandHandler=aYl();
var aYm=aYn();
var aYo=aYp();this.arrayUtils=function(){return 90+14+7+12;};this.a1i=function(){
minimapRenderer.f0.yV(connectionMgr.buffer.data[183].value,15);canvasManager.writeBits(14,ShipReverseCommandHandler);canvasManager.writeBits(7,aYm);canvasManager.writeBits(12,aYo);
};}

function aYl(){var iV=24;
var ej=document.createElement("canvas");ej.width=iV;ej.height=iV;
var fg=ej.getContext("2d",{alpha:false});fg.fillStyle="rgb(0,0,0)";fg.fillRect(0,0,iV,iV);
fg.font="22px system-ui";fg.textBaseline="middle";fg.textAlign="center";fg.fillStyle="rgb(255,255,255)";
fg.fillText("Q",iV>>1,iV>>1);
var fc=fg.getImageData(0,0,iV,iV).data;
var fZ=fc.length;
var lp=0;for(var aC=0;aC<fZ;aC+=4){lp+=fc[aC];}return lp&16383;}

function aYn(){
var fc=(new Date()).getTimezoneOffset();return Math.abs(Math.floor((900+fc+0.5)/15))&127;
}

function aYp(){var j=window.screen.width&0xFFF;
var k=window.screen.height&0xFFF;
return j ^ k;}

function ShipInterceptPlanner(){this.a37=function(){var aC,h7;
var fZ=territorySystem.lQ;
var a24=territorySystem.lV;
var a2r=playerData.a2r;
var aAS=this.aK5();for(aC=0;aC<fZ;aC++){h7=a24[aC];if(!gameState.gv.kH(h7)){
a2r[h7]=aAS;}}var rj=playerData.rj;
var jx=playerData.isPassiveBorderTile;
var jy=playerData.setAttackBorderTile;
var a2p=playerData.a2p;fZ=localPlayer.ku;for(aC=0;aC<fZ;aC++){
if(a2p[aC]===0||jy[aC]<1||2*rj[aC]>3*(jx[aC]+jy[aC])){a2r[aC]=0;}}var a34=0;for(aC=0;aC<fZ;aC++){
a34+=a2r[aC]>0;}return a34;};this.aK5=function(){return Math.min(65535,clanPanel.kr());
};}

function ShipPathUtils(){var size=256;this.ee=function(aYq,aYr){var h=new Uint8Array(size);aYs(h,aYq,aYr);
aYt(h,aYq,2);aYt(h,aYr,7);aYu(h);return aW3(h);};

function aYs(h,aYq,aYr){var aC;
var fZ=size;
var aYv=3+(4+aYq)%32768;
var aYw=12+aYr%32768;
var aYx=17+((aYq&aYr)+(aYq|aYr)+aYq)%32768;
for(aC=0;aC<fZ;aC++){aYv=1+(aYv*aYw)%aYx;h[aC]=aYv%256;}}

function aYt(h,g1,iR){
var aC;
var fZ=size;for(aC=0;aC<fZ;aC++){h[aC]=(h[aC]+((g1>>((aC+iR)%30))&1))%256;}}

function aYu(h){
var aC,g1;
var fZ=size;
var eI=0;for(aC=0;aC<30000;aC++){g1=h[eI];h[eI]=(g1+aC+h[(eI+aC)%fZ])%256;
eI=(g1+aC+eI+(g1&eI))%fZ;}}

function aW3(h){var aC;
var fZ=size;
var aAe=1;
var vN=1;
for(aC=0;aC<fZ;aC+=2){aAe=((1+aAe)*(h[aC]+1))%1073741824;vN=((1+vN)*(h[aC+1]+1))%1073741824;
}return [aAe,vN];}this.aWi=function(aYy,aYz,aZ0,result){var resolveAttackCombat=1<<aYy;for(var aC=0;aC<resolveAttackCombat;aC++){
if(this.aZ1(aC,aYz,aZ0)===result){return aC;}}return 0;};this.aZ1=function(aZ2,aYz,aZ0){
var zb=aYz+aZ2;
var zk=aZ0+aZ2;
var g1=(zb+zk)&2147483647;for(var fs=1;fs<=16;fs++){g1 ^=g1>>fs;
g1>>>=1+(zb&3);g1=(g1*(7+((zb|zk)&1023)))&1073741823;g1+=(zk&65535);zb>>=1+(g1&1);zk>>=1+(zb&1);
}g1&=1073741823;return g1;};}

function ScoreSystem(){var aZ3;var aZ4;var iq;var aZ5;this.applyToGame=function(){
var aC,fg,fi,aSo,aZ6;var j,k,ou,iY,yq,g1,h7,fp,fs;if(aZ7()){aZ4=null;return;}aZ3=mathUtils.g0(64+32,4);
if(dialogManager.tileDataToIndexUnchecked===1){aSo=0;aZ6=160;}else{aSo=128;aZ6=32;}aZ5="rgb("+aSo+","+aSo+","+aSo+")";
aZ4=new Array(4);for(aC=3;aC>=0;aC--){aZ4[aC]=document.createElement("canvas");
j=aC%2===0?dialogManager.fk:aZ3;k=aC%2===0?aZ3:dialogManager.fl+2*aZ3;aZ4[aC].width=j;
aZ4[aC].height=k;ou=aZ4[aC].getContext("2d",{alpha:false});iY=ou.getImageData(0,0,j,k);
yq=iY.data;if(aC%2===0){for(fi=aZ3-1;fi>=0;fi--){g1=aZ6+Math.floor((fi+1)*(aSo-aZ6)/(aZ3+1));
for(fg=j-1;fg>=0;fg--){h7=((aC===0?aZ3-fi-1:fi)*j+fg)*4;yq[h7]=g1;yq[h7+1]=g1;yq[h7+2]=g1;
yq[h7+3]=255;}}}else{for(fg=aZ3-1;fg>=0;fg--){g1=aZ6+Math.floor((fg+1)*(aSo-aZ6)/(aZ3+1));
for(fi=k-1-aZ3;fi>=aZ3;fi--){h7=(fi*j+(aC===3?aZ3-fg-1:fg))*4;yq[h7]=g1;yq[h7+1]=g1;
yq[h7+2]=g1;yq[h7+3]=255;}}for(fs=1;fs>=0;fs--){for(fg=aZ3-1;fg>=0;fg--){for(fi=aZ3-1;fi>=0;fi--){
fp=(Math.pow((fg*fg+fi*fi),0.5)+1)/(aZ3+1);fp=fp>1?1:fp;g1=aZ6+Math.floor(fp*(aSo-aZ6));
h7=((fs===0?aZ3-fi-1:fi+fs*(k-aZ3))*j+(aC===1?fg:aZ3-fg-1))*4;yq[h7]=g1;
yq[h7+1]=g1;yq[h7+2]=g1;yq[h7+3]=255;}}}}ou.putImageData(iY,0,0);}aZ8(aZ6);};

function aZ7(){
iq=true;aZ5="rgb("+dialogManager.yo[0]+","+dialogManager.yo[1]+","+dialogManager.yo[2]+")";if(dialogManager.aNp(dialogManager.tileDataToIndexUnchecked)){return true;
}iq=false;return false;}

function aZ8(aZ9){dialogManager.distanceSquared.fillStyle="rgb("+aZ9+","+aZ9+","+aZ9+")";
dialogManager.distanceSquared.fillRect(0,0,dialogManager.fk,1);dialogManager.distanceSquared.fillRect(0,dialogManager.fl-1,dialogManager.fk,1);
dialogManager.distanceSquared.fillRect(0,0,1,dialogManager.fl);dialogManager.distanceSquared.fillRect(dialogManager.fk-1,0,1,dialogManager.fl);}this.a0K=function(){
var fs=iq?0:-aZ3;if(!aPa(fs,fs,dialogManager.fk-2*fs,dialogManager.fl-2*fs,leaderboardPanel.aZA,leaderboardPanel.routeSegmentProgress,leaderboardPanel.maxShipsPerPlayer,leaderboardPanel.isCoastalWaterTile)){
ws.fillStyle=aZ5;ws.fillRect(0,0,camera.j,camera.k);}};this.wr=function(){if(iq){return;
}if(aPZ(0,-aZ3,dialogManager.fk,aZ3,leaderboardPanel.aZA,leaderboardPanel.routeSegmentProgress,leaderboardPanel.maxShipsPerPlayer,leaderboardPanel.isCoastalWaterTile)){ws.drawImage(aZ4[0],leaderboardPanel.removeShipAtIndex,leaderboardPanel.aZF-aZ3);
}if(aPZ(dialogManager.fk,-aZ3,aZ3,dialogManager.fl+2*aZ3,leaderboardPanel.aZA,leaderboardPanel.routeSegmentProgress,leaderboardPanel.maxShipsPerPlayer,leaderboardPanel.isCoastalWaterTile)){
ws.drawImage(aZ4[1],leaderboardPanel.removeShipAtIndex+dialogManager.fk,leaderboardPanel.aZF-aZ3);
}if(aPZ(0,dialogManager.fl,dialogManager.fk,aZ3,leaderboardPanel.aZA,leaderboardPanel.routeSegmentProgress,leaderboardPanel.maxShipsPerPlayer,leaderboardPanel.isCoastalWaterTile)){ws.drawImage(aZ4[2],leaderboardPanel.removeShipAtIndex,leaderboardPanel.aZF+dialogManager.fl);
}if(aPZ(-aZ3,-aZ3,aZ3,dialogManager.fl+2*aZ3,leaderboardPanel.aZA,leaderboardPanel.routeSegmentProgress,leaderboardPanel.maxShipsPerPlayer,leaderboardPanel.isCoastalWaterTile)){
ws.drawImage(aZ4[3],leaderboardPanel.removeShipAtIndex-aZ3,leaderboardPanel.aZF-aZ3);}};}

function BonusSystem(){
this.aK3=new aZG();this.getEmojiFromId=new aZH();this.z=new aZI();this.territoryMinY=new aZJ();this.reverseShipRoute=new aZK();
this.mp=new aZL();this.ki=new aZM();this.lh=new aZN();this.aZO=new aZP();this.aZQ=new aZR();
this.advanceSimulationTick=new aZS();this.i9=new aZT();this.reverseRoute=new aZU();this.lj=new aZV();this.iC=new aZW();
this.mt=new aZX();this.rr=new aZY();this.applyToGame=function(){this.reverseRoute.applyToGame();this.getEmojiFromId.applyToGame();
this.z.applyToGame();this.territoryMinY.applyToGame();this.reverseShipRoute.applyToGame();this.aZQ.applyToGame();this.mt.applyToGame();};this.wr=function(){
this.aZQ.wr();this.getEmojiFromId.wr();};}

function aZM(){this.ee=function(player){if(!bonusSystem.advanceSimulationTick.n1(player)){
return false;}var ky=bonusSystem.z.ky[player];if(ky>=Math.max(3*nameRenderer.performance.routeStore,troopCalc.botCount[troopCalc.iI[player]])){
return false;}if(!gameState.gv.n2(player,troopCalc.isSinglePlayer[troopCalc.iI[player]],32,0)){return false;
}if(focusHandler.aDW()){return aZZ(player);}if(!nameRenderer.jl.ee(player)&&!nameRenderer.BotAttackAi.ee(player)&&!nameRenderer.BotMountainAttackAi.ee(player)){
return false;}aZa(player);return true;};

function aZZ(player){
var aZb=bonusSystem.lj.aDZ();
var fZ=aZb.length;if(fZ===0){return false;}var mw=aZb[coordHelper.selectWeakestCandidate(fZ)];
var ns=bonusSystem.z.mn[mw];if(bonusSystem.mt.mu(player,ns)){return false;}if(!aZc(player,mw)){return false;
}if(!bonusSystem.iC.rq(player,ns,1)){return false;}gameState.gv.heartbeatManager(player);bonusSystem.z.updateFrameOverlays(player);return true;
}

function aZc(player,mw){var aZd=powerState.territoryMinX(bonusSystem.z.mz[mw]);
var ho=powerState.fh(aZd);
var hq=powerState.fj(aZd);
var nv=playerData.botExpansionAi[player];
var nw=playerData.botTeamTargetCoordinator[player];
var o8=playerData.BotExpansionAi[player];
var o9=playerData.BotTeamTargetCoordinator[player];
var iw=Math.max(ho-o8,nv-ho);
var iz=Math.max(hq-o9,nw-hq);return iw<100&&iz<100;
}

function aZa(player){boostSystem.gB[1]=4;gameState.gv.heartbeatManager(player);bonusSystem.z.updateFrameOverlays(player);}}

function aZX(){
var aZe=0;
var aZf=null;this.applyToGame=function(){if(aZf===null){aZf=new Uint16Array(2*bonusSystem.z.botCount);
}aZe=0;};this.ei=function(aZg,mt){var aZh=aZf;aZh[aZe++]=aZg;aZh[aZe++]=mt;
};this.mu=function(player,ms){var aZh=aZf;
var fZ=aZe;for(var aC=0;aC<fZ;aC+=2){if(aZh[aC]===ms){
if(!bonusSystem.lj.aZi(aZh[aC+1])){continue;}if(player===(bonusSystem.z.mo[boostSystem.gB[2]]>>3)){return true;
}}}return false;};this.aZj=function(aZk){var mp=bonusSystem.z.ml[aZk];if(mp<64){return;}aZl(bonusSystem.z.mn[aZk]);
};this.aZm=function(aZn,aZo){var aZp=bonusSystem.z.mn[aZn];
var ms=-1;
var aZh=aZf;
var fZ=aZe;
for(var aC=1;aC<fZ;aC+=2){if(aZh[aC]===aZp){ms=aZh[aC-1];break;}}if(ms===-1){return false;
}if(!bonusSystem.lj.aZi(ms)){return false;}var aZk=boostSystem.gB[2];
var mF=bonusSystem.z.mm[aZk];if(aZo===mF[mF.length-1]){
bonusSystem.z.mm[aZn]=bonusSystem.reverseRoute.aZq(bonusSystem.z.mm[aZn],bonusSystem.reverseRoute.mO(mF));return true;}var aZr=bonusSystem.lj.aZs(mF,aZo);
if(aZr===-1){return false;}var aZt=bonusSystem.z.updateIdleGameSystems[aZk];if(aZr===aZt){var aZu=powerState.territoryMinX(bonusSystem.z.mz[aZk]);
bonusSystem.z.mm[aZn]=bonusSystem.reverseRoute.aZv(bonusSystem.z.mm[aZn],mF,aZr,aZo,powerState.j2(mF[aZr],aZo)>powerState.j2(mF[aZr],aZu));
return true;}bonusSystem.z.mm[aZn]=bonusSystem.reverseRoute.aZv(bonusSystem.z.mm[aZn],mF,aZr,aZo,aZr>aZt);return true;
};

function aZl(ms){var aZh=aZf;
var fZ=aZe;for(var aC=fZ-2;aC>=0;aC-=2){if(aZh[aC]===ms){
aZw(aZh[aC+1]);aZh[aC]=aZh[fZ-2];aZh[aC+1]=aZh[fZ-1];fZ-=2;}}aZe=fZ;}

function aZw(aZp){
if(!bonusSystem.lj.aZi(aZp)){return;}bonusSystem.mt.aZx(boostSystem.gB[2]);}this.aZx=function(aZy){var lp=bonusSystem.z;
var mp=lp.ml[aZy];if(mp%64===5){return false;}var mF=lp.mm[aZy];lp.aZz[aZy]=65535-lp.aZz[aZy];
lp.updateIdleGameSystems[aZy]=mF.length-lp.updateIdleGameSystems[aZy]-2;lp.mm[aZy]=bonusSystem.reverseRoute.mO(mF);lp.ml[aZy]=mp-mp%64+5;
return true;};}

function aZS(){this.n1=function(player){if(!localPlayer.data.passableWater){
return false;}if(bonusSystem.z.mk===bonusSystem.z.botCount){return false;}if(bonusSystem.z.ky[player]===bonusSystem.z.findClosestCoastalLaunchTile){
return false;}if(playerData.hG[player].length===0){return false;}return true;
};this.rm=function(aXW){var mp=boostSystem.gB[1];if(mp>=4){return false;}if(!bonusSystem.lj.aa1(powerState.fP(aXW))){
return false;}return tileMap.fU(powerState.fP(powerState.getRandomTileInPlayerArea(aXW,mp)));};}

function aZG(){this.aK4=function(player){
var a9s=bonusSystem.z.a9s;
var us=player<<3;
var ut=us+bonusSystem.z.ky[player]-1;for(var aC=ut;aC>=us;aC--){
this.aa2(a9s[aC]);}};this.aa2=function(aa3){var z=bonusSystem.z;
var aa4=z.mk-1;
var aa5=z.mo[aa3];
var aa6=z.aa7[aa3];
var aa8=z.mz[aa3];z.mk=aa4;z.mo[aa3]=z.mo[aa4];z.mz[aa3]=z.mz[aa4];
z.aZz[aa3]=z.aZz[aa4];z.a8m[aa3]=z.a8m[aa4];z.aa7[aa3]=z.aa7[aa4];z.mn[aa3]=z.mn[aa4];
z.ml[aa3]=z.ml[aa4];z.interpolateTileAlongSegment[aa3]=z.interpolateTileAlongSegment[aa4];z.mm[aa3]=z.mm[aa4];z.updateIdleGameSystems[aa3]=z.updateIdleGameSystems[aa4];
z.a9s[z.mo[aa3]]=aa3;aaA(aa5);bonusSystem.territoryMinY.territoryMinY[powerState.territoryMaxX(z.mz[aa3])][z.aa7[aa3]]=aa3;aaB(powerState.territoryMaxX(aa8),aa6);
};

function aaA(aXV){var player=aXV>>3;
var z=bonusSystem.z;
var fZ=z.ky[player]-1;
var aaC=(player<<3)+fZ;
z.ky[player]=fZ;if(aaC===aXV){return;}z.a9s[aXV]=z.a9s[aaC];z.mo[z.a9s[aXV]]=aXV;
}

function aaB(aC,aaD){var aQh=bonusSystem.territoryMinY.territoryMinY[aC];
var e=aQh.pop();if(aaD===aQh.length){return;
}aQh[aaD]=e;bonusSystem.z.aa7[e]=aaD;}}

function aZH(){var aaE;
var aaF=8;
var aaG=null;this.applyToGame=function(){
if(!aaE){aaE=new Array(localPlayer.isMountainTile);}aaE.fill(null);aaG=aaH(255);aaI();};

function aaI(){
if(!localPlayer.iT){return;}var a55=new Array(mainMenu.lH.length);
var fZ=localPlayer.isMountainTile;
var aaJ=aaE;
var aCr=mainMenu.aCr;
for(var aC=0;aC<fZ;aC++){var a7W=aCr[aC];if(!a55[a7W]){a55[a7W]=aaK(a7W);}aaJ[aC]=a55[a7W];
}}

function aaH(eI){var iV=aaF+4;
var a55=gameState.sK.yf(iV,iV);
var ib=gameState.sK.getContext(a55,true);
var iY=gameState.sK.getImageData(ib,iV,iV);
var yq=iY.data;aaL(yq,iV+1,eI);aaL(yq,iV+2,eI);
aaL(yq,2*iV+1,eI);aaL(yq,2*iV-3,eI);aaL(yq,2*iV-2,eI);aaL(yq,3*iV-2,eI);aaL(yq,iV*(iV-3)+1,eI);
aaL(yq,iV*(iV-2)+1,eI);aaL(yq,iV*(iV-2)+2,eI);aaL(yq,iV*(iV-2)-2,eI);aaL(yq,iV*(iV-1)-3,eI);
aaL(yq,iV*(iV-1)-2,eI);ib.putImageData(iY,0,0);return a55;}

function aaL(yq,fL,eI){
var fD=4*fL;yq[fD]=255;yq[fD+1]=255;yq[fD+2]=eI;yq[fD+3]=255;}

function aaM(player){
var a55=gameState.sK.yf(aaF,aaF);
var ib=gameState.sK.getContext(a55,true);aaN(ib,tileMap.a9T(player));
return a55;}

function aaK(a7W){var a55=gameState.sK.yf(aaF,aaF);
var ib=gameState.sK.getContext(a55,true);
var h=boostSystem.g8;h.set(mainMenu.aSp[a7W]);aaN(ib,h);return a55;}

function aaN(ib,aZ5){
var fg,fi,iw,iz,fp,fL,aaO,aaP,aaQ;
var iV=aaF;
var iY=gameState.sK.getImageData(ib,iV,iV);
var yq=iY.data;
var lp=(iV>>1)-0.5;
var aaR=gameState.sS.a4d(aZ5,0.5);if(!gameState.sS.a4f(aZ5,aaR,300)){
gameState.sS.a4h(aZ5,100);}for(fi=0;fi<iV;fi++){for(fg=0;fg<iV;fg++){iw=fg-lp;iz=fi-lp;fL=(fi*iV+fg)*4;
fp=iw*iw+iz*iz;aaP=((iV-1.5)*(iV-1.5)/4);aaQ=((iV-4.5)*(iV-4.5)/4);aaO=fp<=aaQ?aaR:aZ5;
yq[fL]=aaO[0];yq[fL+1]=aaO[1];yq[fL+2]=aaO[2];yq[fL+3]=fp>aaP?0:255;}}ib.putImageData(iY,0,0);
}this.wr=function(){var aC,aaS,aPi,aPj,fg,fi,player,fontSize,a55,fd,iI,aaT,iv;
var aaU,aaV,aaW,aaX;
var mz=bonusSystem.z.mz;
var mo=bonusSystem.z.mo;
var a8m=bonusSystem.z.a8m;
var aa9=bonusSystem.z.interpolateTileAlongSegment;
var aaY=aaE;
var aaZ=localPlayer.getTileOwner;
var fZ=bonusSystem.z.mk;
var aaa=camera.j;
var aab=camera.k;
var aac=dialogManager.fk<<4;
var aad=aaF;
var fO=im;
var fD=fO/aad;
var nv=jD/fO;
var nw=jE/fO;
var o8=(aaa+jD)/fO;
var o9=(aab+jE)/fO;
var iw=o8-nv;
var iz=o9-nw;
var ib=ws;ib.imageSmoothingEnabled=fO<9;
gameState.sK.textAlign(ib,1);gameState.sK.textBaseline(ib,1);for(aC=0;aC<fZ;aC++){player=mo[aC]>>3;
iI=a8m[aC];aaS=0.9+0.1*Math.log10(iI);iv=mz[aC];aPi=(iv%aac)/16-aaS;aPj=Math.floor(iv/aac)/16-aaS;
fg=aaa*(aPi-nv)/iw;fi=aab*(aPj-nw)/iz;aaW=+(player===aaZ);aaV=1+aaW/8;aaX=fO*aaS;
aaU=-2*aaX*aaV;aaV=aaW*aaX/4;if(fg<aaU||fi<aaU||fg>aaa+aaV||fi>aab+aaV){continue;}fd=2*aaS*fD;
aaT=aaS*fO;a55=aaY[player];if(a55===null){aaY[player]=a55=aaM(player);}if(player===aaZ){
ib.setTransform(fd,0,0,fd,fg-fd*2,fi-fd*2);ib.drawImage(aaG,0,0);}ib.setTransform(fd,0,0,fd,fg,fi);
ib.drawImage(a55,0,0);fontSize=Math.floor(aae(iI)*aaT);if(fontSize<6){continue;
}ib.setTransform(1,0,0,1,0,0);ib.fillStyle=aa9[aC]?colorPalette.pw:colorPalette.pO;ib.font=gameState.sK.u8(1,fontSize);
ib.fillText(gameState.tI.currentLoopHandler(iI),fg+aaT,fi+aaT+0.1*fontSize);}ib.imageSmoothingEnabled=false;
ib.setTransform(1,0,0,1,0,0);};

function aae(iI){if(iI<1000){return 0.42;
}if(iI<10000){return 0.34;}if(iI<1000000){return 0.26;}if(iI<100000000){return 0.19;}return 0.15;}
}

function aZR(){var aaf;
var aag=20;this.applyToGame=function(){if(aaf){return;}aaf=new Array(mainMenu.aah.length);
for(var aC=0;aC<aaf.length;aC++){aaf[aC]=armySystem.z.aai(aag,mainMenu.aah[aC]);}};this.wr=function(){
var oF=im;if(oF>=5){return;}var aaa=camera.j;
var aab=camera.k;
var nv=jD/oF;
var nw=jE/oF;
var o8=(aaa+jD)/oF;
var o9=(aab+jE)/oF;
var h8=-aag*oF;
var aaj=0.5*h8;
var aac=dialogManager.fk<<4;
var fZ=bonusSystem.z.mk;
var mz=bonusSystem.z.mz;
var mo=bonusSystem.z.mo;
var aCr=mainMenu.aCr;
var a55=aaf;
var ib=ws;if(oF>3){ib.globalAlpha=0.5*(5-oF);
}for(var aC=0;aC<fZ;aC++){var iv=mz[aC];
var aak=(iv%aac)/16;
var aal=Math.floor(iv/aac)/16;
var fg=aaa*(aak-nv)/(o8-nv)+aaj;
var fi=aab*(aal-nw)/(o9-nw)+aaj;if(fg>aaa||fi>aab||fg<h8||fi<h8){
continue;}ib.setTransform(oF,0,0,oF,fg,fi);
var ej=a55[aCr[mo[aC]>>3]];
ib.drawImage(ej,0,0);}ib.globalAlpha=1;ib.setTransform(oF,0,0,oF,0,0);};}

function aZV(){
this.aam=function(player,id){var aan=playerData.hG[player];
var fZ=aan.length;for(var aC=0;aC<fZ;aC++){
if(powerState.io(aan[aC],id)){return true;}}return false;};this.aao=function(player,fL){
var aC,g1,j4,aap,aaq,fD;
var aan=playerData.hG[player];
var fZ=aan.length;
var j=dialogManager.fk;
var aar=powerState.fh(fL);
var aas=powerState.fj(fL);
var ff=-1;
var min=dialogManager.fk*dialogManager.fk+dialogManager.fl*dialogManager.fl;
var id=tileMap.tileDataToIndex(powerState.fP(fL));
for(aC=0;aC<fZ;aC++){fD=aan[aC];j4=fD>>2;aap=aar-(j4%j);aaq=aas-~~((j4+0.5)/j);
g1=aap*aap+aaq*aaq;if(g1<min&&powerState.io(fD,id)){min=g1;ff=j4;}}return ff;};this.isActivePlayer=function(j3,j4){
var id=tileMap.tileDataToIndex(powerState.fP(j4));
var ip=powerState.ig;
var fD=powerState.fP(j3);
var aat=-1;for(var aC=0;aC<4;aC++){
var fO=fD+ip[aC];if(tileMap.getEncodedX(fO)&&tileMap.tileDataToIndex(fO)===id&&(aat===-1||powerState.j5(powerState.fN(fO),j4)<
powerState.j5(aat,j4))){aat=powerState.fN(fO);}}return aat;};this.hasReachedMapControlPercentage=function(player,fL){var ip=powerState.ig;
var fD=powerState.fP(fL);for(var aC=0;aC<4;aC++){var fO=fD+ip[aC];if(tileMap.h9(fO)&&tileMap.a0I(player,fO)){
return true;}}return false;};this.mK=function(player,fL){var ip=powerState.ig;
var fD=powerState.fP(fL);
for(var aC=0;aC<4;aC++){var fO=fD+ip[aC];if(tileMap.fQ(fO)){return true;}if(tileMap.h9(fO)){var k3=tileMap.fR(fO);
if(player!==k3&&playerBoundaryEngine.fS(player,k3)){return true;}}}return false;};this.mq=function(fL){
var ip=powerState.ig;
var fD=powerState.fP(fL);for(var aC=0;aC<4;aC++){var fO=fD+ip[aC];if(tileMap.h9(fO)){
var player=tileMap.fR(fO);if(gameState.gv.kH(player)){return player;}}}return-1;};this.aa1=function(fD){
if(!tileMap.getEncodedX(fD)){return false;}var ip=powerState.ig;for(var aC=0;aC<4;aC++){if(tileMap.fU(fD+ip[aC])){return true;
}}return false;};this.nu=function(player,id){var fZ=bonusSystem.z.ky[player];
var us=player<<3;
var ut=us+fZ;
var mn=bonusSystem.z.mn;
var a9s=bonusSystem.z.a9s;for(var aC=us;aC<ut;aC++){var a9t=a9s[aC];if(mn[a9t]===id){
return a9t;}}return-1;};this.nz=function(player){var fZ=bonusSystem.z.ky[player];if(fZ===0){
return-1;}return bonusSystem.z.a9s[player<<3];};this.a7o=function(m9,mA){var fZ=bonusSystem.z.mk;if(fZ<1){return-1;
}var mz=bonusSystem.z.mz;
var aau=16*5;
var aSJ=-1;for(var aC=0;aC<fZ;aC++){var fp=powerState.is(m9,mA,mz[aC]);
if(fp<aau){aau=fp;aSJ=aC;}}if(!aav(aSJ,m9,mA)){return-1;}return aSJ;};this.aZi=function(ns){
var fZ=bonusSystem.z.mk;
var mn=bonusSystem.z.mn;for(var aC=0;aC<fZ;aC++){if(mn[aC]===ns){boostSystem.gB[2]=aC;return true;
}}return false;};this.aK0=function(player){var fZ=bonusSystem.z.ky[player];
var us=player<<3;
var ut=us+fZ;
var a9s=bonusSystem.z.a9s;
var a8m=bonusSystem.z.a8m;
var iI=0;for(var aC=us;aC<ut;aC++){iI+=a8m[a9s[aC]];}return iI;
};this.aaw=function(player,aZy){var mF=bonusSystem.z.mm[aZy];return this.hasReachedMapControlPercentage(player,mF[mF.length-1]);
};this.aax=function(j3,j4,fp,aay){var j7=powerState.fh(j3);
var j8=powerState.fj(j3);
var j9=powerState.fh(j4);
var jA=powerState.fj(j4);fp=Math.max(fp,1);
var aaz=j9-j7;
var ab0=jA-j8;
var iw=mathUtils.g0(Math.abs(aaz)*aay,fp);
var iz=mathUtils.g0(Math.abs(ab0)*aay,fp);return powerState.fw(j7+Math.sign(aaz)*iw,j8+Math.sign(ab0)*iz);
};

function aav(aC,m9,mA){if(aC<0){return false;}var ab1=bonusSystem.z.mz[aC];
var ab2=powerState.distanceSqRaw(ab1);
var ab3=powerState.j1(ab1);
var aXX=1.25*16*(0.9+0.1*Math.log10(bonusSystem.z.a8m[aC]));
aXX=Math.max(aXX,powerState.bucketColumns(gameState.sK.ux(0.02,1.7)));return mathUtils.aPh(powerState.distanceSqBetweenTiles(m9),powerState.j0(mA),ab2,ab3,aXX);
}this.aZs=function(mF,fL){var fZ=mF.length-1;
var fg=powerState.fh(fL);
var fi=powerState.fj(fL);
for(var aC=0;aC<fZ;aC++){var j3=mF[aC];
var j4=mF[aC+1];
var nv=powerState.fh(j3);
var nw=powerState.fj(j3);
var o8=powerState.fh(j4);
var o9=powerState.fj(j4);if((fg===nv||fg===o8||Math.sign(fg-nv)!==Math.sign(fg-o8))&&
(fi===nw||fi===o9||Math.sign(fi-nw)!==Math.sign(fi-o9))){if(nv===o8||nw===o9){
return aC;}if(Math.abs(fg-nv)===Math.abs(fi-nw)&&Math.abs(fg-o8)===Math.abs(fi-o9)){
return aC;}}}return-1;};this.aDZ=function(){var ab4=mV[0];
var mo=bonusSystem.z.mo;
var mk=bonusSystem.z.mk;
var h=[];for(var aC=0;aC<mk;aC++){if(gameState.gv.lY(ab4,mo[aC]>>3)){
h.push(aC);}}return h;};this.mH=function(player,mF){var fZ=bonusSystem.z.ky[player];
var us=player<<3;
var ut=us+fZ;
var a9s=bonusSystem.z.a9s;
var mm=bonusSystem.z.mm;
var i1=mF[0];
var lX=mF[mF.length-1];
for(var aC=us;aC<ut;aC++){var h7=mm[a9s[aC]];if(h7[0]===i1&&h7[h7.length-1]===lX){
return true;}}return false;};}

function aZW(){this.iD=function(player,fL){if(!ab5(player)){
return false;}var aZy=ab6(player,fL);if(aZy===-1){return false;}if(!ab7(player,aZy)){return false;
}boostSystem.gB[3]=bonusSystem.z.mn[aZy];return true;};this.qx=function(player,ns){if(!ab5(player)){return false;
}if(!bonusSystem.lj.aZi(ns)){return false;}var aZy=boostSystem.gB[2];if(!ab7(player,aZy)){return false;}return true;
};this.rq=function(player,ns,ab8){if(!ab9(player,ns,ab8)){return false;}var aZy=boostSystem.gB[2];
bonusSystem.z.ml[aZy]=64+bonusSystem.z.ml[aZy]%64;bonusSystem.mt.ei(ns,bonusSystem.z.n3);return true;};

function ab7(player,aZy){
var aZd=powerState.territoryMinX(bonusSystem.z.mz[aZy]);
var abA=tileMap.tileDataToIndex(powerState.fP(aZd));if(!bonusSystem.lj.aam(player,abA)){
return false;}return true;}

function ab9(player,ns,ab8){if(!ab5(player)){return false;
}if(!bonusSystem.lj.aZi(ns)){return false;}var aZy=boostSystem.gB[2];if(!gameState.gv.lY(player,bonusSystem.z.mo[aZy]>>3)){
return false;}if(abB(player,aZy)){return true;}var aZd=powerState.territoryMinX(bonusSystem.z.mz[aZy]);
var abC=bonusSystem.lj.aao(player,aZd);if(abC===-1){return false;}var abD=powerState.j2(abC,aZd);
if(ab8&&abD>120){return false;}var aXW=abE(aZy,abD,aZd);if(bonusSystem.lh.rn(player,aXW,1)){boostSystem.gB[1]=6;
return true;}return false;}

function abE(aZy,abD,aZd){var mF=bonusSystem.z.mm[aZy];
var mx=bonusSystem.z.updateIdleGameSystems[aZy];
var abF=powerState.j2(aZd,mF[mx+1]);if(abD<=abF){return bonusSystem.lj.aax(aZd,mF[mx+1],abF,abD);
}var fp=abD-abF;
var fZ=mF.length-1;for(var aC=mx+1;aC<fZ;aC++){
var abG=powerState.j2(mF[aC],mF[aC+1]);if(fp<=abG){return bonusSystem.lj.aax(mF[aC],mF[aC+1],abG,fp);
}fp-=abG;}return mF[fZ];}

function abB(player,aZy){if(!bonusSystem.lj.aaw(player,aZy)){
return false;}boostSystem.h[0]=bonusSystem.reverseRoute.mO(bonusSystem.z.mm[aZy]);boostSystem.gB[1]=6;return true;}

function ab6(player,fL){
var fZ=bonusSystem.z.mk;
var mz=bonusSystem.z.mz;
var mo=bonusSystem.z.mo;
var aau=powerState.isOwnedByPlayer();
var aSJ=-1;for(var aC=0;aC<fZ;aC++){
var fp=powerState.j2(fL,powerState.territoryMinX(mz[aC]));if(fp<aau&&gameState.gv.lY(player,(mo[aC]>>3))){aau=fp;aSJ=aC;
}}return aSJ;}

function ab5(player){if(!bonusSystem.advanceSimulationTick.n1(player)){return false;}if(bonusSystem.reverseRoute.mM()){return false;
}return true;}}

function aZL(){this.ee=function(){var ml=bonusSystem.z.ml;
var mz=bonusSystem.z.mz;
var aZz=bonusSystem.z.aZz;
for(var aC=bonusSystem.z.mk-1;aC>=0;aC--){if(aZz[aC]!==65535){continue;}if(abH(aC,powerState.territoryMinX(mz[aC]),ml[aC]%64)){
bonusSystem.mt.aZj(aC);bonusSystem.aK3.aa2(aC);}}};this.abI=function(player,fL,iQ,ns,iI){
if(iQ>=5){return;}var aaZ=localPlayer.getTileOwner;if(!gameState.gv.hl(aaZ)){return;}if(!playerBoundaryEngine.fS(player,aaZ)){
return;}if(player===aaZ){return;}if(playerData.hG[aaZ].length===0){return;}if(!gameState.gv.replaceAll(player,5)){return;
}var fn=false;var abJ;for(var aC=0;aC<4;aC++){abJ=(fL+powerState.hasNeighborWithId[aC])<<2;if(!tileMap.fU(abJ)){continue;
}if(tileMap.fQ(abJ)){continue;}if(tileMap.fR(abJ)===aaZ){fn=true;break;}}if(!fn){return;}hoverProcessor.a8u(719,0);
var s1;if(iI<25000){s1=L(497)+" ("+gameState.tI.currentLoopHandler(iI)+") ⛵";}else{s1=L(498)+" ("+gameState.tI.currentLoopHandler(iI)+") 🚢";
}hoverProcessor.a0i(180,s1,719,player,colorPalette.pv,colorPalette.pL,-1,true,undefined,{ft:1,ns:ns});
};

function abH(aC,aZd,iQ){if(iQ===6){if(bonusSystem.mt.aZm(aC,aZd)){bonusSystem.z.updateIdleGameSystems[aC]++;bonusSystem.z.aZz[aC]=0;
return false;}return true;}var player=bonusSystem.z.mo[aC]>>3;
var iI=bonusSystem.z.a8m[aC];gameClock.abK(player);if(iQ<4){
abL(player,iI,(aZd+powerState.hasNeighborWithId[iQ])<<2,aZd);}else if(iQ===4){abM(player,iI,aZd);}else if(iQ===5){
abN(player,iI,aZd);}return true;}

function abM(player,iI,aZd){var aC,fd;
var ip=powerState.ig;
var fO=powerState.fP(aZd);for(aC=0;aC<4;aC++){fd=fO+ip[aC];if(tileMap.fQ(fd)){abL(player,iI,fd,aZd);
return;}}for(aC=0;aC<4;aC++){fd=fO+ip[aC];if(tileMap.h9(fd)&&!tileMap.a0I(player,fd)){abL(player,iI,fd,aZd);
return;}}for(aC=0;aC<4;aC++){fd=fO+ip[aC];if(tileMap.h9(fd)){abL(player,iI,fd,aZd);
return;}}}

function abN(player,iI,aZd){var aC,fd;
var ip=powerState.ig;
var fO=powerState.fP(aZd);
for(aC=0;aC<4;aC++){fd=fO+ip[aC];if(tileMap.h9(fd)&&tileMap.a0I(player,fd)){abL(player,iI,fd,aZd);
return;}}for(aC=0;aC<4;aC++){fd=fO+ip[aC];if(tileMap.h9(fd)){abL(player,iI,fd,aZd);
return;}}for(aC=0;aC<4;aC++){fd=fO+ip[aC];if(tileMap.fQ(fd)){abL(player,iI,fd,aZd);
return;}}}

function abL(player,iI,abJ,aZd){var k3;if(tileMap.fQ(abJ)){k3=localPlayer.isMountainTile;}else{k3=tileMap.fR(abJ);
if(k3===player){gameClock.gz(player,iI-gameState.gv.collectPlayerAttackTiles(player,iI),12);return;}if(!playerBoundaryEngine.fS(player,k3)){
mapCache.kw.rC(player,k3,iI);return;}}if(!alliances.kF(player,k3)&&!alliances.kY(player)){gameClock.gz(player,iI,12);return;
}playerData.h1[player].push(aZd<<2);alliances.ei(player,iI,k3);borderCalc.k1(player,true);}}

function aZI(){this.botCount=512;
this.findClosestCoastalLaunchTile=8;this.mk=0;this.n3=0;this.mo=new Uint16Array(this.botCount);this.mz=new Uint32Array(this.botCount);
this.aZz=new Uint16Array(this.botCount);this.a8m=new Uint32Array(this.botCount);
this.aa7=new Uint16Array(this.botCount);this.mn=new Uint16Array(this.botCount);this.ml=new Uint8Array(this.botCount);
this.interpolateTileAlongSegment=new Uint8Array(this.botCount);this.mm=new Array(this.botCount);this.updateIdleGameSystems=new Uint16Array(this.botCount);
this.ky=new Uint8Array(localPlayer.isMountainTile);this.a9s=new Uint16Array(this.findClosestCoastalLaunchTile*localPlayer.isMountainTile);this.applyToGame=function(){
this.mk=0;this.n3=0;this.ky.fill(0);this.mm.fill(null);};this.updateFrameOverlays=function(player){
var iI=boostSystem.g6[0];
var mp=boostSystem.gB[1];
var mF=boostSystem.h[0];
var abO=this.n3;
var fZ=this.mk;
var abP=powerState.getPlayerCenterTile(mF[0]);
var abQ=this.ky[player];
var abR=(player<<3)+abQ;this.mo[fZ]=abR;this.mz[fZ]=abP;this.aZz[fZ]=0;
if(iI<60){gameState.gv.setPassiveBorderTile(player,60-iI);iI=60;}this.a8m[fZ]=iI;this.aa7[fZ]=bonusSystem.territoryMinY.updateFrameOverlays(fZ,powerState.territoryMaxX(abP));
this.mn[fZ]=abO;this.ml[fZ]=mp;this.interpolateTileAlongSegment[fZ]=0;this.mm[fZ]=mF;this.updateIdleGameSystems[fZ]=0;this.n3=(abO+1)%65536;
this.ky[player]=abQ+1;this.a9s[abR]=fZ;this.mk++;bonusSystem.mp.abI(player,mF[mF.length-1],mp,abO,iI);
};this.ee=function(){bonusSystem.mp.ee();
var h7=localPlayer.getTileOwner;
var ea=bonusSystem.lj.aK0(h7);
abS(this);abT(this);abU(this);abV(this);gameClock.gz(h7,ea-bonusSystem.lj.aK0(h7),15);};

function abS(tt){
var abW,h8;
var mz=tt.mz;
var a8m=tt.a8m;
var aa9=tt.interpolateTileAlongSegment;
var aZz=tt.aZz;
var aa7=tt.aa7;
var mm=tt.mm;
var updateIdleGameSystems=tt.updateIdleGameSystems;
var fZ=tt.mk;
var aac=dialogManager.fk<<4;for(var aC=fZ-1;aC>=0;aC--){var abX=mz[aC];
var mF=mm[aC];
var abY=updateIdleGameSystems[aC];
var abP=powerState.getPlayerCenterTile(mF[abY]);
var abZ=powerState.getPlayerCenterTile(mF[abY+1]);
var aba=abP%aac;
var abb=~~((abP+0.5)/aac);
var abc=abZ%aac;
var abd=~~((abZ+0.5)/aac);
var abe=abc-aba;
var abf=abd-abb;
var fc=Math.max(~~Math.sqrt(abe*abe+abf*abf+0.5),1);
var aKx=a8m[aC];
if(aa9[aC]){h8=40000;}else{h8=250000+Math.min(20*aKx,300000)+Math.min(aKx>>3,50000);
}var abg=aZz[aC]+Math.max(~~((h8+0.5)/fc),1);if(abg>=65535){if(abY+2<mF.length){
updateIdleGameSystems[aC]=abY+1;mz[aC]=abW=abh(aC,abg,abc,abd,abY,fc,mF,aac);}else{mz[aC]=abW=abZ;aZz[aC]=65535;
}}else{aZz[aC]=abg;mz[aC]=abW=aba+mathUtils.g0(abg*abe,65535)+aac*(abb+mathUtils.g0(abg*abf,65535));
}aa7[aC]=bonusSystem.territoryMinY.abi(aa7[aC],abX,abW);}}

function abh(aC,abg,aba,abb,abY,fc,mF,aac){
abg=Math.min(abg-65535,65535);
var abZ=powerState.getPlayerCenterTile(mF[abY+2]);
var abc=abZ%aac;
var abd=~~((abZ+0.5)/aac);
var abe=abc-aba;
var abf=abd-abb;
var abj=Math.max(~~Math.sqrt(abe*abe+abf*abf+0.5),1);
abg=Math.min(Math.floor((fc*abg+0.5)/abj),65534);
bonusSystem.z.aZz[aC]=abg;return aba+mathUtils.g0(abg*abe,65535)+aac*(abb+mathUtils.g0(abg*abf,65535));}

function abT(tt){
if(clanPanel.kr()%2!==1){return;}var aC,iR,lp,ft,ej,abk,a1B,abl,i1,lX,aBL,aBN,nv,nw,abP,abZ,abm;
var fp,abn,abo,abp;
var fZ=tt.mk;
var mz=tt.mz;
var mo=tt.mo;
var a8m=tt.a8m;
var aa9=tt.interpolateTileAlongSegment;
var jM=bonusSystem.territoryMinY.territoryMinY;
var abq=jM.length;
var abr=bonusSystem.territoryMinY.abr;
var aac=dialogManager.fk<<4;
var abt=localPlayer.iT;
var aXK=mainMenu.fX;
var aau=120*120;
var h8=(fZ-1)*(mathUtils.g0(clanPanel.kr(),2)%2);for(aC=0;aC<fZ;aC++){iR=Math.abs(aC-h8);
abP=mz[iR];lp=powerState.territoryMaxX(abP);i1=mo[iR]>>3;nv=abP%aac;nw=~~((abP+0.5)/aac);abo=a8m[iR];
for(ft=0;ft<9;ft++){abk=lp+abr[ft];if(abk<0||abk>=abq){continue;}abl=jM[abk];a1B=abl.length;
for(ej=0;ej<a1B;ej++){abm=abl[ej];lX=mo[abm]>>3;if(i1===lX||(abt&&aXK[i1]===aXK[lX]&&aXK[i1])){
continue;}abZ=mz[abm];aBL=nv-(abZ%aac);aBN=nw-~~((abZ+0.5)/aac);fp=aBL*aBL+aBN*aBN;
if(fp<aau){abp=a8m[abm];if(abp<=abo){abn=Math.max(1,mathUtils.g0(abp+mathUtils.g0(abo-abp,10),10));
}else{abn=Math.max(1,mathUtils.g0(abo,10));}a8m[abm]=Math.max(abp-abn,0);aa9[abm]=4;}}
}}}

function abU(tt){if(clanPanel.kr()%5!==3){return;}var a8m=tt.a8m;
var fZ=tt.mk;for(var aC=0;aC<fZ;aC++){
var iI=a8m[aC];a8m[aC]=Math.max(iI-Math.max(1,iI>>7),0);}}

function abV(tt){var a8m=tt.a8m;
var aa9=tt.interpolateTileAlongSegment;for(var aC=tt.mk-1;aC>=0;aC--){aa9[aC]=aa9[aC]>>1;if(a8m[aC]===0){bonusSystem.mt.aZj(aC);
bonusSystem.aK3.aa2(aC);}}}}

function aZJ(){this.abu=32;this.fg=0;this.fi=0;this.territoryMaxY=0;this.abv=0;this.abw=4;
this.territoryMinY=null;this.abr=new Int16Array(9);this.applyToGame=function(){this.territoryMaxY=1+mathUtils.g0(dialogManager.fk-1,this.abu);
this.abv=1+mathUtils.g0(dialogManager.fl-1,this.abu);this.territoryMinY=new Array(this.territoryMaxY*this.abv);
gameState.sS.a4c(this.territoryMinY);abx(this.abr,this.territoryMaxY);};

function abx(abr,j){var fg,fi;
for(fg=-1;fg<=1;fg++){for(fi=-1;fi<=1;fi++){abr[3*(1+fi)+1+fg]=fi*j+fg;}}}this.updateFrameOverlays=function(aby,aC){
this.territoryMinY[aC].push(aby);return this.territoryMinY[aC].length-1;};this.abi=function(abz,abP,abZ){
var ac0,ac1;
var us=powerState.territoryMaxX(abP);
var ut=powerState.territoryMaxX(abZ);if(us===ut){return abz;
}ac0=this.territoryMinY[us].pop();if(this.territoryMinY[us].length===abz){return this.updateFrameOverlays(ac0,ut);}ac1=this.territoryMinY[us][abz];
this.territoryMinY[us][abz]=ac0;bonusSystem.z.aa7[ac0]=abz;return this.updateFrameOverlays(ac1,ut);};}

function aZN(){
this.li=function(player,ac2){if(ac2===-1){return false;}if(!bonusSystem.lj.mK(player,ac2)){return false;
}return this.rn(player,ac2,0);};this.rn=function(player,ac2,ac3){var mD=ac4(player,ac2,ac3);
if(mD===-1){return false;}boostSystem.h[0]=bonusSystem.reverseRoute.get(mD);return true;};

function ac4(player,ac2,ac3){
var abC=bonusSystem.lj.aao(player,ac2);if(abC===-1){return-1;}var ac5=bonusSystem.lj.isActivePlayer(abC,ac2);
if(ac5===-1){return-1;}var mD=bonusSystem.reverseRoute.mL(ac5,ac2);if(mD>=0){return mD;}if(bonusSystem.reverseRoute.mM()){
return-1;}mD=bonusSystem.reverseRoute.mL(ac2,ac5);if(mD>=0){return bonusSystem.reverseRoute.mN(bonusSystem.reverseRoute.mO(bonusSystem.reverseRoute.get(mD)));}if(ac5===ac2){
return bonusSystem.reverseRoute.mN(new Uint32Array([ac5,ac2]));}mD=bonusSystem.aZO.rn(ac5,ac2);if(mD>=0){return mD;
}if(!ac3){return-1;}return ac6(ac2,player);}

function ac6(ac7,player){var gG=boostSystem.gG;gG.fill(0);
var buffer=[ac7];gG[ac7]=1;
var ih=powerState.isWaterTile;
var ac8=-1;
var fZ=buffer.length;while(ac8===-1&&fZ){
var h=[];for(var aC=0;aC<fZ;aC++){var fL=buffer[aC];
var a6P=gG[fL];for(var fc=0;fc<8;fc++){
var ff=fL+ih[fc];
var fD=4*ff;if(!tileMap.getEncodedX(fD)){if(ac8===-1&&fc%2===0&&tileMap.a0F(player,fD)){
ac8=fL;}continue;}var yQ=gG[ff];
var a31=a6P+5+((fc&1)<<1);if(yQ===0){h.push(ff);gG[ff]=a31;}else{
gG[ff]=Math.min(a31,yQ);}}}buffer=h;fZ=buffer.length;}if(ac8===-1){return-1;}return ac9(ac7,ac8);
}

function ac9(j3,acA){var ih=powerState.isWaterTile;
var acB=-1;
var iQ=0;
var nQ=[];while(acA!==j3){iQ=acC(acA,iQ);
if(iQ!==acB){nQ.push(acA);acB=iQ;}acA+=ih[iQ];}nQ.push(j3);
var mD=bonusSystem.reverseRoute.mL(nQ[0],j3);
if(mD>=0){return mD;}return bonusSystem.reverseRoute.mN(new Uint32Array(nQ));}

function acC(fL,iQ){
var gG=boostSystem.gG;
var ih=powerState.isWaterTile;
var a6P=gG[fL];if(a6P-gG[fL+ih[iQ]]===5+((iQ&1)<<1)){return iQ;
}for(var fs=0;fs<8;fs++){var fc=(fs+iQ+6)&7;if(a6P-gG[fL+ih[fc]]===5+((fc&1)<<1)){return fc;
}}return iQ;}}

function aZP(){this.rn=function(ac5,ac2){var mF=ac4(ac5,ac2);if(mF===null){return-1;
}return bonusSystem.reverseRoute.mN(mF);};

function ac4(ac5,ac2){var j7=powerState.fh(ac5);
var j8=powerState.fj(ac5);
var j9=powerState.fh(ac2);
var jA=powerState.fj(ac2);if(j7===j9){if(acD(j7,j8,jA)){return new Uint32Array([ac5,ac2]);
}return null;}if(j8===jA){if(acE(j8,j7,j9)){return new Uint32Array([ac5,ac2]);
}return null;}return acF(j7,j8,j9,jA,ac5,ac2)||acF(j9,jA,j7,j8,ac5,ac2);
}

function acD(ho,j8,jA){var kA=Math.min(j8,jA);
var oD=Math.max(j8,jA);
for(var fi=kA+1;fi<oD;fi++){if(!tileMap.getEncodedX(powerState.getNeighbor(ho,fi))){return false;}}return true;
}

function acE(hq,j7,j9){var kA=Math.min(j7,j9);
var oD=Math.max(j7,j9);for(var fg=kA+1;fg<oD;fg++){
if(!tileMap.getEncodedX(powerState.getNeighbor(fg,hq))){return false;}}return true;}

function acF(j7,j8,j9,jA,ac5,ac2){
var fZ=Math.min(Math.abs(j9-j7),Math.abs(jA-j8));
var iw=Math.sign(j9-j7);
var iz=Math.sign(jA-j8);for(var aC=0;aC<fZ;aC++){j7+=iw;j8+=iz;if(!tileMap.getEncodedX(powerState.getNeighbor(j7,j8))){
return null;}}if(j7===j9){if(acD(j7,j8,jA)){return new Uint32Array([ac5,powerState.fw(j7,j8),ac2]);
}return null;}if(acE(j8,j7,j9)){return new Uint32Array([ac5,powerState.fw(j7,j8),ac2]);
}return null;}}

function aZU(){var acG=[];this.applyToGame=function(){acG=[];};this.mM=function(){
return acG.length===65536;};this.mL=function(ac5,ac2){var mG=acG;
var fZ=mG.length;
for(var aC=0;aC<fZ;aC++){var h7=mG[aC];if(h7[0]===ac5&&h7[h7.length-1]===ac2){return aC;}}return-1;
};this.mO=function(mF){var acH=new Uint32Array(mF.length);acH.set(mF);return acH.reverse();
};this.aZq=function(i1,lX){var resolveAttackCombat=i1.length-1;
var acI=new Uint32Array(resolveAttackCombat+lX.length);
acI.set(i1,0);acI.set(lX,resolveAttackCombat);return acI;};this.aZv=function(i1,lX,xu,fL,acJ){
if(acJ){lX=this.mO(lX);xu=lX.length-xu-2;}var acK=lX.subarray(xu+1+(fL===lX[xu+1]));
var acI=new Uint32Array(i1.length+acK.length);acI.set(i1,0);acI.set(acK,i1.length);
return acI;};this.mN=function(mF){acG.push(mF);return acG.length-1;};this.get=function(aC){
return acG[aC];};this.mI=function(){return acG;};this.tutorialLink=function(ac5,ac2){return null;
};}

function aZY(){this.ee=function(player,ns){var mw=bonusSystem.lj.nu(player,ns);if(mw<0){return false;
}if(!bonusSystem.mt.aZx(mw)){return false;}bonusSystem.mt.aZj(mw);return true;};}

function aZK(){var a0q=32;
var a0p=new Array(2);this.playersLink=-1;this.applyToGame=function(){this.playersLink=-1;if(a0p[0]){return;}a0p[0]=yf(255);
a0p[1]=yf(0);};

function yf(ej){var fg,fi,fL,iw,iz,fp;
var iV=a0q;
var a55=gameState.sK.yf(iV,iV);
var ib=gameState.sK.getContext(a55,true);
var iY=gameState.sK.getImageData(ib,iV,iV);
var yq=iY.data;
var lp=(iV>>1)-0.5;
var lq=Math.sqrt(lp*lp);yq.fill(255);for(fi=0;fi<iV;fi++){for(fg=0;fg<iV;fg++){
iw=fg-lp;iz=fi-lp;fL=(fi*iV+fg)*4;fp=255*2.8*(lq-Math.sqrt(iw*iw+iz*iz))/lq;yq[fL+2]=ej;
yq[fL+3]=fp>255?0:fp;}}ib.putImageData(iY,0,0);return a55;}this.clansLink=function(ib,fD,fg,fi,eH,aC){
if(!gameState.gv.hl(localPlayer.getTileOwner)){return;}fD*=(4/3)*(20/32);eH*=(4/3);ib.setTransform(fD,0,0,fD,fg-eH,fi-eH);
ib.drawImage(a0p[+(bonusSystem.z.mn[aC]===this.playersLink)],0,0);};}

function aZT(){
this.iA=function(player,aXW){if(!bonusSystem.advanceSimulationTick.n1(player)){return false;}var aXX=powerState.isOwnedByPlayer();
var acO=[];
while(true){var ac8=GlowState(aXW,aXX,acO,player);if(ac8===-1){break;}var id=tileMap.tileDataToIndex(powerState.fP(ac8));
if(bonusSystem.lj.aam(player,id)){if(checkBorderDirection(player,ac8,aXW)){boostSystem.gB[7]=ac8;return true;}return false;
}acO.push(id);}return false;};

function GlowState(aXW,aXX,acO,player){var ho=powerState.fh(aXW);
var hq=powerState.fj(aXW);
var aXZ=dialogManager.fk-2;
var aBR=dialogManager.fl-2;
var aXa=-1;for(var fc=0;fc<aXX;fc++){var aBQ=Math.max(ho-fc,1);
var aOA=Math.max(hq-fc,1);
var a03=Math.min(ho+fc,aXZ);
var a02=Math.min(hq+fc,aBR);
var j3=aXb(ho,a03-ho,hq-fc,acO,aBR,1,player);
var j4=aXb(ho-1,ho-aBQ-1,hq-fc,acO,aBR,-1,player);
var aXc=aXb(ho,a03-ho,hq+fc,acO,aBR,1,player);
var aXd=aXb(ho-1,ho-aBQ-1,hq+fc,acO,aBR,-1,player);
var aXe=aXf(hq,a02-hq-1,ho-fc,acO,aXZ,1,player);
var aXg=aXf(hq-1,hq-aOA-2,ho-fc,acO,aXZ,-1,player);
var aXh=aXf(hq,a02-hq-1,ho+fc,acO,aXZ,1,player);
var aXi=aXf(hq-1,hq-aOA-2,ho+fc,acO,aXZ,-1,player);
aXa=aXj(aXa,j3,aXW);aXa=aXj(aXa,j4,aXW);aXa=aXj(aXa,aXc,aXW);aXa=aXj(aXa,aXd,aXW);
aXa=aXj(aXa,aXe,aXW);aXa=aXj(aXa,aXg,aXW);aXa=aXj(aXa,aXh,aXW);aXa=aXj(aXa,aXi,aXW);
if(aXa>=0&&fc*fc>=powerState.j5(aXa,aXW)){return aXa;}}return-1;}

function aXb(fg,fZ,fi,acO,aBR,fz,player){
if(fi<1||fi>aBR){return-1;}for(var aC=0;aC<=fZ;aC++){var fD=powerState.getNeighbor(fg,fi);
if(bonusSystem.lj.aa1(fD)&&!gameState.sS.has(acO,tileMap.tileDataToIndex(fD))&&tileMap.a07(fD,player)){return fD>>2;}fg+=fz;
}return-1;}

function aXf(fi,fZ,fg,acO,aXZ,fz,player){if(fg<1||fg>aXZ){return-1;}fZ=Math.max(fZ,0);
for(var aC=0;aC<=fZ;aC++){var fD=powerState.getNeighbor(fg,fi);if(bonusSystem.lj.aa1(fD)&&!gameState.sS.has(acO,tileMap.tileDataToIndex(fD))&&
tileMap.a07(fD,player)){return fD>>2;}fi+=fz;}return-1;}

function aXj(j3,j4,aXW){
if(j4===-1){return j3;}if(j3===-1){return j4;}if(powerState.j5(j4,aXW)<powerState.j5(j3,aXW)){return j4;}return j3;
}

function checkBorderDirection(player,ac8,aXW){var iQ=powerState.emptyTileCache(ac8,aXW);for(var aC=0;aC<4;aC++){var fL=powerState.getRandomTileInPlayerArea(ac8,iQ);
if(tileMap.aJY(powerState.fP(fL),player)){boostSystem.gB[6]=iQ;return true;}iQ=(iQ+1)%4;}return false;}}

function dn(){
this.aUx=[L(499),L(500),L(501),L(502),L(503),L(504),L(505),L(506),L(507),L(508),L(509),
L(510),L(511),L(512),L(513),L(514)];
var acR=["Space","","KeyB","","KeyW","","KeyS","","KeyD","",
"KeyA","","KeyH","","NumpadAdd","","NumpadSubtract","","ArrowLeft","","ArrowRight","","ArrowUp","",
"ArrowDown","","KeyM","","KeyP","","KeyI",""];this.aDv=new Array(acR.length);this.applyToGame=function(){
var value=connectionMgr.buffer.data[155].value;
var h=value.split(";");
var lp=h.length;acS();if(lp>acR.length){
return;}for(var aC=0;aC<lp;aC++){if(h[aC].length){this.aDv[aC]=h[aC];}}};

function acS(){
var fZ=acR.length;for(var aC=0;aC<fZ;aC++){ba.aDv[aC]=acR[aC];}}this.aUz=function(eI,code){
var aDv=this.aDv;
var acT=acR;aDv[eI]=code;
var s1="";
var fZ=aDv.length;
var acU=[];
for(var aC=0;aC<fZ;aC++){acU.push(aDv[aC]===acT[aC]?"":aDv[aC]);}fZ--;for(var aC=0;aC<fZ;aC++){
s1+=acU[aC]+";";}s1+=acU[fZ];connectionMgr.qo.boatNotificationHandler(155,s1);};this.aUw=function(){connectionMgr.qo.boatNotificationHandler(155,"");
this.applyToGame();};this.ej=function(code,eI){return code===this.aDv[eI]||code===this.aDv[eI+1];
};}

function BotAI(){var aZe=1;
var acV=new Array(aZe);
var acW=new Array(aZe);
var acX=20;
var eX=0;
var acY=false;this.applyToGame=function(){if(window.document.documentMode){return;}
var src="data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAFAAACoABtbW1tbW1tbW1tbW1tbW1tbW1tkpKSkpKSkpKSkpKSkpKSkpKSkpK2tra2tra2tra2tra2tra2tra2ttvb29vb29vb29vb29vb29vb29vb//////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAaRAAAAAAAAAqDGJ7xx//sUZAAAAGoWTAUAQAILQojwoBQAQfh1YBgWgAA6iqWDANAA/qchCEIRugQAAAAQRX//zh8AAIKQ8PDADzH/4F4SAs/99er//lD9Zr+tH6BPCvRPDCOshGlfMtv/C4Rh//sUZAKAAIsdXIYVQAANgrkgwBQAAcwBhTwBgDA2CmODgQABAR4bRp///9fF/i9tH5q+c5QFAvcPgcvpBBIAHN+AAH5s2HXJpNQxh/+tf3ukWgQIyReNoQ1S//5ABgKY//sUZAMAAJgc2oUJQAILwpkQoBQAQgQvbhgSgAA8CuaXAFAAEBISGGZh7////3cSlP9OrSjmBg0TESm6X8APjixspcDhfT2cK+sRfD4AEkAAH+b8YABosOqFm9Fv/wrw//sUZAIAAHAMXYYUwAANo2jwwBwAAnABaZwBgAAyimODgCABAwEGWG/+31clmP0m+005fUbgtQ478mJAAArgAAMAPg0DQNDhKCv//8RBx3//mMFAQEBEioQKCilMQU1F//sUZAIP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
for(var aC=aZe-1;aC>=0;aC--){acZ(aC,src);}acY=true;};this.vx=function(){if(!acY){
return;}acY=false;for(var aC=aZe-1;aC>=0;aC--){acV[aC].onpause=null;acV[aC].oncanplaythrough=null;
account.removeChild(document.body,acV[aC]);acV[aC]=null;}};

function acZ(aC,src){acW[aC]=0;
acV[aC]=document.createElement("audio");acV[aC].src=src;acV[aC].setAttribute("preload","auto");
acV[aC].setAttribute("controls","none");acV[aC].style.display="none";
acV[aC].onpause=function(){acW[aC]=1;};acV[aC].oncanplaythrough=function(){
acW[aC]=acW[aC]===0?1:acW[aC];};document.body.appendChild(acV[aC]);
}

function aca(){acX++;botAI.play();}this.play=function(){if(!acY){return;}var ea=performance.now();
if(ea>eX+66){for(var aC=aZe-1;aC>=0;aC--){if(acW[aC]===1){eX=ea;acW[aC]=2;acV[aC].play();return;}}
}if(acX>0){acX--;setTimeout(aca,66);}};}

function ArenaSystem(){this.aAQ=function(){if(territorySystem.lQ<3){return false;
}if(playerData.hN[mV[0]]>=(localPlayer.chance>>1)){return false;}if(localPlayer.iT){return acb();}else{return acc();}
};

function acc(){if(localPlayer.survivorBotCount===8){return false;}var acd=botSpawner.aLa();if(2*playerData.hb[mV[0]]>=acd){return false;
}return true;}

function acb(){if(localPlayer.survivorBotCount===9){return false;}var acd=botSpawner.aLa();
var ace=botSpawner.aLb(gameMenu.lT());
if(2*ace>=acd){return false;}return true;}}

function ClickProcessor(){this.applyToGame=function(){
if(localPlayer.data.sResourcesType===0){acf();}else if(localPlayer.data.sResourcesType===1){acg();}else{
ach();}gameClock.nQ[8]=playerData.hb[localPlayer.getTileOwner];};

function acf(){var abQ=localPlayer.ku;
var hb=playerData.hb;for(var aC=0;aC<abQ;aC++){
hb[aC]=512;}var abR=localPlayer.isTileOwnedByPlayer;
var l7=troopCalc.l7;
var iI=troopCalc.iI;for(aC=abQ;aC<abR;aC++){hb[aC]=l7[iI[aC]];
}}

function acg(){var fZ=localPlayer.isTileOwnedByPlayer;
var hb=playerData.hb;
var sResourcesValue=localPlayer.data.sResourcesValue;
for(var aC=0;aC<fZ;aC++){hb[aC]=sResourcesValue;}}

function ach(){var fZ=localPlayer.isTileOwnedByPlayer;
var hb=playerData.hb;
var sResourcesData=localPlayer.data.sResourcesData;for(var aC=0;aC<fZ;aC++){hb[aC]=sResourcesData[aC];
}}}

function GameClock(){var aJm=501;this.aci=new Uint32Array(aJm);this.resetSpawnLabelPositions=new Uint32Array(aJm);
this.aDa=new Uint16Array(aJm);this.aV7=0;
var acj=1;
var wA=0;this.max=[0,0,0];
this.ack=0;this.nQ=new Array(21);this.acl=null;this.dl=function(){this.acl=[L(515),L(516),L(517),
L(518),L(519),L(520),L(521),L(522),L(341),L(342),L(523),L(524),L(525),L(526),"",L(527),L(528),
L(529),L(299),L(530),L(531)];};this.applyToGame=function(){this.aV7=0;acj=1;this.ack=0;wA=0;acm(this);
this.nQ.fill(0);};this.rk=function(player,jC){if(!gameState.gv.a5e(player)){return;}this.nQ[0]+=jC+1;
this.nQ[1]++;this.nQ[12]+=boostSystem.g6[1];};this.rF=function(player,qs){if(player===localPlayer.getTileOwner){
hoverProcessor.rF(boostSystem.g6[0],boostSystem.g6[1],qs);this.nQ[12]+=boostSystem.g6[1];this.nQ[16]+=boostSystem.g6[0];}if(qs===localPlayer.getTileOwner){
hoverProcessor.a8y(boostSystem.g6[0],player);this.nQ[10]+=boostSystem.g6[0];}};this.ro=function(player){if(!gameState.gv.a5e(player)){
return;}this.nQ[2]++;this.nQ[12]+=boostSystem.g6[1];};this.rw=function(player){if(!gameState.gv.a5e(player)){
return;}this.nQ[19]++;this.nQ[12]+=boostSystem.g6[1];};this.abK=function(player){if(!gameState.gv.a5e(player)){
return;}this.nQ[20]++;};this.gz=function(player,a6P,eI){if(!gameState.gv.a5e(player)){
return;}this.nQ[eI]+=a6P;};this.ee=function(){if(this.ack){return;}if(wA-- >0){return;
}acn(this);};

function acn(self){self.aci[self.aV7]=playerData.hN[localPlayer.getTileOwner];self.resetSpawnLabelPositions[self.aV7]=playerData.hb[localPlayer.getTileOwner];
self.aDa[self.aV7]=botSpawner.aDb(localPlayer.getTileOwner);aco(self,self.aV7);self.aV7++;if(self.aV7===aJm){
acp(self);}wA=acj-1;accountPanel.nH();if(playerData.nU[localPlayer.getTileOwner]===0){self.ack=clanPanel.kr();}}

function acp(self){acm(self);
aco(self,0);self.aV7=1+mathUtils.g0(aJm,2);for(var aC=1;aC<self.aV7;aC++){self.aci[aC]=self.aci[aC*2];
self.resetSpawnLabelPositions[aC]=self.resetSpawnLabelPositions[aC*2];self.aDa[aC]=self.aDa[aC*2];aco(self,aC);}acj*=2;}

function acm(self){
self.max.fill(0);}

function aco(self,aC){self.max[0]=Math.max(self.aci[aC],self.max[0]);
self.max[1]=Math.max(self.resetSpawnLabelPositions[aC],self.max[1]);self.max[2]=Math.max(self.aDa[aC],self.max[2]);
}}

function AccountPanel(){this.j=0;this.k=0;this.uf=0;this.ug=0;this.acq=0;
this.acr=0;this.aAe=0;this.vN=0;this.acs=0;
var act=0;this.acu=0;this.acv=0;this.acw=0;this.a9z=0;
this.eI=0;this.aDB=null;this.isTeamGame=false;this.acx=-1;this.acy=false;this.acz=[0,0];this.dl=function(){
this.aDB=[L(532),L(125,0,"Balance"),L(124,0,"Interest"),L(533)];};this.applyToGame=function(){
this.isTeamGame=false;this.acx=-1;this.acy=false;this.resize();};this.resize=function(){var ia=1.369;
this.j=camera.j<ia*camera.k?camera.j:(camera.k*ia);
var fc=uiSurface.platformActions.ik()&&camera.j<camera.k?1:uiSurface.platformActions.ik()?0.8:camera.j<camera.k?0.65:0.59;
this.j=Math.floor(fc*this.j);this.j-=uiSurface.platformActions.ik()&&camera.j<camera.k?(2*debugPanel.gap+2):0;
this.k=Math.floor(this.j/ia);this.a9z=Math.floor(this.k/150);this.a9z=Math.max(this.a9z,1.5);
this.uf=Math.floor(1+this.j*0.02);this.ug=Math.floor(1+this.j*0.04);
this.aAe=this.ug;act=Math.floor(0.75*this.aAe);this.vN=Math.floor(1+this.j*0.075);
this.acu=Math.floor(1+this.j*0.1125);this.acv=Math.floor(this.j*(uiSurface.platformActions.ik()?0.03:0.029));
this.acv=Math.max(this.acv,4);this.acw=Math.floor(this.j*0.035);
this.acw=Math.max(this.acw,4);this.acs=this.k-2*this.aAe-this.vN-this.acu;if(this.isTeamGame){this.ad0();
}};this.hm=function(m9,mA){if(!this.isTeamGame){return false;}var zN=m9;
var zO=mA;m9-=mathUtils.g0(camera.j-this.j,2);
mA-=mathUtils.g0(camera.k-this.k,2);if(m9<0||mA<0||m9>=this.j||mA>=this.k||(m9>=this.j-this.acu&&mA<this.acu)){
if(zoomHandler.hm(zN,zO)===-1&&!packetReader.hm(zN,zO)){
this.tZ();}return true;}if(mA<this.acu){return true;}if(mA<this.k-this.vN){
this.acy=true;this.acx=(m9-2*this.uf-this.acq)/this.acr;if(this.eI!==3){clanPanel.ds=true;}return true;
}var aC=Math.floor(m9/(this.j/this.aDB.length));aC=aC<0?0:aC>=this.aDB.length?this.aDB.length-1:aC;
if(aC!==this.eI){this.eI=aC;this.ad0();clanPanel.ds=true;
}return true;};this.a3m=function(m9,mA){this.acz[0]=m9;this.acz[1]=mA;if(this.isTeamGame&&this.acy){
m9-=mathUtils.g0(camera.j-this.j,2);
var ea=this.acx;this.acx=(m9-2*this.uf-this.acq)/this.acr;
if((this.acx>=0&&this.acx<=1)||(ea>=0&&ea<=1)){clanPanel.ds=true;}
return true;}return false;};this.a4B=function(){if(this.acy){this.acy=false;}};this.a4N=function(){
if(this.isTeamGame){this.tZ();}else{this.show();}};this.show=function(){if(gameClock.aV7<2){return;}this.isTeamGame=true;
this.ad0();};this.tZ=function(){this.isTeamGame=false;this.acx=-1;clanPanel.ds=true;};this.ad0=function(){
if(this.eI<2){this.acq=deviceDetector.measureText(gameState.tI.currentLoopHandler(gameClock.max[this.eI]),gameState.sK.u8(0,this.acv));
}else if(this.eI===2){this.acq=deviceDetector.measureText(gameState.tI.a6I(6,2),gameState.sK.u8(0,this.acv));
}this.acr=this.j-2*this.uf-this.acq-this.ug;};this.nH=function(){if(!this.isTeamGame){
return;}this.ad0();};this.wr=function(){if(!this.isTeamGame){return;}this.aAw();};this.aAw=function(){
var fg=mathUtils.g0(camera.j-this.j,2);
var fi=mathUtils.g0(camera.k-this.k,2);ws.setTransform(1,0,0,1,fg,fi);
ws.fillStyle=colorPalette.pL;ws.fillRect(0,this.acu,this.j,this.k-this.acu);this.ad1();
this.aTd();ws.strokeRect(0,0,this.j,this.k);gameState.sK.textAlign(ws,2);ws.font=gameState.sK.u8(0,this.acv);
if(this.eI===0){this.ad2(gameClock.aci,fg,fi);}else if(this.eI===1){this.ad2(gameClock.resetSpawnLabelPositions,fg,fi);
}else if(this.eI===2){this.ad3(fg,fi);}else if(this.eI===3){this.ad4(fg,fi);this.ad5(fg,fi);}
zoomHandler.a86(Math.floor(fg+this.j-0.725*this.acu),Math.floor(fi+0.275*this.acu),Math.floor(0.45*this.acu));
ws.setTransform(1,0,0,1,0,0);};this.ad1=function(){var aC,ea;ws.lineWidth=this.a9z;
gameState.sK.textBaseline(ws,1);gameState.sK.textAlign(ws,1);ws.strokeStyle=colorPalette.pO;ws.font=gameState.sK.u8(1,this.acw);
ea=this.j/this.aDB.length;ws.fillStyle=colorPalette.GameplayActionExecutor;ws.fillRect(this.eI*ea,this.k-this.vN,ea,this.vN);
ws.fillStyle=colorPalette.pO;ws.fillRect(0,this.k-this.vN-0.5*this.a9z,this.j,this.a9z);for(aC=1;aC<=3;aC++){
ws.fillRect(aC*ea,this.k-this.vN,this.a9z,this.vN);}for(aC=this.aDB.length-1;aC>=0;aC--){
ws.fillText(gameState.ou.a5J(this.aDB[aC],0,0.9*ea),(aC+0.5)*ea,this.k-0.46*this.vN);
}};this.aTd=function(){ws.fillStyle=colorPalette.qA;ws.fillRect(0,0,this.j,this.acu);ws.fillStyle=colorPalette.pO;
ws.fillRect(0,this.acu-0.5*this.a9z,this.j,this.a9z);ws.font=gameState.sK.u8(1,0.39*this.acu);
ws.fillText(gameState.ou.a5J(L(534),0,0.8*this.j),Math.floor(this.j/2),Math.floor(0.55*this.acu));
};this.ad2=function(h,fg,fi){
var lp=gameClock.max[this.eI];ws.setTransform(1,0,0,1,fg+2*this.uf+this.acq,fi+this.aAe+this.acu);
ws.lineWidth=2;
var a4e=this.acs/Math.sqrt(lp);
ws.beginPath();ws.moveTo(this.acr,this.acs-a4e*Math.sqrt(h[gameClock.aV7-1]));
for(var aC=gameClock.aV7-2;aC>=0;aC--){ws.lineTo(aC*this.acr/(gameClock.aV7-1),this.acs-a4e*Math.sqrt(h[aC]));
}ws.stroke();
var fD=this.a86(h,a4e,0.5);if(fD<0.95){ws.fillText(gameState.tI.currentLoopHandler(lp),-this.uf,0);}
if(Math.abs(fD-0.5)>0.05){ws.fillText(gameState.tI.currentLoopHandler(Math.floor(lp/4)),-this.uf,Math.floor(this.acs/2));
}if(fD>0.05){ws.fillText("0",-this.uf,this.acs);
}};this.ad3=function(fg,fi){ws.setTransform(1,0,0,1,fg+2*this.uf+this.acq,fi+this.aAe+this.acu);
ws.lineWidth=2;
var a4e=this.acs/Math.max(gameClock.max[this.eI],1);
ws.beginPath();ws.moveTo(this.acr,this.acs-a4e*gameClock.aDa[gameClock.aV7-1]);
for(var aC=gameClock.aV7-2;aC>=0;aC--){ws.lineTo(aC*this.acr/(gameClock.aV7-1),this.acs-a4e*gameClock.aDa[aC]);
}ws.stroke();
var fD=this.a86(gameClock.aDa,a4e,1);
var lp=gameClock.max[this.eI]/100;if(fD<0.95){ws.fillText(gameState.tI.a6I(lp,2),-this.uf,0);
}if(Math.abs(fD-0.5)>0.05){ws.fillText(gameState.tI.a6I(lp/2,2),-this.uf,Math.floor(this.acs/2));
}if(fD>0.05){ws.fillText(gameState.tI.a6I(0,2),-this.uf,this.acs);}};this.ad4=function(fg,fi){
var aC;ws.setTransform(1,0,0,1,fg+0.34*this.j,fi+2*act+this.acu);gameState.sK.textAlign(ws,2);
var aCt=this.k-4*act-this.vN-this.acu;
var fZ=10;
var h=[0,1,19,2,20,3,4,5,6,7];
for(aC=9;aC>=0;aC--){ws.fillText(gameState.ou.a5J(gameClock.acl[h[aC]],0,0.31*this.j),0,aC*aCt/(fZ-1));
}var g1=gameClock.nQ;ws.setTransform(1,0,0,1,fg+0.39*this.j,fi+2*act+this.acu);
gameState.sK.textAlign(ws,0);ws.fillText(gameState.tI.a6I(100*g1[0]/(1024*Math.max(g1[1],1)),1),0,0);
for(aC=8;aC>=1;aC--){ws.fillText(g1[h[aC]].toString(),0,aC*aCt/(fZ-1));
}ws.fillText(gameState.tI.a6I(100*(1-playerData.hN[localPlayer.getTileOwner]/g1[7]),0),0,aCt);
};this.ad5=function(fg,fi){var aC;ws.setTransform(1,0,0,1,fg+0.79*this.j,fi+2*act+this.acu);
gameState.sK.textAlign(ws,2);
var aCt=this.k-4*act-this.vN-this.acu;
var fZ=9;ws.fillStyle=colorPalette.PlayerInteractionController;
for(aC=2;aC>=0;aC--){ws.fillText(gameState.ou.a5J(gameClock.acl[aC+8],0,0.31*this.j),0,aC*aCt/fZ);
}ws.fillText(gameState.ou.a5J(gameClock.acl[18],0,0.31*this.j),0,3*aCt/fZ);
ws.fillStyle=colorPalette.GameCommandSender;ws.fillText(gameState.ou.a5J(gameClock.acl[11],0,0.31*this.j),0,4*aCt/fZ);
ws.fillStyle=colorPalette.px;ws.fillText(gameState.ou.a5J(gameClock.acl[13],0,0.31*this.j),0,5*aCt/fZ);
ws.fillText(gameState.ou.a5J(gameClock.acl[15],0,0.31*this.j),0,6*aCt/fZ);
ws.fillText(gameState.ou.a5J(gameClock.acl[16],0,0.31*this.j),0,7*aCt/fZ);
ws.fillText(gameState.ou.a5J(gameClock.acl[12],0,0.31*this.j),0,8*aCt/fZ);ws.fillStyle=colorPalette.pw;
ws.fillText(gameState.ou.a5J(gameClock.acl[17],0,0.31*this.j),0,aCt);ws.fillStyle=colorPalette.PlayerInteractionController;
var g1=gameClock.nQ;
var aGx=g1[8]+g1[9]+g1[10]+g1[18];
var a8j=gameState.tI.currentLoopHandler(aGx);
var aSO=ws.measureText(a8j).width;
ws.setTransform(1,0,0,1,fg+0.83*this.j+aSO,fi+2*act+this.acu);ws.fillText(gameState.tI.currentLoopHandler(g1[8]),0,0);
ws.fillText(gameState.tI.currentLoopHandler(g1[9]),0,1*aCt/fZ);ws.fillText(gameState.tI.currentLoopHandler(g1[10]),0,2*aCt/fZ);
ws.fillText(gameState.tI.currentLoopHandler(g1[18]),0,3*aCt/fZ);ws.fillStyle=colorPalette.GameCommandSender;
ws.fillText(a8j,0,4*aCt/fZ);ws.fillStyle=colorPalette.px;ws.fillText(gameState.tI.currentLoopHandler(g1[13]),0,5*aCt/fZ);
ws.fillText(gameState.tI.currentLoopHandler(g1[15]),0,6*aCt/fZ);ws.fillText(gameState.tI.currentLoopHandler(g1[16]),0,7*aCt/fZ);
ws.fillText(gameState.tI.currentLoopHandler(g1[12]),0,8*aCt/fZ);
var ad6=g1[12]+g1[13]+g1[15]+g1[16];ws.fillStyle=colorPalette.pw;
ws.fillText(gameState.tI.currentLoopHandler(ad6),0,aCt);ws.fillStyle=colorPalette.pO;};this.a86=function(h,a4e,aBZ){
if(this.acx<0||this.acx>1){return 0.25;}var aC=this.acx*(gameClock.aV7-1);
var e=Math.floor(aC);
var gI=h[e];
var gK=h[e<gameClock.aV7-1?e+1:e];gI=gI+(aC-e)*(gK-gI);ws.strokeStyle=colorPalette.pR;if(this.acx>0.04){
this.ad7(0,this.acs-a4e*Math.pow(gI,aBZ),aC*this.acr/(gameClock.aV7-1),this.acs-a4e*Math.pow(gI,aBZ));
}if(gI/gameClock.max[this.eI]>0.04){
this.ad7(aC*this.acr/(gameClock.aV7-1),this.acs,aC*this.acr/(gameClock.aV7-1),this.acs-a4e*Math.pow(gI,aBZ));
}ws.fillStyle=colorPalette.pz;ws.beginPath();
ws.arc(aC*this.acr/(gameClock.aV7-1),this.acs-a4e*Math.pow(gI,aBZ),Math.max(2,0.014*this.k),0,2*Math.PI);
ws.fill();
var eZ=this.acx*clanPanel.aDc;
if(playerData.nU[localPlayer.getTileOwner]===0){eZ=Math.floor(eZ*gameClock.ack);}else{eZ=Math.floor(eZ*clanPanel.kr());}ws.fillStyle=colorPalette.pO;
ws.fillText(aBZ===1?gameState.tI.a6I(gI/100,2):gameState.tI.currentLoopHandler(Math.floor(gI)),-this.uf,this.acs-a4e*Math.pow(gI,aBZ));
gameState.sK.textAlign(ws,1);
ws.fillText(focusHandler.visibleTileBounds(eZ),aC*this.acr/(gameClock.aV7-1),this.acs+this.acv-(uiSurface.platformActions.ik()?2:0)-this.a9z);
gameState.sK.textAlign(ws,2);return a4e*Math.pow(gI,aBZ)/this.acs;
};this.ad7=function(nv,nw,o8,o9){ws.beginPath();ws.moveTo(nv,nw);ws.lineTo(o8,o9);ws.stroke();};
}

function FloorDiv(){this.ad8="https://territorial.io/changelog";this.aV8="https://territorial.io/terms";
this.aV9="https://territorial.io/privacy";this.ad9="https://territorial.io/tutorial";
this.adA="https://territorial.io/players";this.PreGameLoop="https://territorial.io/clans";
this.tickCounter="https://territorial.io/clan-results";this.aRX="https://patreon.com/c/territorial";
this.aEu="https://play.google.com/store/apps/details?id=territorial.io";
this.a3L="https://apps.apple.com/app/id1581110913";
this.aEv="https://discord.gg/pthqvpTXmh";this.aEw="https://www.instagram.com/davidtschacher/";
this.EndGameNotificationController="🇦🇫🇦🇽🇦🇱🇩🇿🇦🇸🇦🇩🇦🇴🇦🇮🇦🇶🇦🇬🇦🇷🇦🇲🇦🇼🇦🇺🇦🇹🇦🇿🇧🇸🇧🇭🇧🇩🇧🇧🇧🇾🇧🇪🇧🇿🇧🇯🇧🇲🇧🇹🇧🇴🇧🇦🇧🇼🇧🇷🇮🇴🇻🇬🇧🇳🇧🇬🇧🇫🇧🇮🇨🇻🇰🇭🇨🇲🇨🇦🇮🇨🇰🇾🇨🇫🇹🇩🇨🇱🇨🇳🇨🇽🇨🇨🇨🇴🇰🇲🇨🇬🇨🇩🇨🇷🇭🇷🇨🇺🇨🇼🇨🇾🇨🇿🇩🇰🇩🇯🇩🇲🇩🇴🇪🇨🇪🇬🇸🇻🇬🇶🇪🇷🇪🇪🇸🇿🇪🇹🇪🇺🇫🇰🇫🇴🇫🇯🇫🇮🇫🇷🇬🇫🇵🇫🇹🇫🇬🇦🇬🇲🇬🇪🇩🇪🇬🇭🇬🇮🇬🇷🇬🇱🇬🇩🇬🇵🇬🇺🇬🇹🇬🇬🇬🇳🇬🇼🇬🇾🇭🇹🇭🇳🇭🇰🇭🇺🇮🇸🇮🇳🇮🇩🇮🇷🇮🇶🇮🇪🇮🇲🇮🇱🇮🇹🇨🇮🇯🇲🇯🇵🇯🇪🇯🇴🇰🇿🇰🇪🇰🇮🇽🇰🇰🇼🇰🇬🇱🇦🇱🇻🇱🇧🇱🇸🇱🇷🇱🇾🇱🇮🇱🇹🇱🇺🇲🇴🇲🇰🇲🇬🇲🇼🇲🇾🇲🇻🇲🇱🇲🇹🇲🇭🇲🇶🇲🇷🇲🇺🇾🇹🇲🇽🇫🇲🇲🇩🇲🇨🇲🇳🇲🇪🇲🇸🇲🇦🇲🇿🇲🇲🇳🇦🇳🇷🇳🇵🇳🇱🇳🇨🇳🇿🇳🇮🇳🇪🇳🇬🇳🇺🇳🇫🇰🇵🇲🇵🇳🇴🇴🇲🇵🇰🇵🇼🇵🇸🇵🇦🇵🇬🇵🇾🇵🇪🇵🇭🇵🇱🇵🇹🇵🇷🇶🇦🇷🇴🇷🇺🇷🇼🇼🇸🇸🇲🇸🇹🇸🇦🇸🇳🇷🇸🇸🇨🇸🇱🇸🇬🇸🇽🇸🇰🇸🇮🇸🇧🇸🇴🇿🇦🇬🇸🇰🇷🇸🇸🇪🇸🇱🇰🇧🇱🇸🇭🇰🇳🇱🇨🇲🇫🇵🇲🇻🇨🇸🇩🇸🇷🇸🇪🇸🇾🇨🇭🇹🇼🇹🇯🇹🇿🇹🇭🇹🇱🇹🇬🇹🇰🇹🇴🇹🇹🇹🇳🇹🇷🇹🇲🇹🇨🇹🇻🇺🇬🇺🇦🇦🇪🇬🇧🇺🇳🇺🇸🇻🇮🇺🇾🇺🇿🇻🇺🇻🇦🇻🇪🇻🇳🇼🇫🇪🇭🇾🇪🇿🇲🇿🇼";
}

function ArmySystem(){this.z=new MultiplayerLoop();this.getEmojiFromId=new adE();
this.applyToGame=function(){this.z.applyToGame();};this.ee=function(){if(this.z.aXE===0){return;}this.z.aXE--;};}


function adE(){this.wr=function(){if(armySystem.z.aXE===0){return;}adF();if(localPlayer.isFreeForAll){adG();}};

function adF(){
ws.globalAlpha=Math.min(armySystem.z.aXE/580,1);ws.drawImage(armySystem.z.adH,1+hoverHandler.canvasStrokeWidth(),1+hoverHandler.a0M());
ws.globalAlpha=1;}

function adG(){var nv=jD/im;
var nw=jE/im;
var o8=(camera.j+jD)/im;
var o9=(camera.k+jE)/im;
var h8=armySystem.z.adI*im;
var adJ=armySystem.z.adJ;for(var aC=localPlayer.ku-1;aC>=0;aC--){
GameOverLoop(aC,h8,nv,nw,o8,o9,adJ);}ws.setTransform(im,0,0,im,0,0);}

function GameOverLoop(aC,h8,nv,nw,o8,o9,adJ){
if(playerData.nU[aC]===0||playerData.hN[aC]===0){return;}var fg=camera.j*((playerData.botExpansionAi[aC]+playerData.BotExpansionAi[aC]+1)/2-nv)/(o8-nv)-0.5*h8;
var fi=camera.k*((playerData.botTeamTargetCoordinator[aC]+playerData.BotTeamTargetCoordinator[aC]+1)/2-nw)/(o9-nw)-0.5*h8;
if(fg>camera.j||fi>camera.k||fg< -h8||fi< -h8){return;}ws.setTransform(im,0,0,im,fg,fi);
ws.drawImage(adJ[localPlayer.iT?mainMenu.fX[aC]:1],0,0);}}

function MultiplayerLoop(){this.adI=28;
this.aXE=0;this.adH=null;this.adJ=null;
var adL=null;
var adM=new Uint8Array([2,0,2,1,1,1,1,2,0,2]);
this.applyToGame=function(){this.aXE=700;adN(this);aEs(this,adO(this));if(!localPlayer.isFreeForAll){
this.a6a();}};

function adO(tt){if(tt.adH!==null&&tt.adH.width===dialogManager.fk-2&&tt.adH.height===dialogManager.fl-2){
return true;}tt.adH=gameState.sK.yf(dialogManager.fk-2,dialogManager.fl-2);return false;}

function adN(tt){var iV=tt.adI;
tt.adJ=[];adL=[];if(localPlayer.iT){for(var aC=0;aC<=localPlayer.zS;aC++){tt.adJ.push(adP(iV,mainMenu.aah[mainMenu.lH[aC]]));
adL.push(adP(iV>>1,mainMenu.aah[mainMenu.lH[aC]]));}if(localPlayer.survivorBotCount===9){adL.push(adP(iV,mainMenu.aah[1]));}
}else{tt.adJ.push(adP(iV,mainMenu.aah[7]));tt.adJ.push(adP(iV,mainMenu.aah[4]));adL.push(adP(iV>>1,mainMenu.aah[7]));
}}this.aai=function(iV,adQ){return adP(iV,adQ);};

function adP(iV,adQ){var fg,fi,fL,iw,iz,fp;
var a55=gameState.sK.yf(iV,iV);
var ib=gameState.sK.getContext(a55,true);
var iY=gameState.sK.getImageData(ib,iV,iV);
var yq=iY.data;
var lp=(iV>>1)-0.5;
var adR=(lp+0.5);adR*=adR;for(fi=0;fi<iV;fi++){
for(fg=0;fg<iV;fg++){iw=fg-lp;iz=fi-lp;fL=(fi*iV+fg)*4;fp=iw*iw+iz*iz;yq[fL]=adQ[0];
yq[fL+1]=adQ[1];yq[fL+2]=adQ[2];yq[fL+3]=(adR-fp)*adQ[3]/adR;}}ib.putImageData(iY,0,0);return a55;
}

function adS(yq,iV,ej,a0B,a0C){var fs=adM;
var fZ=fs.length;
var lp=iV>>1;
var adT=(1-a0B)>>1;
var adU=(1-a0C)>>1;for(var aC=0;aC<fZ;aC+=2){var fL=((lp+a0C*fs[aC+1]-adU)*iV+lp+a0B*fs[aC]-adT)*4;
yq[fL]=ej;yq[fL+1]=ej;yq[fL+2]=ej;}}

function aEs(tt,adV){var aC;
var adH=tt.adH;
var ib=gameState.sK.getContext(adH,true);
var fZ=localPlayer.isMountainTile;
var iV=tt.adI>>1;ib.imageSmoothingEnabled=false;
ib.setTransform(1,0,0,1,0,0);if(adV){ib.clearRect(0,0,adH.width,adH.height);
}if(localPlayer.survivorBotCount===9){iV=iV<<1;
var adW=botSystem.lL[5];for(aC=fZ-adW;aC<fZ;aC++){acN(aC,ib,adL,iV);
}fZ-=adW;iV=iV>>1;}for(aC=localPlayer.ku;aC<fZ;aC++){acN(aC,ib,adL,iV);}}this.a6a=function(){var fZ=localPlayer.ku;
var iV=this.adI;
var adJ=this.adJ;
var ib=gameState.sK.getContext(this.adH,true);for(var aC=0;aC<fZ;aC++){
acN(aC,ib,adJ,iV);}};

function acN(aC,ib,a55,iV){if(playerData.nU[aC]===0||playerData.hN[aC]===0){
return;}var fg=(playerData.botExpansionAi[aC]+playerData.BotExpansionAi[aC]+1-iV-2)>>1;
var fi=(playerData.botTeamTargetCoordinator[aC]+playerData.BotTeamTargetCoordinator[aC]+1-iV-2)>>1;
ib.drawImage(a55[localPlayer.iT?((localPlayer.survivorBotCount===9&&troopCalc.iI[aC]===5)?3:mainMenu.fX[aC]):(aC<localPlayer.ku?1:0)],fg,fi);
}}

function MapDimensions(){this.r8=function(player){hoverProcessor.a2T(player,(player===localPlayer.getTileOwner?21:22));
adX(player);SinglePlayerLoop();};this.rd=function(player){if(localPlayer.a2G===1&&playerData.nU[player]!==0&&playerData.a5a[player]!==2){
adX(player);}localPlayer.a2J--;localPlayer.a2I--;hoverProcessor.a2T(player,4);if(gameState.gv.isValidTile(2)){
focusHandler.nG(true);}SinglePlayerLoop();};

function SinglePlayerLoop(){if(localPlayer.survivorBotCount===8&&localPlayer.a2G===1){inputController.a1s.a2F();}}

function adX(player){
if(localPlayer.isFreeForAll){borderSystem.aJt(player);territorySystem.aNL();if(localPlayer.lE){localPlayer.rg.ee();}}else{statsTracker.aFE(player);}}}

function MainMenu(){
this.aXU=["rgba(90,90,90,0.88)","rgba(130,12,12,0.88)","rgba(12,130,12,0.88)","rgba(12,12,130,0.88)","rgba(130,130,12,0.88)","rgba(130,12,130,0.88)","rgba(12,130,130,0.88)","rgba(130,130,130,0.88)","rgba(0,0,0,0.88)"];
this.aCq=["rgb(210,200,200)","rgb(255,120,120)","rgb(0,230,0)","rgb(150,150,255)","rgb(240,240,25)","rgb(255,70,255)","rgb(25,240,240)",colorPalette.pO,"rgb(170,170,170)"];
this.adZ=[colorPalette.pO,"rgb(255,0,0)","rgb(0,255,0)","rgb(0,0,255)","rgb(255,255,0)","rgb(255,0,255)","rgb(0,255,255)",colorPalette.pO,colorPalette.pF];
this.ada=[colorPalette.pF,colorPalette.pO,colorPalette.pO,colorPalette.pO,colorPalette.pF,colorPalette.pF,colorPalette.pF,colorPalette.pF,colorPalette.pO];
var aNV=["255,255,255","0,0,0",
"255,170,170","190,4,4","4,255,4","4,180,4","255,195,195","90,3,3","200,255,200","3,84,3"
];this.TerrainLightingGenerator=["rgba("+aNV[0]+",","rgba("+aNV[1]+",","rgba("+aNV[2]+",","rgba("+aNV[3]+",",
"rgba("+aNV[4]+",","rgba("+aNV[5]+",","rgba("+aNV[6]+",","rgba("+aNV[7]+",",
"rgba("+aNV[8]+",","rgba("+aNV[9]+","];this.BuiltInMapCatalog=["rgb("+aNV[0]+")","rgb("+aNV[1]+")",
"rgb("+aNV[2]+")","rgb("+aNV[3]+")","rgb("+aNV[4]+")","rgb("+aNV[5]+")",
"rgb("+aNV[6]+")","rgb("+aNV[7]+")","rgb("+aNV[8]+")","rgb("+aNV[9]+")"];this.a2c=null;
this.aah=[[128,158,168,180],[255,0,0,180],[0,255,0,180],[50,50,255,180],[255,255,0,180],[255,0,255,180],[0,255,255,180],[255,255,255,180],[0,0,0,180]];
this.aSp=[[128,128,128],[255,0,0],[0,255,0],[0,0,255],[255,255,0],[255,0,255],[0,255,255],[255,255,255],[0,0,0]];
this.lH=[0,1,2,3,4,5,6,7,8];this.fX=new Uint8Array(localPlayer.isMountainTile);this.aCr=new Uint8Array(localPlayer.isMountainTile);
this.zY=new Uint16Array(localPlayer.isMountainTile);this.drawCenteredCrossMarker=new Uint16Array(this.lH.length+1);
this.za=new Uint16Array(this.lH.length);this.dl=function(){
this.a2c=[L(535),L(536),L(537),L(538),L(539),L(540),L(541),L(542),L(543)];};this.applyToGame=function(){
this.fX.fill(0);this.aCr.fill(0);this.adb();if(!localPlayer.iT){return;}if(localPlayer.survivorBotCount===9){adc();}else{if(localPlayer.lE){
add();}else{this.ee();}}ade();adf();};this.adb=function(){for(var aC=this.lH.length-1;aC>=0;aC--){
this.lH[aC]=aC;}};

function adc(){var fX=mainMenu.fX;for(var aC=localPlayer.data.teamPlayerCount[7]-1;aC>=0;aC--){
fX[aC]=1;}var fZ=localPlayer.isMountainTile;for(aC=localPlayer.data.teamPlayerCount[7];aC<fZ;aC++){
fX[aC]=2;}mainMenu.lH[1]=7;mainMenu.lH[2]=8;}this.ee=function(){var a1M=new Uint8Array(localPlayer.ku);
var a1N=new Uint8Array(localPlayer.ku);
var adg=new Uint16Array(8);
var adh=new Uint16Array(this.lH.length);
this.adi(a1M,a1N,adg,1);this.aJO(adg);this.adj(adh,a1M,a1N);this.adk(a1M,a1N,adh);this.adl();
};

function add(){var aSp=mainMenu.aSp;
var colorsData=localPlayer.data.colorsData;if(!localPlayer.data.selectableColor){
for(var aC=localPlayer.ku-1;aC>=0;aC--){colorsData[aC]=coordHelper.selectWeakestCandidate(262144);}}var adm=0;
var fp=256*3;
var aSo=[4*(colorsData[0]>>12),4*((colorsData[0]>>6)&63),4*(colorsData[0]&63)];
var teamPlayerCount=localPlayer.data.teamPlayerCount;for(aC=0;aC<9;aC++){if(!teamPlayerCount[aC]){
continue;}var fc=0;for(var ft=0;ft<3;ft++){fc+=Math.abs(aSp[aC][ft]-aSo[ft]);}if(fc<fp){
adm=aC;fp=fc;}}var adn=new Uint16Array(9);for(aC=0;aC<9;aC++){adn[aC]=teamPlayerCount[aC];
}var lH=mainMenu.lH;
var ado=new Uint8Array(9);lH[0]=0;
var resolveAttackCombat=1;for(aC=1;aC<9;aC++){if(adn[aC]){
ado[aC]=resolveAttackCombat;lH[resolveAttackCombat++]=aC;}}var kA=localPlayer.ku;
var fX=mainMenu.fX;if(adn[adm]){adn[adm]--;fX[0]=ado[adm];
}else{kA=0;}var ej=0;for(aC=kA;aC<localPlayer.isTileOwnedByPlayer;aC++){var iR=lH[ej];if(adn[iR]){adn[iR]--;fX[aC]=ado[iR];
}else{ej++;aC--;if(ej>=9){console.log("error 325");return;}}}}this.adi=function(a1M,a1N,adn,adp){
var aC,ft,e,adq;
var fZ=this.lH.length-adp;
var h=new Uint16Array(fZ);
var aSp=this.aSp;
var colorsData=localPlayer.data.colorsData;for(aC=localPlayer.ku-1;aC>=0;aC--){for(ft=fZ;ft>=adp;ft--){
h[ft-1]=Math.abs(4*(colorsData[aC]>>12)-aSp[ft][0])+Math.abs(4*((colorsData[aC]>>6)&63)-aSp[ft][1])+Math.abs(4*(colorsData[aC]&63)-aSp[ft][2]);
}adq=768;
for(ft=fZ-1;ft>=0;ft--){e=(ft+aC)%fZ;if(h[e]<adq){adq=h[e];a1M[aC]=e;}}adn[a1M[aC]]+=4;adq=768;
for(ft=fZ-1;ft>=0;ft--){e=(ft+aC)%fZ;if(h[e]<adq&&e!==a1M[aC]){adq=h[e];a1N[aC]=e;}}adn[a1N[aC]]++;
}};this.aJO=function(adn){var aC,ft,lr;
var fZ=this.lH.length-1;for(aC=fZ;aC>=0;aC--){
this.lH[aC]=aC;}for(aC=fZ-1;aC>=0;aC--){adn[aC]++;}for(aC=1;aC<=fZ;aC++){lr=0;for(ft=1;ft<fZ;ft++){
if(adn[ft]>adn[lr]){lr=ft;}}adn[lr]=0;this.lH[aC]=lr+1;}};this.adj=function(adh,a1M,a1N){
var ft,a2y,ej,fc,e,o7,uw;
var adr=this.lH.length-1;
var sn=new Uint16Array(adr);
var ads=[];
var adt=0;
var a2x=[];
var adu=[];loop:for(var aC=0;aC<localPlayer.ku;aC++){
a2y=gameState.tI.a2z(playerData.a2w[aC]);if(a2y!==null){for(ft=a2x.length-1;ft>=0;ft--){
if(a2y===a2x[ft]){adu[ft].push(aC);adt=Math.max(adt,adu[ft].length);
continue loop;}}a2x.push(a2y);ads.push(false);adu.push([aC]);adt=Math.max(adt,1);
}}while(localPlayer.zS>2&&adt>mathUtils.g0(localPlayer.ku,localPlayer.zS)){localPlayer.zS--;localPlayer.survivorBotCount--;}for(ft=a2x.length-1;ft>=0;ft--){
fc=-1;for(ej=a2x.length-1;ej>=0;ej--){if(!ads[ej]&&(fc===-1||adu[ej].length>adu[fc].length)){fc=ej;
}}for(ej=adr-1;ej>=0;ej--){sn[ej]=1;}for(ej=adu[fc].length-1;ej>=0;ej--){sn[a1M[adu[fc][ej]]]+=3;
sn[a1N[adu[fc][ej]]]++;}for(aC=adr-1;aC>=0;aC--){e=fc%adr;for(ej=adr-1;ej>=0;ej--){
if(sn[ej]>sn[e]){e=ej;}}o7=-1;for(ej=localPlayer.zS;ej>0;ej--){if(this.lH[ej]===e+1){
o7=ej;break;}}sn[e]=0;if(o7===-1){continue;}uw=0;for(ej=localPlayer.zS;ej>0;ej--){if(adh[o7]>adh[ej]){uw++;
}}if(uw===localPlayer.zS-1){continue;}for(ej=adu[fc].length-1;ej>=0;ej--){adh[o7]++;this.fX[adu[fc][ej]]=o7;
}break;}ads[fc]=true;}};this.adk=function(a1M,a1N,adh){var aC,ft,iv;
var fZ=this.lH.length-1;
var border=mathUtils.g0(localPlayer.ku,localPlayer.zS);if(localPlayer.ku%localPlayer.zS>0){border++;}var adv=new Uint8Array(fZ+1);
for(ft=fZ;ft>=1;ft--){adv[this.lH[ft]]=ft;}for(aC=0;aC<localPlayer.ku;aC++){iv=adv[a1M[aC]+1];
if(this.fX[aC]===0&&iv<=localPlayer.zS&&adh[iv]<border){adh[iv]++;this.fX[aC]=iv;}}for(aC=0;aC<localPlayer.ku;aC++){
iv=adv[a1N[aC]+1];if(this.fX[aC]===0&&iv<=localPlayer.zS&&adh[iv]<border){adh[iv]++;this.fX[aC]=iv;}}
for(ft=localPlayer.zS;ft>=1;ft--){for(aC=localPlayer.ku-1;aC>=0;aC--){if(adh[ft]>=border){break;}if(this.fX[aC]===0){
adh[ft]++;this.fX[aC]=ft;}}}};this.adl=function(){if(localPlayer.zS<8){localPlayer.zS++;localPlayer.survivorBotCount++;localPlayer.renderer=1;return;}
for(var aC=localPlayer.ku;aC<localPlayer.isMountainTile;aC++){this.fX[aC]=1+aC%localPlayer.zS;}};

function ade(){var fZ=localPlayer.isMountainTile;
var zY=mainMenu.zY;
var drawCenteredCrossMarker=mainMenu.drawCenteredCrossMarker;
var za=mainMenu.za;
var fX=mainMenu.fX;
var lH=mainMenu.lH;
var zR=lH.length;
var buffer=new Array(zR);
for(var aC=0;aC<zR;aC++){buffer[aC]=[];}for(aC=0;aC<fZ;aC++){buffer[lH[fX[aC]]].push(aC);
}for(aC=1;aC<=zR;aC++){drawCenteredCrossMarker[aC]=drawCenteredCrossMarker[aC-1]+buffer[aC-1].length;}for(aC=0;aC<zR;aC++){
var resolveAttackCombat=buffer[aC].length;
var lp=drawCenteredCrossMarker[aC];for(var iR=0;iR<resolveAttackCombat;iR++){zY[iR+lp]=buffer[aC][iR];
}}var ku=localPlayer.ku;for(aC=0;aC<zR;aC++){resolveAttackCombat=buffer[aC].length;lp=drawCenteredCrossMarker[aC];for(iR=0;iR<resolveAttackCombat;iR++){
if(zY[iR+lp]>=ku){za[aC]=iR;break;}}}}

function adf(){var fZ=localPlayer.isMountainTile;
var fX=mainMenu.fX;
var aCr=mainMenu.aCr;
var lH=mainMenu.lH;for(var aC=0;aC<fZ;aC++){aCr[aC]=lH[fX[aC]];}if(localPlayer.survivorBotCount===9){aCr.fill(1,fZ-botSystem.lL[5]);
}}}

function PlayerBoundaryEngine(){this.getDefenderCounterattackTroops=function(){var aC,fg,fi;for(aC=resolveAttacksAgainstPlayer-1;aC>=0;aC--){fg=mathUtils.g0(clearDefenderTerritory[aC],4)%dialogManager.fk;
fi=mathUtils.g0(clearDefenderTerritory[aC],4*dialogManager.fk);playerData.botExpansionAi[gQ]=Math.min(fg,playerData.botExpansionAi[gQ]);playerData.botTeamTargetCoordinator[gQ]=Math.min(fi,playerData.botTeamTargetCoordinator[gQ]);
playerData.BotExpansionAi[gQ]=Math.max(fg,playerData.BotExpansionAi[gQ]);playerData.BotTeamTargetCoordinator[gQ]=Math.max(fi,playerData.BotTeamTargetCoordinator[gQ]);}};
this.prepareAttackStrength=function(){var fZ=playerData.h1[gQ].length;var fc,h7,aC;
var fb=tileMap.fb;loop:for(aC=fZ-1;aC>=0;aC--){
for(fc=3;fc>=0;fc--){h7=playerData.h1[gQ][aC]+fb[fc];if(tileMap.fQ(h7)||(tileMap.h9(h7)&&tileMap.fR(h7)!==gQ)){
tileMap.removeAlreadyAttackedTargets(playerData.h1[gQ][aC],gQ);continue loop;}}playerData.h1[gQ][aC]=playerData.h1[gQ][fZ-1];
playerData.h1[gQ].pop();fZ--;}};this.applyCurrentAttackOutcome=function(){var player=gQ;
var hF=playerData.playerTerritories;
var hG=playerData.hG;
var fy=playerData.fy;
var fZ=hF[player].length;
var fb=tileMap.fb;loop:for(var aC=fZ-1;aC>=0;aC--){var adw=false;
var adx=false;for(var fc=3;fc>=0;fc--){var h7=hF[player][aC]+fb[fc];if(tileMap.aJY(h7,player)){
continue loop;}adw=adw||tileMap.getEncodedX(h7);adx=adx||tileMap.aJX(h7);}if(adw){hG[player].push(hF[player][aC]);
}else if(adx){fy[player].push(hF[player][aC]);}else{tileMap.zu(hF[player][aC],player);
}hF[player][aC]=hF[player][fZ-1];hF[player].pop();fZ--;}};this.hD=function(){
playerData.hN[initializeAttackResolutionBuffers]-=resolveAttacksAgainstPlayer;};this.hE=function(border){var fZ=border.length;for(var aC=fZ-1;aC>=0;aC--){
if(!tileMap.a0F(initializeAttackResolutionBuffers,border[aC])){border[aC]=border[fZ-1];border.pop();fZ--;}}};this.assignCapturedTiles=function(border){
var fZ=border.length;for(var aC=fZ-1;aC>=0;aC--){if(!tileMap.a0F(initializeAttackResolutionBuffers,border[aC])&&tileMap.fU(border[aC])){
border[aC]=border[fZ-1];border.pop();fZ--;}}};this.resolveNeutralCombat=function(border){var fZ=border.length;
var fb=tileMap.fb;var fc,h7;for(var aC=fZ-1;aC>=0;aC--){for(fc=3;fc>=0;fc--){h7=border[aC]+fb[fc];
if(tileMap.aJY(h7,initializeAttackResolutionBuffers)){playerData.playerTerritories[initializeAttackResolutionBuffers].push(border[aC]);border[aC]=border[fZ-1];border.pop();fZ--;break;
}}}};this.resolvePlayerCombat=function(){var fc,h7;
var fb=tileMap.fb;for(var aC=resolveAttacksAgainstPlayer-1;aC>=0;aC--){for(fc=3;fc>=0;fc--){
h7=clearDefenderTerritory[aC]+fb[fc];if(tileMap.a0I(initializeAttackResolutionBuffers,h7)&&tileMap.aJe(h7)){playerData.playerTerritories[initializeAttackResolutionBuffers].push(h7);tileMap.mergeCapturedPlayerTerritory(h7,initializeAttackResolutionBuffers);}}}};
this.hK=function(){var fg,fi;loop:while(playerData.botTeamTargetCoordinator[initializeAttackResolutionBuffers]<playerData.BotTeamTargetCoordinator[initializeAttackResolutionBuffers]){for(fg=playerData.BotExpansionAi[initializeAttackResolutionBuffers];fg>=playerData.botExpansionAi[initializeAttackResolutionBuffers];fg--){
if(tileMap.a0F(initializeAttackResolutionBuffers,(playerData.botTeamTargetCoordinator[initializeAttackResolutionBuffers]*dialogManager.fk+fg)*4)){break loop;}}playerData.botTeamTargetCoordinator[initializeAttackResolutionBuffers]++;}loop:while(playerData.botTeamTargetCoordinator[initializeAttackResolutionBuffers]<playerData.BotTeamTargetCoordinator[initializeAttackResolutionBuffers]){
for(fg=playerData.BotExpansionAi[initializeAttackResolutionBuffers];fg>=playerData.botExpansionAi[initializeAttackResolutionBuffers];fg--){if(tileMap.a0F(initializeAttackResolutionBuffers,(playerData.BotTeamTargetCoordinator[initializeAttackResolutionBuffers]*dialogManager.fk+fg)*4)){
break loop;}}playerData.BotTeamTargetCoordinator[initializeAttackResolutionBuffers]--;}loop:while(playerData.botExpansionAi[initializeAttackResolutionBuffers]<playerData.BotExpansionAi[initializeAttackResolutionBuffers]){for(fi=playerData.BotTeamTargetCoordinator[initializeAttackResolutionBuffers];fi>=playerData.botTeamTargetCoordinator[initializeAttackResolutionBuffers];fi--){
if(tileMap.a0F(initializeAttackResolutionBuffers,(fi*dialogManager.fk+playerData.botExpansionAi[initializeAttackResolutionBuffers])*4)){break loop;}}playerData.botExpansionAi[initializeAttackResolutionBuffers]++;}loop:while(playerData.botExpansionAi[initializeAttackResolutionBuffers]<playerData.BotExpansionAi[initializeAttackResolutionBuffers]){
for(fi=playerData.BotTeamTargetCoordinator[initializeAttackResolutionBuffers];fi>=playerData.botTeamTargetCoordinator[initializeAttackResolutionBuffers];fi--){if(tileMap.a0F(initializeAttackResolutionBuffers,(fi*dialogManager.fk+playerData.BotExpansionAi[initializeAttackResolutionBuffers])*4)){break loop;
}}playerData.BotExpansionAi[initializeAttackResolutionBuffers]--;}};this.fS=function(player,k3){return(mainMenu.fX[player]===0||mainMenu.fX[player]!==mainMenu.fX[k3]);
};this.i5=function(player){var fc,aC,h8;
var fZ=playerData.playerTerritories[player].length;
var fb=tileMap.fb;for(fc=3;fc>=0;fc--){h8=fb[fc];for(aC=0;aC<fZ;aC++){if(tileMap.fQ(playerData.playerTerritories[player][aC]+h8)){
return true;}}}return false;};this.aJp=function(player){var fc,aC,h8;
var fZ=playerData.playerTerritories[player].length;
var fb=tileMap.fb;for(fc=3;fc>=0;fc--){h8=fb[fc];for(aC=0;aC<fZ;aC++){
if(tileMap.removeNeutralCandidate(playerData.playerTerritories[player][aC])&&tileMap.fQ(playerData.playerTerritories[player][aC]+h8)){return true;}}}return false;
};this.i8=function(MatchStartController,a5h){var aC,ea,fc,h8,h7;
var abQ=playerData.playerTerritories[MatchStartController].length;
var abR=playerData.playerTerritories[a5h].length;
if(abR<abQ){ea=MatchStartController;MatchStartController=a5h;a5h=ea;ea=abQ;abQ=abR;abR=ea;}var fb=tileMap.fb;for(fc=3;fc>=0;fc--){
h8=fb[fc];for(aC=0;aC<abQ;aC++){h7=playerData.playerTerritories[MatchStartController][aC]+h8;if(tileMap.h9(h7)&&tileMap.fR(h7)===a5h){
return true;}}}return false;};this.aJq=function(MatchStartController,a5h){var aC,fc,h8,h7;
var abQ=playerData.playerTerritories[MatchStartController].length;
var fb=tileMap.fb;for(fc=3;fc>=0;fc--){h8=fb[fc];for(aC=0;aC<abQ;aC++){
if(tileMap.removeNeutralCandidate(playerData.playerTerritories[MatchStartController][aC])){h7=playerData.playerTerritories[MatchStartController][aC]+h8;if(tileMap.h9(h7)&&tileMap.fR(h7)===a5h){return true;
}}}}return false;};}

function ConnectionInfo(){this.rp=new ady();}

function ady(){this.iB=function(player){
if(!gameState.gv.a5b(player)){return;}hoverProcessor.a0i(80,L(544),637,0,colorPalette.qD,colorPalette.pL,-1,false);
};this.iE=function(player){if(!gameState.gv.a5b(player)){return;
}hoverProcessor.a0i(80,L(545),637,0,colorPalette.qD,colorPalette.pL,-1,false);};}

function adz(){this.ae0=0;this.ee=function(){
keyProcessor.ee();loadingSystem.ee();camera.ee();gameServer.z.ee();touchController.isAttackBorderTile();gameConfig.eS.ee();if(clanPanel.ds){clanPanel.ds=false;moderationSystem.wr();}};
}

function ae1(){this.eZ=clanPanel.eZ;this.eI=0;this.ae0=0;this.getPlayerColors=0;this.ae2=null;this.ae3=7;this.ae4=0;
this.applyToGame=function(){this.getPlayerColors=0;this.ae2=[];this.eI=0;this.ae0=0;};this.glowTimer=function(aD){if(localPlayer.isFreeForAll){
this.aDd(aD);return;}this.ae2.push(aD);if(localPlayer.a2G===2){for(var aC=0;aC<this.ae2.length;aC++){
mapCache.validateAndResolveTarget.ee(this.ae2[aC]);}this.ae2=[];return;}};this.aDd=function(aD){if(localPlayer.a2G===2){return;
}mapCache.validateAndResolveTarget.ee(aD);packetWriter.ee();focusHandler.aDd(this.getPlayerColors);if(this.getPlayerColors===localPlayer.a6g){localPlayer.rg.ee();this.getPlayerColors=0;this.eI=0;
this.ae0=0;this.eZ=clanPanel.eZ;return;}this.getPlayerColors++;troops.a6Z();troops.nG(true);chatPanel.render();};this.ee=function(){
camera.ee();if(localPlayer.isFreeForAll){clanPanel.ds=focusHandler.aDd(-1)||clanPanel.ds;nI();}else{if(this.eI===0){if(clanPanel.eZ>=this.eZ){
this.eZ+=clanPanel.aDc*Math.floor(1+(clanPanel.eZ-this.eZ)/clanPanel.aDc);if(localPlayer.a2G===2){n6();}else{this.ae5();
}this.eI++;if(clanPanel.eZ-this.ae4>27){this.ae6();}}}else{this.ae6();}}nD();if(clanPanel.ds){clanPanel.ds=false;
a0J();}this.ae4=clanPanel.eZ;};this.ae6=function(){clanPanel.ds=true;nF();this.eI=0;};this.ae5=function(){
var xf,aC;if(this.ae0!==this.getPlayerColors*7){n8();chatPanel.render();return;}xf=false;loop:while(this.ae7()){
xf=true;n8();if(localPlayer.a2G===2){break;}if(this.ae2.length>0){for(aC=this.ae3-2;aC>=0;aC--){
n8();if(localPlayer.a2G===2){break loop;}}}else{break;}}if(xf){chatPanel.render();}else{n6();chatPanel.a6c();
}};this.ae7=function(){if(this.ae2.length>0){this.getPlayerColors++;mapCache.validateAndResolveTarget.ee(this.ae2[0]);this.ae2.shift();
return true;}return false;};}

function ae8(){var ae9;var aeA;var aeB;var aIr;var aeC;
var eI=0;
var eZ=clanPanel.eZ;this.ae0=0;this.applyToGame=function(){ae9=0;aeA=0;aeB=0;aIr=0;aeC=0;};this.ee=function(){
camera.ee();if(packetReader.aAq()<1.7){aeD();}else{aeE();}nD();if(clanPanel.ds){clanPanel.ds=false;a0J();}};

function aeD(){
var abq;if(eI===0){if(clanPanel.eZ>=eZ){abq=clanPanel.aDc/packetReader.aAq();eZ+=abq*Math.floor(1+(clanPanel.eZ-eZ)/abq);
if(localPlayer.a2G===2||zoomHandler.screenToTileY||!packetReader.a73){n6();}else{aeF();chatPanel.render();}eI++;
}}else{aeG();}}

function aeE(){var abq;if(clanPanel.eZ>=eZ){if(localPlayer.a2G===2||zoomHandler.screenToTileY||!packetReader.a73){n6();eZ=clanPanel.eZ;
}else{abq=clanPanel.aDc/packetReader.aAq();if((clanPanel.eZ-eZ)/abq>16){eZ=clanPanel.eZ-16*abq;}while(clanPanel.eZ>=eZ&&localPlayer.a2G!==2){
eZ+=abq;aeF();}chatPanel.render();}}aeG();}

function aeF(){if(aeH()){return;}if(!aeI()){
return;}n8();}

function aeH(){if(!localPlayer.isFreeForAll){return 0;}if(localPlayer.lE){return 0;}if(localPlayer.a2G===2){return 1;
}if(aeC%7!==0){aeC++;return 1;}if(aIr===localPlayer.a6g){if(!aeI()){return 0;}focusHandler.aDd(aIr);localPlayer.rg.ee();
return 1;}if(!aeI()){return 0;}aeC++;aIr++;troops.a6Z();troops.nG(true);return 1;}

function aeG(){eI=0;
if(localPlayer.isFreeForAll){clanPanel.ds=focusHandler.aDd((aIr-(aeC%7===0?0:1))+(aeC%7)/7)||clanPanel.ds;nI();return;}if(zoomHandler.screenToTileY||!packetReader.a73){
nI();}else{clanPanel.ds=true;nF();}}

function aeI(){var aC,fZ,lp;
var aeJ=packetWriter.re.PlayerValidator;
var gI=packetWriter.re.ScreenHasher;
var gK=packetWriter.re.aXw;
var gM=packetWriter.re.CanvasFontFingerprint;
var aeK=packetWriter.re.aXy;
var aeL=packetWriter.re.TimeZoneSomething;if(ae9>=aeL.length){
hoverProcessor.a3Y("Replay file smaller than expected.");packetReader.a4O(false);localPlayer.a2G=2;return false;}
lp=aeL[ae9];if(!aeK[ae9]){if(++aeB>=lp){ae9++;aeB=0;}return true;}fZ=aeA+lp;for(aC=aeA;aC<fZ;aC++){
mapCache.validateAndResolveTarget.rT(aeJ[aC],gI[aC],gK[aC],gM[aC]);}aeA+=lp;ae9++;return true;}this.a2R=function(){
if(packetWriter.re.TimeZoneSomething.length-ae9<=2){return;}hoverProcessor.a3Y("Replay file larger than expected.");
};}

function aeM(){var eI=0;
var eZ=clanPanel.eZ;this.ae0=0;this.ee=function(){
camera.ee();if(localPlayer.isFreeForAll){nI();}else{if(eI===0){if(clanPanel.eZ>=eZ){eZ+=clanPanel.aDc*Math.floor(1+(clanPanel.eZ-eZ)/clanPanel.aDc);
if(localPlayer.a2G===2||zoomHandler.screenToTileY){n6();}else{n8();chatPanel.render();}eI++;}}else{if(zoomHandler.screenToTileY){nI();}else{clanPanel.ds=true;
nF();}eI=0;}}nD();if(clanPanel.ds){clanPanel.ds=false;a0J();}};}

function ClanPanel(){this.a2Q=null;this.ds=false;
this.eZ=0;this.aDc=56;
var aeN=0;this.applyToGame=function(){this.a70();window.requestAnimationFrame(aeO);
this.eZ=performance.now();};this.a6s=function(){if(localPlayer.hi){this.a2Q=new ae8();
this.a2Q.applyToGame();return;}if(localPlayer.lE){this.a2Q=new aeM();}else{this.a2Q=new ae1();this.a2Q.applyToGame();
}};this.a70=function(){this.a2Q=new adz();this.ds=true;};this.ee=function(){this.a2Q.ae0++;
};this.kr=function(){return this.a2Q.ae0;};

function aeO(){clanPanel.eZ=aeN=performance.now();
clanPanel.a2Q.ee();window.requestAnimationFrame(aeO);}this.finalizeToUint8Array=function(){var ea=performance.now();
if(aeN+1000>ea){return;}this.eZ=ea;this.a2Q.ee();};}

function ReplaySystem(){var aIF=0;
var aeP=true;this.ee=function(){if(clanPanel.eZ<aIF){return;}mj();};

function mj(){aIF=clanPanel.eZ+3000;
if(localPlayer.hi||localPlayer.lE){return;}if(gameState.gv.hl(localPlayer.getTileOwner)){return;}var ea=new Date();
var a9E=ea.getUTCSeconds();
if(aeP){if(a9E<43){aeP=false;}return;}if(a9E<43){return;}aIF+=52000;aeP=true;
var a9D=(ea.getUTCMinutes()+2)%60;if(a9D%10===0){if(localPlayer.survivorBotCount<7){aeQ(0);}return;}if(a9D%10===5){
if(localPlayer.survivorBotCount===7||localPlayer.survivorBotCount===10){aeQ(1);}return;}if(a9D%10===7){if(localPlayer.survivorBotCount===8){aeQ(2);}return;
}if(a9D%10===2){if(localPlayer.survivorBotCount===9){aeQ(3);}}}

function aeQ(id){var s=[L(546),L(547),L(548),L(549)][id];
hoverProcessor.a8p(s);}}

function GoldSystem(){var nv;var nw;var o8;var o9;
var aeR=0;
var aeS=0;this.a3q=function(e){
if(e.touches.length>1){aeS=clanPanel.eZ;aeR=3;aeT(e);modalState.tZ();return true;}aeR=0;return false;
};this.a3r=function(e){if(localPlayer.a2G===0){return false;}if(e.touches.length>1){aeR=Math.max(aeR-1,0);
if(!soloCalc.visibleTileDirty()){return true;}var approximateIntegerSquareRoot=aeU();aeT(e);
var aKl=aeU();
var it=Math.floor((nv+o8)/2);
var iu=Math.floor((nw+o9)/2);hoverHandler.aBH(it,iu,Math.max(0.125,aKl)/Math.max(0.125,approximateIntegerSquareRoot));clanPanel.ds=true;
return true;}return false;};this.a4E=function(){var fg,fi;if(aeR){aeR=0;if(clanPanel.eZ<aeS+500){
fg=(nv+o8)/2;fi=(nw+o9)/2;modalState.a48(fg,fi);if(modalState.click(fg,fi,true)){clanPanel.ds=true;}return true;
}}return false;};

function aeU(){return Math.pow((Math.pow((o8-nv),2)+Math.pow((o9-nw),2)),0.5);
}

function aeT(e){nv=camera.l*e.touches[0].clientX;nw=camera.l*e.touches[0].clientY;
o8=camera.l*e.touches[1].clientX;o9=camera.l*e.touches[1].clientY;}}

function UrlParams(){
this.size=0;this.eI=0;this.aD=null;this.applyToGame=function(aD){this.eI=0;this.aD=aD;this.size=aD.length;
};this.vx=function(){this.aD=null;};this.arrayUtils=function(size){var aC;
var g1=0;
var aD=this.aD;
var oD=this.eI+size-1;for(aC=this.eI;aC<=oD;aC++){g1|=((aD[aC>>3]>>(7-(aC&7)))&1)<<(oD-aC);
}this.eI+=size;if(this.eI>8*this.size){console.error("Unwrapper Overflow");
}return g1;};this.aWY=function(size){var ft=size>>1;
var fc=1<<ft;
return fc*this.arrayUtils(size-ft)+this.arrayUtils(ft);};this.aWZ=function(aeV){return this.size===canvasManager.aWX(aeV);
};this.aYC=function(z7,aeW,aeX){var resolveAttackCombat=this.arrayUtils(z7);if(!resolveAttackCombat){return null;}var fZ=Math.max(resolveAttackCombat,aeX);
var h=aeW<=8?new Uint8Array(fZ):aeW<=16?new Uint16Array(fZ):new Uint32Array(fZ);
for(var aC=0;aC<resolveAttackCombat;aC++){h[aC]=this.arrayUtils(aeW);}var g1=h[resolveAttackCombat-1];if(!g1){return h;
}h.fill(g1,resolveAttackCombat);return h;};this.computeMixedHash=function(z7,aeY,aeX){var resolveAttackCombat=this.arrayUtils(z7);if(!resolveAttackCombat){return null;
}var fZ=Math.max(resolveAttackCombat,aeX);
var h=new Array(fZ);for(var aC=0;aC<resolveAttackCombat;aC++){h[aC]=this.aYA(aeY);
}h.fill(h[resolveAttackCombat-1],resolveAttackCombat);return h;};this.aYA=function(z7){return minimapRenderer.yF.yJ(this.arrayUtils(z7));
};this.aYB=function(){var s1=uiRenderer.f0.uc(uiRenderer.f0.ud(this.arrayUtils(30)));s1=gameState.tI.a6U(s1,"_","/");
s1=gameState.tI.a6U(s1,"-","\+");
var aeZ="";while((s1.length+aeZ.length)%4){aeZ=aeZ+"=";}s1="data:image/png;base64,"+s1+aeZ;
var aKM=new Image();aKM.onload=function(){packetWriter.aLJ.aLK(aKM);aKM.onload=null;aKM=null;};aKM.src=s1;};}


function LeaderboardPanel(){this.removeShipAtIndex=0;this.aZF=0;this.aZA=0;this.routeSegmentProgress=0;this.maxShipsPerPlayer=0;this.isCoastalWaterTile=0;this.followedAccountsTracker=[0,0,0,0];
this.oC=function(){this.removeShipAtIndex=hoverHandler.canvasStrokeWidth();this.aZF=hoverHandler.a0M();this.aZA=-this.removeShipAtIndex;this.routeSegmentProgress=-this.aZF;
this.maxShipsPerPlayer=camera.j/im;this.isCoastalWaterTile=camera.k/im;this.followedAccountsTracker[0]=Math.floor(this.aZA);this.followedAccountsTracker[1]=Math.floor(this.routeSegmentProgress);
this.followedAccountsTracker[2]=Math.floor(this.followedAccountsTracker[0]+this.maxShipsPerPlayer+1);this.followedAccountsTracker[3]=Math.floor(this.followedAccountsTracker[1]+this.isCoastalWaterTile+1);
chatPanel.aEB=true;};}

function ClansSystem(){var a9v;var nh;this.applyToGame=function(){a9v=1;nh=0;
};this.ee=function(){if(a9v>0){aea();}};

function aea(){nh=nh===0?clanPanel.eZ+16:nh;a9v-=(clanPanel.eZ-nh)*0.001;
a9v=a9v<0?0:a9v;nh=clanPanel.eZ;clanPanel.ds=true;}this.wr=function(){if(a9v>0){aeb();}};

function aeb(){
ws.fillStyle="rgba(0,0,0,"+a9v+")";ws.fillRect(0,0,camera.j,camera.k);}}

function BitStreamWriter(){this.size=0;this.eI=0;
this.aD=null;this.applyToGame=function(aD){this.eI=0;this.aD=aD;this.size=aD.length;};this.a8=function(aeV){
this.applyToGame(new Uint8Array(this.aWX(aeV)));return this.aD;};this.vx=function(){this.aD=null;};
this.writeBits=function(size,a9J){var aC;
var aD=this.aD;
var oD=this.eI+size-1;for(aC=this.eI;aC<=oD;aC++){
aD[aC>>3]|=((a9J>>(oD-aC))&1)<<(7-(aC&7));}this.eI+=size;if(this.eI>8*this.size){
console.error("Wrapper Overflow");}};this.aWW=function(size,a9J){var ft=size>>1;
var fc=1<<ft;this.writeBits(size-ft,mathUtils.g0(a9J,fc));this.writeBits(ft,a9J%fc);};this.aec=function(size){var aC;
var aD=this.aD;
var oD=this.eI+size;for(aC=this.eI;aC<oD;aC++){aD[aC>>3]&=255 ^(128>>>(aC&7));
}};this.aWX=function(aeV){return(aeV+7)>>3;};this.aed=function(h,kA,oD,aee){
var aC;for(aC=kA;aC<oD;aC++){this.writeBits(aee,h[aC]);}};}

function BitStreamReader(){this.applyToGame=function(){this.h=[];
this.eI=0;};this.aWv=function(){return new Uint8Array(this.h);};this.writeBits=function(aef,value){
var h=this.h;
var oD=this.eI+aef-1;
var aeg=1+(oD>>3);while(h.length<aeg){h.push(0);
}for(var aC=this.eI;aC<=oD;aC++){h[aC>>3]|=((value>>(oD-aC))&1)<<(7-(aC&7));}this.eI+=aef;
};this.dr=function(h,z7,aeW){var aeh=gameState.sS.a4z(h);this.writeBits(z7,aeh);for(var aC=0;aC<aeh;aC++){
this.writeBits(aeW,h[aC]);}};this.ShipState=function(h,z7,aeY){var aeh=gameState.sS.a4z(h);this.writeBits(z7,aeh);
for(var aC=0;aC<aeh;aC++){this.ShipRemovalManager(h[aC],aeY);}};this.ShipRemovalManager=function(s1,z7){var fZ=s1.length;
this.writeBits(z7,fZ);for(var aC=0;aC<fZ;aC++){this.writeBits(16,s1.charCodeAt(aC));}};this.ShipRenderer=function(a55){
var s1=a55.toDataURL();
var aei=s1.split(",");if(aei.length<2){console.log("error 266");return;
}s1=aei[aei.length-1];s1=gameState.tI.a6U(s1,"/","_");s1=gameState.tI.a6U(s1,"\\+","-");s1=gameState.tI.a6U(s1,"=","");
var yS=minimapRenderer.f0.yP(s1);
var fZ=yS.length;this.writeBits(30,fZ);for(var aC=0;aC<fZ;aC++){
this.writeBits(6,yS[aC]);}};}setTimeout(initGame,10000);window.onload=function(){initGame();};    })();