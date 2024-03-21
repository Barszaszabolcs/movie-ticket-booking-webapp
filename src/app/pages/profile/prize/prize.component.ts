import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Ticket } from '../../../shared/models/Ticket';
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

  constructor(
    private ticketService: TicketService, private ref: MatDialogRef<PrizeComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any) {}

  ngOnInit(): void {
    this.ticket = this.data.ticket;

    context = this.canvas.nativeElement.getContext('2d');
    this.init();
  }

  init() {
    context.fillStyle = "red";
    context.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
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
          console.log('A háttérszín 80%-a már eltűnt!');
          //ha már "lekapartuk a 80%-ot, akkor felfedünk mindent"
          context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
          this.hideButton = false;
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
    context.arc(x, y, 36, 0, 4 * Math.PI);
    context.fill();
  }

  done() {
    this.ref.close()
  }
}
