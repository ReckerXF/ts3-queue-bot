# TS3 Queue Bot

The TS3 **Queue Bot** was originally developed for a Teamspeak 3 server I used to manage. This bot was deployed in a production environment. As the original creator of this bot, I have decided to open source it and allow everyone the opportunity to not only use it, but tinker with it in general. Please note that as per the GNU AGPL v3 license, any modifications aside from configuration files to this bot **must** be open sourced.

## Codebase

The Queue Bot was originally developed on Javascript and then was ported over to Typescript due to modularity and code cleanliness.

If you wish to make *any* edits, you must have Typescript installed via npm. See below for more information.

## Requirements
1. node.js v18
2. A redis7 server

## Setup

1. Clone the repo to your desired system.
2. Install node.js v18 if you haven't.
3. Install the Typescript package via npm. Run: ``npm install -g typescript``.
5. Create a .env file in the same directory that you cloned to (also the same directory as Config.ts) and do ``ENV=production`` or ``ENV=dev`` depending on the config area you want to use. (i.e. ENV=develop will pull all config values from the develop area of the config.
6. In a Linux or WSL terminal while in the directory of the repo, run ``npx tsc --build``. This will compile the code into the ``dist/`` folder.
7. Create a copy of the TS3 Server Admin group you have. In this copied group, disable ``b_channel_join_ignore_maxclients``.
8. Create a new TS3 Identity (Tools > Identities). Join the server on this new identity and give it your copied server admin role (the one you just made). Also, create a ServerQuery login. Use these credentials in the config.ts.
9. Set up a "Queue Channel". This will be the channel the bot connects to and the channel people can join to run commands.
10. Set up the channels for the various queues. In the channel that people will queue for, set your max client to whatever you desire and the max family clients to ``0``. Once the maximum amount of people are in the channel, they can use the queue bot to queue for the channel.
11. Make any desired edits to the codebase or to the ``Config.ts`` file.
12. Run with ``npm start`` or ``node dist/index.js``.
	> You can use PM2 to automate the script!
## Screenshots
![img](https://i.gyazo.com/31c0169684a6cb709c71017c034f7349.png)
![img](https://i.gyazo.com/f2898b85cf6bbd2cf7411c18fe545e82.png)
![img](https://i.gyazo.com/2b832202a1f64162c36081b24a93af0a.png)

## Questions?
Open an issue and I can help!

## Disclaimer
This bot was originally made for a gaming community, and has had extensive work done to make it more generalized for the Teamspeak 3 community. This open sourced version is completely untested. If you encounter any issues, please let me know.

## License

This software is licensed under [GNU AGPL v3](https://choosealicense.com/licenses/agpl-3.0/).
