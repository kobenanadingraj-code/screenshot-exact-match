import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
import { workspaceSchema } from './workspace-schema';
export const analyzeSavedIncident=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({incidentId:z.string(),prompt:z.string().max(12000).default('Analyze this incident'),resume:z.boolean().default(false)})).handler(async({data,context})=>{
 const {data:snapshot,error}=await context.supabase.rpc('read_field_workspace');
 if(error) throw new Error(error.message);
 const workspace=workspaceSchema.parse(snapshot);
 const incident=workspace.incidents.find(i=>i.id===data.incidentId);
 if(!incident) throw new Error('Incident not found or access denied.');
 const {data:profile}=await context.supabase.from('profiles').select('ai_block').eq('id',context.userId).single();
 const blocked=profile?.ai_block as {message?:string;status?:number}|null;
 if(blocked&&!data.resume) return {ok:false as const,message:blocked.message??'AI access is paused.',blocked:true};
 const {generateAnalysis}=await import('./ai/analysis.server');
 const result=await generateAnalysis(getRequest(),incident,workspace.stepsByIncident[incident.id]??[],data.prompt);
 if(!result.ok){
  if(result.blocked) await context.supabase.from('profiles').update({ai_block:{message:result.message,status:result.status}}).eq('id',context.userId);
  return result;
 }
 // Re-read after generation: do not overwrite concurrent edits or certify outdated facts.
 const {data:latest,error:readError}=await context.supabase.rpc('read_field_workspace');
 if(readError) throw new Error(readError.message);
 const current=workspaceSchema.parse(latest);
 const saved=current.incidents.find(i=>i.id===incident.id);
 if(!saved||JSON.stringify(saved)!==JSON.stringify(incident)) return {ok:false as const,message:'Incident changed during analysis. Review the new record and request a fresh analysis.',blocked:false};
 current.analyses[incident.id]=result.analysis;
 if(!(current.stepsByIncident[incident.id]?.some(s=>s.status!=='Not Started'))) current.stepsByIncident[incident.id]=result.steps;
 current.activities.unshift({id:crypto.randomUUID(),title:'AI analysis generated from saved incident',type:'AI Analysis',incident:incident.site,time:new Date().toISOString()});
 const {data:revision,error:saveError}=await context.supabase.rpc('save_field_workspace',{snapshot:current as unknown as import('@/integrations/supabase/types').Json,expected_revision:current.revision});
 if(saveError) throw new Error(saveError.message);
 await context.supabase.from('profiles').update({ai_block:null}).eq('id',context.userId);
 return {ok:true as const,analysis:result.analysis,snapshot:{...current,revision}};
});
