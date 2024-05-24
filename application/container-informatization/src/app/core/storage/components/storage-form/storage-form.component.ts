import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

import { StorageService } from '../../../../shared/services/api/storage.service';
import { PageStorageComponent } from '../../pages/page-storage/page-storage.component';

@Component({
  selector: 'app-storage-form',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RouterModule ],
  templateUrl: './storage-form.component.html',
  styleUrl: './storage-form.component.css'
})
export class StorageFormComponent implements OnInit{
  fb = inject(FormBuilder);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  storageService = inject(StorageService);
  pageStorage = inject(PageStorageComponent);

  storageFormSubmitted: boolean = false;
  storageForm!: FormGroup;
  storageId: string | null = null;
  isEditMode: boolean = false;

  ngOnInit(): void {
    this.storageForm = this.fb.group({
      dateImported: [new Date().toISOString().slice(0,16), Validators.required],
      dateExported: [''],
      currentlyStoredAt: [''],
      dateScheduledForExport: [''],
    });
    

    this.activatedRoute.paramMap.subscribe(params => {
      this.storageId = params.get('storageId');
      if (this.storageId) {
        this.isEditMode = true;
        this.loadStorageData(this.storageId);
      }
    });
  }

  loadStorageData(id: string): void {
    this.storageService.getStorageRecordById(id)
      .subscribe({
        next:(res)=>{
          console.log(res);
          // this.storageForm.patchValue(res.data);
        },
        error:(err)=>{
          console.log(err);
        }
      });
  }

  onSubmit(): void {

  }

  delete() {
    
  }

}
