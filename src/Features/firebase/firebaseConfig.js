import {initializeApp} from "firebase/app";
import {getDatabase, ref, set, onValue, push} from "firebase/database";

import servicesConfig from "Features/settings/servicesConfig";

const firebaseConfig = servicesConfig.firebaseConfig;

let app;
let db;

if (firebaseConfig) {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
}

export {db, ref, set, onValue, push};
