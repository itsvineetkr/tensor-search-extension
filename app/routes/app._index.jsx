// app/routes/_index.jsx
import { Form } from '@remix-run/react';

export default function AdminPanel() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2rem' }}>ShopSearch Admin</h1>
      <p>Sync your products and enable search block on storefront</p>

      <Form method="post" action="/api/sync">
        <button style={{ padding: '10px 20px', marginBottom: '1rem' }}>
          🔄 Sync Products
        </button>
      </Form>

      <br />

      <a
        href="/apps/search-extension"
        style={{
          display: 'inline-block',
          padding: '10px 20px',
          backgroundColor: '#000',
          color: '#fff',
          textDecoration: 'none',
        }}
      >
        Enable Search (Theme Editor)
      </a>
    </div>
  );
}
