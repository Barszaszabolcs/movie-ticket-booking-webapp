import { Component, Input, OnInit } from '@angular/core';
import { Film } from '../../models/Film';
import { FilmService } from '../../services/film.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-film-list',
  templateUrl: './film-list.component.html',
  styleUrls: ['./film-list.component.scss']
})
export class FilmListComponent implements OnInit{
  @Input() genre?: string;

  films: Array<Film> = [];
  loadedCoverImages: Array<string> = [];

  presentIndex = 0;
  presentEndIndex = 6;

  constructor(private filmService: FilmService) {}

  ngOnInit(): void {
    this.films = [];
    this.loadedCoverImages = [];
    this.filmService.loadFilmMetaByGenre(this.genre as string).subscribe((data: Array<Film>) => {
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
