const MEAL_STORAGE_KEY = "simpleMealItems";

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
//URLSearchParams is used to parse the query string from the URL, 
//which contains the parameters passed to the page
//For example, if the URL is "add.html?day=monday&slot=breakfast", 
//then query.get("day") will return "monday" and query.get("slot") will return "breakfast"
function readMealContextFromQueryParams() {
    const query = new URLSearchParams(window.location.search);
    const day = query.get("day");
    const slot = query.get("slot");

    return { day, slot };
}

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

function writeMealsToStorage(items) {
    localStorage.setItem(MEAL_STORAGE_KEY, JSON.stringify(items));
}

function getLabelFromKey(labels, key, fallbackKey) {
    if (labels[key]) {
        return labels[key];
    }

    return labels[fallbackKey];
}

function getDayLabelFromKey(dayKey) {
    return getLabelFromKey(DAY_LABELS, dayKey, "monday");
}

function getSlotLabelFromKey(slotKey) {
    return getLabelFromKey(SLOT_LABELS, slotKey, "breakfast");
}

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
            grams: Number(ingredient.grams),
            kcal: Number(ingredient.kcal),
            protein: Number(ingredient.protein),
            sugar: Number(ingredient.sugar),
            fat: Number(ingredient.fat),
            carbs: Number(ingredient.carbs),
            fiber: Number(ingredient.fiber),
            salt: Number(ingredient.salt)
        });
    }

    return normalized;
}

function findMealForDayAndSlot(meals, day, slot) {
    for (let i = 0; i < meals.length; i++) {
        const meal = meals[i];
        if (meal.day === day && meal.slot === slot) {
            return meal;
        }
    }

    return null;
}

function setDeleteButtonVisibility(show) {
    const deleteButton = document.getElementById("deleteMealButton");
    if (!deleteButton) {
        return;
    }

    deleteButton.classList.toggle("hidden", !show);
}

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
        totals.kcal += Number(ingredient.kcal);
        totals.protein += Number(ingredient.protein);
        totals.sugar += Number(ingredient.sugar);
        totals.fat += Number(ingredient.fat);
        totals.carbs += Number(ingredient.carbs);
        totals.fiber += Number(ingredient.fiber);
        totals.salt += Number(ingredient.salt);
    }
    console.log("Total nutrition: ", totals);
    return totals;
}

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
    nutrition.textContent = `Summa: ${formatValue(totals.kcal)} kcal | Protein ${formatValue(totals.protein)} g | Kolhydrater ${formatValue(totals.carbs)} g | Fett ${formatValue(totals.fat)} g`;
}

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
