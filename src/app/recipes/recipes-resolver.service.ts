import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

import * as RecipeActions from '../recipes/store/recipes.actions';
import * as fromApp from '../store/app.reducer';
import { Recipe } from './recipe.model';

@Injectable({ providedIn: 'root' })
export class RecipesResolverService implements Resolve<Recipe[] | unknown> {
  constructor(
    private store: Store<fromApp.AppState>,
    private actions$: Actions
  ) {}

  // TODO ? RxJs operators way
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.store.select('recipe').pipe(
      take(1),
      map((recipeState) => recipeState.recipes),
      switchMap((recipes) => {
        // TODO ? using of() to return an observable that will return recipes
        if (recipes.length > 0) return of(recipes);

        this.store.dispatch(new RecipeActions.FetchRecipes());

        return this.actions$.pipe(ofType(RecipeActions.SET_RECIPES), take(1));
      })
    );

    /*
     TODO ? async way
     const recipes = await this.store
       .select('recipe')
       .pipe(
         map((recipeState) => recipeState.recipes),
         take(1)
       )
       .toPromise()
       .then((storeRecipes) => storeRecipes);

     TODO ? not calling fetchRecipes in case there's already recipes in the store
     if (recipes && recipes.length > 0) {
       return Promise.resolve([]);
     }

     this.store.dispatch(new RecipeActions.FetchRecipes());

     TODO * this will await until the SetRecipes action has been called once before it completes the observable
     return this.actions$.pipe(ofType(SET_RECIPES), take(1));
    */
  }
}
