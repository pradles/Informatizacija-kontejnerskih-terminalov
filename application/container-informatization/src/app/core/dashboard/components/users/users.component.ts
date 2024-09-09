import { Component, OnInit, ViewChild, inject } from '@angular/core';

import { TableComponent } from '../../../../shared/components/table/table.component';
import { UserService } from '../../../../shared/services/api/user.service';
import { DashboardService } from '../../services/dashboard.service';
import { RoleServiceService } from '../../../../shared/services/api/role.service.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ TableComponent ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit{
  @ViewChild(TableComponent) tableComponent!: TableComponent;
  userService = inject(UserService)
  roleService = inject(RoleServiceService)
  dashboardService = inject(DashboardService);

  roles: any = [];

  ngOnInit(): void {
    this.dashboardService.getSelectedTerminal().subscribe({
      next: (selectedTerminal) => {
        if (selectedTerminal && selectedTerminal.id) {
          this.roleService.getAllRoles()
          .subscribe({
            next:(res)=>{
              console.log(res);
              this.roles = res.data;
              this.userService.getUsersByTerminalId(selectedTerminal.id).subscribe({
                next: (res) => {
                  console.log(res);
                  this.tableComponent.setTableData(this.prepareTableData(res.data), "user");
                },
                error: (err) => {
                  console.log(err);
                }
              });  
            },
            error:(err)=>{
              console.log(err.error.message);
              alert(err)
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
    return arr.map((user: any) => {
      const userRoles = user.roles.map((roleId: string) => {
        const role = this.roles.find((r: any) => r._id === roleId);
        return role ? role.role : 'Unknown Role'; // Default to 'Unknown Role' if role is not found
      });
  
      return {
        Username: user.username,
        FirstName: user.firstName,
        LastName: user.lastName,
        Email: user.email,
        Roles: userRoles.join(', '), // Join role names into a single string
        _id: user._id,
      };
    });
  }

}
