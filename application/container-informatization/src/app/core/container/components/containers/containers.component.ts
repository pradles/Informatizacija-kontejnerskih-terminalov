import { Component, OnInit, ViewChild, inject } from '@angular/core';

import { TableComponent } from '../../../../shared/components/table/table.component';
import { ContainerService } from '../../../../shared/services/api/container.service';

@Component({
  selector: 'app-containers',
  standalone: true,
  imports: [ TableComponent ],
  templateUrl: './containers.component.html',
  styleUrl: './containers.component.css'
})
export class ContainersComponent implements OnInit{
  @ViewChild(TableComponent) tableComponent!: TableComponent;
  containerSerice = inject(ContainerService)

  ngOnInit(): void {
    this.containerSerice.getAllContainers().subscribe({
      next: (res) => {
        console.log(res);
        this.tableComponent.setTableData(this.prepareTableData(res.data), "container");
      },
      error: (err) => {
        console.log(err);
      }
    });  
  }

  prepareTableData(arr: any) {
    return arr.map((container: any) => {

      return {
        _id: container._id,
        ContainerNumber: container.containerNumber,
        containerSize: container.size == 0 ? '3m' : container.size == 1 ? '6m' : '12m',
        containerContents: container.contents,
        StorageType: container.storageType == 1 ? 'Special' : 'Normal',
        Weight: container.weight,
        Created: container.createdAt,
        Updated: container.updatedAt,
      };
    });
  }

}
