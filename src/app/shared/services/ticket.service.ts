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

  getByOrderId(orderId: string) {
    return this.angularFirestore.collection<Ticket>(this.collectionName, ref => ref.where('orderId', '==', orderId)).valueChanges();
  }
}
