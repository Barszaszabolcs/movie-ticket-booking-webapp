import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Cinema } from '../models/Cinema';

@Injectable({
  providedIn: 'root'
})
export class CinemaService {

  collectionName = 'Cinemas';

  constructor(private angularFirestore: AngularFirestore) {}

  create(cinema: Cinema) {
    cinema.id = this.angularFirestore.createId();
    return this.angularFirestore.collection<Cinema>(this.collectionName).doc(cinema.id).set(cinema);
  }

  getById(id: string){
    return this.angularFirestore.collection<Cinema>(this.collectionName, ref => ref.where('id', '==', id)).valueChanges();
  }
}
