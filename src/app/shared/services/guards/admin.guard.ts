import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, take } from 'rxjs';
import { UserService } from '../user.service';
import { User } from '../../models/User';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  user?: User;
  answer = false;

  constructor(private userService: UserService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
      const user = JSON.parse(localStorage.getItem('user') as string) as firebase.default.User;
      this.userService.getById(user.uid).pipe(take(1)).subscribe(data => {
        this.user = data[0];

        if (this.user) {
          if (this.user.role === 'admin') {
            this.answer = true;
          } else {
            this.answer = false;
            this.router.navigate(['/main']);
          }
        } else {
          this.router.navigate(['/login']);
        }
      });

      return this.answer;
  }
  
}
