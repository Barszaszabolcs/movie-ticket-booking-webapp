import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Ticket } from '../models/Ticket';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  collectionName = 'Tickets';

  constructor(private angularFirestore: AngularFirestore, private fireStorage: AngularFireStorage) { }

  create(ticket: Ticket) {
    //ticket.id = this.angularFirestore.createId();
    //return this.angularFirestore.collection<Ticket>(this.collectionName).doc(ticket.id).set(ticket);

    // Üres objektum létrehozása 
    return this.angularFirestore.collection(this.collectionName).add({}).then(docRef => {
      // Id kinyerése, és order dokumentum id beállítása
      ticket.id = docRef.id;
      // Frissítjük az order dokumentumot
      return docRef.update(ticket).then(_ => {
        // Order id visszaadása
        return ticket.id;
      });
    });
  }
  getByUserId(userId: string, mode: string) {
    const currentDate = new Date().getTime();
    if (mode === 'active') {
      return this.angularFirestore.collection<Ticket>(this.collectionName, ref => ref.where('userId', '==', userId).where('screening_time', '>', currentDate).orderBy('screening_time', 'asc').orderBy('film_title', 'asc').orderBy('chosen_seat', 'asc')).valueChanges();
    } else if (mode === 'expired') {
      return this.angularFirestore.collection<Ticket>(this.collectionName, ref => ref.where('userId', '==', userId).where('screening_time', '<=', currentDate).orderBy('screening_time', 'desc').orderBy('film_title', 'asc').orderBy('chosen_seat', 'asc')).valueChanges();
    } else {
      return this.angularFirestore.collection<Ticket>(this.collectionName, ref => ref.where('userId', '==', userId).orderBy('screening_time', 'desc').orderBy('film_title', 'asc').orderBy('chosen_seat', 'asc')).valueChanges();
    }
  }

  update(ticket: Ticket){
    return this.angularFirestore.collection<Ticket>(this.collectionName).doc(ticket.id).set(ticket);
  }

  delete(id: string) {
    return this.angularFirestore.collection<Ticket>(this.collectionName).doc(id).delete();
  }

  loadQRCode(imageUrl: string) {
    return this.fireStorage.ref(imageUrl).getDownloadURL();
  }
}
