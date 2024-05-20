import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiUrls } from '../../../api.urls';

@Injectable({
  providedIn: 'root'
})
export class TerminalService {
  http = inject(HttpClient);

  // getRolesService(terminalId: string) {
  //   console.log("idk")
  //   return this.http.get<any>(`${apiUrls.RoleServiceApi}${terminalId}`, {withCredentials:true} );
  // }

  getAllTerminals() {
    return this.http.get<any>(`${apiUrls.TerminalServiceApi}`, {withCredentials:true} );
  }

  getTerminalById(terminalId: string) {
    return this.http.get<any>(`${apiUrls.TerminalServiceApi}${terminalId}`, {withCredentials:true} );
  }

  createTerminal(terminalObj: any) {
    return this.http.post<any>(`${apiUrls.TerminalServiceApi}create`, terminalObj, {withCredentials:true} );
  }

  updateTerminal(terminalObj: any) {
    return this.http.put<any>(`${apiUrls.TerminalServiceApi}update`, terminalObj, {withCredentials:true} );
  }

  getUserTerminals() {
    return this.http.get<any>(`${apiUrls.UserServiceApi}terminal/${localStorage.getItem("user_data")}`, {withCredentials:true} );
  }


}
