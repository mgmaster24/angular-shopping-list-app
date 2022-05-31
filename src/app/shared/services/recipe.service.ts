import { Injectable, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Recipe } from 'src/app/shared/models/recipe.model';
import { Ingredient } from '../models/ingredient.model';

@Injectable({ providedIn: 'root' })
export class RecipeService implements OnInit {
  private recipeArray: Recipe[] = [];

  recipesChanged = new Subject<Recipe[]>();

  constructor() {}

  ngOnInit(): void {}

  get recipes(): Recipe[] {
    return this.recipeArray;
  }

  set recipes(value: Recipe[]) {
    this.recipeArray = value;
    this.recipesChanged.next(this.recipes);
  }

  getRecipe(index: number): Recipe {
    return this.recipeArray[index];
  }

  addRecipe(recipe: Recipe): void {
    this.recipeArray.push(recipe);
    this.recipesChanged.next(this.recipes);
  }

  addIngredient(recipe: Recipe, ingredient: Ingredient) {
    recipe.ingredients.push(ingredient);
    this.recipesChanged.next(this.recipes);
  }

  updateRecipe(index: number, recipe: Recipe): void {
    this.recipeArray[index] = recipe;
    this.recipesChanged.next(this.recipes);
  }

  removeRecipeAtIndex(index: number): void {
    this.recipeArray.splice(index, 1);
    this.recipesChanged.next(this.recipes);
  }
}
