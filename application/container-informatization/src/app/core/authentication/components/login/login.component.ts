import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{

  fb = inject(FormBuilder); // inject() Replaces constructor
  authService = inject(AuthService);
  router = inject(Router);

  loginFormSubmitted: boolean = false;
  loginForm !: FormGroup;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', Validators.compose([ Validators.required, Validators.email ])],
      password: ['', Validators.required],
    })
  }

  login() {
    this.loginFormSubmitted = true;

    this.authService.loginService(this.loginForm.value)
    .subscribe({
      next:(res)=>{
        console.log(res);
        console.log(res.cookie)
        localStorage.setItem("user_data", res.data);
        localStorage.setItem("token", res.cookie);
        this.loginForm.reset();
        this.router.navigate(['test']);
      },
      error:(err)=>{
        console.log(err);
      }
    });
  }

}
