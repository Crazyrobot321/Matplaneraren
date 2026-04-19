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

// Builds link to add meal page for one day and slot
function buildAddMealPageHref(dayKey, slotKey) {
    return `add.html?day=${dayKey}&slot=${slotKey}`;
}

// Loads planned meals from localStorage
function loadMealsFromStorage() {
    const stored = localStorage.getItem(MEAL_STORAGE_KEY);
    if (!stored) {
        console.warn("No meals found in storage");
        return [];
    }

    try {
        const parsed = JSON.parse(stored);
        console.log("Loaded meals from storage: ", parsed);
        return parsed;
    } catch {
        console.error("Error parsing stored meals");
        return [];
    }
}

// Builds the meal card UI for one day
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
        mealRow.appendChild(mealTypeLabel);

        const mealEntry = mealMap[`${day.key}:${slot.key}`];
        const mealLink = document.createElement("a");
        mealLink.href = buildAddMealPageHref(day.key, slot.key);

        if (mealEntry) {
            mealLink.className = "mealText mealLink";
            mealLink.textContent = `${mealEntry.title} (${formatValue(mealEntry.totalKcal)} kcal)`;
        } else {
            mealLink.className = "mealText addMealLink";
            mealLink.textContent = "Add meal";
        }
        mealRow.appendChild(mealLink);

        mealList.appendChild(mealRow);
    }

    card.appendChild(dayHeading);
    card.appendChild(mealList);
    return card;
}

// Renders weekly board
function renderWeeklyMealBoard() {
    const items = loadMealsFromStorage();
    const mealMap = {};
    const weekGrid = document.getElementById("weekGrid");

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
}

renderWeeklyMealBoard();
