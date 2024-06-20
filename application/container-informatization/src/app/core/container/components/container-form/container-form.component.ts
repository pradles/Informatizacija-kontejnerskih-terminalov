import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

import { ContainerService } from '../../../../shared/services/api/container.service'; 
import { ValidatorsServiceService } from '../../../authentication/services/validators.service.service';
import { PageContainerComponent } from '../../pages/page-container/page-container.component';

@Component({
  selector: 'app-container-form',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RouterModule ],
  templateUrl: './container-form.component.html',
  styleUrl: './container-form.component.css'
})
export class ContainerFormComponent implements OnInit{
  fb = inject(FormBuilder);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  validatorService = inject(ValidatorsServiceService);
  containerService = inject(ContainerService);
  pageContainer = inject(PageContainerComponent);

  containerFormSubmitted: boolean = false;
  containerForm!: FormGroup;
  containerId: string | null = null;
  isEditMode: boolean = false;

  ngOnInit(): void {
    this.containerForm = this.fb.group({
      containerNumber: ['', Validators.required],
      size: [null, [Validators.required, this.validatorService.allowedSizesValidator([0, 1, 2])]],
      contents: ['', Validators.required],
      storageType: [null, [Validators.required, this.validatorService.allowedStorageTypesValidator([1, 2])]],
      weight: ['', Validators.required],
    });

    this.activatedRoute.paramMap.subscribe(params => {
      this.containerId = params.get('containerId');
      if (this.containerId) {
        this.isEditMode = true;
        this.loadContainerData(this.containerId);
      }
    });
  }

  loadContainerData(id: string): void {
    this.containerService.getContainerById(id)
      .subscribe({
        next:(res)=>{
          console.log(res);
          this.containerForm.patchValue(res.data);
        },
        error:(err)=>{
          console.log(err);
        }
      });
  }

  onSubmit(): void {
    this.containerFormSubmitted = true;
    let containerObj = {
      containerNumber: this.containerForm.value.containerNumber,
      size: this.containerForm.value.size,
      contents: this.containerForm.value.contents,
      storageType: this.containerForm.value.storageType,
      weight: this.containerForm.value.weight,
    }

    if (this.containerForm.valid) {
      if (this.isEditMode) {
        this.containerService.updateContainer(containerObj, this.containerId ? this.containerId : "").subscribe({
          next:(res)=>{
            console.log(res)
            // this.router.navigate(['/terminals']); // Redirect after update
          },
          error:(err)=>{
            console.log(err)
            this.pageContainer.openErrorModal(err.error.message);
          }
        });
      } else {
        this.containerService.addContainer(containerObj).subscribe({
          next:(res)=>{
            console.log(res)
            // this.router.navigate(['/terminals']); // Redirect after update
          },
          error:(err)=>{
            console.log(err)
            this.pageContainer.openErrorModal(err.error.message);
          }
        });
      }
    } else {
      this.pageContainer.openErrorModal("Form filled out incorrectly.");
    }
  }

  delete() {
    this.pageContainer.openErrorModal("nu uh");
    // if(this.containerId)
    // this.containerService.deleteContainer(this.containerId).subscribe({
    //   next:(res)=>{
    //     console.log(res)
    //     this.router.navigate(['/all-terminals']); // Redirect after update
    //   },
    //   error:(err)=>{
    //     console.log(err)
    //   }
    // });
  }

}
