import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly STORAGE_KEY = 'utillar_favorites';
  private readonly favoritesSubject: BehaviorSubject<number[]>;

  public favorites$: Observable<number[]>;
  public count$: Observable<number>;

  constructor() {
    const stored = this.loadFromStorage();
    this.favoritesSubject = new BehaviorSubject<number[]>(stored);
    this.favorites$ = this.favoritesSubject.asObservable();
    this.count$ = this.favorites$.pipe(map(ids => ids.length));
  }

  toggle(productId: number): void {
    const current = this.favoritesSubject.value;
    const index = current.indexOf(productId);
    if (index === -1) {
      this.favoritesSubject.next([...current, productId]);
    } else {
      this.favoritesSubject.next(current.filter(id => id !== productId));
    }
    this.saveToStorage();
  }

  isFavorite(productId: number): boolean {
    return this.favoritesSubject.value.includes(productId);
  }

  getFavoriteIds(): number[] {
    return this.favoritesSubject.value;
  }

  getCount(): number {
    return this.favoritesSubject.value.length;
  }

  private loadFromStorage(): number[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.favoritesSubject.value));
  }
}
