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

// Renders nutrient preview for selected grams
// Shows users what the nutritional content will be for their selected portion size
function renderNutritionPreview(grams) {
    const nutrients = window.appState.selectedNutrients;

    for (let i = 0; i < NUTRIENT_FIELDS.length; i++) {
        const field = NUTRIENT_FIELDS[i];
        const nutrient = nutrients[field.key];
        const value = nutrient ? (parseNumericValue(nutrient.varde) * parseNumericValue(grams)) / 100 : 0;
        const element = document.getElementById(field.elementId);
        if (element) {
            element.textContent = `${field.label}: ${displayNumber(value)}${field.unit || ""}`;
        }
    }
}

// Re renders preview when weight input changes
// Provides real-time visual feedback as users adjust portion sizes
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
// Initializes add meal page state from query params and storage
// Restores the user's context and any previously saved meal when they open the page
function initializeAddMealPage() {
    const appState = window.appState;
    const context = helpers.readMealContextFromQueryParams();
    const titleInput = document.getElementById("mealTitleInput");

    appState.mealItems = helpers.readMealsFromStorage();
    appState.currentMealIngredients = [];
    appState.selectedDay = context.day;
    appState.selectedSlot = context.slot;

    let existingMeal = null;
    for (let i = 0; i < appState.mealItems.length; i++) {
        const meal = appState.mealItems[i];
        if (meal.day === appState.selectedDay && meal.slot === appState.selectedSlot) {
            existingMeal = meal;
            break;
        }
    }

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
// Accumulates ingredients for the meal being edited before saving
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
    const ingredient = {
        name,
        grams
    };

    for (let i = 0; i < NUTRIENT_FIELDS.length; i++) {
        const field = NUTRIENT_FIELDS[i];
        const nutrient = nutrients[field.key];
        ingredient[field.key] = nutrient ? (parseNumericValue(nutrient.varde) * parseNumericValue(grams)) / 100 : 0;
    }

    //Finally add the ingredient to the current meal ingredients list in app state
    appState.currentMealIngredients.push(ingredient);
    console.log("Added a new ingredient to the meal:", name, grams, "g");
    helpers.renderIngredientList();
}

// Saves the current meal for selected day and slot
// Persists the completed meal to storage so it appears in the weekly planner
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
    const updatedMeals = [];
    for (let i = 0; i < existingMeals.length; i++) {
        const meal = existingMeals[i];
        if (!(meal.day === appState.selectedDay && meal.slot === appState.selectedSlot)) {
            updatedMeals.push(meal);
        }
    }
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
// Allows users to remove meals they no longer want from a specific time slot
function deleteCurrentMeal() {
    const appState = window.appState;
    const titleInput = document.getElementById("mealTitleInput");
    const existingMeals = helpers.readMealsFromStorage();
    const updatedMeals = [];
    for (let i = 0; i < existingMeals.length; i++) {
        const meal = existingMeals[i];
        if (!(meal.day === appState.selectedDay && meal.slot === appState.selectedSlot)) {
            updatedMeals.push(meal);
        }
    }

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

// Sets up event listeners for async button handlers to avoid having onclick attributes in HTML
// Registers click handlers for meal management buttons to enable user interactions
function setupEventListeners() {
    const addIngredientBtn = document.getElementById("addIngredientBtn");
    if (addIngredientBtn) {
        addIngredientBtn.addEventListener("click", function() {
            addSelectedIngredientToMeal();
        });
    }

    const saveMealBtn = document.getElementById("saveMealBtn");
    if (saveMealBtn) {
        saveMealBtn.addEventListener("click", function() {
            saveCurrentMeal();
        });
    }

    const deleteMealBtn = document.getElementById("deleteMealButton");
    if (deleteMealBtn) {
        deleteMealBtn.addEventListener("click", function() {
            deleteCurrentMeal();
        });
    }

    const closeBtn = document.getElementById("closeSelectedFoodPanelBtn");
    if (closeBtn) {
        closeBtn.addEventListener("click", function() {
            const selectedInfo = document.getElementById("selectedInfo");
            if (selectedInfo) {
                selectedInfo.classList.add("hidden");
            }
        });
    }
}

previewWeightInput();
loadFoodCatalogData();
setupEventListeners();
initializeAddMealPage();
