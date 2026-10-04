// All records and amounts are invented for the interface demonstration.
const DEMO = {
  students: [
    {id:'s1',name:'Александр Иванов',grade:'10',school:'Школа № 12',parent:'Елена Иванова',phone:'+7 ••• ••• 12 34',status:'active',group:'g1',remaining:6,debt:0,channel:'Telegram',connected:true},
    {id:'s2',name:'Мария Петрова',grade:'10',school:'Гимназия № 3',parent:'Ирина Петрова',phone:'+7 ••• ••• 56 78',status:'active',group:'g1',remaining:2,debt:5900,channel:'MAX',connected:true},
    {id:'s3',name:'Даниил Соколов',grade:'9',school:'Школа № 8',parent:'Ольга Соколова',phone:'+7 ••• ••• 22 11',status:'active',group:'g2',remaining:5,debt:0,channel:'Telegram',connected:false},
    {id:'s4',name:'Анна Орлова',grade:'11',school:'Школа № 5',parent:'Светлана Орлова',phone:'+7 ••• ••• 43 21',status:'active',group:'g3',remaining:4,debt:3100,channel:'Telegram',connected:true},
    {id:'s5',name:'Михаил Волков',grade:'9',school:'Школа № 12',parent:'Наталья Волкова',phone:'+7 ••• ••• 77 66',status:'lead',group:'',remaining:0,debt:0,channel:'MAX',connected:false},
    {id:'s6',name:'Виктория Смирнова',grade:'10',school:'Гимназия № 3',parent:'Алексей Смирнов',phone:'+7 ••• ••• 88 44',status:'active',group:'g1',remaining:8,debt:0,channel:'Telegram',connected:true},
    {id:'s7',name:'Илья Кузнецов',grade:'8',school:'Школа № 8',parent:'Марина Кузнецова',phone:'+7 ••• ••• 11 00',status:'lead',group:'',remaining:0,debt:0,channel:'Telegram',connected:false},
    {id:'s8',name:'Полина Лебедева',grade:'11',school:'Школа № 5',parent:'Андрей Лебедев',phone:'+7 ••• ••• 99 88',status:'archive',group:'',remaining:0,debt:0,channel:'MAX',connected:true}
  ],
  groups:[
    {id:'g1',name:'Информатика · 10 класс',subject:'Информатика',exam:'ЕГЭ',teacher:'Денис',days:'Пн / Чт',time:'16:30–17:50',place:'Площадка 1 · кабинет 2',format:'Очно',capacity:10},
    {id:'g2',name:'Математика · 9 класс',subject:'Математика',exam:'ОГЭ',teacher:'Герел',days:'Пн / Ср',time:'17:00–18:20',place:'Площадка 2 · кабинет 1',format:'Очно',capacity:10},
    {id:'g3',name:'Физика · 11 класс',subject:'Физика',exam:'ЕГЭ',teacher:'Церен',days:'Вт / Пт',time:'18:00–19:20',place:'Онлайн · учебная комната',format:'Онлайн',capacity:10}
  ],
  lessons:[
    {id:'l1',group:'g1',day:0,time:'16:30',end:'17:50',topic:'Циклы и обработка последовательностей',state:'scheduled'},
    {id:'l2',group:'g2',day:0,time:'17:00',end:'18:20',topic:'Квадратные уравнения',state:'scheduled'},
    {id:'l3',group:'g3',day:1,time:'18:00',end:'19:20',topic:'Законы сохранения',state:'scheduled'},
    {id:'l4',group:'g2',day:2,time:'17:00',end:'18:20',topic:'Решение задач ОГЭ',state:'scheduled'},
    {id:'l5',group:'g1',day:3,time:'16:30',end:'17:50',topic:'Практикум по программированию',state:'scheduled'},
    {id:'l6',group:'g3',day:4,time:'18:00',end:'19:20',topic:'Импульс и энергия',state:'scheduled'}
  ],
  tasks:[
    {id:'t1',title:'Уточнить оплату у семьи Петровых',student:'s2',assignee:'Менеджер по оплате',time:'Сегодня, до 15:00',priority:'high',status:'planned'},
    {id:'t2',title:'Пригласить Даниила в Telegram-бот',student:'s3',assignee:'Администратор',time:'Сегодня, до 16:00',priority:'normal',status:'progress'},
    {id:'t3',title:'Получить отзыв после пробного',student:'s5',assignee:'Завуч',time:'Сегодня, до 18:00',priority:'normal',status:'planned'},
    {id:'t4',title:'Проверить расписание следующей недели',student:'',assignee:'Руководитель',time:'7 октября',priority:'low',status:'planned'},
    {id:'t5',title:'Подтвердить участие Анны в занятии',student:'s4',assignee:'Администратор',time:'Сегодня',priority:'low',status:'done'}
  ],
  payments:[
    {id:'p1',student:'s1',date:'3 октября',sum:6200,paymentType:'Безналичный расчёт',state:'confirmed'},
    {id:'p2',student:'s4',date:'3 октября',sum:3100,paymentType:'Наличные',state:'confirmed'},
    {id:'p3',student:'s6',date:'2 октября',sum:6200,paymentType:'Безналичный расчёт',state:'confirmed'}
  ],
  deals:[{id:'d1',student:'s5',stage:0},{id:'d2',student:'s7',stage:1},{id:'d3',student:'s6',stage:2}],
  threads:{
    s1:[{out:true,text:'Здравствуйте! Напоминаем: информатика в понедельник, 5 октября, в 16:30. Подтвердите, пожалуйста, получение.',time:'15:30',ack:true},{out:false,text:'Здравствуйте, спасибо. Саша придёт.',time:'15:34'}],
    s2:[{out:true,text:'Здравствуйте, Ирина! Подскажите, пожалуйста, когда удобно продлить абонемент Марии?',time:'12:10',ack:false}],
    s4:[{out:false,text:'Добрый день! Занятие по физике во вторник по обычному расписанию?',time:'11:42'},{out:true,text:'Да, в 18:00. Ссылку отправим за час до занятия.',time:'11:48',ack:true}]
  },
  staff:[{name:'Руководитель',role:'Расписание и контроль',shift:'09:00–18:00'},{name:'Администратор',role:'Ученики и уведомления',shift:'12:00–20:00'},{name:'Менеджер по оплате',role:'Абонементы и сверка',shift:'10:00–19:00'},{name:'Завуч',role:'Учебные результаты',shift:'09:00–17:00'}]
};
