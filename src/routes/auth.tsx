import { createFileRoute,useNavigate,useRouter } from '@tanstack/react-router';
import { useEffect,useState,type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { LovableMark } from '@lovable.dev/cloud-auth-js/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BrandSymbol } from '@/components/field/shared';
import { pageHead } from '@/lib/demo';
import { LockKeyhole,LoaderCircle } from 'lucide-react';
export const Route=createFileRoute('/auth')({head:()=>pageHead('Sign in','Secure access to your private AI-assisted telecom incident workspace.'),component:AuthPage});
function AuthPage(){
 const [tab,setTab]=useState<'login'|'register'|'forgot'>('login');
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [notice,setNotice]=useState('');
 const navigate=useNavigate();const router=useRouter();
 useEffect(()=>{void supabase.auth.getUser().then(({data})=>{if(data.user)void navigate({to:'/',replace:true});});},[navigate]);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError('');setNotice('');
 const form=new FormData(e.currentTarget);const email=String(form.get('email')??'').trim();const password=String(form.get('password')??'');
 try{
 if(tab==='forgot'){const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/reset-password`});if(error)throw error;setNotice('Check your email for a password reset link.');}
 else if(tab==='register'){const {data,error}=await supabase.auth.signUp({email,password,options:{data:{display_name:String(form.get('name')??'').trim()},emailRedirectTo:window.location.origin}});if(error)throw error;if(!data.session)setNotice('Check your email and confirm your account before signing in.');else {await router.invalidate();await navigate({to:'/',replace:true});}}
 else{const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;await router.invalidate();await navigate({to:'/',replace:true});}
 }catch(e){setError(e instanceof Error?e.message:'Sign-in failed. Please try again.');}finally{setBusy(false);}}
 async function social(provider:'google'|'lovable'){setError('');setBusy(true);try{const result=await lovable.auth.signInWithOAuth(provider,{redirect_uri:`${window.location.origin}/auth`});if(result.error)throw result.error;if(!result.redirected){await router.invalidate();await navigate({to:'/',replace:true});}}catch(e){setError(e instanceof Error?e.message:'Sign-in failed.');}finally{setBusy(false);}}
 return <main className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-10">
 <div className="w-full max-w-md"><div className="flex items-center gap-4 mb-9"><BrandSymbol/><div><h1 className="text-xl font-bold">AI FIELD ASSISTANT<span className="text-primary">.</span></h1><p className="text-xs text-muted-foreground mt-2">Telecom Operations Intelligence Platform</p></div></div>
 <div className="flex gap-2 mb-6"><Button className="flex-1" variant={tab==='login'?'default':'outline'} onClick={()=>{setTab('login');setError('');setNotice('');}}>Sign in</Button><Button className="flex-1" variant={tab==='register'?'default':'outline'} onClick={()=>{setTab('register');setError('');setNotice('');}}>Create account</Button></div>
 <h2 className="text-lg font-semibold mb-5">{tab==='forgot'?'Reset your password':tab==='register'?'Create your engineer account':'Welcome back, Engineer.'}</h2>
 <form onSubmit={submit} className="space-y-5">{tab==='register'&&<div className="field"><label htmlFor="auth-name">Display name</label><Input id="auth-name" name="name" required maxLength={120} autoComplete="name"/></div>}
 <div className="field"><label htmlFor="auth-email">Email address</label><Input id="auth-email" type="email" name="email" required autoComplete="email"/></div>
 {tab!=='forgot'&&<div className="field"><label htmlFor="auth-password">Password</label><Input id="auth-password" name="password" type="password" required minLength={8} autoComplete={tab==='register'?'new-password':'current-password'}/></div>}
 {error&&<p role="alert" className="text-destructive text-sm">{error}</p>}{notice&&<p role="status" className="text-success text-sm leading-6">{notice}</p>}
 <Button type="submit" className="w-full" disabled={busy}>{busy?<LoaderCircle className="animate-spin"/>:<LockKeyhole/>}{tab==='forgot'?'Send reset link':tab==='register'?'Register':'Sign in'}</Button>
 </form>
 {tab==='login'&&<Button variant="link" className="px-0 mt-3" onClick={()=>setTab('forgot')}>Forgot password?</Button>}
 <div className="border-t border-border mt-6 pt-6 space-y-3"><Button variant="outline" className="google-auth w-full" disabled={busy} onClick={()=>social('google')}><svg aria-hidden="true" className="size-4.5" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>Continue with Google</Button><Button variant="outline" className="w-full" disabled={busy} onClick={()=>social('lovable')}><LovableMark/>Continue with Lovable</Button></div>
 <p className="text-xs text-muted-foreground leading-6 mt-7">Private incident workspace · Engineer validation required<br/>No live telecom infrastructure connected</p>
 </div></main>;
}
