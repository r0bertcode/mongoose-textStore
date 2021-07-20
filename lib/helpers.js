const { Chunk, File } = require('./models');
const mongoose = require('mongoose');
const fs = require('fs');

const chunkStr = (string, split) => {
  const chunkSize = Math.ceil(string.length / split);
  const chunks = [];

  let chunkIdx = 0;
  let idx = 0;
  let count = 0;

  while (idx < string.length) {
    if (!chunks[chunkIdx]) {
      chunks[chunkIdx] = [];
    }

    chunks[chunkIdx].push(string[idx]);
    idx++;
    count++;

    if (count === chunkSize) {
      count = 0;
      chunkIdx++;
    }
  }

  return chunks.map((el) => {
    return el.join('');
  });
};

const saveString = async (string, split, name) => {
  const chunks = chunkStr(string, split);
  const docs = [];
  const _ids = [];

  for (let i = 0; i < chunks.length; i++) {
    const newChunk = new Chunk({
      id: i,
      data: chunks[i],
    });

    const chunk = await newChunk.save();
    _ids.push(chunk._id.toString());
  }

  const newFile = new File({
    name,
    chunks: _ids,
  });
  const res = await newFile.save();

  return res;
};


const saveFile = async (fileLoc, name, options) => {
  const { chunkSize, encoding } = Object.assign({
    chunkSize: 262144,
    encoding: 'utf-8',
  }, options);

  const fileString = fs.readFileSync(fileLoc).toString(encoding);
  const split = Buffer.byteLength(fileString, encoding) / chunkSize;

  return saveString(fileString, split, name);
};

const getFileData = async (name) => {
  const file = await File.findOne({ name });

  if (file) {
    const chunks = await Chunk.find({ _id: { $in: file.chunks }});

    let masterString = '';
    let idx = 0;

    while (idx < chunks.length) {
      masterString += chunks[idx].data;
      idx++;
    }

    return masterString;
  }

  return 'File not found';
};

module.exports = {
  getFileData, saveFile, saveString,
};