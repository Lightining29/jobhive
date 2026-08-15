import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  FaCreditCard,
  FaReceipt,
  FaRotateLeft,
  FaFileInvoiceDollar,
  FaMagnifyingGlass,
  FaPlus,
  FaCheck,
  FaXmark,
} from 'react-icons/fa6';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { adminNavItems } from '../../components/admin/adminNav';
import { adminService } from '../../services';
import { formatCurrency, formatDateTime } from '../../utils/format';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';

const AdminPaymentsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  // Refund Modal
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await adminService.payments({
        page: p,
        limit: 12,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        search: search || undefined,
      });
      setTransactions(data.transactions || []);
      setStats(data.stats || {});
      setTotalPages(data.pagination?.pages || 1);
      setTotalCount(data.pagination?.total || 0);
      setPage(p);
    } catch (err) {
      toast.error(err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, search]);

  useEffect(() => {
    load(1);
  }, [load]);

  const handleOpenRefund = (tx) => {
    setSelectedTx(tx);
    setRefundReason('Customer requested refund within trial guarantee period');
    setRefundModalOpen(true);
  };

  const handleProcessRefund = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await adminService.refundPayment(selectedTx._id, refundReason);
      toast.success('Payment refunded successfully');
      setRefundModalOpen(false);
      load(page);
    } catch (err) {
      toast.error(err.message || 'Failed to refund transaction');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <DashboardLayout title="Payments & Billing Ledger" subtitle="View all customer payments, invoices, taxes, discounts, and process refunds" navItems={adminNavItems}>
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="card p-5 border-l-4 border-emerald-500">
            <span className="text-xs font-semibold uppercase text-muted">Total Gross Revenue</span>
            <div className="text-2xl font-black mt-1 text-emerald-600">{formatCurrency(stats.totalRevenue || 0)}</div>
          </div>
          <div className="card p-5 border-l-4 border-blue-500">
            <span className="text-xs font-semibold uppercase text-muted">Total Successful Orders</span>
            <div className="text-2xl font-black mt-1 text-ink">{stats.count || 0} payments</div>
          </div>
          <div className="card p-5 border-l-4 border-indigo-500">
            <span className="text-xs font-semibold uppercase text-muted">Tax Collected</span>
            <div className="text-2xl font-black mt-1 text-indigo-600">{formatCurrency(stats.totalTax || 0)}</div>
          </div>
          <div className="card p-5 border-l-4 border-pink-500">
            <span className="text-xs font-semibold uppercase text-muted">Discounts Given</span>
            <div className="text-2xl font-black mt-1 text-pink-600">{formatCurrency(stats.totalDiscounts || 0)}</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-xs" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Txn ID, Invoice, or Coupon..."
                className="input !py-2 !pl-9 text-xs w-64 rounded-xl"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input !py-2 text-xs rounded-xl"
            >
              <option value="">All Statuses</option>
              <option value="succeeded">Succeeded</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input !py-2 text-xs rounded-xl"
            >
              <option value="">All Types</option>
              <option value="subscription">Subscription</option>
              <option value="service">Service Add-on</option>
              <option value="bundle">Service Bundle</option>
            </select>
          </div>

          <div className="text-xs font-semibold text-muted">
            Total Records: <span className="text-ink font-bold">{totalCount}</span>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-sunken/50 text-muted uppercase text-[11px] font-bold tracking-wider border-b border-line">
                <tr>
                  <th className="px-5 py-3.5">Transaction & Invoice</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Type & Item</th>
                  <th className="px-5 py-3.5">Amount & Tax</th>
                  <th className="px-5 py-3.5">Method</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-muted">Loading payments...</td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-muted">No transactions found.</td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-surface-sunken/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-mono font-bold text-xs text-ink">{tx.transactionId}</div>
                        <div className="text-xs text-primary-600 font-mono">{tx.invoiceNumber || 'JW-INV-PENDING'}</div>
                        <div className="text-[10px] text-muted">{formatDateTime(tx.createdAt)}</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-ink">{tx.user?.name || 'Direct Customer'}</div>
                        <div className="text-xs text-muted font-mono">{tx.user?.email}</div>
                      </td>

                      <td className="px-5 py-4 text-xs">
                        <span className="badge badge-neutral text-[10px] uppercase font-bold">{tx.type}</span>
                        <div className="font-semibold text-ink mt-0.5">
                          {tx.plan?.name || tx.service?.name || tx.bundle?.name || 'Portal Service'}
                        </div>
                        {tx.couponCode && <div className="text-[11px] text-pink-600 font-mono">Coupon: {tx.couponCode}</div>}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-black text-sm text-emerald-600">
                          {formatCurrency(tx.totalAmount, tx.currency)}
                        </div>
                        <div className="text-[11px] text-muted">
                          Sub: ${tx.subtotal} {tx.taxAmount > 0 && `• Tax: +$${tx.taxAmount}`} {tx.discountAmount > 0 && `• Disc: -$${tx.discountAmount}`}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold capitalize text-muted">
                        <span className="bg-surface-sunken px-2 py-0.5 rounded border border-line">{tx.paymentMethod}</span>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`badge text-[11px] font-bold capitalize ${
                          tx.status === 'succeeded' ? 'badge-success' : tx.status === 'refunded' ? 'badge-danger' : 'badge-neutral'
                        }`}>
                          {tx.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        {tx.status === 'succeeded' ? (
                          <button
                            onClick={() => handleOpenRefund(tx)}
                            className="btn-outline !py-1.5 !px-2.5 text-xs text-danger border-danger/40 hover:bg-danger/10 font-semibold"
                            title="Issue Refund"
                          >
                            <FaRotateLeft className="inline mr-1" /> Refund
                          </button>
                        ) : (
                          <span className="text-xs text-muted capitalize">{tx.status}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center text-xs text-muted">
            <span>Showing {transactions.length} of {totalCount} records</span>
            <Pagination page={page} pages={totalPages} onPageChange={(p) => load(p)} />
          </div>
        )}
      </div>

      {/* Modal: Process Refund */}
      <Modal isOpen={refundModalOpen} onClose={() => setRefundModalOpen(false)} title={`Process Refund: ${selectedTx?.transactionId}`}>
        <form onSubmit={handleProcessRefund} className="space-y-4 text-sm">
          <p className="text-xs text-muted">
            Are you sure you want to refund this payment of <strong className="text-ink">{formatCurrency(selectedTx?.totalAmount || 0, selectedTx?.currency)}</strong>? The user's active plan benefits or credits will be adjusted accordingly.
          </p>
          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1">Reason for Refund *</label>
            <textarea
              required
              rows={3}
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="input text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-line">
            <button type="button" onClick={() => setRefundModalOpen(false)} className="btn-outline !py-2 text-xs">
              Cancel
            </button>
            <button type="submit" disabled={processing} className="btn-danger !py-2 text-xs font-bold">
              {processing ? 'Refunding...' : 'Confirm Refund'}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminPaymentsPage;
