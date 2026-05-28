// home.ts — Public gallery page
import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { GalleryComponent } from '../../components/gallery/gallery.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.css',
  imports: [NavbarComponent, HeroComponent, GalleryComponent, FooterComponent],
})
export class HomeComponent {}
