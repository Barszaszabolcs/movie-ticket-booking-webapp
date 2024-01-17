import { Component, OnInit } from '@angular/core';
import { Film } from '../../shared/models/Film';
import { FilmService } from '../../shared/services/film.service';
import { take } from 'rxjs';
import { SliderImage } from '../../shared/models/Slider-image';
import { ImageSliderService } from '../../shared/services/image-slider.service';
import { Genres } from '../../shared/constants/constants';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-cinema',
  templateUrl: './cinema.component.html',
  styleUrls: ['./cinema.component.scss']
})
export class CinemaComponent implements OnInit{

  genres = Genres;
  all = '';

  films: Array<Film> = [];
  allFilms: Array<Film> = [];
  loadedCoverImages: Array<string> = [];

  images?: Array<SliderImage>;
  loadedSliderImages: Array<string> = [];

  imageObject: Array<object> = [];

  searchForm = new FormGroup({
    title: new FormControl(''),
    genre: new FormControl('')
  });

  constructor(private filmService: FilmService, private imageSliderService: ImageSliderService) {}

  ngOnInit(): void {
    this.films = [];
    this.loadedCoverImages = [];
    this.images = [];
    this.loadedSliderImages = [];
    this.imageObject = [];
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
  }

  getCoverUrl(film: Film): string | undefined {
    return this.loadedCoverImages.find(coverUrl => coverUrl.includes(film.cover_url.split(".")[0].split("/")[1]));
  }

  onSearch() {
    if (this.searchForm.valid) {
      let title = this.searchForm.get('title')?.value as string;
      let genre = this.searchForm.get('genre')?.value as string;
  
      this.films = this.allFilms;
  
      if (title === '' && genre === '') {
        this.films = this.allFilms;
  
      } else if (title !== '' && genre === '') {
        this.films = this.films.filter(film => film.title.toLowerCase().includes(title.toLowerCase()));
  
      } else if (title === '' && genre !== '') {
        this.films = this.films.filter(film => film.genres.includes(genre));
  
      } else if (title !== '' && genre !== '') {
        this.films = this.films.filter(film => film.genres.includes(genre));
        this.films = this.films.filter(film => film.title.toLowerCase().includes(title.toLowerCase()));
  
      } else {
        this.films = [];
      }
    }
  }
}
