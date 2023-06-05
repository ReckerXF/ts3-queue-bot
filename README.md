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
4. Make any desired edits to the codebase or to the ``Config.ts`` file.
5. Create a .env file and do ``ENV=production`` or ``ENV=develop`` depending on the config area you want to use. (i.e. ENV=develop will pull all config values from the develop area of the config.
6. In a Linux or WSL terminal while in the directory of the repo, run ``npx tsc --build``. This will compile the code into the ``dist/`` folder.
7. Run with ``npm start`` or ``node dist/index.js``.
	> You can use PM2 to automate the script!

## Questions?
Open an issue and I can help!

## Disclaimer
This bot was originally made for a gaming community, and has had extensive work done to make it more generalized for the Teamspeak 3 community. This open sourced version is completely untested. If you encounter any issues, please let me know.

## License

This software is licensed under [GNU AGPL v3](https://choosealicense.com/licenses/agpl-3.0/).
