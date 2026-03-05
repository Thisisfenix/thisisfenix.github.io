// Sistema de Dibujo Colaborativo
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc, getDoc, deleteDoc, query, where, getDocs, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export class CollaborativeDrawing {
  constructor(firebaseManager) {
    this.db = firebaseManager.db;
    this.currentSession = null;
    this.partners = []; // Múltiples usuarios
    this.isSearching = false;
    this.sessionListener = null;
    this.strokeBuffer = [];
    this.lastSendTime = 0;
    this.sendInterval = 300;
    this.maxRooms = 10; // Máximo 10 salas para ahorrar costos
    this.maxUsersPerRoom = 4; // Máximo 4 usuarios por sala
  }

  // Obtener salas disponibles
  async getAvailableRooms() {
    try {
      const q = query(
        collection(this.db, 'dibujos'),
        where('isCollabSession', '==', true),
        where('status', '==', 'active')
      );
      
      const snapshot = await getDocs(q);
      const recentTime = Date.now() - 300000; // Últimos 5 minutos
      
      return snapshot.docs
        .filter(doc => {
          const data = doc.data();
          const users = data.users || [];
          return data.timestamp > recentTime && users.length < this.maxUsersPerRoom;
        })
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            users: data.users || [],
            roomNumber: data.roomNumber || 1,
            timestamp: data.timestamp
          };
        });
    } catch (error) {
      console.error('Error obteniendo salas:', error);
      return [];
    }
  }

  // Crear sala personalizada
  async createRoom(username, roomName, maxUsers) {
    try {
      const activeSessions = await this.getActiveSessions();
      if (activeSessions >= this.maxRooms) {
        throw new Error('Límite de salas alcanzado');
      }
      
      const roomNumber = activeSessions + 1;
      const sessionRef = await addDoc(collection(this.db, 'dibujos'), {
        isCollabSession: true,
        users: [username],
        status: 'active',
        timestamp: Date.now(),
        createdAt: Date.now(),
        domain: 'thisisfenix.github.io',
        autor: username,
        titulo: roomName || `Sala #${roomNumber}`,
        imagenData: '',
        roomNumber: roomNumber,
        maxUsers: Math.min(maxUsers || 4, this.maxUsersPerRoom),
        canvas: { strokes: [] }
      });
      
      return {
        sessionId: sessionRef.id,
        roomNumber: roomNumber
      };
    } catch (error) {
      console.error('Error creando sala:', error);
      throw error;
    }
  }
  
  // Unirse a sala específica
  async joinRoom(sessionId, username) {
    try {
      const sessionRef = doc(this.db, 'dibujos', sessionId);
      const sessionDoc = await getDoc(sessionRef);
      
      if (!sessionDoc.exists()) {
        throw new Error('Sala no encontrada');
      }
      
      const data = sessionDoc.data();
      const users = data.users || [];
      const maxUsers = data.maxUsers || this.maxUsersPerRoom;
      
      if (users.length >= maxUsers) {
        throw new Error('Sala llena');
      }
      
      if (users.includes(username)) {
        throw new Error('Ya estás en esta sala');
      }
      
      const updatedUsers = [...users, username];
      await updateDoc(sessionRef, {
        users: updatedUsers,
        lastJoin: Date.now()
      });
      
      this.currentSession = sessionId;
      this.partners = users;
      
      return {
        sessionId: sessionId,
        partners: users,
        userCount: updatedUsers.length,
        roomNumber: data.roomNumber,
        maxUsers: maxUsers
      };
    } catch (error) {
      console.error('Error uniéndose a sala:', error);
      throw error;
    }
  }
  async findPartner(username) {
    try {
      this.isSearching = true;
      
      const availableRooms = await this.getAvailableRooms();
      
      if (availableRooms.length > 0) {
        // Unirse a sala existente
        const room = availableRooms[0];
        const updatedUsers = [...room.users, username];
        
        await updateDoc(doc(this.db, 'dibujos', room.id), {
          users: updatedUsers,
          lastJoin: Date.now()
        });
        
        this.currentSession = room.id;
        this.partners = room.users;
        
        return { 
          sessionId: room.id, 
          partners: room.users,
          userCount: updatedUsers.length,
          roomNumber: room.roomNumber 
        };
      } else {
        // Verificar límite de salas
        const activeSessions = await this.getActiveSessions();
        if (activeSessions >= this.maxRooms) {
          throw new Error('Límite de salas alcanzado. Intenta más tarde.');
        }
        
        // Crear nueva sala
        const roomNumber = activeSessions + 1;
        const sessionRef = await addDoc(collection(this.db, 'dibujos'), {
          isCollabSession: true,
          users: [username],
          status: 'active',
          timestamp: Date.now(),
          createdAt: Date.now(),
          domain: 'thisisfenix.github.io',
          autor: username,
          titulo: `Sala #${roomNumber} (${this.maxUsersPerRoom} max)`,
          imagenData: '',
          roomNumber: roomNumber,
          canvas: { strokes: [] }
        });
        
        this.currentSession = sessionRef.id;
        this.partners = [];
        
        return { 
          sessionId: sessionRef.id, 
          partners: [],
          userCount: 1,
          roomNumber: roomNumber
        };
      }
    } catch (error) {
      console.error('Error buscando sala:', error);
      throw error;
    } finally {
      this.isSearching = false;
    }
  }

  // Obtener número de sesiones activas
  async getActiveSessions() {
    try {
      const q = query(
        collection(this.db, 'dibujos'),
        where('isCollabSession', '==', true)
      );
      
      const snapshot = await getDocs(q);
      const recentTime = Date.now() - 60000; // Último minuto
      
      return snapshot.docs.filter(doc => {
        const data = doc.data();
        return data.timestamp > recentTime;
      }).length;
    } catch (error) {
      console.error('Error contando sesiones:', error);
      return 0;
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
        // Solo mantener los últimos 30 trazos para reducir tamaño
        const allStrokes = [...currentStrokes, ...strokesToSend.map(s => ({ ...s, timestamp: Date.now() }))];
        const limitedStrokes = allStrokes.slice(-30);
        
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
      
      this.strokeBuffer = [];
      
      // Remover usuario de la sala
      const sessionRef = doc(this.db, 'dibujos', this.currentSession);
      const sessionDoc = await getDoc(sessionRef);
      
      if (sessionDoc.exists()) {
        const users = sessionDoc.data().users || [];
        const updatedUsers = users.filter(u => u !== username);
        
        if (updatedUsers.length === 0) {
          // Si no quedan usuarios, eliminar sala
          await deleteDoc(sessionRef);
        } else {
          // Actualizar lista de usuarios
          await updateDoc(sessionRef, {
            users: updatedUsers,
            lastLeave: Date.now()
          });
        }
      }
      
      this.currentSession = null;
      this.partners = [];
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
