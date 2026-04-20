// Finds first nutrient where a property contains text
function findNutrientByProperty(itemData, propertyName, text) {
    for (let i = 0; i < itemData.length; i++) {
        const nutrient = itemData[i];
        const propertyValue = String(nutrient[propertyName]);
        if (propertyValue.includes(text)) {
            return nutrient;
        }
    }

    return null;
}

// Finds nutrient by name
function findNutrientByName(itemData, text) {
    return findNutrientByProperty(itemData, "namn", text);
}

// Finds nutrient by EuroFIR code
function findNutrientByCode(itemData, code) {
    return findNutrientByProperty(itemData, "euroFIRkod", code);
}

// Maps selected nutrients from item details to app state
function assignSelectedNutrients(itemData, appState) {
    appState.selectedNutrients.kcal = findNutrientByName(itemData, "Energi (kcal)"); //Find by name due to Energi Kj have same code as kcal, and we want kcal

    const nutrientMappings = [
        { key: "protein", code: "PROT" },
        { key: "sugar", code: "SUGAR" },
        { key: "fat", code: "FAT" },
        { key: "carbs", code: "CHO" },
        { key: "fiber", code: "FIB" },
        { key: "salt", code: "NACL" }
    ];

    for (let i = 0; i < nutrientMappings.length; i++) {
        const nutrient = nutrientMappings[i];
        appState.selectedNutrients[nutrient.key] = findNutrientByCode(itemData, nutrient.code);
    }
}

async function loadFoodCatalogData() {
    const appState = window.appState;
    const saved = localStorage.getItem("livsmedel");

    // Try to load cached data from local storage first
    if (saved) {
        try {
            appState.livsmedelLista = JSON.parse(saved);
            console.log("Loaded food data from cache");
            return;
        } catch {
            appState.livsmedelLista = [];
            console.log("Failed to parse cached food data, starting with empty list");
        }
    }
    // Then attempt to fetch fresh data, but don't clear cache on failure
    try {
        const response = await fetch(`${appState.baseURL}/api/v1/livsmedel?offset=0&limit=3000&sprak=1`);
        if (!response.ok) {
            throw new Error(`Food catalog request failed with status ${response.status}`);
        }

        const payload = await response.json();
        appState.livsmedelLista = Array.isArray(payload.livsmedel) ? payload.livsmedel : [];
        localStorage.setItem("livsmedel", JSON.stringify(appState.livsmedelLista)); // Add all livsmedel to local storage for caching
        console.log("Fetched and cached food data");
    } catch (error) {
        // Keep cached data if request fails.
        console.error("Failed to fetch fresh food data:", error);
        console.log("Failed to fetch fresh food data, keeping cached data.");
    }
}

// Filters foods by term and renders clickable results
async function searchFoods(term) {
    const appState = window.appState;
    const resultsElement = document.getElementById("results");
    resultsElement.innerHTML = "";

    const searchTerm = term.trim().toLowerCase();
    const searchResults = 30;


    const results = [];

    //Limit search results to 30 items
    for (let i = 0; i < appState.livsmedelLista.length && results.length < searchResults; i++) {
        const item = appState.livsmedelLista[i];
        const itemName = String(item.namn).toLowerCase();

        if (itemName.includes(searchTerm)) {
            results.push(item);
        }
    }

    for (let i = 0; i < results.length; i++) {
        const item = results[i];
        const div = document.createElement("div");
        div.className = "resultItem";
        div.textContent = item.namn;

        div.addEventListener("click", async function () {
            try {
                const itemInfo = await fetch(appState.baseURL + item.links[0].href);
                if (!itemInfo.ok) {
                    throw new Error(`Food details request failed with status ${itemInfo.status}`);
                }

                const itemData = await itemInfo.json();

                assignSelectedNutrients(itemData, appState);
                appState.selectedName = item.namn;
                document.getElementById("currentName").textContent = item.namn;

                const grams = parseNumericValue(document.getElementById("weightInput").value);
                renderNutritionPreview(grams);
                document.getElementById("selectedInfo").classList.remove("hidden");
            } catch (error) {
                console.error("Failed to load food details:", error);
                alert("Kunde inte hämta livsmedelsdetaljer just nu. Försök igen.");
            }
        });

        resultsElement.appendChild(div);
    }
}

window.searchFoods = searchFoods; //Make searchFoods globally accessible so it can be called from other scirpts
window.loadFoodCatalogData = loadFoodCatalogData; //Make loadFoodCatalogData globally accessible so it can be called from other scripts
