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

// Renders weekly board
function renderWeeklyMealBoard() {
    const stored = localStorage.getItem(window.MEAL_STORAGE_KEY);
    let items = [];
    if (!stored) {
        console.warn("No meals found in storage");
    } else {
        try {
            items = JSON.parse(stored);
            console.log("Loaded meals from storage: ", items);
        } catch {
            console.error("Error parsing stored meals");
        }
    }

    const weekGrid = document.getElementById("weekGrid");

    if (!weekGrid) {
        return;
    }

    weekGrid.innerHTML = "";
    for (let row = 0; row < WEEK_DAYS.length; row++) {
        //Builds the day card for each day of the week
        const day = WEEK_DAYS[row];
        const card = document.createElement("article");
        card.className = "dayCard";

        const dayHeading = document.createElement("h2");
        dayHeading.className = "dayTab";
        dayHeading.textContent = day.label;

        const mealList = document.createElement("ul");
        mealList.className = "dayList";

        for (let col = 0; col < MEAL_SLOTS.length; col++) {
            //Builds the meal slot for each meal type within the day card
            const slot = MEAL_SLOTS[col];
            const mealRow = document.createElement("li");
            mealRow.className = "dayRow";

            const mealTypeLabel = document.createElement("span");
            mealTypeLabel.className = "mealType";
            mealTypeLabel.textContent = slot.label;
            mealRow.appendChild(mealTypeLabel);

            //Populates meal slot with either existing meal or add link based on stored data
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

renderWeeklyMealBoard();

const clearAllMealsButton = document.getElementById("clearAllMealsButton");
if (clearAllMealsButton) {
    clearAllMealsButton.addEventListener("click", function () {
        const shouldClear = confirm("Vill du rensa alla sparade maltider?");
        if (!shouldClear) {
            return;
        }

        localStorage.removeItem(window.MEAL_STORAGE_KEY);
        renderWeeklyMealBoard();
    });
}
