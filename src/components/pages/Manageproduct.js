import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Table, Input, Modal, message } from "antd";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    image: "",
    category: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:2000/api/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      message.error("Failed to fetch products");
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:2000/api/products", formData);
      message.success("Product added successfully");
      fetchProducts();
      setModalVisible(false);
      setFormData({ name: "", description: "", price: "", quantity: "", image: "", category: "" });
    } catch (error) {
      console.error("Error adding product:", error);
      message.error("Failed to add product");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:2000/api/products/${id}`);
      message.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      message.error("Failed to delete product");
    }
  };

  const handleRestore = async (id) => {
    try {
      await axios.post(`http://localhost:2000/api/products/restore/${id}`);
      message.success("Product restored successfully");
      fetchProducts();
    } catch (error) {
      console.error("Error restoring product:", error);
      message.error("Failed to restore product");
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Price", dataIndex: "price", key: "price" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button danger onClick={() => handleDelete(record.id)}>Delete</Button>
          <Button onClick={() => handleRestore(record.id)} style={{ marginLeft: "10px" }}>Restore</Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <h1>Product Management</h1>
      <Button type="primary" onClick={() => setModalVisible(true)}>Add Product</Button>
      <Table dataSource={products} columns={columns} loading={loading} rowKey="id" />

      <Modal
        title="Add Product"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Input placeholder="Name" name="name" value={formData.name} onChange={handleInputChange} />
        <Input placeholder="Description" name="description" value={formData.description} onChange={handleInputChange} style={{ marginTop: 10 }} />
        <Input placeholder="Price" name="price" value={formData.price} onChange={handleInputChange} style={{ marginTop: 10 }} />
        <Input placeholder="Quantity" name="quantity" value={formData.quantity} onChange={handleInputChange} style={{ marginTop: 10 }} />
        <Input placeholder="Image URL" name="image" value={formData.image} onChange={handleInputChange} style={{ marginTop: 10 }} />
        <Input placeholder="Category" name="category" value={formData.category} onChange={handleInputChange} style={{ marginTop: 10 }} />
      </Modal>
    </div>
  );
};

export default ProductPage;
