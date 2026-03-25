export interface ISRIRetencion {
  codigo: string;
  descripcion: string;
  porcentaje: number;
}

export const CATALOGO_RETENCIONES_RENTA: ISRIRetencion[] = [
  { codigo: '303', descripcion: 'Honorarios profesionales y demás pagos por servicios', porcentaje: 10 },
  { codigo: '304', descripcion: 'Servicios de docencia dictados de forma independiente', porcentaje: 8 },
  { codigo: '308', descripcion: 'Servicios prestados por deportistas, entrenadores y árbitros', porcentaje: 8 },
  { codigo: '312', descripcion: 'Servicios prestados por personas naturales excluyendo profesionales', porcentaje: 2 },
  { codigo: '312A', descripcion: 'Servicios prestados por sociedades', porcentaje: 2.75 },
  { codigo: '310', descripcion: 'Pago de arriendos de bienes inmuebles', porcentaje: 8 },
  { codigo: '314', descripcion: 'Compra de bienes muebles de naturaleza corporal (Naturales)', porcentaje: 1 },
  { codigo: '314A', descripcion: 'Compra de bienes muebles de naturaleza corporal (Sociedades)', porcentaje: 1.75 },
  { codigo: '320', descripcion: 'Honorarios y comisiones - seguros', porcentaje: 8 },
  { codigo: '332', descripcion: 'Otras retenciones', porcentaje: 2.75 },
  // 0% para cuando no aplica retención
  { codigo: '332G', descripcion: 'Compra local a contribuyentes RIMPE - Emprendedores', porcentaje: 1 },
];
