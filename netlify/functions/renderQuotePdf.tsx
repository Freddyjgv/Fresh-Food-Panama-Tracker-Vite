import type { Handler } from "@netlify/functions";
import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToStream, Image, Font } from '@react-pdf/renderer';
import path from 'path';
import { 
  sbAdmin, 
  getUserAndProfile, 
  optionsResponse, 
  text,
  commonHeaders 
} from "./_util";

// 1. REGISTRO DE FUENTES (Simulando Poppins con Helvetica/Roboto si no están locales)
// Para Poppins real, necesitarías los archivos .ttf en tu carpeta de assets.
// Usaremos Helvetica como fallback estándar de alta calidad.

const styles = StyleSheet.create({
  page: { 
    padding: '18mm', 
    fontFamily: 'Helvetica', 
    fontSize: 10, 
    color: '#334155', 
    backgroundColor: '#FFFFFF',
    position: 'relative' 
  },
  // HEADER
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    borderBottom: '1 solid #f1f5f9', 
    paddingBottom: 20, 
    marginBottom: 25 
  },
  logo: { width: 150, marginBottom: 8 },
  companyInfo: { fontSize: 8, color: '#64748b', lineHeight: 1.3 },
  companyName: { fontWeight: 'bold', color: '#234d23', fontSize: 9 },
  
  headerRight: { textAlign: 'right' },
  headerTitle: { fontSize: 8, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 },
  quoteCodeBox: { borderRight: '4 solid #d17711', paddingRight: 10 },
  quoteCode: { fontSize: 18, fontWeight: 'bold', color: '#234d23' },
  dates: { marginTop: 10, fontSize: 8, gap: 2 },

  // GRID INFO
  gridContainer: { 
    flexDirection: 'row', 
    border: '1 solid #f1f5f9', 
    borderRadius: 8, 
    overflow: 'hidden', 
    marginBottom: 25 
  },
  gridColLeft: { flex: 1, padding: 15, borderRight: '1 solid #f1f5f9' },
  gridColRight: { flex: 1, padding: 15, backgroundColor: '#f8fafc' },
  sectionLabel: { fontSize: 7, fontWeight: 'bold', color: '#d17711', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  clientName: { fontSize: 11, fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', marginBottom: 4 },
  gridText: { fontSize: 9, color: '#475569', lineHeight: 1.4 },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  gridRowLabel: { color: '#94a3b8', fontSize: 8, textTransform: 'uppercase' },
  gridRowVal: { fontWeight: 'bold', color: '#234d23' },

  // TABLE
  tableHeader: { 
    flexDirection: 'row', 
    borderBottom: '2 solid #f1f5f9', 
    paddingBottom: 8, 
    marginBottom: 10 
  },
  th: { fontSize: 8, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' },
  tableRow: { 
    flexDirection: 'row', 
    paddingVertical: 12, 
    borderBottom: '1 solid #f8fafc' 
  },
  prodName: { fontSize: 10, fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase' },
  prodDetail: { fontSize: 8, color: '#94a3b8', marginTop: 2, fontStyle: 'italic' },

  // FOOTER / TOTALS
  footerSection: { 
    position: 'absolute', 
    bottom: '18mm', 
    left: '18mm', 
    right: '18mm' 
  },
  footerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end',
    borderTop: '1 solid #f1f5f9',
    paddingTop: 20
  },
  termsBox: { maxWidth: '55%' },
  termsTitle: { 
    fontSize: 8, 
    fontWeight: 'bold', 
    color: '#d17711', 
    textTransform: 'uppercase', 
    borderBottom: '1 solid #ffe4cc',
    marginBottom: 6,
    alignSelf: 'flex-start'
  },
  termsText: { fontSize: 8, color: '#64748b', lineHeight: 1.5 },
  
  totalContainer: { textAlign: 'right' },
  totalLabel: { fontSize: 8, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 },
  totalRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'flex-end', gap: 4 },
  currency: { fontSize: 10, color: '#94a3b8', fontWeight: 'medium' },
  totalAmount: { fontSize: 28, fontWeight: 'bold', color: '#234d23' },
  
  signatureRow: { 
    marginTop: 30, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  signatureLine: { 
    width: 150, 
    borderTop: '1 solid #e2e8f0', 
    paddingTop: 5, 
    textAlign: 'center', 
    fontSize: 8, 
    color: '#94a3b8' 
  }
});

const PdfTemplate = ({ data, brandDir }: { data: any, brandDir: string }) => {
  const emission = data.created_at ? new Date(data.created_at) : new Date();
  const expiry = new Date(emission);
  expiry.setDate(expiry.getDate() + 7);

  const formatDate = (date: Date) => 
    date.toLocaleDateString('es-PA', { day: '2-digit', month: 'short', year: 'numeric' });

  const totalVenta = Number(data.total) || 0;
  const quantity = Number(data.boxes) || 0;
  const weight = Number(data.weight_kg) || 0;
  const unitPrice = quantity > 0 ? totalVenta / quantity : 0;
  
  const incoterm = data.totals?.meta?.incoterm || "CIP";
  const destination = data.destination || "Por definir";

  return (
    <Document title={`Cotizacion_${data.quote_number}`}>
      <Page size="LETTER" style={styles.page}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Image src={path.join(brandDir, 'freshfood_logo.png')} style={styles.logo} />
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>Fresh Food Panamá, C.A.</Text>
              <Text>RUC: 2684372-1-845616 DV 30</Text>
              <Text>Vía España, Ciudad de Panamá, Panamá</Text>
              <Text style={{ fontWeight: 'bold' }}>exports@freshfoodpanama.com</Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <Text style={styles.headerTitle}>Cotización de Exportación</Text>
            <View style={styles.quoteCodeBox}>
              <Text style={styles.quoteCode}>#{data.quote_number || 'FFP-2026-XXXX'}</Text>
            </View>
            <View style={styles.dates}>
              <Text><Text style={{ color: '#94a3b8' }}>Emisión:</Text> {formatDate(emission)}</Text>
              <Text><Text style={{ color: '#94a3b8' }}>Expiración:</Text> <Text style={{ color: '#d17711', fontWeight: 'bold' }}>{formatDate(expiry)}</Text></Text>
            </View>
          </View>
        </View>

        {/* GRID INFO */}
        <View style={styles.gridContainer}>
          <View style={styles.gridColLeft}>
            <Text style={styles.sectionLabel}>Consignatario (Cliente)</Text>
            <Text style={styles.clientName}>{data.clients?.legal_name || data.clients?.name || 'N/A'}</Text>
            <View style={styles.gridText}>
              <Text>Tax ID: {data.clients?.tax_id || '—'}</Text>
              <Text>{data.clients?.address || '—'}</Text>
            </View>
          </View>
          
          <View style={styles.gridColRight}>
            <Text style={styles.sectionLabel}>Detalles de Entrega</Text>
            <View style={styles.gridRow}>
              <Text style={styles.gridRowLabel}>Incoterm</Text>
              <Text style={styles.gridRowVal}>{incoterm} ({destination})</Text>
            </View>
            <View style={styles.gridRow}>
              <Text style={styles.gridRowLabel}>Modo</Text>
              <Text style={{ fontSize: 9, fontWeight: 'medium' }}>{data.mode === 'AIR' ? 'Aéreo - Perecederos' : 'Marítimo - Reefer'}</Text>
            </View>
            <View style={[styles.gridRow, { borderTop: '1 solid #e2e8f0', paddingTop: 4, marginTop: 4 }]}>
              <Text style={styles.gridRowLabel}>Moneda</Text>
              <Text style={{ fontSize: 9, fontWeight: 'bold' }}>USD - Dólares</Text>
            </View>
          </View>
        </View>

        {/* TABLE */}
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 3 }]}>Descripción del Producto</Text>
          <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>Cajas</Text>
          <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>Peso (Kg)</Text>
          <Text style={[styles.th, { flex: 1.2, textAlign: 'right' }]}>Precio Unit.</Text>
          <Text style={[styles.th, { flex: 1.5, textAlign: 'right', color: '#234d23' }]}>Subtotal</Text>
        </View>

        <View style={styles.tableRow}>
          <View style={{ flex: 3 }}>
            <Text style={styles.prodName}>{data.products?.name || 'Producto'} {data.product_details?.variety || ''}</Text>
            <Text style={styles.prodDetail}>
              Calidad Exportación • Calibre: {data.product_details?.caliber || 'N/A'} • Brix: {data.product_details?.brix || 'N/A'}
            </Text>
          </View>
          <Text style={{ flex: 1, textAlign: 'center', fontSize: 10 }}>{quantity}</Text>
          <Text style={{ flex: 1, textAlign: 'center', fontSize: 10 }}>{weight.toLocaleString()} kg</Text>
          <Text style={{ flex: 1.2, textAlign: 'right', fontSize: 10 }}>$ {unitPrice.toFixed(2)}</Text>
          <Text style={{ flex: 1.5, textAlign: 'right', fontWeight: 'bold', color: '#234d23', fontSize: 10 }}>
            $ {totalVenta.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        </View>

        {/* FOOTER AREA */}
        <View style={styles.footerSection}>
          <View style={styles.footerTop}>
            <View style={styles.termsBox}>
              <Text style={styles.termsTitle}>Términos y Condiciones</Text>
              <Text style={styles.termsText}>{data.terms || "Validez: 5 días hábiles."}</Text>
            </View>
            
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Monto Total a Pagar</Text>
              <View style={styles.totalRow}>
                <Text style={styles.currency}>USD</Text>
                <Text style={styles.totalAmount}>$ {totalVenta.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
              </View>
            </View>
          </View>

          <View style={styles.signatureRow}>
            <Text style={{ fontSize: 8, color: '#cbd5e1', letterSpacing: 1 }}>Fresh Food Panamá, C.A. • Calidad de Exportación</Text>
            <Text style={styles.signatureLine}>Firma Autorizada</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return optionsResponse();
  try {
    const { user } = await getUserAndProfile(event);
    if (!user) return text(401, "No autorizado");

    const id = event.queryStringParameters?.id;
    if (!id) return text(400, "ID requerido");

    const { data, error } = await sbAdmin
      .from("quotes")
      .select("*, clients(*), products(*)")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return text(404, "Cotización no encontrada");

    const brandDir = path.join(process.cwd(), "public", "brand");
    const stream = await renderToStream(<PdfTemplate data={data} brandDir={brandDir} />);
    
    const chunks: any[] = [];
    for await (const chunk of stream) { chunks.push(chunk); }

    return {
      statusCode: 200,
      headers: { ...commonHeaders, "Content-Type": "application/pdf" },
      body: Buffer.concat(chunks).toString("base64"),
      isBase64Encoded: true,
    };
  } catch (err: any) {
    return text(500, `Error: ${err.message}`);
  }
};