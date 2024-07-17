import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MenuComponent } from '../../../dashboard/components/menu/menu.component';
import { ErrorModalComponent } from '../../../../shared/components/modals/error-modal/error-modal.component';
import { OwnersComponent } from '../../components/owners/owners.component';
import { OwnerFormComponent } from '../../components/owner-form/owner-form.component';

@Component({
  selector: 'app-page-owner',
  standalone: true,
  imports: [ CommonModule, MenuComponent, ErrorModalComponent, OwnersComponent, OwnerFormComponent ],
  templateUrl: './page-owner.component.html',
  styleUrl: './page-owner.component.css'
})
export class PageOwnerComponent {
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
