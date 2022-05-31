import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Ingredient } from 'src/app/shared/models/ingredient.model';
import * as fromApp from '../../store/app.reducer';
import * as ShoppingListActions from '../store/shopping-list.actions';

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css'],
})
export class ShoppingEditComponent implements OnInit, OnDestroy {
  @ViewChild('form', { static: false }) shoppingEditForm: NgForm;
  editingIngredientSubscription: Subscription;
  editMode = false;
  editingIngredient: Ingredient;

  constructor(private store: Store<fromApp.AppState>) {}

  ngOnInit() {
    this.editingIngredientSubscription = this.store
      .select('shoppingList')
      .subscribe((stateData) => {
        if (stateData.editedIngredient) {
          this.editingIngredient = stateData.editedIngredient;
          this.editMode = true;
          this.shoppingEditForm.setValue({
            itemName: stateData.editedIngredient.name,
            amount: stateData.editedIngredient.amount,
          });
        } else {
          this.editMode = false;
        }
      });
  }

  ngOnDestroy() {
    this.editingIngredientSubscription.unsubscribe();
    this.store.dispatch(new ShoppingListActions.StopEdit());
  }

  onSubmit(form: NgForm) {
    if (!this.editMode) {
      const addAction = new ShoppingListActions.AddIngredient(
        new Ingredient(form.value.itemName, form.value.amount)
      );
      this.store.dispatch(addAction);
    } else {
      const updateAction = new ShoppingListActions.UpdateIngredient({
        update: new Ingredient(form.value.itemName, form.value.amount),
      });

      this.store.dispatch(updateAction);
    }

    this.editMode = false;
    this.shoppingEditForm.reset();
  }

  onDelete() {
    this.store.dispatch(new ShoppingListActions.DeleteIngredient());
    this.onClear();
  }

  onClear() {
    this.editMode = false;
    this.shoppingEditForm.reset();
    this.store.dispatch(new ShoppingListActions.StopEdit());
  }
}
