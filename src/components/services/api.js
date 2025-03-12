// import axios from "axios";

// const API_URL = "http://localhost:2000/products"; // Update based on your backend URL

// export const getProducts = async () => {
//     const response = await axios.get(API_URL);
//     return response.data;
// };

// export const createProduct = async (productData) => {
//     const response = await axios.post(API_URL, productData);
//     return response.data;
// };

// export const updateProductQuantity = async (id, quantity, token) => {
//     const response = await axios.put(`${API_URL}/update-quantity/${id}`, 
//         { quantity },
//         { headers: { Authorization: `Bearer ${token}` } }
//     );
//     return response.data;
// };

// export const deleteProduct = async (id, token) => {
//     const response = await axios.delete(`${API_URL}/${id}`, 
//         { headers: { Authorization: `Bearer ${token}` } }
//     );
//     return response.data;
// };

// export const restoreProduct = async (id) => {
//     const response = await axios.put(`${API_URL}/restore/${id}`);
//     return response.data;
// };
