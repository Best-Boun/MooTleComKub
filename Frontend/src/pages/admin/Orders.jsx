import { useEffect, useState } from "react";
import { Button, Card, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

import orderService from "../../services/orderService";

import OrderTable from "../../components/orders/OrderTable";
import OrderFilter from "../../components/orders/OrderFilter";
import OrderDetailModal from "../../components/orders/OrderDetail";

import CustomPagination from "../../components/common/Pagination";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // โหลด Orders
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await orderService.getAllOrders();

      setOrders(res.data);
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load orders",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // เปิดรายละเอียด
  const handleView = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // ลบ Order
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Order?",
      text: "คุณต้องการลบ Order นี้หรือไม่",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await orderService.deleteOrder(id);

      if (res.success) {
        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: res.message,
          timer: 1200,
          showConfirmButton: false,
        });

        fetchOrders();
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
  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      order.full_name.toLowerCase().includes(search.toLowerCase());

    const matchStatus = status === "" || order.order_status === status;

    return matchSearch && matchStatus;
  });

  // Pagination
  const indexOfLast = currentPage * ordersPerPage;

  const indexOfFirst = indexOfLast - ordersPerPage;

  const currentOrders = filteredOrders.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  return (
    <>
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold mb-0">Orders</h3>
          </div>

          <OrderFilter
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
              <OrderTable
                orders={currentOrders}
                onView={handleView}
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

      <OrderDetailModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
        }}
        order={selectedOrder}
        onSuccess={() => {
          setShowModal(false);
          fetchOrders();
        }}
      />
    </>
  );
}
