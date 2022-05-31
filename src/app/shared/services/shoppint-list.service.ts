import { Injectable, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Ingredient } from '../models/ingredient.model';

@Injectable({ providedIn: 'root' })
export class ShoppingListService implements OnInit {
  constructor() {}

  get ingredients(): Ingredient[] {
    return this.ingredientArray.slice();
  }

  private ingredientArray: Ingredient[] = [
    new Ingredient('Apples', 10),
    new Ingredient('Tomatoes', 5),
  ];

  ingredientsChanged = new Subject<Ingredient[]>();
  editingIngredient = new Subject<Ingredient>();

  addIngre;

  ngOnInit(): void {}

  addIngredient(ingredient: Ingredient) {
    if (!this.update(ingredient)) {
      this.ingredientArray.push(ingredient);
    }
    this.ingredientsChanged.next(this.ingredients);
  }

  addIngredients(ingredients: Ingredient[]) {
    ingredients.forEach((ingredient: Ingredient) => {
      if (!this.update(ingredient)) {
        this.ingredientArray.push(ingredient);
      }
    });
    this.ingredientsChanged.next(this.ingredients);
  }

  updateIngredient(oldIgredient: Ingredient, newIngredient: Ingredient): void {
    const index: number = this.ingredientArray.findIndex(
      (ing) => ing.name === oldIgredient.name
    );

    if (index > -1) {
      this.ingredientArray[index].name = newIngredient.name;
      this.ingredientArray[index].amount = newIngredient.amount;
    }

    this.ingredientsChanged.next(this.ingredients);
  }

  deleteIngredient(ingredient: Ingredient) {
    const index: number = this.ingredientArray.findIndex(
      (ing) => ing.name === ingredient.name
    );

    if (index > -1) {
      this.ingredientArray.splice(index, 1);
    }

    this.ingredientsChanged.next(this.ingredients);
  }

  deleteIngredients(ingredients: Ingredient[]) {
    for (let i = ingredients.length; i > 0; i--) {
      this.deleteIngredient(ingredients[i]);
    }

    this.ingredientsChanged.next(this.ingredients);
  }

  private update(ingredient: Ingredient): boolean {
    const found: Ingredient = this.ingredientArray.find(
      (ing) => ing.name === ingredient.name
    );
    if (!found) {
      return false;
    }

    found.amount += ingredient.amount;
    return true;
  }
}
