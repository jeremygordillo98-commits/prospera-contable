import { XMLParser } from 'fast-xml-parser';

export interface SRIInvoiceData {
  rucEmisor: string;
  razonSocialEmisor: string;
  rucReceptor: string;
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
      attributeNamePrefix: "@_",
      parseTagValue: true,
      trimValues: true,
    });
    
    let jsonObj = parser.parse(xmlContent);
    
    // El SRI a veces devuelve la factura en un nodo 'factura' o dentro de un 'autorizacion'
    // En las autorizaciones del SRI, el comprobante real viene en CDATA (un string XML)
    let factura: any;
    
    if (jsonObj.autorizacion && jsonObj.autorizacion.comprobante) {
      const comprobanteXML = jsonObj.autorizacion.comprobante;
      // Si comprobante es un string con XML, lo parseamos de nuevo
      if (typeof comprobanteXML === 'string') {
        factura = parser.parse(comprobanteXML).factura;
      } else {
        factura = comprobanteXML.factura;
      }
    } else if (jsonObj.factura) {
      factura = jsonObj.factura;
    } else {
      // Intento final para ver si está en la raíz o en algún otro nodo
      factura = jsonObj;
    }

    if (!factura || !factura.infoTributaria) {
        console.error("No se encontró nodo infoTributaria en el XML");
        return null;
    }

    const infoT = factura.infoTributaria;
    const infoF = factura.infoFactura;

    // Buscar el IVA en totalImpuestos
    let base12 = 0;
    let iva = 0;
    
    if (infoF.totalConImpuestos?.totalImpuesto) {
      const impuestos = Array.isArray(infoF.totalConImpuestos.totalImpuesto) 
        ? infoF.totalConImpuestos.totalImpuesto 
        : [infoF.totalConImpuestos.totalImpuesto];
      
      // Código 2 = IVA
      const ivaImpuesto = impuestos.find((imp: any) => imp.codigo === '2' || imp.codigo === 2);
      if (ivaImpuesto) {
        base12 = parseFloat(ivaImpuesto.baseImponible || 0);
        iva = parseFloat(ivaImpuesto.valor || 0);
      }
    }

    return {
      rucEmisor: infoT.ruc,
      razonSocialEmisor: infoT.razonSocial,
      rucReceptor: infoF.identificacionComprador,
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
