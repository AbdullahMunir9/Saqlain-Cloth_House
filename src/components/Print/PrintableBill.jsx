import React, { forwardRef } from 'react';

const PrintableBill = forwardRef(({ transaction, entityName, businessInfo }, ref) => {
    if (!transaction) return null;

    const { type, items, totalBill, paidNow, remainingAfterTransaction, date, notes } = transaction;
    const isSale = type === 'sell';

    return (
        <div ref={ref} className="p-8 bg-white text-black font-sans w-full max-w-4xl mx-auto hidden-screen-only-print">
            <style type="text/css" media="print">
                {`
                @page { size: auto; margin: 20mm; }
                body { margin: 0; padding: 0; }
                .hidden-screen-only-print { display: block !important; }
                `}
            </style>

            {/* Header section */}
            <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">{businessInfo?.name || 'SAKLAIN CLOTH HOUSE'}</h1>
                    <p className="text-sm text-gray-600 mt-1">{businessInfo?.address || 'Main Bazaar, City'}</p>
                    <p className="text-sm text-gray-600">{businessInfo?.phone || '+92 300 1234567'}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-widest">
                        {isSale ? 'INVOICE' : 'PURCHASE VOUCHER'}
                    </h2>
                    <p className="text-sm font-semibold mt-2">Date: {new Date(date).toLocaleDateString()}</p>
                    <p className="text-sm">Txn ID: {transaction._id.substring(transaction._id.length - 8).toUpperCase()}</p>
                </div>
            </div>

            {/* Entity section */}
            <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded">
                <p className="text-sm font-semibold text-gray-500 uppercase">{isSale ? 'Billed To (Buyer)' : 'Purchased From (Seller)'}</p>
                <h3 className="text-xl font-bold text-gray-900">{entityName}</h3>
            </div>

            {/* Items Table */}
            <table className="w-full text-left border-collapse mb-8">
                <thead>
                    <tr className="bg-gray-800 text-white">
                        <th className="p-3 font-semibold border border-gray-800">Sr.</th>
                        <th className="p-3 font-semibold border border-gray-800">Description of Goods</th>
                        <th className="p-3 font-semibold border border-gray-800 text-center">Qty</th>
                        <th className="p-3 font-semibold border border-gray-800 text-right">Rate</th>
                        <th className="p-3 font-semibold border border-gray-800 text-right">Amount (Rs)</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-200">
                            <td className="p-3 border-x border-gray-200 text-center">{idx + 1}</td>
                            <td className="p-3 border-x border-gray-200">{item.itemName}</td>
                            <td className="p-3 border-x border-gray-200 text-center">{item.quantity}</td>
                            <td className="p-3 border-x border-gray-200 text-right">{item.pricePerUnit.toLocaleString()}</td>
                            <td className="p-3 border-x border-gray-200 text-right font-medium">{(item.quantity * item.pricePerUnit).toLocaleString()}</td>
                        </tr>
                    ))}
                    {/* Empty padding rows for layout aesthetics */}
                    {items.length < 5 && Array.from({ length: 5 - items.length }).map((_, i) => (
                        <tr key={`empty-${i}`}>
                            <td className="p-3 border-x border-gray-200">&nbsp;</td>
                            <td className="p-3 border-x border-gray-200">&nbsp;</td>
                            <td className="p-3 border-x border-gray-200">&nbsp;</td>
                            <td className="p-3 border-x border-gray-200">&nbsp;</td>
                            <td className="p-3 border-x border-gray-200">&nbsp;</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals & Notes */}
            <div className="flex justify-between items-start">
                <div className="w-1/2 pr-8">
                    {notes && (
                        <div className="p-4 border border-dashed border-gray-300 rounded bg-gray-50">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Notes / Terms</p>
                            <p className="text-sm text-gray-800">{notes}</p>
                        </div>
                    )}
                </div>

                <div className="w-1/2">
                    <table className="w-full text-right">
                        <tbody>
                            <tr>
                                <td className="p-2 font-semibold text-gray-600">Total Bill Amount:</td>
                                <td className="p-2 font-bold text-gray-900 border-b border-gray-200">Rs. {totalBill.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td className="p-2 font-semibold text-gray-600">Paid Now:</td>
                                <td className="p-2 font-medium text-gray-800 border-b border-gray-200">Rs. {paidNow.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td className="p-2 font-bold text-gray-900 pt-4">Current Balance / Remaining:</td>
                                <td className="p-2 font-bold text-xl text-gray-900 border-b-4 border-double border-gray-900 pt-4">Rs. {remainingAfterTransaction.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Footer */}
            <div className="mt-16 pt-8 border-t border-gray-200 flex justify-between text-sm text-gray-500">
                <div className="text-center w-48 border-t border-gray-400 pt-2">
                    Authorized Signature
                </div>
                <div className="text-right">
                    Thank you for your business!
                </div>
            </div>
        </div>
    );
});

export default PrintableBill;
