import { Component, OnInit } from '@angular/core';
import { Genres } from '../../shared/constants/constants';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Film } from '../../shared/models/Film';
import { AngularFireStorage } from '@angular/fire/compat/storage'
import { FilmService } from '../../shared/services/film.service';
import { ToastrService } from 'ngx-toastr';

import OpenAI from "openai";
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-film-create',
  templateUrl: './film-create.component.html',
  styleUrls: ['./film-create.component.scss']
})
export class FilmCreateComponent implements OnInit{

  loading = false;

  coverImageFile?: any;
  coverImageFilePath?: string;

  allGenres = Genres;
  genres: string[] = [];
  ratings: number[] = [];

  filmForm = this.createForm({
    title: '',
    movie_length: 120,
    summary: '', disabled: true,
    age_limit: 0,
    cover_url: '',
    chosenGenres: this.formBuilder.array([]),
    director: '',
    actors: '',
  });

  summary = '';
  canGenerate = false;
  isGenerated = false;
  inProgress = false;

  constructor(
    private formBuilder: FormBuilder, private fireStorage: AngularFireStorage,
    private filmService: FilmService, private toastr: ToastrService) {}
  
  ngOnInit(): void {
    this.filmForm.get('title')?.valueChanges.subscribe((value: any) => {
      if (value && value.length > 2) {
        this.canGenerate = true;
      } else {
        this.canGenerate = false;
      }
    })
  }

  createForm(model: any) {
    let filmGroup = this.formBuilder.group(model);
    filmGroup.get('title')?.addValidators([Validators.required, Validators.minLength(2), Validators.maxLength(200)]);
    filmGroup.get('movie_length')?.addValidators([Validators.required, Validators.min(30), Validators.max(400)]);
    filmGroup.get('summary')?.addValidators([Validators.required, Validators.minLength(10), Validators.maxLength(2000)]);
    filmGroup.get('summary')?.disable();
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

    this.loading = true;

    let genreArray = this.filmForm.get('chosenGenres') as FormArray;

    if (this.filmForm.valid && this.coverImageFile && genreArray.length > 0 && genreArray.length <= 6 && this.isGenerated) {

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
        this.toastr.error('Sikertelen képfeltöltés!', 'Film létrehozás');
        this.loading = false;
      }

      await this.filmService.create(filmObject).then(_ => {
        this.toastr.success('Sikeres film létrehozás!', 'Film létrehozás');
        filmObject.genres.length = 0;
        this.filmForm.reset();
        this.loading = false;
      }).catch(error => {
        this.toastr.error('Sikertelen film létrehozás!', 'Film létrehozás');
        filmObject.genres.length = 0;
        this.loading = false;
      });
    } else {
      if (genreArray.length === 0) {
        this.toastr.error('Egy műfajt legalább ki kell választani!', 'Film létrehozás');
        this.loading = false;
      } else if (genreArray.length > 6) {
        this.toastr.error('Egy filmnek maximum 6 műfaja lehet!', 'Film létrehozás');
        this.loading = false;
      } else {
        if (this.isGenerated) {
          this.toastr.error('Sikertelen film létrehozás!', 'Film létrehozás');
          this.loading = false;
        }
        this.loading = false;
      }
    }
  }

  async generateSummary() {
    this.inProgress = true;
    try {
      const openai = new OpenAI({
        apiKey: environment.apiKey,
        dangerouslyAllowBrowser: true
      });
  
      let completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: 'Generálj nekem egy maximum 600 karakteres összegzést a: ' + (this.filmForm.get('title')?.value as string) + ' című filmhez'}],
        model: 'gpt-3.5-turbo',
        // A kimeneti szöveg változatosságának mértékét szabályozza, minél magasabb, annál változatosabb
        temperature: 0.95,
        // A generált szöveg maximális hosszát korlátozza. 300 token ~= 225 szó
        max_tokens: 300,
        // Több választási lehetőség
        top_p: 1.0,
        // Ismétlődő és ritka szavak korlátozása, minél alacsonyabb, annál engedékenyebb
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      }).then(response => {
        this.summary = response.choices[0].message.content as string;
        this.filmForm.get('summary')?.setValue(this.summary);
        this.canGenerate = false;
        this.isGenerated = true;
        this.inProgress = false;
      }).catch(error => {
        this.isGenerated = false;
        this.inProgress = false;
      });
      
    } catch (error) {
      this.isGenerated = false;
      this.inProgress = false;
    }
  }
}