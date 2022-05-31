import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthAutoLogoutService } from '../auth-auto-logout.service';
import { AuthResponseData } from '../auth-response-data.interface';
import { User } from '../user.model';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  private signInUrl =
    'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=';
  private signUpUrl =
    'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=';

  authLogin = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.LOGIN_START),
      switchMap((loginStartAction: AuthActions.LoginStart) => {
        return this.sendRequest(loginStartAction, this.signInUrl);
      })
    );
  });

  authRedirect = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(AuthActions.AUTHENTICATE_SUCCESS, AuthActions.LOGOUT),
        tap((action: AuthActions.AuthenticateSuccess | AuthActions.Logout) => {
          switch (action.type) {
            case AuthActions.AUTHENTICATE_SUCCESS:
              if (action.payload.redirect) {
                this.router.navigate(['/']);
              }
              break;
            case AuthActions.LOGOUT:
              this.router.navigate(['/auth']);
              break;
          }
        })
      );
    },
    { dispatch: false }
  );

  authSignup = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.SIGNUP_START),
      switchMap((signupAction: AuthActions.SignupStart) => {
        return this.sendRequest(signupAction, this.signUpUrl);
      })
    );
  });

  authLogout = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(AuthActions.LOGOUT),
        tap(() => {
          this.autoLogoutService.clearLogoutTimer();
          localStorage.removeItem('user');
        })
      );
    },
    { dispatch: false }
  );

  authAutoLogin = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.AUTO_LOGIN),
      map(() => {
        const userData: {
          email: string;
          id: string;
          _token: string;
          _tokenExpirationDate: string;
        } = JSON.parse(localStorage.getItem('user'));

        if (!userData) {
          return { type: 'NOACTION ' };
        }

        const tokenExpirationDate = new Date(userData._tokenExpirationDate);
        const user: User = new User(
          userData.email,
          userData.id,
          userData._token,
          tokenExpirationDate
        );

        if (user.token) {
          this.autoLogoutService.setLogoutTimer(
            tokenExpirationDate.getTime() - new Date().getTime()
          );
          return new AuthActions.AuthenticateSuccess({ user, redirect: false });
        }

        return { type: 'NOACTION' };
      })
    );
  });

  constructor(
    private actions$: Actions,
    private httpClient: HttpClient,
    private router: Router,
    private autoLogoutService: AuthAutoLogoutService
  ) {}

  private sendRequest(
    action: AuthActions.LoginStart | AuthActions.SignupStart,
    url: string
  ): Observable<
    AuthActions.AuthenticateSuccess | AuthActions.AuthenticateFail
  > {
    return this.httpClient
      .post<AuthResponseData>(`${url}${environment.authApiKey}`, {
        email: action.payload.email,
        password: action.payload.password,
        returnSecureToken: true,
      })
      .pipe(
        map((respData) => {
          return this.handleAuth(respData);
        }),
        catchError(this.handleError)
      );
  }

  private handleAuth(
    respData: AuthResponseData
  ): AuthActions.AuthenticateSuccess {
    const expirationDate = new Date(
      new Date().getTime() + +respData.expiresIn * 1000
    );
    const user = new User(
      respData.email,
      respData.localId,
      respData.idToken,
      expirationDate
    );
    localStorage.setItem('user', JSON.stringify(user));
    this.autoLogoutService.setLogoutTimer(+respData.expiresIn * 1000);
    return new AuthActions.AuthenticateSuccess({ user, redirect: true });
  }

  private handleError(
    errorResp: HttpErrorResponse
  ): Observable<AuthActions.AuthenticateFail> {
    let errorMessage = 'An unknown error occurred!';
    if (!errorResp.error || !errorResp.error.error) {
      return of(new AuthActions.AuthenticateFail(errorMessage));
    }

    switch (errorResp.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'A user with that email already exists!';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'User not found!';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'Password is invalid!';
    }

    return of(new AuthActions.AuthenticateFail(errorMessage));
  }
}
