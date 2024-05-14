import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiUrls } from '../../../api.urls';

@Injectable({
  providedIn: 'root'
})
export class TerminalService {
  http = inject(HttpClient);

  getRolesService(terminalId: string) {
    return this.http.get<any>(`${apiUrls.RoleServiceApi}${terminalId}`, {withCredentials:true} );
  }
}
