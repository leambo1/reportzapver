$(document).ready(function() {
    // Tab switching logic
    $('.tab-btn').on('click', function() {
        $('.tab-btn').removeClass('active');
        $(this).addClass('active');
        
        const page = $(this).data('page');
        loadPage(page);
    });

    // Load initial page
    loadPage('report_sales.html');
});

function loadPage(page) {
    $('#content-area').html('<div style="text-align:center; padding:50px; color:#888;"><div class="spinner"></div> ກຳລັງໂຫຼດໜ້າ ' + page + '...</div>');
    
    // Use setTimeout to simulate network delay for realism
    setTimeout(() => {
        const cacheBuster = '?v=' + new Date().getTime();
        $('#content-area').load(page + cacheBuster, function(response, status, xhr) {
            if (status == "error") {
                $('#content-area').html('<div style="color:red; background:#fee2e2; padding:20px; border-radius:10px; border:1px solid #fca5a5;"><b>ບໍ່ສາມາດໂຫຼດໜ້າ '+page+' ໄດ້</b><br>ກະລຸນາເປີດຜ່ານ Localhost (ເຊັ່ນ XAMPP ຫຼື Live Server) ເພາະບຼາວເຊີບລັອກການໂຫຼດໄຟລ໌ຂ້າມ (CORS).</div>');
            }
        });
    }, 200);
}

// Global print function (called by each page)
function printReceipt(containerId, isA4 = false) {
    $('.print-area, .print-area-a4').removeClass('active-print active-print-a4');
    
    // Set current formatted date/time for print timestamp
    const now = new Date();
    const nowStr = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-GB');
    $('.p-print-now').text(nowStr);

    if (isA4) {
        $('#' + containerId).addClass('active-print-a4');
    } else {
        $('#' + containerId).addClass('active-print');
    }
    window.print();
}

// Helper to format currency
function formatCurrency(num) {
    return Number(num).toLocaleString('en-US');
}
