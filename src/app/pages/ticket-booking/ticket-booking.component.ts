import { Component, OnInit } from '@angular/core';
import { SeatSelectorComponent } from './seat-selector/seat-selector.component';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';

import { ToastrService } from 'ngx-toastr';

import { HttpClient } from '@angular/common/http';
import { loadStripe } from '@stripe/stripe-js';

import { User } from '../../shared/models/User';
import { Film } from '../../shared/models/Film';
import { Cinema } from '../../shared/models/Cinema';
import { Ticket } from '../../shared/models/Ticket';
import { Screening } from '../../shared/models/Screening';
import { Auditorium } from '../../shared/models/Auditorium';
import { UserService } from '../../shared/services/user.service';
import { FilmService } from '../../shared/services/film.service';
import { CinemaService } from '../../shared/services/cinema.service';
import { TicketService } from '../../shared/services/ticket.service';
import { ScreeningService } from '../../shared/services/screening.service';
import { AuditoriumService } from '../../shared/services/auditorium.service';

import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { AngularFireStorage } from '@angular/fire/compat/storage';

import * as QRCode from 'qrcode';

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
  tickets: {type: string, price: number, count: number, glasses: boolean}[] = [];
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

  booking3dForm = this.create3dForm({
    pay: false,
    ticket_count: this.formBuilder.group({
      full: 0,
      full_glasses: 0,
      student: 0,
      student_glasses: 0,
      special: 0,
      special_glasses: 0,
      elderly: 0,
      elderly_glasses: 0
    })
  });

  printSeats: string[] = [];

  paymentAmount = 0;

  constructor(
    private activatedRoute: ActivatedRoute, private formBuilder: FormBuilder,
    private userService: UserService, private screeningService: ScreeningService,
    private auditoriumService: AuditoriumService, private filmService: FilmService,
    private cinemaService: CinemaService, private ticketService: TicketService,
    private dialog: MatDialog, private toastr: ToastrService,
    private router: Router, private http: HttpClient,
    private functions: AngularFireFunctions, private storage: AngularFireStorage) {}
  
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

  create3dForm(model: any) {
    let bookingGroup = this.formBuilder.group(model);
    bookingGroup.get('ticket_count.full')?.addValidators([Validators.required, Validators.max(10)]);
    bookingGroup.get('ticket_count.full_glasses')?.addValidators([Validators.max(10)]);
    bookingGroup.get('ticket_count.student')?.addValidators([Validators.max(10)]);
    bookingGroup.get('ticket_count.student_glasses')?.addValidators([Validators.max(10)]);
    bookingGroup.get('ticket_count.special')?.addValidators([Validators.max(10)]);
    bookingGroup.get('ticket_count.special_glasses')?.addValidators([Validators.max(10)]);
    bookingGroup.get('ticket_count.elderly')?.addValidators([Validators.max(10)]);
    bookingGroup.get('ticket_count.elderly_glasses')?.addValidators([Validators.max(10)]);
    return bookingGroup;
  }
  
  paymentSelected() {
    if (this.screening?.type === '3D') {
      this.pay = this.booking3dForm.get('pay')?.value as boolean;
    } else {
      this.pay = this.bookingForm.get('pay')?.value as boolean;
    }
  }

  goToSeats() {
    let pay: boolean;
    let tickets: {type: string, price: number, count: number, glasses: boolean}[];

    if (this.bookingForm.valid || this.booking3dForm.valid) {
      if (this.screening?.type === '3D') {
        if (this.booking3dForm.get('pay')?.value) {
          pay = this.booking3dForm.get('pay')?.value as boolean;
          tickets = [
            {type: 'Felnőtt, teljes árú jegy', price: 2400, count: this.booking3dForm.get('ticket_count.full')?.value as number, glasses: false},
            {type: 'Felnőtt, teljes árú jegy + szemüveg', price: 2800, count: this.booking3dForm.get('ticket_count.full_glasses')?.value as number, glasses: true},
            {type: 'Diákjegy', price: 2000, count: this.booking3dForm.get('ticket_count.student')?.value as number, glasses: false},
            {type: 'Diákjegy + szemüveg', price: 2200, count: this.booking3dForm.get('ticket_count.student_glasses')?.value as number, glasses: true},
            {type: 'Jegy fogyatékkal élők számára', price: 1800, count: this.booking3dForm.get('ticket_count.special')?.value as number, glasses: false},
            {type: 'Jegy fogyatékkal élők számára + szemüveg', price: 2000, count: this.booking3dForm.get('ticket_count.special_glasses')?.value as number, glasses: true},
            {type: 'Nyugdíjas jegy', price: 1900, count: this.booking3dForm.get('ticket_count.elderly')?.value as number, glasses: false},
            {type: 'Nyugdíjas jegy + szemüveg', price: 2100, count: this.booking3dForm.get('ticket_count.elderly_glasses')?.value as number, glasses: true},
          ];
        } else {
          pay = this.booking3dForm.get('pay')?.value as boolean;
          tickets = [
            {type: 'Felnőtt, teljes árú jegy', price: 2400, count: this.booking3dForm.get('ticket_count.full')?.value as number, glasses: false},
            {type: 'Felnőtt, teljes árú jegy + szemüveg', price: 2800, count: this.booking3dForm.get('ticket_count.full_glasses')?.value as number, glasses: true},
            {type: 'Diákjegy', price: 2000, count: 0, glasses: false},
            {type: 'Diákjegy + szemüveg', price: 2200, count: 0, glasses: true},
            {type: 'Jegy fogyatékkal élők számára', price: 1800, count: 0, glasses: false},
            {type: 'Jegy fogyatékkal élők számára + szemüveg', price: 2000, count: 0, glasses: true},
            {type: 'Nyugdíjas jegy', price: 1900, count: 0, glasses: false},
            {type: 'Nyugdíjas jegy + szemüveg', price: 2100, count: 0, glasses: true},
          ];
        }
      } else {
        if (this.bookingForm.get('pay')?.value) {
          pay = this.bookingForm.get('pay')?.value as boolean;
          tickets = [
            {type: 'Felnőtt, teljes árú jegy', price: 2200, count: this.bookingForm.get('ticket_count.full')?.value as number, glasses: false},
            {type: 'Diákjegy', price: 1800, count: this.bookingForm.get('ticket_count.student')?.value as number, glasses: false},
            {type: 'Jegy fogyatékkal élők számára', price: 1600, count: this.bookingForm.get('ticket_count.special')?.value as number, glasses: false},
            {type: 'Nyugdíjas jegy', price: 1700, count: this.bookingForm.get('ticket_count.elderly')?.value as number, glasses: false},
          ];
        } else {
          pay = this.bookingForm.get('pay')?.value as boolean;
          tickets = [
            {type: 'Felnőtt, teljes árú jegy', price: 2200, count: this.bookingForm.get('ticket_count.full')?.value as number, glasses: false},
            {type: 'Diákjegy', price: 1800, count: 0, glasses: false},
            {type: 'Jegy fogyatékkal élők számára', price: 1600, count: 0, glasses: false},
            {type: 'Nyugdíjas jegy', price: 1700, count: 0, glasses: false},
          ];
        }
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
      height: '95%',
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
              screening_type: this.screening?.type as string,
              glasses: this.tickets[i].glasses as boolean,
              screeningId: this.screening?.id as string,
              userId: this.user?.id as string,
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

  async finishOrder() {
    if (!this.pay) {  
      this.finishedTickets.forEach(ticket => {
        ticket.date = new Date().getTime();
        this.ticketService.create(ticket).then(async docRef => {
          const qrCodeDataUrl = await this.generateQRCode(
            `CAMPUS CINEMA "${docRef}" azonosítójú jegy!\nA ${ticket.film_title}(${ticket.screening_type}) című film vetítési időpontja: ${this.formatScreeningTime(ticket.screening_time)} a ${ticket.cinema} városi mozi ${ticket.auditorium_number}. termében.\nA lefoglalt szék: ${this.convertSeat(ticket.chosen_seat)}. A foglalás típusa: ${ticket.payed ? 'Fizetett' : 'Lefoglalt'}.`
          );
          await this.uploadQRCode(qrCodeDataUrl, `${docRef}.jpeg`);

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
      const sendEmailNotification = this.functions.httpsCallable('sendEmailNotification');
      const data = sendEmailNotification({
        user: this.user,
        tickets: this.finishedTickets
      });
      data.toPromise().then(_ => {
        this.toastr.success('Sikeres foglalás!', 'Jegyfoglalás');
        localStorage.setItem('stripeUrl', 'true');
        this.finishedTickets = [];
        this.chosenSeats = [];
        localStorage.setItem('tickets', JSON.stringify(this.finishedTickets));
        this.router.navigateByUrl('/success-payment');
      }).catch(error => {
        this.toastr.error('Sikertelen foglalás!', 'Jegyfoglalás');
      });
    } else {
      this.onCheckout();
    }
  }

  cancel() {
    this.finishedTickets = [];
    this.chosenSeats = [];
    localStorage.setItem('tickets', JSON.stringify(this.finishedTickets));
  }

  onCheckout() {
    localStorage.setItem('tickets', JSON.stringify(this.finishedTickets));
    this.http.post('https://us-central1-movie-ticket-booking-webapp.cloudfunctions.net/api/checkout', {
      items: this.finishedTickets
    }).subscribe(async (res: any) => {
      let stripe = await loadStripe('pk_test_51OpEKjFsVOqGvUD10lxbe07w6Di9pGGBkk1CpoxOr8ovWxZjeXf8pEWhtfuhZjruyTCuNzFrPFMLi5njedC4thgs00u9jxKVmG');
      stripe?.redirectToCheckout({
        sessionId: res.id
      });
      localStorage.setItem('stripeUrl', 'true');
    });
  }

  async generateQRCode(text: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(text);
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Hiba a QR kód generálása közben:', error);
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
        console.error('Hiba QR kód feltöltése közben:', error);
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
