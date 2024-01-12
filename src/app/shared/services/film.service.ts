import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Film } from '../models/Film';
import { Observable } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root'
})
export class FilmService {

  collectionName = 'Films'

  constructor(private angularFirestore: AngularFirestore, private fireStorage: AngularFireStorage) { }

  create(film: Film) {
    film.id = this.angularFirestore.createId();
    return this.angularFirestore.collection<Film>(this.collectionName).doc(film.id).set(film);
  }

  loadFilmMeta(): Observable<Array<Film>> {
    return this.angularFirestore.collection<Film>(this.collectionName).valueChanges();
  }

  loadFilmMetaById(id: string) {
    return this.angularFirestore.collection<Film>(this.collectionName, ref => ref.where('id', '==', id)).valueChanges();
  }

  loadCoverImage(coverUrl: string) {
    return this.fireStorage.ref(coverUrl).getDownloadURL();
  }
}
