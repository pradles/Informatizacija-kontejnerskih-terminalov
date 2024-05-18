import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiUrls } from '../../../api.urls';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
    http = inject(HttpClient);
    constructor(@Inject(DOCUMENT) private document: Document) { }

    registerService(registerObj: any) {
      return this.http.post<any>(`${apiUrls.AuthServiceApi}register`, registerObj, {withCredentials:true} );
    }

    loginService(loginObj: any) {
      return this.http.post<any>(`${apiUrls.AuthServiceApi}login`, loginObj, {withCredentials:true});
    }

    sendEmailService(email: any) {
      return this.http.post<any>(`${apiUrls.AuthServiceApi}send-email`, email);
    }

    resetPasswordService(resetPasswordObj: any) {
      return this.http.post<any>(`${apiUrls.AuthServiceApi}reset-password`, resetPasswordObj);
    }

    getAccessNumbers(userId: any) {
      return this.http.get<any>(`${apiUrls.AuthServiceApi}get-access-numbers/${userId}`,{withCredentials:true});
    }

    logOut() {
      localStorage.clear();
      console.log("clear")
      console.log(document.cookie)

      // Clear cookies (if any)
      document.cookie.split(";").forEach(cookie => {
        const cookieParts = cookie.split("=");
        const cookieName = cookieParts[0].trim();
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      });
    }

    isLoggedIn() {
      const userDataString = localStorage.getItem("user_data");
      if (userDataString) {
        // const userData = JSON.parse(userDataString);
        // console.log(userDataString);
        return true;
      }
      return false
    }

    getUserRoles(): Observable<string[]> {
      const userDataString = localStorage.getItem("user_data");

      return this.getAccessNumbers(userDataString)
        .pipe(
          map((res: any) => {
            // console.log(this.mapAccessNumbersToRoles(res.data));
            return this.mapAccessNumbersToRoles(res.data);
          }),
          catchError((err: any) => {
            console.log(err);
            return of(["none"]); // Returning a default value in case of error
          })
        );
    }

    mapAccessNumbersToRoles = (accessNumbers: number[]): UserRole[] => {
      return accessNumbers.map(accessNumber => {
        switch (accessNumber) {
          case 0:
            return UserRole.User;
          case 1:
            return UserRole.Moderator;
          case 2:
            return UserRole.Admin;
          default:
            throw new Error(`Unrecognized access number: ${accessNumber}`);
        }
      });
    };

    getUserPremisson(expectedRoles: UserRole[]) {
      if (!expectedRoles || expectedRoles.length === 0) {
        return true; // No role restrictions, allow access
      }
    
      // Retrieve user roles from localStorage
      const userRolesString = localStorage.getItem("userRoles");
      const userRoles: string[] = userRolesString ? JSON.parse(userRolesString) : [];
    
      // Check if the user has any of the expected roles
      const hasMatchingRole = expectedRoles.some(role => userRoles.includes(role));
    
      return hasMatchingRole;
    }

}

export enum UserRole {
  User = 'user',
  Admin = 'admin',
  Moderator = 'moderator'
}
