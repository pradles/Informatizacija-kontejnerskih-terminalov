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

  updateStorageRecord(storageObj: any, storageId: string) {
    return this.http.put<any>(`${apiUrls.StorageServiceApi}update/${storageId}`, storageObj, {withCredentials:true} );
  }

  updateStorageRecords(storageObj: any) {
    return this.http.put<any>(`${apiUrls.StorageServiceApi}update`, storageObj, {withCredentials:true} );
  }

  getTerminalStorageRecords(terminalId: string) {
    return this.http.get<any>(`${apiUrls.StorageServiceApi}terminal/${terminalId}`, {withCredentials:true} );
  }

  getStorageRecordById(storageRecordId: string) {
    return this.http.get<any>(`${apiUrls.StorageServiceApi}${storageRecordId}`, {withCredentials:true} );
  }

  exportStorage(storageIds: any[], terminalId: string){
    return this.http.put<any>(`${apiUrls.StorageServiceApi}export`, {storageIds, terminalId}, {withCredentials:true} );
  }

}
