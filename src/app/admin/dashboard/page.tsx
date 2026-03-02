import React from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import Link from 'next/link';

export default function AdminDashboard() {
    return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem' }}>Platform Controller</h1>
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>Global Analytics & Campus Management</p>
        </div>
        <Link href="/admin/settings">
          <Button variant="primary">Platform Settings</Button>
        </Link>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <Card>
          <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>Total Revenue</p>
          <h3 style={{ fontSize: '1.75rem', marginTop: '0.5rem' }}>₹4,52,000</h3>
        </Card>
        <Card>
          <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>Total Orders</p>
          <h3 style={{ fontSize: '1.75rem', marginTop: '0.5rem' }}>1,240</h3>
        </Card>
        <Card>
          <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>Active Campuses</p>
          <h3 style={{ fontSize: '1.75rem', marginTop: '0.5rem' }}>12</h3>
        </div>
        <Card>
          <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem' }}>Platform Profit</p>
          <h3 style={{ fontSize: '1.75rem', marginTop: '0.5rem', color: 'hsl(142, 70%, 45%)' }}>₹42,100</h3>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        <section>
          <h3 style={{ marginBottom: '1.5rem' }}>Campus Performance</h3>
          <Card style={{ padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid hsl(var(--border))', textAlign: 'left' }}>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Campus Name</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Vendors</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Orders Today</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                  <td style={{ padding: '1rem' }}>IIT Bombay</td>
                  <td style={{ padding: '1rem' }}>8</td>
                  <td style={{ padding: '1rem' }}>142</td>
                  <td style={{ padding: '1rem' }}><span style={{ color: 'hsl(142, 70%, 45%)', fontSize: '0.875rem' }}>ACTIVE</span></td>
                </tr>
                <tr style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                  <td style={{ padding: '1rem' }}>BITS Pilani</td>
                  <td style={{ padding: '1rem' }}>5</td>
                  <td style={{ padding: '1rem' }}>89</td>
                  <td style={{ padding: '1rem' }}><span style={{ color: 'hsl(142, 70%, 45%)', fontSize: '0.875rem' }}>ACTIVE</span></td>
                </tr>
              </tbody>
            </table>
          </Card>
        </section>

        <section>
          <h3 style={{ marginBottom: '1.5rem' }}>Pending Approvals</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1rem' }}>QuickPrint Shop</h4>
                <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>Vendor • MIT Manipal</p>
              </div>
              <Button variant="secondary" size="sm">Review</Button>
            </Card>
            <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '1rem' }}>Arjun Kumar</h4>
                <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>Partner • IIT Delhi</p>
              </div>
              <Button variant="secondary" size="sm">Review</Button>
            </Card>
          </div>
        </section>
      </div>
    </div >
  );
}
