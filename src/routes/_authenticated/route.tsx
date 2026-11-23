import { createFileRoute,redirect,Outlet } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { WorkspaceProvider } from '@/lib/workspace-provider';
import { AppShell } from '@/components/field/app-shell';
export const Route=createFileRoute('/_authenticated')({ssr:false,beforeLoad:async()=>{
 const {data,error}=await supabase.auth.getUser();
 if(error||!data.user) throw redirect({to:'/auth',replace:true});
},component:ProtectedWorkspace});
function ProtectedWorkspace(){return <WorkspaceProvider><AppShell><Outlet/></AppShell></WorkspaceProvider>;}
