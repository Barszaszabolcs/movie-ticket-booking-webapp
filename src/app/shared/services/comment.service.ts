import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Comment } from '../models/Comment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  collectionName = 'Comments';

  constructor(private angularFirestore: AngularFirestore) { }

  create(comment: Comment) {
    comment.id = this.angularFirestore.createId();
    return this.angularFirestore.collection<Comment>(this.collectionName).doc(comment.id).set(comment);
  }

  getCommentsByFilmId(filmId: string){
    return this.angularFirestore.collection<Comment>(this.collectionName, ref => ref.where('filmId', '==', filmId).orderBy('date', 'desc')).valueChanges();
  }
}
