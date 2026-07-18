import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, X } from 'lucide-react';

const CurrentBillModal = ({ bill, onClose }) => {
    if (!bill) return null;

    const { transaction, entityName, entityPhone } = bill;
    const isSale = transaction.type === 'sell';
    const billTitle = isSale ? 'SALES INVOICE' : 'PURCHASE BILL';
    const partyLabel = isSale ? 'Billed To (Kharidar)' : 'Purchased From (Dealer)';
    const transactionDate = new Date(transaction.date).toLocaleDateString();
    const remainingForBill = transaction.totalBill - transaction.paidNow;
    const printRef = useRef(null);
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `${billTitle}-${transaction._id.slice(-8).toUpperCase()}`,
    });

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center py-6 sm:py-10 px-2 sm:px-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-full flex flex-col overflow-hidden">
                <div className="flex-1 flex flex-col h-full overflow-hidden print:hidden">
                    <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-900">Transaction Confirmed</h2>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100">
                            <X size={22} />
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center p-6">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-600">OK</div>
                        <p className="text-center text-base font-semibold text-gray-900">{isSale ? 'Sale saved successfully.' : 'Purchase saved successfully.'}</p>
                        <p className="mt-2 text-center text-sm text-gray-600">{billTitle} for <span className="font-semibold">{entityName}</span> has been recorded.</p>
                        <p className="mt-4 text-center text-sm font-bold text-gray-800">Total: Rs. {transaction.totalBill.toLocaleString()}</p>
                    </div>

                    <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                        <button onClick={onClose} className="px-5 py-2.5 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                            Close
                        </button>
                        <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg shadow-md transition-colors">
                            <Printer size={18} />
                            Print Bill
                        </button>
                    </div>
                </div>

            </div>
            </div>

            <div ref={printRef} id="print-modal" className="hidden print:block w-full p-5 bg-white text-slate-800 font-sans text-xs">
                <BillDocument
                    transaction={transaction}
                    entityName={entityName}
                    entityPhone={entityPhone}
                    billTitle={billTitle}
                    partyLabel={partyLabel}
                    transactionDate={transactionDate}
                    remainingForBill={remainingForBill}
                />
            </div>
        </>
    );
};

const BillDocument = ({ transaction, entityName, entityPhone, billTitle, partyLabel, transactionDate, remainingForBill }) => (
    <div className="bg-white px-6 text-slate-800 font-sans text-xs sm:text-sm print:text-xs">
        <div className="flex items-start justify-between gap-4 border-b-2 border-slate-300 pb-4 mb-4">
            <div className="flex items-center gap-3">
                <img src="/1-removebg-preview.png" alt="Malik Saqlain Fabrics" className="w-20 h-14 object-contain" />
                <div>
                    <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">SAQLAIN CLOTH HOUSE</h1>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-semibold">Malik Saqlain Fabrics - Bazar Kalan, Karak</p>
                    <p className="text-[10px] sm:text-xs text-slate-500">Phone: 0303-0655085</p>
                </div>
            </div>
            <div className="text-right">
                <h2 className="text-lg sm:text-2xl font-extrabold tracking-widest text-slate-400 uppercase">{billTitle}</h2>
                <p className="mt-1 text-[10px] sm:text-xs text-slate-500 font-semibold">Date: <span className="text-slate-800">{transactionDate}</span></p>
                <p className="text-[10px] sm:text-xs text-slate-500 font-semibold">Bill No.: <span className="text-slate-800">{transaction._id.slice(-8).toUpperCase()}</span></p>
            </div>
        </div>

        <div className="mb-5">
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">{partyLabel}</p>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-800">{entityName}</h3>
                {entityPhone && <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Phone: {entityPhone}</p>}
            </div>
        </div>

        <table className="w-full text-left border-collapse mb-5">
            <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase text-[10px] sm:text-xs font-bold border-y-2 border-slate-300">
                    <th className="p-2.5 w-10">#</th>
                    <th className="p-2.5">Item Name</th>
                    <th className="p-2.5 text-center w-24">Meters</th>
                    <th className="p-2.5 text-right w-28">Price/Meter</th>
                    <th className="p-2.5 text-right w-28">Total Amount</th>
                </tr>
            </thead>
            <tbody>
                {transaction.items.map((item, index) => (
                    <tr key={`${item.itemName}-${index}`} className="border-b border-slate-200 font-semibold text-slate-700">
                        <td className="p-2.5 text-slate-400">{index + 1}</td>
                        <td className="p-2.5">{item.itemName}</td>
                        <td className="p-2.5 text-center">{item.quantity}m</td>
                        <td className="p-2.5 text-right">Rs. {item.pricePerUnit.toLocaleString()}</td>
                        <td className="p-2.5 text-right font-extrabold text-slate-900">Rs. {item.total.toLocaleString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start border-t border-slate-300 pt-4">
            <div className="w-full sm:w-1/2">
                {transaction.notes && (
                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Notes</p>
                        <p className="text-xs text-slate-700">{transaction.notes}</p>
                    </div>
                )}
            </div>
            <div className="w-full sm:w-64 text-xs sm:text-sm space-y-1.5">
                <p className="flex justify-between text-slate-600 font-semibold"><span>Total Bill:</span><span>Rs. {transaction.totalBill.toLocaleString()}</span></p>
                <p className="flex justify-between text-slate-600 font-semibold"><span>Paid Now:</span><span>Rs. {transaction.paidNow.toLocaleString()}</span></p>
                <p className="flex justify-between border-t border-slate-300 pt-2 text-slate-900 font-extrabold"><span>Remaining for This Bill:</span><span>Rs. {remainingForBill.toLocaleString()}</span></p>
            </div>
        </div>

        <div className="flex justify-between items-end gap-6 mt-6 pt-3 border-t border-slate-300 text-[10px] font-semibold text-slate-500">
            <div className="bg-slate-50 p-3 rounded border border-slate-200 w-2/3 max-w-md">
                <h4 className="font-extrabold text-slate-800 mb-1 tracking-wide uppercase">Payment Instructions</h4>
                <div className="space-y-0.5 font-semibold text-slate-700">
                    <p><span className="text-slate-400">Account Title:</span> MALIK SAQLAIN FABRICS</p>
                    <p><span className="text-slate-400">Bank Name:</span> Bank Islami</p>
                    <p><span className="text-slate-400">Account No.:</span> 215700072420001</p>
                    <p><span className="text-slate-400">IBAN:</span> PK15BKIP0215700072420001</p>
                </div>
                <p className="mt-2 text-[9px] text-slate-400 italic">Please use Account Title as reference when making bank transfers.</p>
            </div>
            <div className="text-center w-40 shrink-0">
                <p className="font-extrabold text-slate-700 uppercase">For, Malik Saqlain Fabrics</p>
                <div className="border-b border-slate-400 mt-5 mb-1"></div>
                <p className="text-[9px] uppercase tracking-wider">Authorized Signature</p>
            </div>
        </div>
    </div>
);

export default CurrentBillModal;
