import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiUrls } from '../../../api.urls';

@Injectable({
  providedIn: 'root'
})
export class ContainerService {
  http = inject(HttpClient);

  getAllContainers() {
    return this.http.get<any>(`${apiUrls.ContainerServiceApi}`, {withCredentials:true} );
  }

  addContainer(containerObj: any) {
    return this.http.post<any>(`${apiUrls.ContainerServiceApi}add`, containerObj, {withCredentials:true} );
  }

  updateContainer(containerObj: any, containerId: string) {
    return this.http.put<any>(`${apiUrls.ContainerServiceApi}update/${containerId}`, containerObj, {withCredentials:true} );
  }

  getContainerById(containerId: string) {
    return this.http.get<any>(`${apiUrls.ContainerServiceApi}${containerId}`, {withCredentials:true} );
  }
}

