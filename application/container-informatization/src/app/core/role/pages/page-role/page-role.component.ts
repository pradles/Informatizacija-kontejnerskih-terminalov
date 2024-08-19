import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MenuComponent } from '../../../dashboard/components/menu/menu.component';
import { ErrorModalComponent } from '../../../../shared/components/modals/error-modal/error-modal.component';
import { RolesComponent } from '../../components/roles/roles.component'; 
import { RoleFormComponent } from '../../components/role-form/role-form.component';

@Component({
  selector: 'app-page-role',
  standalone: true,
  imports: [ CommonModule, MenuComponent, ErrorModalComponent, RolesComponent, RoleFormComponent ],
  templateUrl: './page-role.component.html',
  styleUrl: './page-role.component.css'
})
export class PageRoleComponent {
  router = inject(Router);

  isCurrentRoute(segment: string): boolean {
    return this.router.url.startsWith(segment);
  }

  isErrorModalOpen: boolean = false;
  errorModalTitle!: string;
  errorModalText!: string;

  openErrorModal(error: string, text: string = "Fill in the form again.") {
    this.errorModalTitle = error;
    this.errorModalText = text;
    this.isErrorModalOpen = true;
  }
}
