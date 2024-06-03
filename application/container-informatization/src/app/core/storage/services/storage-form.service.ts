import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface Position {
  x: number;
  y: number;
  z: number;
}

@Injectable({
  providedIn: 'root'
})
export class StorageFormService {
  private positionSubject = new BehaviorSubject<Position>({ x: 0, y: 0, z: 0 }); // Default initial value
  position$ = this.positionSubject.asObservable();

  getPosition(): Position {
    return this.positionSubject.getValue();
  }

  setPosition(newValue: Position) {
    this.positionSubject.next(newValue);
  }
}