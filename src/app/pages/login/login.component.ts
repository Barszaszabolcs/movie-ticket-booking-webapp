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

  loading = false;

  loginForm = this.createForm({
    email: '',
    password: ''
  });

  loggedInUser?: firebase.default.User | null;

  constructor(private router: Router, private authService: AuthService, private formBuilder: FormBuilder, private toastr: ToastrService) {}

  createForm(model: any) {
    let formGroup = this.formBuilder.group(model);
    formGroup.get('email')?.addValidators([Validators.required, Validators.email]);
    formGroup.get('password')?.addValidators([Validators.required, Validators.minLength(6)]);
    return formGroup;
  }

  login() {
    this.loading = true;
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.get('email')?.value as string, this.loginForm.get('password')?.value as string).then(_ => {
        this.toastr.success('Sikeres bejelentkezés!', 'Bejelentkezés');
        this.authService.isUserLoggedIn().subscribe(user => {
          this.loggedInUser = user;
          localStorage.setItem('user', JSON.stringify(this.loggedInUser));
          this.loading = false;
          this.navigate();
        }, error => {          
          localStorage.setItem('user', JSON.stringify(null));
          this.loading = false;
        });
      }).catch(error => {
        this.toastr.error('Rossz jelszó vagy email!', 'Bejelentkezés');
        this.loading = false;
      });
    } else {
      this.toastr.error('Sikertelen bejelentkezés!', 'Bejelentkezés');
      this.loading = false;
    }
  }

  navigate() {
    this.router.navigateByUrl('/main');
  }
}
