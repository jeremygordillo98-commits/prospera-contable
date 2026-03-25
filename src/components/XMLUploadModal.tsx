import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Save,
  Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// Se eliminaron variables importadas sin uso, corrigiendo así errores de linter en líneas pasadas.
import { type SRIInvoiceData, parseSRIXML } from '../utils/sriParser';
import { supabase } from '../services/supabase';
import { CATALOGO_RETENCIONES_RENTA } from '../utils/sriCatalog';

interface XMLUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const XMLUploadModal: React.FC<XMLUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState<SRIInvoiceData | null>(null);
  
  // Estado para concepto de retención IR
  const [retencionCodigo, setRetencionCodigo] = useState(CATALOGO_RETENCIONES_RENTA[0].codigo);
  
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const retencionSeleccionada = CATALOGO_RETENCIONES_RENTA.find(r => r.codigo === retencionCodigo) || CATALOGO_RETENCIONES_RENTA[0];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParsing(true);
    setParsedData(null);
    setStatus('idle');

    try {
      const text = await selectedFile.text();
      const data = await parseSRIXML(text);
      if (data) {
        setParsedData(data);
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setParsing(false);
    }
  };

  const handleSave = async () => {
    if (!parsedData) return;
    setSaving(true);

    try {
      // 1. Verificar o crear la entidad (Proveedor)
      let { data: entidad, error: eError } = await supabase
        .from('entidades')
        .select('id')
        .eq('ruc_cedula', parsedData.rucEmisor)
        .single();
      
      if (eError || !entidad) {
        const { data: newEntidad, error: nError } = await supabase
          .from('entidades')
          .insert({
            ruc_cedula: parsedData.rucEmisor,
            razon_social: parsedData.razonSocialEmisor,
            tipo_entidad: 'Proveedor'
          })
          .select()
          .single();
        
        if (nError) throw nError;
        entidad = newEntidad;
      }

      // 2. Crear la transacción cabecera
      const { data: transaccion, error: tError } = await supabase
        .from('transacciones')
        .insert({
          fecha: new Date(parsedData.fechaEmision.split('/').reverse().join('-')), // DD/MM/YYYY a YYYY-MM-DD
          concepto: `Compra: ${parsedData.razonSocialEmisor} - Ret (${retencionSeleccionada.codigo})`,
          tipo_comprobante: 'Factura',
          numero_comprobante: parsedData.numeroComprobante,
          id_entidad: entidad?.id,
          xml_referencia: parsedData.claveAcceso
        })
        .select()
        .single();
      
      if (tError) throw tError;

      // 3. Construir la matriz de retenciones para el ATS
      const retencionesAplicadas = [];
      const valorRetenido = (parsedData.baseImponible * retencionSeleccionada.porcentaje) / 100;
      
      if (valorRetenido > 0) {
        retencionesAplicadas.push({
          codigo: retencionSeleccionada.codigo,
          porcentaje: retencionSeleccionada.porcentaje,
          base: parsedData.baseImponible,
          valor: parseFloat(valorRetenido.toFixed(2)),
          tipo: 'RENTA'
        });
      }

      // 4. Crear el documento SRI
      await supabase.from('documentos_sri').insert({
        id_transaccion: transaccion.id,
        clave_acceso_xml: parsedData.claveAcceso,
        base_12: parsedData.baseImponible,
        monto_iva: parsedData.iva,
        retenciones_aplicadas: retencionesAplicadas // 👈 ¡Se guarda la retención dinámicamente!
      });

      // 5. Futuro: Aquí crearíamos los asientos de partida doble en "movimientos" descontando la retención del pasivo final.

      setStatus('success');
      setTimeout(() => {
        onSuccess();
        onClose();
        setFile(null);
        setParsedData(null);
        setStatus('idle');
      }, 1500);

    } catch (error) {
      console.error("Save error:", error);
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-lg p-0 overflow-hidden"
      >
        <div className="p-6 border-b border-white/10 flex-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Upload size={20} className="text-primary" /> Multi-Carga SRI
          </h3>
          <button onClick={onClose} className="text-sec hover:text-white"><X size={24} /></button>
        </div>

        <div className="p-8">
          {!file ? (
            <div 
              onClick={() => document.getElementById('xmlInput')?.click()}
              className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <Upload className="mx-auto mb-4 text-primary opacity-50" size={48} />
              <p className="font-semibold text-lg">Arrastra archivos .xml o haz clic</p>
              <p className="text-sec text-sm mt-2">Facturas electrónicas descargadas del SRI</p>
              <input 
                id="xmlInput" 
                type="file" 
                accept=".xml" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <FileText className="text-primary" />
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold truncate">{file.name}</p>
                  <p className="text-xs text-sec">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                {parsing && <Loader2 className="animate-spin text-primary" size={20} />}
                {parsedData && <CheckCircle2 className="text-success" size={20} />}
              </div>

              <AnimatePresence>
                {parsedData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 text-sm"
                  >
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sec">Emisor:</span>
                        <span className="font-semibold text-right">{parsedData.razonSocialEmisor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sec">Fecha:</span>
                        <span className="font-semibold">{parsedData.fechaEmision}</span>
                      </div>
                    </div>

                    {/* NUEVO: SELECCIÓN DE RETENCIÓN */}
                    <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 space-y-3">
                      <label className="flex items-center gap-2 font-semibold text-primary mb-2">
                        <Percent size={16} /> Concepto de Retención (IR)
                      </label>
                      <select 
                        className="w-full bg-black/20 border border-primary/30 rounded-lg p-2 text-white outline-none"
                        value={retencionCodigo}
                        onChange={(e) => setRetencionCodigo(e.target.value)}
                      >
                        {CATALOGO_RETENCIONES_RENTA.map(r => (
                          <option key={r.codigo} value={r.codigo} style={{ background: '#1e293b' }}>
                            {r.codigo} - {r.descripcion} ({r.porcentaje}%)
                          </option>
                        ))}
                      </select>

                      <div className="flex justify-between border-t border-primary/20 pt-2 mt-2">
                        <span className="text-sec">Base 12% / 0%:</span>
                        <span className="font-semibold">${parsedData.baseImponible.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sec">IVA:</span>
                        <span className="font-semibold">${parsedData.iva.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-warning font-semibold">
                        <span>Retención Calculada ({retencionSeleccionada.porcentaje}%):</span>
                        <span>- ${((parsedData.baseImponible * retencionSeleccionada.porcentaje) / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-base border-t border-white/10 pt-2">
                        <span className="font-bold">Total a Pagar (Neto):</span>
                        <span className="font-extrabold text-primary">
                          ${(parsedData.total - ((parsedData.baseImponible * retencionSeleccionada.porcentaje) / 100)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {status === 'error' && (
                <div className="flex items-center gap-2 text-error text-sm bg-error/10 p-3 rounded-lg border border-error/20">
                  <AlertCircle size={16} /> Error al procesar el archivo. Formato no soportado.
                </div>
              )}

              <footer className="pt-4 flex gap-4">
                <button 
                  onClick={() => setFile(null)} 
                  className="btn glass-card flex-1 justify-center"
                >Reintentar</button>
                <button 
                  disabled={!parsedData || saving} 
                  onClick={handleSave}
                  className="btn btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Guardar Asiento</>}
                </button>
              </footer>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
