(function setupAgentWorkspace(){
  const nav=document.querySelector('.nav');
  if(!nav||document.querySelector('[data-page="agent-workspace"]'))return;
  const navButton=document.createElement('button');
  navButton.dataset.page='agent-workspace';
  navButton.textContent='Agent Workspace';
  nav.insertBefore(navButton,nav.firstChild);

  const dispositions=['Answering Machine','No Answer','Call Back','Email Sent','Not Interested','Unreachable','DNC','Head Office','Unserviceable','Dead Air','Early Hangup','Invoice Received'];
  const opportunityStages=['Qualification','Needs Analysis','Proposal','Negotiation','Closed Won','Closed Lost'];
  const content=document.querySelector('.content');
  content.insertAdjacentHTML('beforeend',`<section id="agent-workspace" class="page agent-workspace">
    <div class="agent-hero"><div><div class="eyebrow">Personal sales workspace</div><h2>Today's Work Queue</h2><div id="agentWorkspaceOwner">Your assigned leads, follow-ups and opportunities</div></div><button class="btn agent-refresh" id="agentRefresh">Refresh queue</button></div>
    <div id="agentWorkspaceNotice" class="notice hidden"></div>
    <div class="agent-kpis" id="agentKpis"></div>
    <div class="agent-layout">
      <div class="agent-queue card"><div class="card-h"><div><h3>Today's Leads</h3><span class="muted" id="agentQueueSummary">Loading queue…</span></div><div class="agent-queue-tabs"><button class="active" data-agent-queue="today">Work Queue</button><button data-agent-queue="followups">Follow-ups Due</button></div></div><div class="card-b"><input id="agentLeadSearch" class="agent-search" placeholder="Search business, phone or Lead ID"><div id="agentLeadQueue" class="agent-list"></div></div></div>
      <div class="agent-panel card"><div class="card-h"><div><h3 id="agentPanelTitle">Lead Workspace</h3><span class="muted" id="agentPanelSubtitle">Select a lead from your queue</span></div><span id="agentDerivedStage" class="badge new">New</span></div><div class="card-b" id="agentPanelEmpty"><div class="empty">Choose a lead to start working.</div></div>
      <form id="agentLeadForm" class="hidden"><div class="agent-panel-scroll"><div class="agent-section"><div class="section-title">Business and contact details</div><div class="agent-contact-alert hidden" id="awContactAlert"></div><div class="agent-detail-grid"><div><span>Business</span><b id="awBusiness">—</b></div><div><span>Phone</span><b id="awPhone">—</b><a id="awCall" class="btn primary agent-call hidden" href="#">Call lead</a></div><div><span>Prospect email</span><b id="awEmail">—</b></div><div><span>Industry</span><b id="awIndustry">—</b></div><div><span>Address</span><b id="awAddress">—</b></div><div><span>Last Contact</span><b id="awLastContact">—</b></div><div><span>Lead ID</span><b id="awLeadId">—</b></div><div><span>Lead source</span><b id="awLeadSource">—</b></div><div><span>Source tab</span><b id="awSourceTab">—</b></div></div><div class="agent-readonly-note"><span>Lead Notes</span><div id="awLeadNotes">—</div></div></div>
      <div class="agent-section"><div class="section-title">Contact result</div><div class="formgrid"><div class="field"><label>Call outcome / Disposition</label><select id="awDisposition"><option value="">Select outcome</option>${dispositions.map(x=>`<option>${x}</option>`).join('')}</select></div><div class="field"><label>Decision Maker</label><select id="awDecisionMaker"><option value="">Unknown</option><option>Y</option><option>N</option><option>Unknown</option></select></div><div class="field"><label>Next Follow-up</label><input id="awNextFollowup" type="date"></div><div class="field span3"><label>Remarks / Activity Notes</label><textarea id="awRemarks" placeholder="Capture the conversation, next action and relevant context"></textarea></div></div></div>
      <div class="agent-section"><div class="section-title">Invoice and quote</div><div class="formgrid"><div class="field"><label>Invoice Status</label><select id="awInvoice"><option value="">Not requested</option><option>Requested</option><option>Received</option></select></div><div class="field"><label>Current Retailer</label><input id="awRetailer"></div><div class="field"><label>Tariff</label><input id="awTariff"></div><div class="field"><label>Quote Status</label><select id="awQuote"><option value="">Not started</option><option>Pricing Requested</option><option>Pricing Received</option><option>Quote Sent</option><option>Quote Opened</option></select></div><div class="field span2"><label>Opportunity Stage</label><select id="awOpportunity"><option value="">Not yet an opportunity</option>${opportunityStages.map(x=>`<option>${x}</option>`).join('')}</select><div class="muted agent-help">Qualification → Needs Analysis → Proposal → Negotiation → Closed Won / Closed Lost</div></div></div></div></div>
      <div class="agent-savebar"><div><span class="muted">Lead Stage is derived automatically. Recycling / disposal remains a separate status.</span><div id="agentSaveMessage" class="msg"></div></div><div class="agent-save-actions"><button class="btn" type="submit" data-save-mode="save">Save</button><button class="btn primary" type="submit" data-save-mode="next">Save &amp; Next Lead</button></div></div></form></div>
    </div></section>`);

  const style=document.createElement('style');
  style.textContent=`.agent-workspace{--agent-accent:#18a57a}.agent-hero{background:linear-gradient(135deg,#092b4d,#0f5270);color:#fff;border-radius:14px;padding:20px 22px;margin-bottom:16px;display:flex;align-items:flex-end;justify-content:space-between;gap:18px}.agent-hero h2{font-size:26px;margin:4px 0}.agent-hero .eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:.12em;opacity:.72;font-weight:900}.agent-refresh{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.28);color:#fff}.agent-kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:16px}.agent-kpi{background:#fff;border:1px solid var(--line);border-radius:12px;padding:14px;border-top:3px solid var(--agent-accent)}.agent-kpi span{display:block;color:var(--muted);font-size:11px;text-transform:uppercase;font-weight:900}.agent-kpi b{display:block;color:var(--navy);font-size:25px;margin-top:5px}.agent-layout{display:grid;grid-template-columns:minmax(300px,.72fr) minmax(520px,1.28fr);gap:16px;align-items:start}.agent-queue,.agent-panel{margin:0}.agent-queue{position:sticky;top:86px}.agent-queue-tabs{display:flex;gap:5px}.agent-queue-tabs button{border:0;border-radius:7px;padding:7px 9px;background:#edf3f7;color:var(--navy);font-size:11px;font-weight:900;cursor:pointer}.agent-queue-tabs button.active{background:var(--navy);color:#fff}.agent-search{width:100%;padding:10px;border:1px solid #cad7e1;border-radius:8px;margin-bottom:10px}.agent-list{display:grid;gap:7px;max-height:650px;overflow:auto}.agent-lead{width:100%;text-align:left;border:1px solid #e1e8ee;background:#fff;border-radius:10px;padding:11px;cursor:pointer;color:var(--ink)}.agent-lead:hover,.agent-lead.active{border-color:#6d9fc3;background:#f2f8fc}.agent-lead-top{display:flex;justify-content:space-between;gap:8px;align-items:center}.agent-lead b{color:var(--navy)}.agent-lead-meta{color:var(--muted);font-size:11px;margin-top:5px;display:flex;justify-content:space-between;gap:8px}.agent-panel{min-height:560px}.agent-panel .card-h{min-height:67px}.agent-panel-scroll{max-height:calc(100vh - 240px);overflow:auto;padding:18px}.agent-section{padding-bottom:19px;margin-bottom:19px;border-bottom:1px solid #e6edf2}.agent-section:last-child{border-bottom:0;margin-bottom:0}.agent-detail-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.agent-detail-grid>div{background:#f7fafc;border:1px solid #e2eaf0;border-radius:9px;padding:10px;min-width:0}.agent-detail-grid span,.agent-readonly-note span{display:block;font-size:10px;text-transform:uppercase;color:var(--muted);font-weight:900;margin-bottom:4px}.agent-detail-grid b{display:block;overflow-wrap:anywhere}.agent-call{display:inline-block;margin-top:9px;text-decoration:none;padding:7px 12px}.agent-contact-alert{background:#fff4d9;border:1px solid #ecdca8;color:#805d13;border-radius:9px;padding:10px 12px;font-size:12px;font-weight:800;margin-bottom:10px}.agent-readonly-note{margin-top:10px;background:#f7fafc;border:1px solid #e2eaf0;border-radius:9px;padding:10px;white-space:pre-wrap}.agent-savebar{border-top:1px solid var(--line);background:#fff;padding:13px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;position:sticky;bottom:0}.agent-save-actions{display:flex;gap:8px;flex-shrink:0}.agent-help{margin-top:5px}.agent-workspace .converted{background:#e5f4ec;color:#246749}@media(max-width:1150px){.agent-kpis{grid-template-columns:repeat(3,1fr)}.agent-layout{grid-template-columns:1fr}.agent-queue{position:static}.agent-panel-scroll{max-height:none}}@media(max-width:700px){.agent-kpis{grid-template-columns:repeat(2,1fr)}.agent-detail-grid{grid-template-columns:1fr}.agent-hero{align-items:flex-start;flex-direction:column}.agent-savebar{align-items:flex-start;flex-direction:column}.agent-save-actions{width:100%}.agent-save-actions .btn{flex:1}}`;
  document.head.appendChild(style);

  let queueMode='today',queueRows=[],selectedLead=null;
  const today=()=>new Date().toISOString().slice(0,10);
  const mappedAgent=()=>profile?.assigned_agent_name||'';
  const isDue=r=>!!r.next_follow_up&&r.next_follow_up<=today()&&!['Closed Won','Closed Lost'].includes(r.opportunity_stage||'');
  const displayPhone=r=>String(r.phone_number||r.phone_normalized||'').trim();
  const validPhone=value=>String(value||'').replace(/\D/g,'').length>=8;
  const phoneLike=value=>/(?:\+?61|0)?[\d\s().-]{8,}\d/.test(String(value||''));
  const meaningfulPart=value=>{const clean=String(value||'').trim();return clean&&!['·','-','—'].includes(clean)?clean:''};
  const displayAddress=r=>[r.address,r.suburb,r.state].map(meaningfulPart).filter(Boolean).join(', ');
  const needsFollowup=values=>['Call Back','Email Sent'].includes(values.disposition);
  function deriveLeadStage(values){
    if(values.opportunity_stage==='Closed Won')return 'Converted';
    if(values.opportunity_stage||values.invoice_status==='Received')return 'Opportunity';
    if(values.disposition==='Head Office')return 'Unqualified';
    if(values.next_follow_up||['Call Back','Email Sent'].includes(values.disposition))return 'Nurturing';
    if(values.decision_maker==='Y'||['Not Interested','DNC','Unserviceable'].includes(values.disposition))return 'Contacted';
    if(values.disposition||values.remarks)return 'In Progress';
    return 'New';
  }
  function agentScope(q){return mappedAgent()?q.eq('agent_name',mappedAgent()):q.eq('agent_name','__NO_AGENT_MAPPING__')}
  async function loadAgentWorkspace(){
    const notice=byId('agentWorkspaceNotice');
    notice.classList.toggle('hidden',!!mappedAgent());
    notice.textContent=mappedAgent()?'':'Your account needs an Agent Mapping before a personal queue can be loaded.';
    byId('agentWorkspaceOwner').textContent=mappedAgent()?'Working as '+mappedAgent():'Your assigned leads, follow-ups and opportunities';
    let q=sb.from('leads').select('id,lead_id,business_name,industry_type,phone_number,phone_normalized,prospect_email,address,suburb,state,agent_name,disposition,decision_maker,lead_stage,last_contact_date,next_follow_up,lead_notes,remarks,lead_source,sub_source,source_tab,invoice_status,current_retailer,tariff_code,quote_status,opportunity_stage,outcome,converted_date,created_at,updated_at').order('next_follow_up',{ascending:true,nullsFirst:false}).limit(1000);
    const {data,error}=await agentScope(q);
    if(error){notice.classList.remove('hidden');notice.textContent='Workspace could not load: '+error.message;return}
    queueRows=data||[];
    renderAgentKpis();renderAgentQueue();
    if(selectedLead){const refreshed=queueRows.find(x=>x.id===selectedLead.id);if(refreshed)selectAgentLead(refreshed)}
  }
  function renderAgentKpis(){
    const todayStart=today();
    const workedToday=queueRows.filter(r=>(r.updated_at||'').slice(0,10)===todayStart&&deriveLeadStage(r)!=='New').length;
    const opportunity=queueRows.filter(r=>deriveLeadStage(r)==='Opportunity').length;
    const converted=queueRows.filter(r=>r.opportunity_stage==='Closed Won').length;
    const kpis=[['Assigned',queueRows.length],['Worked Today',workedToday],['Follow-ups Due',queueRows.filter(isDue).length],['Opportunities',opportunity],['Converted',converted]];
    byId('agentKpis').innerHTML=kpis.map(([label,value])=>`<div class="agent-kpi"><span>${label}</span><b>${Number(value).toLocaleString()}</b></div>`).join('');
  }
  function visibleRows(){
    const term=(byId('agentLeadSearch').value||'').trim().toLowerCase();
    let rows=queueMode==='followups'?queueRows.filter(isDue):queueRows.filter(r=>deriveLeadStage(r)!=='Converted');
    if(term)rows=rows.filter(r=>[r.business_name,displayPhone(r),r.prospect_email,r.lead_id,r.suburb].some(v=>String(v||'').toLowerCase().includes(term)));
    return rows;
  }
  function renderAgentQueue(){
    const rows=visibleRows();
    byId('agentQueueSummary').textContent=rows.length.toLocaleString()+(queueMode==='followups'?' due or overdue':' ready to work');
    byId('agentLeadQueue').innerHTML=rows.length?rows.map(r=>`<button type="button" class="agent-lead ${selectedLead?.id===r.id?'active':''}" data-agent-lead="${r.id}"><div class="agent-lead-top"><b>${esc(r.business_name||'Unnamed business')}</b>${stageBadge(deriveLeadStage(r))}</div><div class="agent-lead-meta"><span>${esc(displayPhone(r)||r.suburb||'No canonical phone')}</span><span>${r.next_follow_up?'Due '+esc(r.next_follow_up):esc(r.lead_id||'')}</span></div></button>`).join(''):'<div class="empty">No leads in this queue.</div>';
    document.querySelectorAll('[data-agent-lead]').forEach(el=>el.onclick=()=>selectAgentLead(queueRows.find(r=>r.id===el.dataset.agentLead)));
  }
  function setText(id,value){byId(id).textContent=value||'—'}
  function setValue(id,value){byId(id).value=value||''}
  function selectAgentLead(r){
    if(!r)return;selectedLead=r;renderAgentQueue();
    const phone=displayPhone(r),address=displayAddress(r),hasPhone=validPhone(phone),possiblePhone=!phone&&phoneLike(r.remarks);
    byId('agentPanelEmpty').classList.add('hidden');byId('agentLeadForm').classList.remove('hidden');
    setText('agentPanelTitle',r.business_name||'Lead Workspace');setText('agentPanelSubtitle',[r.suburb,r.state,phone].map(meaningfulPart).filter(Boolean).join(' · '));
    setText('awBusiness',r.business_name);setText('awPhone',phone);setText('awEmail',r.prospect_email);setText('awIndustry',r.industry_type);setText('awAddress',address);setText('awLastContact',r.last_contact_date);setText('awLeadId',r.lead_id);setText('awLeadSource',[r.lead_source,r.sub_source].map(meaningfulPart).filter(Boolean).join(' · '));setText('awSourceTab',r.source_tab);setText('awLeadNotes',r.lead_notes);
    const call=byId('awCall');call.classList.toggle('hidden',!hasPhone);call.href=hasPhone?'tel:'+phone.replace(/[^\d+]/g,''):'#';
    const alert=byId('awContactAlert'),alerts=[];if(possiblePhone)alerts.push('Possible contact number found in remarks');if(!phone)alerts.push('Canonical phone is missing');if(!meaningfulPart(r.address)||!meaningfulPart(r.suburb))alerts.push(address?'Address is incomplete':'Address is missing');alert.textContent=alerts.join(' · ');alert.classList.toggle('hidden',!alerts.length);
    setValue('awDisposition',r.disposition);setValue('awDecisionMaker',r.decision_maker);setValue('awNextFollowup',r.next_follow_up);setValue('awRemarks',r.remarks);setValue('awInvoice',r.invoice_status);setValue('awRetailer',r.current_retailer);setValue('awTariff',r.tariff_code);setValue('awQuote',r.quote_status);setValue('awOpportunity',r.opportunity_stage);
    updateDerivedStagePreview();byId('agentSaveMessage').textContent='';
  }
  function formValues(){return {disposition:byId('awDisposition').value||null,decision_maker:byId('awDecisionMaker').value||null,next_follow_up:byId('awNextFollowup').value||null,remarks:byId('awRemarks').value.trim()||null,invoice_status:byId('awInvoice').value||null,current_retailer:byId('awRetailer').value.trim()||null,tariff_code:byId('awTariff').value.trim()||null,quote_status:byId('awQuote').value||null,opportunity_stage:byId('awOpportunity').value||null}}
  function updateDerivedStagePreview(){const values=formValues(),stage=deriveLeadStage(values),followup=byId('awNextFollowup');followup.required=needsFollowup(values);followup.setAttribute('aria-required',String(followup.required));const badge=byId('agentDerivedStage');badge.textContent=stage;badge.className='badge '+stage.toLowerCase().replaceAll(' ','')}
  ['awDisposition','awDecisionMaker','awNextFollowup','awRemarks','awInvoice','awOpportunity'].forEach(id=>byId(id).addEventListener(id==='awRemarks'?'input':'change',updateDerivedStagePreview));
  byId('agentLeadForm').onsubmit=async e=>{
    e.preventDefault();if(!selectedLead)return;
    const values=formValues(),stage=deriveLeadStage(values);
    if(needsFollowup(values)&&!values.next_follow_up){byId('agentSaveMessage').textContent='Next Follow-up is required for '+values.disposition+'.';byId('awNextFollowup').focus();return}
    const saveMode=e.submitter?.dataset.saveMode||'save',currentId=selectedLead.id,currentRows=visibleRows(),currentIndex=currentRows.findIndex(r=>r.id===currentId),nextLead=currentRows[currentIndex+1]||currentRows[0]||null;
    let outcome=selectedLead.outcome||null,convertedDate=null;
    if(values.opportunity_stage==='Closed Won'){outcome='Closed Won';convertedDate=today()}
    else if(values.opportunity_stage==='Closed Lost'){outcome='Closed Lost'}
    else if(outcome==='Closed Won'||outcome==='Closed Lost')outcome=null;
    const patch={...values,lead_stage:stage,outcome,converted_date:convertedDate,last_contact_date:today()};
    byId('agentSaveMessage').textContent='Saving activity…';
    const {error}=await sb.from('leads').update(patch).eq('id',selectedLead.id);
    if(error){byId('agentSaveMessage').textContent='Could not save: '+error.message;return}
    byId('agentSaveMessage').textContent='Activity saved. Lead Stage updated to '+stage+'.';
    await loadAgentWorkspace();
    if(saveMode==='next'&&nextLead&&nextLead.id!==currentId){const refreshedNext=queueRows.find(r=>r.id===nextLead.id);if(refreshedNext)selectAgentLead(refreshedNext)}
  };
  document.querySelectorAll('[data-agent-queue]').forEach(button=>button.onclick=()=>{queueMode=button.dataset.agentQueue;document.querySelectorAll('[data-agent-queue]').forEach(x=>x.classList.toggle('active',x===button));renderAgentQueue()});
  byId('agentLeadSearch').addEventListener('input',renderAgentQueue);byId('agentRefresh').onclick=loadAgentWorkspace;
  navButton.onclick=()=>{goPage('agent-workspace');byId('pageTitle').textContent='Agent Workspace';loadAgentWorkspace()};
  const originalGoPage=window.goPage||goPage;
  window.goPage=function(page){originalGoPage(page);if(page==='agent-workspace')loadAgentWorkspace()};
})();
