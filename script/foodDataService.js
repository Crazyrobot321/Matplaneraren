function findNutrientByName(itemData, text) {
    for (let i = 0; i < itemData.length; i++) {
        const nutrient = itemData[i];
        const nutrientName = String(nutrient.namn);
        if (nutrientName.includes(text)) {
            return nutrient;
        }
    }

    return null;
}

function findNutrientByCode(itemData, code) {
    for (let i = 0; i < itemData.length; i++) {
        const nutrient = itemData[i];
        const euroCode = String(nutrient.euroFIRkod);
        if (euroCode.includes(code)) {
            return nutrient;
        }
    }

    return null;
}

function assignSelectedNutrients(itemData, appState) {
    appState.selectedNutrients.kcal = findNutrientByName(itemData, "Energi (kcal)"); //Find by name due to Energi Kj have same code as kcal, and we want kcal
    appState.selectedNutrients.protein = findNutrientByCode(itemData, "PROT");
    appState.selectedNutrients.sugar = findNutrientByCode(itemData, "SUGAR");
    appState.selectedNutrients.fat = findNutrientByCode(itemData, "FAT");
    appState.selectedNutrients.carbs = findNutrientByCode(itemData, "CHO");
    appState.selectedNutrients.fiber = findNutrientByCode(itemData, "FIB");
    appState.selectedNutrients.salt = findNutrientByCode(itemData, "NACL");
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
    for (let i = 0; i < appState.livsmedelLista.length; i++) {
        const item = appState.livsmedelLista[i];
        const itemName = String(item.namn).toLowerCase();

        if (itemName.includes(searchTerm)) {
            results.push(item);
        }
        //Max 30 resuls
        if (results.length >= 30) {
            break;
        }
    }

    for (let i = 0; i < results.length; i++) {
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
            document.getElementById("selectedInfo").style.display = "block";
        });

        resultsElement.appendChild(div);
    }
}

window.searchFoods = searchFoods;
window.loadFoodCatalogData = loadFoodCatalogData;
