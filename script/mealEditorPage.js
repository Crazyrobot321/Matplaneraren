const helpers = window.mealHelpers;

const NUTRIENT_FIELDS = [
    { key: "kcal", label: "Kcal", elementId: "currentKcal", unit: "" },
    { key: "protein", label: "Protein", elementId: "currentProtein", unit: " g" },
    { key: "sugar", label: "Socker", elementId: "currentSugar", unit: " g" },
    { key: "fat", label: "Fett", elementId: "currentFat", unit: " g" },
    { key: "carbs", label: "Kolhydrater", elementId: "currentCarbs", unit: " g" },
    { key: "fiber", label: "Fiber", elementId: "currentFiber", unit: " g" },
    { key: "salt", label: "Salt", elementId: "currentSalt", unit: " g" }
];

// Updates a single nutrition preview field
function setNutritionPreviewText(elementId, label, value, unit) {
    const element = document.getElementById(elementId);
    if (!element) {
        return;
    }

    element.textContent = `${label}: ${formatValue(value)}${unit || ""}`;
}

// Removes any saved meal for current day and slot
function removeCurrentSlotMeal(existingMeals, selectedDay, selectedSlot) {
    const updatedMeals = [];

    for (let i = 0; i < existingMeals.length; i++) {
        const meal = existingMeals[i];
        if (!(meal.day === selectedDay && meal.slot === selectedSlot)) {
            updatedMeals.push(meal);
        }
    }

    return updatedMeals;
}

// Renders nutrient preview for selected grams
function renderNutritionPreview(grams) {
    const nutrients = window.appState.selectedNutrients;

    for (let i = 0; i < NUTRIENT_FIELDS.length; i++) {
        const field = NUTRIENT_FIELDS[i];
        const value = scaledValue(nutrients[field.key], grams);
        setNutritionPreviewText(field.elementId, field.label, value, field.unit);
    }
}

// Builds a normalized ingredient object with nutrient values
function buildIngredient(name, grams, nutrients) {
    const ingredient = {
        name,
        grams
    };

    for (let i = 0; i < NUTRIENT_FIELDS.length; i++) {
        const field = NUTRIENT_FIELDS[i];
        ingredient[field.key] = scaledValue(nutrients[field.key], grams);
    }

    return ingredient;
}

// Re renders preview when weight input changes
function previewWeightInput() {
    const weightInput = document.getElementById("weightInput");
    if (!weightInput) {
        return;
    }

    weightInput.addEventListener("input", function (event) {
        const grams = parseNumericValue(event.target.value);
        renderNutritionPreview(grams);
    });
}
// Initializes editor state from query params and storage
function initializeMealEditor() {
    const appState = window.appState;
    const context = helpers.readMealContextFromQueryParams();
    const titleInput = document.getElementById("mealTitleInput");

    appState.mealItems = helpers.readMealsFromStorage();
    appState.currentMealIngredients = [];
    appState.selectedDay = context.day;
    appState.selectedSlot = context.slot;

    const existingMeal = helpers.findMealForDayAndSlot(appState.mealItems, appState.selectedDay, appState.selectedSlot);
    if (existingMeal) {
        if (titleInput) {
            titleInput.value = String(existingMeal.title).trim();
        }
        appState.currentMealIngredients = helpers.normalizeMealIngredients(existingMeal.ingredients);
        helpers.setDeleteButtonVisibility(true);
    } 
    else {
        if (titleInput) {
            titleInput.value = "";
        }
        helpers.setDeleteButtonVisibility(false);
    }

    helpers.renderMealContextText();
    helpers.renderIngredientList();
}

// Adds current selection as an ingredient in the draft meal
function addSelectedIngredientToMeal() {
    const appState = window.appState;
    const nutrients = appState.selectedNutrients;
    const titleInput = document.getElementById("mealTitleInput");

    const name = appState.selectedName || document.getElementById("currentName").textContent.trim();
    const grams = parseNumericValue(document.getElementById("weightInput").value);
    const title = titleInput ? titleInput.value.trim() : "";

    if (!title) {
        alert("Sätt en titel på rätten innan du lägger till ingredienser.");
        console.log("Attempted to add ingredient without meal title");
        if (titleInput) {
            titleInput.focus();
        }
        return;
    }
    if (!name || Number.isNaN(grams) || grams <= 0 || !nutrients.kcal) {
        alert("Välj ett livsmedel och ange gram för att lägga till ingrediens.");
        console.error("Attempted to add ingredient with invalid values");
        return;
    }
    //Finally add the ingredient to the current meal ingredients list in app state
    appState.currentMealIngredients.push(buildIngredient(name, grams, nutrients));
    console.log("Added a new ingredient to the meal:", name, grams, "g");
    helpers.renderIngredientList();
}

// Saves the current meal for selected day and slot
function saveCurrentMeal() {
    const appState = window.appState;
    const titleInput = document.getElementById("mealTitleInput");
    const title = titleInput ? titleInput.value.trim() : "";
    const ingredients = appState.currentMealIngredients || [];

    if (!title) {
        alert("Titel krävs för att spara rätten.");
        console.log("Attempted to save meal without title");
        if (titleInput) {
            titleInput.focus();
        }
        return;
    }

    if (ingredients.length === 0) {
        alert("Lägg till minst en ingrediens innan du sparar.");
        console.error("Attempted to save meal without ingredients");
        return;
    }

    const totals = helpers.calculateNutrientTotals(ingredients);
    const existingMeals = helpers.readMealsFromStorage();
    const updatedMeals = removeCurrentSlotMeal(existingMeals, appState.selectedDay, appState.selectedSlot);
    //Add the new or updated meal to the list of meals with all necessary properties
    updatedMeals.push({
        day: appState.selectedDay,
        slot: appState.selectedSlot,
        title,
        ingredients,
        totalKcal: totals.kcal,
        totals,
    });

    appState.mealItems = updatedMeals;
    helpers.writeMealsToStorage(updatedMeals);

    appState.currentMealIngredients = [];
    if (titleInput) {
        titleInput.value = "";
    }

    helpers.renderIngredientList();
    helpers.setDeleteButtonVisibility(true);
    alert("Rätten sparad. Du kan nu gå tillbaka till översikten.");
}

// Deletes the meal for selected day and slot
function deleteCurrentMeal() {
    const appState = window.appState;
    const titleInput = document.getElementById("mealTitleInput");
    const existingMeals = helpers.readMealsFromStorage();
    const updatedMeals = removeCurrentSlotMeal(existingMeals, appState.selectedDay, appState.selectedSlot);

    appState.mealItems = updatedMeals;
    appState.currentMealIngredients = [];
    helpers.writeMealsToStorage(updatedMeals);

    if (titleInput) {
        titleInput.value = "";
    }

    helpers.renderIngredientList();
    helpers.setDeleteButtonVisibility(false);
    alert("Rätten togs bort från denna slot.");
}

// Hides the selected food panel
function closeSelectedFoodPanel() {
    const selectedInfo = document.getElementById("selectedInfo");
    if (selectedInfo) {
        selectedInfo.classList.add("hidden");
    }
}

window.initializeMealEditor = initializeMealEditor;
window.addSelectedIngredientToMeal = addSelectedIngredientToMeal;
window.saveCurrentMeal = saveCurrentMeal;
window.deleteCurrentMeal = deleteCurrentMeal;
window.closeSelectedFoodPanel = closeSelectedFoodPanel;

previewWeightInput();
loadFoodCatalogData();
initializeMealEditor();
