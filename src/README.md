# Factory Operations Intelligence

A comprehensive multi-tenant web application for managing production, inventory, raw materials, cost accounting, and operational dashboards for small factories.

## Features

### 1. Authentication & Multi-Tenancy
- **User Registration**: Sign up with email, password, and factory name
- **Secure Login**: Session-based authentication via Supabase
- **Role-Based Access Control**:
  - **Owner**: Full access to all features including data deletion
  - **Plant Manager**: Manage products, materials, BOM, and production
  - **Supervisor**: Create and manage production orders, log downtime
  - **Accountant**: View cost reports and financial data
- **Tenant Isolation**: Each factory's data is completely isolated

### 2. Master Data Management

#### Products (Finished Goods)
- Create and manage product catalog
- Define selling price and units
- Track production history
- Edit/delete capabilities

#### Raw Materials
- Manage inventory items
- Set reorder points for automatic alerts
- Track multiple units (kg, pieces, liters, meters, ml)
- Edit/delete capabilities

#### Bill of Materials (BOM)
- Link products to required raw materials
- Define quantity per unit for each material
- Support complex multi-material recipes
- Easy-to-use BOM editor

### 3. Production Management

#### Production Orders
- Create scheduled production orders
- Three-stage workflow:
  - **Scheduled**: Planned production
  - **In Progress**: Active production
  - **Completed**: Finished with automatic material consumption
- Wizard-based creation process
- Start/complete actions with validation

#### Automatic Material Consumption
- When completing a production order:
  - Calculates required materials from BOM × actual quantity
  - Validates sufficient inventory availability
  - Creates consumption transactions automatically
  - Updates inventory in real-time
  - Records material usage with costs

### 4. Inventory Management

#### Current Stock Tracking
- Real-time stock levels for all raw materials
- Average unit cost calculation (weighted)
- Total inventory value
- Low stock alerts

#### Transaction History
- Purchase transactions
- Consumption (linked to production orders)
- Manual adjustments
- Full audit trail with timestamps

#### Stock Alerts
- Automatic alerts when stock falls below reorder point
- Visual indicators for low stock items
- Alerts persist until dismissed

### 5. Cost Accounting & Analytics

#### Cost per Unit Calculation
- Material costs automatically calculated from BOM
- Cost tracking per production order
- Historical cost trends

#### Profit Margin Analysis
- Revenue vs. cost comparison
- Margin percentage calculation
- Negative margin alerts
- Product profitability insights

#### Cost Reports
- Detailed production cost breakdown
- Revenue and profit tracking
- Visual charts and graphs
- Per-order and aggregate analytics

### 6. Downtime Tracking

#### Downtime Events
- Log production interruptions
- Track downtime reasons:
  - Machine breakdown
  - Power outage
  - Material shortage
  - Scheduled maintenance
  - Quality issues
  - Staff shortage
- Duration calculation
- Cost estimation ($100/hour default)

### 7. Dashboard & KPIs

#### Real-Time Metrics
- Today's production summary
- Low stock item count
- Total production costs
- Downtime costs
- Completed order count

#### Visual Analytics
- Bar charts for cost analysis
- Recent order status
- Stock alert notifications
- Production trends

### 8. Sample Data Generator

For testing and demonstration:
- 3 products (Widget A, B, C)
- 10 raw materials (steel, aluminum, plastic, etc.)
- Complete BOM relationships
- Initial inventory with realistic costs
- Sample production orders
- Ready-to-use test data (Owner only)

## Technology Stack

### Frontend
- **React 18**: Modern UI framework
- **TypeScript**: Type-safe development
- **Tailwind CSS v4**: Responsive styling
- **Recharts**: Data visualization
- **Lucide React**: Icon library

### Backend
- **Supabase**: Database and authentication
- **Hono**: Edge function web server
- **Deno**: Server runtime
- **PostgreSQL**: Database (via KV store)

### Architecture
- **Three-tier architecture**: Frontend → Server → Database
- **RESTful API**: Clean endpoint design
- **Multi-tenant isolation**: Factory-level data separation
- **Role-based security**: Endpoint-level authorization

## Getting Started

### 1. Sign Up
- Click "Sign Up" on the login screen
- Enter your name, factory name, email, and password
- You'll be registered as the Owner role
- Automatically logged in after signup

### 2. Create Sample Data (Recommended)
- On the Dashboard, click "Create Sample Data" (Owner only)
- This generates:
  - 10 raw materials with initial stock
  - 3 products with selling prices
  - Bill of Materials relationships
  - Sample production orders

### 3. Set Up Your Factory

#### Add Products
1. Navigate to "Products"
2. Click "Add Product"
3. Enter name, unit, and selling price
4. Save

#### Add Raw Materials
1. Navigate to "Raw Materials"
2. Click "Add Raw Material"
3. Enter name, unit, and reorder point
4. Save

#### Define BOM
1. Navigate to "Bill of Materials"
2. Click "Add BOM Entry"
3. Select product and raw material
4. Enter quantity per unit
5. Repeat for all materials needed

#### Add Initial Inventory
1. Navigate to "Inventory"
2. Click "Add Transaction"
3. Select raw material
4. Choose "Purchase" type
5. Enter quantity and unit cost
6. Save

### 4. Create Production Orders

1. Navigate to "Production Orders"
2. Click "New Order"
3. Select product
4. Enter target quantity
5. Set scheduled start time
6. Save

### 5. Execute Production

#### Start Production
- Click the Play icon on a scheduled order
- Status changes to "In Progress"
- Actual start time recorded

#### Complete Production
- Click the CheckCircle icon on in-progress order
- Enter actual produced quantity
- System automatically:
  - Validates inventory availability
  - Consumes raw materials
  - Creates usage records
  - Updates inventory
  - Generates low stock alerts
  - Calculates costs

### 6. Monitor Operations

#### Dashboard
- View today's production
- Check low stock alerts
- Monitor costs
- Track downtime

#### Cost Reports
- Analyze profit margins
- Compare cost vs. selling price
- Identify negative margins
- Review production efficiency

#### Alerts
- Check system notifications
- Address low stock items
- Dismiss resolved alerts

## API Endpoints

### Authentication
- `POST /make-server-102b7931/signup` - Register new user
- `POST /make-server-102b7931/login` - User login
- `GET /make-server-102b7931/me` - Get current user

### Products
- `GET /make-server-102b7931/products` - List products
- `POST /make-server-102b7931/products` - Create product
- `PUT /make-server-102b7931/products/:id` - Update product
- `DELETE /make-server-102b7931/products/:id` - Delete product

### Raw Materials
- `GET /make-server-102b7931/raw-materials` - List materials
- `POST /make-server-102b7931/raw-materials` - Create material
- `PUT /make-server-102b7931/raw-materials/:id` - Update material
- `DELETE /make-server-102b7931/raw-materials/:id` - Delete material

### Bill of Materials
- `GET /make-server-102b7931/bom` - List BOM entries
- `GET /make-server-102b7931/bom/product/:productId` - Get BOM for product
- `POST /make-server-102b7931/bom` - Create BOM entry
- `DELETE /make-server-102b7931/bom/:id` - Delete BOM entry

### Production Orders
- `GET /make-server-102b7931/production-orders` - List orders
- `POST /make-server-102b7931/production-orders` - Create order
- `PUT /make-server-102b7931/production-orders/:id/start` - Start order
- `PUT /make-server-102b7931/production-orders/:id/complete` - Complete order

### Inventory
- `GET /make-server-102b7931/inventory` - Get current stock levels
- `GET /make-server-102b7931/inventory-transactions` - List transactions
- `POST /make-server-102b7931/inventory-transactions` - Create transaction

### Downtime
- `GET /make-server-102b7931/downtime-events` - List downtime events
- `POST /make-server-102b7931/downtime-events` - Log downtime

### Analytics
- `GET /make-server-102b7931/dashboard` - Dashboard data
- `GET /make-server-102b7931/cost-reports` - Cost analysis
- `GET /make-server-102b7931/alerts` - System alerts
- `DELETE /make-server-102b7931/alerts/:id` - Dismiss alert

### Utilities
- `POST /make-server-102b7931/seed-data` - Generate sample data (Owner only)

## Business Logic

### Inventory Consumption Flow
1. User completes production order with actual quantity
2. System retrieves BOM for the product
3. Calculates required materials (BOM qty × actual quantity)
4. Validates current inventory levels
5. If insufficient stock, rejects with error
6. Creates consumption transactions (negative qty)
7. Creates production material usage records
8. Updates inventory totals
9. Checks reorder points
10. Generates low stock alerts if needed

### Cost Calculation
- **Material Cost**: Sum of (qty_used × unit_cost) for all materials
- **Cost per Unit**: Material Cost ÷ actual_produced_qty
- **Revenue**: actual_produced_qty × selling_price
- **Profit**: Revenue - Material Cost
- **Margin %**: (Profit ÷ Revenue) × 100

### Downtime Cost
- **Duration**: end_time - start_time (in hours)
- **Cost**: Duration × $100/hour (configurable rate)

## Role Permissions

| Feature | Owner | Plant Manager | Supervisor | Accountant |
|---------|-------|---------------|------------|------------|
| Dashboard | ✓ | ✓ | ✓ | ✓ |
| View Products | ✓ | ✓ | - | - |
| Create/Edit Products | ✓ | ✓ | - | - |
| Delete Products | ✓ | - | - | - |
| View Raw Materials | ✓ | ✓ | - | - |
| Create/Edit Materials | ✓ | ✓ | - | - |
| Delete Materials | ✓ | - | - | - |
| View BOM | ✓ | ✓ | - | - |
| Edit BOM | ✓ | ✓ | - | - |
| View Production Orders | ✓ | ✓ | ✓ | - |
| Create Production Orders | ✓ | ✓ | ✓ | - |
| Start/Complete Orders | ✓ | ✓ | ✓ | - |
| View Inventory | ✓ | ✓ | ✓ | ✓ |
| Add Inventory Transactions | ✓ | ✓ | ✓ | - |
| View Downtime | ✓ | ✓ | ✓ | - |
| Log Downtime | ✓ | ✓ | ✓ | - |
| View Cost Reports | ✓ | ✓ | - | ✓ |
| View Alerts | ✓ | ✓ | ✓ | ✓ |
| Create Sample Data | ✓ | - | - | - |

## Data Models

### Factory
- id, name, currency, timezone, created_at

### User
- id, email, name, factory_id, role, created_at

### Product
- id, name, unit, selling_price, factory_id, created_at

### RawMaterial
- id, name, unit, reorder_point, factory_id, created_at

### BillOfMaterials
- id, product_id, raw_material_id, qty_per_unit, factory_id, created_at

### ProductionOrder
- id, product_id, target_qty, actual_produced_qty, status, scheduled_start, actual_start, actual_end, factory_id, created_by, created_at

### ProductionMaterialUsage
- id, production_order_id, raw_material_id, qty_used, unit_cost, factory_id, created_at

### InventoryTransaction
- id, raw_material_id, tx_type, qty, unit_cost, related_production_order_id, factory_id, created_by, timestamp

### DowntimeEvent
- id, production_order_id, reason, start_time, end_time, factory_id, created_by, created_at

### Alert
- id, type, message, severity, factory_id, created_at

## Security

- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Role-based access control on all endpoints
- **Tenant Isolation**: Factory ID enforced on all queries
- **Data Validation**: Input validation on all endpoints
- **Error Handling**: Detailed error messages for debugging

## Future Enhancements

Potential features for v2:
- Labor cost tracking
- Overhead allocation
- Work-in-progress (WIP) tracking
- Quality control checkpoints
- Batch/lot tracking
- Equipment maintenance scheduling
- Supplier management
- Purchase order creation
- CSV/Excel export for reports
- Email notifications for alerts
- Real-time dashboard updates
- Mobile app
- Multi-language support
- Custom report builder

## Support

This is a prototype/MVP application. For production use, consider:
- Adding comprehensive error handling
- Implementing data backup strategies
- Setting up monitoring and logging
- Adding unit and integration tests
- Implementing rate limiting
- Adding audit logs
- Setting up CI/CD pipelines
- Configuring production-grade security

## License

This application is provided as-is for demonstration and prototyping purposes.
