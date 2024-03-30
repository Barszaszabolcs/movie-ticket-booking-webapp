import { Component } from '@angular/core';
import { Film } from '../../models/Film';
import { FilmService } from '../../services/film.service';
import { ScreeningService } from '../../services/screening.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-special-effect-films-list',
  templateUrl: './special-effect-films-list.component.html',
  styleUrls: ['./special-effect-films-list.component.scss']
})
export class SpecialEffectFilmsListComponent {
  
  films: Array<Film> = [];
  loadedCoverImages: Array<string> = [];

  presentIndex = 0;
  presentEndIndex = 6;

  constructor(private filmService: FilmService, private screeningService: ScreeningService) {}

  ngOnInit(): void {
    this.films = [];
    this.loadedCoverImages = [];

    this.screeningService.get3dScreenings().subscribe(data => {
      this.films = [];
      data.forEach(screening => {
        this.filmService.loadFilmMetaById(screening.filmId).pipe(take(1)).subscribe(data => {
          const film = data[0]
          if (film) {
            if (!(this.films.find(f => f.id === film.id))) {
              this.films.push(film);
            }
          }
        });
      });
    });

    this.filmService.loadFilmMeta().subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        this.filmService.loadCoverImage(data[i].cover_url).pipe(take(1)).subscribe(data => {
          if (!(this.loadedCoverImages.includes(data))) {
            this.loadedCoverImages.push(data);
          }
        });
      }
    });
  }

  getCoverUrl(film: Film): string | undefined {
    return this.loadedCoverImages.find(coverUrl => coverUrl.includes(film.cover_url.split(".")[0].split("/")[1]));
  }

  nextButton() {
    if (this.presentEndIndex >= this.films?.length) {
      console.log("Előrefele nincs több film");
    } else {
      this.presentIndex += 2;
      this.presentEndIndex += 2;
    }
  }

  previousButton() {
    if (this.presentIndex <= 0) {
      console.log("Visszafele nincs több film!")
    } else {
      this.presentIndex -= 2;
      this.presentEndIndex -= 2;
    }
  }
}
