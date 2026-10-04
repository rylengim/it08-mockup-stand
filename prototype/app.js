'use strict';
const icons = {
  grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m18 0v-2a4 4 0 0 0-3-3.9"/><circle cx="9" cy="7" r="4"/><path d="M16 3a4 4 0 0 1 0 8"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18m-12 4h2m3 0h2"/>',
  wallet:'<path d="M20 8V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v12H5a3 3 0 0 1-3-3V6m18 6h-5v5h5"/>',
  chat:'<path d="M21 11a8 8 0 0 1-8 8H7l-4 3V11a9 9 0 0 1 18 0Z"/><path d="M7 10h10m-10 4h6"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  tasks:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m6 8 1 1 2-2m3 1h6m-12 8 1 1 2-2m3 1h6"/>',
  funnel:'<path d="M3 3h18l-7 8v7l-4 3V11Z"/>',
  layers:'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5m-18 5 9 5 9-5"/>',
  settings:'<path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3"/><circle cx="16" cy="17" r="3"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  arrow:'<path d="m9 5 7 7-7 7"/>',
  back:'<path d="m15 5-7 7 7 7"/>',
  file:'<path d="M14 2H5v20h14V7Z"/><path d="M14 2v6h5M8 13h8m-8 4h6"/>',
  refresh:'<path d="M20 7V3l-4 4a8 8 0 1 0 3 10M20 7h-5"/>',
  send:'<path d="m22 2-7 20-4-9L2 9 22 2Zm-11 11L22 2"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]||icons.grid}</svg>`;
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plural=(n,forms)=>forms[n%100>=11&&n%100<=14?2:n%10===1?0:n%10>=2&&n%10<=4?1:2];
const money = n => new Intl.NumberFormat('ru-RU').format(n)+' ₽';
const initialOptions = {nav:'side',students:'table',detail:'drawer',schedule:'day',payments:'table',tasks:'list',density:'normal',theme:'light',contacts:true};
const optionDefs = [
  ['nav','Навигация',[['side','Слева'],['top','Сверху']]],
  ['students','Список учеников',[['table','Таблица'],['cards','Карточки']]],
  ['detail','Карточка ученика',[['drawer','Справа'],['modal','Окно'],['page','Страница']]],
  ['schedule','Расписание',[['day','День'],['week','Неделя'],['list','Список']]],
  ['payments','Оплаты',[['table','Таблица'],['cards','По ученикам']]],
  ['tasks','Задачи',[['list','Список'],['board','Доска']]],
  ['density','Плотность',[['normal','Обычная'],['compact','Компактная']]],
  ['theme','Тема',[['light','Светлая'],['dark','Тёмная'],['paper','Бумага']]]
];
function loadOptions(){
  let saved={};
  try{saved=JSON.parse(localStorage.getItem('it08-prototype-options')||'{}');}catch{}
  try{if(location.hash.startsWith('#v='))saved=JSON.parse(decodeURIComponent(location.hash.slice(3)));}catch{}
  return {...initialOptions,...Object.fromEntries(optionDefs.map(([key,,values])=>[key,values.some(([v])=>v===saved[key])?saved[key]:initialOptions[key]])),contacts:typeof saved.contacts==='boolean'?saved.contacts:true};
}
function freshData(){const data=structuredClone(DEMO);for(const s of data.students){s.channels=s.connected?[s.channel]:[];s.invited=[];}for(const [id,thread] of Object.entries(data.threads))for(const message of thread)message.channel=data.students.find(s=>s.id===id).channel;return data;}
const state = {view:'today',options:loadOptions(),data:freshData(),query:'',filter:'all',student:null,studentTab:'overview',chat:'s1',chatChannel:'Telegram',attendance:{},files:{},notes:{},day:0};
const channelConnected=s=>s.channels.includes(state.chatChannel);
const navItems=[['today','Рабочий день','grid'],['students','Ученики','users'],['groups','Группы','layers'],['schedule','Расписание','calendar'],['payments','Оплаты','wallet'],['messages','Сообщения','chat'],['tasks','Задачи','tasks'],['funnel','Воронка','funnel'],['staff','Сотрудники','users']];
const titles=Object.fromEntries(navItems.map(([key,title])=>[key,title]));
const student=id=>state.data.students.find(s=>s.id===id);
const group=id=>state.data.groups.find(g=>g.id===id);
const initials=name=>name.split(' ').map(x=>x[0]).slice(0,2).join('');
const badge=(text,color='')=>`<span class="tag ${color}">${esc(text)}</span>`;
const statusBadge=s=>badge(({active:'Учится',lead:'Лид',archive:'Архив'})[s],s==='active'?'green':'');
const dayNames=['Понедельник, 5 октября','Вторник, 6 октября','Среда, 7 октября','Четверг, 8 октября','Пятница, 9 октября'];
function segments(key,values,selected,action='view-option'){
  return `<div class="seg" role="group" aria-label="${esc(optionDefs.find(d=>d[0]===key)?.[1]||key)}">${values.map(([v,label])=>`<button type="button" data-action="${action}" data-key="${key}" data-value="${v}" aria-pressed="${selected===v}">${esc(label)}</button>`).join('')}</div>`;
}
function person(s){return `<div class="name"><span class="avatar">${initials(s.name)}</span><div><button class="link-button" data-action="student" data-id="${s.id}">${esc(s.name)}</button><small>${esc(s.grade)} класс${state.options.contacts?' · '+esc(s.parent):''}</small></div></div>`;}
function table(headers,rows,footer=''){
  return `<div class="panel"><div class="table-wrap"><table><thead><tr>${headers.map(x=>`<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>${footer?`<div class="table-footer">${footer}</div>`:''}</div>`;
}
function empty(title,text){return `<div class="panel empty"><h2>${esc(title)}</h2><p>${esc(text)}</p></div>`;}
function saveOptions(){try{localStorage.setItem('it08-prototype-options',JSON.stringify(state.options));}catch{} document.body.classList.toggle('top-nav',state.options.nav==='top');document.body.classList.toggle('compact',state.options.density==='compact');document.documentElement.classList.toggle('dark',state.options.theme==='dark');document.documentElement.classList.toggle('paper',state.options.theme==='paper');}
function render(){
  const active=document.activeElement,focusId=active?.id,selection=active?.selectionStart;
  saveOptions();
  document.getElementById('app').innerHTML=`<div class="shell"><aside class="sidebar"><div class="brand"><span class="brand-mark">it.</span><span>IT-Факультеты<small>Учебный центр</small></span></div><nav class="nav" aria-label="Разделы CRM">${navItems.map(([key,title,i])=>`<button data-action="nav" data-view="${key}" ${state.view===key?'aria-current="page"':''}>${icon(i)}${title}</button>`).join('')}</nav><div class="side-footer"><span class="avatar">АД</span><div>Администратор<small style="display:block;margin-top:3px">Рабочее пространство</small></div></div></aside><div class="workspace"><header class="topbar"><div class="topbar-left"><span class="prototype-tag">Интерактивный прототип</span><span class="date-context">Демо · 5 октября 2026</span></div><div class="topbar-right"><button class="ghost small" data-action="reset">${icon('refresh')}<span class="reset-label">Сбросить демо</span></button><button data-action="variants">${icon('settings')}Варианты</button></div></header><main class="content" id="content" tabindex="-1">${renderView()}</main></div></div>`;
  if(focusId){const el=document.getElementById(focusId);if(el){el.focus({preventScroll:true});if(typeof selection==='number'&&el.setSelectionRange)el.setSelectionRange(selection,selection);}}
}
function heading(title,subtitle,actions=''){return `<div class="heading"><div><h1>${title}</h1><p>${subtitle}</p></div><div class="actions">${actions}</div></div>`;}
function searchBox(placeholder='Имя ученика или родителя'){return `<div class="search">${icon('search')}<input id="search-input" type="search" aria-label="Поиск" placeholder="${placeholder}" value="${esc(state.query)}"></div>`;}
function renderView(){
  if(state.view==='student-page')return studentContent(state.student,true);
  const views={today:todayView,students:studentsView,groups:groupsView,schedule:scheduleView,payments:paymentsView,messages:messagesView,tasks:tasksView,funnel:funnelView,staff:staffView};
  return views[state.view]();
}
function todayView(){
  const today=state.data.lessons.filter(l=>l.day===0),open=state.data.tasks.filter(t=>t.status!=='done'),due=state.data.students.filter(s=>s.debt>0),unconnected=state.data.students.filter(s=>s.status==='active'&&!s.connected);
  return heading('Рабочий день','Понедельник, 5 октября · пример смены администратора',`<button class="primary" data-action="new-student">${icon('plus')}Добавить ученика</button>`)+`<div class="stats">${[['Занятия сегодня',today.length,'Расписание на день'],['Активные ученики',state.data.students.filter(s=>s.status==='active').length,'В демонстрационной базе'],['Нужна сверка оплаты',due.length,money(due.reduce((a,s)=>a+s.debt,0))+' · пример суммы'],['Открытые задачи',open.length,'По всем сотрудникам']].map(([label,n,sub])=>`<div class="stat"><small>${label}</small><div class="stat-value">${n}</div><small>${sub}</small></div>`).join('')}</div><div class="two-col"><div class="stack"><section class="panel"><div class="section-head"><h2>Занятия сегодня</h2><button class="ghost small" data-action="nav" data-view="schedule">Всё расписание ${icon('arrow')}</button></div>${today.map(lessonRow).join('')}</section><section class="panel"><div class="section-head"><h2>Нужен контакт с семьёй</h2>${badge(due.length+' оплаты','amber')}</div>${due.map(s=>`<div class="lesson">${person(s)}<div class="actions"><span class="balance">${money(s.debt)}</span><button class="small" data-action="message-student" data-id="${s.id}">Написать</button></div></div>`).join('')}</section></div><div class="stack"><section class="panel"><div class="section-head"><h2>Задачи на сегодня</h2><button class="ghost small" data-action="nav" data-view="tasks">Все ${icon('arrow')}</button></div>${open.slice(0,3).map(taskRow).join('')}</section><section class="panel"><div class="panel-body"><h2>Подключение к боту</h2><p class="details-line" style="margin-top:10px">${unconnected.length} ${plural(unconnected.length,['активный ученик ещё не подключён','активных ученика ещё не подключены','активных учеников ещё не подключены'])}. Приглашение помогает семье получать напоминания.</p><div style="margin-top:18px">${unconnected.map(s=>`<div class="row" style="justify-content:space-between">${person(s)}<button class="small" data-action="${s.invited.includes(s.channel)?'connect-demo':'invite'}" data-id="${s.id}">${s.invited.includes(s.channel)?'Показать подключение':'Пригласить'}</button></div>`).join('')||'<small>Все активные ученики подключены.</small>'}</div></div></section></div></div>`;
}
function studentsView(){
  const items=state.data.students.filter(s=>(state.filter==='all'||s.status===state.filter)&&[s.name,s.parent,s.grade].join(' ').toLowerCase().includes(state.query.toLowerCase()));
  const toolbar=`<div class="toolbar"><div class="filters">${searchBox()}<select id="student-filter" aria-label="Статус клиента">${[['all','Все ученики'],['active','Учатся'],['lead','Лиды'],['archive','Архив']].map(([v,l])=>`<option value="${v}" ${state.filter===v?'selected':''}>${l}</option>`).join('')}</select></div>${segments('students',optionDefs[1][2],state.options.students)}</div>`;
  let body=empty('Никого не нашли','Измените запрос или статус клиента.');
  if(items.length)body=state.options.students==='cards'?`<div class="card-grid">${items.map(s=>`<article class="person-card">${person(s)}<div class="card-meta">${statusBadge(s.status)}${badge(s.connected?'Бот подключён':'Без бота',s.connected?'green':'amber')}</div><div class="details-line">${s.group?esc(group(s.group).name):'Группа ещё не выбрана'}</div><div class="card-meta"><small>Остаток: ${s.remaining} занятий</small><strong>${s.debt?money(s.debt):'Оплачено'}</strong></div></article>`).join('')}</div>`:table(['Ученик','Группа','Статус','Абонемент','Задолженность','Канал'],items.map(s=>`<tr><td>${person(s)}</td><td>${s.group?esc(group(s.group).subject):'—'}</td><td>${statusBadge(s.status)}</td><td>${s.remaining?s.remaining+' занятий':'—'}</td><td>${s.debt?badge(money(s.debt),'amber'):'—'}</td><td>${badge(s.channel,s.connected?'green':'')} ${!s.connected?'<small>не подключён</small>':''}</td></tr>`),`<span>${items.length} из ${state.data.students.length} учеников</span><span>Демонстрационные данные</span>`);
  return heading('Ученики','Связанные карточки, группы и история обучения',`<button class="primary" data-action="new-student">${icon('plus')}Добавить ученика</button>`)+toolbar+body;
}
function lessonRow(l){
  const g=group(l.group),count=state.data.students.filter(s=>s.group===g.id&&s.status==='active').length;
  return `<div class="lesson"><div class="lesson-time">${esc(l.time)}<small>${esc(l.end)}</small></div><div class="lesson-info"><strong>${esc(g.name)} ${l.state==='cancelled'?badge('Отменено'):''}</strong><small>${esc(g.teacher)} · ${count} ${plural(count,['ученик','ученика','учеников'])} · ${esc(g.place)}</small></div><div class="actions"><button class="small" data-action="lesson" data-id="${l.id}">Открыть ${icon('arrow')}</button></div></div>`;
}
function taskRow(t){return `<label class="task-row"><input type="checkbox" data-task="${t.id}" ${t.status==='done'?'checked':''} aria-label="Выполнено: ${esc(t.title)}"><span class="task-text ${t.status==='done'?'completed':''}">${esc(t.title)}<small>${esc(t.assignee)} · ${esc(t.time)}</small></span>${t.priority==='high'?badge('Важно','amber'):''}</label>`;}
function showVariants(){
  const d=document.getElementById('variants');d.className='drawer';
  d.innerHTML=`<div class="dialog-head"><div><h2 id="variants-title">Варианты интерфейса</h2><small>До трёх решений на каждый элемент</small></div><button class="icon ghost" data-action="close" aria-label="Закрыть варианты">${icon('close')}</button></div>${optionDefs.map(([key,label,values])=>`<div class="option-group"><label>${label}</label>${segments(key,values,state.options[key],'option')}</div>`).join('')}<div class="option-group"><label class="switch-label">Показывать родителя в списке<input type="checkbox" role="switch" id="contacts-toggle" ${state.options.contacts?'checked':''}></label></div><div class="notice">Выбор применяется сразу и сохраняется в этом браузере. Сравнивайте элементы независимо друг от друга.</div><div class="variants-footer"><button data-action="reset-options">По умолчанию</button><button class="primary" data-action="export-options">Сохранить выбор</button></div>`;
  d.showModal();
}
function toast(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),3500);}
function setView(view){state.view=view;state.query='';state.filter='all';render();document.getElementById('content').focus({preventScroll:true});}
function updateOption(key,value){state.options[key]=value;saveOptions();render();document.querySelectorAll(`[data-key="${key}"]`).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value===value)));}
document.addEventListener('click',event=>{
  const b=event.target.closest('[data-action]');if(!b)return;
  const {action,id,key,value,view}=b.dataset;
  if(action==='nav')setView(view);
  else if(action==='variants')showVariants();
  else if(action==='close')b.closest('dialog').close();
  else if(action==='option'||action==='view-option')updateOption(key,value);
  else if(action==='reset-options'){state.options={...initialOptions};document.getElementById('variants').close();render();showVariants();}
  else if(action==='export-options'){const blob=new Blob([JSON.stringify({prototype:'IT08 CRM',version:'0.1',variants:state.options},null,2)],{type:'application/json'});download(blob,'it08-crm-variants.json');toast('Выбор вариантов сохранён в файл');}
  else if(action==='reset'){state.data=freshData();state.attendance={};state.files={};state.notes={};state.query='';state.filter='all';state.student=null;state.studentTab='overview';state.chat='s1';state.chatChannel='Telegram';state.day=0;state.view='today';render();toast('Демонстрационные данные восстановлены');}
  else handleAction(action,b.dataset,b);
});
document.addEventListener('input',event=>{if(event.target.id==='search-input'){state.query=event.target.value;render();}else if(event.target.id==='mailing-message')updateMailingSubmit(event.target.form);});
document.addEventListener('change',event=>{
  if(event.target.id==='student-filter'){state.filter=event.target.value;render();}
  else if(event.target.id==='contacts-toggle'){state.options.contacts=event.target.checked;render();}
  else if(event.target.dataset.task){const t=state.data.tasks.find(t=>t.id===event.target.dataset.task);t.status=event.target.checked?'done':'planned';render();}
  else handleChange(event.target);
});
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function groupsView(){
  return heading('Группы','Постоянный состав, преподаватели и форматы занятий',`<button class="primary" data-action="new-group">${icon('plus')}Создать группу</button>`)+table(['Группа','Расписание','Преподаватель','Формат','Состав',''],state.data.groups.map(g=>{const n=state.data.students.filter(s=>s.group===g.id&&s.status==='active').length;return `<tr><td><strong>${esc(g.name)}</strong><br><small>${esc(g.exam)} · ${esc(g.place)}</small></td><td>${esc(g.days)}<br><small>${esc(g.time)}</small></td><td>${esc(g.teacher)}</td><td>${badge(g.format)}</td><td>${n} / ${g.capacity}<div class="progress" style="margin-top:8px"><span style="width:${Math.min(n/g.capacity*100,100)}%"></span></div></td><td><button class="small" data-action="group" data-id="${g.id}">Состав ${icon('arrow')}</button></td></tr>`;}));
}
function scheduleView(){
  const mode=state.options.schedule;
  let body;
  if(mode==='week')body=`<div class="panel table-wrap"><div class="week-grid">${dayNames.map((day,i)=>`<section class="day-col"><h2 class="day-label">${day}</h2>${state.data.lessons.filter(l=>l.day===i).map(l=>`<button class="lesson-tile ${l.state==='cancelled'?'cancelled':''}" data-action="lesson" data-id="${l.id}"><strong>${esc(l.time)}–${esc(l.end)}</strong><span>${esc(group(l.group).name)}</span><small>${esc(group(l.group).teacher)} · ${esc(group(l.group).format)}</small>${l.state==='cancelled'?'<small>Отменено</small>':''}</button>`).join('')||'<small>Занятий нет</small>'}</section>`).join('')}</div></div>`;
  else if(mode==='list')body=`<div class="panel">${dayNames.map((day,i)=>`<div class="timeline-label">${day}</div>${state.data.lessons.filter(l=>l.day===i).map(lessonRow).join('')}`).join('')}</div>`;
  else body=`<div class="panel"><div class="section-head"><h2>${dayNames[state.day]}</h2><select id="day-filter" aria-label="День расписания">${dayNames.map((d,i)=>`<option value="${i}" ${state.day===i?'selected':''}>${d.split(',')[0]}</option>`).join('')}</select></div>${state.data.lessons.filter(l=>l.day===state.day).map(lessonRow).join('')||'<div class="empty">На этот день занятий нет</div>'}</div>`;
  return heading('Расписание','5–9 октября · время занятий по Москве',`<button class="primary" data-action="new-lesson">${icon('plus')}Добавить занятие</button>`)+`<div class="toolbar"><span class="details-line">Шаблон недели · ${state.data.lessons.length} занятий</span>${segments('schedule',optionDefs[3][2],mode)}</div>`+body;
}
function paymentsView(){
  const people=state.data.students.filter(s=>s.status==='active'),total=state.data.payments.reduce((a,p)=>a+p.sum,0),debt=people.reduce((a,s)=>a+s.debt,0);
  const perStudent=s=>state.data.payments.filter(p=>p.student===s.id).reduce((a,p)=>a+p.sum,0);
  const peopleBody=state.options.payments==='cards'?`<div class="card-grid">${people.map(s=>`<article class="person-card">${person(s)}<div class="card-meta"><small>Задолженность</small><strong>${money(s.debt)}</strong></div><div class="card-meta"><small>Остаток занятий</small><strong>${s.remaining}</strong></div><button data-action="payment" data-id="${s.id}">Добавить оплату</button></article>`).join('')}</div>`:table(['Ученик','Остаток занятий','Поступления','Задолженность',''],people.map(s=>`<tr><td>${person(s)}</td><td>${s.remaining}</td><td>${money(perStudent(s))}</td><td>${s.debt?badge(money(s.debt),'amber'):badge('Нет','green')}</td><td><button class="small" data-action="payment" data-id="${s.id}">Добавить оплату</button></td></tr>`));
  return heading('Оплаты','Абонементы, поступления и сверка задолженности',`<button data-action="prices">Прайс и ссылки</button>`)+`<div class="stats"><div class="stat"><small>Поступления в демо</small><div class="stat-value">${money(total)}</div><small>${state.data.payments.length} операций</small></div><div class="stat"><small>Пример задолженности</small><div class="stat-value">${money(debt)}</div><small>Финансовые правила уточняются</small></div><div class="stat"><small>Нужна сверка</small><div class="stat-value">${people.filter(s=>s.debt>0).length}</div><small>семьи учеников</small></div><div class="stat"><small>Заканчивается абонемент</small><div class="stat-value">${people.filter(s=>s.remaining<=2).length}</div><small>2 занятия или меньше</small></div></div><div class="toolbar"><h2>По ученикам</h2>${segments('payments',optionDefs[4][2],state.options.payments)}</div>${peopleBody}<section class="panel" style="margin-top:24px"><div class="section-head"><h2>История поступлений</h2><small>Учебный остаток и деньги показаны отдельно</small></div><div class="table-wrap"><table><thead><tr><th>Дата</th><th>Ученик</th><th>Сумма</th><th>Тип оплаты</th><th>Статус</th></tr></thead><tbody>${state.data.payments.map(p=>`<tr><td>${esc(p.date)}</td><td>${esc(student(p.student).name)}</td><td class="balance">${money(p.sum)}</td><td>${esc(p.paymentType)}</td><td>${badge('Подтверждено','green')}</td></tr>`).join('')}</tbody></table></div></section>`;
}
function messagesView(){
  const ids=['s1','s2','s4',...Object.keys(state.data.threads)],s=student(state.chat)||student('s1'),messages=(state.data.threads[s.id]||[]).filter(m=>m.channel===state.chatChannel);
  return heading('Сообщения','Единая переписка и подтверждение получения',`<button data-action="mailing">Рассылка</button>`)+`<div class="panel chat"><aside class="chat-list" aria-label="Беседы">${[...new Set([...ids,state.chat])].map(id=>{const c=student(id);return `<button class="chat-contact ${c.id===s.id?'active':''}" data-action="chat" data-id="${c.id}" ${c.id===s.id?'aria-current="true"':''}><span class="avatar">${initials(c.parent)}</span><span><strong>${esc(c.parent)}</strong><div class="chat-preview">${esc((state.data.threads[c.id]||[]).at(-1)?.text||c.name)}</div><small>${esc(c.name)}</small></span></button>`;}).join('')}</aside><div class="chat-main"><div class="chat-head"><div><h2>${esc(s.parent)}</h2><small>${esc(s.name)} · ${channelConnected(s)?'Бот подключён':'Нет подключения к этому боту'}</small></div>${segments('Канал',[['Telegram','Telegram'],['MAX','MAX']],state.chatChannel,'channel')}</div><div class="messages" id="messages-list">${messages.map(m=>`<div class="bubble ${m.out?'out':''}">${esc(m.text)}<small>${esc(m.time)}${m.out?' · '+(m.ack?'Получение подтверждено':'Ожидает подтверждения'):''}</small></div>`).join('')||'<div class="empty">Начните беседу с семьёй ученика</div>'}</div><form id="chat-form" class="composer"><input id="message-input" name="message" aria-label="Текст сообщения" placeholder="Сообщение…" autocomplete="off" required maxlength="2000"><button class="primary icon" aria-label="Отправить сообщение" ${!channelConnected(s)?'disabled':''}>${icon('send')}</button></form><div class="chat-tools"><button class="small" data-action="message-template">Напоминание о занятии</button><button class="small" data-action="confirm-message">Показать ответ получателя</button>${!channelConnected(s)?`<button class="small" data-action="${s.invited.includes(state.chatChannel)?'connect-demo':'invite'}" data-id="${s.id}">${s.invited.includes(state.chatChannel)?'Показать подключение':'Пригласить в бот'}</button>`:''}</div></div></div><p class="details-line" style="margin-top:12px">Демо-переписка: отправка и ответы воспроизводятся внутри прототипа.</p>`;
}
function tasksView(){
  const statuses=[['planned','Запланированы'],['progress','В работе'],['done','Завершены']];
  const body=state.options.tasks==='board'?`<div class="board">${statuses.map(([v,title])=>`<section class="board-col"><div class="board-title">${title}<span class="badge-number">${state.data.tasks.filter(t=>t.status===v).length}</span></div>${state.data.tasks.filter(t=>t.status===v).map(t=>`<article class="board-item"><strong>${esc(t.title)}</strong><small>${esc(t.assignee)} · ${esc(t.time)}</small><div class="card-meta">${badge(({high:'Высокий',normal:'Обычный',low:'Низкий'})[t.priority],t.priority==='high'?'amber':'')}<select data-task-status="${t.id}" aria-label="Статус задачи ${esc(t.title)}">${statuses.map(([value,label])=>`<option value="${value}" ${value===t.status?'selected':''}>${label}</option>`).join('')}</select></div></article>`).join('')||'<small>Задач пока нет</small>'}</section>`).join('')}</div>`:`<section class="panel">${state.data.tasks.map(taskRow).join('')}</section>`;
  return heading('Задачи','Ответственные, сроки и контроль выполнения',`<button class="primary" data-action="new-task">${icon('plus')}Создать задачу</button>`)+`<div class="toolbar"><span class="details-line">${state.data.tasks.filter(t=>t.status!=='done').length} открытых · ${state.data.tasks.filter(t=>t.status==='done').length} завершено</span>${segments('tasks',optionDefs[5][2],state.options.tasks)}</div>`+body;
}
function funnelView(){
  const stages=['Обращение','Пробное занятие','Зачисление'];
  return heading('Воронка','Пример трёх этапов · финальные этапы предстоит согласовать',`<button class="primary" data-action="new-student">${icon('plus')}Новый лид</button>`)+`<div class="board">${stages.map((title,i)=>`<section class="board-col"><div class="board-title">${title}<span class="badge-number">${state.data.deals.filter(d=>d.stage===i).length}</span></div>${state.data.deals.filter(d=>d.stage===i).map(d=>{const s=student(d.student);return `<article class="board-item">${person(s)}<small>${esc(s.channel)} · ${s.connected?'подключён':'ожидает подключения'}</small><div class="card-meta"><button class="small" data-action="student" data-id="${s.id}">Карточка</button>${i<2?`<button class="small" data-action="deal-next" data-id="${d.id}">Следующий этап ${icon('arrow')}</button>`:badge('Решение семьи','green')}</div></article>`;}).join('')||'<small>Нет сделок на этом этапе</small>'}</section>`).join('')}</div>`;
}
function staffView(){return heading('Сотрудники','Роли, преподаватели и пример журнала смен')+table(['Сотрудник','Зона ответственности','Смена','Статус'],state.data.staff.map(s=>`<tr><td><div class="name"><span class="avatar">${initials(s.name)}</span><strong>${esc(s.name)}</strong></div></td><td>${esc(s.role)}</td><td>${esc(s.shift)}</td><td>${badge('В работе','green')}</td></tr>`))+`<section class="panel" style="margin-top:24px"><div class="section-head"><h2>Преподаватели</h2><small>Сведения из демонстрационных групп</small></div>${state.data.groups.map(g=>`<div class="lesson"><span class="avatar">${initials(g.teacher)}</span><div class="lesson-info"><strong>${esc(g.teacher)}</strong><small>${esc(g.subject)} · ${esc(g.format)}</small></div><span class="tag">${esc(g.days)}</span></div>`).join('')}</section>`;}
function studentContent(id,full=false){
  const s=student(id);if(!s)return empty('Карточка не найдена','Вернитесь в список учеников.');
  const g=group(s.group),paid=state.data.payments.filter(p=>p.student===id),files=state.files[id]||[],note=state.notes[id]||'';
  const head=`<div class="detail-header"><div class="name"><span class="avatar">${initials(s.name)}</span><div><${full?'h1':'h2'}>${esc(s.name)}</${full?'h1':'h2'}><small>${esc(s.grade)} класс · ${esc(s.school)}</small></div></div>${statusBadge(s.status)}</div>`;
  const tabs=`<div class="tabs" role="group" aria-label="Разделы карточки">${[['overview','Обзор'],['history','История'],['documents','Документы']].map(([v,l])=>`<button data-action="student-tab" data-value="${v}" aria-pressed="${state.studentTab===v}">${l}</button>`).join('')}</div>`;
  let body;
  if(state.studentTab==='history')body=`<h3>Платежи</h3>${paid.map(p=>`<div class="file-row"><div>${money(p.sum)}<small style="display:block;margin-top:5px">${esc(p.date)} · ${esc(p.paymentType)}</small></div>${badge('Подтверждено','green')}</div>`).join('')||'<p class="details-line" style="margin-top:12px">Поступлений пока нет</p>'}<h3 style="margin:24px 0 8px">Посещение</h3>${state.data.lessons.filter(l=>l.group===s.group).slice(0,4).map(l=>`<div class="file-row"><div>${dayNames[l.day]} · ${esc(l.time)}<small style="display:block;margin-top:5px">${esc(l.topic)}</small></div>${badge(({present:'Посетил',absent:'Пропустил'})[state.attendance[l.id]?.[id]]||'Не отмечено',state.attendance[l.id]?.[id]==='present'?'green':'')}</div>`).join('')||'<p class="details-line">Записей на занятия пока нет</p>'}`;
  else if(state.studentTab==='documents')body=`<div class="row" style="justify-content:space-between"><h3>Файлы ученика</h3><button class="small" data-action="upload-file">${icon('plus')}Прикрепить</button><input type="file" id="file-input" hidden accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"></div><div class="file-row"><div class="name">${icon('file')}<div>Пример отчёта.txt<small style="display:block;margin-top:4px">Демонстрационный документ</small></div></div><button class="small" data-action="sample-file">Скачать</button></div>${files.map((f,i)=>`<div class="file-row"><div class="name">${icon('file')}<span>${esc(f.name)}<small style="display:block;margin-top:4px">${Math.ceil(f.size/1024)} КБ · прикреплён в этом сеансе</small></span></div><button class="small" data-action="download-file" data-index="${i}">Скачать</button></div>`).join('')}<p class="details-line" style="margin-top:16px">Прикреплённые файлы доступны до обновления страницы.</p>`;
  else body=`<div class="detail-stats"><div class="detail-stat"><small>Остаток</small><strong>${s.remaining} занятий</strong></div><div class="detail-stat"><small>Задолженность</small><strong>${money(s.debt)}</strong></div><div class="detail-stat"><small>Канал</small><strong style="font-size:15px">${esc(s.channel)}</strong></div></div><div class="kv"><div><small>Родитель</small><button class="link-button" data-action="parent" data-id="${id}">${esc(s.parent)}</button></div><div><small>Телефон</small>${esc(s.phone)}</div><div><small>Группа</small>${g?esc(g.name):'Не выбрана'}</div><div><small>Подключение к боту</small>${badge(s.connected?'Подключён':'Нет подключения',s.connected?'green':'amber')}</div></div><div class="notice">${g?`${esc(g.days)} · ${esc(g.time)}<br>${esc(g.place)}`:'Ученик ещё не зачислен в постоянную группу.'}</div><form id="note-form"><label class="field">Заметка<textarea name="note" placeholder="Комментарий для сотрудников" maxlength="2000">${esc(note)}</textarea></label><div class="form-actions"><button type="button" data-action="message-student" data-id="${id}">Написать родителю</button><button class="primary">Сохранить заметку</button></div></form><hr><div class="row" style="justify-content:space-between"><small>Состояние клиента</small><select id="student-status" aria-label="Состояние клиента">${[['active','Действующий'],['lead','Лид'],['archive','Архив']].map(([v,l])=>`<option value="${v}" ${s.status===v?'selected':''}>${l}</option>`).join('')}</select></div>`;
  return (full?`<div style="margin-bottom:24px"><button class="ghost" data-action="nav" data-view="students">${icon('back')}К ученикам</button></div><section class="panel"><div class="panel-body">`:'')+head+tabs+body+(full?'</div></section>':'');
}
function openStudent(id){state.student=id;state.studentTab='overview';if(state.options.detail==='page'){setView('student-page');return;}const d=document.getElementById('detail');d.className=state.options.detail==='drawer'?'drawer':'';renderStudentDialog();d.showModal();}
function renderStudentDialog(){const d=document.getElementById('detail');d.innerHTML=`<div class="dialog-head"><small>Карточка ученика</small><button class="icon ghost" data-action="close" aria-label="Закрыть карточку">${icon('close')}</button></div>${studentContent(state.student)}`;}
function openForm(title,body,kind){const d=document.getElementById('form-dialog');d.className='';d.innerHTML=`<div class="dialog-head"><h2>${title}</h2><button class="icon ghost" data-action="close" aria-label="Закрыть окно">${icon('close')}</button></div><form id="action-form" data-kind="${kind}">${body}<div class="form-actions"><button type="button" data-action="close">Отмена</button><button class="primary">${kind==='parent'?'Готово':'Сохранить'}</button></div></form>`;if(!d.open)d.showModal();}
function field(label,name,options={}){return `<label class="field ${options.full?'full':''}">${label}<input name="${name}" ${options.required?'required':''} type="${options.type||'text'}" value="${esc(options.value||'')}" ${options.type==='number'?'min="1" step="1"':''} maxlength="200"></label>`;}
function selectField(label,name,items,selected){return `<label class="field">${label}<select name="${name}">${items.map(([v,l])=>`<option value="${v}" ${v===selected?'selected':''}>${esc(l)}</option>`).join('')}</select></label>`;}
function mailingFilters(){
  return [
    {key:'statuses',title:'Статусы',allLabel:'Все статусы',items:[['active','Учатся'],['lead','Лиды'],['archive','Архив']],value:s=>s.status,reason:'Статус не выбран'},
    {key:'grades',title:'Классы',allLabel:'Все классы',items:['7','8','9','10','11'].map(v=>[v,v+' класс']),value:s=>String(s.grade),reason:'Класс не выбран'},
    {key:'subjects',title:'Предметы',allLabel:'Все предметы',items:[...['Математика','Информатика','Физика'].map(v=>[v,v]),['__none','Предмет не указан']],value:s=>group(s.group)?.subject||'__none',reason:'Предмет не выбран'},
    {key:'groups',title:'Группы',allLabel:'Все группы',items:[...state.data.groups.map(g=>[g.id,g.name]),['__none','Без группы']],value:s=>s.group||'__none',reason:'Группа не выбрана'}
  ];
}
function mailingAudience(form){
  const values=new FormData(form),channel=values.get('channel'),filters=mailingFilters();
  const selected=Object.fromEntries(filters.map(f=>[f.key,values.getAll(f.key)]));
  const entries=state.data.students.map(s=>{
    const filterReasons=filters.filter(f=>!selected[f.key].includes(f.value(s))).map(f=>f.reason);
    const connected=s.channels.includes(channel),matches=filterReasons.length===0;
    const reasons=[...filterReasons,...(!connected?['Нет подключения к боту '+channel]:[])];
    return {student:s,matches,connected,eligible:matches&&connected,reasons};
  });
  return {channel,entries,matched:entries.filter(e=>e.matches),recipients:entries.filter(e=>e.eligible),unconnected:entries.filter(e=>e.matches&&!e.connected)};
}
function updateMailingSubmit(form){
  if(!form)return;
  const button=form.querySelector('[data-mailing-submit]');
  if(button)button.disabled=!form.elements.message.value.trim()||mailingAudience(form).recipients.length===0;
}
function updateMailingPreview(form){
  for(const f of mailingFilters()){
    const checks=[...form.querySelectorAll(`input[name="${f.key}"]`)];
    const all=form.querySelector(`[data-mailing-all="${f.key}"]`),n=checks.filter(c=>c.checked).length;
    all.checked=n===checks.length;all.indeterminate=n>0&&n<checks.length;
  }
  const audience=mailingAudience(form);
  form.querySelector('#mailing-summary').innerHTML=[['Совпало по фильтрам',audience.matched.length],['Доступно в '+audience.channel,audience.recipients.length],['Без подключения',audience.unconnected.length]].map(([label,n])=>`<div class="detail-stat"><small>${esc(label)}</small><strong>${n}</strong></div>`).join('');
  const recipientRow=e=>`<li class="mailing-recipient"><span>${esc(e.student.name)}<small>${esc(e.student.parent)}</small></span><small>${e.eligible?'Получит в демо · '+esc(audience.channel):esc(e.reasons.join(' · '))}</small></li>`;
  form.querySelector('#mailing-recipients').innerHTML=`<h3>Получатели · ${audience.recipients.length}</h3>${audience.recipients.length?`<ul class="mailing-recipient-list">${audience.recipients.map(recipientRow).join('')}</ul>`:'<p class="details-line" style="margin-top:8px">Нет доступных получателей. Измените фильтры или канал.</p>'}<details class="mailing-excluded"><summary>Не попадут в рассылку · ${audience.entries.length-audience.recipients.length}</summary><ul class="mailing-recipient-list">${audience.entries.filter(e=>!e.eligible).map(recipientRow).join('')}</ul></details>`;
  updateMailingSubmit(form);
}
function openMailing(){
  const d=document.getElementById('form-dialog');d.className='mailing-dialog';
  const filterMarkup=mailingFilters().map(f=>`<fieldset class="mailing-filter"><legend>${f.title}</legend><label class="mailing-choice mailing-all"><input type="checkbox" data-mailing-all="${f.key}" ${f.key==='statuses'?'':'checked'}>${f.allLabel}</label><div class="mailing-choices">${f.items.map(([value,label])=>`<label class="mailing-choice"><input type="checkbox" name="${f.key}" value="${esc(value)}" data-mailing-filter ${f.key!=='statuses'||value==='active'?'checked':''}>${esc(label)}</label>`).join('')}</div></fieldset>`).join('');
  d.innerHTML=`<div class="dialog-head"><h2>Новая рассылка</h2><button class="icon ghost" data-action="close" aria-label="Закрыть рассылку">${icon('close')}</button></div><form id="action-form" data-kind="mailing">${selectField('Канал','channel',[['Telegram','Telegram'],['MAX','MAX']],state.chatChannel)}<h3 style="margin:24px 0 12px">Категории получателей</h3><div class="mailing-filters">${filterMarkup}</div><p class="details-line" style="margin-top:12px">Выберите несколько значений в каждой категории. Получатель должен подходить под все категории. Предмет определяется по текущей группе ученика.</p><div class="detail-stats" id="mailing-summary" role="status" aria-live="polite" aria-atomic="true"></div><div id="mailing-recipients"></div><label class="field" style="margin-top:20px" for="mailing-message">Текст сообщения<textarea id="mailing-message" name="message" required maxlength="2000" placeholder="Сообщение для семей учеников"></textarea></label><div class="notice">Сообщения появятся только внутри прототипа, в переписке с выбранными семьями.</div><div class="form-actions"><button type="button" data-action="close">Отмена</button><button class="primary" data-mailing-submit disabled>Добавить в демо-переписку</button></div></form>`;
  updateMailingPreview(d.querySelector('form'));if(!d.open)d.showModal();
}
function openLesson(id){
  const l=state.data.lessons.find(l=>l.id===id),g=group(l.group),roster=state.data.students.filter(s=>s.group===g.id&&s.status==='active'),d=document.getElementById('form-dialog');
  d.className='';d.innerHTML=`<div class="dialog-head"><div><h2>${esc(g.name)}</h2><small>${dayNames[l.day]} · ${esc(l.time)}–${esc(l.end)}</small></div><button class="icon ghost" data-action="close" aria-label="Закрыть занятие">${icon('close')}</button></div><div class="wide-banner"><span>${esc(g.teacher)} · ${esc(g.place)}</span>${badge(l.state==='cancelled'?'Отменено':'По расписанию',l.state==='cancelled'?'':'green')}</div><p class="details-line">Тема: ${esc(l.topic)}</p><hr><h3>Посещаемость</h3><div class="attendance">${roster.map(s=>`<div class="attendance-row"><button class="link-button" data-action="student-from-lesson" data-id="${s.id}">${esc(s.name)}</button><div class="seg" role="group" aria-label="Посещение ${esc(s.name)}">${[['unmarked','Не отмечено'],['present','Был'],['absent','Пропуск']].map(([v,title])=>`<button type="button" data-action="attendance" data-lesson="${id}" data-id="${s.id}" data-value="${v}" aria-pressed="${(state.attendance[id]?.[s.id]||'unmarked')===v}" ${l.state==='cancelled'?'disabled':''}>${title}</button>`).join('')}</div></div>`).join('')||'<div class="empty">В этой группе пока нет учеников</div>'}</div><div class="notice">Отметка меняет посещаемость. Правило списания занятий с абонемента предстоит согласовать.</div><div class="form-actions"><button class="danger" data-action="cancel-lesson" data-id="${id}">${l.state==='cancelled'?'Восстановить':'Отменить занятие'}</button><button data-action="move-lesson" data-id="${id}">Перенести</button></div>`;
  if(!d.open)d.showModal();
}
function handleAction(action,d,b){
  if(action==='student')openStudent(d.id);
  else if(action==='student-from-lesson'){document.getElementById('form-dialog').close();openStudent(d.id);}
  else if(action==='student-tab'){state.studentTab=d.value;if(state.view==='student-page')render();else renderStudentDialog();document.querySelector(`[data-action="student-tab"][data-value="${d.value}"]`)?.focus();}
  else if(action==='parent'){document.getElementById('detail').close();const s=student(d.id);openForm('Контакт родителя',`<div class="kv"><div><small>ФИО</small>${esc(s.parent)}</div><div><small>Телефон</small>${esc(s.phone)}</div><div><small>Ребёнок</small>${esc(s.name)}</div><div><small>Канал</small>${esc(s.channel)}</div></div>`,'parent');}
  else if(action==='new-student')openForm('Новый ученик',`<div class="form-grid">${field('ФИО ученика','name',{required:true,full:true})}${selectField('Класс','grade',['7','8','9','10','11'].map(x=>[x,x+' класс']))}${field('Школа','school')}${field('ФИО родителя','parent',{required:true})}${field('Телефон','phone')}${selectField('Канал связи','channel',[['Telegram','Telegram'],['MAX','MAX']])}</div><div class="notice">Появится карточка лида и связанная сделка в воронке.</div>`,'student');
  else if(action==='group'){const g=group(d.id),roster=state.data.students.filter(s=>s.group===g.id);openForm(esc(g.name),`<p class="details-line">${esc(g.days)} · ${esc(g.time)} · ${esc(g.place)}</p><div class="attendance">${roster.map(s=>`<div class="attendance-row">${person(s)}${statusBadge(s.status)}</div>`).join('')||'<div class="empty">Участников пока нет</div>'}</div>`,'parent');}
  else if(action==='new-group')openForm('Новая группа',`<div class="form-grid">${field('Название','name',{required:true,full:true})}${selectField('Предмет','subject',['Математика','Информатика','Физика'].map(x=>[x,x]))}${selectField('Формат','format',[['Очно','Очно'],['Онлайн','Онлайн']])}${field('Преподаватель','teacher',{required:true})}${field('Дни недели','days',{value:'Пн / Чт'})}${field('Время','time',{value:'16:30–17:50'})}${field('Место / учебная комната','place',{required:true})}</div>`,'group');
  else if(action==='lesson')openLesson(d.id);
  else if(action==='attendance'){state.attendance[d.lesson]||={};state.attendance[d.lesson][d.id]=d.value;document.querySelectorAll(`[data-action="attendance"][data-id="${d.id}"]`).forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.value===d.value)));toast('Отметка посещения сохранена в демо');}
  else if(action==='cancel-lesson'){const l=state.data.lessons.find(l=>l.id===d.id);l.state=l.state==='cancelled'?'scheduled':'cancelled';render();openLesson(d.id);toast(l.state==='cancelled'?'Занятие отменено в демо':'Занятие восстановлено');}
  else if(action==='move-lesson'){const l=state.data.lessons.find(l=>l.id===d.id);state.editingLesson=d.id;openForm('Перенос занятия',`<div class="form-grid">${selectField('День','day',dayNames.map((x,i)=>[String(i),x]),String(l.day))}${field('Начало','time',{type:'time',required:true,value:l.time})}${field('Окончание','end',{type:'time',required:true,value:l.end})}${field('Причина','reason',{required:true})}</div><div class="notice">Участники сохранятся. Отправка уведомления здесь показывается как пример действия.</div>`,'move');}
  else if(action==='new-lesson')openForm('Новое занятие',`<div class="form-grid">${selectField('Группа','group',state.data.groups.map(g=>[g.id,g.name]))}${selectField('День','day',dayNames.map((x,i)=>[String(i),x]))}${field('Начало','time',{type:'time',required:true,value:'16:30'})}${field('Окончание','end',{type:'time',required:true,value:'17:50'})}${field('Тема','topic',{required:true,full:true})}</div>`,'lesson');
  else if(action==='new-task')openForm('Новая задача',`<div class="form-grid">${field('Название','title',{required:true,full:true})}${selectField('Исполнитель','assignee',state.data.staff.map(s=>[s.name,s.name]))}${field('Срок','time',{required:true,value:'Сегодня, до 18:00'})}${selectField('Приоритет','priority',[['low','Низкий'],['normal','Обычный'],['high','Высокий']],'normal')}${selectField('Ученик','student',[['','Без привязки'],...state.data.students.map(s=>[s.id,s.name])])}</div>`,'task');
  else if(action==='payment'){state.paymentStudent=d.id;openForm('Добавить оплату',`<p style="margin-bottom:20px">${esc(student(d.id).name)}</p><div class="form-grid">${field('Сумма, ₽','sum',{required:true,type:'number'})}${selectField('Тип оплаты','paymentType',[['Наличные','Наличные'],['Безналичный расчёт','Безналичный расчёт']])}</div><div class="notice">Карта и СБП учитываются как безналичный расчёт. Оплата попадёт в историю поступлений. Финансовые примеры и задолженность в демо показаны отдельно.</div>`,'payment');}
  else if(action==='prices')openForm('Прайс и платёжные ссылки',`<p class="details-line" style="margin-bottom:20px">Пример оформления справочника. Цены демонстрационные.</p>${[['Математика · ОГЭ',5900],['Информатика · ЕГЭ',6200],['Физика · ЕГЭ',6900]].map(([title,price])=>`<div class="file-row"><span>${title}<small style="display:block;margin-top:5px">${money(price)} · пример цены</small></span><button type="button" class="small" data-action="copy-payment-link">Ссылка</button></div>`).join('')}<div class="notice">Образец ссылки, предоставленный заказчиком: https://it-deti.ru/5700. Связь ссылки с конкретным тарифом ещё уточняется.</div>`,'parent');
  else if(action==='copy-payment-link'){if(navigator.clipboard?.writeText)navigator.clipboard.writeText('https://it-deti.ru/5700').then(()=>toast('Образец ссылки скопирован')).catch(()=>toast('Образец ссылки: https://it-deti.ru/5700'));else toast('Образец ссылки: https://it-deti.ru/5700');}
  else if(action==='message-student'){document.getElementById('detail').close();state.chat=d.id;state.chatChannel=student(d.id).channel;setView('messages');}
  else if(action==='chat'){state.chat=d.id;state.chatChannel=student(d.id).channel;render();}
  else if(action==='channel'){state.chatChannel=d.value;render();}
  else if(action==='message-template'){document.getElementById('message-input').value='Здравствуйте! Напоминаем о занятии завтра. Подтвердите, пожалуйста, получение этого сообщения.';document.getElementById('message-input').focus();}
  else if(action==='confirm-message'){const thread=state.data.threads[state.chat]||[];const last=thread.findLast(m=>m.out&&m.channel===state.chatChannel);if(!last){toast('Сначала добавьте исходящее сообщение');return;}last.ack=true;thread.push({out:false,text:'Спасибо! Сообщение получили.',time:'Сейчас',channel:state.chatChannel});render();toast('Ответ получателя показан в демо');}
  else if(action==='invite'){const s=student(d.id),channel=state.view==='messages'?state.chatChannel:s.channel;if(!s.invited.includes(channel))s.invited.push(channel);render();toast('Демо-приглашение подготовлено. Подключение требует действия семьи.');}
  else if(action==='connect-demo'){const s=student(d.id),channel=state.view==='messages'?state.chatChannel:s.channel;if(!s.channels.includes(channel))s.channels.push(channel);s.connected=s.channels.includes(s.channel);render();toast('Действие семьи: подключение к боту показано в демо');}
  else if(action==='mailing')openMailing();
  else if(action==='deal-next'){state.data.deals.find(x=>x.id===d.id).stage++;render();toast('Сделка перемещена на следующий этап');}
  else if(action==='upload-file')document.getElementById('file-input').click();
  else if(action==='download-file'){const f=state.files[state.student][Number(d.index)];download(f,f.name);}
  else if(action==='sample-file')download(new Blob(['Демонстрационный отчёт\n\nЭто пример прикреплённого документа для обсуждения интерфейса CRM.'],{type:'text/plain;charset=utf-8'}),'Пример отчёта.txt');
}
function handleChange(el){
  if(el.form?.dataset.kind==='mailing'){if(el.dataset.mailingAll)el.form.querySelectorAll(`input[name="${el.dataset.mailingAll}"]`).forEach(c=>{c.checked=el.checked;});updateMailingPreview(el.form);return;}
  if(el.id==='day-filter'){state.day=Number(el.value);render();}
  else if(el.dataset.taskStatus){state.data.tasks.find(t=>t.id===el.dataset.taskStatus).status=el.value;render();}
  else if(el.id==='student-status'){student(state.student).status=el.value;render();if(document.getElementById('detail').open)renderStudentDialog();toast('Состояние клиента обновлено');}
  else if(el.id==='file-input'&&el.files[0]){const f=el.files[0];if(f.size>10*1024*1024){toast('Для демо выберите файл до 10 МБ');return;}state.files[state.student]||=[];state.files[state.student].push(f);if(state.view==='student-page')render();else renderStudentDialog();toast('Файл прикреплён к карточке в этом сеансе');}
}
document.addEventListener('submit',event=>{
  event.preventDefault();const form=event.target,values=Object.fromEntries(new FormData(form));
  if(form.id==='chat-form'){const text=values.message?.trim();if(!text||!channelConnected(student(state.chat)))return;state.data.threads[state.chat]||=[];state.data.threads[state.chat].push({out:true,text,time:'Сейчас',ack:false,channel:state.chatChannel});render();document.getElementById('message-input').focus();toast('Сообщение добавлено в демо-переписку');return;}
  if(form.id==='note-form'){state.notes[state.student]=values.note.trim();toast('Заметка сохранена в демо');return;}
  if(form.id!=='action-form')return;
  const kind=form.dataset.kind;
  if(kind==='student'){if(!values.name.trim()||!values.parent.trim())return;const id='s'+Date.now();state.data.students.unshift({id,name:values.name.trim(),parent:values.parent.trim(),grade:values.grade,school:values.school.trim()||'Не указана',phone:values.phone.trim()||'Не указан',channel:values.channel,status:'lead',group:'',remaining:0,debt:0,connected:false,channels:[],invited:[]});state.data.deals.push({id:'d'+Date.now(),student:id,stage:0});toast('Созданы карточка лида и связанная сделка');}
  else if(kind==='group')state.data.groups.push({id:'g'+Date.now(),...values,exam:'Программа',capacity:10});
  else if(kind==='lesson'){if(values.end<=values.time){toast('Окончание должно быть позже начала');return;}state.data.lessons.push({id:'l'+Date.now(),...values,day:Number(values.day),state:'scheduled'});}
  else if(kind==='move'){if(values.end<=values.time){toast('Окончание должно быть позже начала');return;}Object.assign(state.data.lessons.find(l=>l.id===state.editingLesson),{day:Number(values.day),time:values.time,end:values.end,reason:values.reason});toast('Занятие перенесено; состав сохранён');}
  else if(kind==='task')state.data.tasks.unshift({id:'t'+Date.now(),...values,status:'planned'});
  else if(kind==='payment'){const sum=Number(values.sum);if(!Number.isFinite(sum)||sum<=0)return;state.data.payments.unshift({id:'p'+Date.now(),student:state.paymentStudent,sum,paymentType:values.paymentType,date:'Сейчас',state:'confirmed'});toast('Поступление добавлено в историю');}
  else if(kind==='mailing'){const text=values.message?.trim(),audience=mailingAudience(form);if(!text||!audience.recipients.length){updateMailingPreview(form);return;}for(const {student:s} of audience.recipients){state.data.threads[s.id]||=[];state.data.threads[s.id].push({out:true,text,time:'Сейчас',ack:false,channel:audience.channel});}toast(`Демо-рассылка добавлена в ${audience.recipients.length} ${plural(audience.recipients.length,['беседу','беседы','бесед'])}`);}
  document.getElementById('form-dialog').close();render();
});
render();
