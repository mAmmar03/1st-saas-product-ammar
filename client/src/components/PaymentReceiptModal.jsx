import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, Copy, Check, Upload, FileText, Image as ImageIcon, ExternalLink, Building2 } from 'lucide-react';
import { api } from '../services/api';
import { useAlert } from '../context/AlertContext';
import { printDocument } from '../utils/printHelper';

export default function PaymentReceiptModal({ deal, onClose, onRefresh }) {
  const { showAlert } = useAlert();
  const [copied, setCopied] = useState(false);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [slipPreview, setSlipPreview] = useState(deal?.payment?.slipImage || '');
  const [transactionId, setTransactionId] = useState(deal?.payment?.transactionId || '');
  const [brandProfile, setBrandProfile] = useState(null);
  const receiptRef = useRef();

  useEffect(() => {
    loadBrand();
  }, []);

  const loadBrand = async () => {
    try {
      const res = await api.getBrandProfile();
      if (res.data) setBrandProfile(res.data);
    } catch (e) {
      console.error('Error fetching brand profile', e);
    }
  };

  if (!deal) return null;

  // Handle Image Slip Upload (File to Base64)
  const handleSlipFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showAlert('Slip image must be under 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      setSlipPreview(base64String);

      // Save directly to deal payment
      try {
        setUploadingSlip(true);
        await api.updatePayment(deal._id, {
          slipImage: base64String,
          transactionId: transactionId || deal.payment?.transactionId || '',
        });
        showAlert('Payment slip screenshot attached successfully!', 'success');
        if (onRefresh) onRefresh();
      } catch (err) {
        showAlert('Failed to save slip attachment', 'error');
      } finally {
        setUploadingSlip(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveTid = async () => {
    try {
      await api.updatePayment(deal._id, {
        transactionId,
        slipImage: slipPreview,
      });
      showAlert('Transaction ID updated successfully!', 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      showAlert('Failed to save transaction ID', 'error');
    }
  };

  // Copy structured text summary for WhatsApp sharing
  const handleCopyWhatsAppText = () => {
    const brandName = brandProfile?.brandName || 'Stylish Collection';
    const isBarter = deal.dealType === 'Barter PR';

    const text = isBarter
      ? `*${brandName.toUpperCase()} - BARTER PR CONSIGNMENT VOUCHER*
---------------------------------------
*Influencer:* ${deal.influencer?.name} (${deal.influencer?.instagramHandle})
*Campaign:* ${deal.campaignName}
*Parcel / SP#:* ${deal.spNumber || 'N/A'}
*Dresses Dispatched:* ${deal.prArticles?.map((a) => `${a.article?.name} (Size: ${a.size || 'M'})`).join(', ')}

*COLLABORATION TERMS:*
- Model: *Barter PR (Product Only Collaboration)*
- Financial Consideration: *Rs. 0 (Nil Commercial Fees)*
- Agreed Deliverables: ${deal.videos?.map((v) => v.videoType).join(', ')}

Thank you for collaborating with ${brandName}!`
      : `*${brandName.toUpperCase()} - PAYMENT SETTLEMENT VOUCHER*
---------------------------------------
*Influencer:* ${deal.influencer?.name} (${deal.influencer?.instagramHandle})
*Campaign:* ${deal.campaignName}
*Parcel / SP#:* ${deal.spNumber || 'N/A'}
*Dresses Sent:* ${deal.prArticles?.map((a) => `${a.article?.name} (Size: ${a.size || 'M'})`).join(', ')}

*COMMERCIAL DETAILS:*
- Total Agreed: Rs. ${deal.agreedRate?.toLocaleString()}
- Rate Per Reel: Rs. ${deal.ratePerVideo?.toLocaleString()}
- Amount Paid: *Rs. ${(deal.payment?.advancePaid || 0).toLocaleString()}*
- Balance Due: Rs. ${(deal.payment?.remainingAmount || 0).toLocaleString()}
- Method: ${deal.payment?.paymentMethod || 'Bank Transfer'}
${transactionId ? `- Transaction Ref / TID: ${transactionId}` : ''}
- Status: *${deal.payment?.status?.toUpperCase()}*

Thank you for collaborating with ${brandName}!`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    showAlert('WhatsApp summary copied to clipboard!', 'success');
  };

  const handlePrint = () => {
    printDocument(
      'payment-voucher-print-area',
      `${brandName} - ${deal.dealType === 'Barter PR' ? 'Consignment Voucher' : 'Payment Slip'}`
    );
  };

  const brandName = brandProfile?.brandName || 'Stylish Collection';
  const tagline = brandProfile?.tagline || 'Luxury Pret & Formal Collection';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-backdrop-in">
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-modal max-w-2xl w-full max-h-[94vh] flex flex-col overflow-hidden text-xs font-sans animate-modal-in">
        {/* Header Bar (Hidden on print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 gap-2 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                {deal.dealType === 'Barter PR'
                  ? 'Barter PR Consignment Voucher & Agreement'
                  : 'Official Payment Voucher & Settlement Slip'}
              </h3>
              <p className="text-xs text-slate-400">
                {deal.dealType === 'Barter PR'
                  ? 'Generate printable A4 consignment slip or copy WhatsApp summary'
                  : 'Generate printable A4 receipt or copy WhatsApp summary'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition self-end sm:self-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5" ref={receiptRef}>
          {/* Slip Document Container formatted for A4 */}
          <div
            id="payment-voucher-print-area"
            className="border border-slate-200/90 rounded-xl p-4 sm:p-6 bg-white space-y-4 max-w-[210mm] mx-auto text-slate-900 shadow-xs"
          >
            {/* Slip Top Header with Brand Logo */}
            <div className="flex items-start justify-between border-b-2 border-zinc-900 pb-3">
              <div className="flex items-center gap-3">
                {brandProfile?.brandLogo ? (
                  <img
                    src={brandProfile.brandLogo}
                    alt={brandName}
                    className="h-10 w-auto max-w-[120px] object-contain"
                  />
                ) : (
                  <img
                    src="/logo-main.png"
                    alt="Logo"
                    className="h-9 w-auto max-w-[120px] object-contain"
                  />
                )}
                <div>
                  <h2 className="text-base font-black uppercase tracking-tight text-zinc-900">
                    {brandName}
                  </h2>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                    {tagline}
                  </p>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="text-[10px] font-bold text-zinc-500 block uppercase">
                  {deal.dealType === 'Barter PR' ? 'CONSIGNMENT REFERENCE' : 'VOUCHER REFERENCE'}
                </span>
                <span className="text-sm font-bold text-zinc-900">
                  {deal.spNumber
                    ? `${deal.spNumber}-${deal.dealType === 'Barter PR' ? 'BARTER' : 'PAY'}`
                    : `${deal.dealType === 'Barter PR' ? 'BARTER' : 'PAY'}-${deal._id.slice(-6).toUpperCase()}`}
                </span>
                <span className="block text-[10px] text-zinc-500 mt-0.5">
                  Date: {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Payee Info & Campaign Meta */}
            <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-3 border border-zinc-200 font-mono text-[11px]">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Creator Details (Payee)</span>
                <strong className="text-zinc-900 text-xs block uppercase">{deal.influencer?.name}</strong>
                <span className="text-zinc-600 block">{deal.influencer?.instagramHandle}</span>
                {deal.influencer?.phone && (
                  <span className="text-zinc-600 block">Ph: {deal.influencer.phone}</span>
                )}
                {deal.influencer?.city && (
                  <span className="text-zinc-600 block">City: {deal.influencer.city}</span>
                )}
              </div>

              <div className="text-right">
                <span className="text-[10px] text-zinc-500 uppercase block">Campaign & Consignment</span>
                <strong className="text-zinc-900 text-xs block">{deal.campaignName}</strong>
                <span className="text-zinc-600 block">Consignment SP#: <strong>{deal.spNumber || 'N/A'}</strong></span>
                <span className="text-zinc-600 block">Agreed Date: {deal.agreedDate ? new Date(deal.agreedDate).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>

            {/* Creator Bank Details (If available) */}
            {deal.influencer?.bankDetails?.accountTitle && (
              <div className="bg-white p-2.5 border border-zinc-200 font-mono text-[10px] grid grid-cols-3 gap-2">
                <div>
                  <span className="text-zinc-400 block uppercase">Bank</span>
                  <strong className="text-zinc-800">{deal.influencer.bankDetails.bankName || 'Direct Transfer'}</strong>
                </div>
                <div>
                  <span className="text-zinc-400 block uppercase">Title</span>
                  <strong className="text-zinc-800">{deal.influencer.bankDetails.accountTitle}</strong>
                </div>
                <div>
                  <span className="text-zinc-400 block uppercase">Account / IBAN</span>
                  <strong className="text-zinc-800">{deal.influencer.bankDetails.accountNumber || deal.influencer.bankDetails.iban}</strong>
                </div>
              </div>
            )}

            {/* PR Clothes & Deliverables Table */}
            <table className="w-full text-left border-collapse border border-zinc-300 font-mono text-[11px]">
              <thead>
                <tr className="bg-zinc-100 text-zinc-800 text-[10px] uppercase">
                  <th className="p-2 border border-zinc-300">Deliverable / Article</th>
                  <th className="p-2 border border-zinc-300">Size</th>
                  <th className="p-2 border border-zinc-300 text-center">Qty</th>
                  <th className="p-2 border border-zinc-300 text-right">Agreed Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {deal.prArticles?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border border-zinc-200 font-sans">
                      <strong className="text-zinc-900">{item.article?.name}</strong>
                      <span className="block text-[10px] text-zinc-500 font-mono">
                        PR Gift for Video Promotion ({item.dispatchStatus})
                      </span>
                    </td>
                    <td className="p-2 border border-zinc-200 font-bold">{item.size || 'M'}</td>
                    <td className="p-2 border border-zinc-200 text-center">{item.quantity}</td>
                    <td className="p-2 border border-zinc-200 text-right">Included in PR</td>
                  </tr>
                ))}
                {deal.videos?.map((vid, idx) => (
                  <tr key={`v-${idx}`}>
                    <td colSpan={3} className="p-2 border border-zinc-200 font-sans text-zinc-700">
                      Deliverable #{idx + 1}: <strong>{vid.videoType}</strong> ({vid.status})
                    </td>
                    <td className="p-2 border border-zinc-200 text-right font-mono">
                      {deal.dealType === 'Barter PR'
                        ? 'Barter Exchange'
                        : `Rs. ${deal.ratePerVideo?.toLocaleString() || 'N/A'}`}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {deal.dealType === 'Barter PR' ? (
                  <>
                    <tr className="bg-purple-50 font-bold text-purple-950">
                      <td colSpan={3} className="p-2 border border-purple-200 text-right uppercase text-[10px]">
                        Collaboration Commercial Terms:
                      </td>
                      <td className="p-2 border border-purple-200 text-right text-xs">
                        Barter PR (Product Only)
                      </td>
                    </tr>
                    <tr className="bg-purple-900 text-white font-bold text-xs">
                      <td colSpan={3} className="p-2.5 border border-purple-900 text-right uppercase tracking-wider text-[10px]">
                        Financial Consideration Owed:
                      </td>
                      <td className="p-2.5 border border-purple-900 text-right text-sm">
                        Rs. 0 (Nil Cash Consideration)
                      </td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr className="bg-zinc-50 font-bold">
                      <td colSpan={3} className="p-2 border border-zinc-300 text-right uppercase text-[10px]">
                        Total Agreed Commercials:
                      </td>
                      <td className="p-2 border border-zinc-300 text-right text-xs">
                        Rs. {deal.agreedRate?.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-zinc-900 text-white font-bold text-xs">
                      <td colSpan={3} className="p-2.5 border border-zinc-900 text-right uppercase tracking-wider text-[10px]">
                        Amount Settled / Paid:
                      </td>
                      <td className="p-2.5 border border-zinc-900 text-right text-sm">
                        Rs. {(deal.payment?.advancePaid || 0).toLocaleString()}
                      </td>
                    </tr>
                    {deal.payment?.remainingAmount > 0 && (
                      <tr className="bg-red-50 text-red-800 font-bold">
                        <td colSpan={3} className="p-2 border border-zinc-300 text-right uppercase text-[10px]">
                          Balance Due:
                        </td>
                        <td className="p-2 border border-zinc-300 text-right text-xs">
                          Rs. {deal.payment.remainingAmount.toLocaleString()}
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tfoot>
            </table>

            {/* Payment Status & TID */}
            <div className="bg-zinc-50 p-2.5 border border-zinc-200 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px]">
              <div>
                <span>Payment Channel: <strong>{deal.payment?.paymentMethod || 'Online Bank Transfer'}</strong></span>
                {transactionId && <span className="ml-3">TID / Ref: <strong>{transactionId}</strong></span>}
              </div>
              <div>
                <span className="font-bold uppercase text-zinc-900 border border-zinc-400 px-2 py-0.5 bg-white">
                  STATUS: {deal.payment?.status || 'PAID'}
                </span>
              </div>
            </div>

            {/* Attached Bank Slip Screenshot */}
            {slipPreview && (
              <div className="border-t border-zinc-200 pt-3 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-zinc-500 block font-mono">
                  Attached Bank Transfer Proof:
                </span>
                <div className="border border-zinc-300 p-2 bg-zinc-50 text-center">
                  <img
                    src={slipPreview}
                    alt="Payment Slip Proof"
                    className="max-h-56 object-contain mx-auto border border-zinc-200 shadow-sm"
                  />
                </div>
              </div>
            )}

            {/* Signatures for A4 Document */}
            <div className="pt-6 grid grid-cols-2 gap-12 font-mono text-[10px]">
              <div className="border-t border-zinc-400 pt-1.5">
                <span className="block font-bold uppercase text-zinc-800">Accounts & PR Disbursement</span>
                <span className="text-zinc-500">Verified payment transfer receipt</span>
              </div>
              <div className="border-t border-zinc-400 pt-1.5 text-right">
                <span className="block font-bold uppercase text-zinc-800">
                  {brandProfile?.authorizedSignatory || 'Ammar / PR Director'}
                </span>
                <span className="text-zinc-500">Authorized Signatory</span>
              </div>
            </div>

            {/* Slip Signoff */}
            <div className="pt-2 text-center text-[9px] font-mono text-zinc-400 uppercase">
              AmmarDev Influencer CRM & PR Tracking System - Official Payment Settlement Slip
            </div>
          </div>

          {/* Slip Attachment & Transaction ID Upload Controls (Hidden on Print) */}
          <div className="p-4 border border-zinc-200 bg-zinc-50 space-y-3 print:hidden">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
              Attach Or Update Payment Slip Screenshot
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1">
                  Upload Bank Slip / Screenshot (Image)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSlipFileChange}
                  className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:border file:border-zinc-300 file:bg-white file:text-xs file:font-semibold hover:file:bg-zinc-100"
                />
                {uploadingSlip && (
                  <span className="text-[10px] font-mono text-zinc-500 block mt-1">Uploading slip...</span>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1">
                  Transaction Ref / TID / Raast ID
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="e.g. TID-99882104"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="flex-1 px-2 py-1 border border-zinc-300 rounded-none font-mono text-xs"
                  />
                  <button
                    onClick={handleSaveTid}
                    className="px-3 py-1 text-[11px] font-bold uppercase bg-zinc-900 text-white hover:bg-zinc-800"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions (Hidden on Print) */}
        <div className="px-4 sm:px-5 py-3 border-t border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 print:hidden font-mono">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={handleCopyWhatsAppText}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-800 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied WhatsApp Text!' : 'Copy For WhatsApp'}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider bg-zinc-900 text-white hover:bg-zinc-800 transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Print A4 Settlement Slip
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold uppercase text-zinc-600 hover:text-zinc-900 text-center"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
