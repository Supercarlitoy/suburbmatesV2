# 🎯 SEO Landing Pages Strategy & Roadmap

**Goal**: Move from parameterized search (`/search?category=X&suburb=Y`) to static landing pages for maximum SEO impact.

## 🚀 Current Implementation (Phase 1 - COMPLETED)

### ✅ What's Live Now:
- **Business profiles**: `/business/[slug]` - High priority indexing
- **Clean search page**: `/search` - Indexed for discovery
- **Parameterized search**: `/search?category=X&suburb=Y` - `noindex,follow` (crawlable but not indexed)
- **Dynamic meta tags**: Robots and canonical tags based on search parameters
- **Optimized sitemap**: Only business profiles + core static pages

### ✅ Current SEO Strategy:
```
✅ INDEX: /business/mikes-plumbing-hawthorn (high-value content)
✅ INDEX: /search (clean discovery page)
❌ NOINDEX: /search?category=plumbing (avoid parameter sprawl)
❌ NOINDEX: /search?suburb=hawthorn (avoid duplicate content)
```

## 📋 Phase 2: Static Landing Pages (Future Enhancement)

### 🎯 Priority Landing Pages to Build:

#### **Category Landing Pages** (`/category/[slug]`)
```
/category/plumbing          - "Plumbers in Melbourne"
/category/cafe-restaurant   - "Cafes & Restaurants in Melbourne"  
/category/hair-beauty      - "Hair & Beauty Salons in Melbourne"
/category/automotive       - "Automotive Services in Melbourne"
/category/real-estate      - "Real Estate Agents in Melbourne"
```

#### **Suburb Landing Pages** (`/suburb/[slug]`)
```
/suburb/hawthorn           - "Businesses in Hawthorn, Melbourne"
/suburb/richmond           - "Businesses in Richmond, Melbourne"
/suburb/fitzroy            - "Businesses in Fitzroy, Melbourne"  
/suburb/melbourne          - "Businesses in Melbourne CBD"
/suburb/st-kilda           - "Businesses in St Kilda, Melbourne"
```

#### **Combined Landing Pages** (`/category/[category]/[suburb]`)
Top 50 highest-volume combinations:
```
/category/plumbing/hawthorn        - "Plumbers in Hawthorn"
/category/cafe-restaurant/fitzroy  - "Cafes in Fitzroy"
/category/real-estate/richmond     - "Real Estate in Richmond"
```

## 🛠️ Implementation Plan

### Phase 2.1: Category Pages (Estimated: 8-12 hours)

#### **File Structure**:
```
app/
  category/
    [slug]/
      page.tsx          # Dynamic category page
      layout.tsx        # Category-specific metadata
    page.tsx            # Category index page
```

#### **Key Features**:
- **SEO-optimized content**: Rich copy about each business category
- **Business listings**: Show relevant businesses in that category
- **Melbourne context**: Location-specific content and imagery
- **Internal linking**: Link to suburb combinations
- **Schema markup**: LocalBusiness structured data

#### **Example URL & Content**:
```
URL: /category/plumbing
Title: "Plumbers in Melbourne | SuburbMates"
H1: "Find Trusted Plumbers in Melbourne"
Content: Rich copy about plumbing services, Melbourne context, business listings
```

### Phase 2.2: Suburb Pages (Estimated: 6-8 hours)

#### **File Structure**:
```
app/
  suburb/
    [slug]/
      page.tsx          # Dynamic suburb page  
      layout.tsx        # Suburb-specific metadata
    page.tsx            # Suburb index page
```

#### **Key Features**:
- **Local SEO content**: Rich copy about each Melbourne suburb
- **Business directory**: All businesses in that suburb
- **Local landmarks**: Mention local attractions, transport
- **Cross-linking**: Link to category combinations

### Phase 2.3: Combined Pages (Estimated: 4-6 hours)

#### **URL Structure**:
```
/category/plumbing/hawthorn
/category/cafe-restaurant/fitzroy
/category/real-estate/richmond
```

#### **Implementation**:
- Generate for top 50 combinations based on search volume
- Rich, unique content for each combination
- Avoid thin content by focusing on high-volume combinations only

## 📊 Technical Implementation

### **Dynamic Route Generation**:
```typescript
// app/category/[slug]/page.tsx
export async function generateStaticParams() {
  // Generate paths for all categories in BUSINESS_CATEGORIES
  return BUSINESS_CATEGORIES.map(cat => ({ slug: cat.id }));
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const category = getCategoryById(params.slug);
  return {
    title: `${category.name} in Melbourne | SuburbMates`,
    description: `Find trusted ${category.name.toLowerCase()} businesses in Melbourne. ${category.description}`,
    canonical: `/category/${params.slug}`,
  };
}
```

### **Content Strategy**:
```typescript
const categoryContent = {
  hero: `Find the best ${category.name} in Melbourne`,
  description: `Discover trusted ${category.name} businesses across Melbourne...`,
  localContext: `Melbourne's ${category.name} industry is thriving...`,
  businessListings: businesses, // Filtered by category
  relatedSuburbs: suburbs, // Popular suburbs for this category
};
```

## 🔄 Migration Strategy

### **When Landing Pages Go Live**:

1. **Update robots.txt**:
   ```
   Allow: /category/
   Allow: /suburb/
   ```

2. **Update sitemap.ts**:
   ```typescript
   const categoryPages = BUSINESS_CATEGORIES.map(cat => ({
     url: `${baseUrl}/category/${cat.id}`,
     priority: 0.8,
     changeFrequency: 'weekly',
   }));
   ```

3. **Add canonical redirects**:
   ```typescript
   // /search?category=plumbing → /category/plumbing
   if (category && !suburb && !query) {
     canonicalUrl = `${baseUrl}/category/${category}`;
   }
   ```

4. **Internal linking**:
   - Header/footer navigation to category pages
   - Cross-links between related categories and suburbs
   - Breadcrumbs for SEO authority flow

## 📈 Expected SEO Impact

### **Current State**:
- ✅ Business profiles indexed (high value)
- ❌ Search pages not indexed (missed opportunity)
- ⚠️ Parameterized URLs crawled but not indexed

### **After Landing Pages**:
- ✅ Business profiles indexed (high value)
- ✅ Category pages indexed (medium-high value)
- ✅ Suburb pages indexed (medium value)
- ✅ Top combinations indexed (medium value)
- ✅ Clean URL structure
- ✅ No parameter sprawl
- ✅ Rich, unique content for each page

## 🎯 Success Metrics

### **SEO KPIs to Track**:
- **Organic traffic increase**: Target 200-400% increase
- **Keyword rankings**: Track category + location keywords
- **Click-through rates**: Improved with better titles/descriptions
- **Page authority**: Landing pages should build domain authority
- **Internal linking**: Better authority distribution

### **Content Quality Indicators**:
- **Unique content per page**: No duplicate or thin content
- **User engagement**: Time on page, bounce rate
- **Conversion rate**: Visitors → business inquiries
- **Local search visibility**: "plumbers near me" type queries

## 🚧 Development Priority

**Recommended Order**:
1. **Category pages first** (higher search volume, easier to rank)
2. **Top 10 suburbs** (Hawthorn, Richmond, Fitzroy, etc.)
3. **Top 50 combinations** (data-driven approach)

**Time Investment**: 18-26 hours total for complete implementation
**Expected ROI**: 200-400% organic traffic increase within 3-6 months