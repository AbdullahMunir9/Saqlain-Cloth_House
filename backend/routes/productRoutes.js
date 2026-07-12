import express from 'express';
const router = express.Router();
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js';

router.route('/')
    .get(getProducts)
    .post(createProduct);

router.route('/:id')
    .put(updateProduct)
    .delete(deleteProduct);

export default router;
