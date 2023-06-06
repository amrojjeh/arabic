"use strict";

// Display feedback by pretty much using the WORDL technique
class SAQuestionState {
    constructor(prompt, answer, image, hint, input) {
        this.prompt = prompt;
        this.input = input;
        this.image = image;
        this.hint = hint;
        this.answer = answer;
        this.skeletonAnswer = Util.getSkeleton(answer);
        this.attempts = [];
    }

    try(value) {
        let correct = this.verify(value);
        let trial = {correct, value};
        this.attempts.push(trial);
        return trial;
    }

    verify(value) {
        return value === this.answer;
    }

    hasAnsweredSkeleton() {
        return this.attempts.some(x => x.value === this.skeletonAnswer);
    }
}

class SVQuestionState {
    constructor(prompt, answers, hint, keyboard) {
        this.prompt = prompt;
        this.keyboard = keyboard;
        this.hint = hint;
        this.answers = answers;
        this.attempts = [];
        this.correctAnswers = [];
    }

    // [string] -> [{correct: bool, value: string}]
    try(...values) {
        let trials = values.map(
            value => {return {correct: this.verify(value), value}});
        trials
            .filter(x => x.correct && !this.correctAnswers.some(y => y === x))
            .forEach(x => this.correctAnswers.push(x.value));
        this.attempts.push(trials);
        return trials;
    }

    // string -> bool
    verify(value) {
        return this.answers.indexOf(value) !== -1;
    }

    // () -> int
    answersLeft() {
        return this.answers.length - this.correctAnswers.length;
    }

    get lastAttempt() {
        return this.attempts[this.attempts.length - 1];
    }
}

class SVowelsQuestionState {
    // Assume sukoon if no harakah
    constructor(answer) {
        this.answer = answer;
        this.prompt = "Insert the correct vowels";
        this.skeleton = Util.getSkeleton(this.answer);
        this.attempts = [];
    }

    try(value) {
        let correct = this.verify(value);
        let trial = {correct, value};
        this.attempts.push(trial);
        return trial;
    }

    verify(value) {
        return value === this.answer;
    }

    getShortVowel(index) {
        const vowels = svowel.getVowels();
        let curr = -1;
        for (let i = 0; i < this.answer.length; ++i) {
            if (vowels.some(x => x === this.answer[i])) {
                curr++;
                if (curr === index) {
                    return this.answer[i];
                }
            }
        }
        return curr;
    }

    get lastAttempt() {
        return this.attempts[this.attempts.length - 1];
    }
}

class Util {
    static getSkeleton(text) {
        const vowels = svowel.getVowels();
        return text.split("").filter(x => vowels.indexOf(x) === -1).join("");
    }
}
