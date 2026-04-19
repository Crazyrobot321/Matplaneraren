// Parses numeric input and supports comma decimals
function parseNumericValue(value) {
    const parsed = Number.parseFloat(String(value).replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
}

// Formats numbers for Swedish locale display
function formatValue(value) {
    if (!Number.isFinite(value)) {
        return "0";
    }
    return value.toLocaleString("sv-SE", { maximumFractionDigits: 2 });
}

// Scales a nutrient value from per 100g to given grams
function scaledValue(nutrient, grams) {
    if (!nutrient || !Number.isFinite(grams)) {
        return 0;
    }
    const baseValue = parseNumericValue(nutrient.varde);
    return (baseValue * grams) / 100;
}
