import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';

import { User } from '../../../shared/models/User';
import { Ticket } from '../../../shared/models/Ticket';
import { Screening } from '../../../shared/models/Screening';
import { UserService } from '../../../shared/services/user.service';
import { TicketService } from '../../../shared/services/ticket.service';
import { ScreeningService } from '../../../shared/services/screening.service';

import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { AngularFireStorage } from '@angular/fire/compat/storage';

import * as QRCode from 'qrcode';

@Component({
  selector: 'app-success-payment',
  templateUrl: './success-payment.component.html',
  styleUrls: ['./success-payment.component.scss']
})
export class SuccessPaymentComponent implements OnInit{

  loading = false;

  user?: User;

  screening?: Screening;

  tickets: Array<Ticket> = [];

  pay_amount = 0;

  constructor(
    private userService: UserService, private ticketService: TicketService,
    private screeningService: ScreeningService, private toastr: ToastrService,
    private functions: AngularFireFunctions, private storage: AngularFireStorage) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') as string) as firebase.default.User;
    this.userService.getById(user.uid).pipe(take(1)).subscribe(data => {
      this.user = data[0];
      
      if (this.user) {
        this.tickets = JSON.parse(localStorage.getItem('tickets')!);
        
        if (this.tickets.length > 0) {
          this.loading = true;
          this.tickets.forEach(ticket => {
            this.pay_amount += (ticket.price + 100);
          });

          this.screeningService.getById(this.tickets[0].screeningId).pipe(take(1)).subscribe(data => {
            this.screening = data[0];
            
            if (this.screening) {
              this.tickets.forEach(ticket => {
                ticket.date = new Date().getTime();
                this.ticketService.create(ticket).then(async docRef => {
                  const qrCodeDataUrl = await this.generateQRCode(
                    `CAMPUS CINEMA "${docRef}" azonosítójú jegy!\nA ${ticket.film_title}(${ticket.screening_type}) című film vetítési időpontja: ${this.formatScreeningTime(ticket.screening_time)} a ${ticket.cinema} városi mozi ${ticket.auditorium_number}. termében.\nA lefoglalt szék: ${this.convertSeat(ticket.chosen_seat)}. A foglalás típusa: ${ticket.payed ? 'Fizetett' : 'Lefoglalt'}.`
                  );
                  await this.uploadQRCode(qrCodeDataUrl, `${docRef}.jpeg`);

                  if (!this.screening?.occupied_seats.includes(ticket.chosen_seat)) {
                    this.screening?.occupied_seats.push(ticket.chosen_seat);
                    this.screeningService.update(this.screening as Screening).catch(error => {
                      this.toastr.error('Sikertelen foglalás!', 'Jegyfoglalás');
                      this.loading = false;
                    });
                  }
                }).catch(error => {
                  this.toastr.error('Sikertelen foglalás!', 'Jegyfoglalás');
                  this.loading = false;
                });
              });
              const sendEmailNotification = this.functions.httpsCallable('sendEmailNotification');
              const data = sendEmailNotification({
                user: this.user,
                tickets: this.tickets
              });
              data.toPromise().then(_ => {
                this.toastr.success('Sikeres foglalás!', 'Jegyfoglalás');
                this.loading = false;
                localStorage.removeItem('tickets');
              }).catch(error => {
                this.toastr.error('Sikertelen foglalás!', 'Jegyfoglalás');
                this.loading = false;
              });
            }
          });
        }
      }
    });
  }

  async generateQRCode(text: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(text);
      return qrCodeDataUrl;
    } catch (error) {
      this.toastr.error('Hiba QR kód feltöltése közben!', 'Foglalás véglegesítése');
      return '';
    }
  }

  uploadQRCode(dataUrl: string, filename: string) {
    const imageBlob = this.createBlob(dataUrl);
    const filePath = 'images/qrcodes/' + filename;
    const ref = this.storage.ref(filePath);
    const task = ref.put(imageBlob);

    task.snapshotChanges().subscribe(
      snapshot => {
      },
      error => {
        this.toastr.error('Hiba QR kód feltöltése közben!', 'Foglalás véglegesítése');
      }
    );
  }

  createBlob(dataURI: string) {
    const byteString = atob(dataURI.split(',')[1]);
    const typeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uintArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([arrayBuffer], { type: typeString });
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

  convertSeat(seat: string): string {
    const [row, seatNumber] = seat.split('/');
    return `${row}.sor: ${seatNumber}.szék`;
  }
}