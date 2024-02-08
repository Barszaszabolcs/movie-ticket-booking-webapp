import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { User } from '../../shared/models/User';
import { Film } from '../../shared/models/Film';
import { Cinema } from '../../shared/models/Cinema';
import { Screening } from '../../shared/models/Screening';
import { Auditorium } from '../../shared/models/Auditorium';
import { FilmService } from '../../shared/services/film.service';
import { UserService } from '../../shared/services/user.service';
import { CinemaService } from '../../shared/services/cinema.service';
import { ScreeningService } from '../../shared/services/screening.service';
import { AuditoriumService } from '../../shared/services/auditorium.service';

@Component({
  selector: 'app-screening-create',
  templateUrl: './screening-create.component.html',
  styleUrls: ['./screening-create.component.scss']
})
export class ScreeningCreateComponent implements OnInit{
  
  // bejelentkezett admin
  user?: User;
  
  // mozi ahol az admin dolgozik
  cinema?: Cinema;
  // a mozihoz tartozó termek
  auditoriums: Array<Auditorium> = [];

  // összes film
  films?: Array<Film>;
  // a filmek borítóképei
  loadedCoverImages: Array<string> = [];

  // lapozáshoz kezdő index
  presentIndex = 0;
  // lapozáshoz utolsó index
  presentEndIndex = 6;

  // kiválasztott film
  chosenFilm?: Film;

  // a film hossza + a takarítás
  screeningTime?: number;

  // kiválasztott terem
  selectedAuditorium?: Auditorium;

  // kiválasztott nap
  selectedDay?: Date;
  // mától nézett következő 7 nap
  week = new Array(7).fill(new Date());
  // a választott naphoz tartozó órák
  selectedDayHours = new Array(6).fill(new Date());
  
  // már lementett vetítések
  savedScreenings: Array<Screening> = [];
  
  // foglalt időpontok
  usedAppointments: Array<number> = [];
  // szabad időpontok
  notUsedAppointments: Array<number> = [];
  
  // segítség a vetítés foglalt székeihez
  occupied_seats_help: Array<string> = [];

  // vetítés létrehozó form
  screeningForm = this.createForm({
    auditoriumId: '',
    day: null,
    time: null,
    film_title: '',
    screening_length: 0,
    language: ''
  });

  constructor(
    private filmService: FilmService, private cinemaService: CinemaService,
    private userService: UserService, private auditoriumService: AuditoriumService,
    private screeningService: ScreeningService, private formBuilder: FormBuilder, 
    private toastr: ToastrService) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') as string) as firebase.default.User;
    this.userService.getById(user.uid).pipe(take(1)).subscribe(data => {
      this.user = data[0];

      if (this.user) {
        this.cinemaService.getById(this.user.cinemaId).pipe(take(1)).subscribe(data => {
          this.cinema = data[0];

          if (this.cinema) {
            this.auditoriumService.getAuditoriumsByCinemaId(this.cinema.id).subscribe(data => {
              this.auditoriums = data;
            });
          }
        });
      }
    });

    this.films = [];
    this.loadedCoverImages = [];
    this.filmService.loadFilmMeta().subscribe((data: Array<Film>) => {
      this.films = data;

      if (this.films) {
        for (let index = 0; index < this.films.length; index++) {
          this.filmService.loadCoverImage(this.films[index].cover_url).pipe(take(1)).subscribe(data => {
            if (!(this.loadedCoverImages.includes(data))) {
              this.loadedCoverImages.push(data);
            }
          });
        }
      }
    });

    this.savedScreenings = [];
    this.usedAppointments = [];
    this.notUsedAppointments= [];

    this.getNextWeek();
  }

  getCoverUrl(film: Film): string | undefined {
    return this.loadedCoverImages.find(coverUrl => coverUrl.includes(film.cover_url.split(".")[0].split("/")[1]));
  }

  createForm(model: any) {
    let screeningGroup = this.formBuilder.group(model);
    screeningGroup.get('auditoriumId')?.addValidators([Validators.required]);
    screeningGroup.get('day')?.addValidators([Validators.required]);
    screeningGroup.get('time')?.addValidators([Validators.required]);
    screeningGroup.get('film_title')?.disable();
    screeningGroup.get('screening_length')?.disable();
    screeningGroup.get('language')?.addValidators([Validators.required]);
    return screeningGroup;
  }

  nextButton() {
    if (this.presentEndIndex == this.films?.length) {
    } else {
      this.presentIndex += 2;
      this.presentEndIndex += 2;
    }
  }

  previousButton() {
      if (this.presentIndex == 0) {
      } else {
        this.presentIndex -= 2;
        this.presentEndIndex -= 2;
      }
  }

  chooseFilm(id: string) {
    this.usedAppointments = [];
    this.notUsedAppointments = [];
    this.filmService.loadFilmMetaById(id).pipe(take(1)).subscribe(data => {
      this.chosenFilm = data[0];
      this.screeningTime = this.chosenFilm.movie_length + 15;
    })
  }

  getNextWeek(){
    var date = new Date();
    for(let i = 0; i < 7; i++){
      this.week[i] = new Date(date.getFullYear(),date.getMonth(),date.getDate()+(i+1));
    }
  }

  getSelectedDayHours() {
    var date = new Date();
    for(let i = 0; i < 5; i++){
      this.week[i] = new Date(date.getFullYear(),date.getMonth(),date.getDate()+(i+1));
    }
  }

  // Függvény az órák hozzáadásához a megadott dátumhoz
  addHoursToDate(date: Date, hours: number): Date {
    const newDate = new Date(date);
    newDate.setHours(hours);
    newDate.setMinutes(0);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    return newDate;
  }

  // Függvény a kiválasztott nap óráit (number-ként) tartalmazó tömb létrehozásához
  createHoursArray(selectedDate: Date): number[] {
    const hoursArray: number[] = [];
    const hoursToAdd = [7, 10, 13, 16, 19, 22];

    // Órák hozzáadása a tömbhöz (number-ként)
    hoursToAdd.forEach(hour => {
        const dateWithHour = this.addHoursToDate(selectedDate, hour);
        hoursArray.push(dateWithHour.getTime());
    });

    return hoursArray;
  }
  
  auditoriumSelected() {
    this.notUsedAppointments= [];
    this.auditoriumService.getById(this.screeningForm.get('auditoriumId')?.value as string).pipe(take(1)).subscribe(data => {
      this.selectedAuditorium = data[0];
    });
  }

  daySelected() {
    // szabad időpontok nullázása
    this.notUsedAppointments= [];
    this.selectedDay = this.screeningForm.get('day')?.value as Date;
    this.selectedDayHours = this.createHoursArray(this.selectedDay);

    // a választott filmhez, teremhez és naphoz tartozó vetítések lekérése az adatbázisból
    this.screeningService.getScreeningsByAuditoriumIdAndFilmIdAndDay(this.selectedAuditorium?.id as string, this.chosenFilm?.id as string, (this.screeningForm.get('day')?.value as Date).getTime()).subscribe((data: Array<Screening>) => {
      this.savedScreenings = data;

      if (this.savedScreenings) {
        this.savedScreenings.forEach(screening => {
          // foglalt időpontok lementése
          if (!this.usedAppointments.includes(screening.time as number)) {
            this.usedAppointments.push(screening.time);
          }
        });
      }

      // a kiválasztott órákat akkor mentjük le, ha nem szerepel a foglalt időpontok között
      if (this.usedAppointments) {
        this.selectedDayHours.forEach(hour => {
          if (!this.usedAppointments.includes(hour)) {
            if (!this.notUsedAppointments.includes(hour)) {
              this.notUsedAppointments.push(hour);
            }
          }
        });
      }
    });
  }

  createScreening() {
    if (this.screeningForm.valid) {
      if (this.chosenFilm) {
        const day: number = new Date(this.screeningForm.get('day')?.value as Date).getTime();
        const time: number = new Date(this.screeningForm.get('time')?.value as Date).getTime();
        const screening: Screening = {
          id: '',
          film_title: this.chosenFilm.title,
          day: day,
          time: time,
          length: this.screeningTime as number,
          type: '2D',
          language: this.screeningForm.get('language')?.value as string,
          occupied_seats: this.occupied_seats_help,
          filmId: this.chosenFilm.id,
          adminId: this.user?.id as string,
          auditoriumId: this.screeningForm.get('auditoriumId')?.value as string
        }

        this.screeningService.create(screening).then(_ => {
          this.toastr.success('Sikeres vetítés létrehozás!', 'Vetítés létrehozás');
          window.location.reload();
        }).catch(error => {
          this.toastr.error('Sikertelen vetítés létrehozás!', 'Vetítés létrehozás');
        });
      } else {
        this.toastr.error('Ki kell választani egy filmet!', 'Vetítés létrehozás');
      }
    } else {
      this.toastr.error('Sikertelen vetítés létrehozás!', 'Vetítés létrehozás');
    }
  }
}
