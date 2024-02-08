import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Auditorium } from '../models/Auditorium';

@Injectable({
  providedIn: 'root'
})
export class AuditoriumService {

  collectionName = 'Auditoriums';

  constructor(private angularFirestore: AngularFirestore) {}

  create(auditorium: Auditorium) {
    auditorium.id = this.angularFirestore.createId();
    return this.angularFirestore.collection<Auditorium>(this.collectionName).doc(auditorium.id).set(auditorium);
  }

  getAuditoriumsByCinemaId(cinemaId: string){
    return this.angularFirestore.collection<Auditorium>(this.collectionName, ref => ref.where('cinemaId', '==', cinemaId).orderBy('hall_number', 'asc')).valueChanges();
  }
}
