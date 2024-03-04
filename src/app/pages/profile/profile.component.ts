import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { User } from '../../shared/models/User';
import { Order } from '../../shared/models/Order';
import { Ticket } from '../../shared/models/Ticket';
import { Screening } from '../../shared/models/Screening';
import { UserService } from '../../shared/services/user.service';
import { OrderService } from '../../shared/services/order.service';
import { TicketService } from '../../shared/services/ticket.service';
import { ScreeningService } from '../../shared/services/screening.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit{

  user?: User;

  orders: Array<Order> = [];

  tickets: Array<Ticket> = [];

  allTickets: Array<Ticket> = [];
  activeTickets: Array<Ticket> = [];
  expiredTickets: Array<Ticket> = [];

  currentDate = new Date().getTime();

  constructor(
    private userService: UserService, private orderService: OrderService,
    private ticketService: TicketService, private screeningService: ScreeningService,
    private toastr: ToastrService) {}

  ngOnInit(): void {
    this.orders = [];
    this.tickets = [];
    this.allTickets = [];
    this.activeTickets = [];
    this.expiredTickets = [];
    this.currentDate = new Date().getTime();

    const user = JSON.parse(localStorage.getItem('user') as string) as firebase.default.User;
    this.userService.getById(user.uid).pipe(take(1)).subscribe(data => {
      this.user = data[0];

      if (this.user) {
        this.orderService.getByUserId(this.user.id).subscribe(data => {
          this.orders = data;

          if (this.orders) {
            this.orders.forEach(order => {
              this.ticketService.getByOrderId(order.id).subscribe(data => {
                data.forEach(ticket => {
                  this.allTickets.push(ticket);
                  
                  if (ticket.screening_time > this.currentDate) {
                    this.activeTickets.push(ticket);
                    this.tickets.push(ticket);
                  } else if(ticket.screening_time < this.currentDate) {
                    this.expiredTickets.push(ticket);
                  }
                });
              });
            });
          }
        });
      }
    });
  }

  getTickets(event: any) {
    this.tickets = [];
    this.tickets = this.allTickets;
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

  giftRedemption() {}

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
              this.allTickets = this.allTickets.filter(t => t.id !== ticket.id);
              this.activeTickets = this.activeTickets.filter(t => t.id !== ticket.id);
              this.tickets = this.allTickets;
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
}
