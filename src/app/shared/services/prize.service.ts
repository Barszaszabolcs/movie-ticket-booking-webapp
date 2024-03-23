import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';
import { Prize } from '../models/Prize';

@Injectable({
  providedIn: 'root'
})
export class PrizeService {

  collectionName = 'Prizes';

  constructor(private angularFirestore: AngularFirestore, private angularFireStorage: AngularFireStorage) { }

  loadPrizeMeta(): Observable<Array<Prize>> {
    return this.angularFirestore.collection<Prize>(this.collectionName, ref => ref.orderBy('name', 'asc')).valueChanges();
  }

  loadPrizeMetaById(id: string) {
    return this.angularFirestore.collection<Prize>(this.collectionName, ref => ref.where('id', '==', id)).valueChanges();
  }

  loadCoverImage(coverUrl: string) {
    return this.angularFireStorage.ref(coverUrl).getDownloadURL();
  }
}
