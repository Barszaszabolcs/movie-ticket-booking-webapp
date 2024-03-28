import { Component, OnInit } from '@angular/core';
import { Film } from '../../models/Film';
import { FilmService } from '../../services/film.service';
import { ScreeningService } from '../../services/screening.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-on-show-films-list',
  templateUrl: './on-show-films-list.component.html',
  styleUrls: ['./on-show-films-list.component.scss']
})
export class OnShowFilmsListComponent implements OnInit{

  films: Set<Film> = new Set();
  loadedCoverImages: Array<string> = [];

  presentIndex = 0;
  presentEndIndex = 6;

  constructor(private filmService: FilmService, private screeningService: ScreeningService) {}

  ngOnInit(): void {
    this.films.clear();
    this.loadedCoverImages = [];

    this.screeningService.getFutureScreenings().subscribe(data => {
      this.films.clear();
      data.forEach(screening => {
        this.filmService.loadFilmMetaById(screening.filmId).pipe(take(1)).subscribe(data => {
          if (!(this.films.has(data[0]))) {
            this.films.add(data[0]);
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
    if (this.presentEndIndex >= this.films?.size) {
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

  setSlice<Film>(set: Set<Film>, start: number, end?: number): Set<Film> {
    const result = new Set<Film>();
    const array = Array.from(set);
    const slicedArray = array.slice(start, end);
    slicedArray.forEach(item => {
        result.add(item);
    });
    return result;
}
}
