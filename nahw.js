"use strict";

const diacritics = {
    "DAMMA": "\u064f",
    "DAMMATAN": "\u064c",
    "FATHA": "\u064e",
    "FATHATAN": "\u064b",
    "KASRA": "\u0650",
    "KASRATAN": "\u064d",
    "SUKOON": "\u0652",
    "SHADDA": "\u0651",

}

function getDiacriticName(diacritic) {
    console.assert(typeof diacritic === "string");
    console.assert(diacritic.length === 1);
    const index = Object.values(diacritics).indexOf(diacritic);
    if (index === -1) return null;
    return Object.keys(diacritics)[index];
}

function getWordEndingNameAndIndex(word) {
    console.assert(typeof word === "string");
    let index = word.length - 1;
    let diacriticName = getDiacriticName(word[index]);
    if (diacriticName === null) return {diacriticName: null, index: -1};
    if (diacriticName === "SHADDA") {
        index = word.length - 2;
        diacriticName = getDiacriticName(word[index]);
    }
    return {diacriticName, index};
}

function getWordEndingName(word) {
    return getWordEndingNameAndIndex(word).diacriticName;
}

function removeWordEnding(word) {
    let index = getWordEndingNameAndIndex(word).index;
    return word.split(word[index]).join("");
}

class WordState {
    static flags = ["correct", "incorrect", "unattempted", "na"]
    constructor(wordAnswer, flag="na") {
        this.setFlag(flag);
        if (this.getFlag() === "na") {
            this.setFacade(wordAnswer);
        } else {
            this.setFacade(removeWordEnding(wordAnswer));
        }
        this._answerWord = wordAnswer;
        this._answerVowel = getWordEndingName(wordAnswer);
    }

    getAnswer() {
        return this._answerWord;
    }

    getAnswerVowelEndingName() {
        return this._answerVowel;
    }

    getFacade() {
        return this._facade;
    }

    setFacade(value) {
        console.assert(typeof value === "string");
        this._facade = value;
    }

    getFlag() {
        return this._flag;
    }

    setFlag(value) {
        console.assert(WordState.flags.indexOf(value) !== -1);
        this._flag = value;
    }

    static computeFlag(wordAns) {
        if (getWordEndingName(wordAns) == null) {
            return "na";
        }
        return "unattempted";
    }

    static generateWords(sentenceAnswer) {
        let startingIndex = 0;
        let words = [];
        for (let i = 1; i < sentenceAnswer.length; ++i) {
            let c = sentenceAnswer[i];
            if (c === ' ') {
                let word = sentenceAnswer.substr(startingIndex, i - startingIndex);
                words.push(new WordState(word, WordState.computeFlag(word)));
                startingIndex = i + 1;
                i++;
                continue;
            }
            if (c === ',' || c === ':' || c === '.' || c === '،') {
                let word = sentenceAnswer.substr(startingIndex, i - startingIndex);
                words.push(new WordState(word, WordState.computeFlag(word)));
                words.push(new WordState(c, "na"));
                startingIndex = i + 1;
                i++;
                continue;
            }
        }
        if (startingIndex !== sentenceAnswer.length) {
            let word = sentenceAnswer.substr(
                startingIndex, sentenceAnswer.length - startingIndex);
            words.push(new WordState(word, WordState.computeFlag(word)));
        }
        return words;
    }
}

class SentenceState {
    static flags = ["correct", "incorrect", "unattempted"];

    constructor(sentenceAnswer, flag="unattempted") {
        this._words = WordState.generateWords(sentenceAnswer);
    }

    getWords() {
        return this._words;
    }

    getAnswer(val) {
        return this.getWords().map(x => x.getAnswer()).join(" ");
    }

    getFacade() {
        return this.getWords().map(x => x.getFacade()).join(" ");
    }

    getFlag() {
        return this._flag;
    }

    setFlag(value) {
        console.assert(SentenceState.flags.some(x => x === value));
        this._flag = value;
    }
}

class NahwQS {
    static FLAGS = ["wrong", "correct"]

    constructor(answers) {
        console.assert(answers != undefined);
        this._sentences = answers.map(x => new SentenceState(x));
    }

    // Assumes letters are the same
    try(values, push=true) {
        let valueLP = Util.getLetterPacks(value);
        let flags = [];
        let correct = true;
        for (let i = 0; i < valueLP.length; ++i) {
            if (!valueLP[i].svowel) {
                flags.push({flag: "correct", value: valueLP[i]});
                continue;
            }

            const vLP = valueLP[i];
            const aLP = this.answerLP[i];
            if (vLP.svowel === aLP.svowel &&
                vLP.shadda === aLP.shadda) {
                flags.push({flag: "correct", value: vLP});
                continue;
            }

            correct = false;

            if (svowel.toggleTanween(vLP.svowel) === aLP.svowel &&
                vLP.shadda === aLP.shadda) {
                flags.push({flag: "close_tanween", value: vLP});
            } else if (vLP.svowel === aLP.svowel && vLP.shadda !== aLP.shadda) {
                flags.push({flag: "close_shadda", value: vLP});
            } else {
                flags.push({flag: "wrong", value: vLP});
            }
        }
        let attempt = {correct, value, flags};
        if (push) {
            this.attempts.push(attempt);
        }
        return attempt;
    }

    getView() {
        if (this.view)
            return this.view
        return this.view = new NahwQV(this);
    }

    getSentences() {
        return this._sentences;
    }

    getAnswer() {
        return this.getSentences().map(x => x.getAnswer()).join(" ");
    }

    getFacade() {
        return this.getSentences().map(x => x.getFacade()).join(" ");
    }
}

class NahwQV {
    constructor(data) {
        this.data = data;
        this.HTML = {};

        this.HTML.root = document.createElement("div");
        this.HTML.root.classList.add("nahw-question");
        this.topBar();
        this.mainPage();
    }


    topBar() {
        // Create progress bar
        if (this.HTML.topBar) {
            this.HTML.topBar.innerHTML = "";
        }
        const topBarEl = this.HTML.topBar = document.createElement("div");
        topBarEl.classList.add("nahw-top-bar");

        const mainPageEl = document.createElement("div");
        mainPageEl.classList.add("nahw-top-bar-page");
        mainPageEl.classList.add("nahw-top-bar-square");
        mainPageEl.classList.add("nahw-top-bar-fill");
        topBarEl.appendChild(mainPageEl);

        for (let sentence in this.data.getSentences()) {
            const sentencePageEl = document.createElement("div");
            sentencePageEl.classList.add("nahw-top-bar-page");
            sentencePageEl.classList.add("nahw-top-bar-circle");
            topBarEl.appendChild(sentencePageEl);
        }

        this.HTML.root.appendChild(topBarEl);
    }

    mainPage() {
        // Create text (TODO: Make sentence clickable)
        const textEl = this.HTML.text = document.createElement("p");
        textEl.classList.add("nahw-full-text");
        for (let sentence of this.data.getSentences()) {
            const span = document.createElement("span");
            // U+200C = Zero Width Non-Joiner
            // It prevents adjacent letters from forming ligatures
            // Perfect since:
            // I want a margin between sentences (done with CSS)
            // I don't want a space since that shows up when hovering
            // I don't want letters connecting between sentences (i.e U+200C)
            // NOTE: display: block does the same thing BUT
            // it breaks text-align: justify, while the unicode doesn't
            span.innerText = sentence.getFacade() + "\u200c";
            span.classList.add("nahw-full-text-sentence");
            span.setAttribute("lang", "ar");
            textEl.appendChild(span);
        }
        // TODO: Create next button
        const actionButtonsEl = document.createElement("div");
        actionButtonsEl.classList.add("nahw-actions-container");

        const nextEl = document.createElement("div");
        nextEl.innerText = "Next";
        nextEl.classList.add("nahw-next");

        const submitEl = document.createElement("div");
        submitEl.innerText = "Submit";
        submitEl.classList.add("nahw-submit");

        actionButtonsEl.appendChild(submitEl);
        actionButtonsEl.appendChild(nextEl);

        // TODO: Create back-to-question or back-to-text
        // TODO: Add submit
        // Append all elements
        this.HTML.root.appendChild(textEl);
        this.HTML.root.appendChild(actionButtonsEl)
    }

    getRootHTML() {
        return this.HTML.root;
    }

}

// TODO: Write
class SubmitView {

}

// TODO: Write
class ProgressView {

}

// TODO: Write
class SentenceView {
    constructor(sentenceText, answersText) {
        console.assert(typeof sentenceText === "string");
        this.sentenceText = sentenceText;
    }
}

// TODO: Write
class InputView {

}

// TODO: Write
class ErrorView {

}

// TODO: Write
class WordView {
}
