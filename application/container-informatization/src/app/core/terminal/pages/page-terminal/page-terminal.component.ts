import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MenuComponent } from '../../../dashboard/components/menu/menu.component';
import { TerminalFormComponent } from '../../components/terminal-form/terminal-form.component';
import { TerminalsComponent } from '../../components/terminals/terminals.component';
import { ErrorModalComponent } from '../../../../shared/components/modals/error-modal/error-modal.component';

@Component({
  selector: 'app-page-terminal',
  standalone: true,
  imports: [ CommonModule, MenuComponent, TerminalFormComponent, ErrorModalComponent, TerminalsComponent ],
  templateUrl: './page-terminal.component.html',
  styleUrl: './page-terminal.component.css'
})
export class PageTerminalComponent {

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
