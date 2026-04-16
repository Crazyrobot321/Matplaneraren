const helpers = window.mealHelpers;

function renderNutritionPreview(grams) {
    const nutrients = window.appState.selectedNutrients;
    const kcalValue = scaledValue(nutrients.kcal, grams);
    const proteinValue = scaledValue(nutrients.protein, grams);
    const sugarValue = scaledValue(nutrients.sugar, grams);
    const fatValue = scaledValue(nutrients.fat, grams);
    const carbsValue = scaledValue(nutrients.carbs, grams);
    const fiberValue = scaledValue(nutrients.fiber, grams);
    const saltValue = scaledValue(nutrients.salt, grams);

    const currentKcal = document.getElementById("currentKcal");
    const currentProtein = document.getElementById("currentProtein");
    const currentSugar = document.getElementById("currentSugar");
    const currentFat = document.getElementById("currentFat");
    const currentCarbs = document.getElementById("currentCarbs");
    const currentFiber = document.getElementById("currentFiber");
    const currentSalt = document.getElementById("currentSalt");

    currentKcal.textContent = `Kcal: ${formatValue(kcalValue)}`;
    currentProtein.textContent = `Protein: ${formatValue(proteinValue)} g`;
    currentSugar.textContent = `Socker: ${formatValue(sugarValue)} g`;
    currentFat.textContent = `Fett: ${formatValue(fatValue)} g`;
    currentCarbs.textContent = `Kolhydrater: ${formatValue(carbsValue)} g`;
    currentFiber.textContent = `Fiber: ${formatValue(fiberValue)} g`;
    currentSalt.textContent = `Salt: ${formatValue(saltValue)} g`;
}

function bindWeightInputPreview() {
    const weightInput = document.getElementById("weightInput");
    if (!weightInput) {
        return;
    }

    weightInput.addEventListener("input", function (event) {
        const grams = parseNumericValue(event.target.value);
        renderNutritionPreview(grams);
    });
}

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
    appState.currentMealIngredients.push({
        name,
        grams,
        kcal: scaledValue(nutrients.kcal, grams),
        protein: scaledValue(nutrients.protein, grams),
        sugar: scaledValue(nutrients.sugar, grams),
        fat: scaledValue(nutrients.fat, grams),
        carbs: scaledValue(nutrients.carbs, grams),
        fiber: scaledValue(nutrients.fiber, grams),
        salt: scaledValue(nutrients.salt, grams)
    });
    console.log("Added a new ingredient to the meal:", name, grams, "g");
    helpers.renderIngredientList();
}

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

function closeSelectedFoodPanel() {
    const selectedInfo = document.getElementById("selectedInfo");
    if (selectedInfo) {
        selectedInfo.style.display = "none";
    }
}

window.initializeMealEditor = initializeMealEditor;
window.addSelectedIngredientToMeal = addSelectedIngredientToMeal;
window.saveCurrentMeal = saveCurrentMeal;
window.deleteCurrentMeal = deleteCurrentMeal;
window.closeSelectedFoodPanel = closeSelectedFoodPanel;

bindWeightInputPreview();
loadFoodCatalogData();
initializeMealEditor();
