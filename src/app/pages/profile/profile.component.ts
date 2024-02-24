import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs';

import { User } from '../../shared/models/User';
import { Order } from '../../shared/models/Order';
import { Ticket } from '../../shared/models/Ticket';
import { UserService } from '../../shared/services/user.service';
import { OrderService } from '../../shared/services/order.service';
import { TicketService } from '../../shared/services/ticket.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit{

  user?: User;

  orders: Array<Order> = [];

  tickets: Array<Ticket> = [];

  constructor(
    private userService: UserService, private orderService: OrderService,
    private ticketService: TicketService) {}

  ngOnInit(): void {
    this.orders = [];
    this.tickets = [];

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
                  this.tickets.push(ticket);
                });
              });
            });
          }
        });
      }
    });
  }

  convertSeat(seat: string): string {
    const [row, seatNumber] = seat.split('/');
    return `${row}.sor: ${seatNumber}.szék`;
  }

  giftRedemption() {}

  deleteTicket() {}
}
