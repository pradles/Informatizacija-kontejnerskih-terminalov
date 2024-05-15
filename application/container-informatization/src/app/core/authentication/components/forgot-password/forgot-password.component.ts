import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PageAuthComponent } from '../../pages/page-auth/page-auth.component';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RouterModule ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements OnInit{
  pageAuth = inject(PageAuthComponent);
  fb = inject(FormBuilder); // inject() Replaces constructor
  authService = inject(AuthService);

  forgetFormSubmitted: boolean = false;
  forgetForm !: FormGroup;

  ngOnInit(): void {
    this.forgetForm = this.fb.group({
      email: ['', Validators.compose([ Validators.required, Validators.email ])],
    })
  }

  submit() {
    this.forgetFormSubmitted = true;
    console.log(this.forgetForm.value)

    if (this.forgetForm.valid) {
      this.authService.sendEmailService(this.forgetForm.value)
      .subscribe({
        next:(res)=>{
          console.log(res);
          this.forgetForm.reset();
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
