import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Http, Headers } from '@angular/http';
import { Student } from '../interfaces/student.interface';

import { Observable, of } from 'rxjs';
import { map, switchMap, startWith, tap, filter } from 'rxjs/operators';
import { combineLatest } from 'rxjs/observable/combineLatest';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  fireURL = 'https://bolsatec-b5cc1.firebaseio.com/Students.json';
  studentURL = 'https://bolsatec-b5cc1.firebaseio.com/Students';

  studentsCollection: AngularFirestoreCollection<any>;
  studentDocument:   AngularFirestoreDocument<any>;

  constructor(private http: Http, private afs: AngularFirestore) {
    // Obten la colección con todos los estudiantes:
    // Hay que obtener esto a partir del rol.
    this.studentsCollection = this.afs.collection('users',
    (ref) => ref.where('role', '==', 'student').where('status', '==', 'active').orderBy('createdOn', 'desc'));
  }

  getData(): Observable<any[]> {
    // ['added', 'modified', 'removed']
    return this.studentsCollection.snapshotChanges().pipe(
      map((actions) => {
        return actions.map((a) => {
          // Data es la información de cada uno de los documentos
          const data = a.payload.doc.data();
          return { id: a.payload.doc.id, ...data };
        });
      })
    );
  }

  getActiveStudents(): Observable<any[]> {
    // ['added', 'modified', 'removed']
    return this.afs.collection('users',
    (ref) => ref.where('role', '==', 'student').where('status', '==', 'active').orderBy('createdOn', 'desc')).snapshotChanges().pipe(
      map((actions) => {
        return actions.map((a) => {
          // Data es la información de cada uno de los documentos
          const data = a.payload.doc.data();
          return { id: a.payload.doc.id, ...data };
        });
      })
    );
  }

  getInactiveStudents(): Observable<any[]> {
    // ['added', 'modified', 'removed']
    return this.afs.collection('users',
    (ref) => ref.where('role', '==', 'student').where('status', '==', 'pending').orderBy('createdOn', 'desc')).snapshotChanges().pipe(
      map((actions) => {
        return actions.map((a) => {
          // Data es la información de cada uno de los documentos
          const data = a.payload.doc.data();
          return { id: a.payload.doc.id, ...data };
        });
      })
    );
  }

  getSuspendedStudents(): Observable<any[]> {
    // ['added', 'modified', 'removed']
    return this.afs.collection('users',
    (ref) => ref.where('role', '==', 'student').where('status', '==', 'suspended').orderBy('createdOn', 'desc')).snapshotChanges().pipe(
      map((actions) => {
        return actions.map((a) => {
          // Data es la información de cada uno de los documentos
          const data = a.payload.doc.data();
          return { id: a.payload.doc.id, ...data };
        });
      })
    );
  }

  getStudent(id: string) {
    return this.afs.doc<Student>(`users/${id}`);
  }

  getStudentsInArray(studentIds: Array<string>) {
    if (studentIds.length === 0) { return of([]); }
    const studentsDocs = studentIds.map(id => this.afs.doc<Student>(`users/${id}`).valueChanges());
    return combineLatest<any[]>(studentsDocs);
    // Lo siguiente es cuando se require combinar colecciones:
    // .pipe(map(arr => arr.reduce((acc, cur) => acc.concat(cur) )));
  }

  createStudent(student: Student) {
    student.role = 'student';
    student.status = 'pending';
    student.createdOn = new Date();
    return this.studentsCollection.doc(student.uid).set(student);
  }

  updateStudent(id: string, data: any) {
    return this.getStudent(id).update(data);
  }

  setActiveStudents(students: Array<Student>): Promise<void> {
    const batch = this.afs.firestore.batch();
    students.forEach(student => {
      batch.update(this.afs.firestore.collection('users').doc(student.uid), {status : 'active'});
    });
    return batch.commit();
  }

  deleteStudents(students: Array<Student>): Promise<void> {
    const batch = this.afs.firestore.batch();
    students.forEach(student => {
      batch.update(this.afs.firestore.collection('users').doc(student.uid), {status : 'deleted'});
    });
    return batch.commit();
  }

  deleteStudent(id: string) {
    return this.getStudent(id).delete();
  }


  leerJSONStudents() {
    this.http.get('assets/estudiantes.json').subscribe(res => {
      const data = res.json();
      console.log(data);
    });
  }
}

  //#region Implementación FireBase
  /*
  createStudent( student: Student ) {
    const body = JSON.stringify( student );
    const headers = new Headers({
      'Content-Type': 'application/json'
    });
    return this.http.post(this.fireURL, body, {headers: headers}).map(res => {
              console.log(res.json());
              return res.json();
    });
  }

  getStudent( key$: string) {
    // const url = `${this.studentURL}/${ key$ }.json`;
    // return this.http.get(url).map(res => {
    //           // console.log(res.json());
    //           return res.json();
    // });
    console.log("entramos por acá");
    return this.http.get(this.fireURL).map(res => {
      // console.log(res.json());
      console.log('res :', res.json());
      let aux = res.json();
      for (const key in aux) {
        if (aux.hasOwnProperty(key)) {
          if (aux[key].id == key$) {
            console.log('aux[key] :', aux[key]);
            return aux[key];
          }
          //const element = object[key];
        }
      }
     // return res.json();
    });
  }

  getStudents( ) {
    return this.http.get(this.fireURL).map(res => {
      // console.log(res.json());
      return res.json();
    });
  }

  borrarStudent( key$: string) {
    const url = `${this.studentURL}/${ key$ }.json`;
    return this.http.delete(url).map(res => {
      // console.log(res.json());
      return res.json();
    });
  }

  updateStudent( student: Student, key$: string) {
    const body = JSON.stringify( student );
    const headers = new Headers({
      'Content-Type': 'application/json'
    });
    const url = `${this.studentURL}/${ key$ }.json`;
    return this.http.put(url, body, {headers: headers}).map(res => {
              // console.log(res.json());
              return res.json();
    });
  }
  */
  //#endregion
