import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  loginForm = this.createForm({
    email: '',
    password: ''
  });

  constructor(private router: Router, private authService: AuthService, private formBuilder: FormBuilder, private toastr: ToastrService) {}

  createForm(model: any) {
    let formGroup = this.formBuilder.group(model);
    formGroup.get('email')?.addValidators([Validators.required, Validators.email]);
    formGroup.get('password')?.addValidators([Validators.required, Validators.minLength(6)]);
    return formGroup;
  }

  login() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.get('email')?.value as string, this.loginForm.get('password')?.value as string).then(_ => {
        this.toastr.success('Sikeres bejelentkezés!', 'Bejelentkezés');
        this.navigate();
      }).catch(error => {
        this.toastr.error('Rossz jelszó vagy email!', 'Bejelentkezés');
        console.error(error);
      });
    } else {
      this.toastr.error('Sikertelen bejelentkezés!', 'Bejelentkezés');
    }
  }

  navigate() {
    this.router.navigateByUrl('/cinema');
  }
}
