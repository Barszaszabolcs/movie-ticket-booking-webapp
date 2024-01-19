import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { User } from '../../shared/models/User';
import { UserService } from '../../shared/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
  
  registerForm = this.createForm({
    email: '',
    username: '',
    password: '',
    passwordAgain: '',
    name: this.formBuilder.group({
      firstname: '',
      lastname: '',
    })
  })

  constructor(
    private location: Location, private authService: AuthService,
    private formBuilder: FormBuilder, private userService: UserService,
    private router: Router, private toastr: ToastrService) {}

  createForm(model: any) {
    let formGroup = this.formBuilder.group(model);
    formGroup.get('email')?.addValidators([Validators.required, Validators.email]);
    formGroup.get('username')?.addValidators([Validators.required, Validators.minLength(3), Validators.maxLength(100)]);
    formGroup.get('password')?.addValidators([Validators.required, Validators.minLength(6)]);
    formGroup.get('passwordAgain')?.addValidators([Validators.required, Validators.minLength(6)]);
    formGroup.get('name.firstname')?.addValidators([Validators.required, Validators.minLength(2), Validators.maxLength(100)]);
    formGroup.get('name.lastname')?.addValidators([Validators.required, Validators.minLength(2), Validators.maxLength(100)]);
    return formGroup;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      if (this.registerForm.get('password')?.value !== this.registerForm.get('passwordAgain')?.value) {
        this.toastr.error('A két jelszó nem egyezik!', 'Regisztráció');
      } else {
        this.authService.signup(this.registerForm.get('email')?.value as string, this.registerForm.get('password')?.value as string).then(cred => {
          const user: User = {
            id: cred.user?.uid as string,
            email: this.registerForm.get('email')?.value as string,
            username: this.registerForm.get('username')?.value as string,
            name: {
              firstname: this.registerForm.get('name.firstname')?.value,
              lastname: this.registerForm.get('name.lastname')?.value
            },
            role: 'user'
          }
          this.userService.create(user).then(_ => {
            this.toastr.success('Sikeres regisztráció!', 'Regisztráció');
            this.router.navigateByUrl('/cinema');
          }).catch(error => {
            console.error(error);
            this.toastr.error('Sikertelen regisztráció!', 'Regisztráció');
          })
        }).catch(error => {
          console.error(error);
          this.toastr.error('Sikertelen regisztráció!', 'Regisztráció');
        });
      }
    } else {
      this.toastr.error('Sikertelen regisztráció!', 'Regisztráció');
    }
  }
  
  goBack() {
    this.location.back();
  }
}
