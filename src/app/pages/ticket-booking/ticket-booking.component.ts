import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';

import { User } from '../../shared/models/User';
import { Film } from '../../shared/models/Film';
import { Cinema } from '../../shared/models/Cinema';
import { Screening } from '../../shared/models/Screening';
import { Auditorium } from '../../shared/models/Auditorium';
import { UserService } from '../../shared/services/user.service';
import { FilmService } from '../../shared/services/film.service';
import { CinemaService } from '../../shared/services/cinema.service';
import { ScreeningService } from '../../shared/services/screening.service';
import { AuditoriumService } from '../../shared/services/auditorium.service';

@Component({
  selector: 'app-ticket-booking',
  templateUrl: './ticket-booking.component.html',
  styleUrls: ['./ticket-booking.component.scss']
})
export class TicketBookingComponent implements OnInit{

  user?: User;

  screeningId: string = '';
  screening?: Screening;

  auditorium?: Auditorium;
  cinema?: Cinema;

  film?: Film;

  pay: boolean = false;
  tickets: {type: string, price: number, count: number}[] = [];

  bookingForm = this.createForm({
    pay: false,
    ticket_count: this.formBuilder.group({
      full: 0,
      student: 0,
      special: 0,
      elderly: 0
    })
  })

  constructor(
    private activatedRoute: ActivatedRoute, private formBuilder: FormBuilder,
    private userService: UserService, private screeningService: ScreeningService,
    private auditoriumService: AuditoriumService, private filmService: FilmService,
    private cinemaService: CinemaService, private toastr: ToastrService) {}
  
  ngOnInit(): void {
    this.tickets = [];
    this.activatedRoute.params.subscribe((param: any) => {
      this.screeningId = param.screeningId as string;

      if (this.screeningId) {
        const user = JSON.parse(localStorage.getItem('user') as string) as firebase.default.User;
        this.userService.getById(user.uid).pipe(take(1)).subscribe(data => {
          this.user = data[0];
        });

        this.screeningService.getById(this.screeningId).pipe(take(1)).subscribe(data => {
          this.screening = data[0];

          if (this.screening) {
            this.filmService.loadFilmMetaById(this.screening.filmId).pipe(take(1)).subscribe(data => {
              this.film = data[0];
            });

            this.auditoriumService.getById(this.screening.auditoriumId).pipe(take(1)).subscribe(data => {
              this.auditorium = data[0];

              if (this.auditorium) {
                this.cinemaService.getById(this.auditorium.cinemaId).pipe(take(1)).subscribe(data => {
                  this.cinema = data[0];
                });
              }
            });
          }
        });
      }
    });
  }

  createForm(model: any) {
    let bookingGroup = this.formBuilder.group(model);
    bookingGroup.get('ticket_count.full')?.addValidators([Validators.required, Validators.max(10)]);
    bookingGroup.get('ticket_count.student')?.addValidators([Validators.max(10)]);
    bookingGroup.get('ticket_count.special')?.addValidators([Validators.max(10)]);
    bookingGroup.get('ticket_count.elderly')?.addValidators([Validators.max(10)]);
    return bookingGroup;
  }

  goToSeats() {
    let pay: boolean;
    let tickets: {type: string, price: number, count: number}[];

    if (this.bookingForm.valid) {
      if (this.bookingForm.get('pay')?.value) {
        pay = this.bookingForm.get('pay')?.value as boolean;
        tickets = [
          {type: 'full', price: 2200, count: this.bookingForm.get('ticket_count.full')?.value as number},
          {type: 'student', price: 1800, count: this.bookingForm.get('ticket_count.student')?.value as number},
          {type: 'special', price: 1600, count: this.bookingForm.get('ticket_count.special')?.value as number},
          {type: 'elderly', price: 1700, count: this.bookingForm.get('ticket_count.elderly')?.value as number},
        ];
      } else {
        pay = this.bookingForm.get('pay')?.value as boolean;
        tickets = [
          {type: 'full', price: 2200, count: this.bookingForm.get('ticket_count.full')?.value as number},
          {type: 'student', price: 1800, count: 0},
          {type: 'special', price: 1600, count: 0},
          {type: 'elderly', price: 1700, count: 0},
        ];
      }
  
      
      this.pay = pay;
      this.tickets = tickets;
      console.log(this.pay);
      this.tickets.forEach(ticket => {
        console.log(ticket.type + ', ' + ticket.price + ': ' + ticket.count);
      });
    }
  }
}
