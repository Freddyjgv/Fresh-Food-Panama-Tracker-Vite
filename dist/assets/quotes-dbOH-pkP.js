import{r as e,t}from"./react-DGmkrIjS.js";import{c as n,t as r}from"./jsx-runtime-CE1G-XVE.js";import{n as i,t as a}from"./apiBase-DO2SmTHI.js";import{a as o,d as s,f as c,i as l,t as u,u as d}from"./AdminLayout-CqQmaSj8.js";import{t as f}from"./arrow-up-narrow-wide-CBUnjkGl.js";import{t as p}from"./circle-check-big-BcbIjcla.js";import{t as m}from"./circle-plus-D8M-nmVO.js";import{t as h}from"./x-Dw5TxDac.js";import{n as g}from"./LocationSelector-BJyPe1uu.js";import{t as _}from"./trending-up-DcBQlSM3.js";import{t as v}from"./QuickQuoteModal-9pMzu2IK.js";import{t as y}from"./requireAdmin-Ctza0dCo.js";var b=e(t()),x=r(),S=e=>{if(!e)return`📍`;let t=e.toUpperCase(),n={AMSTERDAM:`🇳🇱`,HOLANDA:`🇳🇱`,NETHERLANDS:`🇳🇱`,PARIS:`🇫🇷`,FRANCIA:`🇫🇷`,BELGICA:`🇧🇪`,BELGIUM:`🇧🇪`,POLONIA:`🇵🇱`,POLAND:`🇵🇱`,PANAMA:`🇵🇦`,PTY:`🇵🇦`,ESPAÑA:`🇪🇸`,MADRID:`🇪🇸`,BARAJAS:`🇪🇸`,USA:`🇺🇸`,MIAMI:`🇺🇸`,COLOMBIA:`🇨🇴`,BOGOTA:`🇨🇴`},r=Object.keys(n).find(e=>t.includes(e));return r?n[r]:`✈️`},C=e=>({draft:`Borrador`,sent:`Enviada`,approved:`Aprobada`,rejected:`Rechazada`})[e.toLowerCase()]||e,w=()=>(0,x.jsxs)(`div`,{className:`quote-row-item skeleton-row`,children:[(0,x.jsxs)(`div`,{className:`col-ident`,children:[(0,x.jsx)(`div`,{className:`skel-line w50`}),(0,x.jsx)(`div`,{className:`skel-line w80`}),(0,x.jsx)(`div`,{className:`skel-pill w40`,style:{height:`14px`,marginTop:`4px`}})]}),(0,x.jsx)(`div`,{className:`col-client`,children:(0,x.jsx)(`div`,{className:`skel-line w100`})}),(0,x.jsx)(`div`,{className:`col-route`,children:(0,x.jsx)(`div`,{className:`skel-pill w100`,style:{height:`28px`}})}),(0,x.jsx)(`div`,{className:`col-amount`,children:(0,x.jsx)(`div`,{className:`skel-line w60`,style:{marginLeft:`auto`}})}),(0,x.jsx)(`div`,{className:`col-status`,children:(0,x.jsx)(`div`,{className:`skel-pill w70`})})]});function T(){let e=n(),[t,r]=(0,b.useState)(!0),[C,T]=(0,b.useState)([]),[D,O]=(0,b.useState)(!0),[k,A]=(0,b.useState)(null),[j,M]=(0,b.useState)(!1),[N,P]=(0,b.useState)(``),[F,I]=(0,b.useState)(``),[L,R]=(0,b.useState)(`desc`),z=(0,b.useMemo)(()=>{let e=C.filter(e=>e.status===`approved`),t=C.reduce((e,t)=>e+(Number(t.total||t.total_amount)||0),0);return{countApproved:e.length,pipeline:t,countTotal:C.length}},[C]),B=(0,b.useCallback)(async()=>{O(!0),A(null);try{let{data:{session:t}}=await i.auth.getSession();if(!t)return e(`/admin/login`);let n=new URLSearchParams;n.set(`dir`,L),n.set(`sortField`,`created_at`),F&&n.set(`status`,F),N.trim()&&n.set(`q`,N.trim());let r=`${a()}/.netlify/functions/listQuotes?${n.toString()}&t=${new Date().getTime()}`,o=await fetch(r,{headers:{Authorization:`Bearer ${t.access_token}`}});if(!o.ok)throw Error(`Error HTTP: ${o.status}`);T((await o.json()).items||[])}catch(e){A(e.message)}finally{O(!1)}},[L,F,N,e]);return(0,b.useEffect)(()=>{y().then(e=>{e.ok?B():r(!1)})},[B]),t?(0,x.jsxs)(u,{title:`Cotizaciones`,children:[(0,x.jsxs)(`div`,{className:`quotes-page-wrapper`,children:[(0,x.jsxs)(`div`,{className:`header-section`,children:[(0,x.jsxs)(`div`,{className:`title-group`,children:[(0,x.jsx)(`h1`,{children:`Panel de Cotizaciones`}),(0,x.jsx)(`p`,{children:`Monitorea el pipeline comercial y estados de envío`})]}),(0,x.jsxs)(`button`,{className:`btn-main-action`,onClick:()=>M(!0),children:[(0,x.jsx)(m,{size:20,strokeWidth:2}),`Nueva Cotización`]})]}),k&&(0,x.jsxs)(`div`,{className:`errorBanner`,role:`alert`,children:[(0,x.jsx)(s,{size:18}),` `,k]}),(0,x.jsxs)(`div`,{className:`stats-dashboard`,children:[(0,x.jsxs)(`div`,{className:`metric-card`,children:[(0,x.jsxs)(`div`,{className:`metric-content`,children:[(0,x.jsx)(`span`,{className:`metric-label`,children:`Pipeline Total`}),(0,x.jsxs)(`div`,{className:`metric-value-group`,children:[(0,x.jsx)(`span`,{className:`currency`,children:`USD`}),(0,x.jsx)(`span`,{className:`value`,children:z.pipeline?.toLocaleString()})]})]}),(0,x.jsx)(`div`,{className:`metric-icon blue`,children:(0,x.jsx)(_,{size:24})})]}),(0,x.jsxs)(`div`,{className:`metric-card`,children:[(0,x.jsxs)(`div`,{className:`metric-content`,children:[(0,x.jsx)(`span`,{className:`metric-label`,children:`Total Cotizaciones`}),(0,x.jsx)(`span`,{className:`value`,children:z.countTotal})]}),(0,x.jsx)(`div`,{className:`metric-icon slate`,children:(0,x.jsx)(d,{size:24})})]}),(0,x.jsxs)(`div`,{className:`metric-card`,children:[(0,x.jsxs)(`div`,{className:`metric-content`,children:[(0,x.jsx)(`span`,{className:`metric-label`,children:`Aprobadas`}),(0,x.jsx)(`span`,{className:`value`,children:z.countApproved})]}),(0,x.jsx)(`div`,{className:`metric-icon green`,children:(0,x.jsx)(p,{size:24})})]})]}),(0,x.jsxs)(`div`,{className:`filters-bar`,children:[(0,x.jsxs)(`div`,{className:`search-container`,children:[(0,x.jsx)(o,{size:18,className:`search-icon`}),(0,x.jsx)(`input`,{placeholder:`Buscar cliente, destino o número...`,value:N,onChange:e=>P(e.target.value)}),N&&(0,x.jsx)(h,{size:16,className:`clear-search`,onClick:()=>P(``)})]}),(0,x.jsx)(`div`,{className:`quick-filters`,children:[`draft`,`sent`,`approved`].map(e=>(0,x.jsx)(`button`,{className:`filter-pill ${F===e?`active`:``}`,onClick:()=>I(F===e?``:e),children:e===`draft`?`Borrador`:e===`sent`?`Enviada`:`Aprobada`},e))}),(0,x.jsxs)(`button`,{className:`sort-toggle`,onClick:()=>R(L===`asc`?`desc`:`asc`),children:[(0,x.jsx)(f,{size:16}),` `,L===`desc`?`Recientes`:`Antiguos`]})]}),(0,x.jsx)(`div`,{className:`quotes-list-container`,children:D?(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(w,{}),(0,x.jsx)(w,{}),(0,x.jsx)(w,{}),(0,x.jsx)(w,{}),(0,x.jsx)(w,{})]}):C.map(t=>{let n=t.items_snapshot?.[0],r=n?`${n.product} ${n.variety||``}`:`Varios productos`;return(0,x.jsxs)(`div`,{className:`quote-row-item`,onClick:()=>e(`/admin/quotes/${t.id}`),children:[(0,x.jsxs)(`div`,{className:`col-ident`,children:[(0,x.jsx)(`span`,{className:`id-number`,children:t.quote_number||t.quote_no||`S/N`}),(0,x.jsx)(`span`,{className:`product-variety`,children:r}),(0,x.jsxs)(`span`,{className:`badge-boxes`,children:[t.boxes||0,` CAJAS`]})]}),(0,x.jsx)(`div`,{className:`col-client`,children:(0,x.jsx)(`span`,{className:`client-name`,children:t.client_name||t.client_snapshot?.name||`Cliente sin nombre`})}),(0,x.jsx)(`div`,{className:`col-route`,children:(0,x.jsxs)(`div`,{className:`route-timeline`,children:[(0,x.jsx)(`span`,{className:`flag`,children:`🇵🇦`}),(0,x.jsxs)(`div`,{className:`connector`,children:[(0,x.jsx)(`div`,{className:`line`}),(0,x.jsx)(`div`,{className:`mode-icon`,children:t.mode===`SEA`?(0,x.jsx)(l,{size:12}):(0,x.jsx)(g,{size:12})})]}),(0,x.jsx)(`span`,{className:`flag`,children:S(t.destination)}),(0,x.jsx)(`span`,{className:`dest-text`,children:t.destination})]})}),(0,x.jsx)(`div`,{className:`col-amount`,children:(0,x.jsxs)(`span`,{className:`amount-val`,children:[(0,x.jsx)(`small`,{children:`USD`}),` `,(t.total_amount||t.total||0).toLocaleString(void 0,{minimumFractionDigits:2})]})}),(0,x.jsxs)(`div`,{className:`col-status`,children:[(0,x.jsx)(E,{v:t.status}),(0,x.jsx)(c,{size:20,className:`entry-chevron`})]})]},t.id)})})]}),(0,x.jsx)(v,{isOpen:j,onClose:()=>{M(!1),B()},initialClientId:void 0}),(0,x.jsx)(`style`,{children:`
        .quotes-page-wrapper { padding: 30px; max-width: 1400px; margin: 0 auto; }
        .header-section { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 35px; }
        .title-group h1 { font-size: 28px; font-weight: 700; color: #0f172a; margin: 0; }
        .title-group p { color: #64748b; font-size: 14px; margin-top: 4px; }

        .btn-main-action { 
          background: #0f172a; color: white; border: none; padding: 12px 24px; border-radius: 12px; 
          font-weight: 600; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.2s;
        }
        .btn-main-action:hover { background: #1e293b; transform: translateY(-1px); }

        .stats-dashboard { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
        .metric-card { background: white; padding: 20px; border-radius: 16px; border: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .metric-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
        .metric-card .value { font-size: 24px; font-weight: 700; color: #0f172a; }
        .metric-icon { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; }
        .metric-icon.blue { background: #eff6ff; color: #3b82f6; }
        .metric-icon.green { background: #f0fdf4; color: #10b981; }
        .metric-icon.slate { background: #f8fafc; color: #64748b; }

        .filters-bar { display: flex; align-items: center; gap: 16px; margin-bottom: 25px; }
        .search-container { position: relative; flex: 1; }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .search-container input { width: 100%; padding: 10px 16px 10px 42px; border-radius: 12px; border: 1px solid #e2e8f0; background: white; font-size: 14px; outline: none; }

        .filter-pill { padding: 8px 16px; border-radius: 10px; border: 1px solid #e2e8f0; background: white; font-size: 12px; font-weight: 700; color: #64748b; cursor: pointer; transition: 0.2s; }
        .filter-pill.active { background: #0f172a; color: white; border-color: #0f172a; }
        .sort-toggle { background: white; border: 1px solid #e2e8f0; padding: 8px 14px; border-radius: 10px; display: flex; align-items: center; gap: 8px; font-weight: 600; color: #64748b; cursor: pointer; font-size: 12px; }

        .quotes-list-container { display: flex; flex-direction: column; gap: 10px; }
        .quote-row-item { 
          background: white; padding: 14px 24px; border-radius: 16px; border: 1px solid #f1f5f9;
          display: grid; grid-template-columns: 1.2fr 1.5fr 2fr 1fr 1.2fr; align-items: center;
          cursor: pointer; transition: 0.2s ease;
        }
        .quote-row-item:hover { border-color: #cbd5e1; transform: translateX(4px); box-shadow: 0 4px 12px rgba(0,0,0,0.03); }

        .col-ident { display: flex; flex-direction: column; gap: 2px; }
        .id-number { font-family: monospace; font-size: 11px; font-weight: 700; color: #1e293b; }
        .product-variety { font-size: 10px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .badge-boxes { background: #f0fdf4; color: #16a34a; font-size: 9px; font-weight: 800; padding: 1px 6px; border-radius: 4px; width: fit-content; margin-top: 4px; }

        .client-name { font-size: 14px; font-weight: 600; color: #334155; }

        .route-timeline { display: flex; align-items: center; gap: 8px; background: #f8fafc; padding: 4px 12px; border-radius: 50px; width: fit-content; border: 1px solid #f1f5f9; }
        .route-timeline .flag { font-size: 14px; }
        .route-timeline .connector { display: flex; align-items: center; position: relative; width: 35px; }
        .route-timeline .line { width: 100%; height: 1px; border-top: 2px dotted #e2e8f0; }
        .route-timeline .mode-icon { position: absolute; left: 50%; transform: translateX(-50%); background: #f8fafc; padding: 0 2px; color: #94a3b8; }
        .route-timeline .dest-text { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; }

        .col-amount { text-align: right; padding-right: 20px; }
        .amount-val { font-size: 15px; font-weight: 500; color: #475569; }
        .amount-val small { font-size: 10px; font-weight: 800; color: #94a3b8; margin-right: 2px; }

        .col-status { display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
        .entry-chevron { color: #cbd5e1; }
        
        .loadingState { padding: 40px; text-align: center; color: #94a3b8; font-size: 14px; font-weight: 600; }
        .errorBanner { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 12px 16px; border-radius: 14px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; font-size: 13px; }

        /* --- STYLES FOR SKELETON --- */
        .skeleton-row { pointer-events: none; border-color: #f1f5f9 !important; }
        .skel-line { height: 12px; background: #f1f5f9; border-radius: 4px; margin-bottom: 8px; position: relative; overflow: hidden; }
        .skel-pill { height: 24px; background: #f1f5f9; border-radius: 50px; position: relative; overflow: hidden; }
        
        .skel-line::after, .skel-pill::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }

        .w40 { width: 40%; }
        .w50 { width: 50%; }
        .w60 { width: 60%; }
        .w70 { width: 70%; }
        .w80 { width: 80%; }
        .w100 { width: 100%; }

      `})]}):null}function E({v:e}){let t=String(e||``).toLowerCase(),n={approved:{bg:`#dcfce7`,text:`#166534`},sent:{bg:`#fff7ed`,text:`#c2410c`},draft:{bg:`#f1f5f9`,text:`#475569`}},r=n[t]||n.draft;return(0,x.jsx)(`span`,{style:{background:r.bg,color:r.text,padding:`4px 12px`,borderRadius:`50px`,fontSize:`10px`,fontWeight:800,textTransform:`uppercase`,letterSpacing:`0.02em`,border:`1px solid rgba(0,0,0,0.02)`},children:C(e)})}export{T as default};