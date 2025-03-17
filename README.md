# TS3 Queue Bot

The Queue Bot was originally developed by myself on Javascript for a FiveM gaming community with the purpose of making it so users could queue to join a server's radio traffic channel - as frequently said channel would be full. After a month or so post release, the bot was ported over to Typescript as the bot demanded more modularity and a more established base structure. There's also the added bonus that I've never worked with Typescript prior to this, so a learning experience was a bonus.

During production, this bot served hundreds of Redis queries daily, managing up to 6 channel queues for a community of over 1,000 individuals.

## Why Redis?
Redis was selected to be used as a database due to its fast, in-memory storage capabilities and the fact that it functions as a key-value pair database - making it super easy to store and retrieve sets of data without the traditional longer waiting times of relational databases and without requiring larger servers to dedicate resources to it. You can read more about Redis [here](https://redis.io/about/).

## Requirements
1. node.js v18
2. A redis7 server

## Setup

1. Clone the repo to your desired system.
2. Install node.js v18 if you haven't.
3. Install the Typescript package via npm. Run: ``npm install -g typescript``.
4. Install all node packages. Run ``npm install`` in the bot's directory.
5. Create a .env file in the same directory that you cloned to (also the same directory as Config.ts) and do ``ENV=production`` or ``ENV=dev`` depending on the config area you want to use. (i.e. ENV=develop will pull all config values from the develop area of the config.
6. In a Linux or WSL terminal while in the directory of the repo, run ``npx tsc --build``. This will compile the code into the ``dist/`` folder.
7. Create a copy of the TS3 Server Admin group you have. In this copied group, disable ``b_channel_join_ignore_maxclients``.
8. Create a new TS3 Identity (Tools > Identities). Join the server on this new identity and give it your copied server admin role (the one you just made). Also, create a ServerQuery login. Use these credentials in the config.ts.
9. Set up a "Queue Channel". This will be the channel the bot connects to and the channel people can join to run commands.
10. Set up the channels for the various queues. In the channel that people will queue for, set your max client to whatever you desire and the max family clients to ``unlimited``. Once the maximum amount of people are in the channel, they can use the queue bot to queue for the channel.
11. Make any desired edits to the codebase or to the ``Config.ts`` file.
12. Run with ``npm start`` or ``node dist/index.js``.
	> You can use PM2 to automate the script!

## Known Issue
The Teamspeak 3 serverquery is known to block a certain amount of commands in a specified time. You may need to increase the flood limit.

To do this, login to your serverquery and run these commands:

``instanceedit serverinstance_serverquery_flood_commands=50``

``instanceedit serverinstance_serverquery_flood_time=3``

Feel free to change the numbers as needed.

## Screenshots
![img](https://i.gyazo.com/31c0169684a6cb709c71017c034f7349.png)
![img](https://i.gyazo.com/f2898b85cf6bbd2cf7411c18fe545e82.png)
![img](https://i.gyazo.com/2b832202a1f64162c36081b24a93af0a.png)

## Questions?
Open an issue and I can help!

## Disclaimer
This bot was originally made for a gaming community, and has had extensive work done to make it more generalized for the Teamspeak 3 community. This open sourced version has minimal testing, but please do open an issue if you find any bugs!

## License

This software is licensed under [GNU AGPL v3](https://choosealicense.com/licenses/agpl-3.0/).
