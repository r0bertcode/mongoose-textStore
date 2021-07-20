const { File, Chunk } = require('./models');
const { getFileData, saveFile, saveString } = require('./helpers');
const fs = require('fs');

const TextStore = function() {
  this.chunkSize = 262144;
};

TextStore.prototype.addFile = async function(file, name, options) {
  await this.deleteFile(name);
  const res = await saveFile(file, name, options);

  return res;
};

TextStore.prototype.addString = async function(string, name, split) {
  if (!split) {
    split = Buffer.byteLength(string) / this.chunkSize;
  }

  await this.deleteFile(name);
  const res = await saveString(string, split, name);

  return res;
};

TextStore.prototype.getData = async function(name) {
  const res = await getFileData(name);

  return res;
};

TextStore.prototype.deleteFile = async function(name) {
  const file = await File.findOne({ name });

  if (file) {
    await Chunk.deleteMany({ _id: { $in: file.chunks }});
    await File.deleteOne({ name });
  }
};

module.exports = new TextStore();
