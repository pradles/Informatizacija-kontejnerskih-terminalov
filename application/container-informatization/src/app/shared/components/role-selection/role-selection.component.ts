import { Component, OnInit, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleServiceService } from '../../services/api/role.service.service';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './role-selection.component.html',
  styleUrl: './role-selection.component.css'
})
export class RoleSelectionComponent implements OnInit{
    roleService = inject(RoleServiceService);
    roles!: any[];
    selectedRoles: any = [];
    selectedRolesOutput = output();
    
    
  // Function to toggle role selection
  toggleSelection(role: string) {
    const index = this.selectedRoles.indexOf(role);
    if (index === -1) {
        this.selectedRoles.push(role); // Add role to selectedRoles if not already selected
    } else {
        this.selectedRoles.splice(index, 1); // Remove role from selectedRoles if already selected
    }
    this.sendSelectedRoles()
  }

  // Function to remove a role from selectedRoles
  removeRole(role: string) {
      const index = this.selectedRoles.indexOf(role);
      if (index !== -1) {
          this.selectedRoles.splice(index, 1); // Remove role from selectedRoles
      }
      this.sendSelectedRoles()
  }

  sendSelectedRoles() {
    // Map selected role names to their corresponding _id values
    const selectedRoleIds = this.selectedRoles.map((roleName: any) => {
      const selectedRole = this.roles.find(role => role.role === roleName);
      return selectedRole ? selectedRole._id : null; // Return _id if role is found, otherwise null
    });

    // Emit array of selected _id values
    this.selectedRolesOutput.emit(selectedRoleIds.filter((id: any) => id !== null)); // Filter out null values
  }

  ngOnInit(): void {
    this.roleService.getRolesService()
    .subscribe({
      next:(res)=>{
        console.log(res);
        this.roles = res.data;
      },
      error:(err)=>{
        console.log(err.error.message);
        alert(err)
      }
    });
  }
}
