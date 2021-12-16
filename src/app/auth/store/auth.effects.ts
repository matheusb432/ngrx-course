import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthResponseData } from '../auth.service';

import * as AuthActions from './auth.actions';

const handleAuthentication = ({
  expiresIn,
  email,
  localId,
  idToken,
}: AuthResponseData) => {
  const expirationDate = new Date(new Date().getTime() + +expiresIn * 1000);
  // const { idToken, localId } = resData;

  return new AuthActions.AuthenticateSuccess({
    email,
    userId: localId,
    token: idToken,
    expirationDate,
  });
};

const handleError = (errorRes) => {
  let errorMessage = 'An unknown error occurred!';

  if (!errorRes.error || !errorRes.error.error) {
    return of(new AuthActions.AuthenticateFail(errorMessage));
    // TODO ? important to not throwError or the effect breaks
    // return throwError(errorMessage);
  }
  switch (errorRes.error.error.message) {
    case 'EMAIL_EXISTS':
      errorMessage = 'This email exists already';
      break;
    case 'EMAIL_NOT_FOUND':
      errorMessage = 'This email does not exist.';
      break;
    case 'INVALID_PASSWORD':
      errorMessage = 'This password is not correct.';
      break;
  }

  return of(new AuthActions.AuthenticateFail(errorMessage));
};

@Injectable()
export class AuthEffects {
  @Effect()
  authSignup = this.actions$.pipe(
    ofType(AuthActions.SIGNUP_START),
    switchMap((authData: AuthActions.SignupStart) => {
      const { email, password } = authData.payload;

      // return this.http.post<
      return this.http
        .post<AuthResponseData>(this.signupUrl, {
          email,
          password,
          returnSecureToken: true,
        })
        .pipe(map(handleAuthentication), catchError(handleError));
    })
  );

  // TODO * since effects are a continous stream of data, they should never return an error otherwise they will break completely
  @Effect()
  authLogin = this.actions$.pipe(
    ofType(AuthActions.LOGIN_START),
    switchMap((authData: AuthActions.LoginStart) => {
      const { email, password } = authData.payload;

      return this.http
        .post<AuthResponseData>(this.loginUrl, {
          email,
          password,
          returnSecureToken: true,
        })
        .pipe(
          map(handleAuthentication),
          // map((resData) => {
          //   const expirationDate = new Date(
          //     new Date().getTime() + +resData.expiresIn * 1000
          //   );
          //   const { idToken, localId } = resData;

          //   return new AuthActions.AuthenticateSuccess({
          //     email: resData.email,
          //     userId: localId,
          //     token: idToken,
          //     expirationDate,
          //   });
          // }),
          catchError(handleError)
          // catchError((errorRes) => {
          //   let errorMessage = 'An unknown error occurred!';

          //   if (!errorRes.error || !errorRes.error.error) {
          //     return of(new AuthActions.AuthenticateFail(errorMessage));
          //     // TODO ? important to not throwError or the effect breaks
          //     // return throwError(errorMessage);
          //   }
          //   switch (errorRes.error.error.message) {
          //     case 'EMAIL_EXISTS':
          //       errorMessage = 'This email exists already';
          //       break;
          //     case 'EMAIL_NOT_FOUND':
          //       errorMessage = 'This email does not exist.';
          //       break;
          //     case 'INVALID_PASSWORD':
          //       errorMessage = 'This password is not correct.';
          //       break;
          //   }

          //   return of(new AuthActions.AuthenticateFail(errorMessage));
          //})
        );
    })
  );

  @Effect({ dispatch: false })
  authSuccess = this.actions$.pipe(
    ofType(AuthActions.AUTHENTICATE_SUCCESS),
    tap(() => {
      this.router.navigate(['/']);
    })
  );

  loginUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`;

  signupUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`;

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private router: Router
  ) {}
}
