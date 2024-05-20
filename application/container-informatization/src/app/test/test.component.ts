import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-test',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent {

  formData = {
    xAxis: '',
    yAxis: '',
    zAxis: ''
  };


  currentZ: number = 0;
  maxZ!: number;
  selectedAccessibillity: number = 2;

  // Define a 3D array to hold the data
  array3D!: any[][][];

  onSubmit(form: any): void {
    console.log('Form submitted:', this.formData);

    // Parse xAxis, yAxis, and zAxis to integers
    const xAxis = parseInt(this.formData.xAxis);
    const yAxis = parseInt(this.formData.yAxis);
    const zAxis = parseInt(this.formData.zAxis);
    this.maxZ = zAxis;

    // Create the 3D array
    this.array3D = Array.from({ length: xAxis }, () =>
      Array.from({ length: yAxis }, () =>
        Array.from({ length: zAxis }, () => ({ occupation: null, size: null, accessibility: 2 }))
      )
    );

    console.log('Generated 3D array:', this.array3D[0][0][0].accessibility);
  }

  changeColor(x: number, y: number, z: number){
    console.log("Change color at",x,y,z)
    console.log("with color: ",this.selectedAccessibillity)
    this.array3D[x][y][z].accessibility = this.selectedAccessibillity;
  }

  clickStart: boolean = false;

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

  dropdownOpen = false;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
  

}
