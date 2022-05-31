import {
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { AlertComponent } from '../shared/alert/alert.component';
import { PlaceholderDirective } from '../shared/directives/placeholder/placeholder.directive';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit, OnDestroy {
  isLoginMode = true;
  isLoading = false;
  error: string = null;
  @ViewChild(PlaceholderDirective, { static: false })
  alertHost: PlaceholderDirective;
  closeSub: Subscription;
  authSub: Subscription;
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private store: Store<fromApp.AppState>
  ) {}

  ngOnInit() {
    this.authSub = this.store.select('auth').subscribe((authState) => {
      this.isLoading = authState.loading;
      this.error = authState.authError;
      if (this.error) {
        this.showErrorAlert(this.error);
      }
    });
  }

  ngOnDestroy() {
    if (this.closeSub) {
      this.closeSub.unsubscribe();
    }

    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(form: NgForm) {
    const email = form.value.email;
    const password = form.value.password;
    if (!this.isLoginMode) {
      this.store.dispatch(new AuthActions.SignupStart({ email, password }));
    } else {
      this.store.dispatch(new AuthActions.LoginStart({ email, password }));
    }

    form.reset();
  }

  private showErrorAlert(errorMsg: string) {
    const alertComponentFactory: ComponentFactory<AlertComponent> =
      this.componentFactoryResolver.resolveComponentFactory(AlertComponent);
    this.alertHost.viewContainerRef.clear();
    const alertComponent: ComponentRef<AlertComponent> =
      this.alertHost.viewContainerRef.createComponent(alertComponentFactory);
    alertComponent.instance.message = errorMsg;
    this.closeSub = alertComponent.instance.close.subscribe(() => {
      this.store.dispatch(new AuthActions.ClearError());
      this.alertHost.viewContainerRef.clear();
      this.closeSub.unsubscribe();
    });
  }
}
