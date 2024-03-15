import { Component, EventEmitter, Input, Output } from '@angular/core';
//import { MatDialog } from '@angular/material/dialog';
//import { CinemaCreateComponent } from '../cinema-create/cinema-create.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  @Input() currentPage: string = '';
  @Output() selectedPage: EventEmitter<string> = new EventEmitter();
  @Output() onCloseSidenav: EventEmitter<boolean> = new EventEmitter();
  @Input() loggedInUser?: firebase.default.User | null;
  @Input() isAdmin?: boolean;
  @Input() isSuperadmin?: boolean;
  @Output() onLogout: EventEmitter<boolean> = new EventEmitter();

  //constructor(private dialog: MatDialog) {}

  menuSwitch() {
    this.selectedPage.emit(this.currentPage);
  }

  close(logout?: boolean) {
    this.onCloseSidenav.emit(true);
    if (logout === true) {
      this.onLogout.emit(logout);
    }
  }

  // needs to be responsive
  /*createCinema() {
    this.dialog.open(CinemaCreateComponent, {
      width: '40%',
      height: '50%'
    });
  }*/
}
