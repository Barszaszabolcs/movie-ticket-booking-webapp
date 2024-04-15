import { Component, Input, OnInit} from '@angular/core';
import { deleteObject, getStorage, ref } from '@angular/fire/storage';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { Film } from '../../models/Film';
import { AuthService } from '../../services/auth.service';
import { FilmService } from '../../services/film.service';

@Component({
  selector: 'app-film-list',
  templateUrl: './film-list.component.html',
  styleUrls: ['./film-list.component.scss']
})
export class FilmListComponent implements OnInit{
  @Input() films!: Array<Film>;
  @Input() onShowfilms?: Array<Film>;
  @Input() loadedCoverImages!: Array<string>;

  presentIndex = 0;
  presentEndIndex = 6;

  isLoggedIn?: any;
  isSuperadmin?: any;

  loading = false;
  
  constructor(
    private router: Router, private authService: AuthService,
    private filmService: FilmService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.authService.isUserLoggedIn().subscribe(data => {
      this.isLoggedIn = data;
      this.isSuperadmin = localStorage.getItem('superadmin');
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

  goToFilm(id: string) {
    localStorage.setItem('filmPageAvaliable', JSON.stringify(true));
    this.router.navigate(['/film/' + id]);
  }

  canDelete(film: Film): Film | undefined {
    if (this.onShowfilms) {
      return this.onShowfilms.find(inFilm => inFilm.id === film.id);
    } else {
      return undefined;
    }
  }

  deleteFilm(film: Film) {
    if (confirm('Biztosan törölni szeretnéd a(z) "' + film.title + '" című filmet?')) {
      this.loading = true;
      this.filmService.delete(film.id).then(_ => {
        const storage = getStorage();
        const file = ref(storage, film.cover_url);
  
        deleteObject(file).then(() => {
          this.toastr.success('Film sikeresen törölve!', 'Film törlés');
          this.loading = false;
        }).catch((error) => {
          this.toastr.error('Sikertelen film törlés!', 'Film törlés');
          this.loading = false;
        });
      }).catch(error => {
        this.toastr.error('Sikertelen film törlés!', 'Film törlés');
        this.loading = false;
      });
    }
  }
}
