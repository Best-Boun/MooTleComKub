import { useEffect, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import brandService from "../../services/brandService";

export default function ProductFilter({
  search,
  setSearch,
  category,
  setCategory,
  brand,
  setBrand,
  status,
  setStatus,
  categories,
}) {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const loadBrands = async () => {
      if (!category) {
        setBrands([]);
        setBrand("");
        return;
      }

      const selectedCategory = categories.find(
        (cat) => cat.category_name === category,
      );

      if (!selectedCategory) {
        setBrands([]);
        return;
      }

      try {
        const res = await brandService.getBrandsByCategory(
          selectedCategory.category_id,
        );

        setBrands(res.data || []);
        setBrand("");
      } catch (error) {
        console.error(error);
        setBrands([]);
      }
    };

    loadBrands();
  }, [category]);

  return (
    <Row className="mb-4 g-3">
      <Col md={4}>
        <Form.Control
          type="text"
          placeholder="🔍 Search Product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Col>

      <Col md={2}>
        <Form.Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>

          {categories.map((cat) => (
            <option key={cat.category_id} value={cat.category_name}>
              {cat.category_name}
            </option>
          ))}
        </Form.Select>
      </Col>

      <Col md={2}>
        <Form.Select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          disabled={!category}
        >
          <option value="">
            {category ? "All Brands" : "Select Category First"}
          </option>

          {brands.map((item) => (
            <option key={item.brand_id} value={item.brand_name}>
              {item.brand_name}
            </option>
          ))}
        </Form.Select>
      </Col>

      <Col md={2}>
        <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </Form.Select>
      </Col>
    </Row>
  );
}
