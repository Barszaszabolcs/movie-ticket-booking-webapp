import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs';

import { Genres } from '../../shared/constants/constants';
import { Film } from '../../shared/models/Film';
import { SliderImage } from '../../shared/models/Slider-image';
import { FilmService } from '../../shared/services/film.service';
import { ScreeningService } from '../../shared/services/screening.service';
import { ImageSliderService } from '../../shared/services/image-slider.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit{

  genres = Genres;
  all = '';

  films: Array<Film> = [];
  allFilms: Array<Film> = [];
  loadedCoverImages: Array<string> = [];

  actionFilms: Array<Film> = [];
  dramaFilms: Array<Film> = [];
  animatedFilms: Array<Film> = [];
  horrorFilms: Array<Film> = [];
  onShowFilms: Array<Film> = [];
  specialFilms: Array<Film> = [];

  images?: Array<SliderImage>;
  loadedSliderImages: Array<string> = [];

  imageObject: Array<object> = [];

  searchForm = new FormGroup({
    title: new FormControl(''),
    genre: new FormControl('')
  });

  constructor(
    private filmService: FilmService, private imageSliderService: ImageSliderService,
    private screeningService: ScreeningService) {}

  ngOnInit(): void {
    this.films = [];
    this.actionFilms = [];
    this.dramaFilms = [];
    this.animatedFilms = [];
    this.onShowFilms = [];
    this.specialFilms = [];
    this.loadedCoverImages = [];
    this.images = [];
    this.loadedSliderImages = [];
    this.imageObject = [];

    this.searchForm.valueChanges.subscribe(_ => {
      const title = this.searchForm.get('title')?.value as string;
      const genre = this.searchForm.get('genre')?.value as string;
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
      this.allFilms = data;

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

    this.imageSliderService.loadImageMeta().subscribe((data: Array<SliderImage>) => {
      this.images = data;

      if (this.images) {
        for (let index = 0; index < this.images.length; index++) {
          this.imageSliderService.loadSliderImage(this.images[index].image_url).pipe(take(1)).subscribe(data => {
            if (!(this.loadedSliderImages.includes(data))) {
              this.loadedSliderImages.push(data);
              this.imageObject.push({thumbImage: data})
            }
          });
        }
      }
    });

    this.searchForm.get('title')?.addValidators([Validators.maxLength(200)]);

    this.filmService.loadFilmMetaByGenre('Akció').subscribe((data: Array<Film>) => {
      this.actionFilms = data;
    });

    this.filmService.loadFilmMetaByGenre('Animáció').subscribe((data: Array<Film>) => {
      this.animatedFilms = data;
    });

    this.filmService.loadFilmMetaByGenre('Dráma').subscribe((data: Array<Film>) => {
      this.dramaFilms = data;
    });

    this.filmService.loadFilmMetaByGenre('Horror').subscribe((data: Array<Film>) => {
      this.horrorFilms = data;
    });

    this.screeningService.getFutureScreenings().subscribe(data => {
      this.onShowFilms = [];
      data.forEach(screening => {
        this.filmService.loadFilmMetaById(screening.filmId).pipe(take(1)).subscribe(data => {
          const film = data[0]
          if (film) {
            if (!(this.onShowFilms.find(f => f.id === film.id))) {
              this.onShowFilms.push(film);
            }
          }
        });
      });
    });

    this.screeningService.get3dScreenings().subscribe(data => {
      this.specialFilms = [];
      data.forEach(screening => {
        this.filmService.loadFilmMetaById(screening.filmId).pipe(take(1)).subscribe(data => {
          const film = data[0]
          if (film) {
            if (!(this.specialFilms.find(f => f.id === film.id))) {
              this.specialFilms.push(film);
            }
          }
        });
      });
    });
  }
}
