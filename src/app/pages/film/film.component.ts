import { Component, OnInit } from '@angular/core';
import { Comment } from '../../shared/models/Comment';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Film } from '../../shared/models/Film';
import { FilmService } from '../../shared/services/film.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-film',
  templateUrl: './film.component.html',
  styleUrls: ['./film.component.scss']
})
export class FilmComponent {

  chosenFilm?: Film;
  coverUrl?: string;
  comments: Array<Comment> = [];

  commentsForm = this.createForm({
    username: '',
    comment: '',
    date: new Date()
  });

  constructor(private fb: FormBuilder, private actRoute: ActivatedRoute, private filmService: FilmService) {
  }

  ngOnInit(): void {
    this.actRoute.params.subscribe((param: any) => {
      this.filmService.loadFilmMetaById(param.chosenFilm).pipe(take(1)).subscribe(data => {
        this.chosenFilm = data[0];

        if (this.chosenFilm) {
          this.filmService.loadCoverImage(this.chosenFilm.cover_url).subscribe(data => {
            this.coverUrl = data;
          })
        }
      })
    })
  }

  createForm(model: Comment) {
    let formGroup = this.fb.group(model);
    formGroup.get('username')?.addValidators([Validators.required]);
    formGroup.get('comment')?.addValidators([Validators.required, Validators.minLength(10)]);
    return formGroup;
  }

  addComment() {
    if (this.commentsForm.valid) {
      if (this.commentsForm.get('username') && this.commentsForm.get('comment')) {
        this.commentsForm.get('date')?.setValue(new Date());
        this.comments.push({...this.commentsForm.value as Comment});
      }
    }
  }
}
