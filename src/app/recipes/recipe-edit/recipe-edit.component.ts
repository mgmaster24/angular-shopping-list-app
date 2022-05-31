import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import * as fromApp from 'src/app/store/app.reducer';
import { Recipe } from '../../shared/models/recipe.model';
import * as RecipesActions from '../store/recipes.actions';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css'],
})
export class RecipeEditComponent implements OnInit, OnDestroy {
  index: number;
  editMode = false;
  paramsSub: Subscription;
  recipeForm: FormGroup;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private store: Store<fromApp.AppState>
  ) {}

  get ingredientsFormArray(): FormArray {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  get controls(): AbstractControl[] {
    return this.ingredientsFormArray.controls;
  }

  ngOnInit(): void {
    this.paramsSub = this.activatedRoute.params
      .pipe(
        map((params) => {
          this.editMode = params['id'] != null;
          return +params['id'];
        }),
        switchMap((id) => {
          this.index = id;
          return this.store.select('recipes', 'recipes');
        }),
        map((recipes: Recipe[]) => {
          return recipes.find((recipe, index) => {
            return index === this.index;
          });
        })
      )
      .subscribe((recipe: Recipe) => {
        this.initForm(recipe);
      });
  }

  ngOnDestroy(): void {
    this.paramsSub.unsubscribe();
  }

  private initForm(selectedRecipe: Recipe) {
    let recipeName = '';
    let recipeImagePath = '';
    let recipeDescription = '';
    const recipeIngredients: FormArray = new FormArray([]);

    if (this.editMode) {
      recipeName = selectedRecipe.name;
      recipeImagePath = selectedRecipe.imagePath;
      recipeDescription = selectedRecipe.description;
      if (selectedRecipe.ingredients) {
        for (const ingredient of selectedRecipe.ingredients) {
          recipeIngredients.push(
            new FormGroup({
              name: new FormControl(ingredient.name, [Validators.required]),
              amount: new FormControl(ingredient.amount, [
                Validators.required,
                Validators.pattern(/^[1-9]+[0-9]*$/),
              ]),
            })
          );
        }
      }
    }

    this.recipeForm = new FormGroup({
      name: new FormControl(recipeName, [Validators.required]),
      imagePath: new FormControl(recipeImagePath, [Validators.required]),
      description: new FormControl(recipeDescription, [Validators.required]),
      ingredients: recipeIngredients,
    });
  }

  onSave() {
    if (this.editMode) {
      this.store.dispatch(
        new RecipesActions.UpdateRecipe({
          index: this.index,
          newRecipe: this.recipeForm.value,
        })
      );
    } else {
      this.store.dispatch(new RecipesActions.AddRecipe(this.recipeForm.value));
    }

    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }

  onCancel() {
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }

  onAddIngredient() {
    this.ingredientsFormArray.push(
      new FormGroup({
        name: new FormControl(null, [Validators.required]),
        amount: new FormControl(null, [
          Validators.required,
          Validators.pattern(/^[1-9]+[0-9]*$/),
        ]),
      })
    );
  }

  onDeleteIngredient(index: number) {
    this.ingredientsFormArray.removeAt(index);
  }
}
