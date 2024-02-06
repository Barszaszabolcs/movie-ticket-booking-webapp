import { Component, OnInit } from '@angular/core';
import { Film } from '../../shared/models/Film';
import { FilmService } from '../../shared/services/film.service';
import { take } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-screening-create',
  templateUrl: './screening-create.component.html',
  styleUrls: ['./screening-create.component.scss']
})
export class ScreeningCreateComponent implements OnInit{

  films?: Array<Film>;
  loadedCoverImages: Array<string> = [];

  presentIndex = 0;
  presentEndIndex = 6;

  chosenFilm?: Film;

  screeningTime?: number;

  selectedDay?: Date;
  week = new Array(7).fill(new Date());
  selectedDayHours = new Array(5).fill(new Date())

  screeningForm = this.createForm({
    auditoriumId: '',
    day: null,
    time: null,
    film_title: '',
    screening_length: 0,
    language: ''
  });

  constructor(private filmService: FilmService, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
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

    this.getNextWeek();
  }

  getCoverUrl(film: Film): string | undefined {
    return this.loadedCoverImages.find(coverUrl => coverUrl.includes(film.cover_url.split(".")[0].split("/")[1]));
  }

  createForm(model: any) {
    let screeningGroup = this.formBuilder.group(model);
    //screeningGroup.get('auditoriumId')?.addValidators([Validators.required]);
    screeningGroup.get('day')?.addValidators([Validators.required]);
    screeningGroup.get('time')?.addValidators([Validators.required]);
    //screeningGroup.get('film_title')?.addValidators([Validators.required]);
    screeningGroup.get('film_title')?.disable();
    //screeningGroup.get('screening_length')?.addValidators([Validators.required]);
    screeningGroup.get('screening_length')?.disable();
    screeningGroup.get('language')?.addValidators([Validators.required]);
    return screeningGroup;
  }

  nextButton() {
    if (this.presentEndIndex == this.films?.length) {
      console.log("Előrefele nincs több film");
    } else {
      this.presentIndex += 2;
      this.presentEndIndex += 2;
    }
  }

  previousButton() {
      if (this.presentIndex == 0) {
        console.log("Visszafele nincs több film!")
      } else {
        this.presentIndex -= 2;
        this.presentEndIndex -= 2;
      }
  }

  chooseFilm(id: string) {
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

  // Függvény a kiválasztott nap óráit tartalmazó tömb létrehozásához
  createHoursArray(selectedDate: Date): Date[] {
    const hoursArray: Date[] = [];
    const hoursToAdd = [8, 11, 14, 17, 20];

    // Órák hozzáadása a tömbhöz
    hoursToAdd.forEach(hour => {
        const dateWithHour = this.addHoursToDate(selectedDate, hour);
        hoursArray.push(dateWithHour);
    });

    return hoursArray;
  }
  
  daySelected() {
    this.selectedDay = this.screeningForm.get('day')?.value as Date;
    this.selectedDayHours = this.createHoursArray(this.selectedDay);
  }

  createScreening() {
    if (this.screeningForm.valid) {
      if (this.chosenFilm) {
        console.log(this.chosenFilm.title);
        console.log(this.screeningForm.get('time')?.value);
        console.log(this.screeningTime);
        console.log(this.screeningForm.get('language')?.value);
      } else {
        console.error('VÁLASSZ EGY FILMET!')
      }
    } else {
      console.error('whats up?');
    }
  }
}
