// animation.service.ts - Handles scroll reveal animations using IntersectionObserver
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AnimationService {
  // Observes elements and adds 'visible' class when they enter the viewport
  observeElements(selector: string): void {
    const elements = document.querySelectorAll(selector);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Stop observing once the animation has played
            observer.unobserve(entry.target);
          }
        });
      },
      {
        // Trigger when 10% of the element is visible
        threshold: 0.1,
      },
    );
    elements.forEach((el) => observer.observe(el));
  }
}
