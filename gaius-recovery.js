// Server-side, email-backed one-time-code recovery for the shared workspace.
// The code and the email API key never appear in the GitHub Pages bundle.
import { AppError, authenticatedUser, makeVerifier, matches, stateOf, digest } from './gaius-core.js';

const encoder = new TextEncoder();
const MAX_AGE = 10 * 60 * 1000;
const RESEND_GAP = 60 * 1000;
const MAX_GUESSES = 5;
const CONFIRM_RE = /^\d{8}$/;
const MAIL_RE = /^[^\s@<>(),;:\\]+@[^\s@<>(),;:\\]+\.[^\s@<>(),;:\\]+$/;
const err = (code, status=400) => new AppError(code,status);
export const normalizeEmail = value => {
  if(typeof value!=='string') throw err('emailInvalid');
  const email=value.trim().toLowerCase();
  if(email.length>254 || email.length<6 || !MAIL_RE.test(email)) throw err('emailInvalid');
  return email;
};
export function recoveryReady(env) {
  return typeof env?.RESEND_API_KEY==='string' && env.RESEND_API_KEY.startsWith('re_')
    && typeof env?.RESET_CODE_SECRET==='string' && env.RESET_CODE_SECRET.length>=32
    && typeof env?.MAIL_FROM==='string' && /@[^\s<>]+\.[^\s<>]+/.test(env.MAIL_FROM);
}
const randomCode = () => {
  // Rejection sampling avoids the modulo bias on a limited 8-digit space.
  const max=2**32 - (2**32 % 100000000);
  let number;
  do { number=crypto.getRandomValues(new Uint32Array(1))[0]; } while(number>=max);
  return String(number%100000000).padStart(8,'0');
};
const randomNonce = () => Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('');
function constantTimeHex(a,b){
  if(typeof a!=='string'||typeof b!=='string')return false;
  let mismatch=a.length^b.length;
  for(let i=0;i<Math.max(a.length,b.length);i++)mismatch|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);
  return mismatch===0;
}
async function hmac(secret,input){
  const k=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const b=await crypto.subtle.sign('HMAC',k,encoder.encode(input));
  return Array.from(new Uint8Array(b),n=>n.toString(16).padStart(2,'0')).join('');
}
const generic = () => ({ok:true,message:'recoveryRequested'});
async function deliverWithResend(env,email,code,purpose){
  const director=purpose==='director-bootstrap';
  const reset=purpose==='password';
  const subject=director?'Gaius Nexus | Director registration verification code':reset?'GAIUS Ministry | Password reset verification code':'GAIUS Ministry | Verify your new email';
  const text=director?`Your one-time Director registration verification code is ${code}. It expires in 10 minutes. Never share it.`:reset
    ? `Your GAIUS Ministry password reset verification code is ${code}. It expires in 10 minutes. If you did not request this, ignore this message. Never share the code.`
    : `Your GAIUS Ministry email verification code is ${code}. It expires in 10 minutes. If you did not request this, ignore this message. Never share the code.`;
  const response=await fetch('https://api.resend.com/emails',{
    method:'POST', headers:{'Authorization':'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json', 'User-Agent':'GAIUS-Workspace/10.2'},
    body:JSON.stringify({from:env.MAIL_FROM,to:[email],subject,text})
  });
  if(!response.ok)throw err('emailDeliveryFailed',503);
  return true;
}

export class RecoveryService {
  constructor(db, env, deliver=deliverWithResend){this.db=db;this.env=env;this.deliver=deliver;}
  enabled(){return recoveryReady(this.env);}
  requireEnabled(){if(!this.enabled())throw err('emailNotConfigured',503);}
  keyFor(kind,userId){return `otp:${kind}:${userId}`;}
  async keyMaterial(kind,userId,nonce,code){return hmac(this.env.RESET_CODE_SECRET,`${kind}:${userId}:${nonce}:${code}`);}
  async requestPassword(data){
    this.requireEnabled();
    const email=normalizeEmail(data?.email), accounts=this.db.all('users').filter(u=>
      stateOf(u)==='active' && !u.onboarding && typeof u.email==='string' && u.email.trim().toLowerCase()===email);
    // An ambiguous historical email is NOT a reliable password-recovery identifier.
    if(accounts.length!==1)return generic();
    await this.issue('password',accounts[0],email);
    return generic();
  }
  async requestEmailChange(data,token){
    this.requireEnabled();
    const {user}=await authenticatedUser(this.db,token);
    if(user.onboarding)throw err('onboarding',403);
    if(!await matches(user,data?.currentPassword,false))throw err('wrongPassword',403);
    const email=normalizeEmail(data?.newEmail);
    if(email===normalizeEmail(user.email||''))throw err('emailUnchanged');
    if(this.db.all('users').some(u=>u.id!==user.id && stateOf(u)!=='removed' && String(u.email||'').trim().toLowerCase()===email))throw err('emailInUse',409);
    await this.issue('email-change',user,email);
    return {ok:true,message:'verificationRequested'};
  }
  async issue(kind,user,email){
    const time=Date.now(),id=this.keyFor(kind,user.id),prior=this.db.one('otps',id);
    if(prior && prior.nextAllowedAt>time) return;
    const code=randomCode(),nonce=randomNonce(),hash=await this.keyMaterial(kind,user.id,nonce,code);
    const pending={id,kind,userId:user.id,email,hash,nonce,expiresAt:time+MAX_AGE,
      nextAllowedAt:time+RESEND_GAP,attempts:0,delivery:'sending',issuedAt:time};
    const saved=this.db.atomic(()=>{
      const current=this.db.one('otps',id);
      if(current && current.nextAllowedAt>Date.now())return false;
      this.db.put('otps',pending);
      return true;
    });
    if(!saved)return;
    try{
      await this.deliver(this.env,email,code,kind);
      this.db.atomic(()=>{
        const current=this.db.one('otps',id);
        if(current?.nonce===nonce)this.db.put('otps',{...current,delivery:'ready'});
      });
    }catch{
      this.db.atomic(()=>{
        const current=this.db.one('otps',id);
        if(current?.nonce===nonce)this.db.drop('otps',id);
      });
      // Same public response for both unknown and deliverability failures.
      // The administrator can inspect the email service logs when mail never arrives.
    }
  }
  async verify(data,kind,token=''){
    this.requireEnabled();
    const code=String(data?.code||'').trim();
    if(!CONFIRM_RE.test(code))throw err('codeInvalid');
    let actor;
    if(kind==='email-change'){
      ({user:actor}=await authenticatedUser(this.db,token));
    }else{
      const email=normalizeEmail(data?.email),matchesEmail=this.db.all('users').filter(u=>
        stateOf(u)==='active' && !u.onboarding && String(u.email||'').trim().toLowerCase()===email);
      if(matchesEmail.length!==1)throw err('codeInvalid');
      actor=matchesEmail[0];
    }
    const id=this.keyFor(kind,actor.id),one=this.db.one('otps',id);
    // No password update is possible for a stale, undelivered, expired or blocked challenge.
    if(!one || one.delivery!=='ready' || one.expiresAt<=Date.now() || one.attempts>=MAX_GUESSES)throw err('codeInvalid');
    if(kind==='password'&&one.email!==normalizeEmail(data.email))throw err('codeInvalid');
    const candidate=await this.keyMaterial(kind,actor.id,one.nonce,code);
    let verifier=null;
    if(constantTimeHex(candidate,one.hash) && kind==='password')verifier=await makeVerifier(data?.newPassword);
    const tokenHash=kind==='email-change' ? await digest(token):null;
    const result=this.db.atomic(()=>{
      const otp=this.db.one('otps',id),latest=this.db.one('users',actor.id);
      if(!otp||!latest||stateOf(latest)!=='active'||latest.onboarding||otp.delivery!=='ready'||
        otp.nonce!==one.nonce||otp.expiresAt<=Date.now()||otp.attempts>=MAX_GUESSES)return false;
      if(!constantTimeHex(candidate,otp.hash)){
        this.db.put('otps',{...otp,attempts:otp.attempts+1});
        return false;
      }
      if(kind==='email-change'){
        if(this.db.all('users').some(u=>u.id!==latest.id&&stateOf(u)!=='removed' && String(u.email||'').trim().toLowerCase()===otp.email))return false;
        const session=this.db.one('sessions',tokenHash);
        if(!session||session.until<=Date.now()||session.userId!==actor.id||session.epoch!==(latest.sessionVersion||0))return false;
        const revised={...latest,email:otp.email,emailVerifiedAt:new Date().toISOString(),sessionVersion:(latest.sessionVersion||0)+1,_v:(latest._v||0)+1};
        this.db.put('users',revised);
        this.db.put('sessions',{...session,epoch:revised.sessionVersion});
      }else{
        if(String(latest.email||'').trim().toLowerCase()!==otp.email)return false;
        this.db.put('users',{...latest,passwordHash:verifier,emailVerifiedAt:new Date().toISOString(),
          sessionVersion:(latest.sessionVersion||0)+1,_v:(latest._v||0)+1});
      }
      this.db.drop('otps',id);
      this.db.put('audit',{id:crypto.randomUUID(),actorId:latest.id,actorName:latest.name,
        action:kind==='password'?'password.email_recovered':'email.verified_change',target:latest.id,at:new Date().toISOString()});
      return true;
    });
    if(!result)throw err('codeInvalid');
    return {ok:true,message:kind==='password'?'passwordChanged':'emailChanged'};
  }
}
