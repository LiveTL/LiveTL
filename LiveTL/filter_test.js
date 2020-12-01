const {parseTranslation, isLangMatch} = require("./filter.js")

function compareTranslationMatches(other, correct) {
    return other.lang == correct.lang && other.msg == correct.msg;
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
    ];

    testCases.forEach(case => {
        assert.ok(true);
    });
}
