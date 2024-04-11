import { Component, Input} from '@angular/core';
import { Film } from '../../models/Film';
import { Router } from '@angular/router';

@Component({
  selector: 'app-film-list',
  templateUrl: './film-list.component.html',
  styleUrls: ['./film-list.component.scss']
})
export class FilmListComponent{
  @Input() films!: Array<Film>;
  @Input() loadedCoverImages!: Array<string>;

  presentIndex = 0;
  presentEndIndex = 6;

  constructor(private router: Router) {}

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

  goToFilm(id: string) {
    localStorage.setItem('filmPageAvaliable', JSON.stringify(true));
    this.router.navigate(['/film/' + id]);
  }
}
