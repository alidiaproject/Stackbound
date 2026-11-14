// Optional multiplayer adapter. Firebase project credentials are public identifiers, not passwords.
// Configure Firestore rules and enable Anonymous Authentication before hosting.
let sdk=null,db=null,auth=null;
export async function connectFirebase(config){
 const [app,fire,identity]=await Promise.all([
  import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
  import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js'),
  import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js')]);
 const instance=app.initializeApp(config);db=fire.getFirestore(instance);auth=identity.getAuth(instance);
 await identity.signInAnonymously(auth);sdk=fire;return auth.currentUser.uid;
}
export function ready(){return !!sdk;}
export async function createRoom(game){if(!sdk)throw Error('Connect Firebase first');let ref=sdk.doc(sdk.collection(db,'rooms'));await sdk.setDoc(ref,{game,host:auth.currentUser.uid,guest:null,revision:0,updatedAt:sdk.serverTimestamp()});return ref.id;}
export async function joinRoom(id){let ref=sdk.doc(db,'rooms',id);await sdk.runTransaction(db,async t=>{let snap=await t.get(ref);if(!snap.exists())throw Error('Room not found');let data=snap.data();if(data.guest&&data.guest!==auth.currentUser.uid)throw Error('Room is full');if(data.host===auth.currentUser.uid)throw Error('You are already the host');t.update(ref,{guest:auth.currentUser.uid,updatedAt:sdk.serverTimestamp()});});return id;}
export function watchRoom(id,cb){return sdk.onSnapshot(sdk.doc(db,'rooms',id),s=>{if(s.exists())cb(s.data());},e=>cb(null,e));}
export async function roomAction(id,expectedRevision,player,fn){let ref=sdk.doc(db,'rooms',id);return sdk.runTransaction(db,async t=>{let s=await t.get(ref);if(!s.exists())throw Error('Room missing');let data=s.data();let owner=player===0?data.host:data.guest;if(owner!==auth.currentUser.uid)throw Error('Not your player seat');if(data.revision!==expectedRevision)throw Error('State changed; try again');let game=fn(data.game);t.update(ref,{game,revision:data.revision+1,updatedAt:sdk.serverTimestamp()});});}
export function mySeat(data,uid){return data.host===uid?0:data.guest===uid?1:-1;}
