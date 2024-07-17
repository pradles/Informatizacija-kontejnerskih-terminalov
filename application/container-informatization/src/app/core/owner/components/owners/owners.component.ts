import { Component, OnInit, inject } from '@angular/core';
import { ViewChild } from '@angular/core';

import { OwnerService } from '../../../../shared/services/api/owner.service';
import { TableComponent } from '../../../../shared/components/table/table.component';

@Component({
  selector: 'app-owners',
  standalone: true,
  imports: [ TableComponent ],
  templateUrl: './owners.component.html',
  styleUrl: './owners.component.css'
})
export class OwnersComponent implements OnInit{
  @ViewChild(TableComponent) tableComponent!: TableComponent;
  ownerSerice = inject(OwnerService)

  ngOnInit(): void {
    this.ownerSerice.getAllOwners().subscribe({
      next: (res) => {
        console.log(res);
        this.tableComponent.setTableData(this.prepareTableData(res.data), "owner");
      },
      error: (err) => {
        console.log(err);
      }
    });  
  }

  prepareTableData(arr: any) {
    return arr.map((owner: any) => {

      return {
        _id: owner._id,
        Name: owner.name
      };
    });
  }
}
