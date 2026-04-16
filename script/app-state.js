
//Centralized collection of application state variables. This object is used to store and manage the state of the application,
//including the list of food items, selected nutrients, meal items, and other relevant data
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
    selectedDay: "monday",
    selectedSlot: "breakfast"
};
