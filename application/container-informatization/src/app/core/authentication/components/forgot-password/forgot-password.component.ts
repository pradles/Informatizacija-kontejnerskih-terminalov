import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { PageAuthComponent } from '../../pages/page-auth/page-auth.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements OnInit {
  // Injecting dependencies
  pageAuth = inject(PageAuthComponent);
  fb = inject(FormBuilder);
  authService = inject(AuthService);

  // Property to track if the form has been submitted
  forgetFormSubmitted: boolean = false;
  // Property to hold the form group instance
  forgetForm!: FormGroup;

  ngOnInit(): void {
    // Initializing the form group with a single email control and its validators
    this.forgetForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, Validators.email])]
    });
  }

  // Method to handle form submission
  submit() {
    // Mark the form as submitted
    this.forgetFormSubmitted = true;

    // Check if the form is valid
    if (this.forgetForm.valid) {
      // If valid, call the AuthService to send the email
      this.authService.sendEmailService(this.forgetForm.value)
        .subscribe({
          // Handle the successful response
          next: (res) => {
            console.log(res);
            // Reset the form after successful submission
            this.forgetForm.reset();
          },
          // Handle the error response
          error: (err) => {
            this.pageAuth.openErrorModal(err.error.message);
            console.log(err);
          }
        });
    } else {
      // If the form is invalid, open the error modal with a message
      this.pageAuth.openErrorModal("Form filled out incorrectly");
    }
  }
}
