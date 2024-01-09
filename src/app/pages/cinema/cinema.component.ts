import { Component, OnInit } from '@angular/core';
import { CinemaService } from '../../shared/services/cinema.service';
import { Film } from '../../shared/models/Film';

@Component({
  selector: 'app-cinema',
  templateUrl: './cinema.component.html',
  styleUrls: ['./cinema.component.scss']
})
export class CinemaComponent implements OnInit{

  filmObject?: Array<Film>;

  constructor(private cinemaService: CinemaService) {}

  ngOnInit(): void {
    this.cinemaService.loadFilmMeta('__credits.json').subscribe((data: Array<Film>) => {
      this.filmObject = data;
    })
  }
}
