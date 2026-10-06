// src/data/mockData.ts

export const TODAY = new Date(2026, 7, 10); // 10 Aug 2026

export function iso(offsetDays: number): string {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

export const STAFF = [
  { id: 1, name: 'Anil Kumar Nair', role: 'Recovery Officer', phone: '+91 98470 11223', email: 'anil@intopilot.in' },
  { id: 2, name: 'Priya Subramaniam', role: 'Senior Sales Manager', phone: '+91 98470 55667', email: 'priya@intopilot.in' },
  { id: 3, name: 'Deepak Menon', role: 'Recovery Officer', phone: '+91 98470 99881', email: 'deepak@intopilot.in' },
];

export const PROJECTS = [
  { id: 'p1', name: 'Green Valley Phase 2', location: 'Kochi, Kerala', plotPrefix: 'A', targetClients: 400 },
  { id: 'p2', name: 'Sunrise Meadows', location: 'Trivandrum, Kerala', plotPrefix: 'C', targetClients: 120 },
  { id: 'p3', name: 'Palm County', location: 'Kozhikode, Kerala', plotPrefix: 'E', targetClients: 85 },
  { id: 'p4', name: 'Coastal Heights', location: 'Alappuzha, Kerala', plotPrefix: 'G', targetClients: 60 },
];

export function getProject(id: string) {
  return PROJECTS.find(p => p.id === id);
}

export function getStaff(id: number) {
  return STAFF.find(s => s.id === id);
}

export const CASES: any[] = [
  {
    id: 1, code: 'RC-00001', status: 'open', projectId: 'p1',
    buyer: { name: 'Rajesh Kumar', phone: '+91 90000 11111', email: 'rajesh@gmail.com', pan: 'ABCDE1234F', aadhar: '[Redacted]', address: '12 MG Road, Kochi, Kerala' },
    plot: { plotNumber: 'A-101', project: 'Green Valley Phase 2, Kochi', surveyNumber: '245/2A', extentSqft: 2400, facing: 'East', ratePerSqft: 1250, totalValue: 3000000, bookingDate: '2026-01-15', agreementNo: 'GVP2-AGR-0101', registrationStatus: 'Pending', commissionPerSqft: 65, commissionPaidAmount: 156000 },
    assignedStaffId: 1, dueDate: iso(-5), installmentAmount: 150000,
    payments: [
      { rn: 1, date: '2026-01-15', amount: 300000, chNo: '—', receivedDate: '2026-01-15', bankName: 'Cash', remark: 'Booking amount', drawnOn: '—', chDate: '—', bookedBy: 'Priya Subramaniam' },
      { rn: 2, date: '2026-03-15', amount: 150000, chNo: '552011', receivedDate: '2026-03-16', bankName: 'HDFC Bank', remark: 'Installment 1', drawnOn: 'HDFC Bank, MG Road', chDate: '2026-03-15', bookedBy: 'Anil Kumar Nair' },
      { rn: 3, date: '2026-05-15', amount: 150000, chNo: '552018', receivedDate: '2026-05-17', bankName: 'HDFC Bank', remark: 'Installment 2', drawnOn: 'HDFC Bank, MG Road', chDate: '2026-05-15', bookedBy: 'Anil Kumar Nair' },
    ],
    activity: [
      { date: '2026-01-15', title: 'Case Created', desc: 'Recovery case opened on booking of plot A-101.' },
      { date: '2026-05-17', title: 'Payment Received', desc: '₹1,50,000 received via cheque 552018, HDFC Bank.' },
      { date: iso(-5), title: 'Installment Due', desc: 'Installment 3 of ₹1,50,000 became due.' },
    ]
  }
];

// Bulk client generator for 665 targets
const FIRST_NAMES = ['Anil','Suresh','Ramesh','Vinod','Rajesh','Sunil','Manoj','Deepak','Arun','Sanjay','Ajay','Vijay','Naveen','Praveen','Kiran','Ravi','Mohan','Gopal','Hari','Krishna','Meena','Anjali','Priya','Fathima','Radha','Latha','Sujatha','Geetha','Kavya','Divya','Shalini','Nisha','Reshma','Sindhu','Bindu','Asha','Rahul','Nikhil','Amit','Sneha'];
const LAST_NAMES = ['Kumar','Nair','Menon','Pillai','Warrier','Iyer','Babu','Das','Varma','Panicker','Thomas','Jose','Beevi','Rahman','Khan','Mehta','Shah','Patel','Reddy','Chandran'];
const FACINGS = ['East','West','North','South','North-East','North-West','South-East','South-West'];
const BANKS = ['HDFC Bank','SBI','ICICI Bank','Federal Bank','Canara Bank','Axis Bank','Union Bank','South Indian Bank'];

function genName() { return pick(FIRST_NAMES) + ' ' + pick(LAST_NAMES); }
function genPhone() { return '+91 9' + randInt(1000, 9999) + ' ' + randInt(10000, 99999); }
function genPAN() { 
  const L = () => String.fromCharCode(65 + randInt(0, 25)); 
  return L() + L() + L() + L() + L() + randInt(1000, 9999) + L(); 
}

let runningId = CASES.length;
function genBulkForProject(project: any) {
  const existing = CASES.filter(c => c.projectId === project.id).length;
  const need = Math.max(0, project.targetClients - existing);

  for (let i = 0; i < need; i++) {
    runningId++;
    const totalValue = randInt(15, 35) * 100000;
    const bookingAmount = Math.round(totalValue * (0.15 + Math.random() * 0.05) / 1000) * 1000;
    const installmentAmount = Math.round((totalValue - bookingAmount) / 6 / 1000) * 1000;
    const paidInstallments = randInt(0, 4);
    const paid = Math.min(totalValue, bookingAmount + paidInstallments * installmentAmount);
    const balance = totalValue - paid;

    const r = Math.random();
    let overdue: number | null;
    if (balance <= 0) { overdue = null; }
    else if (r < 0.40) overdue = randInt(-40, 10);
    else if (r < 0.58) overdue = randInt(11, 12);
    else if (r < 0.72) overdue = randInt(13, 14);
    else if (r < 0.82) overdue = 15;
    else overdue = randInt(16, 45);

    const dueDate = (balance <= 0 || overdue === null) ? (balance <= 0 ? null : iso(-overdue)) : iso(-overdue);
    const bookingDaysAgo = randInt(40, 320);
    const bookingDate = iso(-bookingDaysAgo);
    const buyerName = genName();
    const plotNumber = project.plotPrefix + '-' + (100 + existing + i);
    const extentSqft = randInt(1200, 3000);
    const ratePerSqft = Math.round(totalValue / extentSqft / 50) * 50;
    const stage = balance <= 0 ? 'paid' : (overdue === null || overdue < 0 ? 'ontrack' : overdue <= 10 ? 'grace' : overdue <= 12 ? 'sms' : overdue <= 14 ? 'wa' : overdue === 15 ? 'voice' : 'escalated');

    const payments: any[] = [{ rn: 1, date: bookingDate, amount: bookingAmount, chNo: '—', receivedDate: bookingDate, bankName: 'Cash', remark: 'Booking amount', drawnOn: '—', chDate: '—', bookedBy: pick(STAFF).name }];
    let runningDate = new Date(bookingDate);
    for (let k = 1; k <= paidInstallments; k++) {
      runningDate = new Date(runningDate);
      runningDate.setDate(runningDate.getDate() + 60);
      const bank = pick(BANKS);
      payments.push({
        rn: k + 1,
        date: runningDate.toISOString().slice(0, 10),
        amount: installmentAmount,
        chNo: String(randInt(100000, 999999)),
        receivedDate: runningDate.toISOString().slice(0, 10),
        bankName: bank,
        remark: 'Installment ' + k,
        drawnOn: bank + ', Branch',
        chDate: runningDate.toISOString().slice(0, 10),
        bookedBy: pick(STAFF).name
      });
    }

    const activity: any[] = [{ date: bookingDate, title: 'Case Created', desc: 'Recovery case opened on booking of plot ' + plotNumber + '.' }];
    if (stage === 'paid') {
      activity.push({ date: iso(-randInt(1, 30)), title: 'Case Resolved', desc: 'Plot fully paid.' });
    }

    CASES.push({
      id: runningId,
      code: 'RC-' + String(runningId).padStart(5, '0'),
      status: stage === 'paid' ? 'resolved' : (stage === 'escalated' || stage === 'voice' ? 'in_progress' : 'open'),
      projectId: project.id,
      buyer: {
        name: buyerName,
        phone: genPhone(),
        email: buyerName.toLowerCase().replace(/ /g, '.') + '@gmail.com',
        pan: genPAN(),
        aadhar: '[Redacted]',
        address: 'Plot ' + plotNumber + ', ' + project.name
      },
      plot: {
        plotNumber,
        project: project.name + ', ' + project.location,
        surveyNumber: randInt(10, 999) + '/' + randInt(1, 9),
        extentSqft,
        facing: pick(FACINGS),
        ratePerSqft,
        totalValue,
        bookingDate,
        agreementNo: project.plotPrefix + '-AGR-' + plotNumber,
        registrationStatus: stage === 'paid' ? 'Registered' : 'Pending',
        commissionPerSqft: randInt(40, 90),
        commissionPaidAmount: randInt(10000, 50000)
      },
      assignedStaffId: pick(STAFF).id,
      dueDate,
      installmentAmount: balance <= 0 ? 0 : installmentAmount,
      payments,
      activity
    });
  }
}
PROJECTS.forEach(genBulkForProject);

export function fmtINR(n: number): string {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

export function fmtDate(s: string): string {
  if (!s || s === '—') return '—';
  const d = new Date(s);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function totalPaid(c: any): number {
  return c.payments.reduce((s: number, p: any) => s + p.amount, 0);
}

export function balanceOf(c: any): number {
  return Math.max(0, c.plot.totalValue - totalPaid(c));
}

export function overdueDays(c: any): number | null {
  if (balanceOf(c) <= 0 || !c.dueDate) return null;
  return Math.floor((TODAY.getTime() - new Date(c.dueDate).getTime()) / (1000 * 60 * 60 * 24));
}

export function stageOf(c: any) {
  if (balanceOf(c) <= 0) return { key: 'paid', label: 'Fully Paid', color: 'green' };
  const d = overdueDays(c);
  if (d === null || d < 0) return { key: 'ontrack', label: 'On Track', color: 'blue' };
  if (d <= 10) return { key: 'grace', label: 'Grace Period', color: 'blue' };
  if (d <= 12) return { key: 'sms', label: 'Day 11 · SMS Sent', color: 'orange' };
  if (d <= 14) return { key: 'wa', label: 'Day 13 · WhatsApp Sent', color: 'orange' };
  if (d === 15) return { key: 'voice', label: 'Day 15 · Voice Call', color: 'red' };
  return { key: 'escalated', label: 'Day 16+ · Escalated', color: 'red' };
}

export function statusBadge(status: string): string {
  const map: Record<string, [string, string]> = {
    open: ['Open', 'blue'],
    in_progress: ['In Progress', 'orange'],
    resolved: ['Resolved', 'green']
  };
  const pair = map[status] || ['—', 'gray'];
  return `<span class="badge b-${pair[1]}">${pair[0]}</span>`;
}

export function badge(text: string, color: string): string {
  return `<span class="badge b-${color}">${text}</span>`;
}

export function projectStats(projectId: string) {
  const list = CASES.filter(c => c.projectId === projectId);
  const totalValue = list.reduce((s, c) => s + c.plot.totalValue, 0);
  const collected = list.reduce((s, c) => s + totalPaid(c), 0);
  return {
    count: list.length,
    totalValue,
    collected,
    pending: totalValue - collected,
    rate: totalValue ? Math.round((collected / totalValue) * 100) : 0
  };
}

export function paginate<T>(arr: T[], page: number, perPage: number) {
  const totalPages = Math.max(1, Math.ceil(arr.length / perPage));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  return {
    rows: arr.slice((currentPage - 1) * perPage, currentPage * perPage),
    page: currentPage,
    totalPages,
    total: arr.length
  };
}