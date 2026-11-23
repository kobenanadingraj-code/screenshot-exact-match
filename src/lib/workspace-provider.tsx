import { useEffect,useRef,useState,type ReactNode,type SetStateAction } from 'react';
import { useQuery,useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { DemoContext } from './demo-context';
import { readWorkspace,saveWorkspace } from './workspace.functions';
import { analyzeSavedIncident } from './analysis.functions';
import { diagnosisForIncident } from './incident-workflow';
import type { WorkspaceSnapshot } from './workspace-schema';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
export function WorkspaceProvider({children}:{children:ReactNode}){
 const read=useServerFn(readWorkspace);
 const query=useQuery({queryKey:['private-workspace'],queryFn:()=>read(),retry:false,refetchOnWindowFocus:false});
 if(query.isPending) return <div className="p-12 text-center" role="status">Loading your workspace…</div>;
 if(query.isError) return <div className="p-12 text-center"><p role="alert">{query.error.message}</p><Button className="mt-5" onClick={()=>query.refetch()}>Retry loading</Button></div>;
 return <WorkspaceState initial={query.data}>{children}</WorkspaceState>;
}
function WorkspaceState({initial,children}:{initial:WorkspaceSnapshot;children:ReactNode}){
 const [state,setState]=useState(initial);
 const current=useRef(initial);
 const queue=useRef(Promise.resolve());
 const alive=useRef(true);
 const [saving,setSaving]=useState(0);
 const [error,setError]=useState('');
 const [activeIncidentId,setActiveIncidentId]=useState(initial.incidents[0]?.id??'');
 const write=useServerFn(saveWorkspace);
 const analyze=useServerFn(analyzeSavedIncident);
 const queryClient=useQueryClient();
 const navigate=useNavigate();
 useEffect(()=>()=>{alive.current=false;},[]);
 useEffect(()=>{document.documentElement.classList.toggle('dark',state.theme==='dark');},[state.theme]);
 function update(change:(s:WorkspaceSnapshot)=>WorkspaceSnapshot):Promise<void>{
  setSaving(n=>n+1);
  const task=queue.current.then(async()=>{
   if(!alive.current) return;
   const next=change(current.current);
   const saved=await write({data:next});
   if(!alive.current) return;
   current.current=saved;setState(saved);setError('');
  });
  queue.current=task.catch(e=>{if(alive.current){setError(e instanceof Error?e.message:'Save failed.');toast.error('Changes were not saved. Please retry.');}}).finally(()=>{if(alive.current)setSaving(n=>n-1);});
  return task;
 }
 const setter=<K extends keyof WorkspaceSnapshot>(key:K)=>(action:SetStateAction<WorkspaceSnapshot[K]>)=>update(s=>({...s,[key]:typeof action==='function'?(action as (old:WorkspaceSnapshot[K])=>WorkspaceSnapshot[K])(s[key]):action}));
 async function requestAnalysis(incidentId:string,prompt='Analyze this incident',resume=false){
  await queue.current;
  const result=await analyze({data:{incidentId,prompt,resume}});
  if(!result.ok) throw new Error(result.message);
  current.current=result.snapshot;setState(result.snapshot);
  return result.analysis;
 }
 async function signOut(){
  await queryClient.cancelQueries();queryClient.clear();
  const {error:signoutError}=await supabase.auth.signOut();
  if(signoutError){toast.error(signoutError.message);return;}
  alive.current=false;
  await navigate({to:'/auth',replace:true});
 }
 const value={...state,setIncidents:setter('incidents'),setAnalyses:setter('analyses'),setStepsByIncident:setter('stepsByIncident'),setThreads:setter('threads'),setDocuments:setter('documents'),setActivities:setter('activities'),setSavedArticles:setter('savedArticles'),setEngineer:setter('engineer'),setTheme:setter('theme'),activeIncidentId,setActiveIncidentId,
 initializeDiagnosis:(incident:import('./demo').Incident)=>update(s=>s.stepsByIncident[incident.id]?s:{...s,stepsByIncident:{...s.stepsByIncident,[incident.id]:diagnosisForIncident(incident)}}),
 addActivity:(title:string,type:string,incident:string)=>update(s=>({...s,activities:[{id:crypto.randomUUID(),title,type,incident,time:new Date().toISOString()},...s.activities]})),
 deleteIncident:(id:string)=>update(s=>({...s,incidents:s.incidents.filter(i=>i.id!==id),documents:s.documents.filter(d=>d.incidentId!==id),analyses:Object.fromEntries(Object.entries(s.analyses).filter(([k])=>k!==id)),stepsByIncident:Object.fromEntries(Object.entries(s.stepsByIncident).filter(([k])=>k!==id))})),
 resetDemo:()=>{},requestAnalysis,signOut,mode:'connected' as const};
 return <DemoContext.Provider value={value}>
 {error&&<div role="alert" className="bg-destructive/10 text-destructive p-4">{error} <Button variant="outline" size="sm" onClick={()=>window.location.reload()}>Reload saved data</Button></div>}
 {saving>0&&<div role="status" className="bg-elevated text-muted-foreground p-2 text-center text-xs">Saving changes…</div>}
 {children}
 </DemoContext.Provider>;
}
