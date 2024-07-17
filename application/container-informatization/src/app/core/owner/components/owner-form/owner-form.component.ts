import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../../authentication/services/auth.service'; 
import { OwnerService } from '../../../../shared/services/api/owner.service';
import { ValidatorsServiceService } from '../../../authentication/services/validators.service.service';
import { PageOwnerComponent } from '../../pages/page-owner/page-owner.component'; 

@Component({
  selector: 'app-owner-form',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RouterModule ],
  templateUrl: './owner-form.component.html',
  styleUrl: './owner-form.component.css'
})
export class OwnerFormComponent implements OnInit{
  fb = inject(FormBuilder);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  validatorService = inject(ValidatorsServiceService);
  authService = inject(AuthService);
  ownerService = inject(OwnerService);
  pageOwner = inject(PageOwnerComponent);

  ownerFormSubmitted: boolean = false;
  ownerForm!: FormGroup;
  ownerId: string | null = null;
  isEditMode: boolean = false;

  ngOnInit(): void {
    this.ownerForm = this.fb.group({
      name: ['', Validators.required],
    });

    this.activatedRoute.paramMap.subscribe(params => {
      this.ownerId = params.get('ownerId');
      if (this.ownerId) {
        this.isEditMode = true;
        this.loadOwnerData(this.ownerId);
      }
    });
  }

  loadOwnerData(id: string): void {
    this.ownerService.getOwnerById(id)
      .subscribe({
        next:(res)=>{
          console.log(res);
          this.ownerForm.patchValue(res.data);
        },
        error:(err)=>{
          console.log(err);
        }
      });
  }

  onSubmit() {
    this.ownerFormSubmitted = true;

    if (this.isEditMode) {
      if(this.ownerForm.valid){
        let ownerObj = {
          name: this.ownerForm.value.name,
        };
        this.ownerService.updateOwner(ownerObj, this.ownerId ? this.ownerId:"").subscribe({
          next:(res)=>{
            console.log(res);
          },
          error:(err)=>{
            console.log(err);
            this.pageOwner.openErrorModal(err.error.message);
          }
        })
      } else {
        this.pageOwner.openErrorModal("Form filled out incorrectly.");
      }
    } else {
      if(this.ownerForm.valid){
          let ownerObj = {
            name: this.ownerForm.value.name,
          };
          this.ownerService.addOwner(ownerObj)
          .subscribe({
            next:(res)=>{
              console.log(res)
              this.ownerForm.reset();
              this.ownerFormSubmitted = false;
            },
            error:(err)=>{
              this.pageOwner.openErrorModal(err.error.message);
              console.log(err);
            }
          });
      } else {
        this.pageOwner.openErrorModal("Form filled out incorrectly.");
      }
    } 
  }
    
  

  delete() {

  }

}
