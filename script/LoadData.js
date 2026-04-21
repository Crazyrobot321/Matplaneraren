// Loads food catalog data from API or local cache
async function loadFoodCatalogData() {
    const appState = window.mealState;
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
        const response = await fetch(`${appState.baseURL}/api/v1/livsmedel?offset=0&limit=5000&sprak=1`);
        if (!response.ok) {
            console.error(`Food catalog request failed with status ${response.status}`);
            return;
        }

        const data = await response.json();
        appState.livsmedelLista = data.livsmedel
        localStorage.setItem("livsmedel", JSON.stringify(appState.livsmedelLista)); // Add all livsmedel to local storage for caching
        console.log("Fetched and cached food data");
    } catch (error) {
        // Keep cached data if request fails.
        console.error("Failed to fetch fresh food data:", error);
        console.log("Failed to fetch fresh food data, keeping cached data.");
    }
}

// Filters foods by term and renders clickable results
// Performs search on food list and displays selectable results with event handlers
function searchFoods(term) {
    const appState = window.mealState;
    const resultsElement = document.getElementById("results");
    resultsElement.innerHTML = "";

    const searchTerm = term.trim().toLowerCase();
    const searchResults = 30;


    const results = [];

    //Limit search results to 30 items
    for (let i = 0; i < appState.livsmedelLista.length && results.length < searchResults; i++) {
        const item = appState.livsmedelLista[i];
        const itemName = String(item.namn).toLowerCase(); //Convert to string  and lowercase

        if (itemName.includes(searchTerm)) {
            results.push(item);
        }
    }

    for (let i = 0; i < results.length; i++) {
        const item = results[i];
        const div = document.createElement("div");
        div.className = "resultItem";
        div.textContent = item.namn;

        //Assigns each result item a click event to load its details and update the preview
        div.addEventListener("click", async function () {
            try {
                const itemInfo = await fetch(appState.baseURL + item.links[0].href);
                if (!itemInfo.ok) {
                    console.error("Failed to fetch food details, status: ", itemInfo.status);
                    return;
                }

                const itemData = await itemInfo.json();
                appState.selectedNutrients.kcal = null;
                for (let j = 0; j < itemData.length; j++) {
                    const nutrient = itemData[j];
                    if (String(nutrient.namn).includes("Energi (kcal)")) {
                        appState.selectedNutrients.kcal = nutrient;
                        break;
                    }
                }

                const nutrientMappings = [
                    { key: "protein", code: "PROT" },
                    { key: "sugar", code: "SUGAR" },
                    { key: "fat", code: "FAT" },
                    { key: "carbs", code: "CHO" },
                    { key: "fiber", code: "FIB" },
                    { key: "salt", code: "NACL" }
                ];

                for (let j = 0; j < nutrientMappings.length; j++) {
                    const nutrientMap = nutrientMappings[j];
                    appState.selectedNutrients[nutrientMap.key] = null;

                    for (let k = 0; k < itemData.length; k++) {
                        const nutrient = itemData[k];
                        if (String(nutrient.euroFIRkod).includes(nutrientMap.code)) {
                            appState.selectedNutrients[nutrientMap.key] = nutrient;
                            break;
                        }
                    }
                }
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
