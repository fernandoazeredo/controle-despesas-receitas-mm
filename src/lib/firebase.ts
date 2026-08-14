import { getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

/**
 * Configuração pública do Firebase Web App.
 *
 * Este projeto é dedicado exclusivamente ao aplicativo
 * Controle de Despesas e Receitas, mantendo Auth, Firestore,
 * Storage e Hosting isolados dos demais projetos Firebase.
 *
 * As variáveis VITE_* podem sobrescrever os valores abaixo
 * quando desejarmos usar outro ambiente no futuro.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyANrY7-y3sYJTrTrw4TfZ6hMc3ZH5IpfVo',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'controle-despesas-receitas-mm.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'controle-despesas-receitas-mm',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'controle-despesas-receitas-mm.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '204836683608',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:204836683608:web:345a26de7decf49cf6ef2d',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-HRCT7DXGPM',
}

export const firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)
export const storage = getStorage(firebaseApp)
export const firebaseProjectId = firebaseConfig.projectId
