import { Component, OnInit, inject } from '@angular/core';

import { TerminalService } from '../../../../shared/services/api/terminal.service';

@Component({
  selector: 'app-terminals',
  standalone: true,
  imports: [],
  templateUrl: './terminals.component.html',
  styleUrl: './terminals.component.css'
})
export class TerminalsComponent implements OnInit{
    terminalService = inject(TerminalService);

    terminals: any;

    ngOnInit(): void {
      this.terminalService.getAllTerminals()
      .subscribe({
        next:(res)=>{
          console.log(res);
          this.terminals = res.data;
          console.log(this.terminals)
        },
        error:(err)=>{
          console.log(err);
        }
      });
    }
}
