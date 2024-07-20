import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiUrls } from '../../../api.urls';

@Injectable({
  providedIn: 'root'
})
export class AutoLocateService {
  http = inject(HttpClient);

  autoLocate(autoLocateObj: any) {
    return this.http.post<any>(`${apiUrls.autoLocateApi}`, autoLocateObj, {withCredentials:true} );
  }

}
