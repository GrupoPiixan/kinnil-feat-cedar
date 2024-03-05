// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyDBphRG3xCoFlGqn2Xnku5p9_O0hrbNfgE",
    authDomain: "kinnil-feat-cedar-pid.firebaseapp.com",
    projectId: "kinnil-feat-cedar-pid",
    storageBucket: "kinnil-feat-cedar-pid.appspot.com",
    messagingSenderId: "808749870365",
    appId: "1:808749870365:web:86cbc1597d3aa88db485f4",
    measurementId: "G-3D3J0D4M0J"
  },
  urlAPIServer: "http://localhost:8080/api",
  urlSocketIO: "http://localhost:3005",
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
