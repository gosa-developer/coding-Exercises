// src/routes/product.routes.ts

import { Router } from 'express';
import { productController } from '../controllers/product.controller';

const router = Router();

// GET /api/products - Get all products with pagination, filtering, sorting
router.get('/', productController.getAllProducts.bind(productController));

// GET /api/products/filters/options - Get available filter options
router.get('/filters/options', productController.getFilterOptions.bind(productController));

// GET /api/products/:id - Get product by ID
router.get('/:id', productController.getProductById.bind(productController));

// POST /api/products - Create new product
router.post('/', productController.createProduct.bind(productController));

// PUT /api/products/:id - Update product
router.put('/:id', productController.updateProduct.bind(productController));

// DELETE /api/products/:id - Delete product
router.delete('/:id', productController.deleteProduct.bind(productController));

export default router;