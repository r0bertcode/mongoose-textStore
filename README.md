# mongoose-textStore

This library provides a class to store text-files or strings larger than 16MB into mongoDB via mongoose, was intended to store large JSON files or large encrypted strings without the need of gridFS.

The class operates by taking the string or reading the text from the file into a string, then takes that data and brakes it up into 'Chunk' documents ( The amount of chunks is based on the file/string size in bytes ), these chunks are stored into mongoDB alongside a 'File' document, that contains an array of inorder ObjectId's to the chunks that make up the complete data.

### Class TextStore:

- <b>addFile</b> | Store data from file into chunks in mongoDB

- <b>addString</b> | Store data from a string into chunks in mongoDB

- <b>getData</b> | Get data stored in a 'file' or group of chunks from mongoDB

- <b>deleteFile</b> | Delete data stored in a 'file' or group of chunks from mongoDB

### addFile(file, name, [ options])

---

- <b>file</b> ( String ): Relative path to file
- <b>name</b> ( String ): What to name the data in the TextStore
- <b>options</b> ( Object ):
  - <b>chunkSize</b> ( Number ): Amount in bytes for each 'chunk' document (<b>default</b>: 262144)
  - <b>encoding</b> ( String ): Encoding of the file (<b>default</b>: 'utf-8')
    - <b>(Valid Encodings)</b>: utf-8, ascii, base64, hex, ucs-2, binary, latin1

Adds a files data to mongoDB and returns the File doc, containing the objectIds of its chunks and the name it was saved under, will overwrite if another file document has the same name.

<b>Example usage:</b>
```
const textStore = require('mongoose-textStore);

( async () => {
  const fileDoc = await textStore.addFile('./largeFile.json', 'hexs');

  console.log(fileDoc);
  /*
    output:

    {
      _id: 60f665f0ebcf6b1dca6e1a0a,
      name: 'hexs',
      chunks: [ 60f665f0ebcf6b1dca6e1968,
      60f665f0ebcf6b1dca6e196a,
      ....... ~100 more ......,
      60f665f0ebcf6b1dca6e1a08 ],
    }
  */
})();
```

### addString(string, name, [ split])

---

- <b>string</b> ( String ): String to store

- <b>name</b> ( String ): What to name the data in the TextStore

- <b>split</b> ( Number ): Amount of chunks for the split (<b>default</b>: Will calculate based on bytes )

Adds a strings data to the mongoDB and returns the File doc, containing the objectIds of its chunks and the name it was saved under, will overwrite if another file document has the same name.

<b>Example usage:</b>
```
const textStore = require('mongoose-textStore);
const largeStr = '.....';
// largeStr.length === 1600000

( async () => {
  const fileDoc = await textStore.addString(largeStr, 'string');

  console.log(fileDoc);
  /*
    output:

    {
      _id: 60f66c9449a1531f576044f5,
      name: 'string',
      chunks: [ 60f66c9449a1531f576044e7,
      60f66c9449a1531f576044e9,
      60f66c9449a1531f576044eb,
      60f66c9449a1531f576044ed,
      60f66c9449a1531f576044ef,
      60f66c9449a1531f576044f1,
      60f66c9449a1531f576044f3 ],
    }
  */
})();
```

### getData(name)

---

- <b>name</b> ( String ): Name of the stored data in textStore

Retrieve text data from mongoDB via textStore.

<b>Example usage:</b>

```
( async () => {
  const fileDoc = await textStore.addFile('./largeFile.json', 'hexs');

  console.log(fileDoc);
  /*
    {
      _id: 60f665f0ebcf6b1dca6e1a0a,
      name: 'users',
      chunks: [ 60f665f0ebcf6b1dca6e1968,
      60f665f0ebcf6b1dca6e196a,
      ....... ~100 more ......,
      60f665f0ebcf6b1dca6e1a08 ],
    }
  */

  const fileData = await textStore.getData('hexs');
  console.log(JSON.parse(fileData));

  /*
    {
      .....,
      '82193':
      'e5dacef566f2e2f4f0de4728ab987a98e9e48918746056e55c0a7a4ef22f2d10c0c55adbccf521961e6cc75f114c75659ce93fd63edf345dc934e548c56bcfade778f01e66e865b9074884478edd26e881ee9b9dcc455566ae65a788c80546fffd01f1f5',
      '82194':
      'e4d644ad3db9b1ef221527f48733e58bbb272f25a9a2c1ee3e4966c566ddaf2ea762984b43d824c04d41513fffb84f1603ff1a1d495f94b20117277034ccf09057219d7357181d82077b0d1575333c51aa0f9e414ac5de8040c12d1d87dd5a6d7161fb6b',
      '82195':
      'd6a080852ed62ca67f848c8f72fedf4b40046c21c8e9d4c8876119557bbec0d30deddce9a7f55bf5b2d6f42627b364613da2a93a235ad9d21c5b298e1ebe65e4debc9f5fc6adee61e215b3e30190885b5a64425f120638c864b2f3ffeb8664518af0be07',
      .....,
    }
  */
})();
```

### deleteFile(name)

---

- <b>name</b> ( String ): Name of the stored data in textStore

Delete text data from mongoDB via textStore if a file document with the name exists.

<b>Example usage:</b>

```
( async () => {
  const fileDoc = await textStore.addFile('./largeFile.json', 'hexs');

  await textStore.deleteFile('hexs');

  const fileData = await textStore.getData('hexs');
  console.log(fileData);
  // output: 'File not found'

})();
```