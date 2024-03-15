import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { Cinema } from '../../models/Cinema';
import { CinemaService } from '../../services/cinema.service';

@Component({
  selector: 'app-cinema-create',
  templateUrl: './cinema-create.component.html',
  styleUrls: ['./cinema-create.component.scss']
})
export class CinemaCreateComponent implements OnInit{

  cinemas: string[] = [];

  cinemaForm = this.createForm({
    town: '',
    auditorium_limit: 0
  });

  constructor(
    private ref: MatDialogRef<CinemaCreateComponent>, private cinemaService: CinemaService,
    private fb: FormBuilder, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.cinemas = [];
    this.cinemaService.getAll().subscribe(data => {
      data.forEach(cinema => {
        if (!this.cinemas.includes(cinema.town)) {
          this.cinemas.push(cinema.town.toLowerCase());
        }
      });
    });
  }

  createForm(model: any) {
    let formGroup = this.fb.group(model);
    formGroup.get('town')?.addValidators([Validators.required, Validators.minLength(4), Validators.maxLength(200)]);
    formGroup.get('auditorium_limit')?.addValidators([Validators.required, Validators.min(1), Validators.max(14)]);
    return formGroup;
  }

  createCinema() {
    if (this.cinemaForm.valid) {

      if (!this.cinemas.includes((this.cinemaForm.get('town')?.value as string).toLowerCase())) {
        let cinema: Cinema = {
          id: '',
          town: this.cinemaForm.get('town')?.value as string,
          auditorium_limit: this.cinemaForm.get('auditorium_limit')?.value as number
        }
  
        this.cinemaService.create(cinema).then(_ => {
          this.toastr.success('Mozi sikeresen létrehozva!', 'Mozilétrehozás');
          this.ref.close()
        }).catch(error => {
          this.toastr.error('Sikertelen mozilétrehozás!', 'Mozilétrehozás');
        });
      } else {
        this.toastr.error('Már létezik ilyen városi mozi!', 'Mozilétrehozás');
      }
    } else {
      this.toastr.error('Egy moziban 1-14 terem lehet és a város 4-200 karakter hosszú lehet!', 'Mozilétrehozás');
    }
  }
}
