import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiUrls } from '../../../api.urls';

@Injectable({
  providedIn: 'root'
})
export class OwnerService {
  http = inject(HttpClient);

  getAllOwners() {
    return this.http.get<any>(`${apiUrls.OwnerServiceApi}`, {withCredentials:true} );
  }

  addOwner(ownerObj: any) {
    return this.http.post<any>(`${apiUrls.OwnerServiceApi}add`, ownerObj, {withCredentials:true} );
  }

  updateOwner(ownerObj: any, ownerId: string) {
    return this.http.put<any>(`${apiUrls.OwnerServiceApi}update/${ownerId}`, ownerObj, {withCredentials:true} );
  }

  getOwnerById(ownerId: string) {
    return this.http.get<any>(`${apiUrls.OwnerServiceApi}${ownerId}`, {withCredentials:true} );
  }
}

