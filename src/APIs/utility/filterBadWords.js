// ./src/APIs/utility/filterBadWords.js
const bannedWords = require('../data/bannedWords.json');

function normalizeText(text) {
    return text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function filterBadWords(input) {
    const normalizedInput = normalizeText(input);
    const pattern = bannedWords
        .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').toLowerCase())
        .join('|');

    const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');

    return input.replace(regex, match => '#'.repeat(match.length));
}

module.exports = { normalizeText, filterBadWords };
