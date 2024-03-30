import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
import { Genres } from '../../shared/constants/constants';

@Component({
  selector: 'app-screening-create',
  templateUrl: './screening-create.component.html',
  styleUrls: ['./screening-create.component.scss']
})
export class ScreeningCreateComponent implements OnInit{
  
  // bejelentkezett admin
  user?: User;
  
  // az összes műfaj
  genres = Genres;
  // segítség a kereséshez, hogy újra lehessen üres a mező
  all = '';

  // a keresés eredményét tároló tömb
  films: Array<Film> = [];

  // mozi ahol az admin dolgozik
  cinema?: Cinema;
  // a mozihoz tartozó termek
  auditoriums: Array<Auditorium> = [];

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
  
  // segítség a vetítés foglalt székeihez
  occupied_seats_help: Array<string> = [];

  // vetítés létrehozó form
  screeningForm = this.createForm({
    auditoriumId: '',
    day: null,
    time: null,
    film_title: '',
    screening_length: 0,
    language: '',
    type: ''
  });

  searchForm = new FormGroup({
    title: new FormControl(''),
    genre: new FormControl('')
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

    this.films = []
    this.loadedCoverImages = [];

    this.searchForm.valueChanges.subscribe(_ => {
      const title = this.searchForm.get('title')?.value as string;
      const genre = this.searchForm.get('genre')?.value as string;
      this.presentIndex = 0;
      this.presentEndIndex = 6;
      if (genre === 'all' || !genre) {
        this.filmService.loadFilmMeta().subscribe(data => {
          this.films = data.filter(film => film.title.toLowerCase().includes(title.toLowerCase()));
        });
      } else {
        this.filmService.loadFilmMetaByGenre(genre).subscribe(data => {
          this.films = data.filter(film => film.title.toLowerCase().includes(title.toLowerCase()));
        });
      }
    });

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

    this.searchForm.get('title')?.addValidators([Validators.maxLength(200)]);

    this.selectedDayHours = [];

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
    screeningGroup.get('type')?.addValidators([Validators.required]);
    return screeningGroup;
  }

  nextButton() {
    if (this.presentEndIndex >= this.films.length) {
    } else {
      this.presentIndex += 2;
      this.presentEndIndex += 2;
    }
  }

  previousButton() {
      if (this.presentIndex <= 0) {
      } else {
        this.presentIndex -= 2;
        this.presentEndIndex -= 2;
      }
  }

  chooseFilm(id: string) {
    this.screeningForm.get('auditoriumId')?.reset();
    this.screeningForm.get('day')?.reset();
    this.screeningForm.get('time')?.reset();
    this.selectedDay = undefined;
    this.selectedAuditorium = undefined;
    this.selectedDayHours = [];
    this.filmService.loadFilmMetaById(id).pipe(take(1)).subscribe(data => {
      this.chosenFilm = data[0];
      this.screeningTime = this.chosenFilm.movie_length + 15;
    });
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

  /*onSearch() {
    if (this.searchForm.valid) {
      let title = this.searchForm.get('title')?.value as string;
      let genre = this.searchForm.get('genre')?.value as string;

      this.films = this.allFilms;

      if (title === '' && genre === '') {
        this.films = undefined;

      } else if (title !== '' && genre === '') {
        this.films = this.films.filter(film => film.title.toLowerCase().includes(title.toLowerCase()));

      } else if (title === '' && genre !== '') {
        this.films = this.films.filter(film => film.genres.includes(genre));

      } else if (title !== '' && genre !== '') {
        this.films = this.films.filter(film => film.genres.includes(genre));
        this.films = this.films.filter(film => film.title.toLowerCase().includes(title.toLowerCase()));

      } else {
        this.films = undefined;
      }
    }
  }*/
  
  auditoriumSelected() {
    this.screeningForm.get('day')?.reset();
    this.screeningForm.get('time')?.reset();
    this.selectedDay = undefined;
    this.selectedDayHours = [];
    this.auditoriumService.getById(this.screeningForm.get('auditoriumId')?.value as string).pipe(take(1)).subscribe(data => {
      this.selectedAuditorium = data[0];
    });
  }

  daySelected() {
    this.screeningForm.get('time')?.reset();
    this.selectedDayHours = [];
    this.selectedDay = this.screeningForm.get('day')?.value as Date;
    this.selectedDayHours = this.createHoursArray(this.selectedDay);

    this.screeningService.getScreeningsByAuditoriumIdAndDay(this.selectedAuditorium?.id as string, this.selectedDay.getTime()).subscribe(data => {

      data.forEach(screening => {
        this.selectedDayHours = this.selectedDayHours.filter(hour => !(hour === screening.time));
      });

      if (this.selectedDay) {
        const selectedDayHelp = (this.screeningForm.get('day')?.value as Date).getTime();
        this.auditoriums.forEach(auditorium => {
          this.screeningService.getScreeningsByAuditoriumIdAndFilmIdAndDay(auditorium.id, this.chosenFilm?.id as string, selectedDayHelp).subscribe(data => {
            data.forEach(screening => {
              this.selectedDayHours = this.selectedDayHours.filter(hour => !(hour === screening.time));
            });
          });
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
          type: this.screeningForm.get('type')?.value as string,
          language: this.screeningForm.get('language')?.value as string,
          occupied_seats: this.occupied_seats_help,
          filmId: this.chosenFilm.id,
          adminId: this.user?.id as string,
          auditoriumId: this.screeningForm.get('auditoriumId')?.value as string
        }

        this.screeningService.create(screening).then(_ => {
          this.toastr.success('Sikeres vetítés létrehozás!', 'Vetítés létrehozás');
          this.screeningForm.reset();
          this.chosenFilm = undefined;
          this.selectedDay = undefined;
          this.selectedAuditorium = undefined;
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
