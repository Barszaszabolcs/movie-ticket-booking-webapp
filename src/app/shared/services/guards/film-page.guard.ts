import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilmPageGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    const filmPageAvaliable = localStorage.getItem('filmPageAvaliable');

    if (filmPageAvaliable !== null) {
      localStorage.removeItem('filmPageAvaliable');
      return true;
    } else {
      return this.router.parseUrl('/main');
    }
  }
  
}
