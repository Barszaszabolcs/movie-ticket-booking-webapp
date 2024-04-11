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
    
      const admin = localStorage.getItem('admin');

      if (admin) {
        return true;
      } else {
        return this.router.parseUrl('/main');
      }
  }
  
}
