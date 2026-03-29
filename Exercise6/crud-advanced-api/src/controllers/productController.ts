// pagination-api/src/controllers/productController.ts

import { Request, Response, NextFunction } from 'express';
import {
  getAllProducts,
  findProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../models/product';
import { CreateProductDTO, UpdateProductDTO, QueryParams } from '../types';
import { buildQuery } from '../utils/queryBuilder';
import { AppError } from '../middlewares/errorHandler';

// FIX: Define strict types for route parameters to prevent 'string | string[]' error
interface ProductRouteParams {
  id: string;
}

/**
 * GET /products - Get all products with pagination, filtering, sorting
 */
export const getProducts = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const allProducts = getAllProducts();
    const queryParams = req.query as QueryParams;

    const result = buildQuery(allProducts, queryParams);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /products/:id - Get single product by ID
 */
// NOTICE THE 'export' KEYWORD HERE:
export const getProductById = (req: Request<ProductRouteParams>, res: Response, next: NextFunction): void => {
  try {
    const { id } = req.params;
    const product = findProductById(id);

    if (!product) {
      const err: AppError = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /products - Create new product
 */
export const createProductHandler = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const data: CreateProductDTO = req.body;

    if (!data.name || !data.price || !data.category) {
      const err: AppError = new Error('Missing required fields: name, price, category');
      err.statusCode = 400;
      err.details = { required: ['name', 'price', 'category'], received: data };
      throw err;
    }

    if (data.price <= 0) {
      const err: AppError = new Error('Price must be a positive number');
      err.statusCode = 400;
      throw err;
    }

    const newProduct = createProduct(data);

    res.status(201).json({
      success: true,
      data: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /products/:id - Update product
 */
// NOTICE THE 'export' KEYWORD HERE:
export const updateProductHandler = (req: Request<ProductRouteParams>, res: Response, next: NextFunction): void => {
  try {
    const { id } = req.params;
    const data: UpdateProductDTO = req.body;

    if (data.price !== undefined && data.price <= 0) {
      const err: AppError = new Error('Price must be a positive number');
      err.statusCode = 400;
      throw err;
    }

    const updatedProduct = updateProduct(id, data);

    if (!updatedProduct) {
      const err: AppError = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }

    res.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /products/:id - Delete product
 */
// NOTICE THE 'export' KEYWORD HERE:
export const deleteProductHandler = (req: Request<ProductRouteParams>, res: Response, next: NextFunction): void => {
  try {
    const { id } = req.params;
    const deleted = deleteProduct(id);

    if (!deleted) {
      const err: AppError = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};