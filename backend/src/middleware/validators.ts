// validators.ts — Input validation rules for routes
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Validates the result of express-validator checks
export const validate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

// Login validation rules
export const loginRules = [
  body('password')
    .notEmpty()
    .withMessage('Contraseña es requerida')
    .isLength({ max: 100 })
    .withMessage('Contraseña es muy larga'),
];

// Photo upload validation rules
export const photoRules = [
  body('category')
    .notEmpty()
    .withMessage('Categoria es requerida')
    .isIn(['weddings', 'outdoors', 'graduations', 'studio', 'events'])
    .withMessage('Categoria invalida'),
  body('order')
    .optional()
    .isNumeric()
    .withMessage('El orden debe ser un numero'),
  body('photoTitle')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Titulo muy largo')
    .trim(),
];

// About section vaidation rules
export const aboutRules = [
  body('title')
    .notEmpty()
    .withMessage('Titulo es requerido')
    .isLength({ max: 100 })
    .withMessage('Titulo muy largo')
    .trim(),
  body('bio')
    .notEmpty()
    .withMessage('Biografia es requerida')
    .isLength({ max: 2000 })
    .withMessage('Biografia muy larga')
    .trim(),
];
