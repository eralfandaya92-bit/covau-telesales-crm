let assignmentTeamLeads=[],assignmentRoster=[];
function assignmentLeader(){return !!profile&&['team_leader','manager','admin'].includes(profile.role)}
async function countLeads(filters=[]){let q=sb.from('leads').select('id',{count:'exact',head:true});for(const f of filters){if(f[0]==='eq')q=q.eq(f[1],f[2]);else if(f[0]==='is')q=q.is(f[1],f[2]);}const {count,error}=await q;if(error)throw error;return count||0}
async function loadAssignmentManager(){
 if(!assignmentLeader())return;
 byId('assignmentRolePill').textContent=String(profile.role).replace('_',' ').toUpperCase();
 byId('assignmentMsg').textContent='Loading assignment data...';
 try{
  const {data,error}=await sb.rpc('lead_assignment_dashboard');
  if(error)throw error;
  const d=data||{};
  assignmentTeamLeads=d.team_leads||[];
  assignmentRoster=d.roster||[];
  const total=Number(d.total||0),unassigned=Number(d.unassigned||0),reassign=Number(d.reassignment||0),agentAssigned=Number(d.agent_assigned||0);
  byId('assignmentKpis').innerHTML=[
   ['Total CRM Leads',total,'Current database'],
   ['Unassigned',unassigned,'Available for TL allocation'],
   ['Agent Assigned',agentAssigned,'Assigned through manager'],
   ['Reassignment Queue',reassign,reassign?'Needs attention':'Queue is clear'],
   ['Active Team Leads',assignmentTeamLeads.filter(x=>x.status==='active').length,'Future TL supported']
  ].map(x=>'<div class="kpi primary-kpi"><div class="label">'+x[0]+'</div><div class="value">'+Number(x[1]).toLocaleString()+'</div><div class="delta">'+x[2]+'</div></div>').join('');
  renderTlRows(); renderAssignmentSelectors();
  const parts=d.tl_counts||[],assigned=parts.reduce((s,x)=>s+Number(x.count||0),0);
  byId('assignmentSummary').innerHTML='<div class="data-summary" style="grid-template-columns:repeat(2,1fr)">'+parts.map(x=>'<div class="data-stat"><span>'+esc(x.tl_name)+'</span><b>'+Number(x.count||0).toLocaleString()+'</b></div>').join('')+'<div class="data-stat"><span>Total TL Assigned</span><b>'+assigned.toLocaleString()+'</b></div><div class="data-stat"><span>Coverage</span><b>'+(total?((assigned/total)*100).toFixed(1):'0.0')+'%</b></div></div>';
  const hist=d.history||[];
  byId('assignmentHistoryBody').innerHTML=hist.map(r=>'<tr><td>'+fmtDate(r.assigned_at)+'</td><td><b>'+esc(r.lead_id||'')+'</b><br><span class="muted">'+esc(r.business_name||'')+'</span></td><td>'+esc(r.previous_tl_name||'—')+'</td><td>'+esc(r.new_tl_name||'—')+'</td><td>'+esc(r.previous_agent_name||'—')+'</td><td>'+esc(r.new_agent_name||'—')+'</td><td>'+esc(r.reason||'')+'</td></tr>').join('')||'<tr><td colspan="7">No assignment changes yet.</td></tr>';
  byId('assignmentMsg').textContent='';
 }catch(e){
  const msg=e?.message||e?.details||e?.hint||String(e||'Unknown error');
  byId('assignmentMsg').textContent='Could not load assignment manager: '+msg;
  console.error('Assignment manager load failed',e);
 }
}
function renderTlRows(){
 const active=assignmentTeamLeads.filter(x=>x.status!=='inactive');
 byId('tlAssignmentRows').innerHTML=active.map(t=>'<div class="request-card" style="grid-template-columns:1.2fr .7fr .8fr auto"><div><div class="name">'+esc(t.tl_name)+'</div><div class="muted">'+esc(t.tl_email||'Email can be added later')+'</div></div><div>'+statusBadge(t.status==='planned'?'pending':'approved')+'</div><div><label>Lead quota</label><input class="user-map" data-tl-count="'+t.id+'" type="number" min="1" value="500" '+(t.status==='planned'?'disabled':'')+'></div><div><button class="btn primary small" data-tl-assign="'+t.id+'" '+(t.status==='planned'?'disabled':'')+'>Assign</button></div></div>').join('');
 document.querySelectorAll('[data-tl-assign]').forEach(b=>b.onclick=async()=>{
  const t=assignmentTeamLeads.find(x=>x.id===b.dataset.tlAssign),count=Number(document.querySelector('[data-tl-count="'+t.id+'"]').value||0),state=byId('assignState').value||null;
  if(!count)return; if(!confirm('Assign up to '+count.toLocaleString()+' currently unassigned leads to '+t.tl_name+(state?' in '+state:'')+'?'))return;
  b.disabled=true;byId('assignmentMsg').textContent='Assigning leads...';
  const {data,error}=await sb.rpc('assign_leads_to_tl',{p_tl_name:t.tl_name,p_tl_email:t.tl_email||null,p_count:count,p_state:state});
  b.disabled=false;if(error){byId('assignmentMsg').textContent=error.message;return}
  byId('assignmentMsg').textContent=Number(data||0).toLocaleString()+' leads assigned to '+t.tl_name+'.';await loadAssignmentManager();
 });
}
function renderAssignmentSelectors(){
 const active=assignmentTeamLeads.filter(x=>x.status==='active');
 byId('agentAssignTl').innerHTML=active.map(t=>'<option value="'+esc(t.tl_name)+'">'+esc(t.tl_name)+'</option>').join('');
 const activeAgents=assignmentRoster.filter(x=>x.status==='active');
 const opts=activeAgents.map(a=>'<option value="'+esc(a.agent_name)+'" data-email="'+esc(a.agent_email||'')+'">'+esc(a.agent_name)+(a.team_lead_name?' · '+esc(a.team_lead_name):'')+'</option>').join('');
 byId('agentAssignAgent').innerHTML=opts;byId('offboardAgent').innerHTML=opts;
}
byId('refreshAssignmentBtn').onclick=loadAssignmentManager;
byId('assignAgentBtn').onclick=async()=>{
 const tl=byId('agentAssignTl').value,sel=byId('agentAssignAgent'),agent=sel.value,count=Number(byId('agentAssignCount').value||0),email=sel.selectedOptions[0]?.dataset.email||null;
 if(!tl||!agent||!count)return;if(!confirm('Assign up to '+count.toLocaleString()+' '+tl+' leads to '+agent+'?'))return;
 byId('agentAssignMsg').textContent='Assigning...';const {data,error}=await sb.rpc('assign_leads_to_agent',{p_tl_name:tl,p_agent_name:agent,p_agent_email:email,p_count:count});
 if(error){byId('agentAssignMsg').textContent=error.message;return}byId('agentAssignMsg').textContent=Number(data||0).toLocaleString()+' leads assigned to '+agent+'.';await loadAssignmentManager();
};
byId('offboardBtn').onclick=async()=>{
 const agent=byId('offboardAgent').value;if(!agent)return;
 if(!confirm('Mark '+agent+' as RESIGNED? Open leads will be unassigned and moved to the reassignment queue. Closed Won/Lost history stays untouched.'))return;
 const reason=prompt('Reason / note:','Agent resigned')||'Agent resigned';byId('offboardMsg').textContent='Processing...';
 const {data,error}=await sb.rpc('offboard_agent',{p_agent_name:agent,p_reason:reason});
 if(error){byId('offboardMsg').textContent=error.message;return}byId('offboardMsg').textContent=Number(data||0).toLocaleString()+' open leads moved to reassignment queue.';await loadAssignmentManager();
};
