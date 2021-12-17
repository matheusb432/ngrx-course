import { Recipe } from './../recipe.model';
import * as RecipeActions from './recipes.actions';

export interface State {
  recipes: Recipe[];
  editRecipe: Recipe;
  editRecipeIndex: number;
}

const initialState = {
  recipes: [],
  editRecipe: null,
  editRecipeIndex: -1,
};

export function recipeReducer(
  state: State = initialState,
  action: RecipeActions.RecipeActions
): State {
  switch (action.type) {
    case RecipeActions.ADD_RECIPE:
      return {
        ...state,
        recipes: [...state.recipes, action.payload],
      };

    case RecipeActions.SET_RECIPES:
      return {
        ...state,
        recipes: [...action.payload],
      };

    case RecipeActions.EDIT_RECIPE:
      const recipeToEdit = {
        ...state.recipes.find((_, idx) => idx === action.payload),
      };

      return {
        ...state,
        editRecipe: recipeToEdit,
        editRecipeIndex: action.payload,
      };

    case RecipeActions.UPDATE_RECIPE:
      const newRecipes = state.recipes.filter(
        (rec, idx) => idx !== state.editRecipeIndex
      );
      const updatedRecipe = action.payload;

      return {
        ...state,
        recipes: [...newRecipes, updatedRecipe],
      };

    case RecipeActions.DELETE_RECIPE:
      return {
        ...state,
        recipes: state.recipes.filter((_, idx) => idx !== action.payload),
      };

    default:
      return state;
  }
}
