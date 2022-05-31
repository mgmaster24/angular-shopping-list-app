import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, tap } from 'rxjs/operators';
import * as RecipesActions from 'src/app/recipes/store/recipes.actions';
import { Recipe } from 'src/app/shared/models/recipe.model';
import * as fromApp from 'src/app/store/app.reducer';
import { RecipeService } from './recipe.service';

@Injectable({ providedIn: 'root' })
export class DataRepository {
  private readonly recipeTableUrl: string =
    'https://shopping-recipe-list-91834-default-rtdb.firebaseio.com/recipes.json';

  constructor(
    private httpClient: HttpClient,
    private recipeService: RecipeService,
    private store: Store<fromApp.AppState>
  ) {}

  saveRecipes() {
    const recipes = this.recipeService.recipes;
    this.httpClient.put(this.recipeTableUrl, recipes).subscribe((response) => {
      console.log(response);
    });
  }

  fetchRecipes() {
    return this.httpClient.get<Recipe[]>(this.recipeTableUrl).pipe(
      map((recipes: Recipe[]) => {
        return recipes.map((recipe: Recipe) => {
          return {
            ...recipe,
            ingredients: recipe.ingredients ? recipe.ingredients : [],
          };
        });
      }),
      tap((recipes: Recipe[]) => {
        this.store.dispatch(new RecipesActions.SetRecipes(recipes));
        // this.recipeService.recipes = recipes;
      })
    );
  }
}
