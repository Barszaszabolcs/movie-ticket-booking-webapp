import { Component, OnInit } from '@angular/core';
import { PrizeComponent } from './prize/prize.component';
import { take } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { User } from '../../shared/models/User';
import { Ticket } from '../../shared/models/Ticket';
import { Screening } from '../../shared/models/Screening';
import { UserService } from '../../shared/services/user.service';
import { TicketService } from '../../shared/services/ticket.service';
import { ScreeningService } from '../../shared/services/screening.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit{

  user?: User;

  allTickets: Array<Ticket> = [];
  activeTickets: Array<Ticket> = [];
  expiredTickets: Array<Ticket> = [];
  tickets: Array<Ticket> = [];

  currentDate = new Date().getTime();

  constructor(
    private userService: UserService, private ticketService: TicketService,
    private screeningService: ScreeningService, private toastr: ToastrService,
    private dialog: MatDialog) {}

  ngOnInit(): void {
    this.allTickets = [];
    this.activeTickets = [];
    this.expiredTickets = [];
    this.tickets = [];
    this.currentDate = new Date().getTime();

    const user = JSON.parse(localStorage.getItem('user') as string) as firebase.default.User;
    this.userService.getById(user.uid).pipe(take(1)).subscribe(data => {
      this.user = data[0];

      if (this.user) {
        this.ticketService.getByUserId(this.user.id, 'all').subscribe(data => {
          this.allTickets = data;
        });

        this.ticketService.getByUserId(this.user.id, 'active').subscribe(data => {
          this.activeTickets = data;
          if (this.activeTickets) {
            this.tickets = this.activeTickets;
          }
        });

        this.ticketService.getByUserId(this.user.id, 'expired').subscribe(data => {
          this.expiredTickets = data;
        });
      }
    });
  }

  getTickets(event: any) {
    this.tickets = [];
    if (event.source.value === 'active') {
      this.tickets = this.activeTickets;
    } else if (event.source.value === 'expired') {
      this.tickets = this.expiredTickets;
    } else if (event.source.value === 'all') {
      this.tickets = this.allTickets;
    }
  }

  convertSeat(seat: string): string {
    const [row, seatNumber] = seat.split('/');
    return `${row}.sor: ${seatNumber}.szék`;
  }

  deleteTicket(ticket: Ticket) {
    let text = 'Biztosan leakarja mondani a:\n' + ticket.film_title + ' című film ' + ticket.cinema + ' ' + ticket.auditorium_number + '.terem ' + this.formatScreeningTime(ticket.screening_time) + ' órai vetítésre foglalt, ' + ticket.type + ' ' + this.convertSeat(ticket.chosen_seat) + ' jegyet?';

    if (confirm(text)) {
      console.log(ticket.id);

      let screening: Screening;

      this.screeningService.getById(ticket.screeningId).pipe(take(1)).subscribe(data => {
        screening = data[0];

        if (screening) {
          this.ticketService.delete(ticket.id).then(_ => {
            screening.occupied_seats = screening.occupied_seats.filter(seat => seat !== ticket.chosen_seat);

            this.screeningService.update(screening).then(_ => {
              this.toastr.success('Sikeres lemondás!', 'Foglalás lemondás');
            }).catch(error => {
              this.toastr.error('Sikertelen lemondás!', 'Foglalás lemondás');
            });
          });
        }
      });
    }
  }

  formatScreeningTime(screeningTime: number) {
    const dateObj = new Date(screeningTime);
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    };
    return dateObj.toLocaleDateString('hu-HU', options as object);
  }

  getPrize(ticket: Ticket) {
    this.dialog.open(PrizeComponent, {
      width: '70%',
      height: '90%',
      autoFocus: false,
      data: {
        ticket: ticket
      }
    });
  }
}
