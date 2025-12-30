# Architecture Documentation - Factory Operations Intelligence

## System Overview

Factory Operations Intelligence is a multi-tenant, role-based web application built on a three-tier architecture using modern web technologies and Supabase backend infrastructure.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                        │
│  ┌────────────┬────────────┬────────────┬────────────┐     │
│  │  React 18  │ TypeScript │ Tailwind   │  Recharts  │     │
│  │    UI      │   Types    │   CSS      │   Charts   │     │
│  └────────────┴────────────┴────────────┴────────────┘     │
│                                                              │
│  Component Structure:                                        │
│  - App.tsx (Main router & auth state)                      │
│  - Authentication (Login, Signup)                           │
│  - Dashboard (KPIs, charts, alerts)                        │
│  - Master Data (Products, Materials, BOM)                  │
│  - Operations (Production, Inventory, Downtime)            │
│  - Analytics (Cost Reports, Alerts)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  HTTPS/JSON API    │
                    │  Bearer Auth Token │
                    └─────────┬──────────┘
                              │
┌─────────────────────────────▼─────────────────────────────────┐
│                      SERVER LAYER (Hono)                       │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Edge Function (Deno Runtime)                         │    │
│  │  - CORS & Logger Middleware                          │    │
│  │  - JWT Token Verification                            │    │
│  │  - Role-Based Access Control                         │    │
│  │  - Business Logic Processing                         │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  API Endpoints:                                                │
│  - /signup, /login, /me (Authentication)                     │
│  - /products, /raw-materials, /bom (Master Data)             │
│  - /production-orders, /inventory-transactions (Operations)  │
│  - /downtime-events, /alerts (Tracking)                      │
│  - /dashboard, /cost-reports (Analytics)                     │
│  - /seed-data (Testing)                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   Supabase Auth    │
                    │   (JWT Tokens)     │
                    └─────────┬──────────┘
                              │
┌─────────────────────────────▼─────────────────────────────────┐
│                      DATABASE LAYER                            │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  PostgreSQL (via KV Store)                            │    │
│  │  - Key-Value data structure                          │    │
│  │  - Factory-level partitioning                        │    │
│  │  - Atomic operations                                 │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                │
│  Data Collections:                                             │
│  - users:{userId}                                             │
│  - factories:{factoryId}                                      │
│  - products:{factoryId}:{productId}                          │
│  - raw_materials:{factoryId}:{materialId}                    │
│  - bom:{factoryId}:{bomId}                                   │
│  - production_orders:{factoryId}:{orderId}                   │
│  - inventory_transactions:{factoryId}:{txId}                 │
│  - production_material_usage:{factoryId}:{usageId}           │
│  - downtime_events:{factoryId}:{eventId}                     │
│  - alerts:{factoryId}:{alertId}                              │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend Technologies
- **React 18.3+**: UI framework with hooks
- **TypeScript**: Type safety and IDE support
- **Tailwind CSS v4**: Utility-first styling
- **Recharts**: Data visualization library
- **Lucide React**: Icon library
- **Vite**: Build tool and dev server

### Backend Technologies
- **Supabase**: Backend-as-a-Service platform
- **Hono**: Lightweight web framework
- **Deno**: Secure JavaScript/TypeScript runtime
- **PostgreSQL**: Relational database (via KV abstraction)
- **Supabase Auth**: JWT-based authentication

### Infrastructure
- **Edge Functions**: Serverless compute on Supabase
- **Key-Value Store**: Data persistence layer
- **CORS**: Cross-origin resource sharing
- **HTTPS**: Secure transport layer

## Data Model

### Entity Relationships

```
┌──────────┐
│ Factory  │──┐
└──────────┘  │
              │
    ┌─────────┼─────────┬─────────┬─────────────┐
    │         │         │         │             │
    ▼         ▼         ▼         ▼             ▼
┌──────┐ ┌─────────┐ ┌─────┐ ┌─────────┐ ┌────────────┐
│ User │ │ Product │ │ BOM │ │Material │ │   Alert    │
└──────┘ └─────────┘ └─────┘ └─────────┘ └────────────┘
              │         │         │
              │         │         │
              └────┬────┴─────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ Production Order│
          └─────────────────┘
                   │
          ┌────────┴────────┐
          │                 │
          ▼                 ▼
┌──────────────────┐ ┌────────────┐
│ Material Usage   │ │ Inventory  │
│                  │ │Transaction │
└──────────────────┘ └────────────┘
          │                 │
          └────────┬────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ Downtime Event  │
          └─────────────────┘
```

### Key Relationships
- **Factory** → Users (1:many)
- **Factory** → Products (1:many)
- **Factory** → Raw Materials (1:many)
- **Product** + **Raw Material** → BOM (many:many)
- **Product** → Production Orders (1:many)
- **Production Order** → Material Usage (1:many)
- **Production Order** → Downtime Events (1:many)
- **Raw Material** → Inventory Transactions (1:many)

## Authentication Flow

```
┌──────────┐         ┌──────────┐         ┌─────────────┐
│  Client  │         │  Server  │         │   Supabase  │
│ (Browser)│         │  (Hono)  │         │    Auth     │
└────┬─────┘         └────┬─────┘         └──────┬──────┘
     │                    │                       │
     │ 1. POST /signup    │                       │
     ├───────────────────>│                       │
     │                    │ 2. createUser()       │
     │                    ├──────────────────────>│
     │                    │                       │
     │                    │ 3. User + JWT         │
     │                    │<──────────────────────┤
     │                    │                       │
     │                    │ 4. Store user in KV   │
     │                    │─┐                     │
     │                    │ │                     │
     │                    │<┘                     │
     │                    │                       │
     │ 5. Success + Token │                       │
     │<───────────────────┤                       │
     │                    │                       │
     │ 6. Store token     │                       │
     │─┐ (localStorage)   │                       │
     │ │                  │                       │
     │<┘                  │                       │
     │                    │                       │
     │ 7. API calls with  │                       │
     │    Bearer token    │                       │
     ├───────────────────>│                       │
     │                    │ 8. Verify token       │
     │                    ├──────────────────────>│
     │                    │                       │
     │                    │ 9. User data          │
     │                    │<──────────────────────┤
     │                    │                       │
     │ 10. Response       │                       │
     │<───────────────────┤                       │
```

## Production Order Workflow

```
┌────────────────────────────────────────────────────────────┐
│ 1. CREATE PRODUCTION ORDER                                 │
│    - Select product                                        │
│    - Enter target quantity                                 │
│    - Set scheduled start                                   │
│    - Status: SCHEDULED                                     │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│ 2. START PRODUCTION                                        │
│    - Record actual_start timestamp                         │
│    - Status: IN_PROGRESS                                   │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│ 3. COMPLETE PRODUCTION                                     │
│    - Enter actual_produced_qty                             │
│    - Record actual_end timestamp                           │
│    - Status: COMPLETED                                     │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│ 4. AUTOMATIC MATERIAL CONSUMPTION                          │
│    ┌────────────────────────────────────────────────────┐ │
│    │ a. Retrieve BOM for product                        │ │
│    │ b. Calculate required materials:                   │ │
│    │    qty_required = BOM.qty_per_unit × actual_qty    │ │
│    │ c. Validate inventory availability                 │ │
│    │ d. Create consumption transactions (negative qty)  │ │
│    │ e. Create material usage records with costs        │ │
│    │ f. Update inventory totals                         │ │
│    │ g. Check reorder points                            │ │
│    │ h. Generate low stock alerts                       │ │
│    └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

## Cost Calculation Logic

```
┌─────────────────────────────────────────────────────────────┐
│ MATERIAL COST CALCULATION                                    │
│                                                              │
│ For each production order:                                   │
│                                                              │
│ 1. Get all material usage records                          │
│    material_usage = SELECT * WHERE order_id = X             │
│                                                              │
│ 2. Calculate total material cost                            │
│    total_cost = Σ(qty_used × unit_cost)                     │
│                                                              │
│ 3. Calculate cost per unit                                  │
│    cost_per_unit = total_cost / actual_produced_qty         │
│                                                              │
│ 4. Calculate revenue                                        │
│    revenue = actual_produced_qty × selling_price            │
│                                                              │
│ 5. Calculate profit                                         │
│    profit = revenue - total_cost                            │
│                                                              │
│ 6. Calculate margin percentage                              │
│    margin% = (profit / revenue) × 100                       │
│                                                              │
│ 7. Flag negative margins as alerts                          │
│    IF margin% < 0 THEN create_alert()                       │
└─────────────────────────────────────────────────────────────┘
```

## Multi-Tenancy Implementation

### Data Isolation Strategy

```
Key Pattern: {entity_type}:{factory_id}:{entity_id}

Examples:
- products:f123:p456      (Product p456 in factory f123)
- bom:f123:b789          (BOM entry b789 in factory f123)
- inventory_transactions:f123:t999

Isolation Enforcement:
1. All API endpoints extract factory_id from authenticated user
2. All queries filter by factory_id
3. Prefix-based queries ensure tenant isolation
4. Cross-tenant access prevented at data layer
```

### Role-Based Access Control (RBAC)

```
┌─────────────┬───────┬──────────────┬────────────┬────────────┐
│  Resource   │ Owner │ Plant Mgr    │ Supervisor │ Accountant │
├─────────────┼───────┼──────────────┼────────────┼────────────┤
│ Dashboard   │  R    │      R       │     R      │     R      │
│ Products    │ CRUD  │     CRU      │     -      │     -      │
│ Materials   │ CRUD  │     CRU      │     -      │     -      │
│ BOM         │ CRUD  │     CRU      │     -      │     -      │
│ Production  │ CRUD  │     CRU      │    CRU     │     -      │
│ Inventory   │ CRUD  │     CRU      │    CRU     │     R      │
│ Downtime    │ CRUD  │     CRU      │    CRU     │     -      │
│ Cost Rpts   │  R    │      R       │     -      │     R      │
│ Alerts      │  RD   │      RD      │     RD     │     RD     │
│ Seed Data   │  C    │      -       │     -      │     -      │
└─────────────┴───────┴──────────────┴────────────┴────────────┘

R = Read, C = Create, U = Update, D = Delete
```

## API Request/Response Flow

### Example: Complete Production Order

```
REQUEST:
PUT /make-server-102b7931/production-orders/{id}/complete
Headers:
  Authorization: Bearer {jwt_token}
  Content-Type: application/json
Body:
  {
    "actual_produced_qty": 50
  }

PROCESSING:
1. Verify JWT token → Extract user_id
2. Get user from KV → Extract factory_id and role
3. Check authorization → Owner/Manager/Supervisor?
4. Get production order → Validate existence
5. Get BOM entries → For order's product
6. Calculate material requirements
7. Get inventory transactions → Calculate stock levels
8. Validate sufficient stock
9. Create consumption transactions
10. Create material usage records
11. Update order status
12. Check reorder points
13. Create alerts if needed

RESPONSE:
{
  "success": true,
  "order": {
    "id": "...",
    "status": "completed",
    "actual_produced_qty": 50,
    "actual_end": "2024-01-15T10:30:00Z",
    ...
  }
}
```

## Performance Considerations

### Optimization Strategies

1. **Client-Side State Management**
   - Local state for UI interactions
   - Server state fetched on demand
   - Optimistic UI updates

2. **Data Fetching**
   - Parallel requests with Promise.all()
   - Loading states to improve UX
   - Error boundaries for resilience

3. **Database Queries**
   - Prefix-based queries for tenant isolation
   - Indexed keys for fast lookups
   - Batch operations where possible

4. **Caching**
   - Browser localStorage for auth tokens
   - Component-level caching
   - Invalidation on mutations

## Security Architecture

### Defense in Depth

```
Layer 1: Network
- HTTPS only
- CORS configuration
- Rate limiting (Supabase)

Layer 2: Authentication
- JWT tokens with expiration
- Secure password hashing (bcrypt)
- Session management

Layer 3: Authorization
- Role-based access control
- Factory-level isolation
- Endpoint-level permissions

Layer 4: Data Validation
- Input sanitization
- Type checking
- Business rule validation

Layer 5: Error Handling
- No sensitive data in errors
- Detailed logs server-side
- Generic messages client-side
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CDN / Edge Network                    │
│  ┌────────────────────────────────────────────────┐    │
│  │         Static Frontend Assets                 │    │
│  │  (HTML, CSS, JS, React bundles)               │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Supabase Platform                       │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │  Edge Functions  │  │   Auth Service    │           │
│  │  (Deno Runtime)  │  │   (JWT Tokens)    │           │
│  └──────────────────┘  └──────────────────┘           │
│  ┌──────────────────────────────────────────┐         │
│  │         PostgreSQL Database               │         │
│  │         (KV Store Abstraction)            │         │
│  └──────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

## Monitoring & Observability

### Key Metrics to Track

1. **Performance Metrics**
   - API response times
   - Database query times
   - Frontend load times
   - Time to interactive (TTI)

2. **Business Metrics**
   - Active factories
   - Production orders created
   - Inventory transactions
   - Cost report views
   - Alert generation rate

3. **Error Metrics**
   - 4xx/5xx error rates
   - Failed authentications
   - Validation errors
   - Database errors

4. **User Metrics**
   - Daily/monthly active users
   - Feature usage by role
   - Session duration
   - User retention

### Logging Strategy

```
Server Logs:
- All API requests (via logger middleware)
- Authentication attempts
- Authorization failures
- Database operations
- Business logic errors
- Alert generation events

Client Logs:
- API call failures
- Validation errors
- Navigation events
- User actions (production, inventory changes)
```

## Scalability Considerations

### Horizontal Scaling
- Stateless edge functions scale automatically
- Database connection pooling
- CDN for static assets

### Vertical Scaling
- Database optimization
- Query performance tuning
- Index optimization

### Data Growth Strategy
- Archival of old production orders
- Transaction log cleanup
- Alert expiration policies

## Testing Strategy

### Unit Tests
- Business logic functions
- Cost calculations
- Validation rules
- Utility functions

### Integration Tests
- API endpoints
- Database operations
- Authentication flow
- Authorization checks

### End-to-End Tests
- User workflows
- Production order lifecycle
- Inventory consumption
- Cost report generation

### Manual Testing
- Use TEST_CHECKLIST.md
- Role-based access verification
- UI/UX validation
- Cross-browser testing

## Maintenance & Support

### Regular Maintenance Tasks
1. Monitor error logs
2. Review performance metrics
3. Update dependencies
4. Backup database
5. Review security advisories
6. Test disaster recovery

### Support Documentation
- README.md: Full documentation
- QUICKSTART.md: Getting started guide
- TEST_CHECKLIST.md: Validation checklist
- ARCHITECTURE.md: This document

---

## Conclusion

This architecture provides:
- ✅ Scalable multi-tenant infrastructure
- ✅ Secure authentication and authorization
- ✅ Comprehensive business logic
- ✅ Real-time data updates
- ✅ Role-based access control
- ✅ Production-ready foundation

The application is designed for extensibility, allowing easy addition of new features while maintaining security and performance standards.
