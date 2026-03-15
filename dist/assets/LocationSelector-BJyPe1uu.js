import{r as e,t}from"./react-DGmkrIjS.js";import{t as n}from"./jsx-runtime-CE1G-XVE.js";import{i as r,n as i}from"./apiBase-DO2SmTHI.js";import{i as a,s as o}from"./AdminLayout-CqQmaSj8.js";import{t as s}from"./plus-WnA60Yps.js";var c=r(`plane`,[[`path`,{d:`M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z`,key:`1v9wt8`}]]),l=e(t()),u=n();function d({value:e,onChange:t,mode:n}){let[r,d]=(0,l.useState)(e||``),[f,p]=(0,l.useState)([]),[m,h]=(0,l.useState)(!1),[g,_]=(0,l.useState)(!1),v=(0,l.useRef)(null);(0,l.useEffect)(()=>{d(e||``)},[e]),(0,l.useEffect)(()=>{function e(e){v.current&&!v.current.contains(e.target)&&h(!1)}return document.addEventListener(`mousedown`,e),()=>document.removeEventListener(`mousedown`,e)},[]);let y=async e=>{if(d(e),e.length<2){p([]);return}_(!0),h(!0);let{data:t}=await i.from(`locations`).select(`*`).or(`name.ilike.%${e}%,code.ilike.%${e}%`).eq(`type`,n===`AIR`?`AIRPORT`:`PORT`).limit(6);p(t||[]),_(!1)},b=e=>{d(e.name),t(e.name),h(!1)};return(0,u.jsxs)(`div`,{className:`location-wrapper`,ref:v,children:[(0,u.jsxs)(`div`,{className:`input-group`,children:[(0,u.jsx)(`div`,{className:`icon-prefix`,children:n===`AIR`?(0,u.jsx)(c,{size:16}):(0,u.jsx)(a,{size:16})}),(0,u.jsx)(`input`,{type:`text`,value:r,onChange:e=>y(e.target.value),onFocus:()=>r.length>=2&&h(!0),placeholder:n===`AIR`?`Ej: AMS o Schiphol...`:`Ej: ROT o Rotterdam...`}),g&&(0,u.jsx)(o,{size:14,className:`spin`})]}),m&&(0,u.jsxs)(`div`,{className:`dropdown`,children:[f.map(e=>(0,u.jsxs)(`div`,{className:`option`,onClick:()=>b(e),children:[(0,u.jsx)(`span`,{className:`flag`,children:e.flag||(e.type===`PORT`?`⚓`:`✈️`)}),(0,u.jsxs)(`div`,{className:`details`,children:[(0,u.jsx)(`span`,{className:`name`,children:e.name}),(0,u.jsxs)(`span`,{className:`sub`,children:[e.code,` • `,e.country]})]})]},e.code)),f.length===0&&!g&&r.length>=3&&(0,u.jsxs)(`div`,{className:`option create-new`,onClick:async()=>{if(!r)return;_(!0);let e=r.substring(0,3).toUpperCase()+Math.floor(Math.random()*100),{data:t,error:a}=await i.from(`locations`).insert([{code:e,name:r,country:`Destino`,type:n===`AIR`?`AIRPORT`:`PORT`,flag:n===`AIR`?`✈️`:`⚓`}]).select();_(!1),!a&&t&&b(t[0])},children:[(0,u.jsx)(s,{size:14}),(0,u.jsxs)(`span`,{children:[`Crear `,(0,u.jsxs)(`b`,{children:[`"`,r,`"`]}),` como nuevo destino`]})]})]}),(0,u.jsx)(`style`,{jsx:!0,children:`
        .location-wrapper { position: relative; width: 100%; }
        .input-group { 
          display: flex; align-items: center; background: #f8fafc;
          border: 1px solid #e2e8f0; border-radius: 12px; padding: 0 12px;
          transition: border 0.2s;
        }
        .input-group:focus-within { border-color: #3b82f6; background: white; }
        .icon-prefix { color: #94a3b8; margin-right: 10px; }
        input { 
          flex: 1; border: none; padding: 11px 0; outline: none; 
          font-size: 14px; color: #1e293b; font-weight: 700; background: transparent;
        }
        .dropdown { 
          position: absolute; top: calc(100% + 5px); left: 0; right: 0; z-index: 100;
          background: white; border: 1px solid #e2e8f0; border-radius: 12px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.1); overflow: hidden;
        }
        .option { 
          display: flex; align-items: center; gap: 12px; padding: 10px 15px;
          cursor: pointer; transition: background 0.2s;
        }
        .option:hover { background: #f1f5f9; }
        .flag { font-size: 18px; width: 24px; text-align: center; }
        .details { display: flex; flex-direction: column; }
        .name { font-size: 13px; font-weight: 800; color: #0f172a; }
        .sub { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; }
        .create-new { color: #166534; background: #f0fdf4; border-top: 1px solid #dcfce7; }
        .spin { animation: rotate 1s linear infinite; color: #94a3b8; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `})]})}export{c as n,d as t};