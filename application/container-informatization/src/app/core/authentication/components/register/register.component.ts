import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PageAuthComponent } from '../../pages/page-auth/page-auth.component';
import { ValidatorsServiceService } from '../../services/validators.service.service';
import { RoleSelectionComponent } from '../../../../shared/components/role-selection/role-selection.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RoleSelectionComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit{
  pageAuth = inject(PageAuthComponent);
  fb = inject(FormBuilder); // inject() Replaces constructor
  authService = inject(AuthService);
  validatorService = inject(ValidatorsServiceService);

  registerFormSubmitted: boolean = false;
  registerForm !: FormGroup;
  selectedRoles!: any[];

  handleSelectedRolesOutput(selectedRoles: any): void {
    this.selectedRoles = selectedRoles;
    console.log('Selected roles:', this.selectedRoles);
    // You can perform any additional actions here
  }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.compose([ Validators.required, Validators.email ])],
      username: ['', Validators.required],
      password: ['', Validators.compose([
        Validators.required,
        this.validatorService.uppercaseValidator(),
        this.validatorService.lowercaseValidator(),
        this.validatorService.numberValidator(),
        this.validatorService.specialCharacterValidator(),
        this.validatorService.minLengthValidator(8)
      ])],
      confirmPassword: ['', Validators.required],
    })
  }

  register() {
    this.registerFormSubmitted = true;
    let registerObj = {
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      username: this.registerForm.value.username,
      roles: this.selectedRoles
    };
    if(!this.selectedRoles || this.selectedRoles.length == 0){
      this.pageAuth.openErrorModal("Please select at least 1 role.");
    }else{
      if (this.registerForm.valid) {
        console.log(registerObj)
        this.authService.registerService(registerObj)
        .subscribe({
          next:(res)=>{
            console.log(res)
            this.registerForm.reset();
          },
          error:(err)=>{
            this.pageAuth.openErrorModal(err.error.message);
            console.log(err);
          }
        });
      } else {
        this.pageAuth.openErrorModal("Form filled out incorrectly.");
      }
    }
  }

}
