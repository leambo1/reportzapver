// ==================== GLOBAL UTILS ====================
function formatCurrency(num) {
    return Number(num).toLocaleString('en-US');
}

// ==================== PRINT FUNCTION ====================
function printReceipt(containerId, isA4) {
    isA4 = isA4 || false;
    $('.print-area, .print-area-a4').removeClass('active-print active-print-a4');

    var now = new Date();
    var nowStr = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-GB');
    $('.p-print-now').text(nowStr);

    $('#dynamic-print-page-style').remove();

    var pageRule = '';
    if (isA4) {
        pageRule = '@page { size: A4 portrait; margin: 10mm; }';
        $('#' + containerId).addClass('active-print-a4');
    } else {
        pageRule = '@page { size: 80mm 297mm; margin: 0; }';
        $('#' + containerId).addClass('active-print');
    }

    $('<style id="dynamic-print-page-style">').text(pageRule).appendTo('head');
    window.print();
}

// ==================== PAGE LOADER ====================
$(document).ready(function () {
    $('.tab-btn').on('click', function () {
        $('.tab-btn').removeClass('active');
        $(this).addClass('active');
        var page = $(this).data('page');
        loadPage(page);
    });

    loadPage('report_sales.html');
});

function loadPage(page) {
    $('#content-area').html('<div style="text-align:center; padding:50px; color:#888;"><div class="spinner"></div> ກຳລັງໂຫຼດໜ້າ ' + page + '...</div>');

    setTimeout(function () {
        var cacheBuster = '?v=' + new Date().getTime();
        $('#content-area').load(page + cacheBuster, function (response, status) {
            if (status === 'error') {
                $('#content-area').html('<div style="color:red; background:#fee2e2; padding:20px; border-radius:10px; border:1px solid #fca5a5;"><b>ບໍ່ສາມາດໂຫຼດໜ້າ ' + page + ' ໄດ້</b><br>ກະລຸນາເປີດຜ່ານ Localhost (ເຊັ່ນ XAMPP ຫຼື Live Server)</div>');
                return;
            }
            // After HTML is loaded, init the correct page
            if (page === 'report_sales.html') initSalesPage();
            else if (page === 'report_products.html') initProductsPage();
            else if (page === 'report_revenue.html') initRevenuePage();
            else if (page === 'report_shift.html') initShiftPage();
        });
    }, 200);
}

// ==================== SALES PAGE ====================
var salesData = (function () {
    var data = [];
    for (var i = 0; i < 20; i++) {
        var isCash = Math.random() > 0.5;
        var amount = Math.floor(Math.random() * 800000) + 20000;
        var discount = Math.random() > 0.7 ? Math.floor(amount * 0.1) : 0;
        var h = 20 - Math.floor(i / 2);
        var m = Math.floor(Math.random() * 60);

        var numItems = Math.floor(Math.random() * 4) + 1;
        var billItems = [];
        var itemNames = ['ເບຍລາວ ໃຫຍ່', 'ຕຳໝາກຫຸ່ງ', 'ປາໜຶ້ງໝາກນາວ', 'ເຂົ້າຜັດ', 'ນ້ຳປັ່ນ'];
        for (var j = 0; j < numItems; j++) {
            billItems.push({
                name: itemNames[Math.floor(Math.random() * 5)],
                qty: Math.floor(Math.random() * 3) + 1,
                price: Math.floor(Math.random() * 40000) + 10000
            });
        }

        var sellers = ['ນ. ສີວັນ', 'ທ. ບຸນມີ', 'ນ. ຈັນເພັງ', 'ທ. ອຸໄທ'];
        data.push({
            id: i,
            date: '27/07/2026 ' + (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m),
            invoice: 'INV-2607-' + ('00' + (100 - i)).slice(-3),
            seller: sellers[Math.floor(Math.random() * 4)],
            itemsCount: numItems,
            items: billItems,
            type: isCash ? 'ສົດ' : 'ໂອນ',
            discount: discount,
            amount: amount,
            status: Math.random() > 0.1 ? 'ສຳເລັດ' : 'ຍົກເລີກ'
        });
    }
    return data;
}());

function openModal(index) {
    var bill = salesData[index];

    $('#m_invoice').text(bill.invoice);
    $('#m_date').text(bill.date);
    $('#m_seller').text(bill.seller);
    $('#m_type').text('ເງິນ' + bill.type);

    var statusColor = bill.status === 'ສຳເລັດ' ? 'var(--success)' : 'red';
    $('#m_status').html('<span style="color:' + statusColor + '; font-weight:bold;">' + bill.status + '</span>');
    $('#m_amount').text(formatCurrency(bill.amount) + ' ₭');

    $('#pb_invoice, #pb_a4_invoice').text(bill.invoice);
    $('#pb_date, #pb_a4_date').text(bill.date);
    $('#pb_seller, #pb_a4_seller').text(bill.seller);
    $('#pb_type, #pb_a4_type').text('ເງິນ' + bill.type);
    $('#pb_total, #pb_a4_total').text(formatCurrency(bill.amount) + ' ₭');
    $('#pb_discount, #pb_a4_discount').text(formatCurrency(bill.discount) + ' ₭');

    var itemsHtml = '';
    var pItemsHtml = '';
    var pA4ItemsHtml = '';
    var itemIdx = 1;

    bill.items.forEach(function (it) {
        var lineTotal = it.qty * it.price;
        itemsHtml += '<tr>' +
            '<td style="padding:10px; border-bottom:1px solid #eee; text-align:center; color:var(--text-muted); font-size:12.5px;">' + itemIdx + '</td>' +
            '<td style="padding:10px; border-bottom:1px solid #eee;">' + it.name + '<br><small style="color:#888;">' + formatCurrency(it.price) + ' ₭</small></td>' +
            '<td style="padding:10px; border-bottom:1px solid #eee; text-align:center; font-weight:bold;">' + it.qty + '</td>' +
            '<td style="padding:10px; border-bottom:1px solid #eee; text-align:right; font-weight:bold; color:var(--text-main);">' + formatCurrency(lineTotal) + '</td>' +
            '</tr>';

        pItemsHtml += '<tr><td>' + it.name + '<span class="r-item-sub">' + it.qty + ' x ' + formatCurrency(it.price) + '</span></td>' +
            '<td class="right">' + formatCurrency(lineTotal) + '</td></tr>';

        pA4ItemsHtml += '<tr>' +
            '<td class="text-center">' + itemIdx + '</td>' +
            '<td>' + it.name + '</td>' +
            '<td class="text-center">' + it.qty + '</td>' +
            '<td class="text-right">' + formatCurrency(it.price) + ' ₭</td>' +
            '<td class="text-right" style="font-weight:bold;">' + formatCurrency(lineTotal) + ' ₭</td>' +
            '</tr>';
        itemIdx++;
    });

    if (bill.discount > 0) {
        itemsHtml += '<tr><td colspan="3" style="padding:10px; text-align:right; color:var(--primary);">ສ່ວນຫຼຸດ</td>' +
            '<td style="padding:10px; text-align:right; color:var(--primary); font-weight:bold;">-' + formatCurrency(bill.discount) + '</td></tr>';
    }

    $('#m_items').html(itemsHtml);
    $('#pb_items').html(pItemsHtml);
    $('#pb_a4_items').html(pA4ItemsHtml);

    $('#btn-reprint').off('click').on('click', function () { printReceipt('print-single-bill'); });
    $('#btn-reprint-a4').off('click').on('click', function () { printReceipt('print-single-bill-a4', true); });

    $('#billModal').addClass('active');
}

function closeModal() {
    $('#billModal').removeClass('active');
}

function initSalesPage() {
    $('#billModal').on('click', function (e) {
        if (e.target === this) closeModal();
    });

    function renderSales() {
        var typeFilter = $('#rs_type').val();
        var sellerFilter = $('#rs_seller').val();
        var searchFilter = $('#rs_search').val().toLowerCase();

        var html = '';
        var printHtml = '';
        var printA4Html = '';
        var total = 0;
        var totalItems = 0;
        var totalDiscount = 0;
        var count = 0;
        var idx = 1;

        salesData.forEach(function (row, index) {
            if (typeFilter && row.type !== typeFilter) return;
            if (sellerFilter && row.seller !== sellerFilter) return;
            if (searchFilter && row.invoice.toLowerCase().indexOf(searchFilter) === -1) return;

            if (row.status === 'ສຳເລັດ') {
                total += row.amount;
                totalItems += row.itemsCount;
                totalDiscount += row.discount;
            }
            count++;

            var badgeClass = row.type === 'ສົດ' ? 'cash' : 'transfer';
            var statusBadge = row.status === 'ສຳເລັດ'
                ? '<span class="badge" style="background:rgba(5,205,153,0.1); color:var(--success);">ສຳເລັດ</span>'
                : '<span class="badge" style="background:rgba(255,0,0,0.1); color:red;">ຍົກເລີກ</span>';
            var discountTxt = row.discount > 0 ? '<span style="color:var(--primary)">-' + formatCurrency(row.discount) + '</span>' : '-';
            var typeTxt = row.type === 'ສົດ' ? 'ເງິນສົດ' : 'ເງິນໂອນ';

            html += '<tr>' +
                '<td style="color:var(--text-muted)">' + idx + '</td>' +
                '<td style="font-size:13px;">' + row.date + '</td>' +
                '<td style="color:var(--info); font-weight:600;">' + row.invoice + '</td>' +
                '<td><i class="bi bi-person-circle" style="color:var(--text-muted); margin-right:5px;"></i>' + row.seller + '</td>' +
                '<td class="text-center">' + row.itemsCount + '</td>' +
                '<td class="text-center"><span class="badge ' + badgeClass + '">' + typeTxt + '</span></td>' +
                '<td class="text-right">' + discountTxt + '</td>' +
                '<td class="text-right" style="font-weight:700;">' + formatCurrency(row.amount) + '</td>' +
                '<td class="text-center">' + statusBadge + '</td>' +
                '<td class="text-center"><button class="btn-action" onclick="openModal(' + index + ')"><i class="bi bi-eye"></i> ເບິ່ງ</button></td>' +
                '</tr>';

            if (row.status === 'ສຳເລັດ') {
                printHtml += '<tr><td>' + idx + '. ' + row.invoice + '<span class="r-item-sub">ຜູ້ຂາຍ: ' + row.seller + '</span></td>' +
                    '<td class="right">' + formatCurrency(row.amount) + '</td></tr>';

                printA4Html += '<tr>' +
                    '<td class="text-center">' + idx + '</td>' +
                    '<td>' + row.date + '</td>' +
                    '<td style="font-weight:bold; color:var(--info);">' + row.invoice + '</td>' +
                    '<td>' + row.seller + '</td>' +
                    '<td class="text-center">' + row.itemsCount + '</td>' +
                    '<td class="text-center">' + typeTxt + '</td>' +
                    '<td class="text-right">' + (row.discount > 0 ? '-' + formatCurrency(row.discount) : '-') + '</td>' +
                    '<td class="text-right" style="font-weight:bold;">' + formatCurrency(row.amount) + '</td>' +
                    '<td class="text-center">' + row.status + '</td>' +
                    '</tr>';
            }
            idx++;
        });

        if (html === '') {
            html = '<tr><td colspan="10" class="text-center" style="padding:30px; color:var(--text-muted);">ບໍ່ພົບຂໍ້ມູນການຂາຍ</td></tr>';
            printHtml += '<tr><td colspan="2" style="text-align:center">ບໍ່ພົບຂໍ້ມູນ</td></tr>';
            printA4Html += '<tr><td colspan="9" class="text-center">ບໍ່ພົບຂໍ້ມູນ</td></tr>';
        } else {
            var discStr = totalDiscount > 0 ? '<span style="color:var(--primary); font-weight:bold;">-' + formatCurrency(totalDiscount) + '</span>' : '-';
            html += '<tr style="background:rgba(242,101,34,0.06); font-weight:bold; border-top:2px solid rgba(242,101,34,0.2);">' +
                '<td colspan="4" class="text-right" style="font-weight:bold; color:var(--text-main);">ລວມທັງໝົດ:</td>' +
                '<td class="text-center" style="font-size:15px; font-weight:bold; color:var(--primary);">' + totalItems + '</td>' +
                '<td class="text-center">-</td>' +
                '<td class="text-right">' + discStr + '</td>' +
                '<td class="text-right" style="font-size:16px; font-weight:bold; color:var(--primary);">' + formatCurrency(total) + ' ₭</td>' +
                '<td colspan="2" class="text-center" style="color:var(--text-muted); font-size:12px;">(' + count + ' ບິນ)</td>' +
                '</tr>';

            printA4Html += '<tr class="total-row">' +
                '<td colspan="4" class="text-right" style="font-weight:bold;">ລວມທັງໝົດ:</td>' +
                '<td class="text-center">' + totalItems + '</td>' +
                '<td class="text-center">-</td>' +
                '<td class="text-right">' + (totalDiscount > 0 ? '-' + formatCurrency(totalDiscount) : '-') + '</td>' +
                '<td class="text-right" style="font-weight:bold;">' + formatCurrency(total) + ' ₭</td>' +
                '<td class="text-center">(' + count + ' ບິນ)</td>' +
                '</tr>';
        }

        $('#tbody-sales').html(html);
        $('#ptable-sales').html(printHtml);
        $('#ptable-sales-a4').html(printA4Html);
        $('#ptotal-sales').text(formatCurrency(total) + ' ₭');
        $('#ptotal-qty-sales').text(count);
        $('#card-total-bills, #p-a4-total-bills').text(count + ' ບິນ');
        $('#card-total-items, #p-a4-total-items').text(totalItems + ' ລາຍການ');
        $('#card-total-sales, #p-a4-total-sales').text(formatCurrency(total) + ' ₭');
        $('#card-total-discount, #p-a4-total-discount').text(formatCurrency(totalDiscount) + ' ₭');

        var sd = $('#rs_start').val();
        var ed = $('#rs_end').val();
        $('#p-date-sales, #p-a4-date-sales').text(sd + ' - ' + ed);
    }

    renderSales();
    $('#btn-search-sales').on('click', renderSales);
    $('#rs_type, #rs_seller, #rs_search').on('change keyup', function (e) {
        if (e.type === 'keyup' && e.key !== 'Enter') return;
        renderSales();
    });
}

// ==================== PRODUCTS PAGE ====================
var productsData = [
    { name: 'ເບຍລາວ ໃຫຍ່', cat: 'ເຄື່ອງດື່ມ', qty: 124, price: 15000 },
    { name: 'ປາໜຶ້ງໝາກນາວ', cat: 'ອາຫານ', qty: 45, price: 85000 },
    { name: 'ຕຳໝາກຫຸ່ງ', cat: 'ອາຫານ', qty: 110, price: 25000 },
    { name: 'ຍຳລວມມິດທະເລ', cat: 'ອາຫານ', qty: 56, price: 75000 },
    { name: 'ນ້ຳປັ່ນໝາກໂມ', cat: 'ເຄື່ອງດື່ມ', qty: 82, price: 20000 },
    { name: 'ເຂົ້າຜັດລວມ', cat: 'ອາຫານ', qty: 95, price: 35000 },
    { name: 'ເບຍລ້ານຊ້າງ', cat: 'ເຄື່ອງດື່ມ', qty: 110, price: 15000 },
    { name: 'ປີກໄກ່ທອດ', cat: 'ອາຫານ', qty: 165, price: 45000 },
    { name: 'ໝູກອບ', cat: 'ອາຫານ', qty: 88, price: 60000 },
    { name: 'ນ້ຳດື່ມ ຫົວເສືອ', cat: 'ເຄື່ອງດື່ມ', qty: 320, price: 5000 },
    { name: 'ເຂົ້າໜຽວ', cat: 'ອາຫານ', qty: 450, price: 5000 },
    { name: 'ຄ່າຫ້ອງ VIP', cat: 'ບໍລິການ', qty: 5, price: 150000 },
    { name: 'ຄ່າບໍລິການ (Service Charge)', cat: 'ບໍລິການ', qty: 1, price: 250000 }
];

function initProductsPage() {
    function renderProducts() {
        var catFilter = $('#rp_category').val();
        var searchFilter = $('#rp_search').val().toLowerCase();
        var html = '';
        var printHtml = '';
        var printA4Html = '';
        var totalQty = 0;
        var totalAmt = 0;
        var idx = 1;

        productsData.forEach(function (row) {
            if (catFilter && row.cat !== catFilter) return;
            if (searchFilter && row.name.toLowerCase().indexOf(searchFilter) === -1) return;

            var total = row.qty * row.price;
            totalQty += row.qty;
            totalAmt += total;

            html += '<tr>' +
                '<td style="color:var(--text-muted)">' + idx + '</td>' +
                '<td style="font-weight:600;">' + row.name + '</td>' +
                '<td><span class="badge" style="background:#f1f5f9; color:#475569;">' + row.cat + '</span></td>' +
                '<td class="text-center" style="font-size:16px; font-weight:700;">' + row.qty + '</td>' +
                '<td class="text-right" style="color:var(--info); font-weight:700;">' + formatCurrency(total) + '</td>' +
                '</tr>';

            printHtml += '<tr><td>' + idx + '. ' + row.name +
                '<span class="r-item-sub">' + formatCurrency(row.price) + ' x ' + row.qty + '</span></td>' +
                '<td class="right">' + formatCurrency(total) + '</td></tr>';

            printA4Html += '<tr>' +
                '<td class="text-center">' + idx + '</td>' +
                '<td style="font-weight:600;">' + row.name + '</td>' +
                '<td>' + row.cat + '</td>' +
                '<td class="text-right">' + formatCurrency(row.price) + ' ₭</td>' +
                '<td class="text-center" style="font-weight:bold;">' + row.qty + '</td>' +
                '<td class="text-right" style="font-weight:bold;">' + formatCurrency(total) + ' ₭</td>' +
                '</tr>';
            idx++;
        });

        if (html === '') {
            html = '<tr><td colspan="5" class="text-center" style="padding:30px; color:var(--text-muted);">ບໍ່ພົບຂໍ້ມູນສິນຄ້າ</td></tr>';
            printHtml += '<tr><td colspan="2" style="text-align:center">ບໍ່ພົບຂໍ້ມູນ</td></tr>';
            printA4Html += '<tr><td colspan="6" class="text-center">ບໍ່ພົບຂໍ້ມູນ</td></tr>';
        } else {
            html += '<tr style="background:rgba(242,101,34,0.05);">' +
                '<td colspan="3" class="text-right" style="font-weight:bold;">ລວມທັງໝົດ:</td>' +
                '<td class="text-center" style="font-size:18px; font-weight:bold; color:var(--primary);">' + totalQty + '</td>' +
                '<td class="text-right" style="font-size:18px; font-weight:bold; color:var(--primary);">' + formatCurrency(totalAmt) + '</td>' +
                '</tr>';

            printA4Html += '<tr class="total-row">' +
                '<td colspan="3" class="text-right" style="font-weight:bold;">ລວມທັງໝົດ:</td>' +
                '<td class="text-right">-</td>' +
                '<td class="text-center" style="font-weight:bold;">' + totalQty + '</td>' +
                '<td class="text-right" style="font-weight:bold;">' + formatCurrency(totalAmt) + ' ₭</td>' +
                '</tr>';
        }

        $('#tbody-products').html(html);
        $('#ptable-products').html(printHtml);
        $('#ptable-products-a4').html(printA4Html);
        $('#ptotal-products, #p-a4-total-products').text(formatCurrency(totalAmt) + ' ₭');
        $('#ptotal-qty-products, #p-a4-total-qty-products').text(totalQty);

        var sd = $('#rp_start').val();
        var ed = $('#rp_end').val();
        $('#p-date-products, #p-a4-date-products').text(sd + ' - ' + ed);
    }

    renderProducts();
    $('#btn-search-products').on('click', renderProducts);
    $('#rp_category, #rp_search').on('change keyup', function (e) {
        if (e.type === 'keyup' && e.key !== 'Enter') return;
        renderProducts();
    });
}

// ==================== REVENUE PAGE ====================
var revenueData = [
    { method: 'ເງິນສົດ (Cash)', type: 'cash', count: 85, amount: 2795694 },
    { method: 'ເງິນໂອນ BCEL One', type: 'transfer', count: 167, amount: 7784013 },
    { method: 'ເງິນໂອນ JDB', type: 'transfer', count: 12, amount: 1423535 },
    { method: 'ບັດເຄຣດິດ/ເດບິດ', type: 'transfer', count: 3, amount: 204434 }
];

function initRevenuePage() {
    function renderRevenue() {
        var html = '';
        var printHtml = '';
        var printA4Html = '';
        var totalCash = 0;
        var totalTransfer = 0;
        var totalOverall = 0;
        var totalCount = 0;
        var idx = 1;

        revenueData.forEach(function (row) {
            if (row.type === 'cash') totalCash += row.amount;
            if (row.type === 'transfer') totalTransfer += row.amount;
            totalOverall += row.amount;
            totalCount += row.count;

            var iconClass = row.type === 'cash' ? 'bi-cash-coin text-success' : 'bi-credit-card text-primary';

            html += '<tr>' +
                '<td style="color:var(--text-muted)">' + idx + '</td>' +
                '<td style="font-weight:600;"><i class="bi ' + iconClass + '" style="margin-right:8px;"></i>' + row.method + '</td>' +
                '<td class="text-center" style="font-size:16px; font-weight:700;">' + row.count + ' ບິນ</td>' +
                '<td class="text-right" style="font-size:15px;">' + formatCurrency(row.amount) + '</td>' +
                '</tr>';

            printHtml += '<tr><td>' + idx + '. ' + row.method +
                '<span class="r-item-sub">ລາຍການ: ' + row.count + ' ບິນ</span></td>' +
                '<td class="right">' + formatCurrency(row.amount) + '</td></tr>';

            printA4Html += '<tr>' +
                '<td class="text-center">' + idx + '</td>' +
                '<td style="font-weight:600;">' + row.method + '</td>' +
                '<td class="text-center" style="font-weight:bold;">' + row.count + ' ບິນ</td>' +
                '<td class="text-right" style="font-weight:bold;">' + formatCurrency(row.amount) + ' ₭</td>' +
                '</tr>';
            idx++;
        });

        if (revenueData.length > 0) {
            printA4Html += '<tr class="total-row">' +
                '<td colspan="2" class="text-right" style="font-weight:bold;">ລວມທັງໝົດ:</td>' +
                '<td class="text-center" style="font-weight:bold;">' + totalCount + ' ບິນ</td>' +
                '<td class="text-right" style="font-weight:bold;">' + formatCurrency(totalOverall) + ' ₭</td>' +
                '</tr>';
        }

        $('#tbody-revenue').html(html);
        $('#ptable-revenue').html(printHtml);
        $('#ptable-revenue-a4').html(printA4Html);

        $('#val-cash-rev, #p-a4-val-cash-rev').text(formatCurrency(totalCash) + ' ₭');
        $('#val-transfer-rev, #p-a4-val-transfer-rev').text(formatCurrency(totalTransfer) + ' ₭');
        $('#val-total-rev, #p-a4-val-total-rev').text(formatCurrency(totalOverall) + ' ₭');
        $('#ptotal-revenue').text(formatCurrency(totalOverall) + ' ₭');
        $('#ptotal-qty-revenue').text(totalCount);

        var sd = $('#rr_start').val();
        var ed = $('#rr_end').val();
        $('#p-date-revenue, #p-a4-date-revenue').text(sd + ' - ' + ed);
    }

    renderRevenue();
    $('#btn-search-revenue').on('click', renderRevenue);
    $('#rr_period').on('change', function () { renderRevenue(); });
}

// ==================== SHIFT PAGE ====================
var shiftData = [
    { code: 'CRS-20260727-000021', user: 'vy', openTime: '07/27/2026, 10:53 AM', closeTime: '', openCash: 500000, cashSales: 1380000, transferSales: 0, expected: 1880000, counted: null, diff: null, status: 'ເປີດ' },
    { code: 'CRS-20260727-000020', user: 'ZapVer', openTime: '07/27/2026, 09:22 AM', closeTime: '', openCash: 100000, cashSales: 0, transferSales: 0, expected: 100000, counted: null, diff: null, status: 'ເປີດ' },
    { code: 'CRS-20260726-000019', user: 'ZapVer', openTime: '07/26/2026, 04:28 PM', closeTime: '07/27/2026, 12:02 AM', openCash: 99999, cashSales: 0, transferSales: 0, expected: 99999, counted: 99999, diff: 0, status: 'ປິດແລ້ວ' },
    { code: 'CRS-20260726-000018', user: 'vy', openTime: '07/26/2026, 06:16 AM', closeTime: '07/27/2026, 12:02 AM', openCash: 2000000, cashSales: 170000, transferSales: 0, expected: 2170000, counted: 2170000, diff: 0, status: 'ປິດແລ້ວ' },
    { code: 'CRS-20260725-000017', user: 'ZapVer', openTime: '07/25/2026, 03:44 PM', closeTime: '07/25/2026, 03:45 PM', openCash: 200000, cashSales: 0, transferSales: 0, expected: 200000, counted: 0, diff: -200000, status: 'ປິດແລ້ວ' },
    { code: 'CRS-20260725-000016', user: 'vy', openTime: '07/25/2026, 02:06 PM', closeTime: '07/26/2026, 12:08 AM', openCash: 1000000, cashSales: 8000000, transferSales: 4115000, expected: 13115000, counted: 13115000, diff: 0, status: 'ປິດແລ້ວ' },
    { code: 'CRS-20260725-000015', user: 'ZapVer', openTime: '07/25/2026, 12:39 PM', closeTime: '07/25/2026, 03:44 PM', openCash: 1000000, cashSales: 1380000, transferSales: 0, expected: 2380000, counted: 0, diff: -2380000, status: 'ປິດແລ້ວ' },
    { code: 'CRS-20260725-000014', user: 'vy', openTime: '07/25/2026, 11:53 AM', closeTime: '07/26/2026, 12:08 AM', openCash: 500000, cashSales: 9525000, transferSales: 4005000, expected: 14030000, counted: 14030000, diff: 0, status: 'ປິດແລ້ວ' },
    { code: 'CRS-20260724-000013', user: 'ZapVer', openTime: '07/24/2026, 10:15 AM', closeTime: '07/24/2026, 11:45 PM', openCash: 500000, cashSales: 4250000, transferSales: 1200000, expected: 5950000, counted: 5950000, diff: 0, status: 'ປິດແລ້ວ' },
    { code: 'CRS-20260724-000012', user: 'vy', openTime: '07/24/2026, 08:30 AM', closeTime: '07/24/2026, 06:00 PM', openCash: 300000, cashSales: 3100000, transferSales: 900000, expected: 4300000, counted: 4300000, diff: 0, status: 'ປິດແລ້ວ' },
    { code: 'CRS-20260723-000011', user: 'ZapVer', openTime: '07/23/2026, 01:00 PM', closeTime: '07/23/2026, 11:30 PM', openCash: 500000, cashSales: 6800000, transferSales: 2100000, expected: 9400000, counted: 9400000, diff: 0, status: 'ປິດແລ້ວ' },
    { code: 'CRS-20260723-000010', user: 'vy', openTime: '07/23/2026, 09:00 AM', closeTime: '07/23/2026, 05:00 PM', openCash: 500000, cashSales: 2400000, transferSales: 800000, expected: 3700000, counted: 3650000, diff: -50000, status: 'ປິດແລ້ວ' }
];

function openShiftModal(index) {
    var sh = shiftData[index];

    $('#m_sh_code').text(sh.code);
    $('#m_sh_user').text(sh.user);
    $('#m_sh_open').text(sh.openTime);
    $('#m_sh_close').text(sh.closeTime ? sh.closeTime : '—');

    var isOpened = sh.status === 'ເປີດ';
    var statusHtml = isOpened
        ? '<span class="badge" style="background:rgba(5,205,153,0.1); color:var(--success); border:1px solid rgba(5,205,153,0.3);">ເປີດກະຢູ່</span>'
        : '<span class="badge" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;">ປິດກະແລ້ວ</span>';
    $('#m_sh_status').html(statusHtml);

    $('#m_sh_open_cash').text(formatCurrency(sh.openCash) + ' ₭');
    $('#m_sh_cash_sales').text(formatCurrency(sh.cashSales) + ' ₭');
    $('#m_sh_transfer_sales').text(formatCurrency(sh.transferSales) + ' ₭');
    $('#m_sh_expected').text(formatCurrency(sh.expected) + ' ₭');

    if (isOpened) {
        $('#m_sh_counted').text('—');
        $('#m_sh_diff').text('—').css('color', 'var(--text-main)');
    } else {
        $('#m_sh_counted').text(formatCurrency(sh.counted) + ' ₭');
        if (sh.diff < 0) {
            $('#m_sh_diff').text(formatCurrency(sh.diff) + ' ₭').css('color', 'red');
        } else if (sh.diff > 0) {
            $('#m_sh_diff').text('+' + formatCurrency(sh.diff) + ' ₭').css('color', 'var(--success)');
        } else {
            $('#m_sh_diff').text('0 ₭').css('color', 'var(--text-main)');
        }
    }

    $('#psh_code, #psh_a4_code').text(sh.code);
    $('#psh_user, #psh_a4_user').text(sh.user);
    $('#psh_open, #psh_a4_open').text(sh.openTime);
    $('#psh_close, #psh_a4_close').text(sh.closeTime ? sh.closeTime : '—');
    $('#psh_status, #psh_a4_status').text(sh.status);
    $('#psh_open_cash, #psh_a4_open_cash, #psh_a4_tb_open').text(formatCurrency(sh.openCash) + ' ₭');
    $('#psh_cash_sales, #psh_a4_cash_sales, #psh_a4_tb_cash').text(formatCurrency(sh.cashSales) + ' ₭');
    $('#psh_transfer_sales, #psh_a4_transfer_sales, #psh_a4_tb_transfer').text(formatCurrency(sh.transferSales) + ' ₭');
    $('#psh_expected, #psh_a4_expected, #psh_a4_tb_exp').text(formatCurrency(sh.expected) + ' ₭');
    $('#psh_counted, #psh_a4_tb_count').text(sh.counted !== null ? formatCurrency(sh.counted) + ' ₭' : '—');
    $('#psh_diff, #psh_a4_tb_diff').text(sh.diff !== null ? formatCurrency(sh.diff) + ' ₭' : '—');

    $('#btn-reprint-shift').off('click').on('click', function () { printReceipt('print-single-shift'); });
    $('#btn-reprint-shift-a4').off('click').on('click', function () { printReceipt('print-single-shift-a4', true); });

    $('#shiftModal').addClass('active');
}

function closeShiftModal() {
    $('#shiftModal').removeClass('active');
}

function initShiftPage() {
    $('#shiftModal').on('click', function (e) {
        if (e.target === this) closeShiftModal();
    });

    function renderShift() {
        var searchFilter = $('#rsh_search').val().toLowerCase();
        var statusFilter = $('#rsh_status').val();

        var html = '';
        var printHtml = '';
        var printA4Html = '';
        var grandTotalSales = 0;
        var countShifts = 0;
        var idx = 1;

        shiftData.forEach(function (row, index) {
            if (statusFilter && row.status !== statusFilter) return;
            if (searchFilter && row.code.toLowerCase().indexOf(searchFilter) === -1 && row.user.toLowerCase().indexOf(searchFilter) === -1) return;

            var totalSales = row.cashSales + row.transferSales;
            grandTotalSales += totalSales;
            countShifts++;

            var isOpened = row.status === 'ເປີດ';
            var statusBadge = isOpened
                ? '<span class="badge" style="background:rgba(5,205,153,0.15); color:var(--success); border:1px solid rgba(5,205,153,0.3); border-radius:20px; padding:4px 14px;">ເປີດ</span>'
                : '<span class="badge" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; border-radius:20px; padding:4px 14px;">ປິດແລ້ວ</span>';

            var diffTxt = isOpened ? '—'
                : (row.diff < 0
                    ? '<span style="color:red; font-weight:bold;">' + formatCurrency(row.diff) + ' ₭</span>'
                    : '<span style="color:var(--text-main); font-weight:bold;">' + formatCurrency(row.diff) + ' ₭</span>');

            var methodTxt = row.cashSales > 0
                ? '<span style="color:var(--text-muted);">ເງິນສົດ</span> <strong style="color:var(--text-main); margin-left:15px;">' + formatCurrency(row.cashSales) + ' ₭</strong>'
                : '—';

            var timeTxt = isOpened
                ? row.openTime
                : row.openTime + '<br><small style="color:var(--text-muted); font-size:11px;">ປິດເມື່ອ ' + row.closeTime + '</small>';

            var closeTxt = row.closeTime ? ' - ' + row.closeTime : '';

            html += '<tr>' +
                '<td class="text-center" style="color:var(--text-muted);">' + idx + '</td>' +
                '<td style="font-weight:700; color:var(--text-main);">' + row.code + '</td>' +
                '<td>' + row.user + '</td>' +
                '<td style="font-size:12.5px;">' + timeTxt + '</td>' +
                '<td class="text-right">' + formatCurrency(row.openCash) + ' ₭</td>' +
                '<td class="text-right">' + formatCurrency(row.cashSales) + ' ₭</td>' +
                '<td>' + methodTxt + '</td>' +
                '<td class="text-right font-weight-bold">' + formatCurrency(row.expected) + ' ₭</td>' +
                '<td class="text-right">' + (row.counted !== null ? formatCurrency(row.counted) + ' ₭' : '—') + '</td>' +
                '<td class="text-right">' + diffTxt + '</td>' +
                '<td class="text-center">' + statusBadge + '</td>' +
                '<td class="text-center"><button class="btn-action" onclick="openShiftModal(' + index + ')"><i class="bi bi-eye"></i> ເບິ່ງ</button></td>' +
                '</tr>';

            printHtml += '<tr><td>' + idx + '. ' + row.code + ' (' + row.user + ')' +
                '<span class="r-item-sub">' + row.openTime + ' | ' + row.status + '</span></td>' +
                '<td class="right">' + formatCurrency(totalSales) + ' ₭</td></tr>';

            printA4Html += '<tr>' +
                '<td class="text-center">' + idx + '</td>' +
                '<td style="font-weight:bold;">' + row.code + '</td>' +
                '<td>' + row.user + '</td>' +
                '<td style="font-size:11px;">' + row.openTime + closeTxt + '</td>' +
                '<td class="text-right">' + formatCurrency(row.openCash) + ' ₭</td>' +
                '<td class="text-right">' + formatCurrency(row.cashSales) + ' ₭</td>' +
                '<td class="text-right">' + formatCurrency(row.transferSales) + ' ₭</td>' +
                '<td class="text-right" style="font-weight:bold;">' + formatCurrency(row.expected) + ' ₭</td>' +
                '<td class="text-center">' + row.status + '</td>' +
                '</tr>';
            idx++;
        });

        if (html === '') {
            html = '<tr><td colspan="12" class="text-center" style="padding:30px; color:var(--text-muted);">ບໍ່ພົບຂໍ້ມູນລາຍງານຕາມກະ</td></tr>';
            printHtml += '<tr><td colspan="2" style="text-align:center">ບໍ່ພົບຂໍ້ມູນ</td></tr>';
            printA4Html += '<tr><td colspan="9" class="text-center">ບໍ່ພົບຂໍ້ມູນ</td></tr>';
        } else {
            printA4Html += '<tr class="total-row">' +
                '<td colspan="7" class="text-right" style="font-weight:bold;">ລວມຍອດຂາຍທຸກກະ:</td>' +
                '<td class="text-right" style="font-weight:bold;">' + formatCurrency(grandTotalSales) + ' ₭</td>' +
                '<td class="text-center">(' + countShifts + ' ກະ)</td>' +
                '</tr>';
        }

        $('#tbody-shift').html(html);
        $('#ptable-shift').html(printHtml);
        $('#ptable-shift-a4').html(printA4Html);
        $('#ptotal-shift, #p-a4-total-shift').text(formatCurrency(grandTotalSales) + ' ₭');
        $('#p-a4-total-count-shift').text(countShifts + ' ກະ');

        var sd = $('#rsh_start').val();
        var ed = $('#rsh_end').val();
        $('#p-date-shift, #p-a4-date-shift').text(sd + ' - ' + ed);
    }

    renderShift();
    $('#btn-search-shift').on('click', renderShift);
    $('#rsh_status, #rsh_search').on('change keyup', function (e) {
        if (e.type === 'keyup' && e.key !== 'Enter') return;
        renderShift();
    });
}
