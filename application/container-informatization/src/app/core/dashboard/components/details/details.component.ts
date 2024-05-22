import { Component, OnInit, inject } from '@angular/core';

import { StorageService } from '../../../../shared/services/api/storage.service';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent implements OnInit{

  storageService = inject(StorageService);
  dashboardService = inject(DashboardService);

  ngOnInit(): void {
    this.storageService.getTerminalStorageRecords(this.dashboardService.getSeletedTerminal().id)
      .subscribe({
        next:(res)=>{
          console.log(res);
        },
        error:(err)=>{
          console.log(err);
        }
      });
  }

}
