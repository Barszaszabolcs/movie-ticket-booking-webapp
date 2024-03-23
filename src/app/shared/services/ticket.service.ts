import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Ticket } from '../models/Ticket';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  collectionName = 'Tickets';

  constructor(private angularFirestore: AngularFirestore) { }

  create(ticket: Ticket) {
    ticket.id = this.angularFirestore.createId();
    return this.angularFirestore.collection<Ticket>(this.collectionName).doc(ticket.id).set(ticket);
  }

  getByUserId(userId: string, mode: string) {
    const currentDate = new Date().getTime();
    if (mode === 'active') {
      return this.angularFirestore.collection<Ticket>(this.collectionName, ref => ref.where('userId', '==', userId).where('screening_time', '>', currentDate).orderBy('screening_time', 'asc')).valueChanges();
    } else if (mode === 'expired') {
      return this.angularFirestore.collection<Ticket>(this.collectionName, ref => ref.where('userId', '==', userId).where('screening_time', '<=', currentDate).orderBy('screening_time', 'desc')).valueChanges();
    } else {
      return this.angularFirestore.collection<Ticket>(this.collectionName, ref => ref.where('userId', '==', userId).orderBy('screening_time', 'desc')).valueChanges();
    }
  }

  update(ticket: Ticket){
    return this.angularFirestore.collection<Ticket>(this.collectionName).doc(ticket.id).set(ticket);
  }

  delete(id: string) {
    return this.angularFirestore.collection<Ticket>(this.collectionName).doc(id).delete();
  }
}
