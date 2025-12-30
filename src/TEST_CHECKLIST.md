# Test Checklist - Factory Operations Intelligence

Use this checklist to validate that all features are working correctly.

## ✅ Authentication & Authorization

### Sign Up
- [ ] Can create a new account with email, password, name, and factory name
- [ ] Password validation (minimum 6 characters)
- [ ] Automatically logged in after signup
- [ ] User role is set to "Owner"
- [ ] Factory is created with the provided name

### Login
- [ ] Can log in with valid credentials
- [ ] Error message shown for invalid credentials
- [ ] Session persists on page refresh
- [ ] User info displayed in sidebar

### Logout
- [ ] Logout button visible in sidebar
- [ ] Successfully logs out and returns to login screen
- [ ] Session cleared from localStorage

## ✅ Sample Data Generation

### Create Sample Data (Owner Only)
- [ ] "Create Sample Data" button visible on dashboard (Owner only)
- [ ] Confirmation dialog appears
- [ ] Success message shown
- [ ] Dashboard updates with new data
- [ ] 10 raw materials created
- [ ] 3 products created
- [ ] BOM entries created
- [ ] Initial inventory created
- [ ] Sample production orders created

## ✅ Products Management

### View Products
- [ ] Products list displays all products
- [ ] Shows name, unit, and selling price
- [ ] Empty state shown when no products exist

### Create Product
- [ ] "Add Product" button opens modal
- [ ] Form requires: name, unit, selling price
- [ ] Unit dropdown includes: pcs, kg, liter, box
- [ ] Product appears in list after creation
- [ ] Success confirmation

### Edit Product
- [ ] Edit icon visible for each product
- [ ] Modal opens with pre-filled data
- [ ] Changes saved successfully
- [ ] Updated product shown in list

### Delete Product (Owner Only)
- [ ] Delete icon visible only for Owner role
- [ ] Confirmation dialog shown
- [ ] Product removed from list
- [ ] Success confirmation

## ✅ Raw Materials Management

### View Raw Materials
- [ ] Materials list displays all materials
- [ ] Shows name, unit, and reorder point
- [ ] Empty state shown when no materials exist

### Create Raw Material
- [ ] "Add Raw Material" button opens modal
- [ ] Form requires: name, unit, reorder point
- [ ] Unit dropdown includes: kg, pcs, liter, m, ml
- [ ] Material appears in list after creation
- [ ] Help text explains reorder point

### Edit Raw Material
- [ ] Edit icon visible for each material
- [ ] Modal opens with pre-filled data
- [ ] Changes saved successfully
- [ ] Updated material shown in list

### Delete Raw Material (Owner Only)
- [ ] Delete icon visible only for Owner role
- [ ] Confirmation dialog shown
- [ ] Material removed from list

## ✅ Bill of Materials (BOM)

### View BOM
- [ ] BOM list shows all entries
- [ ] Displays product name, material name, quantity per unit
- [ ] Filter by product dropdown works
- [ ] Empty state when no BOM entries exist
- [ ] Warning shown if no products or materials exist

### Create BOM Entry
- [ ] "Add BOM Entry" button opens modal
- [ ] Product dropdown populated
- [ ] Material dropdown populated with unit info
- [ ] Quantity per unit accepts decimals
- [ ] Entry appears in list after creation
- [ ] Help text explains quantity per unit

### Delete BOM Entry
- [ ] Delete icon visible for each entry
- [ ] Confirmation dialog shown
- [ ] Entry removed from list

## ✅ Production Orders

### View Production Orders
- [ ] Orders list shows all orders
- [ ] Status badges color-coded (scheduled=gray, in_progress=blue, completed=green)
- [ ] Displays target qty, actual qty, scheduled start
- [ ] Empty state when no orders exist
- [ ] Warning shown if no products exist

### Create Production Order
- [ ] "New Order" button opens modal
- [ ] Product dropdown populated
- [ ] Target quantity accepts decimals
- [ ] Scheduled start accepts datetime
- [ ] Order appears in list with "scheduled" status
- [ ] Default scheduled time is tomorrow

### Start Production Order
- [ ] Play icon visible for scheduled orders
- [ ] Confirmation dialog shown
- [ ] Status changes to "in_progress"
- [ ] Actual start time recorded
- [ ] Icon changes to CheckCircle

### Complete Production Order
- [ ] CheckCircle icon visible for in_progress orders
- [ ] Modal shows product and target quantity
- [ ] Actual produced quantity pre-filled with target
- [ ] Help text about automatic material consumption
- [ ] Error if insufficient inventory
- [ ] Success message when completed
- [ ] Status changes to "completed"
- [ ] Materials consumed from inventory
- [ ] Material usage records created
- [ ] Low stock alerts generated

## ✅ Inventory Management

### View Inventory
- [ ] Inventory list shows all materials with stock
- [ ] Displays current stock, avg unit cost, total value
- [ ] Shows reorder point
- [ ] Status indicator (OK=green, Low Stock=red with warning icon)
- [ ] Empty state when no transactions exist

### Add Transaction
- [ ] "Add Transaction" button visible for authorized roles
- [ ] Material dropdown populated
- [ ] Transaction type dropdown (Purchase, Adjustment)
- [ ] Help text about consumption tracking
- [ ] Quantity accepts decimals
- [ ] Unit cost accepts decimals
- [ ] Transaction processed successfully
- [ ] Inventory totals updated
- [ ] Negative quantities allowed for adjustments

### Stock Calculations
- [ ] Total quantity = sum of all transactions
- [ ] Average unit cost calculated correctly
- [ ] Total value = qty × avg cost
- [ ] Negative quantities deduct from stock
- [ ] Low stock indicator when qty ≤ reorder point

## ✅ Downtime Log

### View Downtime Events
- [ ] Events list shows all downtime
- [ ] Displays product, reason, times, duration, cost
- [ ] Duration calculated correctly (hours + minutes)
- [ ] Cost calculated at $100/hour
- [ ] Empty state when no events exist
- [ ] Warning shown if no production orders exist

### Log Downtime
- [ ] "Log Downtime" button opens modal
- [ ] Production order dropdown populated
- [ ] Reason dropdown includes common reasons
- [ ] Start time accepts datetime
- [ ] End time accepts datetime
- [ ] Cost rate displayed ($100/hour)
- [ ] Event appears in list after creation
- [ ] Duration and cost calculated correctly

## ✅ Cost Reports

### View Cost Reports
- [ ] Reports list shows completed orders
- [ ] Summary cards show: total revenue, total cost, net profit, avg margin
- [ ] Chart displays cost vs selling price
- [ ] Table shows detailed breakdown per order
- [ ] Profit/loss color-coded (green=profit, red=loss)
- [ ] Margin percentage calculated correctly
- [ ] Empty state when no completed orders

### Cost Calculations
- [ ] Cost per unit = material cost ÷ produced qty
- [ ] Revenue = produced qty × selling price
- [ ] Profit = revenue - material cost
- [ ] Margin % = (profit ÷ revenue) × 100
- [ ] Negative margin alert shown for losses

### Negative Margin Alert
- [ ] Alert box shown when any margins are negative
- [ ] Lists products with negative margins
- [ ] Shows margin percentage for each

## ✅ Alerts & Notifications

### View Alerts
- [ ] Alerts list shows all active alerts
- [ ] Severity-based coloring (high=red, medium=yellow, low=blue)
- [ ] Alert type and message displayed
- [ ] Created timestamp shown
- [ ] Empty state with "All Clear" when no alerts
- [ ] Info box explains alert types

### Dismiss Alert
- [ ] X button visible on each alert
- [ ] Alert removed when dismissed
- [ ] Success confirmation

### Auto-Generated Alerts
- [ ] Low stock alerts created when completing production
- [ ] Alert created when stock ≤ reorder point
- [ ] Alert shows material name and stock levels

## ✅ Dashboard

### KPI Cards
- [ ] Today's Production shows correct count
- [ ] Low Stock Items count accurate
- [ ] Production Cost total correct
- [ ] Downtime Cost total correct
- [ ] Cards update when data changes

### Recent Orders Table
- [ ] Shows last 5 orders (newest first)
- [ ] Status badges displayed
- [ ] Target and actual quantities shown
- [ ] Empty state when no orders

### Stock Alerts
- [ ] Shows materials below reorder point
- [ ] Displays current stock vs reorder point
- [ ] Red warning icon shown
- [ ] Empty state when stock OK

### Cost Chart
- [ ] Bar chart shows production vs downtime costs
- [ ] Values formatted as currency
- [ ] Chart visible only when data exists

### Refresh Data
- [ ] Dashboard updates after actions in other screens
- [ ] Manual refresh possible

## ✅ Navigation & UI

### Sidebar
- [ ] Collapsible sidebar (toggle button works)
- [ ] User info displayed when expanded
- [ ] Role-based menu items shown
- [ ] Active screen highlighted
- [ ] Icons visible when collapsed
- [ ] Logout button at bottom

### Role-Based Access
- [ ] Owner sees all menu items
- [ ] Plant Manager sees: Dashboard, Products, Materials, BOM, Production, Inventory, Downtime, Cost Reports, Alerts
- [ ] Supervisor sees: Dashboard, Production, Inventory, Downtime, Alerts
- [ ] Accountant sees: Dashboard, Inventory, Cost Reports, Alerts
- [ ] Unauthorized screens not accessible

### Responsive Design
- [ ] Works on desktop (1920px+)
- [ ] Works on laptop (1366px)
- [ ] Works on tablet (768px)
- [ ] Sidebar adapts on mobile
- [ ] Tables scroll horizontally on small screens
- [ ] Modals are mobile-friendly

## ✅ Data Validation

### Required Fields
- [ ] Empty required fields show validation
- [ ] Forms can't be submitted with missing data
- [ ] Error messages are clear

### Number Fields
- [ ] Negative quantities rejected (except adjustments)
- [ ] Decimal values accepted where appropriate
- [ ] Currency formatted correctly (2 decimals)

### Date/Time Fields
- [ ] Date picker works
- [ ] Time picker works
- [ ] Past dates accepted
- [ ] Future dates accepted

## ✅ Business Logic

### Production Order Completion
- [ ] BOM retrieved correctly
- [ ] Required materials calculated (BOM × actual qty)
- [ ] Inventory validation works
- [ ] Error if insufficient stock
- [ ] Consumption transactions created
- [ ] Material usage records created
- [ ] Inventory totals updated
- [ ] Alerts generated for low stock

### Inventory Calculations
- [ ] Stock levels updated in real-time
- [ ] Average cost calculated correctly
- [ ] Consumption (negative qty) deducts stock
- [ ] Purchase adds stock
- [ ] Adjustment adds/removes stock

### Cost Accounting
- [ ] Material costs tracked per order
- [ ] Cost per unit calculated
- [ ] Profit margins accurate
- [ ] Negative margins detected

## ✅ Error Handling

### Network Errors
- [ ] Error messages shown for failed requests
- [ ] User can retry failed operations
- [ ] Loading states shown during requests

### Authorization Errors
- [ ] Unauthorized actions show error
- [ ] User redirected to login if session expired
- [ ] Clear error messages for permission issues

### Validation Errors
- [ ] Server-side validation errors shown
- [ ] Client-side validation prevents bad data
- [ ] Error messages are helpful

## ✅ Performance

### Loading States
- [ ] Loading indicators shown during data fetch
- [ ] Skeleton screens or spinners visible
- [ ] No blank screens during load

### Data Refresh
- [ ] Lists refresh after create/update/delete
- [ ] Dashboard updates after changes
- [ ] No stale data shown

## Test Results Summary

**Total Tests**: 200+
**Passed**: ___
**Failed**: ___
**Issues Found**: ___

---

## Common Issues & Solutions

### Can't complete production order
- **Check**: Do you have enough raw materials in inventory?
- **Check**: Is the BOM defined for this product?
- **Check**: Did you enter a valid actual quantity?

### Alerts not showing
- **Check**: Did you complete a production order that consumed stock?
- **Check**: Is any material below its reorder point?
- **Check**: Were alerts dismissed previously?

### Cost reports empty
- **Check**: Have you completed any production orders?
- **Check**: Are you logged in as Owner, Plant Manager, or Accountant?

### Can't delete items
- **Check**: Are you logged in as Owner?
- **Check**: Some items may be referenced by other data

### Dashboard shows zeros
- **Check**: Have you created sample data?
- **Check**: Have you completed any production orders today?

---

## Report Bugs

If you find issues:
1. Note the steps to reproduce
2. Check browser console for errors
3. Verify your role and permissions
4. Try refreshing the page
5. Log out and log back in
