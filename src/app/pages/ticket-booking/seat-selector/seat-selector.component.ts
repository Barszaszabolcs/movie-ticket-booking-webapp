import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { Auditorium } from '../../../shared/models/Auditorium';
import { Screening } from '../../../shared/models/Screening';
import { AuditoriumService } from '../../../shared/services/auditorium.service';
import { ScreeningService } from '../../../shared/services/screening.service';

@Component({
  selector: 'app-seat-selector',
  templateUrl: './seat-selector.component.html',
  styleUrls: ['./seat-selector.component.scss']
})
export class SeatSelectorComponent implements OnInit{

  ticket_sum = 0;

  screeningId?: string;
  screening?: Screening;

  auditorium?: Auditorium;

  seats: string[][] = [];
  reservedSeats: string[] = [];

  chosenSeats: string[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any, private ref: MatDialogRef<SeatSelectorComponent>,
    private auditoriumService: AuditoriumService, private screeningService: ScreeningService,
    private toastr: ToastrService) {}
  
  ngOnInit(): void {
    this.seats = [];
    this.chosenSeats = [];
    this.reservedSeats = [];
    this.ticket_sum = this.data.ticket_sum;
    this.screeningId = this.data.screeningId;

    if (this.screeningId) {
      this.screeningService.getById(this.screeningId).pipe(take(1)).subscribe(data => {
        this.screening = data[0];

        if (this.screening) {
          this.reservedSeats = this.screening.occupied_seats;
          this.auditoriumService.getById(this.screening.auditoriumId).pipe(take(1)).subscribe(data => {
            this.auditorium = data[0];

            this.getSeats();

            const max = document.querySelector('.max') as HTMLElement;
            max.innerText = this.ticket_sum.toString();
          });
        }
      });
    }
  }

  getSeats() {
    if (this.auditorium) {
      const stringArray: string[] = this.auditorium.seats;
  
      // Két dimenziós tömb létrehozása a sor és az oszlop számok tárolására
      const prefixArray: string[][] = [];
  
      // String tömb feldolgozása
      for (const str of stringArray) {
        // Az előtag kinyerése (azaz a "/" előtti rész)
        const prefix: string = str.split("/")[0];
  
        // Ha még nem tároljuk az előtagot, létrehozzuk egy új sort a tömbben
        if (!prefixArray[Number(prefix)]) {
          prefixArray[Number(prefix)] = [str];
        } else {
          // Ha már tároljuk az előtagot, hozzáadjuk az új stringet a meglévő sorhoz
          prefixArray[Number(prefix)].push(str);
        }
      }
  
      // Előtagok és hozzájuk tartozó stringek rendezése növekvő sorrendben
      for (const prefix in prefixArray) {
        if (prefixArray[prefix]) {
          prefixArray[prefix].sort((a, b) => {
            const [aNum, aRest] = a.split('/').map(Number);
            const [bNum, bRest] = b.split('/').map(Number);
  
            return aNum - bNum || aRest - bRest;
          });
        }
      }
  
      this.seats = prefixArray;
    }
  }

  ok() {
    if (this.chosenSeats.length !== this.ticket_sum) {
      this.toastr.error(this.ticket_sum + ' széket kell kiválasztani!', 'Szék foglalás');
    } else {
      this.ref.close(this.chosenSeats);
    }
  }

  seatSelected(event: any) {
    const countSpan = document.querySelector('.count') as HTMLElement;
    const chosen = document.querySelector('.chosen-seats') as HTMLElement;

    // Ha a checkbox be van jelölve, növeljük a számot, különben csökkentsük
    if (event.target.checked) {
      // Számként olvassuk be az aktuális értéket, adjunk hozzá 1-et és frissítsük a span tartalmát
      let currentCount = parseInt(countSpan.innerText);
      currentCount++;
      
      // Megakadályozzuk, hogy több széket választhassanak ki, mint amennyi jegyet megadtak
      if (currentCount > this.ticket_sum) {
        event.target.checked = false;
        currentCount--;
      } else {
        this.chosenSeats.push(event.target.value);
      }
      countSpan.innerText = currentCount.toString();

    } else {
      // Számként olvassuk be az aktuális értéket, vonjunk ki 1-et és frissítsük a span tartalmát
      let currentCount = parseInt(countSpan.innerText);
      currentCount--;
      countSpan.innerText = currentCount.toString();


      this.chosenSeats = this.chosenSeats.filter(seat => !(seat === event.target.value));
    }

    this.chosenSeats = this.chosenSeats.sort(this.customSort);
    let printChosenSeats = this.convertSeats(this.chosenSeats)
    chosen.innerText = printChosenSeats.join(', ');
  }

  // Növekvő sorrendbe rendezi a string-eket szám szerint
  customSort(a: string, b: string): number {
    const [aNum, aDen] = a.split('/').map(Number);
    const [bNum, bDen] = b.split('/').map(Number);

    if (aNum === bNum) {
        return aDen - bDen;
    } else {
        return aNum - bNum;
    }
  }

  // A string tömb "1/1" formátumú elemeit "1. 1.szék" formátumra konvertálja
  convertSeats(seats: string[]): string[] {
    return seats.map(seat => {
        const [row, seatNumber] = seat.split('/');
        return `${row}. ${seatNumber}.szék`;
    });
  }
}
