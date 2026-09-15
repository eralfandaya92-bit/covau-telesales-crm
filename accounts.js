(function setupCustomerAccounts(){
  if(document.querySelector('[data-page="accounts"]')) return;
  const nav=document.querySelector('.nav');
  const usersBtn=nav?.querySelector('[data-page="users"]');
  const btn=document.createElement('button');
  btn.dataset.page='accounts';
  btn.textContent='Customer Accounts';
  if(usersBtn) nav.insertBefore(btn,usersBtn); else nav?.appendChild(btn);

  const content=document.querySelector('.content');
  if(content && !byId('accounts')){
    content.insertAdjacentHTML('beforeend',`<section id="accounts" class="page">
      <div class="hero dashboard-head"><div><div class="eyebrow">Closed Won · Customer Lifecycle</div><h2>Customer Accounts</h2><div>Closed Won opportunities automatically graduate into customer account records while preserving the original lead history.</div></div><div><span class="pill" id="accountCountPill">0 accounts</span></div></div>
      <div class="card"><div class="card-h"><h3>Account Management</h3><span class="muted">Click an account to view or update details</span></div><div class="card-b">
        <div class="toolbar"><input id="accountSearch" placeholder="Search account / business / phone / ABN"><select id="accountState" class="compact"><option value="">All states</option><option>NSW</option><option>VIC</option><option>QLD</option><option>SA</option><option>ACT</option><option>TAS</option></select><select id="accountStatus" class="compact"><option value="">All statuses</option><option>Closed Won</option><option>Pending Transfer</option><option>Account Switched</option><option>Active</option><option>Cancelled</option></select><button class="btn primary" id="accountSearchBtn">Search</button></div>
        <div class="table-wrap"><table><thead><tr><th>Account</th><th>Account Name</th><th>Phone</th><th>State</th><th>Status</th><th>Account Manager</th><th>Source</th><th>Transfer Date</th></tr></thead><tbody id="accountsBody"></tbody></table></div>
      </div></div>
    </section>`);
  }

  if(!byId('accountModal')) document.body.insertAdjacentHTML('beforeend',`<div id="accountModal" class="modalbg"><div class="modal"><div class="modal-h"><strong id="accountModalTitle">Customer Account</strong><button class="btn" id="closeAccountModal">Close</button></div><div class="modal-b">
    <div class="section-title">Account Details</div><div class="formgrid">
      <div class="field"><label>Account Code</label><input id="aCode" disabled></div><div class="field"><label>Lead Reference</label><input id="aLeadRef" disabled></div><div class="field"><label>Account Status</label><select id="aStatus"><option>Closed Won</option><option>Pending Transfer</option><option>Account Switched</option><option>Active</option><option>Cancelled</option></select></div>
      <div class="field span2"><label>Account Name</label><input id="aName"></div><div class="field"><label>Scheduled Transfer Date</label><input id="aTransfer" type="date"></div>
      <div class="field"><label>Trading Name</label><input id="aTrading"></div><div class="field"><label>Business Entity</label><input id="aEntity" placeholder="e.g. COMPANY / Sole Trader"></div><div class="field"><label>Industry</label><input id="aIndustry"></div>
      <div class="field"><label>ABN</label><input id="aABN"></div><div class="field"><label>ACN</label><input id="aACN"></div><div class="field"><label>Employee Size</label><input id="aEmployees"></div>
    </div>
    <div class="section-title" style="margin-top:20px">Contact & Address</div><div class="formgrid">
      <div class="field"><label>Contact Name</label><input id="aContact"></div><div class="field"><label>Mobile Number</label><input id="aMobile"></div><div class="field"><label>Email</label><input id="aEmail" type="email"></div>
      <div class="field span3"><label>Postal Address</label><input id="aPostal"></div><div class="field span3"><label>Supply Address</label><input id="aSupply"></div>
      <div class="field"><label>Suburb</label><input id="aSuburb"></div><div class="field"><label>State</label><input id="aState"></div><div class="field"><label>Postcode</label><input id="aPostcode"></div>
    </div>
    <div class="section-title" style="margin-top:20px">Quote & Sales Ownership</div><div class="formgrid">
      <div class="field"><label>Quote ID</label><input id="aQuoteId"></div><div class="field span2"><label>Quote URL</label><input id="aQuoteUrl"></div>
      <div class="field"><label>Quote Status</label><input id="aQuoteStatus"></div><div class="field"><label>Credit Check Status</label><input id="aCredit"></div><div class="field"><label>Account Source</label><input id="aSource"></div>
      <div class="field"><label>Account Manager</label><input id="aAccountManager"></div><div class="field"><label>Sales Manager</label><input id="aSalesManager"></div><div class="field"><label>Sales Group</label><input id="aSalesGroup"></div>
      <div class="field"><label>Language Preferred</label><input id="aLanguage"></div><div class="field"><label>Do Not Call</label><select id="aDNC"><option value="false">No</option><option value="true">Yes</option></select></div><div class="field"><label>Do Not Email</label><select id="aDNE"><option value="false">No</option><option value="true">Yes</option></select></div>
      <div class="field span3"><label>Notes</label><textarea id="aNotes"></textarea></div>
    </div>
    <div id="accountMsg" class="msg"></div>
  </div><div class="modal-f"><button class="btn" id="openLinkedLead">Open Linked Lead</button><button class="btn primary" id="saveAccount">Save Account</button></div></div></div>`);

  const style=document.createElement('style');
  style.textContent='#accounts .hero{margin-bottom:18px}#accounts tbody tr{cursor:pointer}#accountModal .section-title{color:var(--navy)}';
  document.head.appendChild(style);

  let accountRows=[],currentAccount=null;
  window.loadAccounts=async function(){
    let q=sb.from('customer_accounts').select('*').order('updated_at',{ascending:false}).limit(300);
    const term=(byId('accountSearch')?.value||'').trim(),state=byId('accountState')?.value||'',status=byId('accountStatus')?.value||'';
    if(state) q=q.eq('state',state); if(status) q=q.eq('account_status',status);
    if(term) q=q.or('account_name.ilike.%'+term+'%,mobile_number.ilike.%'+term+'%,abn.ilike.%'+term+'%,account_code.ilike.%'+term+'%,lead_reference.ilike.%'+term+'%');
    const {data,error}=await q;
    if(error){byId('accountsBody').innerHTML='<tr><td colspan="8">'+esc(error.message)+'</td></tr>';return}
    accountRows=data||[]; byId('accountCountPill').textContent=accountRows.length.toLocaleString()+' account'+(accountRows.length===1?'':'s');
    byId('accountsBody').innerHTML=accountRows.length?accountRows.map(r=>'<tr data-account="'+r.id+'"><td><b>'+esc(r.account_code)+'</b></td><td>'+esc(r.account_name)+'</td><td>'+esc(r.mobile_number||'')+'</td><td>'+esc(r.state||'')+'</td><td>'+stageBadge(r.account_status)+'</td><td>'+esc(r.account_manager||'')+'</td><td>'+esc(r.account_source||'')+'</td><td>'+esc(r.scheduled_transfer_date||'—')+'</td></tr>').join(''):'<tr><td colspan="8"><div class="empty">No customer accounts yet. The first Closed Won opportunity will create one automatically.</div></td></tr>';
    document.querySelectorAll('[data-account]').forEach(tr=>tr.onclick=()=>openAccount(accountRows.find(x=>x.id===tr.dataset.account)));
  };
  function setv(id,v){if(byId(id))byId(id).value=v??''}
  function openAccount(r){currentAccount=r;byId('accountModalTitle').textContent=(r.account_code||'Account')+' — '+(r.account_name||'');
    setv('aCode',r.account_code);setv('aLeadRef',r.lead_reference);setv('aStatus',r.account_status||'Closed Won');setv('aName',r.account_name);setv('aTransfer',r.scheduled_transfer_date);setv('aTrading',r.trading_name);setv('aEntity',r.business_entity);setv('aIndustry',r.industry);setv('aABN',r.abn);setv('aACN',r.acn);setv('aEmployees',r.employee_size);setv('aContact',r.contact_name);setv('aMobile',r.mobile_number);setv('aEmail',r.email);setv('aPostal',r.postal_address);setv('aSupply',r.supply_address);setv('aSuburb',r.suburb);setv('aState',r.state);setv('aPostcode',r.postcode);setv('aQuoteId',r.quote_id);setv('aQuoteUrl',r.quote_url);setv('aQuoteStatus',r.quote_status);setv('aCredit',r.credit_check_status);setv('aSource',r.account_source);setv('aAccountManager',r.account_manager);setv('aSalesManager',r.sales_manager);setv('aSalesGroup',r.sales_group);setv('aLanguage',r.language_preferred||'English');setv('aDNC',String(!!r.do_not_call));setv('aDNE',String(!!r.do_not_email));setv('aNotes',r.notes);byId('accountMsg').textContent='';byId('accountModal').classList.add('show')}
  byId('closeAccountModal').onclick=()=>byId('accountModal').classList.remove('show');
  byId('accountSearchBtn').onclick=loadAccounts; byId('accountState').onchange=loadAccounts; byId('accountStatus').onchange=loadAccounts;
  byId('accountSearch').addEventListener('keydown',e=>{if(e.key==='Enter')loadAccounts()});
  byId('saveAccount').onclick=async()=>{if(!currentAccount)return;const patch={account_name:byId('aName').value.trim(),account_status:byId('aStatus').value,scheduled_transfer_date:byId('aTransfer').value||null,trading_name:byId('aTrading').value||null,business_entity:byId('aEntity').value||null,industry:byId('aIndustry').value||null,abn:byId('aABN').value||null,acn:byId('aACN').value||null,employee_size:byId('aEmployees').value||null,contact_name:byId('aContact').value||null,mobile_number:byId('aMobile').value||null,email:byId('aEmail').value||null,postal_address:byId('aPostal').value||null,supply_address:byId('aSupply').value||null,suburb:byId('aSuburb').value||null,state:byId('aState').value||null,postcode:byId('aPostcode').value||null,quote_id:byId('aQuoteId').value||null,quote_url:byId('aQuoteUrl').value||null,quote_status:byId('aQuoteStatus').value||null,credit_check_status:byId('aCredit').value||null,account_source:byId('aSource').value||null,account_manager:byId('aAccountManager').value||null,sales_manager:byId('aSalesManager').value||null,sales_group:byId('aSalesGroup').value||null,language_preferred:byId('aLanguage').value||null,do_not_call:byId('aDNC').value==='true',do_not_email:byId('aDNE').value==='true',notes:byId('aNotes').value||null,updated_at:new Date().toISOString()};byId('accountMsg').textContent='Saving...';const {error}=await sb.from('customer_accounts').update(patch).eq('id',currentAccount.id);if(error){byId('accountMsg').textContent=error.message;return}byId('accountMsg').textContent='Account saved.';await loadAccounts();setTimeout(()=>byId('accountModal').classList.remove('show'),600)};
  byId('openLinkedLead').onclick=()=>{if(!currentAccount?.lead_reference)return;byId('accountModal').classList.remove('show');goPage('leads');byId('leadSearch').value=currentAccount.lead_reference;loadLeads()};
  btn.onclick=()=>{goPage('accounts');byId('pageTitle').textContent='Customer Accounts';loadAccounts()};
})();