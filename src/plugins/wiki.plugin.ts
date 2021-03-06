import TelegramBot = require('node-telegram-bot-api');
import { EventEmitter } from 'events';
import * as _ from 'lodash';
import { IPlugin, ITelegramBotMessage } from './base.plugin';
import { checkWordsInMessage, removeWordsFromMessage } from '../lib/utils';

const wikijs = require('wikijs');
const wtfWikipedia = require("wtf_wikipedia");

export class WikiPlugin implements IPlugin {
    public name = 'wiki';
    public description = 'Get basic information of word from wikipedia';
    protected wordsForSpy: string[];

    constructor(
        protected bot: TelegramBot,
        protected telegramBotLocale: string,
        protected telegramBotNameAliases: string[],
        protected wikipediaContentLength: number,
        protected wikipediaSpyWords: string[]
    ) {
        this.wordsForSpy = wikipediaSpyWords;
    }
    public check(msg: ITelegramBotMessage): boolean {
        return (
            checkWordsInMessage(msg.text, this.wordsForSpy) &&
            msg.chat.type === 'private'
        ) ||
            (
                checkWordsInMessage(msg.text, this.telegramBotNameAliases) &&
                checkWordsInMessage(msg.text, this.wordsForSpy) &&
                msg.chat.type !== 'private'
            );
    }
    protected searchOnWiki(text: string, locale?: string) {
        const event = new EventEmitter();
        locale = locale === undefined ? this.telegramBotLocale : locale;
        wikijs.default({ apiUrl: `http://${locale}.wikipedia.org/w/api.php` })
            .search(text, 1).then((data: any) => {
                if (data.results.length > 0) {
                    let pageName = data.results[0];
                    pageName = pageName.replace(new RegExp(' ', "ig"), '_');
                    wtfWikipedia.from_api(pageName, this.telegramBotLocale, (markup: any) => {
                        let answer = '';
                        if (markup) {
                            answer = wtfWikipedia.plaintext(markup).replace(new RegExp('\n\n', "ig"), '\n');
                        }
                        let url = `https://${locale}.wikipedia.org/wiki/${pageName}`;
                        event.emit('message', answer, url);
                    });
                } else {
                    event.emit('message', false, false);
                }
            }, (error: any) => event.emit('message', false, false));
        return event;
    }
    public process(msg: ITelegramBotMessage): EventEmitter {
        const event = new EventEmitter();
        let text = removeWordsFromMessage(msg.text, this.wordsForSpy);
        text = removeWordsFromMessage(text, this.telegramBotNameAliases);
        this.searchOnWiki(text).on('message', (answer: string, url: string) => {
            if (!answer || !checkWordsInMessage(answer, _.words(text))) {
                this.searchOnWiki(text, 'en').on('message', (answer: string, url: string) => {
                    if (answer) {
                        event.emit('message', answer.substring(0, this.wikipediaContentLength) + '...\n\n' + url);
                    } else {
                        if (url) {
                            event.emit('message', url);
                        } else {
                            event.emit('message', false);
                        }
                    }
                });
            } else {
                if (answer) {
                    event.emit('message', answer.substring(0, 1000) + '...\n\n' + url);
                } else {
                    if (url) {
                        event.emit('message', url);
                    } else {
                        event.emit('message', false);
                    }
                }
            }
        });
        return event;
    }
}
