import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  collectionName = 'Users';

  constructor(private angularFirestore: AngularFirestore) {}

  create(user: User) {
    return this.angularFirestore.collection<User>(this.collectionName).doc(user.id).set(user);
  }

  getById(id: string) {
    return this.angularFirestore.collection<User>(this.collectionName, ref => ref.where('id', '==', id)).valueChanges();
  }

  getAll(role: string) {    
      return this.angularFirestore.collection<User>(this.collectionName, ref => ref.where('role', '==', role).orderBy('email', 'asc')).valueChanges();
  }

  update(user: User) {
    return this.angularFirestore.collection<User>(this.collectionName).doc(user.id).set(user);
  }
}
