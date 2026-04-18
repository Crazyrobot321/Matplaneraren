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

function findNutrientByName(itemData, text) {
    return findNutrientByProperty(itemData, "namn", text);
}

function findNutrientByCode(itemData, code) {
    return findNutrientByProperty(itemData, "euroFIRkod", code);
}

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

    // Try to load cached data first 
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
        const payload = await response.json();
        appState.livsmedelLista = Array.isArray(payload.livsmedel) ? payload.livsmedel : [];
        localStorage.setItem("livsmedel", JSON.stringify(appState.livsmedelLista));
        console.log("Fetched and cached food data");
    } catch {
        // Keep cached data if request fails.
        console.log("Failed to fetch fresh food data, keeping cached data.");
    }
}

async function searchFoods(term) {
    const appState = window.appState;
    const resultsElement = document.getElementById("results");
    resultsElement.innerHTML = "";

    const searchTerm = term.trim().toLowerCase();


    const results = [];
    for (let i = 0; i < appState.livsmedelLista.length && results.length < 30; i++) {
        const item = appState.livsmedelLista[i];
        const itemName = String(item.namn).toLowerCase();

        if (itemName.includes(searchTerm)) {
            results.push(item);
        }
    }

    for (let i = 0; i < results.length; i++) { //Loops through search results and creates a div for each result, 
        //with an event listener that fetches detailed info about the food item when clicked, and updates the app state and UI accordingly
        const item = results[i];
        const div = document.createElement("div");
        div.className = "resultItem";
        div.textContent = item.namn;

        div.addEventListener("click", async function () {

            const itemInfo = await fetch(appState.baseURL + item.links[0].href);
            const itemData = await itemInfo.json();

            assignSelectedNutrients(itemData, appState);
            appState.selectedName = item.namn;
            document.getElementById("currentName").textContent = item.namn;

            const grams = parseNumericValue(document.getElementById("weightInput").value);
            renderNutritionPreview(grams);
            document.getElementById("selectedInfo").classList.remove("hidden");
        });

        resultsElement.appendChild(div);
    }
}

window.searchFoods = searchFoods; //Make searchFoods globally accessible so it can be called from other scirpts
window.loadFoodCatalogData = loadFoodCatalogData; //Make loadFoodCatalogData globally accessible so it can be called from other scripts
