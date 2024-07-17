import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

import { ContainerService } from '../../../../shared/services/api/container.service'; 
import { OwnerService } from '../../../../shared/services/api/owner.service';
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
  ownerService = inject(OwnerService);
  pageContainer = inject(PageContainerComponent);

  containerFormSubmitted: boolean = false;
  containerForm!: FormGroup;
  containerId: string | null = null;
  isEditMode: boolean = false;

  // for dropdown owner number
  ownerId: { _id: string, name: string }[] = [];
  filteredOwnerId: { _id: string, name: string }[] = [];
  ownerIdDropdown: boolean = false;

  ngOnInit(): void {
    this.containerForm = this.fb.group({
      containerNumber: ['', Validators.required],
      containerOwner: ['', Validators.required],
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
    this.populateContainerOwners();
  }

  loadContainerData(id: string): void {
    this.containerService.getContainerById(id)
      .subscribe({
        next:(res)=>{
          console.log(res);
          this.containerForm.patchValue({containerOwner: res.data.ownerId[0]?.name});
          this.containerForm.patchValue(res.data);
        },
        error:(err)=>{
          console.log(err);
        }
      });
  }

  populateContainerOwners() {
    // Set up all owners for dropdown
    this.ownerService.getAllOwners().subscribe({
      next: (owners) => {
        this.ownerId = owners.data
        this.filteredOwnerId = this.ownerId;
        console.log(this.filteredOwnerId)
      },
      error: (err) => {
        console.log(err);
        this.pageContainer.openErrorModal(err.error.message);
      }
    });
  }

  onSearchContainerOwner(): void {
    this.filteredOwnerId = this.ownerId.filter(item =>
      item.name.toString().includes(this.containerForm.value.containerOwner.toLowerCase())
    );
  }

  selectItemContainerOwner(ownerName: string): void {
    this.containerForm.patchValue({containerOwner: ownerName});
  }

  onFocusDropdownContainerOwner(): void {
    this.ownerIdDropdown = true;
  }

  onBlurDropdownContainerOwner(): void {
    setTimeout(() => 
      {
        this.ownerIdDropdown = false;
      },
      120);
  }

  onSubmit(): void {
    this.containerFormSubmitted = true;
    let containerObj = {
      containerNumber: this.containerForm.value.containerNumber,
      ownerId: this.ownerId.find(o => o.name === this.containerForm.value.containerOwner)?._id,
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
