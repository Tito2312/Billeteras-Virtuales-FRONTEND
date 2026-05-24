import React, { useState, useEffect } from 'react';
import { getToken } from '../../API/auth';
import { API_URL } from '../../API/config';

const BASE_URL = `${API_URL}/benefits`;

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

const fmt = (v) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v || 0);

const emptyForm = { name: '', code: '', description: '', pointsCost: '', moneyValue: '' };

const AdminBenefits = () => {
  const [benefits, setBenefits] = useState([]);
  const [redeemed, setRedeemed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('list'); 
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [bRes, rRes] = await Promise.all([
      fetch(BASE_URL, { headers: headers() }),
      fetch(`${BASE_URL}/redeemed`, { headers: headers() }),
    ]);
    if (bRes.ok) setBenefits(await bRes.json());
    if (rRes.ok) setRedeemed(await rRes.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (id) => {
    await fetch(`${BASE_URL}/toggle/${id}`, { method: 'PATCH', headers: headers() });
    load();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!form.name || !form.code || !form.pointsCost || !form.moneyValue) {
      setFormError('Completa todos los campos obligatorios.');
      return;
    }
    setSaving(true);
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        name: form.name,
        code: form.code.toUpperCase(),
        description: form.description,
        pointsCost: parseInt(form.pointsCost),
        moneyValue: parseFloat(form.moneyValue),
        active: true,
      }),
    });
    if (res.ok) {
      setFormSuccess('Beneficio creado exitosamente.');
      setForm(emptyForm);
      load();
    } else {
      const err = await res.json().catch(() => ({}));
      setFormError(err.message || 'Error al crear el beneficio.');
    }
    setSaving(false);
  };

  return (
    <div style={{ padding: '24px', maxWidth: 900 }}>
      <h1 style={{ color: '#1e1b4b', marginBottom: 4 }}>Gestión de Beneficios</h1>
      <p style={{ color: '#6b7280', marginBottom: 24 }}>Crea, activa/desactiva beneficios y consulta canjes.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[['list', '🎁 Beneficios'], ['create', '➕ Nuevo beneficio'], ['redeemed', '📋 Canjes']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
            background: tab === id ? '#7c3aed' : '#f1f5f9',
            color: tab === id ? '#fff' : '#374151',
          }}>{label}</button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#6b7280' }}>Cargando...</p>
      ) : tab === 'list' ? (
        <div>
          {benefits.length === 0 ? (
            <p style={{ color: '#9ca3af' }}>No hay beneficios creados aún.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#6b7280', textAlign: 'left' }}>
                  {['Nombre', 'Código', 'Costo (pts)', 'Valor ($)', 'Estado', 'Acción'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {benefits.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e1b4b' }}>{b.name}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#7c3aed' }}>{b.code}</td>
                    <td style={{ padding: '10px 12px' }}>{b.pointsCost?.toLocaleString('es-CO')} pts</td>
                    <td style={{ padding: '10px 12px', color: '#059669', fontWeight: 600 }}>{fmt(b.moneyValue)}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: b.active ? '#dcfce7' : '#fee2e2',
                        color: b.active ? '#059669' : '#dc2626',
                      }}>{b.active ? 'Activo' : 'Inactivo'}</span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <button onClick={() => handleToggle(b.id)} style={{
                        padding: '5px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        fontWeight: 600, fontSize: 12,
                        background: b.active ? '#fee2e2' : '#dcfce7',
                        color: b.active ? '#dc2626' : '#059669',
                      }}>{b.active ? 'Desactivar' : 'Activar'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : tab === 'create' ? (
        <div style={{ maxWidth: 480 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Nombre *', key: 'name', placeholder: 'Ej: Bono de $5.000' },
              { label: 'Código único *', key: 'code', placeholder: 'Ej: BONO5K' },
              { label: 'Descripción', key: 'description', placeholder: 'Descripción del beneficio' },
              { label: 'Costo en puntos *', key: 'pointsCost', placeholder: '250', type: 'number' },
              { label: 'Valor en dinero (COP) *', key: 'moneyValue', placeholder: '5000', type: 'number' },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</label>
                <input
                  type={type || 'text'}
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    border: '1px solid #e2e8f0', fontSize: 13, boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>
            ))}

            {formError && (
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '8px 12px', borderRadius: 8, fontSize: 13 }}>
                ⚠️ {formError}
              </div>
            )}
            {formSuccess && (
              <div style={{ background: '#dcfce7', color: '#059669', padding: '8px 12px', borderRadius: 8, fontSize: 13 }}>
                ✅ {formSuccess}
              </div>
            )}

            <button type="submit" disabled={saving} style={{
              padding: '11px 24px', background: '#7c3aed', color: '#fff',
              border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>
              {saving ? 'Creando...' : 'Crear Beneficio'}
            </button>
          </form>
        </div>
      ) : (
        <div>
          {redeemed.length === 0 ? (
            <p style={{ color: '#9ca3af' }}>No hay canjes registrados.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#6b7280', textAlign: 'left' }}>
                  {['Beneficio', 'Usuario', 'Puntos', 'Fecha', 'Estado'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...redeemed].sort((a, b) => new Date(b.redeemedAt) - new Date(a.redeemedAt)).map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{r.benefitName}</td>
                    <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: 11 }}>{r.userId?.substring(0, 12)}...</td>
                    <td style={{ padding: '10px 12px', color: '#d97706' }}>−{r.pointsSpent?.toLocaleString('es-CO')} pts</td>
                    <td style={{ padding: '10px 12px', color: '#6b7280' }}>
                      {r.redeemedAt ? new Date(r.redeemedAt + 'Z').toLocaleString('es-CO') : '-'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: r.status === 'ACTIVE' ? '#ede9fe' : '#f1f5f9',
                        color: r.status === 'ACTIVE' ? '#7c3aed' : '#6b7280',
                      }}>{r.status === 'ACTIVE' ? 'Activo' : r.status === 'USED' ? 'Usado' : r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminBenefits;
