import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiUrls } from '../../../api.urls';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    http = inject(HttpClient);

    registerService(registerObj: any) {
      return this.http.post<any>(`${apiUrls.AuthServiceApi}register`, registerObj, { withCredentials: true });
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

    isLoggedIn() {

    }

}
