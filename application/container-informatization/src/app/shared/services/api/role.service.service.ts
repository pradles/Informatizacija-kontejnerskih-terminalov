import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiUrls } from '../../../api.urls';

@Injectable({
  providedIn: 'root'
})
export class RoleServiceService {
    http = inject(HttpClient);

    getRolesService() {
      return this.http.get<any>(`${apiUrls.RoleServiceApi}getAll`, {withCredentials:true} );
    }

}
