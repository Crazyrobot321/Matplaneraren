const DAY_LABELS = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday"
};

const SLOT_LABELS = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    snack: "Snack",
    dinner: "Dinner"
};
// Reads selected day and slot from URL query params
// Extracts meal scheduling context passed from the weekly planner page
function readMealContextFromQueryParams() {
    const query = new URLSearchParams(window.location.search);
    const day = query.get("day");
    const slot = query.get("slot");

    return { day, slot };
}

// Loads saved meals from localStorage
// Retrieves all planned meals with error handling for corrupted storage
function readMealsFromStorage() {
    const storedItems = localStorage.getItem(window.MEAL_STORAGE_KEY);
    if (!storedItems) {
        return [];
    }

    try {
        return JSON.parse(storedItems);
    } catch {
        return [];
    }
}

// Saves meals to localStorage
function writeMealsToStorage(items) {
    localStorage.setItem(window.MEAL_STORAGE_KEY, JSON.stringify(items));
}

// Sums nutrient totals for all ingredients
// Aggregates nutritional values across all ingredients in a meal
function calculateNutrientTotals(ingredients) {
    const totals = {
        kcal: 0,
        protein: 0,
        sugar: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
        salt: 0
    };

    for (let i = 0; i < ingredients.length; i++) {
        const ingredient = ingredients[i];
        totals.kcal += parseNumericValue(ingredient.kcal);
        totals.protein += parseNumericValue(ingredient.protein);
        totals.sugar += parseNumericValue(ingredient.sugar);
        totals.fat += parseNumericValue(ingredient.fat);
        totals.carbs += parseNumericValue(ingredient.carbs);
        totals.fiber += parseNumericValue(ingredient.fiber);
        totals.salt += parseNumericValue(ingredient.salt);
    }
    console.log("Total nutrition: ", totals);
    return totals;
}

// Renders current ingredient list and summary
// Updates UI with current ingredients and displays nutritional totals
function renderIngredientList() {
    const appState = window.mealState;
    const list = document.getElementById("draftIngredientList");
    const nutrition = document.getElementById("draftNutrition");

    //If either the list element or the nutrition element is not found in the DOM, exit the function early
    if (!list || !nutrition) {
        alert("Ett oväntat fel inträffade. Försök att ladda om sidan.");
        console.log("Render ingredient list failed: ", list, nutrition);
        return;
    }

    const ingredients = appState.currentMealIngredients || [];
    list.innerHTML = "";

    if (ingredients.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No ingredients added yet.";
        list.appendChild(li);
        nutrition.textContent = "";
        return;
    }

    for (let i = 0; i < ingredients.length; i++) {
        const ingredient = ingredients[i];
        const li = document.createElement("li");
        li.textContent = `${ingredient.name}, ${displayNumber(ingredient.grams)} g, ${displayNumber(ingredient.kcal)} kcal`;
        list.appendChild(li);
    }

    const totals = calculateNutrientTotals(ingredients);
    nutrition.textContent = `
    Sum: ${displayNumber(totals.kcal)} kcal 
    | Protein ${displayNumber(totals.protein)} g 
    | Carbohydrates ${displayNumber(totals.carbs)} g 
    | Fat ${displayNumber(totals.fat)} g 
    | Fiber ${displayNumber(totals.fiber)} g 
    | Sugar ${displayNumber(totals.sugar)} g 
    | Salt ${displayNumber(totals.salt)} g`;
}

// Renders the current day and slot context text
// Shows user which day and meal time they are currently editing
function renderMealContextText() {
    const appState = window.mealState;
    const contextElement = document.getElementById("mealContext");
    if (!contextElement) {
        return;
    }

    const dayLabel = DAY_LABELS[appState.selectedDay] || DAY_LABELS.monday;
    const slotLabel = SLOT_LABELS[appState.selectedSlot] || SLOT_LABELS.breakfast;
    contextElement.textContent = `You are adding a meal to ${dayLabel} - ${slotLabel}`;
}

window.mealHelpers = {
    readMealsFromStorage,
    writeMealsToStorage,
    readMealContextFromQueryParams,
    renderIngredientList,
    renderMealContextText,
    calculateNutrientTotals
};
