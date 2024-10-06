import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiUrls } from '../../../api.urls';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  http = inject(HttpClient);

  getAllUsers() {
    return this.http.get<any>(`${apiUrls.UserServiceApi}`, {withCredentials:true} );
  }

  getUserById(userId: string) {
    return this.http.get<any>(`${apiUrls.UserServiceApi}${userId}`, {withCredentials:true} );
  }

  updateUser(userObj: any) {
    return this.http.put<any>(`${apiUrls.UserServiceApi}update`, userObj, {withCredentials:true} );
  }

  getUsersByTerminalId(terminalId: string) {
    return this.http.get<any>(`${apiUrls.UserServiceApi}by-terminal/${terminalId}`, {withCredentials:true} );
  }

  deleteUser(userId: string) {
    return this.http.delete<any>(`${apiUrls.UserServiceApi}delete/${userId}`, {withCredentials:true} );
  }


}
