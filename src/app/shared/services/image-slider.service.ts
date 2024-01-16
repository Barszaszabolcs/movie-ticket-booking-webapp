import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { SliderImage } from '../models/Slider-image';

@Injectable({
  providedIn: 'root'
})
export class ImageSliderService {
  
  collectionName = 'Slider-images';

  constructor(private angularFirestore: AngularFirestore, private fireStorage: AngularFireStorage) { }

  loadImageMeta(): Observable<Array<SliderImage>> {
    return this.angularFirestore.collection<SliderImage>(this.collectionName).valueChanges();
  }

  loadSliderImage(coverUrl: string) {
    return this.fireStorage.ref(coverUrl).getDownloadURL();
  }
}
