import { Recipe } from './../recipe.model';

export const EDIT_RECIPE = '[Recipes] Edit Recipe';
export const ADD_RECIPE = '[Recipes] Add Recipe';
export const SET_RECIPES = '[Recipes] Set Recipes';
export const DELETE_RECIPE = '[Recipes] Delete Recipe';
export const UPDATE_RECIPE = '[Recipes] Update Recipe';

export class EditRecipe {
  readonly type = EDIT_RECIPE;

  constructor(public payload: number) {}
}

export class AddRecipe {
  readonly type = ADD_RECIPE;

  constructor(public payload: Recipe) {}
}

export class SetRecipes {
  readonly type = SET_RECIPES;

  constructor(public payload: Recipe[]) {}
}

export class UpdateRecipe {
  readonly type = UPDATE_RECIPE;

  constructor(public payload: Recipe) {}
}

export class DeleteRecipe {
  readonly type = DELETE_RECIPE;

  constructor(public payload: number) {}
}

export type RecipeActions =
  | EditRecipe
  | AddRecipe
  | SetRecipes
  | UpdateRecipe
  | DeleteRecipe;
