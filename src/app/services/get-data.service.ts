import { Injectable } from '@angular/core';

// * Firebase
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class GetDataService {

  constructor(private afs: AngularFirestore) { }

  getData(collection: string, id: string) {
    return this.afs.collection(collection, ref => ref.where('idBoard', '==', id).orderBy('creacionRegistro', 'desc').limit(1)).snapshotChanges();
  }

  getDataChart(collection: string, id: string) {
    return this.afs.collection(collection, ref => ref.where('idBoard', '==', id).orderBy('creacionRegistro', 'desc').limit(50)).get();
  }

  async getDataList(collection: string) {
    return await this.afs.collection(collection).ref.get();
  }

  getTruckData(id: string) {
    //return this.afs.collection('camiones', ref => ref.where('IDSensor', '==', id)).snapshotChanges();
    //return this.afs.collection('camiones').doc(id).snapshotChanges();
    return this.afs.collection('camiones', ref => ref.where('idBoards', 'array-contains', id)).snapshotChanges();
  }

  getTrucksData() {
    return this.afs.collection('camiones')
  }

  getAllTrucksData() {
    return this.afs.collection('camiones').snapshotChanges();
  }

  async setTruckData(truck: any) {
    return this.afs.collection('camiones').add(truck)
  }

  async updateTruckData(doc: any, data: any) {
    return this.afs.collection('camiones').doc(doc).set(data);
  }
  
  async deleteTruckData(doc: any) {
    return this.afs.collection('camiones').doc(doc).delete()
  }

  async generateReport(initDate: string, finishDate: string) {
    return this.afs.collection('quectel', ref => ref.where("creacionRegistro", ">=", new Date(`${initDate} 00:00:00`)).where("creacionRegistro", "<=", new Date(`${finishDate} 23:59:59`))).get();
  }

}
