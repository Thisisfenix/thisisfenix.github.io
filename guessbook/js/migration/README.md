# 🔐 Sistema de Migración de Cuentas

Esta carpeta contiene los archivos relacionados con la migración de usuarios del sistema legacy (Firestore Auth) al nuevo sistema seguro (Firebase Authentication).

## ⚠️ Importante

**NO MODIFICAR** estos archivos a menos que sea absolutamente necesario. El sistema de migración es crítico para la seguridad y la integridad de las cuentas de usuario.

## Archivos

### `account-migration.js`
Sistema completo de migración que:
- Crea cuentas en Firebase Authentication
- Migra el perfil completo (avatar, banner, bio, etc.)
- Migra todos los dibujos del usuario
- Migra likes y comentarios
- Actualiza referencias de username a UID

### `migration-detector.js`
Detector automático que:
- Identifica usuarios legacy
- Muestra banner de migración
- Monitorea el estado de la sesión

## 🚀 Uso

Una vez que todos los usuarios hayan migrado al nuevo sistema, estos archivos pueden ser archivados o eliminados.

## 🔒 Seguridad

Estos archivos manejan:
- Creación de cuentas en Firebase Auth
- Transferencia de datos sensibles
- Actualización de credenciales

**Cualquier modificación debe ser revisada cuidadosamente.**

---

*Última actualización: Octubre 2026*
