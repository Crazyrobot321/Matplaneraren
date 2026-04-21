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

// Loads planned meals from localStorage
// Retrieves saved meals for display on weekly planner
function loadMealsFromStorage() {
    const stored = localStorage.getItem(window.MEAL_STORAGE_KEY);
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

// Renders weekly board
// Displays the complete weekly meal planner with all days and meals
function renderWeeklyMealBoard() {
    const items = loadMealsFromStorage();
    const weekGrid = document.getElementById("weekGrid");

    if (!weekGrid) {
        return;
    }

    weekGrid.innerHTML = "";
    for (let i = 0; i < WEEK_DAYS.length; i++) {
        const day = WEEK_DAYS[i];
        const card = document.createElement("article");
        card.className = "dayCard";

        const dayHeading = document.createElement("h2");
        dayHeading.className = "dayTab";
        dayHeading.textContent = day.label;

        const mealList = document.createElement("ul");
        mealList.className = "dayList";

        for (let j = 0; j < MEAL_SLOTS.length; j++) {
            const slot = MEAL_SLOTS[j];
            const mealRow = document.createElement("li");
            mealRow.className = "dayRow";

            const mealTypeLabel = document.createElement("span");
            mealTypeLabel.className = "mealType";
            mealTypeLabel.textContent = slot.label;
            mealRow.appendChild(mealTypeLabel);

            let mealEntry = null;
            for (let k = 0; k < items.length; k++) {
                const item = items[k];
                if (item.day === day.key && item.slot === slot.key) {
                    mealEntry = item;
                    break;
                }
            }
            const mealLink = document.createElement("a");
            mealLink.href = `add.html?day=${day.key}&slot=${slot.key}`;

            if (mealEntry) {
                mealLink.className = "mealText mealLink";
                mealLink.textContent = `${mealEntry.title} (${displayNumber(mealEntry.totalKcal)} kcal)`;
            } else {
                mealLink.className = "mealText addMealLink";
                mealLink.textContent = "Add meal";
            }
            mealRow.appendChild(mealLink);

            mealList.appendChild(mealRow);
        }

        card.appendChild(dayHeading);
        card.appendChild(mealList);
        weekGrid.appendChild(card);
    }
}

function setupClearAllMealsButton() {
    const clearAllMealsButton = document.getElementById("clearAllMealsButton");
    if (!clearAllMealsButton) {
        return;
    }

    clearAllMealsButton.addEventListener("click", function () {
        const shouldClear = confirm("Vill du rensa alla sparade maltider?");
        if (!shouldClear) {
            return;
        }

        localStorage.removeItem(window.MEAL_STORAGE_KEY);
        renderWeeklyMealBoard();
    });
}

renderWeeklyMealBoard();
setupClearAllMealsButton();
