import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ArraysService {

  constructor() { }

  // * Metodo que separa un arreglo en un arreglo con n cantidad de subarreglos
  chunkArray(arr: any, size: number) {
    var results = [];
    
    while (arr.length) {
        results.push(arr.splice(0, size));
    }
    
    return results;
  }

  // * Metodo que busca coincidencias en un arreglo de objetos
  searchArrayObject(arr: any, value: string): any[] {
    var results: any[] = [];
    
    arr.forEach((element: string | any[]) => {
      for (let j = 0; j < element.length; j++) {
        if (element[j].includes(value)) {
          results.push(element);
          break;
        }
      }
    });
    
    return results;
  }

}
