const MEAL_STORAGE_KEY = "simpleMealItems";
window.MEAL_STORAGE_KEY = MEAL_STORAGE_KEY;

function createDefaultMealState() {
    return {
        livsmedelLista: [],
        baseURL: "https://dataportal.livsmedelsverket.se/livsmedel",
        selectedNutrients: {
            kcal: null,
            protein: null,
            sugar: null,
            fat: null,
            carbs: null,
            fiber: null,
            salt: null
        },
        selectedName: "",
        mealItems: [],
        currentMealIngredients: [],
        selectedDay: "monday",
        selectedSlot: "breakfast"
    };
}

window.mealState = createDefaultMealState();