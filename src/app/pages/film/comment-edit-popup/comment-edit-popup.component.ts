import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { User } from '../../../shared/models/User';
import { Film } from '../../../shared/models/Film';
import { Comment } from '../../../shared/models/Comment';
import { UserService } from '../../../shared/services/user.service';
import { FilmService } from '../../../shared/services/film.service';
import { CommentService } from '../../../shared/services/comment.service';

@Component({
  selector: 'app-comment-edit-popup',
  templateUrl: './comment-edit-popup.component.html',
  styleUrls: ['./comment-edit-popup.component.scss']
})
export class CommentEditPopupComponent implements OnInit {

  user?: User;
  isModerator = false;

  commentId = '';
  comment?: Comment;

  film?: Film;

  commentsForm = this.createForm({
    rating: 1,
    comment: '',
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any, private ref: MatDialogRef<CommentEditPopupComponent>,
    private userService: UserService, private commentService: CommentService,
    private filmService: FilmService, private fb: FormBuilder,
    private toastr: ToastrService,) {}
    
  ngOnInit(): void {
    this.commentId = this.data.commentId;

    const user = JSON.parse(localStorage.getItem('user') as string) as firebase.default.User;
    this.userService.getById(user.uid).pipe(take(1)).subscribe(data => {
      this.user = data[0];

      if (this.user) {
        if (this.user.role === 'moderator') {
          this.isModerator = true;
        } else {
          this.isModerator = false;
        }
      }
    });

    this.commentService.getById(this.commentId).pipe(take(1)).subscribe(data => {
      this.comment = data[0];

      if (this.comment) {
        this.commentsForm.controls['comment'].setValue(this.comment.comment);

        this.filmService.loadFilmMetaById(this.comment.filmId).pipe(take(1)).subscribe(data => {
          this.film = data[0];
        });
      }
    });
  }

  createForm(model: any) {
    let formGroup = this.fb.group(model);
    formGroup.get('comment')?.addValidators([Validators.required, Validators.minLength(10)]);
    return formGroup;
  }

  onRate(event: any): void {
    this.commentsForm.get('rating')?.setValue(event.newValue);
  }

  editComment() {
    if (this.comment) {
      if (this.isModerator) {
        this.comment.comment = this.commentsForm.get('comment')?.value as string;
        this.comment.date = new Date().getTime();
        this.comment.moderatorId = this.user?.id;

        this.commentService.update(this.comment).then(_ => {
          this.toastr.success('Sikeres komment módosítás!', 'Módosítás');
          this.ref.close();
        }).catch(error => {
          this.toastr.error('Sikertelen komment módosítás!', 'Módosítás');
        });
      } else {
        const oldRating = this.comment.rating;
        this.comment.comment = this.commentsForm.get('comment')?.value as string;
        this.comment.rating = this.commentsForm.get('rating')?.value as number;
        this.comment.date = new Date().getTime();

        this.commentService.update(this.comment).then(_ => {
          if (this.film) {
            for (let i = 0; i < this.film.ratings.length; i++) {
              if (this.film.ratings[i] === oldRating) {
                this.film.ratings[i] = this.comment?.rating as number;
                break;
              }
            }
            this.filmService.update(this.film).then(_ => {
              this.toastr.success('Sikeres komment módosítás!', 'Módosítás');
              this.ref.close();
            }).catch(error => {
              this.toastr.error('Sikertelen komment módosítás!', 'Módosítás');
            });
          }
        }).catch(error => {
          this.toastr.error('Sikertelen komment módosítás!', 'Módosítás');
        });
      }
    }
  }
}
