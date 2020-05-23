const express = require('express');
const axios = require('axios');
const router = express.Router();

const data = {
  version: null,
  downloads: {},
  extensions: {},
  discordUserCount: null,
  patreonCount: null,
};

/* GET home page. */
router.get('/all', (req, res) => { res.send(data) });
router.get('/version', (req, res) => { res.send(data.version) });
router.get('/downloads', (req, res) => { res.send(data.downloads) });
router.get('/extensions', (req, res) => { res.send(data.extensions) });
router.get('/discord-count', (req, res) => { res.send(data.discordUserCount) });
router.get('/patreon-count', (req, res) => { res.send(data.patreonCount) });

async function getData() {
  await getJenkinsData();
  await getDiscordUserCount();
  await getPatreonCount();
}

getData().then(() => {
  setInterval(async () => {
    await getData();
  }, 60000);
});

async function getJenkinsData() {
  try {
    // Get LuckPerms files and version data
    const jenkinsData = await axios.get('https://ci.lucko.me/job/LuckPerms/lastSuccessfulBuild/api/json?tree=url,artifacts[fileName,relativePath]');
    const fileName = jenkinsData.data.artifacts[0].fileName;
    data.version = fileName.split('-').pop().slice(0, -4);
    jenkinsData.data.artifacts.forEach((artifact) => {
      const download = artifact.relativePath.split('/')[0];
      data.downloads[download] = `${jenkinsData.data.url}artifact/${artifact.relativePath}`;
    });

    // Get extensions
    const extensionIds = [
        'extension-legacy-api',
        'extension-default-assignments',
    ];
    extensionIds.forEach((extensionId) => {
      getExtensionData(extensionId);
    });
  } catch (error) {
    console.error(error);
  }
}

async function getExtensionData(extensionId) {
  try {
    const extensionData = await axios.get(`https://ci.lucko.me/job/${extensionId}/lastSuccessfulBuild/api/json?tree=url,artifacts[fileName,relativePath]`);
    extensionData.data.artifacts.forEach((artifact) => {
      const extension = `${extensionData.data.url.split('/')[4]}`;
      data.extensions[extension] = `${extensionData.data.url}artifact/${artifact.relativePath}`;
    });
  } catch (error) {
    console.error(error);
  }
}

async function getDiscordUserCount() {
  try {
    const discordData = await axios.get('https://discordapp.com/api/invites/luckperms?with_counts=true');
    data.discordUserCount = discordData.data.approximate_member_count;
  } catch (error) {
    console.error('getDiscordUserCount error:', error.response.status, error.response.statusText);
  }
}

async function getPatreonCount() {
  try {
    const patreonData = await axios.get('https://www.patreon.com/api/campaigns/2298876?include=patron_count&fields[campaign]=patron_count');
    data.patreonCount = patreonData.data.data.attributes.patron_count;
  } catch (error) {
    console.error(error);
  }
}

module.exports = router;
