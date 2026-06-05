CRM Platform — WebSocket & Real-Time Event Tests
Live Notifications · Activity Streams · Kafka Consumer Validation · GraphQL Subscriptions
Jest · ws · Socket.IO · Kafka · Apollo Client · Supertest


Table of Contents
1. Real-Time Test Infrastructure
   1.1 WebSocket Test Client Setup
   1.2 Kafka Test Consumer Setup
   1.3 GraphQL Subscription Test Client
   1.4 Event Assertion Utilities
2. WebSocket Connection & Authentication Tests
   2.1 Connection Lifecycle
   2.2 JWT Authentication over WebSocket
   2.3 Workspace Channel Isolation
   2.4 Reconnection & Heartbeat
3. Pipeline Real-Time Notifications
   3.1 Deal Stage Change Broadcasts
   3.2 Deal Created/Updated/Deleted Events
   3.3 Pipeline Forecast Live Updates
   3.4 Multi-User Concurrent Stage Changes
4. Contact Activity Streams
   4.1 Contact Created/Updated Activity Feed
   4.2 Lead Score Change Notifications
   4.3 Tag Add/Remove Events
   4.4 Contact Timeline Live Updates
5. Automation Trigger Broadcasts
   5.1 Workflow Enrollment Events
   5.2 Node Execution Progress Updates
   5.3 Workflow Completion Notifications
   5.4 Automation Error Broadcasts
6. Campaign Real-Time Events
   6.1 Campaign Send Progress
   6.2 Email Open/Click Live Tracking
   6.3 Campaign Analytics Live Dashboard
7. Social Media Real-Time Events
   7.1 New Social Inbox Message Notifications
   7.2 Post Published Confirmation
   7.3 Social Engagement Live Feed
8. Kafka Consumer Validation Tests
   8.1 Contact Service Kafka Consumers
   8.2 Pipeline Service Kafka Consumers
   8.3 Campaign Service Kafka Consumers
   8.4 Automation Service Kafka Consumers
   8.5 Email Service Kafka Consumers
   8.6 Social Service Kafka Consumers
   8.7 Dead Letter Queue Handling
9. GraphQL Subscription Tests
   9.1 contactUpdated Subscription
   9.2 dealStageChanged Subscription
   9.3 workflowProgress Subscription
10. End-to-End Real-Time Flow Tests
   10.1 Full Pipeline Stage Change → WebSocket → Kafka Flow
   10.2 Contact Created → Automation → WebSocket Notification
   10.3 Campaign Send → Live Analytics Update Flow
11. Performance & Load Tests for Real-Time Events
   11.1 Concurrent WebSocket Connections
   11.2 High-Throughput Kafka Event Processing




1. Real-Time Test Infrastructure
Real-time tests require specialized infrastructure beyond standard HTTP testing. This section establishes WebSocket test clients, Kafka test consumers, GraphQL subscription clients, and shared event assertion utilities used throughout the test suite.

1.1 WebSocket Test Client Setup
// test/realtime/setup/wsClient.js
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const WS_URL = process.env.WS_URL || 'ws://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'integration-test-secret-key';

class TestWsClient {
  constructor(workspaceId, userId = 'test-user-001') {
    this.workspaceId = workspaceId;
    this.userId = userId;
    this.ws = null;
    this.messages = [];
    this.listeners = new Map();
  }
  get token() {
    return jwt.sign({ userId: this.userId, workspaceId: this.workspaceId, scopes: ['ws:connect'] }, JWT_SECRET, { expiresIn: '1h' });
  }
  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`${WS_URL}?token=${this.token}`);
      this.ws.on('open', () => { this.ws.send(JSON.stringify({ type: 'auth', token: this.token })); });
      this.ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'auth_success') return resolve(this);
        if (msg.type === 'auth_error')   return reject(new Error(msg.error));
        this.messages.push(msg);
        const handler = this.listeners.get(msg.type);
        if (handler) handler(msg);
      });
      this.ws.on('error', reject);
      setTimeout(() => reject(new Error('WS connection timeout')), 5000);
    });
  }
  waitForEvent(eventType, predicate = null, timeoutMs = 3000) {
    return new Promise((resolve, reject) => {
      const existing = this.messages.find(m => m.type === eventType && (!predicate || predicate(m)));
      if (existing) return resolve(existing);
      const timer = setTimeout(() => { this.listeners.delete(eventType); reject(new Error(`Timeout waiting for event: ${eventType}`)); }, timeoutMs);
      this.listeners.set(eventType, (msg) => {
        if (!predicate || predicate(msg)) { clearTimeout(timer); this.listeners.delete(eventType); resolve(msg); }
      });
    });
  }
  async collectEvents(eventType, windowMs = 1000) {
    await new Promise(r => setTimeout(r, windowMs));
    return this.messages.filter(m => m.type === eventType);
  }
  subscribe(channel) { this.ws.send(JSON.stringify({ type: 'subscribe', channel })); }
  send(data) { this.ws.send(JSON.stringify(data)); }
  close() { if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.close(); }
}
module.exports = { TestWsClient };

1.2 Kafka Test Consumer Setup
// test/realtime/setup/kafkaTestConsumer.js
const { Kafka } = require('kafkajs');
class KafkaTestConsumer {
  constructor(topics, groupId = `test-consumer-${Date.now()}`) {
    this.topics = Array.isArray(topics) ? topics : [topics];
    this.messages = [];
    this.waiters = [];
    this.kafka = new Kafka({ clientId: 'crm-test-consumer', brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'] });
    this.consumer = this.kafka.consumer({ groupId });
  }
  async start() {
    await this.consumer.connect();
    for (const topic of this.topics) await this.consumer.subscribe({ topic, fromBeginning: false });
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const parsed = { topic, partition, key: message.key?.toString(),
          value: JSON.parse(message.value.toString()), timestamp: new Date(parseInt(message.timestamp)) };
        this.messages.push(parsed);
        this.waiters = this.waiters.filter(({ predicate, resolve }) => {
          if (predicate(parsed)) { resolve(parsed); return false; }
          return true;
        });
      },
    });
  }
  waitForMessage(predicate, timeoutMs = 5000) {
    return new Promise((resolve, reject) => {
      const existing = this.messages.find(predicate);
      if (existing) return resolve(existing);
      const timer = setTimeout(() => { this.waiters = this.waiters.filter(w => w.resolve !== resolve); reject(new Error(`Kafka message timeout after ${timeoutMs}ms`)); }, timeoutMs);
      this.waiters.push({ predicate, resolve: (msg) => { clearTimeout(timer); resolve(msg); } });
    });
  }
  getMessages(topic) { return this.messages.filter(m => m.topic === topic); }
  clear() { this.messages = []; }
  async stop() { await this.consumer.disconnect(); }
}
module.exports = { KafkaTestConsumer };

1.3 GraphQL Subscription Test Client
// test/realtime/setup/gqlSubscriptionClient.js
const { createClient } = require('graphql-ws');
const WebSocket = require('ws');
class GqlSubscriptionClient {
  constructor(workspaceId, token) {
    this.workspaceId = workspaceId;
    this.token = token;
    this.client = null;
  }
  connect() {
    this.client = createClient({
      url: process.env.GQL_WS_URL || 'ws://localhost:3000/graphql',
      webSocketImpl: WebSocket,
      connectionParams: { authorization: `Bearer ${this.token}` },
    });
  }
  subscribe(query, variables = {}) {
    const events = []; const errors = []; let unsubscribe;
    const ready = new Promise((resolve) => {
      unsubscribe = this.client.subscribe({ query, variables },
        { next: (data) => { events.push(data); resolve(); }, error: (err) => errors.push(err), complete: () => {} });
    });
    return { events, errors, unsubscribe, ready };
  }
  waitForEvents(events, count, timeoutMs = 5000) {
    return new Promise((resolve, reject) => {
      const check = () => { if (events.length >= count) resolve(events.slice(0, count)); };
      const interval = setInterval(check, 50);
      setTimeout(() => { clearInterval(interval); reject(new Error(`Expected ${count} events, got ${events.length}`)); }, timeoutMs);
      check();
    });
  }
  dispose() { this.client?.dispose(); }
}
module.exports = { GqlSubscriptionClient };

1.4 Event Assertion Utilities
// test/realtime/setup/eventAssertions.js
async function assertEventReceived(events, predicate, timeoutMs = 3000, label = 'event') {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const match = events.find(predicate);
    if (match) return match;
    await new Promise(r => setTimeout(r, 50));
  }
  throw new Error(`Expected ${label} not received within ${timeoutMs}ms. Got: ${JSON.stringify(events)}`);
}
async function assertEventNotReceived(events, predicate, windowMs = 500, label = 'event') {
  await new Promise(r => setTimeout(r, windowMs));
  const match = events.find(predicate);
  if (match) throw new Error(`Unexpected ${label} received: ${JSON.stringify(match)}`);
}
function assertEventOrder(events, expectedTypes) {
  const receivedTypes = events.map(e => e.type);
  expectedTypes.forEach((type, i) => { expect(receivedTypes[i]).toBe(type); });
}
async function measureEventLatency(triggerFn, waitForEventFn) {
  const start = Date.now();
  await triggerFn();
  await waitForEventFn();
  return Date.now() - start;
}
module.exports = { assertEventReceived, assertEventNotReceived, assertEventOrder, measureEventLatency };




2. WebSocket Connection & Authentication Tests
2.1 Connection Lifecycle
// test/realtime/ws/connectionLifecycle.test.js
const { TestWsClient } = require('../setup/wsClient');
describe('WebSocket Connection Lifecycle', () => {
  it('establishes connection and completes auth handshake', async () => {
    const client = new TestWsClient(workspaceId);
    await expect(client.connect()).resolves.toBeDefined();
    expect(client.ws.readyState).toBe(1); // OPEN
    client.close();
  });
  it('receives welcome message with workspace info after auth', async () => {
    const client = new TestWsClient(workspaceId);
    await client.connect();
    const welcome = await client.waitForEvent('welcome');
    expect(welcome.data.workspace_id).toBe(workspaceId);
    expect(welcome.data.server_time).toBeDefined();
    client.close();
  });
  it('closes connection cleanly on client disconnect', async () => {
    const client = new TestWsClient(workspaceId);
    await client.connect();
    const closePromise = new Promise(resolve => client.ws.on('close', resolve));
    client.close();
    await expect(closePromise).resolves.toBeDefined();
  });
  it('server responds to pong frames', async () => {
    const client = new TestWsClient(workspaceId);
    await client.connect();
    const pongReceived = new Promise(resolve => client.ws.on('pong', resolve));
    client.ws.ping();
    await expect(pongReceived).resolves.toBeDefined();
    client.close();
  });
});

2.2 JWT Authentication over WebSocket
// test/realtime/ws/wsAuthentication.test.js
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const WS_URL = process.env.WS_URL || 'ws://localhost:3000';
const SECRET = process.env.JWT_SECRET || 'integration-test-secret-key';
describe('WebSocket JWT Authentication', () => {
  it('rejects connection with no token', async () => {
    const ws = new WebSocket(WS_URL);
    const closeCode = await new Promise(resolve => ws.on('close', (code) => resolve(code)));
    expect(closeCode).toBe(4001); // Custom: Unauthorized
  });
  it('rejects connection with expired token', async () => {
    const expiredToken = jwt.sign({ userId: 'u1', workspaceId, scopes: [] }, SECRET, { expiresIn: '0s' });
    const ws = new WebSocket(`${WS_URL}?token=${expiredToken}`);
    const closeCode = await new Promise(resolve => ws.on('close', (code) => resolve(code)));
    expect(closeCode).toBe(4001);
  });
  it('rejects connection with tampered token', async () => {
    const validToken = jwt.sign({ userId: 'u1', workspaceId, scopes: [] }, SECRET, { expiresIn: '1h' });
    const tamperedToken = validToken.slice(0, -5) + 'XXXXX';
    const ws = new WebSocket(`${WS_URL}?token=${tamperedToken}`);
    const closeCode = await new Promise(resolve => ws.on('close', (code) => resolve(code)));
    expect(closeCode).toBe(4001);
  });
  it('accepts connection with valid token', async () => {
    const client = new TestWsClient(workspaceId);
    await expect(client.connect()).resolves.toBeDefined();
    client.close();
  });
  it('disconnects when token expires during active session', async () => {
    const shortToken = jwt.sign({ userId: 'u1', workspaceId, scopes: [] }, SECRET, { expiresIn: '2s' });
    const ws = new WebSocket(`${WS_URL}?token=${shortToken}`);
    await new Promise(resolve => ws.on('open', resolve));
    const closeCode = await new Promise(resolve => ws.on('close', (code) => resolve(code)));
    expect(closeCode).toBe(4001);
  }, 10000);
});

2.3 Workspace Channel Isolation
// test/realtime/ws/workspaceIsolation.test.js
const { assertEventNotReceived } = require('../setup/eventAssertions');
describe('WebSocket Workspace Channel Isolation', () => {
  it('workspace A client does NOT receive workspace B events', async () => {
    const tokenB = makeToken({ workspaceId: wsB.workspaceId });
    await request(app.server).post('/api/v1/contacts')
      .set('Authorization', `Bearer ${tokenB}`).send({ first_name: 'B-Only', email: 'b@test.com' });
    await assertEventNotReceived(clientA.messages,
      m => m.type === 'contact.created' && m.data.email === 'b@test.com', 500, 'cross-workspace contact.created');
  });
  it('workspace B client does NOT receive workspace A deal events', async () => {
    const tokenA = makeToken({ workspaceId: wsA.workspaceId });
    const contacts = await seedContacts(wsA.workspaceId, 1);
    const pRes = await request(app.server).post('/api/v1/pipelines').set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'P', stages: [{ name: 'S', order: 1 }] });
    await request(app.server).post('/api/v1/deals').set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'A-Deal', value: 1000, pipeline_id: pRes.body.data.id,
        stage_id: pRes.body.data.stages[0].id, contact_id: contacts[0].id });
    await assertEventNotReceived(clientB.messages, m => m.type === 'deal.created', 500, 'cross-workspace deal.created');
  });
});

2.4 Reconnection & Heartbeat
describe('WebSocket Reconnection & Heartbeat', () => {
  it('client can reconnect after server-side disconnect', async () => {
    const client = new TestWsClient(workspaceId);
    await client.connect();
    client.ws.terminate();
    await new Promise(r => setTimeout(r, 100));
    const client2 = new TestWsClient(workspaceId);
    await expect(client2.connect()).resolves.toBeDefined();
    client2.close();
  });
  it('server responds to pong frames', async () => {
    const client = new TestWsClient(workspaceId);
    await client.connect();
    const pongReceived = new Promise(resolve => client.ws.on('pong', resolve));
    client.ws.ping();
    await expect(pongReceived).resolves.toBeDefined();
    client.close();
  });
});




3. Pipeline Real-Time Notifications
3.1 Deal Stage Change Broadcasts
// test/realtime/pipeline/stageChangeBroadcast.test.js
const { assertEventReceived } = require('../setup/eventAssertions');
describe('Deal Stage Change Real-Time Broadcasts', () => {
  it('broadcasts deal.stage_changed event when deal moves to new stage', async () => {
    wsClient.subscribe('pipeline');
    await request(app.server).patch(`/api/v1/deals/${dealId}/stage`)
      .set('Authorization', `Bearer ${token}`).send({ stage_id: stage2Id });
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'deal.stage_changed' && m.data.deal_id === dealId, 3000);
    expect(event.data.deal_id).toBe(dealId);
    expect(event.data.from_stage_id).toBe(stage1Id);
    expect(event.data.to_stage_id).toBe(stage2Id);
    expect(event.data.deal_title).toBe('Test Deal');
    expect(event.data.timestamp).toBeDefined();
  });
  it('broadcast includes updated deal value and probability', async () => {
    wsClient.subscribe('pipeline');
    await request(app.server).patch(`/api/v1/deals/${dealId}/stage`)
      .set('Authorization', `Bearer ${token}`).send({ stage_id: stage2Id });
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'deal.stage_changed', 3000);
    expect(event.data.deal_value).toBeDefined();
    expect(event.data.new_probability).toBeDefined();
  });
  it('multiple subscribers in same workspace all receive the broadcast', async () => {
    const client2 = new TestWsClient(workspaceId, 'user-002');
    const client3 = new TestWsClient(workspaceId, 'user-003');
    await Promise.all([client2.connect(), client3.connect()]);
    client2.subscribe('pipeline'); client3.subscribe('pipeline');
    wsClient.subscribe('pipeline');
    await request(app.server).patch(`/api/v1/deals/${dealId}/stage`)
      .set('Authorization', `Bearer ${token}`).send({ stage_id: stage2Id });
    await Promise.all([
      assertEventReceived(wsClient.messages, m => m.type === 'deal.stage_changed', 3000),
      assertEventReceived(client2.messages, m => m.type === 'deal.stage_changed', 3000),
      assertEventReceived(client3.messages, m => m.type === 'deal.stage_changed', 3000),
    ]);
    client2.close(); client3.close();
  });
});

3.2 Deal Created/Updated/Deleted Events
describe('Deal CRUD Real-Time Events', () => {
  it('broadcasts deal.created event when new deal is created', async () => {
    wsClient.subscribe('pipeline');
    await request(app.server).post('/api/v1/deals').set('Authorization', `Bearer ${token}`)
      .send({ title: 'New Deal', value: 10000, pipeline_id: pipelineId, stage_id: stage1Id, contact_id: contactId });
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'deal.created', 3000);
    expect(event.data.title).toBe('New Deal');
    expect(event.data.value).toBe(10000);
    expect(event.data.workspace_id).toBe(workspaceId);
  });
  it('broadcasts deal.updated event when deal value changes', async () => {
    wsClient.subscribe('pipeline');
    await request(app.server).patch(`/api/v1/deals/${dealId}`).set('Authorization', `Bearer ${token}`).send({ value: 99000 });
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'deal.updated' && m.data.deal_id === dealId, 3000);
    expect(event.data.changes.value).toBe(99000);
  });
  it('broadcasts deal.deleted event when deal is removed', async () => {
    wsClient.subscribe('pipeline');
    await request(app.server).delete(`/api/v1/deals/${dealId}`).set('Authorization', `Bearer ${token}`);
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'deal.deleted' && m.data.deal_id === dealId, 3000);
    expect(event.data.deal_id).toBe(dealId);
  });
});

3.3 Pipeline Forecast Live Updates
describe('Pipeline Forecast Live Updates', () => {
  it('broadcasts pipeline.forecast_updated after deal stage change', async () => {
    wsClient.subscribe(`pipeline:${pipelineId}`);
    await request(app.server).patch(`/api/v1/deals/${dealId}/stage`).set('Authorization', `Bearer ${token}`).send({ stage_id: stage2Id });
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'pipeline.forecast_updated' && m.data.pipeline_id === pipelineId, 3000);
    expect(event.data.weighted_value).toBeDefined();
    expect(event.data.total_pipeline_value).toBeDefined();
    expect(event.data.by_month).toBeDefined();
  });
  it('broadcasts forecast update after deal value change', async () => {
    wsClient.subscribe(`pipeline:${pipelineId}`);
    await request(app.server).patch(`/api/v1/deals/${dealId}`).set('Authorization', `Bearer ${token}`).send({ value: 50000 });
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'pipeline.forecast_updated', 3000);
    expect(event.data.total_pipeline_value).toBeGreaterThan(0);
  });
});

3.4 Multi-User Concurrent Stage Changes
describe('Multi-User Concurrent Stage Changes', () => {
  it('handles concurrent stage changes from two users without event loss', async () => {
    const contacts = await seedContacts(workspaceId, 2);
    const deal2Res = await request(app.server).post('/api/v1/deals').set('Authorization', `Bearer ${token}`)
      .send({ title: 'Deal 2', value: 2000, pipeline_id: pipelineId, stage_id: stage1Id, contact_id: contacts[1].id });
    const deal2Id = deal2Res.body.data.id;
    wsClient.subscribe('pipeline');
    await Promise.all([
      request(app.server).patch(`/api/v1/deals/${dealId}/stage`).set('Authorization', `Bearer ${token}`).send({ stage_id: stage2Id }),
      request(app.server).patch(`/api/v1/deals/${deal2Id}/stage`).set('Authorization', `Bearer ${token}`).send({ stage_id: stage2Id }),
    ]);
    await new Promise(r => setTimeout(r, 500));
    const stageEvents = wsClient.messages.filter(m => m.type === 'deal.stage_changed');
    expect(stageEvents).toHaveLength(2);
    const dealIds = stageEvents.map(e => e.data.deal_id);
    expect(dealIds).toContain(dealId);
    expect(dealIds).toContain(deal2Id);
  });
});




4. Contact Activity Streams
4.1 Contact Created/Updated Activity Feed
// test/realtime/contacts/contactActivityFeed.test.js
describe('Contact Activity Feed', () => {
  it('broadcasts contact.created event with full contact data', async () => {
    wsClient.subscribe('contacts');
    await request(app.server).post('/api/v1/contacts').set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'Alice', email: 'alice@test.com', tags: ['vip'] });
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'contact.created', 3000);
    expect(event.data.email).toBe('alice@test.com');
    expect(event.data.tags).toContain('vip');
    expect(event.data.workspace_id).toBe(workspaceId);
    expect(event.data.id).toBeDefined();
  });
  it('broadcasts contact.updated event with changed fields', async () => {
    const created = await request(app.server).post('/api/v1/contacts').set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'Bob', email: 'bob@test.com' });
    const contactId = created.body.data.id;
    wsClient.subscribe('contacts'); wsClient.messages = [];
    await request(app.server).patch(`/api/v1/contacts/${contactId}`).set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'Robert', custom_fields: { plan: 'pro' } });
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'contact.updated', 3000);
    expect(event.data.contact_id).toBe(contactId);
    expect(event.data.changes.first_name).toBe('Robert');
    expect(event.data.changes.custom_fields.plan).toBe('pro');
  });
  it('broadcasts contact.deleted event when contact is removed', async () => {
    const created = await request(app.server).post('/api/v1/contacts').set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'Del', email: 'del@test.com' });
    const contactId = created.body.data.id;
    wsClient.subscribe('contacts'); wsClient.messages = [];
    await request(app.server).delete(`/api/v1/contacts/${contactId}`).set('Authorization', `Bearer ${token}`);
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'contact.deleted', 3000);
    expect(event.data.contact_id).toBe(contactId);
  });
});

4.2 Lead Score Change Notifications
describe('Lead Score Change Notifications', () => {
  it('broadcasts contact.score_changed when lead score is updated', async () => {
    const created = await request(app.server).post('/api/v1/contacts').set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'Scorer', email: 'scorer@test.com' });
    const contactId = created.body.data.id;
    wsClient.subscribe('contacts'); wsClient.messages = [];
    await request(app.server).post('/api/v1/events').set('Authorization', `Bearer ${token}`)
      .send({ type: 'email_open', contact_id: contactId, campaign_id: 'camp-001' });
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'contact.score_changed' && m.data.contact_id === contactId, 3000);
    expect(event.data.old_score).toBe(0);
    expect(event.data.new_score).toBe(2); // email_open = +2 points
    expect(event.data.delta).toBe(2);
    expect(event.data.reason).toBe('email_open');
  });
  it('broadcasts score_threshold_reached when contact hits 50 points', async () => {
    const created = await request(app.server).post('/api/v1/contacts').set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'Hot', email: 'hot@test.com' });
    const contactId = created.body.data.id;
    wsClient.subscribe('contacts');
    await request(app.server).patch(`/api/v1/contacts/${contactId}`).set('Authorization', `Bearer ${token}`).send({ lead_score: 49 });
    await request(app.server).post('/api/v1/events').set('Authorization', `Bearer ${token}`)
      .send({ type: 'form_submit', contact_id: contactId });
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'contact.score_threshold_reached' && m.data.contact_id === contactId, 3000);
    expect(event.data.threshold).toBe(50);
    expect(event.data.new_score).toBeGreaterThanOrEqual(50);
  });
});

4.3 Tag Add/Remove Events
describe('Contact Tag Real-Time Events', () => {
  it('broadcasts contact.tag_added when tag is applied', async () => {
    const created = await request(app.server).post('/api/v1/contacts').set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'Tagger', email: 'tagger@test.com' });
    const contactId = created.body.data.id;
    wsClient.subscribe('contacts'); wsClient.messages = [];
    await request(app.server).post(`/api/v1/contacts/${contactId}/tags`).set('Authorization', `Bearer ${token}`).send({ tag: 'hot-lead' });
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'contact.tag_added', 3000);
    expect(event.data.contact_id).toBe(contactId);
    expect(event.data.tag).toBe('hot-lead');
  });
  it('broadcasts contact.tag_removed when tag is deleted', async () => {
    const created = await request(app.server).post('/api/v1/contacts').set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'T', email: 't@test.com', tags: ['old-tag'] });
    const contactId = created.body.data.id;
    wsClient.subscribe('contacts'); wsClient.messages = [];
    await request(app.server).delete(`/api/v1/contacts/${contactId}/tags/old-tag`).set('Authorization', `Bearer ${token}`);
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'contact.tag_removed', 3000);
    expect(event.data.tag).toBe('old-tag');
  });
});

4.4 Contact Timeline Live Updates
describe('Contact Timeline Live Updates', () => {
  it('broadcasts timeline.activity_added when note is logged', async () => {
    const created = await request(app.server).post('/api/v1/contacts').set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'Note', email: 'note@test.com' });
    const contactId = created.body.data.id;
    wsClient.subscribe(`contact:${contactId}`); wsClient.messages = [];
    await request(app.server).post(`/api/v1/contacts/${contactId}/activities`).set('Authorization', `Bearer ${token}`)
      .send({ type: 'note', content: 'Called and left voicemail' });
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'timeline.activity_added', 3000);
    expect(event.data.contact_id).toBe(contactId);
    expect(event.data.activity.type).toBe('note');
    expect(event.data.activity.content).toBe('Called and left voicemail');
  });
});




5. Automation Trigger Broadcasts
5.1 Workflow Enrollment Events
// test/realtime/automation/enrollmentEvents.test.js
describe('Workflow Enrollment Real-Time Events', () => {
  it('broadcasts workflow.contact_enrolled when contact is enrolled', async () => {
    wsClient.subscribe('automation');
    await request(app.server).post(`/api/v1/workflows/${workflowId}/enroll`)
      .set('Authorization', `Bearer ${token}`).send({ contact_id: contactId });
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'workflow.contact_enrolled', 3000);
    expect(event.data.workflow_id).toBe(workflowId);
    expect(event.data.contact_id).toBe(contactId);
    expect(event.data.enrollment_id).toBeDefined();
  });
  it('broadcasts workflow.contact_enrolled for auto-enrollment on contact.created trigger', async () => {
    await request(app.server).post(`/api/v1/workflows/${workflowId}/activate`).set('Authorization', `Bearer ${token}`);
    wsClient.subscribe('automation');
    const contactRes = await request(app.server).post('/api/v1/contacts').set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'Auto', email: 'auto@test.com' });
    const newContactId = contactRes.body.data.id;
    const event = await assertEventReceived(wsClient.messages,
      m => m.type === 'workflow.contact_enrolled' && m.data.contact_id === newContactId, 5000);
    expect(event.data.workflow_id).toBe(workflowId);
    expect(event.data.trigger).toBe('contact.created');
  });
});

5.2 Node Execution Progress Updates
describe('Workflow Node Execution Progress', () => {
  it('broadcasts workflow.node_executed for each completed node', async () => {
    wsClient.subscribe(`workflow:${workflowId}`);
    await request(app.server).post(`/api/v1/workflows/${workflowId}/enroll`)
      .set('Authorization', `Bearer ${token}`).send({ contact_id: contactId });
    await new Promise(r => setTimeout(r, 500));
    const nodeEvents = wsClient.messages.filter(m => m.type === 'workflow.node_executed');
    expect(nodeEvents.length).toBeGreaterThan(0);
    nodeEvents.forEach(e => {
      expect(e.data.workflow_id).toBe(workflowId);
      expect(e.data.node_id).toBeDefined();
      expect(e.data.node_type).toBeDefined();
      expect(e.data.status).toMatch(/success|pending/);
    });
  });
  it('broadcasts workflow.node_waiting when wait node is reached', async () => {
    wsClient.subscribe(`workflow:${workflowWithWaitId}`);
    await request(app.server).post(`/api/v1/workflows/${workflowWithWaitId}/enroll`)
      .set('Authorization', `Bearer ${token}`).send({ contact_id: contactId });
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'workflow.node_waiting', 3000);
    expect(event.data.node_type).toBe('wait');
    expect(event.data.resume_at).toBeDefined();
  });
});

5.3 Workflow Completion Notifications
describe('Workflow Completion Notifications', () => {
  it('broadcasts workflow.completed when all nodes execute successfully', async () => {
    wsClient.subscribe('automation');
    await request(app.server).post(`/api/v1/workflows/${simpleWorkflowId}/enroll`)
      .set('Authorization', `Bearer ${token}`).send({ contact_id: contactId });
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'workflow.completed', 5000);
    expect(event.data.workflow_id).toBe(simpleWorkflowId);
    expect(event.data.contact_id).toBe(contactId);
    expect(event.data.nodes_executed).toBeGreaterThan(0);
    expect(event.data.duration_ms).toBeDefined();
  });
});

5.4 Automation Error Broadcasts
describe('Automation Error Broadcasts', () => {
  it('broadcasts workflow.node_failed when a node throws an error', async () => {
    const nock = require('nock');
    nock('https://failing-webhook.test').post('/hook').reply(500, { error: 'Internal Server Error' });
    wsClient.subscribe(`workflow:${webhookWorkflowId}`);
    await request(app.server).post(`/api/v1/workflows/${webhookWorkflowId}/enroll`)
      .set('Authorization', `Bearer ${token}`).send({ contact_id: contactId });
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'workflow.node_failed', 5000);
    expect(event.data.node_type).toBe('webhook');
    expect(event.data.error).toBeDefined();
    expect(event.data.retry_count).toBeDefined();
  });
});




6. Campaign Real-Time Events
6.1 Campaign Send Progress
// test/realtime/campaigns/sendProgress.test.js
describe('Campaign Send Progress Events', () => {
  it('broadcasts campaign.send_started with recipient count', async () => {
    wsClient.subscribe('campaigns');
    await request(app.server).post(`/api/v1/campaigns/${campaignId}/send`)
      .set('Authorization', `Bearer ${token}`).send({ audience: { type: 'all' } });
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'campaign.send_started', 3000);
    expect(event.data.campaign_id).toBe(campaignId);
    expect(event.data.total_recipients).toBe(10);
    expect(event.data.started_at).toBeDefined();
  });
  it('broadcasts campaign.send_progress updates during bulk send', async () => {
    wsClient.subscribe('campaigns');
    await request(app.server).post(`/api/v1/campaigns/${campaignId}/send`)
      .set('Authorization', `Bearer ${token}`).send({ audience: { type: 'all' } });
    await new Promise(r => setTimeout(r, 1000));
    const progressEvents = wsClient.messages.filter(m => m.type === 'campaign.send_progress');
    if (progressEvents.length > 0) {
      progressEvents.forEach(e => {
        expect(e.data.sent).toBeGreaterThanOrEqual(0);
        expect(e.data.total).toBe(10);
        expect(e.data.percentage).toBeGreaterThanOrEqual(0);
      });
    }
  });
  it('broadcasts campaign.send_completed when all emails are queued', async () => {
    wsClient.subscribe('campaigns');
    await request(app.server).post(`/api/v1/campaigns/${campaignId}/send`)
      .set('Authorization', `Bearer ${token}`).send({ audience: { type: 'all' } });
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'campaign.send_completed', 5000);
    expect(event.data.campaign_id).toBe(campaignId);
    expect(event.data.total_sent).toBe(10);
    expect(event.data.duration_ms).toBeDefined();
  });
});

6.2 Email Open/Click Live Tracking
describe('Email Open/Click Live Tracking', () => {
  it('broadcasts campaign.email_opened when tracking pixel is hit', async () => {
    wsClient.subscribe(`campaign:${campaignId}`);
    await request(app.server).get(`/track/open/${campaignId}/${contactId}`);
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'campaign.email_opened', 3000);
    expect(event.data.campaign_id).toBe(campaignId);
    expect(event.data.contact_id).toBe(contactId);
    expect(event.data.opened_at).toBeDefined();
  });
  it('broadcasts campaign.link_clicked when tracked link is followed', async () => {
    wsClient.subscribe(`campaign:${campaignId}`);
    await request(app.server).get(`/track/click/${campaignId}/${contactId}/link-001`);
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'campaign.link_clicked', 3000);
    expect(event.data.campaign_id).toBe(campaignId);
    expect(event.data.contact_id).toBe(contactId);
    expect(event.data.link_id).toBe('link-001');
  });
});

6.3 Campaign Analytics Live Dashboard
describe('Campaign Analytics Live Dashboard', () => {
  it('broadcasts campaign.analytics_updated after each open/click event', async () => {
    wsClient.subscribe(`campaign:${campaignId}`);
    await request(app.server).get(`/track/open/${campaignId}/${contactId}`);
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'campaign.analytics_updated', 3000);
    expect(event.data.campaign_id).toBe(campaignId);
    expect(event.data.metrics.opened).toBeGreaterThan(0);
    expect(event.data.metrics.open_rate).toBeGreaterThan(0);
  });
});




7. Social Media Real-Time Events
7.1 New Social Inbox Message Notifications
// test/realtime/social/inboxNotifications.test.js
describe('Social Inbox Real-Time Notifications', () => {
  it('broadcasts social.new_message when Facebook comment arrives via webhook', async () => {
    wsClient.subscribe('social');
    const webhookPayload = { object: 'page', entry: [{ id: 'page-123', changes: [{ field: 'feed',
      value: { item: 'comment', comment_id: 'cmt-001', message: 'Great product!',
        from: { id: 'user-456', name: 'Fan User' }, created_time: Date.now() / 1000 } }] }] };
    await request(app.server).post('/webhooks/facebook').send(webhookPayload);
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'social.new_message', 3000);
    expect(event.data.platform).toBe('facebook');
    expect(event.data.message).toBe('Great product!');
    expect(event.data.from.name).toBe('Fan User');
    expect(event.data.external_id).toBe('cmt-001');
  });
  it('broadcasts social.new_message for Instagram DM', async () => {
    wsClient.subscribe('social');
    const igWebhook = { object: 'instagram', entry: [{ id: 'ig-account-001', messaging: [{
      sender: { id: 'ig-user-789' }, recipient: { id: 'ig-account-001' },
      message: { mid: 'msg-001', text: 'Hello from Instagram!' }
    }] }] };
    await request(app.server).post('/webhooks/instagram').send(igWebhook);
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'social.new_message' && m.data.platform === 'instagram', 3000);
    expect(event.data.message).toBe('Hello from Instagram!');
  });
});

7.2 Post Published Confirmation
const { mockFacebookPost } = require('../setup/mocks');
describe('Social Post Published Confirmation', () => {
  it('broadcasts social.post_published after successful Facebook post', async () => {
    mockFacebookPost('page-123', { id: 'fb-post-999' });
    wsClient.subscribe('social');
    await request(app.server).post('/api/v1/social/posts').set('Authorization', `Bearer ${token}`)
      .send({ account_id: accountId, message: 'Live post!' });
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'social.post_published', 3000);
    expect(event.data.platform).toBe('facebook');
    expect(event.data.platform_post_id).toBe('fb-post-999');
    expect(event.data.published_at).toBeDefined();
  });
});

7.3 Social Engagement Live Feed
describe('Social Engagement Live Feed', () => {
  it('broadcasts social.engagement_update when post receives likes', async () => {
    wsClient.subscribe('social');
    const engagementWebhook = { object: 'page', entry: [{ id: 'page-123', changes: [{ field: 'feed',
      value: { item: 'reaction', reaction_type: 'like', post_id: 'fb-post-999',
        from: { id: 'user-111', name: 'Liker' } } }] }] };
    await request(app.server).post('/webhooks/facebook').send(engagementWebhook);
    const event = await assertEventReceived(wsClient.messages, m => m.type === 'social.engagement_update', 3000);
    expect(event.data.post_id).toBe('fb-post-999');
    expect(event.data.engagement_type).toBe('reaction');
  });
});




8. Kafka Consumer Validation Tests
Kafka consumer tests validate that each microservice correctly processes events published to its subscribed topics. These tests use the KafkaTestConsumer to verify message production and a real Kafka broker (or Redpanda in test environments) to validate end-to-end event flow.

8.1 Contact Service Kafka Consumers
// test/realtime/kafka/contactServiceConsumers.test.js
const { KafkaTestConsumer } = require('../setup/kafkaTestConsumer');
describe('Contact Service — Kafka Event Production', () => {
  let kafkaConsumer;
  beforeAll(async () => {
    kafkaConsumer = new KafkaTestConsumer(['contact.created', 'contact.updated', 'contact.deleted', 'contact.tag_added']);
    await kafkaConsumer.start();
  });
  afterAll(async () => { await kafkaConsumer.stop(); });
  beforeEach(() => kafkaConsumer.clear());
  it('publishes contact.created to Kafka when contact is created via API', async () => {
    await request(app.server).post('/api/v1/contacts').set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'Kafka', email: 'kafka@test.com', tags: ['test'] });
    const msg = await kafkaConsumer.waitForMessage(m => m.topic === 'contact.created' && m.value.contact.email === 'kafka@test.com');
    expect(msg.value.contact.email).toBe('kafka@test.com');
    expect(msg.value.contact.tags).toContain('test');
    expect(msg.value.workspace_id).toBe(workspaceId);
    expect(msg.timestamp).toBeInstanceOf(Date);
  });
  it('publishes contact.updated to Kafka when contact is patched', async () => {
    const created = await request(app.server).post('/api/v1/contacts').set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'Old', email: 'old@test.com' });
    kafkaConsumer.clear();
    await request(app.server).patch(`/api/v1/contacts/${created.body.data.id}`).set('Authorization', `Bearer ${token}`).send({ first_name: 'New' });
    const msg = await kafkaConsumer.waitForMessage(m => m.topic === 'contact.updated');
    expect(msg.value.contact_id).toBe(created.body.data.id);
    expect(msg.value.changes.first_name).toBe('New');
  });
  it('publishes contact.deleted to Kafka when contact is deleted', async () => {
    const created = await request(app.server).post('/api/v1/contacts').set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'Del', email: 'del@test.com' });
    kafkaConsumer.clear();
    await request(app.server).delete(`/api/v1/contacts/${created.body.data.id}`).set('Authorization', `Bearer ${token}`);
    const msg = await kafkaConsumer.waitForMessage(m => m.topic === 'contact.deleted');
    expect(msg.value.contact_id).toBe(created.body.data.id);
    expect(msg.value.workspace_id).toBe(workspaceId);
  });
  it('publishes contact.tag_added to Kafka when tag is applied', async () => {
    const created = await request(app.server).post('/api/v1/contacts').set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'Tag', email: 'tag@test.com' });
    kafkaConsumer.clear();
    await request(app.server).post(`/api/v1/contacts/${created.body.data.id}/tags`).set('Authorization', `Bearer ${token}`).send({ tag: 'vip' });
    const msg = await kafkaConsumer.waitForMessage(m => m.topic === 'contact.tag_added');
    expect(msg.value.tag).toBe('vip');
    expect(msg.value.contact_id).toBe(created.body.data.id);
  });
});

8.2 Pipeline Service Kafka Consumers
describe('Pipeline Service — Kafka Event Production', () => {
  let kafkaConsumer;
  beforeAll(async () => {
    kafkaConsumer = new KafkaTestConsumer(['deal.created', 'deal.updated', 'deal.stage_changed', 'deal.won', 'deal.lost']);
    await kafkaConsumer.start();
  });
  afterAll(async () => { await kafkaConsumer.stop(); });
  beforeEach(() => kafkaConsumer.clear());
  it('publishes deal.created to Kafka when deal is created', async () => {
    await request(app.server).post('/api/v1/deals').set('Authorization', `Bearer ${token}`)
      .send({ title: 'Kafka Deal', value: 15000, pipeline_id: pipelineId, stage_id: stage1Id, contact_id: contactId });
    const msg = await kafkaConsumer.waitForMessage(m => m.topic === 'deal.created');
    expect(msg.value.deal.title).toBe('Kafka Deal');
    expect(msg.value.deal.value).toBe(15000);
    expect(msg.value.workspace_id).toBe(workspaceId);
  });
  it('publishes deal.stage_changed with from/to stage IDs', async () => {
    await request(app.server).patch(`/api/v1/deals/${dealId}/stage`).set('Authorization', `Bearer ${token}`).send({ stage_id: stage2Id });
    const msg = await kafkaConsumer.waitForMessage(m => m.topic === 'deal.stage_changed');
    expect(msg.value.dealId).toBe(dealId);
    expect(msg.value.fromStageId).toBe(stage1Id);
    expect(msg.value.toStageId).toBe(stage2Id);
    expect(msg.value.workspace_id).toBe(workspaceId);
  });
  it('publishes deal.won when deal is marked as won', async () => {
    await request(app.server).post(`/api/v1/deals/${dealId}/won`).set('Authorization', `Bearer ${token}`)
      .send({ close_date: new Date().toISOString() });
    const msg = await kafkaConsumer.waitForMessage(m => m.topic === 'deal.won');
    expect(msg.value.dealId).toBe(dealId);
    expect(msg.value.value).toBeDefined();
  });
});

8.3 Campaign Service Kafka Consumers
describe('Campaign Service — Kafka Event Production', () => {
  let kafkaConsumer;
  beforeAll(async () => {
    kafkaConsumer = new KafkaTestConsumer(['campaign.created', 'campaign.sent', 'email.opened', 'email.clicked']);
    await kafkaConsumer.start();
  });
  afterAll(async () => { await kafkaConsumer.stop(); });
  beforeEach(() => kafkaConsumer.clear());
  it('publishes campaign.created to Kafka when campaign is created', async () => {
    await request(app.server).post('/api/v1/campaigns').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Kafka Campaign', type: 'email', subject: 'S', from_name: 'F', from_email: 'f@test.com' });
    const msg = await kafkaConsumer.waitForMessage(m => m.topic === 'campaign.created');
    expect(msg.value.campaign.name).toBe('Kafka Campaign');
  });
  it('publishes email.opened to Kafka when tracking pixel is hit', async () => {
    await request(app.server).get(`/track/open/${campaignId}/${contactId}`);
    const msg = await kafkaConsumer.waitForMessage(m => m.topic === 'email.opened');
    expect(msg.value.campaignId).toBe(campaignId);
    expect(msg.value.contactId).toBe(contactId);
    expect(msg.value.openedAt).toBeDefined();
  });
  it('publishes email.clicked to Kafka when tracked link is followed', async () => {
    await request(app.server).get(`/track/click/${campaignId}/${contactId}/link-001`);
    const msg = await kafkaConsumer.waitForMessage(m => m.topic === 'email.clicked');
    expect(msg.value.campaignId).toBe(campaignId);
    expect(msg.value.contactId).toBe(contactId);
    expect(msg.value.linkId).toBe('link-001');
  });
});

8.4 Automation Service Kafka Consumers
describe('Automation Service — Kafka Consumer Validation', () => {
  let kafkaConsumer;
  beforeAll(async () => {
    kafkaConsumer = new KafkaTestConsumer(['workflow.enrollment_created', 'workflow.node_executed', 'workflow.completed', 'workflow.failed']);
    await kafkaConsumer.start();
  });
  afterAll(async () => { await kafkaConsumer.stop(); });
  beforeEach(() => kafkaConsumer.clear());
  it('publishes workflow.enrollment_created when contact is enrolled', async () => {
    await request(app.server).post(`/api/v1/workflows/${workflowId}/enroll`).set('Authorization', `Bearer ${token}`).send({ contact_id: contactId });
    const msg = await kafkaConsumer.waitForMessage(m => m.topic === 'workflow.enrollment_created');
    expect(msg.value.workflowId).toBe(workflowId);
    expect(msg.value.contactId).toBe(contactId);
    expect(msg.value.enrollmentId).toBeDefined();
  });
  it('automation service consumes contact.created and auto-enrolls in active workflows', async () => {
    await request(app.server).post(`/api/v1/workflows/${workflowId}/activate`).set('Authorization', `Bearer ${token}`);
    const contactRes = await request(app.server).post('/api/v1/contacts').set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'Auto', email: 'auto@test.com' });
    const newContactId = contactRes.body.data.id;
    const msg = await kafkaConsumer.waitForMessage(m => m.topic === 'workflow.enrollment_created' && m.value.contactId === newContactId, 5000);
    expect(msg.value.workflowId).toBe(workflowId);
    expect(msg.value.trigger).toBe('contact.created');
  });
});

8.5 Email Service Kafka Consumers
describe('Email Service — Kafka Consumer Validation', () => {
  let kafkaConsumer;
  beforeAll(async () => {
    kafkaConsumer = new KafkaTestConsumer(['email.send_requested', 'email.sent', 'email.bounced', 'email.unsubscribed']);
    await kafkaConsumer.start();
  });
  afterAll(async () => { await kafkaConsumer.stop(); });
  beforeEach(() => kafkaConsumer.clear());
  it('email service consumes workflow send_email action and publishes email.sent', async () => {
    await request(app.server).post(`/api/v1/workflows/${emailWorkflowId}/enroll`).set('Authorization', `Bearer ${token}`).send({ contact_id: contactId });
    const msg = await kafkaConsumer.waitForMessage(m => m.topic === 'email.sent', 5000);
    expect(msg.value.contactId).toBe(contactId);
    expect(msg.value.templateId).toBeDefined();
    expect(msg.value.messageId).toBeDefined();
  });
  it('email service consumes bounce notification and publishes email.bounced', async () => {
    const sesNotification = { Type: 'Notification', Message: JSON.stringify({
      notificationType: 'Bounce',
      bounce: { bounceType: 'Permanent', bouncedRecipients: [{ emailAddress: 'bounce@test.com' }] },
    }) };
    await request(app.server).post('/webhooks/ses').send(sesNotification);
    const msg = await kafkaConsumer.waitForMessage(m => m.topic === 'email.bounced', 3000);
    expect(msg.value.email).toBe('bounce@test.com');
    expect(msg.value.bounceType).toBe('Permanent');
  });
});

8.6 Social Service Kafka Consumers
describe('Social Service — Kafka Event Production', () => {
  let kafkaConsumer;
  beforeAll(async () => {
    kafkaConsumer = new KafkaTestConsumer(['social.post_published', 'social.message_received', 'social.engagement_received']);
    await kafkaConsumer.start();
  });
  afterAll(async () => { await kafkaConsumer.stop(); });
  beforeEach(() => kafkaConsumer.clear());
  it('publishes social.post_published to Kafka after successful post', async () => {
    mockFacebookPost('page-123', { id: 'fb-post-kafka' });
    await request(app.server).post('/api/v1/social/posts').set('Authorization', `Bearer ${token}`)
      .send({ account_id: accountId, message: 'Kafka post!' });
    const msg = await kafkaConsumer.waitForMessage(m => m.topic === 'social.post_published', 3000);
    expect(msg.value.platform).toBe('facebook');
    expect(msg.value.platformPostId).toBe('fb-post-kafka');
  });
  it('publishes social.message_received to Kafka when webhook arrives', async () => {
    const webhookPayload = { object: 'page', entry: [{ id: 'page-123', changes: [{ field: 'feed',
      value: { item: 'comment', comment_id: 'cmt-kafka', message: 'Kafka comment!',
        from: { id: 'user-kafka', name: 'Kafka User' } } }] }] };
    await request(app.server).post('/webhooks/facebook').send(webhookPayload);
    const msg = await kafkaConsumer.waitForMessage(m => m.topic === 'social.message_received', 3000);
    expect(msg.value.platform).toBe('facebook');
    expect(msg.value.externalId).toBe('cmt-kafka');
    expect(msg.value.message).toBe('Kafka comment!');
  });
});

8.7 Dead Letter Queue Handling
// test/realtime/kafka/deadLetterQueue.test.js
describe('Dead Letter Queue (DLQ) Handling', () => {
  let kafkaConsumer;
  beforeAll(async () => {
    kafkaConsumer = new KafkaTestConsumer(['crm.dlq', 'crm.dlq.contact', 'crm.dlq.automation']);
    await kafkaConsumer.start();
  });
  afterAll(async () => { await kafkaConsumer.stop(); });
  it('routes malformed messages to DLQ after max retries', async () => {
    // Publish a malformed message directly to a topic
    const { Kafka } = require('kafkajs');
    const kafka = new Kafka({ clientId: 'test-producer', brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'] });
    const producer = kafka.producer();
    await producer.connect();
    await producer.send({
      topic: 'contact.created',
      messages: [{ value: '{ invalid json ' }], // Malformed JSON
    });
    await producer.disconnect();
    // After max retries, message should appear in DLQ
    const dlqMsg = await kafkaConsumer.waitForMessage(m => m.topic === 'crm.dlq.contact', 10000);
    expect(dlqMsg.value.original_topic).toBe('contact.created');
    expect(dlqMsg.value.error).toBeDefined();
    expect(dlqMsg.value.retry_count).toBeGreaterThan(0);
    expect(dlqMsg.value.failed_at).toBeDefined();
  }, 15000);
  it('DLQ messages include original payload and error details', async () => {
    const dlqMessages = kafkaConsumer.getMessages('crm.dlq');
    if (dlqMessages.length > 0) {
      dlqMessages.forEach(msg => {
        expect(msg.value).toHaveProperty('original_topic');
        expect(msg.value).toHaveProperty('original_payload');
        expect(msg.value).toHaveProperty('error');
        expect(msg.value).toHaveProperty('retry_count');
        expect(msg.value).toHaveProperty('failed_at');
      });
    }
  });
});




9. GraphQL Subscription Tests
GraphQL subscriptions provide a typed, schema-driven alternative to raw WebSocket events. These tests use the graphql-ws client to validate that subscriptions deliver correct data when CRM entities change.

9.1 contactUpdated Subscription
// test/realtime/graphql/contactUpdatedSubscription.test.js
const request = require('supertest');
const { getTestApp } = require('../setup/server');
const { GqlSubscriptionClient } = require('../setup/gqlSubscriptionClient');
const { makeToken } = require('../setup/authHelpers');
const { createTestWorkspace, cleanDatabase } = require('../setup/dbHelpers');

const CONTACT_UPDATED_SUBSCRIPTION = `
  subscription ContactUpdated($workspaceId: ID!) {
    contactUpdated(workspaceId: $workspaceId) {
      id
      firstName
      lastName
      email
      leadScore
      tags
      updatedAt
    }
  }
`;

describe('GraphQL contactUpdated Subscription', () => {
  let app, workspaceId, token, gqlClient;
  beforeAll(async () => { app = await getTestApp(); });
  beforeEach(async () => {
    await cleanDatabase();
    ({ workspaceId } = await createTestWorkspace());
    token = makeToken({ workspaceId });
    gqlClient = new GqlSubscriptionClient(workspaceId, token);
    gqlClient.connect();
  });
  afterEach(() => gqlClient.dispose());

  it('receives contactUpdated event when contact is patched', async () => {
    const created = await request(app.server).post('/api/v1/contacts')
      .set('Authorization', `Bearer ${token}`).send({ first_name: 'Alice', email: 'alice@test.com' });
    const contactId = created.body.data.id;

    const { events, ready } = gqlClient.subscribe(CONTACT_UPDATED_SUBSCRIPTION, { workspaceId });
    await ready;

    await request(app.server).patch(`/api/v1/contacts/${contactId}`)
      .set('Authorization', `Bearer ${token}`).send({ first_name: 'Alicia' });

    await gqlClient.waitForEvents(events, 1, 3000);
    expect(events[0].data.contactUpdated.id).toBe(contactId);
    expect(events[0].data.contactUpdated.firstName).toBe('Alicia');
    expect(events[0].data.contactUpdated.email).toBe('alice@test.com');
  });

  it('receives contactUpdated event when lead score changes', async () => {
    const created = await request(app.server).post('/api/v1/contacts')
      .set('Authorization', `Bearer ${token}`).send({ first_name: 'Scorer', email: 'scorer@test.com' });
    const contactId = created.body.data.id;

    const { events, ready } = gqlClient.subscribe(CONTACT_UPDATED_SUBSCRIPTION, { workspaceId });
    await ready;

    await request(app.server).post('/api/v1/events')
      .set('Authorization', `Bearer ${token}`).send({ type: 'email_open', contact_id: contactId });

    await gqlClient.waitForEvents(events, 1, 3000);
    expect(events[0].data.contactUpdated.leadScore).toBe(2);
  });

  it('does NOT receive events from other workspaces', async () => {
    const otherWs = await createTestWorkspace();
    const otherToken = makeToken({ workspaceId: otherWs.workspaceId });

    const { events, ready } = gqlClient.subscribe(CONTACT_UPDATED_SUBSCRIPTION, { workspaceId });
    await ready;

    // Create and update contact in OTHER workspace
    const other = await request(app.server).post('/api/v1/contacts')
      .set('Authorization', `Bearer ${otherToken}`).send({ first_name: 'Other', email: 'other@test.com' });
    await request(app.server).patch(`/api/v1/contacts/${other.body.data.id}`)
      .set('Authorization', `Bearer ${otherToken}`).send({ first_name: 'Changed' });

    await new Promise(r => setTimeout(r, 500));
    expect(events).toHaveLength(0); // No cross-workspace events
  });
});

9.2 dealStageChanged Subscription
// test/realtime/graphql/dealStageChangedSubscription.test.js
const DEAL_STAGE_CHANGED_SUBSCRIPTION = `
  subscription DealStageChanged($workspaceId: ID!) {
    dealStageChanged(workspaceId: $workspaceId) {
      dealId
      dealTitle
      dealValue
      fromStageId
      fromStageName
      toStageId
      toStageName
      newProbability
      changedBy
      changedAt
    }
  }
`;

describe('GraphQL dealStageChanged Subscription', () => {
  it('receives dealStageChanged event with full stage transition data', async () => {
    const { events, ready } = gqlClient.subscribe(DEAL_STAGE_CHANGED_SUBSCRIPTION, { workspaceId });
    await ready;

    await request(app.server).patch(`/api/v1/deals/${dealId}/stage`)
      .set('Authorization', `Bearer ${token}`).send({ stage_id: stage2Id });

    await gqlClient.waitForEvents(events, 1, 3000);
    const payload = events[0].data.dealStageChanged;
    expect(payload.dealId).toBe(dealId);
    expect(payload.dealTitle).toBe('Test Deal');
    expect(payload.fromStageId).toBe(stage1Id);
    expect(payload.toStageId).toBe(stage2Id);
    expect(payload.fromStageName).toBe('Lead');
    expect(payload.toStageName).toBe('Qualified');
    expect(payload.newProbability).toBeDefined();
    expect(payload.changedAt).toBeDefined();
  });

  it('receives multiple dealStageChanged events for sequential transitions', async () => {
    const { events, ready } = gqlClient.subscribe(DEAL_STAGE_CHANGED_SUBSCRIPTION, { workspaceId });
    await ready;

    // Move through two stages sequentially
    await request(app.server).patch(`/api/v1/deals/${dealId}/stage`).set('Authorization', `Bearer ${token}`).send({ stage_id: stage2Id });
    await request(app.server).patch(`/api/v1/deals/${dealId}/stage`).set('Authorization', `Bearer ${token}`).send({ stage_id: stage3Id });

    await gqlClient.waitForEvents(events, 2, 5000);
    expect(events).toHaveLength(2);
    expect(events[0].data.dealStageChanged.toStageId).toBe(stage2Id);
    expect(events[1].data.dealStageChanged.toStageId).toBe(stage3Id);
  });
});

9.3 workflowProgress Subscription
// test/realtime/graphql/workflowProgressSubscription.test.js
const WORKFLOW_PROGRESS_SUBSCRIPTION = `
  subscription WorkflowProgress($workflowId: ID!) {
    workflowProgress(workflowId: $workflowId) {
      enrollmentId
      contactId
      currentNodeId
      currentNodeType
      status
      nodesExecuted
      totalNodes
      progressPercent
      lastExecutedAt
    }
  }
`;

describe('GraphQL workflowProgress Subscription', () => {
  it('streams node execution progress as workflow runs', async () => {
    const { events, ready } = gqlClient.subscribe(WORKFLOW_PROGRESS_SUBSCRIPTION, { workflowId });
    await ready;

    await request(app.server).post(`/api/v1/workflows/${workflowId}/enroll`)
      .set('Authorization', `Bearer ${token}`).send({ contact_id: contactId });

    // Wait for at least one progress event
    await gqlClient.waitForEvents(events, 1, 5000);
    const progress = events[0].data.workflowProgress;
    expect(progress.contactId).toBe(contactId);
    expect(progress.enrollmentId).toBeDefined();
    expect(progress.currentNodeType).toBeDefined();
    expect(progress.nodesExecuted).toBeGreaterThanOrEqual(0);
    expect(progress.progressPercent).toBeGreaterThanOrEqual(0);
    expect(progress.progressPercent).toBeLessThanOrEqual(100);
  });
  it('final progress event has status=completed and progressPercent=100', async () => {
    const { events, ready } = gqlClient.subscribe(WORKFLOW_PROGRESS_SUBSCRIPTION, { workflowId: simpleWorkflowId });
    await ready;
    await request(app.server).post(`/api/v1/workflows/${simpleWorkflowId}/enroll`)
      .set('Authorization', `Bearer ${token}`).send({ contact_id: contactId });
    await new Promise(r => setTimeout(r, 1000));
    const completedEvent = events.find(e => e.data.workflowProgress.status === 'completed');
    expect(completedEvent).toBeDefined();
    expect(completedEvent.data.workflowProgress.progressPercent).toBe(100);
  });
});




10. End-to-End Real-Time Flow Tests
End-to-end real-time tests validate complete event chains — from a REST API action through Kafka, through the WebSocket broadcast layer, to the connected client. These are the most comprehensive tests in the suite.

10.1 Full Pipeline Stage Change → WebSocket → Kafka Flow
// test/realtime/e2e/pipelineStageChangeFlow.test.js
const request = require('supertest');
const { getTestApp } = require('../setup/server');
const { TestWsClient } = require('../setup/wsClient');
const { KafkaTestConsumer } = require('../setup/kafkaTestConsumer');
const { makeToken } = require('../setup/authHelpers');
const { createTestWorkspace, seedContacts, cleanDatabase } = require('../setup/dbHelpers');
const { assertEventReceived, measureEventLatency } = require('../setup/eventAssertions');

describe('E2E: Pipeline Stage Change → WebSocket → Kafka', () => {
  let app, workspaceId, token, wsClient, kafkaConsumer;
  let pipelineId, stage1Id, stage2Id, dealId, contactId;

  beforeAll(async () => {
    app = await getTestApp();
    kafkaConsumer = new KafkaTestConsumer(['deal.stage_changed', 'pipeline.forecast_updated']);
    await kafkaConsumer.start();
  });
  afterAll(async () => { await kafkaConsumer.stop(); });
  beforeEach(async () => {
    await cleanDatabase(); kafkaConsumer.clear();
    ({ workspaceId } = await createTestWorkspace());
    token = makeToken({ workspaceId });
    wsClient = new TestWsClient(workspaceId);
    await wsClient.connect();
    wsClient.subscribe('pipeline');
    const contacts = await seedContacts(workspaceId, 1);
    contactId = contacts[0].id;
    const pRes = await request(app.server).post('/api/v1/pipelines').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Sales', stages: [{ name: 'Lead', order: 1, probability: 10 }, { name: 'Qualified', order: 2, probability: 40 }] });
    pipelineId = pRes.body.data.id;
    stage1Id = pRes.body.data.stages[0].id;
    stage2Id = pRes.body.data.stages[1].id;
    const dRes = await request(app.server).post('/api/v1/deals').set('Authorization', `Bearer ${token}`)
      .send({ title: 'E2E Deal', value: 25000, pipeline_id: pipelineId, stage_id: stage1Id, contact_id: contactId });
    dealId = dRes.body.data.id;
  });
  afterEach(() => wsClient.close());

  it('stage change triggers WebSocket broadcast AND Kafka event simultaneously', async () => {
    // Trigger stage change
    await request(app.server).patch(`/api/v1/deals/${dealId}/stage`)
      .set('Authorization', `Bearer ${token}`).send({ stage_id: stage2Id });

    // Assert BOTH WebSocket and Kafka receive the event
    const [wsEvent, kafkaMsg] = await Promise.all([
      assertEventReceived(wsClient.messages, m => m.type === 'deal.stage_changed' && m.data.deal_id === dealId, 3000),
      kafkaConsumer.waitForMessage(m => m.topic === 'deal.stage_changed' && m.value.dealId === dealId, 3000),
    ]);

    // Verify WebSocket event data
    expect(wsEvent.data.from_stage_id).toBe(stage1Id);
    expect(wsEvent.data.to_stage_id).toBe(stage2Id);
    expect(wsEvent.data.deal_title).toBe('E2E Deal');

    // Verify Kafka message data
    expect(kafkaMsg.value.fromStageId).toBe(stage1Id);
    expect(kafkaMsg.value.toStageId).toBe(stage2Id);
    expect(kafkaMsg.value.workspace_id).toBe(workspaceId);
  });

  it('stage change also triggers forecast update broadcast', async () => {
    wsClient.subscribe(`pipeline:${pipelineId}`);
    await request(app.server).patch(`/api/v1/deals/${dealId}/stage`)
      .set('Authorization', `Bearer ${token}`).send({ stage_id: stage2Id });

    const forecastEvent = await assertEventReceived(wsClient.messages, m => m.type === 'pipeline.forecast_updated', 3000);
    expect(forecastEvent.data.pipeline_id).toBe(pipelineId);
    expect(forecastEvent.data.weighted_value).toBeDefined();
  });

  it('measures end-to-end event latency under 200ms', async () => {
    const latency = await measureEventLatency(
      () => request(app.server).patch(`/api/v1/deals/${dealId}/stage`).set('Authorization', `Bearer ${token}`).send({ stage_id: stage2Id }),
      () => assertEventReceived(wsClient.messages, m => m.type === 'deal.stage_changed', 3000)
    );
    console.log(`Stage change event latency: ${latency}ms`);
    expect(latency).toBeLessThan(500); // Allow up to 500ms in test environment
  });
});

10.2 Contact Created → Automation → WebSocket Notification
// test/realtime/e2e/contactAutomationFlow.test.js
describe('E2E: Contact Created → Automation Trigger → WebSocket Notification', () => {
  it('creates contact, triggers workflow, broadcasts enrollment and node events', async () => {
    // Step 1: Create and activate a workflow with contact.created trigger
    const wfRes = await request(app.server).post('/api/v1/workflows').set('Authorization', `Bearer ${token}`)
      .send({ name: 'Welcome Flow', trigger_type: 'contact.created', trigger_config: {},
        nodes: [{ id: 'n1', type: 'trigger', next: 'n2' },
                { id: 'n2', type: 'add_tag', config: { tag: 'welcomed' }, next: null }] });
    const workflowId = wfRes.body.data.id;
    await request(app.server).post(`/api/v1/workflows/${workflowId}/activate`).set('Authorization', `Bearer ${token}`);

    // Step 2: Subscribe to automation and contact channels
    wsClient.subscribe('automation');
    wsClient.subscribe('contacts');

    // Step 3: Create contact — triggers workflow
    const contactRes = await request(app.server).post('/api/v1/contacts').set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'E2E', email: 'e2e@test.com' });
    const contactId = contactRes.body.data.id;
    expect(contactRes.status).toBe(201);

    // Step 4: Assert contact.created WebSocket event
    const contactEvent = await assertEventReceived(wsClient.messages, m => m.type === 'contact.created' && m.data.id === contactId, 3000);
    expect(contactEvent.data.email).toBe('e2e@test.com');

    // Step 5: Assert workflow enrollment WebSocket event
    const enrollEvent = await assertEventReceived(wsClient.messages, m => m.type === 'workflow.contact_enrolled' && m.data.contact_id === contactId, 5000);
    expect(enrollEvent.data.workflow_id).toBe(workflowId);
    expect(enrollEvent.data.trigger).toBe('contact.created');

    // Step 6: Assert workflow completion event
    const completeEvent = await assertEventReceived(wsClient.messages, m => m.type === 'workflow.completed' && m.data.contact_id === contactId, 5000);
    expect(completeEvent.data.workflow_id).toBe(workflowId);

    // Step 7: Assert contact was tagged 'welcomed' (tag event broadcast)
    const tagEvent = await assertEventReceived(wsClient.messages, m => m.type === 'contact.tag_added' && m.data.contact_id === contactId, 5000);
    expect(tagEvent.data.tag).toBe('welcomed');

    // Step 8: Verify final contact state via REST
    const finalContact = await request(app.server).get(`/api/v1/contacts/${contactId}`).set('Authorization', `Bearer ${token}`);
    expect(finalContact.body.data.tags).toContain('welcomed');
  });
});

10.3 Campaign Send → Live Analytics Update Flow
// test/realtime/e2e/campaignAnalyticsFlow.test.js
describe('E2E: Campaign Send → Email Open → Live Analytics Update', () => {
  it('sends campaign, simulates open, verifies live analytics broadcast', async () => {
    // Step 1: Seed contacts and create campaign
    await seedContacts(workspaceId, 5);
    const campRes = await request(app.server).post('/api/v1/campaigns').set('Authorization', `Bearer ${token}`)
      .send({ name: 'E2E Campaign', type: 'email', subject: 'Test', from_name: 'F', from_email: 'f@test.com',
        content: { html: '<p>Hi {{first_name}}</p>' } });
    const campaignId = campRes.body.data.id;

    // Step 2: Subscribe to campaign channel
    wsClient.subscribe(`campaign:${campaignId}`);

    // Step 3: Send campaign
    await request(app.server).post(`/api/v1/campaigns/${campaignId}/send`)
      .set('Authorization', `Bearer ${token}`).send({ audience: { type: 'all' } });

    // Step 4: Assert send_started event
    const startEvent = await assertEventReceived(wsClient.messages, m => m.type === 'campaign.send_started', 3000);
    expect(startEvent.data.total_recipients).toBe(5);

    // Step 5: Assert send_completed event
    const completeEvent = await assertEventReceived(wsClient.messages, m => m.type === 'campaign.send_completed', 5000);
    expect(completeEvent.data.total_sent).toBe(5);

    // Step 6: Simulate email open via tracking pixel
    const contacts = await request(app.server).get('/api/v1/contacts').set('Authorization', `Bearer ${token}`);
    const firstContactId = contacts.body.data[0].id;
    await request(app.server).get(`/track/open/${campaignId}/${firstContactId}`);

    // Step 7: Assert email_opened event
    const openEvent = await assertEventReceived(wsClient.messages, m => m.type === 'campaign.email_opened', 3000);
    expect(openEvent.data.campaign_id).toBe(campaignId);
    expect(openEvent.data.contact_id).toBe(firstContactId);

    // Step 8: Assert analytics_updated event with updated metrics
    const analyticsEvent = await assertEventReceived(wsClient.messages, m => m.type === 'campaign.analytics_updated', 3000);
    expect(analyticsEvent.data.metrics.opened).toBe(1);
    expect(analyticsEvent.data.metrics.open_rate).toBe(0.2); // 1/5 = 20%
  });
});




11. Performance & Load Tests for Real-Time Events
Performance tests validate that the real-time infrastructure handles concurrent connections and high-throughput event streams without degradation. These tests are tagged @slow and excluded from the standard CI run.

11.1 Concurrent WebSocket Connections
// test/realtime/performance/concurrentConnections.test.js
// @slow — run with: npx jest --testNamePattern="@slow"
const { TestWsClient } = require('../setup/wsClient');

describe('Concurrent WebSocket Connections @slow', () => {
  it('handles 100 concurrent WebSocket connections', async () => {
    const clients = Array.from({ length: 100 }, () => new TestWsClient(workspaceId));
    const connectResults = await Promise.allSettled(clients.map(c => c.connect()));

    const successful = connectResults.filter(r => r.status === 'fulfilled');
    const failed = connectResults.filter(r => r.status === 'rejected');

    console.log(`Connected: ${successful.length}/100, Failed: ${failed.length}/100`);
    expect(successful.length).toBeGreaterThanOrEqual(95); // Allow 5% failure rate

    // Cleanup
    clients.forEach(c => c.close());
  }, 30000);

  it('broadcasts stage change event to 50 concurrent subscribers', async () => {
    const clients = Array.from({ length: 50 }, (_, i) => new TestWsClient(workspaceId, `user-${i}`));
    await Promise.all(clients.map(c => c.connect()));
    clients.forEach(c => c.subscribe('pipeline'));

    // Trigger one stage change
    await request(app.server).patch(`/api/v1/deals/${dealId}/stage`).set('Authorization', `Bearer ${token}`).send({ stage_id: stage2Id });

    // All 50 clients should receive the event
    await new Promise(r => setTimeout(r, 2000));
    const receivedCount = clients.filter(c => c.messages.some(m => m.type === 'deal.stage_changed')).length;
    console.log(`Received by ${receivedCount}/50 clients`);
    expect(receivedCount).toBeGreaterThanOrEqual(48); // Allow 4% delivery failure

    clients.forEach(c => c.close());
  }, 30000);

  it('measures average event delivery time across 20 clients', async () => {
    const clients = Array.from({ length: 20 }, (_, i) => new TestWsClient(workspaceId, `perf-user-${i}`));
    await Promise.all(clients.map(c => c.connect()));
    clients.forEach(c => c.subscribe('pipeline'));

    const triggerTime = Date.now();
    await request(app.server).patch(`/api/v1/deals/${dealId}/stage`).set('Authorization', `Bearer ${token}`).send({ stage_id: stage2Id });

    await new Promise(r => setTimeout(r, 1000));
    const deliveryTimes = clients
      .map(c => c.messages.find(m => m.type === 'deal.stage_changed'))
      .filter(Boolean)
      .map(m => new Date(m.data.timestamp).getTime() - triggerTime);

    if (deliveryTimes.length > 0) {
      const avgLatency = deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length;
      const maxLatency = Math.max(...deliveryTimes);
      console.log(`Avg latency: ${avgLatency.toFixed(0)}ms, Max: ${maxLatency}ms`);
      expect(avgLatency).toBeLessThan(300);
      expect(maxLatency).toBeLessThan(1000);
    }
    clients.forEach(c => c.close());
  }, 30000);
});

11.2 High-Throughput Kafka Event Processing
// test/realtime/performance/kafkaThroughput.test.js
// @slow — run with: npx jest --testNamePattern="@slow"
const { KafkaTestConsumer } = require('../setup/kafkaTestConsumer');

describe('High-Throughput Kafka Event Processing @slow', () => {
  it('processes 1000 contact.created events within 10 seconds', async () => {
    const kafkaConsumer = new KafkaTestConsumer(['contact.created']);
    await kafkaConsumer.start();

    const startTime = Date.now();
    const BATCH_SIZE = 1000;

    // Create 1000 contacts in parallel batches of 50
    const batches = Array.from({ length: 20 }, (_, batchIdx) =>
      Array.from({ length: 50 }, (_, i) => ({
        first_name: `Perf${batchIdx * 50 + i}`,
        email: `perf-${batchIdx}-${i}-${Date.now()}@test.com`,
      }))
    );

    for (const batch of batches) {
      await Promise.all(batch.map(contact =>
        request(app.server).post('/api/v1/contacts').set('Authorization', `Bearer ${token}`).send(contact)
      ));
    }

    // Wait for all Kafka messages to be consumed
    const deadline = Date.now() + 10000;
    while (kafkaConsumer.getMessages('contact.created').length < BATCH_SIZE && Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 100));
    }

    const elapsed = Date.now() - startTime;
    const processed = kafkaConsumer.getMessages('contact.created').length;
    const throughput = (processed / elapsed) * 1000;

    console.log(`Processed ${processed}/${BATCH_SIZE} events in ${elapsed}ms (${throughput.toFixed(0)} events/sec)`);
    expect(processed).toBeGreaterThanOrEqual(BATCH_SIZE * 0.99); // 99% delivery guarantee
    expect(elapsed).toBeLessThan(10000);

    await kafkaConsumer.stop();
  }, 30000);

  it('Kafka consumer lag stays below 100 messages under sustained load', async () => {
    const { Kafka } = require('kafkajs');
    const kafka = new Kafka({ clientId: 'lag-monitor', brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'] });
    const admin = kafka.admin();
    await admin.connect();

    // Measure consumer group lag
    const offsets = await admin.fetchOffsets({ groupId: 'contact-service-consumer', topics: ['contact.created'] });
    const topicOffsets = await admin.fetchTopicOffsets('contact.created');

    let totalLag = 0;
    offsets.forEach(({ partitions }) => {
      partitions.forEach(({ partition, offset }) => {
        const topicPartition = topicOffsets.find(t => t.partition === partition);
        if (topicPartition) totalLag += parseInt(topicPartition.offset) - parseInt(offset);
      });
    });

    console.log(`Consumer group lag: ${totalLag} messages`);
    expect(totalLag).toBeLessThan(100);
    await admin.disconnect();
  }, 15000);
});




Running the Real-Time Test Suite
Real-time tests require running Kafka, Redis, and PostgreSQL. Use the provided Docker Compose configuration to spin up all dependencies before running the suite.

# Start all dependencies
docker-compose -f docker-compose.realtime-test.yml up -d

# Wait for Kafka to be ready
npx wait-on tcp:9092 --timeout 30000

# Run all real-time tests
npx jest --config jest.realtime.config.js

# Run only WebSocket tests
npx jest --config jest.realtime.config.js test/realtime/ws/

# Run only Kafka consumer tests
npx jest --config jest.realtime.config.js test/realtime/kafka/

# Run only GraphQL subscription tests
npx jest --config jest.realtime.config.js test/realtime/graphql/

# Run E2E real-time flow tests
npx jest --config jest.realtime.config.js test/realtime/e2e/

# Run performance tests (slow — excluded from CI)
npx jest --config jest.realtime.config.js --testNamePattern="@slow"

# jest.realtime.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/realtime/**/*.test.js'],
  globalSetup: './test/realtime/setup/globalSetup.js',
  globalTeardown: './test/realtime/setup/globalTeardown.js',
  testTimeout: 30000,
  maxWorkers: 1,
  verbose: true,
  testPathIgnorePatterns: process.env.SKIP_SLOW ? ['performance'] : [],
};

# docker-compose.realtime-test.yml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment: { POSTGRES_DB: crm_realtime_test, POSTGRES_USER: postgres, POSTGRES_PASSWORD: postgres }
    ports: ['5432:5432']
  redis:
    image: redis:7-alpine
    ports: ['6379:6379']
  kafka:
    image: redpandadata/redpanda:latest
    command: redpanda start --overprovisioned --smp 1 --memory 512M --reserve-memory 0M --node-id 0 --check=false
    ports: ['9092:9092', '9644:9644']

— End of CRM WebSocket & Real-Time Event Test Suite —