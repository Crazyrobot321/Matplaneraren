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

    return { //Returns an object containing the day and slot values extracted from the query string
        day: day,
        slot: slot
    };
}

function readMealsFromStorage() {
    const storedItems = localStorage.getItem(MEAL_STORAGE_KEY); // Retrieves the stored meal items from localStorage using the defined key
    if (!storedItems) {
        return []; //If there are no stored items, return an empty array and exit the function
    }

    try {
        const parsed = JSON.parse(storedItems);
        return parsed;
    } catch {
        return [];
    }
}

function writeMealsToStorage(items) {
    localStorage.setItem(MEAL_STORAGE_KEY, JSON.stringify(items)); //Converts the provided items array into a JSON string and stores it in localStorage under the defined key
}

function getDayLabelFromKey(dayKey) {
    //If the provided dayKey exists in the DAY_LABELS object, return the corresponding label; otherwise, return the label for "monday" as a default
    if (DAY_LABELS[dayKey]) {
        return DAY_LABELS[dayKey];
    }

    return DAY_LABELS.monday;
}

function getSlotLabelFromKey(slotKey) {
    if (SLOT_LABELS[slotKey]) {
        return SLOT_LABELS[slotKey];
    }

    return SLOT_LABELS.breakfast;
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
        //Push the nuutritional information of the ingredient into the normalized array, converting all values to numbers using the toNumber function
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
        //If the current meal's day and slot match the provided day and slot, return that meal
        if (meal.day === day && meal.slot === slot) {
            return meal;
        }
    }
    //Return null if no meal is found that matches the provided day and slot
    return null;
}

function setDeleteButtonVisibility(show) {
    const deleteButton = document.getElementById("deleteMealButton");
    if (!deleteButton) {
        return;
    }
    deleteButton.style.display = show ? "inline-flex" : "none";
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
