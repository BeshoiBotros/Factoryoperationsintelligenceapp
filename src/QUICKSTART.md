# Quick Start Guide - Factory Operations Intelligence

Get up and running in 5 minutes!

## Step 1: Create Your Account (30 seconds)

1. Open the application
2. Click **"Sign Up"**
3. Fill in the form:
   - **Full Name**: Your name (e.g., "John Smith")
   - **Factory Name**: Your company name (e.g., "Acme Manufacturing")
   - **Email**: Your email address
   - **Password**: At least 6 characters
4. Click **"Create Account"**
5. You'll be automatically logged in as the **Owner**

## Step 2: Generate Sample Data (10 seconds)

1. You'll land on the **Dashboard**
2. Click the green **"Create Sample Data"** button in the top right
3. Click **"OK"** to confirm
4. Wait for the success message

**What this creates:**
- ✅ 10 raw materials (steel, aluminum, plastic, etc.) with initial stock
- ✅ 3 products (Widget A, B, C) with selling prices
- ✅ Complete Bill of Materials linking products to materials
- ✅ 4 sample production orders (3 completed, 1 scheduled)

## Step 3: Explore the Dashboard (1 minute)

The dashboard now shows:
- **Today's Production**: Number of units produced
- **Low Stock Items**: Materials below reorder point
- **Production Cost**: Total material costs
- **Downtime Cost**: Cost of production interruptions
- **Recent Orders**: Latest production activity
- **Stock Alerts**: Low inventory warnings

## Step 4: Navigate the Application (2 minutes)

Use the sidebar to explore:

### 📦 Products
View the 3 sample products with their selling prices:
- Widget A - $45.00
- Widget B - $75.00
- Widget C - $120.00

### 🔧 Raw Materials
See 10 materials with reorder points:
- Steel Sheet, Aluminum Rod, Plastic Pellets, etc.

### 📋 Bill of Materials
Check how products are assembled:
- Each product lists required materials
- Quantities per unit are defined

### 🏭 Production Orders
View production workflow:
- **Scheduled** orders ready to start
- **Completed** orders with actual quantities
- Try starting a scheduled order!

### 📊 Inventory
Current stock levels:
- Total quantity for each material
- Average unit cost
- Total inventory value
- Low stock indicators

### ⏱️ Downtime Log
Track production interruptions:
- Empty for now - try logging downtime!

### 💰 Cost Reports
Financial analysis:
- Cost per unit for each product
- Profit margins
- Revenue vs. costs

### 🔔 Alerts
System notifications:
- Low stock alerts (if any)
- Critical warnings

## Step 5: Try Creating a Production Order (2 minutes)

### Create a New Order
1. Go to **"Production Orders"**
2. Click **"New Order"**
3. Select a product (e.g., "Widget A")
4. Enter target quantity (e.g., "50")
5. Set scheduled start time (tomorrow)
6. Click **"Create"**

### Start Production
1. Find your new order in the list
2. Click the **Play (▶)** icon
3. Status changes to **"In Progress"**

### Complete Production
1. Click the **CheckCircle (✓)** icon
2. Enter actual produced quantity (e.g., "48")
3. Click **"Complete Order"**

**What happens automatically:**
- ✅ System calculates required materials from BOM
- ✅ Checks if you have enough inventory
- ✅ Deducts materials from stock
- ✅ Records material usage with costs
- ✅ Updates inventory totals
- ✅ Generates alerts if stock is low
- ✅ Calculates cost per unit

### View the Results
1. Go to **"Inventory"** - see reduced stock levels
2. Go to **"Cost Reports"** - see the new order's profitability
3. Go to **"Alerts"** - check for low stock warnings

## Step 6: Try Other Features

### Log Downtime
1. Go to **"Downtime Log"**
2. Click **"Log Downtime"**
3. Select a production order
4. Choose a reason (e.g., "Machine Breakdown")
5. Set start and end times
6. See estimated cost ($100/hour)

### Add Inventory
1. Go to **"Inventory"**
2. Click **"Add Transaction"**
3. Select a raw material
4. Choose "Purchase"
5. Enter quantity and unit cost
6. Watch stock levels increase

### Check Profit Margins
1. Go to **"Cost Reports"**
2. View the detailed table
3. Look for:
   - Green margins = profitable
   - Red margins = losing money
4. Check the cost vs. price chart

## Understanding the Workflow

```
1. SET UP MASTER DATA
   ↓
   Products → Raw Materials → Bill of Materials

2. ADD INVENTORY
   ↓
   Purchase raw materials → Track stock levels

3. PLAN PRODUCTION
   ↓
   Create production orders → Schedule start times

4. EXECUTE PRODUCTION
   ↓
   Start order → Complete with actual quantity
   ↓
   System auto-consumes materials from inventory

5. MONITOR & ANALYZE
   ↓
   Dashboard → Cost Reports → Alerts
```

## Role-Based Access

Your account is an **Owner** with full access. You can:
- ✅ Create/edit/delete all data
- ✅ Generate sample data
- ✅ View all reports
- ✅ Manage production

Other roles have limited access:
- **Plant Manager**: Manage products, materials, BOM, production
- **Supervisor**: Create/manage production orders, log downtime
- **Accountant**: View cost reports and financial data only

## Tips for Success

1. **Always define BOM first** before creating production orders
2. **Add inventory** before completing production orders
3. **Monitor alerts** for low stock warnings
4. **Check cost reports** regularly to ensure profitability
5. **Log downtime** to track efficiency losses
6. **Use filters** to find specific products or materials

## Common Questions

**Q: Why can't I complete a production order?**
A: Check if you have enough raw materials in inventory. The system validates stock levels before allowing completion.

**Q: Where do I see material costs?**
A: Go to Inventory → the "Avg Unit Cost" column shows the weighted average cost.

**Q: How are costs calculated?**
A: Cost per unit = Total material cost ÷ Actual produced quantity

**Q: What creates alerts?**
A: Alerts are automatically generated when:
- Raw material stock falls below the reorder point
- Production orders consume inventory

**Q: Can I delete sample data?**
A: Yes! As Owner, you can delete individual products, materials, and orders. Or start fresh by creating a new account.

## Next Steps

1. **Customize** the sample products to match your factory
2. **Add** your own raw materials and costs
3. **Define** accurate BOMs for your products
4. **Update** reorder points based on your needs
5. **Track** real production data
6. **Analyze** costs and optimize profitability

## Need Help?

- Check the full **README.md** for detailed documentation
- Review the **API Endpoints** section for integration details
- Check the **Business Logic** section to understand automatic calculations

---

🎉 **You're ready to go!** Start managing your factory operations with real-time insights.
