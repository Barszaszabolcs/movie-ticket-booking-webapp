import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Order } from '../models/Order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  collectionName = 'Orders';

  constructor(private angularFirestore: AngularFirestore) { }

  create(order: Order) {
    order.id = this.angularFirestore.createId();
    return this.angularFirestore.collection<Order>(this.collectionName).doc(order.id).set(order);
  }
}
