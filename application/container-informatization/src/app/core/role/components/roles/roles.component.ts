import { Component, OnInit, inject } from '@angular/core';
import { ViewChild } from '@angular/core';

import { RoleServiceService } from '../../../../shared/services/api/role.service.service';
import { TableComponent } from '../../../../shared/components/table/table.component';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [ TableComponent ],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css'
})
export class RolesComponent implements OnInit{
  @ViewChild(TableComponent) tableComponent!: TableComponent;
  roleSerice = inject(RoleServiceService)

  ngOnInit(): void {
    this.roleSerice.getAllRoles().subscribe({
      next: (res) => {
        console.log(res);
        this.tableComponent.setTableData(this.prepareTableData(res.data), "role");
      },
      error: (err) => {
        console.log(err);
      }
    });  
  }

  prepareTableData(arr: any) {
    return arr.map((role: any) => {

      return {
        _id: role._id,
        Name: role.role,
        Terminal: role.terminals[0]?.name
      };
    });
  }
}
