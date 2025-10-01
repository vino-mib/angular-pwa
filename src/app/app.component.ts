import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CountriesService, Country } from './services/countries.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  searchTerm = '';
  isOnline = navigator.onLine;
  totalCountries = 0;

  // Observables
  countries$: Observable<Country[]>;
  filteredCountries$: Observable<Country[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor(
    private countriesService: CountriesService
  ) {
    // Initialize observables
    this.countries$ = this.countriesService.countries$;
    this.filteredCountries$ = this.countriesService.countries$;
    this.loading$ = this.countriesService.loading$;
    this.error$ = this.countriesService.error$;
  }

  ngOnInit() {
    console.log('Countries PWA App initialized');
    
    // Load countries on startup
    this.loadCountries();
    
    // Subscribe to countries count
    this.countries$.subscribe(countries => {
      this.totalCountries = countries.length;
    });
    
    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('App is now online');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('App is now offline');
    });
  }

  loadCountries() {
    this.countriesService.fetchCountries().subscribe({
      next: (countries) => {
        console.log('Countries loaded successfully:', countries.length);
      },
      error: (error) => {
        console.error('Failed to load countries:', error);
      }
    });
  }

  refreshCountries() {
    this.countriesService.refreshCountries().subscribe();
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      this.filteredCountries$ = this.countriesService.searchCountries(this.searchTerm);
    } else {
      this.filteredCountries$ = this.countries$;
    }
  }

  trackByCountry(index: number, country: Country): string {
    return country.name.common;
  }

  get isPwaMode(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }
}
