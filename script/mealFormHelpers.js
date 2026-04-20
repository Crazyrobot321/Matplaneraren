const MEAL_STORAGE_KEY = window.MEAL_STORAGE_KEY || "simpleMealItems";

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
function readMealContextFromQueryParams() {
    const query = new URLSearchParams(window.location.search);
    const day = query.get("day");
    const slot = query.get("slot");

    return { day, slot };
}

// Loads saved meals from localStorage
function readMealsFromStorage() {
    const storedItems = localStorage.getItem(MEAL_STORAGE_KEY);
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
    localStorage.setItem(MEAL_STORAGE_KEY, JSON.stringify(items));
}

// Returns label by key with a fallback
function getLabelFromKey(labels, key, fallbackKey) {
    if (labels[key]) {
        return labels[key];
    }

    return labels[fallbackKey];
}

// Gets a display label for a day key
function getDayLabelFromKey(dayKey) {
    return getLabelFromKey(DAY_LABELS, dayKey, "monday");
}

// Gets a display label for a slot key
function getSlotLabelFromKey(slotKey) {
    return getLabelFromKey(SLOT_LABELS, slotKey, "breakfast");
}

// Normalizes ingredient values to numeric fields
function normalizeMealIngredients(ingredients) {
    if (!Array.isArray(ingredients)) {
        return [];
    }

    const normalized = [];

    for (let i = 0; i < ingredients.length; i++) {
        const ingredient = ingredients[i];
        const name = String(ingredient.name).trim();

        if (!name) {
            continue;
        }

        normalized.push({
            name,
            grams: parseNumericValue(ingredient.grams),
            kcal: parseNumericValue(ingredient.kcal),
            protein: parseNumericValue(ingredient.protein),
            sugar: parseNumericValue(ingredient.sugar),
            fat: parseNumericValue(ingredient.fat),
            carbs: parseNumericValue(ingredient.carbs),
            fiber: parseNumericValue(ingredient.fiber),
            salt: parseNumericValue(ingredient.salt)
        });
    }

    return normalized;
}

// Finds a meal for a specific day and slot
function findMealForDayAndSlot(meals, day, slot) {
    for (let i = 0; i < meals.length; i++) {
        const meal = meals[i];
        if (meal.day === day && meal.slot === slot) {
            return meal;
        }
    }

    return null;
}

// Shows or hides the delete meal button
function setDeleteButtonVisibility(show) {
    const deleteButton = document.getElementById("deleteMealButton");
    if (!deleteButton) {
        return;
    }

    deleteButton.classList.toggle("hidden", !show);
}

// Sums nutrient totals for all ingredients
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
function renderIngredientList() {
    const appState = window.appState;
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
        li.textContent = "Inga ingredienser tillagda än.";
        list.appendChild(li);
        nutrition.textContent = "";
        return;
    }

    for (let i = 0; i < ingredients.length; i++) {
        const ingredient = ingredients[i];
        const li = document.createElement("li");
        li.textContent = `${ingredient.name}, ${formatValue(ingredient.grams)} g, ${formatValue(ingredient.kcal)} kcal`;
        list.appendChild(li);
    }

    const totals = calculateNutrientTotals(ingredients);
    nutrition.textContent = `Summa: ${formatValue(totals.kcal)} kcal | Protein ${formatValue(totals.protein)} g | Kolhydrater ${formatValue(totals.carbs)} g 
    | Fett ${formatValue(totals.fat)} g | Fiber ${formatValue(totals.fiber)} g | Socker ${formatValue(totals.sugar)} g | Salt ${formatValue(totals.salt)} g`;
}

// Renders the current day and slot context text
function renderMealContextText() {
    const appState = window.appState;
    const contextElement = document.getElementById("mealContext");
    if (!contextElement) {
        return;
    }

    const dayLabel = getDayLabelFromKey(appState.selectedDay);
    const slotLabel = getSlotLabelFromKey(appState.selectedSlot);
    contextElement.textContent = `Du lägger till rätt för ${dayLabel} - ${slotLabel}`;
}

window.mealHelpers = {
    readMealsFromStorage,
    writeMealsToStorage,
    readMealContextFromQueryParams,
    findMealForDayAndSlot,
    normalizeMealIngredients,
    setDeleteButtonVisibility,
    renderIngredientList,
    renderMealContextText,
    calculateNutrientTotals
};
