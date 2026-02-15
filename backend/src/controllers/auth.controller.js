import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { validationResult } from 'express-validator';

// ============================================
// Register Manual
// ============================================
export const registerManual = async (req, res) => {
  try {
    console.log('📝 Register attempt:', {
      body: req.body,
      headers: req.headers
    });

    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    // Validasi input dari validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const { name, email, username, no_hp, password } = req.body;

    console.log('✅ Validation passed, data:', { name, email, username, no_hp });

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed, length:', hashedPassword.length);

    // Call stored procedure
    console.log('📞 Calling stored procedure sp_register_customer...');
    await db.query(
      `CALL sp_register_customer(?, ?, ?, ?, ?, @user_id, @status, @message)`,
      [name, email, username, no_hp, hashedPassword]
    );
    console.log('✅ Stored procedure called');

    // Get output parameters
    console.log('📊 Getting output parameters...');
    const [output] = await db.query(
      'SELECT @user_id AS user_id, @status AS status, @message AS message'
    );
    console.log('✅ Output parameters:', output[0]);

    const { user_id, status, message } = output[0];

    if (status === 'error') {
      console.log('❌ SP returned error:', message);
      return res.status(400).json({
        status: 'error',
        message
      });
    }

    // Get user data
    console.log('👤 Fetching user data for user_id:', user_id);
    const [userData] = await db.query(
      `SELECT user_id, name, email, username, no_hp, role, auth_provider, status 
       FROM users WHERE user_id = ?`,
      [user_id]
    );
    console.log('✅ User data fetched:', userData[0]);

    // Generate JWT token
    console.log('🎫 Generating JWT token...');
    const token = jwt.sign(
      {
        user_id: userData[0].user_id,
        email: userData[0].email,
        role: userData[0].role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log('✅ Token generated');

    console.log('🎉 Registration successful!');

    res.status(201).json({
      status: 'success',
      message: 'Registrasi berhasil',
      data: {
        user: userData[0],
        token
      }
    });

  } catch (err) {
    console.error('❌ Register error:', err);
    console.error('Error details:', {
      message: err.message,
      sqlMessage: err.sqlMessage,
      code: err.code,
      errno: err.errno,
      sql: err.sql,
      stack: err.stack
    });
    
    res.status(400).json({ 
      status: 'error',
      error: err.sqlMessage || err.message,
      details: process.env.NODE_ENV === 'development' ? {
        code: err.code,
        errno: err.errno
      } : undefined
    });
  }
};

// ============================================
// Login Manual
// ============================================
export const loginManual = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email dan password wajib diisi'
      });
    }

    // Call stored procedure
    await db.query(
      `CALL sp_login_customer(?, @user_id, @name, @username, @no_hp, @role, @password_hash, @account_status, @auth_provider, @status, @message)`,
      [email]
    );

    // Get output parameters
    const [output] = await db.query(
      `SELECT 
        @user_id AS user_id, 
        @name AS name,
        @username AS username,
        @no_hp AS no_hp,
        @role AS role,
        @password_hash AS password_hash,
        @account_status AS account_status,
        @auth_provider AS auth_provider,
        @status AS status, 
        @message AS message`
    );

    const result = output[0];

    if (result.status === 'error') {
      return res.status(401).json({
        status: 'error',
        message: result.message
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, result.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Email atau password salah'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        user_id: result.user_id,
        email: email,
        role: result.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Prepare user data (without password)
    const userData = {
      user_id: result.user_id,
      name: result.name,
      email: email,
      username: result.username,
      no_hp: result.no_hp,
      role: result.role,
      auth_provider: result.auth_provider,
      status: result.account_status
    };

    res.json({
      status: 'success',
      message: 'Login berhasil',
      data: {
        user: userData,
        token
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(400).json({ 
      error: err.sqlMessage || err.message 
    });
  }
};

// ============================================
// Check Email
// ============================================
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email parameter required'
      });
    }

    const [result] = await db.query(
      'SELECT fn_check_email_exists(?) AS result',
      [email]
    );

    const emailCheck = JSON.parse(result[0].result);

    res.json({
      status: 'success',
      data: {
        exists: emailCheck.exists === 1,
        auth_provider: emailCheck.auth_provider,
        available: emailCheck.exists === 0
      }
    });

  } catch (err) {
    console.error('Check email error:', err);
    res.status(400).json({ 
      error: err.sqlMessage || err.message 
    });
  }
};

// ============================================
// Google Auth Success (After Passport)
// ============================================
export const googleAuthSuccess = async (req, res) => {
  try {
    // req.user already populated by Passport strategy
    const { email, displayName, id: googleId } = req.user;

    // Call stored procedure for Google auth
    await db.query(
      `CALL sp_google_auth(?, ?, ?, @user_id, @username, @no_hp, @role, @account_status, @is_new_user, @status, @message)`,
      [email, displayName, googleId]
    );

    // Get output parameters
    const [output] = await db.query(
      `SELECT 
        @user_id AS user_id,
        @username AS username,
        @no_hp AS no_hp,
        @role AS role,
        @account_status AS account_status,
        @is_new_user AS is_new_user,
        @status AS status,
        @message AS message`
    );

    const result = output[0];

    if (result.status === 'error') {
      return res.redirect(
        `${process.env.CLIENT_URL}/auth/google/failure?error=${encodeURIComponent(result.message)}`
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        user_id: result.user_id,
        email: email,
        role: result.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token
    res.redirect(
      `${process.env.CLIENT_URL}/auth/google/success?token=${token}&isNew=${result.is_new_user}`
    );

  } catch (err) {
    console.error('Google auth success error:', err);
    res.redirect(`${process.env.CLIENT_URL}/auth/google/failure`);
  }
};

// ============================================
// Google Auth Failure
// ============================================
export const googleAuthFailure = (req, res) => {
  res.redirect(`${process.env.CLIENT_URL}/auth/google/failure`);
};

// ============================================
// Get Current User
// ============================================
export const getCurrentUser = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT user_id, name, email, username, no_hp, role, auth_provider, status, created_at 
       FROM users WHERE user_id = ?`,
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User tidak ditemukan'
      });
    }

    res.json({
      status: 'success',
      data: users[0]
    });

  } catch (err) {
    console.error('Get current user error:', err);
    res.status(400).json({ 
      error: err.sqlMessage || err.message 
    });
  }
};

// ============================================
// Login Staff/Employee (using USERNAME)
// ============================================
export const loginStaff = async (req, res) => {
  try {
    console.log('👔 Staff login attempt:', {
      username: req.body.username,
      timestamp: new Date()
    });

    const { username, password } = req.body;

    // Validasi input
    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Username dan password wajib diisi'
      });
    }

    console.log('📞 Calling sp_login_staff for username:', username);

    // Call stored procedure
    await db.query(
      `CALL sp_login_staff(?, @user_id, @name, @email, @no_hp, @role, @password_hash, @account_status, @auth_provider, @status, @message)`,
      [username]
    );

    // Get output parameters
    const [output] = await db.query(
      `SELECT 
        @user_id AS user_id, 
        @name AS name,
        @email AS email,
        @no_hp AS no_hp,
        @role AS role,
        @password_hash AS password_hash,
        @account_status AS account_status,
        @auth_provider AS auth_provider,
        @status AS status, 
        @message AS message`
    );

    const result = output[0];
    console.log('📊 SP result:', {
      status: result.status,
      role: result.role,
      message: result.message
    });

    // Check if SP returned error
    if (result.status === 'error') {
      console.log('❌ Login failed:', result.message);
      return res.status(401).json({
        status: 'error',
        message: result.message
      });
    }

    // Verify password
    console.log('🔐 Verifying password...');
    const isPasswordValid = await bcrypt.compare(password, result.password_hash);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(401).json({
        status: 'error',
        message: 'Username atau password salah. Silakan periksa kembali kredensial Anda.'
      });
    }

    console.log('✅ Password valid');

    // Generate JWT token
    console.log('🎫 Generating JWT token...');
    const token = jwt.sign(
      {
        user_id: result.user_id,
        username: username,
        email: result.email,
        role: result.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Prepare user data (without password)
    const userData = {
      user_id: result.user_id,
      name: result.name,
      email: result.email,
      username: username,
      no_hp: result.no_hp,
      role: result.role,
      auth_provider: result.auth_provider,
      status: result.account_status
    };

    console.log('🎉 Staff login successful:', {
      user_id: userData.user_id,
      role: userData.role
    });

    res.json({
      status: 'success',
      message: result.message,
      data: {
        user: userData,
        token
      }
    });

  } catch (err) {
    console.error('❌ Staff login error:', err);
    console.error('Error details:', {
      message: err.message,
      sqlMessage: err.sqlMessage,
      code: err.code
    });

    res.status(400).json({ 
      status: 'error',
      error: err.sqlMessage || err.message 
    });
  }
};

// ============================================
// Get User Info (untuk navbar)
// ============================================
export const getUserInfo = async (req, res) => {
  try {
    const userId = req.user.user_id;

    console.log('👤 Getting user info for user_id:', userId);

    // Call stored procedure
    await db.query(
      `CALL sp_get_user_info(?, @name, @email, @username, @role, @status, @message)`,
      [userId]
    );

    // Get output parameters
    const [output] = await db.query(
      `SELECT 
        @name AS name,
        @email AS email,
        @username AS username,
        @role AS role,
        @status AS status,
        @message AS message`
    );

    const result = output[0];

    if (result.status === 'error') {
      return res.status(404).json({
        status: 'error',
        message: result.message
      });
    }

    res.json({
      status: 'success',
      data: {
        name: result.name,
        email: result.email,
        username: result.username,
        role: result.role,
        status: result.status
      }
    });

  } catch (err) {
    console.error('Get user info error:', err);
    res.status(500).json({
      status: 'error',
      message: err.sqlMessage || err.message
    });
  }
};

// ============================================
// Logout
// ============================================
export const logout = async (req, res) => {
  try {
    console.log('🚪 User logout:', {
      user_id: req.user.user_id,
      timestamp: new Date()
    });

    // Optional: Log logout activity ke database jika ada tabel audit
    // await db.query(
    //   'INSERT INTO user_activity_logs (user_id, activity_type, created_at) VALUES (?, ?, NOW())',
    //   [req.user.user_id, 'logout']
    // );

    res.json({
      status: 'success',
      message: 'Logout berhasil'
    });

  } catch (err) {
    console.error('❌ Logout error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Gagal logout'
    });
  }
};