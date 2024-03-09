import { Component, OnInit } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { take } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { User } from '../../shared/models/User';
import { Cinema } from '../../shared/models/Cinema';
import { UserService } from '../../shared/services/user.service';
import { CinemaService } from '../../shared/services/cinema.service';
import { AdminCreatePopupComponent } from './admin-create-popup/admin-create-popup.component';

@Component({
  selector: 'app-list-users',
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.scss']
})
export class ListUsersComponent implements OnInit {
  
  user?: User;

  users?: Array<User>;
  admins?: Array<User>;
  moderators?: Array<User>;
  registeredUsers?: Array<User>;

  cinemas?: Array<Cinema>;
  chosenCinema?: Cinema;

  constructor(
    private userService: UserService, private cinemaService: CinemaService,
    private toastr: ToastrService, private functions: AngularFireFunctions,
    private dialog: MatDialog) {}
  
  ngOnInit(): void {
    this.users = []
    this.admins = []
    this.moderators = []
    this.registeredUsers = []
    this.cinemas = []
    
    const user = JSON.parse(localStorage.getItem('user') as string) as firebase.default.User;
    this.userService.getById(user.uid).pipe(take(1)).subscribe(data => {
      this.user = data[0];

      if (this.user) {
        this.userService.getAll('admin').subscribe(data => {
          this.admins = data;
        });

        this.userService.getAll('moderator').subscribe(data => {
          this.moderators = data;
        });

        this.userService.getAll('user').subscribe(data => {
          this.registeredUsers = data;

          if (this.registeredUsers) {
            this.users = this.registeredUsers;
          }
        });

        this.cinemaService.getAll().subscribe(data => {
          this.cinemas = data;
        });
      }
    });
  }

  getUsers(event: any) {
    this.users = [];
    if (event.source.value === 'admin') {
      this.users = this.admins;
    } else if (event.source.value === 'moderator') {
      this.users = this.moderators;
    } else if (event.source.value === 'user') {
      this.users = this.registeredUsers;
    }
  }

  getRole(user: User): string {
    if (user.role === 'admin') {
      return 'Admin';
    } else if (user.role === 'moderator') {
      return 'Moderátor';
    } else {
      return 'Felhasználó';
    }
  }

  getCinema(user: User): string {
    return this.cinemas?.find(cinema => cinema.id === user.cinemaId)?.town as string;
  }

  makeModerator(user: User) {
    const addModeratorRole = this.functions.httpsCallable('addModeratorRole');
    const data = addModeratorRole({ email: user.email });
    data.toPromise().then(result => {
      if (result) {
        user.role = 'moderator';
        this.userService.update(user).then(_ => {
          this.toastr.success('A ' + user.email + ' e-mail című felhasználó mostár moderátor!', 'Moderátor választás');
        }).catch(error => {
          this.toastr.error('Sikertelen moderátor létrehozás', 'Moderátor választás');
        });
      }
    });
  }

  makeAdmin(user: User) {
    var popup = this.dialog.open(AdminCreatePopupComponent, {
      width: '50%',
      height: '30%',
      autoFocus: false,
      data: {
        userId: user.id
      }
    });

    popup.afterClosed().subscribe(data => {
      this.chosenCinema = data;

      if (this.chosenCinema) {
        const addAdminRole = this.functions.httpsCallable('addAdminRole');
        const data = addAdminRole({ email: user.email });
        data.toPromise().then(result => {
          if (result) {
            user.role = 'admin';
            user.cinemaId = this.chosenCinema?.id as string;
            this.userService.update(user).then(_ => {
              this.toastr.success('A ' + user.email + ' e-mail című felhasználó mostár a ' + this.chosenCinema?.town + ' mozi adminja!', 'Admin választás');
            }).catch(error => {
              this.toastr.error('Sikertelen admin létrehozás', 'Admin választás');
            });
          }
        });
      }
    });
  }
}
