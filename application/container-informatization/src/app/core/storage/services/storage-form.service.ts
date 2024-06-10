import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface Position {
  x: number | null;
  y: number | null;
  z: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class StorageFormService {
  private positionSubject = new BehaviorSubject<Position>({ x: null, y: null, z: null }); // Initial value with null
  position$ = this.positionSubject.asObservable();

  getPosition(): Position {
    return this.positionSubject.getValue();
  }

  setPosition(newValue: Position) {
    this.positionSubject.next(newValue);
    console.log("position set:"+newValue.x + " "+newValue.y+" "+newValue.z)
  }
}
