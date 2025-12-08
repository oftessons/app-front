import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  darkMode$ = this.darkModeSubject.asObservable();

  constructor() { 
    this.loadThemePreference();
  }

  toggleDarkMode(): void {
    const newValue = !this.darkModeSubject.value;
    this.darkModeSubject.next(newValue);
    localStorage.setItem('darkMode', JSON.stringify(newValue));
    this.applyTheme(newValue);
  }

  isDarkMode(): boolean {
    return this.darkModeSubject.value;
  }

  private loadThemePreference(): void {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      const isDarkMode = JSON.parse(savedTheme);
      this.darkModeSubject.next(isDarkMode);
      this.applyTheme(isDarkMode);
    } else {
      const defaultToDarkMode = true;
      this.darkModeSubject.next(defaultToDarkMode);
      this.applyTheme(defaultToDarkMode);
      localStorage.setItem('darkMode', JSON.stringify(defaultToDarkMode));
    }
  }

  private applyTheme(isDarkMode: boolean): void {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
}