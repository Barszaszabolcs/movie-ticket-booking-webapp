import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs';

import { ToastrService } from 'ngx-toastr';

import { Prize } from '../../../shared/models/Prize';
import { Ticket } from '../../../shared/models/Ticket';
import { PrizeService } from '../../../shared/services/prize.service';
import { TicketService } from '../../../shared/services/ticket.service';

import confetti from 'canvas-confetti';

export var context: any;

@Component({
  selector: 'app-prize',
  templateUrl: './prize.component.html',
  styleUrls: ['./prize.component.scss']
})
export class PrizeComponent implements OnInit{
  @ViewChild('prizeCanvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  ticket?: Ticket;

  isDragging = false;

  hideButton = true;

  private backgroundColorChecked = false;

  prizes: Array<Prize> = [];

  loadedImages: Array<string> = [];

  randomPrize?: Prize;

  constructor(
    private ticketService: TicketService, private prizeService: PrizeService,
    private ref: MatDialogRef<PrizeComponent>, @Inject(MAT_DIALOG_DATA) private data: any,
    private toastr: ToastrService) {}

  ngOnInit(): void {
    this.prizes = [];
    this.loadedImages = [];
    this.ticket = this.data.ticket;

    context = this.canvas.nativeElement.getContext('2d');
    this.init();

    if (this.ticket) {   
  
      this.prizeService.loadPrizeMeta().subscribe(data => {
        this.prizes = data;
  
        if (this.prizes) {
          const randomNumber: number = Math.floor(Math.random() * 16);
          this.randomPrize = this.prizes[randomNumber];
  
          if (this.randomPrize) {
            if (this.ticket) {
              this.ticket.prizeId = this.randomPrize.id;
              this.ticketService.update(this.ticket).catch(error => {
                this.toastr.error('Hiba történt a nyeremény beváltása közben!', 'Nyeremény beváltás');
              });
            }
          }
  
          for (let i = 0; i < this.prizes.length; i++) {
            this.prizeService.loadCoverImage(this.prizes[i].image_url).pipe(take(1)).subscribe(data => {
              if (!(this.loadedImages.includes(data))) {
                this.loadedImages.push(data);
              }
            });
          }
        }
      });
    }

  }

  getImageUrl(prize: Prize): string | undefined {
    return this.loadedImages.find(image_url => image_url.includes(prize.image_url.split(".")[0].split("/")[1]));
  }

  init() {
    var img = new Image();
    img.onload = () => {
        // Rajzolás a canvas-ra, amikor a kép betöltődött
        context.drawImage(img, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    };
    img.src = '../assets/img/scratch.jpg';
  }

  mousedownFunction(event: any) {
    this.isDragging = true;
    this.scratch(event.offsetX, event.offsetY);
  }

  mousemoveFunction(event: any) {
    if (this.isDragging) {
      this.scratch(event.offsetX, event.offsetY);
      if (event.buttons === 1) { // csak akkor, ha az egérgomb le van nyomva
        this.checkBackgroundColor();
      }
    }

  }

  checkBackgroundColor() {
    if (!this.backgroundColorChecked) {
      
      const imageData = context.getImageData(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      const data = imageData.data;
      let transparentPixelCount = 0;
  
      for (let i = 0; i < data.length; i += 4) {
          // Az alfa érték 0, ha az adott pixel átlátszó
          if (data[i + 3] === 0) {
              transparentPixelCount++;
          }
      }
  
      // Ellenőrizzük, hogy a háttérszín 80% eltünt-e már
      if (transparentPixelCount / (this.canvas.nativeElement.width * this.canvas.nativeElement.height) >= 0.8) {
          
          //ha már "lekapartuk a 80%-ot, akkor felfedünk mindent"
          this.hideButton = false;
          context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
          this.celebrate();
          this.celebrate();
          this.celebrate();
          this.backgroundColorChecked = true;
      }
    }
  }

  celebrate() {
    confetti({
      particleCount: 150,
      angle: 0,
      spread: 90,
      origin: { x: 0, y: 0.3 },
      shapes: ['star'],
      zIndex: 1000,
      colors: ['#fae700', '#ffd900', '#ffc000', '#ffa700', '#fe7a00'],
      drift: 1,
      ticks: 150
    });

    confetti({
      particleCount: 150,
      angle: 180,
      spread: 90,
      origin: { x: 1, y: 0.3 },
      shapes: ['star'],
      zIndex: 1000,
      colors: ['#fae700', '#ffd900', '#ffc000', '#ffa700', '#fe7a00'],
      drift: -1,
      ticks: 150
    });
  }

  mouseupFunction(event: any) {
    this.isDragging = false;
  }

  mouseleaveFunction(event: any) {
    this.isDragging = false;
  }

  scratch(x: any, y: any) {
    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    context.arc(x, y, 42, 0, 4 * Math.PI);
    context.fill();
  }

  done() {
    this.ref.close()
  }
}
