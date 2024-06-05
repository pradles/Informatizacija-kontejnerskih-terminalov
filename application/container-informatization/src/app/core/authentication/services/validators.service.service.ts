import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidatorsServiceService {

  uppercaseValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const value: string = control.value;
      const hasUppercase = /[A-Z]/.test(value);
      return hasUppercase ? null : { missingUppercase: true };
    };
  }

  lowercaseValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const value: string = control.value;
      const hasLowercase = /[a-z]/.test(value);
      return hasLowercase ? null : { missingLowercase: true };
    };
  }

  numberValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const value: string = control.value;
      const hasNumber = /\d/.test(value);
      return hasNumber ? null : { missingNumber: true };
    };
  }

  specialCharacterValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const value: string = control.value;
      const hasSpecialCharacter = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);
      return hasSpecialCharacter ? null : { missingSpecialCharacter: true };
    };
  }

  minLengthValidator(minLength: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const value: string | null = control.value; // Ensure value is nullable
      if (value === null || value === undefined) {
        return null; // Return null if value is null or undefined
      }
      return value.length >= minLength ? null : { minLengthInvalid: true };
    };
  }

  allowedSizesValidator(allowedSizes: number[]) {
    return (control: { value: number }) => {
      return allowedSizes.includes(+control.value) ? null : { invalidSize: true };
    };
  }

  allowedStorageTypesValidator(allowedStorageTypes: number[]) {
    return (control: { value: number }) => {
      return allowedStorageTypes.includes(+control.value) ? null : { invalidStorageType: true };
    };
  }

}
