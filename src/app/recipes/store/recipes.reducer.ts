import { Recipe } from 'src/app/shared/models/recipe.model';
import * as RecipesActions from './recipes.actions';

export interface State {
  recipes: Recipe[];
}

const initialState: State = { recipes: [] };

export function recipeReducer(
  state: State = initialState,
  action: RecipesActions.RecipesActions
): State {
  switch (action.type) {
    case RecipesActions.SET_RECIPES:
      return {
        ...state,
        recipes: [...action.payload],
      };
    case RecipesActions.ADD_RECIPE:
      return {
        ...state,
        recipes: [...state.recipes, action.payload],
      };

    case RecipesActions.DELETE_RECIPE:
      return {
        ...state,
        recipes: state.recipes.filter((recipe, index) => {
          return index !== action.payload;
        }),
      };

    case RecipesActions.UPDATE_RECIPE:
      const updatedRecipe: Recipe = {
        ...state.recipes[action.payload.index],
        ...action.payload.newRecipe,
      };

      const updatedRecipes = [...state.recipes];
      updatedRecipes[action.payload.index] = updatedRecipe;

      return {
        ...state,
        recipes: updatedRecipes,
      };

    case RecipesActions.STORE_RECIPES:
      return {
        ...state,
      };
    default:
      return state;
  }
}
