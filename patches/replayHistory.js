import { definePatch } from "../modUtils.js"

export default definePatch(({ replaceRawCode, matchCode, insertCode }) => {
  // keep a rolling history of last 5 replays.
  // using replaceRawCode since minification removes a semi colon before the closing brace
  // so it does not match with replaceCode or insertCode
  replaceRawCode(
    `this.a5h=bC.a5u.a0a()}else{this.a5h=bC.qM.a5t}b1.z.a5v();bt.clear();this.a18=0;bi.a5w();`,
    `this.a5h=bC.a5u.a0a();__fx.replayHistory.save(this.a5h);}else{this.a5h=bC.qM.a5t}b1.z.a5v();bt.clear();this.a18=0;bi.a5w();`
  )
// holy ai ^^
  const { protocol, stripPrefix, parser, parseReplay, watchReplay } = matchCode(`
    function watchInput() {
      menuSystem.closeMenu();
      var input = protocol.stripPrefix(textArea.getText());
      if (game.gameState && input.length > 0 && input === protocol.recorder.replayData) {
        protocol.watchReplay();
        return;
      }
      if (!protocol.parser.parseReplay(input)) {
        return;
      }
      protocol.watchReplay();
    }`)

  insertCode(`
    this.stripPrefix = function(text) {
      var index = text.indexOf("=");
      if (index >= 0) {
        return text.substring(index + 1);
      }
      return text;
    };
    this.encode = function(text) {
      return text;
    };
    /* here */`,
    `__fx.replayHistory.load = (saved) => {
      saved = ${protocol}.${stripPrefix}(saved);
      if (${protocol}.${parser}.${parseReplay}(saved)) ${protocol}.${watchReplay}();
    };`)
})
