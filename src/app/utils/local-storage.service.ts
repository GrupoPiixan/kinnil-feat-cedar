import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  public keyLocalStorageUser: string = 'Usuario';

  constructor() { }

  // * Guardamos los datos en el localStorage
  saveLocalStorage(key: string, jsonData: any): void {
    localStorage.setItem(key, JSON.stringify(jsonData));
  }

  // * Obtenemos los datos del localStorage
  getLocalStorage(key: string): any | null {
    // * Retornamos el valor del localStorage en formato JSON
    return JSON.parse(localStorage.getItem(key) || '{}');
  }

  // * Eliminamos los datos del localStorage
  deleteLocalStorage(key: string): void {
    localStorage.removeItem(key);
    this.clearLocalStorage();
  }

  // * Limpiamos el localStorage
  clearLocalStorage(): void {
    localStorage.clear();
  }

}
