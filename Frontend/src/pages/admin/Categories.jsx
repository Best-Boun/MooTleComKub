import { useEffect, useState } from "react";
import { Button, Card, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

import categoryService from "../../services/categoryService";

import CategoryTable from "../../components/categories/CategoryTable";
import CategoryFilter from "../../components/categories/CategoryFilter";
import CategoryModal from "../../components/categories/CategoryModal";
import CustomPagination from "../../components/common/Pagination";
import { usePermissions } from "../../context/PermissionContext";

export default function Categories() {
  const { canManage } = usePermissions();
  const allowManage = canManage("categories");

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 10;

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const res = await categoryService.getAllCategories();

      setCategories(res.data);
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load categories",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = () => {
    if (!allowManage) return;

    setMode("add");
    setSelectedCategory(null);
    setShowModal(true);
  };

  const handleEdit = (category) => {
    if (!allowManage) return;

    setMode("edit");
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleSuccess = () => {
    setShowModal(false);
    fetchCategories();
  };

  const handleDelete = async (id) => {
    if (!allowManage) return;

    const result = await Swal.fire({
      title: "Delete Category?",
      text: "คุณต้องการลบหมวดหมู่นี้หรือไม่",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc3545",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await categoryService.deleteCategory(id);

      if (res.success) {
        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: res.message,
          timer: 1200,
          showConfirmButton: false,
        });

        fetchCategories();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: error.response?.data?.message || "Something went wrong",
      });
    }
  };

  const filteredCategories = categories.filter((category) => {
    const matchSearch = category.category_name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchStatus = status === "" || category.status === status;

    return matchSearch && matchStatus;
  });

  const indexOfLast = currentPage * categoriesPerPage;
  const indexOfFirst = indexOfLast - categoriesPerPage;

  const currentCategories = filteredCategories.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

  return (
    <>
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold mb-0">Categories</h3>

            {allowManage && (
              <Button variant="primary" onClick={handleAdd}>
                + Add Category
              </Button>
            )}
          </div>

          <CategoryFilter
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
          />

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : (
            <>
              <CategoryTable
                categories={currentCategories}
                onDelete={handleDelete}
                onEdit={handleEdit}
                allowManage={allowManage}
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

      <CategoryModal
        show={showModal}
        onHide={() => setShowModal(false)}
        mode={mode}
        category={selectedCategory}
        onSuccess={handleSuccess}
      />
    </>
  );
}