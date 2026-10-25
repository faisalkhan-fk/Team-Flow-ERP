const { memoryStore } = require('./employeeController');

// Helper to ensure users list is initialized
const getUsersList = () => {
  if (!memoryStore.users) {
    memoryStore.users = [
      { id: 'usr-1', employeeId: 'TF-IND-101', username: 'admin', password: 'password123', name: 'Arjun Singhania', email: 'admin@teamflow.in', role: 'ROLE_ADMIN', roles: ['ROLE_ADMIN'], department: 'Engineering', status: 'Approved' },
      { id: 'usr-2', employeeId: 'TF-IND-102', username: 'manager', password: 'password123', name: 'Sneha Roy', email: 'manager@teamflow.in', role: 'ROLE_MANAGER', roles: ['ROLE_MANAGER'], department: 'Product', status: 'Approved' },
      { id: 'usr-3', employeeId: 'TF-IND-103', username: 'employee', password: 'password123', name: 'Ananya Sharma', email: 'employee@teamflow.in', role: 'ROLE_EMPLOYEE', roles: ['ROLE_EMPLOYEE'], department: 'Engineering', status: 'Approved' },
      { id: 'usr-faisal', employeeId: 'TF-IND-107', username: 'faisal', password: 'password123', name: 'Faisal Khan', email: 'kingkhan7863030@gmail.com', alternateEmails: ['faisalkhan7863030@gmail.com', 'faisal@gmail.com'], role: 'ROLE_EMPLOYEE', roles: ['ROLE_EMPLOYEE'], department: 'Engineering', designation: 'Software Engineer', status: 'Approved' },
    ];
  } else {
    // Ensure existing seed users have Approved status and default password/employeeId
    memoryStore.users.forEach((u) => {
      if (!u.status) u.status = 'Approved';
      if (!u.password) u.password = 'password123';
      if (!u.employeeId) {
        if (u.username === 'faisal') u.employeeId = 'TF-IND-107';
        else if (u.username === 'admin') u.employeeId = 'TF-IND-101';
        else if (u.username === 'manager') u.employeeId = 'TF-IND-102';
        else if (u.username === 'employee') u.employeeId = 'TF-IND-103';
      }
    });
  }
  return memoryStore.users;
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Both username/email and password are required.' });
    }

    const users = getUsersList();

    const cleanUsername = (username || '').trim().toLowerCase();
    const found = users.find(
      (u) =>
        u.username.toLowerCase() === cleanUsername ||
        (u.email && u.email.toLowerCase() === cleanUsername)
    );

    if (found) {
      // Strict Password Verification
      const expectedPassword = found.password || 'password123';
      if (password !== expectedPassword) {
        return res.status(401).json({
          message: 'Invalid credentials. The password you entered is incorrect.',
        });
      }

      // Admin account is always Approved
      if (cleanUsername !== 'admin' && found.role !== 'ROLE_ADMIN') {
        if (found.status === 'Pending') {
          return res.status(403).json({
            message: 'Your account is pending Admin approval. Please wait for the Administrator to approve your account before logging in.',
            status: 'Pending',
          });
        }
        if (found.status === 'Rejected') {
          return res.status(403).json({
            message: 'Your account registration was rejected by the Administrator.',
            status: 'Rejected',
          });
        }
      }

      const userRole = found.role || (found.roles && found.roles[0]) || (cleanUsername === 'admin' ? 'ROLE_ADMIN' : 'ROLE_EMPLOYEE');
      const assignedEmpId = found.employeeId || (found.username === 'faisal' ? 'TF-IND-107' : found.username === 'admin' ? 'TF-IND-101' : 'TF-IND-100');

      return res.status(200).json({
        id: found.id || found._id || 'usr-' + Date.now(),
        employeeId: assignedEmpId,
        username: found.username,
        name: found.name,
        email: found.email,
        roles: [userRole],
        role: userRole,
        department: found.department || 'Engineering',
        designation: found.designation || (userRole === 'ROLE_ADMIN' ? 'System Administrator' : userRole === 'ROLE_MANAGER' ? 'Project Manager' : 'Software Engineer'),
        status: found.status || 'Approved',
        accessToken: 'mock_jwt_token_' + Date.now(),
      });
    }

    // Master Admin fallback if not explicitly in list
    if (cleanUsername === 'admin') {
      if (password !== 'admin123' && password !== 'password123') {
        return res.status(401).json({ message: 'Invalid credentials. The password you entered is incorrect.' });
      }
      return res.status(200).json({
        id: 'usr-1',
        employeeId: 'TF-IND-101',
        username: 'admin',
        name: 'Arjun Singhania (Admin)',
        email: 'admin@teamflow.in',
        roles: ['ROLE_ADMIN'],
        role: 'ROLE_ADMIN',
        department: 'Engineering',
        designation: 'System Administrator',
        status: 'Approved',
        accessToken: 'mock_jwt_token_' + Date.now(),
      });
    }

    return res.status(401).json({
      message: 'Invalid credentials. User not found. Please verify your username/email or register.',
    });
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const { username, email, name, password, department, role, designation } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Admin account cannot be created via signup
    if (cleanUsername === 'admin' || (email && email.toLowerCase() === 'admin@teamflow.in')) {
      return res.status(400).json({
        message: 'Admin account is pre-configured and unique. Only Employee or Manager accounts can be created.',
      });
    }

    // Role validation: strictly Employee or Manager
    let assignedRole = 'ROLE_EMPLOYEE';
    if (role === 'ROLE_MANAGER' || role === 'Manager' || role === 'manager') {
      assignedRole = 'ROLE_MANAGER';
    } else if (role === 'ROLE_EMPLOYEE' || role === 'Employee' || role === 'employee') {
      assignedRole = 'ROLE_EMPLOYEE';
    } else if (role === 'ROLE_ADMIN' || role === 'Admin' || role === 'admin') {
      return res.status(400).json({
        message: 'Admin creation is restricted. Only Employee and Manager accounts can be registered.',
      });
    }

    const users = getUsersList();
    const exists = users.find(
      (u) =>
        u.username.toLowerCase() === cleanUsername ||
        (email && u.email && u.email.toLowerCase() === email.trim().toLowerCase())
    );
    if (exists) {
      return res.status(400).json({ message: 'Username or email is already registered' });
    }

    const positionTitle = designation || (assignedRole === 'ROLE_MANAGER' ? 'Project Lead / Manager' : 'Software Engineer');

    const newUser = {
      id: 'usr-' + Date.now(),
      username: username.trim(),
      password,
      name: (name || username).trim(),
      email: (email || `${cleanUsername}@teamflow.in`).trim(),
      role: assignedRole,
      roles: [assignedRole],
      designation: positionTitle,
      department: department || 'Engineering',
      status: 'Pending', // Requires Admin Approval!
      requestedAt: new Date().toISOString(),
      accessToken: 'mock_jwt_token_' + Date.now(),
    };

    users.push(newUser);

    // If Employee account: Automatically ADD to memoryStore.employees so they appear in employee roster!
    if (assignedRole === 'ROLE_EMPLOYEE') {
      if (!memoryStore.employees) memoryStore.employees = [];
      const newEmpId = `TF-IND-${100 + (memoryStore.employees.length + 1)}`;
      const newEmployee = {
        _id: 'emp_' + Date.now(),
        employeeId: newEmpId,
        name: newUser.name,
        email: newUser.email,
        department: newUser.department,
        role: positionTitle,
        salary: 650000, // ₹6.5 LPA standard starting default
        pan: 'ABCDE' + Math.floor(1000 + Math.random() * 9000) + 'F',
        uan: '100' + Math.floor(100000000 + Math.random() * 900000000),
        bankAccount: '50100' + Math.floor(100000000 + Math.random() * 900000000),
        ifsc: 'HDFC0001234',
        skills: ['JavaScript', 'React.js', 'Node.js'],
        status: 'Active', // Added to roster
        performanceScore: 4.3,
        joinedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      memoryStore.employees.unshift(newEmployee);
    }

    // Add alert notification for Admin
    if (!memoryStore.notifications) memoryStore.notifications = [];
    memoryStore.notifications.unshift({
      id: 'notif-' + Date.now(),
      message: `Pending Approval: ${newUser.name} registered as ${assignedRole === 'ROLE_MANAGER' ? 'Manager' : 'Employee'}. Admin action required.`,
      type: 'APPROVAL',
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      roles: newUser.roles,
      designation: newUser.designation,
      department: newUser.department,
      status: 'Pending',
      requiresApproval: true,
      message: 'Account created successfully! Registration is pending Admin approval.',
    });
  } catch (err) {
    next(err);
  }
};

// Admin Approvals Endpoints
const getApprovals = async (req, res, next) => {
  try {
    const users = getUsersList();
    // Exclude master admin from approvals list
    const candidateUsers = users.filter((u) => u.username !== 'admin' && u.role !== 'ROLE_ADMIN');
    res.status(200).json(candidateUsers);
  } catch (err) {
    next(err);
  }
};

const updateApprovalStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Approved' or 'Rejected'
    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Approved, Rejected, or Pending.' });
    }

    const users = getUsersList();
    const user = users.find((u) => u.id === id || u.username === id);
    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    user.status = status;
    user.updatedAt = new Date().toISOString();

    // If Employee is approved, ensure active status in employee roster
    if (user.role === 'ROLE_EMPLOYEE') {
      if (!memoryStore.employees) memoryStore.employees = [];
      const emp = memoryStore.employees.find(
        (e) => e.email.toLowerCase() === user.email.toLowerCase() || e.name.toLowerCase() === user.name.toLowerCase()
      );
      if (emp) {
        emp.status = status === 'Approved' ? 'Active' : 'Inactive';
      } else if (status === 'Approved') {
        const newEmpId = `TF-IND-${100 + (memoryStore.employees.length + 1)}`;
        memoryStore.employees.unshift({
          _id: 'emp_' + Date.now(),
          employeeId: newEmpId,
          name: user.name,
          email: user.email,
          department: user.department,
          role: user.designation || 'Software Engineer',
          salary: 650000,
          pan: 'ABCDE' + Math.floor(1000 + Math.random() * 9000) + 'F',
          uan: '100' + Math.floor(100000000 + Math.random() * 900000000),
          bankAccount: '50100' + Math.floor(100000000 + Math.random() * 900000000),
          ifsc: 'HDFC0001234',
          skills: ['JavaScript', 'React.js'],
          status: 'Active',
          performanceScore: 4.3,
          joinedDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Add notification
    if (!memoryStore.notifications) memoryStore.notifications = [];
    memoryStore.notifications.unshift({
      id: 'notif-' + Date.now(),
      message: `Account for ${user.name} (${user.role === 'ROLE_MANAGER' ? 'Manager' : 'Employee'}) has been ${status} by Admin.`,
      type: 'SYSTEM',
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: `User account ${status.toLowerCase()} successfully.`,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// In-memory store for reset tokens/OTPs: { [identifier]: { otp, expiresAt, email } }
const resetTokens = {};

const nodemailer = require('nodemailer');

// Optional transporter for sending real email if SMTP or Gmail is configured in .env
const getEmailTransporter = () => {
  const user = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
  const pass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || '').replace(/\s+/g, '');

  if (user && pass) {
    try {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false, // port 587 uses STARTTLS
        family: 4, // Force IPv4 to avoid IPv6 unreachable errors
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
      });
    } catch (e) {
      console.error('Error creating email transporter:', e.message);
    }
  }
  return null;
};

// @desc    Request password reset OTP strictly by registered Email
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const rawEmail = (req.body.email || req.body.identifier || '').trim().toLowerCase();
    if (!rawEmail) {
      return res.status(400).json({ success: false, message: 'Please enter your registered work email address.' });
    }

    const users = getUsersList();
    // Match strictly by email first, alternate emails, or username fallback
    const user = users.find(
      (u) =>
        (u.email && u.email.toLowerCase() === rawEmail) ||
        (u.alternateEmails && u.alternateEmails.some((em) => em.toLowerCase() === rawEmail)) ||
        u.username.toLowerCase() === rawEmail
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No account registered with email '${rawEmail}'. Please check your spelling or register a new account.`,
      });
    }

    const destinationEmail = rawEmail.includes('@') ? rawEmail : user.email;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins validity

    const tokenPayload = { otp, expiresAt, email: destinationEmail, username: user.username, name: user.name };
    resetTokens[destinationEmail.toLowerCase()] = tokenPayload;
    if (user.email) resetTokens[user.email.toLowerCase()] = tokenPayload;
    if (user.username) resetTokens[user.username.toLowerCase()] = tokenPayload;
    resetTokens[rawEmail] = tokenPayload;

    const emailSubject = `🔐 TeamFlow ERP - Your Password Reset Verification Code: ${otp}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #2563eb; margin: 0;">TeamFlow ERP</h2>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Enterprise Identity & Security</p>
        </div>
        <p style="color: #334155; font-size: 15px;">Hello <strong>${user.name}</strong>,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.5;">
          A password reset was requested for your registered account: <strong>${user.email}</strong>.
          Please enter the following 6-digit verification code to complete your password reset:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <span style="display: inline-block; font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #1e3a8a; background-color: #eff6ff; border: 2px dashed #93c5fd; padding: 12px 28px; border-radius: 10px;">
            ${otp}
          </span>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
          * This verification code will expire in <strong>15 minutes</strong>. If you did not make this request, your account is secure and you can disregard this email.
        </p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
          TeamFlow Technologies India Pvt. Ltd. | DLF Cyber City, Gurugram
        </p>
      </div>
    `;

    let emailDelivered = false;
    const transporter = getEmailTransporter();
    if (transporter) {
      try {
        const senderEmail = (process.env.EMAIL_USER || process.env.SMTP_USER || 'no-reply@teamflow.in').trim();
        await transporter.sendMail({
          from: {
            name: 'TeamFlow ERP',
            address: senderEmail,
          },
          replyTo: senderEmail,
          to: destinationEmail,
          subject: emailSubject,
          html: emailHtml,
        });
        emailDelivered = true;
        console.log(`[EMAIL DISPATCH] Real email delivered successfully to ${destinationEmail}!`);
      } catch (mailErr) {
        console.error('SMTP Mail error:', mailErr.code || mailErr.message, mailErr);
      }
    } else {
      console.log(`[EMAIL DISPATCH] To: ${destinationEmail} | Code: ${otp}`);
    }

    return res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been dispatched to your email (${destinationEmail}).`,
      email: destinationEmail,
      name: user.name,
      username: user.username,
      otp, // provided so user can always see/auto-fill it during dev/testing
      emailDelivered,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify OTP for email
// @route   POST /api/auth/verify-otp
const verifyOtp = async (req, res, next) => {
  try {
    const rawEmail = (req.body.email || '').trim().toLowerCase();
    const { otp } = req.body;

    if (!rawEmail || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    const stored = resetTokens[rawEmail];
    if (!stored || stored.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    if (Date.now() > stored.expiresAt) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    stored.verified = true;

    return res.status(200).json({
      message: 'OTP verified successfully. You can now reset your password.',
      otpVerified: true,
      email: rawEmail
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password after OTP verification
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const rawEmail = (req.body.email || req.body.identifier || '').trim().toLowerCase();
    const { newPassword, confirmPassword } = req.body;

    if (!rawEmail || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required.' });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const stored = resetTokens[rawEmail];
    if (!stored || !stored.verified) {
      return res.status(400).json({ message: 'Please verify your OTP first.' });
    }

    // Update password in users list
    const users = getUsersList();
    const user = users.find(
      (u) => (u.email && u.email.toLowerCase() === rawEmail) || u.username.toLowerCase() === rawEmail
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.password = newPassword;
    delete resetTokens[rawEmail];
    if (user.email) delete resetTokens[user.email.toLowerCase()];
    if (user.username) delete resetTokens[user.username.toLowerCase()];

    // Notification
    if (!memoryStore.notifications) memoryStore.notifications = [];
    memoryStore.notifications.unshift({
      id: 'notif-' + Date.now(),
      message: `Password was successfully updated for user ${user.name} (${user.email}).`,
      type: 'SECURITY',
      read: false,
      createdAt: new Date().toISOString(),
    });

    return res.status(200).json({
      message: 'Password reset successfully! You can now log in.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { 
  login, 
  register, 
  getApprovals, 
  updateApprovalStatus,
  forgotPassword,
  verifyOtp,
  resetPassword 
};
