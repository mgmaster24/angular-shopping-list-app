import { Ingredient } from '../../shared/models/ingredient.model';
import * as ShoppingListActions from './shopping-list.actions';

export interface State {
  ingredients: Ingredient[];
  editedIngredient: Ingredient;
}

const initialState: State = {
  ingredients: [new Ingredient('Apples', 10), new Ingredient('Tomatoes', 5)],
  editedIngredient: null,
};

export function shoppingListReducer(
  state: State = initialState,
  action: ShoppingListActions.ShoppingListActionsUnion
) {
  const updatedIngredients = [...state.ingredients];
  const editedIngredient = state.editedIngredient;
  switch (action.type) {
    case ShoppingListActions.ADD_INGREDIENT:
      if (!update(action.payload, updatedIngredients)) {
        updatedIngredients.push(action.payload);
      }

      return {
        ...state,
        ingredients: updatedIngredients,
      };
    case ShoppingListActions.ADD_INGREDIENTS:
      action.payload.forEach((ingredient: Ingredient) => {
        if (!update(ingredient, updatedIngredients)) {
          updatedIngredients.push(ingredient);
        }
      });
      return {
        ...state,
        ingredients: updatedIngredients,
      };
    case ShoppingListActions.UPDATE_INGREDIENT:
      const updateIngredient = action.payload.update;
      const existingIndex = updatedIngredients.findIndex(
        (ing) => ing.name === editedIngredient.name
      );

      if (existingIndex > -1) {
        const ingredientToUpdate = updatedIngredients[existingIndex];
        const updatedIngredient = {
          ...ingredientToUpdate,
          ...updateIngredient,
        };

        updatedIngredients[existingIndex] = updatedIngredient;
      }

      return {
        ...state,
        ingredients: updatedIngredients,
        editedIngredient: null,
      };
    case ShoppingListActions.DELETE_INGREDIENT:
      const index: number = updatedIngredients.findIndex(
        (ing) => ing.name === editedIngredient.name
      );

      if (index > -1) {
        updatedIngredients.splice(index, 1);
      }
      return {
        ...state,
        ingredients: updatedIngredients,
        editedIngredient: null,
      };

    case ShoppingListActions.START_EDIT:
      return {
        ...state,
        editedIngredient: action.payload,
      };
    case ShoppingListActions.STOP_EDIT:
      return {
        ...state,
        editedIngredient: null,
      };
    default:
      return state;
  }
}

function update(ingredient: Ingredient, ingredients: Ingredient[]): boolean {
  const found: Ingredient = ingredients.find(
    (ing) => ing.name === ingredient.name
  );
  if (!found) {
    return false;
  }

  found.amount += ingredient.amount;
  return true;
}
