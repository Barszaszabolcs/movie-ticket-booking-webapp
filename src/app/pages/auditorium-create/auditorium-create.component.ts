import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { User } from '../../shared/models/User';
import { Cinema } from '../../shared/models/Cinema';
import { Auditorium } from '../../shared/models/Auditorium';
import { UserService } from '../../shared/services/user.service';
import { CinemaService } from '../../shared/services/cinema.service';
import { AuditoriumService } from '../../shared/services/auditorium.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auditorium-create',
  templateUrl: './auditorium-create.component.html',
  styleUrls: ['./auditorium-create.component.scss']
})
export class AuditoriumCreateComponent implements OnInit{

  user?: User;
  cinema?: Cinema;
  auditoriums: Array<Auditorium> = [];

  numbers: any[] = [];

  layouts = ['left', 'center', 'right'];

  auditoriumForm: FormGroup = this.fb.group({});

  constructor(
    private fb: FormBuilder, private userService: UserService,
    private cinemaService: CinemaService, private auditoriumService: AuditoriumService,
    private toastr: ToastrService, private router: Router) {}
    
  ngOnInit(): void {
    this.auditoriums = [];

    this.auditoriumForm = this.fb.group({
      auditorium_number: [null, Validators.required],
      layout: [null, Validators.required],
      rows_number: [null, Validators.required],
      rows: this.fb.array([])
    });

    this.auditoriumForm.get('rows_number')?.valueChanges.subscribe(value => {
      if (value > 0 && value <= 20) {
        this.updateInputFields(value);
      } else {
        this.toastr.error('Egy teremben maximum 20 sor lehet!', 'Terem létrehozás');
      }
    });

    const user = JSON.parse(localStorage.getItem('user') as string) as firebase.default.User;
    this.userService.getById(user.uid).pipe(take(1)).subscribe(data => {
      this.user = data[0];

      if (this.user) {
        this.cinemaService.getById(this.user.cinemaId).pipe(take(1)).subscribe(data => {
          this.cinema = data[0];

          if (this.cinema) {
            this.auditoriumService.getAuditoriumsByCinemaId(this.cinema.id).subscribe(data => {
              this.auditoriums = data;

              if (this.auditoriums) {
                
                for (let i = 1; i <= (this.cinema?.auditorium_limit as number); i++) {
                  if (!this.numbers.includes(i)) {
                    this.numbers.push(i);
                  }
                }

                this.auditoriums.forEach(auditorium => {
                  this.numbers = this.numbers.filter(number => number !== auditorium.hall_number);
                });
              }
            });
          }
        });
      }
    });
  }

  getInputControls() {
    return (this.auditoriumForm?.get('rows') as FormArray).controls;
  }

  updateInputFields(rows_number: number): void {
    const rowArray = this.auditoriumForm?.get('rows') as FormArray;
    const currentRows = rowArray.length;
    if (rows_number > currentRows) {
      for (let i = currentRows; i < rows_number; i++) {
        rowArray.push(this.fb.group({
          value: [null, Validators.required]
        }));
      }
    } else if (rows_number < currentRows) {
      for (let i = currentRows; i > rows_number; i--) {
        rowArray.removeAt(i - 1);
      }
    }
  }

  createAuditorium(): void {
    if (this.auditoriumForm.valid) {
      const rowArray = this.auditoriumForm?.get('rows') as FormArray;
      let auditorium: Auditorium = {
        id: '',
        hall_number: this.auditoriumForm.get('auditorium_number')?.value,
        seats: [] as string[],
        layout: this.auditoriumForm.get('layout')?.value,
        cinemaId: this.cinema?.id as string
      }
      for (let i = 0; i < rowArray.controls.length; i++) {
        for (let j = 1; j <= rowArray.controls[i].value.value; j++) {
          let seat = (i + 1) + '/' + j;
          if (!auditorium.seats.includes(seat)) {
            auditorium.seats.push(seat);
          }
        } 
      }
      console.log(auditorium);
      this.auditoriumService.create(auditorium).then(_ => {
        this.toastr.success('Terem sikeresen létrehozva!', 'Terem létrehozás');
        this.router.navigateByUrl('/main');
      }).catch(error => {
        this.toastr.error('Sikertelen terem létrehozás!', 'Terem létrehozás');
      });
    } else {
      this.toastr.error('Egy sorban 3-20 szék lehet!', 'Terem létrehozás');
    }
  }
}
