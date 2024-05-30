import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

import { StorageService } from '../../../../shared/services/api/storage.service';
import { ContainerService } from '../../../../shared/services/api/container.service';
import { DashboardService } from '../../../dashboard/services/dashboard.service';
import { ValidatorsServiceService } from '../../../authentication/services/validators.service.service';

import { PageStorageComponent } from '../../pages/page-storage/page-storage.component';
import { StorageThreeDComponent } from '../storage-three-d/storage-three-d.component';

@Component({
  selector: 'app-storage-form',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RouterModule, StorageThreeDComponent ],
  templateUrl: './storage-form.component.html',
  styleUrl: './storage-form.component.css'
})
export class StorageFormComponent implements OnInit{
  fb = inject(FormBuilder);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  validatorService = inject(ValidatorsServiceService);
  containerService = inject(ContainerService);
  storageService = inject(StorageService);
  dashboardService = inject(DashboardService);
  pageStorage = inject(PageStorageComponent);

  storageData: any;
  singleStorageData: any;

  formSubmitted: boolean = false;
  storageForm!: FormGroup;
  containerForm!: FormGroup;
  storageId: string | null = null;
  isEditMode: boolean = false;

  toggleInput: boolean = false;

  ngOnInit(): void {
    this.storageForm = this.fb.group({
      dateImported: [new Date().toISOString().slice(0,16), Validators.required],
      dateExported: [''],
      currentlyStoredAt: [''],
      dateScheduledForExport: [''],
    });

    this.containerForm = this.fb.group({
      containerNumber: ['', Validators.required],
      size: ['', [Validators.required, this.validatorService.allowedSizesValidator(['0','1','2'])]],
      contents: ['', Validators.required],
      storageType: ['', [Validators.required, this.validatorService.allowedStorageTypesValidator(['1','2'])]],
      weight: ['', Validators.required],
    });
    

    this.activatedRoute.paramMap.subscribe(params => {
      this.storageId = params.get('storageId');
      if (this.storageId) {
        this.isEditMode = true;
        this.dashboardService.getSelectedTerminal().subscribe({
          next: (selectedTerminal) => {
            if (selectedTerminal && selectedTerminal.id) {
              this.storageService.getTerminalStorageRecords(selectedTerminal.id).subscribe({
                next: (res) => {
                  console.log(res);
                  this.storageData = res.data;
                  if (this.storageId) 
                    this.loadStorageData(this.storageId);
                },
                error: (err) => {
                  console.log(err);
                  this.pageStorage.openErrorModal(err.error.message);
                }
              });
            }
          },
          error: (err) => {
            console.log(err);
            this.pageStorage.openErrorModal(err.error.message);
          }
        });
      }
    });
  }

  loadStorageData(id: string): void {
    this.storageForm.reset();
    this.containerForm.reset();
    this.storageData.forEach((storage: any) => {
      if(storage._id == id) {
        const formattedData = {
          ...storage,
          dateImported: this.formatDate(storage.dateImported),
          dateExported: this.formatDate(storage.dateExported),
          dateScheduledForExport: this.formatDate(storage.dateScheduledForExport)
        }
        this.storageForm.patchValue(formattedData);
        this.containerForm.patchValue(storage.containerId[0]);
        this.singleStorageData = storage;
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Adding leading zero
    const day = ('0' + date.getDate()).slice(-2); // Adding leading zero
    const hours = ('0' + date.getHours()).slice(-2); // Adding leading zero
    const minutes = ('0' + date.getMinutes()).slice(-2); // Adding leading zero
  
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  toggleInputForm() {
    this.toggleInput = !this.toggleInput
  }

  onSubmit(): void {
    this.formSubmitted = true;

    const containerObj = {
      containerNumber: this.containerForm.value.containerNumber,
      size: this.containerForm.value.size,
      contents: this.containerForm.value.contents,
      storageType: this.containerForm.value.storageType,
      weight: this.containerForm.value.weight
    }
    if(this.containerForm.valid && this.storageForm.valid) {
      if(this.isEditMode){
        this.containerService.updateContainer(containerObj,this.singleStorageData.containerId[0]._id).subscribe({
          next:(res)=>{
            console.log(res);
            const storageObj = {
              containerId: this.singleStorageData.containerId[0]._id,
              terminalId: this.singleStorageData.terminalId[0]._id,
              dateImported: this.storageForm.value.dateImported,
              currentlyStoredAt: this.storageForm.value.currentlyStoredAt,
              dateScheduledForExport: this.storageForm.value.dateScheduledForExport
            }
            this.storageService.updateStorageRecord(storageObj, this.singleStorageData._id).subscribe({
              next:(res)=>{
                console.log(res);
              },
              error:(err)=>{
                console.log(err);
                this.pageStorage.openErrorModal(err.error.message);
              }
            })
          }, 
          error:(err)=>{
            console.log(err);
            this.pageStorage.openErrorModal(err.error.message);
          }
        })

      } else {
        this.containerService.addContainer(containerObj).subscribe({
          next:(res)=>{
            console.log(res)
            const match = res.message.match(/ID:([a-zA-Z0-9]+)/);

            if (match) {
              const storageObj = {
                containerId: match[1],
                terminalId: this.dashboardService.getSelectedTerminalMenu().id,
                dateImported: this.storageForm.value.dateImported,
                currentlyStoredAt: this.storageForm.value.currentlyStoredAt,
                dateScheduledForExport: this.storageForm.value.dateScheduledForExport
              }
              this.storageService.createStorageRecord(storageObj).subscribe({
                next:(res)=>{
                  console.log(res)
                },
                error:(err)=>{
                  console.log(err)
                  this.pageStorage.openErrorModal(err.error.message);
                }
              });
            }

          },
          error:(err)=>{
            console.log(err);
            this.pageStorage.openErrorModal(err.error.message);
          }
        });
      }
    }
  }

  delete() {

  }

  changeStorageData(id: string): void {
    this.loadStorageData(id);
    this.changeUrlId(id);
  }

  changeUrlId(newId: string) {
    this.router.navigate(['../', newId], {
      relativeTo: this.activatedRoute,
      replaceUrl: true, // This prevents adding a new entry to the history
    });
  }

}
