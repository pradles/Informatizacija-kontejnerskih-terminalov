import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MenuComponent } from '../../../dashboard/components/menu/menu.component';
import { ErrorModalComponent } from '../../../../shared/components/modals/error-modal/error-modal.component';
import { StoragesComponent } from '../../components/storages/storages.component';
import { StorageFormComponent } from '../../components/storage-form/storage-form.component';

@Component({
  selector: 'app-page-storage',
  standalone: true,
  imports: [ CommonModule, MenuComponent, StorageFormComponent, ErrorModalComponent, StoragesComponent ],
  templateUrl: './page-storage.component.html',
  styleUrl: './page-storage.component.css'
})
export class PageStorageComponent {
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
