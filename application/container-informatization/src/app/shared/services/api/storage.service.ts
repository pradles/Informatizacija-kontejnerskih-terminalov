import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiUrls } from '../../../api.urls';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  http = inject(HttpClient);

  getAllStorageRecords() {
    return this.http.get<any>(`${apiUrls.StorageServiceApi}`, {withCredentials:true} );
  }

  createStorageRecord(storageObj: any) {
    return this.http.post<any>(`${apiUrls.StorageServiceApi}create`, storageObj, {withCredentials:true} );
  }

  getTerminalStorageRecords(terminalId: string) {
    return this.http.get<any>(`${apiUrls.StorageServiceApi}terminal/664c9fe3f5119576d738002c`, {withCredentials:true} );
  }
}
