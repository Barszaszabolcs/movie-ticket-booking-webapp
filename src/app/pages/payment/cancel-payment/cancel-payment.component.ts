import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cancel-payment',
  templateUrl: './cancel-payment.component.html',
  styleUrls: ['./cancel-payment.component.scss']
})
export class CancelPaymentComponent implements OnInit{

  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {
    localStorage.removeItem('tickets');
    this.toastr.error('Sikertelen foglalás!', 'Jegyfoglalás');
  }

}
