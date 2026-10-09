import { useEffect, useMemo, useState } from 'react';

const EXAM_DATE = '2026-11-12T00:00:00';
const STORAGE_KEY = 'kun-tartibim-v1';

const initialTasks = [
  { id: 1, title: 'Algebra: 12–18-mashqlar', subject: 'Matematika', due: 'Bugun, 14:00', priority: 'Yuqori', done: false },
  { id: 2, title: 'Insho: Mening sevimli kitobim', subject: 'Ona tili', due: 'Bugun, 16:30', priority: 'O‘rta', done: false },
  { id: 3, title: 'Fotosintez mavzusini takrorlash', subject: 'Biologiya', due: 'Ertaga', priority: 'Past', done: true, rewarded: true },
];

const schedule = [
  { time: '08:30', end: '09:15', subject: 'Matematika', room: '201-xona', color: 'violet', initials: 'M' },
  { time: '09:25', end: '10:10', subject: 'Ingliz tili', room: '304-xona', color: 'blue', initials: 'EN' },
  { time: '10:30', end: '11:15', subject: 'Biologiya', room: 'Laboratoriya', color: 'green', initials: 'B' },
];

const weekDays = [
  { day: 'Du', hours: 1.8, tasks: 2 },
  { day: 'Se', hours: 2.7, tasks: 4 },
  { day: 'Ch', hours: 1.5, tasks: 2 },
  { day: 'Pa', hours: 3.2, tasks: 5 },
  { day: 'Ju', hours: 2.2, tasks: 3 },
  { day: 'Sh', hours: 0.8, tasks: 1 },
  { day: 'Ya', hours: 0, tasks: 0 },
];

function readSaved() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      tasks: Array.isArray(value.tasks) ? value.tasks : initialTasks,
      xp: Number.isFinite(value.xp) ? value.xp : 240,
      focusSessions: Number.isFinite(value.focusSessions) ? value.focusSessions : 8,
      completedToday: Number.isFinite(value.completedToday) ? value.completedToday : 3,
    };
  } catch (error) {
    console.error('Saqlangan o‘quv rejasini o‘qib bo‘lmadi:', error);
    return { tasks: initialTasks, xp: 240, focusSessions: 8, completedToday: 3 };
  }
}

function Icon({ name, size = 19 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  const paths = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-7h6v7" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    check: <><path d="M9 11 12 14 21 5" /><path d="M20 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-5 5" /></>,
    gift: <><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8v13M3 12h18M12 8H7a2.5 2.5 0 1 1 2.5-2.5V8Zm0 0h5a2.5 2.5 0 1 0-2.5-2.5V8Z" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.6-1.4-2.4L7.3 15a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 2Z" transform="translate(-1 -1) scale(1.08)" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    play: <path d="m9 6 10 6-10 6V6Z" fill="currentColor" stroke="none" />,
    pause: <><path d="M8 5h3v14H8zM15 5h3v14h-3z" fill="currentColor" stroke="none" /></>,
    reset: <><path d="M3 12a9 9 0 1 0 2.6-6.4L3 8" /><path d="M3 3v5h5" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
  };
  return <svg {...common}>{paths[name] || null}</svg>;
}

function App() {
  const saved = useMemo(readSaved, []);
  const [tasks, setTasks] = useState(saved.tasks);
  const [xp, setXp] = useState(saved.xp);
  const [focusSessions, setFocusSessions] = useState(saved.focusSessions);
  const [completedToday, setCompletedToday] = useState(saved.completedToday);
  const [mode, setMode] = useState('focus');
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState('');
  const [filter, setFilter] = useState('Barchasi');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, xp, focusSessions, completedToday }));
  }, [tasks, xp, focusSessions, completedToday]);

  useEffect(() => {
    if (!running || seconds <= 0) return undefined;
    const timeout = window.setTimeout(() => setSeconds((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearTimeout(timeout);
  }, [running, seconds]);

  useEffect(() => {
    if (!running || seconds !== 0) return;
    setRunning(false);
    if (mode === 'focus') {
      setFocusSessions((count) => count + 1);
      setXp((value) => value + 25);
      setToast('Fokus seansi tugadi! +25 XP');
    } else {
      setToast('Tanaffus tugadi. Yana davom etamiz!');
    }
  }, [running, seconds, mode]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const daysLeft = Math.max(0, Math.ceil((new Date(EXAM_DATE).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000));
  const level = Math.floor(xp / 100) + 1;
  const levelProgress = xp % 100;
  const visibleTasks = tasks
    .filter((task) => filter === 'Barchasi' || (filter === 'Bajarilmagan' ? !task.done : task.done))
    .slice()
    .sort((a, b) => ({ Yuqori: 0, 'O‘rta': 1, Past: 2 }[a.priority] - { Yuqori: 0, 'O‘rta': 1, Past: 2 }[b.priority]));
  const timeLabel = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const today = new Intl.DateTimeFormat('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  function toggleTask(id) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const completing = !task.done;
    const shouldReward = completing && !task.rewarded;
    setTasks((items) => items.map((item) => item.id === id ? { ...item, done: completing, rewarded: item.rewarded || completing } : item));
    if (completing) {
      setCompletedToday((value) => value + 1);
      if (shouldReward) {
        setXp((value) => value + 20);
        setToast('Vazifa bajarildi! +20 XP');
      }
    } else {
      setCompletedToday((value) => Math.max(0, value - 1));
    }
  }

  function addTask(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get('title') || '').trim();
    if (!title) return;
    const priority = String(formData.get('priority'));
    setTasks((items) => [...items, {
      id: Date.now(),
      title,
      subject: String(formData.get('subject') || 'Boshqa'),
      due: String(formData.get('due') || 'Bugun'),
      priority,
      done: false,
    }]);
    setShowForm(false);
    setToast('Yangi vazifa qo‘shildi');
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setRunning(false);
    setSeconds(nextMode === 'focus' ? 25 * 60 : 5 * 60);
  }

  function resetTimer() {
    setRunning(false);
    setSeconds(mode === 'focus' ? 25 * 60 : 5 * 60);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" aria-label="Kun tartibim bosh sahifa">
          <span className="brand-mark"><Icon name="calendar" size={21} /></span>
          <span>kun<span className="brand-accent">tartibim</span></span>
        </a>
        <div className="side-label">MENING HUDUDIM</div>
        <nav className="nav-list" aria-label="Asosiy navigatsiya">
          <a className="nav-item active" href="#home"><Icon name="home" /> <span>Bosh sahifa</span></a>
          <a className="nav-item" href="#schedule"><Icon name="calendar" /> <span>Dars jadvali</span><span className="nav-count">3</span></a>
          <a className="nav-item" href="#tasks"><Icon name="check" /> <span>Vazifalar</span><span className="nav-count">{tasks.filter((task) => !task.done).length}</span></a>
          <a className="nav-item" href="#stats"><Icon name="chart" /> <span>Statistika</span></a>
          <a className="nav-item" href="#rewards"><Icon name="gift" /> <span>Mukofotlar</span></a>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-sparkle">✦</span>
            <strong>Kichik qadamlar, katta natijalar.</strong>
            <span>Bugun kechagidan yaxshiroq bo‘ling!</span>
            <div className="tip-dots"><i /><i /><i /></div>
          </div>
          <button className="nav-item settings-button" type="button"><Icon name="settings" /><span>Sozlamalar</span></button>
          <div className="profile">
            <div className="avatar">S</div>
            <div className="profile-text"><strong>Salom, Sardor!</strong><span>O‘quvchi · 8-sinf</span></div>
            <span className="profile-more">···</span>
          </div>
        </div>
      </aside>

      <main className="main-content" id="home">
        <header className="topbar">
          <div className="breadcrumbs">Bosh sahifa <span>/</span> <strong>Umumiy ko‘rinish</strong></div>
          <div className="topbar-right">
            <span className="today-label">{today}</span>
            <button className="icon-button notification-button" type="button" aria-label="Bildirishnomalar"><Icon name="bell" size={19} /><i /></button>
            <div className="top-avatar">S</div>
          </div>
        </header>

        <section className="welcome-row">
          <div><p className="eyebrow">{today.toLocaleUpperCase('uz-UZ')}</p><h1>Assalomu alaykum, Sardor <span>✌️</span></h1><p className="welcome-subtitle">Bugun ham maqsadlaringizga bir qadam yaqinlashing.</p></div>
          <button className="primary-button" type="button" onClick={() => setShowForm(true)}><Icon name="plus" size={18} /> Vazifa qo‘shish</button>
        </section>

        <section className="stats-row" aria-label="Asosiy statistika">
          <article className="stat-card"><div className="stat-icon purple"><Icon name="check" /></div><div className="stat-copy"><span>Bajarilgan vazifalar</span><strong>{completedToday}<small> ta</small></strong><em className="positive">Bugun bajarildi</em></div><span className="stat-decoration check-decoration">✓</span></article>
          <article className="stat-card"><div className="stat-icon orange"><span>◷</span></div><div className="stat-copy"><span>O‘qish vaqti</span><strong>{(focusSessions * 25 / 60).toFixed(1)}<small> soat</small></strong><em>Bu hafta</em></div><span className="mini-bars"><i /><i /><i /><i /><i /><i /><i /></span></article>
          <article className="stat-card"><div className="stat-icon yellow"><span>✦</span></div><div className="stat-copy"><span>To‘plangan ball</span><strong>{xp}<small> XP</small></strong><em className="positive">+{levelProgress} XP keyingi bosqichgacha</em></div><span className="stat-decoration star-decoration">✦</span></article>
          <article className="stat-card exam-stat"><div className="stat-icon blue"><Icon name="calendar" /></div><div className="stat-copy"><span>Imtihongacha</span><strong>{daysLeft}<small> kun</small></strong><em>12-noyabr · Matematika</em></div><div className="exam-ring"><span>📚</span></div></article>
        </section>

        <section className="exam-banner">
          <div className="banner-icon">🎯</div>
          <div className="banner-copy"><strong>Imtihonga tayyorgarlik vaqti!</strong><span>Matematika imtihonigacha <b>{daysLeft} kun</b> qoldi. Rejangiz bo‘yicha davom eting.</span></div>
          <div className="banner-progress"><div className="banner-progress-label"><span>Tayyorgarlik</span><strong>68%</strong></div><div className="progress-track"><i style={{ width: '68%' }} /></div></div>
          <a href="#tasks" className="banner-link" aria-label="Vazifalarni ko‘rish"><Icon name="arrow" /></a>
          <div className="banner-orb orb-one" /><div className="banner-orb orb-two" />
        </section>

        <div className="content-grid">
          <div className="main-column">
            <section className="panel tasks-panel" id="tasks">
              <div className="panel-heading"><div><h2>Bugungi vazifalar</h2><p>Rejangizdagi ishlarni birma-bir bajaring</p></div><button className="text-button" type="button" onClick={() => setShowForm(true)}>+ Yangi vazifa</button></div>
              <div className="task-toolbar">
                <div className="task-filters" role="group" aria-label="Vazifalarni filtrlash">
                  {['Barchasi', 'Bajarilmagan', 'Bajarilgan'].map((item) => <button key={item} type="button" className={filter === item ? 'filter-chip selected' : 'filter-chip'} onClick={() => setFilter(item)}>{item}{item === 'Barchasi' && <span>{tasks.length}</span>}</button>)}
                </div>
                <span className="priority-note"><span className="priority-dot" /> Muhimligiga qarab</span>
              </div>
              <div className="task-list">
                {visibleTasks.length ? visibleTasks.map((task) => (
                  <article className={task.done ? 'task-row is-done' : 'task-row'} key={task.id}>
                    <button className="task-check" type="button" aria-label={task.done ? 'Vazifani bajarilmagan qilish' : 'Vazifani bajarilgan qilish'} onClick={() => toggleTask(task.id)}>{task.done && <Icon name="check" size={14} />}</button>
                    <div className="task-detail"><strong>{task.title}</strong><span>{task.subject}<i /> {task.due}</span></div>
                    <span className={`priority-badge ${task.priority === 'Yuqori' ? 'high' : task.priority === 'O‘rta' ? 'medium' : 'low'}`}><i />{task.priority}</span>
                    <span className="task-xp">+20 XP</span>
                  </article>
                )) : <div className="empty-state">Bu bo‘limda hozircha vazifa yo‘q. <button type="button" onClick={() => setShowForm(true)}>Vazifa qo‘shing</button></div>}
              </div>
              <div className="task-footer"><span>{tasks.filter((task) => task.done).length} / {tasks.length} vazifa bajarildi</span><div className="task-progress"><i style={{ width: `${tasks.length ? tasks.filter((task) => task.done).length / tasks.length * 100 : 0}%` }} /></div></div>
            </section>

            <section className="panel weekly-panel" id="stats">
              <div className="panel-heading weekly-heading"><div><h2>Haftalik natijalar</h2><p>O‘qish odatlaringizning umumiy ko‘rinishi</p></div><button className="select-button" type="button">Bu hafta <span>⌄</span></button></div>
              <div className="weekly-summary"><strong>{(focusSessions * 25 / 60).toFixed(1)} <small>soat</small></strong><span className="trend">↗ 12.5%</span><span className="summary-caption">o‘tgan haftaga nisbatan</span></div>
              <div className="chart-area">
                <div className="chart-y-labels"><span>4 soat</span><span>3 soat</span><span>2 soat</span><span>1 soat</span><span>0</span></div>
                <div className="chart-plot"><div className="chart-gridlines"><i /><i /><i /><i /><i /></div><div className="bar-list">{weekDays.map((item, index) => <div className="bar-column" key={item.day}><div className="bar-stack"><i className={index === 4 ? 'bar current' : 'bar'} style={{ height: `${Math.max(2, item.hours / 4 * 100)}%` }} /></div><span>{item.day}</span></div>)}</div></div>
              </div>
              <div className="chart-legend"><span><i className="legend-dot" /> O‘qish vaqti</span><span><i className="legend-line" /> Haftalik maqsad: 16 soat</span></div>
            </section>
          </div>

          <div className="side-column">
            <section className="panel timer-panel" id="focus">
              <div className="panel-heading compact-heading"><div><h2>Fokus taymeri</h2><p>Diqqatingizni jamlang</p></div><span className="timer-sparkle">✦</span></div>
              <div className="timer-tabs"><button className={mode === 'focus' ? 'timer-tab active' : 'timer-tab'} type="button" onClick={() => changeMode('focus')}>Fokus</button><button className={mode === 'break' ? 'timer-tab active' : 'timer-tab'} type="button" onClick={() => changeMode('break')}>Tanaffus</button></div>
              <div className={`timer-ring ${running ? 'is-running' : ''}`}><div className="timer-ring-inner"><span className="timer-time">{timeLabel}</span><span className="timer-caption">{mode === 'focus' ? 'diqqat bilan o‘qing' : 'biroz dam oling'}</span></div></div>
              <div className="timer-controls"><button type="button" className="timer-play" onClick={() => { if (seconds === 0) setSeconds(mode === 'focus' ? 25 * 60 : 5 * 60); setRunning(!running); }}><Icon name={running ? 'pause' : 'play'} size={17} />{running ? 'To‘xtatish' : 'Boshlash'}</button><button type="button" className="timer-reset" onClick={resetTimer} aria-label="Taymerni qayta boshlash"><Icon name="reset" size={19} /></button></div>
              <div className="session-note"><span>Bugungi fokus</span><strong>⚡ {focusSessions} seans</strong></div>
            </section>

            <section className="panel schedule-panel" id="schedule">
              <div className="panel-heading compact-heading"><div><h2>Bugungi darslar</h2><p>{today}</p></div><button className="more-button" type="button" aria-label="Barcha darslar">···</button></div>
              <div className="schedule-list">{schedule.map((item, index) => <div className="schedule-item" key={item.subject}><div className="schedule-time"><strong>{item.time}</strong><span>{item.end}</span></div><div className={`schedule-symbol ${item.color}`}>{item.initials}</div><div className="schedule-subject"><strong>{item.subject}</strong><span>{item.room}</span></div>{index === 0 && <span className="now-dot" title="Joriy dars" />}</div>)}</div>
              <a className="schedule-link" href="#schedule">To‘liq jadvalni ko‘rish <Icon name="arrow" size={15} /></a>
            </section>

            <section className="reward-card" id="rewards">
              <div className="reward-top"><div><span className="reward-eyebrow">SIZNING DARAJANGIZ</span><h3>🌱 Yangi boshlovchi</h3></div><span className="level-badge">LVL {level}</span></div>
              <div className="reward-progress-copy"><span>{xp} XP</span><span>{level * 100} XP</span></div><div className="reward-track"><i style={{ width: `${levelProgress}%` }} /></div>
              <p>Keyingi darajaga <b>{100 - levelProgress} XP</b> qoldi</p><div className="reward-bottom"><span>🏅 3 ta mukofot ochildi</span><a href="#rewards">Ko‘rish <Icon name="arrow" size={14} /></a></div>
            </section>
          </div>
        </div>
        <footer className="page-footer">Har bir kichik qadam — katta yutuq sari yo‘l <span>✦</span></footer>
      </main>

      {showForm && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false); }}>
        <form className="task-modal" onSubmit={addTask}>
          <div className="modal-heading"><div><h2>Yangi vazifa</h2><p>Bugungi rejangizga vazifa qo‘shing</p></div><button type="button" className="icon-button" onClick={() => setShowForm(false)} aria-label="Yopish"><Icon name="close" /></button></div>
          <label>Vazifa nomi<input name="title" placeholder="Masalan, 10 ta masala yechish" autoFocus required maxLength={100} /></label>
          <div className="form-row"><label>Fan<input name="subject" placeholder="Masalan, Matematika" /></label><label>Muddat<input name="due" placeholder="Bugun, 18:00" /></label></div>
          <label>Muhimlik darajasi<select name="priority" defaultValue="O‘rta"><option>Yuqori</option><option>O‘rta</option><option>Past</option></select></label>
          <button className="primary-button modal-submit" type="submit"><Icon name="plus" size={18} /> Vazifani qo‘shish</button>
        </form>
      </div>}
      {toast && <div className="toast" role="status">✦ {toast}</div>}
    </div>
  );
}

export default App;
