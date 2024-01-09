import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Film } from '../models/Film';

@Injectable({
  providedIn: 'root'
})
export class CinemaService {

  constructor(private http: HttpClient) { }

  loadFilmMeta(metaUrl: string): Observable<Array<Film>> {
    // csak localhost-on működik
    return this.http.get('http://localhost:4200/assets/' + metaUrl) as Observable<Array<Film>>;
  }
}
