const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const config = require('../config.json');
const data = require('./data');

router.get('/:localeId', (req, res) => {
  const localeId = req.params.localeId;
  const language = data.translations.languages[localeId];
  if (!language) {
    res.status(404).send('No such language');
  } else if (language.progress === 0) {
    res.status(400).send('No strings have been translated for ' + language.name);
  } else {
    res.sendFile(`${language.localeTag}.properties`, {
      root: path.resolve(__dirname, '../translations'),
      dotfiles: 'deny',
      maxAge: 3600000,
      headers: {
        'Content-Disposition': `attachment; filename="${language.localeTag}.properties"`,
        'Content-Type': 'text/x-java-properties'
      }
    })
  }
});

getData().then(() => {
  setInterval(async () => {
    await getTranslations();
  }, 3660000); // 1 hours (+ 1 minute, to make sure we are behind the getTranslationData task)
});

async function getData() {
  await data.setup;
  console.log("Downloading translations..");
  await getTranslations();
  console.log(".. done");
}

async function getTranslations() {
  try {
    if (!fs.existsSync("./translations")){
      fs.mkdirSync("./translations");
    } 

    for (const [languageId, language] of Object.entries(data.translations.languages)) {
      if (language.progress !== 0) {
        const body = {
          targetLanguageId: languageId,
          fileIds: [2],
          skipUntranslatedStrings: true
        };
        const request = await axios.post('https://crowdin.com/api/v2/projects/404960/translations/exports', body, {
          headers: {
            'Authorization': `Bearer ${config.crowdinKey}`
          }
        });

        const url = request.data.data.url;
        const downloadRequest = await axios.get(url, {responseType: 'stream'});

        const fileStream = fs.createWriteStream(`./translations/${language.localeTag}.properties`);
        downloadRequest.data.pipe(fileStream);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  router: router
};
