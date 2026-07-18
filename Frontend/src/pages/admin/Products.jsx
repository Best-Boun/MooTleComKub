import { useEffect, useState } from "react";
import { Button, Card, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

import productService from "../../services/productService";
import ProductTable from "../../components/products/ProductTable";
import ProductFilter from "../../components/products/ProductFilter";
import CustomPagination from "../../components/common/Pagination";
import ProductModal from "../../components/products/ProductModal";
import categoryService from "../../services/categoryService";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [brand, setBrand] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [mode, setMode] = useState("add");
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  // โหลดข้อมูลสินค้า
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await productService.getAllProducts();

      setProducts(res.data);
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load products",
      });
    } finally {
      setLoading(false);
    }
  };

const fetchCategories = async () => {
  try {
    const res = await categoryService.getAllCategories();
    setCategories(res.data);
  } catch (error) {
    console.error(error);
  }
};


 useEffect(() => {
   fetchProducts();
   fetchCategories();
 }, []);

  // ลบสินค้า
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Product?",
      text: "คุณต้องการลบสินค้านี้หรือไม่",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await productService.deleteProduct(id);

      if (res.success) {
        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: res.message,
          timer: 1200,
          showConfirmButton: false,
        });

        fetchProducts();
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: err.response?.data?.message || "Something went wrong",
      });
    }
  };

  const handleToggleStatus = async (product) => {
    const action = product.status === "ACTIVE" ? "Disable" : "Enable";

    const result = await Swal.fire({
      title: `${action} Product?`,
      text: `Do you want to ${action.toLowerCase()} "${product.product_name}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: action,
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await productService.toggleStatus(product.product_id);

      if (res.success) {
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: res.message,
          timer: 1200,
          showConfirmButton: false,
        });

        fetchProducts();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.response?.data?.message || "Something went wrong",
      });
    }
  };

  // เพิ่มสินค้า
  const handleAdd = () => {
    setMode("add");
    setSelectedProduct(null);
    setShowModal(true);
  };

  // แก้ไขสินค้า
  const handleEdit = (product) => {
    setMode("edit");
    setSelectedProduct(product);
    setShowModal(true);
  };

  // บันทึกสำเร็จ
  const handleSuccess = () => {
    setShowModal(false);
    fetchProducts();
  };

  // Filter
  const filteredProducts = products.filter((product) => {
    const matchSearch =
      product.product_name.toLowerCase().includes(search.toLowerCase()) ||
      product.brand_name.toLowerCase().includes(search.toLowerCase());

    const matchCategory = category === "" || product.category_name === category;

    const matchBrand = brand === "" || product.brand_name === brand;

    const matchStatus = status === "" || product.status === status;

    return matchSearch && matchCategory && matchBrand && matchStatus;
  });

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;

  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct,
  );

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <>
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold mb-0">Products</h3>

            <Button variant="primary" onClick={handleAdd}>
              + Add Product
            </Button>
          </div>

          <ProductFilter
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            brand={brand}
            setBrand={setBrand}
            status={status}
            setStatus={setStatus}
            categories={categories}
          />

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : (
            <>
              <ProductTable
                products={currentProducts}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
              />

              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
              />
            </>
          )}
        </Card.Body>
      </Card>

      <ProductModal
        show={showModal}
        onHide={() => setShowModal(false)}
        mode={mode}
        product={selectedProduct}
        categories={categories}
        onSuccess={handleSuccess}
      />
    </>
  );
}
