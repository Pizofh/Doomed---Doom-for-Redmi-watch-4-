// SPDX-License-Identifier: GPL-2.0-only
// User-facing outcomes; never render raw protocol or connection data.
export function installationMessage(r){
 if(r.status==='RegisteredInactive'&&r.closeConfirmed&&r.workerExitConfirmed)return 'Instalado. Selecciona la nueva DOOM II en el reloj y pulsa JUGAR. Conserva tu version anterior hasta comprobar el cierre.';
 if(r.batteryPreflight?.level<50)return 'Bateria insuficiente: carga el reloj hasta al menos 50%. No se envio el juego.';
 if(r.devicePreflight&&(r.devicePreflight.expectedModel===false||r.devicePreflight.expectedFirmware===false))return 'Modelo o firmware incompatible. No se envio el juego.';
 if(r.catalogPreflight?.ownIdAbsent===false)return 'Esta version ya esta registrada. No se reemplazo ni borro ninguna esfera.';
 if(r.failureReason==='AuthHmacMismatch'||r.failureReason==='AuthOrQueryRejected')return 'No se pudo autenticar el reloj. Revisa tu configuracion de conexion.';
 if(r.installStatus!==undefined&&r.installStatus!==0)return 'El reloj rechazo la instalacion. No se borraron esferas ni se reintento.';
 return 'El envio no quedo confirmado. Conserva tu esfera actual y el informe local; no se repetira automaticamente.';
}
