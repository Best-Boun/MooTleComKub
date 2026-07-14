import { Pagination } from "react-bootstrap";

export default function CustomPagination({
  currentPage,
  totalPages,
  setCurrentPage,
}) {
  if (totalPages <= 1) return null;

  return (
    <Pagination className="justify-content-center mt-4">
      <Pagination.Prev
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(currentPage - 1)}
      />

      {[...Array(totalPages)].map((_, index) => (
        <Pagination.Item
          key={index}
          active={currentPage === index + 1}
          onClick={() => setCurrentPage(index + 1)}
        >
          {index + 1}
        </Pagination.Item>
      ))}

      <Pagination.Next
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(currentPage + 1)}
      />
    </Pagination>
  );
}
