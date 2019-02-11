import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
// import { QueryConfig } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { scan, tap, take} from 'rxjs/operators';
import { log } from 'util';

export interface QueryConfig {
path: string;
field: string;
limit: number;
reverse: boolean;
// prepend: boolean;
// direction: string;
}
@Injectable()
export class PaginationService {
// Source data
private _loading = new BehaviorSubject(false);
private _data = new BehaviorSubject([]);
private query: QueryConfig;
// Observable data
data: Observable<any>;
loading: Observable<boolean> = this._loading.asObservable();
constructor(private afs: AngularFirestore) { }
// Initial query sets options and defines the Observable
// passing opts will override the defaults
init(path: string, field: string, opts?: any) {
this.query = {
path,
field,
limit: 10,
reverse: false,
...opts
};
const first = this.afs.collection(this.query.path, ref => {
return ref
.orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
.limit(this.query.limit);
});
this.mapAndUpdate(first, 'forward');
// Create the observable array for consumption in components
this.data = this._data.asObservable();
}
// paginates through firstore data
paginate(direction: string) {
const cursor = this.getCursor(direction);
const more = this.afs.collection(this.query.path, ref => {

if ( direction === 'forward' ) {

return ref
.orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
.startAfter(cursor)
.limit(this.query.limit);

} else if (direction === 'backward') {

return ref
.orderBy(this.query.field, this.query.reverse ? 'asc' : 'desc')
.startAfter(cursor)
.limit(this.query.limit)
;
}
});
this.mapAndUpdate(more, direction);
}
// Determines the doc snapshot to paginate query
private getCursor(direction: string) {
const current = this._data.value;
if (current.length) {
return (direction === 'backward')
? current[0].doc
: current[current.length - 1].doc;
}
return null;
}
// Maps the snapshot to usable format the updates source
private mapAndUpdate(col: AngularFirestoreCollection<any>, direction: string) {
if (this._loading.value) { return; }
// loading
this._loading.next(true);
// Map snapshot with doc ref (needed for cursor)
return col.snapshotChanges().pipe(
tap(arr => {
let values = arr.map(snap => {
const data = snap.payload.doc.data();
const doc = snap.payload.doc;
return { ...data, doc };
});
// If prepending, reverse the batch order
values = direction === 'backward' ? values.reverse() : values;
// update source with new values, done loading
// no more values, mark done
if (!!values.length) {
this._data.next(values);
} else {
console.warn('Need some data to use to disable the buttons when end is hit');
}
this._loading.next(false);
}),
).subscribe();
}
}
