import { useEffect, useState } from "react";
import { Button, Col, Form, Row, Spinner, InputGroup } from "react-bootstrap";
import productService from "../../services/productService";
import brandService from "../../services/brandService";
import categoryService from "../../services/categoryService";
import Swal from "sweetalert2";

export default function ProductForm({ mode, product, onSuccess, onClose }) {
  const [preview, setPreview] = useState("");

  const [formData, setFormData] = useState({
    category_id: "",
    brand_id: "",
    sku: "",
    image: "",
    product_name: "",
    description: "",
    price: "",
    stock: "",
    warranty_provider: "",
    cpu: "",
    gpu: "",
    ram: "",
    display: "",
    storage: "",

    mainboard: "",
    power_supply: "",
    case_name: "",
    cooling: "",

    status: "ACTIVE",
  });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await categoryService.getAllCategories();
        setCategories(Array.isArray(res?.data) ? res.data : []);
      } catch (error) {
        console.error(error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };


   loadCategories();
  
  }, []);


  useEffect(() => {
    const loadBrands = async () => {
      if (!formData.category_id) {
        setBrands([]);
        return;
      }

      try {
        setBrandsLoading(true);

        const res = await brandService.getBrandsByCategory(
          formData.category_id,
        );

        const brandList = Array.isArray(res?.data) ? res.data : [];

        setBrands(brandList);

        // ถ้ามี Brand แค่ตัวเดียว ให้เลือกให้อัตโนมัติ
        if (brandList.length === 1) {
          setFormData((prev) => ({
            ...prev,
            brand_id: brandList[0].brand_id,
          }));
        }
      } catch (err) {
        console.error(err);
        setBrands([]);
      } finally {
        setBrandsLoading(false);
      }
    };

    loadBrands();
  }, [formData.category_id]);

  useEffect(() => {
    if (mode === "edit" && product) {
      setFormData({
        category_id: product.category_id || "",
        brand_id: product.brand_id || "",
        sku: product.sku || "",
        image: product.image || "",
        product_name: product.product_name || "",
        description: product.description || "",
        price: product.price || "",
        stock: product.stock || "",
        warranty_provider: product.warranty_provider || "",
        cpu: product.cpu || "",
        gpu: product.gpu || "",
        ram: product.ram || "",
        display: product.display || "",
        storage: product.storage || "",

        mainboard: product.mainboard || "",
        power_supply: product.power_supply || "",
        case_name: product.case_name || "",
        cooling: product.cooling || "",

        status: product.status || "ACTIVE",
      });

      if (product.image) {
        setPreview(`http://localhost:5000${product.image}`);
      }
    } else {
      setPreview("");
    }
  }, [mode, product]);

  const selectedCategory = categories.find(
    (c) => Number(c.category_id) === Number(formData.category_id),
  );

  const categoryName = selectedCategory?.category_name || "";

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "category_id") {
      setFormData((prev) => ({
        ...prev,
        category_id: value,
        brand_id: "",
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = new FormData();

    Object.keys(formData).forEach((key) => {
      submitData.append(key, formData[key]);
    });

    try {
      if (mode === "add") {
        await productService.createProduct(submitData);

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Product added successfully",
        });
      } else {
        await productService.updateProduct(product.product_id, submitData);

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Product updated successfully",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong",
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>

            {categoriesLoading ? (
              <div>
                <Spinner animation="border" size="sm" />
              </div>
            ) : (
              <Form.Select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.category_name}
                  </option>
                ))}
              </Form.Select>
            )}
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Brand</Form.Label>

            {brandsLoading ? (
              <div>
                <Spinner animation="border" size="sm" />
              </div>
            ) : (
              <Form.Select
                name="brand_id"
                value={formData.brand_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Brand --</option>

                {brands.map((brand) => (
                  <option key={brand.brand_id} value={brand.brand_id}>
                    {brand.brand_name}
                  </option>
                ))}
              </Form.Select>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>SKU</Form.Label>

        <Form.Control
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Product Image</Form.Label>

        <Form.Control
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />

        {preview && (
          <div className="mt-3">
            <img
              src={preview}
              alt="preview"
              width="150"
              height="150"
              style={{
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          </div>
        )}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Product Name</Form.Label>

        <Form.Control
          name="product_name"
          value={formData.product_name}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>

        <Form.Control
          as="textarea"
          rows={3}
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Price</Form.Label>

            <InputGroup>
              <InputGroup.Text>฿</InputGroup.Text>

              <Form.Control
                type="text"
                name="price"
                value={
                  formData.price
                    ? Number(formData.price).toLocaleString("en-US")
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value.replace(/,/g, "");

                  if (/^\d*$/.test(value)) {
                    setFormData((prev) => ({
                      ...prev,
                      price: value,
                    }));
                  }
                }}
                placeholder="0"
                required
              />
            </InputGroup>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Stock</Form.Label>

            <Form.Control
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Warranty Provider</Form.Label>

        <Form.Control
          name="warranty_provider"
          value={formData.warranty_provider}
          onChange={handleChange}
        />
      </Form.Group>

      {["Notebook", "Computer Set"].includes(categoryName) && (
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>CPU</Form.Label>
              <Form.Control
                name="cpu"
                value={formData.cpu}
                onChange={handleChange}
                placeholder="e.g. Intel Core i7-14700HX"
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>GPU</Form.Label>
              <Form.Control
                name="gpu"
                value={formData.gpu}
                onChange={handleChange}
                placeholder="e.g. RTX 4060"
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      {categoryName === "Computer Set" && (
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Mainboard</Form.Label>
              <Form.Control
                name="mainboard"
                value={formData.mainboard}
                onChange={handleChange}
                placeholder="e.g. ASUS B760M"
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Power Supply</Form.Label>
              <Form.Control
                name="power_supply"
                value={formData.power_supply}
                onChange={handleChange}
                placeholder="e.g. Corsair RM750e"
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      {categoryName === "Computer Set" && (
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Case</Form.Label>
              <Form.Control
                name="case_name"
                value={formData.case_name}
                onChange={handleChange}
                placeholder="e.g. NZXT H5 Flow"
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Cooling</Form.Label>
              <Form.Control
                name="cooling"
                value={formData.cooling}
                onChange={handleChange}
                placeholder="e.g. DeepCool AK620"
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      {["Notebook", "Computer Set"].includes(categoryName) && (
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>RAM</Form.Label>
              <Form.Control
                name="ram"
                value={formData.ram}
                onChange={handleChange}
                placeholder="e.g. 16GB DDR5"
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Storage</Form.Label>
              <Form.Control
                name="storage"
                value={formData.storage}
                onChange={handleChange}
                placeholder="e.g. 1TB SSD"
              />
            </Form.Group>
          </Col>
        </Row>
      )}

      {categoryName === "Notebook" && (
        <Form.Group className="mb-3">
          <Form.Label>Display</Form.Label>

          <Form.Control
            name="display"
            value={formData.display}
            onChange={handleChange}
            placeholder="e.g. 15.6-inch FHD 144Hz"
          />
        </Form.Group>
      )}

      <Form.Group className="mb-4">
        <Form.Label>Status</Form.Label>

        <Form.Select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="ACTIVE">ACTIVE</option>

          <option value="INACTIVE">INACTIVE</option>
        </Form.Select>
      </Form.Group>

      <div className="d-flex justify-content-end">
        <Button variant="secondary" className="me-2" onClick={onClose}>
          Cancel
        </Button>

        <Button variant="primary" type="submit">
          {mode === "add" ? "Add Product" : "Update Product"}
        </Button>
      </div>
    </Form>
  );
}
