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
    // Üres objektum létrehozása 
    return this.angularFirestore.collection(this.collectionName).add({}).then(docRef => {
      // Id kinyerése, és order dokumentum id beállítása
      order.id = docRef.id;
      // Frissítjük az order dokumentumot
      return docRef.update(order).then(_ => {
        // Order id visszaadása
        return order.id;
      });
    });
  }
}
