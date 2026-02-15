import { body } from 'express-validator';

export const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nama wajib diisi')
    .isLength({ min: 3 }).withMessage('Nama minimal 3 karakter')
    .isLength({ max: 100 }).withMessage('Nama maksimal 100 karakter'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email wajib diisi')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),

  body('username')
    .trim()
    .notEmpty().withMessage('Username wajib diisi')
    .isLength({ min: 3 }).withMessage('Username minimal 3 karakter')
    .isLength({ max: 100 }).withMessage('Username maksimal 100 karakter')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username hanya boleh huruf, angka, underscore'),

  body('no_hp')
    .trim()
    .notEmpty().withMessage('Nomor telepon wajib diisi')
    .matches(/^(08|62)[0-9]{8,13}$/)
    .withMessage('Format nomor telepon tidak valid'),

  body('password')
    .notEmpty().withMessage('Password wajib diisi')
    .isLength({ min: 8 }).withMessage('Password minimal 8 karakter')
    .isLength({ max: 100 }).withMessage('Password maksimal 100 karakter'),

  body('confirmPassword')
    .notEmpty().withMessage('Konfirmasi password wajib diisi')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password tidak cocok');
      }
      return true;
    })
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email wajib diisi')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password wajib diisi')
];

export const staffLoginValidator = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username wajib diisi')
    .isLength({ min: 3 }).withMessage('Username minimal 3 karakter'),
  
  body('password')
    .notEmpty().withMessage('Password wajib diisi')
];
