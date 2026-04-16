const MEAL_STORAGE_KEY = "simpleMealItems";
const WEEK_DAYS = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" }
];
const MEAL_SLOTS = [
    { key: "breakfast", label: "Breakfast" },
    { key: "lunch", label: "Lunch" },
    { key: "snack", label: "Snack" },
    { key: "dinner", label: "Dinner" }
];

function isKnownDayKey(day) {
    for (let i = 0; i < WEEK_DAYS.length; i++) {
        if (WEEK_DAYS[i].key === day) {
            return true;
        }
    }

    return false;
}

function isKnownMealSlotKey(slot) {
    for (let i = 0; i < MEAL_SLOTS.length; i++) {
        if (MEAL_SLOTS[i].key === slot) {
            return true;
        }
    }

    return false;
}

function loadMealsFromStorage() {
    const stored = localStorage.getItem(MEAL_STORAGE_KEY);
    if (!stored) {
        return [];
    }

    try {
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
            return [];
        }

        const meals = [];

        for (let i = 0; i < parsed.length; i++) {
            const normalizedMeal = normalizeStoredMeal(parsed[i]);
            if (normalizedMeal) {
                meals.push(normalizedMeal);
            }
        }

        return meals;
    } catch {
        return [];
    }
}

//This function takes a meal item retrieved from storage and ensures that it has the expected structure and valid values
function normalizeStoredMeal(item) {

    const day = isKnownDayKey(item.day) ? item.day : "monday";
    const slot = isKnownMealSlotKey(item.slot) ? item.slot : "breakfast";
    const title = String(item.title || item.name).trim();
    let totalKcal = 0;

    if (item.totalKcal !== undefined && item.totalKcal !== null) {
        totalKcal = parseNumericValue(item.totalKcal);
    } else {
        totalKcal = parseNumericValue(item.kcal);
    }

    if (!title) {
        return null;
    }

    return {day,slot,title,totalKcal};
}


//Builds the HTML structure for a days meal card
function buildDayCard(day, mealMap) {
    const card = document.createElement("article");
    card.className = "dayCard";

    const dayHeading = document.createElement("h2");
    dayHeading.className = "dayTab";
    dayHeading.textContent = day.label;

    const mealList = document.createElement("ul");
    mealList.className = "dayList";

    for (let i = 0; i < MEAL_SLOTS.length; i++) {
        const slot = MEAL_SLOTS[i];
        const mealRow = document.createElement("li");
        mealRow.className = "dayRow";

        const mealTypeLabel = document.createElement("span");
        mealTypeLabel.className = "mealType";
        mealTypeLabel.textContent = slot.label;

        const mealEntry = mealMap[`${day.key}:${slot.key}`];
        if (mealEntry) {
            const mealLink = document.createElement("a");
            mealLink.className = "mealText mealLink";
            mealLink.href = `add.html?day=${day.key}&slot=${slot.key}`;
            mealLink.textContent = `${mealEntry.title} (${formatValue(mealEntry.totalKcal)} kcal)`;
            mealRow.appendChild(mealTypeLabel);
            mealRow.appendChild(mealLink);
        } else {
            const addMealLink = document.createElement("a");
            addMealLink.className = "mealText addMealLink";
            addMealLink.href = `add.html?day=${day.key}&slot=${slot.key}`;
            addMealLink.textContent = "Add meal";
            mealRow.appendChild(mealTypeLabel);
            mealRow.appendChild(addMealLink);
        }

        mealList.appendChild(mealRow);
    }

    card.appendChild(dayHeading);
    card.appendChild(mealList);
    return card;
}

function renderWeeklyMealBoard() {
    const items = loadMealsFromStorage();
    const mealMap = {};
    const weekGrid = document.getElementById("weekGrid");
    const totalNutrition = document.getElementById("totalNutrition");

    if (!weekGrid) {
        return;
    }

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        mealMap[`${item.day}:${item.slot}`] = item;
    }

    weekGrid.innerHTML = "";
    for (let i = 0; i < WEEK_DAYS.length; i++) {
        const day = WEEK_DAYS[i];
        weekGrid.appendChild(buildDayCard(day, mealMap));
    }

    if (totalNutrition) {
        let totalKcal = 0;
        for (let i = 0; i < items.length; i++) {
            totalKcal += items[i].totalKcal;
        }

        totalNutrition.innerHTML = `<strong>Total: ${formatValue(totalKcal)} kcal</strong>`;
    }
}

renderWeeklyMealBoard();
