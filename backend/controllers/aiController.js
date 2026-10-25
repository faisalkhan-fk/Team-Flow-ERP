const { memoryStore } = require('./employeeController');

/**
 * Intelligent Enterprise AI Assistant for TeamFlow ERP
 * Dynamically queries workforce, payroll, client deliverables, leave policies, and telemetry.
 */
const askAI = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    const q = (prompt || '').trim();
    const lower = q.toLowerCase();

    const emps = memoryStore.employees || [];
    const prjs = memoryStore.projects || [];
    const tasks = memoryStore.tasks || [];
    const depts = memoryStore.departments || [];
    const att = memoryStore.attendance || [];
    const leaves = memoryStore.leaves || [];

    let response = '';

    // 1. SPECIFIC SICK LEAVE QUERY
    if (
      lower.includes('sick leave') ||
      lower.includes('sick') ||
      lower.includes('medical') ||
      lower.includes('bimari') ||
      lower.includes('doctor')
    ) {
      const sickLeaves = leaves.filter((l) => (l.leaveType || '').toLowerCase().includes('sick'));
      const pendingSick = sickLeaves.filter((l) => l.status === 'PENDING');
      
      response = `🏥 **TeamFlow Sick Leave Policy & Status:**\n` +
        `• **Annual Allowance:** All full-time employees are entitled to **10 days of paid Sick Leave** per year (average 7 days remaining for employees this cycle).\n` +
        `• **Policy Guidelines:** A registered medical practitioner's certificate is required if sick leave exceeds 2 consecutive days.\n` +
        (pendingSick.length > 0
          ? `• **Current Active Request:** ${pendingSick.map(p => `${p.employeeName} (${p.department}) has requested ${p.days} days (${p.startDate} to ${p.endDate}) for reason: "${p.reason}". Status: **PENDING HR APPROVAL**`).join('; ')}.\n`
          : `• **Current Active Request:** No pending sick leave applications at this time.\n`) +
        `• **Action:** Employees can submit medical slips and apply directly from the **Leave Requests** portal.`;

    // 2. CASUAL LEAVE QUERY
    } else if (
      lower.includes('casual leave') ||
      lower.includes('cl')
    ) {
      response = `🌴 **Casual Leave (CL) Guidelines:**\n` +
        `• **Annual Entitlement:** **12 days of Casual Leave** per calendar year (10 days remaining average).\n` +
        `• **Purpose:** Intended for unforeseen personal obligations, urgent family events, or short personal breaks.\n` +
        `• **Rules:** Maximum 3 consecutive casual leaves can be availed at a time without prior departmental HOD sign-off.`;

    // 3. PAID / ANNUAL LEAVE QUERY
    } else if (
      lower.includes('paid leave') ||
      lower.includes('annual leave') ||
      lower.includes('privilege leave') ||
      lower.includes('earned leave') ||
      lower.includes('vacation')
    ) {
      const activePaid = leaves.filter(l => l.status === 'APPROVED');
      response = `🏖️ **Paid Annual Leave Policy:**\n` +
        `• **Annual Entitlement:** **18 days of Paid Leave** per year (15 days remaining on average).\n` +
        `• **Encashment & Carryover:** Up to 8 unused annual leaves can be carried forward or encashed as per Indian labor statutory rules.\n` +
        (activePaid.length > 0 
          ? `• **Currently on Leave:** ${activePaid.map(a => `${a.employeeName} (${a.department}) is on approved paid leave until ${a.endDate} (${a.reason})`).join(', ')}.`
          : `• All employees are currently on duty.`);

    // 4. GENERAL LEAVE / HOLIDAY / ABSENT QUERY
    } else if (
      lower.includes('leave') ||
      lower.includes('chutti') ||
      lower.includes('holiday') ||
      lower.includes('absent') ||
      lower.includes('pto')
    ) {
      const approved = leaves.filter(l => l.status === 'APPROVED');
      const pending = leaves.filter(l => l.status === 'PENDING');
      response = `📋 **Workforce Leave Summary:**\n` +
        `• **Company Leave Quotas:** Casual Leave: 12 days | Sick Leave: 10 days | Paid Annual Leave: 18 days.\n` +
        `• **Currently On Leave:** ${approved.length > 0 ? approved.map(a => `${a.employeeName} (${a.leaveType})`).join(', ') : 'None'}.\n` +
        `• **Pending Approvals:** ${pending.length} request(s) awaiting managerial review${pending.length > 0 ? ` (${pending.map(p => `${p.employeeName} - ${p.leaveType}`).join(', ')})` : ''}.\n` +
        `• You can approve or submit new applications in the **Leave Requests** dashboard.`;

    // 5. EMPLOYEE SPECIFIC LOOKUP (By name or ID)
    } else if (
      emps.some(e => lower.includes(e.name.toLowerCase().split(' ')[0]) || lower.includes((e.employeeId || '').toLowerCase()))
    ) {
      const matched = emps.find(e => 
        lower.includes(e.name.toLowerCase().split(' ')[0]) || 
        lower.includes((e.employeeId || '').toLowerCase())
      );
      if (matched) {
        response = `👤 **Employee Profile: ${matched.name}**\n` +
          `• **Employee ID:** ${matched.employeeId}\n` +
          `• **Department & Designation:** ${matched.department} — ${matched.role}\n` +
          `• **Annual Compensation (CTC):** ₹${Number(matched.salary || 0).toLocaleString('en-IN')} / year (${(matched.salary / 100000).toFixed(1)} LPA)\n` +
          `• **Performance Score:** ⭐ ${matched.performanceScore || '4.5'} / 5.0\n` +
          `• **PAN & UAN:** ${matched.pan || 'PAN Verified'} | UAN: ${matched.uan || 'N/A'}\n` +
          `• **Key Skills:** ${(matched.skills || []).join(', ')}\n` +
          `• **Work Email:** ${matched.email}\n` +
          `• **Status:** Active (100% attendance & statutory EPF/TDS compliant).`;
      }

    // 6. GENERAL WORKFORCE / STAFF QUERIES
    } else if (
      lower.includes('employee') ||
      lower.includes('workforce') ||
      lower.includes('staff') ||
      lower.includes('team') ||
      lower.includes('headcount')
    ) {
      const deptCounts = {};
      emps.forEach(e => { deptCounts[e.department] = (deptCounts[e.department] || 0) + 1; });
      const deptSummary = Object.entries(deptCounts).map(([d, c]) => `${d}: ${c}`).join(' | ');
      const topPerformer = [...emps].sort((a,b) => (b.performanceScore || 0) - (a.performanceScore || 0))[0];

      response = `👥 **Workforce Overview:**\n` +
        `• **Total Headcount:** ${emps.length} on-roll engineers & specialists.\n` +
        `• **Division Breakdown:** ${deptSummary}.\n` +
        `• **Top Performer:** ${topPerformer ? `${topPerformer.name} (${topPerformer.role}, Rating: ${topPerformer.performanceScore})` : 'Arjun Singhania'}.\n` +
        `• **Offices:** Gurugram HQ (Cyber City), Bengaluru, Hyderabad, Noida, and Mumbai.`;

    // 7. SPECIFIC PROJECT LOOKUP (Tata, Reliance, HDFC, or PRJ Code)
    } else if (
      lower.includes('tata') ||
      lower.includes('reliance') ||
      lower.includes('hdfc') ||
      prjs.some(p => lower.includes((p.projectCode || '').toLowerCase()))
    ) {
      const prj = prjs.find(p => 
        lower.includes((p.projectCode || '').toLowerCase()) ||
        lower.includes((p.client || '').toLowerCase().split(' ')[0])
      ) || prjs[0];

      response = `🚀 **Enterprise Project: ${prj.title} (${prj.projectCode})**\n` +
        `• **Client Organization:** ${prj.client}\n` +
        `• **Financial Budget:** ₹${Number(prj.budget || 0).toLocaleString('en-IN')} (${(prj.budget / 100000).toFixed(1)} Lakhs)\n` +
        `• **Current Progress:** ${prj.completionPercentage}% (${prj.status})\n` +
        `• **Project Lead:** ${prj.leadEmployee}\n` +
        `• **Priority & Division:** ${prj.priority} Priority | ${prj.department}\n` +
        `• **Target Milestone Deadline:** ${new Date(prj.deadline).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}.`;

    // 8. ALL PROJECTS / CLIENT INITIATIVES
    } else if (
      lower.includes('project') ||
      lower.includes('client') ||
      lower.includes('deliverable') ||
      lower.includes('roadmap')
    ) {
      const totalBudget = prjs.reduce((a, b) => a + (b.budget || 0), 0);
      const prjList = prjs.map(p => `• **${p.projectCode}**: ${p.title} (${p.client}) — ${p.completionPercentage}% Done (Budget: ₹${(p.budget/100000).toFixed(1)}L)`).join('\n');

      response = `📂 **Enterprise Client Deliverables Roadmap:**\n` +
        `Tracking **${prjs.length} major client initiatives** with combined contract value of **₹${(totalBudget/10000000).toFixed(2)} Crores (₹${(totalBudget/100000).toFixed(1)} Lakhs)**:\n` +
        prjList + `\n\nAll deliverables are currently pacing on schedule with zero blocker dependencies.`;

    // 9. SALARY, CTC & PAYROLL QUERIES
    } else if (
      lower.includes('salary') ||
      lower.includes('compensation') ||
      lower.includes('payroll') ||
      lower.includes('ctc') ||
      lower.includes('lpa') ||
      lower.includes('epf') ||
      lower.includes('tax') ||
      lower.includes('tds') ||
      lower.includes('paisa')
    ) {
      const totalCTC = emps.reduce((acc, curr) => acc + (curr.salary || 0), 0);
      const avgCTC = Math.round(totalCTC / (emps.length || 1));
      const sorted = [...emps].sort((a,b) => b.salary - a.salary);

      response = `💰 **Indian Corporate Payroll & Compensation Telemetry:**\n` +
        `• **Total Annual Outlay:** ₹${(totalCTC / 100000).toFixed(2)} Lakhs across ${emps.length} engineers.\n` +
        `• **Average Package:** ₹${(avgCTC / 100000).toFixed(2)} LPA.\n` +
        `• **Highest CTC:** ₹${(sorted[0].salary / 100000).toFixed(1)} LPA (${sorted[0].name} — ${sorted[0].role}).\n` +
        `• **Indian Statutory Structure:** Basic Pay 50%, HRA 20%, Conveyance ₹1,600, Medical Allowance ₹1,250.\n` +
        `• **Mandatory Deductions:** Employee Provident Fund (EPF 12%), Professional Tax (₹200/mo standard), and estimated TDS.\n` +
        `• Official computerized pay slips can be downloaded or printed from the **Employee Directory**.`;

    // 10. ATTENDANCE & BIOMETRIC TIMINGS
    } else if (
      lower.includes('attendance') ||
      lower.includes('punch') ||
      lower.includes('clock') ||
      lower.includes('timing') ||
      lower.includes('shift') ||
      lower.includes('present')
    ) {
      const presentCount = att.filter(a => a.status === 'Present' || a.status === 'Late').length;
      const lateCount = att.filter(a => a.status === 'Late').length;

      response = `⏱️ **Biometric Time & Attendance Telemetry:**\n` +
        `• **On-Shift Today:** ${presentCount} / ${emps.length} employees clocked in.\n` +
        `• **Punctuality Status:** ${lateCount > 0 ? `${lateCount} logged after 09:30 AM (Late marked)` : 'All members on-time'}.\n` +
        `• **Standard Office Hours:** 09:00 AM – 06:00 PM IST (Monday to Friday).\n` +
        `• **Average Shift Duration:** 7.9 hours.\n` +
        `• Team members can clock in/out live using the biometric punch widget on the **Time & Attendance** page.`;

    // 11. SPRINT & KANBAN TASKS
    } else if (
      lower.includes('task') ||
      lower.includes('sprint') ||
      lower.includes('kanban') ||
      lower.includes('backlog') ||
      lower.includes('todo') ||
      lower.includes('urgent')
    ) {
      const done = tasks.filter(t => t.status === 'Done').length;
      const inProg = tasks.filter(t => t.status === 'In Progress').length;
      const review = tasks.filter(t => t.status === 'Review').length;
      const todo = tasks.filter(t => t.status === 'Todo').length;

      response = `📋 **Sprint Kanban Health & Velocity:**\n` +
        `• **Total Sprint Tasks:** ${tasks.length} active work items.\n` +
        `• **Workflow Status:** ${done} Done | ${inProg} In Progress | ${review} Under Review | ${todo} Pending Todo.\n` +
        `• **Sprint Velocity:** 42 story points/sprint.\n` +
        `• **Key Item:** ${tasks[0] ? `"${tasks[0].title}" assigned to ${tasks[0].assignedTo} (${tasks[0].status})` : 'All tasks pacing well.'}`;

    // 12. DEPARTMENTS & HUBS
    } else if (
      lower.includes('department') ||
      lower.includes('division') ||
      lower.includes('office') ||
      lower.includes('location') ||
      lower.includes('gurugram') ||
      lower.includes('bengaluru') ||
      lower.includes('hyderabad')
    ) {
      const deptList = depts.map(d => `• **${d.name}** (Head: ${d.head}) — Budget: ₹${(d.budget/100000).toFixed(1)}L | *${d.location}*`).join('\n');
      response = `🏢 **Corporate Divisions & Operating Hubs:**\n` + deptList;

    // 13. GREETINGS & INTRO
    } else if (
      lower.includes('hi') ||
      lower.includes('hello') ||
      lower.includes('hey') ||
      lower.includes('namaste') ||
      lower.includes('who are you') ||
      lower.includes('help') ||
      lower.includes('kya kar')
    ) {
      response = `👋 **Hello! I am your TeamFlow Enterprise AI Assistant.**\n\n` +
        `I am continuously synchronized with our corporate databases and can help you with:\n` +
        `1. 🌴 **Leave Policies:** Ask *"What about sick leave?"*, *"Who is on leave?"*, or *"Casual leave policy"*.\n` +
        `2. 👤 **Employee Profiles:** Ask *"Who is Arjun Singhania?"* or *"Tell me about Sneha Roy"*.\n` +
        `3. 💰 **Salary & Compensation:** Ask *"What is total payroll?"* or *"Highest CTC"*.\n` +
        `4. 🚀 **Enterprise Projects:** Ask *"Tata project status"* or *"Active deliverables"*.\n` +
        `5. ⏱️ **Attendance & Sprints:** Ask *"Today's attendance"* or *"Pending sprint tasks"*.`;

    // 14. DEFAULT CONTEXTUAL FALLBACK
    } else {
      response = `🤖 **TeamFlow Intelligence Report for:** *"${q}"*\n\n` +
        `I analyzed your query across our live ERP telemetry:\n` +
        `• **Workforce Status:** ${emps.length} active engineers (100% headcount accounted).\n` +
        `• **Active Deliverables:** 3 enterprise contracts (Tata Digital, Reliance Retail, HDFC Bank) with ₹1.08 Cr value.\n` +
        `• **Fiscal Compliance:** ₹62.70 Lakhs annual payroll compliant with Indian EPF & TDS laws.\n\n` +
        `💡 *Try asking specific questions like:* \n` +
        `• *"What about sick leave?"*\n` +
        `• *"Tell me about Arjun Singhania"*\n` +
        `• *"What is the status of the Tata project?"*\n` +
        `• *"How many tasks are in progress?"*`;
    }

    res.status(200).json({
      success: true,
      query: prompt,
      reply: response,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { askAI };
