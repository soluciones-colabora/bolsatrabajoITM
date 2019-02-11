import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Http, Headers } from '@angular/http';
import { Enterprise } from '../interfaces/enterprise.interface';

import { Observable, of } from 'rxjs';
import { map, switchMap, startWith, tap, filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EnterpriseService {

  enterprisesCollection: AngularFirestoreCollection<any>;
  enterpriseDocument:   AngularFirestoreDocument<any>;

  constructor( private http: Http, private afs: AngularFirestore ) {
    // Obten la colección con todas las empresas:
    this.enterprisesCollection = this.afs.collection('users',
    (ref) => ref.where('role', '==', 'enterprise').where('status', '==', 'active').orderBy('createdOn', 'desc'));
  }

  getData(): Observable<any[]> {
    // ['added', 'modified', 'removed']
    return this.enterprisesCollection.snapshotChanges().pipe(
      map((actions) => {
        return actions.map((a) => {
          // Data es la información de cada uno de los documentos
          const data = a.payload.doc.data();
          return { id: a.payload.doc.id, ...data };
        });
      })
    );
  }

  getActiveEnterprises(): Observable<any[]> {
    // ['added', 'modified', 'removed']
    return this.afs.collection('users',
    (ref) => ref.where('role', '==', 'enterprise').where('status', '==', 'active').orderBy('createdOn', 'desc')).snapshotChanges().pipe(
      map((actions) => {
        return actions.map((a) => {
          // Data es la información de cada uno de los documentos
          const data = a.payload.doc.data();
          return { id: a.payload.doc.id, ...data };
        });
      })
    );
  }

  getInactiveEnterprises(): Observable<any[]> {
    // ['added', 'modified', 'removed']
    return this.afs.collection('users',
    (ref) => ref.where('role', '==', 'enterprise').where('status', '==', 'pending').orderBy('createdOn', 'desc')).snapshotChanges().pipe(
      map((actions) => {
        return actions.map((a) => {
          // Data es la información de cada uno de los documentos
          const data = a.payload.doc.data();
          return { id: a.payload.doc.id, ...data };
        });
      })
    );
  }

  getSuspendedEnterprises(): Observable<any[]> {
    // ['added', 'modified', 'removed']
    return this.afs.collection('users',
    (ref) => ref.where('role', '==', 'enterprise').where('status', '==', 'suspended').orderBy('createdOn', 'desc')).snapshotChanges().pipe(
      map((actions) => {
        return actions.map((a) => {
          // Data es la información de cada uno de los documentos
          const data = a.payload.doc.data();
          return { id: a.payload.doc.id, ...data };
        });
      })
    );
  }

  getEnterprise(id: string): AngularFirestoreDocument<Enterprise> {
    return this.afs.doc<Enterprise>(`users/${id}`);
  }

  createEnterprise(enterprise: Enterprise): Promise<void> {
    enterprise.role = 'enterprise';
    enterprise.status = 'pending';
    enterprise.createdOn = new Date();
    return this.enterprisesCollection.doc(enterprise.uid).set(enterprise);
  }

  updateEnterprise(id: string, data: any): Promise<void> {
    return this.getEnterprise(id).update(data);
  }

  updateEnterprises(enterprises: Array<Enterprise>): Promise<void> {
    const batch = this.afs.firestore.batch();
    enterprises.forEach(enterprise => {
      batch.update(this.afs.firestore.collection('users').doc(enterprise.uid), enterprise);
    });
    return batch.commit();
  }

  setActiveEnterprises(enterprises: Array<Enterprise>): Promise<void> {
    const batch = this.afs.firestore.batch();
    enterprises.forEach(enterprise => {
      batch.update(this.afs.firestore.collection('users').doc(enterprise.uid), {status : 'active'});
    });
    return batch.commit();
  }

  deleteEnterprises(enterprises: Array<Enterprise>): Promise<void> {
    const batch = this.afs.firestore.batch();
    enterprises.forEach(enterprise => {
      batch.update(this.afs.firestore.collection('users').doc(enterprise.uid), {status : 'deleted'});
    });
    return batch.commit();
  }

  deleteEnterprise(id: string): Promise<void> {
    return this.getEnterprise(id).delete();
  }
}


