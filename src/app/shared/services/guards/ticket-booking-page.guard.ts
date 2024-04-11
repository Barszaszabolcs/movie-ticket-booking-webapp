import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TicketBookingPageGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    const ticketBookingPageAvaliable = localStorage.getItem('ticketBookingPageAvaliable');

    if (ticketBookingPageAvaliable !== null) {
      localStorage.removeItem('ticketBookingPageAvaliable');
      return true;
    } else {
      return this.router.parseUrl('/main');
    }
  }
  
}
