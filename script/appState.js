//Global app state shared across pages and modules.
//Attached to window so it is available everywhere in the browser runtime.
const MEAL_STORAGE_KEY = "simpleMealItems";
window.MEAL_STORAGE_KEY = MEAL_STORAGE_KEY;

window.appState = {
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
    selectedDay: "monday", //Default selected day
    selectedSlot: "breakfast" //Default selected slot
};
