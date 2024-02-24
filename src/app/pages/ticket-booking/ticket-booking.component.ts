import { Component, OnInit } from '@angular/core';
import { SeatSelectorComponent } from './seat-selector/seat-selector.component';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { User } from '../../shared/models/User';
import { Film } from '../../shared/models/Film';
import { Order } from '../../shared/models/Order';
import { Cinema } from '../../shared/models/Cinema';
import { Ticket } from '../../shared/models/Ticket';
import { Screening } from '../../shared/models/Screening';
import { Auditorium } from '../../shared/models/Auditorium';
import { UserService } from '../../shared/services/user.service';
import { FilmService } from '../../shared/services/film.service';
import { OrderService } from '../../shared/services/order.service';
import { CinemaService } from '../../shared/services/cinema.service';
import { TicketService } from '../../shared/services/ticket.service';
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
  finishedTickets: Array<Ticket> = [];

  chosenSeats: string[] = [];

  numbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  bookingForm = this.createForm({
    pay: false,
    ticket_count: this.formBuilder.group({
      full: 0,
      student: 0,
      special: 0,
      elderly: 0
    })
  });

  printSeats: string[] = [];

  paymentAmount = 0;

  constructor(
    private activatedRoute: ActivatedRoute, private formBuilder: FormBuilder,
    private userService: UserService, private screeningService: ScreeningService,
    private auditoriumService: AuditoriumService, private filmService: FilmService,
    private cinemaService: CinemaService, private orderService: OrderService,
    private ticketService: TicketService, private dialog: MatDialog, 
    private toastr: ToastrService, private router: Router) {}
  
  ngOnInit(): void {
    this.tickets = [];
    this.chosenSeats = [];
    this.finishedTickets = [];
    this.printSeats = [];
    this.paymentAmount = 0;
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

  paymentSelected() {
    this.pay = this.bookingForm.get('pay')?.value as boolean;
  }

  goToSeats() {
    let pay: boolean;
    let tickets: {type: string, price: number, count: number}[];

    if (this.bookingForm.valid) {
      if (this.bookingForm.get('pay')?.value) {
        pay = this.bookingForm.get('pay')?.value as boolean;
        tickets = [
          {type: 'Felnőtt, teljes árú jegy', price: 2200, count: this.bookingForm.get('ticket_count.full')?.value as number},
          {type: 'Diákjegy', price: 1800, count: this.bookingForm.get('ticket_count.student')?.value as number},
          {type: 'Jegy fogyatékkal élők számára', price: 1600, count: this.bookingForm.get('ticket_count.special')?.value as number},
          {type: 'Nyugdíjas jegy', price: 1700, count: this.bookingForm.get('ticket_count.elderly')?.value as number},
        ];
      } else {
        pay = this.bookingForm.get('pay')?.value as boolean;
        tickets = [
          {type: 'Felnőtt, teljes árú jegy', price: 2200, count: this.bookingForm.get('ticket_count.full')?.value as number},
          {type: 'Diákjegy', price: 1800, count: 0},
          {type: 'Jegy fogyatékkal élők számára', price: 1600, count: 0},
          {type: 'Nyugdíjas jegy', price: 1700, count: 0},
        ];
      }
  
      let ticket_sum = 0;
      this.pay = pay;
      this.tickets = tickets.filter(ticket => ticket.count > 0);
      this.tickets.forEach(ticket => {
        ticket_sum += ticket.count;
      });

      if (ticket_sum === 0) {
        this.toastr.error('Egy jegyet legalább választani kell!', 'Jegyfoglalás');
      } else if (ticket_sum > 10) {
        this.toastr.error('Egy felhasználó maximum 10 jegyet foglalhat!', 'Jegyfoglalás');
      } else {
        this.openPopUp(ticket_sum);
      }
    } else {
      this.toastr.error('Egy jegy típusból 0-10-et lehet foglalni!', 'Jegyfoglalás');
    }
  }

  openPopUp(ticket_sum: number) {
    var popup = this.dialog.open(SeatSelectorComponent, {
      width: '100%',
      height: '85%',
      autoFocus: false,
      data: {
        ticket_sum: ticket_sum,
        screeningId: this.screening?.id
      }
    });

    popup.afterClosed().subscribe(data => {
      this.chosenSeats = data;
      this.finishedTickets = [];
      this.printSeats = [];
      this.paymentAmount = 0;

      if (this.chosenSeats) {
        for (let i = 0; i < this.tickets.length; i++) {
          for (let j = 0; j < this.tickets[i].count; j++) {
            const ticket: Ticket = {
              id: '',
              type: this.tickets[i].type,
              price: this.tickets[i].price,
              payed: this.pay,
              film_title: this.screening?.film_title as string,
              cinema: this.cinema?.town as string,
              auditorium_number: this.auditorium?.hall_number as number,
              screening_time: this.screening?.time as number,
              chosen_seat: '',
              screeningId: this.screening?.id as string,
              orderId: '',
              prizeId: ''
            }
            
            this.finishedTickets.push(ticket);
          }  
        }
        for (let i = 0; i < this.finishedTickets.length; i++) {
          this.finishedTickets[i].chosen_seat = this.chosenSeats[i];
        }

        this.printSeats = this.convertSeats(this.chosenSeats);

        this.finishedTickets.forEach(ticket => {
          this.paymentAmount += ticket.price;
        });

        if (this.pay) {
          this.paymentAmount += (this.finishedTickets.length * 100);
        }
      }
    });
  }

  convertSeats(seats: string[]): string[] {
    return seats.map(seat => {
        const [row, seatNumber] = seat.split('/');
        return `${row}.sor: ${seatNumber}.szék`;
    });
  }

  finishOrder() {
    const order: Order = {
      id: '',
      price: this.paymentAmount,
      date: new Date().getTime(),
      userId: this.user?.id as string
    }

    this.orderService.create(order).then(docRef => {
      this.finishedTickets.forEach(ticket => {
        ticket.orderId = docRef;
        this.ticketService.create(ticket).then(_ => {
          if (!this.screening?.occupied_seats.includes(ticket.chosen_seat)) {
            this.screening?.occupied_seats.push(ticket.chosen_seat);
            this.screeningService.update(this.screening as Screening).then(_ => {
            }).catch(error => {
              this.toastr.error('Sikertelen foglalás!', 'Jegyfoglalás');
            });
          }
        }).catch(error => {
          this.toastr.error('Sikertelen foglalás!', 'Jegyfoglalás');
        });
      });
      this.toastr.success('Sikeres foglalás!', 'Jegyfoglalás');
      this.router.navigateByUrl('/cinema');
    }).catch(error => {
      this.toastr.error('Sikertelen foglalás!', 'Jegyfoglalás');
    });
  }

  cancel() {
    this.router.navigateByUrl('/cinema');
  }
}
