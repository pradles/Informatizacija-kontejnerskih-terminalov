import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MenuComponent } from '../../../dashboard/components/menu/menu.component';
import { ErrorModalComponent } from '../../../../shared/components/modals/error-modal/error-modal.component';
import { ContainersComponent } from '../../components/containers/containers.component';
import { ContainerFormComponent } from '../../components/container-form/container-form.component';

@Component({
  selector: 'app-page-container',
  standalone: true,
  imports: [ CommonModule, MenuComponent, ContainerFormComponent, ErrorModalComponent, ContainersComponent ],
  templateUrl: './page-container.component.html',
  styleUrl: './page-container.component.css'
})
export class PageContainerComponent {
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
