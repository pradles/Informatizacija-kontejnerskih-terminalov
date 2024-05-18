import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { LoginComponent } from '../../components/login/login.component';
import { RegisterComponent } from '../../components/register/register.component';
import { ForgotPasswordComponent } from '../../components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from '../../components/reset-password/reset-password.component';
import { ErrorModalComponent } from '../../../../shared/components/modals/error-modal/error-modal.component';

@Component({
  selector: 'app-page-auth',
  standalone: true,
  imports: [ CommonModule, LoginComponent, RegisterComponent, ForgotPasswordComponent, ResetPasswordComponent, ErrorModalComponent],
  templateUrl: './page-auth.component.html',
  styleUrl: './page-auth.component.css'
})
export class PageAuthComponent{

  route = inject(ActivatedRoute)

  isCurrentRoute(routeName: string): boolean {
    return this.route.snapshot.url[0].path === routeName;
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
