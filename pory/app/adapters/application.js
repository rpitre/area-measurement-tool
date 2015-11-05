import PouchDB from 'pouchdb';
import { Adapter } from 'ember-pouch';

var remote = new PouchDB('http://localhost:5984/area_measurement_tool');
var db = new PouchDB('area_measurement_tool');

db.sync(remote, {
   live: true,
   retry: true
});

export default Adapter.extend({
  db: db
});