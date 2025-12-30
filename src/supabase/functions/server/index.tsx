import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import * as bcrypt from 'npm:bcryptjs';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Helper to generate IDs
function generateId() {
  return crypto.randomUUID();
}

// Helper to get current timestamp
function now() {
  return new Date().toISOString();
}

// Middleware to verify user
async function verifyUser(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  
  // Get user data from KV
  const userData = await kv.get(`users:${user.id}`);
  return userData;
}

// ============ AUTH ENDPOINTS ============

app.post('/make-server-102b7931/signup', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, factory_name, role = 'Owner' } = body;

    if (!email || !password || !name) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true // Auto-confirm since email server not configured
    });

    if (authError) {
      console.log('Auth error during signup:', authError);
      return c.json({ error: authError.message }, 400);
    }

    const userId = authData.user.id;

    // Create or use factory
    let factoryId;
    if (role === 'Owner' && factory_name) {
      factoryId = generateId();
      const factory = {
        id: factoryId,
        name: factory_name,
        currency: 'USD',
        timezone: 'UTC',
        created_at: now()
      };
      await kv.set(`factories:${factoryId}`, factory);
    }

    // Create user record
    const user = {
      id: userId,
      email,
      name,
      factory_id: factoryId || null,
      role,
      created_at: now()
    };
    await kv.set(`users:${userId}`, user);

    return c.json({ success: true, user, factory_id: factoryId });
  } catch (error) {
    console.log('Error in signup:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/make-server-102b7931/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.log('Login error:', error);
      return c.json({ error: error.message }, 401);
    }

    const user = await kv.get(`users:${data.user.id}`);
    
    return c.json({ 
      success: true, 
      access_token: data.session.access_token,
      user 
    });
  } catch (error) {
    console.log('Error in login:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/make-server-102b7931/me', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  return c.json({ user });
});

// ============ PRODUCTS ENDPOINTS ============

app.get('/make-server-102b7931/products', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user || !user.factory_id) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const products = await kv.getByPrefix(`products:${user.factory_id}:`);
  return c.json({ products });
});

app.post('/make-server-102b7931/products', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user || !user.factory_id || !['Owner', 'Plant Manager'].includes(user.role)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const { name, unit, selling_price } = body;

    const productId = generateId();
    const product = {
      id: productId,
      name,
      unit,
      selling_price: parseFloat(selling_price),
      factory_id: user.factory_id,
      created_at: now()
    };

    await kv.set(`products:${user.factory_id}:${productId}`, product);
    return c.json({ success: true, product });
  } catch (error) {
    console.log('Error creating product:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.put('/make-server-102b7931/products/:id', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user || !user.factory_id || !['Owner', 'Plant Manager'].includes(user.role)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const productId = c.req.param('id');
    const body = await c.req.json();
    
    const existing = await kv.get(`products:${user.factory_id}:${productId}`);
    if (!existing) {
      return c.json({ error: 'Product not found' }, 404);
    }

    const updated = { ...existing, ...body, updated_at: now() };
    await kv.set(`products:${user.factory_id}:${productId}`, updated);
    
    return c.json({ success: true, product: updated });
  } catch (error) {
    console.log('Error updating product:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.delete('/make-server-102b7931/products/:id', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user || !user.factory_id || !['Owner'].includes(user.role)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const productId = c.req.param('id');
    await kv.del(`products:${user.factory_id}:${productId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting product:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============ RAW MATERIALS ENDPOINTS ============

app.get('/make-server-102b7931/raw-materials', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user || !user.factory_id) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const materials = await kv.getByPrefix(`raw_materials:${user.factory_id}:`);
  return c.json({ materials });
});

app.post('/make-server-102b7931/raw-materials', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user || !user.factory_id || !['Owner', 'Plant Manager'].includes(user.role)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const { name, unit, reorder_point } = body;

    const materialId = generateId();
    const material = {
      id: materialId,
      name,
      unit,
      reorder_point: parseFloat(reorder_point || 0),
      factory_id: user.factory_id,
      created_at: now()
    };

    await kv.set(`raw_materials:${user.factory_id}:${materialId}`, material);
    return c.json({ success: true, material });
  } catch (error) {
    console.log('Error creating raw material:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.put('/make-server-102b7931/raw-materials/:id', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user || !user.factory_id || !['Owner', 'Plant Manager'].includes(user.role)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const materialId = c.req.param('id');
    const body = await c.req.json();
    
    const existing = await kv.get(`raw_materials:${user.factory_id}:${materialId}`);
    if (!existing) {
      return c.json({ error: 'Material not found' }, 404);
    }

    const updated = { ...existing, ...body, updated_at: now() };
    await kv.set(`raw_materials:${user.factory_id}:${materialId}`, updated);
    
    return c.json({ success: true, material: updated });
  } catch (error) {
    console.log('Error updating raw material:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.delete('/make-server-102b7931/raw-materials/:id', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user || !user.factory_id || !['Owner'].includes(user.role)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const materialId = c.req.param('id');
    await kv.del(`raw_materials:${user.factory_id}:${materialId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting raw material:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============ BOM ENDPOINTS ============

app.get('/make-server-102b7931/bom', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user || !user.factory_id) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const boms = await kv.getByPrefix(`bom:${user.factory_id}:`);
  return c.json({ boms });
});

app.get('/make-server-102b7931/bom/product/:productId', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user || !user.factory_id) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const productId = c.req.param('productId');
  const allBoms = await kv.getByPrefix(`bom:${user.factory_id}:`);
  const productBoms = allBoms.filter((bom: any) => bom.product_id === productId);
  
  return c.json({ boms: productBoms });
});

app.post('/make-server-102b7931/bom', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user || !user.factory_id || !['Owner', 'Plant Manager'].includes(user.role)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const { product_id, raw_material_id, qty_per_unit } = body;

    const bomId = generateId();
    const bom = {
      id: bomId,
      product_id,
      raw_material_id,
      qty_per_unit: parseFloat(qty_per_unit),
      factory_id: user.factory_id,
      created_at: now()
    };

    await kv.set(`bom:${user.factory_id}:${bomId}`, bom);
    return c.json({ success: true, bom });
  } catch (error) {
    console.log('Error creating BOM:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.delete('/make-server-102b7931/bom/:id', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user || !user.factory_id || !['Owner', 'Plant Manager'].includes(user.role)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const bomId = c.req.param('id');
    await kv.del(`bom:${user.factory_id}:${bomId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting BOM:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============ INVENTORY ENDPOINTS ============

app.get('/make-server-102b7931/inventory', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user || !user.factory_id) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const transactions = await kv.getByPrefix(`inventory_transactions:${user.factory_id}:`);
    const materials = await kv.getByPrefix(`raw_materials:${user.factory_id}:`);
    
    // Calculate current stock for each material
    const stockLevels: any = {};
    
    transactions.forEach((tx: any) => {
      if (!stockLevels[tx.raw_material_id]) {
        stockLevels[tx.raw_material_id] = {
          material_id: tx.raw_material_id,
          total_qty: 0,
          total_value: 0,
          transactions_count: 0
        };
      }
      stockLevels[tx.raw_material_id].total_qty += tx.qty;
      stockLevels[tx.raw_material_id].total_value += (tx.qty * (tx.unit_cost || 0));
      stockLevels[tx.raw_material_id].transactions_count++;
    });

    // Enrich with material details
    const inventory = Object.values(stockLevels).map((stock: any) => {
      const material = materials.find((m: any) => m.id === stock.material_id);
      return {
        ...stock,
        material_name: material?.name,
        material_unit: material?.unit,
        reorder_point: material?.reorder_point || 0,
        avg_unit_cost: stock.total_qty > 0 ? stock.total_value / stock.total_qty : 0,
        needs_reorder: stock.total_qty <= (material?.reorder_point || 0)
      };
    });

    return c.json({ inventory });
  } catch (error) {
    console.log('Error getting inventory:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/make-server-102b7931/inventory-transactions', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user || !user.factory_id) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const transactions = await kv.getByPrefix(`inventory_transactions:${user.factory_id}:`);
  return c.json({ transactions });
});

app.post('/make-server-102b7931/inventory-transactions', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user || !user.factory_id || !['Owner', 'Plant Manager', 'Supervisor'].includes(user.role)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const { raw_material_id, tx_type, qty, unit_cost, related_production_order_id } = body;

    const txId = generateId();
    const transaction = {
      id: txId,
      raw_material_id,
      tx_type,
      qty: parseFloat(qty),
      unit_cost: parseFloat(unit_cost || 0),
      related_production_order_id: related_production_order_id || null,
      factory_id: user.factory_id,
      created_by: user.id,
      timestamp: now()
    };

    await kv.set(`inventory_transactions:${user.factory_id}:${txId}`, transaction);
    return c.json({ success: true, transaction });
  } catch (error) {
    console.log('Error creating inventory transaction:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============ PRODUCTION ORDERS ENDPOINTS ============

app.get('/make-server-102b7931/production-orders', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user || !user.factory_id) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const orders = await kv.getByPrefix(`production_orders:${user.factory_id}:`);
  return c.json({ orders });
});

app.post('/make-server-102b7931/production-orders', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user || !user.factory_id || !['Owner', 'Plant Manager', 'Supervisor'].includes(user.role)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const { product_id, target_qty, scheduled_start } = body;

    const orderId = generateId();
    const order = {
      id: orderId,
      product_id,
      target_qty: parseFloat(target_qty),
      actual_produced_qty: 0,
      status: 'scheduled',
      scheduled_start,
      actual_start: null,
      actual_end: null,
      factory_id: user.factory_id,
      created_by: user.id,
      created_at: now()
    };

    await kv.set(`production_orders:${user.factory_id}:${orderId}`, order);
    return c.json({ success: true, order });
  } catch (error) {
    console.log('Error creating production order:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.put('/make-server-102b7931/production-orders/:id/start', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user || !user.factory_id || !['Owner', 'Plant Manager', 'Supervisor'].includes(user.role)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const orderId = c.req.param('id');
    const order = await kv.get(`production_orders:${user.factory_id}:${orderId}`);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    if (order.status !== 'scheduled') {
      return c.json({ error: 'Order already started or completed' }, 400);
    }

    order.status = 'in_progress';
    order.actual_start = now();
    order.updated_at = now();

    await kv.set(`production_orders:${user.factory_id}:${orderId}`, order);
    return c.json({ success: true, order });
  } catch (error) {
    console.log('Error starting production order:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.put('/make-server-102b7931/production-orders/:id/complete', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user || !user.factory_id || !['Owner', 'Plant Manager', 'Supervisor'].includes(user.role)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const orderId = c.req.param('id');
    const body = await c.req.json();
    const { actual_produced_qty } = body;

    const order = await kv.get(`production_orders:${user.factory_id}:${orderId}`);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    if (order.status === 'completed') {
      return c.json({ error: 'Order already completed' }, 400);
    }

    // Get BOM for the product
    const allBoms = await kv.getByPrefix(`bom:${user.factory_id}:`);
    const productBoms = allBoms.filter((bom: any) => bom.product_id === order.product_id);

    // Calculate required materials
    const requiredMaterials: any = {};
    productBoms.forEach((bom: any) => {
      requiredMaterials[bom.raw_material_id] = bom.qty_per_unit * actual_produced_qty;
    });

    // Check inventory availability
    const transactions = await kv.getByPrefix(`inventory_transactions:${user.factory_id}:`);
    const stockLevels: any = {};
    
    transactions.forEach((tx: any) => {
      if (!stockLevels[tx.raw_material_id]) {
        stockLevels[tx.raw_material_id] = { qty: 0, total_cost: 0, count: 0 };
      }
      stockLevels[tx.raw_material_id].qty += tx.qty;
      stockLevels[tx.raw_material_id].total_cost += (tx.qty * (tx.unit_cost || 0));
      stockLevels[tx.raw_material_id].count++;
    });

    // Verify sufficient stock
    for (const [materialId, requiredQty] of Object.entries(requiredMaterials)) {
      const available = stockLevels[materialId]?.qty || 0;
      if (available < (requiredQty as number)) {
        return c.json({ 
          error: `Insufficient stock for material ${materialId}. Required: ${requiredQty}, Available: ${available}` 
        }, 400);
      }
    }

    // Create consumption transactions and material usage records
    for (const [materialId, requiredQty] of Object.entries(requiredMaterials)) {
      const stock = stockLevels[materialId];
      const avgUnitCost = stock.count > 0 ? stock.total_cost / stock.qty : 0;

      // Create inventory transaction (consumption)
      const txId = generateId();
      const transaction = {
        id: txId,
        raw_material_id: materialId,
        tx_type: 'consumption',
        qty: -(requiredQty as number),
        unit_cost: avgUnitCost,
        related_production_order_id: orderId,
        factory_id: user.factory_id,
        created_by: user.id,
        timestamp: now()
      };
      await kv.set(`inventory_transactions:${user.factory_id}:${txId}`, transaction);

      // Create production material usage record
      const usageId = generateId();
      const usage = {
        id: usageId,
        production_order_id: orderId,
        raw_material_id: materialId,
        qty_used: requiredQty as number,
        unit_cost: avgUnitCost,
        factory_id: user.factory_id,
        created_at: now()
      };
      await kv.set(`production_material_usage:${user.factory_id}:${usageId}`, usage);
    }

    // Update order
    order.status = 'completed';
    order.actual_produced_qty = parseFloat(actual_produced_qty);
    order.actual_end = now();
    order.updated_at = now();

    await kv.set(`production_orders:${user.factory_id}:${orderId}`, order);

    // Check for low stock alerts
    const materials = await kv.getByPrefix(`raw_materials:${user.factory_id}:`);
    for (const material of materials) {
      const newStock = (stockLevels[material.id]?.qty || 0) - (requiredMaterials[material.id] || 0);
      if (newStock <= material.reorder_point) {
        const alertId = generateId();
        const alert = {
          id: alertId,
          type: 'low_stock',
          message: `Low stock alert: ${material.name} is at ${newStock.toFixed(2)} ${material.unit} (reorder point: ${material.reorder_point})`,
          severity: 'high',
          material_id: material.id,
          factory_id: user.factory_id,
          created_at: now()
        };
        await kv.set(`alerts:${user.factory_id}:${alertId}`, alert);
      }
    }

    return c.json({ success: true, order });
  } catch (error) {
    console.log('Error completing production order:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============ DOWNTIME ENDPOINTS ============

app.get('/make-server-102b7931/downtime-events', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user || !user.factory_id) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const events = await kv.getByPrefix(`downtime_events:${user.factory_id}:`);
  return c.json({ events });
});

app.post('/make-server-102b7931/downtime-events', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user || !user.factory_id || !['Owner', 'Plant Manager', 'Supervisor'].includes(user.role)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json();
    const { production_order_id, reason, start_time, end_time } = body;

    const eventId = generateId();
    const event = {
      id: eventId,
      production_order_id,
      reason,
      start_time,
      end_time,
      factory_id: user.factory_id,
      created_by: user.id,
      created_at: now()
    };

    await kv.set(`downtime_events:${user.factory_id}:${eventId}`, event);
    return c.json({ success: true, event });
  } catch (error) {
    console.log('Error creating downtime event:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============ ALERTS ENDPOINTS ============

app.get('/make-server-102b7931/alerts', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user || !user.factory_id) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const alerts = await kv.getByPrefix(`alerts:${user.factory_id}:`);
  return c.json({ alerts });
});

app.delete('/make-server-102b7931/alerts/:id', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user || !user.factory_id) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const alertId = c.req.param('id');
    await kv.del(`alerts:${user.factory_id}:${alertId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting alert:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============ DASHBOARD ENDPOINTS ============

app.get('/make-server-102b7931/dashboard', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user || !user.factory_id) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    // Get all data
    const orders = await kv.getByPrefix(`production_orders:${user.factory_id}:`);
    const materials = await kv.getByPrefix(`raw_materials:${user.factory_id}:`);
    const transactions = await kv.getByPrefix(`inventory_transactions:${user.factory_id}:`);
    const downtimeEvents = await kv.getByPrefix(`downtime_events:${user.factory_id}:`);
    const materialUsage = await kv.getByPrefix(`production_material_usage:${user.factory_id}:`);

    // Today's production
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter((o: any) => 
      o.actual_end && o.actual_end.startsWith(today)
    );
    
    const totalProducedToday = todayOrders.reduce((sum: number, o: any) => 
      sum + (o.actual_produced_qty || 0), 0
    );

    // Stock levels
    const stockLevels: any = {};
    transactions.forEach((tx: any) => {
      if (!stockLevels[tx.raw_material_id]) {
        stockLevels[tx.raw_material_id] = { qty: 0, total_cost: 0 };
      }
      stockLevels[tx.raw_material_id].qty += tx.qty;
      stockLevels[tx.raw_material_id].total_cost += (tx.qty * (tx.unit_cost || 0));
    });

    const lowStockCount = materials.filter((m: any) => {
      const stock = stockLevels[m.id]?.qty || 0;
      return stock <= m.reorder_point;
    }).length;

    // Production costs
    const completedOrders = orders.filter((o: any) => o.status === 'completed');
    const totalProductionCost = materialUsage.reduce((sum: number, usage: any) => 
      sum + (usage.qty_used * usage.unit_cost), 0
    );

    // Downtime costs (assuming $100/hour downtime cost)
    const downtimeCostRate = 100;
    const totalDowntimeCost = downtimeEvents.reduce((sum: number, event: any) => {
      if (event.start_time && event.end_time) {
        const hours = (new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / (1000 * 60 * 60);
        return sum + (hours * downtimeCostRate);
      }
      return sum;
    }, 0);

    return c.json({
      summary: {
        total_produced_today: totalProducedToday,
        orders_today: todayOrders.length,
        low_stock_items: lowStockCount,
        total_production_cost: totalProductionCost,
        total_downtime_cost: totalDowntimeCost,
        completed_orders_count: completedOrders.length
      },
      recent_orders: orders.slice(-5).reverse(),
      stock_alerts: materials.filter((m: any) => {
        const stock = stockLevels[m.id]?.qty || 0;
        return stock <= m.reorder_point;
      }).map((m: any) => ({
        ...m,
        current_stock: stockLevels[m.id]?.qty || 0
      }))
    });
  } catch (error) {
    console.log('Error getting dashboard data:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============ COST REPORTS ============

app.get('/make-server-102b7931/cost-reports', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user || !user.factory_id || !['Owner', 'Accountant', 'Plant Manager'].includes(user.role)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const orders = await kv.getByPrefix(`production_orders:${user.factory_id}:`);
    const materialUsage = await kv.getByPrefix(`production_material_usage:${user.factory_id}:`);
    const products = await kv.getByPrefix(`products:${user.factory_id}:`);

    const completedOrders = orders.filter((o: any) => o.status === 'completed');

    const costReports = completedOrders.map((order: any) => {
      const usages = materialUsage.filter((u: any) => u.production_order_id === order.id);
      const materialCost = usages.reduce((sum: number, u: any) => 
        sum + (u.qty_used * u.unit_cost), 0
      );
      
      const product = products.find((p: any) => p.id === order.product_id);
      const costPerUnit = order.actual_produced_qty > 0 
        ? materialCost / order.actual_produced_qty 
        : 0;
      
      const revenue = order.actual_produced_qty * (product?.selling_price || 0);
      const profit = revenue - materialCost;
      const marginPercent = revenue > 0 ? (profit / revenue) * 100 : 0;

      return {
        order_id: order.id,
        product_name: product?.name,
        produced_qty: order.actual_produced_qty,
        material_cost: materialCost,
        cost_per_unit: costPerUnit,
        selling_price: product?.selling_price || 0,
        revenue,
        profit,
        margin_percent: marginPercent,
        completed_at: order.actual_end
      };
    });

    return c.json({ cost_reports: costReports });
  } catch (error) {
    console.log('Error generating cost reports:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============ SEED DATA ENDPOINT ============

app.post('/make-server-102b7931/seed-data', async (c) => {
  const user = await verifyUser(c.req.header('Authorization'));
  if (!user || !user.factory_id || user.role !== 'Owner') {
    return c.json({ error: 'Unauthorized - Owner only' }, 401);
  }

  try {
    const factoryId = user.factory_id;

    // Create raw materials
    const rawMaterials = [
      { name: 'Steel Sheet', unit: 'kg', reorder_point: 500 },
      { name: 'Aluminum Rod', unit: 'kg', reorder_point: 300 },
      { name: 'Plastic Pellets', unit: 'kg', reorder_point: 1000 },
      { name: 'Copper Wire', unit: 'm', reorder_point: 2000 },
      { name: 'Rubber Gasket', unit: 'pcs', reorder_point: 5000 },
      { name: 'Paint (Red)', unit: 'liter', reorder_point: 50 },
      { name: 'Paint (Blue)', unit: 'liter', reorder_point: 50 },
      { name: 'Screws M5', unit: 'pcs', reorder_point: 10000 },
      { name: 'Bolts M8', unit: 'pcs', reorder_point: 5000 },
      { name: 'Packaging Box', unit: 'pcs', reorder_point: 500 }
    ];

    const materialIds: any = {};
    for (const mat of rawMaterials) {
      const id = generateId();
      materialIds[mat.name] = id;
      await kv.set(`raw_materials:${factoryId}:${id}`, {
        id,
        ...mat,
        factory_id: factoryId,
        created_at: now()
      });
    }

    // Create products
    const products = [
      { name: 'Widget A', unit: 'pcs', selling_price: 45.00 },
      { name: 'Widget B', unit: 'pcs', selling_price: 75.00 },
      { name: 'Widget C', unit: 'pcs', selling_price: 120.00 }
    ];

    const productIds: any = {};
    for (const prod of products) {
      const id = generateId();
      productIds[prod.name] = id;
      await kv.set(`products:${factoryId}:${id}`, {
        id,
        ...prod,
        factory_id: factoryId,
        created_at: now()
      });
    }

    // Create BOMs
    const boms = [
      // Widget A
      { product: 'Widget A', material: 'Steel Sheet', qty: 0.5 },
      { product: 'Widget A', material: 'Plastic Pellets', qty: 0.2 },
      { product: 'Widget A', material: 'Screws M5', qty: 4 },
      { product: 'Widget A', material: 'Paint (Red)', qty: 0.05 },
      { product: 'Widget A', material: 'Packaging Box', qty: 1 },
      // Widget B
      { product: 'Widget B', material: 'Aluminum Rod', qty: 0.8 },
      { product: 'Widget B', material: 'Copper Wire', qty: 2.5 },
      { product: 'Widget B', material: 'Rubber Gasket', qty: 2 },
      { product: 'Widget B', material: 'Paint (Blue)', qty: 0.08 },
      { product: 'Widget B', material: 'Packaging Box', qty: 1 },
      // Widget C
      { product: 'Widget C', material: 'Steel Sheet', qty: 1.2 },
      { product: 'Widget C', material: 'Aluminum Rod', qty: 0.5 },
      { product: 'Widget C', material: 'Bolts M8', qty: 8 },
      { product: 'Widget C', material: 'Copper Wire', qty: 5 },
      { product: 'Widget C', material: 'Paint (Red)', qty: 0.1 },
      { product: 'Widget C', material: 'Packaging Box', qty: 1 }
    ];

    for (const bom of boms) {
      const id = generateId();
      await kv.set(`bom:${factoryId}:${id}`, {
        id,
        product_id: productIds[bom.product],
        raw_material_id: materialIds[bom.material],
        qty_per_unit: bom.qty,
        factory_id: factoryId,
        created_at: now()
      });
    }

    // Create initial inventory
    const initialInventory = [
      { material: 'Steel Sheet', qty: 1000, unit_cost: 5.00 },
      { material: 'Aluminum Rod', qty: 600, unit_cost: 8.00 },
      { material: 'Plastic Pellets', qty: 2000, unit_cost: 2.50 },
      { material: 'Copper Wire', qty: 5000, unit_cost: 0.50 },
      { material: 'Rubber Gasket', qty: 10000, unit_cost: 0.10 },
      { material: 'Paint (Red)', qty: 100, unit_cost: 15.00 },
      { material: 'Paint (Blue)', qty: 100, unit_cost: 15.00 },
      { material: 'Screws M5', qty: 20000, unit_cost: 0.02 },
      { material: 'Bolts M8', qty: 10000, unit_cost: 0.05 },
      { material: 'Packaging Box', qty: 1000, unit_cost: 1.00 }
    ];

    for (const inv of initialInventory) {
      const id = generateId();
      await kv.set(`inventory_transactions:${factoryId}:${id}`, {
        id,
        raw_material_id: materialIds[inv.material],
        tx_type: 'purchase',
        qty: inv.qty,
        unit_cost: inv.unit_cost,
        related_production_order_id: null,
        factory_id: factoryId,
        created_by: user.id,
        timestamp: now()
      });
    }

    // Create sample production orders
    const sampleOrders = [
      { product: 'Widget A', target: 100, actual: 100, status: 'completed' },
      { product: 'Widget B', target: 50, actual: 48, status: 'completed' },
      { product: 'Widget C', target: 30, actual: 30, status: 'completed' },
      { product: 'Widget A', target: 200, actual: 0, status: 'scheduled' }
    ];

    for (const order of sampleOrders) {
      const id = generateId();
      const orderData: any = {
        id,
        product_id: productIds[order.product],
        target_qty: order.target,
        actual_produced_qty: order.actual,
        status: order.status,
        scheduled_start: new Date(Date.now() - 86400000).toISOString(),
        factory_id: factoryId,
        created_by: user.id,
        created_at: now()
      };

      if (order.status === 'completed') {
        orderData.actual_start = new Date(Date.now() - 72000000).toISOString();
        orderData.actual_end = new Date(Date.now() - 36000000).toISOString();
      }

      await kv.set(`production_orders:${factoryId}:${id}`, orderData);
    }

    return c.json({ success: true, message: 'Sample data created successfully' });
  } catch (error) {
    console.log('Error seeding data:', error);
    return c.json({ error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);
