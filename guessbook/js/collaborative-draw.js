// Sistema de Dibujo Colaborativo
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc, getDoc, deleteDoc, query, where, getDocs, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export class CollaborativeDrawing {
  constructor(firebaseManager) {
    this.db = firebaseManager.db;
    this.currentSession = null;
    this.partnerId = null;
    this.isSearching = false;
    this.sessionListener = null;
  }

  // Buscar pareja para dibujar
  async findPartner(username) {
    try {
      this.isSearching = true;
      
      // Buscar sesiones disponibles (query simple sin índice)
      const q = query(
        collection(this.db, 'dibujos'),
        where('isCollabSession', '==', true),
        where('status', '==', 'waiting')
      );
      
      const snapshot = await getDocs(q);
      
      // Filtrar sesiones recientes (últimos 30 segundos)
      const recentTime = Date.now() - 30000;
      const recentSessions = snapshot.docs.filter(doc => {
        const data = doc.data();
        return data.timestamp > recentTime;
      });
      
      if (recentSessions.length > 0) {
        // Unirse a sesión existente
        const sessionDoc = recentSessions[0];
        const sessionData = sessionDoc.data();
        
        await updateDoc(doc(this.db, 'dibujos', sessionDoc.id), {
          user2: username,
          status: 'active',
          startedAt: Date.now()
        });
        
        this.currentSession = sessionDoc.id;
        this.partnerId = sessionData.user1;
        return { sessionId: sessionDoc.id, partner: sessionData.user1, role: 'user2' };
      } else {
        // Crear nueva sesión
        const sessionRef = await addDoc(collection(this.db, 'dibujos'), {
          isCollabSession: true,
          user1: username,
          user2: null,
          status: 'waiting',
          timestamp: Date.now(),
          createdAt: Date.now(),
          domain: 'thisisfenix.github.io',
          autor: username,
          titulo: 'Sesión Colaborativa',
          imagenData: '',
          canvas: { strokes: [] }
        });
        
        this.currentSession = sessionRef.id;
        
        // Esperar a que alguien se una (timeout 30 segundos)
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            unsubscribe();
            this.cancelSearch();
            reject(new Error('Timeout: No se encontró pareja'));
          }, 30000);
          
          const unsubscribe = onSnapshot(doc(this.db, 'dibujos', sessionRef.id), (doc) => {
            const data = doc.data();
            if (data && data.status === 'active' && data.user2) {
              clearTimeout(timeout);
              this.partnerId = data.user2;
              unsubscribe();
              resolve({ sessionId: sessionRef.id, partner: data.user2, role: 'user1' });
            }
          });
        });
      }
    } catch (error) {
      console.error('Error buscando pareja:', error);
      throw error;
    } finally {
      this.isSearching = false;
    }
  }

  // Enviar trazo al canvas compartido
  async sendStroke(strokeData) {
    if (!this.currentSession) return;
    
    try {
      const sessionRef = doc(this.db, 'dibujos', this.currentSession);
      const sessionDoc = await getDoc(sessionRef);
      
      if (sessionDoc.exists()) {
        const currentStrokes = sessionDoc.data().canvas?.strokes || [];
        await updateDoc(sessionRef, {
          'canvas.strokes': [...currentStrokes, { ...strokeData, timestamp: Date.now() }]
        });
      }
    } catch (error) {
      console.error('Error enviando trazo:', error);
    }
  }

  // Escuchar cambios en el canvas
  listenToCanvas(callback) {
    if (!this.currentSession) return;
    
    this.sessionListener = onSnapshot(
      doc(this.db, 'dibujos', this.currentSession),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          callback(data.canvas);
        }
      }
    );
  }

  // Salir de la sesión
  async leaveSession(username) {
    if (!this.currentSession) return;
    
    try {
      if (this.sessionListener) {
        this.sessionListener();
      }
      
      await deleteDoc(doc(this.db, 'dibujos', this.currentSession));
      this.currentSession = null;
      this.partnerId = null;
    } catch (error) {
      console.error('Error saliendo de sesión:', error);
    }
  }

  // Cancelar búsqueda
  async cancelSearch() {
    if (this.currentSession && this.isSearching) {
      try {
        await deleteDoc(doc(this.db, 'dibujos', this.currentSession));
      } catch (error) {
        console.error('Error cancelando búsqueda:', error);
      }
      this.currentSession = null;
    }
    this.isSearching = false;
  }
}
