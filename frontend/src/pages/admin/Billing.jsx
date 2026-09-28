import React, { useEffect, useState } from 'react';
import {
  Receipt,
  Plus,
  DollarSign,
  Printer,
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Trash2
} from 'lucide-react';
import { billingService } from '../../services/billingService';
import { patientService } from '../../services/patientService';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Generate Invoice Modal State
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [billPatientId, setBillPatientId] = useState('');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
  const [billItems, setBillItems] = useState([
    { description: 'Physician General Consultation Fee', quantity: 1, unit_price: 50.00 }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Record Payment Modal State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [targetBill, setTargetBill] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('card');
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  // Invoice Printable View Modal State (Rule 34)
  const [isInvoicePrintOpen, setIsInvoicePrintOpen] = useState(false);
  const [printableInvoice, setPrintableInvoice] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  const { success, error: toastError } = useToast();

  const loadBills = async () => {
    try {
      setLoading(true);
      const res = await billingService.getBills({
        payment_status: statusFilter,
        search,
      });
      if (res.success) setBills(res.data);
    } catch (err) {
      toastError('Failed to load billing records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, [statusFilter]);

  // Load patients list for invoice generation
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await patientService.getPatients({ limit: 50 });
        if (res.success) {
          setPatients(res.data);
          if (res.data.length > 0) setBillPatientId(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPatients();
  }, []);

  const handleAddItemRow = () => {
    setBillItems((prev) => [
      ...prev,
      { description: 'Diagnostic or Medication Item', quantity: 1, unit_price: 30.00 }
    ]);
  };

  const handleRemoveItemRow = (index) => {
    setBillItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setBillItems((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const calculateTotal = () => {
    return billItems.reduce((acc, item) => {
      const qty = parseInt(item.quantity, 10) || 1;
      const price = parseFloat(item.unit_price) || 0;
      return acc + qty * price;
    }, 0);
  };

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    if (!billPatientId) {
      toastError('Please select a patient.');
      return;
    }
    if (billItems.length === 0) {
      toastError('Please add at least one line item.');
      return;
    }

    setIsGenerating(true);
    try {
      await billingService.createBill({
        patient_id: parseInt(billPatientId, 10),
        due_date: dueDate,
        items: billItems,
      });
      success('✓ Official Invoice Generated Successfully');
      setIsGenerateOpen(false);
      loadBills();
    } catch (err) {
      toastError(err.message || 'Failed to generate invoice.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenPayment = (bill) => {
    setTargetBill(bill);
    setPayAmount(parseFloat(bill.remaining_balance).toFixed(2));
    setPayMethod('card');
    setIsPaymentOpen(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) {
      toastError('Payment amount must be greater than zero.');
      return;
    }

    setIsRecordingPayment(true);
    try {
      await billingService.recordPayment(targetBill.id, {
        amount: amt,
        payment_method: payMethod,
      });
      success(`✓ Payment of $${amt.toFixed(2)} recorded via ${payMethod.toUpperCase()}`);
      setIsPaymentOpen(false);
      loadBills();
    } catch (err) {
      toastError(err.message || 'Payment recording failed.');
    } finally {
      setIsRecordingPayment(false);
    }
  };

  const handleOpenInvoicePrint = async (billId) => {
    try {
      setLoadingInvoice(true);
      setIsInvoicePrintOpen(true);
      const res = await billingService.getBillById(billId);
      if (res.success) {
        setPrintableInvoice(res.data);
      }
    } catch (err) {
      toastError('Failed to load invoice layout.');
      setIsInvoicePrintOpen(false);
    } finally {
      setLoadingInvoice(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hospital Billing & Revenue Management"
        subtitle="Issue itemized patient invoices, collect payments across multiple gateways, and audit outstanding balances."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setIsGenerateOpen(true)}>
            Generate New Invoice
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadBills();
          }}
          className="flex-1 w-full flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice number (INV-...), patient name, or code..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">
            Search
          </Button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
        >
          <option value="">All Payment Statuses</option>
          <option value="paid">Paid in Full</option>
          <option value="pending">Pending Payment</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Billing Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner size="md" text="Loading financial records..." />
        ) : bills.length === 0 ? (
          <EmptyState
            title="No billing invoices found"
            description="Generate a billing invoice for medical services rendered."
            actionLabel="Generate Invoice"
            onAction={() => setIsGenerateOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Invoice # / Date</th>
                  <th className="px-5 py-3.5">Patient Details</th>
                  <th className="px-5 py-3.5">Total Amount</th>
                  <th className="px-5 py-3.5">Amount Paid</th>
                  <th className="px-5 py-3.5">Outstanding Balance</th>
                  <th className="px-5 py-3.5">Payment Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-4 font-mono text-xs">
                      <div className="font-bold text-slate-900">{b.invoice_number}</div>
                      <div className="text-slate-400">{b.invoice_date?.slice(0, 10)}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{b.patient_name}</div>
                      <div className="text-xs text-slate-400">{b.patient_code}</div>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900">
                      ${parseFloat(b.total_amount).toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-emerald-600 font-semibold">
                      ${parseFloat(b.paid_amount).toFixed(2)}
                    </td>
                    <td className="px-5 py-4 font-semibold text-rose-600">
                      ${parseFloat(b.remaining_balance).toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge-${b.payment_status}`}>
                        {b.payment_status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.payment_status !== 'paid' && b.payment_status !== 'cancelled' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleOpenPayment(b)}
                          >
                            Pay
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Printer}
                          onClick={() => handleOpenInvoicePrint(b.id)}
                        >
                          Invoice
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Invoice Modal */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Generate Official Hospital Invoice"
        subtitle="Add line items for consultation fees, lab charges, and medication dispensing"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleGenerateInvoice} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Select Patient <span className="text-rose-500">*</span>
              </label>
              <select
                value={billPatientId}
                onChange={(e) => setBillPatientId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2.5 px-3 bg-white text-sm focus:border-brand-500"
                required
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.patient_code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Input
                label="Payment Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Line Items & Services</span>
              <Button size="sm" variant="outline" icon={Plus} onClick={handleAddItemRow}>
                Add Item
              </Button>
            </div>

            <div className="space-y-2">
              {billItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <input
                    type="text"
                    placeholder="Description (e.g. Consultation, CBC Lab, Medication)"
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    className="flex-1 py-1.5 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:border-brand-500"
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    className="w-16 py-1.5 px-2 text-xs bg-white border border-slate-300 rounded-lg text-center"
                    required
                  />
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                      className="w-full py-1.5 pl-6 pr-2 text-xs bg-white border border-slate-300 rounded-lg"
                      required
                    />
                  </div>
                  {billItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-100 rounded-xl flex justify-between items-center text-sm font-bold text-slate-900 mt-3">
              <span>Total Invoice Amount:</span>
              <span className="text-brand-600 text-base">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsGenerateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isGenerating}>
              Create Invoice
            </Button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        title={targetBill ? `Record Payment — ${targetBill.invoice_number}` : 'Record Payment'}
        subtitle={`Patient: ${targetBill?.patient_name} • Remaining Balance: $${parseFloat(targetBill?.remaining_balance || 0).toFixed(2)}`}
      >
        <form onSubmit={handleRecordPayment} className="space-y-4 text-sm">
          <Input
            label="Payment Amount ($)"
            type="number"
            step="0.01"
            min="0.01"
            max={targetBill?.remaining_balance}
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Payment Gateway / Method <span className="text-rose-500">*</span>
            </label>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2.5 px-3 bg-white text-sm focus:border-brand-500"
              required
            >
              <option value="card">Credit / Debit Card</option>
              <option value="cash">Cash Settlement</option>
              <option value="bank_transfer">Direct Bank Transfer</option>
              <option value="mobile_money">Mobile Money (MTN / Airtel / M-Pesa)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsPaymentOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" type="submit" isLoading={isRecordingPayment}>
              Record Transaction
            </Button>
          </div>
        </form>
      </Modal>

      {/* Printable Invoice Modal (Rule 34) */}
      <Modal
        isOpen={isInvoicePrintOpen}
        onClose={() => setIsInvoicePrintOpen(false)}
        title={printableInvoice ? `Invoice ${printableInvoice.invoice_number}` : 'Invoice'}
        subtitle="Official Hospital Statement of Account"
        maxWidth="max-w-2xl"
      >
        {loadingInvoice || !printableInvoice ? (
          <LoadingSpinner size="md" text="Formatting invoice layout..." />
        ) : (
          <div className="print-area space-y-6 text-xs text-slate-700">
            {/* Invoice Header */}
            <div className="flex justify-between items-start pb-5 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{printableInvoice.hospital?.hospital_name || 'Metropolitan Central Hospital'}</h2>
                <p className="text-slate-500 mt-0.5">{printableInvoice.hospital?.address}</p>
                <p className="text-slate-500">{printableInvoice.hospital?.phone} • {printableInvoice.hospital?.email}</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-sm font-bold text-brand-600 block">{printableInvoice.invoice_number}</span>
                <span className="text-slate-400">Date: {printableInvoice.invoice_date?.slice(0, 10)}</span>
                <div className="mt-1">
                  <span className={`badge-${printableInvoice.payment_status}`}>
                    {printableInvoice.payment_status?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Billed To Patient */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
              <div>
                <span className="text-slate-500 block">Billed To Patient:</span>
                <span className="font-bold text-slate-900 text-sm">{printableInvoice.patient_name}</span>
                <p className="text-slate-500">{printableInvoice.patient_code}</p>
              </div>
              <div className="text-right text-slate-500">
                <p>{printableInvoice.patient_phone}</p>
                <p>{printableInvoice.patient_address}</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Service Description</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Unit Price</th>
                    <th className="p-2.5 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {printableInvoice.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2.5 font-medium text-slate-800">{item.description}</td>
                      <td className="p-2.5 text-center">{item.quantity}</td>
                      <td className="p-2.5 text-right">${parseFloat(item.unit_price).toFixed(2)}</td>
                      <td className="p-2.5 text-right font-semibold">${parseFloat(item.total_price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Summary */}
            <div className="flex justify-end">
              <div className="w-64 space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Billed:</span>
                  <span className="font-bold text-slate-900">${parseFloat(printableInvoice.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Total Paid:</span>
                  <span className="font-semibold">${parseFloat(printableInvoice.paid_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-200 font-bold text-rose-600 text-sm">
                  <span>Balance Due:</span>
                  <span>${parseFloat(printableInvoice.remaining_balance).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Print Button Bar */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center no-print">
              <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>
                Print Official Invoice
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setIsInvoicePrintOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Billing;
