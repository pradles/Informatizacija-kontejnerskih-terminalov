import { Component, OnInit, inject } from '@angular/core';
import { ViewChild } from '@angular/core';

import { TerminalService } from '../../../../shared/services/api/terminal.service';
import { TableComponent } from '../../../../shared/components/table/table.component';

@Component({
  selector: 'app-terminals',
  standalone: true,
  imports: [ TableComponent ],
  templateUrl: './terminals.component.html',
  styleUrl: './terminals.component.css'
})
export class TerminalsComponent implements OnInit{
    terminalService = inject(TerminalService);
    @ViewChild(TableComponent) tableComponent!: TableComponent;

    ngOnInit(): void {
      this.terminalService.getAllTerminals()
      .subscribe({
        next:(res)=>{
          console.log(res);

          this.tableComponent.setTableData(this.cleanData(res.data), "terminal");
        },
        error:(err)=>{
          console.log(err);
        }
      });
    }

    cleanData(data: any[]): any[] {
      return data.map(data => {
        const { __v, array3D, ...cleanedData } = data;
        return cleanedData;
      });
    }
}
