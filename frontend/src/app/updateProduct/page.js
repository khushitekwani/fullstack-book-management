"use client";
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { productDetails, addProduct, updateProduct } from '../api/apiHandler'; // Adjust path if needed

function ProductFormPage() {
  const [product, setProduct] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    status: 'active',
    category_id: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const productId = localStorage.getItem('editProductId');
    if (productId) {
      setIsEditMode(true);
      fetchProductDetails(productId);
    } else {
      setLoading(false); 
    }
  }, []);

  const fetchProductDetails = async (productId) => {
    try {
      setLoading(true);
      const result = await productDetails(productId);
      if (result.code === "1" && result.data) {
        const data = result.data;
        setProduct({
          id: productId,
          name: data.name || '',
          description: data.description || '',
          price: data.price || '',
          status: data.status || 'active',
          category_id: data.category_id || ''
        });
      } else {
        throw new Error(result.message || 'Product not found');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.message, 'error');
      router.push('/dashboard-admin'); 
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: product.name,
      description: product.description,
      price: product.price,
      status: product.status,
      category_id: product.category_id
    };

    try {
      let result;
      if (isEditMode) {
        payload.product_id = product.id;
        result = await updateProduct(payload);
        localStorage.removeItem('editProductId');
      } else {
        result = await addProduct(payload);
      }

      if (result.code === "1") {
        Swal.fire({
          title: isEditMode ? 'Updated!' : 'Added!',
          text: result.message || 'Success',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          localStorage.removeItem('editProductId');
          router.push('/dashboard-admin');
        });
      } else {
        throw new Error(result.message || 'Failed');
      }
    } catch (err) {
      console.error("Submit error:", err);
      Swal.fire('Error', err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4">Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Product' : 'Add Product'}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium">Product Name</label>
          <input
            name="name"
            type="text"
            value={product.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            rows={4}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Price</label>
          <input
            name="price"
            type="number"
            value={product.price}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">category_id</label>
          <input
            name="category_id"
            type="text"
            value={product.category_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            name="status"
            value={product.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => router.push('/dashboard-admin')}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {isEditMode ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductFormPage;
