import { Component, OnInit } from '@angular/core';
import { PrizeComponent } from './prize/prize.component';
import { FormBuilder, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { deleteObject, getStorage, ref } from '@angular/fire/storage';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs';

import { ToastrService } from 'ngx-toastr';

import { User } from '../../shared/models/User';
import { Prize } from '../../shared/models/Prize';
import { Ticket } from '../../shared/models/Ticket';
import { Screening } from '../../shared/models/Screening';
import { UserService } from '../../shared/services/user.service';
import { PrizeService } from '../../shared/services/prize.service';
import { TicketService } from '../../shared/services/ticket.service';
import { CommentService } from '../../shared/services/comment.service';
import { ScreeningService } from '../../shared/services/screening.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit{

  loading = false;

  user?: User;

  allTickets: Array<Ticket> = [];
  activeTickets: Array<Ticket> = [];
  expiredTickets: Array<Ticket> = [];
  tickets: Array<Ticket> = [];

  loadedQRCodes: Array<string> = [];

  currentDate = new Date().getTime();

  prizes: Array<Prize> = [];

  loadedImages: Array<string> = [];

  updateFirstname = false;
  updateLastname = false;
  updateUsername = false;

  oldFirstname = '';
  oldLastname = '';
  oldUsername = '';

  updatePassword = false;

  passwordForm= this.createForm({
    password: '',
    passwordAgain: ''
  });

  constructor(
    private userService: UserService, private ticketService: TicketService,
    private screeningService: ScreeningService, private prizeService: PrizeService,
    private commentService: CommentService, private toastr: ToastrService,
    private dialog: MatDialog, private functions: AngularFireFunctions,
    private formBuilder: FormBuilder, private angularFireAuth: AngularFireAuth) {}

  ngOnInit(): void {
    this.allTickets = [];
    this.activeTickets = [];
    this.expiredTickets = [];
    this.tickets = [];
    this.prizes = [];
    this.loadedImages = [];
    this.loadedQRCodes = [];
    this.currentDate = new Date().getTime();

    const user = JSON.parse(localStorage.getItem('user') as string) as firebase.default.User;
    this.userService.getById(user.uid).pipe(take(1)).subscribe(data => {
      this.user = data[0];

      if (this.user) {
        this.oldFirstname = this.user.name.firstname;
        this.oldLastname = this.user.name.lastname;
        this.oldUsername = this.user.username;
        this.ticketService.getByUserId(this.user.id, 'all').subscribe(data => {
          this.allTickets = data;

          if (this.allTickets) {
            for (let index = 0; index < this.allTickets.length; index++) {
              this.ticketService.loadQRCode('images/qrcodes/' + this.allTickets[index].id + '.jpeg').pipe(take(1)).subscribe(data => {
                if (!(this.loadedQRCodes.includes(data))) {
                  this.loadedQRCodes.push(data);
                }
              });
            }
          }
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

        this.prizeService.loadPrizeMeta().subscribe(data => {
          this.prizes = data;

          if (this.prizes) {
            for (let i = 0; i < this.prizes.length; i++) {
              this.prizeService.loadCoverImage(this.prizes[i].image_url).pipe(take(1)).subscribe(data => {
                if (!(this.loadedImages.includes(data))) {
                  this.loadedImages.push(data);
                }
              });
            }
          }
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
      this.loading = true;
      let screening: Screening;

      this.screeningService.getById(ticket.screeningId).pipe(take(1)).subscribe(data => {
        screening = data[0];

        if (screening) {
          const deletedTicket = ticket;
          this.ticketService.delete(ticket.id).then(_ => {
            const storage = getStorage();
            const file = ref(storage, '/images/qrcodes/' + deletedTicket.id + '.jpeg');
      
            deleteObject(file).then(() => {
              screening.occupied_seats = screening.occupied_seats.filter(seat => seat !== deletedTicket.chosen_seat);
  
              this.screeningService.update(screening).then(_ => {
                const sendEmailNotification = this.functions.httpsCallable('sendEmailNotificationAfterCancellation');
                const data = sendEmailNotification({
                  user: this.user,
                  ticket: deletedTicket
                });
                data.toPromise().then(_ => {
                  this.toastr.success('Sikeres lemondás!', 'Foglalás lemondás');
                  this.loading = false;
                }).catch(error => {
                  this.toastr.error('Sikertelen lemondás!', 'Foglalás lemondás');
                  this.loading = false;
                });
              }).catch(error => {
                this.toastr.error('Sikertelen lemondás!', 'Foglalás lemondás');
                this.loading = false;
              });
            }).catch((error) => {
              this.toastr.error('Sikertelen lemondás!', 'Foglalás lemondás');
              this.loading = false;
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

  getPrizeImage(id: string): string | undefined {
    const prize = this.prizes.find(prize => prize.id.includes(id));
    if (prize) {
      return this.loadedImages.find(image_url => image_url.includes(prize.image_url.split('.')[0].split('/')[1]));
    } else {
      return undefined;
    }
  }

  letFirstnameUpdate() {
    this.updateFirstname = true;
    this.oldFirstname = this.user?.name.firstname as string;
  }

  letLastnameUpdate() {
    this.updateLastname = true;
    this.oldLastname = this.user?.name.lastname as string;
  }

  letUsernameUpdate() {
    this.updateUsername = true;
    this.oldUsername = this.user?.username as string;
  }

  cancel() {
    if (this.user) {
      if (this.updateFirstname) {
        this.updateFirstname = false;
        this.user.name.firstname = this.oldFirstname;
      } else if (this.updateLastname) {
        this.updateLastname = false;
        this.user.name.lastname = this.oldLastname;
      } else if (this.updateUsername) {
        this.updateUsername = false;
        this.user.username = this.oldUsername;
      }
    }
  }

  firstnameUpdate() {
    if (confirm('Biztosan módosítani szeretnéd a keresztnevedet?') && this.user) {
      this.updateFirstname = false;
      this.userService.update(this.user).then(_ => {
        this.toastr.success('Keresztnév sikeresen megváltoztatva!', 'Adat módosítás');
      }).catch(error => {
        this.toastr.error('Sikertelen keresztnév változtatás!', 'Adat módosítás');
      });
    }
  }

  lastnameUpdate() {
    if (confirm('Biztosan módosítani szeretnéd a vezetéknevedet?') && this.user) {
      this.updateLastname = false;
      this.userService.update(this.user).then(_ => {
        this.toastr.success('Vezetéknév sikeresen megváltoztatva!', 'Adat módosítás');
      }).catch(error => {
        this.toastr.error('Sikertelen vezetéknév változtatás!', 'Adat módosítás');
      });
    }
  }

  usernameUpdate() {
    if (confirm('Biztosan módosítani szeretnéd a felhasználónevedet?') && this.user) {
      this.loading = true;
      this.updateUsername = false;
      this.userService.update(this.user).then(_ => {
        this.commentService.getCommentsByUserId(this.user?.id as string).subscribe(data => {
          data.forEach(comment => {
            comment.username = this.user?.username as string;
            this.commentService.update(comment).catch(error => {
              this.toastr.error('Sikertelen felhasználónév változtatás!', 'Adat módosítás');
              this.loading = false;
            });
          });
        });
        this.toastr.success('Felhasználónév sikeresen megváltoztatva!', 'Adat módosítás');
        this.loading = false;
      }).catch(error => {
        this.toastr.error('Sikertelen felhasználónév változtatás!', 'Adat módosítás');
        this.loading = false;
      });
    }
  }

  letPasswordUpdate() {
    this.updatePassword = true;
  }

  createForm(model: any) {
    let formGroup = this.formBuilder.group(model);
    formGroup.get('password')?.addValidators([Validators.required, Validators.minLength(6)]);
    formGroup.get('paswwordAgain')?.addValidators([Validators.required, Validators.minLength(6)]);
    return formGroup;
  }

  cancelPasswordUpdate() {
    this.updatePassword = false;
  }

  passwordUpdate() {
    this.loading = true;
    if(this.updatePassword){
      if(this.passwordForm.valid && this.passwordForm.get('password')?.value === this.passwordForm.get('password')?.value){
        this.angularFireAuth.currentUser.then(user => {
          return user?.updatePassword(this.passwordForm.get('password')?.value as string);
        }).then(() => {
          this.passwordForm.get('password')?.reset();
          this.passwordForm.get('passwordAgain')?.reset();
          this.toastr.success('Sikeres jelszó változtatás!', 'Jelszó változtatás');
          this.loading = false;
          this.updatePassword = false; 
        }).catch(() => {
          this.toastr.error('Sikertelen jelszó változtatás!', 'Jelszó változtatás');
          this.loading = false;
        });
      } else {
        if (this.passwordForm.get('password')?.value !== this.passwordForm.get('password')?.value) {
          this.toastr.error('A két jelszó nem egyezik', 'Jelszó változtatás');
          this.loading = false;
        } else {
          this.toastr.error('A jelszónak legalább 6 karakter hosszúnak kell lennie!', 'Jelszó változtatás');
          this.loading = false;
        }
      }
    } else {
      this.updatePassword = true;
      this.loading = false;
    } 
  }

  getQRCode(ticket: Ticket): string | undefined {
    return this.loadedQRCodes.find(codeUrl => codeUrl.includes(ticket.id));
  }
}
