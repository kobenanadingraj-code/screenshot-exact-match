import { z } from 'zod';
export const incidentSchema = z.object({
 id:z.string().min(1).max(100),site:z.string().trim().min(1).max(120),location:z.string().max(500),category:z.string().min(1).max(120),model:z.string().max(200),domain:z.enum(['RAN','Transmission','IP','Power','Core']),description:z.string().min(3).max(12000),alarms:z.string().max(12000),date:z.string().refine(v=>!Number.isNaN(Date.parse(v))),severity:z.enum(['Critical','High','Medium','Low']),status:z.enum(['New','Under Analysis','In Progress','Pending Escalation','Resolved','Closed']),observations:z.string().max(12000),attachments:z.array(z.string().max(500)).max(30)
}).strict();
export const stepSchema=z.object({id:z.string(),title:z.string(),description:z.string(),reason:z.string().optional(),expected:z.string().optional(),status:z.enum(['Not Started','In Progress','Verified','Not Applicable']),result:z.string()}).strict().refine(s=>s.status!=='Verified'||s.result.trim().length>=3,'Observed evidence is required for verification');
export const analysisSchema=z.object({incidentId:z.string(),source:z.string(),sections:z.array(z.object({id:z.string(),title:z.string(),text:z.string()})),generatedAt:z.string()});
export const threadSchema=z.object({id:z.string(),title:z.string(),messages:z.array(z.object({id:z.string(),role:z.enum(['user','assistant']),parts:z.array(z.object({type:z.literal('text'),text:z.string()})),time:z.string()}))});
export const workspaceSchema=z.object({incidents:z.array(incidentSchema),analyses:z.record(analysisSchema),stepsByIncident:z.record(z.array(stepSchema)),documents:z.array(z.object({source:z.string().optional(),id:z.string(),kind:z.enum(['report','escalation']),incidentId:z.string(),title:z.string(),content:z.string(),validated:z.boolean(),date:z.string()})),threads:z.array(threadSchema),activities:z.array(z.object({id:z.string(),title:z.string(),type:z.string(),incident:z.string(),time:z.string()})),engineer:z.string().min(1).max(120),theme:z.enum(['dark','light']),savedArticles:z.array(z.string()),revision:z.number().int().nonnegative()}).strict();
export type WorkspaceSnapshot=z.infer<typeof workspaceSchema>;
export function validateWorkspace(snapshot: WorkspaceSnapshot) {
 const parsed=workspaceSchema.parse(snapshot);
 const ids=new Set(parsed.incidents.map(i=>i.id));
 if(Object.keys(parsed.analyses).some(id=>!ids.has(id))||Object.keys(parsed.stepsByIncident).some(id=>!ids.has(id))||parsed.documents.some(d=>!ids.has(d.incidentId))) throw new Error('Linked records require an existing incident.');
 return parsed;
}
export const aiOutputSchema=z.object({missingInformation:z.array(z.string()),hypotheses:z.array(z.string()),verificationSteps:z.array(z.object({title:z.string(),description:z.string(),reason:z.string(),expected:z.string()}).strict()),escalationConditions:z.array(z.string()),nextAction:z.string()}).strict();
export function safeAiFailure(error: unknown): {status:number;message:string;block:boolean} {
 const e=error as {statusCode?:number;responseBody?:string;message?:string};
 let message=e.message||'AI request failed. No analysis was saved.';
 try { const body=JSON.parse(e.responseBody??'{}'); message=body.message??body.error?.message??message; } catch { /* keep safe request error */ }
 const status=e.statusCode??500;
 return {status,message,block:status===402||status===403};
}
