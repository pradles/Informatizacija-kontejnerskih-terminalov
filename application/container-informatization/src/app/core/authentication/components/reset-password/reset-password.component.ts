import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PageAuthComponent } from '../../pages/page-auth/page-auth.component';


@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})

export class ResetPasswordComponent implements OnInit{
  pageAuth = inject(PageAuthComponent);
  fb = inject(FormBuilder); // inject() Replaces constructor
  authService = inject(AuthService);
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);

  resetFormSubmitted: boolean = false;
  resetForm !: FormGroup;

  token !: string;

  ngOnInit(): void {
    this.resetForm = this.fb.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });

    this.activatedRoute.params.subscribe(val=>{
      this.token = val['token'];
    })
  }

  reset() {
    this.resetFormSubmitted = true;
    let resetObj = {
      token: this.token,
      password: this.resetForm.value.password
    };
    if (this.resetForm.valid) {
      this.authService.resetPasswordService(resetObj)
      .subscribe({
        next:(res)=>{
          console.log(res);
          this.resetForm.reset();
          this.router.navigate(['login']);
        },
        error:(err)=>{
          this.pageAuth.openErrorModal(err.error.message);
          console.log(err);
        }
      });
    } else {
      this.pageAuth.openErrorModal("Form filled out incorrectly");
    }
  }
}
