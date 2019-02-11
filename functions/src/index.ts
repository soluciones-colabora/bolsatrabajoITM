import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);

export const aggregateJoboffers = functions.firestore
  .document('joboffers/{jobofferId}')
  .onWrite(event => {

    // const commentId = event.params.commentId;
    // const jobofferId = event.before.id;

    // ref to the parent document
    const docRef = admin.firestore().collection('counts').doc('joboffers')

    // get all comments and aggregate
    return admin.firestore().collection('joboffers').orderBy('createdOn', 'desc')
        .get()
        .then(querySnapshot => {
          // get the total comment count
          const count = querySnapshot.size

          const recent = []

          // add data from the 5 most recent comments to the array
          querySnapshot.forEach(doc => {
              recent.push( doc.data() )
          });

          recent.splice(5)

          // record last comment timestamp
          const lastActivity = recent[0].createdOn;

          // data to update on the document
          const data = { count, recent, lastActivity }

          // run update
          return docRef.set(data)
        })
        .catch(err => console.log(err) )
});

export const aggregateEnterprises = functions.firestore
  .document('users/{userId}')
  .onWrite(event => {
    // Get an object with the current document value.
    // If the document does not exist, it has been deleted.
    const document = event.after.exists ? event.after.data() : null;

    // Get an object with the previous document value (for update or delete)
    // const oldDocument = event.before.data();
    if(document['role'] !== 'enterprise') { return null; }

    // ref to the parent document
    const docRef = admin.firestore().collection('counts').doc('enterprises')

    // get all comments and aggregate
    return admin.firestore().collection('users')
        .where('role', '==', 'enterprise')
        .orderBy('createdOn', 'desc')
        .get()
        .then(querySnapshot => {
          // get the total comment count
          const count = querySnapshot.size

          const recent = []

          // add data from the 5 most recent comments to the array
          querySnapshot.forEach(doc => {
              recent.push( doc.data() )
          });

          recent.splice(5)

          // record last comment timestamp
          const lastActivity = recent[0].createdOn;

          // data to update on the document
          const data = { count, recent, lastActivity }

          // run update
          return docRef.set(data)
        })
        .catch(err => console.log(err) )
});

export const aggregateStudents = functions.firestore
  .document('users/{userId}')
  .onWrite(event => {
    // Get an object with the current document value.
    // If the document does not exist, it has been deleted.
    const document = event.after.exists ? event.after.data() : null;

    // Get an object with the previous document value (for update or delete)
    // const oldDocument = event.before.data();

    if(document['role'] !== 'student') { return null; }

    // ref to the parent document
    const docRef = admin.firestore().collection('counts').doc('students')

    // get all comments and aggregate
    return admin.firestore().collection('users')
        .where('role', '==', 'student')
        .orderBy('createdOn', 'desc')
        .get()
        .then(querySnapshot => {
          // get the total comment count
          const count = querySnapshot.size

          const recent = []

          // add data from the 5 most recent comments to the array
          querySnapshot.forEach(doc => {
              recent.push( doc.data() )
          });

          recent.splice(5)

          // record last comment timestamp
          const lastActivity = recent[0].createdOn;

          // data to update on the document
          const data = { count, recent, lastActivity }

          // run update
          return docRef.set(data)
        })
        .catch(err => console.log(err) )
});

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
