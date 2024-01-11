import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Film } from '../models/Film';

@Injectable({
  providedIn: 'root'
})
export class FilmService {

  collectionName = 'Films'

  constructor(private angularFirestore: AngularFirestore) { }

  create(film: Film) {
    film.id = this.angularFirestore.createId();
    return this.angularFirestore.collection<Film>(this.collectionName).doc(film.id).set(film);
  }
}
