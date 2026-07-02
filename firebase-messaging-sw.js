// Service worker de Firebase Cloud Messaging — maneja los avisos push cuando
// la pestaña de admin-papaoso.html está cerrada o en 2do plano.
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCOZCCoJyYUNYUuy66LCjRkMWqTDlv2YUA",
  authDomain: "contro-de-asistencia-papa-oso.firebaseapp.com",
  projectId: "contro-de-asistencia-papa-oso",
  storageBucket: "contro-de-asistencia-papa-oso.firebasestorage.app",
  messagingSenderId: "178045507086",
  appId: "1:178045507086:web:ad247f8f150aa1c0770e5f"
});

const messaging = firebase.messaging();

// Firebase ya muestra la notificación automáticamente usando el bloque
// "notification" del mensaje (ver functions/index.js), así que acá no
// hace falta código extra — este archivo solo necesita existir y registrarse.
