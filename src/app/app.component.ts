import { Component, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { NavigationEnd, Router } from '@angular/router';
import { filter, take } from 'rxjs';
import { AuthService } from './shared/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from './shared/services/user.service';
import { User } from './shared/models/User';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'movie-ticket-booking-webapp';
  page = '';

  routes: Array<string> = [];

  loggedInUser?: firebase.default.User | null;
  user?: User;
  isAdmin = false;
  isSuperadmin = false;

  constructor(private router: Router, private authService: AuthService, private userService: UserService, private toastr: ToastrService) {}

  ngOnInit() {
    // can be used to log out the user's claims
    //this.authService.logUserClaims();
    this.routes = this.router.config.map(conf => conf.path) as string[];
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((evts: any) => {
      const currentPage = (evts.urlAfterRedirects as string).split('/')[1] as string;
      if (this.routes.includes(currentPage)) {
        this.page = currentPage;
      }
    });
    this.authService.isUserLoggedIn().subscribe(user => {
      this.loggedInUser = user;
      localStorage.setItem('user', JSON.stringify(this.loggedInUser));
      if (this.loggedInUser) {
        this.userService.getById(this.loggedInUser.uid).pipe(take(1)).subscribe(data => {
          this.user = data[0];
          if (this.user) {
            if (this.user.role === 'admin') {
              this.isAdmin = true;
              this.isSuperadmin = false;
            } else if (this.user.role === 'superadmin') {
              this.isSuperadmin = true;
              this.isAdmin = false;
            } else {
              this.isAdmin = false;
              this.isSuperadmin = false;
            }
          }
        });
      }
    }, error => {
      console.error(error);
      localStorage.setItem('user', JSON.stringify(null));
    });
  }

  changePage(selectedPage: string) {
    this.router.navigateByUrl(selectedPage);
  }

  onToggleSidenav(sidenav: MatSidenav) {
    sidenav.toggle();
  }

  onClose(event: any, sidenav: MatSidenav) {
    if (event === true) {
      sidenav.close();
    }
  }

  logout(_?: boolean) {
    this.authService.logout().then(_ => {
      this.toastr.success('Sikeres kijelentkezés!', 'Kijelentkezés');
      localStorage.setItem('user', JSON.stringify(null));
      localStorage.setItem('tickets', JSON.stringify([]));
      this.navigate();
    }).catch(error => {
      console.error(error);
    });
  }

  navigate() {
    this.router.navigateByUrl('/main');
  }
}
