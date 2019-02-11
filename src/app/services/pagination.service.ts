import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Query } from 'angularfire2/firestore/interfaces';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/take';

interface QueryConfig {
  path: string; //  path to collection
  field: string; // field to orderBy
  equalTo: {field: string, value, string}; // field to where
  status: string; // status searched
  limit: number; // limit per query
  reverse: boolean; // reverse order?
  prepend: boolean; // prepend to source?
}


@Injectable({
  providedIn: 'root'
})
export class PaginationService {

  // Source data
  private _done = new BehaviorSubject(false);
  private _loading = new BehaviorSubject(false);
  private _data = new BehaviorSubject([]);

  private query: QueryConfig;

  // Observable data
  data: Observable<any>;
  done: Observable<boolean> = this._done.asObservable();
  loading: Observable<boolean> = this._loading.asObservable();


  constructor(private afs: AngularFirestore) { }

  // Initial query sets options and defines the Observable
  // passing opts will override the defaults
  init(path: string, field: string, opts?: any) {
    this.query = {
      path,
      field,
      status: 'active',
      equalTo: null,
      limit: 25,
      reverse: false,
      prepend: false,
      ...opts
    };

    // Código para utilizar llamada a firestore directo sin pasar por angularfire.
    // const first = this.afs.firestore.collection(this.query.path)
    //     .orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
    //     .limit(this.query.limit);
    // this.mapAndUpdate(first);

    const first = this.afs.collection(this.query.path, ref => {
      if (this.query.equalTo) {
        return ref
              .where(this.query.equalTo.field, '==', this.query.equalTo.value)
              .where('status', '==', this.query.status)
              .orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
              .limit(this.query.limit);
      }
      return ref
              .where('status', '==', this.query.status)
              .orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
              .limit(this.query.limit);
    });

    this.mapAndUpdate(first);

    // Create the observable array for consumption in components
    this.data = this._data.asObservable()
        .scan( (acc, val) => {
          console.log('acc :', acc.concat(val));
          return this.query.prepend ? val.concat(acc) : acc.concat(val);
        });
  }


  // Retrieves additional data from firestore
  more() {
    const cursor = this.getCursor();

    // Código para utilizar llamada a firestore directo sin pasar por angularfire.
    // const more = this.afs.firestore.collection(this.query.path)
    //           .orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
    //           .limit(this.query.limit)
    //           .startAfter(cursor);
    // this.mapAndUpdateQuery(more);

    const more = this.afs.collection(this.query.path, ref => {
      if (this.query.equalTo) {
        return ref
              .where(this.query.equalTo.field, '==', this.query.equalTo.value)
              .where('status', '==', this.query.status)
              .orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
              .limit(this.query.limit)
              .startAfter(cursor);
      }
      return ref
              .where('status', '==', this.query.status)
              .orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
              .limit(this.query.limit)
              .startAfter(cursor);
    });
    this.mapAndUpdate(more);
  }


  // Determines the doc snapshot to paginate query
  private getCursor() {
    const current = this._data.value;
    // console.log('current :', current);
    if (current.length) {
      return this.query.prepend ? current[0].doc : current[current.length - 1].doc;
    }
    return null;
  }

  // Maps the snapshot to usable format the updates source
  private mapAndUpdateQuery(col: Query) {

    if (this._done.value || this._loading.value) { return; }

    // loading
    this._loading.next(true);

    // Map snapshot with doc ref (needed for cursor)
    return col.get()
    .then((result) => {
      let values = [];
      result.forEach(snapDoc => {
        const data = snapDoc.data();
        const doc = snapDoc;
        values.push({ ...data, doc });
      });

      console.log('values :', values);

      // If prepending, reverse the batch order
      values = this.query.prepend ? values.reverse() : values;

      // update source with new values, done loading
      this._data.next(values);
      this._loading.next(false);

      // no more values, mark done
      if (!values.length) {
        this._done.next(true);
      }
    }).catch((err) => {

    });

  }

  // // Maps the snapshot to usable format the updates source
  private mapAndUpdate(col: AngularFirestoreCollection<any>) {

    if (this._done.value || this._loading.value) { return; }

    // loading
    this._loading.next(true);

    // Map snapshot with doc ref (needed for cursor)

    return col.snapshotChanges()
      .do(arr => {
        let values = arr.map(snap => {
          const data = snap.payload.doc.data();
          const doc = snap.payload.doc;
          return { ...data, doc };
        });

        // If prepending, reverse the batch order
        values = this.query.prepend ? values.reverse() : values;

        // update source with new values, done loading
        this._data.next(values);
        this._loading.next(false);

        // no more values, mark done
        if (!values.length) {
          this._done.next(true);
        }
    })
    .take(1)
    .subscribe();

  }

  // Reset the page
  reset() {
    this._data.next([]);
    this._done.next(false);
  }

}
