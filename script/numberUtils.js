function parseNumericValue(value) {
    return Number.parseFloat(String(value).replace(",", ".")) || 0;
}

function displayNumber(value) {
    return Math.round(parseNumericValue(value) * 100) / 100;
}