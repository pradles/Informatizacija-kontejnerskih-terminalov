import { Component, OnInit, inject } from '@angular/core';
import { ViewChild } from '@angular/core';

import { RoleServiceService } from '../../../../shared/services/api/role.service.service';
import { DashboardService } from '../../services/dashboard.service';
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
  dashboardService = inject(DashboardService);

  ngOnInit(): void {
    this.dashboardService.getSelectedTerminal().subscribe({
      next: (selectedTerminal) => {
        if (selectedTerminal && selectedTerminal.id) {
          this.roleSerice.getRoleByTerminalId(selectedTerminal.id).subscribe({
            next: (res) => {
              console.log(res);
              this.tableComponent.setTableData(this.prepareTableData(res.data), "role");
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
    return arr.map((role: any) => {

      return {
        _id: role._id,
        Name: role.role,
        Terminal: role.terminals[0]?.name
      };
    });
  }
}
