import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { PageAuthComponent } from '../../pages/page-auth/page-auth.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RouterModule ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{


  pageAuth = inject(PageAuthComponent);
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

    if (this.loginForm.valid) {
      this.authService.loginService(this.loginForm.value)
      .subscribe({
        next:(res)=>{
          console.log(res);
          // localStorage.setItem("user_data", JSON.stringify(res.data));
          localStorage.setItem("user_data", res.data._id);
          localStorage.setItem("username", res.data.username);
          localStorage.setItem("profile_picture", res.data.profileImage);
          localStorage.setItem("firstName", res.data.firstName);
          localStorage.setItem("lastName", res.data.lastName);
          this.authService.getUserRoles().subscribe(
            roles => {
              localStorage.setItem("userRoles", JSON.stringify(roles)); // Store user roles in localStorage
            },
            error => {
              console.log(error);
            }
          );
          this.loginForm.reset();
          this.router.navigate(['dashboard']);
        },
        error:(err)=>{
          this.pageAuth.openErrorModal(err.error.message);
          console.log(err.error.message);
        }
      });
    } else {
      this.pageAuth.openErrorModal("Form filled out incorrectly");
    }
  }

}
