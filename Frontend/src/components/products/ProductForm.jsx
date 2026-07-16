import { useEffect, useState } from "react";
import { Button, Col, Form, Row, Spinner } from "react-bootstrap";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import specTemplateService from "../../services/specTemplateService";
import productSpecService from "../../services/productSpecService";
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
    status: "ACTIVE",
  });

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // สเปคสินค้าแบบ dynamic ตาม category ที่เลือก
  const [specTemplates, setSpecTemplates] = useState([]);
  const [specValues, setSpecValues] = useState({});
  const [specsLoading, setSpecsLoading] = useState(false);
  const [existingSpecs, setExistingSpecs] = useState(mode === "edit" ? null : {});

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
        status: product.status || "ACTIVE",
      });

      if (product.image) {
        setPreview(`http://localhost:5000${product.image}`);
      }

      // โหลดสเปคเดิมของสินค้านี้ ไว้ prefill ตอน template โหลดเสร็จ
      productSpecService
        .getByProductId(product.product_id)
        .then((res) => {
          const map = {};
          (Array.isArray(res?.data) ? res.data : []).forEach((s) => {
            map[s.spec_name] = s.spec_value;
          });
          setExistingSpecs(map);
        })
        .catch(() => setExistingSpecs({}));
    } else {
      setPreview("");
      setExistingSpecs({});
    }
  }, [mode, product]);

  // โหลด spec template ตาม category ที่เลือกอยู่ + prefill ค่าจากสเปคเดิม (ถ้ามี)
  useEffect(() => {
    const categoryId = formData.category_id;

    if (!categoryId || existingSpecs === null) {
      setSpecTemplates([]);
      if (!categoryId) setSpecValues({});
      return;
    }

    let cancelled = false;
    setSpecsLoading(true);

    specTemplateService
      .getByCategory(categoryId)
      .then((res) => {
        if (cancelled) return;

        const templates = Array.isArray(res?.data) ? res.data : [];
        setSpecTemplates(templates);

        setSpecValues(() => {
          const next = {};
          templates.forEach((t) => {
            next[t.spec_name] = existingSpecs?.[t.spec_name] ?? "";
          });
          return next;
        });
      })
      .catch(() => {
        if (!cancelled) {
          setSpecTemplates([]);
          setSpecValues({});
        }
      })
      .finally(() => {
        if (!cancelled) setSpecsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.category_id, existingSpecs]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSpecChange = (specName, value) => {
    setSpecValues((prev) => ({
      ...prev,
      [specName]: value,
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
      let productId = product?.product_id;

      if (mode === "add") {
        const res = await productService.createProduct(submitData);
        productId = res?.product_id;
      } else {
        await productService.updateProduct(product.product_id, submitData);
      }

      // บันทึกสเปคสินค้าต่อ (แยก try/catch — ถ้าพังไม่ rollback การสร้าง/แก้ไขสินค้า)
      let specSaveFailed = false;

      if (productId) {
        try {
          const specsArray = Object.entries(specValues)
            .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
            .map(([specName, specValue]) => ({
              specName,
              specValue: String(specValue).trim(),
            }));

          await productSpecService.updateProductSpecs(productId, specsArray);
        } catch (specError) {
          console.error(specError);
          specSaveFailed = true;
        }
      }

      if (specSaveFailed) {
        Swal.fire({
          icon: "warning",
          title: "บันทึกสินค้าสำเร็จ แต่บันทึกสเปคไม่สำเร็จ",
          text: "กรุณาแก้ไขสินค้าเพื่อลองบันทึกสเปคอีกครั้ง",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: mode === "add" ? "Product added successfully" : "Product updated successfully",
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
            <Form.Label>Brand ID</Form.Label>

            <Form.Control
              name="brand_id"
              value={formData.brand_id}
              onChange={handleChange}
              required
            />
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

            <Form.Control
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
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

      {formData.category_id && (
        <div className="mb-4">
          <Form.Label className="fw-bold">Specifications</Form.Label>

          {specsLoading ? (
            <div>
              <Spinner animation="border" size="sm" />
            </div>
          ) : specTemplates.length === 0 ? (
            <div className="text-muted small">
              Category นี้ยังไม่มี spec template กำหนดไว้ (ตั้งค่าได้ที่หน้า Spec Templates)
            </div>
          ) : (
            <Row>
              {specTemplates.map((t) => (
                <Col md={6} key={t.template_id}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t.spec_name}</Form.Label>
                    <Form.Control
                      value={specValues[t.spec_name] ?? ""}
                      onChange={(e) => handleSpecChange(t.spec_name, e.target.value)}
                      placeholder={`ระบุ ${t.spec_name} (ไม่บังคับ)`}
                    />
                  </Form.Group>
                </Col>
              ))}
            </Row>
          )}
        </div>
      )}

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
