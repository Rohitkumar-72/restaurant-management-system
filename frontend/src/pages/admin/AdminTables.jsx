import { useEffect, useState } from 'react';
import { Download, Plus, Printer, Search } from 'lucide-react';
import { tableService } from '../../services/tableService.js';

const emptyForm = { tableNumber: '', qrIdentifier: '', capacity: 4, isActive: true, status: 'AVAILABLE' };

function AdminTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await tableService.list({
        search,
        status,
      });
      setTables(data);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [status]);

  const createTable = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await tableService.create({
        ...form,
        capacity: Number(form.capacity),
      });
      setForm(emptyForm);
      await refresh();
    } catch (requestError) {
      setError(requestError.message || 'Unable to create table');
    } finally {
      setSaving(false);
    }
  };

  const updateTable = async (table, changes) => {
    try {
      await tableService.update(table._id, changes);
      await refresh();
    } catch (requestError) {
      setError(requestError.message || 'Unable to update table');
    }
  };

  const openQr = async (table) => {
    try {
      const qr = await tableService.getQr(table._id);
      setPreview(qr);
    } catch (requestError) {
      setError(requestError.message || 'Unable to generate QR');
    }
  };

  const printCards = (cards) => {
    if (!cards.length) return;
    const cardsHtml = cards.map((card) => `
      <section class="print-card">
        <div class="brand">SAPPHIRE VISTA</div>
        <div class="table">TABLE ${card.tableNumber}</div>
        <img src="${card.dataUrl}" alt="QR code for table ${card.tableNumber}" />
        <div class="instruction">Scan to Explore Menu &amp; Order</div>
      </section>
    `).join('');
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;
    printWindow.document.write(`
      <!doctype html><html><head><title>Sapphire Vista Tables</title>
      <style>
        body{margin:0;font-family:Georgia,serif;color:#0b0b0c;background:#fff}
        .print-card{width:260px;height:390px;border:1px solid #d4af37;margin:12px;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;page-break-inside:avoid;text-align:center}
        .brand{font-size:18px;color:#d4af37}.table{font-size:28px;margin:14px 0}.print-card img{width:220px;height:220px}.instruction{font-size:12px;margin-top:12px}
        @media print{@page{margin:8mm}.print-card{margin:4mm}}
      </style></head><body>${cardsHtml}</body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const printIndividual = async (table) => {
    const qr = await tableService.getQr(table._id);
    printCards([qr]);
  };

  const bulkPrint = async () => {
    const activeTables = tables.filter((table) => table.isActive);
    const cards = await Promise.all(activeTables.map((table) => tableService.getQr(table._id)));
    printCards(cards);
  };

  const downloadQr = (qr) => {
    const link = document.createElement('a');
    link.href = qr.dataUrl;
    link.download = `sapphire-vista-table-${qr.tableNumber}.png`;
    link.click();
  };

  return (
    <section className="admin-tables-page">
      <div className="admin-orders-heading">
        <div>
          <p className="admin-demo-label">Dine-in operations</p>
          <h1>Tables &amp; QR</h1>
        </div>
        <button type="button" className="admin-table-bulk" onClick={bulkPrint}>
          <Printer size={16} /> Bulk print
        </button>
      </div>

      {error && <p className="admin-table-error" role="alert">{error}</p>}

      <form className="admin-table-form" onSubmit={createTable}>
        <label>
          Table number
          <input value={form.tableNumber} onChange={(event) => setForm({ ...form, tableNumber: event.target.value })} placeholder="07" />
        </label>
        <label>
          QR identifier
          <input value={form.qrIdentifier} onChange={(event) => setForm({ ...form, qrIdentifier: event.target.value })} placeholder="t07" />
        </label>
        <label>
          Capacity
          <input type="number" min="1" max="200" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} />
        </label>
        <button type="submit" disabled={saving}><Plus size={16} /> {saving ? 'Adding...' : 'Add table'}</button>
      </form>

      <div className="admin-orders-tools">
        <label className="admin-orders-search">
          <Search size={16} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} onBlur={refresh} placeholder="Search table number" />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter table status">
          <option value="">All statuses</option>
          {['AVAILABLE', 'OCCUPIED', 'ORDERING', 'RESERVED'].map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="admin-orders-empty">Loading tables...</div>
      ) : (
        <div className="admin-table-grid">
          {tables.map((table) => (
            <article className="admin-table-card" key={table._id}>
              <header>
                <div><span>Table</span><strong>{table.tableNumber}</strong></div>
                <span className={`admin-status status-${table.status.toLowerCase()}`}>{table.status}</span>
              </header>
              <div className="admin-table-meta">
                <span>Capacity {table.capacity}</span>
                <span>{table.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <select
                value={table.status}
                onChange={(event) => updateTable(table, { status: event.target.value })}
                aria-label={`Status for table ${table.tableNumber}`}
              >
                {['AVAILABLE', 'OCCUPIED', 'ORDERING', 'RESERVED'].map((item) => <option key={item}>{item}</option>)}
              </select>
              <div className="admin-table-actions">
                <button type="button" onClick={() => openQr(table)}>Preview QR</button>
                <button type="button" onClick={() => printIndividual(table)}><Printer size={15} /> Print</button>
                <button type="button" onClick={() => updateTable(table, { isActive: !table.isActive })}>
                  {table.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {preview && (
        <div className="admin-qr-modal" role="dialog" aria-modal="true" aria-label={`QR for table ${preview.tableNumber}`}>
          <button type="button" className="admin-qr-close" onClick={() => setPreview(null)}>Close</button>
          <strong>Table {preview.tableNumber}</strong>
          <img src={preview.dataUrl} alt={`QR code for table ${preview.tableNumber}`} />
          <button type="button" onClick={() => downloadQr(preview)}><Download size={16} /> Download</button>
        </div>
      )}
    </section>
  );
}

export default AdminTables;
