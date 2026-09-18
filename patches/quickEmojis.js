import { definePatch } from "../modUtils.js"

export default definePatch(({ insertCode, replaceRawCode, matchRawCode, matchCode }) => {

  matchCode(`ctx.drawImage(emojiHolder.emojiPicker.emojiTiles[pl - 1024 + emojiHolder.data.tileCount], 0, 0)`,
    { addToDictionary: ["emojiHolder", "emojiPicker", "emojiTiles"] })

  insertCode(
    `this.zw = 676; /* here */`,
    `__fx.quickEmojis = __fx.quickEmojis || {}; __fx.quickEmojis.emojiList = this.emojis; __fx.quickEmojis.emojiBaseCode = this.zw;`
  )

  insertCode(
    `var zx = ak.sI.zy(bN.zx); /* here */`,
    `__fx.quickEmojis = __fx.quickEmojis || {}; __fx.quickEmojis.realFlagCodes = zx.slice();`
  )

  // dont let sending emojis reshuffle the custom picks
  const { quickEmojiSlots } = replaceRawCode(
    `function a01(pl){var aC;for(aC=0;aC<9;aC++){quickEmojiSlots[aC].kZ=Math.floor(quickEmojiSlots[aC].kZ*.99)}`,
    `function a01(pl){if(__fx.settings.customQuickEmojisEnabled)return;var aC;for(aC=0;aC<9;aC++){quickEmojiSlots[aC].kZ=Math.floor(quickEmojiSlots[aC].kZ*.99)}`
  )

  const { emojiCodeField, usageCountField } = matchRawCode(
    `var val1=parseInt(arr[idx]);val1=val1>=0&&val1<container.mid.threshold?val1:0;var val2=parseInt(arr[idx+9]);val2=val2>=0&&val2<1e3?val2:0;quickEmojiSlots[idx]={emojiCodeField:val1,usageCountField:val2}`,
    { quickEmojiSlots }
  )

  replaceRawCode(
    `function zz(){var aC;var qj=bm.eU.data[120].value;var h=qj.split(",");if(h.length!==18){`,
    `function zz(){if(__fx.settings.customQuickEmojisEnabled&&__fx.settings.customQuickEmojis&&9===__fx.settings.customQuickEmojis.length){for(var q=0;q<9;q++){var qcode=parseInt(__fx.settings.customQuickEmojis[q],10);quickEmojiSlots[q]={emojiCodeField:isNaN(qcode)?1015+q:qcode,usageCountField:0};}return;}var aC;var qj=bm.eU.data[120].value;var h=qj.split(",");if(h.length!==18){`,
    { quickEmojiSlots, emojiCodeField, usageCountField }
  )
})
