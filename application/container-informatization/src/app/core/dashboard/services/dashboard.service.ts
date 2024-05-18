import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
    selectedTerminal: any;

    setSelectedTerminal(providedSelectedTerminal: any) {
      this.selectedTerminal = providedSelectedTerminal;
    }

    getSeletedTerminal() {
      return this.selectedTerminal;
    }
}
