import { Component, OnInit, inject, ViewChild } from '@angular/core';

import { StorageService } from '../../../../shared/services/api/storage.service';
import { DashboardService } from '../../services/dashboard.service';
import { TableComponent } from '../../../../shared/components/table/table.component';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [ TableComponent ],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.css'
})
export class DetailsComponent implements OnInit{
  @ViewChild(TableComponent) tableComponent!: TableComponent;

  storageService = inject(StorageService);
  dashboardService = inject(DashboardService);

  ngOnInit(): void {
    this.dashboardService.getSelectedTerminal().subscribe({
      next: (selectedTerminal) => {
        if (selectedTerminal && selectedTerminal.id) {
          this.storageService.getTerminalStorageRecords(selectedTerminal.id).subscribe({
            next: (res) => {
              console.log(res);
              this.tableComponent.setTableData(this.prepareTableData(res.data), "storage");
            },
            error: (err) => {
              console.log(err);
            }
          });
        }
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  prepareTableData(arr: any) {
    return arr.map((storage: any) => {
      const container = storage.containerId[0];
      const terminal = storage.terminalId[0];
      return {
        ContainerNumber: container.containerNumber,
        Owner: container.ownerId[0]?.name,
        containerSize: container.size == 0 ? '3m' : container.size == 1 ? '6m' : '12m',
        containerLocation: `${storage.currentlyStoredAt?.x !== undefined ? storage.currentlyStoredAt.x : ""} 
                            ${storage.currentlyStoredAt?.y !== undefined ? storage.currentlyStoredAt.y : ""} 
                            ${storage.currentlyStoredAt?.z !== undefined ? storage.currentlyStoredAt.z : ""}`,
        containerContents: container.contents,
        containerWeight: container.weight,
        StorageType: container.storageType == 1 ? 'Special' : 'Normal',
        dateImported: storage.dateImported,
        dateExported: storage.dateExported,
        dateScheduledExport: storage.dateScheduledForExport,
        _id: storage._id
      };
    });
  }

}
