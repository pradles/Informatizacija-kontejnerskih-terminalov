import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MenuComponent } from '../../../dashboard/components/menu/menu.component';
import { ErrorModalComponent } from '../../../../shared/components/modals/error-modal/error-modal.component';
import { UsersComponent } from '../../components/users/users.component';
import { UserFormComponent } from '../../components/user-form/user-form.component';
@Component({
  selector: 'app-page-user',
  standalone: true,
  imports: [ CommonModule, MenuComponent, ErrorModalComponent, UsersComponent, UserFormComponent ],
  templateUrl: './page-user.component.html',
  styleUrl: './page-user.component.css'
})
export class PageUserComponent {
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
