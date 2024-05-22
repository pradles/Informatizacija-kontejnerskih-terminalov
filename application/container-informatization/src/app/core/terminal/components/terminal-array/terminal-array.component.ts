import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, FormGroup, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { inject } from '@angular/core';

import { PageTerminalComponent } from '../../pages/page-terminal/page-terminal.component';
import { Terminal3DarrayComponent } from '../terminal-3-darray/terminal-3-darray.component';

import { ViewChild } from '@angular/core';


@Component({
  selector: 'app-terminal-array',
  standalone: true,
  imports: [ CommonModule, FormsModule, ReactiveFormsModule, Terminal3DarrayComponent ],
  templateUrl: './terminal-array.component.html',
  styleUrl: './terminal-array.component.css'
})
export class TerminalArrayComponent {
  fb = inject(FormBuilder);
  pageTermianl = inject(PageTerminalComponent);
  @Input() isEditMode!: boolean;
  @ViewChild(Terminal3DarrayComponent) array3dComponent!: Terminal3DarrayComponent;

  arrayForm!: FormGroup;

  show3d: boolean = false;
  currentZ: number = 0;
  maxZ!: number;
  selectedAccessibillity: number = 2;
  accessibilityOptions = [
    { color: 'bg-gray-300', name: 'Closed', value: 0 },
    { color: 'bg-yellow-500', name: 'Special', value: 1 },
    { color: 'bg-green-500', name: 'Open', value: 2 }
  ];
  
  array3D!: any[][][];
  clickStart: boolean = false;
  dropdownOpen = false;

  ngOnInit(): void {
    this.arrayForm = this.fb.group({
      xAxis: ['', Validators.required],
      yAxis: ['', Validators.required],
      zAxis: ['', Validators.required],
    })
  }

  onSubmit(): void {
    if(this.arrayForm.value.xAxis > 0 && this.arrayForm.value.yAxis > 0 && this.arrayForm.value.zAxis > 0) {
      console.log('Form submitted:', this.arrayForm.value);

      // Parse xAxis, yAxis, and zAxis to integers
      const xAxis = parseInt(this.arrayForm.value.xAxis);
      const yAxis = parseInt(this.arrayForm.value.yAxis);
      const zAxis = parseInt(this.arrayForm.value.zAxis);
      this.maxZ = zAxis;

      // Create the 3D array
      this.array3D = Array.from({ length: xAxis }, () =>
        Array.from({ length: yAxis }, () =>
          Array.from({ length: zAxis }, () => ({ occupation: null, size: null, accessibility: 2 }))
        )
      );
    } else {
      this.pageTermianl.openErrorModal("All Axis must be more than 0.")
    }
  }

  changeColor(x: number, y: number, z: number){
    for(let z2 = z; z2< this.maxZ; z2++)
      this.array3D[x][y][z2].accessibility = this.selectedAccessibillity;
  }

  clickStarted() {
    this.clickStart = true;
  }
  clickEnded() {
    this.clickStart = false;
  }

  changeColorWithCheck(x: number, y: number, z: number){
    if(this.clickStart)
      this.changeColor(x,y,z)
  }

  incrementZ() {
    if (this.currentZ < this.maxZ - 1) {
      this.currentZ++;
    }
  }

  decrementZ() {
    if (this.currentZ > 0) {
      this.currentZ--;
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  setArray(array: any) {
    console.log(array)
    this.maxZ = array[0][0].length;
    this.array3D = array;
    this.set3dArray();
  }

  getArray() {
    return this.array3D;
  }

  toggle3d() {
    this.show3d = !this.show3d;
    this.set3dArray();
  }

  set3dArray() {
    this.array3dComponent.setArray(this.array3D);
  }


}
