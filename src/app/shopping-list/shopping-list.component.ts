import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, Subscription } from 'rxjs';
import { Ingredient } from '../shared/models/ingredient.model';
import * as fromApp from '../store/app.reducer';
import * as ShoppingListActions from './store/shopping-list.actions';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css'],
})
export class ShoppingListComponent implements OnInit {
  selectedIngredient: Ingredient;
  ingredients: Observable<{ ingredients: Ingredient[] }>;
  ingredientsChangedSub: Subscription;
  startedEditing = new Subject<number>();
  constructor(private store: Store<fromApp.AppState>) {}

  ngOnInit() {
    this.ingredients = this.store.select('shoppingList');
  }

  onIngredientSelected(ingredient: Ingredient) {
    this.store.dispatch(new ShoppingListActions.StartEdit(ingredient));
  }
}
