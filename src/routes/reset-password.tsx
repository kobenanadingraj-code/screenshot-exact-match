import { createFileRoute,useNavigate } from '@tanstack/react-router';
import { useEffect,useState,type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { pageHead } from '@/lib/demo';
export const Route=createFileRoute('/reset-password')({head:()=>pageHead('Reset password','Set a new password for your AI FIELD ASSISTANT account.'),component:ResetPassword});
function ResetPassword(){const [valid,setValid]=useState(false);const [error,setError]=useState('');const [busy,setBusy]=useState(false);const navigate=useNavigate();
 useEffect(()=>{setValid(new URLSearchParams(window.location.hash.slice(1)).get('type')==='recovery');},[]);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError('');const password=String(new FormData(e.currentTarget).get('password')??'');try{const {error}=await supabase.auth.updateUser({password});if(error)throw error;await navigate({to:'/',replace:true});}catch(e){setError(e instanceof Error?e.message:'Password reset failed.');}finally{setBusy(false);}}
 return <main className="min-h-screen bg-background flex items-center justify-center p-6"><div className="w-full max-w-sm"><h1 className="text-xl font-semibold mb-7">Set a new password</h1>{valid?<form onSubmit={submit} className="space-y-5"><label htmlFor="reset-password">New password</label><Input id="reset-password" name="password" type="password" minLength={8} required autoComplete="new-password"/>{error&&<p role="alert" className="text-destructive">{error}</p>}<Button disabled={busy} className="w-full">Save password</Button></form>:<><p className="text-muted-foreground mb-5">Open the password recovery link from your email.</p><Button onClick={()=>navigate({to:'/auth'})}>Back to sign in</Button></>}</div></main>;
}
