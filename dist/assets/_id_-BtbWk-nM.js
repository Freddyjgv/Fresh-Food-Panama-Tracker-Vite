import{r as e,t}from"./react-DGmkrIjS.js";import{c as n,l as r,t as i}from"./jsx-runtime-CE1G-XVE.js";import{i as a,n as o,r as s,t as c}from"./apiBase-DO2SmTHI.js";import{t as l}from"./arrow-left-C2k-M9mU.js";import{s as u,t as d,u as f}from"./AdminLayout-CqQmaSj8.js";import{t as p}from"./circle-check-big-BcbIjcla.js";import{t as m}from"./circle-plus-D8M-nmVO.js";import{t as h}from"./hash-BczmoZV7.js";import{n as g,t as _}from"./x-Dw5TxDac.js";import{t as v}from"./map-pin-DV0549pI.js";import{t as y}from"./requireAdmin-Ctza0dCo.js";import{t as b}from"./shipmentFlow-642s7Ls8.js";var x=a(`check`,[[`path`,{d:`M20 6 9 17l-5-5`,key:`1gmf2c`}]]),S=a(`clipboard-check`,[[`rect`,{width:`8`,height:`4`,x:`8`,y:`2`,rx:`1`,ry:`1`,key:`tgr4d6`}],[`path`,{d:`M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2`,key:`116196`}],[`path`,{d:`m9 14 2 2 4-4`,key:`df797q`}]]),C=a(`download`,[[`path`,{d:`M12 15V3`,key:`m9g1x1`}],[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`,key:`ih7n3h`}],[`path`,{d:`m7 10 5 5 5-5`,key:`brsn70`}]]),w=a(`image`,[[`rect`,{width:`18`,height:`18`,x:`3`,y:`3`,rx:`2`,ry:`2`,key:`1m3agn`}],[`circle`,{cx:`9`,cy:`9`,r:`2`,key:`af1f0g`}],[`path`,{d:`m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21`,key:`1xmnt7`}]]),T=a(`package-check`,[[`path`,{d:`m16 16 2 2 4-4`,key:`gfu2re`}],[`path`,{d:`M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14`,key:`e7tb2h`}],[`path`,{d:`m7.5 4.27 9 5.15`,key:`1c824w`}],[`polyline`,{points:`3.29 7 12 12 20.71 7`,key:`ousv84`}],[`line`,{x1:`12`,x2:`12`,y1:`22`,y2:`12`,key:`a4e8g8`}]]),E=a(`plane-takeoff`,[[`path`,{d:`M2 22h20`,key:`272qi7`}],[`path`,{d:`M6.36 17.4 4 17l-2-4 1.1-.55a2 2 0 0 1 1.8 0l.17.1a2 2 0 0 0 1.8 0L8 12 5 6l.9-.45a2 2 0 0 1 2.09.2l4.02 3a2 2 0 0 0 2.1.2l4.19-2.06a2.41 2.41 0 0 1 1.73-.17L21 7a1.4 1.4 0 0 1 .87 1.99l-.38.76c-.23.46-.6.84-1.07 1.08L7.58 17.2a2 2 0 0 1-1.22.18Z`,key:`fkigj9`}]]),D=a(`warehouse`,[[`path`,{d:`M18 21V10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v11`,key:`pb2vm6`}],[`path`,{d:`M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 1.132-1.803l7.95-3.974a2 2 0 0 1 1.837 0l7.948 3.974A2 2 0 0 1 22 8z`,key:`doq5xv`}],[`path`,{d:`M6 13h12`,key:`yf64js`}],[`path`,{d:`M6 17h12`,key:`1jwigz`}]]),O=e(t()),k=i();function A(e){if(!e)return`—`;let t=new Date(e);return Number.isNaN(t.getTime())?`—`:t.toLocaleString(`es-PA`,{month:`short`,day:`2-digit`,hour:`2-digit`,minute:`2-digit`})}function j(e){let t=String(e||``).toUpperCase();switch(t){case`CREATED`:return`Reserva de Carga`;case`PACKED`:return`Packing & Calidad OK`;case`DOCS_READY`:return`AWB e Invoices Listos`;case`AT_ORIGIN`:return`Ingreso a Terminal de Carga`;case`IN_TRANSIT`:return`Vuelo en Tránsito`;case`AT_DESTINATION`:return`Arribo a Destino`;default:return t.replaceAll(`_`,` `)}}function M(e){let t=String(e||``).toUpperCase();return t===`PACKED`?(0,k.jsx)(T,{size:16}):t===`DOCS_READY`?(0,k.jsx)(f,{size:16}):t===`AT_ORIGIN`?(0,k.jsx)(D,{size:16}):t===`IN_TRANSIT`?(0,k.jsx)(E,{size:16}):t===`AT_DESTINATION`?(0,k.jsx)(v,{size:16}):(0,k.jsx)(s,{size:16})}function N({milestones:e}){let t=(0,O.useMemo)(()=>e?.length?[...e].sort((e,t)=>{let n=e.created_at?new Date(e.created_at).getTime():0;return(t.created_at?new Date(t.created_at).getTime():0)-n}):[],[e]);return e?.length?(0,k.jsxs)(`div`,{className:`air-timeline`,children:[t.map((e,n)=>{let r=j(e.type),i=n===0,a=n===t.length-1;return(0,k.jsxs)(`div`,{className:`timeline-step ${i?`is-active`:``}`,children:[(0,k.jsxs)(`div`,{className:`indicator-col`,children:[(0,k.jsx)(`div`,{className:`node`,children:i?(0,k.jsx)(x,{size:14,strokeWidth:4}):M(e.type)}),!a&&(0,k.jsx)(`div`,{className:`track-line`})]}),(0,k.jsx)(`div`,{className:`body-col`,children:(0,k.jsxs)(`div`,{className:`status-box`,children:[(0,k.jsxs)(`div`,{className:`status-header`,children:[(0,k.jsxs)(`div`,{className:`text-stack`,children:[(0,k.jsx)(`span`,{className:`label`,children:r}),(0,k.jsx)(`span`,{className:`timestamp`,children:A(e.created_at)})]}),i&&(0,k.jsx)(`span`,{className:`live-pill`,children:`Live Update`})]}),e.note&&(0,k.jsx)(`div`,{className:`note-area`,children:(0,k.jsx)(`p`,{children:e.note})})]})})]},e.id||`${e.type}-${n}`)}),(0,k.jsx)(`style`,{jsx:!0,children:`
        .air-timeline {
          padding: 5px;
          display: flex;
          flex-direction: column;
        }

        .timeline-step {
          display: flex;
          gap: 12px;
        }

        /* --- INDICADORES --- */
        .indicator-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 32px;
          flex-shrink: 0;
        }

        .node {
          width: 28px;
          height: 28px;
          border-radius: 8px; /* Square rounded para look más "tech" */
          background: white;
          border: 2px solid #e2e8f0;
          display: grid;
          place-items: center;
          color: #94a3b8;
          z-index: 2;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .is-active .node {
          background: #0f172a; /* Azul muy oscuro para contraste premium */
          border-color: #0f172a;
          color: #22c55e; /* Verde brillante para el check */
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
        }

        .track-line {
          width: 2px;
          flex-grow: 1;
          background: #f1f5f9;
          margin: 4px 0;
        }

        /* --- TARJETAS --- */
        .body-col {
          flex-grow: 1;
          padding-bottom: 20px;
        }

        .status-box {
          background: white;
          border: 1px solid #f1f5f9;
          border-radius: 12px;
          padding: 12px;
          transition: 0.2s;
        }

        .is-active .status-box {
          border-color: #e2e8f0;
          background: linear-gradient(to right, #ffffff, #f8fafc);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .text-stack {
          display: flex;
          flex-direction: column;
        }

        .label {
          font-weight: 800;
          font-size: 13px;
          color: #0f172a;
          letter-spacing: -0.3px;
        }

        .timestamp {
          font-size: 10px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .live-pill {
          font-size: 9px;
          font-weight: 900;
          background: #dcfce7;
          color: #16a34a;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          animation: pulse 2s infinite;
        }

        .note-area {
          margin-top: 8px;
          padding: 8px;
          background: #f8fafc;
          border-radius: 6px;
          font-size: 12px;
          color: #475569;
          line-height: 1.4;
          border-left: 3px solid #e2e8f0;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `})]}):(0,k.jsxs)(`div`,{style:{padding:`40px 20px`,textAlign:`center`,background:`#f8fafc`,borderRadius:`12px`,border:`1px dashed #e2e8f0`},children:[(0,k.jsx)(g,{size:24,style:{margin:`0 auto 10px`,color:`#94a3b8`}}),(0,k.jsx)(`p`,{style:{fontSize:`13px`,fontWeight:600,color:`#64748b`},children:`Sincronizando flujo logístico...`})]})}var P=[{v:`invoice`,l:`Factura`},{v:`packing_list`,l:`Packing list`},{v:`awb`,l:`AWB (guía aérea)`},{v:`phytosanitary`,l:`Certificado fitosanitario`},{v:`eur1`,l:`EUR1`},{v:`export_declaration`,l:`Decl. Exportación`},{v:`quality_report`,l:`Informe de Calidad`}],F=[`PACKED`,`DOCS_READY`,`AT_ORIGIN`,`IN_TRANSIT`,`AT_DESTINATION`];function I(){let{id:e}=r(),t=n(),[i,a]=(0,O.useState)(!1),[s,g]=(0,O.useState)(null),[v,x]=(0,O.useState)(!0),[T,E]=(0,O.useState)(!1),[D,A]=(0,O.useState)(``),[j,M]=(0,O.useState)(``),[I,L]=(0,O.useState)(``),[R,z]=(0,O.useState)(``),[B,V]=(0,O.useState)(``),[H,U]=(0,O.useState)(null),W=(e,t=`success`)=>{U({msg:e,type:t}),setTimeout(()=>U(null),3e3)},G=(0,O.useCallback)(async e=>{x(!0);try{let{data:{session:t}}=await o.auth.getSession(),n=await fetch(`${c()}/.netlify/functions/getShipment?id=${e}&mode=admin`,{headers:{Authorization:`Bearer ${t?.access_token}`}});if(!n.ok)throw Error(`Fetch error`);let r=await n.json();g(r),M(r.flight_number||``),L(r.awb||``),z(r.calibre||``),V(r.color||``)}catch{W(`Error al cargar embarque`,`error`)}finally{x(!1)}},[]);(0,O.useEffect)(()=>{(async()=>{(await y()).ok&&(a(!0),e&&G(e))})()},[e,G]);let K=(0,O.useMemo)(()=>s?.milestones?s.milestones.map(e=>({id:e.id,type:e.type,created_at:e.at,note:e.note,author_name:e.actor_email||`Admin`})):[],[s?.milestones]),q=async t=>{E(!0);try{let{data:{session:n}}=await o.auth.getSession();(await fetch(`${c()}/.netlify/functions/updateMilestone`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${n?.access_token}`},body:JSON.stringify({shipmentId:s?.id,type:t,note:D.trim(),flight_number:j.trim(),awb:I.trim(),calibre:R.trim(),color:B.trim()})})).ok&&(W(`Estado actualizado`),A(``),e&&G(e))}catch{W(`Error al actualizar`,`error`)}finally{E(!1)}};async function J(e,t,n){if(s){E(!0);try{let{data:{session:r}}=await o.auth.getSession(),i=r?.access_token,a=e===`doc`?`shipment-docs`:`shipment-photos`,{uploadUrl:l,path:u}=await(await fetch(`${c()}/.netlify/functions/getUploadUrl`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${i}`},body:JSON.stringify({bucket:a,shipmentCode:s.code,filename:t.name})})).json();await fetch(l,{method:`PUT`,body:t}),await fetch(`${c()}/.netlify/functions/registerFile`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${i}`},body:JSON.stringify({shipmentId:s.id,kind:e,doc_type:n,filename:t.name,storage_path:u,bucket:a})}),W(`Archivo subido`),G(s.id)}catch{W(`Error de subida`,`error`)}finally{E(!1)}}}async function Y(t){if(confirm(`¿Borrar archivo?`)){E(!0);try{let{data:{session:n}}=await o.auth.getSession();await fetch(`${c()}/.netlify/functions/deleteFile`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${n?.access_token}`},body:JSON.stringify({fileId:t,shipmentId:s?.id})}),W(`Archivo eliminado`),e&&G(e)}finally{E(!1)}}}async function X(e){let{data:{session:t}}=await o.auth.getSession(),{url:n}=await(await fetch(`${c()}/.netlify/functions/getDownloadUrl?fileId=${e}`,{headers:{Authorization:`Bearer ${t?.access_token}`}})).json();window.open(n,`_blank`)}return!i||v?(0,k.jsx)(`div`,{className:`loader-center`,children:(0,k.jsx)(u,{className:`animate-spin`})}):(0,k.jsxs)(d,{title:`Detalle ${s?.code}`,children:[H&&(0,k.jsx)(`div`,{className:`toast-alert ${H.type}`,children:H.msg}),(0,k.jsxs)(`div`,{className:`admin-page`,children:[(0,k.jsxs)(`header`,{className:`header-shipment`,children:[(0,k.jsxs)(`div`,{className:`h-main`,children:[(0,k.jsxs)(`button`,{onClick:()=>t(-1),className:`back-btn-clear`,children:[(0,k.jsx)(l,{size:16}),` Volver`]}),(0,k.jsxs)(`h1`,{children:[s?.product_name,` `,(0,k.jsx)(`small`,{children:s?.product_variety})]}),(0,k.jsxs)(`div`,{className:`meta`,children:[(0,k.jsxs)(`span`,{className:`badge-code`,children:[(0,k.jsx)(h,{size:12}),` `,s?.code]}),(0,k.jsxs)(`span`,{children:[`Cliente: `,(0,k.jsx)(`strong`,{children:s?.client_name})]}),(0,k.jsxs)(`span`,{children:[`Destino: `,(0,k.jsx)(`strong`,{children:s?.destination})]})]})]}),(0,k.jsx)(`div`,{className:`h-status`,children:(0,k.jsx)(`div`,{className:`status-pill`,children:b(s.status)})})]}),(0,k.jsxs)(`div`,{className:`detail-grid`,children:[(0,k.jsxs)(`div`,{className:`left-pane`,children:[(0,k.jsxs)(`section`,{className:`admin-card`,children:[(0,k.jsxs)(`div`,{className:`card-header`,children:[(0,k.jsx)(S,{size:18}),` `,(0,k.jsx)(`h3`,{children:`Gestión de Hitos`})]}),(0,k.jsxs)(`div`,{className:`form-box`,children:[(0,k.jsx)(`textarea`,{placeholder:`Nota para el hito...`,value:D,onChange:e=>A(e.target.value)}),(0,k.jsxs)(`div`,{className:`inputs-row`,children:[(0,k.jsxs)(`div`,{className:`field`,children:[(0,k.jsx)(`label`,{children:`Vuelo`}),(0,k.jsx)(`input`,{value:j,onChange:e=>M(e.target.value)})]}),(0,k.jsxs)(`div`,{className:`field`,children:[(0,k.jsx)(`label`,{children:`AWB`}),(0,k.jsx)(`input`,{value:I,onChange:e=>L(e.target.value)})]}),(0,k.jsxs)(`div`,{className:`field`,children:[(0,k.jsx)(`label`,{children:`Cal/Col`}),(0,k.jsxs)(`div`,{className:`dual`,children:[(0,k.jsx)(`input`,{placeholder:`Cal`,value:R,onChange:e=>z(e.target.value)}),(0,k.jsx)(`input`,{placeholder:`Col`,value:B,onChange:e=>V(e.target.value)})]})]})]}),(0,k.jsx)(`div`,{className:`steps-grid`,children:F.map(e=>(0,k.jsx)(`button`,{className:`step-btn ${s?.status===e?`active`:``}`,onClick:()=>q(e),disabled:T,children:b(e)},e))})]})]}),(0,k.jsxs)(`section`,{className:`admin-card spacing`,children:[(0,k.jsxs)(`div`,{className:`card-header-between`,children:[(0,k.jsxs)(`div`,{className:`row-gap`,children:[(0,k.jsx)(w,{size:18}),` `,(0,k.jsx)(`h3`,{children:`Fotos de Carga`})]}),(0,k.jsxs)(`label`,{className:`upload-btn-photo`,children:[(0,k.jsx)(m,{size:14}),` Subir Foto`,(0,k.jsx)(`input`,{type:`file`,hidden:!0,accept:`image/*`,onChange:e=>e.target.files?.[0]&&J(`photo`,e.target.files[0])})]})]}),(0,k.jsx)(`div`,{className:`photos-grid`,children:s?.photos?.map(e=>(0,k.jsxs)(`div`,{className:`photo-item`,children:[(0,k.jsx)(`img`,{src:e.url||``,alt:`Evidencia`,className:`photo-img-main`}),(0,k.jsxs)(`div`,{className:`photo-overlay`,children:[(0,k.jsx)(`button`,{onClick:()=>X(e.id),children:(0,k.jsx)(C,{size:16})}),(0,k.jsx)(`button`,{onClick:()=>Y(e.id),className:`danger`,children:(0,k.jsx)(_,{size:16})})]})]},e.id))})]})]}),(0,k.jsxs)(`aside`,{className:`right-pane`,children:[(0,k.jsxs)(`section`,{className:`admin-card`,children:[(0,k.jsxs)(`div`,{className:`card-header`,children:[(0,k.jsx)(f,{size:18}),` `,(0,k.jsx)(`h3`,{children:`Documentos`})]}),(0,k.jsx)(`div`,{className:`docs-stack`,children:P.map(e=>{let t=s?.documents?.find(t=>t.doc_type===e.v);return(0,k.jsxs)(`div`,{className:`doc-item ${t?`exists`:``}`,children:[(0,k.jsx)(`span`,{className:`doc-label`,children:e.l}),(0,k.jsx)(`div`,{className:`doc-btns`,children:t?(0,k.jsxs)(k.Fragment,{children:[(0,k.jsx)(`button`,{onClick:()=>X(t.id),children:(0,k.jsx)(C,{size:14})}),(0,k.jsx)(`button`,{onClick:()=>Y(t.id),className:`text-red`,children:(0,k.jsx)(_,{size:14})})]}):(0,k.jsxs)(`label`,{className:`btn-up-small`,children:[(0,k.jsx)(m,{size:14}),(0,k.jsx)(`input`,{type:`file`,hidden:!0,onChange:t=>t.target.files?.[0]&&J(`doc`,t.target.files[0],e.v)})]})})]},e.v)})})]}),(0,k.jsxs)(`section`,{className:`admin-card spacing`,children:[(0,k.jsxs)(`div`,{className:`card-header`,children:[(0,k.jsx)(p,{size:18}),` `,(0,k.jsx)(`h3`,{children:`Timeline`})]}),(0,k.jsx)(N,{milestones:K})]})]})]})]}),(0,k.jsx)(`style`,{children:`
        .admin-page { padding: 20px; max-width: 1400px; margin: 0 auto; }
        .header-shipment { background: #fff; padding: 30px; border-radius: 20px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; }
        .back-btn-clear { background:none; border:none; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #64748b; margin-bottom: 15px; cursor:pointer; }
        .header-shipment h1 { font-size: 26px; font-weight: 900; margin: 0; color: #1e293b; }
        .header-shipment small { color: #94a3b8; font-weight: 400; }
        .meta { display: flex; gap: 20px; margin-top: 10px; font-size: 14px; color: #64748b; }
        .badge-code { background: #eff6ff; color: #2563eb; padding: 2px 8px; border-radius: 6px; font-weight: 800; display: flex; align-items: center; gap: 4px; }
        .status-pill { background: #1e293b; color: white; padding: 8px 16px; border-radius: 30px; font-weight: 700; font-size: 13px; }
        
        .detail-grid { display: grid; grid-template-columns: 1fr 380px; gap: 25px; }
        .admin-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 20px; }
        .card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; color: #1e293b; }
        .card-header-between { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .card-header h3 { font-size: 14px; font-weight: 900; text-transform: uppercase; margin: 0; }
        
        .form-box textarea { width: 100%; height: 80px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 15px; font-family: inherit; }
        .inputs-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px; }
        .field label { display: block; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px; }
        .field input { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; }
        .dual { display: flex; gap: 5px; }
        .steps-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
        .step-btn { padding: 12px 5px; font-size: 10px; font-weight: 800; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; transition: 0.2s; }
        .step-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .step-btn.active { background: #16a34a; color: #fff; border-color: #16a34a; }
        
        .photos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 15px; }
        .photo-item { position: relative; aspect-ratio: 1; border-radius: 12px; overflow: hidden; background: #f1f5f9; }
        .photo-img-main { width: 100%; height: 100%; object-fit: cover; }
        .photo-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; gap: 8px; align-items: center; justify-content: center; opacity: 0; transition: 0.2s; }
        .photo-item:hover .photo-overlay { opacity: 1; }
        .photo-overlay button { background: #fff; border: none; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .photo-overlay button.danger { color: #dc2626; }
        
        .docs-stack { display: flex; flex-direction: column; gap: 10px; }
        .doc-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; border-radius: 12px; background: #f8fafc; border: 1px solid #f1f5f9; }
        .doc-item.exists { background: #f0fdf4; border-color: #dcfce7; }
        .doc-label { font-size: 13px; font-weight: 700; color: #1e293b; }
        .doc-btns { display: flex; gap: 8px; }
        .doc-btns button { background: none; border: none; cursor: pointer; color: #64748b; }
        .doc-btns button.text-red { color: #dc2626; }
        .btn-up-small { color: #2563eb; cursor: pointer; }
        
        .loader-center { height: 100vh; display: grid; place-items: center; }
        .toast-alert { position: fixed; top: 20px; right: 20px; padding: 15px 25px; border-radius: 12px; background: #1e293b; color: white; font-weight: 700; z-index: 1000; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .spacing { margin-top: 25px; }
        .row-gap { display: flex; align-items: center; gap: 10px; }
        .upload-btn-photo { font-size: 12px; font-weight: 700; color: #2563eb; cursor: pointer; display: flex; align-items: center; gap: 5px; }
      `})]})}export{I as default};