import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StripeGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    const stripeRedirectUrl = localStorage.getItem('stripeUrl');

    if (stripeRedirectUrl !== null) {
      localStorage.removeItem('stripeUrl');
      return true;
    } else {
      return this.router.parseUrl('/main');
    }
  }
  
}
