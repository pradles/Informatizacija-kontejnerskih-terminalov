import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageFormService {
  private positionSubject = new BehaviorSubject<string>('undefined'); // You can change the type and initial value
  position$ = this.positionSubject.asObservable();

  getPosition() {
    return this.positionSubject.getValue();
  }

  setPosition(newValue: string) {
    this.positionSubject.next(newValue);
  }
}
