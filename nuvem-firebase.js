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

const state={ready:null,user:null,mestre:null,fs:null,F:null,A:null,auth:null};
const css=`#nvGate{position:fixed;inset:0;z-index:100;display:grid;place-items:center;background:rgba(18,16,20,.72);padding:16px;font-family:"Alegreya Sans",system-ui,sans-serif}
#nvGate .box{background:#fbfaf6;color:#1e1c19;border-radius:14px;max-width:440px;width:100%;padding:22px 22px 18px;box-shadow:0 12px 40px rgba(0,0,0,.4)}
#nvGate h2{margin:0 0 6px;font-family:"IM Fell English SC",Georgia,serif;font-weight:400;font-size:26px}
#nvGate p{margin:6px 0;line-height:1.45;color:#4a453c}#nvGate .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
#nvGate button{font:inherit;border-radius:8px;padding:8px 14px;cursor:pointer;border:1px solid #c9c1b2;background:#f1eee6;color:#1e1c19}
#nvGate button.p{background:#6e2a24;border-color:#6e2a24;color:#fff}#nvGate .err{color:#a3302a;font-size:14px}
#nvChip{position:fixed;left:max(10px,env(safe-area-inset-left,0px));bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:60;font:13px "Alegreya Sans",system-ui,sans-serif;background:rgba(251,250,246,.95);color:#1e1c19;border:1px solid #d6d0c3;border-radius:99px;padding:3px 4px 3px 10px;display:flex;gap:6px;align-items:center;box-shadow:0 4px 14px rgba(0,0,0,.15)}
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
  const docApi=path=>{const ref=F.doc(fs,path);return {
    async get(){try{return docSnap(await F.getDoc(ref));}catch(e){throw err(e);}},
    async set(d){try{await F.setDoc(ref,enc(d));}catch(e){throw err(e);}},
    async update(d){try{const cur=await F.getDoc(ref);await F.setDoc(ref,enc(Object.assign({},cur.exists()?dec(cur.data()):{},d)));}catch(e){throw err(e);}},
    async delete(){try{await F.deleteDoc(ref);}catch(e){throw err(e);}},
    onSnapshot(cb,onErr){return F.onSnapshot(ref,s=>cb(docSnap(s)),e=>onErr&&onErr(err(e)));}};};
  const colApi=path=>{const ref=F.collection(fs,path);return {
    doc:id=>docApi(path+'/'+id),
    async get(){try{return colSnap(await F.getDocs(ref));}catch(e){throw err(e);}},
    onSnapshot(cb,onErr){return F.onSnapshot(ref,s=>cb(colSnap(s)),e=>onErr&&onErr(err(e)));}};};
  return Object.freeze({collection:colApi,doc:docApi,
    /* joining a table with an invite: the rules let a signed-in person become a member only with an unused invite */
    async entrar(convite){const u=state.user;if(!u)throw err({code:'permission-denied'});
      try{const ja=await F.getDoc(F.doc(fs,'membros/'+u.uid));if(ja.exists())return;await F.setDoc(F.doc(fs,'membros/'+u.uid),enc({convite,nome:u.displayName||'',em:Date.now()}));}catch(e){throw err(e);}}});}
function makeUser(){const u=state.user;return Object.freeze({
  id:async()=>u?u.uid:null,
  isOwner:async()=>!!(u&&state.mestre&&u.uid===state.mestre),
  canEdit:async()=>!!(u&&state.mestre&&u.uid===state.mestre),
  can:async()=>null,
  me:async()=>({id:u?u.uid:null,name:u?u.displayName||'':'',email:null}),
  async profiles(ids){const out={};await Promise.all(ids.map(async id=>{try{const s=await state.F.getDoc(state.F.doc(state.fs,'perfis/'+id));out[id]={id,name:s.exists()?(dec(s.data())||{}).nome||'':''};}catch(e){out[id]={id,name:''};}}));return out;}});}

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
  try{await F.setDoc(F.doc(fs,'perfis/'+user.uid),enc({nome:user.displayName||'',em:Date.now()}));}catch(e){}
  let m=null;try{const s=await F.getDoc(F.doc(fs,'config/mestre'));m=s.exists()?(dec(s.data())||{}).uid:null;}catch(e){}
  if(!m){m=await new Promise(res=>{gate(`<h2>Quem é o mestre?</h2><p>Esta mesa ainda não tem mestre registrado. A primeira conta registrada fica como mestre para sempre: ela vê e edita tudo.</p>
      <p>Você está entrando como <b>${esc(user.displayName||user.email||'esta conta')}</b>.</p>
      <div class="row"><button class="p" id="nvMe">Sou o mestre</button><button id="nvNo">Sou jogador</button></div><p class="err" id="nvErr"></p>`);
    document.getElementById('nvMe').onclick=async()=>{try{await F.setDoc(F.doc(fs,'config/mestre'),enc({uid:user.uid,em:Date.now()}));res(user.uid);}
      catch(e){document.getElementById('nvErr').textContent='Não consegui registrar. Confira se as regras do arquivo firestore.rules foram publicadas no Firebase.';}};
    document.getElementById('nvNo').onclick=()=>res(null);});}
  state.mestre=m;gate(null);chip();return true;}
function chip(){const u=state.user;if(!u)return;let c=document.getElementById('nvChip');if(!c){c=document.createElement('div');c.id='nvChip';document.body.appendChild(c);}
  c.innerHTML=`<span>${esc((u.displayName||u.email||'Conta').split(' ')[0])}${state.mestre===u.uid?' · mestre':''}</span><button type="button" id="nvOut">Sair</button>`;
  document.getElementById('nvOut').onclick=async()=>{await state.A.signOut(state.auth);location.reload();};}

state.ready=new Promise(res=>{const go=()=>boot().then(res,()=>res(false));if(document.body)go();else document.addEventListener('DOMContentLoaded',go);});
window.claude={use:async name=>{const ok=await state.ready;if(!ok||!state.user)return null;if(name==='db')return makeDb();if(name==='user')return makeUser();return null;}};
})();
