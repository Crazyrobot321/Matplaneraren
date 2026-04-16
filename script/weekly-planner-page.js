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

function loadMealsFromStorage() {
    const stored = localStorage.getItem(MEAL_STORAGE_KEY);
    if (!stored) {
        return [];
    }

    try {
        console.log("Loaded meals from storage: ", JSON.parse(stored));
        return JSON.parse(stored);
    } catch {
        console.error("Error parsing stored meals");
        return [];
    }
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
