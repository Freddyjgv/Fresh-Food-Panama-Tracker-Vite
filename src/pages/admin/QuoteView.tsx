import React from 'react';

const QuoteMockup = ({ quote }) => {
  const client = quote.client_snapshot || {};
  const product = quote.product_details || {};

  // Tus colores corporativos
  const colors = {
    darkGreen: '#234d23',
    forestGreen: '#277632',
    accentOcre: '#d17711',
    black: '#000000',
    white: '#ffffff'
  };

  return (
    <div className="flex justify-center bg-slate-100 py-10 print:p-0 print:bg-white font-sans">
      {/* Hoja A4 */}
      <div className="bg-white shadow-2xl print:shadow-none overflow-hidden" 
           style={{ width: '210mm', minHeight: '297mm', padding: '15mm', position: 'relative', color: colors.black }}>
        
        {/* ENCABEZADO */}
        <div className="flex justify-between items-start border-b-4 mb-6" style={{ borderColor: colors.forestGreen }}>
          <div className="flex flex-col pb-4">
            <img src="/brand/freshfood_logo.svg" alt="Fresh Food Panama" className="w-52 mb-2" />
            <div className="text-[10px] leading-tight" style={{ color: colors.darkGreen }}>
              <p className="font-bold text-xs">Fresh Food Panamá, C.A.</p>
              <p>RUC: 155XXXX-X-XXXXXX DV XX</p>
              <p>Panamá, Ciudad de Panamá</p>
              <p>Email: exports@freshfoodpanama.com</p>
            </div>
          </div>
          
          <div className="text-right uppercase">
            <h1 className="text-3xl font-black tracking-tighter" style={{ color: colors.darkGreen }}>Cotización</h1>
            <p className="font-bold text-xl" style={{ color: colors.accentOcre }}>{quote.quote_no || 'FFP-001'}</p>
            <div className="mt-2 text-[10px] text-slate-500 normal-case">
              <p>Fecha de emisión: <span className="font-bold">{new Date(quote.created_at).toLocaleDateString()}</span></p>
            </div>
          </div>
        </div>

        {/* INFO CLIENTE E INCOTERMS */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="border-l-4 pl-4" style={{ borderColor: colors.accentOcre }}>
            <h3 className="text-[9px] uppercase tracking-widest font-bold opacity-50">Importador / Destinatario</h3>
            <p className="font-bold text-lg leading-tight" style={{ color: colors.darkGreen }}>{client.name || 'CLIENTE IMPORTADOR'}</p>
            <p className="text-sm">{client.address || 'Address'}</p>
            <p className="text-sm font-bold uppercase">{client.country || 'Destination Country'}</p>
          </div>
          
          <div className="grid grid-cols-2 text-[11px] gap-y-3 p-4 rounded-lg border" style={{ backgroundColor: '#f9faf9', borderColor: colors.forestGreen + '20' }}>
            <div>
              <p className="font-bold opacity-60" style={{ color: colors.darkGreen }}>MODO:</p>
              <p className="uppercase font-semibold">{quote.mode}</p>
            </div>
            <div>
              <p className="font-bold opacity-60" style={{ color: colors.darkGreen }}>INCOTERM:</p>
              <p className="uppercase font-semibold">{quote.terms}</p>
            </div>
            <div>
              <p className="font-bold opacity-60" style={{ color: colors.darkGreen }}>DESTINO:</p>
              <p className="uppercase font-semibold">{quote.destination}</p>
            </div>
            <div>
              <p className="font-bold opacity-60" style={{ color: colors.darkGreen }}>MONEDA:</p>
              <p className="uppercase font-bold" style={{ color: colors.accentOcre }}>{quote.currency}</p>
            </div>
          </div>
        </div>

        {/* TABLA DE PRODUCTOS */}
        <table className="w-full text-sm mb-10 overflow-hidden rounded-t-lg">
          <thead>
            <tr className="text-white uppercase text-[10px] tracking-wider" style={{ backgroundColor: colors.darkGreen }}>
              <th className="py-4 px-4 text-left font-medium">Descripción de Carga</th>
              <th className="py-4 px-2 text-center font-medium">Cajas</th>
              <th className="py-4 px-2 text-center font-medium">Peso Neto</th>
              <th className="py-4 px-2 text-right font-medium">Precio Unit</th>
              <th className="py-4 px-4 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 border-b-2" style={{ borderColor: colors.darkGreen }}>
            <tr className="hover:bg-slate-50">
              <td className="py-5 px-4">
                <p className="font-bold text-base uppercase" style={{ color: colors.forestGreen }}>{product.name || 'Producto'}</p>
                <p className="text-xs text-slate-500 italic">{product.variety || 'Calidad de Exportación Premium'}</p>
              </td>
              <td className="py-5 px-2 text-center text-lg">{quote.boxes}</td>
              <td className="py-5 px-2 text-center text-lg">{quote.weight_kg} Kg</td>
              <td className="py-5 px-2 text-right">{quote.currency} {(quote.total / quote.boxes).toFixed(2)}</td>
              <td className="py-5 px-4 text-right font-bold text-lg">{quote.currency} {Number(quote.total).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        {/* TOTALES Y NOTAS */}
        <div className="flex justify-between items-start">
          <div className="w-1/2 text-[10px] text-slate-500 leading-relaxed pr-10">
            <h4 className="font-bold mb-1" style={{ color: colors.darkGreen }}>TÉRMINOS DE PAGO:</h4>
            <p className="mb-4 uppercase">{quote.payment_terms || 'A convenir'}</p>
            <h4 className="font-bold mb-1" style={{ color: colors.darkGreen }}>OBSERVACIONES:</h4>
            <p>- Cotización basada en disponibilidad de cosecha y logística.</p>
            <p>- Precios incluyen flete interno en Panamá y servicios aduanales.</p>
          </div>
          
          <div className="w-1/3">
            <div className="p-5 rounded-xl shadow-lg text-white flex justify-between items-center" style={{ backgroundColor: colors.accentOcre }}>
              <span className="font-bold uppercase text-[10px] tracking-widest">Total</span>
              <span className="text-2xl font-black tracking-tighter">{quote.currency} {Number(quote.total).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* FIRMAS Y PIE */}
        <div className="absolute bottom-[15mm] left-[15mm] right-[15mm]">
          <div className="grid grid-cols-2 gap-20 text-center text-[10px] font-bold" style={{ color: colors.darkGreen }}>
            <div className="border-t pt-4 opacity-40 uppercase" style={{ borderColor: colors.darkGreen }}>Fresh Food Panamá</div>
            <div className="border-t pt-4 opacity-40 uppercase" style={{ borderColor: colors.darkGreen }}>Aceptado Importador</div>
          </div>
          <div className="mt-8 text-center text-[8px] opacity-40 pt-4 border-t" style={{ borderColor: '#eee' }}>
            Fresh Food Panamá, C.A. • Calidad de Exportación • Panamá • www.freshfoodpanama.com
          </div>
        </div>

      </div>

      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { background: white; -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
};

export default QuoteMockup;