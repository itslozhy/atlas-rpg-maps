/* Mesa do Mestre fora do claude.ai: banco, contas e transmissão pelo Firebase.
   No claude.ai a página usa o banco de lá (window.claude). Fora dele (GitHub Pages), este arquivo cria um
   window.claude com a mesma forma (use('db'), use('user')), então o resto da página não precisa mudar.
   As regras de acesso ficam em firestore.rules e valem no servidor do Google. */
(()=>{'use strict';
const FIREBASE_CONFIG={apiKey:"AIzaSyBCIOC4-NVYVMdDGvnt5W3cqBUTdHXyCqA",authDomain:"atlas-rpg-6910f.firebaseapp.com",projectId:"atlas-rpg-6910f",
  storageBucket:"atlas-rpg-6910f.firebasestorage.app",messagingSenderId:"1049119202384",appId:"1:1049119202384:web:6d5a05461acb9aad8c0555"};
const SDK='https://www.gstatic.com/firebasejs/13.4.0/';
const HOSTS=['itslozhy.github.io'];
const forced=/[?&]firebase=1\b/.test(location.search);
if(window.claude||(!HOSTS.includes(location.hostname)&&!forced))return;

const state={ready:null,user:null,space:null,spaces:[],fs:null,F:null,A:null,auth:null};
/* every master has a space of their own: mestres/<uid>/... holds their campaigns, NPCs, invites, players' sheets.
   Account-level data (maps, profile, list of tables joined) stays outside it. */
const SHARED=/^(data\/users\/|perfis\/|usuarios\/|usernames\/)/;
const P=path=>SHARED.test(path)?path:'mestres/'+state.space+'/'+path;
window.MESA_URL=location.origin+location.pathname;
const lsGet=k=>{try{return localStorage.getItem(k);}catch(e){return null;}};const lsSet=(k,v)=>{try{localStorage.setItem(k,v);}catch(e){}};
const css=`#nvGate{position:fixed;inset:0;z-index:100;display:grid;place-items:center;background:rgba(18,16,20,.72);padding:16px;font-family:"Alegreya Sans",system-ui,sans-serif}
#nvGate .box{background:#fbfaf6;color:#1e1c19;border-radius:14px;max-width:440px;width:100%;padding:22px 22px 18px;box-shadow:0 12px 40px rgba(0,0,0,.4)}
#nvGate h2{margin:0 0 6px;font-family:"IM Fell English SC",Georgia,serif;font-weight:400;font-size:26px}
#nvGate p{margin:6px 0;line-height:1.45;color:#4a453c}#nvGate .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
#nvGate button{font:inherit;border-radius:8px;padding:8px 14px;cursor:pointer;border:1px solid #c9c1b2;background:#f1eee6;color:#1e1c19}
#nvGate button.p{background:#6e2a24;border-color:#6e2a24;color:#fff}#nvGate .nvf{display:flex;flex-direction:column;gap:3px;margin-top:12px}#nvGate .nvf>span:first-child{font-weight:700;font-size:14px}
#nvGate input{font:inherit;padding:7px 10px;border:1px solid #c9c1b2;border-radius:8px;background:#fff;color:#1e1c19;width:100%}
#nvGate .nvat{display:flex;align-items:center;gap:4px;font-size:17px}#nvGate small{color:#686256;font-size:13px}#nvGate .nvmsg{color:#a3302a}#nvGate .nvmsg[data-ok="1"]{color:#2f6b3f}
#nvGate .err{color:#a3302a;font-size:14px}
#nvChip{position:fixed;left:max(10px,env(safe-area-inset-left,0px));bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:60;font:13px "Alegreya Sans",system-ui,sans-serif;background:rgba(251,250,246,.95);color:#1e1c19;border:1px solid #d6d0c3;border-radius:99px;padding:3px 4px 3px 10px;display:flex;gap:6px;align-items:center;box-shadow:0 4px 14px rgba(0,0,0,.15)}
#nvChip select{font:inherit;border:1px solid #d6d0c3;border-radius:99px;background:#fff;padding:1px 4px;max-width:190px}#nvChip .nvsp{color:#686256}
#nvChip button{font:inherit;border:0;background:#f1eee6;border-radius:99px;padding:2px 8px;cursor:pointer}
@media (max-width:820px){#nvChip{bottom:auto;top:calc(8px + env(safe-area-inset-top,0px));left:auto;right:max(10px,env(safe-area-inset-right,0px))}}`;
function gate(html){let g=document.getElementById('nvGate');if(!html){if(g)g.remove();return null;}
  if(!document.getElementById('nvCss')){const st=document.createElement('style');st.id='nvCss';st.textContent=css;document.head.appendChild(st);}
  if(!g){g=document.createElement('div');g.id='nvGate';document.body.appendChild(g);}g.innerHTML='<div class="box" role="dialog" aria-modal="true">'+html+'</div>';return g;}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* documents are stored as one JSON string: Firestore refuses arrays inside arrays (maps and drawings use them) */
/* simple top-level fields are also kept as plain fields, so the security rules can check them (uid, convite) */
const enc=d=>{const o={};if(d&&typeof d==='object'&&!Array.isArray(d))for(const [k,v] of Object.entries(d))if(k!=='j'&&k!=='t'&&(typeof v==='string'&&v.length<300||typeof v==='number'||typeof v==='boolean'))o[k]=v;o.j=JSON.stringify(d===undefined?null:d);o.t=Date.now();return o;};
const dec=d=>{if(!d)return d;if(typeof d.j==='string'){try{return JSON.parse(d.j);}catch(e){return null;}}return d;};
const err=e=>{const x=new Error(e&&e.message||'erro');x.code=e&&e.code==='permission-denied'?'invalid_argument':(e&&e.code)||'unknown';return x;};

function makeDb(){const {F,fs}=state;
  const docSnap=s=>({exists:s.exists(),id:s.id,data:()=>s.exists()?dec(s.data()):undefined});
  const colSnap=q=>({docs:q.docs.map(d=>({id:d.id,data:()=>dec(d.data())})),size:q.size,empty:q.empty});
  const docApi=path=>{const ref=F.doc(fs,P(path));return {
    async get(){try{return docSnap(await F.getDoc(ref));}catch(e){throw err(e);}},
    async set(d){try{await F.setDoc(ref,enc(d));}catch(e){throw err(e);}},
    async update(d){try{const cur=await F.getDoc(ref);await F.setDoc(ref,enc(Object.assign({},cur.exists()?dec(cur.data()):{},d)));}catch(e){throw err(e);}},
    async delete(){try{await F.deleteDoc(ref);}catch(e){throw err(e);}},
    onSnapshot(cb,onErr){return F.onSnapshot(ref,s=>cb(docSnap(s)),e=>onErr&&onErr(err(e)));}};};
  const colApi=path=>{const ref=F.collection(fs,P(path));return {
    doc:id=>docApi(path+'/'+id),
    async get(){try{return colSnap(await F.getDocs(ref));}catch(e){throw err(e);}},
    onSnapshot(cb,onErr){return F.onSnapshot(ref,s=>cb(colSnap(s)),e=>onErr&&onErr(err(e)));}};};
  return Object.freeze({collection:colApi,doc:docApi,
    /* joining a table with an invite: the rules let a signed-in person become a member only with an unused invite */
    async entrar(convite,camp,campNome){const u=state.user;if(!u)throw err({code:'permission-denied'});if(state.space===u.uid)return;
      try{const ref=F.doc(fs,P('membros/'+u.uid));const ja=await F.getDoc(ref);if(!ja.exists())await F.setDoc(ref,{convite,camp:camp||'',nome:(state.perfil&&state.perfil.nome)||'',em:Date.now()});
        if(camp){const cr=F.doc(fs,P('membros/'+u.uid+'/campanhas/'+camp));if(!(await F.getDoc(cr)).exists())await F.setDoc(cr,{convite,em:Date.now()});
          await F.setDoc(F.doc(fs,'usuarios/'+u.uid+'/campanhas/'+state.space+'~'+camp),{m:state.space,c:camp,nome:String(campNome||'').slice(0,80),em:Date.now()});lsSet('mesa.camp.'+u.uid,camp);}
        await F.setDoc(F.doc(fs,'usuarios/'+u.uid+'/espacos/'+state.space),enc({em:Date.now()}));if(!state.spaces.includes(state.space))state.spaces.push(state.space);lsSet('mesa.espaco.'+u.uid,state.space);lsSet('mesa.papel.'+u.uid,'jogador');state.papel='jogador';chip();}catch(e){throw err(e);}}});}
function makeUser(){const u=state.user;return Object.freeze({
  id:async()=>u?u.uid:null,
  isOwner:async()=>!!(u&&state.space===u.uid&&state.papel!=='jogador'),
  canEdit:async()=>!!(u&&state.space===u.uid),
  can:async()=>null,
  me:async()=>({id:u?u.uid:null,name:(state.perfil&&state.perfil.nome)||'',email:null}),
  async profiles(ids){const out={};await Promise.all(ids.map(async id=>{let pf={};try{const s=await state.F.getDoc(state.F.doc(state.fs,'perfis/'+id));if(s.exists())pf=dec(s.data())||{};}catch(e){}
    out[id]={id,name:pf.nome?(pf.user?pf.nome+' (@'+pf.user+')':pf.nome):'',user:pf.user||''};}));return out;}});}

async function boot(){
  gate('<h2>Mesa do Mestre</h2><p>Conectando…</p>');
  let app,A,F;
  try{[app,A,F]=await Promise.all([import(SDK+'firebase-app.js'),import(SDK+'firebase-auth.js'),import(SDK+'firebase-firestore.js')]);}
  catch(e){gate('<h2>Sem conexão</h2><p>Não consegui carregar o Firebase. Confira a internet e recarregue a página.</p><div class="row"><button class="p" onclick="location.reload()">Recarregar</button><button id="nvLocal">Usar sem conta</button></div>');
    document.getElementById('nvLocal').onclick=()=>{gate(null);};return false;}
  const fa=app.initializeApp(FIREBASE_CONFIG);state.A=A;state.F=F;state.fs=F.getFirestore(fa);state.auth=A.getAuth(fa);
  try{await A.getRedirectResult(state.auth);}catch(e){}
  const user=await new Promise(res=>{const off=A.onAuthStateChanged(state.auth,u=>{off();res(u);});});
  return user?afterLogin(user):askLogin();}
function askLogin(msg){return new Promise(res=>{
  gate(`<h2>Mesa do Mestre</h2><p>Entre com sua conta Google para ver as mesas, as fichas e o mapa ao vivo. O mestre e os jogadores usam a mesma página.</p>${msg?`<p class="err">${esc(msg)}</p>`:''}
    <div class="row"><button class="p" id="nvIn">Entrar com Google</button><button id="nvLocal">Usar sem conta (salva só neste navegador)</button></div>`);
  document.getElementById('nvIn').onclick=async()=>{const p=new state.A.GoogleAuthProvider();p.setCustomParameters({prompt:'select_account'});
    try{const r=await state.A.signInWithPopup(state.auth,p);res(await afterLogin(r.user));}
    catch(e){if(e&&(e.code==='auth/popup-blocked'||e.code==='auth/operation-not-supported-in-this-environment')){await state.A.signInWithRedirect(state.auth,p);return;}
      if(e&&e.code==='auth/unauthorized-domain'){res(askLogin('Este endereço ainda não está autorizado no Firebase (Authentication › Settings › Authorized domains).'));return;}
      if(e&&e.code==='auth/popup-closed-by-user'){return;}res(askLogin('Não foi possível entrar agora. Tente de novo.'));}};
  document.getElementById('nvLocal').onclick=()=>{gate(null);res(false);};});}
async function afterLogin(user){state.user=user;const {F,fs}=state;
  let pf=null;try{const s=await F.getDoc(F.doc(fs,'perfis/'+user.uid));pf=s.exists()?s.data():null;}catch(e){}
  if(!pf||!pf.user||!pf.nome)pf=await profileForm(user,pf,true);state.perfil=pf;
  try{const q=await F.getDocs(F.collection(fs,'usuarios/'+user.uid+'/espacos'));state.spaces=q.docs.map(d=>d.id);}catch(e){state.spaces=[];}
  /* which master's tables to show: the one in an invite link, the last one used, a table already joined, or your own */
  const inv=(location.hash.match(/^#convite-([A-Za-z0-9_-]+)~/)||[])[1];const last=lsGet('mesa.espaco.'+user.uid);
  state.papel=inv?'jogador':lsGet('mesa.papel.'+user.uid)||null;
  state.space=inv||(state.papel!=='jogador'?user.uid:(last&&(last===user.uid||state.spaces.includes(last))?last:user.uid));
  if(!inv)lsSet('mesa.espaco.'+user.uid,state.space);
  window.MESA_ESPACO=state.space;gate(null);chip();return true;}
/* ---------- profile: unique user name + display name ----------
   The user name is the id of a document in usernames/: Firestore ids are unique, and the rules only let an
   account create a free one, for itself, in the allowed shape. Profile and name are written in one batch. */
const USER_RE=/^[a-z0-9_.]{3,20}$/;
const cleanNome=s=>String(s||'').normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f<>]/g,'').replace(/\s+/g,' ').trim().slice(0,40);
const cleanUser=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9_.]/g,'').slice(0,20);
function profileForm(user,cur,first){return new Promise(res=>{const {F,fs}=state;
  gate(`<h2>${first?'Seu perfil':'Editar perfil'}</h2><p>${first?'Antes de entrar, escolha como os outros vão te ver.':'Mude seu nome de usuário ou o nome de exibição.'}</p>
    <label class="nvf"><span>Nome de usuário</span><span class="nvat">@<input id="nvUser" maxlength="20" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(cur&&cur.user||'')}"></span>
      <small>3 a 20 caracteres: letras minúsculas, números, ponto e _. Ninguém mais pode usar o mesmo.</small><small id="nvUserMsg" class="nvmsg" aria-live="polite"></small></label>
    <label class="nvf"><span>Nome de exibição</span><input id="nvNome" maxlength="40" value="${esc(cur&&cur.nome||cleanNome(user.displayName))}"><small>Como aparece nas mesas. Até 40 caracteres.</small></label>
    <p class="err" id="nvErr"></p><div class="row"><button class="p" id="nvSave">Salvar</button>${first?'':'<button id="nvCancel">Cancelar</button>'}</div>`);
  const ui=document.getElementById('nvUser'),ni=document.getElementById('nvNome'),msg=document.getElementById('nvUserMsg'),er=document.getElementById('nvErr');let t=null,seq=0,livre=false;
  const check=async()=>{const v=ui.value;livre=false;if(!USER_RE.test(v)){msg.textContent=v?'Use de 3 a 20 caracteres: a-z, 0-9, ponto e _.':'';msg.dataset.ok='';return;}
    if(cur&&cur.user===v){livre=true;msg.textContent='Este é o seu nome atual.';msg.dataset.ok='1';return;}
    const my=++seq;msg.textContent='Verificando…';msg.dataset.ok='';try{const s=await F.getDoc(F.doc(fs,'usernames/'+v));if(my!==seq)return;livre=!s.exists()||s.data().uid===user.uid;
      msg.textContent=livre?'Disponível.':'Já está em uso. Escolha outro.';msg.dataset.ok=livre?'1':'';}catch(e){if(my===seq){msg.textContent='Não consegui verificar agora.';}}};
  ui.oninput=()=>{const c=cleanUser(ui.value);if(c!==ui.value)ui.value=c;clearTimeout(t);t=setTimeout(check,350);};if(ui.value)check();
  const cc=document.getElementById('nvCancel');if(cc)cc.onclick=()=>{gate(null);res(cur);};
  document.getElementById('nvSave').onclick=async()=>{const u=ui.value,n=cleanNome(ni.value);er.textContent='';
    if(!USER_RE.test(u)){er.textContent='Escolha um nome de usuário válido.';ui.focus();return;}if(!n){er.textContent='Escreva um nome de exibição.';ni.focus();return;}
    await check();if(!livre){er.textContent='Esse nome de usuário não está disponível.';return;}
    const b=F.writeBatch(fs);const novo={nome:n,user:u,em:Date.now()};
    if(!cur||cur.user!==u)b.set(F.doc(fs,'usernames/'+u),{uid:user.uid,em:Date.now()});
    b.set(F.doc(fs,'perfis/'+user.uid),novo);
    if(cur&&cur.user&&cur.user!==u)b.delete(F.doc(fs,'usernames/'+cur.user));
    try{await b.commit();gate(null);res(novo);}catch(e){er.textContent=e&&e.code==='permission-denied'?'Esse nome de usuário acabou de ser pego por outra pessoa. Escolha outro.':'Não foi possível salvar agora. Tente de novo.';check();}};
  setTimeout(()=>(cur&&cur.user?ni:ui).focus(),30);});}
async function chip(){const u=state.user;if(!u)return;let c=document.getElementById('nvChip');if(!c){c=document.createElement('div');c.id='nvChip';document.body.appendChild(c);}
  const pf=state.perfil||{};const papel=state.papel==='jogador'?'Jogador':state.papel==='mestre'?'Mestre':'';
  c.innerHTML=`<button type="button" id="nvPerfil" title="Editar perfil">${esc(pf.nome||'Conta')}${pf.user?` <small>@${esc(pf.user)}</small>`:''}</button>${papel?`<span class="nvsp">${esc(papel)}</span>`:''}<button type="button" id="nvHome" title="Tela inicial">Início</button><button type="button" id="nvOut">Sair</button>`;
  document.getElementById('nvHome').onclick=()=>{if(window.Mesa)Mesa.go('fichas','#inicio');else location.hash='inicio';};
  document.getElementById('nvPerfil').onclick=async()=>{const n=await profileForm(u,state.perfil,false);if(n&&n!==state.perfil){state.perfil=n;chip();}};
  document.getElementById('nvOut').onclick=async()=>{await state.A.signOut(state.auth);location.reload();};}

/* ---------- roles, campaign codes and passwords ----------
   The password never leaves this page: it becomes a SHA-256 key (campaign + password), the id of a document only the
   master can create. Joining writes a membership that names that key; the rules accept it only if the key exists for
   that campaign, so a wrong password is refused by the server. Nobody can list the keys or the codes. */
const raw={get:async p=>{const s=await state.F.getDoc(state.F.doc(state.fs,p));return s.exists()?s.data():null;},set:(p,d)=>state.F.setDoc(state.F.doc(state.fs,p),d),del:p=>state.F.deleteDoc(state.F.doc(state.fs,p))};
async function sha256(t){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');}
const chaveDe=(c,senha)=>sha256('mesa-do-mestre|'+c+'|'+senha);
const CODE_RE=/^[A-Z0-9]{4,12}$/;const limpaCodigo=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,12);
const denied=e=>e&&(e.code==='permission-denied'||e.code==='invalid_argument');
window.MESA_NUVEM=Object.freeze({kind:'firebase',limpaCodigo,
  info:()=>({uid:state.user&&state.user.uid,space:state.space,papel:state.papel,proprio:!!(state.user&&state.space===state.user.uid),nome:(state.perfil&&state.perfil.nome)||''}),
  /* choosing a role moves to the matching space: your own as master, or the table you were last at as player */
  setPapel(p,hash){const u=state.user;if(!u)return;lsSet('mesa.papel.'+u.uid,p);if(p==='mestre')lsSet('mesa.espaco.'+u.uid,u.uid);else lsSet('mesa.espaco.'+u.uid,u.uid);location.hash=hash||'inicio';location.reload();},
  entrarCampanha(m,c){const u=state.user;if(!u)return;lsSet('mesa.papel.'+u.uid,'jogador');lsSet('mesa.espaco.'+u.uid,m);lsSet('mesa.camp.'+u.uid,c);location.hash='campanha-'+c;location.reload();},
  voltarAoInicio(){const u=state.user;if(!u)return;lsSet('mesa.espaco.'+u.uid,u.uid);location.hash='inicio';location.reload();},
  async minhasCampanhas(){const u=state.user;if(!u)return [];let l=[];try{const q=await state.F.getDocs(state.F.collection(state.fs,'usuarios/'+u.uid+'/campanhas'));l=q.docs.map(d=>Object.assign({id:d.id},d.data())).filter(x=>x.m&&x.c);}catch(e){return [];}
    const ms=[...new Set(l.map(x=>x.m))];const nm={};await Promise.all(ms.map(async id=>{try{const d=await raw.get('perfis/'+id);nm[id]=d&&(d.nome||(d.user?'@'+d.user:''))||'';}catch(e){}}));
    return l.map(x=>Object.assign(x,{mestre:nm[x.m]||''})).sort((a,b)=>(b.em||0)-(a.em||0));},
  /* campaigns of the current space this account has joined (a player reads them one by one, never as a list) */
  async campanhasAqui(){const u=state.user;if(!u||state.space===u.uid)return [];try{const q=await state.F.getDocs(state.F.collection(state.fs,'mestres/'+state.space+'/membros/'+u.uid+'/campanhas'));return q.docs.map(d=>d.id);}catch(e){return [];}},
  async entrarComCodigo(codigo,senha){const u=state.user;if(!u)throw new Error('login');const code=limpaCodigo(codigo);if(!CODE_RE.test(code))throw new Error('codigo');
    let cd=null;try{cd=await raw.get('codigos/'+code);}catch(e){throw new Error('rede');}if(!cd||!cd.m||!cd.c)throw new Error('codigo');if(cd.m===u.uid)throw new Error('proprio');
    const chave=await chaveDe(cd.c,String(senha||''));const base='mestres/'+cd.m+'/membros/'+u.uid;
    try{const ja=await raw.get(base+'/campanhas/'+cd.c).catch(()=>null);if(!ja){const mb=await raw.get(base).catch(()=>null);if(!mb)await raw.set(base,{chave,c:cd.c,nome:(state.perfil&&state.perfil.nome)||'',em:Date.now()});await raw.set(base+'/campanhas/'+cd.c,{chave,em:Date.now()});}}
    catch(e){throw new Error(denied(e)?'senha':'rede');}
    try{await raw.set('usuarios/'+u.uid+'/campanhas/'+cd.m+'~'+cd.c,{m:cd.m,c:cd.c,nome:String(cd.nome||'').slice(0,80),em:Date.now()});await state.F.setDoc(state.F.doc(state.fs,'usuarios/'+u.uid+'/espacos/'+cd.m),enc({em:Date.now()}));}catch(e){}
    return {m:cd.m,c:cd.c,nome:cd.nome||''};},
  async sairDaCampanha(m,c){const u=state.user;if(!u)return;try{await raw.del('mestres/'+m+'/membros/'+u.uid+'/campanhas/'+c);}catch(e){}try{await raw.del('usuarios/'+u.uid+'/campanhas/'+m+'~'+c);}catch(e){}},
  async acesso(c){const u=state.user;if(!u)return null;try{const a=await raw.get('mestres/'+u.uid+'/acesso/'+c);return a?{codigo:a.codigo||'',temSenha:!!a.chave}:{codigo:'',temSenha:false};}catch(e){return null;}},
  /* the master sets or changes a campaign's code and password */
  async definirAcesso(c,codigo,senha,nome){const u=state.user;if(!u)throw new Error('login');const code=limpaCodigo(codigo);if(!CODE_RE.test(code))throw new Error('codigo');
    const base='mestres/'+u.uid;const old=await raw.get(base+'/acesso/'+c).catch(()=>null)||{};
    if(senha!=null&&String(senha).length<4)throw new Error('senha');if(!old.chave&&(senha==null||senha===''))throw new Error('senha');
    if(code!==old.codigo){const ex=await raw.get('codigos/'+code).catch(()=>null);if(ex&&(ex.m!==u.uid||ex.c!==c))throw new Error('em-uso');
      try{await raw.set('codigos/'+code,{m:u.uid,c,nome:String(nome||'').slice(0,80),em:Date.now()});}catch(e){throw new Error(denied(e)?'em-uso':'rede');}
      if(old.codigo){try{await raw.del('codigos/'+old.codigo);}catch(e){}}}
    else{try{await raw.set('codigos/'+code,{m:u.uid,c,nome:String(nome||'').slice(0,80),em:Date.now()});}catch(e){}}
    let chave=old.chave||'';if(senha){chave=await chaveDe(c,String(senha));await raw.set(base+'/chaves/'+chave,{c});if(old.chave&&old.chave!==chave){try{await raw.del(base+'/chaves/'+old.chave);}catch(e){}}}
    await raw.set(base+'/acesso/'+c,{codigo:code,chave,em:Date.now()});return {codigo:code};},
  async removerAcesso(c){const u=state.user;if(!u)return;const base='mestres/'+u.uid;const old=await raw.get(base+'/acesso/'+c).catch(()=>null);if(!old)return;
    if(old.codigo){try{await raw.del('codigos/'+old.codigo);}catch(e){}}if(old.chave){try{await raw.del(base+'/chaves/'+old.chave);}catch(e){}}try{await raw.del(base+'/acesso/'+c);}catch(e){}}});

state.ready=new Promise(res=>{const go=()=>boot().then(res,()=>res(false));if(document.body)go();else document.addEventListener('DOMContentLoaded',go);});
window.claude={use:async name=>{const ok=await state.ready;if(!ok||!state.user)return null;if(name==='db')return makeDb();if(name==='user')return makeUser();return null;}};
})();
