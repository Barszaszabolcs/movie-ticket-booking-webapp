import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';

import { User } from '../../../shared/models/User';
import { Order } from '../../../shared/models/Order';
import { Ticket } from '../../../shared/models/Ticket';
import { Screening } from '../../../shared/models/Screening';
import { UserService } from '../../../shared/services/user.service';
import { OrderService } from '../../../shared/services/order.service';
import { TicketService } from '../../../shared/services/ticket.service';
import { ScreeningService } from '../../../shared/services/screening.service';

@Component({
  selector: 'app-success-payment',
  templateUrl: './success-payment.component.html',
  styleUrls: ['./success-payment.component.scss']
})
export class SuccessPaymentComponent implements OnInit{

  user?: User;

  screening?: Screening;

  tickets: Array<Ticket> = [];

  pay_amount = 0;

  constructor(
    private userService: UserService, private ticketService: TicketService,
    private orderService: OrderService, private screeningService: ScreeningService,
    private toastr: ToastrService) {

  }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') as string) as firebase.default.User;
    this.userService.getById(user.uid).pipe(take(1)).subscribe(data => {
      this.user = data[0];

      if (this.user) {
        this.tickets = JSON.parse(localStorage.getItem('tickets')!);
        
        if (this.tickets.length > 0) {
          this.tickets.forEach(ticket => {
            this.pay_amount += (ticket.price + 100);
          });

          this.screeningService.getById(this.tickets[0].screeningId).pipe(take(1)).subscribe(data => {
            this.screening = data[0];
            
            if (this.screening) {
              const order: Order = {
                id: '',
                price: this.pay_amount,
                date: new Date().getTime(),
                userId: this.user?.id as string
              }

              this.orderService.create(order).then(docRef => {
                this.tickets.forEach(ticket => {
                  ticket.orderId = docRef;
                  this.ticketService.create(ticket).then(_ => {
                    if (!this.screening?.occupied_seats.includes(ticket.chosen_seat)) {
                      this.screening?.occupied_seats.push(ticket.chosen_seat);
                      this.screeningService.update(this.screening as Screening).catch(error => {
                        this.toastr.error('Sikertelen foglalás!', 'Jegyfoglalás');
                      });
                    }
                  }).catch(error => {
                    this.toastr.error('Sikertelen foglalás!', 'Jegyfoglalás');
                  });
                });
                this.toastr.success('Sikeres foglalás!', 'Jegyfoglalás');
                localStorage.removeItem('tickets');
              }).catch(error => {
                this.toastr.error('Sikertelen foglalás!', 'Jegyfoglalás');
              });
            }
          });
        }
      }
    });
  }

}
