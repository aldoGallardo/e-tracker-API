export interface Activity {
  id: string; // ID del documento en Firestore
  branchId: string; // ID de la sucursal o branch
  date: Date; // Fecha de la actividad
  startTime: number; // Hora de inicio (puede ser un timestamp o similar)
  endTime: number; // Hora de fin (puede ser un timestamp o similar)
  isOnTime: boolean; // Indica si la actividad se completó a tiempo
  isDelayed: boolean; // Indica si la actividad se retrasó
  isReported: boolean; // Indica si la actividad fue reportada
  [key: string]: any; // Otros posibles campos adicionales en tus documentos
}
