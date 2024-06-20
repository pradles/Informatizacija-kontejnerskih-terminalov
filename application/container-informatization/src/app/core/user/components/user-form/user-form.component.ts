import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../../authentication/services/auth.service'; 
import { UserService } from '../../../../shared/services/api/user.service';
import { ValidatorsServiceService } from '../../../authentication/services/validators.service.service';
import { PageUserComponent } from '../../pages/page-user/page-user.component';
import { RoleSelectionComponent } from '../../../../shared/components/role-selection/role-selection.component';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RouterModule, RoleSelectionComponent ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent implements OnInit{
  fb = inject(FormBuilder);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  @ViewChild(RoleSelectionComponent) roleSelection!: RoleSelectionComponent;

  validatorService = inject(ValidatorsServiceService);
  authService = inject(AuthService);
  userService = inject(UserService);
  pageUser = inject(PageUserComponent);

  userFormSubmitted: boolean = false;
  userForm!: FormGroup;
  userId: string | null = null;
  isEditMode: boolean = false;
  selectedRoles!: any[];

  ngOnInit(): void {
    this.userForm = this.fb.group({
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
    });

    this.activatedRoute.paramMap.subscribe(params => {
      this.userId = params.get('userId');
      if (this.userId) {
        this.isEditMode = true;
        this.loadUserData(this.userId);
      }
    });
  }

  loadUserData(id: string): void {
    this.userService.getUserById(id)
      .subscribe({
        next:(res)=>{
          console.log(res);
          this.userForm.patchValue(res.data);
          this.roleSelection.setRoles(res.data.roles);
        },
        error:(err)=>{
          console.log(err);
        }
      });
  }

  handleSelectedRolesOutput(selectedRoles: any): void {
    this.selectedRoles = selectedRoles;
    // console.log('Selected roles:', this.selectedRoles);
  }

  onSubmit() {
    this.userFormSubmitted = true;
    if(!this.selectedRoles || this.selectedRoles.length == 0){
      this.pageUser.openErrorModal("Please select at least 1 role.");
    }else{
      if (this.isEditMode) {
        if (this.isFormValidWithoutPasswords()) {
          let userObj = {
            _id: this.userId,
            email: this.userForm.value.email,
            password: this.userForm.value.password,
            firstName: this.userForm.value.firstName,
            lastName: this.userForm.value.lastName,
            username: this.userForm.value.username,
            roles: this.selectedRoles
          };
          this.userService.updateUser(userObj).subscribe({
            next:(res)=>{
              console.log(res);
            },
            error:(err)=>{
              console.log(err);
              this.pageUser.openErrorModal(err.error.message);
            }
          })
        } else {
          this.pageUser.openErrorModal("Form filled out incorrectly.");
        }
        
      } else {
        if(this.userForm.valid){
          let userObj = {
            email: this.userForm.value.email,
            password: this.userForm.value.password,
            firstName: this.userForm.value.firstName,
            lastName: this.userForm.value.lastName,
            username: this.userForm.value.username,
            roles: this.selectedRoles
          };
          this.authService.registerService(userObj)
          .subscribe({
            next:(res)=>{
              console.log(res)
              // this.userForm.reset();
            },
            error:(err)=>{
              this.pageUser.openErrorModal(err.error.message);
              console.log(err);
            }
          });
        } else {
          this.pageUser.openErrorModal("Form filled out incorrectly.");
        }
      }
        
      } 
    }
  

  delete() {

  }

  isFormValidWithoutPasswords(): boolean {
    // Check validity of all controls except for password and confirmPassword
    for (const key in this.userForm.controls) {
      if (key !== 'password' && key !== 'confirmPassword') {
        const control = this.userForm.controls[key];
        if (control.invalid) {
          return false;
        }
      }
    }
    return true;
  }

}

