import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

import customerService from "../../services/customerService";

import CustomerTable from "../../components/customers/CustomerTable";
import CustomerFilter from "../../components/customers/CustomerFilter";
import CustomerModal from "../../components/customers/CustomerModal";

import CustomPagination from "../../components/common/Pagination";

export default function Customers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const customersPerPage = 10;

  // โหลด Customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const res = await customerService.getAllCustomers();

      setCustomers(res.data);
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load customers",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // เปิด Edit
  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  // หลัง Update
  const handleSuccess = () => {
    setShowModal(false);
    fetchCustomers();
  };

  // Delete
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Customer?",
      text: "คุณต้องการลบลูกค้าคนนี้หรือไม่",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonText: "Cancel",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await customerService.deleteCustomer(id);

      if (res.success) {
        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: res.message,
          timer: 1200,
          showConfirmButton: false,
        });

        fetchCustomers();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: error.response?.data?.message || "Something went wrong",
      });
    }
  };

  // Filter
  const filteredCustomers = customers.filter((customer) => {
    const fullName = `${customer.first_name} ${customer.last_name}`;

    const matchSearch =
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase()) ||
      (customer.phone || "").includes(search);

    const matchStatus = status === "" || customer.status === status;

    return matchSearch && matchStatus;
  });

  // Pagination
  const indexOfLast = currentPage * customersPerPage;
  const indexOfFirst = indexOfLast - customersPerPage;

  const currentCustomers = filteredCustomers.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  return (
    <>
      <Card className="shadow-sm border-0">
        <Card.Body>
          <h3 className="fw-bold mb-4">Customers</h3>

          <CustomerFilter
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
              <CustomerTable
                customers={currentCustomers}
                onView={(customer) =>
                  navigate(`/admin/customers/${customer.user_id}`)
                }
                onEdit={handleEdit}
                onDelete={handleDelete}
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

      <CustomerModal
        show={showModal}
        onHide={() => setShowModal(false)}
        customer={selectedCustomer}
        onSuccess={handleSuccess}
      />
    </>
  );
}
