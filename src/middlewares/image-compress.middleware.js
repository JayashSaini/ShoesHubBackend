const sharp = require("sharp");
const { removeLocalFile } = require("../utils/helper.js");

async function compressImage(inputPath, fileName, fileFormat) {
  return new Promise((resolve, reject) => {
    sharp(inputPath)
      .resize({ width: 800 })
      .toFile(fileName + "-compressed" + fileFormat, (err, info) => {
        if (err) {
          reject(err);
        } else {
          resolve(fileName + "-compressed" + fileFormat);
        }
      });
  });
}

const compressImages = async (req, res, next) => {
  if (req.files?.mainImage) {
    const file = req.files.mainImage[0];

    const { path } = file;
    const dotIndex = path.lastIndexOf(".");

    const fileName = path.substring(0, dotIndex);
    const fileFormat = path.substring(dotIndex).toLowerCase();

    try {
      const compressedFilePath = await compressImage(
        path,
        fileName,
        fileFormat
      );
      removeLocalFile(path, false);
      req.files.mainImage[0].path = compressedFilePath;
    } catch (err) {
      removeLocalFile(path, false);
      return next(err);
    }
  }

  if (req.files?.subImages) {
    const subImages = req.files.subImages;

    for (let i = 0; i < subImages.length; i++) {
      const file = subImages[i];

      const { path } = file;
      const dotIndex = path.lastIndexOf(".");

      const fileName = path.substring(0, dotIndex);
      const fileFormat = path.substring(dotIndex);

      const compressedFilePath = await compressImage(
        path,
        fileName,
        fileFormat
      );
      removeLocalFile(path, false);
      req.files.subImages[i].path = compressedFilePath;
    }
  }
  next();
};

module.exports = { compressImages };
