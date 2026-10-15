# 🥗 NutriLens — See Beyond the Label

> **Understand your food. Compare your options. Shop with confidence.**

NutriLens is an intelligent food-label analysis and grocery decision-support platform that helps consumers make more informed decisions when purchasing packaged food products.

Food packages often use attractive marketing claims, but understanding the actual nutritional composition of a product can be difficult. Consumers must interpret ingredient lists, nutritional values, allergens, and serving sizes while comparing multiple products.

**NutriLens bridges the gap between reading a food label and making an informed purchasing decision.**

Our platform helps users explore product information, understand potential nutritional concerns, compare alternatives, and evaluate their grocery basket through a unified experience.

---

## 🎯 The Problem

Consumers frequently face challenges when purchasing packaged food:

- **Complex nutrition labels:** Ingredient lists and nutritional values can be difficult to understand.
- **Misleading impressions:** Attractive packaging and marketing claims may distract consumers from the actual product information.
- **Different dietary needs:** A product that suits one person may not suit another's preferences or dietary requirements.
- **Difficult product comparisons:** Comparing nutritional information across multiple products takes time.
- **Limited basket-level insights:** Evaluating products individually does not necessarily reveal the nutritional characteristics of an entire grocery basket.

The problem is not simply a lack of nutritional information. It is the difficulty of turning that information into practical purchasing decisions.

## 💡 Our Solution

NutriLens provides a connected workflow for understanding packaged foods and making more informed grocery-shopping decisions.

### Our approach

1. **Discover:** Scan or search for a packaged food product.
2. **Understand:** Review available ingredients and nutritional information.
3. **Assess:** Identify potential nutritional concerns using the available product data.
4. **Compare:** Explore alternative products when suitable information is available.
5. **Optimise:** Review multiple products through Smart Grocery Basket.
6. **Decide:** Use the available information to make a more informed purchasing choice.

Our goal is to help users look beyond packaging claims and understand the information that matters when choosing what to buy.

---

## ✨ Features

### 📷 1. Product Scanning and Lookup

NutriLens provides a product-discovery workflow using barcode scanning and product lookup.

Using the Open Food Facts API, the application can retrieve available information such as:

- Product name and brand
- Ingredients
- Nutritional values
- Allergen information
- Other available product details

Product information depends on database coverage and the completeness of the returned data.

### 📝 2. Food Label Image Processing

When barcode lookup is insufficient, NutriLens provides a workflow for working with product-label images.

The label extraction workflow is intended to help obtain information from nutritional and ingredient labels.

Extracted information may contain errors, so users should verify important values against the physical packaging.

### 🧠 3. Nutritional Assessment

NutriLens organises available product information into an assessment designed to make potential concerns easier to understand.

The assessment can consider available information about:

- Sugar
- Carbohydrates
- Sodium
- Saturated fat
- Ingredients
- Allergens
- Other available nutritional information

The usefulness of an assessment depends on the information available for the product.

Missing nutritional values should not be interpreted as zero or as proof that a product has no nutritional concerns.

### 🔍 4. Product Alternatives

Finding a product is only the first step. Consumers may also want to explore other options.

NutriLens provides an alternatives workflow that helps users investigate potential substitutes when suitable product information is available.

The objective is to make product comparison easier and help users consider alternatives that may better suit their needs.

### 🛒 5. Smart Grocery Basket

**Smart Grocery Basket extends food analysis beyond individual products.**

Users can collect multiple products in a grocery basket and review their selections together.

The workflow is designed to help users:

- Organise multiple selected products
- Review potential nutritional concerns across their basket
- Identify products that may deserve closer attention
- Explore possible substitutions
- Compare basket options when supported by available product data

Instead of considering every product in isolation, NutriLens helps users think about their overall grocery-shopping decisions.

### 👤 6. User Accounts and Data Persistence

NutriLens integrates Supabase for authentication and database-backed functionality when configured.

The application also supports local storage for applicable local and fallback experiences.

---

## 🏗️ How NutriLens Works

```text
          USER
            |
            v
   SCAN OR SEARCH PRODUCT
            |
            v
    PRODUCT DATA RETRIEVAL
            |
       +----+----+
       |         |
       v         v
   BARCODE    LABEL IMAGE
    LOOKUP    EXTRACTION
       |         |
       +----+----+
            |
            v
   AVAILABLE PRODUCT DATA
            |
            v
    PRODUCT ASSESSMENT
            |
       +----+----+
       |         |
       v         v
 PRODUCT      PRODUCT
 RESULTS     ALTERNATIVES
       |         |
       +----+----+
            |
            v
    SMART GROCERY BASKET
            |
            v
    REVIEW AND COMPARE
            |
            v
   INFORMED FOOD CHOICES
