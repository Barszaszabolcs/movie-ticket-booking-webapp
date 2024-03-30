import { Component, OnInit } from '@angular/core';
import { CommentEditPopupComponent } from './comment-edit-popup/comment-edit-popup.component';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';

import { User } from '../../shared/models/User';
import { Film } from '../../shared/models/Film';
import { Cinema } from '../../shared/models/Cinema';
import { Comment } from '../../shared/models/Comment';
import { Screening } from '../../shared/models/Screening';
import { Auditorium } from '../../shared/models/Auditorium';
import { UserService } from '../../shared/services/user.service';
import { FilmService } from '../../shared/services/film.service';
import { CinemaService } from '../../shared/services/cinema.service';
import { CommentService } from '../../shared/services/comment.service';
import { ScreeningService } from '../../shared/services/screening.service';
import { AuditoriumService } from '../../shared/services/auditorium.service';

@Component({
  selector: 'app-film',
  templateUrl: './film.component.html',
  styleUrls: ['./film.component.scss']
})
export class FilmComponent implements OnInit{
  
  user?: User;
  isModerator = false;
  
  chosenFilm?: Film;
  coverUrl?: string;
  averageRating = 0;

  cinemas: Array<Cinema> = [];
  chosenCinema?: Cinema;
  auditoriums: Array<Auditorium> = [];

  screenings2d: Array<Screening> = [];
  screenings3d: Array<Screening> = [];
  
  selectedDay?: Date;
  week = new Array(7).fill(new Date());
  
  comments: Array<Comment> = [];

  ownComment?: Comment;

  loaded = false;
  
  selectForm = this.createSelectForm({
    cinemaId: '',
    day: null
  });
  
  commentsForm = this.createForm({
    rating: 1,
    comment: '',
  });

  constructor(
    private fb: FormBuilder, private actRoute: ActivatedRoute,
    private toastr: ToastrService, private filmService: FilmService, 
    private commentService: CommentService, private userService: UserService,
    private screeningService: ScreeningService, private cinemaService: CinemaService,
    private auditoriumService: AuditoriumService, private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.cinemas = [];
    this.auditoriums = [];
    this.screenings2d = [];
    this.screenings3d = [];
    this.loaded = false;
    const user = JSON.parse(localStorage.getItem('user') as string) as firebase.default.User;
    if (user) {
      this.userService.getById(user.uid).pipe(take(1)).subscribe(data => {
        this.user = data[0];
      });
    }

    this.actRoute.params.subscribe((param: any) => {
      this.filmService.loadFilmMetaById(param.chosenFilm).pipe(take(1)).subscribe(data => {
        this.chosenFilm = data[0];

        if (this.chosenFilm) {
          this.filmService.loadCoverImage(this.chosenFilm.cover_url).subscribe(data => {
            this.coverUrl = data;
          });

          this.cinemaService.getAll().subscribe(data => {
            this.cinemas = data;
          });
          this.getAverageRating(this.chosenFilm);
        }
      });
    });
    
    this.getNextWeek();
  }

  getAverageRating(chosenFilm: Film) {
    let sum = 0;
    for (let index = 0; index < chosenFilm.ratings.length; index++) {
      sum += chosenFilm.ratings[index];
    }
    this.averageRating = sum / chosenFilm.ratings.length;
  }

  createSelectForm(model: any) {
    let selectGroup = this.fb.group(model);
    selectGroup.get('cinemaId')?.addValidators([Validators.required]);
    selectGroup.get('day')?.addValidators([Validators.required]);
    return selectGroup;
  }

  createForm(model: any) {
    let formGroup = this.fb.group(model);
    formGroup.get('comment')?.addValidators([Validators.required, Validators.minLength(10)]);
    return formGroup;
  }

  cinemaSelected() {
    this.auditoriums = [];
    this.screenings2d = [];
    this.screenings3d = [];
    this.selectForm.get('day')?.reset();
    this.selectedDay = undefined;
    const cinema = this.selectForm.get('cinemaId')?.value as string;

    this.cinemaService.getById(cinema).pipe(take(1)).subscribe(data => {
      this.chosenCinema = data[0];

      if (this.chosenCinema) {
        this.auditoriumService.getAuditoriumsByCinemaId(this.chosenCinema.id).subscribe(data => {
          this.auditoriums = data;
        });
      }
    });
  }

  daySelected() {
    this.screenings2d = [];
    this.screenings3d = [];
    this.selectedDay = this.selectForm.get('day')?.value as Date;

    if (this.selectedDay) {
      if (this.auditoriums) {
        this.auditoriums.forEach(auditorium => {
          if (this.chosenFilm) {
            this.screeningService.getScreeningsByAuditoriumIdAndFilmIdAndDayAndType(auditorium.id, this.chosenFilm.id, this.selectedDay?.getTime() as number, '2D').subscribe(data => {
              const screenings2d = data;

              screenings2d.forEach(screening => {
                this.screenings2d.push(screening);
              });

              // növekvő sorrendbe rendezzük a tömben szereplő vetítéseket a time adattag szerint
              this.screenings2d.sort((a, b) => a.time - b.time);
              const currentTime = new Date().getTime();
              // csak azokat a vetítéseket tartjuk meg, amelyek vetítési ideje - 30 perc a jelenlegi időhöz képest a jövőben lesz
              this.screenings2d = this.screenings2d.filter(screening => (screening.time - (30 * 60 * 1000)) > currentTime);
            });

            this.screeningService.getScreeningsByAuditoriumIdAndFilmIdAndDayAndType(auditorium.id, this.chosenFilm.id, this.selectedDay?.getTime() as number, '3D').subscribe(data => {
              const screenings3d = data;

              screenings3d.forEach(screening => {
                this.screenings3d.push(screening);
              });

              // növekvő sorrendbe rendezzük a tömben szereplő vetítéseket a time adattag szerint
              this.screenings3d.sort((a, b) => a.time - b.time);
              const currentTime = new Date().getTime();
              // csak azokat a vetítéseket tartjuk meg, amelyek vetítési ideje - 30 perc a jelenlegi időhöz képest a jövőben lesz
              this.screenings3d = this.screenings3d.filter(screening => (screening.time - (30 * 60 * 1000)) > currentTime);
            });
          }
        });
      }
    }
  }

  getNextWeek(){
    var date = new Date();
    for(let i = 0; i <= 7; i++){
      this.week[i] = new Date(date.getFullYear(),date.getMonth(),date.getDate()+(i));
    }
  }

  getComments() {
    this.isModerator = false;
    if (!this.loaded) {
      if (this.user) {
        if (this.user.role === 'moderator') {
          this.isModerator = true;
        } else {
          this.isModerator = false;
        }
      }
      this.commentService.getCommentsByFilmId(this.chosenFilm?.id as string).subscribe(data => {
        this.comments = data;

        if (this.user) {
          this.comments = this.comments.filter(comment => comment.userId !== this.user?.id);
    
          this.commentService.getCommentByFilmIdAndUserId(this.chosenFilm?.id as string, this.user?.id as string).pipe(take(1)).subscribe(data => {
            this.ownComment = data[0];
          });
        }
      });
      this.loaded = !this.loaded;
    }
  }

  hideComments() {
    this.loaded = !this.loaded;
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
        this.chosenFilm?.ratings.push(comment.rating);
        this.filmService.update(this.chosenFilm as Film).then(_ => {
          this.toastr.success('Sikeres filmértékelés!', 'Kommentálás');
        }).catch(error => {
          console.error("SIKERTELEN FILMÉRTÉKELÉS: " + error);
          this.toastr.error('Sikertelen filmértékelés!', 'Kommentálás');
        });
      }).catch(error => {
        console.error('SIKERTELEN KOMMENTÁLÁS: ' + error);
        this.toastr.error('Sikertelen filmértékelés!', 'Kommentálás');
      });
    } else {
      this.toastr.error('Sikertelen filmértékelés!', 'Kommentálás');
    }
  }

  deleteComment(comment: Comment) {
    this.commentService.delete(comment.id).then(_ => {
      if (this.chosenFilm) {
        this.chosenFilm.ratings = this.removeNumberFromArray(this.chosenFilm.ratings, comment.rating);

        this.filmService.update(this.chosenFilm).then(_ => {
          this.toastr.success('Sikeres komment törlés!', 'Kommentálás');    
        }).catch(error => {
          this.toastr.error('Sikertelen komment törlés!', 'Kommentálás');
        });
      }
    }).catch(error => {
      this.toastr.error('Sikertelen komment törlés!', 'Kommentálás');
    });
  }

  removeNumberFromArray(arr: number[], num: number): number[] {
    // megtalálja az első előfordulás indexét
    const index = arr.indexOf(num);
    if (index !== -1) {
        // a megtalált indextől számítva töröl egy elemet
        arr.splice(index, 1);
    }
    return arr;
  }

  edit(comment: Comment) {
    var popup = this.dialog.open(CommentEditPopupComponent, {
      width: '60%',
      height: '50%',
      autoFocus: false,
      data: {
        commentId: comment.id
      }
    });

    popup.afterClosed().subscribe(_ => {
      this.loaded = false;
    });
  }
}
