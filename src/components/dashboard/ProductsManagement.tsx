import React, { useEffect, useState } from "react";
import {
    Row,
    Col,
    Table,
    Button,
    Form,
    InputGroup,
    Modal,
    Image,
    Card,
    Dropdown,
} from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    orderBy,
    limit,
    startAfter,
    QueryDocumentSnapshot,
    Timestamp,
} from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { uploadImageToCloudinary } from "../../utils/cloudinaryUpload";

/* ============================
Types
============================ */
export type Product = {
    id: string;
    name: string;
    category: string;
    price: number;
    description?: string;
    img?: string;
    createdAt: Timestamp | Date | number;
    featured?: boolean;
};

export type Category = {
    id: string;
    name: string;
};

type FormState = {
    name: string;
    category: string;
    price: string;
    description: string;
    img: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

/* ============================
Constants
============================ */
const PAGE_SIZE = 5;
const MAX_FEATURED = 6;

/* ============================
Component
============================ */
const ProductsManagement: React.FC = (): JSX.Element => {
    // ---------------------------- Local State ----------------------------
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState<string>("");
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [filter, setFilter] = useState<string>("");
    const [sortField, setSortField] = useState<"name" | "price" | "category">("name");
    const [sortDir] = useState<"asc" | "desc">("asc");

    const [showModal, setShowModal] = useState<boolean>(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
    const [toDeleteId, setToDeleteId] = useState<string | null>(null);
    const [details, setDetails] = useState<Product | null>(null);

    const [form, setForm] = useState<FormState>({ name: "", category: "", price: "", description: "", img: "" });
    const [errors, setErrors] = useState<FormErrors>({});

    // ---------------------------- Helpers ----------------------------
    const normalizeDoc = (docSnap: QueryDocumentSnapshot<DocumentData>): Product => {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            name: String(data.name ?? ""),
            category: String(data.category ?? ""),
            price: Number(data.price ?? 0),
            description: data.description ? String(data.description) : "",
            img: data.img ? String(data.img) : "",
            createdAt: data.createdAt ?? Date.now(),
            featured: Boolean(data.featured ?? false),
        };
    };

    const normalizeCategoryDoc = (docSnap: QueryDocumentSnapshot<DocumentData>): Category => {
        const data = docSnap.data();
        return { id: docSnap.id, name: String(data.name ?? "") };
    };

    const getDateFromCreatedAt = (value: Product["createdAt"]): Date => {
        if (value instanceof Timestamp) return value.toDate();
        if (value instanceof Date) return value;
        if (typeof value === "number") return new Date(value);
        return new Date();
    };

    const formatDate = (value: Product["createdAt"]): string => {
        return getDateFromCreatedAt(value).toLocaleString("ar-EG");
    };

    // ---------------------------- Fetch Products & Categories ----------------------------
    const fetchProducts = async (): Promise<void> => {
        try {
            const q = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(PAGE_SIZE));
            const snapshot = await getDocs(q);
            const items = snapshot.docs.map(normalizeDoc);
            setProducts(items);
            setLastDoc(snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null);
        } catch (error) {
            console.error("fetchProducts error:", error);
            toast.error("فشل تحميل المنتجات");
        }
    };

    /* ---- Alternative API Example: Fetch Products ---- */
    // const response = await fetch("https://api.example.com/products?limit=" + PAGE_SIZE);
    // if (!response.ok) throw new Error("Failed to fetch products");
    // const data = await response.json();
    // setProducts(data.products);
    // setLastDoc(data.nextCursor ?? null);

    const fetchCategories = async (): Promise<void> => {
        try {
            const snapshot = await getDocs(collection(db, "categories"));
            const cats: Category[] = snapshot.docs.map(normalizeCategoryDoc);
            setCategories(cats);
        } catch (error) {
            console.error("fetchCategories error:", error);
            toast.error("فشل تحميل الأقسام");
        }
    };

    /* ---- Alternative API Example: Fetch Categories ---- */
    // const response = await fetch("https://api.example.com/categories");
    // if (!response.ok) throw new Error("Failed to fetch categories");
    // const data = await response.json();
    // setCategories(data.categories);

    // ---------------------------- Pagination ----------------------------
    const loadMore = async (): Promise<void> => {
        if (!lastDoc) return;
        setLoadingMore(true);
        try {
            const q = query(
                collection(db, "products"),
                orderBy("createdAt", "desc"),
                startAfter(lastDoc),
                limit(PAGE_SIZE)
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const items = snapshot.docs.map(normalizeDoc);
                setProducts((prev) => [...prev, ...items]);
                setLastDoc(snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null);
            } else {
                setLastDoc(null);
            }
        } catch (error) {
            console.error("loadMore error:", error);
            toast.error("فشل تحميل المزيد من المنتجات");
        } finally {
            setLoadingMore(false);
        }
    };

    /* ---- Alternative API Example: Load More Products ---- */
    // const response = await fetch("https://api.example.com/products?after=" + lastDocId + "&limit=" + PAGE_SIZE);
    // if (!response.ok) throw new Error("Failed to load more");
    // const data = await response.json();
    // setProducts((prev) => [...prev, ...data.products]);
    // setLastDoc(data.nextCursor ?? null);


    // ---------------------------- Lifecycle ----------------------------
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, );

    // ---------------------------- Modal Controls ----------------------------
    const openAdd = (): void => {
        setEditing(null);
        setForm({ name: "", category: "", price: "", description: "", img: "" });
        setErrors({});
        setShowModal(true);
    };

    const openEdit = (p: Product): void => {
        setEditing(p);
        setForm({
            name: p.name,
            category: p.category,
            price: String(p.price),
            description: p.description ?? "",
            img: p.img ?? "",
        });
        setErrors({});
        setShowModal(true);
    };

    // ---------------------------- Validation ----------------------------
    const validate = (): boolean => {
        const e: FormErrors = {};
        if (!form.name.trim()) e.name = "اسم المنتج مطلوب";
        if (!form.category.trim()) e.category = "القسم مطلوب";
        if (form.price === "" || Number.isNaN(Number(form.price))) e.price = "السعر مطلوب ورقمياً";
        else if (Number(form.price) < 0) e.price = "السعر لازم يكون موجب";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ---------------------------- Save Product ----------------------------
    const handleSave = async (): Promise<void> => {
        if (!validate()) return;

        const productData = {
            name: form.name.trim(),
            category: form.category.trim(),
            price: Number(form.price),
            description: form.description.trim() || "",
            img: form.img.trim() || "",
            createdAt: new Date(),
            featured: false, // default
        } as const;

        try {
            if (editing) {
                setProducts((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...productData } as Product : p)));
                const ref = doc(db, "products", editing.id);
                await updateDoc(ref, { ...productData, createdAt: Timestamp.fromDate(new Date(productData.createdAt as Date)) });
                toast.success("تم تعديل المنتج");
            } else {
                const docRef = await addDoc(collection(db, "products"), { ...productData, createdAt: Timestamp.fromDate(new Date(productData.createdAt as Date)) });
                setProducts((prev) => [{ id: docRef.id, ...productData }, ...prev]);
                toast.success("تم إضافة المنتج");
            }
            setShowModal(false);
        } catch (error) {
            console.error("handleSave error:", error);
            toast.error("حدث خطأ أثناء الحفظ");
            await fetchProducts();
        }
    };

    /* ---- Alternative API Example: Create Product ---- */
    // const response = await fetch("https://api.example.com/products", {
    // method: "POST",
    // headers: { "Content-Type": "application/json" },
    // body: JSON.stringify(productData),
    // });
    // if (!response.ok) throw new Error("Create failed");
    // const newProduct = await response.json();
    // setProducts((prev) => [newProduct, ...prev]);
    // toast.success("تم إضافة المنتج (API)");

    /* ---- Alternative API Example: Update Product ---- */
    // const response = await fetch(`https://api.example.com/products/${editing.id}`, {
    // method: "PUT",
    // headers: { "Content-Type": "application/json" },
    // body: JSON.stringify(productData),
    // });
    // if (!response.ok) throw new Error("Update failed");
    // toast.success("تم تعديل المنتج (API)");



    // ---------------------------- Delete Product ----------------------------
    const handleDelete = async (): Promise<void> => {
        if (!toDeleteId) return;
        const prevSnapshot = products;
        setProducts((prev) => prev.filter((p) => p.id !== toDeleteId));
        try {
            await deleteDoc(doc(db, "products", toDeleteId));
            toast.info("تم حذف المنتج");
        } catch (error) {
            console.error("handleDelete error:", error);
            toast.error("فشل الحذف");
            setProducts(prevSnapshot);
        } finally {
            setToDeleteId(null);
            setConfirmOpen(false);
        }
    };

    /* ---- Alternative API Example: Delete Product ---- */
    // const response = await fetch(`https://api.example.com/products/${toDeleteId}`, { method: "DELETE" });
    // if (!response.ok) throw new Error("Delete failed");
    // toast.info("تم حذف المنتج (API)");


    // ---------------------------- Category Add/Edit/Delete ----------------------------
    const handleAddCategory = async (): Promise<void> => {
        const catName = newCategory.trim();
        if (!catName) return;

        try {
            const docRef = await addDoc(collection(db, "categories"), { name: catName });
            setCategories((prev) => [...prev, { id: docRef.id, name: catName }]);
            setNewCategory("");
            toast.success("تم إضافة القسم");
        } catch (error) {
            console.error("handleAddCategory error:", error);
            toast.error("فشل إضافة القسم");
        }
    };

    /* ---- Alternative API Example: Add Category ---- */
    // const response = await fetch("https://api.example.com/categories", {
    // method: "POST",
    // headers: { "Content-Type": "application/json" },
    // body: JSON.stringify({ name: catName }),
    // });
    // if (!response.ok) throw new Error("Failed to add category");
    // const newCat = await response.json();
    // setCategories((prev) => [...prev, newCat]);


    const handleDeleteCategory = async (catId: string) => {
        try {
            await deleteDoc(doc(db, "categories", catId));
            setCategories((prev) => prev.filter(c => c.id !== catId));
            toast.info("تم حذف القسم");
        } catch (err) {
            console.error(err);
            toast.error("فشل حذف القسم");
        }
    };

    /* ---- Alternative API Example: Delete Category ---- */
    // const response = await fetch(`https://api.example.com/categories/${catId}`, { method: "DELETE" });
    // if (!response.ok) throw new Error("Delete category failed");
    // setCategories((prev) => prev.filter(c => c.id !== catId));


    const handleEditCategory = async (catId: string, newName: string) => {
        if (!newName.trim()) return;
        try {
            const ref = doc(db, "categories", catId);
            await updateDoc(ref, { name: newName });
            setCategories((prev) => prev.map(c => c.id === catId ? { ...c, name: newName } : c));
            toast.success("تم تعديل القسم");
        } catch (err) {
            console.error(err);
            toast.error("فشل تعديل القسم");
        }
    };

    /* ---- Alternative API Example: Edit Category ---- */
    // const response = await fetch(`https://api.example.com/categories/${catId}`, {
    // method: "PUT",
    // headers: { "Content-Type": "application/json" },
    // body: JSON.stringify({ name: newName }),
    // });
    // if (!response.ok) throw new Error("Update category failed");
    // setCategories((prev) => prev.map(c => c.id === catId ? { ...c, name: newName } : c));


    // ---------------------------- Featured Toggle ----------------------------
    const toggleFeatured = async (product: Product) => {
        try {
            const currentFeaturedCount = products.filter(p => p.featured).length;
            // Prevent exceeding max featured limit
            if (!product.featured && currentFeaturedCount >= MAX_FEATURED) {
                toast.warning(`لا يمكنك اختيار أكثر من ${MAX_FEATURED} منتجات مميزة`);
                return;
            }
            const updated = { ...product, featured: !product.featured };
            setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
            const ref = doc(db, "products", product.id);
            await updateDoc(ref, { featured: updated.featured });
            toast.success(updated.featured ? "تم تمييز المنتج" : "تم إلغاء التمييز");
        } catch (err) {
            console.error("toggleFeatured error:", err);
            toast.error("فشل تحديث حالة المنتج المميز");
        }
    };

    /* ---- Alternative API Example: Toggle Featured ---- */
    // const response = await fetch(`https://api.example.com/products/${product.id}/toggle-featured`, {
    // method: "PATCH",
    // headers: { "Content-Type": "application/json" },
    // body: JSON.stringify({ featured: updated.featured }),
    // });
    // if (!response.ok) throw new Error("Failed to toggle featured");
    // toast.success(updated.featured ? "تم تمييز المنتج (API)" : "تم إلغاء التمييز (API)");


    // ---------------------------- Filtering + Sorting ----------------------------
    const filtered = products
        .filter((p) => {
            const q = filter.trim().toLowerCase();
            if (!q) return true;
            return (
                p.name.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q) ||
                (p.description && p.description.toLowerCase().includes(q))
            );
        })
        .sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];
            if (typeof aVal === "number" && typeof bVal === "number") return sortDir === "asc" ? aVal - bVal : bVal - aVal;
            const sA = String(aVal).toLowerCase();
            const sB = String(bVal).toLowerCase();
            if (sA < sB) return sortDir === "asc" ? -1 : 1;
            if (sA > sB) return sortDir === "asc" ? 1 : -1;
            return 0;
        });

    // ---------------------------- Render ----------------------------
    return (
        <div className="products-management p-3">
            {/* Search + Add Row */}
            <Row className="mb-3 search-add-row">
                <Col xs={10} className="d-flex justify-content-between align-items-center search-product">
                    <InputGroup className="search-input-group me-2">
                        <Button variant="outline-secondary"><FaSearch /></Button>
                        <Form.Control
                            placeholder="ابحث بالاسم، القسم أو الوصف..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col xs={2}><Button className="btn-add-product" onClick={openAdd}><FaPlus /> إضافة منتج</Button></Col>
            </Row>

            {/* Analytics Cards */}
            <Row className="mb-3 analytics-cards">
                <Col><Card className="stat-card"><h6>إجمالي المنتجات</h6><p>{products.length}</p></Card></Col>
                <Col><Card className="stat-card"><h6>متوسط السعر</h6><p>{products.length > 0 ? (products.reduce((s, p) => s + p.price, 0) / products.length).toFixed(2) : "0"} EGP</p></Card></Col>
                <Col><Card className="stat-card"><h6>آخر تحديث</h6><p>{products[0] ? formatDate(products[0].createdAt) : "—"}</p></Card></Col>
            </Row>

            {/* Products Table (Desktop) */}
            <div className="products-table table-responsive shadow-sm d-none d-md-block">
                <Table hover responsive>
                    <thead>
                        <tr>
                            <th>مميز</th>
                            <th>صورة</th>
                            <th style={{ cursor: "pointer" }} onClick={() => setSortField("name")}>الاسم</th>
                            <th style={{ cursor: "pointer" }} onClick={() => setSortField("category")}>القسم</th>
                            <th style={{ cursor: "pointer" }} onClick={() => setSortField("price")}>السعر</th>
                            <th>الوصف</th>
                            <th className="text-end">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((p) => (
                            <tr key={p.id}>
                                <td>
                                    <Form.Check
                                        type="checkbox"
                                        checked={!!p.featured}
                                        onChange={() => toggleFeatured(p)}
                                    />
                                </td>
                                <td>{p.img ? <img src={p.img} alt={p.name} className="table-img" /> : <div className="img-placeholder">لا توجد صورة</div>}</td>
                                <td>{p.name}</td>
                                <td>{p.category}</td>
                                <td>{p.price} EGP</td>
                                <td className="text-truncate" style={{ maxWidth: 240 }}>{p.description}</td>
                                <td className="text-end">
                                    <Button size="sm" className="me-2 view" onClick={() => setDetails(p)}>عرض</Button>
                                    <Button variant="outline-primary" size="sm" className="me-2 edit" onClick={() => openEdit(p)}><FaEdit /></Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => { setToDeleteId(p.id); setConfirmOpen(true); }}><FaTrash /></Button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && <tr><td colSpan={7} className="text-center text-muted">لا توجد نتائج</td></tr>}
                    </tbody>
                </Table>
            </div>

            {/* Products Cards (Mobile) */}
            <div className="products-cards d-block d-md-none">
                <Row className="g-3">
                    {filtered.map((p) => (
                        <Col xs={12} key={p.id}>
                            <Card className={`shadow-sm ${p.featured ? "border-warning" : ""}`}>
                                {p.img ? <Card.Img variant="top" src={p.img} style={{ height: 180, objectFit: "cover" }} /> : <div className="img-placeholder">لا توجد صورة</div>}
                                <Card.Body>
                                    <Card.Title className="d-flex justify-content-between align-items-center">
                                        {p.name}
                                        <Form.Check type="checkbox" checked={!!p.featured} onChange={() => toggleFeatured(p)} label="مميز" />
                                    </Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">{p.category}</Card.Subtitle>
                                    <Card.Text className="text-truncate" style={{ maxHeight: 50 }}>{p.description}</Card.Text>
                                    <Card.Text><strong>{p.price} EGP</strong></Card.Text>
                                    <div className="d-flex justify-content-end gap-2">
                                        <Button size="sm" className="view" onClick={() => setDetails(p)}>عرض</Button>
                                        <Button variant="outline-primary" size="sm" onClick={() => openEdit(p)}><FaEdit /></Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => { setToDeleteId(p.id); setConfirmOpen(true); }}><FaTrash /></Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                    {filtered.length === 0 && <Col><p className="text-center text-muted">لا توجد نتائج</p></Col>}
                </Row>
            </div>


            {lastDoc && <div className="text-center my-3"><Button onClick={loadMore} disabled={loadingMore} className="more">{loadingMore ? "جاري التحميل..." : "تحميل المزيد"}</Button></div>}

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>{editing ? "تعديل المنتج" : "إضافة منتج"}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form>
                        {(["name", "price", "description"] as Array<keyof FormState>).map((field) => (
                            <Form.Group className="mb-2" key={field}>
                                <Form.Label>{field === "name" ? "اسم المنتج" : field === "price" ? "السعر" : "الوصف"}</Form.Label>
                                <Form.Control
                                    type={field === "price" ? "number" : "text"}
                                    as={field === "description" ? "textarea" : undefined}
                                    rows={field === "description" ? 2 : undefined}
                                    value={form[field]}
                                    onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
                                />
                                {errors[field] && <div className="text-danger small">{errors[field]}</div>}
                            </Form.Group>
                        ))}

                        {/* Category Dropdown */}
                        <Form.Group className="mb-2">
                            <Form.Label>القسم</Form.Label>
                            <Dropdown className="mb-1">
                                <Dropdown.Toggle variant="outline-secondary" id="dropdown-category">
                                    {form.category || "اختر القسم"}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    {categories.map((cat) => (
                                        <Dropdown.Item key={cat.id} className="d-flex justify-content-between align-items-center">
                                            <span onClick={() => setForm(prev => ({ ...prev, category: cat.name }))}>{cat.name}</span>
                                            <div>
                                                <FaEdit className="mx-1" style={{ cursor: "pointer" }} onClick={() => {
                                                    const newName = prompt("ادخل اسم القسم الجديد:", cat.name);
                                                    if (newName) handleEditCategory(cat.id, newName);
                                                }} />
                                                <FaTrash className="mx-1" style={{ cursor: "pointer" }} onClick={() => handleDeleteCategory(cat.id)} />
                                            </div>
                                        </Dropdown.Item>
                                    ))}
                                    <div className="dropdown-add-category p-2 border-top">
                                        <InputGroup>
                                            <Form.Control placeholder="قسم جديد" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                                            <Button onClick={handleAddCategory}>إضافة</Button>
                                        </InputGroup>
                                    </div>
                                </Dropdown.Menu>
                            </Dropdown>
                            {errors.category && <div className="text-danger small">{errors.category}</div>}
                        </Form.Group>

                        {/* Image Upload */}
                        <Form.Group className="mb-2">
                            <Form.Label>صورة المنتج</Form.Label>
                            <Form.Control
                                type="file"
                                onChange={async (e) => {
                                    const target = e.target as HTMLInputElement; 
                                    if (target.files && target.files[0]) {
                                        try {
                                            const url = await uploadImageToCloudinary(target.files[0]);
                                            setForm((prev) => ({ ...prev, img: url }));
                                        } catch (err) {
                                            console.error("uploadImage error:", err);
                                            toast.error("فشل رفع الصورة");
                                        }
                                    }
                                }}
                            />
                            {form.img && <div className="mt-2 text-center"><Image src={form.img} fluid style={{ maxHeight: 150 }} /></div>}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>إلغاء</Button>
                    <Button onClick={handleSave}>{editing ? "حفظ التعديلات" : "إضافة المنتج"}</Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Confirmation */}
            <Modal show={confirmOpen} onHide={() => setConfirmOpen(false)} centered>
                <Modal.Header closeButton><Modal.Title>تأكيد الحذف</Modal.Title></Modal.Header>
                <Modal.Body>هل أنت متأكد أنك تريد حذف هذا المنتج؟</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setConfirmOpen(false)}>إلغاء</Button>
                    <Button variant="danger" onClick={handleDelete}>حذف</Button>
                </Modal.Footer>
            </Modal>

            {/* Details Modal */}
            <Modal show={!!details} onHide={() => setDetails(null)} centered>
                <Modal.Header closeButton><Modal.Title>تفاصيل المنتج</Modal.Title></Modal.Header>
                <Modal.Body>
                    {details && (
                        <div>
                            <p><strong>الاسم:</strong> {details.name}</p>
                            <p><strong>القسم:</strong> {details.category}</p>
                            <p><strong>السعر:</strong> {details.price} EGP</p>
                            <p><strong>الوصف:</strong> {details.description}</p>
                            {details.img && <Image src={details.img} fluid />}
                            <p className="mt-2"><strong>تاريخ الإضافة:</strong> {formatDate(details.createdAt)}</p>
                            <p><strong>مميز:</strong> {details.featured ? "✅ نعم" : "❌ لا"}</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer><Button onClick={() => setDetails(null)}>إغلاق</Button></Modal.Footer>
            </Modal>

            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default ProductsManagement;
