// Firebase y base de datos
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, onSnapshot, orderBy, query, updateDoc, doc, getDoc, deleteDoc, where, getDocs, setDoc, limit, arrayUnion, arrayRemove, connectFirestoreEmulator } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export class FirebaseManager {
  constructor() {
    this.autoModeration = window.autoModeration;
    
    // Detectar versión
    this.version = this.detectVersion();
    
    this.firebaseConfig = {
      apiKey: "AIzaSyCZk8rs_Vq9ZGgOEiP3_P6zUvZoM1QQOAM",
      authDomain: "fenix-guestbook.firebaseapp.com",
      projectId: "fenix-guestbook",
      storageBucket: "fenix-guestbook.firebasestorage.app",
      messagingSenderId: "90606615201",
      appId: "1:90606615201:web:7126a42ca59b57bdc58ee0"
    };
    
    this.app = initializeApp(this.firebaseConfig);
    
    // Configurar Firestore con settings para evitar warnings
    this.db = getFirestore(this.app);
    
    // No testear conexión inmediatamente para evitar el warning de 10s
    // this.testConnection();
  }
  
  detectVersion() {
    if (window.location.pathname.includes('v1')) return 'v1';
    if (window.location.pathname.includes('new')) return 'new';
    return 'old';
  }
  
  async testConnection() {
    try {
      const testQuery = query(collection(this.db, 'dibujos'), orderBy('timestamp', 'desc'));
      console.log('✅ Conexión a Firebase exitosa');
      return true;
    } catch (error) {
      console.error('❌ Error de conexión a Firebase:', error);
      return false;
    }
  }
  
  async saveDrawing(drawingData) {
    try {
      await addDoc(collection(this.db, 'dibujos'), drawingData);
      return true;
    } catch (error) {
      console.error('Error guardando dibujo:', error);
      throw error;
    }
  }
  
  async getUserRole(username) {
    try {
      // Solo verificar moderadores si estamos autenticados
      if (window.currentUser && window.currentUser.role) {
        const q = query(collection(this.db, 'moderators'), where('username', '==', username), where('active', '==', true));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          return 'moderator';
        }
      }
      
      return null;
    } catch (error) {
      // Silenciar error de permisos para usuarios normales
      return null;
    }
  }
  
  async updateDrawing(id, data) {
    try {
      await updateDoc(doc(this.db, 'dibujos', id), data);
      return true;
    } catch (error) {
      console.error('Error actualizando dibujo:', error);
      throw error;
    }
  }
  
  async deleteDrawing(id, moderator = null, reason = '') {
    try {
      await deleteDoc(doc(this.db, 'dibujos', id));
      
      if (moderator && typeof moderator === 'string') {
        await this.logModeratorAction('delete_drawing', moderator, id, { reason });
      }
      
      return true;
    } catch (error) {
      console.error('Error eliminando dibujo:', error);
      throw error;
    }
  }
  
  onDrawingsChange(callback) {
    const q = query(collection(this.db, 'dibujos'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, callback);
  }
  
  async getDrawing(id) {
    try {
      console.log('Obteniendo dibujo con ID:', id);
      const docSnap = await getDoc(doc(this.db, 'dibujos', id));
      if (docSnap.exists()) {
        const drawing = { id: docSnap.id, data: docSnap.data() };
        console.log('Dibujo encontrado, comentarios en documento:', drawing.data.comments?.length || 0);
        return drawing;
      }
      console.log('Dibujo no encontrado');
      return null;
    } catch (error) {
      console.error('Error obteniendo dibujo:', error);
      throw error;
    }
  }
  
  async addComment(drawingId, comment) {
    try {
      // Auto-moderación antes de agregar
      if (comment.texto && this.autoModeration) {
        const modResult = await this.autoModeration.moderateContent(comment.texto, comment.autor || 'Anónimo', 'comment');
        
        if (modResult.blocked) {
          throw new Error(`Comentario bloqueado: ${modResult.reasons.join(', ')}`);
        }
        
        if (modResult.flagged) {
          comment.flagged = true;
          comment.flagReason = modResult.reasons.join(', ');
        }
        
        comment.texto = this.autoModeration.filterContent(comment.texto);
      }
      
      const docRef = doc(this.db, 'dibujos', drawingId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const currentComments = docSnap.data().comments || [];
        await updateDoc(docRef, {
          comments: [...currentComments, comment]
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error agregando comentario:', error);
      throw error;
    }
  }
  
  async addLike(drawingId) {
    try {
      const docRef = doc(this.db, 'dibujos', drawingId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const currentLikes = docSnap.data().likes || 0;
        await updateDoc(docRef, {
          likes: currentLikes + 1
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error agregando like:', error);
      throw error;
    }
  }
  
  async saveSuggestion(suggestionData) {
    try {
      const docRef = await addDoc(collection(this.db, 'sugerencias'), suggestionData);
      return docRef.id;
    } catch (error) {
      console.error('Error guardando sugerencia:', error);
      throw error;
    }
  }
  
  async getRecentSuggestions(limitCount = 10) {
    try {
      console.log(`📝 Cargando ${limitCount} sugerencias...`);
      
      const q = query(
        collection(this.db, 'sugerencias'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const suggestions = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data && data.texto) {
          suggestions.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      console.log(`✅ Cargadas ${suggestions.length} sugerencias`);
      return suggestions;
    } catch (error) {
      console.error('❌ Error obteniendo sugerencias:', error);
      return [];
    }
  }
  
  async getAllDrawings() {
    try {
      console.log('🎨 Cargando todos los dibujos...');
      
      const q = query(collection(this.db, 'dibujos'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const drawings = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data && data.autor && data.imagenData) {
          drawings.push({
            id: doc.id,
            data: data
          });
        }
      });
      
      console.log(`✅ Cargados ${drawings.length} dibujos`);
      return drawings;
    } catch (error) {
      console.error('❌ Error obteniendo todos los dibujos:', error);
      return [];
    }
  }
  
  async getDrawings() {
    return this.getAllDrawings();
  }
  
  async getUserDrawings(username) {
    try {
      console.log(`🎨 Cargando dibujos de ${username}...`);
      
      // Query con filtro por autor
      const q = query(
        collection(this.db, 'dibujos'),
        where('autor', '==', username),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const drawings = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data && data.imagenData) {
          drawings.push({
            id: doc.id,
            data: data
          });
        }
      });
      
      console.log(`✅ Cargados ${drawings.length} dibujos de ${username}`);
      return drawings;
    } catch (error) {
      console.error(`❌ Error obteniendo dibujos de ${username}:`, error);
      // Si el índice no existe, hacer fallback a filtrado local
      console.warn('⚠️ Usando filtrado local (índice no disponible)');
      const allDrawings = await this.getAllDrawings();
      return allDrawings.filter(d => d.data.autor === username);
    }
  }
  
  async getComments(drawingId) {
    try {
      console.log('Buscando comentarios para drawingId:', drawingId);
      
      // Query sin orderBy para evitar necesitar índice compuesto
      const q = query(
        collection(this.db, 'comments'),
        where('drawingId', '==', drawingId)
      );
      
      const querySnapshot = await getDocs(q);
      const comments = [];
      
      querySnapshot.forEach((doc) => {
        comments.push({
          id: doc.id,
          data: doc.data()
        });
      });
      
      // Ordenar en el cliente
      comments.sort((a, b) => (a.data.timestamp || 0) - (b.data.timestamp || 0));
      
      console.log(`Encontrados ${comments.length} comentarios en colección separada`);
      return comments;
    } catch (error) {
      console.error('Error obteniendo comentarios de colección separada:', error);
      return [];
    }
  }
  
  async addComment(drawingId, commentData) {
    try {
      console.log('Agregando comentario a colección separada:', { drawingId, commentData });
      
      // Auto-moderación antes de agregar
      if (commentData.texto && this.autoModeration) {
        const modResult = await this.autoModeration.moderateContent(commentData.texto, commentData.autor || 'Anónimo', 'comment');
        
        if (modResult.blocked) {
          throw new Error(`Comentario bloqueado: ${modResult.reasons.join(', ')}`);
        }
        
        if (modResult.flagged) {
          commentData.flagged = true;
          commentData.flagReason = modResult.reasons.join(', ');
        }
        
        commentData.texto = this.autoModeration.filterContent(commentData.texto);
      }
      
      const comment = {
        ...commentData,
        drawingId: drawingId,
        domain: 'thisisfenix.github.io'
      };
      
      const docRef = await addDoc(collection(this.db, 'comments'), comment);
      console.log('Comentario agregado con ID:', docRef.id);
      return true;
    } catch (error) {
      console.error('Error agregando comentario a colección separada:', error);
      throw error;
    }
  }
  
  async toggleLike(drawingId, username, isLiked) {
    try {
      const docRef = doc(this.db, 'dibujos', drawingId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const currentLikes = data.likes || 0;
        const likedBy = data.likedBy || [];
        
        let newLikes;
        let newLikedBy;
        
        if (isLiked) {
          // Dar like
          newLikes = currentLikes + 1;
          newLikedBy = [...new Set([...likedBy, username])]; // Evitar duplicados
        } else {
          // Quitar like
          newLikes = Math.max(0, currentLikes - 1);
          newLikedBy = likedBy.filter(user => user !== username);
        }
        
        await updateDoc(docRef, {
          likes: newLikes,
          likedBy: newLikedBy
        });
        
        console.log(`✅ Like ${isLiked ? 'agregado' : 'removido'} - Total: ${newLikes}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }
  
  async checkAdminAccess(password) {
    try {
      // Verificar dominio autorizado
      const currentDomain = window.location.hostname;
      const authorizedDomains = ['thisisfenix.github.io', 'localhost', '127.0.0.1'];
      
      if (!authorizedDomains.includes(currentDomain)) {
        return false;
      }
      
      // Verificar contraseña desde Firebase
      if (!password) {
        return false;
      }
      
      try {
        const docRef = doc(this.db, 'system_config', 'admin_credentials');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Verificar contraseña de admin
          if (data.adminPassword && password === data.adminPassword) {
            return { role: 'admin', permissions: ['all'] };
          }
          
          // Verificar contraseña de moderador
          if (data.moderatorPassword && password === data.moderatorPassword) {
            return { role: 'moderator_access', permissions: ['moderate'] };
          }
        }
      } catch (error) {
        console.error('Error verificando credenciales:', error);
      }
      
      return false;
    } catch (error) {
      console.error('Error verificando acceso:', error);
      return false;
    }
  }
  
  async checkModeratorAccess(username) {
    try {
      // Verificar dominio autorizado
      const currentDomain = window.location.hostname;
      const authorizedDomains = ['thisisfenix.github.io', 'localhost', '127.0.0.1'];
      
      if (authorizedDomains.includes(currentDomain) && username) {
        return {
          role: 'moderator',
          permissions: ['delete_drawings', 'manage_comments', 'manage_suggestions'],
          name: username,
          username: username,
          id: 'mod_' + username
        };
      }
      
      return false;
    } catch (error) {
      console.error('Error verificando moderador:', error);
      return false;
    }
  }
  
  async addModerator(moderatorData) {
    try {
      // La verificación de permisos se hace en el frontend antes de llamar esta función
      
      // Verificar que el username no exista
      const q = query(collection(this.db, 'moderators'), where('username', '==', moderatorData.username));
      const existing = await getDocs(q);
      
      if (!existing.empty) {
        throw new Error('El nombre de usuario ya existe');
      }
      
      const docRef = await addDoc(collection(this.db, 'moderators'), {
        name: moderatorData.name,
        username: moderatorData.username,
        permissions: moderatorData.permissions || [],
        createdAt: Date.now(),
        active: true,
        domain: 'thisisfenix.github.io'
      });
      return docRef.id;
    } catch (error) {
      console.error('Error añadiendo moderador:', error);
      throw error;
    }
  }
  
  async getModerators() {
    try {
      const q = query(collection(this.db, 'moderators'), orderBy('createdAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      const moderators = [];
      
      querySnapshot.forEach((doc) => {
        moderators.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return moderators;
    } catch (error) {
      console.error('Error obteniendo moderadores:', error);
      return [];
    }
  }
  
  async updateModerator(moderatorId, data) {
    try {
      await updateDoc(doc(this.db, 'moderators', moderatorId), {
        ...data,
        updatedAt: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Error actualizando moderador:', error);
      throw error;
    }
  }
  
  async deleteModerator(moderatorId) {
    try {
      await deleteDoc(doc(this.db, 'moderators', moderatorId));
      return true;
    } catch (error) {
      console.error('Error eliminando moderador:', error);
      throw error;
    }
  }
  
  async logModeratorAction(action, moderator, target, details = {}) {
    try {
      // Validar que moderator no sea undefined
      if (!moderator || typeof moderator !== 'string') {
        console.warn('Moderator inválido para log:', moderator);
        moderator = 'Sistema';
      }
      
      await addDoc(collection(this.db, 'moderation_logs'), {
        moderator: String(moderator),
        action: String(action),
        target: String(target),
        reason: details.reason || '',
        timestamp: Date.now(),
        domain: 'thisisfenix.github.io'
      });
      return true;
    } catch (error) {
      console.error('Error registrando acción de moderación:', error);
      return false;
    }
  }
  
  async getModerationLogs() {
    try {
      const q = query(collection(this.db, 'moderation_logs'), orderBy('timestamp', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      const logs = [];
      
      querySnapshot.forEach((doc) => {
        logs.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return logs;
    } catch (error) {
      console.error('Error obteniendo logs de moderación:', error);
      return [];
    }
  }
  
  async updateSuggestionStatus(suggestionId, status) {
    try {
      await updateDoc(doc(this.db, 'sugerencias', suggestionId), {
        status: status,
        updatedAt: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Error actualizando estado de sugerencia:', error);
      throw error;
    }
  }
  
  async getAllSuggestions() {
    try {
      const q = query(collection(this.db, 'sugerencias'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const suggestions = [];
      
      querySnapshot.forEach((doc) => {
        suggestions.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return suggestions;
    } catch (error) {
      console.error('Error obteniendo todas las sugerencias:', error);
      return [];
    }
  }
  
  async deleteDrawing(drawingId, moderatorName, reason = '') {
    try {
      await deleteDoc(doc(this.db, 'dibujos', drawingId));
      
      await this.logModeratorAction(
        'delete_drawing',
        moderatorName,
        drawingId,
        { reason }
      );
      
      return true;
    } catch (error) {
      console.error('Error eliminando dibujo:', error);
      throw error;
    }
  }
  
  async reportDrawing(reportData) {
    try {
      // Validar datos del reporte
      if (!reportData.drawingId || !reportData.reason) {
        throw new Error('Datos del reporte incompletos');
      }
      
      const docRef = await addDoc(collection(this.db, 'reports'), {
        ...reportData,
        domain: 'thisisfenix.github.io',
        status: 'pending',
        timestamp: reportData.timestamp || Date.now(),
        reviewedBy: null,
        reviewedAt: null
      });
      
      console.log('Reporte enviado con ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error enviando reporte:', error);
      throw error;
    }
  }
  
  async getAllReports() {
    try {
      const q = query(collection(this.db, 'reports'), orderBy('timestamp', 'desc'), limit(100));
      const querySnapshot = await getDocs(q);
      const reports = [];
      
      querySnapshot.forEach((doc) => {
        reports.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return reports;
    } catch (error) {
      console.error('Error obteniendo reportes:', error);
      return [];
    }
  }
  
  async updateReportStatus(reportId, status, reviewerName = null) {
    try {
      const updateData = {
        status: status,
        updatedAt: Date.now()
      };
      
      if (reviewerName) {
        updateData.reviewedBy = reviewerName;
        updateData.reviewedAt = Date.now();
      }
      
      await updateDoc(doc(this.db, 'reports', reportId), updateData);
      
      // Log de la acción de moderación
      if (reviewerName) {
        await this.logModeratorAction(
          'update_report_status',
          reviewerName,
          reportId,
          { newStatus: status }
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error actualizando reporte:', error);
      throw error;
    }
  }
  
  async saveUserProfile(profileData) {
    try {
      const docRef = doc(this.db, 'user_profiles', profileData.username.toLowerCase());
      
      // Filtrar campos undefined
      const cleanData = {
        username: profileData.username,
        domain: 'thisisfenix.github.io',
        updatedAt: Date.now()
      };
      
      // Solo agregar campos que no sean undefined
      if (profileData.avatar !== undefined) cleanData.avatar = profileData.avatar;
      if (profileData.avatarType !== undefined) cleanData.avatarType = profileData.avatarType;
      if (profileData.avatarImage !== undefined) cleanData.avatarImage = profileData.avatarImage;
      if (profileData.bannerImage !== undefined) cleanData.bannerImage = profileData.bannerImage;
      if (profileData.bio !== undefined) cleanData.bio = profileData.bio;
      if (profileData.favoriteCategory !== undefined) cleanData.favoriteCategory = profileData.favoriteCategory;
      if (profileData.totalDrawings !== undefined) cleanData.totalDrawings = profileData.totalDrawings;
      if (profileData.totalLikes !== undefined) cleanData.totalLikes = profileData.totalLikes;
      if (profileData.achievements !== undefined) cleanData.achievements = profileData.achievements;
      if (profileData.lastLogin !== undefined) cleanData.lastLogin = profileData.lastLogin;
      if (profileData.userTags !== undefined) cleanData.userTags = profileData.userTags;
      
      await setDoc(docRef, cleanData, { merge: true });
      return true;
    } catch (error) {
      console.error('Error guardando perfil de usuario:', error);
      throw error;
    }
  }
  
  async getUserProfile(username) {
    try {
      const docRef = doc(this.db, 'user_profiles', username.toLowerCase());
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo perfil de usuario:', error);
      return null;
    }
  }
  
  async saveAllUsers(usersArray) {
    try {
      const docRef = doc(this.db, 'system_data', 'registered_users');
      await setDoc(docRef, {
        users: usersArray,
        domain: 'thisisfenix.github.io',
        updatedAt: Date.now(),
        totalUsers: usersArray.length
      });
      console.log(`✅ ${usersArray.length} usuarios guardados en Firebase`);
      return true;
    } catch (error) {
      console.error('Error guardando usuarios en Firebase:', error);
      throw error;
    }
  }
  
  async getAllUsers() {
    try {
      const docRef = doc(this.db, 'system_data', 'registered_users');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(`✅ ${data.users?.length || 0} usuarios cargados desde Firebase`);
        return data.users || [];
      }
      console.log('📄 No hay usuarios en Firebase aún');
      return [];
    } catch (error) {
      console.error('Error cargando usuarios desde Firebase:', error);
      throw error;
    }
  }
  
  async saveUserCredentials(username, passwordHash, userData) {
    try {
      const docRef = doc(this.db, 'user_credentials', username.toLowerCase());
      await setDoc(docRef, {
        username: userData.username,
        passwordHash: passwordHash,
        email: userData.email || '',
        joinDate: userData.joinDate || Date.now(),
        domain: 'thisisfenix.github.io',
        createdAt: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Error guardando credenciales:', error);
      throw error;
    }
  }
  
  async getUserCredentials(username) {
    try {
      const docRef = doc(this.db, 'user_credentials', username.toLowerCase());
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo credenciales:', error);
      return null;
    }
  }
  
  async saveRecoveryCode(username, code) {
    try {
      const docRef = doc(this.db, 'recovery_codes', username.toLowerCase());
      await setDoc(docRef, {
        username: username,
        code: code,
        createdAt: Date.now(),
        used: false,
        domain: 'thisisfenix.github.io'
      });
      return true;
    } catch (error) {
      console.error('Error guardando código de recuperación:', error);
      throw error;
    }
  }
  
  async verifyRecoveryCode(username, code) {
    try {
      const docRef = doc(this.db, 'recovery_codes', username.toLowerCase());
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return false;
      }
      
      const data = docSnap.data();
      return data.code === code && !data.used;
    } catch (error) {
      console.error('Error verificando código:', error);
      return false;
    }
  }
  
  async invalidateRecoveryCode(username, code) {
    try {
      const docRef = doc(this.db, 'recovery_codes', username.toLowerCase());
      await updateDoc(docRef, {
        used: true,
        usedAt: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Error invalidando código:', error);
      throw error;
    }
  }
  
  async updateUserPassword(username, newPasswordHash) {
    try {
      const docRef = doc(this.db, 'user_credentials', username.toLowerCase());
      await updateDoc(docRef, {
        passwordHash: newPasswordHash,
        lastPasswordChange: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Error actualizando contraseña:', error);
      throw error;
    }
  }
  
  async checkRecoveryAttempts(username) {
    try {
      const docRef = doc(this.db, 'recovery_attempts', username.toLowerCase());
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return { count: 0, blocked: false };
      }
      
      const data = docSnap.data();
      const now = Date.now();
      
      // Si está bloqueado, verificar si ya pasó el tiempo
      if (data.blockUntil && data.blockUntil > now) {
        return { 
          count: data.failedAttempts || 0,
          blocked: true, 
          blockUntil: data.blockUntil 
        };
      }
      
      // Si ya pasó el bloqueo, resetear
      if (data.blockUntil && data.blockUntil <= now) {
        await updateDoc(docRef, {
          failedAttempts: 0,
          blockUntil: null
        });
        return { count: 0, blocked: false };
      }
      
      return { 
        count: data.failedAttempts || 0, 
        blocked: false 
      };
    } catch (error) {
      console.error('Error verificando intentos:', error);
      return { count: 0, blocked: false };
    }
  }
  
  async registerRecoveryAttempt(username, success) {
    try {
      const docRef = doc(this.db, 'recovery_attempts', username.toLowerCase());
      const docSnap = await getDoc(docRef);
      
      const now = Date.now();
      const BLOCK_DURATION = 30 * 60 * 1000; // 30 minutos
      
      if (success) {
        // Si tuvo éxito, limpiar intentos
        await setDoc(docRef, {
          username: username,
          failedAttempts: 0,
          lastSuccessful: now,
          blockUntil: null,
          domain: 'thisisfenix.github.io'
        }, { merge: true });
      } else {
        // Incrementar intentos fallidos
        const currentAttempts = docSnap.exists() ? (docSnap.data().failedAttempts || 0) : 0;
        const newAttempts = currentAttempts + 1;
        
        const updateData = {
          username: username,
          failedAttempts: newAttempts,
          lastFailed: now,
          domain: 'thisisfenix.github.io'
        };
        
        // Si llegó a 3 intentos, bloquear
        if (newAttempts >= 3) {
          updateData.blockUntil = now + BLOCK_DURATION;
          updateData.blockedAt = now;
        }
        
        await setDoc(docRef, updateData, { merge: true });
        
        // Registrar en logs de seguridad
        await addDoc(collection(this.db, 'security_logs'), {
          type: 'recovery_attempt_failed',
          username: username,
          timestamp: now,
          attempts: newAttempts,
          blocked: newAttempts >= 3,
          domain: 'thisisfenix.github.io'
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error registrando intento:', error);
      throw error;
    }
  }
  
  async clearRecoveryAttempts(username) {
    try {
      const docRef = doc(this.db, 'recovery_attempts', username.toLowerCase());
      await setDoc(docRef, {
        username: username,
        failedAttempts: 0,
        blockUntil: null,
        clearedAt: Date.now(),
        domain: 'thisisfenix.github.io'
      }, { merge: true });
      return true;
    } catch (error) {
      console.error('Error limpiando intentos:', error);
      throw error;
    }
  }
  
  async getRecoveryCode(username) {
    try {
      const docRef = doc(this.db, 'recovery_codes', username.toLowerCase());
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo código:', error);
      return null;
    }
  }
  
  async updateUserSecurityQuestion(username, question, answerHash) {
    try {
      const docRef = doc(this.db, 'user_credentials', username.toLowerCase());
      await updateDoc(docRef, {
        securityQuestion: question,
        securityAnswerHash: answerHash,
        securityQuestionUpdated: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Error actualizando pregunta de seguridad:', error);
      throw error;
    }
  }
  
  async getAllComments() {
    try {
      const q = query(collection(this.db, 'comments'), orderBy('timestamp', 'desc'), limit(1000));
      const querySnapshot = await getDocs(q);
      const comments = [];
      
      querySnapshot.forEach((doc) => {
        comments.push({
          id: doc.id,
          data: doc.data()
        });
      });
      
      return comments;
    } catch (error) {
      console.error('Error obteniendo todos los comentarios:', error);
      return [];
    }
  }
  
  async updateUserProfile(username, updateData) {
    try {
      const docRef = doc(this.db, 'user_profiles', username.toLowerCase());
      await updateDoc(docRef, {
        ...updateData,
        domain: 'thisisfenix.github.io',
        updatedAt: Date.now()
      });
      
      console.log(`✅ Perfil de ${username} actualizado con:`, updateData);
      return true;
    } catch (error) {
      console.error('Error actualizando perfil de usuario:', error);
      throw error;
    }
  }

  async updateUserPrivacy(username, privacySettings) {
    try {
      const docRef = doc(this.db, 'user_profiles', username.toLowerCase());
      await updateDoc(docRef, {
        privacy: privacySettings,
        updatedAt: Date.now()
      });
      
      console.log(`✅ Configuración de privacidad de ${username} actualizada`);
      return true;
    } catch (error) {
      console.error('Error actualizando privacidad:', error);
      throw error;
    }
  }
  
  // Sistema de amistades
  async saveFriendRequest(requestData) {
    try {
      // Verificar dominio autorizado
      const currentDomain = window.location.hostname;
      const authorizedDomains = ['thisisfenix.github.io', 'localhost', '127.0.0.1'];
      
      if (!authorizedDomains.includes(currentDomain)) {
        throw new Error('Dominio no autorizado');
      }
      
      await addDoc(collection(this.db, 'friend_requests'), {
        ...requestData,
        domain: 'thisisfenix.github.io'
      });
      return true;
    } catch (error) {
      console.error('Error enviando solicitud de amistad:', error);
      throw error;
    }
  }
  
  async createFriendship(user1, user2) {
    try {
      // Verificar dominio autorizado
      const currentDomain = window.location.hostname;
      const authorizedDomains = ['thisisfenix.github.io', 'localhost', '127.0.0.1'];
      
      if (!authorizedDomains.includes(currentDomain)) {
        throw new Error('Dominio no autorizado');
      }
      
      const friendshipData = {
        users: [user1.toLowerCase(), user2.toLowerCase()],
        user1: user1,
        user2: user2,
        timestamp: Date.now(),
        domain: 'thisisfenix.github.io'
      };
      
      await addDoc(collection(this.db, 'friendships'), friendshipData);
      return true;
    } catch (error) {
      console.error('Error creando amistad:', error);
      throw error;
    }
  }
  
  async updateFriendRequestStatus(from, to, status) {
    try {
      const q = query(
        collection(this.db, 'friend_requests'),
        where('from', '==', from),
        where('to', '==', to),
        where('status', '==', 'pending')
      );
      
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (docSnap) => {
        await updateDoc(doc(this.db, 'friend_requests', docSnap.id), {
          status: status,
          updatedAt: Date.now()
        });
      });
      
      return true;
    } catch (error) {
      console.error('Error actualizando solicitud:', error);
      throw error;
    }
  }
  
  async removeFriendship(user1, user2) {
    try {
      const q = query(
        collection(this.db, 'friendships'),
        where('users', 'array-contains', user1.toLowerCase())
      );
      
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (docSnap) => {
        const data = docSnap.data();
        if (data.users.includes(user2.toLowerCase())) {
          await deleteDoc(doc(this.db, 'friendships', docSnap.id));
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error eliminando amistad:', error);
      throw error;
    }
  }
  
  async getUserFriends(username) {
    try {
      // Verificar dominio autorizado
      const currentDomain = window.location.hostname;
      const authorizedDomains = ['thisisfenix.github.io', 'localhost', '127.0.0.1'];
      
      if (!authorizedDomains.includes(currentDomain)) {
        console.warn('Dominio no autorizado para amistades');
        return [];
      }
      
      const q = query(
        collection(this.db, 'friendships'),
        where('users', 'array-contains', username.toLowerCase())
      );
      
      const querySnapshot = await getDocs(q);
      const friends = [];
      
      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        const friendUsername = data.users.find(u => u !== username.toLowerCase());
        
        if (friendUsername) {
          const profile = await this.getUserProfile(friendUsername);
          friends.push({
            username: profile?.username || friendUsername,
            avatar: profile?.avatar || '👤',
            friendsSince: data.timestamp
          });
        }
      }
      
      return friends;
    } catch (error) {
      console.error('Error obteniendo amigos:', error);
      return [];
    }
  }
  
  async getPendingFriendRequests(username) {
    try {
      // Verificar dominio autorizado
      const currentDomain = window.location.hostname;
      const authorizedDomains = ['thisisfenix.github.io', 'localhost', '127.0.0.1'];
      
      if (!authorizedDomains.includes(currentDomain)) {
        console.warn('Dominio no autorizado para solicitudes');
        return [];
      }
      
      const q = query(
        collection(this.db, 'friend_requests'),
        where('to', '==', username),
        where('status', '==', 'pending')
      );
      
      const querySnapshot = await getDocs(q);
      const requests = [];
      
      querySnapshot.forEach((doc) => {
        requests.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return requests;
    } catch (error) {
      console.error('Error obteniendo solicitudes:', error);
      return [];
    }
  }
  
  async getFriendshipStatus(user1, user2) {
    try {
      // Verificar dominio autorizado
      const currentDomain = window.location.hostname;
      const authorizedDomains = ['thisisfenix.github.io', 'localhost', '127.0.0.1'];
      
      if (!authorizedDomains.includes(currentDomain)) {
        console.warn('Dominio no autorizado para verificar amistad');
        return 'none';
      }
      
      // Verificar si son amigos
      const friendshipQuery = query(
        collection(this.db, 'friendships'),
        where('users', 'array-contains', user1.toLowerCase())
      );
      
      const friendshipSnapshot = await getDocs(friendshipQuery);
      for (const doc of friendshipSnapshot.docs) {
        if (doc.data().users.includes(user2.toLowerCase())) {
          return 'friends';
        }
      }
      
      // Verificar solicitudes pendientes
      const sentQuery = query(
        collection(this.db, 'friend_requests'),
        where('from', '==', user1),
        where('to', '==', user2),
        where('status', '==', 'pending')
      );
      
      const sentSnapshot = await getDocs(sentQuery);
      if (!sentSnapshot.empty) {
        return 'pending_sent';
      }
      
      const receivedQuery = query(
        collection(this.db, 'friend_requests'),
        where('from', '==', user2),
        where('to', '==', user1),
        where('status', '==', 'pending')
      );
      
      const receivedSnapshot = await getDocs(receivedQuery);
      if (!receivedSnapshot.empty) {
        return 'pending_received';
      }
      
      return 'none';
    } catch (error) {
      console.error('Error verificando estado de amistad:', error);
      return 'none';
    }
  }

  // ==================== SUBCOMMENTS (REPLIES) ====================
  
  async getSubcomments(parentCommentId) {
    try {
      console.log('🔍 Buscando respuestas para comentario:', parentCommentId);
      
      // Query sin orderBy para evitar necesitar índice compuesto
      const q = query(
        collection(this.db, 'subcomments'),
        where('parentCommentId', '==', parentCommentId)
      );
      
      const querySnapshot = await getDocs(q);
      const subcomments = [];
      
      querySnapshot.forEach((doc) => {
        subcomments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Ordenar en el cliente
      subcomments.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      
      console.log(`✅ Encontradas ${subcomments.length} respuestas`);
      return subcomments;
    } catch (error) {
      console.error('❌ Error obteniendo respuestas:', error);
      return [];
    }
  }
  
  async addSubcomment(drawingId, parentCommentId, subcommentData) {
    try {
      console.log('💬 Agregando respuesta:', { drawingId, parentCommentId, subcommentData });
      
      // Auto-moderación antes de agregar
      if (subcommentData.texto && this.autoModeration) {
        const modResult = await this.autoModeration.moderateContent(
          subcommentData.texto, 
          subcommentData.autor || 'Anónimo', 
          'comment'
        );
        
        if (modResult.blocked) {
          throw new Error(`Respuesta bloqueada: ${modResult.reasons.join(', ')}`);
        }
        
        if (modResult.flagged) {
          subcommentData.flagged = true;
          subcommentData.flagReason = modResult.reasons.join(', ');
        }
        
        subcommentData.texto = this.autoModeration.filterContent(subcommentData.texto);
      }
      
      const subcomment = {
        autor: subcommentData.autor || 'Anónimo',
        texto: subcommentData.texto,
        timestamp: subcommentData.timestamp || Date.now(),
        parentCommentId: parentCommentId,
        drawingId: drawingId,
        domain: window.location.hostname || 'thisisfenix.github.io'
      };
      
      const docRef = await addDoc(collection(this.db, 'subcomments'), subcomment);
      console.log('✅ Respuesta agregada con ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error agregando respuesta:', error);
      throw error;
    }
  }
  
  async deleteSubcomment(subcommentId) {
    try {
      await deleteDoc(doc(this.db, 'subcomments', subcommentId));
      console.log('✅ Respuesta eliminada:', subcommentId);
      return true;
    } catch (error) {
      console.error('❌ Error eliminando respuesta:', error);
      throw error;
    }
  }
  
  // ==================== COMMENTS CON SUBCOMMENTS ====================
  
  async getCommentsWithReplies(drawingId) {
    try {
      console.log('📝 Cargando comentarios con respuestas para:', drawingId);
      
      // Obtener comentarios de la colección separada (sistema nuevo)
      const separateComments = await this.getComments(drawingId);
      
      // Obtener comentarios del documento (sistema viejo) para compatibilidad
      const drawingDoc = await getDoc(doc(this.db, 'dibujos', drawingId));
      const oldCommentsArray = drawingDoc.exists() ? (drawingDoc.data().comments || []) : [];
      
      console.log(`📦 Array viejo tiene ${oldCommentsArray.length} elementos`);
      
      // Separar comentarios principales y respuestas del array viejo
      const oldMainComments = oldCommentsArray.filter(c => !c.parentId);
      const oldReplies = oldCommentsArray.filter(c => c.parentId);
      
      console.log(`👥 ${oldMainComments.length} comentarios principales, ${oldReplies.length} replies en array viejo`);
      
      // Convertir comentarios principales viejos al formato nuevo
      const convertedOldComments = oldMainComments.map(comment => {
        // Usar el ID que ya tiene, o generar uno consistente
        const commentId = comment.id || `comment_${comment.timestamp || Date.now()}`;
        
        // Buscar replies de este comentario en el array viejo usando SU parentId
        const legacyReplies = oldReplies
          .filter(r => r.parentId === commentId)
          .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
          .map(reply => ({
            id: reply.id || `reply_${reply.timestamp || Date.now()}`,
            autor: reply.autor || reply.author || 'Anónimo',
            texto: reply.texto || reply.text || '',
            timestamp: reply.timestamp || Date.now(),
            parentCommentId: commentId,
            drawingId: drawingId
          }));
        
        return {
          id: commentId,
          data: {
            autor: comment.autor || comment.author || 'Anónimo',
            texto: comment.texto || comment.text || '',
            timestamp: comment.timestamp || Date.now()
          },
          replies: legacyReplies
        };
      });
      
      // Combinar comentarios viejos y nuevos
      const allMainComments = [...convertedOldComments, ...separateComments];
      
      // Obtener todas las respuestas de la colección subcomments (solo para comentarios nuevos)
      const qSub = query(
        collection(this.db, 'subcomments'),
        where('drawingId', '==', drawingId)
      );
      
      const subSnapshot = await getDocs(qSub);
      const newSubcomments = [];
      subSnapshot.forEach((doc) => {
        newSubcomments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`🆕 ${newSubcomments.length} replies nuevos en colección subcomments`);
      
      // Ordenar respuestas nuevas en el cliente
      newSubcomments.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      
      // Agregar respuestas nuevas a los comentarios que las tengan
      const commentsWithReplies = allMainComments.map(comment => {
        const newReplies = newSubcomments.filter(sub => sub.parentCommentId === comment.id);
        const allReplies = [...(comment.replies || []), ...newReplies];
        
        if (allReplies.length > 0) {
          console.log(`📝 Comentario ${comment.id} tiene ${allReplies.length} replies totales`);
        }
        
        return {
          ...comment,
          replies: allReplies
        };
      });
      
      // Ordenar todos los comentarios por timestamp
      commentsWithReplies.sort((a, b) => {
        const aTime = a.data?.timestamp || a.timestamp || 0;
        const bTime = b.data?.timestamp || b.timestamp || 0;
        return aTime - bTime;
      });
      
      const totalReplies = commentsWithReplies.reduce((sum, c) => sum + (c.replies?.length || 0), 0);
      console.log(`✅ FINAL: ${commentsWithReplies.length} comentarios principales con ${totalReplies} respuestas totales`);
      return commentsWithReplies;
    } catch (error) {
      console.error('❌ Error obteniendo comentarios con respuestas:', error);
      return [];
    }
  }
  
  // Verificar si un nombre de usuario ya está registrado
  async checkUsernameExists(username) {
    if (!username || !username.trim()) return false;
    
    try {
      const normalizedUsername = username.trim();
      const credentialsRef = doc(this.db, 'userCredentials', normalizedUsername);
      const credentialsSnap = await getDoc(credentialsRef);
      
      return credentialsSnap.exists();
    } catch (error) {
      console.error('Error verificando username:', error);
      return false; // En caso de error, asumir que no existe
    }
  }

  /**
   * Migra los likes de localStorage a Firebase (array likedBy)
   * @param {string} username - Usuario actual
   */
  async migrateLikesToFirebase(username) {
    if (!username || username === 'Anónimo') {
      console.log('⚠️ Usuario anónimo, no se migran likes');
      return { migrated: 0, errors: 0 };
    }

    console.log(`🔄 Iniciando migración de likes para ${username}...`);
    
    const migrationKey = `likes_migrated_${username}`;
    
    // Verificar si ya se migró
    if (localStorage.getItem(migrationKey) === 'true') {
      console.log('✅ Likes ya fueron migrados anteriormente');
      return { migrated: 0, errors: 0, alreadyMigrated: true };
    }

    try {
      // Obtener todos los dibujos
      const allDrawings = await this.getAllDrawings();
      let migrated = 0;
      let errors = 0;

      // Buscar likes en localStorage
      for (const drawing of allDrawings) {
        const storageKey = `liked_${drawing.id}`;
        const isLiked = localStorage.getItem(storageKey) === 'true';

        if (isLiked) {
          try {
            const likedBy = drawing.data.likedBy || [];
            
            // Solo migrar si el usuario NO está ya en likedBy
            if (!likedBy.includes(username)) {
              const docRef = doc(this.db, 'dibujos', drawing.id);
              await updateDoc(docRef, {
                likedBy: arrayUnion(username)
              });
              
              migrated++;
              console.log(`✅ Migrado like en dibujo ${drawing.id}`);
            } else {
              console.log(`⏭️ Like ya existe en Firebase para dibujo ${drawing.id}`);
            }
          } catch (error) {
            console.error(`❌ Error migrando like en dibujo ${drawing.id}:`, error);
            errors++;
          }
        }
      }

      // Marcar como migrado
      localStorage.setItem(migrationKey, 'true');
      
      console.log(`✅ Migración completada: ${migrated} likes migrados, ${errors} errores`);
      return { migrated, errors, total: allDrawings.length };
      
    } catch (error) {
      console.error('❌ Error en migración de likes:', error);
      return { migrated: 0, errors: 1, error: error.message };
    }
  }

  // ==================== ELIMINAR COMENTARIOS Y RESPUESTAS ====================
  
  async deleteComment(drawingId, commentId) {
    try {
      console.log('🗑️ Eliminando comentario:', { drawingId, commentId });
      
      // Eliminar el comentario de la colección separada
      await deleteDoc(doc(this.db, 'comments', commentId));
      
      // También eliminar todas las respuestas de este comentario
      const repliesQuery = query(
        collection(this.db, 'subcomments'),
        where('parentCommentId', '==', commentId)
      );
      
      const repliesSnapshot = await getDocs(repliesQuery);
      const deletePromises = repliesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log(`✅ Comentario eliminado: ${commentId} (+ ${repliesSnapshot.size} respuestas)`);
      return true;
    } catch (error) {
      console.error('❌ Error eliminando comentario:', error);
      throw error;
    }
  }
  
  async deleteReply(drawingId, parentCommentId, replyId) {
    try {
      console.log('🗑️ Eliminando respuesta:', { drawingId, parentCommentId, replyId });
      
      // Eliminar la respuesta de la colección de subcomments
      await deleteDoc(doc(this.db, 'subcomments', replyId));
      
      console.log(`✅ Respuesta eliminada: ${replyId}`);
      return true;
    } catch (error) {
      console.error('❌ Error eliminando respuesta:', error);
      throw error;
    }
  }
}
