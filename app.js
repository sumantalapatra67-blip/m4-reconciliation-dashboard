// Supabase Configuration
const SUPABASE_URL = 'https://slvtnphpqvoohdhxesbt.supabase.co';
// TODO: Replace 'YOUR_SUPABASE_ANON_KEY' with your actual anon key from Supabase Dashboard -> Settings -> API
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchDashboardData() {
    try {
        // Fetch Recent Reconciliation Logs from v_reconciliation_dashboard
        const { data: logs, error: logsError } = await supabase
            .from('v_reconciliation_dashboard')
            .select('*')
            .limit(10);

        if (logsError) throw logsError;

        // Render Table Rows
        const tbody = document.getElementById('dashboard-table-body');
        tbody.innerHTML = '';

        if (!logs || logs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-400">No records found.</td></tr>`;
        } else {
            logs.forEach(row => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-gray-50 border-b border-gray-100';
                tr.innerHTML = `
                    <td class="p-4 font-mono text-xs text-gray-600">${row.request_id || 'N/A'}</td>
                    <td class="p-4 font-medium text-gray-800">${row.invoice_number || 'N/A'}</td>
                    <td class="p-4"><span class="px-2 py-1 text-xs rounded bg-gray-100 font-medium">${row.document_status || 'UNKNOWN'}</span></td>
                    <td class="p-4"><span class="px-2 py-1 text-xs rounded font-semibold ${getStatusBadge(row.reconciliation_status)}">${row.reconciliation_status || 'N/A'}</span></td>
                    <td class="p-4 text-xs text-gray-500">${row.created_at ? new Date(row.created_at).toLocaleString() : 'N/A'}</td>
                `;
                tbody.appendChild(tr);
            });
        }

        // Calculate Metrics
        let total = logs ? logs.length : 0;
        let reconciled = logs ? logs.filter(l => l.reconciliation_status === 'RECONCILED').length : 0;
        let processing = logs ? logs.filter(l => l.reconciliation_status === 'PROCESSING').length : 0;
        let stale = logs ? logs.filter(l => l.reconciliation_status === 'STALE_UNMATCHED').length : 0;
        let failed = logs ? logs.filter(l => l.reconciliation_status === 'FAILED').length : 0;

        document.getElementById('total-count').innerText = total;
        document.getElementById('reconciled-count').innerText = reconciled;
        document.getElementById('processing-count').innerText = processing;
        document.getElementById('stale-count').innerText = stale;
        document.getElementById('failed-count').innerText = failed;

    } catch (err) {
        console.error('Error fetching dashboard metrics:', err.message);
    }
}

function getStatusBadge(status) {
    switch (status) {
        case 'RECONCILED': return 'bg-green-100 text-green-800';
        case 'PROCESSING': return 'bg-yellow-100 text-yellow-800';
        case 'STALE_UNMATCHED': return 'bg-orange-100 text-orange-800';
        case 'FAILED': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

// Event Listeners
document.getElementById('refresh-btn').addEventListener('click', fetchDashboardData);
window.addEventListener('DOMContentLoaded', fetchDashboardData);
