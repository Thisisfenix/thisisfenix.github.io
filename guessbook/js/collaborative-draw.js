// Sistema de Dibujo Colaborativo
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc, getDoc, deleteDoc, query, where, getDocs, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export class CollaborativeDrawing {
  constructor(firebaseManager) {
    this.db = firebaseManager.db;
    this.currentSession = null;
    this.partnerId = null;
    this.isSearching = false;
    this.sessionListener = null;
    this.strokeBuffer = [];
    this.lastSendTime = 0;
    this.sendInterval = 200; // Enviar cada 200ms máximo
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

  // Enviar trazo al canvas compartido (con throttling)
  async sendStroke(strokeData) {
    if (!this.currentSession) return;
    
    // Agregar al buffer
    this.strokeBuffer.push(strokeData);
    
    // Solo enviar si han pasado 200ms desde el último envío
    const now = Date.now();
    if (now - this.lastSendTime < this.sendInterval) {
      return; // Esperar
    }
    
    this.lastSendTime = now;
    
    // Enviar todos los trazos del buffer
    if (this.strokeBuffer.length === 0) return;
    
    const strokesToSend = [...this.strokeBuffer];
    this.strokeBuffer = [];
    
    try {
      const sessionRef = doc(this.db, 'dibujos', this.currentSession);
      const sessionDoc = await getDoc(sessionRef);
      
      if (sessionDoc.exists()) {
        const currentStrokes = sessionDoc.data().canvas?.strokes || [];
        // Solo mantener los últimos 50 trazos para evitar documentos grandes
        const allStrokes = [...currentStrokes, ...strokesToSend.map(s => ({ ...s, timestamp: Date.now() }))];
        const limitedStrokes = allStrokes.slice(-50);
        
        await updateDoc(sessionRef, {
          'canvas.strokes': limitedStrokes,
          lastUpdate: Date.now()
        });
      }
    } catch (error) {
      console.error('Error enviando trazos:', error);
      // Reintroducir trazos al buffer si falla
      this.strokeBuffer = [...strokesToSend, ...this.strokeBuffer];
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
      
      // Limpiar buffer
      this.strokeBuffer = [];
      
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
