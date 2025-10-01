import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

export interface Country {
  name: {
    common: string;
    official: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CountriesService {
  private readonly API_URL = 'https://restcountries.com/v3.1/all?fields=name';
  private countriesSubject = new BehaviorSubject<Country[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Public observables
  public countries$ = this.countriesSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('CountriesService initialized');
  }

  /**
   * Fetch countries from the REST API
   * This will be cached by the PWA service worker automatically
   */
  fetchCountries(): Observable<Country[]> {
    console.log('Fetching countries from API...');
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<Country[]>(this.API_URL).pipe(
      tap(countries => {
        console.log(`Successfully fetched ${countries.length} countries`);
        this.countriesSubject.next(countries);
        this.loadingSubject.next(false);
      }),
      map(countries => countries.sort((a, b) => 
        a.name.common.localeCompare(b.name.common)
      )),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Get countries (triggers fetch if not already loaded)
   */
  getCountries(): Observable<Country[]> {
    if (this.countriesSubject.value.length === 0) {
      this.fetchCountries().subscribe();
    }
    return this.countries$;
  }

  /**
   * Search countries by name
   */
  searchCountries(searchTerm: string): Observable<Country[]> {
    return this.countries$.pipe(
      map(countries => 
        countries.filter(country =>
          country.name.common.toLowerCase().includes(searchTerm.toLowerCase()) ||
          country.name.official.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }

  /**
   * Clear cached countries and refresh
   */
  refreshCountries(): Observable<Country[]> {
    console.log('Refreshing countries data...');
    this.countriesSubject.next([]);
    return this.fetchCountries();
  }

  /**
   * Get current countries count
   */
  getCountriesCount(): number {
    return this.countriesSubject.value.length;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Countries API Error:', error);
    
    let errorMessage = 'An error occurred while fetching countries';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
    }

    this.errorSubject.next(errorMessage);
    this.loadingSubject.next(false);
    
    return throwError(() => new Error(errorMessage));
  }
}
