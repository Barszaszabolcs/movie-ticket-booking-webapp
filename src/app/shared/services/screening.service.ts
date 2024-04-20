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

  getById(id: string) {
    return this.angularFirestore.collection<Screening>(this.collectionName, ref => ref.where('id', '==', id)).valueChanges();
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
  
  getScreeningsByAuditoriumIdAndFilmIdAndDayAndType(auditoriumId: string, filmId: string, day: number, type: string):Observable<Array<Screening>> {
    return this.angularFirestore.collection<Screening>(this.collectionName, ref => ref.where('auditoriumId', '==', auditoriumId).where('filmId', '==', filmId).where('day', '==', day).where('type', '==', type).orderBy('time', 'asc')).valueChanges();
  }

  getFutureScreeningsByFilmId(filmId: string):Observable<Array<Screening>> {
    const currentDate = new Date().getTime();
    return this.angularFirestore.collection<Screening>(this.collectionName, ref => ref.where('filmId', '==', filmId).where('time', '>', currentDate).orderBy('time', 'asc')).valueChanges();
  }
  
  getFutureScreenings() {
    const currentDate = new Date().getTime();
    return this.angularFirestore.collection<Screening>(this.collectionName, ref => ref.where('time', '>', currentDate).orderBy('time', 'asc')).valueChanges();
  }

  get3dScreenings() {
    const currentDate = new Date().getTime();
    return this.angularFirestore.collection<Screening>(this.collectionName, ref => ref.where('type', '==', '3D').where('time', '>', currentDate).orderBy('time', 'asc')).valueChanges();
  }

  update(screening: Screening) {
    return this.angularFirestore.collection<Screening>(this.collectionName).doc(screening.id).set(screening);
  }
}
