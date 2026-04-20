// Parses numeric input and supports comma decimals
// Handles Swedish locale decimal format and returns safe numeric values
function parseNumericValue(value) {
    const parsed = Number.parseFloat(String(value).replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
}

// Formats numbers for Swedish locale display
// Converts numbers to Swedish number format with appropriate decimal places
function formatValue(value) {
    if (!Number.isFinite(value)) {
        return "0";
    }
    return value.toLocaleString("sv-SE", { maximumFractionDigits: 2 });
}

// Scales a nutrient value from per 100g to given grams
// Adjusts nutrition data from standard 100g portion to actual portion size
function scaledValue(nutrient, grams) {
    if (!nutrient || !Number.isFinite(grams)) {
        return 0;
    }
    const baseValue = parseNumericValue(nutrient.varde);
    return (baseValue * grams) / 100;
}

// Async alert function that returns a promise
// Wraps native alert in async/await for better code flow control
async function alertAsync(message) {
    return new Promise((resolve) => {
        alert(message);
        resolve();
    });
}
