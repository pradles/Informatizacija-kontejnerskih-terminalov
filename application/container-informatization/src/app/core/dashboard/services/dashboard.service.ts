import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
    userTerminals: any;
    selectedTerminal: any;

    setSelectedTerminal(providedSelectedTerminal: any) {
      this.selectedTerminal = providedSelectedTerminal;
    }

    getSeletedTerminal() {
      return this.selectedTerminal;
    }

    setUserTerminals(providedUserTerminals: any) {
      this.userTerminals = providedUserTerminals;
    }

    getUserTerminals() { 
      return this.userTerminals;
    }
}
