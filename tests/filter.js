const assert = require('assert').strict;
const {parseTranslation, isLangMatch} = require("../LiveTL/js/filter.js")

let tests = {
    value: 0,
};

function compareTranslationMatches(other, correct) {
    if (other && correct) {
        return other.lang == correct.lang && other.msg == correct.msg;
    }
    return other == correct;
}

function testParseTranslation() {
    const testCases = [
        {
            msg: "(en) Hello there",
            correct: { lang: "en", msg: "Hello there" },
        },
        {
            msg: "(es) - Hola eso",
            correct: { lang: "es", msg: "Hola eso" },
        },
        {
            msg: "jp - リーーーーーーー",
            correct: { lang: "jp", msg: "リーーーーーーー" },
        },
        {
            msg: "en:Test translation",
            correct: { lang: "en", msg: "Test translation" },
        },
        {
            msg: "No translation",
            correct: undefined,
        }
    ];

    testCases.forEach(({ msg, correct }) => {
        assert.ok(
            compareTranslationMatches(parseTranslation(msg), correct),
            `Couldn't parse translation of ${msg} to ${correct}`,
        );
    });
    process.stdout.write(".");
    tests.value++;
}

function testLangMatch() {
    const testCases = [
        {
            testCase: ["En", { code: "en", name: "English", lang: "English" }],
            match: true,
        },
    ];
    testCases.forEach(({ testCase, match }) => {
        assert.equal(
            isLangMatch(...testCase), match,
            `Incorrect language match between ${testCase[0]} and ${testCase[1]}`,
        );
    });
    process.stdout.write(".");
    tests.value++;
}

testParseTranslation();
testLangMatch();

console.log(`Finished ${tests.value} unit tests for filter.js`);
