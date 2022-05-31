import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import * as RecipesActions from 'src/app/recipes/store/recipes.actions';
import * as AuthActions from '../auth/store/auth.actions';
import { User } from '../auth/user.model';
import * as fromApp from '../store/app.reducer';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private userSubSubscription: Subscription;
  loggedInUser: User = null;

  constructor(private store: Store<fromApp.AppState>) {}

  ngOnInit() {
    this.userSubSubscription = this.store
      .select('auth', 'user')
      .subscribe((user) => {
        this.loggedInUser = user;
      });
  }

  ngOnDestroy() {
    this.userSubSubscription.unsubscribe();
  }

  onSaveData() {
    this.store.dispatch(new RecipesActions.StoreRecipes());
  }

  onFetchData() {
    this.store.dispatch(new RecipesActions.FetchRecipes());
  }

  onLogout() {
    this.store.dispatch(new AuthActions.Logout());
  }
}
