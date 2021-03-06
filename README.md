## KaufmanBot

A simple bot for Telegram, example: [KaufmanBot](https://telegram.me/KaufmanBot)

### Usage
- clone or fork repository `git clone https://github.com/EndyKaufman/kaufman-bot.git`
- make sure you have [node.js](https://nodejs.org/) installed version 6+
- make sure you have NPM installed version 3+
- run `npm install` to install project dependencies
- copy `_env` to `.env` and set environments for use
- run `npm start` to fire up prod server

### Build
- run `npm run build` to build application

### Plugins
- `api-ai` - Simple usage https://api.ai service with default agent
- `wiki` - Get basic information of word from https://www.wikipedia.org/
- `scraper` - Scraping content segment from remote site with css selector
- `scraper:ping` - Scraping ping results for request to site or ip, site for scraping: http://2whois.ru

### Run on dev mode
- run `npm run watch`

### Run plugin standalone
- run `node ./bin/kaufman-bot -p -m "Hi kaufman!"` emulate user request, search answer in all plugins 
- run with plugin name `node ./bin/kaufman-bot -p api-ai -m "Hi!"` emulate user request, search only one plugin