import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs';

import { User } from '../../../shared/models/User';
import { Cinema } from '../../../shared/models/Cinema';
import { UserService } from '../../../shared/services/user.service';
import { CinemaService } from '../../../shared/services/cinema.service';

@Component({
  selector: 'app-admin-create-popup',
  templateUrl: './admin-create-popup.component.html',
  styleUrls: ['./admin-create-popup.component.scss']
})
export class AdminCreatePopupComponent implements OnInit {

  userId?: string;
  user?: User

  cinemas?: Array<Cinema>;

  cinemaSelect = new FormControl('');

  chosenCinema?: Cinema;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any, private ref: MatDialogRef<AdminCreatePopupComponent>,
    private userService: UserService, private cinemaService: CinemaService) {}
  
  ngOnInit(): void {
    this.cinemas = [];
    this.userId = this.data.userId;
    this.cinemaSelect.addValidators([Validators.required]);
    if (this.userId) {
      this.userService.getById(this.userId).pipe(take(1)).subscribe(data => {
        this.user = data[0];
      });

      this.cinemaService.getAll().subscribe(data => {
        this.cinemas = data;
      });
    }
  }

  selectCinema() {
    if (this.cinemaSelect.valid) {
      const chosenCinemaId = this.cinemaSelect.value as string;
      if (chosenCinemaId) {
        this.cinemaService.getById(chosenCinemaId).pipe(take(1)).subscribe(data => {
          this.chosenCinema = data[0];

          if (this.chosenCinema) {
            this.ref.close(this.chosenCinema);
          }
        });
      }
    }
  }
}
