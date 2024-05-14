import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit{

  fb = inject(FormBuilder); // inject() Replaces constructor
  authService = inject(AuthService);
  router = inject(Router);

  registerFormSubmitted: boolean = false;
  registerForm !: FormGroup;

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.compose([ Validators.required, Validators.email ])],
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    })
  }

  register() {
    this.registerFormSubmitted = true;

    this.authService.registerService(this.registerForm.value)
    .subscribe({
      next:(res)=>{
        console.log(res)
        this.registerForm.reset();
        this.router.navigate(['login']);
      },
      error:(err)=>{
        console.log(err);
      }
    });
  }

}
