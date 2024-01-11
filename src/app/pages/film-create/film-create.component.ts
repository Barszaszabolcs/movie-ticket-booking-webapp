import { Component } from '@angular/core';
import { Genres } from '../../shared/constants/constants';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Film } from '../../shared/models/Film';
import { AngularFireStorage } from '@angular/fire/compat/storage'
import { FilmService } from '../../shared/services/film.service';

@Component({
  selector: 'app-film-create',
  templateUrl: './film-create.component.html',
  styleUrls: ['./film-create.component.scss']
})
export class FilmCreateComponent {

  coverImageFile?: any;
  coverImageFilePath?: string;

  allGenres = Genres;
  genres: string[] = [];
  ratings: number[] = [];

  filmForm = this.createForm({
    title: '',
    movie_length: 120,
    summary: '',
    age_limit: 0,
    cover_url: '',
    chosenGenres: this.formBuilder.array([]),
    director: '',
    actors: '',
  });

  constructor(private formBuilder: FormBuilder, private fireStorage: AngularFireStorage, private filmService: FilmService) {}

  createForm(model: any) {
    let filmGroup = this.formBuilder.group(model);
    filmGroup.get('title')?.addValidators([Validators.required, Validators.minLength(2), Validators.maxLength(200)]);
    filmGroup.get('movie_length')?.addValidators([Validators.required, Validators.min(30), Validators.max(400)]);
    filmGroup.get('summary')?.addValidators([Validators.required, Validators.minLength(10), Validators.maxLength(1000)]);
    filmGroup.get('age_limit')?.addValidators([Validators.required, Validators.min(0), Validators.max(18)]);
    filmGroup.get('cover_url')?.addValidators([Validators.required]);
    filmGroup.get('director')?.addValidators([Validators.required, Validators.minLength(5), Validators.maxLength(200)]);
    filmGroup.get('actors')?.addValidators([Validators.required, Validators.minLength(10), Validators.maxLength(1000)]);
    return filmGroup;
  }

  handleGenres(event: any) {
    let genreArray = this.filmForm.get('chosenGenres') as FormArray;

    if (event.checked) {
      genreArray.push(new FormControl(event.source.value));
    }
    else {
      let i = 0;
      genreArray.controls.forEach(
        (genre: any) => {
          if (genre.value === event.source.value) {
            genreArray.removeAt(i);
            return;
          }
          i++;
        }
      );
    }
  }

  async onFileSelected(event: any) {
    if (this.filmForm.valid) {
      this.coverImageFile = event.target.files[0];
    } else {
      event.target.value = '';
    }
  }

  async createFilm() {

    let genreArray = this.filmForm.get('chosenGenres') as FormArray;
    if (genreArray.length === 0) {
      console.log("EGY MŰFAJT LEGALÁBB KI KELL VÁLASZTANI");
    } else if (genreArray.length >= 5) {
      console.log("EGY FILMNEK MAXIMUM 5 MŰFAJA LEHET");
    }

    if (this.filmForm.valid && this.coverImageFile && genreArray.length > 0 && genreArray.length <= 5) {
      this.filmForm.get('creation_date')?.setValue(new Date());

      let tzOffset = (new Date()).getTimezoneOffset() * 60000;
      let minOffset = new Date().getTime() - tzOffset
      let localISOTime = (new Date(minOffset)).toISOString().replaceAll(':', '-').replace('Z', '').replace('T', ' ').split('.')[0].replaceAll(' ', '-');

      let filmObject: Film = {
        id: '',
        title: this.filmForm.get('title')?.value as string,
        movie_length: this.filmForm.get('movie_length')?.value as number,
        summary: this.filmForm.get('summary')?.value as string,
        age_limit: this.filmForm.get('age_limit')?.value as number,
        cover_url: 'images/' +  localISOTime + '.png',
        genres: this.genres,
        director: this.filmForm.get('director')?.value as string,
        actors: this.filmForm.get('actors')?.value as string,
        creation_date: new Date(),
        ratings: this.ratings
      };

      genreArray.controls.forEach((genre: any) => {
        filmObject.genres.push(genre.value as string);
      });

      this.coverImageFilePath = 'images/' + localISOTime + '.png';
      const fileUploadTask = this.fireStorage.upload(this.coverImageFilePath, this.coverImageFile);

      try {
        await fileUploadTask;
      } catch(error) {
        console.error(error);
      }

      await this.filmService.create(filmObject).then(_ => {
        console.log("SIKERES FILM LÉTREHOZÁS");
        filmObject.genres.length = 0;
      }).catch(error => {
        console.error(error);
        filmObject.genres.length = 0;
      });
    }
  }
}
