import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { LoginComponent } from '../../components/login/login.component';
import { RegisterComponent } from '../../components/register/register.component';
import { ForgotPasswordComponent } from '../../components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from '../../components/reset-password/reset-password.component';


@Component({
  selector: 'app-page-auth',
  standalone: true,
  imports: [ CommonModule, LoginComponent, RegisterComponent, ForgotPasswordComponent, ResetPasswordComponent],
  templateUrl: './page-auth.component.html',
  styleUrl: './page-auth.component.css'
})
export class PageAuthComponent{

  constructor( private route: ActivatedRoute) { }

  // Function to determine if the current route is 'login'
  isLoginPage(): boolean {
    return this.route.snapshot.url[0].path === 'login';
  }

  // Function to determine if the current route is 'register'
  isRegisterPage(): boolean {
    return this.route.snapshot.url[0].path === 'register';
  }
  // Function to determine if the current route is 'register'
  isResetPasswordPage(): boolean {
    return this.route.snapshot.url[0].path === 'reset-password';
  }
  // Function to determine if the current route is 'register'
  isForgotPasswordPage(): boolean {
    return this.route.snapshot.url[0].path === 'forgot-password';
  }
}
