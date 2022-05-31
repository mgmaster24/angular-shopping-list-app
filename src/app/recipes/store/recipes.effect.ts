import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { Recipe } from 'src/app/shared/models/recipe.model';
import * as fromApp from 'src/app/store/app.reducer';
import * as RecipesActions from './recipes.actions';

@Injectable()
export class RecipeEffects {
  private readonly recipeTableUrl: string =
    'https://shopping-recipe-list-91834-default-rtdb.firebaseio.com/recipes.json';

  fetchRecipes = createEffect(() => {
    return this.actions$.pipe(
      ofType(RecipesActions.FETCH_RECIPES),
      switchMap(() => {
        return this.httpClient.get<Recipe[]>(this.recipeTableUrl);
      }),
      map((recipes: Recipe[]) => {
        if (recipes === null) {
          return [];
        }

        return recipes.map((recipe: Recipe) => {
          return {
            ...recipe,
            ingredients: recipe.ingredients ? recipe.ingredients : [],
          };
        });
      }),
      map((recipes: Recipe[]) => {
        return new RecipesActions.SetRecipes(recipes);
      })
    );
  });

  storeRecipes = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(RecipesActions.STORE_RECIPES),
        withLatestFrom(this.store.select('recipes', 'recipes')),
        switchMap(([actionData, recipes]) => {
          return this.httpClient.put(this.recipeTableUrl, recipes);
        })
      );
    },
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private httpClient: HttpClient,
    private store: Store<fromApp.AppState>
  ) {}
}
