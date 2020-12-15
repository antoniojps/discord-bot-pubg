# PUBG-PT

### What is this repository for? ###

This is the main discord bot repository.

### How do I get set up? ###

Don't be a crybaby: clone, install and run the commands

## How to run this app

1. Clone this repository: `git clone git@github.com:antoniojps/discord-bot-pubg.git`
2. `cd discord-bot-pubg`
3. `yarn install`
4. `yarn start`


## Available commands

  | Command          | Description  |
  |:-----------------|:-------------|
  | `yarn start`     | Create an optimized bundle and serve with the production server.  |

## Bot

This bot aims to be used in the PUBG PT discord community. The plan is to make a LFS system and automatic roles according to PUBG ranked games stats.


### Server installation
Add the bot the server, to do so visit the link: `https://discord.com/oauth2/authorize?client_id=BOT_CLIENT_ID&scope=bot`

### Available commands
  | Command          | Channel  | Description  |
  |:-----------------|:-------------|:-------------|
  | `lfs`     | `LFS_CHANNEL_ID`  | Creates a LFS embed |
  | `-`     | `LFS_CHANNEL_ID`  | Deletes the last LFS embed of the author |
  | `/link PUBG_NICKNAME`     | `ROLES_CHANNEL_ID`  | Assigns a pubg nickname to the author and roles according to stats |
  | `/update`     | `ROLES_CHANNEL_ID`  | Updates user pubg stats for users already linked |
  | `/restart`     | `ADMIN_CHANNEL_ID`  | Removes all rank roles (maintains stats), to be used in the beginning of a new season |

### Usage
The first thing a user must do is link their discord account to a pubg account by linking them, this will assign him roles according to stats and rank, once that's done he can join the rooms according to stats. He can also use the LFS channel with a more detailed embed.

### 1. Link
`/link PUBG_NAME`

This command will fetch the users stats directly from the PUBG API there's a minimum of 20 games required in order to provide the roles.

**Roles**
  | Role(s)          | Description  |
  |:-----------------|:-------------|
  | `Bronze`, `Silver`, `Gold`, `Platinum`, `Diamond`, `Master`  | Role according to rank.  |
  | `KD -0.5`, `KD +0.5`, `KD +1`, `KD +1.5`, `KD +2`, `KD +2.5`, `KD +3`, `KD +3.5`, `KD +4`, `KD +4.5`, `KD +5`  | Role according to KD. |
  | `-100 ADR`, `+100 ADR`, `+150 ADR`, `+200 ADR`, `+250 ADR`, `+300 ADR`, `+350 ADR`, `+400 ADR`, `+450 ADR`, `+500 ADR`  | Role according to ADR. |

### 2. Looking for someone
`lfs`

By typing `lfs` on the `looking-for-someone` channel the bot will create a LFS Embed, if someone reacts with a `✉️` it will send a PM to the author of the `lfs` with the request, the author can accept or decline the request and the interested party will be notified with a PM.