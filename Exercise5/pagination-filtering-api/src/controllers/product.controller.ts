// src/controllers/product.controller.ts

import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';
import { QueryParser } from '../utils/query-parser';
import { CreateProductDTO, UpdateProductDTO } from '../types/product.types';

export class ProductController {
  /**
   * Get all products with pagination, filtering, and sorting
   */
  async getAllProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const queryOptions = QueryParser.parseQueryOptions(req.query);
      const result = await productService.getAllProducts(queryOptions);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);
      
      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new product
   */
  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createProductDTO: CreateProductDTO = req.body;
      const product = await productService.createProduct(createProductDTO);
      
      res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update product
   */
  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateProductDTO: UpdateProductDTO = req.body;
      const product = await productService.updateProduct(id, updateProductDTO);
      
      res.json({
        success: true,
        data: product,
        message: 'Product updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await productService.deleteProduct(id);
      
      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get filter options (available categories and brands)
   */
  async getFilterOptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const options = await productService.getFilterOptions();
      
      res.json({
        success: true,
        data: options
      });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();