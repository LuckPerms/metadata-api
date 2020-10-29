const express = require('express');
const axios = require('axios');
const router = express.Router();
const config = require('../config.json');
const extraDonors = require('../extra-donors.json');

const data = {
  version: null,
  versionTimestamp: null,
  changeLog: [],
  downloads: {},
  extensions: {},
  additionalPlugins: {},
  placeholderExpansions: {},
  discordUserCount: null,
  patreonCount: null,
};

const translations = {
  languages: {}
};

const donors = {
  donors: []
};

router.get('/all', (req, res) => { res.send(data) });
router.get('/version', (req, res) => { res.send({ version: data.version, versionTimestamp: data.versionTimestamp }) });
router.get('/changelog', (req, res) => { res.send({ changeLog: data.changeLog }) });
router.get('/downloads', (req, res) => { res.send({ downloads: data.downloads }) });
router.get('/extensions', (req, res) => { res.send({ extensions: data.extensions }) });
router.get('/additional-plugins', (req, res) => { res.send({ additionalPlugins: data.additionalPlugins }) });
router.get('/placeholder-expansions', (req, res) => { res.send({ placeholderExpansions: data.placeholderExpansions }) });
router.get('/discord-count', (req, res) => { res.send({ discordUserCount: data.discordUserCount }) });
router.get('/patreon-count', (req, res) => { res.send({ patreonCount: data.patreonCount }) });
router.get('/translations', (req, res) => { res.send(translations) });
router.get('/donors', (req, res) => { res.send(donors) });

const setupPromise = getData().then(() => {
  setInterval(async () => {
    await getJenkinsData();
  }, 30000); // 30 seconds
  setInterval(async () => {
    await getDiscordUserCount();
    await getPatreonCount();
  }, 300000); // 5 minutes
  setInterval(async () => {
    await getPatreons();
  }, 3600000); // 1 hour
  setInterval(async () => {
    await getTranslationData();
  }, 21600000); // 6 hours
});

async function getData() {
  console.log("Requesting initial data..");
  await Promise.all([
    getJenkinsData(),
    getDiscordUserCount(),
    getPatreonCount(),
    getPatreons(),
    getTranslationData()
  ]);
  console.log(".. done");
}

async function getJenkinsData() {
  try {
    // Get LuckPerms files and version data
    const jenkinsData = await axios.get('https://ci.lucko.me/job/LuckPerms/lastSuccessfulBuild/api/json?tree=url,timestamp,artifacts[fileName,relativePath]');
    const fileName = jenkinsData.data.artifacts[0].fileName;
    data.version = fileName.split('-').pop().slice(0, -4);
    data.versionTimestamp = jenkinsData.data.timestamp;
    jenkinsData.data.artifacts.forEach((artifact) => {
      const download = artifact.relativePath.split('/')[0];
      data.downloads[download] = `${jenkinsData.data.url}artifact/${artifact.relativePath}`;
    });

    // Get changelog
    const changeLogData = await axios.get('https://ci.lucko.me/job/LuckPerms/api/json?tree=builds[timestamp,result,artifacts[fileName],changeSet[items[msg,commitId]]]');
    const log = [];
    changeLogData.data.builds.forEach((buildData) => {
      if (buildData.result === 'SUCCESS' && buildData.changeSet && buildData.changeSet._class === 'hudson.plugins.git.GitChangeSet') {
        log.push({
          version: buildData.artifacts[0].fileName.split('-').pop().slice(0, -4),
          timestamp: buildData.timestamp,
          title: buildData.changeSet.items.msg,
          commit: buildData.changeSet.items.commitId
        });
      }
    });
    data.changeLog = log;

    // Get placeholder expansions
    const placeholderData = await axios.get('https://ci.lucko.me/job/LuckPermsPlaceholders/lastSuccessfulBuild/api/json?tree=url,artifacts[fileName,relativePath]');
    placeholderData.data.artifacts.forEach((artifact) => {
      const download = artifact.relativePath.split('/')[0];
      data.placeholderExpansions[download] = `${placeholderData.data.url}artifact/${artifact.relativePath}`;
    });

    // Get extensions
    const extensionIds = [
        'extension-legacy-api',
        'extension-default-assignments',
    ];
    extensionIds.forEach((extensionId) => {
      getExtensionData(extensionId);
    });

    // Get additional plugins
    const additionalPluginIds = [
      'extracontexts',
    ];
    additionalPluginIds.forEach((additionalPluginId) => {
      getAdditionalPluginData(additionalPluginId);
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

async function getAdditionalPluginData(additionalPluginId) {
  try {
    const additionalPluginData = await axios.get(`https://ci.lucko.me/job/${additionalPluginId}/lastSuccessfulBuild/api/json?tree=url,artifacts[fileName,relativePath]`);
    additionalPluginData.data.artifacts.forEach((artifact) => {
      const additionalPlugin = `${additionalPluginData.data.url.split('/')[4]}`;
      data.additionalPlugins[additionalPlugin] = `${additionalPluginData.data.url}artifact/${artifact.relativePath}`;
    });
  } catch (error) {
    console.error(error);
  }
}

async function getDiscordUserCount() {
  try {
    const discordData = await axios.get('https://discord.com/api/invites/luckperms?with_counts=true');
    data.discordUserCount = discordData.data.approximate_member_count;
  } catch (error) {
    console.error('getDiscordUserCount error:', error.response.status, error.response.statusText);
  }
}

function encodePatreonUrl(url) {
  return url.replace("")
}

function encodePatreonUrl(url) {
  return url.replace(/[\[\]]/g, function(a) {
      return {
          '[': '%5B',
          ']': '%5D'
      }[a];
  });
}

async function getPatreonCount() {
  try {
    const patreonData = await axios.get(encodePatreonUrl('https://www.patreon.com/api/oauth2/v2/campaigns/2298876?fields%5Bcampaign%5D=patron_count'), {
      headers: {
        'Authorization': `Bearer ${config.patreonKey}` 
      }
    });
    data.patreonCount = patreonData.data.data.attributes.patron_count;
  } catch (error) {
    console.error(error);
  }
}

async function getPatreons() {
  try {
    let url = encodePatreonUrl('https://www.patreon.com/api/oauth2/v2/campaigns/2298876/members?include=user,currently_entitled_tiers&fields[member]=full_name,lifetime_support_cents&fields[user]=social_connections,hide_pledges&fields[tier]=title');
    let result = [];

    if (extraDonors) {
      result.push(...extraDonors);
    }

    while (url !== null) {
      const patreonsData = await axios.get(url, {headers: {'Authorization': `Bearer ${config.patreonKey}`}});
      
      const associatedUsers = {};
      const associatedTiers = {};

      patreonsData.data.included.forEach((includedData) => {
        if (includedData.type === 'user') {
          let userData = {
            id: includedData.id,
            hide: includedData.attributes.hide_pledges
          };
          if (includedData.attributes.social_connections) {
            userData.discord = includedData.attributes.social_connections.discord;
          }
          associatedUsers[includedData.id] = userData;
        } else if (includedData.type === 'tier') {
          associatedTiers[includedData.id] = {
            id: includedData.id,
            name: includedData.attributes.title
          };
        }
      });

      patreonsData.data.data.forEach((patreonData => {
        const username = patreonData.attributes.full_name.trim();
        const amount = patreonData.attributes.lifetime_support_cents;

        // exclude anything under $5
        if (amount < 500) {
          return;
        }

        let userResult = {
          name: username,
          discord: null,
          tiers: []
        };

        const userId = patreonData.relationships.user.data.id;
        if (userId in associatedUsers){
          const user = associatedUsers[userId];

          // respect users choice to make their pledge hidden
          if (user.hide) {
            return;
          }

          if (user.discord && user.discord.user_id) {
            userResult.discord = user.discord.user_id;
          }
        }

        patreonData.relationships.currently_entitled_tiers.data.forEach((tierInfo) => {
          if (tierInfo.id in associatedTiers) {
            userResult.tiers.push(associatedTiers[tierInfo.id].name);
          }
        });
        
        result.push(userResult);
      }));

      if (patreonsData.data.links && patreonsData.data.links.next) {
        url = patreonsData.data.links.next;
      } else {
        url = null;
      }
    }

    donors.donors = result;

  } catch (error) {
    console.error(error);
  }
}

async function getTranslationData() {
  try {
    const result = {};

    const projectData = await axios.get('https://crowdin.com/api/v2/projects/404960', {
      headers: {
        'Authorization': `Bearer ${config.crowdinKey}`
      }
    });
    const languages = projectData.data.data.targetLanguages;
    languages.forEach((language) => {
      result[language.id] = {
        name: language.name,
        localeTag: language.locale.replace("-", "_"),
        progress: 0,
        contributors: []
      }
    });

    const progressData = await axios.get('https://crowdin.com/api/v2/projects/404960/languages/progress', {
      headers: {
        'Authorization': `Bearer ${config.crowdinKey}` 
      }
    });
    progressData.data.data.forEach((progress) => {
      const id = progress.data.languageId;
      const percent = progress.data.translationProgress;

      const language = result[id];
      if (language !== null) {
        language.progress = percent;
      }
    });

    const contributorsRequest = await axios.post(
      'https://crowdin.com/api/v2/projects/404960/reports',
      {
        name: 'top-members',
        schema: {
          unit: 'strings',
          format: 'json'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${config.crowdinKey}`
        }
      }
    );
    const contributorsRequestId = contributorsRequest.data.data.identifier;

    let waiting = true;
    while (waiting) {
      const statusRequest = await axios.get(`https://crowdin.com/api/v2/projects/404960/reports/${contributorsRequestId}`, {
        headers: {
          'Authorization': `Bearer ${config.crowdinKey}` 
        }
      });
      waiting = statusRequest.data.data.status !== "finished";

      if (waiting) {
        // wait a couple of seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const downloadRequest = await axios.get(`https://crowdin.com/api/v2/projects/404960/reports/${contributorsRequestId}/download`, {
      headers: {
        'Authorization': `Bearer ${config.crowdinKey}` 
      }
    });
    const reportUrl = downloadRequest.data.data.url;

    const contributorsReport = await axios.get(reportUrl);
    contributorsReport.data.data.forEach((user) => {
      if (user.translated >= 30) {
        user.languages.forEach((lang) => {
          const language = result[lang.id];
          if (language !== null) {
            language.contributors.push({name: user.user.username, translated: user.translated});
          }
        });
      }
    });

    translations.languages = result;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  router: router,
  translations: translations,
  setup: setupPromise
};
