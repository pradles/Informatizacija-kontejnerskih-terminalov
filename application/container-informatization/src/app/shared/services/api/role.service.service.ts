import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiUrls } from '../../../api.urls';

@Injectable({
  providedIn: 'root'
})
export class RoleServiceService {
    http = inject(HttpClient);

    getAllRoles() {
      return this.http.get<any>(`${apiUrls.RoleServiceApi}getAll`, {withCredentials:true} );
    }
  
    addRole(roleObj: any) {
      return this.http.post<any>(`${apiUrls.RoleServiceApi}create`, roleObj, {withCredentials:true} );
    }
  
    updateRole(roleObj: any, roleId: string) {
      return this.http.put<any>(`${apiUrls.RoleServiceApi}update/${roleId}`, roleObj, {withCredentials:true} );
    }
  
    getRoleById(roleId: string) {
      return this.http.get<any>(`${apiUrls.RoleServiceApi}${roleId}`, {withCredentials:true} );
    }
    
    getRoleByTerminalId(terminalId: string) {
      return this.http.get<any>(`${apiUrls.RoleServiceApi}terminal/${terminalId}`, {withCredentials:true} );
    }

    deleteRole(roleId: string) {
      return this.http.delete<any>(`${apiUrls.RoleServiceApi}delete/${roleId}`, {withCredentials:true} );
    }

}
