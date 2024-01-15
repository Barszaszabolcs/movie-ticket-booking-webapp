import { Component, OnInit } from '@angular/core';
import { Comment } from '../../shared/models/Comment';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Film } from '../../shared/models/Film';
import { FilmService } from '../../shared/services/film.service';
import { take } from 'rxjs';
import { CommentService } from '../../shared/services/comment.service';
import { UserService } from '../../shared/services/user.service';
import { User } from '../../shared/models/User';

@Component({
  selector: 'app-film',
  templateUrl: './film.component.html',
  styleUrls: ['./film.component.scss']
})
export class FilmComponent implements OnInit{

  user?: User;

  chosenFilm?: Film;
  coverUrl?: string;
  comments: Array<Comment> = [];

  averageRating = 0;

  commentsForm = this.createForm({
    rating: 1,
    comment: '',
  });

  constructor(private fb: FormBuilder, private actRoute: ActivatedRoute, private filmService: FilmService, private commentService: CommentService, private userService: UserService) {
  }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') as string) as firebase.default.User;
    this.userService.getById(user.uid).pipe(take(1)).subscribe(data => {
      this.user = data[0];
    });

    this.actRoute.params.subscribe((param: any) => {
      this.filmService.loadFilmMetaById(param.chosenFilm).pipe(take(1)).subscribe(data => {
        this.chosenFilm = data[0];

        if (this.chosenFilm) {
          this.filmService.loadCoverImage(this.chosenFilm.cover_url).subscribe(data => {
            this.coverUrl = data;
          });

          this.commentService.getCommentsByFilmId(this.chosenFilm.id).subscribe(data => {
            this.comments = data;
          });

          let sum = 0;
          for (let index = 0; index < this.chosenFilm.ratings.length; index++) {
            sum += this.chosenFilm.ratings[index];
          }
          this.averageRating = sum / this.chosenFilm.ratings.length;
        }
      });
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

  addComment() {
    if (this.commentsForm.valid) {
      const comment: Comment = {
        id: '',
        username: this.user?.username as string,
        date: new Date().getTime(),
        rating: this.commentsForm.get('rating')?.value as number,
        comment: this.commentsForm.get('comment')?.value as string,
        filmId: this.chosenFilm?.id as string,
        userId: this.user?.id as string,
        moderatorId: ''
      }

      this.commentService.create(comment).then(_ => {
        console.log("SIKERES KOMMENTÁLÁS");
        
        this.chosenFilm?.ratings.push(comment.rating);
        this.filmService.update(this.chosenFilm as Film).then(_ => {
          console.log("SIKERES FILMÉRTÉKELÉS");
        }).catch(error => {
          console.error("SIKERTELEN FILMÉRTÉKELÉS: " + error);
        });
      }).catch(error => {
        console.error('SIKERTELEN KOMMENTÁLÁS: ' + error);
      });
    }
  }
}
