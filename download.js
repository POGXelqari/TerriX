import https from 'https';
import fs from 'fs';

const downloadGame = () => new Promise(resolve => {
  if (!fs.existsSync("./game")) fs.mkdirSync("./game");
  const file = fs.createWriteStream("./game/latest.html");
  console.log("Downloading upstream territorial.io script...");
  const request = https.get("https://territorial.io", function (response) {
    response.pipe(file);
    file.on("finish", () => {
      file.close();
      console.log("Download Completed [downloaded to ./game/latest.html]");
      fs.readFile('./game/latest.html', 'utf8', function (err, data) {
        if (err) throw err;
        const scriptContent = data.substring(
          data.indexOf("<script>") + "<script>".length,
          data.indexOf("</script>")
        );
        fs.writeFileSync("./game/latest.js", scriptContent.replace(/\r?\n|\r/g, ""));
        console.log("Wrote script to ./game/latest.js");
        resolve();
      });
    });
  });
});

export default downloadGame;
