import { Component, OnInit } from '@angular/core';
import { ImageSliderService } from '../../shared/services/image-slider.service';
import { SliderImage } from '../../shared/models/Slider-image';
import { take } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit{

  images?: Array<SliderImage>;
  loadedSliderImages: Array<string> = [];

  imageObject: Array<object> = [];

  constructor(private imageSliderService: ImageSliderService) {}

  ngOnInit(): void {
    this.images = [];
    this.loadedSliderImages = [];
    this.imageObject = [];
    this.imageSliderService.loadImageMeta().subscribe((data: Array<SliderImage>) => {
      this.images = data;

      if (this.images) {
        for (let index = 0; index < this.images.length; index++) {
          this.imageSliderService.loadSliderImage(this.images[index].image_url).pipe(take(1)).subscribe(data => {
            if (!(this.loadedSliderImages.includes(data))) {
              this.loadedSliderImages.push(data);
              this.imageObject.push({thumbImage: data})
            }
          });
        }
      }
    });
  }
}
