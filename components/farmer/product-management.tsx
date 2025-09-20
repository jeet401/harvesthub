"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import type { Product, Category } from "@/lib/types"

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    unit: "",
    quantity_available: "",
    category_id: "",
    image_url: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { language } = useLanguage()

  const productTranslations = {
    en: {
      title: "Product Management",
      subtitle: "Manage your products and inventory",
      addProduct: "Add New Product",
      editProduct: "Edit Product",
      name: "Product Name",
      description: "Description",
      price: "Price (₹)",
      unit: "Unit",
      quantity: "Quantity Available",
      category: "Category",
      imageUrl: "Image URL",
      save: "Save Product",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      toggleStatus: "Toggle Status",
      active: "Active",
      inactive: "Inactive",
      noProducts: "No products found",
      addFirstProduct: "Add your first product to get started",
      namePlaceholder: "Enter product name",
      descriptionPlaceholder: "Describe your product",
      pricePlaceholder: "Enter price",
      unitPlaceholder: "kg, piece, packet, etc.",
      quantityPlaceholder: "Available quantity",
      imageUrlPlaceholder: "Product image URL (optional)",
      selectCategory: "Select a category",
    },
    hi: {
      title: "उत्पाद प्रबंधन",
      subtitle: "अपने उत्पादों और इन्वेंटरी का प्रबंधन करें",
      addProduct: "नया उत्पाद जोड़ें",
      editProduct: "उत्पाद संपादित करें",
      name: "उत्पाद का नाम",
      description: "विवरण",
      price: "कीमत (₹)",
      unit: "इकाई",
      quantity: "उपलब्ध मात्रा",
      category: "श्रेणी",
      imageUrl: "छवि URL",
      save: "उत्पाद सहेजें",
      cancel: "रद्द करें",
      edit: "संपादित करें",
      delete: "हटाएं",
      toggleStatus: "स्थिति बदलें",
      active: "सक्रिय",
      inactive: "निष्क्रिय",
      noProducts: "कोई उत्पाद नहीं मिला",
      addFirstProduct: "शुरू करने के लिए अपना पहला उत्पाद जोड़ें",
      namePlaceholder: "उत्पाद का नाम दर्ज करें",
      descriptionPlaceholder: "अपने उत्पाद का वर्णन करें",
      pricePlaceholder: "कीमत दर्ज करें",
      unitPlaceholder: "किलो, टुकड़ा, पैकेट, आदि।",
      quantityPlaceholder: "उपलब्ध मात्रा",
      imageUrlPlaceholder: "उत्पाद छवि URL (वैकल्पिक)",
      selectCategory: "एक श्रेणी चुनें",
    },
  }

  const pt = productTranslations[language]

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    const supabase = createClient()
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*)
        `)
        .eq("farmer_id", userData.user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.log("[v0] Products fetch error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase.from("categories").select("*").order("name")

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.log("[v0] Categories fetch error:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsSubmitting(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      if (!formData.category_id) {
        alert("Please select a category")
        setIsSubmitting(false)
        return
      }

      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: Number.parseFloat(formData.price),
        unit: formData.unit,
        quantity_available: Number.parseInt(formData.quantity_available),
        category_id: formData.category_id, // Now guaranteed to be a valid UUID
        image_url: formData.image_url || null,
        farmer_id: userData.user.id,
      }

      if (editingProduct) {
        const { error } = await supabase.from("products").update(productData).eq("id", editingProduct.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("products").insert(productData)
        if (error) throw error
      }

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        unit: "",
        quantity_available: "",
        category_id: "",
        image_url: "",
      })
      setShowAddForm(false)
      setEditingProduct(null)
      fetchProducts()
    } catch (error) {
      console.log("[v0] Product save error:", error)
      alert("Error saving product. Please check all fields and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      unit: product.unit,
      quantity_available: product.quantity_available.toString(),
      category_id: product.category_id,
      image_url: product.image_url || "",
    })
    setShowAddForm(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    const supabase = createClient()
    try {
      const { error } = await supabase.from("products").delete().eq("id", productId)
      if (error) throw error
      fetchProducts()
    } catch (error) {
      console.log("[v0] Product delete error:", error)
    }
  }

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    const supabase = createClient()
    try {
      const { error } = await supabase.from("products").update({ is_active: !currentStatus }).eq("id", productId)
      if (error) throw error
      fetchProducts()
    } catch (error) {
      console.log("[v0] Product status toggle error:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      unit: "",
      quantity_available: "",
      category_id: "",
      image_url: "",
    })
    setShowAddForm(false)
    setEditingProduct(null)
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{pt.title}</h1>
          <p className="text-gray-600">{pt.subtitle}</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          {pt.addProduct}
        </Button>
      </div>

      {/* Add/Edit Product Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProduct ? pt.editProduct : pt.addProduct}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{pt.name}</Label>
                  <Input
                    id="name"
                    placeholder={pt.namePlaceholder}
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">{pt.category}</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => handleInputChange("category_id", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={pt.selectCategory} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {language === "hi" && category.name_hi ? category.name_hi : category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{pt.description}</Label>
                <Textarea
                  id="description"
                  placeholder={pt.descriptionPlaceholder}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">{pt.price}</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder={pt.pricePlaceholder}
                    required
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">{pt.unit}</Label>
                  <Input
                    id="unit"
                    placeholder={pt.unitPlaceholder}
                    required
                    value={formData.unit}
                    onChange={(e) => handleInputChange("unit", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">{pt.quantity}</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder={pt.quantityPlaceholder}
                    required
                    value={formData.quantity_available}
                    onChange={(e) => handleInputChange("quantity_available", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">{pt.imageUrl}</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder={pt.imageUrlPlaceholder}
                  value={formData.image_url}
                  onChange={(e) => handleInputChange("image_url", e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                  {isSubmitting ? "Saving..." : pt.save}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  {pt.cancel}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{pt.noProducts}</h3>
                <p className="text-gray-500">{pt.addFirstProduct}</p>
              </div>
              <Button onClick={() => setShowAddForm(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                {pt.addProduct}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {products.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? pt.active : pt.inactive}
                      </Badge>
                    </div>
                    <p className="text-gray-600">{product.description}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span>
                        ₹{product.price} per {product.unit}
                      </span>
                      <span>
                        {product.quantity_available} {product.unit} available
                      </span>
                      <span>{product.category?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleProductStatus(product.id, product.is_active)}
                    >
                      {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
