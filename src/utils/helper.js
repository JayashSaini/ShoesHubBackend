const fs = require('fs');

const getMongoosePaginationOptions = ({
  page = 1,
  limit = 10,
  customLabels,
}) => {
  return {
    page: Math.max(page, 1),
    limit: Math.max(limit, 1),
    pagination: true,
    customLabels: {
      pagingCounter: 'serialNumberStartFrom',
      ...customLabels,
    },
  };
};

const getLocalPath = (fileName) => {
  return `public/images/${fileName}`;
};

const removeLocalFile = (localPath) => {
  fs.unlink(localPath, (err) => {
    if (err) console.log('Error while removing local files: ', err);
  });
};

const removeUnusedMulterImageFilesOnError = (req) => {
  try {
    const multerFile = req.file;
    const multerFiles = req.files;

    if (multerFile) {
      // If there is file uploaded and there is validation error
      // We want to remove that file
      removeLocalFile(multerFile.path);
    }

    if (multerFiles) {
      const filesValueArray = Object.values(multerFiles);
      filesValueArray.map((fileFields) => {
        fileFields.map((fileObject) => {
          removeLocalFile(fileObject.path);
        });
      });
    }
  } catch (error) {
    // fail silently
    console.log('Error while removing image files: ', error);
  }
};

module.exports = {
  getMongoosePaginationOptions,
  removeLocalFile,
  removeUnusedMulterImageFilesOnError,
  getLocalPath,
};
