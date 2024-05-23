import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
    userTerminals: any;
    private selectedTerminalSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    selectedTerminal$: Observable<any> = this.selectedTerminalSubject.asObservable();
    selectedTerminalMenu: any;

    setSelectedTerminalMenu(providedSelectedTerminal: any) {
      this.selectedTerminalMenu = providedSelectedTerminal;
    }

    getSelectedTerminalMenu() {
      return this.selectedTerminalMenu;
    }

    setSelectedTerminal(providedSelectedTerminal: any) {
      this.selectedTerminalSubject.next(providedSelectedTerminal);
      this.setSelectedTerminalMenu(providedSelectedTerminal);
    }

    getSelectedTerminal(): Observable<any> {
      return this.selectedTerminal$;
    }

    setUserTerminals(providedUserTerminals: any) {
      this.userTerminals = providedUserTerminals;
    }

    getUserTerminals() { 
      return this.userTerminals;
    }
}
