import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Screening } from '../models/Screening';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScreeningService {

  collectionName = 'Screenings';

  constructor(private angularFirestore: AngularFirestore) { }

  create(screening: Screening) {
    screening.id = this.angularFirestore.createId();
    return this.angularFirestore.collection<Screening>(this.collectionName).doc(screening.id).set(screening);
  }

  getAll():Observable<Array<Screening>> {
    return this.angularFirestore.collection<Screening>(this.collectionName).valueChanges();
  }

  getScreeningsByAuditoriumIdAndDay(auditoriumId: string, day: number):Observable<Array<Screening>> {
    return this.angularFirestore.collection<Screening>(this.collectionName, ref => ref.where('auditoriumId', '==', auditoriumId).where('day', '==', day).orderBy('time', 'asc')).valueChanges();
  }

  getScreeningsByAuditoriumIdAndFilmIdAndDay(auditoriumId: string, filmId: string, day: number):Observable<Array<Screening>> {
    return this.angularFirestore.collection<Screening>(this.collectionName, ref => ref.where('auditoriumId', '==', auditoriumId).where('filmId', '==', filmId).where('day', '==', day).orderBy('time', 'asc')).valueChanges();
  }
}
