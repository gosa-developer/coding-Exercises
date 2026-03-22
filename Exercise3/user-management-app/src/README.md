# User Management API - Layered Architecture

A well-structured Express.js application demonstrating proper layered architecture principles with TypeScript.

## 📋 Table of Contents
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Layers Explained](#layers-explained)
- [API Documentation](#api-documentation)
- [Getting Started](#getting-started)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## 🏗️ Architecture Overview

This application follows the **Layered Architecture Pattern**, separating concerns into distinct layers:

## 🎯 Layers Explained

### 1. **Route Layer** (`routes/`)
- Defines API endpoints
- Maps HTTP methods to controller methods
- No business logic, only routing

```typescript
// routes/user.routes.ts
router.get('/:id', userController.getById);
router.post('/', userController.create);