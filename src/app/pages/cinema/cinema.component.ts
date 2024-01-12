import { Component, OnInit } from '@angular/core';
import { Film } from '../../shared/models/Film';
import { FilmService } from '../../shared/services/film.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-cinema',
  templateUrl: './cinema.component.html',
  styleUrls: ['./cinema.component.scss']
})
export class CinemaComponent implements OnInit{

  films?: Array<Film>;
  loadedCoverImages: Array<string> = [];

  constructor(private filmService: FilmService) {}

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
          })
          
        }
      }
    })
  }

  getCoverUrl(film: Film): string | undefined {
    return this.loadedCoverImages.find(coverUrl => coverUrl.includes(film.cover_url.split(".")[0].split("/")[1]));
  }

}
