// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyDOuWdqJsDbbzEzat9iNZoGVoC8l_pL0PI",
    authDomain: "kinnil-feat-cedar.firebaseapp.com",
    projectId: "kinnil-feat-cedar",
    storageBucket: "kinnil-feat-cedar.appspot.com",
    messagingSenderId: "212415381093",
    appId: "1:212415381093:web:8977bcb7cdd2d2d95b908c",
    measurementId: "G-CGQVNQPGS9",
  },
  urlAPIServer: "http://localhost:8080/api",
  urlSocketIO: "http://localhost:3005",
  urlNotifications: "https://notify.kinnil.com/api",
  apiKeyNotifications: "1e57a452a094728c291bc42bf2bc7eb8d9fd8844d1369da2bf728588b46c4e75"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
