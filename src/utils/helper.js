const fs = require("fs");

function getLocalPath(fileName) {
  return `public/images/${fileName}`;
}

function removeLocalFile(localPath, isLocalPath = true) {
  if (typeof localPath === "string") {
    if (isLocalPath) {
      localPath = getLocalPath(localPath);
    }

    fs.unlinkSync(localPath, (err) => {
      if (err) console.log("Error while removing local files: ", err);
    });
  }
}

module.exports = { getLocalPath, removeLocalFile };