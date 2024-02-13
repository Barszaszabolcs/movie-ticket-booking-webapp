import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

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
  
  chosenFilm?: Film;
  coverUrl?: string;
  averageRating = 0;

  cinemas: Array<Cinema> = [];
  chosenCinema?: Cinema;
  auditoriums: Array<Auditorium> = [];

  screenings: Array<Screening> = [];
  
  selectedDay?: Date;
  week = new Array(7).fill(new Date());
  
  comments: Array<Comment> = [];
  
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
    private auditoriumService: AuditoriumService) {
  }

  ngOnInit(): void {
    this.cinemas = [];
    this.auditoriums = [];
    this.screenings = [];
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

          this.cinemaService.getAll().subscribe(data => {
            this.cinemas = data;
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
    
    this.getNextWeek();
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
    this.screenings = [];
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
    this.screenings = [];
    this.selectedDay = this.selectForm.get('day')?.value as Date;

    if (this.selectedDay) {
      if (this.auditoriums) {
        this.auditoriums.forEach(auditorium => {
          if (this.chosenFilm) {
            this.screeningService.getScreeningsByAuditoriumIdAndFilmIdAndDay(auditorium.id, this.chosenFilm.id, this.selectedDay?.getTime() as number).subscribe(data => {
              const screenings = data;

              screenings.forEach(screening => {
                this.screenings.push(screening);
              });

              // növekvő sorrendbe rendezzük a tömben szereplő vetítéseket a time adattag szerint
              this.screenings.sort((a, b) => a.time - b.time);
            });
          }
        });
      }
    }
  }

  getNextWeek(){
    var date = new Date();
    for(let i = 0; i < 7; i++){
      this.week[i] = new Date(date.getFullYear(),date.getMonth(),date.getDate()+(i+1));
    }
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
}
