import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import * as fromApp from 'src/app/store/app.reducer';

import { Recipe } from '../recipe.model';
import * as RecipeActions from '../store/recipes.actions';
import { Ingredient } from './../../shared/ingredient.model';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.css'],
})
export class RecipeEditComponent implements OnInit, OnDestroy {
  id: number;
  editMode = false;
  recipeForm: FormGroup;

  private storeSub: Subscription;

  get ingredientsControls() {
    return (this.recipeForm.get('ingredients') as FormArray).controls;
  }

  constructor(
    private route: ActivatedRoute,
    private store: Store<fromApp.AppState>,
    private router: Router
  ) {}
  ngOnDestroy(): void {
    if (this.storeSub) this.storeSub.unsubscribe();
  }

  ngOnInit() {
    this.route.params.pipe(map((params) => +params.id)).subscribe((id) => {
      this.id = id;
      // TODO ? just a JS fact but if params.id is null then +params.id evaluates to NaN, which is falsy
      this.editMode = !!id;
      this.initForm();
    });
  }

  onSubmit() {
    const { name, description, imagePath, ingredients } = this.recipeForm.value;

    const newRecipe = new Recipe(name, description, imagePath, ingredients);

    if (this.editMode) {
      this.store.dispatch(
        new RecipeActions.UpdateRecipe({ index: this.id, newRecipe })
      );
    } else {
      this.store.dispatch(new RecipeActions.AddRecipe(newRecipe));
    }
    this.onCancel();
  }

  onAddIngredient() {
    (this.recipeForm.get('ingredients') as FormArray).push(
      this.setIngredientFormGroup()
    );
  }

  onDeleteIngredient(index: number) {
    (this.recipeForm.get('ingredients') as FormArray).removeAt(index);
  }

  onCancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  private initForm() {
    if (this.editMode) {
      this.storeSub = this.store
        .select('recipe')
        .pipe(
          map((recipesState) =>
            recipesState.recipes.find((rec, idx) => idx === this.id)
          )
        )
        .subscribe((storeRecipe) => {
          this.setRecipeForm(storeRecipe);
        });
    } else {
      this.setRecipeForm();
    }
  }

  setRecipeForm(recipe?: Recipe) {
    recipe = recipe ? recipe : Recipe.empty();

    const { name, imagePath, description, ingredients } = recipe;

    const recipeIngredients = new FormArray([]);

    if (ingredients) {
      for (const ingredient of ingredients) {
        recipeIngredients.push(this.setIngredientFormGroup(ingredient));
      }
    }

    this.recipeForm = new FormGroup({
      name: new FormControl(name, Validators.required),
      imagePath: new FormControl(imagePath, Validators.required),
      description: new FormControl(description, Validators.required),
      ingredients: recipeIngredients,
    });
  }

  setIngredientFormGroup(ingredient?: Ingredient): FormGroup {
    const { name, amount } = ingredient
      ? ingredient
      : { name: null, amount: null };

    return new FormGroup({
      name: new FormControl(name, Validators.required),
      amount: new FormControl(amount, [
        Validators.required,
        Validators.pattern(/^[1-9]+[0-9]*$/),
      ]),
    });
  }
}
