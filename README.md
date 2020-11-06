# metadata-api

A HTTP API which collects and serves various information about the LuckPerms project.

The base URL is https://metadata.luckperms.net/

Data is periodically collected from various other APIs (Jenkins, Discord, Patreon, Crowdin), then cached and served according to the routes listed below.

You can append the `?pretty` query parameter to get nicely formatted JSON from any of the supported routes. Otherwise, the JSON output is compacted.



## Routes

>  **Warning:** The API spec is subject to breaking changes at any time



### GET `/data/all`

Gets all metadata about the project (combines the data from all subroutes listed below)

#### Response (success, `200`, `application/json`)

```json
{
  "version": "...",
  "versionTimestamp": 0,
  "changeLog": [ ],
  "downloads": { },
  "extensions": { },
  "additionalPlugins": { },
  "placeholderExpansions": { },
  "discordUserCount": 0,
  "patreonCount": 0
}
```

> see below for example data

#### Response (error, `500`)

```
<error message>
```

#### Sub routes

##### GET `/data/version`

Gets the latest version of the plugin, and the timestamp at which it was built.

```json
{
  "version": "5.2.17",
  "versionTimestamp": 1603881787470
}
```

##### GET `/data/changelog`

Gets the changelog for the most recent versions (currently last 10).

```json
{
  "changeLog": [
    {
      "version": "5.2.17",
      "timestamp": 1603881787470,
      "title": "Make storage meta keys translatable",
      "commit": "15d3000fc1028139c1a1ff84aa676b63ab8eb28a"
    },
    {
      "version": "5.2.16",
      "timestamp": 1603633177757,
      "title": "Implement localisation for displaying durations",
      "commit": "ad174742e93a8cc8207b7cd311785448d9bd5762"
    }
  ]
}
```

##### GET `/data/downloads`

Gets the direct download URLs for the latest version.

```json
{
  "downloads": {
    "bukkit": "https://ci.lucko.me/job/LuckPerms/1188/artifact/bukkit/build/libs/LuckPerms-Bukkit-5.2.23.jar",
    "bukkit-legacy": "https://ci.lucko.me/job/LuckPerms/1188/artifact/bukkit-legacy/build/libs/LuckPerms-Bukkit-Legacy-5.2.23.jar",
    "bungee": "https://ci.lucko.me/job/LuckPerms/1188/artifact/bungee/build/libs/LuckPerms-Bungee-5.2.23.jar",
    "nukkit": "https://ci.lucko.me/job/LuckPerms/1188/artifact/nukkit/build/libs/LuckPerms-Nukkit-5.2.23.jar",
    "sponge": "https://ci.lucko.me/job/LuckPerms/1188/artifact/sponge/build/libs/LuckPerms-Sponge-5.2.23.jar",
    "velocity": "https://ci.lucko.me/job/LuckPerms/1188/artifact/velocity/build/libs/LuckPerms-Velocity-5.2.23.jar"
  }
}
```

##### GET `/data/extensions`

Gets the direct download URLs for the latest version of each of the official expansions.

```json
{
  "extensions": {
    "extension-legacy-api": "https://ci.lucko.me/job/extension-legacy-api/9/artifact/build/libs/extension-legacy-api-1.0.0.jar",
    "extension-default-assignments": "https://ci.lucko.me/job/extension-default-assignments/5/artifact/build/libs/extension-default-assignments-1.1.0.jar"
  }
}
```

##### GET `/data/additional-plugins`

Gets the direct download URLs for the latest version of each of the additional plugins released for the project.

```json
{
  "additionalPlugins": {
    "extracontexts": "https://ci.lucko.me/job/extracontexts/14/artifact/target/ExtraContexts.jar"
  }
}
```

##### GET `/data/placeholder-expansions`

Gets the direct download URLs for the latest version of each of the Placeholder expansions for the project.

```json
{
  "placeholderExpansions": {
    "luckperms-mvdw-hook": "https://ci.lucko.me/job/LuckPermsPlaceholders/22/artifact/luckperms-mvdw-hook/target/LuckPermsMVdWHook.jar",
    "luckperms-papi-expansion": "https://ci.lucko.me/job/LuckPermsPlaceholders/22/artifact/luckperms-papi-expansion/target/Expansion-LuckPerms.jar"
  }
}
```

##### GET `/data/discord-count`

Gets the current number of users on the LuckPerms Discord server.

```json
{
  "discordUserCount": 10439
}
```

##### GET `/data/patreon-count`

Gets the current number of people subscribed to @lucko's Patreon.

```json
{
  "patreonCount": 35
}
```

---

### GET `/data/translations`

Gets information about the available translations for the plugin.

#### Response (success, `200`, `application/json`)

```json
{
  "languages": {
    "es-ES": {
      "name": "Spanish",
      "localeTag": "es_ES",
      "progress": 100,
      "contributors": [
        {
          "name": "Example User 1",
          "translated": 614
        },
        {
          "name": "Example User 2",
          "translated": 557
        }
      ]
    }
  }
}
```

* The "key" of the inner objects refers to the locale ID. This is what is used to request the translation bundle.
* `progress` is a value between `0` and `100`, indicating the translation coverage percent.

#### Response (error, `500`)

```
<error message>
```

---

### GET `/data/donors`

Gets information about the projects donors.

#### Response (success, `200`, `application/json`)

```json
{
  "donors": [
    {
      "name": "Sample",
      "discord": 253217226783940124,
      "tiers": [
        "Patron"
      ]
    }
  ]
}
```

* `discord` refers to the users Discord snowflake ID - can be null.
* `tiers` refers to the Patreon tiers the user currently has - can be empty.

#### Response (error, `500`)

```
<error message>
```

---

### GET `/translation/<id>`

Gets a translation bundle file.

The available translations and their corresponding IDs can be obtained from `/data/translations`.

#### Response (success, `200`, `text/x-java-properties`)

```properties
luckperms.logs.actionlog-prefix=REGISTRO
luckperms.logs.verbose-prefix=VB
luckperms.logs.export-prefix=EXPORTAR
...
```

* `discord` refers to the users Discord snowflake ID - can be null.
* `tiers` refers to the Patreon tiers the user currently has - can be empty.

#### Response (error, `500`)

```
<error message>
```
