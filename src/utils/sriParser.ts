import { XMLParser } from 'fast-xml-parser';

export interface SRIInvoiceData {
  rucEmisor: string;
  razonSocialEmisor: string;
  claveAcceso: string;
  fechaEmision: string;
  baseImponible: number;
  iva: number;
  total: number;
  numeroComprobante: string;
}

export const parseSRIXML = async (xmlContent: string): Promise<SRIInvoiceData | null> => {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    
    const jsonObj = parser.parse(xmlContent);
    
    // El SRI a veces devuelve la factura en un nodo 'factura' o dentro de un 'autorizacion'
    const factura = jsonObj.factura || jsonObj.autorizacion?.comprobante || jsonObj;
    
    if (!factura.infoTributaria) return null;

    const infoT = factura.infoTributaria;
    const infoF = factura.infoFactura;

    // Buscar el IVA 12% o 15% en totalImpuestos
    let base12 = 0;
    let iva = 0;
    if (infoF.totalConImpuestos?.totalImpuesto) {
      const impuestos = Array.isArray(infoF.totalConImpuestos.totalImpuesto) 
        ? infoF.totalConImpuestos.totalImpuesto 
        : [infoF.totalConImpuestos.totalImpuesto];
      
      const ivaImpuesto = impuestos.find((imp: any) => imp.codigo === '2'); // Código 2 = IVA
      if (ivaImpuesto) {
        base12 = parseFloat(ivaImpuesto.baseImponible || 0);
        iva = parseFloat(ivaImpuesto.valor || 0);
      }
    }

    return {
      rucEmisor: infoT.ruc,
      razonSocialEmisor: infoT.razonSocial,
      claveAcceso: infoT.claveAcceso,
      fechaEmision: infoF.fechaEmision,
      baseImponible: base12 || parseFloat(infoF.totalSinImpuestos || 0),
      iva: iva,
      total: parseFloat(infoF.importeTotal || 0),
      numeroComprobante: `${infoT.estab}-${infoT.ptoEmi}-${infoT.secuencial}`
    };
  } catch (error) {
    console.error("Error parsing SRI XML:", error);
    return null;
  }
};
